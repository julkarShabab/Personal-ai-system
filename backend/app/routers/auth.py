from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.utils.auth import hash_password, verify_password, create_access_token
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    try:
        existing_user = db.query(User).filter(User.email == data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        if len(data.full_name.strip()) < 2:
            raise HTTPException(status_code=400, detail="Full name is too short")

        hashed = hash_password(data.password)
        user = User(
            full_name=data.full_name.strip(),
            email=data.email,
            password=hashed
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token({"sub": str(user.id)})
        return {"access_token": token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Register error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Registration failed")

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == data.email).first()
        if not user or not verify_password(data.password, user.password):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_access_token({"sub": str(user.id)})
        return {"access_token": token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")