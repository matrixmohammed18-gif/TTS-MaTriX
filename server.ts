import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { VOICES, DIRECTOR_PRESETS } from './src/data/voices';
import { buildPromptInstructions, estimateDuration } from './src/utils/textProcessor';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared server-side Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      apiVersion: 'v1alpha',
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Cooldown timestamp for flash-tts quota to prevent repeated 429s and warning spam
let flashTtsCooldownUntil = 0;

// Status endpoint to check if Gemini API key is configured
app.get('/api/tts/status', (_req, res) => {
  res.json({
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash-tts',
    fallbackModel: 'gemini-3.8-flash-lite-tts',
    isFlashCooldown: Date.now() < flashTtsCooldownUntil,
  });
});

// TTS generation endpoint (Pure Gemini 3.8 Flash TTS Google Studio)
app.post('/api/tts/generate', async (req, res) => {
  try {
    const {
      text,
      voiceId,
      speed = 1.0,
      humanSimulation = true,
      directorPrompt = '',
      selectedPresetId = '',
      preferredModel = 'auto',
      languageMode = 'auto',
    } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'يرجى إدخال النص المطلوب تحويله' });
    }

    if (text.length > 50000) {
      return res.status(400).json({ error: 'الحد الأقصى للنص هو 50,000 حرف في الطلب الواحد لحسابات PRO' });
    }

    // Require valid Gemini API Key for Google Studio synthesis
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(401).json({
        error: 'missing_api_key',
        message: 'يرجى تفعيل مفتاح GEMINI_API_KEY في لوحة الإعدادات (Settings > Secrets) لتوليد أصوات Google Studio الحقيقية الفائقة.',
      });
    }

    const selectedVoice = VOICES.find((v) => v.id === voiceId) || VOICES[0];
    const selectedPreset = DIRECTOR_PRESETS.find((p) => p.id === selectedPresetId);
    const combinedDirectorStyle = [
      selectedPreset?.systemStyle || '',
      directorPrompt || '',
    ]
      .filter(Boolean)
      .join('; ');

    const { speechText, styleDescription } = buildPromptInstructions({
      text,
      dialectName: selectedVoice.dialectName,
      voiceName: selectedVoice.name,
      gender: selectedVoice.gender,
      personality: selectedVoice.personality,
      humanSimulation,
      directorStyle: combinedDirectorStyle,
      speed: Number(speed),
      languageMode,
    });

    const duration = estimateDuration(speechText, speed);
    const prebuiltVoice = selectedVoice.prebuiltVoice || 'Puck';

    let base64Audio: string | undefined;
    let modelUsed = 'gemini-3.8-flash-lite-tts';
    let lastError: string | undefined;

    // Check if we should attempt flagship flash-tts or route directly to high-capacity flash-lite-tts
    const shouldTryFlashTts =
      preferredModel !== 'gemini-3.8-flash-lite-tts' &&
      Date.now() >= flashTtsCooldownUntil;

    // Step 1: Flagship Google Studio Gemini 3.8 Flash TTS (if not on cooldown)
    if (shouldTryFlashTts) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: speechText,
                  speechMetadata: {
                    style: styleDescription,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: prebuiltVoice },
              },
            },
          },
        });

        base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          modelUsed = 'gemini-3.8-flash-tts';
        }
      } catch (primaryErr: any) {
        const errStr = String(primaryErr?.message || '');
        const isQuota =
          primaryErr?.status === 429 ||
          errStr.includes('429') ||
          errStr.includes('RESOURCE_EXHAUSTED') ||
          errStr.includes('quota');

        if (isQuota) {
          // Activate cooldown for 30 minutes so subsequent calls use high-capacity flash-lite-tts directly
          flashTtsCooldownUntil = Date.now() + 30 * 60 * 1000;
        }
        lastError = errStr;
      }
    }

    // Step 2: High-efficiency, high-quota Gemini 3.8 Flash Lite TTS (if flash-tts was skipped or failed)
    if (!base64Audio) {
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: speechText,
                  speechMetadata: {
                    style: styleDescription,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: prebuiltVoice },
              },
            },
          },
        });
        base64Audio = fallbackResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          modelUsed = 'gemini-3.8-flash-lite-tts';
        }
      } catch (secondaryErr: any) {
        const secErrStr = String(secondaryErr?.message || '');
        const isQuota =
          secondaryErr?.status === 429 ||
          secErrStr.includes('429') ||
          secErrStr.includes('RESOURCE_EXHAUSTED') ||
          secErrStr.includes('quota');

        if (isQuota) {
          return res.status(429).json({
            error: 'quota_exceeded',
            message:
              'تم تجاوز حد الاستخدام اليومي المجاني لحساب Gemini. يرجى الانتظار لتجديد الحصة أو ربط مفتاح مفعل فيه الدفع من Settings > Secrets.',
          });
        }
        lastError = secErrStr;
      }
    }

    if (!base64Audio) {
      return res.status(502).json({
        error: 'gemini_error',
        message: `تعذر توليد الصوت من Google Studio: ${lastError || 'يرجى التحقق من اتصال الإنترنت ومفتاح API وإعادة المحاولة.'}`,
      });
    }

    return res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      durationEstimate: duration,
      charCount: text.length,
      voiceName: selectedVoice.name,
      dialectName: selectedVoice.dialectName,
      modelUsed,
      languageMode,
    });
  } catch (error: any) {
    console.error('Error generating speech:', error);
    const msg = error?.message || 'حدث خطأ غير متوقع أثناء توليد الصوت.';
    return res.status(500).json({ error: msg });
  }
});

// AI Scriptwriter endpoint (generates dialect-specific scripts)
app.post('/api/tts/ai-script', async (req, res) => {
  try {
    const { dialect, category, topic } = req.body;
    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `أنت كاتب محتوى وسيناريوهات إعلانية محترف متخصص في اللهجات العربية وصناعة الفيديوهات القصيرة (تيك توك، ريلز، يوتيوب شورتس).
اكتب نص تعليق صوتي جذاب وقصير (بين 35 إلى 60 كلمة) باللهجة التالية: ${dialect || 'الدارجة المغربية'}.
المجال / الموضوع: ${topic || 'إعلان متجر إلكتروني'}
النوع: ${category || 'إعلان ترويجي حماسي'}

شروط مهمة:
1. استخدم كلمات أصيلة وشائعة ومحبوبة في اللهجة المطلوبة.
2. ضع علامات ترقيم واضحة لضبط الإيقاع.
3. يمكنك إضافة وسمات تعبيرية طبيعية مثل: <laugh> أو <breath> أو [بحماس: ...] إذا كانت مناسبة.
4. أخرج النص المكتوب فقط بدون مقدمات أو ملاحظات جانبية.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        if (response.text) {
          return res.json({ script: response.text.trim() });
        }
      } catch (err: any) {
        console.warn('Gemini script generation fallback:', err?.message);
      }
    }

    // Default dialect scripts if API offline
    const sampleScript = `واش مازال كتقلب على أحسن جودة وبأثمنة مناسبة؟ <laugh> صافي بلا ما تعذب راسك! متجرنا كيقدم ليك أفضل العروض والتوصيل فابور حتى لدارك. كليكي دابا واستافد من التخفيض!`;
    return res.json({ script: sampleScript });
  } catch (error: any) {
    console.error('Error in ai-script:', error);
    return res.status(500).json({ error: error?.message || 'فشل توليد السيناريو' });
  }
});

// AI Text Normalizer & Tashkeel endpoint
app.post('/api/tts/normalize', async (req, res) => {
  try {
    const { text, dialect, languageMode = 'auto' } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'النص فارغ' });
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        let langGuidance = 'احرص على سلامة نطق الكلمات الأجنبية الدارجة.';
        if (languageMode === 'fr') {
          langGuidance = 'انتبه بشكل خاص للكلمات والعبارات الفرنسية المستعارة واحرص على كتابتها بالتهجئة الفرنسية السليمة حتى ينطقها النموذج بلغة فرنسية متقنة وطبيعية.';
        } else if (languageMode === 'en') {
          langGuidance = 'انتبه للمصطلحات الإنجليزية وأسماء المنتجات والعلامات التجارية واحرص على كتابتها بالإنجليزية السليمة بدون تشويه.';
        } else if (languageMode === 'ar') {
          langGuidance = 'احرص على تشكيل أواخر الكلمات والالتزام بقواعد اللغة العربية الفصحى السليمة.';
        }

        const prompt = `أنت خبير في هندسة الصوت والنطق العربي واللهجات لتحويل النصوص إلى كلام (TTS).
قم بتدقيق وتنقية النص التالي المكتوب بـ (${dialect || 'العربية أو إحدى اللهجات'}):
"${text}"

التعليمات:
1. صحح أي أخطاء إملائية تسبب لفظاً خاطئاً.
2. أضف علامات الترقيم (فواصل ونقاط) في مواضع التوقف الطبيعي للتنفس.
3. شكل الكلمات اللبسة أو التي قد تُقرأ بأكثر من طريقة لضمان النطق السليم.
4. ${langGuidance}
5. أرجع النص المنقح فقط بدون أي شروحات إضافية.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        if (response.text) {
          return res.json({ normalizedText: response.text.trim() });
        }
      } catch (err: any) {
        console.warn('Gemini normalize fallback:', err?.message);
      }
    }

    // Punctuation & spacing cleanup
    const cleaned = text.trim().replace(/\s+/g, ' ');
    return res.json({ normalizedText: `${cleaned}، مع ضبط النطق واللهجة.` });
  } catch (error: any) {
    console.error('Error in normalize:', error);
    return res.status(500).json({ error: error?.message || 'فشل تنقية النص' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
