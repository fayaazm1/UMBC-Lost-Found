from fastapi import APIRouter, Depends, HTTPException, Body, Request
from fastapi.responses import JSONResponse
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

# CORS Origins
origins = [
    "https://umbc-lost-found.vercel.app",
    "https://umbc-lost-found-git-main-fayaazs-projects-2ea58c4f.vercel.app",
    "http://localhost:5173"
]

def get_cors_headers(request: Request):
    origin = request.headers.get("origin")
    if origin in origins:
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "3600",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    return {
        "Access-Control-Allow-Origin": origins[0],
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Max-Age": "3600",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
    }

class UserCreate(BaseModel):
    email: str
    username: str
    firebase_uid: str

@router.options("/email/{email}")
async def options_user_by_email(request: Request, email: str):
    return JSONResponse(
        content={},
        headers=get_cors_headers(request)
    )

@router.get("/email/{email}")
async def get_user_by_email(request: Request, email: str, db: Session = Depends(get_db)):
    logger.info(f"Attempting to fetch user with email: {email}")
    try:
        user = db.query(User).filter(User.email == email).first()
        logger.info(f"Query result: {user}")
        if not user:
            logger.warning(f"User not found for email: {email}")
            return JSONResponse(
                status_code=404,
                content={"detail": "User not found"},
                headers=get_cors_headers(request)
            )
        return JSONResponse(
            content={
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "firebase_uid": user.firebase_uid
            },
            headers=get_cors_headers(request)
        )
    except Exception as e:
        logger.error(f"Error fetching user: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Database error: {str(e)}"},
            headers=get_cors_headers(request)
        )

@router.options("/")
async def options_create_user(request: Request):
    return JSONResponse(
        content={},
        headers=get_cors_headers(request)
    )

@router.post("/")
async def create_user(request: Request, user: UserCreate, db: Session = Depends(get_db)):
    logger.info(f"Attempting to create user with email: {user.email}")
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.email == user.email) | (User.firebase_uid == user.firebase_uid)
        ).first()
        
        if existing_user:
            if existing_user.email == user.email:
                logger.warning(f"Email already registered: {user.email}")
                return JSONResponse(
                    status_code=400,
                    content={"detail": "Email already registered"},
                    headers=get_cors_headers(request)
                )
            else:
                logger.warning(f"User already exists with firebase_uid: {user.firebase_uid}")
                return JSONResponse(
                    status_code=400,
                    content={"detail": "User already exists"},
                    headers=get_cors_headers(request)
                )

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
        return JSONResponse(
            content={
                "id": db_user.id,
                "email": db_user.email,
                "username": db_user.username,
                "firebase_uid": db_user.firebase_uid
            },
            headers=get_cors_headers(request)
        )
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        db.rollback()
        return JSONResponse(
            status_code=500,
            content={"detail": f"Database error: {str(e)}"},
            headers=get_cors_headers(request)
        )
