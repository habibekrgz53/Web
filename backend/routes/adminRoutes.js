const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const { protect } = require('../middleware/authMiddleware');

const adminCheck = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

router.get('/stats', protect, adminCheck, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalVolunteers = await User.countDocuments({ role: 'Gönüllü' });
    const totalOrganizers = await User.countDocuments({ role: 'Düzenleyici' });
    const totalEvents = await Event.countDocuments({});
    
    // Etkinlik kategorisi dağılımı
    const events = await Event.find({});
    const categoryCounts = {};
    events.forEach(e => {
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    });

    const Application = require('../models/Application');
    const totalApplications = await Application.countDocuments({});
    const appStats = {
      approved: await Application.countDocuments({ status: 'Onaylandı' }),
      pending: await Application.countDocuments({ status: 'Bekliyor' }),
      rejected: await Application.countDocuments({ status: 'Reddedildi' })
    };

    res.json({
      totalUsers,
      totalVolunteers,
      totalOrganizers,
      totalEvents,
      totalApplications,
      categoryCounts,
      appStats
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/users', protect, adminCheck, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.delete('/users/:id', protect, adminCheck, async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: 'User removed' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

router.delete('/events/:id', protect, adminCheck, async (req, res) => {
    try {
      await Event.findByIdAndDelete(req.params.id);
      res.json({ message: 'Event removed' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
