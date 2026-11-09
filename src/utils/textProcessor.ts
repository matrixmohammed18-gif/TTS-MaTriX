/**
 * Pure helper functions for text editing, prompt composition, and audio metrics.
 */

export function wrapSelectionWithTag(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  emotionTag: string
): { newText: string; newCursor: number } {
  const cleanTag = emotionTag.trim();
  if (selectionStart === selectionEnd) {
    // If no text is selected, insert a sample snippet with the tag
    const prefix = text.slice(0, selectionStart);
    const suffix = text.slice(selectionEnd);
    const inserted = `[${cleanTag}: نص هنا] `;
    return {
      newText: prefix + inserted + suffix,
      newCursor: selectionStart + cleanTag.length + 3,
    };
  }

  const selectedText = text.slice(selectionStart, selectionEnd);
  const prefix = text.slice(0, selectionStart);
  const suffix = text.slice(selectionEnd);
  const wrapped = `[${cleanTag}: ${selectedText}]`;
  
  return {
    newText: prefix + wrapped + suffix,
    newCursor: selectionStart + wrapped.length,
  };
}

export function insertBurstTag(
  text: string,
  cursorPosition: number,
  burstTag: string
): { newText: string; newCursor: number } {
  const cleanTag = burstTag.trim();
  const safePos = Math.max(0, Math.min(cursorPosition, text.length));
  const prefix = text.slice(0, safePos);
  const suffix = text.slice(safePos);
  
  // Add spaces if necessary for clean speech segmentation
  const leadingSpace = prefix.length > 0 && !prefix.endsWith(' ') ? ' ' : '';
  const trailingSpace = !suffix.startsWith(' ') ? ' ' : '';
  const insertion = `${leadingSpace}${cleanTag}${trailingSpace}`;

  return {
    newText: prefix + insertion + suffix,
    newCursor: safePos + insertion.length,
  };
}

export function estimateDuration(text: string, speed: number = 1.0): number {
  if (!text || text.trim().length === 0) return 0;
  // Strip control tags like <laugh>, |mhm|, [بهمس: ...] for length estimation
  const clean = text
    .replace(/<[^>]+>/g, '')
    .replace(/\|[^|]+\|/g, '')
    .replace(/\[[^\]]+\]/g, (match) => {
      const parts = match.slice(1, -1).split(':');
      return parts.length > 1 ? parts[1] : match;
    })
    .trim();

  // Average Arabic speech rate is ~12-14 characters per second at 1.0x
  const effectiveSpeed = Math.max(0.5, Math.min(2.0, speed || 1.0));
  const rawSeconds = Math.max(2, Math.ceil((clean.length / 13) / effectiveSpeed));
  return rawSeconds;
}

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export type LanguageMode = 'auto' | 'fr' | 'en' | 'ar';

export interface LanguageOption {
  id: LanguageMode;
  name: string;
  shortName: string;
  flag: string;
  badge: string;
  description: string;
  examples: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    id: 'auto',
    name: 'عربي ودارجة مختلطة (تلقائي)',
    shortName: 'مختلط / تلقائي',
    flag: '🌐',
    badge: 'افتراضي',
    description: 'نطق متوازن وطبيعي للهجة مع لفظ سلس للكلمات الأجنبية والمصطلحات الشائعة',
    examples: 'مثال: مرحبا بكم، الكوموند غتوصلكم دابا فالميزون c’est bon',
  },
  {
    id: 'fr',
    name: 'فرنسية ومصطلحات فرنسية (Français)',
    shortName: 'Français',
    flag: '🇫🇷',
    badge: 'مغاربي / لبناني',
    description: 'تركيز دقيق على نطق الكلمات الفرنسية باللكنة الصحيحة والربط اللساني (Liaison)',
    examples: 'مثال: rendez-vous, message, voiture, livraison, qualité',
  },
  {
    id: 'en',
    name: 'إنجليزية ومصطلحات تقنية (English)',
    shortName: 'English',
    flag: '🇬🇧',
    badge: 'تجارة وتقنية',
    description: 'نطق إنجليزي فصيح لمصطلحات التجارة الإلكترونية، التكنولوجيا، وأسماء الماركات',
    examples: 'مثال: cash on delivery, discount, store, best seller, online',
  },
  {
    id: 'ar',
    name: 'عربية فصحى صافية (Fusha)',
    shortName: 'عربية فصحى',
    flag: '📖',
    badge: 'فصيح وقواعدي',
    description: 'مخارج حروف عربية واضحة ومشددة دون تأثير من اللكنات الأجنبية أو العامية',
    examples: 'مثال: السلام عليكم ورحمة الله، نسعد بتقديم خدماتنا لكم',
  },
];

export function buildPromptInstructions(params: {
  text: string;
  dialectName: string;
  voiceName: string;
  gender?: 'male' | 'female';
  personality?: string;
  humanSimulation?: boolean;
  directorStyle?: string;
  speed?: number;
  languageMode?: LanguageMode;
}): { speechText: string; styleDescription: string } {
  const {
    text,
    dialectName,
    voiceName,
    gender,
    personality,
    humanSimulation,
    directorStyle,
    speed,
    languageMode = 'auto',
  } = params;

  const styleParts: string[] = [];
  styleParts.push(`Authentic native ${dialectName} speaker named ${voiceName} (${gender === 'female' ? 'female voice' : 'male voice'})`);

  if (personality) {
    styleParts.push(`Vocal persona and tone: ${personality}`);
  }

  // Pronunciation & Foreign Words Language Mode Directives
  if (languageMode === 'fr') {
    styleParts.push(
      'Language mode: French & Dialect Code-Switching. Pay meticulous attention to authentic French pronunciation, liaisons, nasal vowels, and French loanwords frequently used in North African Darija and Levantine contexts. Pronounce French words with flawless native Parisian French phonetics seamlessly integrated into the Arabic rhythm'
    );
  } else if (languageMode === 'en') {
    styleParts.push(
      'Language mode: English & Technical Terms. Ensure clear native English pronunciation for international brands, technology jargon, modern business terms, and e-commerce phrases without awkward phonetic distortion'
    );
  } else if (languageMode === 'ar') {
    styleParts.push(
      'Language mode: Pure Classical Arabic (Fusha). Ensure strict adherence to classical Arabic phonology, deep throat letters (Haa, Ayn, Qaf), precise vowel elongation, and formal standard pronunciation'
    );
  } else {
    // 'auto' / mixed default
    styleParts.push(
      'Language mode: Natural Multilingual Code-Switching. Speak Arabic dialect fluently while pronouncing any loanwords (French, English, or brand names) with their authentic natural pronunciation as commonly spoken by bilingual native speakers'
    );
  }

  if (directorStyle && directorStyle.trim().length > 0) {
    styleParts.push(`Director style: ${directorStyle.trim()}`);
  }

  if (humanSimulation) {
    styleParts.push(
      'Perform with ultra-realistic human breathing, genuine Arabic emotion, spontaneous pauses, natural dialectal rhythm, and realistic studio delivery'
    );
  } else {
    styleParts.push('Clear, articulate, natural vocal cadence');
  }

  if (speed && speed !== 1.0) {
    if (speed <= 0.65) {
      styleParts.push(`Pacing: Extremely slow, very deliberate, calm and meditative speaking pace (~${speed}x)`);
    } else if (speed < 0.9) {
      styleParts.push(`Pacing: Slow, deliberate, calm speaking pace (~${speed}x)`);
    } else if (speed > 1.1 && speed <= 1.35) {
      styleParts.push(`Pacing: Brisk, dynamic, lively fast-paced delivery (~${speed}x)`);
    } else if (speed > 1.35 && speed <= 1.65) {
      styleParts.push(`Pacing: High-energy, punchy fast-paced delivery for quick social media and commercial ads (~${speed}x)`);
    } else if (speed > 1.65) {
      styleParts.push(`Pacing: Ultra rapid-fire, high-speed fast-paced speech delivery (~${speed}x)`);
    }
  }

  return {
    speechText: text.trim(),
    styleDescription: styleParts.join('. '),
  };
}

export interface SpeedPreset {
  value: number;
  label: string;
  shortLabel: string;
  description: string;
  emoji: string;
}

export const SPEED_PRESETS: SpeedPreset[] = [
  {
    value: 0.6,
    label: '0.6x بطيء جداً',
    shortLabel: '0.6x',
    description: 'تأملي وهادئ للغاية، فواصل زمنية واسعة وتأنٍ تام',
    emoji: '🧘',
  },
  {
    value: 0.8,
    label: '0.8x هادئ',
    shortLabel: '0.8x',
    description: 'إيقاع مريح وسلس مناسب للقصص والروايات الطويلة',
    emoji: '🌿',
  },
  {
    value: 1.0,
    label: '1.0x طبيعي',
    shortLabel: '1.0x',
    description: 'السرعة البشرية اليومية المثالية لمعظم المحادثات والمحتوى',
    emoji: '🎙️',
  },
  {
    value: 1.2,
    label: '1.2x حيوي',
    shortLabel: '1.2x',
    description: 'نبرة نشيطة وجذابة مناسبة للبث المباشر وشروحات اليوتيوب',
    emoji: '⚡',
  },
  {
    value: 1.4,
    label: '1.4x إعلانات',
    shortLabel: '1.4x',
    description: 'سرعة مركزة ومباشرة مخصصة لإعلانات تيك توك وريلز',
    emoji: '🚀',
  },
  {
    value: 1.75,
    label: '1.75x سريع جداً',
    shortLabel: '1.75x',
    description: 'إلقاء خاطف وموجز لملخصات الأخبار ونشرات المعلومات',
    emoji: '🔥',
  },
];

export function getSpeedDescriptor(speed: number): {
  label: string;
  description: string;
  emoji: string;
  badgeClass: string;
} {
  const rounded = Number(speed.toFixed(2));
  if (rounded <= 0.65) {
    return {
      label: `بطيء جداً (${rounded}x)`,
      description: 'تأملي وهادئ، فواصل مريحة وتأنٍ فائق',
      emoji: '🧘',
      badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
    };
  }
  if (rounded < 0.9) {
    return {
      label: `هادئ ومتأنٍ (${rounded}x)`,
      description: 'إيقاع مريح وسلس مناسب للقصص والروايات',
      emoji: '🌿',
      badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    };
  }
  if (rounded >= 0.9 && rounded <= 1.1) {
    return {
      label: `سرعة طبيعية متوازنة (${rounded}x)`,
      description: 'السرعة البشرية القياسية للمحادثات اليومية',
      emoji: '🎙️',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };
  }
  if (rounded > 1.1 && rounded <= 1.35) {
    return {
      label: `سريع وحيوي (${rounded}x)`,
      description: 'نبرة نشيطة وجذابة للشروحات وبودكاست اليوتيوب',
      emoji: '⚡',
      badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    };
  }
  if (rounded > 1.35 && rounded <= 1.65) {
    return {
      label: `إيقاع إعلاني خاطف (${rounded}x)`,
      description: 'سرعة مركزة وحماسية لإعلانات تيك توك وريلز',
      emoji: '🚀',
      badgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
    };
  }
  return {
    label: `فائق السرعة (${rounded}x)`,
    description: 'إلقاء سريع وموجز جداً لملخصات الأخبار السريعة',
    emoji: '🔥',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
  };
}
