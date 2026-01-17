// Email Utility Fonksiyonları
// Şimdilik console.log kullanıyor, production'da gerçek email servisi entegre edilebilir

/**
 * Şifre sıfırlama email'i gönder
 * @param {string} email - Alıcı email
 * @param {string} resetToken - Reset token
 * @param {string} resetUrl - Reset URL
 */
async function sendPasswordResetEmail(email, resetToken, resetUrl) {
  // Production'da burada gerçek email servisi kullanılacak (Nodemailer, SendGrid, vb.)
  // Şimdilik console.log ile simüle ediyoruz
  
  const resetLink = `${resetUrl}/reset-password/${resetToken}`;
  
  console.log('='.repeat(60));
  console.log('📧 ŞİFRE SIFIRLAMA EMAİLİ');
  console.log('='.repeat(60));
  console.log(`Alıcı: ${email}`);
  console.log(`Reset Token: ${resetToken}`);
  console.log(`Reset Link: ${resetLink}`);
  console.log('');
  console.log('Email İçeriği:');
  console.log('---');
  console.log(`Merhaba,`);
  console.log('');
  console.log(`Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:`);
  console.log(`${resetLink}`);
  console.log('');
  console.log(`Bu link 1 saat geçerlidir.`);
  console.log('');
  console.log(`Eğer bu isteği siz yapmadıysanız, bu email'i görmezden gelebilirsiniz.`);
  console.log('---');
  console.log('='.repeat(60));
  
  // Production'da:
  // await transporter.sendMail({
  //   from: 'noreply@uzmangys.com',
  //   to: email,
  //   subject: 'Şifre Sıfırlama',
  //   html: emailTemplate
  // });
  
  return true;
}

/**
 * Hoş geldin email'i gönder
 * @param {string} email - Alıcı email
 * @param {string} name - Kullanıcı adı
 */
async function sendWelcomeEmail(email, name) {
  console.log('='.repeat(60));
  console.log('📧 HOŞ GELDİNİZ EMAİLİ');
  console.log('='.repeat(60));
  console.log(`Alıcı: ${email}`);
  console.log(`İsim: ${name}`);
  console.log('');
  console.log('Email İçeriği:');
  console.log('---');
  console.log(`Merhaba ${name},`);
  console.log('');
  console.log(`UzmanGYS Platform'a hoş geldiniz!`);
  console.log(`Hesabınız başarıyla oluşturuldu.`);
  console.log('');
  console.log(`Artık tüm özelliklere erişebilirsiniz.`);
  console.log('---');
  console.log('='.repeat(60));
  
  return true;
}

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
