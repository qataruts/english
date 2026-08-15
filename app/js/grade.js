// **مسارُ الحرف — درجاتُ العهد الأول ح١–ح٥** (`METHOD.md §٥`).
//
// ————— أوّلُ شاشةٍ يُرسَم فيها حرفٌ إنكليزيّ، وحدُّها معلَن —————
//
// كلُّ ما قبل هذه الوحدة سمعٌ خالص: «بلا حرفٍ مرسوم إطلاقاً» (س٤). وهذه أوّلُ وحدةٍ
// **يُعرَض فيها الرسمُ**، وحدُّها قاعدةُ اللاقراءة بلغتين نفسُها: **النصُّ مادّةُ
// السؤال لا وسيلةُ التشغيل** — فلا زرَّ تشغيلٍ نصّيّ، والتوجيهُ عربيٌّ منطوق، والرسمُ
// معزولٌ `ltr` بخطٍّ **نائبٍ معلَن** (`data-pending` · ق٥ · `METHOD.md §١٢-٩`).
//
// ————— خمسةُ أشكال، ولكلٍّ مفتاحُه (`METHOD.md §٧`) —————
//
//   `gpc|s|sound-pick`   يُسمَع الصوتُ معزولاً (‏/s/) فيُلمَس رسمُه.
//   `gpc|s|letter-pick`  يُرى الرسمُ فيُلمَس صوتُه (أزرارٌ صوتيةٌ تُعرَّف بإسماعها —
//                        شكلُ س٤-٣ نفسُه، فما تعلّمه الطفلُ من أزرارٍ عمياء يخدمه هنا).
//   `word|sat|build`     **الدمجُ بالرموز**: تُسمَع الكلمةُ فتُركَّب لبناتُها بترتيبها،
//                        وكلُّ لبنةٍ تُسمِع صوتَها حين توضع، ثم تُسمَع الكلمةُ كاملة.
//   `word|sat|decode`    **الفكّ**: كلمةٌ مكتوبة تُفكّ فتُلمَس صورتُها.
//   `tricky|the|read`    **الشائكةُ بطريقة heart words**: تُفكّ مقاطعُها المنتظمة
//                        (نقطةٌ تحتها) ويُوسَم موضعُ الشوكة بقلب — **علامةٌ لا نصّ**.
//
// ————— قيدُ الاقتران: بابٌ واحد، وهذه الوحدةُ تمرّ منه —————
//
// «لا يدخل تمرينَ قراءةٍ كلمةٌ لم تبلغ صندوقَ الإتقان في مفتاحها السمعيّ»
// (`METHOD.md §٦`). فليس في هذا الملفّ طريقٌ إلى كلمات القراءة إلا `readableAt`، وهي
// **تأبى أن تُستدعى بلا دالّة ليتنر**. وأثرُه في يد الطفل: درجةٌ تُفتَح ولا يخرج فيها
// دمجٌ ولا فكٌّ حتى تنضج كلماتُها سمعاً — **وتمضي برموزها وشائكاتها** فلا يقف المسار.
//
// **والشائكاتُ خارجه بعلّتها المكتوبة** (`curriculum.js` — `trickyAt`): كلماتُ وظيفةٍ
// بميزانيةٍ معدودة لا مدخلَ سمعيّ لها، وتُدرَّس **داخل سياقٍ مسموع** (‏`the cat`).

import * as progress from './progress.js';
import { registerScreen } from './registry.js';
import {
  stations, readableAt, trickyAt, markedTricky, symbolById, isTouchable,
  phonemeOf, phonemeSay, HEART_WORDS, WORDS,
} from './curriculum.js';
import { figureEl, specOf } from './figures.js';
import {
  say, sayEn, praiseThen, missedThen, seeder, skillOf, stationById, stationForSkill,
  registerExercise, stationScreen, usedOf, BEAT,
} from './station.js';
import { h, icon, pick, shuffle, seeded, pop, LETTER_ACCENT } from './ui.js';

/** أنواعُ الشاشات التي تملكها هذه الوحدة (يقابلها `STATIONS` في `test_measure.mjs`). */
const TYPES = new Set(['grade']);

const GUIDED = 2;
const SOLO = 5;
const OPTIONS = 3;
const MODEL_ITEMS = 2;
/** سقفُ الدمج في جلسة المراجعة: تمرينٌ من ثلاث لمساتٍ يطول على طفلٍ إن تكرّر (نظيرُ س٤-٣). */
const BUILD_MAX = 2;

// ————— التعليماتُ المنطوقة (عربيةٌ كلُّها — `METHOD.md §٩·١`) —————
//
// **وهمزةُ الوصل عاريةٌ فيها** (قاعدةُ العائلة — بابُ `queue_texts.mjs`): هذه نصوصٌ
// تُسمَع ولا تُعرَض للقراءة، والشكلُ عليها يُملي على المولّد كسرةً في الوصل.

const ASK = {
  sound: 'اسْمَعِ الصَّوْتَ وَالْمَسْ رَسْمَهُ',
  letter: 'انْظُرْ إِلَى الرَّسْمِ وَالْمَسْ صَوْتَهُ',
  build: 'اسْمَعِ الْكَلِمَةَ ثُمَّ رَكِّبْ لَبِنَاتِهَا بِتَرْتِيبِهَا',
  decode: 'فُكَّ الْكَلِمَةَ وَالْمَسْ صُورَتَهَا',
  tricky: 'هَذِهِ كَلِمَةٌ نَحْفَظُهَا — اسْمَعْهَا وَالْمَسْهَا',
  model: 'انْظُرْ وَاسْمَعْ — الْمُعَلِّمُ يَقْرَأُ وَأَنْتَ تَنْظُرْ',
};

/** محطاتُ هذه الوحدة من المنهج. */
const owned = () => stations().filter((s) => TYPES.has(s.type));

/**
 * **كلُّ نصٍّ قد تنطقه هذه الوحدة** — إعلانٌ لا استنتاج (`tools/queue_texts.mjs`):
 * تعليماتُها العربية · كلماتُ القراءة الإنكليزية · أصواتُ رموزها معزولةً · الشائكاتُ
 * **وسياقاتُها المسموعة**.
 *
 * **ويُعلَن حوضُ المنهج كلُّه لا المتقَنُ منه**: قيدُ الاقتران يحكم **ما يُعرَض** لا ما
 * يُصَفّ للتوليد — فالكلمةُ التي تنضج غداً يجب أن يكون ملفُّها جاهزاً يومَها، وقائمةُ
 * الصوت تُصرَّف مرّةً في جلسة ص لا كلَّ يوم.
 */
export const SPOKEN = [
  ...Object.values(ASK).map((text) => ({ text, lang: 'ar', category: 'instruction' })),
  ...[...new Set(owned().flatMap((s) => (s.pool || []).map((w) => w.w)))]
    .map((text) => ({ text, lang: 'en', category: 'word' })),
  ...[...new Set(owned().flatMap((s) => (s.frontier.symbols || [])
    .map((id) => phonemeSay(phonemeOf(id))).filter(Boolean)))]
    .map((text) => ({ text, lang: 'en', category: 'phoneme' })),
  ...[...new Set(owned().flatMap((s) => s.frontier.tricky || []))]
    .map((text) => ({ text, lang: 'en', category: 'word' })),
  ...[...new Set(Object.values(HEART_WORDS).map((shape) => shape.say))]
    .map((text) => ({ text, lang: 'en', category: 'sentence' })),
];

// ————— ما تستهلكه هذه الوحدة (البابُ الرابع في `check_range.py`) —————
//
// **أرضيةٌ لا سقف**: ستَّ عشرةَ درجةً جباهُها مختلفة، والجردُ الحقيقيّ جولةً جولة.

export const CONSUMES = {
  grade: { words: [], fields: [], gpcs: [], tricky: [], sounds: [] },
};

// ————— أوصافُ ما يُرسَم — **ولكلٍّ صنفُه معلَناً** (`usedOf` في `station.js`) —————
//
// الرسمُ الواحد قد يكون رمزاً يُلمَس أو كلمةً تُفكّ أو شائكةً محفوظة، وحكمُ الحارس
// عليها ثلاثةٌ مختلفة: الرمزُ يُقابَل بالسلّم، والكلمةُ بالرصيد، والشائكةُ بالميزانية.
// فيُعلن كلُّ وصفٍ **صنفَه** (`unit`) و**معرّفَ كل مقطع** (`id`) — فيُجرَد ما يُرسَم
// من الوصف نفسِه لا من نيّة المولّد.

/** وصفُ رمزٍ يُلمَس أو لبنةٍ تُركَّب: مقطعٌ واحد بلا وسم. */
const glyphSpec = (id) => ({
  kind: 'letter',
  unit: 'gpc',
  word: id,
  parts: [{ id, g: symbolById(id)?.g || id }],
});

/** وصفُ كلمةٍ مكتوبة بمقاطعها: نقطةٌ تحت كلٍّ — «أزرارُ الصوت» تحت الرسم كما في L&S. */
const spelledSpec = (name, gpc) => ({
  kind: 'letter',
  unit: 'word',
  word: name,
  parts: gpc.map((id) => ({ id, g: symbolById(id)?.g || id, mark: 'dot' })),
});

const wordSpec = (word) => spelledSpec(word.w, word.gpc);

/** وصفُ شائكةٍ: مقاطعُها موسومةً بدرجتها (نقطةٌ لمفكوكٍ وقلبٌ للشوكة). */
const trickySpec = (marked) => ({
  kind: 'letter',
  unit: 'tricky',
  word: marked.w,
  parts: marked.parts,
});

/** صورةُ كلمةٍ من الرصيد المصوَّر — بإعلانها هي (`specOf` القاعدةُ الواحدة). */
const PICTURED = new Map(WORDS.map((word) => [word.w, word]));
const pictureSpec = (name) => specOf(PICTURED.get(name) || { w: name });

// ————— حوضُ المحطة: ما يجوز أن يُعرَض فيها اليوم —————

/**
 * **البابُ الوحيد إلى كلمات القراءة** — ومنه وحدَه تُبنى جولاتُ الدمج والفكّ.
 * @param {object} station محطةُ الدرجة
 * @param {(key: string) => boolean} isMastered دالّةُ ليتنر (تُحقَن، ولا افتراضَ لها)
 */
const readableIn = (station, isMastered) => readableAt(station.part, isMastered);

/** كلماتُ **هذه الدرجة** التي نضجت سمعاً — وهي التي تُقاس فيها (مفاتيحُها مفاتيحُها). */
const taughtIn = (station, isMastered) => {
  const ready = new Set(readableIn(station, isMastered).map((word) => word.w));
  return (station.words || []).filter((word) => ready.has(word.w));
};

/** مديات نوعٍ من مفاتيح المحطة (الحقلُ الثاني) — فلا تعرف الشاشةُ مدىً لم يُعلَن. */
const rangesOf = (station, kind) => (station.skills || [])
  .filter((key) => key.endsWith(`|${kind}`)).map((key) => key.split('|')[1]);

/** مشتّتاتُ رمزٍ: رسومٌ مفتوحةٌ **لا تشارك هدفَه صوتَه** — وإلّا صار للسؤال جوابان. */
function otherGlyphs(station, rnd, targetId, count) {
  const sound = phonemeOf(targetId);
  const pool = (station.frontier.symbols || [])
    .filter((id) => id !== targetId && phonemeOf(id) !== sound);
  return shuffle(pool, rnd).slice(0, count);
}

// ————— بناءُ الجولات (حتميٌّ ببذرة) —————

/** ح: يُسمَع الصوتُ معزولاً فيُلمَس رسمُه. */
function soundRound(station, rnd, { range = null } = {}) {
  const ids = rangesOf(station, 'sound-pick');
  const id = range && ids.includes(range) ? range : pick(ids, rnd);
  const skill = id && skillOf(station, id, 'sound-pick');
  const sound = id && phonemeSay(phonemeOf(id));
  if (!skill || !sound) return null;
  const pool = otherGlyphs(station, rnd, id, OPTIONS - 1);
  if (!pool.length) return null;
  const specs = shuffle([id, ...pool], rnd).map(glyphSpec);
  const next = seeder(rnd);
  return {
    kind: 'sound-pick',
    shape: 'sound',
    unit: skill.unit,
    range: skill.range,
    ask: ASK.sound,
    target: id,
    options: specs,
    figures: specs,
    sounds: [sound],
    sig: `${station.id}|${id}|${next()}`,
  };
}

/** ح: يُرى الرسمُ فيُلمَس صوتُه (أزرارٌ عمياء تُعرَّف بإسماعها — شكلُ س٤-٣). */
function letterRound(station, rnd, { range = null } = {}) {
  const ids = rangesOf(station, 'letter-pick');
  const id = range && ids.includes(range) ? range : pick(ids, rnd);
  const skill = id && skillOf(station, id, 'letter-pick');
  const sound = id && phonemeSay(phonemeOf(id));
  if (!skill || !sound) return null;
  const pool = otherGlyphs(station, rnd, id, OPTIONS - 1)
    .map((other) => phonemeSay(phonemeOf(other)));
  if (!pool.length) return null;
  const shown = shuffle([sound, ...pool], rnd);
  const next = seeder(rnd);
  return {
    kind: 'letter-pick',
    shape: 'letter',
    unit: skill.unit,
    range: skill.range,
    ask: ASK.letter,
    target: sound,
    picture: glyphSpec(id),
    figures: [glyphSpec(id)],
    shown,
    sounds: shown,
    sig: `${station.id}|${id}|${next()}`,
  };
}

/** ح: تُسمَع الكلمةُ فتُركَّب لبناتُها بترتيبها (دمجُ CVC — `METHOD.md §٥`). */
function buildRound(station, rnd, { word = null, isMastered } = {}) {
  const pool = taughtIn(station, isMastered);
  const target = word && pool.some((w) => w.w === word.w) ? word : pick(pool, rnd);
  if (!target) return null;
  const skill = skillOf(station, target.w, 'build');
  if (!skill) return null;
  const bricks = shuffle(target.gpc.map((id, at) => ({ id, at })), rnd);
  const next = seeder(rnd);
  return {
    kind: 'build',
    shape: 'build',
    unit: skill.unit,
    range: skill.range,
    ask: ASK.build,
    target: target.w,
    order: [...target.gpc],
    shown: bricks.map((brick) => ({ ...brick, spec: glyphSpec(brick.id) })),
    figures: bricks.map((brick) => glyphSpec(brick.id)),
    saying: [target.w],
    sounds: target.gpc.map((id) => phonemeSay(phonemeOf(id))).filter(Boolean),
    sig: `${station.id}|${target.w}|${next()}`,
  };
}

/** ح: كلمةٌ مكتوبة تُفكّ فتُلمَس صورتُها. */
function decodeRound(station, rnd, { word = null, isMastered } = {}) {
  const ranges = new Set(rangesOf(station, 'decode'));
  const pool = taughtIn(station, isMastered).filter((w) => ranges.has(w.w));
  const target = word && pool.some((w) => w.w === word.w) ? word : pick(pool, rnd);
  const skill = target && skillOf(station, target.w, 'decode');
  if (!skill) return null;
  // **والمشتّتاتُ صورُ ما نضج سمعاً**: صورةٌ لم يلقَها الطفلُ تجعل السؤالَ حزراً
  const others = shuffle(readableIn(station, isMastered)
    .filter((w) => w.w !== target.w && isTouchable(w.w)), rnd)
    .slice(0, OPTIONS - 1)
    .map((w) => w.w);
  if (!others.length) return null;
  const specs = shuffle([target.w, ...others], rnd).map(pictureSpec);
  const next = seeder(rnd);
  return {
    kind: 'decode',
    shape: 'decode',
    unit: skill.unit,
    range: skill.range,
    ask: ASK.decode,
    target: target.w,
    picture: wordSpec(target),
    options: specs,
    figures: [wordSpec(target), ...specs],
    saying: [target.w, ...others],
    sig: `${station.id}|${target.w}|${next()}`,
  };
}

/** ح: الشائكةُ تُسمَع في سياقها ثم تُلمَس مكتوبةً بوسم شوكتها. */
function trickyRound(station, rnd, { range = null, isMastered } = {}) {
  // **وتُدرَّس شائكاتُ الدرجة وحدَها، وتُشاركها المفتوحةُ قبلها مشتّتاتٍ فقط**: مفاتيحُ
  // المحطة مفاتيحُها هي (`tricky|I|read` عند ح٥)، وما فُتح قبلها يُراجَع في محطته
  // ويُعاد في المراجعة اليومية — فلو سُئل عنه هنا لَكُتب قياسُه بمفتاحٍ لا تملكه.
  const mine = rangesOf(station, 'read');
  const open = trickyAt(station.part);
  const word = range && mine.includes(range) ? range : pick(mine, rnd);
  const skill = word && skillOf(station, word, 'read');
  const marked = word && markedTricky(word, station.part);
  if (!skill || !marked) return null;
  // **ومشتّتاتُه شائكاتٌ أخرى ثم كلماتُ قراءةٍ ناضجة** — كلُّها مرسومةٌ مفكوكةٌ عنده
  const others = shuffle([
    ...open.filter((other) => other !== word)
      .map((other) => trickySpec(markedTricky(other, station.part))),
    ...readableIn(station, isMastered).map(wordSpec),
  ], rnd).slice(0, OPTIONS - 1);
  if (!others.length) return null;
  const specs = shuffle([trickySpec(marked), ...others], rnd);
  const next = seeder(rnd);
  return {
    kind: 'read',
    shape: 'tricky',
    unit: skill.unit,
    range: skill.range,
    ask: ASK.tricky,
    target: word,
    context: marked.say,
    options: specs,
    figures: specs,
    // **وما يُنطَق منها يُجرَد `said` لا `saying`**: الشائكةُ كلمةُ وظيفةٍ لا مدخلَ
    // لها في الرصيد المصوَّر (`METHOD.md §١٢-١`)، فتُقابَل بمداخل Starters كما يُقابَل
    // الأمرُ المنطوق في س٢ — وسياقُها يحمل الكلمةَ نفسَها فيُجرَد الاثنان معاً.
    said: String(marked.say).split(/\s+/),
    sig: `${station.id}|${word}|${next()}`,
  };
}

/** أشكالُ الدرجة الخمسة، ولكلٍّ بانيه. */
const SHAPES = {
  'sound-pick': soundRound,
  'letter-pick': letterRound,
  build: buildRound,
  decode: decodeRound,
  read: trickyRound,
};

/** أنواعُ التمارين التي تُنتجها هذه المحطةُ اليوم — بحسب ما نضج من كلماتها. */
const kindsOf = (station, isMastered) => [
  ...new Set((station.skills || []).map((key) => key.split('|')[2])),
].filter((kind) => SHAPES[kind]
  && (!['build', 'decode'].includes(kind) || taughtIn(station, isMastered).length));

/**
 * **خطةُ المحطة**: نمذجةٌ ثم جولتان بعونٍ ثم خمسٌ «وحدك» — من بذرةٍ واحدة.
 *
 * **وتُمرَّر دالّةُ ليتنر ولا تُفترَض** (قيدُ الاقتران): الشاشةُ تمرّر
 * `progress.isMastered`، والجردُ يمرّر ما يعلنه (انظر `probeRounds`).
 */
export function buildStation(stationId, seed, isMastered = progress.isMastered) {
  const station = stationById(stationId);
  if (!station || !TYPES.has(station.type)) return null;
  const rnd = seeded(seed >>> 0);
  const kinds = kindsOf(station, isMastered);
  if (!kinds.length) return null;

  /* **وسلّةُ الأشكال تُستنفَد ولا تُهدَر جولة**: شكلٌ قد لا يجد مادّتَه في لحظته
     (كلمةُ فكٍّ وحيدةٌ بلا مشتّتٍ مصوَّر مثلاً)، فلو قنعنا بأوّل محاولةٍ لَخرجت المحطةُ
     ناقصةَ الجولات بلا خبر — وهو نقصٌ لا يُرى إلا في عدّ جولات طفلٍ في متصفّح. */
  let bag = [];
  const nextRound = () => {
    for (let tries = 0; tries < kinds.length * 2; tries++) {
      if (!bag.length) bag = shuffle(kinds, rnd);
      const round = SHAPES[bag.pop()](station, rnd, { isMastered });
      if (round) return round;
    }
    return null;
  };

  const shown = Array.from({ length: MODEL_ITEMS }, nextRound).filter(Boolean);
  if (!shown.length) return null;
  return {
    model: {
      title: 'المعلّمُ يُري ويقول، وأنت تنظر وتسمع',
      hint: ASK.model,
      // (و`en` فارغةٌ عمداً: مادّةُ النمذجة رسمٌ وصوتٌ متعاقبان لا نصٌّ واحد،
      //  فيتولّاها `after` بالقناة نفسِها — ولا يُصَفّ في قائمة الصوت نصٌّ مركَّب.)
      items: shown.map((round) => ({
        en: '',
        el: () => modelEl(round),
        after: (box, api) => sayModel(round, api),
      })),
      figures: shown.flatMap((round) => round.figures || []),
      saying: [...new Set(shown.flatMap((round) => round.saying || []))],
      sounds: [...new Set(shown.flatMap((round) => round.sounds || []))],
      said: [...new Set(shown.flatMap((round) => round.said || []))],
    },
    guided: Array.from({ length: GUIDED }, nextRound).filter(Boolean),
    solo: Array.from({ length: SOLO }, nextRound).filter(Boolean),
  };
}

/**
 * جردُ الجولات للحارس — النمذجةُ والعونُ و«وحدك» كلُّها.
 *
 * **ويُجرَد بأوسع الحالات لا بأضيقها**: تُمرَّر دالّةُ إتقانٍ تقول «نعم» لكلِّ مفتاح،
 * فيولّد المولّدُ **كلَّ ما يمكن أن يقع تحت بصر الطفل يوماً** — وهو ما يجرده حارسُ
 * الجبهة (رمزٌ · كلمةٌ · شائكة). ولا يمسّ ذلك قيدَ الاقتران بشيء: القيدُ **بابٌ في
 * `readableAt`** يحرسه `check_coupling` بحالة ليتنر مصنوعة وتشهد عليه الشجرةُ الحيّة —
 * ولو جُرِد الحارسُ بحالةٍ فارغة لَما رأى جولةَ قراءةٍ واحدة، فحرس ما لا يُعرَض.
 */
export function probeRounds(stationId, seed) {
  const plan = buildStation(stationId, seed, () => true);
  if (!plan) return [];
  return [plan.model, ...plan.guided, ...plan.solo].map(usedOf);
}

// ————— تسجيلُ المحاولة —————
//
// **بنوعِ التمرين صريحاً في الشيفرة** (بابُ الشيفرة في `test_measure.mjs`): خمسةُ
// أنواعٍ لا واحد — وهي مفاتيحُ `METHOD.md §٧` نفسُها. **والرمزُ مهارتان متعاكستان**
// (‏`sound-pick` و`letter-pick`) كالدمج والتقطيع: من عرف رسمَ الصوت قد لا يعرف صوتَ
// الرسم، فلكلٍّ صندوقُه.

const score = (round, correct, recordAttempt = progress.recordAttempt) => {
  if (round.kind === 'sound-pick') {
    recordAttempt(round.unit, round.range, 'sound-pick', correct);
    return;
  }
  if (round.kind === 'letter-pick') {
    recordAttempt(round.unit, round.range, 'letter-pick', correct);
    return;
  }
  if (round.kind === 'build') {
    recordAttempt(round.unit, round.range, 'build', correct);
    return;
  }
  if (round.kind === 'decode') {
    recordAttempt(round.unit, round.range, 'decode', correct);
    return;
  }
  recordAttempt(round.unit, round.range, 'read', correct);
};

// ————— الشاشات —————

/** زرُّ إعادة السماع — **أذنٌ لا كلمة** (قاعدةُ اللاقراءة بلغتين). */
const hearBtn = (onHear) => h('button', {
  class: 'btn btn--hear',
  'aria-label': 'اسمع مرّةً أخرى',
  onclick: onHear,
}, icon('ear'));

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** إسماعُ نصوصٍ متعاقبة في القناة الواحدة. */
async function sayEach(list, api) {
  for (const text of list) {
    if (!api.alive()) return;
    await sayEn(text);
  }
}

/**
 * مادّةُ سؤال الجولة كما تُسمَع — **والفكُّ بالعين فلا صوتَ له**: لو نُطقت الكلمةُ
 * المكتوبة لَصار الجوابُ سمعاً وسقط الفكُّ كلُّه (ولذلك لا زرَّ أذنٍ في شاشته).
 */
async function playAsk(round, api) {
  if (round.shape === 'sound') return sayEn(round.sounds[0]);
  if (round.shape === 'tricky') {
    // **السياقُ ثم الكلمة** (`METHOD.md §٦`): تُسمَع داخل جملةٍ مألوفة ثم وحدَها
    await sayEn(round.context);
    if (!api.alive()) return undefined;
    return sayEn(round.target);
  }
  return sayEn(round.target);                               // الدمج: تُسمَع الكلمة
}

/**
 * **ما يُنطَق عن بطاقةٍ بلسانها**: الرمزُ يُنطَق **صوتاً** لا اسمَ حرف (المرحلةُ ٢ من
 * L&S أصواتٌ لا أسماء)، والكلمةُ والشائكةُ تُنطقان كما هما.
 */
const spokenOf = (round, name) =>
  (round.shape === 'sound' ? phonemeSay(phonemeOf(name)) || name : name);

// ————— النمذجة —————

/**
 * **ما يُري المعلّمُ في النمذجة**: الرسمُ المسؤولُ عنه في الجولة —
 * وفي الدمج **الكلمةُ مبنيّةً** (لبناتُها بترتيبها): المعلّمُ يُري ما سيبنيه الطفلُ
 * بيده، وهي عينُ لبنات الجولة لا رسمٌ سواها.
 */
const modelEl = (round) => h('div', { class: 'q-shown-one' },
  figureEl(round.shape === 'build' ? spelledSpec(round.target, round.order)
    : round.picture
      || (round.options || []).find((option) => option.word === round.target)
      || (round.options || [])[0]
      || round.figures[0]));

/**
 * نمذجةٌ منطوقة — **الرسمُ ثم صوتُه**: يرى الطفلُ الوصلةَ التي سيُطالَب بها
 * (رسمٌ بصوته · كلمةٌ بأصواتها ثم كاملةً · شائكةٌ في سياقها).
 */
async function sayModel(round, api) {
  if (round.shape === 'sound' || round.shape === 'letter') {
    await sayEn(round.shape === 'sound' ? round.sounds[0] : round.target);
    return;
  }
  if (round.shape === 'build') {
    await sayEach(round.sounds, api);
    if (api.alive()) await sayEn(round.target);
    return;
  }
  if (round.shape === 'tricky') {
    await sayEn(round.target);
    if (api.alive()) await sayEn(round.context);
    return;
  }
  await sayEn(round.target);
}

// ————— شاشةُ اللمس المشترك (رمزٌ يُلمَس · صورةٌ تُلمَس · شائكةٌ تُلمَس) —————

/**
 * جولةٌ جوابُها **بطاقةٌ واحدة تُلمَس**، ويفترق شكلُها فيما يُعرَض في الساحة:
 * صوتٌ يُسمَع (`sound`) · كلمةٌ مكتوبة تُفكّ (`decode`) · شائكةٌ في سياقها (`tricky`).
 */
function pickView(round, hooks) {
  const stage = h('div', { class: 'q-stage q-stage--ask' });
  stage.dataset.ask = round.target;
  // **ولا زرَّ ميّت**: زرُّ الأذن حيث ثَمَّ ما يُسمَع، ولا يُرسَم في الفكّ
  if (round.shape !== 'decode') stage.append(hearBtn(() => playAsk(round, hooks)));
  if (round.picture) stage.append(h('span', { class: 'q-shown-one' }, figureEl(round.picture)));

  const choices = h('div', { class: `q-choices q-choices--${round.shape}` });
  let locked = false;

  for (const spec of round.options) {
    const btn = h('button', {
      class: 'qcard',
      'aria-label': 'هَذِهِ',
      onclick: async () => {
        if (locked) return;
        locked = true;
        const chosen = btn.querySelector('.fig')?.dataset.word;
        const correct = chosen === round.target;
        hooks.attempt(round, correct);
        if (correct) {
          btn.classList.add('good');
          pop(btn);
          await praiseThen(hooks, spokenOf(round, round.target));
          return;
        }
        const targetEl = [...choices.children]
          .find((el) => el.querySelector('.fig')?.dataset.word === round.target);
        await missedThen(hooks, {
          chosen: spokenOf(round, chosen),
          target: spokenOf(round, round.target),
          chosenEl: btn,
          targetEl,
        });
      },
    }, figureEl(spec));
    choices.append(btn);
  }

  (async () => {
    await say(round.ask);
    if (hooks.alive() && round.shape !== 'decode') await playAsk(round, hooks);
  })();

  return h('div', {}, h('p', { class: 'hint' }, round.ask), stage, choices);
}

// ————— شاشةُ الرسم ← صوته (letter-pick): أزرارٌ صوتيةٌ تُعرَّف بإسماعها —————

function letterView(round, hooks) {
  const stage = h('div', { class: 'q-stage q-stage--ask' });
  stage.dataset.ask = round.target;
  stage.append(hearBtn(() => intro(true)));
  stage.append(h('span', { class: 'q-shown-one' }, figureEl(round.picture)));

  const bank = h('div', { class: 'q-choices q-choices--sounds' });
  /* **وحالُ الأزرار مُعلَنةٌ في DOM** (`data-ready` — سِمةٌ لا يراها طفل): مقفلةٌ حتى
     تتمّ إسماعةُ التعريف، فلولا إعلانُ الحال لَقاس الفاحصُ لمسةً ابتلعها القفل. */
  let locked = true;
  const setLocked = (value) => {
    locked = value;
    stage.dataset.ready = value ? '0' : '1';
  };
  setLocked(true);

  const buttons = round.shown.map((sound) => {
    const fig = figureEl({ kind: 'sound', word: '' });
    fig.dataset.sound = sound;
    const btn = h('button', { class: 'qcard qcard--sound', 'aria-label': 'صَوْت' }, fig);
    btn.addEventListener('click', () => tap(sound, btn));
    return btn;
  });
  bank.append(...buttons);

  /** إسماعةُ التعريف: كلُّ زرٍّ يُضيء ويُسمِع صوتَه في موضعه. */
  async function intro(again = false) {
    setLocked(true);
    if (again) await wait(BEAT / 3);
    for (const [i, sound] of round.shown.entries()) {
      if (!hooks.alive()) return;
      const btn = buttons[i];
      if (btn.isConnected) btn.classList.add('is-hint');
      await sayEn(sound);
      btn.classList.remove('is-hint');
      if (!hooks.alive()) return;
      await wait(BEAT / 3);
    }
    setLocked(false);
  }

  async function tap(sound, btn) {
    if (locked) return;
    setLocked(true);
    const correct = sound === round.target;
    hooks.attempt(round, correct);
    if (correct) {
      btn.classList.add('good');
      pop(btn);
      await praiseThen(hooks, round.target);
      return;
    }
    const wanted = buttons.find((el) => el.querySelector('.fig')?.dataset.sound === round.target);
    await missedThen(hooks, {
      chosen: sound, target: round.target, chosenEl: btn, targetEl: wanted,
    });
  }

  (async () => {
    await say(round.ask);
    if (hooks.alive()) await intro();
  })();

  return h('div', {}, h('p', { class: 'hint' }, round.ask), stage, bank);
}

// ————— شاشةُ الدمج (build): لبناتٌ تُركَّب كلمةً تُسمَع —————

/**
 * **الدمجُ بناءٌ يُرى**: تُسمَع الكلمةُ، وتُعرَض لبناتُها مخلوطةً، فيلمسها الطفلُ
 * بترتيب أصواتها — وكلُّ لبنةٍ تنتقل إلى صفّ البناء **وتُسمِع صوتَها**، فإذا تمّ الصفُّ
 * سُمعت الكلمةُ كاملة. وهو نظيرُ «ركّب واقرأ» في اقرأ، ومادّتُه **أصواتٌ لا أسماءُ حروف**.
 *
 * **والصفُّ يتقدّم من اليسار بمؤشّر بدء السطر** (`METHOD.md §٩·٣`): علاجُ انقلاب
 * المسح الموثَّق في الدراسة تدريساً لا افتراضاً.
 *
 * **والمحاولةُ واحدةٌ للجولة**: أوّلُ خطأٍ يُنهيها (وإلا هبط صندوقُ المفتاح مرّاتٍ
 * في جولةٍ واحدة).
 */
function buildView(round, hooks) {
  const stage = h('div', { class: 'q-stage q-stage--ask' });
  stage.dataset.ask = round.target;
  // **إعلانُ الترتيب المطلوب للفاحص** (سِمةٌ لا يراها طفل — نظيرُ `data-ask`)
  stage.dataset.order = round.order.join(' ');
  stage.append(hearBtn(() => sayEn(round.target)));

  const tray = h('div', { class: 'q-tray q-tray--letters' });
  const bank = h('div', { class: 'q-choices q-choices--letters' });
  let at = 0;                        // اللبنةُ المنتظَرة من الترتيب

  let locked = true;
  const setLocked = (value) => {
    locked = value;
    stage.dataset.ready = value ? '0' : '1';
  };
  setLocked(true);

  const buttons = round.shown.map((brick) => {
    const btn = h('button', {
      class: 'qcard qcard--letter', 'aria-label': 'لَبِنَة',
    }, figureEl(brick.spec));
    btn.addEventListener('click', () => tap(brick, btn));
    return btn;
  });
  bank.append(...buttons);

  /** نقلُ لبنةٍ إلى صفّ البناء — وهو ما يراه الطفلُ جواباً كان أو تصحيحاً. */
  const place = (btn) => {
    btn.classList.add('is-set');
    btn.disabled = true;
    tray.append(btn);
  };

  async function tap(brick, btn) {
    if (locked) return;
    setLocked(true);
    const correct = brick.id === round.order[at];
    if (correct) {
      place(btn);
      pop(btn);
      at++;
      await sayEn(phonemeSay(phonemeOf(brick.id)));
      if (!hooks.alive()) return;
      if (at < round.order.length) {
        setLocked(false);
        return;
      }
      hooks.attempt(round, true);
      // **وتمامُ البناء تُسمَع فيه الكلمةُ كاملة** — وهو الدمجُ نفسُه في أذن الطفل
      await praiseThen(hooks, round.target);
      return;
    }
    hooks.attempt(round, false);
    const wanted = buttons.find((el) => !el.classList.contains('is-set')
      && el.querySelector('.fig')?.dataset.word === round.order[at]);
    await missedThen(hooks, {
      chosen: phonemeSay(phonemeOf(brick.id)) || brick.id,
      target: phonemeSay(phonemeOf(round.order[at])) || round.order[at],
      chosenEl: btn,
      targetEl: wanted,
      // **ويُرى الصوابُ حيث يقع**: تنتقل اللبنةُ المطلوبة إلى موضعها من الصفّ
      reveal: () => wanted && place(wanted),
    });
  }

  (async () => {
    await say(round.ask);
    if (!hooks.alive()) return;
    await sayEn(round.target);
    if (!hooks.alive()) return;
    setLocked(false);
  })();

  return h('div', {}, h('p', { class: 'hint' }, round.ask), stage, tray, bank);
}

const viewOf = (round, hooks) => {
  if (round.shape === 'build') return buildView(round, hooks);
  if (round.shape === 'letter') return letterView(round, hooks);
  return pickView(round, hooks);
};

// ————— التسجيل في الموجِّه وفي المراجعة —————

registerScreen('grade', (part) => {
  const station = stationById(`grade:${part}`);
  if (!station || !buildStation(station.id, 1)) return null;
  return stationScreen({
    nodeId: station.id,
    title: station.title,
    accent: LETTER_ACCENT,
    make: () => buildStation(station.id, (Date.now() >>> 0) ^ 0x9e3779b9),
    view: viewOf,
    score,
    save: (stars) => progress.setStars(station.id, stars),
  });
});

/**
 * جولةٌ لمهارةٍ مستحقّة — ولكلِّ نوعٍ بانيه (`review.js` والبوابات).
 *
 * **وقيدُ الاقتران يعمل ههنا كما يعمل في المحطة** (وهي «أخطرُ موضعٍ له» — `review.js`):
 * البانِي يمرّ من `readableAt` نفسِها، فمهارةُ قراءةٍ سقطت كلمتُها سمعاً **لا تُنتج
 * تمريناً** وتُملأ الجلسةُ بغيرها.
 */
const single = (kind) => (skill, rnd) => {
  const station = stationForSkill(skill);
  if (!station || !TYPES.has(station.type)) return null;
  const opts = { isMastered: progress.isMastered };
  // **ومدىً لا تعرفه المحطةُ يُبنى بمداها هي**: سجلٌّ قديم قد يحمل مفتاحاً لمدىً
  // تحرّك في المنهج، فتجيب المراجعةُ بتمرينٍ من نوعه بدل أن تصمت (عقدُ `stationForSkill`).
  if (kind === 'build' || kind === 'decode') {
    opts.word = (station.words || []).find((word) => word.w === skill.range) || null;
  } else {
    const ranges = rangesOf(station, kind);
    opts.range = ranges.includes(String(skill.range)) ? String(skill.range) : null;
  }
  return SHAPES[kind](station, rnd, opts);
};

registerExercise('sound-pick', { build: single('sound-pick'), view: viewOf, score });
registerExercise('letter-pick', { build: single('letter-pick'), view: viewOf, score });
registerExercise('build', { build: single('build'), view: viewOf, score, max: BUILD_MAX });
registerExercise('decode', { build: single('decode'), view: viewOf, score });
registerExercise('read', { build: single('read'), view: viewOf, score });
