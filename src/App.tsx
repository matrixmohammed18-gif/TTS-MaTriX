import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Volume2,
  Play,
  Pause,
  Sparkles,
  Download,
  RotateCcw,
  Sliders,
  ChevronDown,
  Trash2,
  Wand2,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Info,
  Maximize2,
  Minimize2,
  HelpCircle,
  Brain,
  Layers,
  Flame,
  Laugh,
  Wind,
  Coffee,
  Coins,
  Crown,
  ChevronLeft,
  MessageCircle,
  Users,
  Languages
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { VoiceListModal } from './components/VoiceListModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { StickyAudioPlayer } from './components/StickyAudioPlayer';
import { AiScriptModal } from './components/AiScriptModal';
import { NormalizeModal } from './components/NormalizeModal';
import { VoiceCloneModal } from './components/VoiceCloneModal';
import { PricingModal } from './components/PricingModal';
import { AuthModal } from './components/AuthModal';
import { HistoryList } from './components/HistoryList';
import { SamplesShowcase } from './components/SamplesShowcase';
import { VOICES, DIRECTOR_PRESETS, QUICK_TAGS, SAMPLE_SCRIPTS } from './data/voices';
import { Voice, HistoryItem, DirectorPreset, User } from './types/tts';
import {
  wrapSelectionWithTag,
  insertBurstTag,
  estimateDuration,
  formatDuration,
  LANGUAGE_OPTIONS,
  LanguageMode
} from './utils/textProcessor';

export default function App() {
  // Main form states
  const [activeTab, setActiveTab] = useState<'v2' | 'v1'>('v2');
  const [inputText, setInputText] = useState(
    'السلام عليكم خوتي! مرحبا بكم فمنصة داريجات TTS، اليوم غانوريكم كيفاش الذكاء الاصطناعي كيهضر بالدارجة المغربية وبكاع اللهجات العربية بنبرة بشرية حقيقية.'
  );
  const [selectedVoice, setSelectedVoice] = useState<Voice>(VOICES[0]);
  const [speed, setSpeed] = useState<number>(1.0);
  const [languageMode, setLanguageMode] = useState<LanguageMode>('auto');
  const [humanSimulation, setHumanSimulation] = useState<boolean>(true);
  const [directorMode, setDirectorMode] = useState<boolean>(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('tiktok-ad');
  const [customDirectorPrompt, setCustomDirectorPrompt] = useState<string>('');
  const [customTagInput, setCustomTagInput] = useState<string>('');
  const [showCustomTagInput, setShowCustomTagInput] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Default PRO account with 1,000,000 characters
  const DEFAULT_PRO_USER: User = {
    id: 'usr-pro-vip',
    name: 'محمد',
    email: 'matrixmohammed18@gmail.com',
    plan: 'pro',
    credits: 1000000,
    maxCredits: 1000000,
    isPro: true,
    proBadge: '👑 PRO 1M',
    joinedAt: new Date().toISOString(),
  };

  // User state (persistent, initialized with requested 1,000,000 PRO account)
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('darijat_tts_user');
      if (saved) return JSON.parse(saved);
      localStorage.setItem('darijat_tts_user', JSON.stringify(DEFAULT_PRO_USER));
      return DEFAULT_PRO_USER;
    } catch {
      return DEFAULT_PRO_USER;
    }
  });

  // User credits
  const [userCredits, setUserCredits] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('darijat_tts_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (typeof u.credits === 'number') return u.credits;
      }
      return 1000000;
    } catch {
      return 1000000;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Generation & progress state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastModelUsed, setLastModelUsed] = useState<string | null>(null);

  // Audio playback state
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);

  // History state
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('darijat_tts_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Modals state
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isAiScriptModalOpen, setIsAiScriptModalOpen] = useState(false);
  const [isNormalizeModalOpen, setIsNormalizeModalOpen] = useState(false);
  const [isVoiceCloneModalOpen, setIsVoiceCloneModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  // Check Gemini Studio API status
  const checkApiKeyStatus = async () => {
    try {
      const res = await fetch('/api/tts/status');
      const data = await res.json();
      setHasApiKey(Boolean(data.hasApiKey));
    } catch {
      setHasApiKey(false);
    }
  };

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  // Textarea Ref for cursor insertion
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Save history on changes
  useEffect(() => {
    try {
      localStorage.setItem('darijat_tts_history', JSON.stringify(historyItems));
    } catch {
      // ignore
    }
  }, [historyItems]);

  // Insert tag helper
  const handleWrapEmotion = (emotionTag: string) => {
    if (!textareaRef.current) return;
    const { selectionStart, selectionEnd } = textareaRef.current;
    const { newText, newCursor } = wrapSelectionWithTag(
      inputText,
      selectionStart,
      selectionEnd,
      emotionTag
    );
    setInputText(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursor, newCursor);
      }
    }, 10);
  };

  const handleInsertBurst = (burstTag: string) => {
    if (!textareaRef.current) return;
    const { selectionStart } = textareaRef.current;
    const { newText, newCursor } = insertBurstTag(
      inputText,
      selectionStart,
      burstTag
    );
    setInputText(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursor, newCursor);
      }
    }, 10);
  };

  // Auth & PRO account handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setUserCredits(user.credits);
    try {
      localStorage.setItem('darijat_tts_user', JSON.stringify(user));
    } catch {}
  };

  const handleLogout = () => {
    const guestUser: User = {
      id: 'guest',
      name: 'زائر',
      email: '',
      plan: 'free',
      credits: 500,
      maxCredits: 500,
      isPro: false,
    };
    setCurrentUser(guestUser);
    setUserCredits(500);
    try {
      localStorage.removeItem('darijat_tts_user');
    } catch {}
  };

  const handleRefillProCredits = () => {
    const updated: User = {
      ...(currentUser || DEFAULT_PRO_USER),
      plan: 'pro',
      credits: 1000000,
      maxCredits: 1000000,
      isPro: true,
      proBadge: '👑 PRO 1M',
    };
    setCurrentUser(updated);
    setUserCredits(1000000);
    try {
      localStorage.setItem('darijat_tts_user', JSON.stringify(updated));
    } catch {}
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleTopUpCredits = (amount: number) => {
    const newCredits = (currentUser?.credits || userCredits) + amount;
    const isNowPro = true;
    const updated: User = {
      ...(currentUser || DEFAULT_PRO_USER),
      credits: newCredits,
      maxCredits: Math.max(currentUser?.maxCredits || 1000000, newCredits),
      plan: 'pro',
      isPro: isNowPro,
      proBadge: '👑 PRO 1M',
    };
    setCurrentUser(updated);
    setUserCredits(newCredits);
    try {
      localStorage.setItem('darijat_tts_user', JSON.stringify(updated));
    } catch {}
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Generate Audio via Server API
  const handleGenerateAudio = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) {
      setErrorMessage('يرجى إدخال النص المطلوب تحويله');
      return;
    }

    const maxAllowedLength = currentUser?.isPro ? 50000 : 500;
    if (inputText.length > maxAllowedLength) {
      setErrorMessage(
        `النص المدخل (${inputText.length.toLocaleString('ar-EG')} حرف) يتجاوز الحد الأقصى المسموح به (${maxAllowedLength.toLocaleString('ar-EG')} حرف).`
      );
      return;
    }

    if (inputText.length > userCredits) {
      setErrorMessage(
        `رصيدك الحالي (${userCredits.toLocaleString('ar-EG')} حرف) غير كافٍ لتوليد هذا النص. يرجى شحن رصيد إضافي مجاناً.`
      );
      setIsPricingModalOpen(true);
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);
    setGenerationStep(1);

    // Step progression animation
    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1100);

    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText.trim(),
          voiceId: selectedVoice.id,
          speed,
          humanSimulation,
          directorPrompt: directorMode ? customDirectorPrompt : '',
          selectedPresetId: directorMode ? selectedPresetId : '',
          preferredModel: activeTab === 'v1' ? 'gemini-3.8-flash-lite-tts' : 'auto',
          languageMode,
        }),
      });

      const data = await response.json();
      clearInterval(stepInterval);

      if (!response.ok) {
        if (response.status === 401 || data.error === 'missing_api_key') {
          setHasApiKey(false);
          setIsApiKeyModalOpen(true);
          throw new Error('يرجى تفعيل GEMINI_API_KEY في إعدادات المنصة (Settings > Secrets) لتشغيل أصوات Gemini 3.8 Flash TTS.');
        }
        if (response.status === 429 || data.error === 'quota_exceeded') {
          throw new Error(data.message || 'تم تجاوز الحصة اليومية المجانية من Google Gemini. يمكنك استخدام النموذج V1 السريع.');
        }
        throw new Error(data.message || data.error || 'حدث خطأ في توليد الصوت');
      }

      setHasApiKey(true);
      setLastModelUsed(data.modelUsed || (activeTab === 'v1' ? 'gemini-3.8-flash-lite-tts' : 'gemini-3.8-flash-tts'));
      const audioUrl = `data:audio/wav;base64,${data.audioBase64}`;
      setCurrentAudioUrl(audioUrl);
      setIsPlayingAudio(true);

      // Decrement credits
      setUserCredits((prev) => {
        const next = Math.max(0, prev - inputText.length);
        if (currentUser) {
          const updatedUser = { ...currentUser, credits: next };
          setCurrentUser(updatedUser);
          try {
            localStorage.setItem('darijat_tts_user', JSON.stringify(updatedUser));
          } catch {}
        }
        return next;
      });

      // Add to history
      const newHistoryItem: HistoryItem = {
        id: `gen-${Date.now()}`,
        text: inputText.trim(),
        voiceId: selectedVoice.id,
        voiceName: selectedVoice.name,
        dialectName: selectedVoice.dialectName,
        flag: selectedVoice.flag,
        audioUrl,
        duration: data.durationEstimate || estimateDuration(inputText, speed),
        createdAt: Date.now(),
        humanSimulation,
        speed,
        languageMode,
      };

      setHistoryItems((prev) => [newHistoryItem, ...prev]);

      // Fire festive celebratory confetti!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error(err);
      setErrorMessage(
        err?.message || 'تعذر توليد الصوت. يرجى التأكد من الاتصال ومفتاح API.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Preview Voice Sample (always uses fast flash-lite-tts so as not to consume daily quota)
  const handlePreviewVoice = (voice: Voice, customText?: string) => {
    if (previewingVoiceId === voice.id && isPlayingPreview) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setIsPlayingPreview(false);
      setPreviewingVoiceId(null);
      return;
    }

    setPreviewingVoiceId(voice.id);
    setIsPlayingPreview(true);

    const textToSpeak = customText || voice.sampleText;

    // Call API to synthesize voice sample with authentic voice profile
    fetch('/api/tts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: textToSpeak,
        voiceId: voice.id,
        speed: 1.0,
        humanSimulation: true,
        preferredModel: 'gemini-3.8-flash-lite-tts',
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401 || data.error === 'missing_api_key') {
            setHasApiKey(false);
            setIsApiKeyModalOpen(true);
          }
          throw new Error(data.message || data.error || 'تعذر تشغيل عينة الصوت');
        }
        setHasApiKey(true);
        return data;
      })
      .then((data) => {
        if (data.audioBase64) {
          const url = `data:audio/wav;base64,${data.audioBase64}`;
          if (previewAudioRef.current) {
            previewAudioRef.current.src = url;
            previewAudioRef.current.onended = () => {
              setIsPlayingPreview(false);
              setPreviewingVoiceId(null);
            };
            previewAudioRef.current.play().catch((e) => {
              console.warn('Playback error:', e);
              setIsPlayingPreview(false);
              setPreviewingVoiceId(null);
            });
          }
        }
      })
      .catch((err) => {
        console.warn('Voice preview error:', err);
        setIsPlayingPreview(false);
        setPreviewingVoiceId(null);
      });
  };

  // Carousel quick selection
  const handlePrevVoice = () => {
    const currentIdx = VOICES.findIndex((v) => v.id === selectedVoice.id);
    const prevIdx = (currentIdx - 1 + VOICES.length) % VOICES.length;
    setSelectedVoice(VOICES[prevIdx]);
  };

  const handleNextVoice = () => {
    const currentIdx = VOICES.findIndex((v) => v.id === selectedVoice.id);
    const nextIdx = (currentIdx + 1) % VOICES.length;
    setSelectedVoice(VOICES[nextIdx]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-['Tajawal',sans-serif] overflow-x-hidden w-full">
      {/* Hidden Audio for voice previews */}
      <audio
        ref={previewAudioRef}
        onEnded={() => {
          setIsPlayingPreview(false);
          setPreviewingVoiceId(null);
        }}
      />

      {/* Navbar */}
      <Navbar
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenAiScriptModal={() => setIsAiScriptModalOpen(true)}
        onOpenPricingModal={() => setIsPricingModalOpen(true)}
        onOpenVoiceCloneModal={() => setIsVoiceCloneModalOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasApiKey={hasApiKey}
        userCredits={userCredits}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onRefillProCredits={handleRefillProCredits}
      />

      {/* Hero Header Section */}
      <section className="pt-10 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-black mb-4 shadow-2xs">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>منصة الذكاء الاصطناعي الأقوى لتحويل النصوص إلى كلام عربي</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight font-['Cairo'] leading-tight">
          حوّل أي نص إلى{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 bg-clip-text text-transparent">
            صوت بشري واقعي
          </span>{' '}
          بلهجتك المفضلة
        </h1>

        <p className="mt-4 max-w-3xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
          دعم فائق للدارجة المغربية، واللهجة السعودية، والمصرية، والخليجية، والشامية، والعربية الفصحى. أصوات تنبض بالحياة مع مشاعر، وتنفس، وإخراج سينمائي احترافي.
        </p>

        {/* Feature badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-6 text-xs font-bold text-slate-700">
          <span className="px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-2xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            +{VOICES.length} صوتاً ولهجة عربية
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-2xs flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-indigo-600" />
            محاكاة بشرية ونبرات حية
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-2xs flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            توليد فوري بجودة 24kHz WAV
          </span>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: The Main TTS Card (#tts-main-card) */}
          <div className="lg:col-span-8">
            <div
              id="tts-main-card"
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden transition-all"
            >
              {/* Card Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 font-['Cairo']">
                      تحويل النص إلى صوت
                    </h2>
                  </div>
                </div>

                {/* Model V1 / V2 Switch Tabs */}
                <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-2xl">
                  <button
                    onClick={() => setActiveTab('v1')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      activeTab === 'v1'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>النموذج V1 (السريع)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('v2')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'v2'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>النموذج V2 (فائق الواقعية)</span>
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* V2 / V1 Header Badge & Notice */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-violet-50/60 to-slate-50 border border-indigo-100 mb-5">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsApiKeyModalOpen(true)}
                      className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="فحص إعدادات محرك Gemini Studio"
                    >
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>{activeTab === 'v1' ? 'Gemini 3.8 Flash Lite TTS' : 'Gemini 3.8 Flash TTS'}</span>
                      {hasApiKey === false && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                    </button>
                    <span className="text-xs font-bold text-slate-700">
                      {activeTab === 'v1'
                        ? 'توليد سريع جداً بحصة استخدام واسعة وأصوات 24kHz ناصعة'
                        : 'واقعية صوتية تفوق 98% مع ضبط النطق واللهجة واستوديو المخرج'}
                    </span>
                  </div>

                  <button
                    onClick={() => setIsPricingModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-2xs transition-colors cursor-pointer"
                  >
                    <Crown className="w-3 h-3 text-amber-950" />
                    <span>ترقية السعة</span>
                  </button>
                </div>

                {/* PRO User Greetings Banner */}
                {currentUser?.isPro && (
                  <div className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-orange-500/10 border-2 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3 text-right w-full sm:w-auto">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
                        <Crown className="w-5 h-5 fill-current text-slate-950" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 font-['Cairo']">
                            أهلاً بك، {currentUser.name} | حساب PRO نشط
                          </h4>
                          <span className="text-[10px] bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black border border-amber-500/30">
                            1,000,000 حرف
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          رصيدك المتوفر: <strong className="text-slate-900 font-extrabold">{userCredits.toLocaleString('ar-EG')}</strong> حرف (توليد حتى 50,000 حرف في الطلب الواحد).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={handleRefillProCredits}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 fill-current" />
                        <span>إعادة شحن 1,000,000 حرف</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Voice Selection Toolbar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-indigo-600" />
                      اختر الصوت واللهجة:
                    </label>
                    <button
                      onClick={() => setIsVoiceModalOpen(true)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>عرض كل الأصوات ({VOICES.length})</span>
                    </button>
                  </div>

                  {/* Main Voice Selector Button */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setIsVoiceModalOpen(true)}
                      className="flex-1 p-3 rounded-2xl border-2 border-indigo-600 bg-indigo-50/40 hover:bg-indigo-50/80 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedVoice.avatar}
                          alt={selectedVoice.name}
                          className="w-12 h-12 rounded-xl object-cover shadow-xs border border-indigo-200"
                        />
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-base text-slate-900 font-['Cairo']">
                              {selectedVoice.name}
                            </span>
                            <span className="text-base">{selectedVoice.flag}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                              {selectedVoice.dialectName}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium truncate max-w-[280px] sm:max-w-[380px]">
                            {selectedVoice.personality}
                          </p>
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-indigo-100 group-hover:bg-indigo-200 text-indigo-700 flex items-center justify-center transition-colors">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    {/* Speed Selector */}
                    <div className="sm:w-40 flex flex-col justify-center">
                      <label className="text-[11px] font-bold text-slate-500 mb-1">
                        سرعة القراءة
                      </label>
                      <select
                        value={speed}
                        onChange={(e) => setSpeed(parseFloat(e.target.value))}
                        className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="0.7">0.7x أبطأ</option>
                        <option value="0.8">0.8x هادئ</option>
                        <option value="1.0">1.0x السرعة الطبيعية</option>
                        <option value="1.2">1.2x سريع</option>
                        <option value="1.4">1.4x أسرع (إعلانات)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Language & Loanwords Pronunciation Mode */}
                <div className="mb-4 p-3.5 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 rounded-2xl border border-indigo-100 shadow-2xs">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Languages className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <label className="text-xs font-black text-slate-900 font-['Cairo']">
                            لغة النص وضبط مخارج الكلمات الأجنبية:
                          </label>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                            دقة النطق
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-tight">
                          توجيه النموذج لنطق الكلمات الفرنسية والإنجليزية بدقة مخارجها الأصلية داخل اللهجة
                        </p>
                      </div>
                    </div>

                    {/* Language Selection Segmented Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {LANGUAGE_OPTIONS.map((lang) => {
                        const isSelected = languageMode === lang.id;
                        return (
                          <button
                            key={lang.id}
                            type="button"
                            onClick={() => setLanguageMode(lang.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-500/20'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300'
                            }`}
                            title={`${lang.description}\n${lang.examples}`}
                          >
                            <span className="text-sm">{lang.flag}</span>
                            <span>{lang.shortName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active language guidance hint */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-600 gap-1 sm:gap-2">
                    <span className="font-medium">
                      <strong className="text-slate-800">التوجيه المطبق: </strong>
                      {LANGUAGE_OPTIONS.find((l) => l.id === languageMode)?.description}
                    </span>
                    <span className="text-indigo-700 font-semibold text-[10px] bg-indigo-50/90 px-2 py-0.5 rounded-lg border border-indigo-100/80 shrink-0">
                      {LANGUAGE_OPTIONS.find((l) => l.id === languageMode)?.examples}
                    </span>
                  </div>
                </div>

                {/* Director Quick Tags Bar (المشاعر والتأثيرات الصوتية) */}
                <div className="p-3.5 bg-slate-100/80 rounded-2xl border border-slate-200/70 mb-4 space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      المشاعر والتوجيه (تغليف النص المحدد):
                    </span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {QUICK_TAGS.emotions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleWrapEmotion(item.tag)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title={`تغليف النص بـ ${item.label}`}
                        >
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Laugh className="w-3.5 h-3.5 text-indigo-600" />
                      مؤثرات بشرية (تدرج في مكان المؤشر):
                    </span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {QUICK_TAGS.bursts.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleInsertBurst(item.tag)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowCustomTagInput(!showCustomTagInput)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 flex items-center gap-1 cursor-pointer"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>وصف مخصص...</span>
                      </button>
                    </div>
                  </div>

                  {showCustomTagInput && (
                    <div className="pt-2 flex items-center gap-2 animate-in fade-in">
                      <input
                        type="text"
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        placeholder="اكتب وصف شعور، مثال: بنبرة مشوقة مع ابتسامة عريضة"
                        className="flex-1 px-3 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customTagInput.trim()) {
                            handleWrapEmotion(customTagInput.trim());
                            setCustomTagInput('');
                            setShowCustomTagInput(false);
                          }
                        }}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                      >
                        تطبيق
                      </button>
                    </div>
                  )}
                </div>

                {/* Editor Textarea with Toolbar */}
                <div className={`relative border rounded-3xl transition-all ${
                  isFullscreen
                    ? 'fixed inset-4 z-50 bg-white p-6 shadow-2xl flex flex-col'
                    : 'border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20'
                }`}>
                  {/* Textarea Toolbar */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/70 rounded-t-3xl">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsNormalizeModalOpen(true)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-indigo-600 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="تنقية النص وتشكيله"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>تنقية وتشكيل النص</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsAiScriptModalOpen(true)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-300 text-amber-600 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="الكاتب الذكي"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>الكاتب الذكي</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                      <button
                        type="button"
                        onClick={() => setInputText('')}
                        className="p-1 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="مسح النص"
                        aria-label="مسح النص"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-1 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                        title={isFullscreen ? 'تصغير' : 'تكبير الشاشة'}
                        aria-label="تكبير مساحة الكتابة"
                      >
                        {isFullscreen ? (
                          <Minimize2 className="w-4 h-4" />
                        ) : (
                          <Maximize2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Main Textarea */}
                  <textarea
                    ref={textareaRef}
                    rows={isFullscreen ? 18 : 6}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="اكتب أو الصق النص هنا بأي لهجة عربية (مغربية، سعودية، مصرية، شامية، أو فصحى)..."
                    className="w-full p-4 bg-transparent text-slate-800 text-base sm:text-lg leading-relaxed focus:outline-none resize-none font-medium placeholder-slate-400"
                    dir="rtl"
                  />

                  {/* Textarea Bottom Metrics */}
                  <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 text-xs text-slate-500 font-semibold bg-white rounded-b-3xl flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span>
                        <strong className="text-slate-800 font-extrabold">
                          {inputText.length.toLocaleString('ar-EG')}
                        </strong>{' '}
                        / {currentUser?.isPro ? '50,000' : '500'} حرف في الطلب
                      </span>
                      <span>• المدة التقريبية: ~{estimateDuration(inputText, speed)} ثوانٍ</span>
                      {currentUser?.isPro && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          <Crown className="w-3 h-3 fill-amber-500 text-amber-600" />
                          باقة PRO الملكية
                        </span>
                      )}
                    </div>

                    {!currentUser?.isPro && inputText.length > 500 && (
                      <span className="text-amber-600 font-bold">
                        تنبيه: يمكنك الترقية لكتابة حتى 50,000 حرف
                      </span>
                    )}

                    {currentUser?.isPro && inputText.length > 50000 && (
                      <span className="text-red-600 font-bold">
                        تجاوزت الحد الأقصى للنص (50,000 حرف)
                      </span>
                    )}
                  </div>
                </div>

                {/* Director Studio Toggle Card */}
                <div className="mt-4 p-4 rounded-3xl bg-gradient-to-br from-indigo-50/80 to-slate-50 border-2 border-indigo-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-600" />
                        <h4 className="font-extrabold text-slate-900 text-sm font-['Cairo']">
                          تفعيل استوديو المخرج (Director Mode)
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black">
                          الجيل الجديد
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        توجيه نبرة الصوت، المشاعر، وسرعة الإيقاع بنماذج وقوالب مسبقة الإعداد
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={directorMode}
                      aria-label="تفعيل استوديو المخرج"
                      onClick={() => setDirectorMode(!directorMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        directorMode ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                          directorMode ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {directorMode && (
                    <div className="mt-4 pt-3 border-t border-indigo-200/80 space-y-3 animate-in fade-in">
                      <span className="text-xs font-bold text-slate-700 block">
                        اختر قالب الإخراج الصوتي:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {DIRECTOR_PRESETS.map((preset) => {
                          const isSelected = selectedPresetId === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setSelectedPresetId(preset.id)}
                              className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-indigo-600 bg-white ring-2 ring-indigo-500/20 shadow-xs'
                                  : 'border-slate-200 bg-white/70 hover:bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 mb-1">
                                <span>{preset.icon}</span>
                                <span>{preset.name}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-tight">
                                {preset.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          توجيه مخرج إضافي مخصص:
                        </label>
                        <input
                          type="text"
                          value={customDirectorPrompt}
                          onChange={(e) => setCustomDirectorPrompt(e.target.value)}
                          placeholder="مثال: تحدث بحرارة وابتسامة كأنك صديق ينصح صديقه المقرب"
                          className="w-full px-3.5 py-2 bg-white border border-indigo-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Human Simulation Switch */}
                <div className="mt-4 p-4 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-slate-900 font-['Cairo']">
                          المحاكاة البشرية الذكية (Human Simulation)
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                          PRO
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-normal font-medium">
                        يفهم الذكاء الاصطناعي سياق الكلمات ويطبق مشاعر وتنفس وتوقفات عفوية كإنسان حقيقي
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={humanSimulation}
                    aria-label="تفعيل المحاكاة البشرية"
                    onClick={() => setHumanSimulation(!humanSimulation)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                      humanSimulation ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                        humanSimulation ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold">
                    {errorMessage}
                  </div>
                )}

                {/* Loading / Generating 3-Step Progress Animation */}
                {isGenerating && (
                  <div className="mt-6 p-6 rounded-3xl bg-indigo-50/70 border border-indigo-200 text-center animate-in fade-in">
                    <h4 className="text-base font-extrabold text-slate-900 font-['Cairo'] mb-4">
                      جاري إنتاج المقطع الصوتي بواسطة Gemini 3.8 Flash TTS...
                    </h4>

                    <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                      <div
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          generationStep >= 1
                            ? 'bg-white border-indigo-600 text-indigo-700 shadow-xs'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        <div className="text-lg mb-1">🔍</div>
                        <div className="text-xs font-bold">1. تحليل النص</div>
                      </div>

                      <div
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          generationStep >= 2
                            ? 'bg-white border-indigo-600 text-indigo-700 shadow-xs'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        <div className="text-lg mb-1">🎭</div>
                        <div className="text-xs font-bold">2. ضبط اللهجة والمشاعر</div>
                      </div>

                      <div
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          generationStep >= 3
                            ? 'bg-white border-indigo-600 text-indigo-700 shadow-xs'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        <div className="text-lg mb-1">⚡</div>
                        <div className="text-xs font-bold">3. توليد الصوت</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 font-semibold mt-4">
                      يتم توليد الصوت بدقة 24kHz Unary WAV عالية النقاء...
                    </p>
                  </div>
                )}

                {/* Generate Button */}
                <div className="mt-6 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={handleGenerateAudio}
                    disabled={isGenerating || !inputText.trim()}
                    className="w-full max-w-sm py-4 px-8 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:brightness-105 active:scale-95 text-white font-black text-base shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-3 disabled:opacity-50 transition-all cursor-pointer font-['Cairo'] tracking-wide"
                  >
                    <span>إنتاج الصوت</span>
                    <Play className="w-5 h-5 fill-current translate-x-[-1px]" />
                  </button>

                  <span className="text-xs text-slate-500 mt-2 font-medium flex items-center gap-1.5">
                    <span>يستهلك هذا الطلب: ~{inputText.length.toLocaleString('ar-EG')} حرف من رصيدك</span>
                    {currentUser?.isPro ? (
                      <span className="text-amber-700 font-extrabold">
                        (المتبقي: {userCredits.toLocaleString('ar-EG')} حرف 👑)
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        (المتبقي: {userCredits.toLocaleString('ar-EG')} حرف)
                      </span>
                    )}
                  </span>
                </div>

                {/* Inline Result Audio Box */}
                {currentAudioUrl && (
                  <div className="mt-6 p-4 rounded-3xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 font-['Cairo']">
                          الصوت جاهز للاستماع والتحميل!
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          <p className="text-xs text-slate-600 font-medium">
                            تم تحويل النص بنجاح بصوت ({selectedVoice.name} - {selectedVoice.dialectName})
                          </p>
                          {lastModelUsed && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                              {lastModelUsed === 'gemini-3.8-flash-tts'
                                ? 'Gemini 3.8 Flash TTS'
                                : 'Gemini 3.8 Flash Lite TTS'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        {isPlayingAudio ? (
                          <>
                            <Pause className="w-4 h-4 fill-current" />
                            <span>إيقاف مؤقت</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-current" />
                            <span>تشغيل المقطع</span>
                          </>
                        )}
                      </button>

                      <a
                        href={currentAudioUrl}
                        download={`darijat-tts-${selectedVoice.name}.wav`}
                        className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>تحميل</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Hint */}
              <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
                <Info className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  نصيحة: لضمان أفضل جودة صوت، استخدم علامات الترقيم (، .) وتشكيل الكلمات التي تحتمل أكثر من معنى.
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: History & E-commerce Showcase */}
          <div className="lg:col-span-4 space-y-6">
            {/* History Card */}
            <HistoryList
              items={historyItems}
              activeAudioUrl={currentAudioUrl}
              isPlaying={isPlayingAudio}
              onPlayItem={(item) => {
                setCurrentAudioUrl(item.audioUrl);
                setIsPlayingAudio(true);
              }}
              onToggleFavorite={(id) => {
                setHistoryItems((prev) =>
                  prev.map((i) =>
                    i.id === id ? { ...i, isFavorite: !i.isFavorite } : i
                  )
                );
              }}
              onDeleteItem={(id) => {
                setHistoryItems((prev) => prev.filter((i) => i.id !== id));
              }}
              onClearAll={() => setHistoryItems([])}
            />

            {/* Saudi E-Commerce Audio Testimonials Widget */}
            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 inline-block mb-3">
                حصرياً للتجارة الإلكترونية
              </span>
              <h3 className="text-xl font-black font-['Cairo'] leading-snug">
                حوّل تقييمات متجرك إلى{' '}
                <span className="text-emerald-400">شهادات مسموعة</span>
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                الرسائل الصوتية العفوية تزيد معدل التحويل والمبيعات في السعودية بنسبة <strong>70%</strong>. أنشئ رسائل واتساب صوتية جاهزة لحملات السناب والتيك توك.
              </p>

              <button
                onClick={() => {
                  const saudiVoice = VOICES.find((v) => v.dialectId === 'saudi') || VOICES[4];
                  setSelectedVoice(saudiVoice);
                  setInputText(
                    'يا هلا والله، حبيت أشكركم على سرعة التوصيل في الرياض، ما شاء الله المنتج جودته بطلة وفوق التقييم!'
                  );
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="mt-4 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>تجربة تقييم واتساب سعودي الآن</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Audio Samples Showcase Section */}
      <SamplesShowcase
        onLoadSample={(text, voiceId) => {
          const voice = VOICES.find((v) => v.id === voiceId);
          if (voice) setSelectedVoice(voice);
          setInputText(text);
          window.scrollTo({ top: 350, behavior: 'smooth' });
        }}
        onPreviewSample={(voiceId, sampleText) => {
          const voice = VOICES.find((v) => v.id === voiceId);
          if (voice) handlePreviewVoice(voice, sampleText);
        }}
        previewingSampleVoiceId={previewingVoiceId}
        isPlayingPreview={isPlayingPreview}
      />

      {/* Modals */}
      <VoiceListModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        selectedVoiceId={selectedVoice.id}
        onSelectVoice={(voice) => setSelectedVoice(voice)}
        onPreviewVoice={handlePreviewVoice}
        previewingVoiceId={previewingVoiceId}
        isPlayingPreview={isPlayingPreview}
        onOpenVoiceCloneModal={() => setIsVoiceCloneModalOpen(true)}
      />

      <AiScriptModal
        isOpen={isAiScriptModalOpen}
        onClose={() => setIsAiScriptModalOpen(false)}
        onInsertScript={(script) => setInputText(script)}
        currentDialectName={selectedVoice.dialectName}
      />

      <NormalizeModal
        isOpen={isNormalizeModalOpen}
        onClose={() => setIsNormalizeModalOpen(false)}
        currentText={inputText}
        dialectName={selectedVoice.dialectName}
        languageMode={languageMode}
        onApplyNormalized={(normalized) => setInputText(normalized)}
      />

      <VoiceCloneModal
        isOpen={isVoiceCloneModalOpen}
        onClose={() => setIsVoiceCloneModalOpen(false)}
        onAddCustomVoice={(customVoice) => {
          VOICES.unshift(customVoice);
          setSelectedVoice(customVoice);
        }}
      />

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onTopUpCredits={handleTopUpCredits}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onRetry={checkApiKeyStatus}
      />

      {/* Persistent Sticky Audio Player Bar */}
      <StickyAudioPlayer
        audioUrl={currentAudioUrl}
        voiceName={selectedVoice.name}
        dialectName={selectedVoice.dialectName}
        avatarUrl={selectedVoice.avatar}
        isPlaying={isPlayingAudio}
        onTogglePlay={() => setIsPlayingAudio(!isPlayingAudio)}
        charCount={inputText.length}
        onClose={() => setCurrentAudioUrl(null)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-indigo-400" />
            <span className="font-extrabold text-white text-base font-['Cairo']">
              داريجات TTS
            </span>
            <span>- منصة توليد الأصوات بالذكاء الاصطناعي باللهجات العربية</span>
          </div>

          <p className="text-slate-500">
            الأصوات يتم إنشاؤها بواسطة Gemini 3.8 Flash TTS. المستخدم هو المسؤول عن المحتوى المدخل.
          </p>
        </div>
      </footer>
    </div>
  );
}
