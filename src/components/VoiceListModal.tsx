import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Volume2,
  Play,
  Pause,
  Check,
  Wand2,
  Sparkles,
  Filter
} from 'lucide-react';
import { Voice, DialectId } from '../types/tts';
import { VOICES, DIALECTS } from '../data/voices';

interface VoiceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVoiceId: string;
  onSelectVoice: (voice: Voice) => void;
  onPreviewVoice: (voice: Voice) => void;
  previewingVoiceId: string | null;
  isPlayingPreview: boolean;
  onOpenVoiceCloneModal: () => void;
}

export const VoiceListModal: React.FC<VoiceListModalProps> = ({
  isOpen,
  onClose,
  selectedVoiceId,
  onSelectVoice,
  onPreviewVoice,
  previewingVoiceId,
  isPlayingPreview,
  onOpenVoiceCloneModal,
}) => {
  const [selectedDialect, setSelectedDialect] = useState<DialectId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');

  const filteredVoices = useMemo(() => {
    return VOICES.filter((voice) => {
      const matchesDialect =
        selectedDialect === 'all' || voice.dialectId === selectedDialect;
      const matchesGender =
        genderFilter === 'all' || voice.gender === genderFilter;
      const matchesSearch =
        voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voice.dialectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voice.personality.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDialect && matchesGender && matchesSearch;
    });
  }, [selectedDialect, genderFilter, searchQuery]);

  const activePreviewVoice = useMemo(() => {
    return VOICES.find((v) => v.id === previewingVoiceId);
  }, [previewingVoiceId]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vl2Title"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 id="vl2Title" className="text-xl sm:text-2xl font-black text-slate-900 font-['Cairo']">
              مكتبة الأصوات واللهجات
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              استمع إلى عينات الأصوات الحقيقية، ثم اختر الصوت الأنسب لمحتواك
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search & Tools */}
        <div className="px-6 py-4 border-b border-slate-100 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم الصوت، اللهجة، أو الاستخدام..."
                className="w-full pl-4 pr-10 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Gender Switch & Tools */}
            <div className="flex items-center gap-2">
              <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
                <button
                  onClick={() => setGenderFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    genderFilter === 'all'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setGenderFilter('male')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    genderFilter === 'male'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  رجالي
                </button>
                <button
                  onClick={() => setGenderFilter('female')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    genderFilter === 'female'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  نسائي
                </button>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenVoiceCloneModal();
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-700 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>صمّم صوتاً</span>
              </button>
            </div>
          </div>

          {/* Dialect Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
            {DIALECTS.map((dialect) => {
              const isActive = selectedDialect === dialect.id;
              return (
                <button
                  key={dialect.id}
                  onClick={() => setSelectedDialect(dialect.id)}
                  className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  <span>{dialect.flag}</span>
                  <span>{dialect.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Voices Grid */}
        <div className="p-6 overflow-y-auto max-h-[55vh] custom-scrollbar bg-slate-50/50">
          {filteredVoices.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-bold">لم يتم العثور على أصوات مطابقة لبحثك</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDialect('all');
                  setGenderFilter('all');
                }}
                className="mt-3 text-xs text-indigo-600 hover:underline font-bold"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVoices.map((voice) => {
                const isSelected = selectedVoiceId === voice.id;
                const isThisPlaying =
                  previewingVoiceId === voice.id && isPlayingPreview;

                return (
                  <div
                    key={voice.id}
                    className={`relative group bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20 shadow-md'
                        : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Top voice info */}
                      <div className="flex items-center gap-3">
                        <img
                          src={voice.avatar}
                          alt={voice.name}
                          className="w-12 h-12 rounded-xl object-cover shadow-xs border border-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-bold text-slate-900 text-base font-['Cairo']">
                              {voice.name}
                            </h3>
                            <span className="text-xs">{voice.flag}</span>
                            {voice.isPro && (
                              <span className="px-1.5 py-0.5 rounded-sm text-[10px] font-extrabold bg-amber-100 text-amber-800">
                                PRO
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-indigo-600 font-bold block truncate">
                            {voice.dialectName}
                          </span>
                        </div>

                        {/* Preview Audio Play Button */}
                        <button
                          onClick={() => onPreviewVoice(voice)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isThisPlaying
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105'
                              : 'bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-600'
                          }`}
                          aria-label={`استمع لصوت ${voice.name}`}
                          title={`استمع لصوت ${voice.name}`}
                        >
                          {isThisPlaying ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current translate-x-[-1px]" />
                          )}
                        </button>
                      </div>

                      {/* Personality / Description */}
                      <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                        {voice.personality}
                      </p>

                      {/* Recommended tags */}
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {voice.recommendedFor.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Choose Action */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-600">
                        {voice.gender === 'male' ? 'صوت رجالي' : 'صوت نسائي'}
                      </span>
                      <button
                        onClick={() => {
                          onSelectVoice(voice);
                          onClose();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-900 text-white hover:bg-indigo-600'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>الصوت المختار</span>
                          </>
                        ) : (
                          <span>اختيار هذا الصوت</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Bottom Preview Sticky Bar */}
        {activePreviewVoice && (
          <div className="px-6 py-3.5 bg-indigo-900 text-white border-t border-indigo-950 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => onPreviewVoice(activePreviewVoice)}
                className="w-9 h-9 rounded-full bg-white text-indigo-900 flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
                aria-label="تشغيل / إيقاف العينة"
              >
                {isPlayingPreview ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current translate-x-[-1px]" />
                )}
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white font-['Cairo'] truncate">
                    عينة: {activePreviewVoice.name}
                  </span>
                  <span className="text-xs text-indigo-200">
                    ({activePreviewVoice.dialectName})
                  </span>
                </div>
                {/* Visualizer animation bar */}
                <div className="flex items-center gap-1 mt-1 h-3">
                  <div className={`w-1 bg-amber-400 rounded-full ${isPlayingPreview ? 'animate-wave-1' : 'h-1'}`} />
                  <div className={`w-1 bg-amber-400 rounded-full ${isPlayingPreview ? 'animate-wave-2' : 'h-2'}`} />
                  <div className={`w-1 bg-amber-400 rounded-full ${isPlayingPreview ? 'animate-wave-3' : 'h-1.5'}`} />
                  <div className={`w-1 bg-amber-400 rounded-full ${isPlayingPreview ? 'animate-wave-4' : 'h-2.5'}`} />
                  <div className={`w-1 bg-amber-400 rounded-full ${isPlayingPreview ? 'animate-wave-5' : 'h-1'}`} />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onSelectVoice(activePreviewVoice);
                onClose();
              }}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-colors shrink-0"
            >
              استخدام صوت {activePreviewVoice.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
