from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Message Schema (MongoDB)
class Message(BaseModel):
    sender_id: str
    receiver_id: str
    message: str
    timestamp: datetime = datetime.utcnow()
    status: str = "unread"

# Notification Schema (MySQL)
class Notification(BaseModel):
    user_id: int
    message: str
    created_at: datetime = datetime.utcnow()
    is_read: bool = False
