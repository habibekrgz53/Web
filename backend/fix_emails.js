const mongoose = require('mongoose');
const User = require('./models/User');

const uri = 'mongodb+srv://habibekrgz129_db_user:rR55MYCkbogTRg6W@cluster0.tdwk2wr.mongodb.net/volunteer_match_prod?appName=Cluster0';

const slugify = (text) => {
  if(!text) return 'kullanici';
  return text.toString().toLowerCase()
    .replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/\s+/g, '.')
    .replace(/[^\w\.]+/g, '');
};

const updateEmails = async () => {
  try {
    await mongoose.connect(uri);
    console.log('Veritabanına bağlanıldı.');
    
    const users = await User.find({ email: { $nin: ['admin@test.com', 'demo@test.com', 'stk@test.com', 'ali@test.com'] } });
    
    // Rastgele domainler daha gerçekçi durması için
    const domains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
    
    const bulkOps = users.map((u, i) => {
       const cleanName = slugify(u.name);
       const domain = domains[i % domains.length];
       const newEmail = `${cleanName}@${domain}`;
       return {
          updateOne: {
             filter: { _id: u._id },
             update: { email: newEmail }
          }
       }
    });

    if (bulkOps.length > 0) {
        await User.bulkWrite(bulkOps);
    }
    
    console.log(`${users.length} kullanıcının e-postası isimlerine göre başarıyla formatlandı!`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
updateEmails();
