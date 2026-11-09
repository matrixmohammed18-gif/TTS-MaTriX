import React, { useState } from 'react';
import {
  X,
  Crown,
  Sparkles,
  CheckCircle2,
  Mail,
  Lock,
  User as UserIcon,
  Zap,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User } from '../types/tts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  currentUser?: User | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
}) => {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('محمد');
  const [email, setEmail] = useState('matrixmohammed18@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [autoPro, setAutoPro] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleInstantProLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const proUser: User = {
        id: 'usr-pro-' + Date.now(),
        name: name.trim() || 'محمد (حساب برو)',
        email: email.trim() || 'matrixmohammed18@gmail.com',
        plan: 'pro',
        credits: 1000000,
        maxCredits: 1000000,
        isPro: true,
        proBadge: '👑 PRO 1M',
        joinedAt: new Date().toISOString(),
      };
      localStorage.setItem('darijat_tts_user', JSON.stringify(proUser));
      setIsLoading(false);
      onLoginSuccess(proUser);
      onClose();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const credits = autoPro ? 1000000 : 500;
      const user: User = {
        id: 'usr-' + Date.now(),
        name: name.trim() || 'محمد',
        email: email.trim() || 'matrixmohammed18@gmail.com',
        plan: autoPro ? 'pro' : 'free',
        credits,
        maxCredits: autoPro ? 1000000 : 500,
        isPro: autoPro,
        proBadge: autoPro ? '👑 PRO 1M' : undefined,
        joinedAt: new Date().toISOString(),
      };
      localStorage.setItem('darijat_tts_user', JSON.stringify(user));
      setIsLoading(false);
      onLoginSuccess(user);
      onClose();
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-['Tajawal',sans-serif]"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 text-white overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-400/30">
                <Crown className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-xl font-black font-['Cairo'] tracking-tight flex items-center gap-1.5">
                  <span>منصة داريجات TTS</span>
                  <span className="text-xs bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                    حساب برو VIP
                  </span>
                </h3>
                <p className="text-xs text-indigo-200 mt-0.5 font-medium">
                  سجل دخولك الآن واستلم رصيد مليون حرف (1,000,000 حرف) مجاناً
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center gap-2 mt-5 p-1 bg-white/10 backdrop-blur-md rounded-2xl relative z-10 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              إنشاء حساب جديد
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* VIP Fast Track Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <div className="flex-1">
                <h4 className="font-extrabold text-slate-900 text-sm font-['Cairo'] flex items-center gap-1.5">
                  <span>دخول فوري ومباشر بحساب PRO</span>
                  <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
                    هدية خاصة
                  </span>
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  اضغط للبدء فوراً بحساب مفعل مع <strong className="text-amber-800 font-extrabold">1,000,000 حرف</strong>، وفتح جميع الأصوات والخصائص دون انتظار.
                </p>
                <button
                  type="button"
                  onClick={handleInstantProLogin}
                  disabled={isLoading}
                  className="mt-3 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:brightness-105 active:scale-98 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Crown className="w-4 h-4 fill-current text-slate-950" />
                  <span>دخول فوري واستلام 1,000,000 حرف برو</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-slate-400">
              أو التسجيل بالبريد وكلمة المرور
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم الكامل
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="محمد"
                    className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Checkbox for 1 Million PRO plan */}
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80 cursor-pointer hover:bg-indigo-50 transition-colors">
              <input
                type="checkbox"
                checked={autoPro}
                onChange={(e) => setAutoPro(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
              />
              <div className="flex-1 text-right">
                <div className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                  <span>تفعيل باقة PRO الملكية (1,000,000 حرف) تلقائياً</span>
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  منح هذا الحساب مليون حرف مجاناً مع إمكانية تحويل حتى 50,000 حرف في الطلب.
                </p>
              </div>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer font-['Cairo']"
            >
              {isLoading ? (
                <span>جاري تسجيل الدخول...</span>
              ) : (
                <>
                  <span>
                    {mode === 'signin'
                      ? 'تسجيل الدخول إلى حسابي'
                      : 'إنشاء الحساب وتفعيل 1,000,000 حرف'}
                  </span>
                  <Zap className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social login */}
          <button
            type="button"
            onClick={handleInstantProLogin}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>متابعة بحساب Google واستلام رصيد PRO</span>
          </button>

          {/* Perks checklist */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>1,000,000 حرف رصيد هدية</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>28 صوتاً عربياً أصيلاً</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>نصوص طويلة حتى 50,000 حرف</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>أصوات Gemini 3.8 Studio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
