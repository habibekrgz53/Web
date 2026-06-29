import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

function Login() {
  const [params] = useSearchParams();
  const initialMode = params.get('mode') === 'register' ? 'register' : 'login';
  const orgRole = params.get('role') === 'org';
  
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: orgRole ? 'Düzenleyici' : 'Gönüllü' });
  const navigate = useNavigate();

  // URL'deki parametre (Giriş / Kayıt Ol) değiştiğinde formu dinamik olarak güncelle
  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }
    
    try {
      if (!isLogin) {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, formData);
        alert('🎉 Kayıt başarılı! Lütfen e-posta adresinize (Gereksiz/Spam kutusu dahil) gelen doğrulama linkine tıklayarak hesabınızı aktif edin.');
        setIsLogin(true); // Switch to login view
      } else {
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`;
        const payload = { email: formData.email, password: formData.password };
        const { data } = await axios.post(url, payload);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        
        // Eğer bu kullanıcının sisteme İLK GİRİŞİ ise Profile ekranına yönlendir
        if (data.isFirstLogin === true) {
          alert('Hoşgeldiniz! 🎉 Devam etmeden önce lütfen profil bilgilerinizi tamamlayın.');
          navigate('/profile');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Bir hata oluştu!');
    }
  };

  return (
    <div className="container flex justify-center items-center" style={{ minHeight: '80vh' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <h2 className="text-center">{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          {!isLogin && (
            <>
              <div className="form-group">
                <label>İsim Soyisim</label>
                <input type="text" required onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="Gönüllü">Gönüllü</option>
                  <option value="Düzenleyici">Etkinlik Düzenleyici</option>
                </select>
              </div>
            </>
          )}
          <div className="form-group">
            <label>E-posta</label>
            <input type="email" required onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Şifre</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                style={{ width: '100%', paddingRight: '40px' }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', 
                  right: '10px', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
                title={showPassword ? "Gizle" : "Göster"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {isLogin ? 'Giriş' : 'Kayıt Ol'}
          </button>
        </form>
        <p className="text-center mt-4" style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 500 }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Hesabınız yok mu? Kayıt Olun" : "Zaten hesabınız var mı? Giriş Yapın"}
        </p>
      </div>
    </div>
  );
}

export default Login;
