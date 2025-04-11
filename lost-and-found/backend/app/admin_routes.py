from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db, SessionLocal
from models.user import User
import os

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/setup-admin")
async def setup_admin(email: str, setup_key: str):
    # Verify setup key
    if setup_key != os.getenv("ADMIN_SETUP_KEY"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid setup key"
        )

    db = SessionLocal()
    try:
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
    finally:
        db.close()

@router.post("/login")
async def admin_login(username: str, password: str):
    # Verify against environment variables
    if username != os.getenv("ADMIN_USERNAME") or \
       password != os.getenv("ADMIN_PASSWORD"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    db = SessionLocal()
    try:
        # Find admin user
        admin = db.query(User).filter(User.is_admin == True).first()
        if not admin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No admin user found"
            )

        return {
            "message": "Login successful",
            "user": {
                "email": admin.email,
                "username": admin.username,
                "is_admin": admin.is_admin
            }
        }
    finally:
        db.close()
