const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const rateLimit = require('express-rate-limit');

// Login Brute-Force Rate Limiter (Deneme Yanılma Kalkanı)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika bloke
  max: 5, // IP başına 5 hatalı deneme hakkı
  message: { message: 'Çok fazla giriş denemesi yaptınız. Güvenliğiniz için 15 dakika boyunca bloke edildiniz.' }
});

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Geçersiz e-posta adresi formatı' });
    }

    // Güçlü Şifre Politikası (Password Policy)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: 'Şifreniz en az 8 karakter olmalı ve şunları içermelidir: 1 Büyük harf, 1 Küçük harf, 1 Rakam ve 1 Özel Karakter.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // E-posta doğrulama token'ı oluştur
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      role,
      verificationToken
    });

    // Doğrulama maili gönder
    const verifyUrl = `http://localhost:5000/api/auth/verify/${verificationToken}`;
    const message = `
      <h2>GÖNÜLLÜAI'e Hoş Geldiniz!</h2>
      <p>Hesabınızı aktifleştirmek için lütfen aşağıdaki linke tıklayın:</p>
      <a href="${verifyUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Hesabımı Doğrula</a>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'GÖNÜLLÜAI - E-posta Doğrulama',
        html: message
      });
      res.status(201).json({ message: 'Kayıt başarılı. Lütfen e-postanızı kontrol ederek hesabınızı doğrulayın.' });
    } catch (emailError) {
      // E-posta gönderilemezse kullanıcıyı sil (veya isVerified=false olarak bırak)
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ message: 'E-posta gönderilirken bir hata oluştu. Lütfen geçerli bir e-posta adresi girdiğinizden emin olun.' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    
    if (user && (await bcrypt.compare(password, user.password))) {
      // E-posta doğrulama kontrolü
      if (!user.isVerified) {
        return res.status(401).json({ message: 'Lütfen giriş yapmadan önce e-posta adresinize gönderilen linkten hesabınızı doğrulayın.' });
      }

      res.json({
        _id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user.id, user.role)
      });
    } else {
      res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Doğrulama endpoint'i
router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) {
      return res.status(400).send('<h1>Geçersiz veya süresi dolmuş doğrulama linki!</h1>');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Frontend login sayfasına yönlendir (veya bir başarı mesajı göster)
    res.send(`
      <div style="text-align: center; margin-top: 50px; font-family: sans-serif;">
        <h1 style="color: green;">E-postanız başarıyla doğrulandı!</h1>
        <p>Artık GÖNÜLLÜAI uygulamasına giriş yapabilirsiniz.</p>
        <a href="http://localhost:5173/login" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Giriş Yap</a>
      </div>
    `);
  } catch (error) {
    res.status(500).send('<h1>Sunucu hatası</h1>');
  }
});

module.exports = router;
