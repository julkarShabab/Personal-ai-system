from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ExpenseCreate(BaseModel):
    amount: float
    category:str
    description: Optional[str] =None
    date: Optional[datetime] =None


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None

class ExpenseResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    category: str
    description: Optional[str] = None
    date: datetime
    created_at:datetime

    model_config = {"from_attributes":True}