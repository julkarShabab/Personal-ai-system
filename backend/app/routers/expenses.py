from datetime import datetime
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
            date = data.date or datetime.utcnow()

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
    
@router.get("/",response_model=List[ExpenseResponse])
def get_expenses(
    db:Session = Depends(get_db),
    current_user:User = Depends(get_current_user)
):
    try:
        expenses = db.query(Expense).filter(
            Expense.user_id == current_user.id
        ).order_by(Expense.date.desc()).all()
        return expenses
    except Exception as e:
        logger.error(f"error fetching expenses: {e}")
        raise HTTPException(status_code=500,detail="failed to fetch expenses")
    
@router.put("/{expense_id}",response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    data:ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user:User = Depends(get_current_user)
):
    try:
        expense = db.query(Expense).filter(
            Expense.id == expense_id,
            Expense.user_id == current_user.id
        ).first()
        if not expense:
            raise HTTPException(status_code=404,detail="Expense not found")
        for key,value in data.model_dump(exclude_unset=True).items():
            setattr(expense,key,value)
        db.commit()
        db.refresh(expense)
        return expense
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating expenses: {e}")
        raise HTTPException(status_code=500,detail="failed to update expenses")
    
@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user:User = Depends(get_current_user)
):
    try:
        expense = db.query(Expense).filter(
            Expense.id == expense_id,
            Expense.user_id == current_user.id
        ).first()
        if not expense:
            raise HTTPException(status_code=404,detail="Expense not found")
        db.delete(expense)
        db.commit()
        return{"message": "Expense deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting expense: {e}")
        raise HTTPException(status_code=500,detail="failed ot delete expenses")
    