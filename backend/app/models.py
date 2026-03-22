from sqlalchemy import Column, ForeignKey,Integer,String,DateTime, Text
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer,primary_key=True,index=True)
    email = Column(String,unique=True,index=True,nullable=False)
    password = Column(String,nullable=False)
    created_at = Column(DateTime(timezone=True),server_default=func.now())


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer,primary_key=True,index=True)
    user_id = Column(Integer,ForeignKey("users.id"),nullable=False)
    title = Column(String,nullable=False)
    description = Column(Text,nullable=False)
    deadline = Column(DateTime(timezone=True),nullable=True)
    status = Column(String,default="pending")
    priority = Column(String,default="medium")
    created_at = Column(DateTime(timezone=True),server_default=func.now())