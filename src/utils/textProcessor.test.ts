import test from 'node:test';
import assert from 'node:assert/strict';
import {
  wrapSelectionWithTag,
  insertBurstTag,
  estimateDuration,
  formatDuration,
  buildPromptInstructions,
} from './textProcessor';

test('wrapSelectionWithTag wraps selected text correctly', () => {
  const original = 'مرحباً بكم في متجرنا اليوم';
  // Select "متجرنا"
  const start = original.indexOf('متجرنا');
  const end = start + 'متجرنا'.length;
  const result = wrapSelectionWithTag(original, start, end, 'بحماس');

  assert.equal(result.newText, 'مرحباً بكم في [بحماس: متجرنا] اليوم');
  assert.equal(result.newCursor, start + '[بحماس: متجرنا]'.length);
});

test('wrapSelectionWithTag inserts placeholder when no text is selected', () => {
  const original = 'مرحباً بكم';
  const result = wrapSelectionWithTag(original, 7, 7, 'بهمس');
  assert.equal(result.newText, 'مرحباً [بهمس: نص هنا] بكم');
});

test('insertBurstTag inserts vocal burst with clean spacing', () => {
  const original = 'أهلاً وسهلاً بكم';
  const pos = 12; // after وسهلاً
  const result = insertBurstTag(original, pos, '<laugh>');
  assert.equal(result.newText.includes('<laugh>'), true);
  assert.equal(result.newCursor > pos, true);
});

test('estimateDuration calculates reasonable duration in seconds', () => {
  const shortText = 'مرحباً بكم';
  const duration1 = estimateDuration(shortText, 1.0);
  assert.ok(duration1 >= 2);

  const longText = 'هذا نص طويل نسبياً لاختبار حساب المدة التقريبية للتسجيل الصوتي باللغة العربية';
  const duration2 = estimateDuration(longText, 1.0);
  const durationFast = estimateDuration(longText, 1.5);
  assert.ok(duration2 > duration1);
  assert.ok(durationFast < duration2);
});

test('formatDuration formats seconds to MM:SS string', () => {
  assert.equal(formatDuration(0), '00:00');
  assert.equal(formatDuration(65), '01:05');
  assert.equal(formatDuration(120), '02:00');
  assert.equal(formatDuration(-5), '00:00');
});

test('buildPromptInstructions formats style description with dialect and simulation', () => {
  const result = buildPromptInstructions({
    text: 'عرض خاص اليوم فقط',
    dialectName: 'الدارجة المغربية',
    voiceName: 'يوسف',
    humanSimulation: true,
    directorStyle: 'إعلاني حماسي تيك توك',
    speed: 1.2,
  });

  assert.equal(result.speechText, 'عرض خاص اليوم فقط');
  assert.ok(result.styleDescription.includes('الدارجة المغربية'));
  assert.ok(result.styleDescription.includes('يوسف'));
  assert.ok(result.styleDescription.includes('إعلاني حماسي'));
  assert.ok(result.styleDescription.includes('human breathing'));
  assert.ok(result.styleDescription.includes('fast-paced'));
});

test('buildPromptInstructions integrates languageMode pronunciation guidance', () => {
  const frResult = buildPromptInstructions({
    text: 'C’est bon خويا الكوموند وصلات',
    dialectName: 'الدارجة المغربية',
    voiceName: 'فاطمة الزهراء',
    languageMode: 'fr',
  });
  assert.ok(frResult.styleDescription.includes('French & Dialect Code-Switching'));
  assert.ok(frResult.styleDescription.includes('liaisons'));

  const enResult = buildPromptInstructions({
    text: 'عرض خاص على الـ online store مع cash on delivery',
    dialectName: 'اللهجة السعودية',
    voiceName: 'راشد',
    languageMode: 'en',
  });
  assert.ok(enResult.styleDescription.includes('English & Technical Terms'));
  assert.ok(enResult.styleDescription.includes('e-commerce phrases'));

  const arResult = buildPromptInstructions({
    text: 'نرحب بكم في صرحنا العلمي المتميز',
    dialectName: 'العربية الفصحى',
    voiceName: 'عمر الفصيح',
    languageMode: 'ar',
  });
  assert.ok(arResult.styleDescription.includes('Pure Classical Arabic'));
});
