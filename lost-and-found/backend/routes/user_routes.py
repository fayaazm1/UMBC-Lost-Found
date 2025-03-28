from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/users",
    tags=["users"]
)

class UserCreate(BaseModel):
    email: str
    username: str
    firebase_uid: str

@router.get("/email/{email}")
async def get_user_by_email(email: str, db: Session = Depends(get_db)):
    logger.info(f"Attempting to fetch user with email: {email}")
    try:
        user = db.query(User).filter(User.email == email).first()
        logger.info(f"Query result: {user}")
        if not user:
            logger.warning(f"User not found for email: {email}")
            raise HTTPException(status_code=404, detail="User not found")
        return {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "firebase_uid": user.firebase_uid
        }
    except Exception as e:
        logger.error(f"Error fetching user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/")
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    logger.info(f"Attempting to create user with email: {user.email}")
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.email == user.email) | (User.firebase_uid == user.firebase_uid)
        ).first()
        
        if existing_user:
            if existing_user.email == user.email:
                logger.warning(f"Email already registered: {user.email}")
                raise HTTPException(status_code=400, detail="Email already registered")
            else:
                logger.warning(f"User already exists with firebase_uid: {user.firebase_uid}")
                raise HTTPException(status_code=400, detail="User already exists")

        # Create new user
        db_user = User(
            email=user.email,
            username=user.username,
            firebase_uid=user.firebase_uid
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info(f"Successfully created user with email: {user.email}")
        return {
            "id": db_user.id,
            "email": db_user.email,
            "username": db_user.username,
            "firebase_uid": db_user.firebase_uid
        }
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
