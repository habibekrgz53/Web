import { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Phone, MapPin, Calendar, Briefcase, Heart, Award, Shield, FileText } from 'lucide-react';

function Profile() {
  const [user, setUser] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    phone: '',
    occupation: '',
    gender: '',
    birthDate: '',
    bio: '',
    skills: [],
    interests: [],
    availability: ''
  });

  const SKILL_OPTIONS = [
    'İlk Yardım', 'İletişim', 'Organizasyon', 'Liderlik', 'Yabancı Dil', 
    'Sosyal Medya', 'Rehberlik', 'Tasarım', 'Yazılım', 'Fotoğrafçılık',
    'Video Kurgu', 'İçerik Üretimi', 'Proje Yönetimi', 'Finans / Muhasebe',
    'Eğitmenlik', 'Etkinlik Planlama', 'Çeviri / Tercüme', 'Kriz Yönetimi',
    'Şoförlük', 'El Sanatları'
  ];
  
  const INTEREST_OPTIONS = [
    'Çevre & Doğa', 'Hayvan Hakları', 'Eğitim', 'Sağlık', 'Kültür & Sanat', 
    'Afet Yardımı', 'Spor', 'Teknoloji', 'Çocuklar', 'Yaşlı Bakımı',
    'Engelli Bireyler', 'İnsan Hakları', 'Kadın Hakları', 'İklim Krizi',
    'Gençlik Gelişimi', 'Toplumsal Gelişim', 'Sürdürülebilirlik', 'Mülteci / Göçmen Dayanışması'
  ];

  const toggleSelection = (field, value) => {
    setFormData(prev => {
      const currentList = prev[field] || [];
      if (currentList.includes(value)) {
        return { ...prev, [field]: currentList.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...currentList, value] };
      }
    });
  };

  useEffect(() => {
    const checkUser = JSON.parse(localStorage.getItem('user'));
    if (!checkUser) return window.location.href = '/login';
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!data) {
        throw new Error('User not found in DB');
      }
      setUser(data);
      setFormData({
        name: data?.name || '',
        city: data?.city || '',
        phone: data?.phone || '',
        occupation: data?.occupation || '',
        gender: data?.gender || '',
        birthDate: data?.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : '',
        bio: data?.bio || '',
        skills: Array.isArray(data?.skills) ? data.skills : [],
        interests: Array.isArray(data?.interests) ? data.interests : [],
        availability: data?.availability || ''
      });
    } catch (error) { 
      console.error("Profile fetch error:", error); 
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profiliniz başarıyla güncellendi! ✨');
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    } catch (error) { 
      alert(error.response?.data?.message || 'Hata oluştu'); 
    }
  };

  if (!user || Object.keys(user).length === 0) {
    return <div className="text-center mt-12">Yükleniyor...</div>;
  }

  return (
    <div className="container animate-fade" style={{ maxWidth: '1200px' }}>
      <div className="flex gap-8" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Sol Sütun: Profil Kartı (Summary) */}
        <div style={{ flex: '1 1 350px' }}>
          <div className="glass-panel text-center" style={{ padding: '2.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '10px',
              background: 'linear-gradient(90deg, #6366F1 0%, #10B981 100%)'
            }}></div>

            <div style={{
              width: '120px', height: '120px', 
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', 
              color: 'white', borderRadius: '50%', fontSize: '3rem', fontWeight: 'bold',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem auto 1.5rem',
              boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)',
              border: '4px solid rgba(99,102,241,0.2)'
            }}>
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            
            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F1F5F9', marginBottom: '0.2rem' }}>{user?.name}</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{user?.email}</p>
            
            <span style={{
              padding: '0.4rem 1.2rem', background: 'rgba(99,102,241,0.15)', color: '#A5B4FC',
              borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-block',
              marginBottom: '1.5rem', border: '1px solid rgba(99,102,241,0.2)'
            }}>
              ✨ {user?.role}
            </span>

            {/* Biyografi Özeti */}
            <div style={{ borderTop: '1px solid rgba(99,102,241,0.1)', paddingTop: '1.5rem', textAlign: 'left' }}>
              <h4 style={{ fontSize: '1rem', color: '#C7D2FE', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} color="var(--primary)"/> Hakkımda
              </h4>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#94A3B8', fontStyle: formData.bio ? 'normal' : 'italic' }}>
                {formData.bio || 'Kendinizden kısaca bahsedin...'}
              </p>
            </div>
          </div>
        </div>

        {/* Sağ Sütun: Düzenleme Formu */}
        <div style={{ flex: '2 1 600px' }}>
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem', color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚙️ Profil Ayarları
            </h2>
            
            <form onSubmit={handleSave}>
              
              {/* Bölüm 1: Kişisel Bilgiler */}
              <h4 style={{ fontSize: '1.1rem', color: '#A5B4FC', borderBottom: '2px solid rgba(99,102,241,0.15)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                Kişisel Bilgiler
              </h4>
              
              <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 250px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={16}/> Ad Soyad</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Adınız Soyadınız" />
                </div>
                <div className="form-group" style={{ flex: '1 1 250px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Phone size={16}/> Telefon Numarası</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Örn: 0555 123 4567" />
                </div>
              </div>

              <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 250px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Briefcase size={16}/> Meslek</label>
                  <input type="text" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} placeholder="Örn: Yazılım Mühendisi, Öğrenci" />
                </div>
                <div className="form-group" style={{ flex: '1 1 250px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MapPin size={16}/> Şehir</label>
                  <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Örn: İstanbul, Kadıköy" />
                </div>
              </div>

              <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 250px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={16}/> Doğum Tarihi</label>
                  <input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: '1 1 250px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Shield size={16}/> Cinsiyet</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option value="">Seçiniz</option>
                    <option value="Kadın">Kadın</option>
                    <option value="Erkek">Erkek</option>
                    <option value="Belirtmek İstemiyorum">Belirtmek İstemiyorum</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FileText size={16}/> Kısa Biyografi (Hakkımda)</label>
                <textarea rows="3" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Kendinizi, yeteneklerinizi ve neden gönüllü olmak istediğinizi kısaca anlatın..."></textarea>
              </div>

              {/* Bölüm 2: Tercihler ve Yetenekler */}
              <h4 style={{ fontSize: '1.1rem', color: '#A5B4FC', borderBottom: '2px solid rgba(99,102,241,0.15)', paddingBottom: '0.5rem', marginTop: '2.5rem', marginBottom: '1.5rem' }}>
                Gönüllülük Tercihleri
              </h4>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Award size={16}/> Sahip Olduğunuz Yetenekler</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {SKILL_OPTIONS.map(skill => (
                    <span 
                      key={skill} 
                      onClick={() => toggleSelection('skills', skill)}
                      style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        background: formData.skills?.includes(skill) ? 'var(--primary)' : 'rgba(99,102,241,0.08)',
                        color: formData.skills?.includes(skill) ? 'white' : '#94A3B8',
                        border: formData.skills?.includes(skill) ? '1px solid var(--primary)' : '1px solid rgba(99,102,241,0.15)',
                        transition: 'all 0.2s ease',
                        fontSize: '0.85rem',
                        fontWeight: formData.skills?.includes(skill) ? '600' : '400'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Heart size={16}/> İlgilendiğiniz Alanlar</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {INTEREST_OPTIONS.map(interest => (
                    <span 
                      key={interest} 
                      onClick={() => toggleSelection('interests', interest)}
                      style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        background: formData.interests?.includes(interest) ? 'var(--primary)' : 'rgba(99,102,241,0.08)',
                        color: formData.interests?.includes(interest) ? 'white' : '#94A3B8',
                        border: formData.interests?.includes(interest) ? '1px solid var(--primary)' : '1px solid rgba(99,102,241,0.15)',
                        transition: 'all 0.2s ease',
                        fontSize: '0.85rem',
                        fontWeight: formData.interests?.includes(interest) ? '600' : '400'
                      }}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={16}/> Genel Müsaitlik Durumu</label>
                <select value={formData.availability} onChange={e => setFormData({...formData, availability: e.target.value})}>
                  <option value="">Seçiniz</option>
                  <option value="Hafta Sonları">Hafta Sonları</option>
                  <option value="Hafta İçi (Akşam)">Hafta İçi (Akşam)</option>
                  <option value="Sürekli">Sürekli</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}>
                Değişiklikleri Kaydet ✨
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;
