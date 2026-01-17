import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaBuilding, FaArrowRight } from 'react-icons/fa';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      const result = await login({ email, password });

      if (result && result.success) {
        if (result.user?.role === 'ADMIN') {
          navigate('/yonetim');
        } else {
          navigate('/anasayfa');
        }
      } else {
        setError(result?.error || 'Giriş bilgileri doğrulanamadı.');
      }
    } catch (err) {
      console.error('Login hatası:', err);
      setError(err.message || 'Sistem bağlantısında sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-[#F8FAFC] font-sans">

      {/* Main Card Container */}
      <div className={`w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden grid lg:grid-cols-2 min-h-[700px] transition-all duration-1000 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

        {/* Left Side: Visual/Image */}
        <div className="relative hidden lg:flex flex-col justify-end p-12 bg-slate-900 overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
              alt="Office"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          </div>

          {/* Content on Image */}
          <div className="relative z-10 text-white space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-4 shadow-xl">
              <FaBuilding className="text-2xl text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold leading-tight">
              Profesyonel Kariyer <br /> Yolculuğunuz.
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-md">
              UzmanGYS ile görevde yükselme sınavlarına en güncel kaynaklarla, sistematik ve güvenle hazırlanın.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700"></div>
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-600"></div>
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-500 flex items-center justify-center text-xs font-bold">+2k</div>
              </div>
              <span className="text-sm font-medium text-slate-300">Memur adayının tercihi</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex flex-col justify-center p-12 lg:p-20 relative bg-white">
          <div className="w-full max-w-sm mx-auto space-y-10">

            <div className="text-center lg:text-left space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Giriş Yap</h2>
              <p className="text-slate-500">Platforma erişmek için bilgilerinizi giriniz.</p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-3 animate-shake">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Professional Input - Email */}
              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-slate-700 ml-1 block" htmlFor="email">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="email"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-slate-50/30 hover:bg-white hover:border-slate-300"
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors">
                    <FaEnvelope />
                  </div>
                </div>
              </div>

              {/* Professional Input - Password */}
              <div className="space-y-2 group">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-semibold text-slate-700 block" htmlFor="password">
                    Şifre
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-slate-50/30 hover:bg-white hover:border-slate-300"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors">
                    <FaLock />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer group select-none">
                  <div className="relative flex items-center">
                    <input type="checkbox" className="peer w-5 h-5 border-2 border-slate-300 rounded text-blue-600 focus:ring-blue-500/20 transition-all checked:border-blue-600 checked:bg-blue-600 appearance-none bg-white" />
                    <FaArrowRight className="absolute w-2.5 h-2.5 text-white left-1 opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors font-medium">Beni hatırla</span>
                </label>
                <Link to="/sifremi-unuttum" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors hover:underline decoration-2 underline-offset-4">
                  Şifremi unuttum?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 rounded-xl text-white font-bold text-base shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:translate-y-[-2px] active:translate-y-[0px] transition-all duration-300 flex items-center justify-center gap-2 ${loading ? 'bg-slate-400 cursor-not-allowed transform-none' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-md"></span>
                ) : (
                  <>
                    Giriş Yap
                    <FaArrowRight />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-slate-500 text-sm font-medium">
              Henüz erişiminiz yok mu?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold transition-colors hover:underline decoration-2 underline-offset-4">
                Kayıt Oluştur
              </Link>
            </p>

          </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 bg-[#F8FAFC]">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-3xl opacity-50 -translate-x-1/3 translate-y-1/3"></div>
      </div>

    </div>
  );
}

export default LoginPage;
