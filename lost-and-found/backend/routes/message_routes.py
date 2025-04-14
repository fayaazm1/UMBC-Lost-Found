from fastapi import APIRouter, HTTPException, Request, Depends
from datetime import datetime
from config.mongodb import messages
from typing import List
import logging
from models.user import User
from sqlalchemy.orm import Session
from config.db import get_db
from bson import ObjectId
from schemas import CreateMessageRequest  # ✅ Pydantic model for validation

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

        message_data = {
            "content": payload.message,
            "sender_id": sender["id"],
            "sender_name": sender["username"],
            "receiver_id": receiver["id"],
            "receiver_name": receiver["username"],
            "post_id": payload.postId,
            "timestamp": datetime.now().isoformat(),
            "read_status": False
        }

        result = await messages.insert_one(message_data)
        if not result.inserted_id:
            raise HTTPException(status_code=500, detail="Failed to save message to database")

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
                "postId": {"$first": "$post_id"},  # ✅ Include postId
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
