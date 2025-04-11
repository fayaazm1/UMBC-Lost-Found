from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models import User
from ..schemas import UserResponse
from ..config import Settings
from ..utils import get_password_hash
import os

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/setup-admin")
async def setup_admin(
    email: str,
    setup_key: str,
    db: Session = Depends(get_db)
):
    # Verify setup key
    if setup_key != os.getenv("ADMIN_SETUP_KEY"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid setup key"
        )

    # Find user by email
    user = db.query(User).filter(User.email == email.lower()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Make user an admin
    user.is_admin = True
    db.commit()
    db.refresh(user)

    return {
        "message": "Admin user created successfully",
        "user": {
            "email": user.email,
            "username": user.username,
            "is_admin": user.is_admin
        }
    }

@router.post("/login")
async def admin_login(
    username: str,
    password: str,
    db: Session = Depends(get_db)
):
    # Verify against environment variables
    if username != os.getenv("ADMIN_USERNAME") or \
       password != os.getenv("ADMIN_PASSWORD"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Find admin user
    admin = db.query(User).filter(User.is_admin == True).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No admin user found"
        )

    # Create admin token
    token = create_admin_token(admin.id)
    return {"token": token, "user": UserResponse.from_orm(admin)}

# Admin operations
@router.get("/users")
async def get_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    users = db.query(User).all()
    return [UserResponse.from_orm(user) for user in users]

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
