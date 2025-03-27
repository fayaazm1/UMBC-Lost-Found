import os
import shutil
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from backend.database import SessionLocal
from backend import models
from backend.models.post import Post
from backend.models.user import User
from backend.schemas import PostOut

router = APIRouter(prefix="/api/posts")

UPLOAD_DIR = "backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[PostOut])
def get_posts(db: Session = Depends(get_db)):
    posts = db.query(models.Post).options(joinedload(models.Post.user)).all()
    return posts

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
            report_type=report_type.lower(),  # Ensure lowercase
            item_name=item_name,
            description=description,
            location=location,
            contact_details=contact_details,
            date=date,
            time=time,
            image_path=image_path,
            user_id=user.id,  # Use the database user ID
        )
        db.add(new_post)
        db.commit()
        db.refresh(new_post)

        return {"message": "Post created successfully", "post": new_post}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
