// **القصةُ شبهُ المفكوكة** (`METHOD.md §٥`): «نصٌّ قصير مصوَّر كلُّه من رموز الدرجات
// المفتوحة + شائكاتها — يفحصه `check_range` ككل تمرين»، ومفتاحُه `text|<درجة>|read`.
//
// ————— أوّلُ نصٍّ متّصل يقع تحت عين الطفل، وثلاثةُ أحكامٍ فيه —————
//
// ١) **القصةُ نصٌّ لا حوضُ توليد**: سائرُ شاشاتنا تنتقي مادّتَها من حوضٍ بحسب ما نضج،
//    وهذه **تُعرَض كما كُتبت أو لا تُعرَض**. فقيدُ الاقتران يحكمها كلَّها دفعةً واحدة
//    (`METHOD.md §٦` يسمّي `text` مع `decode` و`build`): كلمةٌ من كلماتها لم تنضج
//    سمعاً ⇒ **لا قصةَ اليوم** — ولا تُنقَص كلمةٌ منها ولا تُبدَّل، فيبقى النصُّ نصّاً.
// ٢) **ولا صوتَ للسطر في يد الطفل**: لو نُطق لَحفظه ولم يفكّه — فلا زرَّ أذنٍ في
//    الصفحة (حكمُ `decode` نفسُه). **والمعلّمُ يقرأ الصفحةَ الأولى في النمذجة**
//    وحدَها، لأنّ **مؤشّر بدء السطر تدريسٌ لا افتراض** (`METHOD.md §٩·٣`): لا يُعرَف
//    «من أين أبدأ وإلى أين أمضي» إلا بأن يُرى ويُسمَع مرّةً — ثم يقرأ الطفلُ بقيّتَها.
// ٣) **والقياسُ صفحةً صفحة على مفتاح القصة**: يقرأ السطرَ فيلمس **صورةَ ما قرأ**
//    (`METHOD.md §٧`) — فالمقيسُ فهمُ ما فُكّ لا نطقُه (§١٣: لا قياسَ نطق).
//
// ————— والوسمُ في القصة أقلُّ منه في البطاقة، عن قصد —————
//
// في تمرين الشائكة تُنقَّط المقاطعُ المفكوكة ويُوسَم موضعُ الشوكة بقلب (طريقةُ heart
// words). وفي **النصّ المتّصل** تُترك النقاط: سطرٌ كلُّه نقاطٌ ضجيجٌ يزاحم الكلمة،
// **ويبقى القلبُ وحدَه** — لأنّه تحذيرٌ يحتاجه الطفلُ وهو يقرأ: «هذه لا تُفكّ».

import * as progress from './progress.js';
import { registerScreen, registerRipening } from './registry.js';
import {
  stations, readableAt, readableTrickyAt, markedTricky, symbolById, isTouchable, WORDS,
  pendingListenOf, namedPictures,
} from './curriculum.js';
import { figureEl, specOf } from './figures.js';
import {
  say, sayEn, praiseThen, missedThen, seeder, skillOf, stationById,
  registerExercise, stationScreen, usedOf,
} from './station.js';
import { h, pick, shuffle, seeded, pop, toast, chance, STORY_ACCENT, roundSeed } from './ui.js';
/* **جلسةُ الإنضاج تركب محرّكَ المراجعة نفسَه** (جلسةُ الإسعاف م — بلاغُ الميدان ٣):
   لا محرّكَ ثانياً ولا تسجيلَ ثانياً في ليتنر، وإنما حوضٌ آخر يُمرَّر. */
import { renderReview, sessionItems } from './review.js';
/* **سعةُ حوض الخيارات تُقرأ من مخزن المقابض عند بناء كل جولة** (وضعُ الدعم — الجلسة
   ب: «حوضٌ أضيق»)، ومطفأً تردّ الثلاثةَ القائمة حرفاً. **ولا ثابتَ حوضٍ في وحدةِ
   تمارين**: مقبضٌ تنساه وحدةٌ واحدة يكذب على وليّ الأمر في تمرينٍ من ستّة —
   يجرده `tools/test_support.mjs` على الوحدات كلِّها. **وتُقرأ عند بناء الجولة لا عند
   تحميل الوحدة**، فتقع مسطرةُ الامتحان الواحدة (`duringExam`) على ما يُبنى داخلها. */
import { optionCount, sessionSize } from './support.js';

/** أنواعُ الشاشات التي تملكها هذه الوحدة (يقابلها `STATIONS` في `test_measure.mjs`). */
const TYPES = new Set(['story']);

// ————— التعليماتُ المنطوقة (عربيةٌ كلُّها — `METHOD.md §٩·١`) —————

const ASK = {
  read: 'اقْرَأِ السَّطْرَ وَالْمَسْ صُورَةَ مَا قَرَأْت',
  model: 'انْظُرْ وَاسْمَعْ — الْمُعَلِّمُ يَقْرَأُ مِنْ حَيْثُ تَبْدَأُ النُّقْطَة',
};

/** محطاتُ هذه الوحدة من المنهج. */
const owned = () => stations().filter((s) => TYPES.has(s.type));

/** صفحاتُ القصص كلِّها — مادّةُ الإعلان والجولات معاً. */
const pagesOf = (station) => station.pages || [];

/**
 * **كلُّ نصٍّ قد تنطقه هذه الوحدة** — إعلانٌ لا استنتاج (`tools/queue_texts.mjs`):
 * تعليمتاها العربيتان · **أسطرُ القصص** (يقرأ المعلّمُ أوّلَها في النمذجة) · وكلماتُ
 * الصور التي تُلمَس (تُقال بعد الصواب وفي التصحيح).
 */
export const SPOKEN = [
  ...Object.values(ASK).map((text) => ({ text, lang: 'ar', category: 'instruction' })),
  ...[...new Set(owned().flatMap((s) => pagesOf(s).map((page) => page.text)))]
    .map((text) => ({ text, lang: 'en', category: 'sentence' })),
  ...[...new Set(owned().flatMap((s) => pagesOf(s).map((page) => page.pick)))]
    .map((text) => ({ text, lang: 'en', category: 'word' })),
];

// ————— ما تستهلكه هذه الوحدة (البابُ الرابع في `check_range.py`) —————

export const CONSUMES = {
  story: { words: [], fields: [], gpcs: [], tricky: [], sounds: [] },
};

// ————— رسمُ السطر: كلمةٌ كلمة، ولكلٍّ صنفُها معلَناً —————

/** صورةُ كلمةٍ من الرصيد المصوَّر — بإعلانها هي (`specOf` القاعدةُ الواحدة). */
const PICTURED = new Map(WORDS.map((word) => [word.w, word]));
const pictureSpec = (name) => specOf(PICTURED.get(name) || { w: name });

/** كلمةُ قراءةٍ في النصّ: مقاطعُها **بلا وسم** — النصُّ يُقرأ ولا يُشرَح. */
const textSpec = (word) => ({
  kind: 'letter',
  unit: 'word',
  word: word.w,
  parts: word.gpc.map((id) => ({ id, g: symbolById(id)?.g || id, mark: '' })),
});

/** شائكةٌ في النصّ: **القلبُ وحدَه** تحت شوكتها (والنقاطُ تُترك — رأسُ الملفّ). */
function heartSpec(word, gradeId) {
  const marked = markedTricky(word, gradeId);
  if (!marked) return null;
  return {
    kind: 'letter',
    unit: 'tricky',
    word,
    parts: marked.parts.map((part) => ({ ...part, mark: part.mark === 'heart' ? 'heart' : '' })),
  };
}

/**
 * **سطرٌ إلى أوصافٍ مرسومة — ولا يسقط لعدم نضج** (مرسومُ المالك، ٢٤ أغسطس ٢٠٢٦:
 * «لا نريد توقف في الحلقات اطلاقاً… والمراجعة موضوع اختياري ولا يوقف تقدم الحلقات»).
 *
 * **وقيدُ الاقتران باقٍ بصورته الجديدة: سَنَدٌ عند موضع الحاجة لا بوابةُ عبور.**
 * كان عدمُ نضجِ كلمةٍ واحدة يُسقط السطرَ فالقصةَ فالعقدةَ كلَّها، فيقف الطفلُ أمام
 * حلقةٍ لا تُفتح ولا يعرف لماذا. فصارت الكلمةُ التي لم تنضج **تُوسَم `support`**:
 * **تُسمَع بلسانها قبل أن يُسأل عنها** — فيلقاها بمعناها لا بحرفها المجرَّد، وهو
 * عينُ ما وُضع القيدُ له. **ولا يسقط السطرُ إلا لعيبِ بيانات** (كلمةٌ خارج المنهج
 * أصلاً — يحرسه `check_range` في النصّ نفسِه).
 */
function lineSpecs(text, gradeId, isMastered) {
  const all = new Map(readableAt(gradeId, () => true).map((word) => [word.w, word]));
  const allTricky = new Set(readableTrickyAt(gradeId, () => true));
  const ripe = new Map(readableAt(gradeId, isMastered).map((word) => [word.w, word]));
  const ripeTricky = new Set(readableTrickyAt(gradeId, isMastered));
  const out = [];
  for (const token of String(text).split(/\s+/).filter(Boolean)) {
    const spec = all.has(token) ? textSpec(all.get(token))
      : allTricky.has(token) ? heartSpec(token, gradeId) : null;
    if (!spec) return null;
    out.push(ripe.has(token) || ripeTricky.has(token) ? spec : { ...spec, support: true });
  }
  return out;
}

/**
 * **صفحةٌ واحدة**: سطرُها يُقرأ، وصورةُ ما فيه تُلمَس بين ثلاث.
 *
 * **والمشتّتاتُ صورُ ما نضج سمعاً** (قاعدةُ `decode` نفسُها): صورةٌ لم يلقَها الطفلُ
 * تجعل السؤالَ حزراً. **والمسؤولُ عنه من كلمات السطر** — يحرسه `check_range` كذلك،
 * فلا يُسأل الطفلُ عمّا لم يقرأ.
 */
function pageRound(station, page, rnd, isMastered) {
  const line = lineSpecs(page.text, station.part, isMastered);
  const skill = skillOf(station, station.part, 'read');
  if (!line || !skill || !isTouchable(page.pick)) return null;
  if (!line.some((spec) => spec.word === page.pick)) return null;
  /* **والمشتّتاتُ صورُ ما نضج أوّلاً ثم ما عُرف اسمُه** (سُنّةُ `decode` — الجلسة ت):
     صورةٌ لم يلقَها الطفلُ تجعل السؤالَ حزراً، **فالناضجُ مقدَّم**؛ ولكنّ ضيقَ الحوض
     لا يُسقط الجولةَ بعد اليوم (مرسومُ المالك) — فيُتَمُّ العددُ ممّا أتقن اسمَه. */
  const want = optionCount() - 1;
  const near = shuffle(readableAt(station.part, isMastered)
    .filter((word) => word.w !== page.pick && isTouchable(word.w)), rnd).map((word) => word.w);
  const wider = shuffle(namedPictures(isMastered)
    .filter((word) => word.w !== page.pick && !near.includes(word.w)), rnd).map((word) => word.w);
  /* **وحوضٌ ثالثٌ يمنع الوقوف** (مرسومُ المالك): لو لم ينضج للطفل شيءٌ بعدُ لَفرغ
     الحوضان فوقَف — فيُتَمّ العددُ **من الصور المرسومة كلِّها**. والسؤالُ يبقى
     عادلاً: الكلمةُ المسؤولُ عنها **سُمعت بلسانها قبل السؤال** (`support`)،
     والمشتّتُ صورةٌ تقابلها — لا يُطلَب من الطفل أن يعرفها ليجيب. */
  const rest = shuffle(WORDS
    .filter((word) => word.w !== page.pick && isTouchable(word.w)
      && !near.includes(word.w) && !wider.includes(word.w)), rnd).map((word) => word.w);
  const others = [...near, ...wider, ...rest].slice(0, want);
  if (others.length < want) return null;
  const options = shuffle([page.pick, ...others], rnd).map(pictureSpec);
  const next = seeder(rnd);
  return {
    kind: 'read',
    shape: 'page',
    unit: skill.unit,
    range: skill.range,
    ask: ASK.read,
    text: page.text,
    target: page.pick,
    line,
    /* **ما يُسنَد بصوته قبل السؤال**: كلماتُ السطر التي لم تنضج سمعاً — تُنطَق
       بلسانها فيلقاها الطفلُ بمعناها، ثم يُسأل. */
    support: line.filter((spec) => spec.support).map((spec) => spec.word),
    options,
    figures: [...line, ...options],
    saying: [page.pick, ...others],
    sig: `${station.id}|${page.pick}|${next()}`,
  };
}

/**
 * **خطةُ القصة**: المعلّمُ يقرأ الصفحةَ الأولى، ثم صفحةٌ بعونٍ، ثم البقيةُ «وحدك».
 *
 * **والصفحاتُ بترتيبها لا مخلوطة**: هي قصةٌ تُتابَع لا حوضُ جولات — والبذرةُ تخلط
 * المشتّتاتِ وحدَها.
 */
export function buildStation(stationId, seed, isMastered = progress.isMastered) {
  const station = stationById(stationId);
  if (!station || !TYPES.has(station.type)) return null;
  const rnd = seeded(seed >>> 0);
  const pages = pagesOf(station).map((page) => pageRound(station, page, rnd, isMastered));
  if (!pages.length || pages.some((page) => !page)) return null;
  const [first, second, ...rest] = pages;
  if (!second || !rest.length) return null;
  return {
    model: {
      title: station.title,
      hint: ASK.model,
      items: [{
        en: first.text,
        el: () => modelEl(first),
        after: async (box, api) => { if (api.alive()) await sayEn(first.target); },
      }],
      figures: first.figures,
      saying: first.saying,
    },
    guided: [second],
    solo: rest,
  };
}

/** جردُ الجولات للحارس — بأوسع الحالات (علّتُه في `grade.js`). */
export function probeRounds(stationId, seed) {
  const plan = buildStation(stationId, seed, () => true);
  if (!plan) return [];
  return [plan.model, ...plan.guided, ...plan.solo].map(usedOf);
}

// ————— تسجيلُ المحاولة —————
//
// **مفتاحٌ واحد للقصة كلِّها** (`text|<درجة>|read` — `METHOD.md §٧`): صفحاتُها
// محاولاتٌ على مهارةٍ واحدة هي قراءةُ نصٍّ في مدى تلك الدرجة.

const score = (round, correct, recordAttempt = progress.recordAttempt) => {
  recordAttempt(round.unit, round.range, 'read', correct);
};

// ————— الشاشة —————

/**
 * **السطرُ يُصَفّ من اليسار ومعه مؤشّرُ بدء السطر** (`METHOD.md §٩·٣`): نقطةُ انطلاقٍ
 * خضراء يسارَ السطر، علاجاً لانقلاب المسح الموثَّق في الدراسة **تدريساً لا افتراضاً**
 * — وهي النقطةُ نفسُها التي يبني عندها الطفلُ كلمتَه في الدمج والتقطيع.
 */
const lineEl = (round) => {
  const line = h('div', { class: 'q-line' });
  for (const spec of round.line) line.append(figureEl(spec));
  return line;
};

/** مشهدُ النمذجة: السطرُ وصورتُه معاً — يقرأ المعلّمُ ويُري ما قرأ. */
const modelEl = (round) => h('div', { class: 'q-page' },
  lineEl(round),
  h('div', { class: 'q-shown-one' },
    figureEl(round.options.find((option) => option.word === round.target) || round.options[0])));

function pageView(round, hooks) {
  const stage = h('div', { class: 'q-stage q-stage--read' });
  stage.dataset.ask = round.target;
  // **ولا زرَّ أذنٍ**: القراءةُ بالعين (رأسُ الملفّ) — والسطرُ وحدَه في الساحة
  stage.append(lineEl(round));

  const choices = h('div', { class: 'q-choices q-choices--page' });
  let locked = false;
  const buttons = round.options.map((spec) => {
    const btn = h('button', { class: 'qcard', 'aria-label': 'هَذِهِ' }, figureEl(spec));
    btn.addEventListener('click', async () => {
      if (locked) return;
      locked = true;
      const chosen = btn.querySelector('.fig')?.dataset.word;
      const correct = chosen === round.target;
      hooks.attempt(round, correct);
      if (correct) {
        btn.classList.add('good');
        pop(btn);
        await praiseThen(hooks, round.target);
        return;
      }
      await missedThen(hooks, {
        chosen,
        target: round.target,
        chosenEl: btn,
        targetEl: buttons.find((el) => el.querySelector('.fig')?.dataset.word === round.target),
      });
    });
    return btn;
  });
  choices.append(...buttons);

  /* **السَّندُ قبل السؤال** (مرسومُ المالك، ٢٤ أغسطس): ما لم ينضج من كلمات السطر
     **يُسمَع بلسانه** قبل أن يُسأل الطفل — فيلقى الكلمةَ بمعناها لا بحرفها المجرَّد،
     ويمضي في حينه. وهو صوتٌ واحدٌ في طابورٍ واحد (لا يتكدّس — `audio.js`). */
  for (const word of round.support || []) sayEn(word);
  say(round.ask);
  return h('div', {}, h('p', { class: 'hint' }, round.ask), stage, choices);
}

// ————— التسجيل في الموجِّه وفي المراجعة —————

registerScreen('story', (part) => {
  const station = stationById(`story:${part}`);
  if (!station) return null;
  if (!buildStation(station.id, 1)) return ripenScreen(station);
  return stationScreen({
    nodeId: station.id,
    title: station.title,
    accent: STORY_ACCENT,
    make: () => buildStation(station.id, roundSeed()),
    view: pageView,
    score,
    save: (stars) => progress.setStars(station.id, stars),
  });
});

// ————— **الإنضاج: لمسةٌ تعمل أبداً** (جلسةُ الإسعاف م — بلاغُ الميدان ٣) —————
//
// **العلّةُ سباقُ جبهةٍ لا عطلُ عدّة**: العقدُ تُفتح بالنجوم، والطفلُ السريع يبلغ
// القصةَ قبل أن يُتمّ ليتنر إنضاجَ كلماتها (الإتقانُ ثلاثُ إصاباتٍ متباعدات) — فتردّ
// `buildStation` بحكم **قيد الاقتران** `null`، وكانت الشاشةُ تردّ `null` معها فترجع
// اللمسةُ إلى الخريطة **صامتة**. وذاك عينُ ما ينقضه مرسومُ المالك النافذ عند اكتب:
// «**المضيُّ دائماً — لا خطوةَ تحبس طفلاً**».
//
// **ولا يُلَان قيدُ الاقتران بحرف**: لا كلمةَ تُقرأ قبل نضجها — ولا تُنقَص كلمةٌ من
// النصّ ولا تُبدَّل. وإنما تُفتَح **جلسةُ إنضاج**: جولاتٌ من عدّة المراجعة القائمة
// تقيس **مفاتيحَ كلماتِ هذه القصة غيرِ الناضجة بأعيانها** — فيمضي الطفلُ في اللحظة،
// وتنفتح القصةُ بيده هو لا بانتظارٍ أعمى.

/**
 * **حوضُ الإنضاج: مفاتيحُ السمع التي تنتظرها هذه القصة**.
 *
 * **ويُستخرَج كما يستخرجه `lineSpecs`** بلا مسارٍ ثانٍ: `pendingListenOf` يعلن
 * مفاتيحَ **كلمات نصّها** كما يملكها المنهج (`words[].listen` و`HEART_WORDS[].listen`
 * — لا مطابقةَ رسمٍ ولا اشتقاق)، وما لم يبلغ منها صندوقَ الإتقان **هو بعينه** ما
 * أسقط السطرَ: `readableAt` ليست إلا `wordsUpTo` مصفّاةً بـ`isMastered`.
 * **والوظيفةُ الصرفةُ خارجَه** بعلّتها المكتوبة (لا مفتاحَ سمعيّ لها، `METHOD.md §٦`).
 */
export const ripeningKeys = (stationId, isMastered = progress.isMastered) =>
  pendingListenOf(stationId).filter((key) => !isMastered(key));

/**
 * **تمارينُ جلسة الإنضاج** — من عدّة المراجعة القائمة (`sessionItems`) — وحوضُ
 * التنويع **فارغٌ عمداً** (كما تفعل بوابةُ اللحاق): لا يُملأ الفراغُ بمادّةٍ من خارج
 * ما ينتظره البابُ، فتُصرَف الجلسةُ إلى ما يفتحه.
 *
 * **وتُطلَب بمداها هي** (`fresh`): معناها في `itemFor` «بمداه هو أو لا يُبنى» — فلا
 * يُقبَل بديلٌ يقيس مفتاحاً آخر ويبقى مفتاحُ البابِ حيث كان (درسُ حارس الوعد).
 * **والتسجيلُ بليتنر نفسِه** يقع في محرّك الجلسة (`renderSession`) لا هنا.
 */
export function ripenItems(stationId, rnd = chance) {
  const keys = ripeningKeys(stationId);
  if (!keys.length) return [];
  const known = new Map(progress.skills().map((skill) => [skill.key, skill]));
  const due = keys
    .map((key) => ({
      box: 0, right: 0, wrong: 0, ...(known.get(key) || {}),
      ...progress.parseSkillKey(key), fresh: true,
    }))
    .sort((a, b) => a.box - b.box || b.wrong - a.wrong);
  return sessionItems(due, sessionSize(), rnd, []);
}

/** نصُّ شارة الجلسة — **للوالد يقرأ فوق الشاشة**، ولا فعلَ يلزم الطفلَ به. */
const RIPEN_PILL = 'تنضج كلماتُ القصة';

/**
 * **شاشةُ الإنضاج**: جلسةُ مراجعةٍ حوضُها مفاتيحُ هذه القصة — **وثلاثُ درجاتٍ لا
 * واحدة**، فلا لمسةَ ترجع صامتةً بحال:
 *   ١) مفاتيحُ القصة إن بُنيت منها جولةٌ · ٢) وإلا **جلسةُ المراجعة العادية** —
 *   فالطفلُ يمضي ولو كان بابُه ينتظر مادّةً لا يبنيها اليوم شيء ·
 *   ٣) وإن خلت اليدُ من الاثنتين: **قولٌ وردٌّ إلى الخريطة** لا صمت.
 */
function ripenScreen(station) {
  const make = () => {
    const mine = ripenItems(station.id);
    return mine.length ? mine : sessionItems(progress.todaySkills());
  };
  const screen = renderReview({ make, pill: RIPEN_PILL });
  if (screen) return screen;
  toast('تنضج كلماتُها — تابِعْ مراجعتك', 'smile');
  return null;
}

/**
 * **مسبارُ الخريطة** (`registry.js`): يردّ ما تنتظره القصةُ من مفاتيح أو `null`.
 * **ولا يبني خطةً**: مفتاحٌ واحدٌ لم ينضج يُسقط السطرَ فالقصةَ كلَّها (`lineSpecs`)،
 * فوجودُ مفتاحٍ في الحوض **هو بعينه** أنّ الخطة لا تُبنى اليوم — وسؤالٌ رخيصٌ يُسأل
 * عن كل عقدةٍ في كل رسمة.
 */
registerRipening('story', (part) => {
  const keys = ripeningKeys(`story:${part}`);
  return keys.length ? keys : null;
});

/**
 * تمرينُ مراجعةٍ للقصة: **صفحةٌ منها** — فالقصةُ تُقرأ كاملةً في محطتها، ويُعاد في
 * المراجعة ما يقيس المهارةَ نفسَها بلا إعادة الكتاب كلِّه على طفلٍ في جلسةِ خلط.
 *
 * **وقيدُ الاقتران يعمل ههنا كما يعمل في المحطة**: `pageRound` يمرّ من `readableAt`
 * نفسِها، فصفحةٌ سقطت كلمتُها سمعاً لا تُنتج تمريناً وتُملأ الجلسةُ بغيرها.
 */
const single = (skill, rnd) => {
  const station = stations().find((s) => TYPES.has(s.type)
    && (s.skills || []).includes(`${skill.unit}|${skill.range}|${skill.kind}`));
  if (!station) return null;
  const page = pick(pagesOf(station), rnd);
  return page ? pageRound(station, page, rnd, progress.isMastered) : null;
};

registerExercise('read', { build: single, view: pageView, score });
