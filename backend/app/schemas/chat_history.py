from pydantic import BaseModel
from datetime import datetime

class ChatHistoryResponse(BaseModel):
    id:int
    role:str
    content:str
    created_at:datetime

    model_config = {"from_attributes": True}