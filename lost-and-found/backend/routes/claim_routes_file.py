from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from database import SessionLocal
from models.post import Post
from models.user import User
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
from fastapi.responses import JSONResponse
import json
import os
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/claims",
    tags=["claims"]
)

# File path for storing claims
CLAIMS_FILE = "backend/data/claims.json"
os.makedirs(os.path.dirname(CLAIMS_FILE), exist_ok=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_cors_headers(request: Request):
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*"
    }

# Helper functions for claims file
def load_claims():
    if not os.path.exists(CLAIMS_FILE):
        with open(CLAIMS_FILE, 'w') as f:
            json.dump([], f)
        return []
    
    try:
        with open(CLAIMS_FILE, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return []

def save_claims(claims):
    with open(CLAIMS_FILE, 'w') as f:
        json.dump(claims, f, indent=2, default=str)

class AnswerModel(BaseModel):
    question: str
    answer: str

class ClaimCreate(BaseModel):
    post_id: int
    user_id: str  # Firebase UID
    contact_info: str
    answers: List[Dict[str, str]]

class ClaimUpdate(BaseModel):
    status: str
    message: Optional[str] = None

@router.post("/")
async def create_claim(claim: ClaimCreate, db: Session = Depends(get_db), request: Request = None):
    try:
        # Find user by Firebase UID
        user = db.query(User).filter(User.firebase_uid == claim.user_id).first()
        if not user:
            logger.error(f"User not found with firebase_uid: {claim.user_id}")
            return JSONResponse(status_code=404, content={"detail": "User not found"}, headers=get_cors_headers(request))
        
        # Find post
        post = db.query(Post).filter(Post.id == claim.post_id).first()
        if not post:
            logger.error(f"Post not found with id: {claim.post_id}")
            return JSONResponse(status_code=404, content={"detail": "Post not found"}, headers=get_cors_headers(request))
        
        # Load existing claims
        claims = load_claims()
        
        # Create new claim
        new_claim = {
            "id": str(uuid.uuid4()),
            "post_id": claim.post_id,
            "user_id": user.id,
            "firebase_uid": claim.user_id,
            "contact_info": claim.contact_info,
            "answers": claim.answers,
            "status": "pending",
            "response_message": None,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "post": {
                "id": post.id,
                "item_name": post.item_name,
                "report_type": post.report_type,
                "image_path": post.image_path,
                "verification_questions": post.verification_questions
            },
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }
        
        claims.append(new_claim)
        save_claims(claims)
        
        logger.info(f"Claim created successfully for post {claim.post_id} by user {user.id}")
        return JSONResponse(content={
            "message": "Claim submitted successfully",
            "claim_id": new_claim["id"]
        }, headers=get_cors_headers(request))
        
    except Exception as e:
        logger.error(f"Error creating claim: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": f"Error creating claim: {str(e)}"}, headers=get_cors_headers(request))

@router.get("/user/{firebase_uid}")
async def get_user_claims(firebase_uid: str, db: Session = Depends(get_db), request: Request = None):
    try:
        # Find user by Firebase UID
        user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
        if not user:
            logger.error(f"User not found with firebase_uid: {firebase_uid}")
            return JSONResponse(status_code=404, content={"detail": "User not found"}, headers=get_cors_headers(request))
        
        # Load all claims
        all_claims = load_claims()
        
        # Get claims where user is the claimant
        submitted_claims = [claim for claim in all_claims if claim.get("firebase_uid") == firebase_uid]
        
        # Get posts where user is the owner
        user_posts = db.query(Post).filter(Post.user_id == user.id).all()
        post_ids = [post.id for post in user_posts]
        
        # Get claims for posts where user is the owner
        received_claims = [claim for claim in all_claims if claim.get("post_id") in post_ids]
        
        # Format response
        claims_data = []
        
        # Add submitted claims
        for claim in submitted_claims:
            claims_data.append({
                "id": claim["id"],
                "post_id": claim["post_id"],
                "post": claim.get("post"),
                "contact_info": claim["contact_info"],
                "answers": claim["answers"],
                "status": claim["status"],
                "response_message": claim["response_message"],
                "created_at": claim["created_at"],
                "updated_at": claim["updated_at"],
                "role": "claimant"  # User is the claimant
            })
        
        # Add received claims
        for claim in received_claims:
            claims_data.append({
                "id": claim["id"],
                "post_id": claim["post_id"],
                "post": claim.get("post"),
                "contact_info": claim["contact_info"],
                "answers": claim["answers"],
                "status": claim["status"],
                "response_message": claim["response_message"],
                "created_at": claim["created_at"],
                "updated_at": claim["updated_at"],
                "role": "owner",  # User is the post owner
                "claimant": claim.get("user")
            })
        
        logger.info(f"Retrieved {len(claims_data)} claims for user {firebase_uid}")
        return JSONResponse(content=claims_data, headers=get_cors_headers(request))
        
    except Exception as e:
        logger.error(f"Error fetching claims: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": f"Error fetching claims: {str(e)}"}, headers=get_cors_headers(request))

@router.put("/{claim_id}")
async def update_claim(claim_id: str, claim_update: ClaimUpdate, request: Request = None):
    try:
        # Load all claims
        claims = load_claims()
        
        # Find claim by ID
        claim_index = next((i for i, claim in enumerate(claims) if claim["id"] == claim_id), None)
        if claim_index is None:
            logger.error(f"Claim not found with id: {claim_id}")
            return JSONResponse(status_code=404, content={"detail": "Claim not found"}, headers=get_cors_headers(request))
        
        # Update claim
        claims[claim_index]["status"] = claim_update.status
        if claim_update.message:
            claims[claim_index]["response_message"] = claim_update.message
        claims[claim_index]["updated_at"] = datetime.now().isoformat()
        
        # Save updated claims
        save_claims(claims)
        
        logger.info(f"Claim {claim_id} updated to status: {claim_update.status}")
        return JSONResponse(content={
            "message": "Claim updated successfully",
            "claim": {
                "id": claims[claim_index]["id"],
                "status": claims[claim_index]["status"],
                "response_message": claims[claim_index]["response_message"]
            }
        }, headers=get_cors_headers(request))
        
    except Exception as e:
        logger.error(f"Error updating claim: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": f"Error updating claim: {str(e)}"}, headers=get_cors_headers(request))

@router.get("/{claim_id}")
async def get_claim(claim_id: str, request: Request = None):
    try:
        # Load all claims
        claims = load_claims()
        
        # Find claim by ID
        claim = next((c for c in claims if c["id"] == claim_id), None)
        if not claim:
            logger.error(f"Claim not found with id: {claim_id}")
            return JSONResponse(status_code=404, content={"detail": "Claim not found"}, headers=get_cors_headers(request))
        
        logger.info(f"Retrieved claim {claim_id}")
        return JSONResponse(content=claim, headers=get_cors_headers(request))
        
    except Exception as e:
        logger.error(f"Error fetching claim: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": f"Error fetching claim: {str(e)}"}, headers=get_cors_headers(request))
