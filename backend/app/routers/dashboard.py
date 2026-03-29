from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models import Task, Expense, User
from app.utils.dependencies import get_current_user
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/dashboard",tags=["dashboard"])

@router.get("/summary")
def get_dashboard_summary(
    db:Session= Depends(get_db),
    current_user:User = Depends(get_current_user)
):
    try:
        now = datetime.utcnow()
        today_start = now.replace(hour=0,minute=0,second=0,microsecond=0)
        week_start = now - timedelta(days=7)
        month_start = now.replace(day=1,hour=0,minute=0,second=0,microsecond=0)

        all_tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
        tasks_today = [t for t in all_tasks if t.deadline and t.deadline.replace(tzinfo=None) >= today_start and t.deadline.replace(tzinfo=None) < today_start + timedelta(days=1)]
        tasks_completed = [t for t in all_tasks if t.status == "completed"]
        tasks_pending = [t for t in all_tasks if t.status == "pending"]

        all_expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
        expenses_this_month = [e for e in all_expenses 
                               if e.date and e.date.replace(tzinfo = None) >= month_start]
        expenses_this_week = [e for e in all_expenses
                              if e.date and  e.date.replace(tzinfo= None) >= week_start]
        

        monthly_total = sum(e.amount for e in expenses_this_month)
        weekly_total = sum(e.amount for e in expenses_this_week)


        by_category = defaultdict(int)
        for e in all_expenses:
            by_category[e.category]+=e.amount

        daily_expenses = {}
        for i in range(7):
            day = (now - timedelta(days=i)).strftime("%a")
            daily_expenses[day] =0
        for e in expenses_this_week:
            if e.date:
                day = e.date.strftime("%a")
                if day in daily_expenses:
                    daily_expenses[day] += e.amount
        
        return{
           "tasks": {
                "total": len(all_tasks),
                "completed": len(tasks_completed),
                "pending": len(tasks_pending),
                "due_today": len(tasks_today)
            },
            "expenses": {
                "monthly_total": monthly_total,
                "weekly_total": weekly_total,
                "by_category": by_category,
                "daily_this_week": daily_expenses
            }
        }
    except Exception as e:
        logger.error(f"Dashboard summary error: {e}")
        raise HTTPException(status_code=500,detail="failed to load dashboard")




