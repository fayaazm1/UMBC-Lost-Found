from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from database import get_db
from models.notification import Notification
from models.user import User
from pydantic import BaseModel

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"]
)

class NotificationCreate(BaseModel):
    user_id: str  # Firebase UID
    title: str
    message: str
    type: str
    related_post_id: int = None

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime
    related_post_id: int = None

    class Config:
        from_attributes = True

@router.get("/user/{firebase_uid}", response_model=List[NotificationResponse])
async def get_user_notifications(firebase_uid: str, db: Session = Depends(get_db)):
    try:
        # Get the database user ID from Firebase UID
        user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        notifications = db.query(Notification).filter(
            Notification.user_id == user.id
        ).order_by(Notification.created_at.desc()).all()
        
        return [NotificationResponse(**{
            'id': n.id,
            'title': n.title,
            'message': n.message,
            'type': n.type,
            'is_read': n.is_read,
            'created_at': n.created_at,
            'related_post_id': n.related_post_id
        }) for n in notifications]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create", response_model=NotificationResponse)
async def create_notification(notification: NotificationCreate, db: Session = Depends(get_db)):
    try:
        # Get the database user ID from Firebase UID
        user = db.query(User).filter(User.firebase_uid == notification.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        db_notification = Notification(
            user_id=user.id,
            title=notification.title,
            message=notification.message,
            type=notification.type,
            related_post_id=notification.related_post_id,
            is_read=False
        )
        db.add(db_notification)
        db.commit()
        db.refresh(db_notification)
        
        return NotificationResponse(**{
            'id': db_notification.id,
            'title': db_notification.title,
            'message': db_notification.message,
            'type': db_notification.type,
            'is_read': db_notification.is_read,
            'created_at': db_notification.created_at,
            'related_post_id': db_notification.related_post_id
        })
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{notification_id}/read")
async def mark_as_read(notification_id: int, db: Session = Depends(get_db)):
    try:
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        notification.is_read = True
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{notification_id}")
async def delete_notification(notification_id: int, db: Session = Depends(get_db)):
    try:
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        db.delete(notification)
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/welcome/{firebase_uid}")
async def check_welcome_notification(firebase_uid: str, db: Session = Depends(get_db)):
    try:
        # Get the database user ID from Firebase UID
        user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Check if welcome notification exists
        notification = db.query(Notification).filter(
            Notification.user_id == user.id,
            Notification.type == 'welcome'
        ).first()

        return {"exists": notification is not None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
