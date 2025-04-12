import os
import shutil
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Request
from sqlalchemy.orm import Session, joinedload
from database import SessionLocal
import models
from models.post import Post
from models.user import User
from schemas import PostOut
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/posts",
    tags=["posts"]
)

UPLOAD_DIR = "backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_cors_headers(request: Request):
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*"
    }

@router.get("/", response_model=list[PostOut])
async def get_posts(request: Request, db: Session = Depends(get_db)):
    """Get all posts with their associated users"""
    try:
        posts = db.query(Post).options(joinedload(Post.user)).all()
        return JSONResponse(
            content=[{
                "id": post.id,
                "report_type": post.report_type,
                "item_name": post.item_name,
                "description": post.description,
                "location": post.location,
                "contact_details": post.contact_details,
                "date": post.date,
                "time": post.time,
                "image_path": post.image_path,
                "user": {
                    "id": post.user.id,
                    "username": post.user.username,
                    "email": post.user.email
                } if post.user else None
            } for post in posts],
            headers=get_cors_headers(request)
        )
    except Exception as e:
        logger.error(f"Error fetching posts: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Database error: {str(e)}"},
            headers=get_cors_headers(request)
        )

@router.post("/")
async def create_post(
    report_type: str = Form(...),
    item_name: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    contact_details: str = Form(...),
    date: str = Form(...),
    time: str = Form(...),
    user_id: str = Form(...),  # This will be the Firebase UID
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    try:
        # Find user by Firebase UID
        user = db.query(User).filter(User.firebase_uid == user_id).first()
        if not user:
            # Create a new user if not found
            user = User(
                firebase_uid=user_id,
                username=f"user_{user_id[:8]}",  # Create a temporary username
                email="pending@example.com",  # Placeholder email
                password="firebase_auth"  # Placeholder password since we use Firebase
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        image_path = None
        if image and image.filename:
            safe_filename = image.filename.replace(" ", "_")
            file_location = os.path.join(UPLOAD_DIR, safe_filename)

            with open(file_location, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)

            image_path = file_location

        new_post = Post(
            report_type=report_type.lower(),
            item_name=item_name,
            description=description,
            location=location,
            contact_details=contact_details,
            date=date,
            time=time,
            image_path=image_path,
            user_id=user.id,
        )
        db.add(new_post)
        db.commit()
        db.refresh(new_post)

        return {"message": "Post created successfully", "post": new_post}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
