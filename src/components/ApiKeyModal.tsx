import React from 'react';
import { KeyRound, Sparkles, CheckCircle2, ShieldCheck, ExternalLink, RefreshCw, X } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onRetry }) => {
  const [checking, setChecking] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);

  if (!isOpen) return null;

  const handleCheckConnection = async () => {
    setChecking(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/tts/status');
      const data = await res.json();
      if (data.hasApiKey) {
        setIsConnected(true);
        setStatusMessage('تم الاتصال بنجاح بمحرك Gemini 3.8 Flash TTS!');
        setTimeout(() => {
          onRetry();
          onClose();
        }, 1200);
      } else {
        setStatusMessage('لم يتم العثور على المفتاح بعد. يرجى التأكد من حفظه في Settings > Secrets.');
      }
    } catch {
      setStatusMessage('تعذر التحقق من الخادم، يرجى المحاولة مرة أخرى.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden"
        dir="rtl"
      >
        {/* Glow decoration */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-indigo-600">Google AI Studio</span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Gemini 3.8 Flash TTS
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 font-['Cairo'] tracking-tight">
              تفعيل أصوات الاستوديو الحقيقية
            </h3>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium">
          هذه المنصة مخصصة حصرياً لتوليد أصوات بشرية فائقة الواقعية بدقة 24kHz عبر نموذج{' '}
          <strong className="text-indigo-700 font-extrabold">Gemini 3.8 Flash TTS</strong>، بدون أي أصوات آلية أو ترجمة عادية.
        </p>

        {/* Illustrated Steps */}
        <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <div className="text-xs text-slate-700 leading-relaxed">
              افتح لوحة الإعدادات الجانبية في المنصة (<strong className="text-slate-900">Settings</strong>).
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <div className="text-xs text-slate-700 leading-relaxed">
              اختر قسم الأسرار والمفاتيح (<strong className="text-slate-900">Secrets</strong>).
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <div className="text-xs text-slate-700 leading-relaxed">
              أضف أو فعّل مفتاح <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-mono text-[11px] text-indigo-700 font-bold">GEMINI_API_KEY</code> الخاص بك.
            </div>
          </div>
        </div>

        {/* Status message */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-bold mb-4 flex items-center gap-2 ${
              isConnected
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {isConnected ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCheckConnection}
            disabled={checking}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'جارِ فحص الاتصال...' : 'فحص اتصال Gemini الآن'}</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
