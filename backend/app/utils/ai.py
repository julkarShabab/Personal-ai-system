from groq import Groq
from dotenv import load_dotenv
import os
import logging
import json

load_dotenv()

logger = logging.getLogger(__name__)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Add a new task for the user",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Task title"},
                    "description": {"type": "string", "description": "Task description"},
                    "priority": {"type": "string", "enum": ["low", "medium", "high"], "description": "Task priority"},
                    "deadline": {"type": "string", "description": "Deadline in ISO format e.g. 2024-12-31T15:00:00"}
                },
                "required": ["title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Delete a task by its title",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Title of the task to delete"}
                },
                "required": ["title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "complete_task",
            "description": "Mark a task as completed by its title",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Title of the task to complete"}
                },
                "required": ["title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "add_expense",
            "description": "Add a new expense for the user",
            "parameters": {
                "type": "object",
                "properties": {
                    "amount": {"type": "number", "description": "Expense amount in BDT"},
                    "category": {
                        "type": "string",
                        "enum": ["Food", "Transport", "Shopping", "Health", "Education", "Entertainment", "Bills", "Other"],
                        "description": "Expense category"
                    },
                    "description": {"type": "string", "description": "Expense description"}
                },
                "required": ["amount", "category"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_expense_summary",
            "description": "Get a summary of expenses by category or time period",
            "parameters": {
                "type": "object",
                "properties": {
                    "period": {"type": "string", "enum": ["all", "week", "month"], "description": "Time period"}
                },
                "required": ["period"]
            }
        }
    },
    {
        "type":"function",
        "function":{
            "name":"edit_expense",
            "description":"Edit an existing expense amount or category by description or category",
            "parameters":{
                "type":"object",
                "properties":{
                    "category": {"type": "string", "description": "Category of the expense to edit"},
                    "new_amount": {"type": "number", "description": "New amount in BDT"},
                    "new_category": {"type": "string", "enum": ["Food", "Transport", "Shopping", "Health", "Education", "Entertainment", "Bills", "Other"], "description": "New category"},
                    "new_description": {"type": "string", "description": "New description"}
                },
                "required":["category"]
            }
        }
    }
]


def get_ai_response(user_message: str, context: str, db=None, user_id: int = None):
    try:
        if not os.getenv("GROQ_API_KEY"):
            raise ValueError("GROQ_API_KEY is not set in .env file")

        system_prompt = f"""
You are LifeOS Assistant, a helpful personal AI that manages tasks and expenses.

User's current data:
{context}

You can perform these actions by calling functions:
- add_task: Create a new task
- delete_task: Delete a task by title
- complete_task: Mark a task as completed
- add_expense: Log a new expense
- get_expense_summary: Get expense summary

Rules:
- If the user wants to add/delete/complete a task or add an expense, call the appropriate function
- Always confirm what action you took after calling a function
- Be concise and friendly
- Format currency as BDT
- If data is empty tell the user politely
- Never make up data not in the context
"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            tools=TOOLS,
            tool_choice="auto",
            max_tokens=1024,
            temperature=0.7
        )

        message = response.choices[0].message

        # If AI wants to call a tool
        if message.tool_calls and db and user_id:
            tool_results = []

            for tool_call in message.tool_calls:
                tool_name = tool_call.function.name
                try:
                    tool_args = json.loads(tool_call.function.arguments)
                except json.JSONDecodeError:
                    tool_args = {}

                logger.info(f"AI calling tool: {tool_name} with args: {tool_args}")
                result = execute_tool(tool_name, tool_args, db, user_id)
                tool_results.append({
                    "tool_call_id": tool_call.id,
                    "name": tool_name,
                    "result": result
                })

            # Send tool results back to AI for final response
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
                {"role": "assistant", "content": message.content or "", "tool_calls": message.tool_calls},
            ]

            for tr in tool_results:
                messages.append({
                    "role": "tool",
                    "tool_call_id": tr["tool_call_id"],
                    "name": tr["name"],
                    "content": str(tr["result"])
                })

            final_response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                max_tokens=512,
                temperature=0.7
            )

            return final_response.choices[0].message.content

        return message.content

    except ValueError as e:
        logger.error(f"AI config error: {e}")
        raise
    except Exception as e:
        logger.error(f"AI response error: {e}")
        raise


def execute_tool(tool_name: str, args: dict, db, user_id: int) -> str:
    try:
        from app.models import Task, Expense
        from datetime import datetime

        if tool_name == "add_task":
            deadline = None
            if args.get("deadline"):
                try:
                    deadline = datetime.fromisoformat(args["deadline"])
                except ValueError:
                    deadline = None

            task = Task(
                user_id=user_id,
                title=args["title"],
                description=args.get("description"),
                priority=args.get("priority", "medium"),
                deadline=deadline,
                status="pending"
            )
            db.add(task)
            db.commit()
            return f"Task '{args['title']}' created successfully"

        elif tool_name == "delete_task":
            task = db.query(Task).filter(
                Task.user_id == user_id,
                Task.title.ilike(f"%{args['title']}%")
            ).first()
            if not task:
                return f"Task '{args['title']}' not found"
            db.delete(task)
            db.commit()
            return f"Task '{task.title}' deleted successfully"

        elif tool_name == "complete_task":
            task = db.query(Task).filter(
                Task.user_id == user_id,
                Task.title.ilike(f"%{args['title']}%")
            ).first()
            if not task:
                return f"Task '{args['title']}' not found"
            task.status = "completed"
            db.commit()
            return f"Task '{task.title}' marked as completed"

        elif tool_name == "add_expense":
            expense = Expense(
                user_id=user_id,
                amount=args["amount"],
                category=args["category"],
                description=args.get("description"),
                date=datetime.utcnow()
            )
            db.add(expense)
            db.commit()
            return f"Expense of {args['amount']} BDT for {args['category']} added successfully"

        elif tool_name == "get_expense_summary":
            from datetime import timedelta
            now = datetime.utcnow()
            period = args.get("period", "all")

            query = db.query(Expense).filter(Expense.user_id == user_id)

            if period == "week":
                query = query.filter(Expense.date >= now - timedelta(days=7))
            elif period == "month":
                query = query.filter(Expense.date >= now.replace(day=1))

            expenses = query.all()
            total = sum(e.amount for e in expenses)
            by_category = {}
            for e in expenses:
                by_category[e.category] = by_category.get(e.category, 0) + e.amount

            return f"Total: {total:.2f} BDT | By category: {by_category}"
        
        elif tool_name =="edit_expense":
            expense = db.query(Expense).filter(
                Expense.user_id == user_id,
                Expense.category.ilike(f"%{args['category']}%")
            ).order_by(Expense.date.desc()).first()

            if not expense:
                return f"No expenses found with category '{args['category']}'"
            
            if args.get("new_amount"):
                expense.amount = args["new_amount"]
            if args.get("new_category"):
                expense.category = args["new_category"]
            if args.get("new_description"):
                expense.description = args["new_description"]
            
            db.commit()
            return f"Expense updated successfully- new amount: {expense.amount} BDT,category: {expense.category}"

        return "Unknown tool"

    except Exception as e:
        logger.error(f"Tool execution error: {e}")
        db.rollback()
        return f"Error executing {tool_name}: {str(e)}"


def build_context(tasks: list, expenses: list) -> str:
    try:
        context = ""

        if tasks:
            context += "=== TASKS ===\n"
            for t in tasks:
                deadline = t.deadline.strftime("%Y-%m-%d %H:%M") if t.deadline else "No deadline"
                context += f"- {t.title} | Status: {t.status} | Priority: {t.priority} | Deadline: {deadline}\n"
        else:
            context += "=== TASKS ===\nNo tasks found.\n"

        context += "\n"

        if expenses:
            context += "=== EXPENSES ===\n"
            total = sum(e.amount for e in expenses)
            context += f"Total spent: {total:.2f} BDT\n"
            for e in expenses[-20:]:
                date = e.date.strftime("%Y-%m-%d") if e.date else "No date"
                context += f"- {e.category} | {e.amount} BDT | {date} | {e.description or 'No description'}\n"
        else:
            context += "=== EXPENSES ===\nNo expenses found.\n"

        return context

    except Exception as e:
        logger.error(f"Context building error: {e}")
        return "Error building context"