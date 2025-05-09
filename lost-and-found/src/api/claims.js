// API routes for handling item claims
const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { authenticateToken } = require('../middleware/auth');
const { sendNotification } = require('../utils/notifications');

// Create a new claim
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { post_id, user_id, contact_info, answers } = req.body;
    
    if (!post_id || !user_id || !contact_info) {
      return res.status(400).json({ 
        detail: 'Missing required fields: post_id, user_id, and contact_info are required' 
      });
    }

    // Get the post to check verification questions
    const postDoc = await db.collection('posts').doc(post_id).get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ detail: 'Post not found' });
    }
    
    const post = postDoc.data();
    
    // Check if this is a found post
    if (post.report_type.toLowerCase() !== 'found') {
      return res.status(400).json({ 
        detail: 'Claims can only be made on found items' 
      });
    }
    
    // Check if the user is trying to claim their own post
    if (post.user_id === user_id) {
      return res.status(400).json({ 
        detail: 'You cannot claim your own post' 
      });
    }
    
    // Create the claim
    const claimData = {
      post_id,
      user_id,
      contact_info,
      answers: answers || [],
      post_owner_id: post.user_id,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add the claim to the database
    const claimRef = await db.collection('claims').add(claimData);
    
    // Send notification to the post owner
    await sendNotification({
      user_id: post.user_id,
      title: 'New Claim',
      message: `Someone has claimed your found item: ${post.item_name}`,
      type: 'claim',
      link: `/claims/${claimRef.id}`,
      created_at: new Date().toISOString()
    });
    
    // Return the claim ID
    return res.status(201).json({ 
      id: claimRef.id,
      message: 'Claim submitted successfully' 
    });
  } catch (error) {
    console.error('Error creating claim:', error);
    return res.status(500).json({ 
      detail: 'Failed to create claim' 
    });
  }
});

// Get claims for a user (either as claimant or post owner)
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get claims where user is the claimant
    const claimantSnapshot = await db.collection('claims')
      .where('user_id', '==', userId)
      .get();
    
    // Get claims where user is the post owner
    const ownerSnapshot = await db.collection('claims')
      .where('post_owner_id', '==', userId)
      .get();
    
    const claims = [];
    
    // Process claimant claims
    claimantSnapshot.forEach(doc => {
      claims.push({
        id: doc.id,
        ...doc.data(),
        role: 'claimant'
      });
    });
    
    // Process owner claims
    ownerSnapshot.forEach(doc => {
      claims.push({
        id: doc.id,
        ...doc.data(),
        role: 'owner'
      });
    });
    
    // Sort by creation date (newest first)
    claims.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return res.status(200).json(claims);
  } catch (error) {
    console.error('Error getting claims:', error);
    return res.status(500).json({ 
      detail: 'Failed to get claims' 
    });
  }
});

// Get a specific claim
router.get('/:claimId', authenticateToken, async (req, res) => {
  try {
    const { claimId } = req.params;
    
    const claimDoc = await db.collection('claims').doc(claimId).get();
    
    if (!claimDoc.exists) {
      return res.status(404).json({ detail: 'Claim not found' });
    }
    
    const claim = claimDoc.data();
    
    // Get the post details
    const postDoc = await db.collection('posts').doc(claim.post_id).get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ detail: 'Post not found' });
    }
    
    const post = postDoc.data();
    
    // Return the claim with post details
    return res.status(200).json({
      id: claimDoc.id,
      ...claim,
      post: {
        id: postDoc.id,
        ...post
      }
    });
  } catch (error) {
    console.error('Error getting claim:', error);
    return res.status(500).json({ 
      detail: 'Failed to get claim' 
    });
  }
});

// Update a claim (approve/reject)
router.put('/:claimId', authenticateToken, async (req, res) => {
  try {
    const { claimId } = req.params;
    const { status, message } = req.body;
    const userId = req.user.uid;
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        detail: 'Status must be either "approved" or "rejected"' 
      });
    }
    
    const claimDoc = await db.collection('claims').doc(claimId).get();
    
    if (!claimDoc.exists) {
      return res.status(404).json({ detail: 'Claim not found' });
    }
    
    const claim = claimDoc.data();
    
    // Check if the user is the post owner
    if (claim.post_owner_id !== userId) {
      return res.status(403).json({ 
        detail: 'Only the post owner can update a claim' 
      });
    }
    
    // Update the claim
    await db.collection('claims').doc(claimId).update({
      status,
      response_message: message || '',
      updated_at: new Date().toISOString()
    });
    
    // Send notification to the claimant
    await sendNotification({
      user_id: claim.user_id,
      title: `Claim ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your claim for the item has been ${status}${message ? `: ${message}` : ''}`,
      type: 'claim_update',
      link: `/claims/${claimId}`,
      created_at: new Date().toISOString()
    });
    
    return res.status(200).json({ 
      message: `Claim ${status} successfully` 
    });
  } catch (error) {
    console.error('Error updating claim:', error);
    return res.status(500).json({ 
      detail: 'Failed to update claim' 
    });
  }
});

module.exports = router;
