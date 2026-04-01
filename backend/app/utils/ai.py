from groq import Groq
from dotenv import load_dotenv
import os
import logging

load_dotenv()

logger = logging.getLogger(__name__)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_ai_response(user_message:str,context:str) -> str:
    try:
        if not os.getenv("GROQ_API_KEY"):
            raise ValueError("API key is not in the .env file")
        
        system_prompt = f"""
You are a helpful personal AI assistant called LifeOS Assistant.
You help users manage their tasks, expenses, and productivity.

Here is the user's current data:
{context}

Instructions:
- Answer questions based on the user's actual data above
- Be concise and friendly
- Format numbers clearly (e.g. 1,234 BDT)
- If data is empty, let the user know politely
- Do not make up data that is not provided
- If asked to add/delete/update something, tell the user that action feature is coming soon
"""
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role":"system","content":system_prompt},
                {"role":"user","content":user_message}
            ],
            max_tokens=1024,
            temperature=0.7
        )
        return response.choices[0].message.content
    except ValueError as e:
        logger.error(f"AI config error: {e}")
        raise
    except Exception as e:
        logger.error(f"AI response error: {e}")
        raise


def build_context(tasks: list,expenses: list)-> str:
    try:
        context = ""

        if tasks:
            context += "===TASKS===\n"
            for t in tasks:
                deadline = t.deadline.strftime("%Y-%m-%d %H:%M") if t.deadline else "No deadline"
                context += f"-{t.title} | Status: {t.status} | Priority: {t.priority} | Deadline: {deadline}\n"

        else:
            context += "=== TASKS ===\n No tasks found.\n"

        context += "\n"

        if expenses:
            context += "===EXPENSES===\n"
            total = sum(e.amount for e in expenses)
            context += f"total spent: {total:.2f} BDT\n"
            for e in expenses[-20]:
                date = e.date.strftime("%Y-%m-%d %H:%M") if e.date else "NO date"
                context += f"- {e.category} | {e.amount} BDT | {date} | {e.description or 'No description'}\n"

        else:
            context += "===EXPENSES===\n No expenses found.\n"

        return context
    
    except Exception as e:
        logger.error(f"Context building error: {e}")
        return "error building context"
    