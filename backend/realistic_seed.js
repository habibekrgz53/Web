const mongoose = require('mongoose');
const Event = require('./models/Event');
const Application = require('./models/Application');
const User = require('./models/User');

const uri = 'mongodb+srv://habibekrgz129_db_user:rR55MYCkbogTRg6W@cluster0.tdwk2wr.mongodb.net/volunteer_match_prod?appName=Cluster0';

const realisticEvents = [
  // 1-20
  { title: 'Kızılay Kan Bağışı Kampanyası Destek', category: 'Sağlık', desc: 'Kan bağışı çadırlarında form doldurma ve bilgilendirme süreçlerinde destek olacak gönüllüler aranıyor.', city: 'İstanbul', lat: 41.0082, lng: 28.9784, req: 10 },
  { title: 'Kadıköy Sahil Temizliği Hareketi', category: 'Çevre', desc: 'Pazar sabahı Kadıköy sahilinde plastik atık toplama etkinliği.', city: 'İstanbul', lat: 40.9901, lng: 29.0234, req: 50 },
  { title: 'LÖSEV Yılbaşı Çocuk Şenliği Organizasyonu', category: 'Eğitim', desc: 'Lösemili çocuklar için düzenlenecek yeni yıl şenliğinde oyun abisi/ablası olacak gönüllüler aranıyor.', city: 'Ankara', lat: 39.9208, lng: 32.8541, req: 20 },
  { title: 'Sokak Hayvanları İçin Mama Dağıtımı', category: 'Hayvan Hakları', desc: 'Soğuk kış günlerinde belirlediğimiz rotalarda sokak canlarına mama ve su dağıtımı yapacağız.', city: 'İzmir', lat: 38.4237, lng: 27.1428, req: 15 },
  { title: 'Köy Okullarına Kitap Toplama Kampanyası', category: 'Eğitim', desc: 'Anadolu\'daki köy okullarına gönderilecek kitapların ayrıştırılması ve kolilenmesi.', city: 'Bursa', lat: 40.1826, lng: 29.0661, req: 12 },
  { title: 'Huzurevi Ziyareti ve Müzik Dinletisi', category: 'Sosyal', desc: 'Yaşlılarımızı ziyaret edip onlarla sohbet edecek ve enstrüman çalabilen gönüllüler arıyoruz.', city: 'Antalya', lat: 36.8969, lng: 30.7133, req: 8 },
  { title: 'Robotik Kodlama Atölyesi Eğitmen Asistanı', category: 'Teknoloji', desc: 'Lise öğrencilerine verilecek ücretsiz robotik kodlama (Arduino) atölyesinde asistana ihtiyaç var.', city: 'İstanbul', lat: 41.0422, lng: 29.0060, req: 5 },
  { title: 'Afet Farkındalık Eğitimi Organizasyonu', category: 'Afet', desc: 'AFAD işbirliğiyle düzenlenecek temel afet bilinci eğitiminde salon düzeni ve kayıt sorumlusu.', city: 'Ankara', lat: 39.9334, lng: 32.8597, req: 10 },
  { title: 'Görme Engelliler İçin Sesli Kitap Okuma', category: 'Eğitim', desc: 'Görme engelli bireyler için stüdyo ortamında veya evden sesli kitap okuyacak diksiyonu düzgün gönüllüler.', city: 'İzmir', lat: 38.4189, lng: 27.1287, req: 30 },
  { title: 'İhtiyaç Sahibi Ailelere Erzak Dağıtımı', category: 'Sosyal', desc: 'Ramazan ayı öncesi tespit edilen ailelere erzak kolilerinin ulaştırılması.', city: 'Konya', lat: 37.8714, lng: 32.4846, req: 25 },
  { title: 'Fidan Dikme Şenliği - Geleceğe Nefes', category: 'Çevre', desc: 'Orman Bölge Müdürlüğü koordinasyonunda yanmış orman alanlarına fidan dikimi.', city: 'Muğla', lat: 37.2153, lng: 28.3636, req: 100 },
  { title: 'Otizmli Çocuklarla Boyama Atölyesi', category: 'Sanat', desc: 'Otizmli bireylerin el becerilerini geliştirmesine yardımcı olacak sanat gönüllüleri.', city: 'Eskişehir', lat: 39.7767, lng: 30.5206, req: 10 },
  { title: 'Tarihi Çevre Restorasyon Bilinçlendirmesi', category: 'Kültür', desc: 'Tarihi dokuyu koruma bilincini artırmak için broşür dağıtımı ve anket çalışması.', city: 'Gaziantep', lat: 37.0662, lng: 37.3833, req: 15 },
  { title: 'Teknoloji Bağımlılığı Semineri Kayıt Görevlisi', category: 'Eğitim', desc: 'Gençlik merkezinde düzenlenecek seminerde katılımcı yönlendirmesi.', city: 'Kayseri', lat: 38.7312, lng: 35.4787, req: 6 },
  { title: 'Sıfır Atık Atölyesi', category: 'Çevre', desc: 'İleri dönüşüm malzemelerinden ürün elde etme atölyesinde çocuklara rehberlik.', city: 'Adana', lat: 37.0000, lng: 35.3213, req: 8 },
  { title: 'Suriyeli Göçmen Çocuklara Türkçe Pratik', category: 'Eğitim', desc: 'Hafta sonları göçmen çocuklarla oyunlar oynayarak Türkçe pratik yapmalarına yardımcı olmak.', city: 'Hatay', lat: 36.2000, lng: 36.1667, req: 15 },
  { title: 'Kadın Girişimciler İçin Dijital Pazarlama Desteği', category: 'Teknoloji', desc: 'El emeği ürünler üreten kadınlara sosyal medya hesabı açma ve yönetme konusunda destek.', city: 'Bursa', lat: 40.1826, lng: 29.0661, req: 10 },
  { title: 'Hastane Onkoloji Servisi Çocuk Oyun Odası', category: 'Sağlık', desc: 'Tedavi gören çocuklara oyun odasında eşlik edip moral verecek gönüllüler.', city: 'Ankara', lat: 39.9208, lng: 32.8541, req: 12 },
  { title: 'Üniversite Tanıtım Günleri Rehberliği', category: 'Eğitim', desc: 'Lise öğrencilerine kampüs turu yaptırıp kendi üniversite tecrübelerini aktaracak üniversiteliler.', city: 'Trabzon', lat: 41.0027, lng: 39.7168, req: 20 },
  { title: 'Geri Dönüşüm Kağıt Toplama Yarışması', category: 'Çevre', desc: 'Okullar arası kağıt toplama yarışmasında tartım ve lojistik koordinasyonu.', city: 'Samsun', lat: 41.2867, lng: 36.3300, req: 15 },
  // 21-30
  { title: 'Kışlık Kıyafet Bağışı Tasnif İşlemi', category: 'Sosyal', desc: 'İhtiyaç sahiplerine ulaştırılacak kışlık kıyafetlerin beden ve yaş gruplarına göre ayrılması.', city: 'Erzurum', lat: 39.9000, lng: 41.2700, req: 15 },
  { title: 'Köy İlkokulu Duvar Boyama Etkinliği', category: 'Sanat', desc: 'Köy ilkokulunun duvarlarını çocuklar için eğitici ve neşeli figürlerle boyayacağız.', city: 'Şanlıurfa', lat: 37.1674, lng: 38.7955, req: 10 },
  { title: 'Matematik Köyü Gönüllü Asistanlığı', category: 'Eğitim', desc: 'Yaz kampında liseli öğrencilere matematik sorularında rehberlik yapacak asistanlar aranıyor.', city: 'İzmir', lat: 37.9400, lng: 27.3400, req: 25 },
  { title: 'Deniz Kaplumbağaları Koruma Nöbeti', category: 'Çevre', desc: 'Caretta caretta yavrularının denize ulaşmasını sağlamak için gece nöbeti.', city: 'Muğla', lat: 36.7500, lng: 28.6333, req: 8 },
  { title: 'Down Sendromlu Gençlerle Mutfak Atölyesi', category: 'Sosyal', desc: 'Özel gençlerle kurabiye yapımı atölyesinde keyifli vakit geçirecek gönüllüler.', city: 'İstanbul', lat: 41.0500, lng: 29.0100, req: 12 },
  { title: 'Orman Yangınları Gözetim Kulesi Nöbeti', category: 'Afet', desc: 'Yaz aylarında yangın kulelerinde nöbetleşe gözetleme yaparak ormanları koruyoruz.', city: 'Çanakkale', lat: 40.1500, lng: 26.4000, req: 20 },
  { title: 'Yaşlılar İçin Dijital Okuryazarlık', category: 'Eğitim', desc: '65 yaş üstü vatandaşlarımıza akıllı telefon kullanımı ve e-devlet eğitimi.', city: 'Ankara', lat: 39.9500, lng: 32.8600, req: 10 },
  { title: 'Atık Pil Toplama Kampanyası Organizasyonu', category: 'Çevre', desc: 'Şehrin dört bir yanına atık pil kutuları yerleştirme ve farkındalık sağlama.', city: 'Kocaeli', lat: 40.7667, lng: 29.9167, req: 30 },
  { title: 'Kimsesiz Çocuklar İçin 23 Nisan Gösterisi', category: 'Kültür', desc: 'Sevgi Evleri\'nde kalan çocuklar için tiyatro ve müzik gösterisi hazırlıkları.', city: 'Diyarbakır', lat: 37.9100, lng: 40.2400, req: 15 },
  { title: 'Bağımlılıkla Mücadele Gençlik Semineri', category: 'Sağlık', desc: 'Yeşilay işbirliğiyle okullarda düzenlenecek seminerlerde sunum asistanlığı.', city: 'İstanbul', lat: 41.0300, lng: 28.9800, req: 20 },
  // 31-40
  { title: 'Göçmen Kuşları Sayım ve Gözlem', category: 'Hayvan Hakları', desc: 'Kuş cennetinde gerçekleştirilecek mevsimsel kuş sayımına destek olacak amatör gözlemciler.', city: 'Balıkesir', lat: 39.2200, lng: 27.9700, req: 12 },
  { title: 'Engelsiz Yaşam Merkezi Sera Kurulumu', category: 'Çevre', desc: 'Engelli bireylerin toprakla uğraşabileceği hobi serasının fiziksel kurulumu.', city: 'Mersin', lat: 36.8100, lng: 34.6400, req: 10 },
  { title: 'Lise Öğrencileri İçin Kariyer Danışmanlığı', category: 'Eğitim', desc: 'Sınava hazırlanan lise son sınıf öğrencilerine kendi mesleklerini tanıtacak profesyoneller.', city: 'Denizli', lat: 37.7700, lng: 29.0800, req: 40 },
  { title: 'Soğuk Havalarda Evsizlere Çorba Dağıtımı', category: 'Sosyal', desc: 'Kış gecelerinde belirlenen noktalarda evsiz vatandaşlarımıza sıcak çorba ikramı.', city: 'İstanbul', lat: 41.0100, lng: 28.9600, req: 25 },
  { title: 'Tarihi Mezar Taşları Transkripsiyonu', category: 'Kültür', desc: 'Osmanlıca okuyabilen gönüllülerle tarihi mezar taşlarının dijital ortama aktarılması.', city: 'Bursa', lat: 40.1900, lng: 29.0700, req: 5 },
  { title: 'Alzheimer Hasta Yakınları Destek Grubu', category: 'Sağlık', desc: 'Hasta yakınlarının sosyalleşmesi için düzenlenen toplantılarda organizasyon asistanlığı.', city: 'Antalya', lat: 36.9000, lng: 30.7000, req: 8 },
  { title: 'Geleceğin Yazılımcıları İçin Temel HTML/CSS', category: 'Teknoloji', desc: 'Ortaokul çocuklarına verilecek temel web tasarım eğitiminde mentörlük.', city: 'Kocaeli', lat: 40.7600, lng: 29.9200, req: 15 },
  { title: 'Ücretsiz Gezici Kütüphane Otobüsü', category: 'Eğitim', desc: 'Gezici kütüphane otobüsünde kitap kayıt ve ödünç verme işlemlerini yönetecek gönüllüler.', city: 'Ankara', lat: 39.9100, lng: 32.8400, req: 12 },
  { title: 'Barınak Hayvanları İçin Kulübe Yapımı', category: 'Hayvan Hakları', desc: 'Ahşap paletlerden sokak hayvanları için kışlık kulübe inşası.', city: 'Sakarya', lat: 40.7800, lng: 30.4000, req: 20 },
  { title: 'Sokak Çocukları İçin Spor Turnuvası', category: 'Sosyal', desc: 'Dezavantajlı çocuklar için düzenlenecek futbol turnuvasında hakem ve koçluk.', city: 'Adana', lat: 37.0100, lng: 35.3300, req: 18 },
  // 41-50
  { title: 'Belediye Sokak İftarı Organizasyonu', category: 'Kültür', desc: 'Ramazan ayında sokak iftarlarında masa düzeni ve yemek dağıtımı.', city: 'İstanbul', lat: 41.0200, lng: 29.0300, req: 100 },
  { title: 'Organ Bağışı Farkındalık Standı', category: 'Sağlık', desc: 'AVM\'lerde kurulacak stantlarda vatandaşları organ bağışı hakkında bilgilendirme.', city: 'İzmir', lat: 38.4300, lng: 27.1500, req: 10 },
  { title: 'Eko-Köy Permakültür Tarlası Çapalama', category: 'Çevre', desc: 'Ekolojik yaşam köyünde doğal tarım yöntemleriyle tarlaların bakımı ve çapalanması.', city: 'Çanakkale', lat: 39.8000, lng: 26.4500, req: 15 },
  { title: 'Afet Çantası Hazırlama Atölyesi', category: 'Afet', desc: 'Halk Eğitim Merkezinde deprem çantasının önemi ve hazırlığı hakkında uygulamalı atölye.', city: 'Erzincan', lat: 39.7500, lng: 39.4900, req: 8 },
  { title: 'Turistik Beldelerde Yabancı Dil Rehberliği', category: 'Kültür', desc: 'Tarihi ören yerlerinde turistlere ücretsiz çeviri ve rehberlik desteği sunacak dil öğrencileri.', city: 'Nevşehir', lat: 38.6200, lng: 34.7100, req: 25 },
  { title: 'Görme Engelliler İçin Tandem Bisiklet Turu', category: 'Sosyal', desc: 'Görme engelli bireylerle ikili bisiklet sürerek onlara eşlik edecek pilot sürücüler.', city: 'Ankara', lat: 39.8900, lng: 32.8200, req: 30 },
  { title: 'Cezaevi Kütüphanesine Kitap Ayrımı', category: 'Eğitim', desc: 'Cezaevlerine bağışlanan kitapların içerik kontrolü ve kayıt altına alınması.', city: 'Sivas', lat: 39.7500, lng: 37.0100, req: 10 },
  { title: 'Deniz Dibi Temizliği - Dalgıç Gönüllüler', category: 'Çevre', desc: 'Sertifikalı dalgıçlarla marinada deniz dibindeki atıkların çıkarılması.', city: 'Bodrum', lat: 37.0300, lng: 27.4300, req: 12 },
  { title: 'Mülteci Kadınlara El Sanatları Atölyesi', category: 'Sanat', desc: 'Sosyal uyum projesi kapsamında dikiş-nakış ve ahşap boyama eğitimlerinde usta öğretici.', city: 'Gaziantep', lat: 37.0700, lng: 37.3800, req: 6 },
  { title: 'Çocuk İstismarı ile Mücadele Broşür Dağıtımı', category: 'Sosyal', desc: 'Meydanlarda velileri bilinçlendirmek amacıyla uzmanlar eşliğinde el ilanı dağıtımı.', city: 'Samsun', lat: 41.2900, lng: 36.3300, req: 40 }
];

const seed = async () => {
  try {
    await mongoose.connect(uri);
    console.log('Veritabanına bağlanıldı.');
    
    await Event.deleteMany({});
    await Application.deleteMany({});
    console.log('Eski etkinlikler temizlendi.');
    
    const organizer = await User.findOne({ role: 'Düzenleyici' });
    if (!organizer) throw new Error("Düzenleyici bulunamadı!");

    const eventsToInsert = realisticEvents.map(e => ({
      title: e.title,
      description: e.desc,
      category: e.category,
      locationName: e.city,
      lat: e.lat,
      lng: e.lng,
      date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Gelecek 30 gün içinde rastgele
      requiredVolunteers: e.req,
      organizerId: organizer._id,
      currentVolunteers: 0
    }));

    await Event.insertMany(eventsToInsert);
    console.log(`${eventsToInsert.length} adet profesyonel gerçekçi etkinlik başarıyla eklendi!`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
seed();
