import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaArrowRight, FaRocket, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';
import ReCAPTCHA from 'react-google-recaptcha';

const institutions = [
  { id: '104', name: 'Adli Tıp Kurumu' },
  { id: '74', name: 'Afet ve Acil Durum Yönetimi Başkanlığı (AFAD)' },
  { id: '99', name: 'Afyon Kocatepe Üniversitesi' },
  { id: '59', name: 'AGS (MEB)' },
  { id: '84', name: 'Atatürk Orman Çiftliği Müdürlüğü' },
  { id: '55', name: 'Avrupa Birliği Başkanlığı' },
  { id: '90', name: 'Bandırma Onyedi Eylül Üniversitesi' },
  { id: '102', name: 'Bankacılık Düzenleme ve Denetleme Kurumu (BDDK)' },
  { id: '38', name: 'Belediye İtfaiye Personeli' },
  { id: '36', name: 'Belediye ve Bağlı Kuruluşları İle Mahalli İdare Birlikleri Personeli' },
  { id: '39', name: 'Belediye Zabıta Personeli' },
  { id: '44', name: 'Bursa Uludağ Üniversitesi' },
  { id: '105', name: 'Çaykur İşletmeleri Genel Müdürlüğü' },
  { id: '18', name: 'Ceza ve Tevkifevleri Genel Müdürlüğü' },
  { id: '82', name: 'Çukurova Üniversitesi' },
  { id: '75', name: 'Deniz Kuvvetleri Komutanlığı' },
  { id: '73', name: 'Devlet Hava Meydanları İşletmesi Genel Müdürlüğü (DHMİ)' },
  { id: '41', name: 'Devlet Opera ve Balesi Genel Müdürlüğü' },
  { id: '20', name: 'Diyanet İşleri Başkanlığı' },
  { id: '21', name: 'Emniyet Genel Müdürlüğü' },
  { id: '67', name: 'Enerji Piyasası Düzenleme Kurumu (EPDK)' },
  { id: '56', name: 'Erzincan Binali Yıldırım Üniversitesi' },
  { id: '53', name: 'Et ve Süt Kurumu' },
  { id: '40', name: 'Galatasaray Üniversitesi' },
  { id: '91', name: 'Gaziantep İslam Bilim ve Teknoloji Üniversitesi' },
  { id: '98', name: 'Gaziantep Üniversitesi' },
  { id: '78', name: 'Gelir İdaresi Başkanlığı' },
  { id: '71', name: 'Göç İdaresi Başkanlığı' },
  { id: '76', name: 'Hava Kuvvetleri Komutanlığı' },
  { id: '64', name: 'İstanbul Büyükşehir Belediyesi (İBB)' },
  { id: '87', name: 'İstanbul Teknik Üniversitesi (İTÜ)' },
  { id: '100', name: 'İstanbul Üniversitesi' },
  { id: '101', name: 'İstanbul Üniversitesi-Cerrahpaşa' },
  { id: '65', name: 'İzmir Büyükşehir Belediyesi' },
  { id: '54', name: 'İzmir Demokrasi Üniversitesi' },
  { id: '49', name: 'Jandarma ve Sahil Güvenlik Akademisi' },
  { id: '93', name: 'Kahramanmaraş İstiklal Üniversitesi' },
  { id: '92', name: 'Karamanoğlu Mehmetbey Üniversitesi' },
  { id: '62', name: 'Karayolları Genel Müdürlüğü' },
  { id: '86', name: 'Kastamonu Üniversitesi' },
  { id: '51', name: 'Kilis 7 Aralık Üniversitesi' },
  { id: '61', name: 'Kırıkkale Üniversitesi' },
  { id: '88', name: 'Malatya Turgut Özal Üniversitesi' },
  { id: '96', name: 'MASAK (Mali Suçları Araştırma Kurulu)' },
  { id: '58', name: 'Munzur Üniversitesi' },
  { id: '46', name: 'Necmettin Erbakan Üniversitesi' },
  { id: '63', name: 'Orman Genel Müdürlüğü (OGM)' },
  { id: '80', name: 'Polis Akademisi Başkanlığı' },
  { id: '103', name: 'Radyo ve Televizyon Üst Kurulu (RTÜK)' },
  { id: '81', name: 'Sakarya Uygulamalı Bilimler Üniversitesi' },
  { id: '97', name: 'Samsun Üniversitesi' },
  { id: '25', name: 'Sayıştay Başkanlığı' },
  { id: '70', name: 'Sermaye Piyasası Kurulu (SPK)' },
  { id: '95', name: 'Şırnak Üniversitesi' },
  { id: '37', name: 'Sivas Cumhuriyet Üniversitesi' },
  { id: '26', name: 'Sosyal Güvenlik Kurumu (SGK)' },
  { id: '8', name: 'T.C. Adalet Bakanlığı' },
  { id: '4', name: 'T.C. Aile ve Sosyal Hizmetler Bakanlığı' },
  { id: '9', name: 'T.C. Çevre, Şehircilik ve İklim Değişikliği Bakanlığı' },
  { id: '43', name: 'T.C. Cumhurbaşkanlığı İletişim Başkanlığı' },
  { id: '79', name: 'T.C. Cumhurbaşkanlığı Strateji ve Bütçe Başkanlığı' },
  { id: '60', name: 'T.C. Devlet Demiryolları (TCDD)' },
  { id: '11', name: 'T.C. Gençlik ve Spor Bakanlığı' },
  { id: '12', name: 'T.C. Hazine ve Maliye Bakanlığı' },
  { id: '13', name: 'T.C. İçişleri Bakanlığı' },
  { id: '14', name: 'T.C. Kültür ve Turizm Bakanlığı' },
  { id: '1', name: 'T.C. Milli Eğitim Bakanlığı' },
  { id: '66', name: 'T.C. Milli Savunma Bakanlığı' },
  { id: '15', name: 'T.C. Sağlık Bakanlığı' },
  { id: '48', name: 'T.C. Tarım ve Orman Bakanlığı' },
  { id: '17', name: 'T.C. Ticaret Bakanlığı' },
  { id: '50', name: 'T.C. Ulaştırma ve Altyapı Bakanlığı' },
  { id: '27', name: 'Tapu ve Kadastro Genel Müdürlüğü' },
  { id: '28', name: 'Tarım İşletmeleri Genel Müdürlüğü TİGEM' },
  { id: '72', name: 'TEDAŞ Genel Müdürlüğü' },
  { id: '85', name: 'TEİAŞ (Türkiye Elektrik İletim A.Ş.)' },
  { id: '57', name: 'Toprak Mahsulleri Ofisi (TMO) Genel Müdürlüğü' },
  { id: '69', name: 'Türkiye Büyük Millet Meclisi (TBMM)' },
  { id: '45', name: 'Türkiye İş Kurumu (İŞKUR)' },
  { id: '68', name: 'Türkiye İstatistik Kurumu (TÜİK)' },
  { id: '30', name: 'Türkiye Radyo ve Televizyon Kurumu (TRT)' },
  { id: '42', name: 'Türkiye Şeker Fabrikaları A.Ş. Genel Müdürlüğü' },
  { id: '47', name: 'Türkiye Taşkömürü Kurumu' },
  { id: '89', name: 'Türkiye Yazma Eserler Kurumu Başkanlığı' },
  { id: '52', name: 'Yargıtay Başkanlığı' },
  { id: '83', name: 'Yüksek Seçim Kurulu (YSK)' },
  { id: '33', name: 'Yükseköğretim Kurulu (YÖK)' }
];

const cities = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Balıkesir',
  'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli',
  'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari',
  'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
  'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir',
  'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat',
  'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman',
  'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
];

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    institution: '',
    city: '',
  });
  const [captchaValue, setCaptchaValue] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const recaptchaRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler birbiriyle eşleşmiyor.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    if (!formData.institution) {
      setError('Lütfen kurumunuzu seçiniz.');
      return;
    }

    if (!formData.city) {
      setError('Lütfen ilinizi seçiniz.');
      return;
    }

    if (!captchaValue) {
      setError('Lütfen robot olmadığınızı doğrulayın.');
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 600)); // Smooth UX delay

      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        institution: formData.institution,
        city: formData.city,
      });

      if (result.success) {
        navigate('/anasayfa');
      } else {
        setError(result.error || 'Kayıt işlemi gerçekleştirilemedi.');
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
          setCaptchaValue(null);
        }
      }
    } catch (err) {
      console.error('Register hatası:', err);
      setError('Bağlantı hatası oluştu. Lütfen tekrar deneyin.');
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setCaptchaValue(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-[#F8FAFC] font-sans">

      {/* Main Card Container - Matches Login Page Structure */}
      <div className={`w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden grid lg:grid-cols-2 min-h-[850px] transition-all duration-1000 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

        {/* Left Side: Visual/Image - TEAM/SUCCESS Theme */}
        <div className="relative hidden lg:flex flex-col justify-end p-12 bg-indigo-900 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
              alt="Team Success"
              className="w-full h-full object-cover opacity-50 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900 via-indigo-900/60 to-transparent"></div>
          </div>

          <div className="relative z-10 text-white space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-4 shadow-xl">
              <FaRocket className="text-2xl text-yellow-400" />
            </div>
            <h1 className="text-4xl font-bold leading-tight">
              Potansiyelini <br /> Keşfet.
            </h1>
            <p className="text-indigo-200 text-lg leading-relaxed max-w-md">
              UzmanGYS ailesine katılarak kariyerinde yeni bir sayfa aç. Hedeflerine ulaşmak artık daha kolay.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <div className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm font-medium backdrop-blur-sm">
                🚀 Hızlı Başlangıç
              </div>
              <div className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm font-medium backdrop-blur-sm">
                📈 Performans Takibi
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="flex flex-col justify-center p-8 lg:p-12 relative bg-white">
          <div className="w-full max-w-md mx-auto space-y-6">

            <div className="text-center lg:text-left space-y-1">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hesap Oluştur</h2>
              <p className="text-slate-500">Formu doldurarak hemen aramıza katılın.</p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-3 animate-shake">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Input: Name */}
              <div className="space-y-1.5 group">
                <label className="text-sm font-semibold text-slate-700 ml-1 block" htmlFor="name">
                  Ad Soyad
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-slate-50/30 hover:bg-white hover:border-slate-300"
                    placeholder="Adınız Soyadınız"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors">
                    <FaUser />
                  </div>
                </div>
              </div>

              {/* Input: Email */}
              <div className="space-y-1.5 group">
                <label className="text-sm font-semibold text-slate-700 ml-1 block" htmlFor="email">
                  E-posta
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-slate-50/30 hover:bg-white hover:border-slate-300"
                    placeholder="ornek@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors">
                    <FaEnvelope />
                  </div>
                </div>
              </div>

              {/* Row: Institution & City */}
              <div className="grid grid-cols-2 gap-4">
                {/* Input: Institution */}
                <div className="space-y-1.5 group col-span-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1 block" htmlFor="institution">
                    Kurum
                  </label>
                  <div className="relative">
                    <select
                      name="institution"
                      id="institution"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-slate-50/30 hover:bg-white hover:border-slate-300 appearance-none"
                      value={formData.institution}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Kurum Seçiniz</option>
                      {institutions.map((inst) => (
                        <option key={inst.id} value={inst.name}>{inst.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors">
                      <FaBuilding />
                    </div>
                  </div>
                </div>

                {/* Input: City */}
                <div className="space-y-1.5 group col-span-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1 block" htmlFor="city">
                    İl
                  </label>
                  <div className="relative">
                    <select
                      name="city"
                      id="city"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-slate-50/30 hover:bg-white hover:border-slate-300 appearance-none"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    >
                      <option value="">İl Seçiniz</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors">
                      <FaMapMarkerAlt />
                    </div>
                  </div>
                </div>
              </div>

              {/* Input: Password */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 group">
                  <label className="text-sm font-semibold text-slate-700 ml-1 block" htmlFor="password">
                    Şifre
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      id="password"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-slate-50/30 hover:bg-white hover:border-slate-300"
                      placeholder="••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors">
                      <FaLock />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 group">
                  <label className="text-sm font-semibold text-slate-700 ml-1 block" htmlFor="confirmPassword">
                    Şifre (Tekrar)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-slate-50/30 hover:bg-white hover:border-slate-300"
                      placeholder="••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors">
                      <FaLock />
                    </div>
                  </div>
                </div>
              </div>

              {/* Captcha */}
              <div className="flex justify-center pt-2">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                  onChange={handleCaptchaChange}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-xl text-white font-bold text-base shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:translate-y-[-2px] active:translate-y-[0px] transition-all duration-300 flex items-center justify-center gap-2 ${loading ? 'bg-slate-400 cursor-not-allowed transform-none' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-md"></span>
                  ) : (
                    <>
                      Kayıt Ol ve Başla
                      <FaArrowRight />
                    </>
                  )}
                </button>
              </div>

            </form>

            <p className="text-center text-slate-500 text-sm font-medium">
              Zaten hesabınız var mı?{' '}
              <Link to="/giris" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors hover:underline decoration-2 underline-offset-4">
                Giriş Yapın
              </Link>
            </p>

          </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 bg-[#F8FAFC]">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-100/40 rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl opacity-50 -translate-x-1/3 translate-y-1/3"></div>
      </div>

    </div>
  );
}

export default RegisterPage;
