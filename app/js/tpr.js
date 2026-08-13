// **س٢ — اسمع ونفّذ: TPR** (`METHOD.md §٤`): «أمرٌ يُسمَع وفعلٌ يُنفَّذ لمساً/سحباً —
// قابلٌ للفحص الآلي (فعلُ الطفل يطابق الأمر أو لا)».
//
// أربعُ محطاتٍ بثلاث شاشات:
//   س٢-١ **أوامرُ اللمس**      — يُسمَع الأمرُ فتُلمَس صورةُ المأمور به
//   س٢-٢ **الوضعُ المكانيّ**   — تُسحَب التفاحةُ إلى موضعها من الصندوق (in/on/under/behind)
//   س٢-٣ **أفعالُ الحركة**     — تُلمَس الشخصيةُ التي تفعل ما أُمر به، فتفعله بلمسته
//   س٢-٤ **الأمرُ المركّب**     — صفتان ومسمّى: «الكرةُ الحمراءُ الكبيرة»
//
// ————— **شكلٌ لا نظيرَ له في «اِقْرَأْ»** (بندُ الجلسة نصاً) —————
//
// شاشاتُ اقرأ كلُّها «اسمع/انظر ثم اختر»، وهذا **أمرٌ يُنفَّذ**: الجوابُ فعلٌ لا
// معرفة. فبُني على عقدَي البذرة لا فوقهما: **الشاشةُ تسجّل نفسَها** في `registry.js`،
// **والتمرينُ يُحقَن** في المراجعة عبر موزِّع `station.js` — فلم يُعدَّل في الموجِّه
// ولا في محرّك المراجعة سطرٌ واحد لأجل شكلٍ جديد. وذاك هو اختبارُ العقد.
//
// ————— وأربعةُ أحكامٍ في مادّته —————
//
// ١) **«touch» ليست في الرصيد**: قائمةُ Cambridge Pre A1 Starters ‏2025 ليس فيها
//    `touch` (وفيها `point` و`to` و`put`)، ونصُّ `METHOD.md §٣` ملزم: «ولا كلمةَ في
//    تمرينٍ خارجه». فأمرُ اللمس **`point to the …`** — وهو من الرصيد، وأصدقُ في TPR
//    (أوّلُ ما يُطلَب من طفلٍ في هذه السنّ أن **يشير**). ومثالُ المنهج «touch the cat»
//    توضيحيٌّ كـ`fish` عند ح٥ (`METHOD.md §١٢-١١`)، والحاكمُ بياناتُ `curriculum.js`
//    المفحوصة. **(بندٌ يُرفَع إلى مدير المشروع.)**
// ٢) **الأمرُ المنطوق بيانٌ في المنهج** (`order` في `curriculum.js`) لا نصٌّ يُركَّب
//    في شاشة: منه تُستخرَج نصوصُ قائمة الصوت، ويجرده `check_range` كلمةً كلمة.
// ٣) **ما لا رمزَ ساكناً له يُرسَم وضعاً** (`figures.js`): الوثبةُ والتصفيقُ ولمسُ
//    الذراع — وهي الكلماتُ التي نزلت من `RAISED` بحكم المدير (`RESOLVED`).
// ٤) **الأمرُ المركّب يُقاس بصفتيه معاً**: من أصاب «الكرةَ الحمراءَ الكبيرة» فهم
//    الصفتين، ومن أخطأ لا يُعرَف أيَّتهما أخطأ — فتُكتب المحاولةُ على المفتاحين
//    كليهما، وليتنر يعيد ما تزعزع. (والبديلُ — قياسُ واحدةٍ وإهمالُ الأخرى — يجعل
//    نصفَ المحطة لا يُقاس أصلاً.)

import * as progress from './progress.js';
import { registerScreen } from './registry.js';
import { stations } from './curriculum.js';
import { figureEl, specOf, hasPose } from './figures.js';
import {
  say, sayEn, praiseThen, missedThen, seeder, skillOf, stationById, stationForSkill,
  registerExercise, stationScreen, usedOf,
} from './station.js';
import { h, icon, pick, shuffle, seeded, pop, LISTEN_ACCENT } from './ui.js';

/** أنواعُ الشاشات التي تملكها هذه الوحدة (يقابلها `STATIONS` في `test_measure.mjs`). */
const TYPES = new Set(['tpr']);

const GUIDED = 2;
const SOLO = 5;
const GUIDED_OPTIONS = 2;
const SOLO_OPTIONS = 3;
const MODEL_ITEMS = 2;

// ————— التعليماتُ المنطوقة (عربيةٌ كلُّها) —————

const ASK = {
  pick: 'اِسْمَعِ الْأَمْرَ وَالْمَسْ',
  put: 'اِسْمَعِ الْأَمْرَ وَضَعِ التُّفَّاحَة',
  act: 'اِسْمَعِ الْأَمْرَ وَاخْتَرْ مَنْ يَفْعَلُهُ',
  model: 'اُنْظُرْ: الْمُعَلِّمُ يَأْمُرُ وَيَفْعَل',
  // **الترديدُ في TPR فعلٌ لا قول** (`METHOD.md §١٢-٥`: يُدعى ولا يُقاس)
  doIt: 'اِفْعَلْهَا مَعَهُ',
};

/**
 * **مواضعُ الوضع المكانيّ** — الكلمةُ ← موضعُها من الصندوق. وهي بيانُ رسمٍ لا بيانُ
 * منهج (المنهجُ يعلن الكلمات، وهذا يعلن أين تُرسَم)، **ومَن لا موضعَ له لا يُولَّد**:
 * حرفُ جرٍّ جديد في المنهج غداً لا تخترع له هذه الوحدةُ مكاناً بالحدس.
 */
const ZONES = ['in', 'on', 'under', 'behind'];
const hasZone = (word) => ZONES.includes(word);

/** محطاتُ هذه الوحدة من المنهج. */
const owned = () => stations().filter((s) => TYPES.has(s.type));

/**
 * صفاتُ الحجم في محطة الأمر المركّب: كلماتُها ما خلا الألوان.
 * (دالّةٌ مُعلَنة لا سهم: يقرؤها إعلانُ المنطوق أدناه وهو يعمل وقتَ التحميل.)
 */
function sizesOf(station) {
  const colours = new Set(station.colours.map((c) => c.w));
  return station.words.filter((w) => !colours.has(w.w));
}

/** ملءُ قالب الأمر بمادّته: `point to the {w}` ← `point to the cat`. */
const fill = (template, values) =>
  String(template || '').replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');

/** عبارةُ الكرة الموصوفة — تُقال وحدَها في التصحيح («وهذه: the big red ball»). */
const ballPhrase = (size, colour) => `the ${size} ${colour} ball`;

/** أمرُ كلمةٍ في محطتها: `order` الكلمةِ إن أعلنَته، وإلّا قالبُ المحطة. */
const orderOf = (station, word) => word.order || fill(station.order, { w: word.w });

/**
 * **كلُّ نصٍّ قد تنطقه هذه الوحدة** — مستخرَجٌ من المنهج نفسِه: أوامرُ كل محطةٍ
 * بكلماتها، وأسماءُ ما يُقال في التصحيح. فلا نصَّ يُنطَق ولا يُصَفّ في قائمة الصوت.
 */
function spokenOf() {
  const out = [...Object.values(ASK).map((text) => ({ text, lang: 'ar', category: 'instruction' }))];
  const en = new Map();
  const add = (text, category) => { if (text && !en.has(text)) en.set(text, category); };
  // **والفئةُ من شكل النصّ لا من موضعه هنا**: أمرُ الحركة كلمةٌ مفردة («jump») وأمرُ
  // اللمس جملة («point to the cat») — وهما يخرجان من قالبٍ واحد. والفئةُ تختار مسحةَ
  // الأداء، فكلمةٌ تُصرَّف بمسحة جملةٍ تُسمع ممطوطةً في أذن طفل.
  const kindOf = (text) => (text.includes(' ') ? 'sentence' : 'word');
  for (const station of owned()) {
    if (station.kind === 'tpr-two') {
      for (const size of sizesOf(station)) {
        for (const colour of station.colours) {
          const order = fill(station.order, { size: size.w, colour: colour.w });
          add(order, kindOf(order));
          add(ballPhrase(size.w, colour.w), 'sentence');
        }
      }
      continue;
    }
    for (const word of station.words) {
      const order = orderOf(station, word);
      add(order, kindOf(order));
      add(word.w, 'word');       // ما يُقال في التصحيح: «لمستَ dog · وهذه cat»
    }
  }
  return [...out, ...[...en].map(([text, category]) => ({ text, lang: 'en', category }))];
}

export const SPOKEN = spokenOf();

// ————— ما تستهلكه هذه الوحدة (الباب الرابع في `check_range.py`) —————
//
// **أرضيةٌ لا سقف** (كأختها في `quiz.js`): أربعُ محطاتٍ جباهُها مختلفة، والمُعلَنُ ما
// تشترك فيه كلُّها — والجردُ الحقيقيّ جولةً جولة في `probeRounds`.

export const CONSUMES = {
  tpr: { words: [], fields: [], gpcs: [], tricky: [], said: [] },
};

// ————— بناءُ الجولات —————

/** كلماتُ الأمر المنطوق — يقابلها الحارسُ بمداخل Starters (لا بالرصيد المصوَّر). */
const saidWords = (...texts) => [...new Set(texts.join(' ').split(/\s+/).filter(Boolean))];

/** جولةُ «المس ما تسمع» — أمرٌ يُسمَع وصورةٌ تُلمَس (س٢-١). */
function pickRound(station, rnd, { options = SOLO_OPTIONS, word = null } = {}) {
  const target = word || pick(station.words, rnd);
  if (!target) return null;
  const skill = skillOf(station, target.w, station.kind);
  if (!skill) return null;
  const others = shuffle(station.words.filter((w) => w.w !== target.w), rnd)
    .slice(0, options - 1);
  const order = orderOf(station, target);
  const specs = shuffle([target, ...others], rnd).map((w) => specOf(w));
  const next = seeder(rnd);
  return {
    kind: station.kind,
    shape: 'pick',
    unit: skill.unit,
    range: skill.range,
    ask: ASK.pick,
    order,
    target: target.w,
    options: specs,
    figures: specs,
    fields: [...new Set([target, ...others].map((w) => w.field))],
    said: saidWords(order),
    sig: `${station.id}|${target.w}|${next()}`,
  };
}

/** جولةُ «افعل مثلي» — أوضاعٌ تُرى، وتُلمَس الفاعلةُ لِما أُمر به (س٢-٣). */
function actRound(station, rnd, { options = SOLO_OPTIONS, word = null } = {}) {
  const pool = station.words.filter((w) => hasPose(w.w));
  const target = word && hasPose(word.w) ? word : pick(pool, rnd);
  if (!target) return null;
  const skill = skillOf(station, target.w, station.kind);
  if (!skill) return null;
  const others = shuffle(pool.filter((w) => w.w !== target.w), rnd).slice(0, options - 1);
  const order = orderOf(station, target);
  const specs = shuffle([target, ...others], rnd).map((w) => specOf(w));
  const next = seeder(rnd);
  return {
    kind: station.kind,
    shape: 'act',
    unit: skill.unit,
    range: skill.range,
    ask: ASK.act,
    order,
    target: target.w,
    options: specs,
    figures: specs,
    fields: [...new Set([target, ...others].map((w) => w.field))],
    said: saidWords(order),
    sig: `${station.id}|${target.w}|${next()}`,
  };
}

/** جولةُ «أين أضعه؟» — تُسحَب التفاحةُ إلى موضعها من الصندوق (س٢-٢). */
function putRound(station, rnd, { word = null } = {}) {
  const pool = station.words.filter((w) => hasZone(w.w));
  const target = word && hasZone(word.w) ? word : pick(pool, rnd);
  const thing = station.props[0];
  const holder = station.props[1];
  if (!target || !thing || !holder) return null;
  const skill = skillOf(station, target.w, station.kind);
  if (!skill) return null;
  const order = orderOf(station, target);
  const next = seeder(rnd);
  // **والمواضعُ كلُّها معروضةٌ في كل جولة**: الاختيارُ بين أربعةٍ ثابتة يجعل الفرقَ
  // **مكانياً** لا عددياً — ولو نقصت المواضعُ في جولةٍ لَصار الجوابُ بالاستبعاد.
  const zones = pool.map((w) => ({ kind: 'zone', word: w.w }));
  return {
    kind: station.kind,
    shape: 'put',
    unit: skill.unit,
    range: skill.range,
    ask: ASK.put,
    order,
    target: target.w,
    thing: specOf(thing),
    holder: specOf(holder),
    zones,
    figures: [specOf(thing), specOf(holder), ...zones],
    fields: [...new Set([thing, holder, ...pool].map((w) => w.field))],
    said: saidWords(order),
    sig: `${station.id}|${target.w}|${next()}`,
  };
}

/**
 * جولةُ «أمرٍ من شيئين» — كراتٌ تختلف حجماً ولوناً، والأمرُ يجمع الصفتين (س٢-٤).
 *
 * **والمشتّتان يفترقان في صفةٍ واحدةٍ كلٌّ**: واحدةٌ توافق اللونَ وتخالف الحجم،
 * وأخرى توافق الحجمَ وتخالف اللون — فلا يُصاب الجوابُ بصفةٍ واحدة، وهو معنى «الأمرِ
 * المركّب» (`METHOD.md §٤`). ولو كان المشتّتان يخالفان في الصفتين لَكفت واحدةٌ.
 */
function twoRound(station, rnd, { size = null, colour = null } = {}) {
  const sizes = sizesOf(station);
  const target = {
    size: size || pick(sizes, rnd),
    colour: colour || pick(station.colours, rnd),
  };
  if (!target.size || !target.colour) return null;
  const otherSize = sizes.find((w) => w.w !== target.size.w);
  const otherColour = pick(station.colours.filter((c) => c.w !== target.colour.w), rnd);
  if (!otherSize || !otherColour) return null;
  const skills = [
    skillOf(station, target.size.w, station.kind),
    skillOf(station, target.colour.w, station.kind),
  ].filter(Boolean);
  if (skills.length !== 2) return null;
  const ball = (s, c) => ({
    kind: 'ball', word: 'ball', size: s.w, colour: c.swatch, name: ballPhrase(s.w, c.w),
  });
  const options = shuffle([
    ball(target.size, target.colour),
    ball(otherSize, target.colour),
    ball(target.size, otherColour),
  ], rnd);
  const order = fill(station.order, { size: target.size.w, colour: target.colour.w });
  const next = seeder(rnd);
  return {
    kind: station.kind,
    shape: 'two',
    // **مفتاحان لا مفتاح** (الحكمُ الرابع في رأس الملفّ): الصفتان تُقاسان معاً
    skills,
    unit: skills[0].unit,
    range: skills[0].range,
    ask: ASK.pick,
    order,
    target: ballPhrase(target.size.w, target.colour.w),
    options,
    figures: options,
    fields: [target.size.field, target.colour.field, ...station.props.map((p) => p.field)],
    said: saidWords(order),
    sig: `${station.id}|${target.size.w}-${target.colour.w}|${next()}`,
  };
}

/**
 * بانِي جولةٍ بحسب **ما تعلنه المحطة** — لا بمعرّفها ولا بما يقدر عليه الرسّام.
 *
 * **والفرقُ ليس دقّةً في اللفظ** (عيبٌ أمسكه حارسُ «لكلِّ مفتاحٍ مادّة»): كان الشرطُ
 * «إن كانت كلماتُها **كلُّها** لها أوضاعٌ مرسومة»، فكلمةٌ واحدة بلا وضعٍ تُسقِط
 * المحطةَ كلَّها إلى شاشة الصور — فتُرسَم أوضاعٌ فارغة ولا يشتكي أحد. والصوابُ أن
 * يُقرأ **نمطُ التصوير المعلَن في البيانات** (`pictured: 'act'`): محطةُ أفعالٍ تبقى
 * محطةَ أفعال، وكلمةٌ بلا وضعٍ **تسقط وحدَها** فيُمسكها حارسُ المفاتيح بلا مادّة.
 */
function roundFor(station, rnd, opts = {}) {
  if (station.kind === 'tpr-put') return putRound(station, rnd, opts);
  if (station.kind === 'tpr-two') return twoRound(station, rnd, opts);
  if (station.words.some((w) => w.pictured === 'act')) return actRound(station, rnd, opts);
  return pickRound(station, rnd, opts);
}

/** **خطةُ المحطة**: نمذجةٌ ثم جولتان بعونٍ ثم خمسٌ «وحدك» — من بذرةٍ واحدة. */
export function buildStation(stationId, seed) {
  const station = stationById(stationId);
  if (!station || !TYPES.has(station.type)) return null;
  const rnd = seeded(seed >>> 0);

  let bag = [];
  const nextWord = () => {
    if (!bag.length) bag = shuffle(station.words, rnd);
    return bag.pop();
  };

  // **النمذجةُ أمرٌ يُقال ويُفعَل**: المعلمُ يُري الفعلَ نفسَه — الصورةَ التي تُلمَس،
  // أو التفاحةَ وقد صارت في الصندوق، أو الشخصيةَ وهي تفعل.
  const shown = Array.from({ length: MODEL_ITEMS }, () => roundFor(station, rnd))
    .filter(Boolean);
  const model = {
    title: 'المعلّمُ يأمر ويفعل، وأنت تنظر',
    hint: ASK.model,
    items: shown.map((round) => ({
      en: round.order,
      el: () => modelEl(round),
    })),
    figures: shown.flatMap((round) => round.figures),
    fields: [...new Set(shown.flatMap((round) => round.fields))],
    said: [...new Set(shown.flatMap((round) => round.said))],
  };

  return {
    model,
    guided: Array.from({ length: GUIDED }, () =>
      roundFor(station, rnd, { options: GUIDED_OPTIONS, word: nextWord() })).filter(Boolean),
    solo: Array.from({ length: SOLO }, () =>
      roundFor(station, rnd, { options: SOLO_OPTIONS, word: nextWord() })).filter(Boolean),
  };
}

/** جردُ الجولات للحارس — النمذجةُ والعونُ و«وحدك» كلُّها. */
export function probeRounds(stationId, seed) {
  const plan = buildStation(stationId, seed);
  if (!plan) return [];
  return [plan.model, ...plan.guided, ...plan.solo].map(usedOf);
}

// ————— تسجيلُ المحاولة —————

const score = (round, correct, recordAttempt = progress.recordAttempt) => {
  if (round.shape === 'two') {
    // **مفتاحان في محاولةٍ واحدة**: الحجمُ واللونُ فُهما معاً أو لم يُفهما
    for (const s of round.skills) recordAttempt(s.unit, s.range, 'tpr-two', correct);
    return;
  }
  if (round.kind === 'tpr-put') {
    recordAttempt(round.unit, round.range, 'tpr-put', correct);
    return;
  }
  recordAttempt(round.unit, round.range, 'tpr-do', correct);
};

// ————— الشاشات —————

/** زرُّ إعادة سماع الأمر — **أذنٌ لا كلمة** (قاعدةُ اللاقراءة بلغتين). */
const hearBtn = (order) => h('button', {
  class: 'btn btn--hear',
  'aria-label': 'اسمع الأمر مرّةً أخرى',
  onclick: () => sayEn(order),
}, icon('ear'));

/** يُقال الأمرُ: توجيهٌ عربيّ يُنتظَر تمامُه ثم الأمرُ الإنكليزيّ — قناةٌ واحدة. */
function speakOrder(round, hooks) {
  (async () => {
    await say(round.ask);
    if (hooks.alive()) await sayEn(round.order);
  })();
}

/** بطاقةُ اختيار: شكلٌ يُلمَس، واسمُه في `data-word` لا في نصٍّ يُقرأ. */
function cardOf(spec, onPick) {
  const btn = h('button', { class: 'qcard', 'aria-label': 'هَذِهِ' }, figureEl(spec));
  btn.addEventListener('click', () => onPick(btn));
  return btn;
}

/** س٢-١ وس٢-٣ وس٢-٤: أمرٌ يُسمَع وبطاقةٌ تُلمَس (والوضعُ يُفعَل عند الصواب). */
function pickView(round, hooks) {
  const stage = h('div', { class: 'q-stage q-stage--ask' });
  stage.dataset.ask = round.target;
  stage.append(hearBtn(round.order));

  const choices = h('div', { class: `q-choices q-choices--${round.shape}` });
  let locked = false;

  const nameOf = (el) => el.querySelector('.fig')?.dataset.word;
  // **والاسمُ المقيسُ اسمُ ما رُسِم**: الكرةُ توصف بحجمها ولونها معاً (`data-name`)،
  // وما سواها اسمُ كلمته — فالحكمُ على المرسوم لا على نيّة المولّد.
  const idOf = (el) => el.querySelector('.fig')?.dataset.name || nameOf(el);

  for (const spec of round.options) {
    choices.append(cardOf(spec, async (btn) => {
      if (locked) return;
      locked = true;
      const chosen = idOf(btn);
      const correct = chosen === round.target;
      hooks.attempt(round, correct);
      if (correct) {
        btn.classList.add('good');
        // **الشخصيةُ تنفّذ بلمسة الطفل** (`METHOD.md §٤`): الوضعُ يتحرّك حين يُختار
        if (round.shape === 'act') btn.classList.add('is-acting');
        pop(btn);
        await praiseThen(hooks, round.target,
          round.shape === 'act' ? ASK.doIt : undefined);
        return;
      }
      const targetEl = [...choices.children].find((el) => idOf(el) === round.target);
      await missedThen(hooks, { chosen, target: round.target, chosenEl: btn, targetEl });
    }));
  }

  speakOrder(round, hooks);
  return h('div', {}, h('p', { class: 'hint' }, round.ask), stage, choices);
}

/**
 * س٢-٢: **يُسحَب أو يُلمَس** — التفاحةُ تُسحَب إلى موضعها، أو يُلمَس الموضعُ فتنتقل
 * إليه. وطريقان لا واحد بعلّةٍ ميدانية: السحبُ هو الفعلُ الذي ينصّ عليه المنهج،
 * **واللمسُ يبلغه إصبعٌ صغير لا يثبت على السحب** — والفحصُ واحدٌ في الحالين.
 *
 * **والصدقُ في الصورة**: الموضعُ الذي اختاره الطفل يُرى فعلاً — التفاحةُ **داخل**
 * الصندوق أو **فوقه** أو **تحته** أو **خلفه** (يحجبها). فيصحّح المشهدُ نفسُه.
 */
function putView(round, hooks) {
  const stage = h('div', { class: 'q-stage q-stage--put' });
  stage.dataset.ask = round.target;
  stage.append(hearBtn(round.order));

  const thing = h('span', { class: 'q-thing' }, figureEl(round.thing));
  const tray = h('div', { class: 'q-tray' }, thing);
  const box = h('div', { class: 'q-box' }, h('span', { class: 'q-holder' }, figureEl(round.holder)));

  let locked = false;
  const zones = round.zones.map((zone) => {
    const el = h('button', {
      class: `q-zone q-zone--${zone.word}`,
      'aria-label': 'هُنَا',
    }, h('span', { class: 'fig fig--zone' }));
    el.querySelector('.fig').dataset.word = zone.word;
    el.dataset.word = zone.word;
    el.addEventListener('click', () => drop(zone.word, el));
    box.append(el);
    return el;
  });

  /** نقلُ التفاحة إلى موضعٍ — وهو **ما يراه الطفل** جواباً كان أو تصحيحاً. */
  function place(el) {
    thing.style.transform = '';
    el.append(thing);
    el.classList.add('q-zone--full');
  }

  async function drop(word, el) {
    if (locked) return;
    locked = true;
    place(el);
    const correct = word === round.target;
    hooks.attempt(round, correct);
    if (correct) {
      el.classList.add('good');
      pop(el);
      await praiseThen(hooks, round.target);
      return;
    }
    const targetEl = zones.find((z) => z.dataset.word === round.target);
    await missedThen(hooks, {
      chosen: word,
      target: round.target,
      chosenEl: el,
      targetEl,
      // **يُرى ما اختار ثم يُرى الصواب**: تنتقل التفاحةُ إلى موضعها الصحيح مع اسمه
      reveal: () => targetEl && place(targetEl),
    });
  }

  /** السحبُ بالمؤشّر — ويعمل باللمس والفأرة سواءً (Pointer Events). */
  thing.addEventListener('pointerdown', (event) => {
    if (locked) return;
    const start = { x: event.clientX, y: event.clientY };
    thing.setPointerCapture(event.pointerId);
    thing.classList.add('is-dragging');
    const move = (e) => {
      thing.style.transform =
        `translate(${e.clientX - start.x}px, ${e.clientY - start.y}px)`;
    };
    const up = (e) => {
      thing.removeEventListener('pointermove', move);
      thing.removeEventListener('pointerup', up);
      thing.removeEventListener('pointercancel', up);
      thing.classList.remove('is-dragging');
      thing.style.transform = '';
      const under = document.elementFromPoint(e.clientX, e.clientY)?.closest('.q-zone');
      if (under) drop(under.dataset.word, under);
    };
    thing.addEventListener('pointermove', move);
    thing.addEventListener('pointerup', up);
    thing.addEventListener('pointercancel', up);
  });

  speakOrder(round, hooks);
  return h('div', {}, h('p', { class: 'hint' }, round.ask), stage, tray, box);
}

const viewOf = (round, hooks) =>
  (round.shape === 'put' ? putView(round, hooks) : pickView(round, hooks));

/** مشهدُ النمذجة: الجولةُ نفسُها مرسومةً بلا سؤال — عرضٌ يُشاهَد لا فعلٌ يُطلَب. */
function modelEl(round) {
  if (round.shape === 'put') {
    const box = h('div', { class: 'q-box q-box--model' },
      h('span', { class: 'q-holder' }, figureEl(round.holder)));
    const zone = h('span', { class: `q-zone q-zone--${round.target} q-zone--full` },
      h('span', { class: 'q-thing' }, figureEl(round.thing)));
    zone.dataset.word = round.target;
    box.append(zone);
    return box;
  }
  const spec = round.options.find((o) => (o.name || o.word) === round.target)
    || round.options[0];
  return h('div', { class: 'q-shown-one' + (round.shape === 'act' ? ' is-acting' : '') },
    figureEl(spec));
}

// ————— التسجيل في الموجِّه وفي المراجعة —————

registerScreen('tpr', (part) => {
  const station = stationById(`tpr:${part}`);
  if (!station || !buildStation(station.id, 1)) return null;
  return stationScreen({
    nodeId: station.id,
    title: station.title,
    accent: LISTEN_ACCENT,
    make: () => buildStation(station.id, (Date.now() >>> 0) ^ 0x9e3779b9),
    view: viewOf,
    score,
    save: (stars) => progress.setStars(station.id, stars),
  });
});

/** جولةٌ لمهارةٍ مستحقّة — ولكلِّ نوعِ أمرٍ بانيه (`review.js` والبوابات). */
const single = (kind) => (skill, rnd) => {
  const station = stationForSkill(skill);
  if (!station || !TYPES.has(station.type) || station.kind !== kind) return null;
  const word = station.words.find((w) => w.w === skill.range);
  if (kind === 'tpr-two') {
    const colours = new Set(station.colours.map((c) => c.w));
    return twoRound(station, rnd, colours.has(skill.range)
      ? { colour: word } : { size: word });
  }
  return roundFor(station, rnd, { word });
};

registerExercise('tpr-do', { build: single('tpr-do'), view: viewOf, score });
registerExercise('tpr-put', { build: single('tpr-put'), view: viewOf, score });
registerExercise('tpr-two', { build: single('tpr-two'), view: viewOf, score });
