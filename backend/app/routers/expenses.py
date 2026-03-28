from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Expense, User
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.utils.dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/expenses",tags=["expenses"])

@router.post("/",response_model=ExpenseResponse)
def create_expense(
    data:ExpenseCreate,
    db:Session = Depends(get_db),
    current_user:User = Depends(get_current_user)
):
    try:
        expense = Expense(
            user_id = current_user.id,
            amount = data.amount,
            category = data.category,
            description = data.description,
            date = data.date

        )
        db.add(expense)
        db.commit()
        db.refresh(expense)
        return expense
    except Exception as e:
        db.rollback()
        logger.error(f"error creating expenses: {e}")
        raise HTTPException(status_code=500,detail="failed to create expense")
    

@router.get("/summary")
def get_summary(
    db:Session = Depends(get_db),
    current_user:User = Depends(get_current_user)
):
    try:
        expenses = db.query(Expense).filter(
            Expense.user_id == current_user.id
        ).all()
        total = sum(e.amount for e in expenses)
        by_category= {}
        for e in expenses:
            by_category[e.category] = by_category.get(e.category,0)+e.amount
        return {
            "total":total,
            "by_category":by_category,
            "count":len(expenses)
        }
    except Exception as e:
        logger.error(f"errror fetching summary: {e}")
        raise HTTPException(status_code=500,detail="fail to fetch summary")
    