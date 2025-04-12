from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)
    email = Column(String, unique=True)
    password = Column(String, nullable=True)  # Nullable since we use Firebase auth
    firebase_uid = Column(String, unique=True)
    is_admin = Column(Boolean, default=False)

    # Relationships
    posts = relationship("Post", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    comments = relationship("Comment", back_populates="user")
