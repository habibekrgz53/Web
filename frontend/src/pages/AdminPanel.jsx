import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Calendar, FileText, CheckCircle2, Clock, XCircle, TrendingUp, ShieldAlert, Trash2, Search } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?.role !== 'Admin') {
      window.location.href = '/dashboard';
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const uRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users`, { headers });
      setUsers(uRes.data);
      
      const eRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events`);
      setEvents(eRes.data);

      const sRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/stats`, { headers });
      setStats(sRes.data);
    } catch (error) { 
      console.log(error); 
    }
  };

  const deleteUser = async (id) => {
    if(!window.confirm('Kullanıcıyı sistemden silmek istediğinize emin misiniz?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) { 
      alert('Hata'); 
    }
  };

  const deleteEvent = async (id) => {
    if(!window.confirm('Etkinliği kaldırmak istediğinize emin misiniz?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/events/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) { 
      alert('Hata'); 
    }
  };

  // Kategori grafik hesaplaması
  const categoryData = Object.entries(stats?.categoryCounts || {});
  const maxCategoryCount = Math.max(...categoryData.map(([_, count]) => count), 1);

  // Başvuru durumu yüzdelikleri
  const totalApps = stats?.totalApplications || 0;
  const approvedPercent = totalApps ? Math.round((stats.appStats.approved / totalApps) * 100) : 0;
  const pendingPercent = totalApps ? Math.round((stats.appStats.pending / totalApps) * 100) : 0;
  const rejectedPercent = totalApps ? Math.round((stats.appStats.rejected / totalApps) * 100) : 0;

  // Arama filtrelemesi
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container animate-fade" style={{ maxWidth: '1280px' }}>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h2 style={{ margin: 0, color: '#1E293B' }}>Sistem Yönetim Paneli</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Sistem genelindeki tüm etkinlikleri, gönüllüleri ve istatistikleri izleyin.</p>
        </div>
        <span style={{ 
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.6rem 1.2rem', background: '#FEE2E2', color: '#EF4444', 
          borderRadius: '2rem', fontWeight: 'bold', fontSize: '0.9rem', border: '1px solid #FCA5A5' 
        }}>
          <ShieldAlert size={18}/> Yönetici Yetkisi
        </span>
      </div>

      {/* İSTATİSTİK KARTLARI */}
      <div className="flex gap-4 mb-8" style={{ flexWrap: 'wrap' }}>
        
        {/* Kart 1: Gönüllüler */}
        <div className="glass-panel" style={{
          flex: '1 1 240px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', border: '1px solid #BFDBFE'
        }}>
          <div style={{ padding: '1rem', background: '#3B82F6', borderRadius: '1rem', color: 'white' }}>
            <Users size={24}/>
          </div>
          <div>
            <h4 style={{ margin: 0, color: '#1E3A8A', fontSize: '0.9rem', fontWeight: 600 }}>Gönüllüler</h4>
            <span style={{ fontSize: '2rem', fontWeight: '800', color: '#1E3A8A' }}>{stats?.totalVolunteers || 0}</span>
          </div>
        </div>

        {/* Kart 2: Kurumlar */}
        <div className="glass-panel" style={{
          flex: '1 1 240px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
          background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', border: '1px solid #C7D2FE'
        }}>
          <div style={{ padding: '1rem', background: '#6366F1', borderRadius: '1rem', color: 'white' }}>
            <TrendingUp size={24}/>
          </div>
          <div>
            <h4 style={{ margin: 0, color: '#312E81', fontSize: '0.9rem', fontWeight: 600 }}>Düzenleyiciler</h4>
            <span style={{ fontSize: '2rem', fontWeight: '800', color: '#312E81' }}>{stats?.totalOrganizers || 0}</span>
          </div>
        </div>

        {/* Kart 3: Etkinlikler */}
        <div className="glass-panel" style={{
          flex: '1 1 240px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', border: '1px solid #A7F3D0'
        }}>
          <div style={{ padding: '1rem', background: '#10B981', borderRadius: '1rem', color: 'white' }}>
            <Calendar size={24}/>
          </div>
          <div>
            <h4 style={{ margin: 0, color: '#064E3B', fontSize: '0.9rem', fontWeight: 600 }}>Etkinlikler</h4>
            <span style={{ fontSize: '2rem', fontWeight: '800', color: '#064E3B' }}>{stats?.totalEvents || 0}</span>
          </div>
        </div>

        {/* Kart 4: Başvurular */}
        <div className="glass-panel" style={{
          flex: '1 1 240px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
          background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)', border: '1px solid #E9D5FF'
        }}>
          <div style={{ padding: '1rem', background: '#A855F7', borderRadius: '1rem', color: 'white' }}>
            <FileText size={24}/>
          </div>
          <div>
            <h4 style={{ margin: 0, color: '#581C87', fontSize: '0.9rem', fontWeight: 600 }}>Başvurular</h4>
            <span style={{ fontSize: '2rem', fontWeight: '800', color: '#581C87' }}>{stats?.totalApplications || 0}</span>
          </div>
        </div>

      </div>

      {/* GRAFİK BÖLÜMÜ */}
      <div className="flex gap-8 mb-8" style={{ flexWrap: 'wrap' }}>
        
        {/* Sol Grafik: Kategori Dağılımı (Recharts) */}
        <div className="glass-panel" style={{ flex: '1 1 500px', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#1E293B', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
            📊 Etkinlik Kategorisi Dağılımı
          </h3>
          {categoryData.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Yüklenecek veri bulunamadı.</p> : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData.map(([name, value]) => ({ name, value }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {categoryData.map((entry, index) => {
                      const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
                      return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                    })}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Sağ Grafik: Başvuru Durum Analizi */}
        <div className="glass-panel" style={{ flex: '1 1 500px', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#1E293B', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
            🎯 Gönüllü Başvuru Durum Analizi
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Segmented Progress Bar */}
            <div style={{ display: 'flex', height: '24px', width: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
              {totalApps === 0 ? (
                <div style={{ width: '100%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                  Henüz başvuru bulunmuyor
                </div>
              ) : (
                <>
                  <div style={{ width: `${approvedPercent}%`, background: '#10B981', transition: 'all 0.5s' }} title={`Onaylandı: %${approvedPercent}`}></div>
                  <div style={{ width: `${pendingPercent}%`, background: '#F59E0B', transition: 'all 0.5s' }} title={`Bekliyor: %${pendingPercent}`}></div>
                  <div style={{ width: `${rejectedPercent}%`, background: '#EF4444', transition: 'all 0.5s' }} title={`Reddedildi: %${rejectedPercent}`}></div>
                </>
              )}
            </div>

            {/* Durum Göstergeleri */}
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 color="#10B981" size={20}/>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Onaylandı</div>
                  <strong style={{ fontSize: '1.1rem', color: '#1E293B' }}>{stats?.appStats?.approved || 0} (%{approvedPercent})</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock color="#F59E0B" size={20}/>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Bekliyor</div>
                  <strong style={{ fontSize: '1.1rem', color: '#1E293B' }}>{stats?.appStats?.pending || 0} (%{pendingPercent})</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <XCircle color="#EF4444" size={20}/>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Reddedildi</div>
                  <strong style={{ fontSize: '1.1rem', color: '#1E293B' }}>{stats?.appStats?.rejected || 0} (%{rejectedPercent})</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* LİSTELER (Kullanıcılar & Etkinlikler) */}
      <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
        
        {/* Kullanıcı Yönetimi */}
        <div className="glass-panel" style={{ flex: '1 1 500px', padding: '2rem' }}>
          <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              👥 Kullanıcı Listesi ({filteredUsers.length})
            </h3>
            <div style={{ position: 'relative', minWidth: '250px' }}>
              <input 
                type="text" 
                placeholder="İsim veya E-posta ara..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '2rem', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
              />
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#475569', fontSize: '0.9rem' }}>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>İsim</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>E-posta</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Rol</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, textAlign: 'center' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.95rem', fontWeight: 500, color: '#1E293B' }}>{u.name}</td>
                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.95rem', color: '#475569' }}>{u.email}</td>
                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.9rem' }}>
                      <span style={{ 
                        padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
                        background: u.role === 'Gönüllü' ? '#EFF6FF' : u.role === 'Düzenleyici' ? '#ECFDF5' : '#FEF2F2',
                        color: u.role === 'Gönüllü' ? '#3B82F6' : u.role === 'Düzenleyici' ? '#10B981' : '#EF4444'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                      {u.role !== 'Admin' ? (
                        <button 
                          onClick={() => deleteUser(u._id)} 
                          style={{
                            border: 'none', background: 'transparent', color: '#EF4444', 
                            cursor: 'pointer', padding: '0.4rem', borderRadius: '50%',
                            transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          title="Kullanıcıyı Yasakla / Sil"
                        >
                          <Trash2 size={18}/>
                        </button>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Etkinlik Yönetimi */}
        <div className="glass-panel" style={{ flex: '1 1 500px', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#1E293B', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📅 Aktif Etkinlikler ({events.length})
          </h3>
          
          <div className="flex flex-col gap-4 mt-4">
            {events.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Kayıtlı aktif etkinlik bulunamadı.</p> : events.map(ev => (
              <div key={ev._id} style={{ 
                border: '1px solid #E2E8F0', padding: '1rem 1.25rem', borderRadius: '12px', 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
                background: '#F8FAFC', transition: 'all 0.2s'
              }}>
                <div>
                  <h4 style={{ margin: 0, color: '#1E293B', fontSize: '1.05rem', fontWeight: 600 }}>{ev.title}</h4>
                  <div className="flex gap-4 mt-1" style={{ fontSize: '0.85rem', color: '#64748B' }}>
                    <span>Düzenleyen: <strong>{ev.organizerId?.name || 'Bilinmiyor'}</strong></span>
                    <span>•</span>
                    <span>Kategori: <strong>{ev.category}</strong></span>
                  </div>
                </div>
                <button 
                  onClick={() => deleteEvent(ev._id)} 
                  style={{
                    border: 'none', background: 'transparent', color: '#EF4444', 
                    cursor: 'pointer', padding: '0.5rem', borderRadius: '50%',
                    transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  title="Etkinliği Sil"
                >
                  <Trash2 size={18}/>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

export default AdminPanel;
