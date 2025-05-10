from fastapi import APIRouter, HTTPException, Depends, Request, Body
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import logging
from fastapi.responses import JSONResponse
from config.mongodb import claims, posts, users
from bson import ObjectId
import datetime
import json

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/claims",
    tags=["claims"]
)

def get_cors_headers(request: Request):
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*"
    }

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

# Helper function to convert ObjectId to string
def serialize_doc(doc):
    if doc.get('_id'):
        doc['id'] = str(doc['_id'])
        del doc['_id']
    return doc

@router.post("/")
async def create_claim(claim: ClaimCreate, request: Request = None):
    try:
        # Find user by Firebase UID
        user = await users.find_one({"firebase_uid": claim.user_id})
        if not user:
            logger.error(f"User not found with firebase_uid: {claim.user_id}")
            return JSONResponse(status_code=404, content={"detail": "User not found"}, headers=get_cors_headers(request))
        
        # Find post
        post = await posts.find_one({"id": claim.post_id})
        if not post:
            logger.error(f"Post not found with id: {claim.post_id}")
            return JSONResponse(status_code=404, content={"detail": "Post not found"}, headers=get_cors_headers(request))
        
        # Create new claim
        new_claim = {
            "post_id": claim.post_id,
            "user_id": user.get("id"),
            "firebase_uid": claim.user_id,
            "contact_info": claim.contact_info,
            "answers": claim.answers,
            "status": "pending",
            "response_message": None,
            "created_at": datetime.datetime.now(),
            "updated_at": datetime.datetime.now(),
            "post_data": {
                "id": post.get("id"),
                "item_name": post.get("item_name"),
                "report_type": post.get("report_type"),
                "image_path": post.get("image_path"),
                "verification_questions": post.get("verification_questions")
            },
            "user_data": {
                "id": user.get("id"),
                "username": user.get("username"),
                "email": user.get("email")
            }
        }
        
        result = await claims.insert_one(new_claim)
        new_claim_id = str(result.inserted_id)
        
        logger.info(f"Claim created successfully for post {claim.post_id} by user {claim.user_id}")
        return JSONResponse(content={
            "message": "Claim submitted successfully",
            "claim_id": new_claim_id
        }, headers=get_cors_headers(request))
        
    except Exception as e:
        logger.error(f"Error creating claim: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": f"Error creating claim: {str(e)}"}, headers=get_cors_headers(request))

@router.get("/user/{firebase_uid}")
async def get_user_claims(firebase_uid: str, request: Request = None):
    try:
        # Find user by Firebase UID
        user = await users.find_one({"firebase_uid": firebase_uid})
        if not user:
            logger.error(f"User not found with firebase_uid: {firebase_uid}")
            return JSONResponse(status_code=404, content={"detail": "User not found"}, headers=get_cors_headers(request))
        
        # Get claims where user is the claimant
        submitted_claims_cursor = claims.find({"firebase_uid": firebase_uid})
        submitted_claims = []
        async for claim in submitted_claims_cursor:
            claim = serialize_doc(claim)
            claim["role"] = "claimant"  # User is the claimant
            submitted_claims.append(claim)
        
        # Get posts where user is the owner
        user_posts_cursor = posts.find({"user_id": user.get("id")})
        post_ids = []
        async for post in user_posts_cursor:
            post_ids.append(post.get("id"))
        
        # Get claims for posts where user is the owner
        received_claims = []
        if post_ids:
            received_claims_cursor = claims.find({"post_id": {"$in": post_ids}})
            async for claim in received_claims_cursor:
                claim = serialize_doc(claim)
                claim["role"] = "owner"  # User is the post owner
                received_claims.append(claim)
        
        # Combine claims
        all_claims = submitted_claims + received_claims
        
        logger.info(f"Retrieved {len(all_claims)} claims for user {firebase_uid}")
        return JSONResponse(content=all_claims, headers=get_cors_headers(request))
        
    except Exception as e:
        logger.error(f"Error fetching claims: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": f"Error fetching claims: {str(e)}"}, headers=get_cors_headers(request))

@router.put("/{claim_id}")
async def update_claim(claim_id: str, claim_update: ClaimUpdate, request: Request = None):
    try:
        # Convert string ID to ObjectId
        obj_id = ObjectId(claim_id)
        
        # Find claim by ID
        claim = await claims.find_one({"_id": obj_id})
        if not claim:
            logger.error(f"Claim not found with id: {claim_id}")
            return JSONResponse(status_code=404, content={"detail": "Claim not found"}, headers=get_cors_headers(request))
        
        # Update claim
        update_data = {
            "status": claim_update.status,
            "updated_at": datetime.datetime.now()
        }
        
        if claim_update.message:
            update_data["response_message"] = claim_update.message
        
        await claims.update_one(
            {"_id": obj_id},
            {"$set": update_data}
        )
        
        logger.info(f"Claim {claim_id} updated to status: {claim_update.status}")
        return JSONResponse(content={
            "message": "Claim updated successfully",
            "claim": {
                "id": claim_id,
                "status": claim_update.status,
                "response_message": claim_update.message
            }
        }, headers=get_cors_headers(request))
        
    except Exception as e:
        logger.error(f"Error updating claim: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": f"Error updating claim: {str(e)}"}, headers=get_cors_headers(request))

@router.get("/{claim_id}")
async def get_claim(claim_id: str, request: Request = None):
    try:
        # Convert string ID to ObjectId
        obj_id = ObjectId(claim_id)
        
        # Find claim by ID
        claim = await claims.find_one({"_id": obj_id})
        if not claim:
            logger.error(f"Claim not found with id: {claim_id}")
            return JSONResponse(status_code=404, content={"detail": "Claim not found"}, headers=get_cors_headers(request))
        
        # Serialize document (convert ObjectId to string)
        claim = serialize_doc(claim)
        
        logger.info(f"Retrieved claim {claim_id}")
        return JSONResponse(content=claim, headers=get_cors_headers(request))
        
    except Exception as e:
        logger.error(f"Error fetching claim: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": f"Error fetching claim: {str(e)}"}, headers=get_cors_headers(request))
