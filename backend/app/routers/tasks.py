from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Task, User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.utils.dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/", response_model=TaskResponse)
def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        task = Task(
            user_id=current_user.id,
            title=data.title,
            description=data.description,
            deadline=data.deadline,
            status=data.status,
            priority=data.priority
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        return task
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating task: {e}")
        raise HTTPException(status_code=500, detail="Failed to create task")

@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
        return tasks
    except Exception as e:
        logger.error(f"Error fetching tasks: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch tasks")

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        task = db.query(Task).filter(
            Task.id == task_id,
            Task.user_id == current_user.id
        ).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(task, key, value)
        db.commit()
        db.refresh(task)
        return task
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating task: {e}")
        raise HTTPException(status_code=500, detail="Failed to update task")

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        task = db.query(Task).filter(
            Task.id == task_id,
            Task.user_id == current_user.id
        ).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        db.delete(task)
        db.commit()
        return {"message": "Task deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting task: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete task")