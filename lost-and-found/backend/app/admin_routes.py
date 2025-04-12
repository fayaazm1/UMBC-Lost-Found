from fastapi import APIRouter, Depends, HTTPException, status, Form, Response, Body
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.post import Post
from models.comment import Comment
from typing import List, Optional, Dict
import logging
from datetime import datetime, timedelta
import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")
security = HTTPBearer()

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"

# Request models
class AdminLoginRequest(BaseModel):
    username: str
    password: str

def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        is_admin = payload.get("is_admin", False)
        if not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized as admin"
            )
        return payload
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )

@router.get("/admin/setup-admin")
def setup_admin(db: Session = Depends(get_db)):
    """Create initial admin user if none exists"""
    logger.info("Setting up admin user...")
    
    # Check if admin already exists
    admin = db.query(User).filter(User.is_admin == True).first()
    if admin:
        logger.warning("Admin user already exists")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin already exists"
        )
    
    # Create admin user
    admin = User(
        username="admin",
        password="umbc_admin_2024",
        email="admin@umbc.edu",
        is_admin=True
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    logger.info("Admin user created successfully")
    return {"message": "Admin user created successfully"}

@router.post("/admin/login")
async def admin_login(request: AdminLoginRequest, db: Session = Depends(get_db)):
    """Handle admin login and return JWT token"""
    logger.info(f"Admin login attempt for username: {request.username}")
    
    # Find admin user
    admin = db.query(User).filter(
        User.username == request.username,
        User.is_admin == True
    ).first()
    
    if not admin or admin.password != request.password:
        logger.warning(f"Invalid admin login attempt for username: {request.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Generate token
    token_data = {
        "sub": admin.username,
        "is_admin": True,
        "exp": datetime.utcnow() + timedelta(days=1)
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    logger.info(f"Admin login successful for username: {request.username}")
    
    return {"token": token}

@router.get("/admin/posts")
def get_posts(db: Session = Depends(get_db), _: dict = Depends(verify_admin_token)):
    posts = db.query(Post).all()
    return posts

@router.get("/admin/users")
def get_users(db: Session = Depends(get_db), _: dict = Depends(verify_admin_token)):
    users = db.query(User).filter(User.is_admin == False).all()
    return users

@router.get("/admin/comments")
def get_comments(db: Session = Depends(get_db), _: dict = Depends(verify_admin_token)):
    comments = db.query(Comment).all()
    return comments

@router.delete("/admin/{item_type}/{item_id}")
def delete_item(
    item_type: str,
    item_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verify_admin_token)
):
    try:
        if item_type == "posts":
            item = db.query(Post).filter(Post.id == item_id).first()
        elif item_type == "users":
            item = db.query(User).filter(User.id == item_id, User.is_admin == False).first()
        elif item_type == "comments":
            item = db.query(Comment).filter(Comment.id == item_id).first()
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid item type: {item_type}"
            )

        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{item_type} with id {item_id} not found"
            )

        db.delete(item)
        db.commit()
        return {"message": f"{item_type} deleted successfully"}

    except Exception as e:
        logger.error(f"Error deleting {item_type}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting {item_type}"
        )

@router.delete("/admin/users/email/{email}")
async def delete_user_by_email(
    email: str,
    db: Session = Depends(get_db),
    _: dict = Depends(verify_admin_token)
):
    """Delete a user by email"""
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        db.delete(user)
        db.commit()
        return {"message": "User deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
