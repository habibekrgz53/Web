const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');
const Application = require('./models/Application');

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/volunteer_match');
    console.log('MongoDB Connected for Seeding...');

    await User.deleteMany();
    await Event.deleteMany();
    await Application.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const hashPwd = await bcrypt.hash('123456', salt);

    // --- GERÇEKÇİ KULLANICILAR (USERS) ---
    const admin = await User.create({ 
      name: 'Sistem Yöneticisi', email: 'admin@test.com', password: hashPwd, role: 'Admin', isVerified: true 
    });
    
    // Düzenleyiciler (Organizers)
    const tema = await User.create({ 
      name: 'TEMA Vakfı', email: 'tema@test.com', password: hashPwd, role: 'Düzenleyici', city: 'İstanbul', 
      bio: 'Türkiye Erezyonla Mücadele, Ağaçlandırma ve Doğal Varlıkları Koruma Vakfı.', isVerified: true 
    });
    const losev = await User.create({ 
      name: 'LÖSEV', email: 'losev@test.com', password: hashPwd, role: 'Düzenleyici', city: 'Ankara', 
      bio: 'Lösemili Çocuklar Sağlık ve Eğitim Vakfı. Lösemili çocuklara sağlık ve eğitim desteği sağlar.', isVerified: true 
    });
    const kizilay = await User.create({ 
      name: 'Türk Kızılayı', email: 'kizilay@test.com', password: hashPwd, role: 'Düzenleyici', city: 'İzmir', 
      bio: 'Afet müdahalesi, kan bağışı, sosyal yardımlar ve lojistik destek sunan insani yardım kuruluşu.', isVerified: true 
    });
    const haytap = await User.create({
      name: 'HAYTAP', email: 'haytap@test.com', password: hashPwd, role: 'Düzenleyici', city: 'İstanbul',
      bio: 'Hayvan Hakları Federasyonu. Sahipsiz ve bakıma muhtaç sokak hayvanları için çalışır.', isVerified: true
    });
    const akut = await User.create({
      name: 'AKUT', email: 'akut@test.com', password: hashPwd, role: 'Düzenleyici', city: 'İstanbul',
      bio: 'Doğal afetlerde ve acil durumlarda arama kurtarma çalışmaları yürüten gönüllü sivil toplum kuruluşu.', isVerified: true
    });
    const unicef = await User.create({
      name: 'UNICEF Türkiye', email: 'unicef@test.com', password: hashPwd, role: 'Düzenleyici', city: 'Ankara',
      bio: 'Birleşmiş Milletler Çocuklara Yardım Fonu. Dünya çapında çocuk haklarını savunur.', isVerified: true
    });
    const tegv = await User.create({
      name: 'TEGV', email: 'tegv@test.com', password: hashPwd, role: 'Düzenleyici', city: 'İstanbul',
      bio: 'Türkiye Eğitim Gönüllüleri Vakfı. İlköğretim çağındaki çocuklara eğitim desteği verir.', isVerified: true
    });

    // Gönüllüler (Volunteers)
    const ahmet = await User.create({ 
      name: 'Ahmet Yılmaz', email: 'ahmet@test.com', password: hashPwd, role: 'Gönüllü', city: 'İstanbul', 
      skills: ['İlk Yardım', 'İletişim', 'Organizasyon', 'Proje Yönetimi'], 
      interests: ['Çevre & Doğa', 'Afet Yardımı', 'Sağlık'], 
      bio: 'Boğaziçi Üniversitesi Çevre Mühendisliği bölümünde yüksek lisans yapıyorum. Çevre bilinci ve afet lojistiği konularında uzmanım.',
      phone: '0532 111 2233', occupation: 'Öğrenci', gender: 'Erkek', birthDate: new Date('1998-04-15'), isVerified: true 
    });
    const ayse = await User.create({ 
      name: 'Ayşe Kaya', email: 'ayse@test.com', password: hashPwd, role: 'Gönüllü', city: 'İstanbul', 
      skills: ['Eğitmenlik', 'Çocuk Gelişimi', 'El Sanatları'], 
      interests: ['Eğitim', 'Çocuklar', 'Kültür & Sanat'], 
      bio: 'Emekli sınıf öğretmeniyim. Hayatımı çocukların eğitimine ve gelişimine adadım.',
      phone: '0543 222 3344', occupation: 'Emekli Öğretmen', gender: 'Kadın', birthDate: new Date('1965-09-22'), isVerified: true 
    });
    const mehmet = await User.create({ 
      name: 'Mehmet Demir', email: 'mehmet@test.com', password: hashPwd, role: 'Gönüllü', city: 'İzmir', 
      skills: ['Lojistik', 'İlk Yardım', 'Şoförlük', 'Kriz Yönetimi'], 
      interests: ['Sağlık', 'Afet Yardımı', 'Hayvan Hakları'], 
      bio: '15 yıllık lojistik tecrübem var. Kriz anlarında hızlı kararlar alıp malzeme sevkıyatlarını organize edebilirim.',
      phone: '0555 333 4455', occupation: 'Lojistik Uzmanı', gender: 'Erkek', birthDate: new Date('1985-11-05'), isVerified: true 
    });
    const elif = await User.create({ 
      name: 'Elif Şahin', email: 'elif@test.com', password: hashPwd, role: 'Gönüllü', city: 'İstanbul', 
      skills: ['Sosyal Medya', 'Fotoğrafçılık', 'Tasarım', 'Video Kurgu'], 
      interests: ['Hayvan Hakları', 'Çevre & Doğa', 'Kültür & Sanat'], 
      bio: 'Grafik tasarım ajansında art direktörüm. Sosyal sorumluluk projelerinin görsel iletişimini ve sosyal medya kampanyalarını yönetmekten keyif alıyorum.',
      phone: '0535 444 5566', occupation: 'Art Direktör', gender: 'Kadın', birthDate: new Date('1995-07-30'), isVerified: true 
    });
    const can = await User.create({ 
      name: 'Can Yücel', email: 'can@test.com', password: hashPwd, role: 'Gönüllü', city: 'Ankara', 
      skills: ['Yazılım', 'Veri Analizi', 'İngilizce'], 
      interests: ['Teknoloji', 'Eğitim', 'Çocuklar'], 
      bio: 'Yazılım mühendisiyim. Özellikle çocuklara kodlama eğitimleri vermek ve STK’ların dijital altyapılarına destek olmak istiyorum.',
      phone: '0544 555 6677', occupation: 'Yazılım Mühendisi', gender: 'Erkek', birthDate: new Date('1992-02-14'), isVerified: true 
    });

    // Otomatik 50 Ekstra Rastgele Gönüllü Üretimi
    const firstNames = ['Ali', 'Veli', 'Ayşe', 'Fatma', 'Zeynep', 'Can', 'Cem', 'Burcu', 'Derya', 'Efe', 'Gizem', 'Hakan', 'İpek', 'Kerem', 'Leyla', 'Murat', 'Naz', 'Eren', 'Seda', 'Onur'];
    const lastNames = ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek'];
    const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Kocaeli', 'Gümüşhane', 'Trabzon'];
    const allSkills = ['İlk Yardım', 'İletişim', 'Organizasyon', 'Proje Yönetimi', 'Eğitmenlik', 'Çocuk Gelişimi', 'El Sanatları', 'Lojistik', 'Şoförlük', 'Kriz Yönetimi', 'Sosyal Medya', 'Fotoğrafçılık', 'Tasarım', 'Video Kurgu', 'Yazılım', 'Veri Analizi', 'İngilizce'];
    const allInterests = ['Çevre & Doğa', 'Afet Yardımı', 'Sağlık', 'Eğitim', 'Çocuklar', 'Kültür & Sanat', 'Hayvan Hakları', 'Teknoloji', 'İnsan Hakları'];

    const randomUsers = [];
    for(let i=1; i<=50; i++) {
      const fn = firstNames[Math.floor(Math.random()*firstNames.length)];
      const ln = lastNames[Math.floor(Math.random()*lastNames.length)];
      const cty = cities[Math.floor(Math.random()*cities.length)];
      
      const sCount = Math.floor(Math.random() * 3) + 1;
      const uSkills = [];
      for(let j=0; j<sCount; j++) uSkills.push(allSkills[Math.floor(Math.random()*allSkills.length)]);
      
      const iCount = Math.floor(Math.random() * 3) + 1;
      const uInterests = [];
      for(let j=0; j<iCount; j++) uInterests.push(allInterests[Math.floor(Math.random()*allInterests.length)]);

      randomUsers.push({
        name: `${fn} ${ln}`,
        email: `gonullu${i}@test.com`,
        password: hashPwd,
        role: 'Gönüllü',
        city: cty,
        skills: [...new Set(uSkills)],
        interests: [...new Set(uInterests)],
        bio: `${cty} şehrinde yaşıyorum. Sosyal sorumluluk projelerine aktif olarak katılmak ve elimden gelen desteği vermek istiyorum.`,
        phone: '05' + Math.floor(10000000 + Math.random() * 90000000),
        occupation: Math.random() > 0.5 ? 'Öğrenci' : 'Çalışan',
        gender: Math.random() > 0.5 ? 'Erkek' : 'Kadın',
        birthDate: new Date(1980 + Math.floor(Math.random() * 25), Math.floor(Math.random()*12), Math.floor(Math.random()*28)),
        isVerified: true
      });
    }
    await User.insertMany(randomUsers);

    // --- GERÇEKÇİ ETKİNLİKLER (EVENTS) ---
    
    // TEMA Etkinlikleri
    const e1 = await Event.create({
      title: 'Şile Belgrad Ormanı Fidan Dikimi', 
      description: 'İstanbul\'un yeşil dokusunu güçlendirmek için 10.000 adet fidanı toprakla buluşturuyoruz. Katılımcıların yanlarında matara getirmeleri önerilir. Tüm kazı ve dikim ekipmanları TEMA Vakfı tarafından temin edilecektir.', 
      date: new Date('2026-05-10'), category: 'Çevre & Doğa', locationName: 'Belgrad Ormanı, Sarıyer, İstanbul', 
      lat: 41.1744, lng: 28.9815, requiredVolunteers: 200, organizerId: tema._id
    });

    const e2 = await Event.create({
      title: 'Köy Okullarına Kitap Ayrıştırma Kampanyası', 
      description: 'Anadolu\'nun dört bir yanındaki köy okullarımızdan gelen kitap taleplerini karşılamak adına depomuza ulaşan binlerce bağış kitabı tasnif edip kutuluyoruz.', 
      date: new Date('2026-06-05'), category: 'Eğitim', locationName: 'TEMA Şişli Lojistik Merkezi, İstanbul', 
      lat: 41.0602, lng: 28.9878, requiredVolunteers: 20, organizerId: tema._id
    });

    // LÖSEV Etkinlikleri
    const e3 = await Event.create({
      title: 'Lösemili Kahramanlar İçin 23 Nisan Şenliği', 
      description: 'LÖSEV hastanemizde tedavi gören minik kahramanlarımız için oyun stantları kuracak, yüz boyama, sosis balon katlama ve çeşitli animasyonlarla onlara moral verecek neşeli gönüllüler arıyoruz.', 
      date: new Date('2026-04-23'), category: 'Sağlık', locationName: 'LÖSEV Onkoloji Hastanesi, İncek, Ankara', 
      lat: 39.8408, lng: 32.7941, requiredVolunteers: 40, organizerId: losev._id
    });

    // Kızılay Etkinlikleri
    const e4 = await Event.create({
      title: 'Kan Bağışı Kampanyası - İzmir Meydan', 
      description: 'Kan stoklarımızı kritik eşiğin üzerinde tutabilmek için İzmir Konak Meydanı\'nda düzenleyeceğimiz büyük kan bağışı çadırımızda donörleri karşılayacak, form doldurmalarına yardım edecek saha ekipleri.', 
      date: new Date('2026-05-30'), category: 'Sağlık', locationName: 'Konak Meydanı, İzmir', 
      lat: 38.4190, lng: 27.1287, requiredVolunteers: 25, organizerId: kizilay._id
    });

    // HAYTAP Etkinlikleri
    const e5 = await Event.create({
      title: 'Yedikule Hayvan Barınağı Kulübe Bakımı', 
      description: 'Kış aylarına hazırlık kapsamında Yedikule barınağındaki sahipsiz patili dostlarımızın kulübelerini onarıyor, boyuyor ve battaniye değişimi yapıyoruz. Teknik yeteneği olan veya fırça tutabilen herkesi bekleriz.', 
      date: new Date('2026-10-15'), category: 'Hayvan Hakları', locationName: 'Yedikule Hayvan Barınağı, Fatih, İstanbul', 
      lat: 40.9935, lng: 28.9192, requiredVolunteers: 50, organizerId: haytap._id
    });

    // AKUT Etkinlikleri
    const e6 = await Event.create({
      title: 'Deprem Bilinçlendirme Semineri Asistansı', 
      description: 'Halkımızı olası İstanbul depremine karşı bilinçlendirmek amacıyla düzenlediğimiz seminerde; kayıt masasında duracak, misafirleri salona yönlendirecek ve bilgilendirme broşürleri dağıtacak organizasyon ekibi.', 
      date: new Date('2026-06-12'), category: 'Afet Yardımı', locationName: 'Beşiktaş Kültür Merkezi, İstanbul', 
      lat: 41.0422, lng: 29.0074, requiredVolunteers: 15, organizerId: akut._id
    });

    // TEGV Etkinlikleri
    const e7 = await Event.create({
      title: 'Yaz Dönemi Kodlama Atölyesi Eğitmeni', 
      description: 'Dezavantajlı bölgelerdeki çocuklara temel algoritma mantığını ve Scratch ile blok tabanlı kodlamayı öğretecek, teknolojiye meraklı gönüllü eğitmenler arıyoruz.', 
      date: new Date('2026-07-01'), category: 'Eğitim', locationName: 'TEGV Fatih Eğitim Parkı, İstanbul', 
      lat: 41.0182, lng: 28.9374, requiredVolunteers: 10, organizerId: tegv._id
    });

    // UNICEF Etkinlikleri
    const e8 = await Event.create({
      title: 'Çocuk Hakları Sokak Festivali', 
      description: 'Dünya Çocuk Hakları Günü kapsamında düzenlediğimiz festival alanında oyun atölyelerini yönetecek, sahne arkasında görev alacak enerjik saha gönüllüleri.', 
      date: new Date('2026-11-20'), category: 'İnsan Hakları', locationName: 'Kuğulu Park, Çankaya, Ankara', 
      lat: 39.9021, lng: 32.8596, requiredVolunteers: 60, organizerId: unicef._id
    });


    // --- GERÇEKÇİ BAŞVURULAR (APPLICATIONS) ---
    // Ahmet'in Başvuruları
    await Application.create({ eventId: e1._id, volunteerId: ahmet._id, organizerId: tema._id, status: 'Onaylandı', applicationDate: new Date() });
    await Application.create({ eventId: e2._id, volunteerId: ahmet._id, organizerId: tema._id, status: 'Onaylandı', applicationDate: new Date() });
    await Application.create({ eventId: e6._id, volunteerId: ahmet._id, organizerId: akut._id, status: 'Bekliyor', applicationDate: new Date() });

    // Ayşe'nin Başvuruları
    await Application.create({ eventId: e3._id, volunteerId: ayse._id, organizerId: losev._id, status: 'Onaylandı', applicationDate: new Date() });
    await Application.create({ eventId: e7._id, volunteerId: ayse._id, organizerId: tegv._id, status: 'Bekliyor', applicationDate: new Date() });
    await Application.create({ eventId: e8._id, volunteerId: ayse._id, organizerId: unicef._id, status: 'Bekliyor', applicationDate: new Date() });

    // Mehmet'in Başvuruları
    await Application.create({ eventId: e4._id, volunteerId: mehmet._id, organizerId: kizilay._id, status: 'Onaylandı', applicationDate: new Date() });
    
    // Elif'in Başvuruları
    await Application.create({ eventId: e5._id, volunteerId: elif._id, organizerId: haytap._id, status: 'Onaylandı', applicationDate: new Date() });
    await Application.create({ eventId: e8._id, volunteerId: elif._id, organizerId: unicef._id, status: 'Onaylandı', applicationDate: new Date() });

    // Can'ın Başvuruları
    await Application.create({ eventId: e7._id, volunteerId: can._id, organizerId: tegv._id, status: 'Onaylandı', applicationDate: new Date() });
    await Application.create({ eventId: e2._id, volunteerId: can._id, organizerId: tema._id, status: 'Bekliyor', applicationDate: new Date() });

    console.log('Real Turkish NGO & Campaign Data Successfully Seeded with corrected Dates!');
    process.exit();
  } catch (error) {
    console.error(`Seeding Error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
