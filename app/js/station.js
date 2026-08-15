// **حلقةُ المحطة** — الهيكلُ المشترك لشاشات التمارين (`METHOD.md §٤`).
//
// ————— أربعُ خطوات، وهي نصُّ المنهج حرفاً —————
//
// «حلقةُ كل محطة (٣–٥ دقائق): **شاهِد** (المعلم يعرض وينطق — نمذجةٌ صامتة من الطفل)
// ← **جرّب معي** ← **وحدك** (المقيس) ← احتفال. الخطأ: يُسمَع/يُرى ما اختار مقابلَ
// الصواب ثم **يمضي** — لا مؤقّت ولا شاشةَ خطأ».
//
// وهي نظيرةُ حلقة «اِحْسِبْ» بنيةً (`calc/app/js/station.js`) وتفارقها في موضعين
// لأنّ المادّة تفارقها:
//
//   ١) **قناتان لغويتان في كل جملة**: التوجيهُ عربيّ والمادّةُ إنكليزية
//      (`METHOD.md §٩·١`) — فلكلِّ قولٍ لسانُه: `say` للعربية و`sayEn` للإنكليزية،
//      ولا موضعَ في شاشةٍ ينطق مادّةً بلا لسانها.
//   ٢) **الخطأ يمضي ولا يُعيد**: عند «اِحْسِبْ» تُعَدّ الكميةُ ثم **يحاول ثانية**،
//      وهنا يُسمَع ما اختار مقابلَ الصواب **ثم تمضي الجولة**. والفرقُ من المادّة:
//      هناك الجوابُ محسوبٌ يُدرَك بالعدّ، وهنا مفردةٌ لم تثبت في الأذن بعد —
//      وإعادةُ المحاولة على كلمةٍ لا يعرفها تخمينٌ لا تعلّم. فالتصحيحُ **سماعُ
//      الصواب** ثم مضيّ، وليتنر يعيدها غداً.
//
// ————— وطقسُ المعلم المنطوق (حكمُ المدير، ١٣ أغسطس ٢٠٢٦) —————
//
// «التحياتُ طقسُ المعلم المنطوق لا محطةٌ مصوَّرة: يفتتح المعلمُ كلَّ جلسةٍ بتحيةٍ
// ويختمها بوداع — تُكتسَب سماعاً بالطقس كما يكتسب الطفلُ السلام، بلا سؤالٍ مصوَّرٍ
// يستحيل جوابُه». فموضعُه **هذا الملفّ**: أوّلُ ما يُسمَع في كل محطة `Hello!` وآخرُ
// ما يُسمَع `Bye bye!` — بلا صورةٍ ولا خيارٍ ولا مفتاحِ ليتنر (`RITUAL` في
// `curriculum.js`، و`RESOLVED` يقيّد من أين جاءت).
//
// ————— وحقنُ المراجعة يقع هنا مرّةً واحدة —————
//
// `review.js` هيكلٌ لا يعرف تمريناً، ومادّتُه تُحقَن بـ`setBuilders` **مرّةً**. فهذا
// الملفّ يحقن موزِّعاً يقرأ سجلَّ التمارين أدناه، وتسجّل كلُّ وحدةٍ تمارينَها فيه
// (`registerExercise`) — فوحدةُ الجلسة ٣ تدخل المراجعةَ بلا سطرٍ يُعدَّل هنا.

import * as progress from './progress.js';
import * as audio from './audio.js';
import { stations, RITUAL } from './curriculum.js';
import { setBuilders } from './review.js';
import {
  h, icon, go, topbar, starsRow, mascot, cheer, toast, shuffle, arNum, onScreen, DEV,
} from './ui.js';

// ————— إيقاعُ الشاشة (بالمللي) — ولا مؤقّتَ ضغطٍ في واحدٍ منها —————

/** فاصلٌ بين قولٍ وقول في النمذجة — قدرُ ما تلحق العينُ بالأذن. */
export const BEAT = 520;
/** مكثُ أثر الصواب قبل الجولة التالية. */
export const AFTER_RIGHT_MS = 700;
/** مكثُ أثر الخطأ بعد سماع الصواب — ثم يمضي بلا عقاب. */
export const AFTER_WRONG_MS = 900;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ————— القولان: توجيهٌ عربيّ ومادّةٌ إنكليزية —————

/**
 * **قولٌ يُنتظَر** — يقف النصُّ في قناة الصوت ويُرجِع وعدَه (يتمّ بتمام الكلام).
 * فمن أراد أن يتكلّم ويمضي ناداه ومضى، ومن أراد أن ينتقل انتظره.
 */
export const say = (text) => (text ? audio.play(text, 'ar') : Promise.resolve(false));

/**
 * **المادّةُ بلسانها** (`METHOD.md §٩·١`: «ولا تُنطَق الكلمةُ المدروسة معرَّبةً
 * أبداً») — وحتى الاحتياطُ الآليّ ينطقها إنكليزيةً، يفرضه `audio.play(text, lang)`.
 */
export const sayEn = (text) => (text ? audio.play(text, 'en') : Promise.resolve(false));

/**
 * **جملُ الحلقة نفسِها** — توجيهُها عربيٌّ كلُّه (مدخلٌ مفهوم ومرشِّحٌ وجدانيّ منخفض،
 * `METHOD.md §٢·٦`). وتعليماتُ كل تمرينٍ في وحدته لا هنا.
 */
export const SAY = {
  watch: 'انْظُرْ وَاسْمَعْ',
  withMe: 'الْآنَ جَرِّبْ مَعِي',
  alone: 'وَالْآنَ وَحْدَكْ',
  // **الترديدُ يُدعى ولا يُقاس** (`METHOD.md §١٢-٥`): تُقال الكلمةُ بعد الصواب
  // ويُدعى الطفلُ إليها — بلا تسجيلٍ ولا حكمِ نطقٍ آليّ.
  repeat: 'قُلْهَا مَعِي',
  // **ومعالجةُ الخطأ قولان لا لوم**: «لمستَ …» بما اختار، ثم «وهذه …» بالصواب
  chose: 'لَمَسْتَ',
  right: 'وَهَذِهِ',
  bravo: 'أَحْسَنْتْ',
  great: 'رَائِعْ',
};

/**
 * **كلُّ نصٍّ تنطقه هذه الوحدة** — إعلانٌ لا استنتاج، يجرده `tools/queue_texts.mjs`
 * فيطالب لكلٍّ بمكانٍ في `tools/audio_queue.json` بلغته. ونصٌّ يُنطَق ولا يُعلَن
 * هنا يسمعه الطفلُ بصوتٍ آليّ ولا يعرف أحدٌ أنّه فات.
 */
/**
 * **وفئةُ كل جملةٍ تُعلَن مع نصّها** — لأنّ الفئة تختار **مسحةَ الأداء** في المولّد:
 * إعلانُ خطوةٍ يُقال هادئاً، ودعوةٌ تُقال طلباً، وكلمةُ ختامٍ تُقال فرحاً. ومسحةٌ
 * خاطئة تُسمع في أذن طفل (`docs/AUDIO_QUEUE.md`).
 */
const SAY_CATEGORY = {
  watch: 'modeling', withMe: 'modeling', alone: 'modeling',
  repeat: 'instruction', chose: 'instruction', right: 'instruction',
  bravo: 'celebration', great: 'celebration',
};

export const SPOKEN = [
  ...Object.entries(SAY).map(([key, text]) =>
    ({ text, lang: 'ar', category: SAY_CATEGORY[key] })),
  // **وطقسُ المعلم مادّةٌ إنكليزية** لا تعليمة: تحيّةٌ تُكتسَب سماعاً (`RITUAL`)
  { text: RITUAL.open, lang: 'en', category: 'word' },
  { text: RITUAL.close, lang: 'en', category: 'word' },
];

// ————— المنهجُ يقول المدى: المحطةُ والمهارة —————

/** محطةٌ بمعرّفها — `curriculum.js` وحدَه يملك الرحلة. */
export const stationById = (id) => stations().find((s) => s.id === id) || null;

/** مفتاحُ ليتنر الذي تدرّسه هذه المحطة بهذه (الوحدة × المدى × نوع التمرين). */
export function skillOf(station, range, kind) {
  const key = (station.skills || []).find((k) => {
    const [, r, t] = k.split('|');
    return r === String(range) && t === kind;
  });
  if (!key) return null;
  const [unit] = key.split('|');
  return { unit, range: progress.spanOf(range), kind };
}

/**
 * المحطةُ التي تُبنى منها مادّةُ مهارةٍ في المراجعة: بمفتاحها التامّ أولاً، وإلّا
 * فأوّلُ محطةٍ تدرّس نوعَ التمرين نفسَه. والثانيةُ ليست تساهلاً: بها تجيب المراجعةُ
 * عن مهارةٍ سُجِّلت بمدىً لا محطةَ له اليوم بدل أن تصمت.
 */
export function stationForSkill(skill) {
  const all = stations();
  const exact = all.find((s) =>
    (s.skills || []).includes(`${skill.unit}|${skill.range}|${skill.kind}`));
  return exact || all.find((s) =>
    (s.skills || []).some((k) => k.split('|')[2] === skill.kind)) || null;
}

// ————— جردُ ما تستهلكه الجولة (البابان الرابع والخامس في `check_range.py`) —————

/**
 * **ما تعرضه جولةٌ واحدة، بالصنف** — يقابله الحارسُ بجبهة محطتها.
 *
 * والجردُ **من الأشكال التي ستُرسَم** (`figures`) ومن مادّة الأمر المنطوق (`saying`)،
 * لا من نيّة المولّد: فما يراه الطفلُ ويسمعه هو المحكومُ عليه.
 *
 * **والرسمُ الإنكليزيّ يُعلن صنفَه في وصفه** (`unit` — من الجلسة ٤): الشكلُ الواحد
 * (`kind: 'letter'`) قد يكون رمزاً يُلمَس أو كلمةً تُفكّ أو شائكةً محفوظة، وحكمُ
 * الحارس عليها ثلاثةٌ مختلفة — الرمزُ يُقابَل بالسلّم، والكلمةُ بالرصيد المصوَّر،
 * **والشائكةُ بميزانيتها** (فمقاطعُها خارج السلّم عمداً: الخرقُ المعلَن الوحيد
 * للمفكوكية — `METHOD.md §١٢-١`). فيُقرأ الصنفُ من الوصف الذي **سيُرسَم**، ولا يُصدَّق
 * إعلانٌ في الجولة يفارق ما رُسم.
 */
export const usedOf = (round) => {
  const letters = (round.figures || []).filter((f) => f.kind === 'letter');
  const drawn = (unit) => letters.filter((f) => f.unit === unit);
  return {
    words: [...new Set([
      ...(round.figures || []).filter((f) => f.kind !== 'letter').map((f) => f.word),
      ...drawn('word').map((f) => f.word),
      ...(round.saying || []),
    ])].filter(Boolean),
    fields: [...new Set((round.fields || []).filter(Boolean))],
  // **وكلماتُ الأمر المنطوق صنفٌ رابع**: `point to the cat` ليس فيها ما يُصوَّر إلا
  // `cat`، وسائرُها كلماتُ وظيفةٍ لا مدخلَ لها في الرصيد المصوَّر — **ولها مدخلٌ في
  // Starters**، وهو ما يفرضه `METHOD.md §٣` («ولا كلمةَ في تمرينٍ خارجه»). فتُجرَد
  // على القائمة الأصل لا على الرصيد المصوَّر، ويمسك الحارسُ أمراً بكلمةٍ من خارجها.
    said: [...new Set(round.said || [])],
    // **والصوتُ المعزول صنفٌ خامس**: `/s/` ليس كلمةً فلا يُقابَل بالرصيد، وليس رسماً
    // فلا يُقابَل بالسلّم — يُقابَل بجدول أصوات المنهج (`PHONEMES`)، فلا يُنطَق في
    // شاشةِ طفلٍ صوتٌ لا يعرفه المنهج (بابُ الأصوات في `check_range.py`).
    sounds: [...new Set(round.sounds || [])],
    // **ومقاطعُ ما رُسم صنفٌ سادس**: كلُّ مقطعٍ في رسمٍ غيرِ شائكةٍ يُقابَل بالسلّم —
    // فرمزٌ لم يُفتَح لا يقع تحت بصر الطفل ولو داخلَ كلمةٍ مفكوكةٍ سواه.
    gpcs: [...new Set([...drawn('gpc'), ...drawn('word')]
      .flatMap((f) => (f.parts || []).map((p) => p.id)))].filter(Boolean),
    tricky: [...new Set(drawn('tricky').map((f) => f.word))],
  };
};

/** بذرةٌ جديدة لكل جولة — من مولّدها نفسِه، فتُعاد الجلسةُ كما كانت. */
export const seeder = (rnd) => () => Math.floor(rnd() * 0xffffffff);

// ————— نجومُ المحطة —————

/**
 * ٣ بلا خطأ · ٢ بعتبةٍ **متناسبة مع طول النشاط** («زلّة لكل جولتين») · ١ سواها —
 * قاعدةُ العائلة نفسُها (`review.js` لجلسة المراجعة).
 */
export const starsForStation = (errors, rounds) =>
  (errors === 0 ? 3 : errors <= Math.ceil(rounds / 2) ? 2 : 1);

// ————— معالجةُ الصواب والخطأ: واحدةٌ لكل الشاشات —————

/**
 * **الصواب**: تُقال الكلمةُ بلسانها ويُدعى الطفلُ إلى ترديدها (بلا قياس)، ثم يمضي.
 * @param {object} api خطّافاتُ الجولة (`alive` · `done`)
 * @param {string} word مادّةُ الجولة الإنكليزية كما تُقال
 */
export async function praiseThen(api, word, invite = SAY.repeat) {
  await sayEn(word);
  if (!api.alive()) return;
  await say(invite);
  if (!api.alive()) return;
  await wait(AFTER_RIGHT_MS);
  if (api.alive()) api.done();
}

/**
 * **الخطأ** (`METHOD.md §٤` حرفاً): «يُسمَع/يُرى ما اختار مقابلَ الصواب ثم يمضي».
 *
 * فلا شاشةَ خطأ ولا مؤقّت ولا حَبْس: يهتزّ ما لمس ويُسمَع اسمُه، ثم يُضاء الصوابُ
 * ويُسمَع اسمُه، ثم تمضي الجولة. **والتقابلُ هو الدرس**: «لمستَ dog · وهذه cat».
 */
export async function missedThen(api, { chosen, target, chosenEl, targetEl, reveal }) {
  chosenEl?.classList.add('bad');
  if (chosenEl) {
    chosenEl.classList.remove('shake');
    void chosenEl.offsetWidth;
    chosenEl.classList.add('shake');
  }
  await say(SAY.chose);
  if (!api.alive()) return;
  await sayEn(chosen);
  if (!api.alive()) return;
  // **ويُرى الصوابُ حيث يقع**: مشهدُ «ضع التفاحة» يُري التفاحةَ في موضعها الصحيح
  // (`reveal`)، وسائرُ الشاشات يكفيها إضاءةُ البطاقة.
  reveal?.();
  targetEl?.classList.add('good');
  await say(SAY.right);
  if (!api.alive()) return;
  await sayEn(target);
  if (!api.alive()) return;
  await wait(AFTER_WRONG_MS);
  if (api.alive()) api.done();
}

// ————— شاشةُ المحطة —————

const PHASES = [
  { key: 'watch', name: 'شَاهِدْ' },
  { key: 'guided', name: 'جَرِّبْ مَعِي' },
  { key: 'solo', name: 'وَحْدَكْ' },
];

/**
 * @param {object} o
 * @param {string} o.nodeId معرّفُ العقدة — **الشاشةُ المالكةُ تكتب نجمتَه بمعرّفه هو**
 *   (يحرسه `test_nodes.mjs`)
 * @param {string} o.title عنوانُ المحطة من المنهج
 * @param {string} o.accent لونُ المرحلة
 * @param {() => object} o.make بناءُ خطة الجولات — **يُنادى في كل إعادة** فلا نمطَ
 *   يُحفَظ فيُستظهَر. يُرجِع `{ model, guided, solo }`.
 * @param {Function} o.view `(round, hooks) => Node` — مُصيِّرُ الجولة الواحدة
 * @param {Function} o.score `(round, correct) => void` — تسجيلُ محاولةٍ في ليتنر
 * @param {Function} o.save `(stars) => void` — كتابةُ نجمة العقدة
 */
export function stationScreen({ nodeId, title, accent, make, view, score, save }) {
  let plan = make();
  const state = { phase: 0, index: 0, errors: 0, done: false, token: 0 };
  /** جذرُ الشاشة — وبه تحيا حلقاتُها وتموت (`onScreen` في `ui.js`). */
  let root = null;
  const live = () => onScreen(root);

  const stepsBar = h('ol', { class: 'steps' });
  const beads = h('ol', { class: 'beads' });
  const body = h('div', { class: 'station-body' });

  const phases = PHASES.filter((p) => p.key === 'watch' || plan[p.key].length);
  const rounds = () => (phases[state.phase].key === 'watch' ? [] : plan[phases[state.phase].key]);

  function paintSteps() {
    stepsBar.replaceChildren(...phases.map((p, i) => h('li', {
      class: `step${!state.done && i === state.phase ? ' step--now' : ''}`
        + `${state.done || i < state.phase ? ' step--done' : ''}`,
    },
      h('span', { class: 'step-dot', 'aria-hidden': 'true' },
        state.done || i < state.phase ? '✓' : '●'),
      h('span', { class: 'step-name' }, p.name),
    )));
  }

  /** خرزاتُ الجولات — تمتلئ واحدةً واحدة، بلا رقمٍ على شاشة الطفل. */
  function paintBeads() {
    const list = rounds();
    beads.replaceChildren(...list.map((_, i) => h('li', {
      class: `bead${!state.done && i === state.index ? ' bead--now' : ''}`
        + `${state.done || i < state.index ? ' bead--done' : ''}`,
      'aria-label': i < state.index ? 'جولةٌ تمّت' : 'جولة',
    })));
    beads.hidden = list.length === 0;
  }

  const hooks = () => {
    const token = state.token;
    const measured = phases[state.phase].key === 'solo';
    /* **حياةُ الجولة شرطان**: أن تكون هي الجارية في شاشتها، **وأن تكون شاشتُها على
       الصفحة** — فحلقةُ نطقٍ في جولةٍ غادرها الطفل تموت بمغادرته لا بمهلتها
       (الإصلاحُ الثالث — `ui.js`). وهو أشدُّ لزوماً هنا: قناتُنا قناتان. */
    const alive = () => live() && token === state.token;
    return {
      measured,
      alive,
      /** محاولةٌ واحدة — **المقيسُ «وحدك» وحدَه** (`METHOD.md §٤`). */
      attempt: (round, correct) => {
        if (!measured) return;
        score(round, correct);
        if (!correct) state.errors++;
      },
      done: () => { if (alive()) advance(); },
    };
  };

  /**
   * @param {boolean} silence أيُفرَغ طابورُ الصوت قبل الرسم؟ نعم في كل انتقالٍ يقطعه
   *   الطفلُ بنقرته — **ولا** حين يكون الانتقالُ قد صفَّ جملتَه أولاً (إعلانُ الخطوة
   *   أدناه)، وإلّا أفرغ الرسمُ ما صفَّه المُعلِن قبله بسطر.
   */
  function paint(silence = true) {
    if (silence) audio.stop();
    state.token++;
    paintSteps();
    paintBeads();
    const phase = phases[state.phase];
    body.replaceChildren(phase.key === 'watch'
      ? watchStep(plan.model, hooks())
      : view(plan[phase.key][state.index], hooks()));
  }

  function advance() {
    const list = rounds();
    if (state.index < list.length - 1) {
      state.index++;
      paint();
      return;
    }
    if (state.phase < phases.length - 1) {
      state.phase++;
      state.index = 0;
      /* **إعلانُ الخطوة ثم سؤالُها، في قناةٍ واحدة**: يُسكَت ما مضى **مرّةً**، ثم
         يُصَفّ الإعلان، ثم يرسم `paint` بلا إسكاتٍ ثانٍ — فيقف سؤالُ الشاشة خلفه في
         الطابور (درسُ «الصوتين المتكرّرين» من ميدان احسب). */
      audio.stop();
      say(phases[state.phase].key === 'solo' ? SAY.alone : SAY.withMe);
      paint(false);
      return;
    }
    finish();
  }

  /**
   * **خطوةُ «شاهِدْ»**: المعلمُ يعرض وينطق — **نمذجةٌ بلا مطالبة** (`METHOD.md §٤`).
   * ولا زرَّ «تابع» قبل أن تنتهي النمذجة: الخطوةُ عرضٌ لا امتحان، ولا يُترك الطفلُ
   * معلَّقاً بعدها.
   *
   * **وأوّلُها تحيّةُ المعلم** (`RITUAL.open` — حكمُ المدير): كلمةٌ إنكليزية واحدة
   * تُسمَع في مطلع كل محطة، بلا صورةٍ ولا سؤال.
   *
   * ومحطةٌ لها نمذجةٌ خاصّة (مشهدُ «ضع التفاحةَ في الصندوق») تمرّر `model.view`
   * فترسم بنفسها — والهيكلُ يعطيها الخطّافات نفسَها.
   */
  function watchStep(model, api) {
    const stage = h('div', { class: 'q-stage q-stage--watch' });
    const foot = h('div', { class: 'row foot' });

    const run = async () => {
      foot.replaceChildren();
      stage.replaceChildren();
      await sayEn(RITUAL.open);
      if (!api.alive()) return;
      await say(model.hint || SAY.watch);
      if (!api.alive()) return;
      for (const item of model.items || []) {
        // **واحدٌ في الساحة لا موكب**: المعلمُ يعرض شيئاً ويسمّيه ثم يعرض الذي يليه —
        // فلا تزدحم الساحةُ ولا يقع بصرُ الطفل على مسمّىً وهو يسمع اسمَ غيره.
        const box = h('div', { class: 'q-shown' }, item.el());
        stage.replaceChildren(box);
        await wait(BEAT / 2);
        if (!api.alive()) return;
        // **الشكلُ يظهر ثم يُسمَع اسمُه**: فيقع الاسمُ على مسمّاه لا قبله ولا بعده
        await sayEn(item.en);
        if (!api.alive()) return;
        if (item.after) await item.after(box, api);
        if (!api.alive()) return;
        await wait(BEAT);
        if (!api.alive()) return;
      }
      foot.replaceChildren(
        h('button', { class: 'btn', onclick: run }, icon('repeat'), ' أَعِدْ'),
        h('button', { class: 'btn btn--primary next', onclick: api.done },
          icon('onward'), ' تَابِعْ'),
      );
    };
    run();

    return h('div', {}, mascot('mascot mascot--hello'),
      h('p', { class: 'hint' }, model.title || 'المعلّمُ يعرض ويقول، وأنت تسمع'),
      stage, foot);
  }

  function finish() {
    audio.stop();
    state.done = true;
    state.token++;
    paintSteps();
    paintBeads();

    const stars = starsForStation(state.errors, plan.solo.length);
    const before = progress.getStars(nodeId);
    save(stars);
    // **وختامُ الجلسة وداعُ المعلم** (`RITUAL.close`): يُقال بعد كلمة الاحتفال
    // العربية، فيكون آخرُ ما يُسمَع في المحطة إنكليزيةً كما كان أوّلُها.
    (async () => {
      await say(state.errors === 0 ? SAY.great : SAY.bravo);
      if (live()) await sayEn(RITUAL.close);
    })();

    const line = state.errors === 0 ? cheer('بلا خطأ واحد!')
      : state.errors <= Math.ceil(plan.solo.length / 2)
        ? 'أتممتَ المحطة — وزلّاتُك قليلة.'
        : 'أتممتَ المحطة، وبالإعادة تزيد نجومك.';

    body.replaceChildren(h('div', { class: 'celebrate' },
      mascot('mascot mascot--cheer'),
      h('div', { class: 'celebrate-face' }, icon('party')),
      h('h2', {}, 'أَحْسَنْت!'),
      starsRow(stars, 'big-stars'),
      h('p', { class: 'hint' }, line),
      before > stars && h('p', { class: 'hint' }, 'ونجومُك السابقة محفوظة.'),
      h('div', { class: 'row foot' },
        h('button', { class: 'btn btn--primary', onclick: () => go('#/') },
          icon('map'), ' الخريطة'),
        h('button', {
          class: 'btn',
          onclick: () => {
            plan = make();       // إعادةٌ تبني جولاتِها من جديد — لا نمطَ يُستظهَر
            Object.assign(state, { phase: 0, index: 0, errors: 0, done: false });
            paint();
          },
        }, icon('repeat'), ' أَعِدْ'),
      ),
    ));
  }

  paint();

  root = h('div', { class: 'screen station-screen', css: { '--accent': accent } },
    topbar(
      h('button', {
        class: 'btn',
        onclick: () => {
          if (state.done || (state.phase === 0 && state.index === 0)
            || confirm('تريد الخروج قبل إتمام المحطة؟')) go('#/');
        },
      }, icon('map'), ' الخريطة'),
      h('span', { class: 'spacer' }),
      h('span', { class: 'pill' }, title),
    ),
    h('main', { class: 'screen-card' },
      stepsBar,
      beads,
      body,
      DEV && h('div', { class: 'dev' },
        h('div', { class: 'dev-title' }, 'أدوات التجربة (?dev=1)'),
        h('div', { class: 'dev-row' },
          h('span', {}, `الجولات: ${plan.solo.map((r) => r.kind).join('، ')}`),
          h('button', { class: 'btn', onclick: () => toast(`أخطاء: ${arNum(state.errors)}`) },
            'عدّ الأخطاء'),
          h('button', { class: 'btn', onclick: finish }, 'إنهاء المحطة الآن'),
        )),
    ),
  );
  return root;
}

// ————— سِجلُّ التمارين وحقنُ المراجعة —————
//
// **موزِّعٌ واحد بدل حقنٍ متكرّر**: `setBuilders` تُحقَن مرّةً هنا، وكلُّ وحدةِ تمارين
// تسجّل أنواعَها في هذا السجلّ — فما دخل الرحلةَ دخل المراجعةَ والبواباتِ معه، ولا
// يفترق التمرينُ الذي يُدرَّس عن التمرين الذي يُراجَع.
//
// **والنوعُ قد يشترك فيه مالكان**: `tpr-do` تدرّسه محطتان بشاشتين مختلفتين (لمسُ
// المسمّى · وفعلُ الحركة)، فالسجلُّ نوعٌ ← **قائمةُ مالكين**، ويُسأل كلٌّ بدوره: مَن
// كانت محطةُ المهارة من أنواعه بناها ومَن سواه ردّ `null`. والجوابُ يحمل **مالكَه**
// (`by`) فيرسمه مُصيِّرُه هو لا مُصيِّرُ شريكه في الاسم.

const EXERCISES = new Map();   // نوعُ التمرين ← [{ build, view }]

/**
 * **سقفُ التمارين الطويلة في الجلسة الواحدة** — عقدٌ قائم في محرّك المراجعة
 * (`buildSession({ longs })`) لم يكن له مالكٌ حتى دخل أوّلُ تمرينٍ طويل.
 *
 * **وهو كائنٌ واحد يُحقَن مرّةً ويُملأ لاحقاً**: `setBuilders` تُنادى عند تحميل هذا
 * الملفّ — **قبل** أن تسجّل وحداتُ التمارين نفسَها — فلو مُرِّرت نسخةٌ لَبقيت فارغة
 * أبداً. فالمرجعُ واحد، وكلُّ تسجيلٍ يكتب فيه سقفَه.
 */
const LONGS = {};

/**
 * تسجيلُ نوع تمرينٍ في المراجعة.
 * @param {string} kind الحقلُ الثالث من مفتاح ليتنر (`METHOD.md §٧`)
 * @param {{build: Function, view: Function, score: Function, max?: number}} spec
 *   `build(skill, rnd)` يبني جولةً من محطة تلك المهارة **أو `null` إن لم تكن له**،
 *   و`view(round, hooks)` يرسمها، و`score(round, correct, record)` يكتب محاولتَها —
 *   **وهو من الوحدة المالكة**: جولةُ الأمر المركّب تكتب مفتاحين (صفةً وصفة) لا مفتاحاً.
 *   و`max` سقفُ هذا النوع في جلسة المراجعة الواحدة (لِما يطول على طفل).
 */
export function registerExercise(kind, spec) {
  EXERCISES.set(kind, [...(EXERCISES.get(kind) || []), spec]);
  if (spec.max) LONGS[kind] = Math.min(LONGS[kind] ?? spec.max, spec.max);
}

/** تمرينُ مهارةٍ مستحقّة — يقرؤه محرّكُ المراجعة والبوابات معاً. */
function itemFor(skill, rnd = Math.random) {
  for (const [by, spec] of (EXERCISES.get(skill.kind) || []).entries()) {
    const round = spec.build(skill, rnd);
    if (round) return { ...round, by, id: `${round.kind}|${round.sig}` };
  }
  return null;
}

/**
 * حوضُ التنويع: تمارينُ من **حصيلة الطفل** — محطاتٌ أتمّها فعلاً ومهاراتُها التي
 * تدرّسها. فلا يُسأل في المراجعة عمّا لم يبلغه.
 */
function fillersOf(rnd = Math.random) {
  const out = [];
  for (const station of stations()) {
    if (!progress.isDone(station.id)) continue;
    for (const key of station.skills || []) {
      const [unit, range, kind] = key.split('|');
      if (!EXERCISES.has(kind)) continue;
      out.push(() => itemFor({ unit, range: progress.spanOf(range), kind }, rnd));
    }
  }
  return shuffle(out, rnd);
}

/** مُصيِّرُ تمرين المراجعة — التمرينُ نفسُه الذي في المحطة، بعقد المحرّك. */
function viewFor(item, api) {
  const spec = (EXERCISES.get(item.kind) || [])[item.by ?? 0];
  if (!spec) return h('p', { class: 'hint' }, 'لا تمرين بعد.');
  return spec.view(item, {
    measured: true,
    alive: api.fresh,
    // **الخطأ يُسجَّل على المهارة المطلوبة لا على ما لمس** (`METHOD.md §٧`) —
    // ومَن بنى الجولةَ هو الذي يكتب مفاتيحها (`score` في تسجيله).
    attempt: (round, correct) => spec.score(round, correct, api.score),
    done: api.next,
  });
}

setBuilders({ item: itemFor, fillers: fillersOf, view: viewFor, longs: LONGS });
