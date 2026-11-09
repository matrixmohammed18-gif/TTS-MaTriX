export type DialectId = 
  | 'all'
  | 'moroccan'
  | 'saudi'
  | 'egyptian'
  | 'levantine'
  | 'gulf'
  | 'msa'
  | 'algerian'
  | 'tunisian';

export interface Voice {
  id: string;
  name: string;
  dialectId: DialectId;
  dialectName: string;
  flag: string;
  gender: 'male' | 'female';
  personality: string;
  avatar: string;
  prebuiltVoice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  recommendedFor: string[];
  isPro?: boolean;
  sampleText: string;
}

export interface DirectorPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  systemStyle: string;
}

export type LanguageMode = 'auto' | 'fr' | 'en' | 'ar';

export interface HistoryItem {
  id: string;
  text: string;
  voiceId: string;
  voiceName: string;
  dialectName: string;
  flag: string;
  audioUrl: string;
  duration: number;
  createdAt: number;
  humanSimulation: boolean;
  speed: number;
  isFavorite?: boolean;
  languageMode?: LanguageMode;
}

export interface GenerateSpeechRequest {
  text: string;
  voiceId: string;
  speed?: number;
  humanSimulation?: boolean;
  directorPrompt?: string;
  selectedPresetId?: string;
  customStyle?: string;
  preferredModel?: string;
  languageMode?: LanguageMode;
}

export interface GenerateSpeechResponse {
  audioBase64: string;
  mimeType: string;
  durationEstimate: number;
  charCount: number;
  voiceName: string;
  dialectName: string;
  modelUsed?: string;
  languageMode?: LanguageMode;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'pro';
  credits: number;
  maxCredits: number;
  isPro: boolean;
  proBadge?: string;
  joinedAt?: string;
}

