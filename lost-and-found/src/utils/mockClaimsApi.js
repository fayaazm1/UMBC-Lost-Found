// mockClaimsApi.js
// This file provides a mock implementation of the claims API for testing purposes

import { getAuth } from 'firebase/auth';

// In-memory storage for claims
let claims = JSON.parse(localStorage.getItem('mockClaims') || '[]');

// Save claims to localStorage
const saveClaims = () => {
  localStorage.setItem('mockClaims', JSON.stringify(claims));
};

// Generate a unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Create a new claim
export const createClaim = async (claimData) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error('User must be logged in to create a claim');
  }

  const newClaim = {
    id: generateId(),
    post_id: claimData.post_id,
    user_id: currentUser.uid,
    contact_info: claimData.contact_info,
    answers: claimData.answers,
    status: 'pending',
    response_message: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  claims.push(newClaim);
  saveClaims();

  return { message: 'Claim submitted successfully', claim_id: newClaim.id };
};

// Get claims for a user
export const getUserClaims = async (userId) => {
  // Filter claims where user is the claimant
  const userClaims = claims.filter(claim => claim.user_id === userId);
  
  // Add role property to each claim
  return userClaims.map(claim => ({
    ...claim,
    role: 'claimant'
  }));
};

// Update a claim
export const updateClaim = async (claimId, updateData) => {
  const claimIndex = claims.findIndex(claim => claim.id === claimId);
  
  if (claimIndex === -1) {
    throw new Error('Claim not found');
  }
  
  claims[claimIndex] = {
    ...claims[claimIndex],
    status: updateData.status,
    response_message: updateData.message || claims[claimIndex].response_message,
    updated_at: new Date().toISOString()
  };
  
  saveClaims();
  
  return {
    message: 'Claim updated successfully',
    claim: {
      id: claims[claimIndex].id,
      status: claims[claimIndex].status,
      response_message: claims[claimIndex].response_message
    }
  };
};

// Get a specific claim
export const getClaim = async (claimId) => {
  const claim = claims.find(claim => claim.id === claimId);
  
  if (!claim) {
    throw new Error('Claim not found');
  }
  
  return claim;
};
