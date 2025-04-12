from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    firebase_uid: str

class UserResponse(UserBase):
    id: int
    is_admin: bool
    created_at: datetime
    last_login: datetime

    class Config:
        orm_mode = True

class AdminLogin(BaseModel):
    username: str
    password: str

class SetupAdmin(BaseModel):
    email: EmailStr
    setup_key: str
