import React from 'react';
import {
  X,
  Check,
  Crown,
  Zap,
  Sparkles,
  ShieldCheck,
  Coins
} from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopUpCredits: (amount: number) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onTopUpCredits,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <h3 className="text-xl font-black text-slate-900 font-['Cairo']">
                ترقية الحساب وباقات الرصيد
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              احصل على رصيد إضافي ونماذج ذكاء اصطناعي حصرية بدون حدود
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Tier */}
          <div className="rounded-2xl border border-slate-200 p-5 bg-white flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">الباقة المجانية</span>
              <h4 className="text-2xl font-black text-slate-900 mt-1 font-['Cairo']">
                0 <span className="text-sm font-medium text-slate-500">دولار / شهرياً</span>
              </h4>
              <p className="text-xs text-slate-500 mt-2">لتجربة المنصة وتحويل النصوص القصيرة</p>

              <div className="mt-4 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>500 حرف يومياً مجاناً</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>الوصول لأصوات V1 القياسية</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تنزيل ملفات الصوت بصيغة WAV</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              خطتك الحالية
            </button>
          </div>

          {/* Pro Tier (1,000,000 chars) */}
          <div className="rounded-2xl border-2 border-amber-400 p-5 bg-gradient-to-b from-amber-50/50 via-white to-amber-50/30 relative flex flex-col justify-between shadow-lg shadow-amber-500/10">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
              👑 الباقة الملكية PRO
            </span>

            <div>
              <span className="text-xs font-black text-amber-700">باقة صانع المحتوى VIP PRO</span>
              <h4 className="text-3xl font-black text-slate-900 mt-1 font-['Cairo'] flex items-baseline gap-1">
                <span>1,000,000</span>
                <span className="text-sm font-bold text-amber-600">حرف</span>
              </h4>
              <p className="text-xs text-slate-600 mt-2">الحساب الملكي المخصص لتوليد ملايين المقاطع دون توقف</p>

              <div className="mt-4 space-y-2.5 text-xs text-slate-800">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-extrabold text-indigo-950">1,000,000 حرف رصيد جاهز</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>فتح كافة أصوات الـ 28 مع محاكاة بشرية واقعية</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>استوديو المخرج مع جميع وسمات المشاعر</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>توليد حتى 50,000 حرف في الطلب الواحد</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>أصوات Gemini 3.8 Studio الحقيقية الفائقة</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onTopUpCredits(1000000);
                onClose();
              }}
              className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:brightness-105 active:scale-98 text-slate-950 font-black text-xs shadow-md shadow-amber-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Crown className="w-4 h-4 fill-current text-slate-950" />
              <span>تفعيل باقة 1,000,000 حرف الآن مجاناً</span>
            </button>
          </div>

          {/* Business / Scale Tier */}
          <div className="rounded-2xl border border-slate-200 p-5 bg-white flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">باقة الشركات والوكالات</span>
              <h4 className="text-3xl font-black text-slate-900 mt-1 font-['Cairo']">
                59 <span className="text-sm font-medium text-slate-500">دولار / شهرياً</span>
              </h4>
              <p className="text-xs text-slate-500 mt-2">للمتاجر الضخمة ووكالات التسويق والإنتاج</p>

              <div className="mt-4 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">500,000 حرف شهرياً</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>استنساخ أصوات غير محدود (Voice Cloning)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>الربط البرمجي الكامل (API Access)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>توليد متعدد لعينات الإعلانات (5 عينات بضغطة واحدة)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onTopUpCredits(500000);
                onClose();
              }}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              اختيار باقة الشركات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
