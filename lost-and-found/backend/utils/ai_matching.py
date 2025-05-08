import numpy as np
import logging
from sentence_transformers import SentenceTransformer
from typing import List, Tuple, Dict, Any
from sqlalchemy.orm import Session
from models.post import Post
from models.user import User
from models.notification import Notification

logger = logging.getLogger(__name__)

# Initialize the SBERT model
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    logger.info("SBERT model loaded successfully")
except Exception as e:
    logger.error(f"Error loading SBERT model: {str(e)}")
    model = None

def generate_embedding(text: str) -> bytes:
    """Generate embedding for a text using SBERT model and return as bytes"""
    try:
        if model is None:
            logger.error("SBERT model not loaded")
            return None
        
        # Combine item name and description for better matching
        embedding = model.encode(text).astype(np.float32)
        return embedding.tobytes()
    except Exception as e:
        logger.error(f"Error generating embedding: {str(e)}")
        return None

def bytes_to_embedding(embedding_bytes: bytes) -> np.ndarray:
    """Convert bytes back to numpy array embedding"""
    if embedding_bytes is None:
        return None
    try:
        return np.frombuffer(embedding_bytes, dtype=np.float32)
    except Exception as e:
        logger.error(f"Error converting bytes to embedding: {str(e)}")
        return None

def calculate_similarity(embedding1: np.ndarray, embedding2: np.ndarray) -> float:
    """Calculate cosine similarity between two embeddings"""
    if embedding1 is None or embedding2 is None:
        return 0.0
    
    try:
        # Normalize the vectors
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
            
        # Calculate cosine similarity
        return np.dot(embedding1, embedding2) / (norm1 * norm2)
    except Exception as e:
        logger.error(f"Error calculating similarity: {str(e)}")
        return 0.0

def find_matching_posts(
    db: Session, 
    post: Post, 
    threshold: float = 0.7
) -> List[Tuple[Post, float]]:
    """
    Find matching posts of the opposite type (lost/found) based on embeddings
    Returns a list of (post, similarity_score) tuples
    """
    if post.embedding is None:
        logger.warning(f"Post {post.id} has no embedding")
        return []
    
    # Determine which type of posts to search for
    search_type = "found" if post.report_type.lower() == "lost" else "lost"
    
    try:
        # Get all posts of the opposite type
        opposite_posts = db.query(Post).filter(Post.report_type == search_type).all()
        
        if not opposite_posts:
            logger.info(f"No {search_type} posts found to match against")
            return []
        
        # Convert current post embedding from bytes to numpy array
        current_embedding = bytes_to_embedding(post.embedding)
        if current_embedding is None:
            return []
        
        matches = []
        for other_post in opposite_posts:
            if other_post.embedding is None:
                continue
                
            other_embedding = bytes_to_embedding(other_post.embedding)
            if other_embedding is None:
                continue
                
            similarity = calculate_similarity(current_embedding, other_embedding)
            
            if similarity >= threshold:
                matches.append((other_post, similarity))
        
        # Sort by similarity score (highest first)
        matches.sort(key=lambda x: x[1], reverse=True)
        return matches
        
    except Exception as e:
        logger.error(f"Error finding matching posts: {str(e)}")
        return []

def create_match_notifications(
    db: Session, 
    current_post: Post, 
    matched_post: Post, 
    similarity_score: float
) -> Tuple[Notification, Notification]:
    """
    Create notifications for both users when a match is found
    Returns the two created notification objects
    """
    try:
        # Get users
        current_user = db.query(User).filter(User.id == current_post.user_id).first()
        matched_user = db.query(User).filter(User.id == matched_post.user_id).first()
        
        if not current_user or not matched_user:
            logger.error(f"User not found for post match notification")
            return None, None
        
        # Create notification for the current post's user
        if current_post.report_type.lower() == "lost":
            current_title = "Potential match for your lost item"
            current_message = f"We found a potential match for your lost item '{current_post.item_name}'. Someone reported finding a '{matched_post.item_name}' with {int(similarity_score * 100)}% similarity."
            current_type = "match_lost"
        else:
            current_title = "Potential match for your found item"
            current_message = f"We found a potential match for your found item '{current_post.item_name}'. Someone reported losing a '{matched_post.item_name}' with {int(similarity_score * 100)}% similarity."
            current_type = "match_found"
            
        current_notification = Notification(
            user_id=current_user.id,
            title=current_title,
            message=current_message,
            type=current_type,
            is_read=False,
            related_post_id=matched_post.id
        )
        
        # Create notification for the matched post's user
        if matched_post.report_type.lower() == "lost":
            matched_title = "Potential match for your lost item"
            matched_message = f"We found a potential match for your lost item '{matched_post.item_name}'. Someone reported finding a '{current_post.item_name}' with {int(similarity_score * 100)}% similarity."
            matched_type = "match_lost"
        else:
            matched_title = "Potential match for your found item"
            matched_message = f"We found a potential match for your found item '{matched_post.item_name}'. Someone reported losing a '{current_post.item_name}' with {int(similarity_score * 100)}% similarity."
            matched_type = "match_found"
            
        matched_notification = Notification(
            user_id=matched_user.id,
            title=matched_title,
            message=matched_message,
            type=matched_type,
            is_read=False,
            related_post_id=current_post.id
        )
        
        # Add notifications to database
        db.add(current_notification)
        db.add(matched_notification)
        db.commit()
        
        logger.info(f"Created match notifications for users {current_user.id} and {matched_user.id}")
        return current_notification, matched_notification
        
    except Exception as e:
        logger.error(f"Error creating match notifications: {str(e)}")
        db.rollback()
        return None, None
