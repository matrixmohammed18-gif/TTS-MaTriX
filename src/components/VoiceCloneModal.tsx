import React, { useState } from 'react';
import {
  X,
  Upload,
  Mic,
  Sliders,
  Sparkles,
  Check,
  ShieldAlert,
  Play
} from 'lucide-react';
import { DIALECTS } from '../data/voices';
import { Voice } from '../types/tts';

interface VoiceCloneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomVoice: (voice: Voice) => void;
}

export const VoiceCloneModal: React.FC<VoiceCloneModalProps> = ({
  isOpen,
  onClose,
  onAddCustomVoice,
}) => {
  const [activeTab, setActiveTab] = useState<'clone' | 'design'>('design');
  const [voiceName, setVoiceName] = useState('');
  const [selectedDialect, setSelectedDialect] = useState('moroccan');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [personalityDesc, setPersonalityDesc] = useState('شخصية شبابية عصرية مليئة بالحماس والطاقة');
  const [pitch, setPitch] = useState('متوسط');
  const [tempo, setTempo] = useState('عادي');
  const [successMsg, setSuccessMsg] = useState(false);

  const handleCreateVoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceName.trim()) return;

    const dialectObj = DIALECTS.find((d) => d.id === selectedDialect) || DIALECTS[1];

    const customVoice: Voice = {
      id: `custom-${Date.now()}`,
      name: voiceName.trim(),
      dialectId: selectedDialect as any,
      dialectName: dialectObj.label,
      flag: dialectObj.flag,
      gender,
      personality: personalityDesc,
      avatar:
        gender === 'male'
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      prebuiltVoice: gender === 'male' ? 'Puck' : 'Kore',
      recommendedFor: ['صوت مخصص', 'استوديو المخرج'],
      isPro: true,
      sampleText: `أهلاً، أنا ${voiceName.trim()}، هذا صوتي المخصص بـ ${dialectObj.label}.`,
    };

    onAddCustomVoice(customVoice);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 font-['Cairo']">
                مختبر استنساخ وتصميم الأصوات
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                صمّم صوتاً فريداً لعلامتك التجارية أو استنسخ نبرتك الخاصة
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

        {/* Tabs */}
        <div className="px-6 pt-4 flex gap-2 border-b border-slate-100 bg-white">
          <button
            onClick={() => setActiveTab('design')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'design'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>تصميم صوت جديد (Voice Designer)</span>
          </button>
          <button
            onClick={() => setActiveTab('clone')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'clone'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>استنساخ الصوت (Voice Clone)</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'design' ? (
            <form onSubmit={handleCreateVoice} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  اسم الصوت
                </label>
                <input
                  type="text"
                  required
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="مثال: أميرة، طارق، سفيان..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    الجنس
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="male">ذكر (رجالي)</option>
                    <option value="female">أنثى (نسائي)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    اللهجة الأساسية
                  </label>
                  <select
                    value={selectedDialect}
                    onChange={(e) => setSelectedDialect(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {DIALECTS.filter((d) => d.id !== 'all').map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.flag} {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  وصف الشخصية والنبرة الصوتية (Voice Persona)
                </label>
                <textarea
                  rows={2}
                  value={personalityDesc}
                  onChange={(e) => setPersonalityDesc(e.target.value)}
                  placeholder="مثال: صوت إذاعي رنان، إيقاع هادئ وفخم..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">طبقة الصوت</label>
                  <select
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option>عميقة ورنانة (Deep)</option>
                    <option>متوسطة وطبيعية (Balanced)</option>
                    <option>حادة وشبابية (Bright)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">سرعة الإلقاء</label>
                  <select
                    value={tempo}
                    onChange={(e) => setTempo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option>هادئة ووقورة</option>
                    <option>عادية</option>
                    <option>حماسية وسريعة</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={!voiceName.trim()}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {successMsg ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>تم إنشاء الصوت وإضافته بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>حفظ وتفعيل الصوت في الاستوديو</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/40 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    ارفع ملف صوتي مدته 30 ثانية على الأقل
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-1">
                    يدعم ملفات MP3, WAV, M4A بنقاء عالي وبدون ضوضاء خلفية
                  </p>
                </div>
                <label className="inline-block px-4 py-2 bg-white border border-indigo-300 text-indigo-700 font-bold rounded-xl text-xs hover:bg-indigo-50 cursor-pointer shadow-2xs">
                  اختيار ملف صوتي
                  <input type="file" accept="audio/*" className="hidden" />
                </label>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2 leading-relaxed text-[11px]">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <span>
                  ملاحظة أخلاقية وقانونية: يجب أن تمتلك حقوق الصوت المرفوع أو
                  موافقة صاحبه الصريحة لاستخدامه في المنصة.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
