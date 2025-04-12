from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    report_type = Column(String, nullable=False)
    item_name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    location = Column(String, nullable=False)
    contact_details = Column(String, nullable=False)
    date = Column(String, nullable=False)
    time = Column(String, nullable=True)
    image_path = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    user = relationship("User", back_populates="posts")
    notifications = relationship("Notification", back_populates="related_post")
    comments = relationship("Comment", back_populates="post")
