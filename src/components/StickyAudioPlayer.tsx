import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  RotateCcw,
  Sparkles,
  X
} from 'lucide-react';
import { formatDuration } from '../utils/textProcessor';

interface StickyAudioPlayerProps {
  audioUrl: string | null;
  voiceName: string;
  dialectName: string;
  avatarUrl?: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClose?: () => void;
  charCount?: number;
}

export const StickyAudioPlayer: React.FC<StickyAudioPlayerProps> = ({
  audioUrl,
  voiceName,
  dialectName,
  avatarUrl,
  isPlaying,
  onTogglePlay,
  onClose,
  charCount,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.warn('Playback error:', err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, audioUrl]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      audioRef.current.playbackRate = playbackRate;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleSpeedChange = () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleVolumeToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = volume;
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `darijat-tts-${voiceName}-${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!audioUrl) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl p-3 sm:px-6 transition-all animate-in slide-in-from-bottom duration-300">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => onTogglePlay()}
      />

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 overflow-hidden">
        {/* Voice Info */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5 min-w-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={voiceName}
                className="w-10 h-10 rounded-xl object-cover shadow-xs border border-indigo-200 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 font-['Cairo'] truncate">
                  {voiceName}
                </h4>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60">
                  {dialectName}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium truncate">
                جاهز للاستماع والتحميل {charCount ? `• ${charCount} حرف` : ''}
              </p>
            </div>
          </div>

          {/* Quick close on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="sm:hidden p-1.5 text-slate-400 hover:text-slate-700"
              aria-label="إغلاق المشغل"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Center Controls & Progress Bar */}
        <div className="flex-1 w-full max-w-xl flex flex-col items-center gap-1.5">
          <div className="w-full flex items-center gap-3 text-xs font-mono text-slate-500">
            <span>{formatDuration(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span>{formatDuration(duration)}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <button
              onClick={onTogglePlay}
              className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current translate-x-[-1px]" />
              )}
            </button>

            {/* Replay 5s */}
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
                }
              }}
              className="p-1.5 text-slate-500 hover:text-slate-800 transition-colors"
              title="إرجاع 5 ثوانٍ"
              aria-label="إرجاع 5 ثوانٍ"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Speed toggle */}
            <button
              onClick={handleSpeedChange}
              className="px-2 py-1 rounded-md text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="سرعة التشغيل"
            >
              {playbackRate}x
            </button>
          </div>
        </div>

        {/* Action Buttons (Volume & Download) */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Volume toggle */}
          <button
            onClick={handleVolumeToggle}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="كتم / تفعيل الصوت"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تحميل WAV</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors ml-1"
              aria-label="إغلاق المشغل"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
