import { useState } from 'react';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }
    
    try {
      const url = isLogin ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login` : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`;
      const payload = isLogin ? { email: formData.email, password: formData.password } : formData;
      const { data } = await axios.post(url, payload);
      
      if (!isLogin) {
        alert(data.message || 'Kayıt başarılı! Lütfen e-postanızı kontrol ederek hesabınızı doğrulayın.');
        setIsLogin(true); // Giriş moduna geç
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/dashboard');
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
          <div className="form-group" style={{ position: 'relative' }}>
            <label>Şifre</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                style={{ flex: 1 }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ padding: '0.5rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                {showPassword ? "Gizle" : "Göster"}
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
