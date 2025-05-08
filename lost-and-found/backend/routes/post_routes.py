from datetime import datetime
import os
import shutil
import json
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Request
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from database import SessionLocal
import models
from models.post import Post
from models.user import User
from fastapi.responses import JSONResponse
import logging
from utils.ai_matching_inmemory import find_matching_posts, create_match_notifications

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
    try:
        logger.info("Fetching posts with user information...")
        posts = db.query(Post).options(joinedload(Post.user)).all()
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
            "verification_questions": post.verification_questions,
            "user": {
                "id": post.user.id,
                "_id": post.user.id,
                "username": post.user.username,
                "email": post.user.email
            } if post.user else None
        } for post in posts]
        logger.info(f"Successfully fetched {len(posts)} posts")
        return JSONResponse(content=response_data, headers=get_cors_headers(request))
    except Exception as e:
        logger.error(f"Error fetching posts: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": f"Database error: {str(e)}"}, headers=get_cors_headers(request))

@router.get("/search")
async def search_posts(q: str, db: Session = Depends(get_db), request: Request = None):
    try:
        search_term = f"%{q.lower()}%"
        posts = db.query(Post).options(joinedload(Post.user)).filter(
            or_(
                Post.item_name.ilike(search_term),
                Post.description.ilike(search_term),
                Post.location.ilike(search_term)
            )
        ).all()
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
        return JSONResponse(content=response_data, headers=get_cors_headers(request))
    except Exception as e:
        logger.error(f"Error searching posts: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": f"Search error: {str(e)}"}, headers=get_cors_headers(request))

@router.post("/")
async def create_post(
    report_type: str = Form(...),
    item_name: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    contact_details: str = Form(...),
    date: str = Form(...),
    time: str = Form(...),
    user_id: str = Form(...),
    verification_questions: str = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    request: Request = None,
):
    try:
        logger.info(f"Received report_type: {report_type}")
        # Look up user by Firebase UID instead of email
        user = db.query(User).filter(User.firebase_uid == user_id).first()
        if not user:
            logger.error(f"User not found with firebase_uid: {user_id}")
            return JSONResponse(status_code=404, content={"detail": "User not found"}, headers=get_cors_headers(request))

        image_path = None
        if image and image.filename:
            safe_filename = image.filename.replace(" ", "_")
            file_location = os.path.join(UPLOAD_DIR, safe_filename)
            with open(file_location, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            image_path = file_location

        normalized_report_type = report_type.lower().strip()
        logger.info(f"Normalized report_type: {normalized_report_type}")

        # Parse verification questions if provided
        verification_questions_data = None
        if verification_questions:
            try:
                verification_questions_data = json.loads(verification_questions)
                logger.info(f"Parsed verification questions: {verification_questions_data}")
            except json.JSONDecodeError as e:
                logger.error(f"Error parsing verification questions: {str(e)}")

        new_post = Post(
            report_type=normalized_report_type,
            item_name=item_name,
            description=description,
            location=location,
            contact_details=contact_details,
            date=date,
            time=time,
            image_path=image_path,
            verification_questions=verification_questions_data,
            user_id=user.id,
        )
        db.add(new_post)
        db.commit()
        db.refresh(new_post)

        # Find matching posts and create notifications using in-memory AI matching
        logger.info(f"Looking for matching posts for new {normalized_report_type} post...")
        matches = find_matching_posts(db, new_post, threshold=0.7)
        
        if matches:
            logger.info(f"Found {len(matches)} potential matches")
            # Create notifications for the top match
            top_match, similarity = matches[0]
            create_match_notifications(db, new_post, top_match, similarity)
            logger.info(f"Created match notifications with similarity score: {similarity:.2f}")

        logger.info(f"Post created successfully by user {user_id} with report_type: {new_post.report_type}")
        return JSONResponse(content={
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
                "verification_questions": new_post.verification_questions,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email
                }
            }
        }, headers=get_cors_headers(request))

    except Exception as e:
        logger.error(f"Error creating post: {str(e)}")
        db.rollback()
        return JSONResponse(status_code=500, content={"detail": f"Error creating post: {str(e)}"}, headers=get_cors_headers(request))

@router.get("/filter")
async def filter_posts(
    keyword: str = None,
    date: str = None,
    location: str = None,
    type: str = None,
    db: Session = Depends(get_db),
    request: Request = None
):
    try:
        query = db.query(Post).options(joinedload(Post.user))
        if type:
            query = query.filter(Post.report_type.ilike(type))
        if keyword:
            keyword_like = f"%{keyword.lower()}%"
            query = query.filter(or_(
                Post.item_name.ilike(keyword_like),
                Post.description.ilike(keyword_like)
            ))
        if location:
            query = query.filter(Post.location.ilike(f"%{location.lower()}%"))
        if date and date.strip():
            try:
                parsed_date_strs = set()
                formats = ["%m/%d/%Y", "%Y-%m-%d"]
                for fmt in formats:
                    try:
                        dt = datetime.strptime(date, fmt)
                        parsed_date_strs.add(dt.strftime("%Y-%m-%d"))
                        parsed_date_strs.add(dt.strftime("%m/%d/%Y"))
                    except ValueError:
                        continue
                if parsed_date_strs:
                    query = query.filter(or_(*(Post.date == d for d in parsed_date_strs)))
            except Exception as e:
                logger.warning(f"Date parse failed: {e}")

        posts = query.all()
        logger.info(f"Filter params - keyword: {keyword}, date: {date}, location: {location}, type: {type}")
        logger.info(f"Found {len(posts)} posts")

        return JSONResponse(content=[{
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
                "id": post.user.id if post.user else None,
                "username": post.user.username if post.user else None,
                "email": post.user.email if post.user else None
            } if post.user else None
        } for post in posts], headers=get_cors_headers(request))

    except Exception as e:
        logger.error(f"Error filtering posts: {e}")
        return JSONResponse(status_code=500, content={"detail": f"Error filtering posts: {str(e)}"}, headers=get_cors_headers(request))
