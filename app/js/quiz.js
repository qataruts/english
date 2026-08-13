// **س١ — افهم والمس** (`METHOD.md §٤`): «كلمةٌ تُسمَع بالإنكليزية وصورٌ تُلمَس».
//
// ستُّ محطاتٍ بشاشةٍ واحدة، حقولُها بترتيب الأثر (أقربُ عالم الطفل أولاً): الأهلُ
// والجسدُ والحيواناتُ والطعامُ والألوانُ والأعدادُ سمعاً. **والشاشةُ تخدم محطاتِ
// «توسعةِ الرصيد» (س٥) بطبعها** لأنّ بياناتها بنيةٌ واحدة — إلا جملَ س٥-٦ فمشهدُها
// شكلٌ آخر تكتبه الجلسة ٧ (`SESSIONS.md`)، وهذه الوحدةُ **تردّها صراحةً** ولا تدّعيها.
//
// ————— خمسةُ عهودٍ تحكم هذه الوحدة —————
//
// ١) **سمعيةٌ صِرف**: الكلمةُ تُسمَع بالإنكليزية ولا تُكتب — لا حرفَ إنكليزيّ واحد على
//    شاشة الطفل (قاعدةُ اللاقراءة بلغتين، `METHOD.md §٩·٢`). والتوجيهُ يُسمَع بالعربية،
//    ونصُّه المكتوب **زينةٌ للوالد** لا وسيلةُ تشغيل: زرُّ الإعادة أيقونةُ أذن.
// ٢) **الصورةُ من إعلان الكلمة** (`figures.js` · `specOf`): صورةٌ أو كمّيةٌ أو بقعةُ
//    لون — لا تختار الشاشةُ لكلمةٍ صورةً غيرَ صورتها.
// ٣) **المشتّتاتُ من المحطة نفسِها**: من حقلها ومن كلماتها المعلَنة — فلا كلمةَ في
//    تمرينٍ خارج جبهته (`check_range`)، والأعدادُ مشتّتاتُها **مجاورةٌ** فيُقدَّر
//    الكمُّ ولا يُخمَّن.
// ٤) **الخطأ يُسمَع ويمضي**: «لمستَ dog · وهذه cat» ثم الجولةُ التالية — لا مؤقّتَ
//    ولا شاشةَ خطأ ولا إعادةَ محاولةٍ على كلمةٍ لم تثبت في الأذن (`station.js`).
// ٥) **الجولاتُ حتميةٌ ببذرة**: يبنيها `buildStation` وحدَها ويجردها `probeRounds`
//    للحارس — فما يُجرَد هو ما يُلعَب.

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
const TYPES = new Set(['quiz']);

const GUIDED = 2;          // «جرِّب معي» — جولتان بخيارين، غيرُ مقيستين
const SOLO = 5;            // «وحدك» — وهي المقيسة
const GUIDED_OPTIONS = 2;
const SOLO_OPTIONS = 3;
const MODEL_ITEMS = 3;     // ما يعرضه المعلم في «شاهِدْ»

// ————— التعليماتُ المنطوقة (عربيةٌ كلُّها) —————

// **ولا جملةَ تُعلَن ولا تُقال**: زرُّ الإعادة يعيد **الكلمةَ** لا التوجيه، فليس هنا
// «اسمع مرّةً أخرى» — والمُعلَنُ هو المنطوقُ بعينه (يقابله `tools/queue_texts.mjs`).
const ASK = {
  listen: 'اِسْمَعْ وَالْمَسْ',
  model: 'اُنْظُرْ وَاسْمَعْ — الْمُعَلِّمُ يَقُولُ وَأَنْتَ تَسْمَعْ',
};

/** محطاتُ هذه الوحدة من المنهج — ومنها تُجرَد مادّتُها المنطوقة. */
const owned = () => stations().filter((s) => TYPES.has(s.type) && !s.sentences.length);

/**
 * **كلُّ نصٍّ قد تنطقه هذه الوحدة** — إعلانٌ لا استنتاج (يجرده `tools/queue_texts.mjs`):
 * تعليماتُها العربية، و**كلماتُ محطاتها الإنكليزية** مقروءةً من المنهج نفسِه. فمحطةٌ
 * تدخل الرحلةَ غداً تدخل قائمةَ الصوت معها بلا سطرٍ يُكتب هنا.
 */
export const SPOKEN = [
  ...Object.values(ASK).map((text) => ({ text, lang: 'ar', category: 'instruction' })),
  ...[...new Set(owned().flatMap((s) => s.words.map((w) => w.w)))]
    .map((text) => ({ text, lang: 'en', category: 'word' })),
];

// ————— ما تستهلكه هذه الوحدة (الباب الرابع في `check_range.py`) —————
//
// **الإعلانُ أرضيةٌ لا سقف**: لنوع الشاشة الواحد اثنتا عشرةَ محطةً جبهاتُها مختلفة،
// والحارسُ يقابل الإعلانَ بكلِّ محطةٍ من نوعه — فالمُعلَن ما تشترك فيه كلُّها، وهو
// **لا شيء**: كلُّ محطةٍ تعرض كلماتِ حقلها وحدَه. وما تعرضه فعلاً يُجرَد **جولةً
// جولة** في `probeRounds` على جبهة محطتها هي، وهو الفحصُ الأصدق.

export const CONSUMES = {
  quiz: { words: [], fields: [], gpcs: [], tricky: [] },
};

// ————— بناءُ الجولات (حتميٌّ ببذرة) —————

/**
 * **مشتّتاتُ الكمّية متجاورة** (قاعدةُ «اِحْسِبْ» المنقولة — `METHOD.md §٤`: عدٌّ
 * مجرد): أمام سبعةٍ ستّةٌ وثمانية لا واحدٌ وعشرة — فيقدّر الطفلُ الكمَّ ولا يخمّنه
 * بالنظرة الأولى. وما سوى الأعداد مشتّتاتُه من كلمات المحطة بالقرعة.
 */
function distractors(station, target, count, rnd) {
  const pool = station.words.filter((w) => w.w !== target.w);
  if (target.count) {
    const near = pool
      .filter((w) => w.count)
      .sort((a, b) => Math.abs(a.count - target.count) - Math.abs(b.count - target.count));
    return shuffle(near.slice(0, Math.max(count, 2)), rnd).slice(0, count);
  }
  return shuffle(pool, rnd).slice(0, count);
}

/** جولةُ «اسمع والمس» — كلمةٌ تُسمَع وصورٌ تُلمَس. */
function pickRound(station, rnd, { options = SOLO_OPTIONS, word = null } = {}) {
  const target = word || pick(station.words, rnd);
  if (!target) return null;
  const skill = skillOf(station, target.w, 'listen-pick');
  if (!skill) return null;
  const others = distractors(station, target, options - 1, rnd);
  const next = seeder(rnd);
  const specs = shuffle([target, ...others], rnd).map((w) => specOf(w));
  return {
    kind: 'listen-pick',
    unit: skill.unit,
    range: skill.range,
    ask: ASK.listen,
    // **المادّةُ المنطوقة**: الكلمةُ الإنكليزية وحدَها — لا جملةَ حولها في س١
    saying: [target.w],
    target: target.w,
    options: specs,
    figures: specs,
    fields: [...new Set([target, ...others].map((w) => w.field))],
    sig: `${station.id}|${target.w}|${next()}`,
  };
}

/**
 * **خطةُ المحطة**: نمذجةٌ ثم جولتان بعونٍ (خياران) ثم خمسٌ «وحدك» (ثلاثة خيارات).
 * **ولا تتكرّر كلمةٌ ما بقي في المحطة غيرُها**: القرعةُ على قائمةٍ مخلوطة تدور، فيلقى
 * الطفلُ أكثرَ حقله في الجلسة الواحدة بدل أن تتكرّر عليه كلمةٌ وتُهمَل أخرى.
 */
export function buildStation(stationId, seed) {
  const station = stationById(stationId);
  // **وجملُ س٥-٦ ليست من هذه الوحدة**: مشهدُها شكلٌ آخر (الجلسة ٧)، فتُردّ صراحةً
  // ولا تُبنى بشاشةٍ لا تصفها.
  if (!station || !TYPES.has(station.type) || station.sentences.length) return null;
  if (station.words.length < 2) return null;
  const rnd = seeded(seed >>> 0);

  let bag = [];
  const nextWord = () => {
    if (!bag.length) bag = shuffle(station.words, rnd);
    return bag.pop();
  };

  const shown = shuffle(station.words, rnd).slice(0, MODEL_ITEMS);
  return {
    model: {
      title: 'المعلّمُ يعرض ويقول، وأنت تسمع',
      hint: ASK.model,
      items: shown.map((word) => ({
        en: word.w,
        el: () => figureEl(specOf(word)),
      })),
      // جردُ النمذجة كجرد الجولة سواءً — ما يُعرَض فيها يراه الطفل
      figures: shown.map((w) => specOf(w)),
      saying: shown.map((w) => w.w),
      fields: [...new Set(shown.map((w) => w.field))],
    },
    guided: Array.from({ length: GUIDED }, () =>
      pickRound(station, rnd, { options: GUIDED_OPTIONS, word: nextWord() })).filter(Boolean),
    solo: Array.from({ length: Math.min(SOLO, station.words.length) }, () =>
      pickRound(station, rnd, { options: SOLO_OPTIONS, word: nextWord() })).filter(Boolean),
  };
}

/** جردُ الجولات للحارس — **النمذجةُ والعونُ و«وحدك» كلُّها**، فلا شكلَ يفلت. */
export function probeRounds(stationId, seed) {
  const plan = buildStation(stationId, seed);
  if (!plan) return [];
  return [plan.model, ...plan.guided, ...plan.solo].map(usedOf);
}

// ————— تسجيلُ المحاولة —————
//
// **بنوعِ التمرين صريحاً في الشيفرة**: فما تكتبه هذه الوحدة في ليتنر مقروءٌ فيها لا
// مستنتَجٌ من متغيّر — وعليه يقوم بابُ الشيفرة في `test_measure.mjs`. والمفتاحُ مفتاحُ
// **المهارة المطلوبة** لا ما لمس الطفل.

// (واسمُ المُعامَل `recordAttempt` عمداً: هو دالّةُ `progress` نفسُها في المحطة،
//  ونظيرتُها في المراجعة — وباسمها يقرأ الحارسُ **موضعَ الكتابة** لا نيّتَها.)
const score = (round, correct, recordAttempt = progress.recordAttempt) =>
  recordAttempt(round.unit, round.range, 'listen-pick', correct);

// ————— الشاشة —————

/**
 * جولةُ «اسمع والمس»: سؤالٌ يُسمَع (عربيّ) ثم الكلمةُ (إنكليزية)، وصورٌ تُلمَس.
 *
 * **وزرُّ الإعادة أذنٌ لا كلمة**: هو الوسيلةُ الوحيدة إلى إعادة السماع، فلو كان نصّاً
 * لَتوقّفت اللعبةُ على قراءةٍ — وجمهورُنا قبل-قارئ بلغتين. ويُعيد **الكلمةَ وحدَها**
 * لا التوجيهَ معها: المطلوبُ سماعُ المادّة ثانيةً لا الدرسُ كلُّه.
 */
function pickView(round, hooks) {
  const stage = h('div', { class: 'q-stage q-stage--ask' });
  // **مادّةُ الجولة سِمةٌ لا نصّ** (`data-ask`): الصوتُ لا يُقرأ في DOM، فتُعلن الجولةُ
  // ما تقوله ليقيسه الفاحصُ في متصفّحٍ حقيقيّ — ولا تراها عينُ طفل.
  stage.dataset.ask = round.target;

  const replay = h('button', {
    class: 'btn btn--hear',
    'aria-label': 'اسمع الكلمة مرّةً أخرى',
    onclick: () => sayEn(round.target),
  }, icon('ear'));
  stage.append(replay);

  const choices = h('div', { class: 'q-choices' });
  let locked = false;

  for (const spec of round.options) {
    const btn = h('button', {
      class: 'qcard',
      'aria-label': 'هَذِهِ',
      onclick: async () => {
        if (locked) return;
        locked = true;
        // **الجوابُ من المرسوم**: ما تحمله البطاقةُ فعلاً (`data-word`) لا ما نوى المولّد
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

  /* **السؤالُ ثم المادّة، في القناة الواحدة**: توجيهٌ عربيّ يُنتظَر تمامُه ثم الكلمةُ
     الإنكليزية — فلا يقع لسانٌ فوق لسان، وهو ما تمنعه القناةُ بنيةً. */
  (async () => {
    await say(round.ask);
    if (hooks.alive()) await sayEn(round.target);
  })();

  return h('div', {},
    h('p', { class: 'hint' }, round.ask),
    stage,
    choices,
  );
}

// ————— التسجيل في الموجِّه وفي المراجعة —————
//
// **الشاشةُ تسجّل نفسَها**: لا يعرف `main.js` اسمَ شاشةٍ هنا، ولا تدخل محطةٌ جديدة من
// هذا النوع بسطرٍ يُعدَّل خارج `curriculum.js`.

registerScreen('quiz', (part) => {
  const station = stationById(`quiz:${part}`);
  if (!station || !buildStation(station.id, 1)) return null;
  return stationScreen({
    nodeId: station.id,
    title: station.title,
    accent: LISTEN_ACCENT,
    make: () => buildStation(station.id, (Date.now() >>> 0) ^ 0x9e3779b9),
    view: pickView,
    score,
    save: (stars) => progress.setStars(station.id, stars),
  });
});

/** جولةٌ واحدة لمهارةٍ مستحقّة — مادّةُ المراجعة والبوابات (`review.js`). */
registerExercise('listen-pick', {
  build: (skill, rnd) => {
    const station = stationForSkill(skill);
    if (!station || !TYPES.has(station.type) || station.sentences.length) return null;
    const word = station.words.find((w) => w.w === skill.range);
    return pickRound(station, rnd, { word });
  },
  view: pickView,
  score,
});
