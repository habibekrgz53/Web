const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Models for Seeding
const User = require('./models/User');
const Event = require('./models/Event');
const Application = require('./models/Application');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

const seedDummyData = async () => {
    try {
        console.log('Seeding initial data into in-memory database...');
        const salt = await bcrypt.genSalt(10);
        const hashPwd = await bcrypt.hash('123456', salt);
    
        const admin = await User.create({ name: 'Admin', email: 'admin@test.com', password: hashPwd, role: 'Admin' });
        const organizer = await User.create({ name: 'Belediye STK', email: 'stk@test.com', password: hashPwd, role: 'Düzenleyici' });
        const volunteer = await User.create({ name: 'Ali Gönüllü', email: 'ali@test.com', password: hashPwd, role: 'Gönüllü', city: 'İstanbul' });
    
        const e1 = await Event.create({
          title: 'Sahil Temizliği', description: 'Gönüllüler ile birlikte sahilimizi temizliyoruz.', date: new Date('2026-05-10'),
          category: 'Çevre', locationName: 'Kadıköy Sahili', lat: 40.990, lng: 29.020, requiredVolunteers: 20, organizerId: organizer._id
        });
    
        const e2 = await Event.create({
          title: 'Kütüphane Düzenlemesi', description: 'Yeni gelen kitapların barkodlanması ve raflara yerleştirilmesi.', date: new Date('2026-05-12'),
          category: 'Eğitim', locationName: 'Şişli Merkez Kütüphanesi', lat: 41.060, lng: 28.987, requiredVolunteers: 5, organizerId: organizer._id
        });
        
        console.log('Initial data seeded successfully.');
    } catch (e) {
        console.error('Seed Error:', e);
    }
};

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/volunteer_match';
    let isMemory = false;
    
    // Yalnızca .env dosyasında USE_MEMORY_DB=true ise in-memory kullan
    if (process.env.USE_MEMORY_DB === 'true' || !uri) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      isMemory = true;
      console.log('Using in-memory MongoDB');
    }
    
    await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${uri}`);
    
    if (isMemory) {
        await seedDummyData();
    }
    
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.log(`Error connecting to DB: ${error.message}`);
  }
};

connectDB();
