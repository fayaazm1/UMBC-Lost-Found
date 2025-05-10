from fastapi import APIRouter, Request, Body
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import logging
import json
import os
from datetime import datetime
import uuid
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

router = APIRouter()

# File path for storing claims
CLAIMS_FILE = "backend/data/claims.json"
os.makedirs(os.path.dirname(CLAIMS_FILE), exist_ok=True)

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

class ClaimCreate(BaseModel):
    post_id: int
    user_id: str  # Firebase UID
    contact_info: str
    answers: List[Dict[str, str]]

class ClaimUpdate(BaseModel):
    status: str
    message: Optional[str] = None

@router.post("/api/claims/")
async def create_claim(claim: ClaimCreate, request: Request):
    try:
        # Load existing claims
        claims = load_claims()
        
        # Create new claim
        new_claim = {
            "id": str(uuid.uuid4()),
            "post_id": claim.post_id,
            "user_id": claim.user_id,
            "contact_info": claim.contact_info,
            "answers": claim.answers,
            "status": "pending",
            "response_message": None,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        claims.append(new_claim)
        save_claims(claims)
        
        logger.info(f"Claim created successfully for post {claim.post_id} by user {claim.user_id}")
        return JSONResponse(content={
            "message": "Claim submitted successfully",
            "claim_id": new_claim["id"]
        }, headers=get_cors_headers(request))
        
    except Exception as e:
        logger.error(f"Error creating claim: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": f"Error creating claim: {str(e)}"}, headers=get_cors_headers(request))

@router.get("/api/claims/user/{firebase_uid}")
async def get_user_claims(firebase_uid: str, request: Request):
    try:
        # Load all claims
        all_claims = load_claims()
        
        # Get claims where user is the claimant
        user_claims = [claim for claim in all_claims if claim.get("user_id") == firebase_uid]
        
        logger.info(f"Retrieved {len(user_claims)} claims for user {firebase_uid}")
        return JSONResponse(content=user_claims, headers=get_cors_headers(request))
        
    except Exception as e:
        logger.error(f"Error fetching claims: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": f"Error fetching claims: {str(e)}"}, headers=get_cors_headers(request))

@router.put("/api/claims/{claim_id}")
async def update_claim(claim_id: str, claim_update: ClaimUpdate, request: Request):
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

@router.get("/api/claims/{claim_id}")
async def get_claim(claim_id: str, request: Request):
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
