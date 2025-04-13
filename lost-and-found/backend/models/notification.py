from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    message = Column(String)
    type = Column(String)  # 'match', 'system', 'found', 'lost'
    is_read = Column(Boolean, default=False)  # Changed from 'read' to 'is_read'
    created_at = Column(DateTime, default=datetime.utcnow)
    related_post_id = Column(Integer, ForeignKey("posts.id"), nullable=True)

    # Relationships
    user = relationship("User", back_populates="notifications")
    related_post = relationship("Post", back_populates="notifications")
