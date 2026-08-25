// **س٤ — الأذنُ الفونيمية** (`METHOD.md §٤`): «عينُ L&S المرحلة ١ (الجانب ٧): الصوتُ
// الأول · الدمجُ الشفهي · التقطيعُ الشفهي · القافية».
//
// ————— العهدُ الأول: **بلا حرفٍ مرسوم إطلاقاً** —————
//
// هذه المحطاتُ الأربع كلُّها **قبل** مسار الحرف (ق٤: البوابةُ الأولى تفتحه)، فلا يقع
// تحت بصر الطفل فيها رسمٌ واحد: الأصواتُ تُسمَع، والأجوبةُ صورٌ تُلمَس أو **أزرارُ
// صوتٍ تُرتَّب**. وحتى مقاطعُ الكلمة (`gpc` في `curriculum.js`) لا تُقرأ هنا رسماً —
// إنّما تُقرأ منها **بنيةُ الكلمة الصوتية** (`soundsOf`)، فيصير «أوّلُ الصوت» دقيقاً:
// `cat` و`kite` أوّلُهما صوتٌ واحد وإن اختلف رسمُهما.
//
// ————— أربعُ محطاتٍ بأربعة أشكال —————
//
//   س٤-١ **الصوتُ الأول** — يُسمَع صوتٌ معزول (`/s/`) وتُلمَس الصورةُ التي تبدأ به.
//   س٤-٢ **الدمجُ الشفهي** — تُسمَع أصواتُ الكلمة مقطَّعةً فتُلمَس صورتُها (`blend-ear`).
//   س٤-٣ **التقطيعُ الشفهي** — تُسمَع الكلمةُ فتُرتَّب أصواتُها **أزراراً صوتية**
//        (`segment-ear` — شكلُ `order` سمعياً، `METHOD.md §٨`). والأزرارُ **عمياء
//        قصداً**: تُعرَّف بإسماعها في مواضعها لا بعلامةٍ تُرى، وإلا صار الترتيبُ نظراً.
//   س٤-٤ **القافية** — تُسمَع كلمةٌ وتُلمَس التي تشاركها آخرَها.
//
// **ومادّتُها محسوبةٌ من الأصوات ومن حصيلة الطفل** (`curriculum.js`): لا مدىً بلا
// مادّةٍ تكفيه، ولا صورةٌ يُطلَب من الطفل أن يسمّيها ولم يلقَها في محطةٍ سابقة.
//
// **ونقاءُ الصوت المعزول شأنُ جلسة ص**: البنكُ غيرُ مولَّد، والاحتياطُ الناطق قد يلفظ
// اسمَ الحرف لا صوتَه — نقصُ نقاءٍ معلومٌ مقبولٌ مؤقتاً بنصّ `docs/AUDIO_QUEUE.md`،
// ولا يُجتهَد في حلّه بتوليد صوتٍ هنا.

import * as progress from './progress.js';
import { registerScreen } from './registry.js';
import { stations, soundsOf, rimeOf, phonemeSay } from './curriculum.js';
import { figureEl, specOf } from './figures.js';
import {
  say, sayEn, praiseThen, missedThen, seeder, skillOf, stationById, stationForSkill,
  registerExercise, stationScreen, usedOf, soloRounds, BEAT,
} from './station.js';
import { h, icon, pick, shuffle, seeded, pop, LISTEN_ACCENT, roundSeed } from './ui.js';
/* **سعةُ حوض الخيارات تُقرأ من مخزن المقابض عند بناء كل جولة** (وضعُ الدعم — الجلسة
   ب: «حوضٌ أضيق»)، ومطفأً تردّ الثلاثةَ القائمة حرفاً. **ولا ثابتَ حوضٍ في وحدةِ
   تمارين**: مقبضٌ تنساه وحدةٌ واحدة يكذب على وليّ الأمر في تمرينٍ من ستّة —
   يجرده `tools/test_support.mjs` على الوحدات كلِّها. **وتُقرأ عند بناء الجولة لا عند
   تحميل الوحدة**، فتقع مسطرةُ الامتحان الواحدة (`duringExam`) على ما يُبنى داخلها. */
import { optionCount } from './support.js';

/** أنواعُ الشاشات التي تملكها هذه الوحدة (يقابلها `STATIONS` في `test_measure.mjs`). */
const TYPES = new Set(['ear']);

const GUIDED = 2;
const MODEL_ITEMS = 2;
/** سقفُ التقطيع في جلسة المراجعة: تمرينٌ من ثلاث لمساتٍ يطول على طفلٍ إن تكرّر. */
const SEGMENT_MAX = 2;

// ————— التعليماتُ المنطوقة (عربيةٌ كلُّها — `METHOD.md §٩·١`) —————

const ASK = {
  first: 'اسْمَعِ الصَّوْتَ وَالْمَسْ مَا يَبْدَأُ بِهِ',
  // **وطرفُ الكلمة الآخِر يسبق أوّلَها عند طفلنا** (حسمُ أ-٤ · `METHOD.md §٤`)
  last: 'اسْمَعِ الصَّوْتَ وَالْمَسْ مَا يَنْتَهِي بِهِ',
  blend: 'اسْمَعِ الْأَصْوَاتَ وَاجْمَعْهَا — أَيَّةُ صُورَةٍ هِيَ؟',
  segment: 'اسْمَعِ الْكَلِمَةَ ثُمَّ الْمَسْ أَصْوَاتَهَا بِتَرْتِيبِهَا',
  rhyme: 'اسْمَعْ وَالْمَسْ مَا يُشْبِهُ آخِرَهُ',
  model: 'انْظُرْ وَاسْمَعْ — الْمُعَلِّمُ يُسْمِعُ الْأَصْوَات',
};

/** محطاتُ هذه الوحدة من المنهج. */
const owned = () => stations().filter((s) => TYPES.has(s.type));

/**
 * **كلُّ نصٍّ قد تنطقه هذه الوحدة** — إعلانٌ لا استنتاج (`tools/queue_texts.mjs`):
 * تعليماتُها العربية، وكلماتُ حياضها الإنكليزية (تُقال ثناءً وتصحيحاً)، **وأصواتُها
 * المعزولة** بفئتها الخاصة (`phoneme`) — وهي مادّةُ السؤال نفسِه هنا.
 */
export const SPOKEN = [
  ...Object.values(ASK).map((text) => ({ text, lang: 'ar', category: 'instruction' })),
  ...[...new Set(owned().flatMap((s) => s.words.map((w) => w.w)))]
    .map((text) => ({ text, lang: 'en', category: 'word' })),
  ...[...new Set(owned().flatMap((s) => s.sounds))]
    .map((text) => ({ text, lang: 'en', category: 'phoneme' })),
];

// ————— ما تستهلكه هذه الوحدة (البابُ الرابع في `check_range.py`) —————
//
// **أرضيةٌ لا سقف**: أربعُ محطاتٍ جباهُها مختلفة، والجردُ الحقيقيّ جولةً جولة.

export const CONSUMES = {
  ear: { words: [], fields: [], gpcs: [], tricky: [], sounds: [] },
};

// ————— بناءُ الجولات (حتميٌّ ببذرة) —————

/** أوّلُ صوتٍ في كلمة (بمعرّفه لا برسمه). */
const initialOf = (word) => soundsOf(word)?.[0] || null;

/** آخِرُ صوتٍ فيها — طرفُها الأسهل على أذن الناطق بالعربية (حسمُ أ-٤). */
const finalOf = (word) => soundsOf(word)?.at(-1) || null;

/** مشتّتاتٌ من حوض المحطة لا تشارك الهدفَ مفتاحَه الصوتيّ. */
const others = (station, rnd, keyOf, key, count) =>
  shuffle(station.words.filter((w) => keyOf(w.w) !== key), rnd).slice(0, count);

/** الجولةُ المصوَّرة المشتركة: سؤالٌ يُسمَع وصورٌ تُلمَس. */
function pictureRound(station, rnd,
  { shape, ask, skill, target, pool, saying = [], sounds = [], sig }) {
  // **وموضعُ الجواب بالقرعة**: بذرةٌ ثابتة تجعله في مكانٍ واحد كلَّ جولة فيُلمَس بالعادة
  const specs = shuffle([target, ...pool], rnd).map((w) => specOf(w));
  return {
    kind: station.kind,
    shape,
    unit: skill.unit,
    range: skill.range,
    ask,
    saying,
    sounds,
    target: target.w,
    options: specs,
    figures: specs,
    fields: [...new Set([target, ...pool].map((w) => w.field))],
    sig,
  };
}

/**
 * **عزلُ الصوت في طرفٍ من الكلمة** — س٤-١ (أوّلُها) وس٤-٥ (آخِرُها).
 *
 * **ومهارتان لا واحدة**: طرفُ الكلمة الآخِر أسهلُ على أذن طفلنا من مطلعها (بنيةُ
 * `body-coda` العربية — `METHOD.md §٤`)، فيُدرَّس قبله ويُقاس بمفتاحه (`final-*`).
 * والبناءُ واحدٌ لأنّ السؤالَ واحد: صوتٌ يُسمَع وصورةٌ تُلمَس.
 */
function edgeRound(station, rnd, { range = null } = {}) {
  const key = range || pick(station.ranges, rnd);
  const skill = skillOf(station, key, station.kind);
  if (!skill) return null;
  const last = String(key).startsWith('final-');
  const edgeOf = last ? finalOf : initialOf;
  const sound = String(key).slice((last ? 'final-' : 'initial-').length);
  const group = station.words.filter((w) => edgeOf(w.w) === sound);
  const target = pick(group, rnd);
  if (!target) return null;
  const pool = others(station, rnd, edgeOf, sound, optionCount() - 1);
  const next = seeder(rnd);
  return pictureRound(station, rnd, {
    shape: last ? 'last' : 'first',
    ask: last ? ASK.last : ASK.first,
    skill,
    target,
    pool,
    saying: [target.w, ...pool.map((w) => w.w)],
    sounds: [phonemeSay(sound)],
    sig: `${station.id}|${key}|${target.w}|${next()}`,
  });
}

/** س٤-٤: تُسمَع كلمةٌ وتُلمَس التي تقافيها (والمسموعةُ ليست على الساحة). */
function rhymeRound(station, rnd, { range = null } = {}) {
  const rime = range || pick(station.ranges, rnd);
  const skill = skillOf(station, rime, station.kind);
  if (!skill) return null;
  const group = shuffle(station.words.filter((w) => rimeOf(w.w) === rime), rnd);
  if (group.length < 2) return null;
  const [heard, target] = group;
  const pool = others(station, rnd, rimeOf, rime, optionCount() - 1);
  const next = seeder(rnd);
  const base = pictureRound(station, rnd, {
    shape: 'rhyme',
    ask: ASK.rhyme,
    skill,
    target,
    pool,
    saying: [heard.w, target.w, ...pool.map((w) => w.w)],
    sig: `${station.id}|${rime}|${heard.w}|${next()}`,
  });
  // **والمسموعةُ ليست على الساحة**: لو كانت لَصار الجوابُ «الأخرى» بلا سمع. وإنّما
  // تُرسَم في النمذجة وحدَها (بجوار قافيتها) فيُدرَك التشابه — فتدخل الجردَ معها.
  const heardSpec = specOf(heard);
  return {
    ...base,
    heard: heard.w,
    heardSpec,
    figures: [...base.figures, heardSpec],
    fields: [...new Set([...base.fields, heard.field])],
  };
}

/** س٤-٢: تُسمَع الأصواتُ مقطَّعةً فتُلمَس صورةُ كلمتها. */
function blendRound(station, rnd, { word = null } = {}) {
  const target = word || pick(station.words, rnd);
  if (!target) return null;
  const skill = skillOf(station, target.w, station.kind);
  const sounds = soundsOf(target.w);
  if (!skill || !sounds) return null;
  const pool = shuffle(station.words.filter((w) => w.w !== target.w), rnd)
    .slice(0, optionCount() - 1);
  const next = seeder(rnd);
  return pictureRound(station, rnd, {
    shape: 'blend',
    ask: ASK.blend,
    skill,
    target,
    pool,
    saying: [target.w, ...pool.map((w) => w.w)],
    sounds: sounds.map(phonemeSay),
    sig: `${station.id}|${target.w}|${next()}`,
  });
}

/**
 * س٤-٣: تُسمَع الكلمةُ فتُرتَّب أصواتُها أزراراً صوتية.
 *
 * **والأزرارُ تُعرَّف بإسماعها لا بعلامتها**: تُعرَض مخلوطةً، ويُسمَع كلُّ زرٍّ في
 * موضعه مرّةً قبل السؤال (وتُعاد الإسماعةُ بزرّ الأذن متى شاء) — ثم يُرتَّب.
 */
function segmentRound(station, rnd, { word = null } = {}) {
  const target = word || pick(station.words, rnd);
  if (!target) return null;
  const skill = skillOf(station, target.w, station.kind);
  const sounds = soundsOf(target.w);
  if (!skill || !sounds || sounds.length < 2) return null;
  const order = sounds.map(phonemeSay);
  const shown = shuffle(order.map((sound, at) => ({ sound, at })), rnd);
  const next = seeder(rnd);
  return {
    kind: station.kind,
    shape: 'segment',
    unit: skill.unit,
    range: skill.range,
    ask: ASK.segment,
    saying: [target.w],
    sounds: order,
    order,
    shown,
    target: target.w,
    picture: specOf(target),
    figures: [specOf(target)],
    fields: [target.field],
    sig: `${station.id}|${target.w}|${next()}`,
  };
}

/** بانِي جولةٍ **بحسب ما تعلنه المحطة** — وحدتُها ونوعُ تمرينها، لا معرّفُها. */
function roundFor(station, rnd, opts = {}) {
  if (station.kind === 'blend-ear') return blendRound(station, rnd, opts);
  if (station.kind === 'segment-ear') return segmentRound(station, rnd, opts);
  if (station.unit === 'rhyme') return rhymeRound(station, rnd, opts);
  if (station.unit === 'phon') return edgeRound(station, rnd, opts);
  return null;
}

/** **خطةُ المحطة**: نمذجةٌ ثم جولتان بعونٍ ثم خمسٌ «وحدك» — من بذرةٍ واحدة. */
export function buildStation(stationId, seed) {
  const station = stationById(stationId);
  if (!station || !TYPES.has(station.type)) return null;
  const rnd = seeded(seed >>> 0);

  let bag = [];
  const nextOpts = () => {
    const wordly = station.kind === 'blend-ear' || station.kind === 'segment-ear';
    if (!bag.length) bag = shuffle(wordly ? station.words : station.ranges, rnd);
    return wordly ? { word: bag.pop() } : { range: bag.pop() };
  };

  const shown = Array.from({ length: MODEL_ITEMS }, () => roundFor(station, rnd))
    .filter(Boolean);
  if (!shown.length) return null;
  return {
    model: {
      title: 'المعلّمُ يُسمِعُ ويُري، وأنت تنصت',
      hint: ASK.model,
      // (و`en` فارغةٌ عمداً: مادّةُ النمذجة أصواتٌ متعاقبة لا نصٌّ واحد، فيتولّاها
      //  `after` بالقناة نفسِها — ولا يُصَفّ في قائمة الصوت نصٌّ مركَّب.)
      items: shown.map((round) => ({
        en: '',
        el: () => modelEl(round),
        after: (box, api) => sayModel(round, box, api),
      })),
      figures: shown.flatMap((round) => round.figures),
      fields: [...new Set(shown.flatMap((round) => round.fields))],
      saying: [...new Set(shown.flatMap((round) => round.saying || []))],
      sounds: [...new Set(shown.flatMap((round) => round.sounds || []))],
    },
    guided: Array.from({ length: GUIDED }, () =>
      roundFor(station, rnd, nextOpts())).filter(Boolean),
    /* **وكلُّ مفتاحٍ يُسأل عنه مرّتين** (`soloRounds` — قاعدةُ الكفاية): والمدى
       يُترجَم إلى مادّة الجولة كما تعلنه المحطة — كلمةً في الدمج والتقطيع، ورمزَ
       صوتٍ أو قافيةً فيما سواهما (وهي القسمةُ نفسُها التي في `single` أدناه). */
    solo: soloRounds(station, rnd, (skill) => roundFor(station, rnd,
      skill.kind === 'blend-ear' || skill.kind === 'segment-ear'
        ? { word: station.words.find((word) => word.w === skill.range) }
        : { range: skill.range })),
  };
}

/** جردُ الجولات للحارس — النمذجةُ والعونُ و«وحدك» كلُّها. */
export function probeRounds(stationId, seed) {
  const plan = buildStation(stationId, seed);
  if (!plan) return [];
  return [plan.model, ...plan.guided, ...plan.solo].map(usedOf);
}

// ————— تسجيلُ المحاولة —————
//
// **بنوعِ التمرين صريحاً في الشيفرة** (بابُ الشيفرة في `test_measure.mjs`): ثلاثةُ
// أنواعٍ لا واحد — `pick` (أوّلُ الصوت والقافية) · `blend-ear` · `segment-ear`.
// **والدمجُ والتقطيعُ مهارتان متعاكستان** على الكلمة نفسِها (عينُ L&S المرحلة ١):
// من يدمج قد لا يقطّع، فلكلٍّ مفتاحُه.

const score = (round, correct, recordAttempt = progress.recordAttempt) => {
  if (round.kind === 'blend-ear') {
    recordAttempt(round.unit, round.range, 'blend-ear', correct);
    return;
  }
  if (round.kind === 'segment-ear') {
    recordAttempt(round.unit, round.range, 'segment-ear', correct);
    return;
  }
  recordAttempt(round.unit, round.range, 'pick', correct);
};

// ————— الشاشات —————

/** زرُّ إعادة السماع — **أذنٌ لا كلمة** (قاعدةُ اللاقراءة بلغتين). */
const hearBtn = (onHear) => h('button', {
  class: 'btn btn--hear',
  'aria-label': 'اسمع مرّةً أخرى',
  onclick: onHear,
}, icon('ear'));

/** إسماعُ الأصوات واحداً واحداً في القناة الواحدة — بينها فاصلُ الأذن. */
async function sayEach(sounds, api) {
  for (const sound of sounds) {
    if (!api.alive()) return;
    await sayEn(sound);
  }
}

/** مادّةُ سؤال الجولة كما تُسمَع. */
async function playAsk(round, api) {
  if (round.shape === 'first' || round.shape === 'last') return sayEn(round.sounds[0]);
  if (round.shape === 'blend') return sayEach(round.sounds, api);
  if (round.shape === 'rhyme') return sayEn(round.heard);
  return sayEn(round.target);           // التقطيع: تُسمَع الكلمةُ كاملة
}

// ————— النمذجة —————

function modelEl(round) {
  if (round.shape === 'segment') {
    return h('div', { class: 'q-shown-one' }, figureEl(round.picture));
  }
  const target = round.options.find((o) => o.word === round.target) || round.options[0];
  // القافيةُ تُنمذَج **بزوجها معاً**: تُرى الكلمتان وتُسمَعان متعاقبتين فيُدرَك التشابه
  if (round.shape === 'rhyme') {
    return h('div', { class: 'q-pair' }, figureEl(round.heardSpec), figureEl(target));
  }
  return h('div', { class: 'q-shown-one' }, figureEl(target));
}

/**
 * نمذجةٌ منطوقة — **الصوتُ ثم مسمّاه**: يُسمَع سؤالُ الشكل ثم يُقال جوابُه، فيرى
 * الطفلُ الوصلةَ التي سيُطالَب بها (قافيةٌ بقافيتها · أصواتٌ بكلمتها · كلمةٌ بأصواتها).
 */
async function sayModel(round, box, api) {
  if (round.shape === 'rhyme') {
    await sayEn(round.heard);
    if (api.alive()) await sayEn(round.target);
    return;
  }
  await playAsk(round, api);
  if (!api.alive()) return;
  // الدمجُ: أصواتٌ ثم كلمتُها · التقطيعُ: كلمةٌ ثم أصواتُها · أوّلُ الصوت: صوتٌ ثم كلمتُه
  if (round.shape === 'segment') await sayEach(round.sounds, api);
  else await sayEn(round.target);
}

// ————— شاشةُ الاختيار المصوَّر (س٤-١ · س٤-٢ · س٤-٤) —————

function pickView(round, hooks) {
  const stage = h('div', { class: 'q-stage q-stage--ask' });
  stage.dataset.ask = round.target;
  stage.append(hearBtn(() => playAsk(round, hooks)));

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
          await praiseThen(hooks, round.target);
          return;
        }
        const targetEl = [...choices.children]
          .find((el) => el.querySelector('.fig')?.dataset.word === round.target);
        await missedThen(hooks, {
          chosen, target: round.target, chosenEl: btn, targetEl,
        });
      },
    }, figureEl(spec));
    choices.append(btn);
  }

  (async () => {
    await say(round.ask);
    if (hooks.alive()) await playAsk(round, hooks);
  })();

  return h('div', {}, h('p', { class: 'hint' }, round.ask), stage, choices);
}

// ————— شاشةُ التقطيع (س٤-٣): أزرارٌ صوتيةٌ تُرتَّب —————

/**
 * **الترتيبُ بالسمع لا بالنظر**: تُعرَض الأزرارُ مخلوطةً وتُسمَع في مواضعها، ثم
 * يلمسها الطفلُ بترتيب أصوات الكلمة. واللمسةُ الصحيحة تنقل الزرَّ إلى صفّ الترتيب
 * فيرى ما بناه، والخاطئةُ تُسمِعه ما لمس مقابلَ الصواب ثم تمضي (`METHOD.md §٤`).
 *
 * **والمحاولةُ واحدةٌ للجولة**: أوّلُ خطأٍ يُنهيها (وإلا صار المفتاحُ يُقاس مرّاتٍ في
 * جولةٍ واحدة فيهبط صندوقُه بخطأٍ واحد أكثرَ من مرّة).
 */
function segmentView(round, hooks) {
  const stage = h('div', { class: 'q-stage q-stage--ask' });
  stage.dataset.ask = round.target;
  // **إعلانُ الترتيب المطلوب للفاحص** (سِمةٌ لا يراها طفل — نظيرُ `data-ask`)
  stage.dataset.order = round.order.join(' ');
  stage.append(hearBtn(() => intro(true)));
  stage.append(h('span', { class: 'q-shown-one' }, figureEl(round.picture)));

  const tray = h('div', { class: 'q-tray q-tray--sounds' });
  const bank = h('div', { class: 'q-choices q-choices--sounds' });
  let at = 0;                        // الصوتُ المنتظَر من الترتيب

  /* **وحالُ الأزرار مُعلَنةٌ في DOM** (`data-ready` — سِمةٌ لا يراها طفل، نظيرُ
     `data-ask`): الأزرارُ مقفلةٌ حتى تتمّ إسماعةُ التعريف ثم بعد كل لمسةٍ حتى يتمّ
     صوتُها — فلولا إعلانُ الحال لَقاس الفاحصُ لمسةً ابتلعها القفل وظنّها جواباً. */
  let locked = true;
  const setLocked = (value) => {
    locked = value;
    stage.dataset.ready = value ? '0' : '1';
  };
  setLocked(true);

  const buttons = round.shown.map((item) => {
    const fig = figureEl({ kind: 'sound', word: '' });
    fig.dataset.sound = item.sound;
    const btn = h('button', { class: 'qcard qcard--sound', 'aria-label': 'صَوْت' }, fig);
    btn.addEventListener('click', () => tap(item, btn));
    return btn;
  });
  bank.append(...buttons);

  /** إسماعةُ التعريف: كلُّ زرٍّ يُضيء ويُسمِع صوتَه في موضعه. */
  async function intro(again = false) {
    setLocked(true);
    if (again) await sayEn(round.target);
    for (const [i, item] of round.shown.entries()) {
      if (!hooks.alive()) return;
      const btn = buttons[i];
      if (btn.isConnected) btn.classList.add('is-hint');
      await sayEn(item.sound);
      btn.classList.remove('is-hint');
      if (!hooks.alive()) return;
      await new Promise((r) => setTimeout(r, BEAT / 3));
    }
    setLocked(false);
  }

  /** نقلُ زرٍّ إلى صفّ الترتيب — وهو ما يراه الطفلُ جواباً كان أو تصحيحاً. */
  const place = (btn) => {
    btn.classList.add('is-set');
    btn.disabled = true;
    tray.append(btn);
  };

  async function tap(item, btn) {
    if (locked) return;
    setLocked(true);
    const correct = item.sound === round.order[at];
    if (correct) {
      place(btn);
      pop(btn);
      at++;
      await sayEn(item.sound);
      if (!hooks.alive()) return;
      if (at < round.order.length) {
        setLocked(false);
        return;
      }
      hooks.attempt(round, true);
      await praiseThen(hooks, round.target);
      return;
    }
    hooks.attempt(round, false);
    const wanted = buttons.find((el) => el.querySelector('.fig')?.dataset.sound === round.order[at]
      && !el.classList.contains('is-set'));
    await missedThen(hooks, {
      chosen: item.sound,
      target: round.order[at],
      chosenEl: btn,
      targetEl: wanted,
      // **ويُرى الصوابُ حيث يقع**: ينتقل الزرُّ المطلوب إلى موضعه من الصفّ
      reveal: () => wanted && place(wanted),
    });
  }

  (async () => {
    await say(round.ask);
    if (!hooks.alive()) return;
    await sayEn(round.target);
    if (!hooks.alive()) return;
    await intro();
  })();

  return h('div', {}, h('p', { class: 'hint' }, round.ask), stage, tray, bank);
}

const viewOf = (round, hooks) =>
  (round.shape === 'segment' ? segmentView(round, hooks) : pickView(round, hooks));

// ————— التسجيل في الموجِّه وفي المراجعة —————

registerScreen('ear', (part) => {
  const station = stationById(`ear:${part}`);
  if (!station || !buildStation(station.id, 1)) return null;
  return stationScreen({
    nodeId: station.id,
    title: station.title,
    accent: LISTEN_ACCENT,
    make: () => buildStation(station.id, roundSeed()),
    view: viewOf,
    score,
    save: (stars) => progress.setStars(station.id, stars),
  });
});

/** جولةٌ لمهارةٍ مستحقّة — ولكلِّ نوعٍ بانيه (`review.js` والبوابات). */
const single = (kind) => (skill, rnd) => {
  const station = stationForSkill(skill);
  if (!station || !TYPES.has(station.type) || station.kind !== kind) return null;
  const wordly = kind === 'blend-ear' || kind === 'segment-ear';
  return roundFor(station, rnd, wordly
    ? { word: station.words.find((w) => w.w === skill.range) }
    : { range: station.ranges.includes(skill.range) ? skill.range : null });
};

registerExercise('pick', { build: single('pick'), view: viewOf, score });
registerExercise('blend-ear', { build: single('blend-ear'), view: viewOf, score });
registerExercise('segment-ear', {
  build: single('segment-ear'), view: viewOf, score, max: SEGMENT_MAX,
});
