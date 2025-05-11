const express = require('express');
const User = require('../models/User_model');
const router = express.Router();

// Add a user
router.post('/add', async (req, res) => {
    const { name, employeeId, role, email } = req.body;

    const newUser = new User({
        name,
        employeeId,
        role,
        email
    });

    try {
        await newUser.save();
        res.status(201).send("User added successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding user");
    }
});

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        console.log("user",users)
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching users");
    }
});

// Get a specific user
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).send("User not found");
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching user");
    }
});

/// Update a user
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { name, employeeId, role, email } = req.body;

    // Validate input
    if (!name || !employeeId || !role || !email) {
        return res.status(400).send("All fields are required");
    }

    try {
        await User.findByIdAndUpdate(id, {
            name,
            employeeId,
            role,
            email
        });
        res.status(200).send("User updated successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating user");
    }
});

// Delete a user
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await User.findByIdAndDelete(id);
        res.status(200).send("User deleted successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting user");
    }  
}
);

// Get password for a specific user
router.get('/password/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).send("User not found");
        
        // Return the password directly
        // Note: In a real production environment, you should NEVER do this
        // This is highly insecure and just for development/demonstration purposes
        res.status(200).json({ password: user.password });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching user password");
    }
});

module.exports = router;
