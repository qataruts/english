// **س٣ — ميّز الزوجين** (`METHOD.md §٤`): «زوجان يُسمَعان ويُميَّزان — مادةُ الباب ٣
// من الدراسة»: p/b · f/v · الحركاتُ القصار · العناقيد.
//
// ————— شكلان لا شكل، **والبياناتُ تختار** —————
//
// «بالصور **حيث** للزوجين معنى مصوَّر» (`METHOD.md §٤`)، وحكمُ المدير في f/v: «تمييزٌ
// صوتيٌّ خالص (`mode: 'sound'`)». فصار للمحطة شكلان، **والاختيارُ بينهما بيانٌ محسوب
// لا سطرٌ يُكتب لزوج** (`pairMode` في `curriculum.js`):
//
//   ١) **زوجٌ مصوَّر** — كلمةٌ من الزوج تُسمَع وصورتاهما تُلمَسان (pear/bear).
//      وخيارانِ لا ثلاثة: الزوجُ الأدنى **اثنان بطبعه**، وثالثٌ من خارجه يجعل السؤالَ
//      سؤالَ مفردات لا سؤالَ تمييزٍ صوتيّ.
//   ٢) **زوجٌ صوتيّ خالص** — صوتان يُسمَعان متعاقبين، والسؤال: **أهما سواء؟**
//      وهو تمييزٌ بلا كلمة (AX discrimination)، وقد لزم لأنّ الرصيدَ لا زوجَ أدنى
//      مصوَّراً فيه لهذين الصوتين. وجوابُه **شكلان لا نصّان** (قاعدةُ اللاقراءة
//      بلغتين): دائرتان متطابقتان «سواء»، ودائرةٌ ومثلّث «مختلفان» — يتعلّمهما الطفلُ
//      في خطوة «شاهِدْ» كما يتعلّم قواعدَ أي لعبة.
//
// **ولا صورةَ لصوت**: الصوتُ المعزول لا يُرسَم ولا يُكتب حرفاً — يُسمَع وحدَه
// (`METHOD.md §٤`: س٤ «بلا حرفٍ مرسوم»، وهو أَولى بس٣ التي تسبقها).
//
// **ونصوصُ الأصوات المعزولة منتظِرةٌ في قائمة الصوت** بفئة `phoneme` — والاحتياطُ
// الناطق قد يلفظ اسمَ الحرف لا صوتَه: نقصُ نقاءٍ معلومٌ مقبولٌ مؤقتاً، حلُّه جلسةُ
// الصوتيات (ص) بعد نموذج الفونيمات على أذن المالك — ولا يُجتهَد فيه هنا
// (`docs/AUDIO_QUEUE.md`).

import * as progress from './progress.js';
import { registerScreen } from './registry.js';
import { stations } from './curriculum.js';
import { figureEl, specOf } from './figures.js';
import {
  say, sayEn, praiseThen, missedThen, seeder, skillOf, stationById, stationForSkill,
  registerExercise, stationScreen, usedOf,
} from './station.js';
import { h, icon, pick, shuffle, seeded, pop, LISTEN_ACCENT } from './ui.js';

/** أنواعُ الشاشات التي تملكها هذه الوحدة (يقابلها `STATIONS` في `test_measure.mjs`). */
const TYPES = new Set(['contrast']);

const GUIDED = 2;
const SOLO = 5;
const MODEL_ITEMS = 2;

// ————— التعليماتُ المنطوقة (عربيةٌ كلُّها — `METHOD.md §٩·١`) —————

const ASK = {
  word: 'اسْمَعْ وَالْمَسِ الصُّورَةَ الَّتِي سَمِعْتَ',
  same: 'اسْمَعِ الصَّوْتَيْنِ: أَهُمَا سَوَاءٌ أَمْ مُخْتَلِفَانِ؟',
  model: 'انْظُرْ وَاسْمَعْ — صَوْتَانِ مُتَقَارِبَانِ',
  // **ولا حرفَ يُقرأ في الجواب**: هاتان تُقالان مرّةً في النمذجة فيُعرَف الشكلان
  isSame: 'سَوَاء',
  isDiffer: 'مُخْتَلِفَان',
};

/** محطاتُ هذه الوحدة من المنهج. */
const owned = () => stations().filter((s) => TYPES.has(s.type));

/**
 * **كلُّ نصٍّ قد تنطقه هذه الوحدة** — إعلانٌ لا استنتاج (`tools/queue_texts.mjs`):
 * تعليماتُها العربية، وكلماتُ أزواجها المصوَّرة، **وأصواتُ أزواجها المعزولة** بفئتها
 * الخاصة (`phoneme`) — فمن قرأ القائمةَ عرف أيُّ ملفٍّ صوتٌ معزول وأيُّه كلمة.
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
// **أرضيةٌ لا سقف** (كأختيها): أربعُ محطاتٍ جباهُها مختلفة، والمُعلَنُ ما تشترك فيه
// كلُّها — والجردُ الحقيقيّ جولةً جولة في `probeRounds`.

export const CONSUMES = {
  contrast: { words: [], fields: [], gpcs: [], tricky: [], sounds: [] },
};

// ————— بناءُ الجولات (حتميٌّ ببذرة) —————

/** شكلا الجواب في التمييز الصوتيّ — **رسمان لا كلمتان**. */
const SAME_SPEC = { kind: 'tokens', word: '', name: 'same', tokens: ['circle', 'circle'] };
const DIFFER_SPEC = { kind: 'tokens', word: '', name: 'differ', tokens: ['circle', 'triangle'] };

/** جولةُ الزوج المصوَّر: كلمةٌ من الزوج تُسمَع، وصورتاهما تُلمَسان. */
function wordRound(station, pair, rnd) {
  const skill = skillOf(station, pair.key, 'pick');
  if (!skill || pair.words.length !== 2) return null;
  const target = pick(pair.words, rnd);
  const specs = shuffle(pair.words, rnd).map((w) => specOf(w));
  const next = seeder(rnd);
  return {
    kind: 'pick',
    shape: 'word',
    unit: skill.unit,
    range: skill.range,
    ask: ASK.word,
    saying: [target.w],
    target: target.w,
    options: specs,
    figures: specs,
    fields: [...new Set(pair.words.map((w) => w.field))],
    sig: `${station.id}|${pair.key}|${target.w}|${next()}`,
  };
}

/**
 * جولةُ الزوج الصوتيّ: صوتان يُسمَعان — أهما سواء؟
 *
 * **ونصفُ الجولات سواءٌ ونصفُها مختلف** بقرعةٍ من البذرة: لو غلب أحدُ الجوابين لَتعلّم
 * الطفلُ الجوابَ الغالب لا التمييز. وحين يكونان سواءً يُعادان **من الصوت نفسِه**
 * (لا من صوتيه معاً) — فالسؤالُ سؤالُ أذنٍ لا سؤالُ ترتيب.
 */
function soundRound(station, pair, rnd) {
  const skill = skillOf(station, pair.key, 'pick');
  if (!skill || pair.sounds.length !== 2) return null;
  const same = rnd() < 0.5;
  const first = rnd() < 0.5 ? pair.sounds[0] : pair.sounds[1];
  const second = same ? first : pair.sounds.find((s) => s !== first);
  const specs = shuffle([SAME_SPEC, DIFFER_SPEC], rnd);
  const next = seeder(rnd);
  return {
    kind: 'pick',
    shape: 'same',
    unit: skill.unit,
    range: skill.range,
    ask: ASK.same,
    sounds: [first, second],
    target: same ? 'same' : 'differ',
    options: specs,
    figures: specs,
    fields: [],
    sig: `${station.id}|${pair.key}|${same ? 'same' : 'differ'}|${next()}`,
  };
}

/** جولةُ زوجٍ — **بشكله المُعلَن في البيانات** لا بمعرّف محطته. */
function pairRound(station, rnd, { pair = null } = {}) {
  const chosen = pair || pick(station.pairs, rnd);
  if (!chosen) return null;
  return chosen.mode === 'word'
    ? wordRound(station, chosen, rnd)
    : soundRound(station, chosen, rnd);
}

/** **خطةُ المحطة**: نمذجةٌ ثم جولتان بعونٍ ثم خمسٌ «وحدك» — من بذرةٍ واحدة. */
export function buildStation(stationId, seed) {
  const station = stationById(stationId);
  if (!station || !TYPES.has(station.type) || !station.pairs.length) return null;
  const rnd = seeded(seed >>> 0);

  let bag = [];
  const nextPair = () => {
    if (!bag.length) bag = shuffle(station.pairs, rnd);
    return bag.pop();
  };

  const shown = Array.from({ length: MODEL_ITEMS }, () => pairRound(station, rnd, {}))
    .filter(Boolean);
  return {
    model: {
      title: 'المعلّمُ يُسمِعُ صوتين متقاربين، وأنت تنصت',
      hint: ASK.model,
      // **والنمذجةُ تُري الجوابَ مع سببه**: يُقال الصوتان (أو الكلمة) ثم يُعرَض
      // الشكلُ الذي يقابلهما — فيتعلّم الطفلُ معنى «سواء» و«مختلفان» بالعرض لا بالنصّ.
      // (و`en` فارغةٌ عمداً: مادّةُ النمذجة هنا **صوتان متعاقبان** لا نصٌّ واحد،
      //  فيتولّاها `after` بالقناة نفسِها — ولا يُصَفّ في قائمة الصوت نصٌّ مركَّب.)
      items: shown.map((round) => ({
        en: '',
        el: () => modelEl(round),
        after: (box, api) => sayModel(round, api),
      })),
      figures: shown.flatMap((round) => round.figures),
      fields: [...new Set(shown.flatMap((round) => round.fields))],
      saying: [...new Set(shown.flatMap((round) => round.saying || []))],
      sounds: [...new Set(shown.flatMap((round) => round.sounds || []))],
    },
    guided: Array.from({ length: GUIDED }, () =>
      pairRound(station, rnd, { pair: nextPair() })).filter(Boolean),
    solo: Array.from({ length: SOLO }, () =>
      pairRound(station, rnd, { pair: nextPair() })).filter(Boolean),
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
// **بنوعِ التمرين صريحاً في الشيفرة** (بابُ الشيفرة في `test_measure.mjs`)، والمفتاحُ
// مفتاحُ **الزوج** لا الكلمة: المقيسُ تمييزُ الصوتين (`pair|p-b|pick`).

const score = (round, correct, recordAttempt = progress.recordAttempt) =>
  recordAttempt(round.unit, round.range, 'pick', correct);

// ————— الشاشة —————

/** زرُّ إعادة السماع — **أذنٌ لا كلمة** (قاعدةُ اللاقراءة بلغتين). */
const hearBtn = (onHear) => h('button', {
  class: 'btn btn--hear',
  'aria-label': 'اسمع مرّةً أخرى',
  onclick: onHear,
}, icon('ear'));

/** إسماعُ مادّة الجولة: كلمةٌ واحدة، أو صوتان متعاقبان في القناة الواحدة. */
async function playAsk(round, api) {
  if (round.shape === 'word') {
    await sayEn(round.target);
    return;
  }
  for (const sound of round.sounds) {
    if (!api.alive()) return;
    await sayEn(sound);
  }
}

/** نمذجةٌ منطوقة: تُسمَع المادّة ثم يُقال اسمُ الشكل الذي يقابلها (عربيّاً). */
async function sayModel(round, api) {
  await playAsk(round, api);
  if (!api.alive() || round.shape === 'word') return;
  await say(round.target === 'same' ? ASK.isSame : ASK.isDiffer);
}

/** مشهدُ النمذجة: الجولةُ مرسومةً بجوابها — عرضٌ يُشاهَد لا سؤالٌ يُطلَب. */
function modelEl(round) {
  const spec = round.options.find((o) => (o.name || o.word) === round.target)
    || round.options[0];
  return h('div', { class: 'q-shown-one' }, figureEl(spec));
}

/**
 * جولةُ التمييز — بشكليها: صورتان تُلمَسان، أو شكلا «سواء/مختلفان».
 * **والحكمُ على المرسوم**: ما تحمله البطاقةُ فعلاً (`data-name` أو `data-word`).
 */
function contrastView(round, hooks) {
  const stage = h('div', { class: 'q-stage q-stage--ask' });
  stage.dataset.ask = round.target;
  stage.append(hearBtn(() => playAsk(round, hooks)));

  const choices = h('div', { class: `q-choices q-choices--${round.shape}` });
  let locked = false;
  const idOf = (el) => {
    const fig = el.querySelector('.fig');
    return fig?.dataset.name || fig?.dataset.word;
  };

  for (const spec of round.options) {
    const btn = h('button', {
      class: 'qcard',
      'aria-label': 'هَذِهِ',
      onclick: async () => {
        if (locked) return;
        locked = true;
        const chosen = idOf(btn);
        const correct = chosen === round.target;
        hooks.attempt(round, correct);
        const targetEl = [...choices.children].find((el) => idOf(el) === round.target);
        if (correct) {
          btn.classList.add('good');
          pop(btn);
          // **والصوتُ لا يُردَّد**: «قُلها معي» دعوةٌ إلى الكلمة، ولا معنى لها في
          // صوتٍ معزول — فالتمييزُ الصوتيّ يُختَم بإسماع الصوتين ثانيةً لا بدعوة.
          if (round.shape === 'word') {
            await praiseThen(hooks, round.target);
            return;
          }
          await playAsk(round, hooks);
          if (hooks.alive()) hooks.done();
          return;
        }
        if (round.shape === 'word') {
          await missedThen(hooks, {
            chosen, target: round.target, chosenEl: btn, targetEl,
          });
          return;
        }
        // خطأُ التمييز الصوتيّ: يُضاء الصوابُ ويُعاد الصوتان — **التقابلُ هو الدرس**
        btn.classList.add('bad');
        targetEl?.classList.add('good');
        await say(round.target === 'same' ? ASK.isSame : ASK.isDiffer);
        if (!hooks.alive()) return;
        await playAsk(round, hooks);
        if (hooks.alive()) hooks.done();
      },
    }, figureEl(spec));
    choices.append(btn);
  }

  /* **السؤالُ ثم المادّة، في القناة الواحدة**: توجيهٌ عربيّ يُنتظَر تمامُه ثم المادّة
     الإنكليزية — فلا يقع لسانٌ فوق لسان. */
  (async () => {
    await say(round.ask);
    if (hooks.alive()) await playAsk(round, hooks);
  })();

  return h('div', {}, h('p', { class: 'hint' }, round.ask), stage, choices);
}

// ————— التسجيل في الموجِّه وفي المراجعة —————

registerScreen('contrast', (part) => {
  const station = stationById(`contrast:${part}`);
  if (!station || !buildStation(station.id, 1)) return null;
  return stationScreen({
    nodeId: station.id,
    title: station.title,
    accent: LISTEN_ACCENT,
    make: () => buildStation(station.id, (Date.now() >>> 0) ^ 0x9e3779b9),
    view: contrastView,
    score,
    save: (stars) => progress.setStars(station.id, stars),
  });
});

/**
 * جولةٌ لمهارةٍ مستحقّة — مادّةُ المراجعة والبوابات.
 * **ونوعُ `pick` يشترك فيه مالكان** (هذه و«الأذنُ الفونيمية»)، فمن ليست المهارةُ من
 * محطاته ردّ `null` وسُئل شريكُه (`registerExercise` في `station.js`).
 */
registerExercise('pick', {
  build: (skill, rnd) => {
    const station = stationForSkill(skill);
    if (!station || !TYPES.has(station.type)) return null;
    return pairRound(station, rnd, {
      pair: station.pairs.find((p) => p.key === skill.range) || null,
    });
  },
  view: contrastView,
  score,
});
