from fastapi import Depends,HTTPException,Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.utils.auth import decode_access_token

def get_current_user(
        authorization: str = Header(...),
        db: Session = Depends(get_db)
):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401,detail="invalid token format")
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(status_code=401,detail="invalid or expired token")
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()

    if not user:
        raise HTTPException(status_code=401,detail="user not found")
    
    return user