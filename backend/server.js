const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const path = require('path');

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
app.set('trust proxy', 1); // Render gibi Cloud sistemlerde Load Balancer IP'sini atlayıp gerçek kullanıcıyı bulması için zorunlu

// Güvenlik Katmanları (Security)
app.use(helmet()); // HTTP Başlık Koruması
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Resimlerin frontend'de görünmesi için
// app.use(mongoSanitize()); // NOT: Express 5'te req.query salt-okunur (getter) olduğu için bu eklenti hata veriyor, kapatıldı.
// app.use(xss()); // NOT: Express 5 uyumsuzluğu (req.query getter) nedeniyle kapatıldı.

// Rate Limiting (DDoS / Brute Force Koruması)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 dakika
  max: 100 // IP başına limit
});
app.use(limiter);

app.use(cors());
app.use(express.json());

// Resim Yüklemeleri için Statik Klasör
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    // Sadece gerçek veritabanı (MongoDB Atlas veya Local)
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/volunteer_match_prod';
    
    await mongoose.connect(uri);
    console.log(`Gerçek MongoDB Veritabanına Bağlanıldı: ${uri}`);
    
    // Uygulama ilk açıldığında admin yoksa oluştur
    const adminExists = await User.findOne({ role: 'Admin' });
    if(!adminExists) {
         await seedDummyData();
    }
    
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.log(`Error connecting to DB: ${error.message}`);
  }
};

connectDB();
