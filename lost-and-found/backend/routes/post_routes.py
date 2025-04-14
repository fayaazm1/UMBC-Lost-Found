import os
import shutil
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Request
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from database import SessionLocal
import models
from models.post import Post
from models.user import User
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

@router.get("/")
async def get_posts(request: Request, db: Session = Depends(get_db)):
    """Get all posts with their associated users"""
    try:
        # Add logging for debugging
        logger.info("Fetching posts with user information...")
        
        # Query posts with user information
        posts = db.query(Post).options(joinedload(Post.user)).all()
        
        # Log post information for debugging
        for post in posts:
            logger.info(f"Post ID: {post.id}, User ID: {post.user_id if post.user_id else 'None'}")
            logger.info(f"User info: {post.user.username if post.user else 'No user'}")
            
        # Convert to response format
        response_data = [{
            "id": post.id,
            "report_type": post.report_type.lower().strip() if post.report_type else None,
            "item_name": post.item_name,
            "description": post.description,
            "location": post.location,
            "contact_details": post.contact_details,
            "date": post.date,
            "time": post.time,
            "image_path": post.image_path,
            "user": {
                "id": post.user.id,
                "_id": post.user.id,  # Add _id for frontend compatibility
                "username": post.user.username,
                "email": post.user.email
            } if post.user else None
        } for post in posts]
        
        logger.info(f"Successfully fetched {len(posts)} posts")
        return JSONResponse(
            content=response_data,
            headers=get_cors_headers(request)
        )
    except Exception as e:
        logger.error(f"Error fetching posts: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Database error: {str(e)}"},
            headers=get_cors_headers(request)
        )

@router.get("/search")
async def search_posts(q: str, db: Session = Depends(get_db), request: Request = None):
    """Search posts by keyword in title, description, or location"""
    try:
        # Convert query to lowercase for case-insensitive search
        search_term = f"%{q.lower()}%"
        
        # Search in item_name, description, and location
        posts = db.query(Post).options(joinedload(Post.user)).filter(
            or_(
                Post.item_name.ilike(search_term),
                Post.description.ilike(search_term),
                Post.location.ilike(search_term)
            )
        ).all()
        
        # Convert to response format
        response_data = [{
            "id": post.id,
            "type": post.report_type.lower().strip() if post.report_type else None,
            "title": post.item_name,
            "description": post.description,
            "location": post.location,
            "image": post.image_path,
            "createdAt": str(post.date) + " " + str(post.time),
            "user": {
                "id": post.user.id,
                "username": post.user.username
            } if post.user else None
        } for post in posts]
        
        logger.info(f"Search for '{q}' found {len(posts)} results")
        return JSONResponse(
            content=response_data,
            headers=get_cors_headers(request)
        )
    except Exception as e:
        logger.error(f"Error searching posts: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Search error: {str(e)}"},
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
    user_id: str = Form(...),  # This will be the user's email
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    request: Request = None,
):
    try:
        # Log the report type for debugging
        logger.info(f"Received report_type: {report_type}")
        
        # Find user by email
        user = db.query(User).filter(User.email == user_id).first()
        if not user:
            logger.error(f"User not found with email: {user_id}")
            return JSONResponse(
                status_code=404,
                content={"detail": "User not found"},
                headers=get_cors_headers(request)
            )

        image_path = None
        if image and image.filename:
            safe_filename = image.filename.replace(" ", "_")
            file_location = os.path.join(UPLOAD_DIR, safe_filename)

            with open(file_location, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)

            image_path = file_location

        # Normalize report type to lowercase and trim whitespace
        normalized_report_type = report_type.lower().strip()
        logger.info(f"Normalized report_type: {normalized_report_type}")

        new_post = Post(
            report_type=normalized_report_type,
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

        logger.info(f"Post created successfully by user {user_id} with report_type: {new_post.report_type}")
        return JSONResponse(
            content={
                "message": "Post created successfully",
                "post": {
                    "id": new_post.id,
                    "report_type": new_post.report_type,
                    "item_name": new_post.item_name,
                    "description": new_post.description,
                    "location": new_post.location,
                    "contact_details": new_post.contact_details,
                    "date": new_post.date,
                    "time": new_post.time,
                    "image_path": new_post.image_path,
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email
                    }
                }
            },
            headers=get_cors_headers(request)
        )

    except Exception as e:
        logger.error(f"Error creating post: {str(e)}")
        db.rollback()
        return JSONResponse(
            status_code=500,
            content={"detail": f"Error creating post: {str(e)}"},
            headers=get_cors_headers(request)
        )
