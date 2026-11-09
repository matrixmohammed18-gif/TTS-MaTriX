import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Wand2,
  Copy,
  Check,
  Send,
  Loader2,
  FileText
} from 'lucide-react';
import { DIALECTS } from '../data/voices';

interface AiScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertScript: (scriptText: string) => void;
  currentDialectName?: string;
}

export const AiScriptModal: React.FC<AiScriptModalProps> = ({
  isOpen,
  onClose,
  onInsertScript,
  currentDialectName = 'الدارجة المغربية',
}) => {
  const [dialect, setDialect] = useState(currentDialectName);
  const [category, setCategory] = useState('إعلان ترويجي حماسي (تيك توك / ريلز)');
  const [topic, setTopic] = useState('عرض تخفيضات 50% على الأحذية الرياضية مع توصيل مجاني');
  const [generatedScript, setGeneratedScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const categories = [
    'إعلان ترويجي حماسي (تيك توك / ريلز)',
    'تقييم عميل واقعي (رسالة واتساب مسموعة)',
    'مقدمة قصة أو بودكاست مشوق',
    'فيديو تعليمي أو شرح تطبيق رقمي',
    'إعلان عقارات وفاخر للشركات',
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tts/ai-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dialect, category, topic }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل توليد النص');
      }
      setGeneratedScript(data.script);
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedScript) return;
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    if (!generatedScript) return;
    onInsertScript(generatedScript);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 font-['Cairo']">
                الكاتب الذكي للسيناريوهات (AI Script)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                اكتب نصوص إعلانات وريلز جذابة ومضبوطة باللهجات في ثوانٍ
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

        {/* Body Form */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm">
          {/* Dialect Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              اللهجة المستهدفة
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DIALECTS.filter((d) => d.id !== 'all').map((d) => {
                const isSelected = dialect === d.label;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDialect(d.label)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span>{d.flag}</span>
                    <span className="truncate">{d.label.replace('اللهجة ', '')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              نوع المحتوى
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الموضوع أو المنتج أو العرض المطلوب
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="اكتب فكرة سريعة عن منتجك، متجرك، أو موضوع البودكاست..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
            />
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-105 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري صياغة السيناريو باللهجة المطلوبة...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>توليد السيناريو بالذكاء الاصطناعي</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold">
              {error}
            </div>
          )}

          {/* Result */}
          {generatedScript && (
            <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  السيناريو المقترح:
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 text-indigo-700 hover:text-indigo-900 rounded-lg hover:bg-indigo-100 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                </button>
              </div>

              <div className="p-3 bg-white rounded-xl border border-indigo-100 text-slate-800 text-xs leading-relaxed font-medium">
                {generatedScript}
              </div>

              <button
                type="button"
                onClick={handleInsert}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>إدراج في محرر الصوت الآن</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
