from fastapi import APIRouter, Depends, HTTPException, Body, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.post import Post

from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

# CORS Origins
origins = ["*"]  # Allow all origins during testing

def get_cors_headers(request: Request):
    return {
        "Access-Control-Allow-Origin": "*",
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

class UserProfileUpdate(BaseModel):
    displayName: str = None
    photoURL: str = None
    bio: str = None
    phoneNumber: str = None

@router.options("/")
async def options_list_users(request: Request):
    return JSONResponse(
        content={},
        headers=get_cors_headers(request)
    )

@router.get("/")
async def list_users(request: Request, db: Session = Depends(get_db)):
    """Get all users"""
    logger.info("Fetching all users")
    try:
        users = db.query(User).all()
        return JSONResponse(
            content=[{
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "firebase_uid": user.firebase_uid,
                "is_admin": user.is_admin
            } for user in users],
            headers=get_cors_headers(request)
        )
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Database error: {str(e)}"},
            headers=get_cors_headers(request)
        )

@router.options("/email/{email}")
async def options_user_by_email(request: Request, email: str):
    return JSONResponse(
        content={},
        headers=get_cors_headers(request)
    )

@router.get("/email/{email}")
async def get_user_by_email(request: Request, email: str, db: Session = Depends(get_db)):
    """Get user by email"""
    logger.info(f"Fetching user with email: {email}")
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            logger.warning(f"User not found: {email}")
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
                "firebase_uid": user.firebase_uid,
                "is_admin": user.is_admin
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
    """Create a new user"""
    logger.info(f"Creating user with email: {user.email}")
    try:
        # Check if user with email already exists
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            logger.warning(f"User with email already exists: {user.email}")
            return JSONResponse(
                status_code=400,
                content={"detail": "Email already registered"},
                headers=get_cors_headers(request)
            )

        # Create new user
        db_user = User(
            email=user.email.lower(),
            username=user.username,
            firebase_uid=user.firebase_uid
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        logger.info(f"User created successfully: {user.email}")
        return JSONResponse(
            content={
                "id": db_user.id,
                "email": db_user.email,
                "username": db_user.username,
                "firebase_uid": db_user.firebase_uid,
                "is_admin": db_user.is_admin
            },
            headers=get_cors_headers(request)
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating user: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Database error: {str(e)}"},
            headers=get_cors_headers(request)
        )

@router.delete("/by-email/{email}")
async def delete_user_by_email(request: Request, email: str, db: Session = Depends(get_db)):
    """Delete user by email"""
    logger.info(f"Attempting to delete user with email: {email}")
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            logger.warning(f"User not found for deletion: {email}")
            return JSONResponse(
                status_code=404,
                content={"detail": "User not found"},
                headers=get_cors_headers(request)
            )
        
        db.delete(user)
        db.commit()
        logger.info(f"User deleted successfully: {email}")
        return JSONResponse(
            content={"message": "User deleted successfully"},
            headers=get_cors_headers(request)
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting user: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Database error: {str(e)}"},
            headers=get_cors_headers(request)
        )

@router.get("/search/{email}")
async def search_user_activity(request: Request, email: str, db: Session = Depends(get_db)):
    """Search for all activity related to a user's email"""
    logger.info(f"Searching for all activity for email: {email}")
    try:
        # Find user
        user = db.query(User).filter(User.email == email).first()
        user_data = None
        if user:
            user_data = {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "firebase_uid": user.firebase_uid,
                "is_admin": user.is_admin
            }

        # Find posts by user
        posts = []
        if user:
            user_posts = db.query(Post).filter(Post.user_id == user.id).all()
            posts = [
                {
                    "id": post.id,
                    "report_type": post.report_type,
                    "item_name": post.item_name,
                    "description": post.description,
                    "location": post.location,
                    "contact_details": post.contact_details,
                    "date": post.date,
                    "time": post.time,
                    "image_path": post.image_path
                }
                for post in user_posts
            ]

        # Find comments by user
        comments = []
        if user:
            user_comments = db.query(Comment).filter(Comment.user_id == user.id).all()
            comments = [
                {
                    "id": comment.id,
                    "content": comment.content,
                    "post_id": comment.post_id
                }
                for comment in user_comments
            ]

        return JSONResponse(
            content={
                "user": user_data,
                "posts": posts,
                "comments": comments
            },
            headers=get_cors_headers(request)
        )
    except Exception as e:
        logger.error(f"Error searching user activity: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Database error: {str(e)}"},
            headers=get_cors_headers(request)
        )

@router.options("/{email}/profile")
async def options_update_profile(request: Request, email: str):
    return JSONResponse(
        content={},
        headers=get_cors_headers(request)
    )

@router.put("/{email}/profile")
async def update_user_profile(request: Request, email: str, profile_data: UserProfileUpdate, db: Session = Depends(get_db)):
    """Update user profile"""
    logger.info(f"Updating profile for user with email: {email}")
    try:
        # Find user by email
        user = db.query(User).filter(User.email == email).first()
        if not user:
            logger.warning(f"User not found for profile update: {email}")
            return JSONResponse(
                status_code=404,
                content={"detail": "User not found"},
                headers=get_cors_headers(request)
            )
        
        # Update user fields if provided
        if profile_data.displayName is not None:
            user.username = profile_data.displayName
            
        # Add additional fields to User model if they don't exist
        if not hasattr(user, 'photo_url') and profile_data.photoURL is not None:
            # Add column if it doesn't exist in the table
            try:
                db.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url VARCHAR(255)")
                db.commit()
            except Exception as e:
                logger.warning(f"Failed to add photo_url column: {str(e)}")
                
            # Now set the value
            user.photo_url = profile_data.photoURL
        elif hasattr(user, 'photo_url') and profile_data.photoURL is not None:
            user.photo_url = profile_data.photoURL
            
        if not hasattr(user, 'bio') and profile_data.bio is not None:
            try:
                db.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT")
                db.commit()
            except Exception as e:
                logger.warning(f"Failed to add bio column: {str(e)}")
                
            user.bio = profile_data.bio
        elif hasattr(user, 'bio') and profile_data.bio is not None:
            user.bio = profile_data.bio
            
        if not hasattr(user, 'phone') and profile_data.phoneNumber is not None:
            try:
                db.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)")
                db.commit()
            except Exception as e:
                logger.warning(f"Failed to add phone column: {str(e)}")
                
            user.phone = profile_data.phoneNumber
        elif hasattr(user, 'phone') and profile_data.phoneNumber is not None:
            user.phone = profile_data.phoneNumber
        
        # Save changes
        db.commit()
        db.refresh(user)
        
        # Create response with all user fields
        response_data = {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "firebase_uid": user.firebase_uid,
            "is_admin": user.is_admin
        }
        
        # Add the new fields if they exist
        if hasattr(user, 'photo_url'):
            response_data["photo_url"] = user.photo_url
        if hasattr(user, 'bio'):
            response_data["bio"] = user.bio
        if hasattr(user, 'phone'):
            response_data["phone"] = user.phone
        
        logger.info(f"User profile updated successfully: {email}")
        return JSONResponse(
            content=response_data,
            headers=get_cors_headers(request)
        )
    except Exception as e:
        logger.error(f"Error updating user profile: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Database error: {str(e)}"},
            headers=get_cors_headers(request)
        )
