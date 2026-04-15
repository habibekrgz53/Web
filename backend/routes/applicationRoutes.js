const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const { protect } = require('../middleware/authMiddleware');

router.post('/:eventId', protect, async (req, res) => {
  if (req.user.role !== 'Gönüllü') {
    return res.status(403).json({ message: 'Sadece gönüllüler başvurabilir' });
  }
  try {
    const exists = await Application.findOne({ eventId: req.params.eventId, volunteerId: req.user.id });
    if (exists) return res.status(400).json({ message: 'Zaten başvurdunuz' });

    const app = new Application({ eventId: req.params.eventId, volunteerId: req.user.id });
    const createdApp = await app.save();
    res.status(201).json(createdApp);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role === 'Gönüllü') {
        const apps = await Application.find({ volunteerId: req.user.id }).populate('eventId');
        return res.json(apps);
    } else if (req.user.role === 'Düzenleyici') {
        const Event = require('../models/Event');
        // Find events owned by this organizer
        const events = await Event.find({ organizerId: req.user.id }).select('_id');
        const eventIds = events.map(e => e._id);
        
        // Find applications for these events
        const apps = await Application.find({ eventId: { $in: eventIds } })
            .populate('eventId', 'title locationName date')
            .populate('volunteerId', 'name email city skills availability');
            
        return res.json(apps);
    } else {
        const apps = await Application.find({}).populate('eventId');
        return res.json(apps);
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put('/:id/status', protect, async (req, res) => {
  if (req.user.role !== 'Düzenleyici' && req.user.role !== 'Admin') {
     return res.status(403).json({ message: 'Yetkisiz işlem' });
  }
  try {
     const app = await Application.findById(req.params.id);
     if (!app) return res.status(404).json({ message: 'Başvuru bulunamadı' });
     
     app.status = req.body.status;
     await app.save();
     res.json(app);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
