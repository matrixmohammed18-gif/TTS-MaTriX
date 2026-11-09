import React from 'react';
import {
  Play,
  Pause,
  Sparkles,
  ArrowRight,
  Headphones,
  CheckCircle2
} from 'lucide-react';
import { SAMPLE_SCRIPTS, VOICES } from '../data/voices';

interface SamplesShowcaseProps {
  onLoadSample: (text: string, voiceId: string) => void;
  onPreviewSample: (voiceId: string, sampleText: string) => void;
  previewingSampleVoiceId: string | null;
  isPlayingPreview: boolean;
}

export const SamplesShowcase: React.FC<SamplesShowcaseProps> = ({
  onLoadSample,
  onPreviewSample,
  previewingSampleVoiceId,
  isPlayingPreview,
}) => {
  return (
    <section id="audio-samples-section" className="py-16 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-black mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>واقعية بشرية لا تضاهى</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Cairo'] tracking-tight">
            استكشف عينات الأصوات الحية بمختلف اللهجات العربية
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            تم توليد هذه النماذج بواسطة محرك Gemini 3.8 Flash TTS مع تطبيق تقنيات استوديو المخرج والمحاكاة البشرية. اضغط للاستماع أو لتجربة النص مباشرة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {SAMPLE_SCRIPTS.map((sample, idx) => {
            const voice = VOICES.find((v) => v.id === sample.voiceId) || VOICES[0];
            const isPlayingThis =
              previewingSampleVoiceId === voice.id && isPlayingPreview;

            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={voice.avatar}
                      alt={voice.name}
                      className="w-12 h-12 rounded-2xl object-cover shadow-xs border border-indigo-100"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-base">{voice.flag}</span>
                        <h3 className="font-extrabold text-sm text-slate-900 font-['Cairo'] truncate">
                          {voice.name}
                        </h3>
                      </div>
                      <span className="text-xs text-indigo-600 font-bold block truncate">
                        {sample.dialect}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-bold text-xs text-slate-800 mb-2">
                    {sample.title}
                  </h4>

                  {/* Sample Excerpt */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 font-medium">
                    "{sample.text}"
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onPreviewSample(voice.id, sample.text)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isPlayingThis
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                    }`}
                  >
                    {isPlayingThis ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>إيقاف</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>استمع للعينة</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onLoadSample(sample.text, voice.id)}
                    className="text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>تجربة هذا النص</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
