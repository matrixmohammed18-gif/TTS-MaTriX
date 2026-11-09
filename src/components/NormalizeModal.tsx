import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface NormalizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentText: string;
  dialectName: string;
  languageMode?: string;
  onApplyNormalized: (normalizedText: string) => void;
}

export const NormalizeModal: React.FC<NormalizeModalProps> = ({
  isOpen,
  onClose,
  currentText,
  dialectName,
  languageMode = 'auto',
  onApplyNormalized,
}) => {
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleNormalize = async () => {
    if (!currentText.trim()) {
      setError('يرجى كتابة نص في المحرر أولاً');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tts/normalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentText,
          dialect: dialectName,
          languageMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشلت معالجة النص');
      setResultText(data.normalizedText);
    } catch (err: any) {
      setError(err?.message || 'تعذر الاتصال بخدمة التنقية');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!resultText) return;
    onApplyNormalized(resultText);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 font-['Cairo']">
                تنقية وتشكيل النص (AI Normalizer)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                ضبط التشكيل، علامات الترقيم، والأرقام لنطق طبيعي 100%
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-blue-50 border border-blue-200/70 text-blue-800 rounded-xl leading-relaxed flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
            <span>
              تعمل هذه الميزة على تصحيح الأخطاء، وإضافة علامات الترقيم الصحيحة،
              وتشكيل الكلمات الملتبسة حسب لهجة <strong>({dialectName})</strong> لضمان مخارج حروف فائقة الدقة.
            </span>
          </div>

          <div>
            <span className="font-bold text-slate-700 block mb-1">النص الحالي:</span>
            <div className="p-3 bg-slate-100 rounded-xl text-slate-700 line-clamp-3 leading-relaxed">
              {currentText || 'لا يوجد نص حالياً'}
            </div>
          </div>

          {!resultText ? (
            <button
              onClick={handleNormalize}
              disabled={loading || !currentText.trim()}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تدقيق وتشكيل النص...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>بدء تنقية النص</span>
                </>
              )}
            </button>
          ) : (
            <div className="space-y-3 animate-in fade-in">
              <div>
                <span className="font-bold text-indigo-700 block mb-1">
                  النص المنقح والمضبوط:
                </span>
                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-slate-900 leading-relaxed font-medium">
                  {resultText}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleApply}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>استبدال النص في المحرر</span>
                </button>
                <button
                  onClick={() => setResultText('')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="p-2 bg-red-50 text-red-600 rounded-lg text-center font-bold">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
