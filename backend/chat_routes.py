from fastapi import APIRouter, HTTPException
from database import users_collection, messages_collection, conversations_collection
from models import Message, User
from bson import ObjectId

router = APIRouter()

# ✅ Get all users
@router.get("/users/")
def get_users():
    users = list(users_collection.find({}, {"_id": 1, "username": 1}))
    return {"users": users}

# ✅ Start or Get existing conversation between two users
@router.post("/start_conversation/")
def start_conversation(user1_id: str, user2_id: str):
    existing = conversations_collection.find_one({
        "participants": {"$all": [user1_id, user2_id]}
    })
    if existing:
        return {"conversation_id": str(existing["_id"])}

    new_conv = {
        "participants": [user1_id, user2_id],
        "created_at": datetime.utcnow()
    }
    result = conversations_collection.insert_one(new_conv)
    return {"conversation_id": str(result.inserted_id)}

# ✅ Get all messages for a conversation
@router.get("/get_messages/{conversation_id}")
def get_messages(conversation_id: str):
    messages = list(messages_collection.find({"conversation_id": conversation_id}, {"_id": 0}))
    return {"messages": messages}

# ✅ Send a message in a conversation
@router.post("/send_message/")
def send_message(message: Message):
    message_data = message.dict()
    messages_collection.insert_one(message_data)
    return {"status": "success", "message": "Message sent!"}
