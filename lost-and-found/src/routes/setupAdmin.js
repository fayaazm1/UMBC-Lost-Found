const express = require('express');
const router = express.Router();
const User = require('../models/User');

// This endpoint should only be accessible during initial setup
// Make sure to disable it after creating your admin user
router.post('/setup-admin', async (req, res) => {
    try {
        const { email, setupKey } = req.body;

        // Verify the setup key matches your environment variable
        if (setupKey !== process.env.ADMIN_SETUP_KEY) {
            return res.status(401).json({ message: 'Invalid setup key' });
        }

        // Find the user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Set the user as admin
        user.isAdmin = true;
        await user.save();

        res.json({ 
            message: 'Admin user created successfully',
            user: {
                email: user.email,
                username: user.username,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('Error in setup-admin:', error);
        res.status(500).json({ message: 'Error setting up admin user' });
    }
});

module.exports = router;
