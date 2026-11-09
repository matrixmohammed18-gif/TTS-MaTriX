# Google Studio Audio Engine: Pure Gemini 3.8 Flash TTS Integration

Transition the Darijat TTS platform to exclusively use Google AI Studio's flagship **Gemini 3.8 Flash TTS** engine for hyper-realistic, human-grade Arabic dialect speech synthesis across all 18 characters, eliminating low-quality translation fallbacks and providing intuitive API key setup guidance.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed through interactive clarification and govern the new architecture:

- **Confirmed Decision 1 (API Key Handling)**: When `GEMINI_API_KEY` is not detected in the environment, the app will display a friendly, polished guidance modal explaining how to connect a Gemini API key in **Settings > Secrets**, rather than falling back to low-quality robotic or translation voices.
- **Confirmed Decision 2 (Voice Architecture)**: Voice synthesis will strictly use **Gemini 3.8 Flash TTS** (with optional high-efficiency **Gemini 3.8 Flash Lite TTS** routing), leveraging Google Studio prebuilt voices (`Puck`, `Charon`, `Kore`, `Fenrir`, `Zephyr`) combined with granular persona direction (`speechMetadata.style`) for authentic Moroccan Darija, Saudi, Egyptian, Gulf, Levantine, and Classical MSA delivery.
- **Confirmed Decision 3 (Zero Generic Fallbacks)**: Remove Google Translate TTS and synthetic oscillators completely from the generation path. Every voice generated or previewed will be an authentic Google AI Studio studio-quality recording or direct Gemini 3.8 Flash TTS generation.

---

## 1. Overview & Core Concept

### What It Does
Provides an authentic AI audio production suite powered directly by Google AI Studio's **Gemini 3.8 Flash TTS** model. Users enter text in any Arabic dialect (Moroccan Darija, Saudi, Egyptian, Levantine, Gulf, Classical MSA, Algerian) and receive studio-quality 24kHz WAV audio spoken by distinctive male and female personas with natural human breathing, emotion inflection, and dialectal cadence.

### Target Audience & Persona
- **E-Commerce Brands & Media Buyers**: Generating high-converting Saudi and Gulf WhatsApp audio testimonials and TikTok/Snapchat ad voiceovers.
- **Content Creators & Podcasters**: Producing Moroccan Darija, Egyptian, and Levantine video voiceovers with natural laughs, sighs, and whispers.
- **Narrators & Educators**: Creating authoritative Classical Arabic (MSA) documentary voiceovers.

### Key Value
- **Studio Fidelity**: Replaces synthetic robotic tones with Google Studio's ultra-realistic 24kHz neural voice generation.
- **True Individuality**: Each of the 18 voices has a distinct vocal age, resonance, dialect cadence, and personality.
- **Director Precision**: Full support for vocal bursts (`<laugh>`, `<sigh>`, `<breath>`) and emotional tags (`[whispering]`, `[excited]`, `[calm]`).

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Zero-State & Key Verification**:
   - If `GEMINI_API_KEY` is present: The app displays an active "Gemini 3.8 Flash Studio Connected" green indicator in the model badge.
   - If `GEMINI_API_KEY` is absent: When the user clicks "إنتاج الصوت" or "معاينة الصوت", a clean Arabic modal appears: *"يرجى تفعيل مفتاح Gemini API في لوحة الإعدادات (Settings > Secrets) للوصول إلى أصوات Google Studio فائقة الواقعية"*.
2. **Character & Dialect Selection**:
   - Users browse 18 distinct personas organized by dialect and gender.
   - Each card displays authentic persona tags (e.g. *يوسف: شاب مغربي عفوي لإعلانات التيك توك*, *العنود: صوت نسائي سعودي فخم*, *الفاروق: نبرة وثائقية جهورية فصيحة*).
3. **Studio Director Editing & Vocal Burst Injection**:
   - One-click buttons to wrap text with director guidance (`[همس]`, `[حماس]`, `[هدوء]`) or insert human pauses and vocal bursts (`<laugh>`, `<breath>`).
4. **Synthesis & Real-Time Waveform Playback**:
   - A 3-step synthesis progress tracker: Analyzing dialect -> Shaping vocal persona -> Rendering 24kHz WAV.
   - Output plays immediately in the persistent bottom Sticky Audio Player with interactive scrubber, speed toggle (0.8x–1.5x), and WAV download.

### Visual Identity & Theme
- **Aesthetic Direction**: High-end dark/light audio workstation with sleek indigo and violet gradients, inspired by professional DAW software and modern SaaS dashboards.
- **Typography**: 
  - Display & Headings: `Cairo` (font weights 700 to 900) for authoritative Arabic titles.
  - Body Prose & Controls: `Tajawal` (font weights 400 to 600) for effortless legibility.
  - Numbers & Durations: `font-mono tabular-nums` for timers and credit counters.
- **Color Discipline (60-30-10)**:
  - 60% Canvas: Crisp slate canvas (`bg-slate-50` / `dark:bg-slate-950`).
  - 30% Structural: Refined white cards with hairline borders (`border-slate-200/80`).
  - 10% Accent: High-intent indigo & violet gradient (`from-indigo-600 to-violet-600`) reserved for synthesis triggers and active audio scrubbers.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Pure Google Studio SDK Integration
- **Chosen Approach**: Directly call `ai.models.generateContent` with `gemini-3.8-flash-tts` on the server using `speechMetadata: { style: personaStyle }` and `speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } }`.
- **Why**: Delivers the highest audio quality available in Google AI Studio with authentic Arabic phonetics, vocal bursts, and true dialectal nuances.
- **Alternatives Considered**: Dropped Google Translate TTS and procedural wave synthesis because they produced artificial, robotic, or repetitive buzzer sounds.

### Decision 2: API Key Guidance Modal
- **Chosen Approach**: When the API key is missing or invalid, pop up an intuitive guidance modal with direct step-by-step instructions on setting the secret in the AI Studio sidebar.
- **Why**: Keeps users fully informed without breaking the interface, respecting AI Studio's environment policy (never asking for raw API key inputs in UI forms).

### Decision 3: Studio Sample Recordings for Previews
- **Chosen Approach**: Bundle authentic, pre-generated Google Studio audio samples for the 18 voice previews and showcase scripts so users can immediately audition each voice's real personality even before generating custom text.
- **Why**: Zero latency when auditioning voices in the library modal or homepage showcase.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER (React SPA)                      │
│                                                                        │
│   ┌─────────────────────┐   ┌───────────────────┐   ┌──────────────┐   │
│   │ Main Studio View    │   │ Voice Library     │   │ Sticky Audio │   │
│   │ (App.tsx)           │   │ Modal (18 Voices) │   │ Player       │   │
│   └──────────┬──────────┘   └─────────┬─────────┘   └───────▲──────┘   │
│              │                        │                     │          │
│              │ POST /api/tts/generate │ GET voice sample    │          │
│              ▼                        ▼                     │          │
└──────────────┼────────────────────────┼─────────────────────┼──────────┘
               │                        │                     │
┌──────────────▼────────────────────────▼─────────────────────┴──────────┐
│                     SERVER RUNTIME (Express Node.js)                   │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ POST /api/tts/generate                                           │  │
│  │ 1. Validate prompt length & parameters                           │  │
│  │ 2. Check process.env.GEMINI_API_KEY                              │  │
│  │    ├─ Missing ──> Return 401 with `requires_api_key` payload     │  │
│  │    └─ Present ──> Build structured Gemini TTS payload            │  │
│  │ 3. Call `@google/genai` (gemini-3.8-flash-tts)                   │  │
│  │    └─ prebuiltVoiceConfig + speechMetadata.style                 │  │
│  │ 4. Receive 24kHz unary WAV bytes                                 │  │
│  │ 5. Return JSON: { audioBase64, mimeType: "audio/wav", ... }      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                │                                       │
│                                ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Google GenAI SDK (@google/genai)                                 │  │
│  │ Model: `gemini-3.8-flash-tts`                                    │  │
│  │ Voices: Puck, Charon, Kore, Fenrir, Zephyr                       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Server Endpoint Contract (`/api/tts/generate`)
- **Request**:
  ```json
  {
    "text": "السلام عليكم خوتي! مرحبا بكم فمنصة داريجات",
    "voiceId": "moroccan-youssef",
    "speed": 1.0,
    "humanSimulation": true,
    "directorPrompt": "energetic social media ad"
  }
  ```
- **Response (Success)**:
  ```json
  {
    "audioBase64": "<base64_wav_data>",
    "mimeType": "audio/wav",
    "modelUsed": "gemini-3.8-flash-tts",
    "durationEstimate": 8.5,
    "voiceName": "يوسف",
    "dialectName": "الدارجة المغربية"
  }
  ```
- **Response (Missing Key)**:
  ```json
  {
    "error": "missing_api_key",
    "message": "يرجى ربط مفتاح GEMINI_API_KEY في لوحة الإعدادات (Settings > Secrets)"
  }
  ```
