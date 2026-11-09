import React from 'react';
import {
  Gauge,
  RotateCcw,
  Sparkles,
  Zap,
  Clock,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import {
  SPEED_PRESETS,
  getSpeedDescriptor,
  estimateDuration
} from '../utils/textProcessor';

interface SpeedControlPanelProps {
  speed: number;
  onChangeSpeed: (newSpeed: number) => void;
  inputText?: string;
}

export const SpeedControlPanel: React.FC<SpeedControlPanelProps> = ({
  speed,
  onChangeSpeed,
  inputText = '',
}) => {
  const descriptor = getSpeedDescriptor(speed);
  const currentDuration = estimateDuration(inputText, speed);
  const normalDuration = estimateDuration(inputText, 1.0);
  const durationDiff = Math.abs(currentDuration - normalDuration);

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 border-2 border-indigo-200/90 shadow-sm transition-all font-['Tajawal',sans-serif]">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-indigo-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-slate-900 font-['Cairo']">
                التحكم في سرعة القراءة والنطق
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-600 text-white font-black">
                تحكم دقيق (0.5x - 2.0x)
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              عدّل وتيرة إلقاء الصوت لتناسب الإعلانات السريعة أو الروايات والتأملات الهادئة
            </p>
          </div>
        </div>

        {/* Dynamic Badge & Reset */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${descriptor.badgeClass}`}
          >
            <span>{descriptor.emoji}</span>
            <span>{descriptor.label}</span>
          </div>

          {speed !== 1.0 && (
            <button
              type="button"
              onClick={() => onChangeSpeed(1.0)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="إعادة ضبط للسرعة الطبيعية 1.0x"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">1.0x</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Slider Area */}
      <div className="pt-4 pb-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
          <span className="flex items-center gap-1">
            <span>🐢 بطيء (0.5x)</span>
          </span>
          <span className="text-indigo-950 font-black text-sm bg-indigo-100/70 px-2.5 py-0.5 rounded-lg border border-indigo-200">
            {speed.toFixed(2)}x
          </span>
          <span className="flex items-center gap-1">
            <span>🚀 سريع (2.0x)</span>
          </span>
        </div>

        {/* Slider Input */}
        <div className="relative flex items-center">
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={speed}
            onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all"
            dir="ltr"
          />
        </div>

        {/* Scale labels */}
        <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1 mt-1.5" dir="ltr">
          <span>0.5x</span>
          <span>0.75x</span>
          <span className="text-indigo-600 font-extrabold">1.0x (طبيعي)</span>
          <span>1.25x</span>
          <span>1.5x</span>
          <span>1.75x</span>
          <span>2.0x</span>
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div className="pt-3 border-t border-slate-100">
        <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
          <span>سرعات نموذجية مسبقة الإعداد:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {SPEED_PRESETS.map((preset) => {
            const isSelected = Math.abs(speed - preset.value) < 0.02;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => onChangeSpeed(preset.value)}
                className={`px-2.5 py-2 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-white ring-2 ring-indigo-500/25 shadow-xs'
                    : 'border-slate-200 bg-white/70 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black text-slate-900 font-['Cairo']">
                    {preset.shortLabel}
                  </span>
                  <span className="text-sm">{preset.emoji}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium mt-1 truncate block">
                  {preset.label.replace(preset.shortLabel, '').trim()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Descriptor & Estimated Time Footer */}
      <div className="mt-3.5 pt-3 border-t border-indigo-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>{descriptor.description}</span>
        </div>

        {inputText.trim().length > 0 && (
          <div className="flex items-center gap-1.5 font-bold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200 shrink-0 self-start sm:self-auto shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>المدة المقدرة: ~{currentDuration} ثوانٍ</span>
            {speed !== 1.0 && durationDiff > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                  speed > 1.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {speed > 1.0 ? `توفير ~${durationDiff}ث` : `زيادة ~${durationDiff}ث`}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
