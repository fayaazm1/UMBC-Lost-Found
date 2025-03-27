from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String, default="firebase_auth")  # Default for Firebase users
    firebase_uid = Column(String, unique=True)

    # Relationships
    posts = relationship("Post", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
