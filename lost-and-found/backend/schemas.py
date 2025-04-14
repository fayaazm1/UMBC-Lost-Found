from typing import Optional, Dict, Any
from pydantic import BaseModel
from typing import Optional
from pydantic import BaseModel, Field

class CreateMessageRequest(BaseModel):
    message: str
    from_: int = Field(..., alias="from")
    to: int
    postId: int



class PostCreate:
    def __init__(self, data: Dict[str, Any]):
        self.report_type = data.get("report_type")
        self.item_name = data.get("item_name")
        self.description = data.get("description")
        self.location = data.get("location")
        self.contact_details = data.get("contact_details")
        self.date = data.get("date")
        self.time = data.get("time")
        self.image = data.get("image")

    def dict(self):
        return {
            "report_type": self.report_type,
            "item_name": self.item_name,
            "description": self.description,
            "location": self.location,
            "contact_details": self.contact_details,
            "date": self.date,
            "time": self.time,
            "image": self.image
        }

class UserResponse:
    def __init__(self, data: Dict[str, Any]):
        self.id = data.get("id")
        self.username = data.get("username")

    def dict(self):
        return {
            "id": self.id,
            "username": self.username
        }

class PostOut:
    def __init__(self, data: Dict[str, Any]):
        self.id = data.get("id")
        self.report_type = data.get("report_type")
        self.item_name = data.get("item_name")
        self.description = data.get("description")
        self.location = data.get("location")
        self.contact_details = data.get("contact_details")
        self.date = data.get("date")
        self.time = data.get("time")
        self.image_path = data.get("image_path")
        self.user = UserResponse(data.get("user", {})) if data.get("user") else None

    def dict(self):
        return {
            "id": self.id,
            "report_type": self.report_type,
            "item_name": self.item_name,
            "description": self.description,
            "location": self.location,
            "contact_details": self.contact_details,
            "date": self.date,
            "time": self.time,
            "image_path": self.image_path,
            "user": self.user.dict() if self.user else None
        }
