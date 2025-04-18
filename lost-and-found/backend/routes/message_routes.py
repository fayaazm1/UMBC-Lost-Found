from fastapi import APIRouter, HTTPException, Request, Depends
from datetime import datetime
from pytz import timezone
from config.mongodb import messages
from typing import List
import logging
from models.user import User
from sqlalchemy.orm import Session
from config.db import get_db
from bson import ObjectId
from schemas import CreateMessageRequest
from models.notification import Notification  # <-- Added for notification

router = APIRouter(prefix="/messages", tags=["messages"])

def get_user_info(db: Session, user_id: int):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        return {"id": user.id, "username": user.username}
    except Exception as e:
        logging.error(f"Error getting user info for ID {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving user information: {str(e)}")

@router.post("/create")
async def create_message(payload: CreateMessageRequest, db: Session = Depends(get_db)):
    try:
        sender_id = payload.from_
        receiver_id = payload.to

        if sender_id == receiver_id:
            raise HTTPException(status_code=400, detail="Cannot send message to yourself")

        sender = get_user_info(db, sender_id)
        receiver = get_user_info(db, receiver_id)

        eastern = timezone("America/New_York")
        message_data = {
            "content": payload.message,
            "sender_id": sender["id"],
            "sender_name": sender["username"],
            "receiver_id": receiver["id"],
            "receiver_name": receiver["username"],
            "post_id": payload.postId,
            "timestamp": datetime.now(eastern).isoformat(),
            "read_status": False
        }

        result = await messages.insert_one(message_data)
        if not result.inserted_id:
            raise HTTPException(status_code=500, detail="Failed to save message to database")

        # ✅ Send New Message Notification
        db_notification = Notification(
            user_id=receiver["id"],
            title="New Message",
            message=f"You received a new message from {sender['username']}",
            type="message",
            related_post_id=payload.postId,
            is_read=False,
            created_at=datetime.now(eastern)
        )
        db.add(db_notification)
        db.commit()

        return {"success": True, "message": "Message sent successfully", "message_id": str(result.inserted_id)}

    except HTTPException as e:
        raise e
    except Exception as e:
        logging.error(f"Error creating message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/{user_id}/{other_user_id}")
async def get_chat_messages(user_id: int, other_user_id: int, db: Session = Depends(get_db)):
    try:
        cursor = messages.find({
            "$or": [
                {"sender_id": user_id, "receiver_id": other_user_id},
                {"sender_id": other_user_id, "receiver_id": user_id}
            ]
        }).sort("timestamp", 1)

        chat_messages = []
        async for msg in cursor:
            msg["_id"] = str(msg["_id"])
            chat_messages.append(msg)
        return chat_messages

    except Exception as e:
        logging.error(f"Error getting chat messages: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversations/{user_id}")
async def get_conversations(user_id: int, db: Session = Depends(get_db)):
    try:
        pipeline = [
            {"$match": {
                "$or": [
                    {"sender_id": user_id},
                    {"receiver_id": user_id}
                ]
            }},
            {"$sort": {"timestamp": -1}},
            {"$group": {
                "_id": {"$cond": [
                    {"$eq": ["$sender_id", user_id]},
                    "$receiver_id",
                    "$sender_id"
                ]},
                "last_message": {"$first": "$content"},
                "timestamp": {"$first": "$timestamp"},
                "username": {"$first": {"$cond": [
                    {"$eq": ["$sender_id", user_id]},
                    "$receiver_name",
                    "$sender_name"
                ]}},
                "userId": {"$first": {"$cond": [
                    {"$eq": ["$sender_id", user_id]},
                    "$receiver_id",
                    "$sender_id"
                ]}},
                "postId": {"$first": "$post_id"},
                "unread": {"$sum": {"$cond": [
                    {"$and": [
                        {"$eq": ["$receiver_id", user_id]},
                        {"$eq": ["$read_status", False]}
                    ]}, 1, 0
                ]}}
            }}
        ]

        conversations = []
        async for conv in messages.aggregate(pipeline):
            conv["_id"] = str(conv["_id"])
            conversations.append(conv)
        return conversations

    except Exception as e:
        logging.error(f"Error getting conversations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recent")
async def get_recent_messages(userId: int):
    try:
        recent_msgs = []
        cursor = messages.find({
            "receiver_id": userId,
            "read_status": False
        }).sort("timestamp", -1).limit(10)

        async for msg in cursor:
            msg["_id"] = str(msg["_id"])
            recent_msgs.append(msg)

        return {
            "messages": recent_msgs,
            "typing": []
        }

    except Exception as e:
        logging.error(f"Error fetching recent messages: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mark-read")
async def mark_messages_as_read(payload: dict, db: Session = Depends(get_db)):
    try:
        user_id = payload.get("userId")
        conversation_id = payload.get("conversationId")

        if not user_id or not conversation_id:
            raise HTTPException(status_code=400, detail="Missing userId or conversationId")

        result = await messages.update_many(
            {
                "receiver_id": user_id,
                "sender_id": int(conversation_id),
                "read_status": False
            },
            {"$set": {"read_status": True}}
        )

        return {
            "success": True,
            "updated_count": result.modified_count
        }

    except Exception as e:
        logging.error(f"Error marking messages as read: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
