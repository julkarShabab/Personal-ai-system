from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Task, Expense, User, ChatHistory
from app.schemas.ai import ChatRequest, ChatResponse
from app.schemas.chat_history import ChatHistoryResponse
from app.utils.dependencies import get_current_user
from app.utils.ai import get_ai_response, build_context
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/chat", response_model=ChatResponse)
def chat(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        if not data.message or not data.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        if len(data.message) > 1000:
            raise HTTPException(status_code=400, detail="Message too long — max 1000 characters")

        # Fetch user data
        try:
            tasks = db.query(Task).filter(
                Task.user_id == current_user.id
            ).order_by(Task.created_at.desc()).all()

            expenses = db.query(Expense).filter(
                Expense.user_id == current_user.id
            ).order_by(Expense.date.desc()).all()
        except Exception as e:
            logger.error(f"Database fetch error: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch user data")

        # Build context
        try:
            context = build_context(tasks, expenses)
        except Exception as e:
            logger.error(f"Context error: {e}")
            context = "No data available"

        # Save user message to history
        try:
            user_msg = ChatHistory(
                user_id=current_user.id,
                role="user",
                content=data.message
            )
            db.add(user_msg)
            db.commit()
        except Exception as e:
            logger.error(f"Failed to save user message: {e}")

        # Get AI response
        try:
            response = get_ai_response(
                data.message,
                context,
                db=db,
                user_id=current_user.id
            )

            # Save assistant response to history
            try:
                assistant_msg = ChatHistory(
                    user_id=current_user.id,
                    role="assistant",
                    content=response
                )
                db.add(assistant_msg)
                db.commit()
            except Exception as e:
                logger.error(f"Failed to save assistant message: {e}")

            return ChatResponse(response=response, success=True)

        except ValueError as e:
            raise HTTPException(status_code=500, detail=str(e))
        except Exception as e:
            logger.error(f"AI error: {e}")
            raise HTTPException(status_code=500, detail="AI service unavailable — try again later")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected chat error: {e}")
        raise HTTPException(status_code=500, detail="Something went wrong")


@router.get("/history", response_model=List[ChatHistoryResponse])
def get_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        history = db.query(ChatHistory).filter(
            ChatHistory.user_id == current_user.id
        ).order_by(ChatHistory.created_at.asc()).all()
        return history
    except Exception as e:
        logger.error(f"Failed to fetch chat history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch chat history")


@router.delete("/history")
def clear_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        db.query(ChatHistory).filter(
            ChatHistory.user_id == current_user.id
        ).delete()
        db.commit()
        return {"message": "Chat history cleared"}
    except Exception as e:
        logger.error(f"Failed to clear chat history: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to clear chat history")