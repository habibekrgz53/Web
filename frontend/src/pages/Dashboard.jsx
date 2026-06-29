import { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { Calendar, MapPin, Search, Award, Heart, Compass, LayoutDashboard, Users, PlusCircle, LogOut, TrendingUp, Sparkles, Clock, User } from 'lucide-react';
import { jsPDF } from 'jspdf';

let DefaultIcon = L.icon({
    iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Map click handler component for Organizer
function LocationSelector({ setLoc }) {
    useMapEvents({
        click(e) {
            setLoc({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
    });
    return null;
}

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState({ category: '', city: '' });
  const [activeTab, setActiveTab] = useState('explore');
  
  // Create Event State
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', category: 'Çevre & Doğa', locationName: '', requiredVolunteers: 10, image: null });
  const [selLoc, setSelLoc] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    if (!u) return window.location.href = '/login';
    if (u.role === 'Admin') return window.location.href = '/admin';
    setUser(u);
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      let qs = '?';
      if (filter.category) qs += `category=${filter.category}&`;
      if (filter.city) qs += `city=${filter.city}&`;

      const u = JSON.parse(localStorage.getItem('user'));
      const url = u?.role === 'Gönüllü' 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/recommendations${qs}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events${qs}`;

      const evRes = await axios.get(url, {
        headers: u?.role === 'Gönüllü' ? { Authorization: `Bearer ${token}` } : {}
      });
      setEvents(evRes.data);

      const appRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(appRes.data);
    } catch (err) {
      console.log(err);
      if (err.response && (err.response.status === 401 || err.response.status === 404)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  };

  const applyToEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/applications/${eventId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Etkinliğe başarıyla başvurdunuz! 🚀 Başvurunuz değerlendirmeye alındı.');
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Hata'); }
  };

  const handleCreateEvent = async (e) => {
      e.preventDefault();
      if (!selLoc) return alert('Haritadan bir nokta seçmelisiniz.');
      try {
          const token = localStorage.getItem('token');
          const formData = new FormData();
          formData.append('title', newEvent.title);
          formData.append('description', newEvent.description);
          formData.append('date', newEvent.date);
          formData.append('category', newEvent.category);
          formData.append('locationName', newEvent.locationName);
          formData.append('requiredVolunteers', newEvent.requiredVolunteers);
          formData.append('lat', selLoc.lat);
          formData.append('lng', selLoc.lng);
          if (newEvent.image) formData.append('image', newEvent.image);

          await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events`, formData, {
             headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
          });
          alert('Etkinlik Başarıyla Oluşturuldu! 📅');
          setNewEvent({ title: '', description: '', date: '', category: 'Çevre & Doğa', locationName: '', requiredVolunteers: 10, image: null });
          setSelLoc(null);
          fetchData();
      } catch (err) { alert('Hata'); }
  };

  const updateAppStatus = async (appId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/applications/${appId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Başvuru durumu başarıyla güncellendi!');
      fetchData();
    } catch (err) { alert('Hata'); }
  };

  // jsPDF Türkçe karakter desteği
  const toPdfFriendlyText = (str) => {
    if (!str) return '';
    const charMap = {
      'ı': 'i', 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ö': 'o', 'ç': 'c',
      'İ': 'I', 'Ğ': 'G', 'Ü': 'U', 'Ş': 'S', 'Ö': 'O', 'Ç': 'C'
    };
    return str.replace(/[ığüşöçİĞÜŞÖÇ]/g, m => charMap[m]);
  };

  const downloadCertificate = (app) => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const rawVolunteerName = user?.name || 'Degerli Gonullu';
      const rawEventTitle = app.eventId?.title || 'Gonulluluk Etkinligi';
      const rawOrganizerName = app.eventId?.organizerId?.name || 'Sivil Toplum Vakfi';
      const eventDate = new Date(app.eventId?.date).toLocaleDateString('tr-TR');
      const volunteerName = toPdfFriendlyText(rawVolunteerName);
      const eventTitle = toPdfFriendlyText(rawEventTitle);
      const organizerName = toPdfFriendlyText(rawOrganizerName);

      doc.setDrawColor(15, 23, 42); doc.setLineWidth(2); doc.rect(10, 10, 277, 190);
      doc.setDrawColor(79, 70, 229); doc.setLineWidth(1); doc.rect(13, 13, 271, 184);
      doc.setFillColor(79, 70, 229);
      doc.rect(11, 11, 4, 4, 'F'); doc.rect(282, 11, 4, 4, 'F');
      doc.rect(11, 195, 4, 4, 'F'); doc.rect(282, 195, 4, 4, 'F');

      doc.setFont('times', 'bold'); doc.setTextColor(79, 70, 229); doc.setFontSize(28);
      doc.text('GONULLULUK TESEKKUR BELGESI', 148.5, 45, { align: 'center' });
      doc.setFont('helvetica', 'italic'); doc.setTextColor(100, 116, 139); doc.setFontSize(12);
      doc.text('Toplumsal faydaya ve gelecege sundugunuz essiz katkilar anisina', 148.5, 55, { align: 'center' });
      doc.setDrawColor(226, 232, 240); doc.line(70, 65, 227, 65);

      doc.setFont('helvetica', 'normal'); doc.setTextColor(15, 23, 42); doc.setFontSize(16);
      doc.text('Bu Tesekkur Belgesi', 148.5, 80, { align: 'center' });
      doc.setFont('times', 'bold'); doc.setTextColor(16, 185, 129); doc.setFontSize(24);
      doc.text(volunteerName.toUpperCase(), 148.5, 95, { align: 'center' });

      doc.setFont('helvetica', 'normal'); doc.setTextColor(51, 65, 85); doc.setFontSize(13);
      doc.text(`Sayin ${volunteerName}, ${organizerName} bunyesinde gerceklestirilen`, 148.5, 115, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.text(`"${eventTitle}"`, 148.5, 122, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(`etkinliginde, ${eventDate} tarihinde gosterdiginiz ustun sorumluluk bilinci,`, 148.5, 129, { align: 'center' });
      doc.text('ozverili calismalar ve topluma kazandirdiginiz sosyal degerlerin nisanesi olarak', 148.5, 136, { align: 'center' });
      doc.text('bu belgeyi almaya hak kazandiniz. Toplumsal birlikteligimize sundugunuz katki icin tesekkur ederiz.', 148.5, 143, { align: 'center' });

      doc.setFontSize(11); doc.setTextColor(100, 116, 139);
      doc.text('Duzenleme Tarihi', 50, 168);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
      doc.text(eventDate, 50, 174);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
      doc.text('Duzenleyen Kurum', 247, 168, { align: 'right' });
      doc.setFont('helvetica', 'bold'); doc.setTextColor(79, 70, 229);
      doc.text(organizerName, 247, 174, { align: 'right' });

      doc.setDrawColor(16, 185, 129); doc.setFillColor(240, 253, 250); doc.setLineWidth(1);
      doc.circle(148.5, 170, 12, 'FD');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(16, 185, 129);
      doc.text('ONAYLI', 148.5, 169.5, { align: 'center' });
      doc.setFontSize(6); doc.text('GÖNÜLLÜAI', 148.5, 173, { align: 'center' });
      doc.save(`Gonulluluk_Sertifikasi_${volunteerName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) { console.error(err); alert('Sertifika oluşturulurken bir hata oluştu.'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const approvedCount = applications.filter(a => a.status === 'Onaylandı').length;
  const pendingCount = applications.filter(a => a.status === 'Bekliyor').length;
  const avgMatch = events.length > 0 && events[0].matchScore !== undefined 
    ? Math.round(events.reduce((s, e) => s + (e.matchScore || 0), 0) / events.length) 
    : null;

  const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

  const matchColor = (score) => {
    if (score >= 70) return 'linear-gradient(135deg, #059669, #10B981)';
    if (score >= 40) return 'linear-gradient(135deg, #D97706, #F59E0B)';
    return 'linear-gradient(135deg, #475569, #64748B)';
  };

  return (
    <div className="dashboard-dark">
      {/* ─── SIDEBAR ─── */}
      <aside className="dash-sidebar">
        <div className="sidebar-logo">
          <Heart size={24} fill="#A5B4FC" /> GÖNÜLLÜAI
        </div>
        <nav className="sidebar-nav">
          <a href="/dashboard" className={activeTab === 'explore' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('explore'); }}>
            <Compass size={20} /> Keşfet
          </a>
          <a href="#" className={activeTab === 'apps' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('apps'); }}>
            <Award size={20} /> {user?.role === 'Gönüllü' ? 'Başvurularım' : 'Gelen Başvurular'}
          </a>
          {user?.role === 'Düzenleyici' && (
            <a href="#" className={activeTab === 'create' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('create'); }}>
              <PlusCircle size={20} /> Etkinlik Oluştur
            </a>
          )}
          <a href="/profile" >
            <User size={20} /> Profilim
          </a>
        </nav>
        <button onClick={handleLogout} style={{ marginTop: 'auto' }}>
          <LogOut size={20} /> Çıkış Yap
        </button>
      </aside>

      {/* ─── MAIN ─── */}
      <div className="dash-main">
        {/* Top Bar */}
        <div className="dash-topbar">
          <div>
            <h1>{user?.role === 'Gönüllü' ? 'Gönüllü Paneli' : 'STK Yönetim Paneli'}</h1>
            <div className="greeting">Hoş geldin, {user?.name} 👋</div>
          </div>
          <div className="user-pill">
            <div className="avatar">{getInitials(user?.name)}</div>
            <span style={{ color: '#C7D2FE', fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <Compass size={22} color="#818CF8" />
            </div>
            <div className="stat-value">{events.length}</div>
            <div className="stat-label">Aktif Etkinlik</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <Award size={22} color="#34D399" />
            </div>
            <div className="stat-value">{approvedCount}</div>
            <div className="stat-label">Onaylı Başvuru</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(251,191,36,0.15)' }}>
              <Clock size={22} color="#FBBF24" />
            </div>
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Bekleyen Başvuru</div>
          </div>
          {avgMatch !== null && (
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)' }}>
                <TrendingUp size={22} color="#A78BFA" />
              </div>
              <div className="stat-value">%{avgMatch}</div>
              <div className="stat-label">Ort. Uyum Skoru</div>
            </div>
          )}
        </div>

        {/* Content based on active tab */}
        <div className="flex gap-8" style={{ flexWrap: 'wrap-reverse' }}>
          
          {/* Left: Content */}
          <div style={{ flex: '1 1 400px' }}>

            {/* ─── EXPLORE TAB ─── */}
            {activeTab === 'explore' && (
              <>
                {/* Search/Filter */}
                <div className="dark-panel mb-8">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Search size={18} color="#818CF8" /> Etkinlik Ara</h3>
                  <div className="flex gap-4" style={{ marginTop: '0.8rem' }}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <select value={filter.category} onChange={e => setFilter({...filter, category: e.target.value})}>
                        <option value="">Tüm Kategoriler</option>
                        <option value="Çevre & Doğa">Çevre & Doğa</option>
                        <option value="Eğitim">Eğitim</option>
                        <option value="Sağlık">Sağlık</option>
                        <option value="Hayvan Hakları">Hayvan Hakları</option>
                        <option value="Afet Yardımı">Afet Yardımı</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <input type="text" placeholder="Şehir filtrele..." value={filter.city} onChange={e => setFilter({...filter, city: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Event Cards Grid */}
                <div className="flex flex-col gap-4">
                  {events.length === 0 && <p style={{ color: '#64748B' }}>Sonuç bulunamadı.</p>}
                  {events.map(ev => {
                    const hasApplied = applications.find(a => a.eventId?._id === ev._id);
                    return (
                      <div key={ev._id} className="event-card">
                        {ev.matchScore !== undefined && (
                          <div className="match-badge" style={{ background: matchColor(ev.matchScore) }}>
                            <Sparkles size={12} style={{ marginRight: 4 }} /> %{ev.matchScore} Uyum
                          </div>
                        )}
                        {ev.image && (
                          <div style={{ width: '100%', height: '160px', overflow: 'hidden', borderRadius: '12px', marginBottom: '1rem' }}>
                            <img src={`http://localhost:5000${ev.image}`} alt="Etkinlik" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <div className="flex justify-between items-center" style={{ marginBottom: '0.3rem' }}>
                          <span className="event-category">{ev.category}</span>
                          <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem' }}>
                            <Calendar size={14} /> {new Date(ev.date).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <div className="event-title">{ev.title}</div>
                        <div className="event-desc">{ev.description?.slice(0, 120)}{ev.description?.length > 120 ? '...' : ''}</div>
                        <div className="event-meta">
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <MapPin size={14} color="#818CF8" /> {ev.locationName}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Users size={14} color="#818CF8" /> {ev.requiredVolunteers} Gönüllü
                          </span>
                          {user?.role === 'Gönüllü' && (
                            <button
                              className={`btn-glow ${hasApplied ? '' : ''}`}
                              style={{ marginLeft: 'auto', ...(hasApplied ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
                              disabled={!!hasApplied}
                              onClick={() => applyToEvent(ev._id)}
                            >
                              {hasApplied ? `✓ ${hasApplied.status}` : '🚀 Hemen Katıl'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ─── APPLICATIONS TAB ─── */}
            {activeTab === 'apps' && (
              <div className="dark-panel">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={18} color="#818CF8" /> 
                  {user?.role === 'Gönüllü' ? 'Başvurularım & Sertifikalarım' : 'Gelen Başvurular'}
                </h3>
                {applications.length === 0 ? (
                  <p style={{ color: '#64748B', marginTop: '1rem' }}>Henüz başvuru yok.</p>
                ) : (
                  <div style={{ marginTop: '0.5rem' }}>
                    {applications.map(app => (
                      <div key={app._id} className="app-item flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <div className="app-title">
                            {user?.role === 'Gönüllü' ? app.eventId?.title : `${app.volunteerId?.name} → ${app.eventId?.title}`}
                          </div>
                          <div className="app-sub">
                            {user?.role === 'Gönüllü' 
                              ? `${app.eventId?.category} • ${new Date(app.eventId?.date).toLocaleDateString('tr-TR')}`
                              : `${app.volunteerId?.email} • ${app.volunteerId?.city || '-'}`
                            }
                          </div>
                        </div>
                        <div className="flex gap-4 items-center">
                          <span className={`status-badge ${app.status === 'Onaylandı' ? 'approved' : app.status === 'Reddedildi' ? 'rejected' : 'pending'}`}>
                            {app.status}
                          </span>
                          {/* Gönüllü: Sertifika indirme */}
                          {user?.role === 'Gönüllü' && app.status === 'Onaylandı' && (
                            new Date(app.eventId?.date) < new Date() 
                              ? <button className="btn-glow green" onClick={() => downloadCertificate(app)}>🎓 Sertifika</button>
                              : <button className="btn-glow" disabled title="Etkinlik tarihi gelmedi">🔒 Bekleniyor</button>
                          )}
                          {/* Düzenleyici: Onay/Red */}
                          {user?.role === 'Düzenleyici' && app.status === 'Bekliyor' && (
                            <>
                              <button className="btn-glow green" onClick={() => updateAppStatus(app._id, 'Onaylandı')}>Onayla</button>
                              <button className="btn-glow red" onClick={() => updateAppStatus(app._id, 'Reddedildi')}>Reddet</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── CREATE EVENT TAB (Düzenleyici) ─── */}
            {activeTab === 'create' && user?.role === 'Düzenleyici' && (
              <div className="dark-panel">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <PlusCircle size={18} color="#818CF8" /> Yeni Etkinlik Oluştur
                </h3>
                <form onSubmit={handleCreateEvent} style={{ marginTop: '1rem' }}>
                  <div className="form-group">
                    <label>Etkinlik Adı</label>
                    <input type="text" required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Açıklama</label>
                    <textarea required rows="3" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})}></textarea>
                  </div>
                  <div className="flex gap-4">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Tarih</label>
                      <input type="date" required value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Kategori</label>
                      <select value={newEvent.category} onChange={e => setNewEvent({...newEvent, category: e.target.value})}>
                        <option value="Çevre & Doğa">Çevre & Doğa</option>
                        <option value="Eğitim">Eğitim</option>
                        <option value="Sağlık">Sağlık</option>
                        <option value="Hayvan Hakları">Hayvan Hakları</option>
                        <option value="Afet Yardımı">Afet Yardımı</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>İlçe/Yer Adı</label>
                    <input type="text" required placeholder="Açık Adres veya İlçe" value={newEvent.locationName} onChange={e => setNewEvent({...newEvent, locationName: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Kapak Görseli (Opsiyonel)</label>
                    <input type="file" accept="image/*" onChange={e => setNewEvent({...newEvent, image: e.target.files[0]})} style={{ padding: '0.5rem', background: 'rgba(15,23,42,0.3)', borderRadius: '8px', border: '1px solid #334155', color: '#fff', width: '100%' }} />
                  </div>
                  <div className="form-group">
                    <label>Konum (Haritadan Seçin)</label>
                    <div style={{ padding: '0.8rem', border: '2px dashed rgba(99,102,241,0.3)', borderRadius: '12px', textAlign: 'center', background: selLoc ? 'rgba(16,185,129,0.1)' : 'rgba(15,23,42,0.3)', color: selLoc ? '#34D399' : '#64748B' }}>
                      {selLoc ? `Seçildi: ${selLoc.lat.toFixed(3)}, ${selLoc.lng.toFixed(3)} ✅` : 'Haritaya tıklayarak konum işaretleyin 👇'}
                    </div>
                  </div>
                  <button type="submit" className="btn-glow" style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }}>📅 Etkinliği Yayınla</button>
                </form>
              </div>
            )}
          </div>

          {/* Right: Map */}
          <div style={{ flex: '1 1 400px' }}>
            <div className="dark-panel" style={{ padding: '1rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                <MapPin size={18} color="#818CF8" /> Canlı Harita
              </h3>
              <div className="map-wrapper" style={{ height: '420px' }}>
                <MapContainer center={[41.0082, 28.9784]} zoom={11} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {user?.role === 'Düzenleyici' && <LocationSelector setLoc={setSelLoc} />}
                  {selLoc && <Marker position={[selLoc.lat, selLoc.lng]}><Popup>Yeni Etkinlik Noktası</Popup></Marker>}
                  {events.map(ev => (
                    <Marker position={[ev.lat, ev.lng]} key={ev._id}>
                      <Popup>
                        <strong style={{ display: 'block', fontSize: '1.1rem' }}>{ev.title}</strong>
                        <span style={{ color: '#64748B' }}>{ev.locationName}</span>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
