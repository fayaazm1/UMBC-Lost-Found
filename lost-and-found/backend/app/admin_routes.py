from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db, SessionLocal
from models.user import User
from pydantic import BaseModel
import os
import logging

# Configure logging
logger = logging.getLogger(__name__)

class AdminSetup(BaseModel):
    email: str
    setup_key: str

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminResponse(BaseModel):
    message: str
    user: dict
    token: str = None

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/setup-admin", response_model=AdminResponse)
async def setup_admin(data: AdminSetup):
    try:
        logger.info(f"Attempting admin setup for email: {data.email}")
        # Verify setup key
        if data.setup_key != os.getenv("ADMIN_SETUP_KEY"):
            logger.warning(f"Invalid setup key attempt for email: {data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid setup key"
            )

        db = SessionLocal()
        try:
            # Find user by email
            user = db.query(User).filter(User.email == data.email.lower()).first()
            if not user:
                logger.error(f"User not found for email: {data.email}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )

            # Make user an admin
            user.is_admin = True
            db.commit()
            db.refresh(user)

            logger.info(f"Successfully set up admin for email: {data.email}")
            return AdminResponse(
                message="Admin user created successfully",
                user={
                    "email": user.email,
                    "username": user.username,
                    "is_admin": user.is_admin
                }
            )
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error in setup_admin: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/login", response_model=AdminResponse)
async def admin_login(data: AdminLogin):
    try:
        logger.info(f"Admin login attempt for username: {data.username}")
        
        # Log environment variables (excluding sensitive data)
        admin_username = os.getenv("ADMIN_USERNAME")
        logger.info(f"Expected admin username: {admin_username}")
        logger.info(f"Provided username matches: {data.username == admin_username}")

        # Verify against environment variables
        if data.username != os.getenv("ADMIN_USERNAME") or \
           data.password != os.getenv("ADMIN_PASSWORD"):
            logger.warning(f"Invalid admin login attempt for username: {data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        db = SessionLocal()
        try:
            # Find admin user
            admin = db.query(User).filter(User.is_admin == True).first()
            if not admin:
                logger.error("No admin user found in database")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No admin user found"
                )

            logger.info(f"Successful admin login for username: {data.username}")
            return AdminResponse(
                message="Login successful",
                user={
                    "email": admin.email,
                    "username": admin.username,
                    "is_admin": admin.is_admin
                },
                token="admin_session_token"  # You might want to generate a real JWT token here
            )
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error in admin_login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
