const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.city = req.body.city || user.city;
    user.skills = req.body.skills || user.skills;
    user.interests = req.body.interests || user.interests;
    user.availability = req.body.availability || user.availability;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.occupation = req.body.occupation !== undefined ? req.body.occupation : user.occupation;
    user.gender = req.body.gender !== undefined ? req.body.gender : user.gender;
    user.birthDate = req.body.birthDate !== undefined ? req.body.birthDate : user.birthDate;

    if (req.body.password) {
       const bcrypt = require('bcryptjs');
       const salt = await bcrypt.genSalt(10);
       user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();
    
    // JWT yeniden yaratmaya gerek yok genel profil güncellemeleri için
    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        city: updatedUser.city,
        skills: updatedUser.skills,
        interests: updatedUser.interests,
        availability: updatedUser.availability,
        bio: updatedUser.bio,
        phone: updatedUser.phone,
        occupation: updatedUser.occupation,
        gender: updatedUser.gender,
        birthDate: updatedUser.birthDate
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
