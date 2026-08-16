// **درجةُ العناقيد — المرحلة ٤ (ح١٣)** (`METHOD.md §٥`): «CVCC/CCVC (went, stand,
// frog, jumps) — علاجُ إقحام الحركة العربيّ (س٣-٤ تسبقه سمعاً)».
//
// ————— لماذا ملفٌّ لا سطرٌ في `grade.js` —————
//
// درجةُ العناقيد **لا رمزَ جديدَ فيها**: الجديدُ أن **يتجاور ساكنان** — وهو أصعبُ ما
// على أذنٍ عربية (`stand` تُسمَع «ستاند»)، وقد سبقه في مسار السمع تمييزُ س٣-٤
// وتقطيعُ س٤-٣. فليس فيها `sound-pick` ولا `letter-pick`، **وفيها شكلٌ ليس في سواها**:
// `vowel|…|mid-pick`. ولذلك أُفردت بنوع محطةٍ وشاشة (`test_measure.mjs` — لو جُمعت
// مع `grade` لبقي نوعُ `grade` أحمرَ من الجلسة ٤ إلى السادسة بلا ذنب).
//
// **وما تشترك فيه مع الدرجات مُستعارٌ لا منسوخ** (`grade.js`): الدمجُ والفكّ
// والشائكةُ وخطةُ المحطة ومُصيِّراتُها — نسختان من شكلٍ واحد تفترقان بلا حارس.
//
// ————— شكلُ الصائت الأوسط (`vowel|a-i|mid-pick` — نظيرُ `haraka` في اقرأ) —————
//
// **علّتُه من الدراسة**: تشويشُ الحركات القصار موثَّقٌ في أذن الطفل العربيّ (بابُ
// س٣-٣: ship/sheep · bit/bet · cap/cup)، **وما مُيّز سمعاً يُثبَّت رسماً**: تُسمَع
// الكلمةُ كاملةً ويُرى إطارُها بلا صائتها الأوسط (`b_x`)، فيُختار صائتُها من رسمين.
//
// **والزوجُ رسمان لا كلمتان** (`GRADES.h13.vowelPairs` — بياناتُ الجلسة ١): مثالُ
// `METHOD.md §٧` (`vowel|bit-bet|mid-pick`) توضيحيٌّ كأمثلة الكلمات في §٥، والحاكمُ
// بياناتُ `curriculum.js` المفحوصة (§١٢-١١) — و`bit`/`bet` ليستا من مداخل Starters
// أصلاً (علّةُ س٣-٣ المكتوبة)، فلا تُبنى عليهما مادّة.

import * as progress from './progress.js';
import { registerScreen } from './registry.js';
import {
  stations, readableAt, phonemeOf, phonemeSay, symbolById, VOWEL_SYMBOLS, HEART_WORDS,
} from './curriculum.js';
import { figureEl } from './figures.js';
import {
  say, sayEn, praiseThen, missedThen, seeder, skillOf, stationById,
  registerExercise, stationScreen, usedOf,
} from './station.js';
import {
  SHAPES, BUILD_MAX, glyphSpec, spelledSpec, hearBtn, planOf, rangesOf, singleIn,
  modelEl, sayModel, viewOf as gradeView,
} from './grade.js';
import { h, pick, shuffle, pop, LETTER_ACCENT, roundSeed } from './ui.js';

/** أنواعُ الشاشات التي تملكها هذه الوحدة (يقابلها `STATIONS` في `test_measure.mjs`). */
const TYPES = new Set(['cluster']);

/** تعليمةُ الشكل الجديد وحدَه — وسائرُها مستعارٌ من عدّة مسار الحرف. */
const MID_ASK = 'اسْمَعِ الْكَلِمَةَ وَالْمَسِ الصَّوْتَ النَّاقِصَ فِي وَسَطِهَا';

/** موضعُ الفراغ في الإطار — رسمٌ لا حرف (خطٌّ تحت موضع الصائت). */
const GAP = '_';

/** محطاتُ هذه الوحدة من المنهج. */
const owned = () => stations().filter((s) => TYPES.has(s.type));

/**
 * **كلُّ نصٍّ قد تنطقه هذه الوحدة** — إعلانٌ لا استنتاج (`tools/queue_texts.mjs`):
 * تعليمتُها · كلماتُ درجتها كلُّها · أصواتُ الصوائت التي تُلمَس · شائكاتُها
 * **وسياقاتُها المسموعة**. (وحوضُ المنهج كلُّه لا المتقَنُ منه — كأختها في `grade.js`.)
 */
export const SPOKEN = [
  { text: MID_ASK, lang: 'ar', category: 'instruction' },
  ...[...new Set(owned().flatMap((s) => (s.pool || []).map((w) => w.w)))]
    .map((text) => ({ text, lang: 'en', category: 'word' })),
  ...[...new Set([...VOWEL_SYMBOLS].map((id) => phonemeSay(phonemeOf(id))).filter(Boolean))]
    .map((text) => ({ text, lang: 'en', category: 'phoneme' })),
  ...[...new Set(owned().flatMap((s) => s.frontier.tricky || []))]
    .map((text) => ({ text, lang: 'en', category: 'word' })),
  ...[...new Set(owned().flatMap((s) => (s.frontier.tricky || [])
    .map((word) => HEART_WORDS[word]?.say).filter(Boolean)))]
    .map((text) => ({ text, lang: 'en', category: 'sentence' })),
];

// ————— ما تستهلكه هذه الوحدة (البابُ الرابع في `check_range.py`) —————
//
// **أرضيةٌ لا سقف** كأختها: الجردُ الحقيقيّ جولةً جولة في `probeRounds`.

export const CONSUMES = {
  cluster: { words: [], fields: [], gpcs: [], tricky: [], sounds: [] },
};

// ————— الصائتُ الأوسط: بناءُ الجولة —————

/**
 * **صائتُ الكلمة الأوسط**، أو `null`: مقطعٌ صائتٌ **واحد** لا أوّلَ الكلمة ولا آخرَها
 * — فيبقى للطفل **إطارٌ** يقرؤه حولَه (`b_x`). وكلمةٌ بصائتين (`spider`) أو بصائتٍ
 * طرفيّ (`in` · `bee`) لا وسطَ لها، فلا يُسأل عنها.
 */
function middleOf(word) {
  const at = word.gpc.map((id, i) => (VOWEL_SYMBOLS.has(id) ? i : -1)).filter((i) => i >= 0);
  if (at.length !== 1) return null;
  const only = at[0];
  return only > 0 && only < word.gpc.length - 1 ? only : null;
}

/** إطارُ الكلمة بلا صائتها: مقاطعُها ومكانَ الصائت فراغ. */
const frameSpec = (word, at) => ({
  kind: 'letter',
  unit: 'word',
  word: word.w,
  parts: word.gpc.map((id, i) => (i === at
    ? { g: GAP, mark: '', gap: true }
    : { id, g: symbolById(id)?.g || id, mark: 'dot' })),
});

/**
 * ح١٣: تُسمَع الكلمةُ ويُرى إطارُها بلا صائتها، فيُختار الصائتُ من رسمَي الزوج.
 *
 * **والمشتّتُ هو نظيرُ الزوج لا رسمٌ عشوائيّ**: الزوجُ (`a-i`) هو موضعُ التشويش
 * الموثَّق، فلو جاء المشتّتُ من رسمٍ بعيد لَأُصيب الجوابُ بالاستبعاد لا بالسمع.
 *
 * **وقيدُ الاقتران يحكم مادّتَه** كسائر تمارين القراءة: الكلمةُ تُسمَع في الجولة
 * نفسِها، فلو لم تنضج سمعاً لَكان السؤالُ عن صوتٍ في كلمةٍ لا يعرفها الطفل.
 */
function midRound(station, rnd, { range = null, isMastered } = {}) {
  const pairs = rangesOf(station, 'mid-pick');
  const wanted = range && pairs.includes(range) ? [range] : shuffle(pairs, rnd);
  const pool = readableAt(station.part, isMastered);
  for (const pair of wanted) {
    const ids = pair.split('-');
    if (ids.length !== 2 || !ids.every((id) => symbolById(id))) continue;
    const words = pool.filter((word) => {
      const at = middleOf(word);
      return at !== null && ids.includes(word.gpc[at]);
    });
    const target = pick(words, rnd);
    const skill = target && skillOf(station, pair, 'mid-pick');
    if (!target || !skill) continue;
    const at = middleOf(target);
    const specs = shuffle(ids, rnd).map(glyphSpec);
    const next = seeder(rnd);
    return {
      kind: 'mid-pick',
      shape: 'mid',
      unit: skill.unit,
      range: skill.range,
      ask: MID_ASK,
      // **والهدفُ رسمُ الصائت لا الكلمة**: المقيسُ الزوجُ (`a-i`)، والجوابُ أيُّهما
      // في هذه الكلمة — ولذلك `data-ask` رسمُه (يقرؤه الفاحصُ كما يقرأ الطفلُ الشكل).
      target: target.gpc[at],
      word: target.w,
      picture: frameSpec(target, at),
      // **والكلمةُ تامّةً للنمذجة**: المعلّمُ يُري ما سيصير إليه الإطارُ حين يقع
      // الصائتُ في موضعه (كما يُري الدمجُ الكلمةَ مبنيّةً).
      full: spelledSpec(target.w, target.gpc),
      options: specs,
      // **والجردُ ممّا يُرسَم**: الإطارُ بمقاطعه ورسما الزوج — ومجموعُهما مقاطعُ
      // الكلمة كلُّها، فلا يقع تحت بصر الطفل رمزٌ لم يُفتَح.
      figures: [frameSpec(target, at), ...specs],
      saying: [target.w],
      sounds: ids.map((id) => phonemeSay(phonemeOf(id))).filter(Boolean),
      sig: `${station.id}|${pair}|${target.w}|${next()}`,
    };
  }
  return null;
}

/** أشكالُ درجة العناقيد: دمجٌ وفكٌّ وشائكةٌ **من عدّة الدرجات**، والصائتُ الأوسط زيادتُها. */
const CLUSTER_SHAPES = {
  build: SHAPES.build,
  decode: SHAPES.decode,
  read: SHAPES.read,
  'mid-pick': midRound,
};

/**
 * **نمذجةُ الصائت الأوسط تأتي مع شكله**: تُرى الكلمةُ **تامّةً** ويُسمَع **صوتُ**
 * صائتها ثم الكلمةُ كلُّها — صوتاً لا اسمَ حرف (المرحلةُ ٢ من L&S أصواتٌ لا أسماء).
 *
 * **وهذا عيبٌ أمسكه حارسُ قائمة الصوت ساعةَ كُتب**: النمذجةُ العامّة تنطق `target`،
 * وهدفُ هذه الجولة **رسمٌ** لا كلمة — فقالت «إيه» اسمَ الحرف بصوتٍ آليّ، ولا يظهر
 * ذلك في جردٍ ولا في نصّ، إنّما في أذن طفل (وفي نصٍّ يُنطَق خارج القائمة).
 */
const MODEL_KIT = {
  el: (round) => (round.shape === 'mid'
    ? h('div', { class: 'q-shown-one' }, figureEl(round.full))
    : modelEl(round)),
  say: async (round, api) => {
    if (round.shape !== 'mid') return sayModel(round, api);
    await sayEn(phonemeSay(phonemeOf(round.target)));
    if (api.alive()) await sayEn(round.word);
    return undefined;
  },
};

/** خطةُ المحطة — بعدّة مسار الحرف نفسِها وسلّةِ أشكالٍ زائدةٍ شكلاً. */
export function buildStation(stationId, seed, isMastered = progress.isMastered) {
  const station = stationById(stationId);
  if (!station || !TYPES.has(station.type)) return null;
  return planOf(station, seed, isMastered, CLUSTER_SHAPES, MODEL_KIT);
}

/** جردُ الجولات للحارس — بأوسع الحالات (علّتُه في `grade.js`). */
export function probeRounds(stationId, seed) {
  const plan = buildStation(stationId, seed, () => true);
  if (!plan) return [];
  return [plan.model, ...plan.guided, ...plan.solo].map(usedOf);
}

// ————— تسجيلُ المحاولة —————
//
// **بنوعِ التمرين صريحاً في الشيفرة** (بابُ الشيفرة في `test_measure.mjs`): أربعةُ
// أنواعٍ تملكها هذه المحطة — ثلاثةٌ مشتركةٌ مع الدرجات و**رابعُها لها وحدَها**.

const score = (round, correct, recordAttempt = progress.recordAttempt) => {
  if (round.kind === 'build') {
    recordAttempt(round.unit, round.range, 'build', correct);
    return;
  }
  if (round.kind === 'decode') {
    recordAttempt(round.unit, round.range, 'decode', correct);
    return;
  }
  if (round.kind === 'mid-pick') {
    recordAttempt(round.unit, round.range, 'mid-pick', correct);
    return;
  }
  recordAttempt(round.unit, round.range, 'read', correct);
};

// ————— شاشةُ الصائت الأوسط —————

/**
 * **تُسمَع الكلمةُ ويُرى إطارُها**: زرُّ الأذن ههنا **لازمٌ لا زائد** — السؤالُ عن
 * صوتٍ في كلمةٍ مسموعة، فلو لم تُسمَع لصار حزراً. (وهو عكسُ `decode`: هناك يُمنَع
 * الصوتُ لأنّ المقيسَ فكُّ الرسم، وهنا يُطلَب لأنّ المقيسَ ربطُ الصوت برسمه.)
 *
 * **والجوابُ يُنطَق صوتاً لا اسمَ حرف** (المرحلةُ ٢ من L&S أصواتٌ لا أسماء).
 */
function midView(round, hooks) {
  const stage = h('div', { class: 'q-stage q-stage--ask' });
  stage.dataset.ask = round.target;
  stage.append(hearBtn(() => sayEn(round.word)));
  stage.append(h('span', { class: 'q-shown-one' }, figureEl(round.picture)));

  const choices = h('div', { class: 'q-choices q-choices--sound' });
  let locked = false;
  const buttons = round.options.map((spec) => {
    const btn = h('button', { class: 'qcard', 'aria-label': 'هَذَا' }, figureEl(spec));
    btn.addEventListener('click', async () => {
      if (locked) return;
      locked = true;
      const chosen = btn.querySelector('.fig')?.dataset.word;
      const correct = chosen === round.target;
      hooks.attempt(round, correct);
      if (correct) {
        btn.classList.add('good');
        pop(btn);
        // **ويُسمَع الصوتُ ثم الكلمةُ تامّةً**: يقع الصائتُ في موضعه من كلمةٍ يعرفها
        await sayEn(phonemeSay(phonemeOf(round.target)));
        if (!hooks.alive()) return;
        await praiseThen(hooks, round.word);
        return;
      }
      await missedThen(hooks, {
        chosen: phonemeSay(phonemeOf(chosen)) || chosen,
        target: phonemeSay(phonemeOf(round.target)) || round.target,
        chosenEl: btn,
        targetEl: buttons.find((el) => el.querySelector('.fig')?.dataset.word === round.target),
      });
    });
    return btn;
  });
  choices.append(...buttons);

  (async () => {
    await say(round.ask);
    if (hooks.alive()) await sayEn(round.word);
  })();

  return h('div', {}, h('p', { class: 'hint' }, round.ask), stage, choices);
}

const view = (round, hooks) =>
  (round.shape === 'mid' ? midView(round, hooks) : gradeView(round, hooks));

// ————— التسجيل في الموجِّه وفي المراجعة —————

registerScreen('cluster', (part) => {
  const station = stationById(`cluster:${part}`);
  if (!station || !buildStation(station.id, 1)) return null;
  return stationScreen({
    nodeId: station.id,
    title: station.title,
    accent: LETTER_ACCENT,
    make: () => buildStation(station.id, roundSeed()),
    view,
    score,
    save: (stars) => progress.setStars(station.id, stars),
  });
});

/**
 * تمارينُ المراجعة — **ولكلِّ نوعٍ مالكان اليوم**: الدرجاتُ وهذه المحطة. فيُسأل كلٌّ
 * بدوره ويردّ مَن ليست المهارةُ من محطاته `null` (عقدُ `registerExercise`)، فلا
 * تُعاد كتابةُ باني الجولة.
 */
const single = (kind) => singleIn(TYPES, kind, CLUSTER_SHAPES);

registerExercise('build', { build: single('build'), view, score, max: BUILD_MAX });
registerExercise('decode', { build: single('decode'), view, score });
registerExercise('read', { build: single('read'), view, score });
registerExercise('mid-pick', { build: single('mid-pick'), view, score });
