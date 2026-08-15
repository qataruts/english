// **مسوِّي القائمة الصوتية** — يقابل ما تنطقه الشجرةُ بما في `tools/audio_queue.json`:
//
//   node tools/queue_texts.mjs              # الحكم: أيُّ نصٍّ يُنطَق ولا يُصَفّ؟ (لا يكتب)
//   node tools/queue_texts.mjs --add        # إضافةُ الناقص إلى القائمة
//   node tools/queue_texts.mjs --prune      # إسقاطُ المنتظِر الذي لم يعد يُنطَق
//   node tools/queue_texts.mjs --self-test  # فحصُ الفاحص: أيمسك المدسوس؟
//
// ————— العلّة: «كلُّ نصّ منطوق جديد يُسجَّل هنا» عهدٌ لا يُصدَّق بلا جرد —————
//
// عقدُ `docs/AUDIO_QUEUE.md`: «لا تنتظر أيُّ جلسة تطوير توليدَ الصوت ولا تشغّل
// المولّد بنفسها. كلُّ نصّ منطوق جديد يُسجَّل هنا، وجلسةُ الصوتيات (ص) وحدها تصرّف
// القائمة». وثمنُ ذلك أنّ **النقصَ لا يُفشِل شيئاً**: نصٌّ يُنطَق ولا يُصَفّ يسمعه
// الطفلُ بالنطق الآليّ، والتطبيقُ يعمل، والحرّاسُ خضر — ثم يُنشَر بلا صوته.
//
// فهذه الأداةُ تجعل العهدَ **مقيساً**: كلُّ وحدةِ تمارينٍ **تُعلن** ما تنطق
// (`export const SPOKEN` — نصٌّ ولغةٌ وفئة)، والإعلانُ يُقابَل بالقائمة مدخلاً مدخلاً.
//
// ————— والفئةُ تُعلَن ولا تُخمَّن —————
//
// عند «اِحْسِبْ» تُشتقّ الفئةُ من موضع النصّ في الشجرة، وهنا **تُعلَن مع النصّ**:
// لأنّ وحدةً واحدة عندنا تنطق **بلسانين وثلاث فئات** (تعليمةٌ عربية · كلمةٌ إنكليزية ·
// جملةُ أمرٍ إنكليزية)، فلا يميّزها موضعُها. والفئةُ تختار **تعليمةَ الأداء** في
// المولّد ومسحةً خاطئة تُسمع في أذن طفل — فتُكتب حيث يُكتب النصّ، ويحرس هذا الملفّ
// **لزومَ اللغة للفئة** (`AUDIO_QUEUE.md`: الفئاتُ الأربع الأولى إنكليزيةٌ دائماً
// والثلاثُ الأخرى عربيةٌ دائماً).
//
// ————— وحكمٌ لا يعدّل، وإصلاحٌ برايةٍ صريحة —————
//
// «الحارسُ لا يعدّل شيئاً، والأداةُ لا تحكم على أحد» (قاعدةُ احسب). وهذه واحدةٌ
// بوجهين معلَنين: **التشغيلُ بلا راية حكمٌ محض** (يقرأ ويطبع ويخرج بـ١ عند النقص، ولا
// يكتب بايتاً)، **والكتابةُ لا تقع إلا بـ`--add` أو `--prune`**. فمن شغّله في سَوقة
// الفحوص لم يغيّر شيئاً تحت يده.

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const APP = new URL('app/js/', ROOT);
const QUEUE = new URL('tools/audio_queue.json', ROOT);

const REQUESTED_BY = process.env.QUEUE_BY || 'session-2';

/** لغةُ كل فئة — نصُّ `docs/AUDIO_QUEUE.md`، ومصدرُها الوحيد هنا. */
export const CATEGORY_LANG = {
  phoneme: 'en',
  blend: 'en',
  word: 'en',
  sentence: 'en',
  instruction: 'ar',
  celebration: 'ar',
  modeling: 'ar',
};

/**
 * **ترتيبُ التصريف**: ما يسمعه الطفلُ في كل محطةٍ أولاً (التعليمةُ والنمذجة)، ثم
 * المفردات، ثم الجمل. فإن صُرِّفت دفعةٌ ووقفت، كان الناقصُ أبعدَ ما يُحتاج.
 */
const PRIORITY = {
  instruction: 10, modeling: 20, celebration: 30,
  phoneme: 40, blend: 50, word: 60, sentence: 70,
};

/** وحداتُ البذرة ليست مصادرَ نصّ (نظيرُ `SEED` في `test_nodes.mjs`). */
const SEED = new Set(['main.js', 'progress.js', 'curriculum.js', 'ui.js', 'audio.js',
  'review.js', 'parent.js', 'registry.js', 'figures.js']);

/** ما تنطقه الشجرةُ كلُّها — من إعلان كل وحدة (`SPOKEN`) لا من استقراء نصّها. */
export async function wantedTexts() {
  const out = [];
  for (const file of readdirSync(APP).filter((f) => f.endsWith('.js') && !SEED.has(f)).sort()) {
    const mod = await import(new URL(file, APP));
    for (const row of mod.SPOKEN || []) out.push({ ...row, from: file });
  }
  return out;
}

/**
 * **الحكمُ** — دالّةٌ خالصة تُجرَّب بقائمةٍ مصنوعة (`--self-test`).
 *
 * أربعةُ أصناف: **ناقصٌ** يُنطَق ولا يُصَفّ · **بائدٌ** مصفوفٌ لم يعد يُنطَق ·
 * **منحرفٌ** مصفوفٌ بلغةٍ أو فئةٍ غير التي أُعلنت · **متضاربٌ** نصٌّ واحد بلغتين
 * (وهو القيدُ الأول في `AUDIO_QUEUE.md`: مفتاحُ الملفّ بصمةُ النصّ وحدَه، فيتقاسم
 * اللسانان ملفاً واحداً ويُسمع أحدُهما بلسان الآخر).
 */
export function reconcile(wanted, queue) {
  const inQueue = new Map(queue.map((row) => [row.text, row]));
  const byText = new Map();
  for (const row of wanted) {
    const seen = byText.get(row.text);
    if (seen && seen.lang !== row.lang) seen.clash = row.lang;
    else if (!seen) byText.set(row.text, { ...row });
  }
  const missing = [];
  const drift = [];
  for (const row of byText.values()) {
    const found = inQueue.get(row.text);
    if (!found) { missing.push(row); continue; }
    if (found.lang !== row.lang || found.category !== row.category) {
      drift.push({ ...row, was: { lang: found.lang, category: found.category } });
    }
  }
  const stale = queue.filter((row) => !byText.has(row.text) && row.status !== 'done');
  const clash = [...byText.values()].filter((row) => row.clash);
  const badLang = [...byText.values()]
    .filter((row) => CATEGORY_LANG[row.category] !== row.lang);
  return { missing, stale, drift, clash, badLang, wanted: [...byText.values()] };
}

// ————— بابُ همزة الوصل: **المنطوقُ يُكتب عارياً** —————
//
// قاعدةُ العائلة (بلاغ اكتب بحدّ مدير المجموعة، ١٣ أغسطس): «همزةُ الوصل تُكتب عاريةً
// في المنطوق الذي لا يُعرَض للقراءة». **وبنكُنا العربيُّ كلُّه من هذا الصنف**: تعليماتٌ
// واحتفالٌ ونمذجة تُسمَع ولا تُرى (`METHOD.md §٩·١`) — ولا نصَّ عربيٌّ واحد يُعرَض
// للطفل ليقرأه (مادّتُنا المقروءة إنكليزية).
//
// **ولِمَ يُمسَك ذلك أصلاً؟** لأنّ الشكلَ على همزة الوصل يُملي على المولّد نطقاً
// خاطئاً: «اِسْمَعْ» تُقرأ بكسرةٍ محقَّقة في ابتداءٍ ووصلٍ معاً، والصوابُ أن تسقط في
// الوصل. وهو خطأٌ **لا يظهر إلا في أذن طفل**: النصُّ سليمٌ في العين، والملفُّ يُولَّد،
// والحرّاسُ خضر.
//
// **والحكمُ ضيّقٌ عن قصد**: ألفٌ **عارية** (‏`ا`) تحمل فتحةً أو ضمّةً أو كسرة — ولا
// تحملها ألفٌ في العربية إلا أن تكون همزةَ وصلٍ شُكِلت (‏`أ` و`إ` و`آ` همزاتُ قطعٍ
// برسمها، والألفُ الوسطى مدٌّ لا حركةَ عليه). ومعها `ٱ` — ألفُ الوصل المرسومة، وهي
// شكلٌ آخرُ للشيء نفسِه. **والتنوينُ خارجٌ** (‏`شكراً`): كرسيٌّ لا حركةَ ابتداء.

/** موضعُ همزة وصلٍ مشكولة في نصّ، أو `-1` — دالّةٌ خالصة تُجرَّب بنصٍّ مدسوس. */
export const waslAt = (text) => String(text).search(/ا[َُِ]|ٱ/u);

/** نصوصُ المنطوق العربيّ التي شُكِلت فيها همزةُ وصل. */
export const waslErrors = (wanted) => wanted
  .filter((row) => row.lang === 'ar' && waslAt(row.text) >= 0)
  .map((row) => ({ ...row, at: waslAt(row.text) }));

/** مدخلُ القائمة بشكله المُعلَن في `docs/AUDIO_QUEUE.md`. */
const entryOf = (row) => ({
  text: row.text,
  lang: row.lang,
  voice: '',
  category: row.category,
  requestedBy: REQUESTED_BY,
  priority: PRIORITY[row.category] ?? 100,
  status: 'pending',
  doneAt: null,
});

const readQueue = () => {
  try {
    return JSON.parse(readFileSync(QUEUE, 'utf8'));
  } catch {
    return [];
  }
};

const writeQueue = (rows) => writeFileSync(QUEUE, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');

// ————— فحصُ الفاحص: **مُجرَّبٌ سالباً** بقائمةٍ مصنوعة —————

function selfTest() {
  let fails = 0;
  const ok = (cond, msg) => {
    if (cond) console.log('  ✓', msg);
    else { fails++; console.log('  ✗', msg); }
  };
  const want = [
    { text: 'cat', lang: 'en', category: 'word' },
    { text: 'اسْمَعْ وَالْمَسْ', lang: 'ar', category: 'instruction' },
  ];
  const full = want.map(entryOf);

  console.log('\n— القائمةُ الموافقة تمرّ —');
  const clean = reconcile(want, full);
  ok(!clean.missing.length && !clean.stale.length && !clean.drift.length
    && !clean.clash.length && !clean.badLang.length, 'لا ناقصَ ولا بائدَ ولا منحرف');

  console.log('\n— والمدسوسُ يُمسَك —');
  ok(reconcile(want, [full[0]]).missing.some((r) => r.text === want[1].text),
    'نصٌّ يُنطَق ولا يُصَفّ يُمسَك (وهو الصنفُ الذي وُجدت له الأداة)');
  ok(reconcile(want, [...full, entryOf({ text: 'ghost', lang: 'en', category: 'word' })])
    .stale.some((r) => r.text === 'ghost'),
    'ومدخلٌ منتظِرٌ لم يعد يُنطَق يُمسَك بائداً');
  ok(reconcile(want, [...full, { ...entryOf({ text: 'ghost', lang: 'en', category: 'word' }), status: 'done' }])
    .stale.length === 0,
    '**والمُصرَّفُ لا يُعَدّ بائداً**: ملفٌّ وُلِّد وسُمع لا يُسقَط بتبدّل شاشة');
  ok(reconcile(want, [{ ...full[0], lang: 'ar' }, full[1]]).drift.some((r) => r.text === 'cat'),
    'ونصٌّ مصفوفٌ بلغةٍ غير المُعلَنة يُمسَك (وهو ما يُصرَّف بصوتٍ من لسانٍ آخر)');
  ok(reconcile(want, [{ ...full[0], category: 'sentence' }, full[1]])
    .drift.some((r) => r.text === 'cat'),
    'وفئةٌ منحرفة تُمسَك (الفئةُ تختار مسحةَ الأداء)');
  ok(reconcile([...want, { text: 'cat', lang: 'ar', category: 'instruction' }], full)
    .clash.some((r) => r.text === 'cat'),
    '**ونصٌّ واحد بلغتين يُمسَك** — مفتاحُ الملفّ بصمةُ نصّه وحدَه، فيُسمع أحدُهما '
    + 'بلسان الآخر (القيدُ الأول في `AUDIO_QUEUE.md`)');
  ok(reconcile([{ text: 'cat', lang: 'ar', category: 'word' }], []).badLang.length === 1,
    'وفئةٌ تخالف لغتَها تُمسَك (`word` إنكليزيةٌ دائماً)');

  console.log('\n— وهمزةُ الوصل تُكتب عاريةً في المنطوق —');
  ok(waslErrors(want).length === 0, 'المنطوقُ العربيُّ المصنوع نظيفٌ قبل الدسّة');
  ok(waslErrors([{ text: 'اِسْمَعْ وَالْمَسْ', lang: 'ar', category: 'instruction' }]).length === 1,
    '**ونصٌّ مدسوسٌ فيه «اِسْمَعْ» يُمسَك** — همزةُ وصلٍ مكسورة، ويُملي الشكلُ '
    + 'على المولّد كسرةً محقَّقةً في الوصل');
  ok(waslErrors([{ text: 'اُنْظُرْ', lang: 'ar', category: 'modeling' }]).length === 1,
    'و«اُنْظُرْ» بضمّتها تُمسَك كذلك');
  ok(waslErrors([{ text: 'ٱسْمَعْ', lang: 'ar', category: 'instruction' }]).length === 1,
    'و`ٱ` (ألفُ الوصل المرسومة) تُمسَك — شكلٌ آخرُ للشيء نفسِه');
  ok(waslErrors([{ text: 'اسْمَعْ وَالْمَسْ مَا أَقُولْ', lang: 'ar', category: 'instruction' }]).length === 0,
    '**والعاريةُ تمرّ**: «اسْمَعْ» بألفٍ بلا حركة، وسائرُ الكلمة مشكولةٌ كما هي');
  ok(waslErrors([{ text: 'أَحْسَنْتْ — إِلَى الْأَمَامِ آنَ', lang: 'ar', category: 'celebration' }]).length === 0,
    'وهمزاتُ القطع (`أ` `إ` `آ`) لا تُمَسّ — الحكمُ على الألف العارية وحدَها');
  ok(waslErrors([{ text: 'شُكْراً', lang: 'ar', category: 'celebration' }]).length === 0,
    'والتنوينُ على كرسيّه يمرّ (`شكراً` ليست همزةَ وصل)');
  ok(waslErrors([{ text: 'I am a cat', lang: 'en', category: 'sentence' }]).length === 0,
    'والمادّةُ الإنكليزية خارج هذا الباب (بابُ المنطوق العربيّ وحدَه)');

  console.log(fails ? `\n${fails} فشل` : '\n✓ المسوّي يمسك المدسوسَ كلَّه');
  return fails ? 1 : 0;
}

// ————— التشغيل —————

if (process.argv.includes('--self-test')) process.exit(selfTest());

const queue = readQueue();
const wanted = await wantedTexts();
const state = reconcile(wanted, queue);
const add = process.argv.includes('--add');
const prune = process.argv.includes('--prune');

const list = (rows, label) => {
  if (!rows.length) return;
  console.log(`\n— ${label} (${rows.length}) —`);
  for (const row of rows.slice(0, 10)) {
    console.log(`  · [${row.lang || '؟'}/${row.category || '؟'}] «${row.text}»`
      + (row.from ? ` — ${row.from}` : '')
      + (row.was ? ` (في القائمة: ${row.was.lang}/${row.was.category})` : ''));
  }
  if (rows.length > 10) console.log(`  … و${rows.length - 10} غيرُها`);
};

console.log(`المُعلَن في الشجرة: ${state.wanted.length} نصاً`
  + ` (${state.wanted.filter((r) => r.lang === 'en').length} إنكليزية`
  + ` و${state.wanted.filter((r) => r.lang === 'ar').length} عربية)`
  + ` · في القائمة: ${queue.length}`);

const wasl = waslErrors(state.wanted);

list(state.missing, 'ناقصٌ: يُنطَق ولا يُصَفّ');
list(state.stale, 'بائدٌ: مصفوفٌ منتظِرٌ لم يعد يُنطَق');
list(state.drift, 'منحرفٌ: لغتُه أو فئتُه في القائمة غيرُ المُعلَنة');
list(state.clash, 'متضاربٌ: نصٌّ واحد بلغتين');
list(state.badLang, 'فئةٌ تخالف لغتَها');
list(wasl, 'همزةُ وصلٍ مشكولة في منطوقٍ عربيّ (تُكتب عاريةً)');

// **ولا يُصَفّ نصٌّ يجب أن يتغيّر**: مفتاحُ الملفّ بصمةُ نصّه، فتصريفُ منطوقٍ مشكولِ
// الهمزة يولّد ملفاً باسمٍ سيتبدّل غداً — فيُصلَح النصُّ في الشجرة أولاً.
if ((add || prune) && wasl.length) {
  console.log(`\nلا تُكتب القائمة: ${wasl.length} نصاً منطوقاً فيه همزةُ وصلٍ مشكولة`
    + ' — تُصلَح في الشجرة أولاً (بابُ همزة الوصل)');
  process.exit(1);
}

if (add || prune) {
  let rows = [...queue];
  if (prune) rows = rows.filter((row) => !state.stale.includes(row));
  if (add) rows = [...rows, ...state.missing.map(entryOf)];
  rows.sort((a, b) => (a.priority - b.priority) || a.text.localeCompare(b.text));
  writeQueue(rows);
  console.log(`\nكُتبت القائمة: ${rows.length} مدخلاً`
    + (add ? ` (+${state.missing.length})` : '')
    + (prune ? ` (−${state.stale.length})` : ''));
  process.exit(0);
}

const bad = state.missing.length + state.drift.length + state.clash.length
  + state.badLang.length + state.stale.length;
console.log(bad
  ? `\n${bad} مدخلاً بين ناقصٍ وبائدٍ ومنحرف — «--add» و«--prune» يصلحانها`
  : '\nكلُّ ما تنطقه الشجرةُ مصفوفٌ في القائمة بلغته وفئته');
console.log(wasl.length
  ? `و${wasl.length} نصاً منطوقاً فيه همزةُ وصلٍ مشكولة — تُكتب عاريةً (لا تصلحها راية)`
  : 'وهمزةُ الوصل عاريةٌ في المنطوق العربيّ كلِّه');
process.exit(bad + wasl.length ? 1 : 0);
