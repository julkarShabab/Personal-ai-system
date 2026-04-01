from pydantic import BaseModel
from typing import Optional,List

class chatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history:Optional[List[chatMessage]] = []

class ChatResponse(BaseModel):
    response: str
    success: bool
    error: Optional[str] =None
