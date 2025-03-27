from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

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
    
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="posts")
    notifications = relationship("Notification", back_populates="related_post")
