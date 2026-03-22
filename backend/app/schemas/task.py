from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] =None
    deadline: Optional[datetime] = None
    status:Optional[str] = "pending"
    priority: Optional[str] = "medium"

class TaskUpdate(BaseModel):
    title: str
    description: Optional[str] =None
    deadline: Optional[datetime] = None
    status:Optional[str] = None
    priority: Optional[str] = None

class TaskResponse(BaseModel):
    id : int
    user_id: int
    title:str
    description: Optional[str]
    deadline:Optional[str]
    status:str
    priority:str
    created_at: datetime

    class Config:
        from_attributes = True
