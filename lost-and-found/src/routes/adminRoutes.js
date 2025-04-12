const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check against admin credentials from environment variables
        if (username !== process.env.ADMIN_USERNAME || 
            password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate admin token
        const token = jwt.sign(
            { isAdmin: true },
            process.env.ADMIN_JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all posts
router.get('/posts', adminAuth, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username email')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts' });
    }
});

// Delete a post
router.delete('/posts/:id', adminAuth, async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        // Also delete associated comments
        await Comment.deleteMany({ post: req.params.id });
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post' });
    }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Delete a user
router.delete('/users/:id', adminAuth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        // Delete all posts and comments by this user
        await Post.deleteMany({ author: req.params.id });
        await Comment.deleteMany({ author: req.params.id });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// Get all comments
router.get('/comments', adminAuth, async (req, res) => {
    try {
        const comments = await Comment.find()
            .populate('author', 'username')
            .populate('post', 'title')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments' });
    }
});

// Delete a comment
router.delete('/comments/:id', adminAuth, async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting comment' });
    }
});

module.exports = router;
