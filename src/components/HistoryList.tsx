import React from 'react';
import {
  History,
  Play,
  Pause,
  Download,
  Copy,
  Trash2,
  Star,
  Check,
  Headphones
} from 'lucide-react';
import { HistoryItem } from '../types/tts';
import { formatDuration } from '../utils/textProcessor';

interface HistoryListProps {
  items: HistoryItem[];
  activeAudioUrl: string | null;
  isPlaying: boolean;
  onPlayItem: (item: HistoryItem) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  items,
  activeAudioUrl,
  isPlaying,
  onPlayItem,
  onToggleFavorite,
  onDeleteItem,
  onClearAll,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (item: HistoryItem) => {
    const link = document.createElement('a');
    link.href = item.audioUrl;
    link.download = `tts-${item.voiceName}-${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-600" />
          <h3 className="font-black text-slate-900 text-sm font-['Cairo']">
            التحويلات السابقة
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
            {items.length}
          </span>
        </div>

        {items.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-[11px] text-red-500 hover:text-red-700 font-bold transition-colors cursor-pointer"
          >
            مسح السجل
          </button>
        )}
      </div>

      {/* Items List */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[550px] custom-scrollbar space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Headphones className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700">
              لا توجد تحويلات سابقة حتى الآن
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
              قم بكتابة نص واضغط "إنتاج الصوت" لتظهر المقاطع الصوتية المنشأة هنا
            </p>
          </div>
        ) : (
          items.map((item) => {
            const isThisPlaying = activeAudioUrl === item.audioUrl && isPlaying;
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isThisPlaying
                    ? 'border-indigo-500 bg-indigo-50/40 shadow-xs'
                    : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                {/* Top Info */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm">{item.flag}</span>
                    <span className="font-bold text-xs text-slate-900 truncate font-['Cairo']">
                      {item.voiceName}
                    </span>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded font-bold">
                      {item.dialectName}
                    </span>
                    {item.languageMode === 'fr' && (
                      <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded font-bold" title="وضع الكلمات الفرنسية">
                        🇫🇷 FR
                      </span>
                    )}
                    {item.languageMode === 'en' && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-bold" title="وضع الكلمات الإنجليزية">
                        🇬🇧 EN
                      </span>
                    )}
                    {item.languageMode === 'ar' && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-bold" title="عربية فصحى">
                        📖 فصحى
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatDuration(item.duration)}
                  </span>
                </div>

                {/* Text Excerpt */}
                <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed mb-3 font-medium">
                  {item.text}
                </p>

                {/* Actions Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  {/* Play Button */}
                  <button
                    onClick={() => onPlayItem(item)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      isThisPlaying
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-800 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    {isThisPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>إيقاف</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>تشغيل</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyText(item.id, item.text)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-white transition-colors"
                      title="نسخ النص"
                      aria-label="نسخ النص"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDownload(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-white transition-colors"
                      title="تحميل المقطع الصوتي"
                      aria-label="تحميل المقطع الصوتي"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onToggleFavorite(item.id)}
                      className={`p-1.5 rounded-md hover:bg-white transition-colors ${
                        item.isFavorite
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-400 hover:text-amber-500'
                      }`}
                      title="المفضلة"
                      aria-label="المفضلة"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-white transition-colors"
                      title="حذف"
                      aria-label="حذف المقطع"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
