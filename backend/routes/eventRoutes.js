const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const natural = require('natural');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer Storage Ayarları
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = './uploads/';
    if (!fs.existsSync(dir)){ fs.mkdirSync(dir); }
    cb(null, dir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// NLP Kosinüs Benzerliği Algoritması
function getCosineSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;
    const tokenizer = new natural.WordTokenizer();
    const vec1 = tokenizer.tokenize(text1.toLowerCase());
    const vec2 = tokenizer.tokenize(text2.toLowerCase());
    
    const vocab = Array.from(new Set([...vec1, ...vec2]));
    const tf1 = {}, tf2 = {};
    vocab.forEach(w => { tf1[w] = 0; tf2[w] = 0; });
    vec1.forEach(w => tf1[w]++);
    vec2.forEach(w => tf2[w]++);
    
    let dotProduct = 0, mag1 = 0, mag2 = 0;
    vocab.forEach(w => {
        dotProduct += tf1[w] * tf2[w];
        mag1 += tf1[w] * tf1[w];
        mag2 += tf2[w] * tf2[w];
    });
    if (mag1 === 0 || mag2 === 0) return 0;
    return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

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

      // 2. Kategori Uyumu (%30)
      if (user.interests && user.interests.includes(event.category)) {
        score += 30;
        matchDetails.push('İlgi Alanı');
      }

      // 3. YAPAY ZEKA DESTEKLİ: Semantik Yetenek Uyumu (%30)
      const userText = (user.skills || []).join(' ') + ' ' + (user.interests || []).join(' ');
      const eventText = event.title + ' ' + event.description;
      
      const similarity = getCosineSimilarity(userText, eventText); // 0 ile 1 arası
      const nlpScore = similarity * 30; // Max 30 puan
      
      if (nlpScore > 5) { // Threshold
          score += nlpScore;
          matchDetails.push(`Yapay Zeka (%${Math.round(nlpScore/30*100)} Eşleşme)`);
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

router.post('/', protect, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'Düzenleyici' && req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Not authorized to create event' });
  }
  const { title, description, date, category, locationName, lat, lng, requiredVolunteers } = req.body;
  let image = '';
  if (req.file) {
      image = `/uploads/${req.file.filename}`;
  }
  try {
    const event = new Event({
      title, description, date, category, locationName, lat, lng, requiredVolunteers, image, organizerId: req.user.id
    });
    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
