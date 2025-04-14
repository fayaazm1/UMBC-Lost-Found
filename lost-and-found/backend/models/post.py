from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    report_type = Column(String)  # 'lost' or 'found'
    item_name = Column(String)
    description = Column(String)
    location = Column(String)
    contact_details = Column(String)
    date = Column(String)
    time = Column(String)
    image_path = Column(String, nullable=True)
    
    # Foreign key to link to user
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationship to get user details
    user = relationship("User", back_populates="posts")
    notifications = relationship("Notification", back_populates="related_post")
    
