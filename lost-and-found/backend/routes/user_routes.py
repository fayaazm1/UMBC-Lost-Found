from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.user import User
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/users",
    tags=["users"]
)

class UserCreate(BaseModel):
    email: str
    username: str
    firebase_uid: str

@router.get("/email/{email}")
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "firebase_uid": user.firebase_uid
    }

@router.post("/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user.email) | (User.firebase_uid == user.firebase_uid)
    ).first()
    
    if existing_user:
        if existing_user.email == user.email:
            raise HTTPException(status_code=400, detail="Email already registered")
        else:
            raise HTTPException(status_code=400, detail="User already exists")

    # Create new user
    db_user = User(
        email=user.email,
        username=user.username,
        firebase_uid=user.firebase_uid
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return {
            "id": db_user.id,
            "email": db_user.email,
            "username": db_user.username,
            "firebase_uid": db_user.firebase_uid
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
