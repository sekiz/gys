import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaArrowLeft, FaKey } from 'react-icons/fa';

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { forgotPassword } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 600)); // Smooth delay

            const result = await forgotPassword(email);

            if (result && result.success) {
                setMessage(result.message || 'Sıfırlama bağlantısı e-posta adresinize gönderildi.');
                setEmail(''); // Clear input on success
            } else {
                setError(result?.error || 'Bir hata oluştu.');
            }
        } catch (err) {
            console.error('Forgot Password hatası:', err);
            setError('Bağlantı hatası oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-[#F8FAFC] font-sans">

            {/* Main Card Container */}
            <div className={`w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden grid lg:grid-cols-2 min-h-[600px] transition-all duration-1000 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

                {/* Left Side: Visual/Image - SECURITY Theme */}
                <div className="relative hidden lg:flex flex-col justify-end p-12 bg-slate-900 overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                            alt="Security"
                            className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                    </div>

                    <div className="relative z-10 text-white space-y-6">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-4 shadow-xl">
                            <FaKey className="text-2xl text-emerald-400" />
                        </div>
                        <h1 className="text-4xl font-bold leading-tight">
                            Hesap <br /> Güvenliği.
                        </h1>
                        <p className="text-slate-300 text-lg leading-relaxed max-w-md">
                            Hesabınıza tekrar erişim sağlamak için adımları takip edin. Güvenliğiniz bizim önceliğimizdir.
                        </p>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex flex-col justify-center p-12 lg:p-20 relative bg-white">
                    <div className="w-full max-w-sm mx-auto space-y-8">

                        <div className="text-center lg:text-left space-y-2">
                            <Link to="/giris" className="inline-flex items-center text-sm text-slate-400 hover:text-slate-600 mb-4 transition-colors">
                                <FaArrowLeft className="mr-2" />
                                Girişe Dön
                            </Link>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Şifremi Unuttum</h2>
                            <p className="text-slate-500">Kayıtlı e-posta adresinizi girerek şifre sıfırlama bağlantısı alabilirsiniz.</p>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-3 animate-shake">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium flex items-center gap-3 animate-bounce-in">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {message}
                            </div>
                        )}

                        {!message && (
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* Professional Input - Email */}
                                <div className="space-y-2 group">
                                    <label className="text-sm font-semibold text-slate-700 ml-1 block" htmlFor="email">
                                        E-posta Adresi
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
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
                                            Sıfırlama Bağlantısı Gönder
                                            <FaEnvelope />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                    </div>
                </div>
            </div>

            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-full -z-10 bg-[#F8FAFC]">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-100/30 rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl opacity-50 -translate-x-1/3 translate-y-1/3"></div>
            </div>

        </div>
    );
}

export default ForgotPasswordPage;
