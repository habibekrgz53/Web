const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { fakerTR } = require('@faker-js/faker');
const dotenv = require('dotenv');

const User = require('./models/User');
const Event = require('./models/Event');
const Application = require('./models/Application');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/volunteer_match_prod';

const categories = ['Çevre & Doğa', 'Eğitim', 'Sağlık', 'Hayvan Hakları', 'Afet Yardımı', 'Kültür & Sanat'];
const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Hatay', 'Gaziantep', 'Trabzon', 'Eskişehir', 'Kocaeli'];
const skillsPool = ['İletişim', 'İlk Yardım', 'Python', 'Öğretmenlik', 'Şoförlük', 'Lojistik', 'Aşçılık', 'Çeviri', 'Grafik Tasarım', 'Organizasyon', 'Rehberlik', 'Web Geliştirme', 'Arama Kurtarma', 'Çadır Kurma'];
const interestsPool = ['Eğitim', 'Teknoloji', 'Doğa', 'Çocuklar', 'Yaşlı Bakımı', 'Sokak Hayvanları', 'Spor', 'Sanat', 'Kriz Yönetimi'];

const generateArray = (pool, min, max) => {
    const count = fakerTR.number.int({ min, max });
    const result = [];
    while (result.length < count) {
        const item = fakerTR.helpers.arrayElement(pool);
        if (!result.includes(item)) result.push(item);
    }
    return result;
};

const runSeed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Baglantisi Basarili! Temizleme basliyor...');

        await User.deleteMany();
        await Event.deleteMany();
        await Application.deleteMany();

        const salt = await bcrypt.genSalt(10);
        // Admin ve Demo (Jüri şovu) için bilinen güçlü şifre
        const adminHashPwd = await bcrypt.hash('Volunteer2026!', salt);
        // 1000 Gönüllü için bilinemez rastgele şifre
        const fakeHashPwd = await bcrypt.hash('C0mpl3x!P@ss' + Date.now(), salt);

        // 1. Admin
        await User.create({ name: 'Sistem Yöneticisi', email: 'admin@test.com', password: adminHashPwd, role: 'Admin' });

        // 2. Gerçekçi STK'lar
        const ngos = [
            { name: 'TEMA Vakfı', email: 'tema@test.com' },
            { name: 'LÖSEV', email: 'losev@test.com' },
            { name: 'AFAD', email: 'afad@test.com' },
            { name: 'Kızılay', email: 'kizilay@test.com' },
            { name: 'TEGV', email: 'tegv@test.com' }
        ];
        const createdNgos = [];
        for (let ngo of ngos) {
            const org = await User.create({ name: ngo.name, email: ngo.email, password: adminHashPwd, role: 'Düzenleyici', city: 'İstanbul' });
            createdNgos.push(org);
        }

        // 3. Demo Gönüllü (ŞOV İÇİN)
        const demoUser = await User.create({
            name: 'Ahmet Demo',
            email: 'demo@test.com',
            password: adminHashPwd,
            role: 'Gönüllü',
            city: 'İstanbul',
            skills: ['Python', 'Öğretmenlik'],
            interests: ['Eğitim', 'Teknoloji']
        });

        // 4. 1000 Gönüllü
        console.log('1000 Rastgele Gönüllü uretiliyor...');
        const volunteerDocs = [];
        for (let i = 0; i < 999; i++) {
            volunteerDocs.push({
                name: fakerTR.person.fullName(),
                email: fakerTR.internet.email(),
                password: fakeHashPwd,
                role: 'Gönüllü',
                city: fakerTR.helpers.arrayElement(cities),
                skills: generateArray(skillsPool, 1, 4),
                interests: generateArray(interestsPool, 1, 3),
                bio: fakerTR.lorem.sentence()
            });
        }
        const createdVolunteers = await User.insertMany(volunteerDocs);
        const allVolunteers = [...createdVolunteers, demoUser];

        // 5. Demo Etkinlik (TEGV Robotik Kodlama - ŞOV İÇİN)
        const tegv = createdNgos.find(n => n.name === 'TEGV');
        const demoEvent = await Event.create({
            title: 'Çocuklar İçin Robotik Kodlama ve Python Eğitim Atölyesi',
            description: 'İlköğretim seviyesindeki dezavantajlı çocuklarımız için teknoloji atölyesi düzenliyoruz. Python programlama diline hakim, öğretmenlik yeteneği olan gönüllü eğitmenler arıyoruz.',
            date: fakerTR.date.future(),
            category: 'Eğitim',
            locationName: 'İstanbul, Şişli TEGV Parkı',
            lat: 41.060,
            lng: 28.987,
            image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
            requiredVolunteers: 5,
            organizerId: tegv._id
        });

        // 6. 299 Gerçekçi Etkinlik
        console.log('299 Rastgele Etkinlik uretiliyor...');
        const eventDocs = [];
        for (let i = 0; i < 299; i++) {
            const org = fakerTR.helpers.arrayElement(createdNgos);
            let cat = 'Eğitim';
            if(org.name === 'TEMA Vakfı') cat = 'Çevre & Doğa';
            else if(org.name === 'LÖSEV') cat = 'Sağlık';
            else if(org.name === 'AFAD' || org.name === 'Kızılay') cat = 'Afet Yardımı';

            eventDocs.push({
                title: fakerTR.lorem.words(4) + ' Etkinliği',
                description: fakerTR.lorem.paragraph(),
                date: fakerTR.date.future(),
                category: cat,
                locationName: fakerTR.helpers.arrayElement(cities) + ' Merkezi',
                lat: fakerTR.location.latitude({ min: 36, max: 42 }),
                lng: fakerTR.location.longitude({ min: 26, max: 44 }),
                image: `https://picsum.photos/seed/${fakerTR.string.alphanumeric(5)}/800/400`,
                requiredVolunteers: fakerTR.number.int({ min: 5, max: 50 }),
                organizerId: org._id
            });
        }
        const createdEvents = await Event.insertMany(eventDocs);
        const allEvents = [...createdEvents, demoEvent];

        // 7. 2500 Başvuru
        console.log('2500 Rastgele Basvuru uretiliyor...');
        const appDocs = [];
        const statuses = ['Bekliyor', 'Onaylandı', 'Reddedildi'];
        
        for (let i = 0; i < 2500; i++) {
            const randomVol = fakerTR.helpers.arrayElement(allVolunteers);
            const randomEv = fakerTR.helpers.arrayElement(allEvents);
            appDocs.push({
                volunteerId: randomVol._id,
                eventId: randomEv._id,
                status: fakerTR.helpers.arrayElement(statuses)
            });
        }
        await Application.insertMany(appDocs);

        console.log('TUM VERILER BASARIYLA YUKLENDI! ✅');
        process.exit();
    } catch (err) {
        console.error('Seed Hatasi:', err);
        process.exit(1);
    }
};

runSeed();
