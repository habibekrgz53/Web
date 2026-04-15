import { Link } from 'react-router-dom';
import { Users, Leaf, GraduationCap, MapPin, Search } from 'lucide-react';

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="container flex items-center justify-between gap-8 mt-4" style={{ minHeight: '70vh', flexWrap: 'wrap' }}>
        <div className="animate-fade" style={{ flex: '1 1 500px' }}>
          <h1 style={{ fontSize: '4rem' }}>Topluluğuna Değer Kat, <span style={{ color: 'var(--primary)' }}>Fark Yarat!</span></h1>
          <p className="mt-4" style={{ fontSize: '1.25rem' }}>
            Yerel çevrenizdeki STK'lar ve belediyeler tarafından düzenlenen etkinliklere katılın. Tecrübe kazanın, yeni insanlarla tanışın ve dünyayı daha iyi bir yer haline getirin.
          </p>
          <div className="flex gap-4 mt-8">
            <Link to="/login?mode=register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>Hemen Gönüllü Ol 🚀</Link>
            <Link to="/login?mode=register&role=org" className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>Etkinlik Düzenle</Link>
          </div>
        </div>
        <div className="animate-fade delay-1" style={{ flex: '1 1 400px' }}>
          <img src="/hero.png" alt="Happy Volunteers" style={{ width: '100%', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', border: '2px solid rgba(99,102,241,0.2)' }} />
        </div>
      </div>

      {/* Stats */}
      <div className="container animate-fade delay-2 mt-8">
          <div className="glass flex justify-between text-center" style={{ padding: '3rem', flexWrap: 'wrap', gap: '2rem' }}>
              <div>
                  <h2 style={{ color: 'var(--primary)', fontSize: '3rem', marginBottom: 0 }}>10+</h2>
                  <p>Kayıtlı Kurum</p>
              </div>
              <div>
                  <h2 style={{ color: 'var(--primary)', fontSize: '3rem', marginBottom: 0 }}>500+</h2>
                  <p>Aktif Gönüllü</p>
              </div>
              <div>
                  <h2 style={{ color: 'var(--primary)', fontSize: '3rem', marginBottom: 0 }}>50+</h2>
                  <p>Tamamlanan Etkinlik</p>
              </div>
          </div>
      </div>

      {/* Features */}
      <div className="container mt-12 mb-12">
          <div className="text-center mb-8">
              <h2>Sistem Nasıl Çalışır?</h2>
              <p>Üç basit adımda iyilik hareketine katılın.</p>
          </div>
          <div className="flex justify-center gap-8" style={{ flexWrap: 'wrap' }}>
             <div className="glass-panel text-center" style={{ flex: '1 1 300px', padding: '2rem' }}>
                 <div style={{ background: 'rgba(99,102,241,0.15)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <Users size={32} color="#818CF8" />
                 </div>
                 <h3>1. Profilini Oluştur</h3>
                 <p>Yeteneklerinizi ve ilgi alanlarınızı belirterek size en uygun etkinlikleri bulun.</p>
             </div>
             <div className="glass-panel text-center" style={{ flex: '1 1 300px', padding: '2rem' }}>
                 <div style={{ background: 'rgba(16,185,129,0.15)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <Search size={32} color="#34D399" />
                 </div>
                 <h3>2. Etkinlikleri Keşfet</h3>
                 <p>Size yakın çevredeki eğitim, çevre ve sosyal yardımlaşma etkinliklerini haritadan bulun.</p>
             </div>
             <div className="glass-panel text-center" style={{ flex: '1 1 300px', padding: '2rem' }}>
                 <div style={{ background: 'rgba(239,68,68,0.15)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <MapPin size={32} color="#F87171" />
                 </div>
                 <h3>3. Katıl ve Değer Kat</h3>
                 <p>Etkinliğe başvurunu yap ve kurumla iletişime geçerek değişimin bir parçası ol!</p>
             </div>
          </div>
      </div>
    </div>
  );
}

export default Home;
