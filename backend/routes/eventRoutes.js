const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const { category, city, date } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (city) filter.locationName = { $regex: city, $options: 'i' };
    if (date) filter.date = { $gte: new Date(date) };

    const events = await Event.find(filter).populate('organizerId', 'name');
    res.json(events);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/recommendations', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { category, city, date } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (city) filter.locationName = { $regex: city, $options: 'i' };
    if (date) filter.date = { $gte: new Date(date) };

    const events = await Event.find(filter).populate('organizerId', 'name');
    
    // Uyum puanı hesaplama (0-100)
    let scoredEvents = events.map(event => {
      let score = 0;
      let matchDetails = [];

      // 1. Lokasyon Uyumu (%40)
      if (user.city && event.locationName.toLowerCase().includes(user.city.toLowerCase())) {
        score += 40;
        matchDetails.push('Lokasyon');
      }

      // 2. Kategori / İlgi Alanı Uyumu (%30)
      if (user.interests && user.interests.includes(event.category)) {
        score += 30;
        matchDetails.push('İlgi Alanı');
      }

      // 3. Yetenek Uyumu (%30)
      if (user.skills && user.skills.length > 0) {
        let hasSkillMatch = false;
        user.skills.forEach(skill => {
          if (event.description.toLowerCase().includes(skill.toLowerCase()) || 
              event.title.toLowerCase().includes(skill.toLowerCase())) {
            hasSkillMatch = true;
          }
        });
        if (hasSkillMatch) {
          score += 30;
          matchDetails.push('Yetenek');
        }
      }

      // Eğer hiçbiri uymuyorsa ama sistem yine de göstersin diyorsak minimum bir değer kalabilir
      // Biz puanı 0'dan büyük olanları filtreleyeceğiz veya sıfırları alta atacağız
      return {
        ...event.toObject(),
        matchScore: score,
        matchDetails
      };
    });

    // Puanı yüksek olanları en üste al
    scoredEvents.sort((a, b) => b.matchScore - a.matchScore);

    res.json(scoredEvents);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizerId', 'name email');
    if (event) res.json(event);
    else res.status(404).json({ message: 'Event not found' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/', protect, async (req, res) => {
  if (req.user.role !== 'Düzenleyici' && req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Not authorized to create event' });
  }
  const { title, description, date, category, locationName, lat, lng, requiredVolunteers } = req.body;
  try {
    const event = new Event({
      title, description, date, category, locationName, lat, lng, requiredVolunteers, organizerId: req.user.id
    });
    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
