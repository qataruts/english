// محرّك جلسة المراجعة — **هيكلُه لا تمارينُه** (`FAMILY.md §٥`).
//
// ————— بذرةُ المنصة (`docs/SEED.md §٢`) —————
//
// في «اِقْرَأْ» كان هذا الملفّ شيئين مختلطين: **محرّكَ جلسةٍ** محايداً (نقاطُ التقدّم،
// تسلسلُ التمارين، تسجيلُ المحاولة، شاشةُ الختام، الإعادةُ ببناءٍ جديد) و**ثمانيةَ
// تمارينَ** تعرف الحرفَ والحركةَ والمقطع. فبقي الأول وحدَه، وصار الثاني **يُحقَن**
// (`setBuilders`) — وهو شكلُه الذي استقرّ عند «اِحْسِبْ» ومنه نُقل.
//
// وثلاثةُ قيودٍ تحكم هذا الملفّ، منقولةٌ بعلّتها لا بنصّها:
// ١) **لا محتوى جديداً**: المراجعة لا تعرض إلا تمارين المحطات القائمة، فكلُّ نصّ
//    تنطقه له ملفٌّ مولَّد أو مكانٌ في `tools/audio_queue.json` — لا نصَّ يُؤلَّف
//    من أجل المراجعة (وهذا ما يجعل الجلسة الصوتية مستقلّةً عن جلسات التطوير).
// ٢) **المفكوكيةُ وقيدُ الاقتران بالبناء**: مادّةُ الجلسة من حصيلة الطفل فعلاً، ولا
//    يدخلها نصُّ قراءةٍ فوق درجته (`check_range`) ولا كلمةُ قراءةٍ لم يتقنها سمعاً
//    (`check_coupling` — `METHOD.md §٦`). **والمراجعةُ أخطرُ موضعٍ لهذا القيد**:
//    هي الموضعُ الوحيد الذي يخلط الجبهتين، فمن ولّد فيها تمرينَ قراءةٍ بلا تحقّقٍ
//    نقض القيدَ من حيث لا يُنظَر إليه.
// ٣) **لا مهارةَ تُقاس بلا تمرينٍ يراجعها**: كلُّ مفتاحٍ يدخل ليتنر يجب أن يكون له
//    بانٍ في `itemFor` — وإلا بقيت المهارةُ في الصندوق الأول أبداً فكذبت لوحةُ
//    الوالد. يفرضه `test_measure.mjs` حيّاً (يطلب جلسةً لكل نوعٍ مستحقّ).

import * as progress from './progress.js';
import * as audio from './audio.js';
import {
  h, icon, toast, go, arNum, arCount, starsRow, topbar, mascot, cheer, shuffle, onScreen, DEV,
  PAUSE_ACCENT,
} from './ui.js';

export const SESSION_SIZE = 6;    // جلسة قصيرة تُنجَز في دقائق (`METHOD.md §٧`)
const ACCENT = PAUSE_ACCENT;      // المراجعة تثبيتُ مهارات — لونها لون البوابات

/**
 * نجوم الجلسة: ٣ بلا خطأ، ٢ ما دامت الأخطاء ≤ عدد التمارين، وإلا ١.
 * وهي قاعدةُ اقرأ المعتمدة: **العتبات تتناسب مع طول النشاط** — «زلّة لكل جولتين»
 * لا عدداً مطلقاً يظلم الطويلَ ويسامح القصير.
 */
export const starsForReview = (errors, items) => (errors === 0 ? 3 : errors <= items ? 2 : 1);

// ————— بناء الجلسة: الأضعف أولاً ثم تنويعٌ من الحصيلة —————

/**
 * جلسة اليوم: المستحقّ من سجلّ المهارات أولاً (الأضعف أولاً)، ثم — إن لم يكتمل
 * العدد — تمارين من حصيلة الطفل تنويعاً.
 *
 * **ومادّتُها من الجبهتين معاً** (`METHOD.md §٧`: «والمراجعةُ اليومية تسحب من
 * الجبهتين معاً»): `dueSkills` لا تفرز سمعاً من حرف، فيلقى الطفلُ في الجلسة الواحدة
 * كلمةً يسمعها ورمزاً يفكّه — وذاك عينُ ما يشدّ المسارين المقترنين.
 *
 * **دالّة خالصة**: كل ما تحتاجه يُحقَن، فتُختبر في node بلا متصفّح. وهذا هو موضعُ
 * الفصل بين الهيكل والمادّة:
 *
 * @param {object[]} due       مهاراتٌ مستحقّة بالأضعف أولاً (`dueSkills`/`weakestSkills`)
 * @param {Function} itemFor   `(skill, rnd) => item|null` — بناءُ تمرينٍ لمهارة (الجلسات ٢+)
 * @param {Function[]} fillers دوالُّ تنويعٍ `() => item|null` من حصيلة الطفل
 * @param {object} longs       سقفُ التمارين الطويلة لكل نوع: `{kind: max}`
 * @param {number} size        عدد التمارين
 * @param {Function} rnd       مولّدٌ حتميّ ببذرة
 */
export function buildSession({
  due = [], itemFor = () => null, fillers = [], longs = {},
  size = SESSION_SIZE, rnd = Math.random,
} = {}) {
  const items = [];
  const seen = new Set();
  const used = {};

  const add = (item) => {
    if (!item || seen.has(item.id)) return false;
    if (item.kind in longs) {
      used[item.kind] = used[item.kind] || 0;
      if (used[item.kind] >= longs[item.kind]) return false;
      used[item.kind]++;
    }
    seen.add(item.id);
    items.push(item);
    return true;
  };

  for (const skill of due) {
    if (items.length >= size) break;
    add(itemFor(skill, rnd));
  }

  // **يُخلَط الحوضُ كلُّه لا كلُّ صنفٍ على حدة** (درسُ اقرأ): قائمةٌ مرتَّبةً بالأصناف
  // يبتلع صدرُها الجلسةَ كلَّها، فلا يُرى صنفٌ قليلُ العدد في التنويع أبداً — وهو عينُ
  // ما جعل الرتابةَ مرفوعاً في المراجعة الخارجية.
  const mixed = shuffle(fillers, rnd);
  for (let i = 0; items.length < size && i < mixed.length * 2; i++) {
    add(mixed[i % mixed.length]());
  }

  return items.slice(0, size);
}

// ————— محرّك الجلسة —————
//
// شاشتان تركبانه: «مراجعة اليوم» و**البوابات الثلاث** (`METHOD.md §٤–§٥`). وما
// يفترقان فيه **مادّةُ الجلسة وحكمُ ختامها** لا ميكانيكيةُ التمارين — فبقي المحرّك
// واحداً لا يُنسَخ: نسختان منه تفترقان يوماً في تسجيل الخطأ أو في تلقين الجواب.
//
// و`api` الممرَّرة إلى المُصيِّر عقدُه مع المحرّك:
//   `score(unit, range, kind, correct)` — تسجيلُ محاولةٍ في ليتنر وفي عدّاد الجلسة
//   `wrong(el, replay)` — معالجةُ الخطأ الموحَّدة (هزّةٌ ثم إعادةُ عرض)
//   `right(el)` — أثرُ الصواب ثم التمرين التالي
//   `next()` · `alive()` — «أما زالت هذه الشاشةُ حيّة؟»

/**
 * **ومُصيِّرُ التمرين افتراضُه المحقون** (إصلاحٌ مدفوعُ الثمن عند احسب): كانت
 * `renderSession` تطلبه من مُناديها، فمرّرته «مراجعةُ اليوم» **ونسيته البوابة** —
 * فكانت البوابةُ ترتمي `TypeError` أوّلَ ما تجد في يد الطفل مهارةً تُسأل عنها، ويبقى
 * على شاشته ما كان. ولم يظهر ذلك قطّ لأنّ البوابةَ لا تُرسَم إلا بجلسةٍ غيرِ فارغة.
 * فصار الافتراضُ **المُصيِّرَ المحقون نفسَه** (`viewFor`): مَن أراد غيرَه مرّره، ومَن
 * سكت أصاب — ولا يبقى بابٌ يُنسى.
 */
export function renderSession({
  make, view = (item, api) => viewFor(item, api), verdict,
  pill, accent = ACCENT, leaveAsk, header = null,
}) {
  let items = make();
  if (!items.length) return null;   // لا حصيلة بعدُ: `main.js` يعيده إلى الخريطة

  const state = { index: 0, errors: 0, right: 0, done: false, token: 0 };
  let tries = 1;                     // محاولةُ الجلسة — تُعلَن في DOM (انظر `again`)

  const dots = h('ol', { class: 'dots' });
  const body = h('div', { class: 'station-body' });
  /** جذرُ الشاشة — وبه تحيا تمارينُها وتموت (`onScreen` في `ui.js`). */
  let root = null;
  const live = () => onScreen(root);

  function paintDots() {
    dots.replaceChildren(...items.map((item, i) => h('li', {
      class: `dot${!state.done && i === state.index ? ' dot--now' : ''}`
        + `${state.done || i < state.index ? ' dot--done' : ''}`,
      'aria-label': `تمرين ${arNum(i + 1)}`,
    }, i < state.index || state.done ? '✓' : arNum(i + 1))));
  }

  /**
   * الانتقالُ إلى التمرين التالي — **ولا ينتقل من غادر** (الإصلاح الثالث · `ui.js`):
   * يُنادى بعد مهلةٍ (`right`)، فلو وقع الانتقالُ وقد غادر الطفلُ إلى الخريطة لَرسم
   * جولةً جديدة **ونطق سؤالَها فوقها** — بلسانين اثنين في تطبيقنا هذا.
   */
  function next() {
    if (!live()) return;
    if (state.index < items.length - 1) {
      state.index++;
      paint();
    } else {
      finish();
    }
  }

  /**
   * **معالجة الخطأ** (`METHOD.md §٤`، عهدُ «لا شاشة خطأ»): «يُسمَع/يُرى ما اختار
   * مقابلَ الصواب ثم يمضي — لا مؤقّت ولا شاشةَ خطأ». فالخيار الخاطئ لا ينقل: هزّةٌ
   * وتلوينٌ ثم **يُعاد العرضُ** بلا عقاب، **وما يُعاد عرضُه يملكه التمرين** (هو الذي
   * يعرف أيّ صوتٍ يقابل أيّ صورة، وبأيّ لسانٍ يُنطَق).
   */
  function wrong(el, replay) {
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth;                  // إعادة تشغيل الحركة
    el.classList.add('shake', 'bad');
    setTimeout(() => el.classList.remove('bad'), 700);
    // **وإعادةُ العرض لا تقع بعد المغادرة**: يُعاد العرضُ بصوته، فلو وقع بعدها
    // تكلّم على الخريطة.
    if (replay) setTimeout(() => { if (live()) replay(); }, 450);
  }

  /** صواب: أثرٌ بصريّ ثم التمرين التالي بعد فاصلٍ يُرى. */
  function right(el) {
    if (el) {
      el.classList.add('good');
      el.classList.remove('pop');
      void el.offsetWidth;
      el.classList.add('pop');
    }
    setTimeout(next, 750);
  }

  /**
   * تسجيل محاولة. **المفتاحُ مفتاحُ المهارة المطلوبة لا ما لمس الطفل** — فمن أخطأ في
   * «أيُّ الصور هي `cat`؟» يُسجَّل خطؤه على `word|cat|listen-pick` لا على ما نقره.
   */
  const score = (unit, range, kind, correct) => {
    progress.recordAttempt(unit, range, kind, correct);
    if (correct) state.right++;
    else state.errors++;
  };

  const api = {
    score,
    wrong,
    right,
    next,
    alive: live,
  };

  function paint() {
    audio.stop();
    state.token++;
    paintDots();
    const item = items[state.index];
    const token = state.token;
    // **وحياةُ التمرين شرطان**: أن يكون هو الجاري، **وأن تكون شاشتُه على الصفحة** —
    // فحلقةُ نطقٍ في تمرينٍ غادره الطفل تموت بمغادرته لا بمهلتها.
    body.replaceChildren(view(item, {
      ...api,
      fresh: () => live() && token === state.token,
    }));
  }

  /**
   * إعادة المحاولة: تمارين تُبنى من جديد (لا نمط يُحفظ فيُستظهَر) وحالةٌ نظيفة.
   *
   * **ورقمُ المحاولة مُعلَنٌ في DOM** (`data-tries` — سِمةٌ لا يراها طفل، نظيرُ
   * `data-ask`): «لا رسوب، وإعادةٌ تبني تمارينَها من جديد» عهدُ البوابات
   * (`METHOD.md §٤`)، ولا يُصدَّق بلا أن يُرى — فبها يقيس الفاحصُ **أنّ الإعادة
   * بَنَت** لا أنّ الشاشة أُعيد رسمُها بما كان.
   */
  function again() {
    const built = make();
    if (!built.length) return void go('#/');
    items = built;
    tries++;
    if (root) root.dataset.tries = String(tries);
    Object.assign(state, { index: 0, errors: 0, right: 0, done: false });
    paint();
  }

  function finish() {
    audio.stop();
    state.done = true;
    state.token++;
    paintDots();
    body.replaceChildren(verdict({ right: state.right, errors: state.errors, items, again }));
  }

  paint();

  root = h('div', {
    class: 'screen station-screen', 'data-tries': String(tries), css: { '--accent': accent },
  },
    topbar(
      h('button', {
        class: 'btn',
        onclick: () => { if (state.done || state.index === 0 || confirm(leaveAsk)) go('#/'); },
      }, icon('map'), ' الخريطة'),
      h('span', { class: 'spacer' }),
      h('span', { class: 'pill' }, pill),
    ),
    h('main', { class: 'screen-card' },
      header,
      dots,
      body,
      DEV && h('div', { class: 'dev' },
        h('div', { class: 'dev-title' }, 'أدوات التجربة (?dev=1)'),
        h('div', { class: 'dev-row' },
          h('span', {}, `التمارين: ${items.map((i) => i.kind).join('، ')}`),
          h('button', { class: 'btn', onclick: () => toast(`أخطاء: ${arNum(state.errors)}`) }, 'عدّ الأخطاء'),
          h('button', { class: 'btn', onclick: finish }, 'إنهاء الجلسة الآن'),
        )),
    ),
  );
  return root;
}

// ————— شاشة مراجعة اليوم —————
//
// **مادّتُها تدخل مع أول شاشة تمرين** (الجلسة ٢ في `SESSIONS.md`). واليومَ لا حصيلةَ
// ولا مهارةَ مقيسة، فتعود `null` — و`main.js` يردّ الطفلَ إلى الخريطة برسالةٍ لطيفة.
// وهذا **الغيابُ صريحٌ لا صامت**: بانياها (`itemFor` و`fillers`) معلَّقان هنا
// بأسمائهما، فمن يملأهما يعرف أين يضع يده.

/** بانِي تمرينٍ لمهارةٍ مستحقّة — تحقنه الجلسات ٢+ عبر `setBuilders`. */
let itemFor = () => null;
/** دوالُّ التنويع من حصيلة الطفل — تحقنها الجلسات ٢+. */
let fillersOf = () => [];
/** مُصيِّر التمرين الواحد — تحقنه الجلسات ٢+. */
let viewFor = () => h('p', { class: 'hint' }, 'لا تمرين بعد.');
/** سقفُ التمارين الطويلة لكل نوع. */
let longKinds = {};

/**
 * حقنُ مادّة المراجعة — تناديها وحدةُ التمارين مرّةً عند تحميلها.
 * وبها يبقى هذا الملفّ **هيكلاً**: لا يعرف تمريناً، ويعرف كيف تُدار الجلسة.
 */
export function setBuilders({ item, fillers, view, longs } = {}) {
  if (item) itemFor = item;
  if (fillers) fillersOf = fillers;
  if (view) viewFor = view;
  if (longs) longKinds = longs;
}

/** تمارينُ جلسةٍ من مهاراتٍ بعينها — تستعملها المراجعةُ والبوابات معاً. */
export function sessionItems(due, size = SESSION_SIZE, rnd = Math.random) {
  return buildSession({ due, itemFor, fillers: fillersOf(rnd), longs: longKinds, size, rnd });
}

export function renderReview() {
  const make = () => sessionItems(progress.dueSkills());

  return renderSession({
    make,
    pill: 'مراجعة اليوم',
    leaveAsk: 'تريد الخروج قبل إتمام المراجعة؟',
    verdict: ({ right, errors, items }) => {
      progress.markReview(right + errors, right);
      const stars = starsForReview(errors, items.length);
      const streak = progress.reviewStreak();
      const line = errors === 0
        ? cheer('مراجعة بلا خطأ واحد!')
        : `أصبتَ ${arNum(right)} من ${arNum(right + errors)} محاولة — وما أخطأتَ فيه يعود غداً.`;

      return h('div', { class: 'celebrate' },
        mascot('mascot mascot--cheer'),
        h('div', { class: 'celebrate-face' }, icon('repeat')),
        h('h2', {}, 'أتممتَ مراجعة اليوم!'),
        starsRow(stars, 'big-stars'),
        h('p', { class: 'hint' }, line),
        streak > 1 && h('p', { class: 'note' },
          icon('flame'),
          ` ${arCount(streak, ['يوم', 'يومان متتاليان', 'أيام متتالية', 'يوماً متتالياً'])} من المراجعة`),
        h('div', { class: 'row foot' },
          h('button', { class: 'btn btn--primary', onclick: () => go('#/') },
            icon('map'), ' الخريطة')),
      );
    },
  });
}
