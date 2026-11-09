import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Coins,
  Crown,
  Sparkles,
  Users,
  Film,
  Menu,
  X,
  CreditCard,
  Volume2,
  LogIn,
  LogOut,
  User as UserIcon,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { User } from '../types/tts';

interface NavbarProps {
  onOpenVoiceModal: () => void;
  onOpenAiScriptModal: () => void;
  onOpenPricingModal: () => void;
  onOpenVoiceCloneModal: () => void;
  onOpenApiKeyModal?: () => void;
  hasApiKey?: boolean | null;
  userCredits: number;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onRefillProCredits: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenVoiceModal,
  onOpenAiScriptModal,
  onOpenPricingModal,
  onOpenVoiceCloneModal,
  onOpenApiKeyModal,
  hasApiKey,
  userCredits,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onRefillProCredits,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          {/* Logo Brand */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink min-w-0">
            <a href="#tts-main-card" className="flex items-center gap-1.5 group shrink min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex items-baseline gap-0.5 sm:gap-1">
                <span className="text-base sm:text-2xl font-black tracking-tight text-slate-900 font-['Cairo']">
                  داريجات
                </span>
                <span className="text-base sm:text-2xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  TTS
                </span>
              </div>
            </a>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded border border-amber-300 shrink-0">
              BETA
            </span>
            {currentUser?.isPro && (
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-full shadow-xs shrink-0">
                <Crown className="w-3 h-3 fill-current" />
                <span>حساب برو 1M</span>
              </span>
            )}
          </div>

          {/* Navigation Links Desktop */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <a
              href="#tts-main-card"
              className="px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-colors flex items-center gap-1.5"
            >
              <Mic className="w-4 h-4 text-indigo-600" />
              تحويل النص لصوت
            </a>
            <button
              onClick={onOpenVoiceModal}
              className="px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-4 h-4 text-indigo-600" />
              مكتبة الأصوات
            </button>
            <button
              onClick={onOpenAiScriptModal}
              className="px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              الكاتب الذكي
            </button>
            <button
              onClick={onOpenVoiceCloneModal}
              className="px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Film className="w-4 h-4 text-emerald-600" />
              استنساخ وتصميم
            </button>
            <a
              href="#audio-samples-section"
              className="px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-colors"
            >
              نماذج اللهجات
            </a>
          </nav>

          {/* User Credits & CTA */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Studio API Key status */}
            <button
              onClick={onOpenApiKeyModal}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
                hasApiKey
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
              title="حالة محرك Gemini 3.8 Flash TTS"
            >
              <Sparkles className={`w-3.5 h-3.5 ${hasApiKey ? 'text-emerald-600' : 'text-amber-600'} shrink-0`} />
              <span className="hidden sm:inline">
                {hasApiKey ? 'Studio متصل' : 'مفتاح Studio'}
              </span>
            </button>

            {/* Credits Pill */}
            <div
              className={`flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold shadow-2xs border ${
                currentUser?.isPro
                  ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                  : 'bg-slate-100 border-slate-200/80 text-slate-700'
              }`}
            >
              {currentUser?.isPro ? (
                <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
              ) : (
                <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              )}
              <span className="hidden md:inline text-slate-500">الرصيد:</span>
              <span className="font-extrabold text-slate-900">
                {userCredits.toLocaleString('ar-EG')}
              </span>
              <span className="hidden sm:inline text-[10px] text-slate-500">حرف</span>
            </div>

            {/* User Profile or Login CTA */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-full border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/40 transition-all cursor-pointer shadow-2xs"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-xs sm:text-sm flex items-center justify-center relative shadow-xs">
                    <span>{currentUser.name.charAt(0) || 'م'}</span>
                    {currentUser.isPro && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center text-[9px] shadow-xs">
                        👑
                      </span>
                    )}
                  </div>
                  <span className="hidden md:inline-block font-extrabold text-xs text-slate-800 max-w-[100px] truncate">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline-block" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-2 border-b border-slate-100 flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-base flex items-center justify-center">
                        {currentUser.name.charAt(0) || 'م'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <h4 className="text-xs font-black text-slate-900 truncate">
                            {currentUser.name}
                          </h4>
                          {currentUser.isPro && (
                            <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                              PRO
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>

                    <div className="my-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-right">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-950 flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                          حساب برو (PRO 1M)
                        </span>
                        <span className="font-black text-amber-900">
                          {userCredits.toLocaleString('ar-EG')} حرف
                        </span>
                      </div>
                      <div className="w-full bg-amber-200/60 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div
                          className="bg-amber-500 h-1.5 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(5, (userCredits / (currentUser.maxCredits || 1000000)) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          onRefillProCredits();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-emerald-600" />
                          شحن الرصيد إلى 1,000,000 حرف
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                          مجاناً
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenPricingModal();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4 text-indigo-600" />
                        <span>تفاصيل باقات الرصيد</span>
                      </button>

                      <div className="border-t border-slate-100 my-1 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>تسجيل الخروج</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:brightness-105 active:scale-95 text-white font-black text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
              >
                <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>دخول / حساب برو 1M</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg shrink-0"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
            {currentUser ? (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-amber-600" />
                    <span className="font-black text-xs text-slate-900">{currentUser.name}</span>
                    <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                      PRO
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-900">
                    {userCredits.toLocaleString('ar-EG')} حرف
                  </span>
                </div>
                <button
                  onClick={() => {
                    onRefillProCredits();
                    setMobileMenuOpen(false);
                  }}
                  className="mt-2 w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>إعادة شحن 1,000,000 حرف</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 mb-2"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول واستلام حساب برو 1,000,000 حرف</span>
              </button>
            )}

            <a
              href="#tts-main-card"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-indigo-50"
            >
              <Mic className="w-4 h-4 text-indigo-600" />
              تحويل النص لصوت
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenVoiceModal();
              }}
              className="w-full text-right flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-indigo-50"
            >
              <Users className="w-4 h-4 text-indigo-600" />
              مكتبة الأصوات
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAiScriptModal();
              }}
              className="w-full text-right flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-indigo-50"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              الكاتب الذكي (AI)
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenVoiceCloneModal();
              }}
              className="w-full text-right flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-indigo-50"
            >
              <Film className="w-4 h-4 text-emerald-600" />
              استنساخ وتصميم الأصوات
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPricingModal();
              }}
              className="w-full text-right flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-indigo-50"
            >
              <CreditCard className="w-4 h-4 text-indigo-600" />
              الأسعار والباقات
            </button>
            {currentUser && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full text-right flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
