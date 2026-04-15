const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can use other services like 'hotmail', 'yahoo', or SMTP details
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"VolunteerMatch Onay" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-posta gönderildi: ' + info.response);
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    throw new Error('E-posta gönderilemedi');
  }
};

module.exports = sendEmail;
