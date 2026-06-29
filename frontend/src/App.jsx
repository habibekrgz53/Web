import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Compass, LogIn, LayoutDashboard } from 'lucide-react';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <nav className="glass flex justify-between items-center" style={{ margin: '1rem 2rem', padding: '1rem 2rem', position: 'sticky', top: '1rem', zIndex: 50, background: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(99, 102, 241, 0.15)' }}>
      <Link to="/" className="flex items-center gap-4" style={{ fontWeight: 800, fontSize: '1.5rem', color: '#A5B4FC' }}>
        <Heart fill="#A5B4FC" /> GÖNÜLLÜAI
      </Link>
      <div className="flex gap-4 items-center">
        {!token ? (
          <>
            <Link to="/login" className="btn btn-outline" style={{ border: 'none', color: '#C7D2FE' }}>Giriş</Link>
            <Link to="/login?mode=register" className="btn btn-primary">Kayıt Ol</Link>
          </>
        ) : (
          <>
            {user?.role === 'Admin' && <Link to="/admin" className="btn btn-outline" style={{ border: 'none', color: '#F87171' }}>Admin Panel</Link>}
            <Link to="/dashboard" className="btn btn-outline" style={{ border: 'none', color: '#C7D2FE' }}><Compass size={20}/> Keşfet</Link>
            <Link to="/profile" className="btn btn-primary"><LayoutDashboard size={20}/> {user?.name}</Link>
            <button onClick={handleLogout} className="btn" style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171' }}>Çıkış</button>
          </>
        )}
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer style={{ background: 'rgba(15, 23, 42, 0.9)', borderTop: '1px solid rgba(99,102,241,0.1)', color: '#E2E8F0', padding: '4rem 2rem', marginTop: '4rem' }}>
        <div className="container flex justify-between gap-8" style={{ flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px' }}>
                <h2 style={{ color: '#A5B4FC', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Heart fill="#A5B4FC" color="#A5B4FC" /> GÖNÜLLÜAI</h2>
                <p style={{ color: '#64748B' }}>Yerel topluluklarla gönüllüleri bir araya getiren köprü. Doğru insan, doğru proje, daha güzel bir dünya.</p>
            </div>
            <div>
                <h3 style={{ color: '#C7D2FE' }}>Hızlı Linkler</h3>
                <ul style={{ listStyle: 'none', color: '#64748B', lineHeight: 2 }}>
                    <li><Link to="/">Ana Sayfa</Link></li>
                    <li><Link to="/login?mode=register">Hemen Katıl</Link></li>
                    <li><Link to="/login">Giriş Yap</Link></li>
                </ul>
            </div>
        </div>
        <div className="text-center mt-8" style={{ color: '#475569', borderTop: '1px solid rgba(99,102,241,0.1)', paddingTop: '2rem' }}>
            © 2026 GÖNÜLLÜAI | Bitirme Projesi
        </div>
    </footer>
  );
}

function AppLayout() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isDashboard && <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>
      {!isDashboard && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
