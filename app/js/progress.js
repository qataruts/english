// تقدّم الطفل: نجوم كل عقدة + القفل التسلسلي + سجلّ المهارات ودقائق الاستعمال
// والنسخة الاحتياطية — محفوظ كله في localStorage. حساب واحد، وجهاز واحد، بلا سحابة.
//
// ————— بذرةُ المنصة (`docs/SEED.md §٢`) —————
//
// بنيةُ هذا الملفّ ومنطقُه من «اِقْرَأْ» حرفاً بحرف عبر «اِحْسِبْ» — الجبهةُ الكسولة،
// وصناديقُ ليتنر، والنسخةُ الاحتياطية، وصلابةُ التخزين، وقلبُ الاعتماد (الرحلةُ
// تُقرأ من `curriculum.js` ولا تُبنى هنا). والمبدَّلُ فيه شيئان:
//
// ١) **مفتاحُ المهارة صار (الوحدة × المدى × نوع التمرين)** — نصُّ `METHOD.md §٧`:
//    `word|cat|listen-pick` · `gpc|s|sound-pick` · `text|h05|read`. والآليةُ واحدة:
//    مفتاحٌ نصّيّ ثلاثيّ (كان عند احسب «مفهوم» وعند اقرأ «حرف × حركة»).
// ٢) **الجبهتان مستقلتان** (`METHOD.md §١`): مسارُ السمع ومسارُ الحرف يتقدّمان
//    ويتراجعان كلٌّ بقياسه في ليتنر — وهو **قائمٌ بالبناء** هنا: المفاتيحُ نصوصٌ
//    مستقلّة، ولا موضعَ يجمعها. أما **ترتيبُ العقد** فواحدٌ على الخريطة (قفلٌ
//    تسلسليّ)، والمسارُ يُعلَن في `curriculum.js` لا هنا.
//
// **وقيدُ الاقتران** (`METHOD.md §٦`) يُقرأ من هنا ولا يُنفَّذ هنا: `MASTERED_BOX`
// أدناه هو عتبتُه، ويفرضه `check_coupling` جرداً آلياً على كل تمرينٍ قابلِ التوليد.
// فلا تعرف هذه الوحدةُ كلمةً ولا رمزاً — وهذا شرطُ أن تبقى محايدةً للمادة.

import { sections, stations, pendingListenOf } from './curriculum.js';

// **مفتاحُ التخزين نائبٌ مؤقت كالاسم** (`docs/SEED.md §٤`): `english` وصفُ المشروع لا
// اسمَ المنتج، ويُبدَّل يومَ الهوية (ق٣) — **ولا تقدّمَ يُفقَد**، فلا طفلَ استعمل
// التطبيقَ بعدُ (بوابةُ العرض على طفل بعد الهوية، `PLAN.md §٩`).
const STORE_KEY = 'english.progress.v1';
export const VERSION = 1;
export const MAX_STARS = 3;

/** تباعد ليتنر بالأيام (`METHOD.md §٧`): الإصابة ترفع الصندوق، والخطأ يعيده صفراً. */
export const BOX_DAYS = [0, 1, 2, 4, 8, 16];
export const MAX_BOX = BOX_DAYS.length - 1;

/**
 * **صندوقُ الإتقان** — وهو **عتبةُ قيد الاقتران** (`METHOD.md §٦` نصّاً: «لا يدخل
 * تمرينَ قراءةٍ كلمةٌ لم تبلغ صندوقَ الإتقان (`MASTERED_BOX` = الصندوق ٣ فما فوق) في
 * مفتاحها السمعيّ»). فهو رقمُ منهجٍ لا رقمُ منصّة، ومصدرُه واحد: من أراده قرأه من هنا.
 */
export const MASTERED_BOX = 3;

const listeners = new Set();

// ————— ذاكرة البنية والجبهة —————
// بنية الرحلة ثابتة وقت التشغيل (بيانات منهج لا حالة طفل)، فتُبنى مرّة واحدة في
// الجلسة. وحدها «جبهة الفتح» تتحرّك بالنجوم، فتُبطَل مع كل حفظ لا مع كل قراءة.
let journeyCache = null;
let nodesCache = null;
let indexCache = null;      // معرّف العقدة ← موضعها في الرحلة (بحثٌ بزمن ثابت)
let frontierCache = null;   // موضع أول عقدة ناقصة — null = يحتاج حساباً

function blank() {
  return {
    v: VERSION,
    stars: {},        // معرّف عقدة ← نجوم
    skills: {},       // «وحدة|مدى|تمرين» ← {right, wrong, box, due, seen, since}
    days: {},         // «YYYY-MM-DD» ← ثوانٍ من الاستعمال الفعلي
    reviews: {},      // «YYYY-MM-DD» ← {tries, right, at}
    seconds: 0,
    startedAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/** ترقية حالة قديمة إلى النسخة الحالية دون فقد نجوم الطفل. */
function migrate(data) {
  if (!data || typeof data !== 'object' || typeof data.stars !== 'object') return null;
  if (data.v !== VERSION) return null;
  return { ...blank(), ...data, v: VERSION };
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return blank();
    return migrate(JSON.parse(raw)) || blank();
  } catch {
    return blank();   // تخزين معطّل أو ممتلئ: نكمل في الذاكرة بلا انهيار
  }
}

let state = load();

/* **وضعُ المعاينة** (بذرةُ اقرأ — أمر المالك، ١٣ أغسطس ٢٠٢٦): المعلّمُ الذي يفحص
   يحتاج أن يرى المحطات كلَّها، والطفلُ يحتاج ألّا يقفز إلى ما لم يبلغه — **والقفلُ
   التسلسليّ جوهرُ المنهج لا قيدٌ عليه** (وهنا أشدّ: قيدُ الاقتران نفسُه مبنيٌّ على
   ترتيبٍ لا يُقفَز).

   فبـ`?preview=1`: تُفتَح الرحلةُ كلُّها للتصفّح، **ولا يُكتب حرفٌ في تقدّم أحد** —
   `save()` يصير بلا أثرٍ على القرص (ويبقى إخطارُ الشاشات ليُرسَم ما يجري في الجلسة).

   **وهو غيرُ `?dev=1`**: ذاك يملأ التقدّمَ فعلاً (أدواتُ تطوير)، وهذا لا يمسّه. */
export const PREVIEW = typeof location !== 'undefined'
  && new URLSearchParams(location.search).get('preview') === '1';

function save() {
  frontierCache = null;   // النجوم وحدها تحرّك الجبهة، وكل تغيّر فيها يمرّ من هنا
  state.updatedAt = Date.now();
  if (!PREVIEW) {                       // معاينةٌ: تُرسَم الجلسةُ ولا يُمَسّ القرص
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch {
      console.warn('[progress] تعذّر الحفظ في localStorage');
    }
  }
  for (const fn of listeners) fn(state);
}

/** الاشتراك في تغيّر التقدّم (لإعادة رسم الخريطة). */
export function onChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ————— الرحلة وعقدها —————

/**
 * الرحلة كاملةً بأقسامها بالترتيب — **من `curriculum.js` وحدَه**.
 * فلا تعرف هذه الوحدة محطةً ولا بوابةً: مَن يملك البيانات يملك الترتيب.
 */
export function journey() {
  if (!journeyCache) journeyCache = sections();
  return journeyCache;
}

/** كل عقد الرحلة بالترتيب — عليها يقوم القفل التسلسلي وحساب النجوم. */
export function allNodes() {
  if (!nodesCache) nodesCache = journey().flatMap((section) => section.nodes || []);
  return nodesCache;
}

/** موضع العقدة في الرحلة أو ‑١ — من فهرسٍ مبنيّ مرّة، لا بمسح القائمة في كل نداء. */
function indexOf(id) {
  if (!indexCache) indexCache = new Map(allNodes().map((n, i) => [n.id, i]));
  const index = indexCache.get(id);
  return index === undefined ? -1 : index;
}

export function findNode(id) {
  const index = indexOf(id);
  return index < 0 ? null : allNodes()[index];
}

/** القسم الذي تسكنه هذه العقدة (لعنوانها على الخريطة وفي لوحة وليّ الأمر). */
export function sectionOf(id) {
  return journey().find((s) => (s.nodes || []).some((n) => n.id === id)) || null;
}

/** إبطالُ ذاكرة البنية — تستعمله الاختبارات حين تُبدّل بيانات المنهج تحتها. */
export function invalidateJourney() {
  journeyCache = nodesCache = indexCache = frontierCache = null;
}

// ————— النجوم —————

export function getStars(id) {
  return state.stars[id] || 0;
}

export function isDone(id) {
  return getStars(id) > 0;
}

/**
 * تسجيل نتيجة عقدة. لا يُنقص ما سبق: تكرار المحطة يرفع النجوم ولا يخفضها.
 * @returns {boolean} هل تحسّنت النتيجة؟
 */
export function setStars(id, stars) {
  const n = Math.max(0, Math.min(MAX_STARS, Math.round(stars)));
  if (n <= getStars(id)) return false;
  state.stars[id] = n;
  save();
  return true;
}

export function totalStars() {
  return allNodes().reduce((sum, n) => sum + getStars(n.id), 0);
}

export function maxTotalStars() {
  return allNodes().length * MAX_STARS;
}

/** نجوم قسمٍ وسقفُه ومنجَزُه — لبطاقة المحطة على الخريطة. */
export function sectionStars(section) {
  const nodes = section?.nodes || [];
  return {
    earned: nodes.reduce((sum, n) => sum + getStars(n.id), 0),
    max: nodes.length * MAX_STARS,
    doneNodes: nodes.filter((n) => isDone(n.id)).length,
    totalNodes: nodes.length,
  };
}

// ————— القفل التسلسلي —————
// قاعدة واحدة تحكم الرحلة كلها: العقدة تُفتح بإتمام كل ما قبلها في `allNodes()`.
//
// والحبلُ الواحد يختصر القاعدة في رقم: ما دام كل ما قبل العقدة يجب أن يكون منجَزاً،
// فيكفي موضعُ **أول عقدة ناقصة** — «جبهة الفتح». وبها صار القفل قراءةَ رقمٍ لكل
// عقدة بدل مسحِ كل سوابقها (درسُ بطء الخريطة على آيباد قديم في اقرأ).

/**
 * «جبهة الفتح»: موضع أول عقدة لم تُنجَز (وطولُ الرحلة إن أُتمّت كلها).
 * كل ما قبلها منجَزٌ بالضرورة، فالعقدة مفتوحة إن كان موضعها ≤ الجبهة — وهي عينُ
 * القاعدة الأصلية لا تقريبٌ لها. تُحسب كسولاً مرّةً وتُبطَل مع كل حفظ.
 */
export function unlockFrontier() {
  if (frontierCache === null) {
    const nodes = allNodes();
    let i = 0;
    while (i < nodes.length && isDone(nodes[i].id)) i++;
    frontierCache = i;
  }
  return frontierCache;
}

/** العقدة مفتوحة = كل ما سبقها في الرحلة مُنجَز (أي: موضعها ≤ الجبهة). */
export function isNodeUnlockedById(id) {
  const index = indexOf(id);
  if (index < 0) return false;
  // **المعاينةُ تفتح القفلَ ولا تدّعي إتماماً** (درسُ اقرأ): دفعُ الجبهة إلى آخر
  // الرحلة يقول للمقيّم «أتممتَ الرحلة كلها» — وهو خبرٌ كاذب. فالجبهةُ تبقى على
  // حقيقتها (ومنها «تابع من هنا» ونسبةُ الإنجاز)، والقفلُ وحدَه يُرفَع.
  if (PREVIEW) return true;
  return index <= unlockFrontier();
}

/** أول عقدة لم تُنجَز في الرحلة — «تابع من هنا». */
export function nextNode() {
  return allNodes()[unlockFrontier()] || null;   // خارج القائمة = اكتملت الرحلة
}

// ————— سجلّ المهارات والتكرار المتباعد (`METHOD.md §٧`) —————

/** رقم اليوم المحلي (لا UTC): وحدة الجدولة في التكرار المتباعد. */
export function dayNumber(date = new Date()) {
  return Math.floor((date.getTime() - date.getTimezoneOffset() * 60000) / 86400000);
}

/** مفتاح اليوم «YYYY-MM-DD» بالتقويم المحلي (لسجلّ الدقائق والمراجعات). */
export function dayKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * **مفتاح المهارة: الوحدة × المدى × نوع التمرين** (`METHOD.md §٧`).
 * مثل `word|cat|listen-pick` و`pair|p-b|pick` و`gpc|s|sound-pick` و`text|h05|read`
 * — والقائمةُ النهائية يملكها `curriculum.js` ويجردها `test_measure.mjs`.
 */
export function skillKey(unit, range, kind) {
  return `${unit}|${range ?? 'none'}|${kind}`;
}

/**
 * **المدى عدداً إن كان عدداً، ونصّاً إن لم يكن** — قاعدةٌ واحدة لمصدرٍ واحد.
 *
 * مدياتُنا نصّيةٌ في الغالب (`cat` · `p-b` · `h05`) وقد تكون عدديةً (أعدادُ س١-٦)،
 * وهي **تُكتب نصّاً في المفتاح** فتُقرأ نصّاً. وكانت لهذه القاعدة عند «احسب» موضعان
 * فافترقا: السجلُّ يردّ المدى نصّاً والمنهجُ يردّه عدداً، فمهارةٌ مدَاها «٧» ومحطتُها
 * تدرّس ٧ **فلا يتطابقان** — وأثرُه صمتٌ لا حمرة (مراجعةٌ تُبنى على غير ما ضعف فيه).
 * **فصار للقاعدة مصدرٌ واحد هنا** ويقرأه كلُّ من يقابل مفتاحاً بمنهج.
 */
export const spanOf = (text) =>
  (Number.isFinite(Number(text)) && text !== '' ? Number(text) : text);

export function parseSkillKey(key) {
  const [unit, range, kind] = String(key).split('|');
  return { unit, range: spanOf(range), kind };
}

export function getSkill(key) {
  return state.skills[key] || null;
}

/** كل المهارات المسجّلة: [{key, unit, range, kind, right, wrong, box, due, seen, since}] */
export function skills() {
  return Object.entries(state.skills).map(([key, s]) => ({ key, ...parseSkillKey(key), ...s }));
}

/**
 * **أبلغت هذه المهارةُ صندوقَ الإتقان؟** — سؤالُ **قيد الاقتران** (`METHOD.md §٦`)
 * في صورةٍ واحدة يقرؤها كلُّ من يريده: مولّدُ تمارين القراءة قبل أن يولّد، وفاحصُ
 * `check_coupling` حين يجرد، ولوحةُ الوالد حين تقول «يقرأ ما أتقن سمعَه».
 *
 * **ولا تعرف هذه الوحدةُ أيَّ مفتاحٍ سمعيّ يقابل أيَّ كلمة** — ذاك إعلانُ المنهج
 * (`curriculum.js`): مَن يملك الكلمة يعلن مفتاحَها، وهذه تجيب عن المفتاح وحده.
 */
export function isMastered(key) {
  return (state.skills[key]?.box ?? -1) >= MASTERED_BOX;
}

/**
 * تسجيل محاولة واحدة. الصحيحة ترفع صندوق ليتنر فيتباعد موعدها،
 * والخاطئة تعيده إلى الصفر فتعود المهارة في مراجعة اليوم نفسه (`METHOD.md §٧`).
 *
 * **والخطأ يُسجَّل على المهارة المطلوبة لا على ما لمس** — يفرضه المُنادي بتمرير
 * مفتاح الهدف، وهو عقدُ شاشات التمارين مع هذه الوحدة.
 * @returns {object|null} حالة المهارة بعد التسجيل
 */
export function recordAttempt(unit, range, kind, correct, today = dayNumber()) {
  if (!unit || !kind) return null;
  const key = skillKey(unit, range, kind);
  const s = state.skills[key]
    || { right: 0, wrong: 0, box: 0, due: today, seen: today, since: today };
  /* **و`since` أوّلُ يومٍ قِيست فيه هذه المهارة**: لوحةُ الوالد تقول «راجِع مختصاً»
     عند تعثّرٍ **أسابيع** (`METHOD.md §١٣`)، ومدّةُ التعثّر لا تُعرَف من الصندوق ولا
     من `seen` (وهو آخرُ يوم) — فتُقيَّد بدايتُها يومَ تبدأ. وسجلٌّ قديم بلا `since`
     يبدأ عدُّه من اليوم: لا نخترع له ماضياً لم نقِسه. */
  if (s.since === undefined) s.since = today;
  if (correct) {
    s.right++;
    s.box = Math.min(MAX_BOX, s.box + 1);
  } else {
    s.wrong++;
    s.box = 0;
  }
  s.due = today + BOX_DAYS[s.box];
  s.seen = today;
  state.skills[key] = s;
  save();
  return s;
}

/** ترتيب الضعف: أدنى صندوق، ثم أكثر أخطاءً، ثم أقدم استحقاقاً (وأخيراً المفتاح لثبات الترتيب). */
const byWeakness = (a, b) =>
  a.box - b.box || b.wrong - a.wrong || a.due - b.due || a.key.localeCompare(b.key);

/**
 * المستحقّ للمراجعة اليوم، الأضعف أولاً.
 * (المهارة التي لم تُلمس بعدُ ليست هنا — المراجعة تراجع ما مرّ به الطفل فعلاً.)
 *
 * **وتسحب من الجبهتين معاً** (`METHOD.md §٧`): لا فرزَ هنا بين سمعٍ وحرف — الأضعفُ
 * أضعفُ أيّاً كان مسارُه، وذاك عينُ ما يجعل المراجعةَ تشدّ المتزعزع من حيث تزعزع.
 */
export function dueSkills(today = dayNumber()) {
  return skills().filter((s) => s.due <= today).sort(byWeakness);
}

/**
 * كل المهارات المسجّلة بالأضعف أولاً **بلا نظر إلى موعد ليتنر** — مادّةُ البوابات
 * الثلاث (`METHOD.md §٤–§٥`): البوابة تسأل عن أضعف ما في يده لا عمّا حان موعده، فقد
 * يحين موعد القويّ وحده يوم البوابة فتمرّ بلا معنى.
 */
export function weakestSkills() {
  return skills().sort(byWeakness);
}

/**
 * ————— **المفاتيحُ التي فُتحت ولم تُقَس بعد — بابُ الدخول إلى ليتنر** —————
 *
 * **العلّةُ أمسكها حارسُ الوعد يومَ وُلد** (`tools/test_promise.mjs` — الجلسة ٧):
 * المفتاحُ لا يدخل هذا السجلَّ إلا يومَ يُسأل عنه، **وقيدُ الاقتران يمنع أن يُسأل
 * عن مفاتيح القراءة يومَ محطتها** (كلماتُها لم تنضج سمعاً بعد، `METHOD.md §٦`).
 * فكانت المحطةُ تمضي بنجومها، ثم تنضج كلماتُها بعد أيام — **ولا شيءَ يعيد الطفلَ
 * إليها**: فلا يُقاس `word|sat|build` ولا `word|cat|decode` في عمر الجهاز كلِّه، وهما
 * جوهرُ المهارة لا هامشُها. ولا يمسك ذلك حارسٌ يفحص **لحظةً**: كلُّ لحظةٍ سليمة،
 * والعيبُ في **مجرى الأيام**.
 *
 * فمن فُتحت محطتُه (القفلُ التسلسليّ) ولم يُكتب له قياسٌ بعدُ **يدخل جلسةَ اليوم**
 * مرّةً واحدة، ثم يحكمه ليتنر كسائره. **وقيدُ الاقتران يبقى الحاكم**: بانِي التمرين
 * هو هو (`readableAt`)، فمفتاحٌ لم تنضج كلمتُه لا يُنتج تمريناً فيُتخطّى صامتاً
 * ويُعرَض غداً — بابٌ لا جدار، كما هو في المحطة سواءً.
 *
 * **وتخرج بترتيب الرحلة** (أقدمُها عهداً بالطفل أولاً)، وصندوقُها صفرٌ بلا إصابة —
 * فتُخلَط بالمستحقّ في `todaySkills` بميزان الضعف نفسِه، ولا تُذيَّل به.
 */
export function freshSkills() {
  const known = new Set(Object.keys(state.skills));
  const out = [];
  for (const station of stations()) {
    if (!isNodeUnlockedById(station.id)) continue;
    for (const key of station.skills || []) {
      const [unit, range, kind] = key.split('|');
      if (known.has(skillKey(unit, range, kind))) continue;
      out.push({ key, unit, range: spanOf(range), kind, box: 0, right: 0, wrong: 0, fresh: true });
    }
  }
  return out;
}

/**
 * **سقفُ حوض اليوم**: الجلسةُ ستّةُ تمارين، وبناءُ التمرين كلفةٌ (جولةٌ تُبنى لكل
 * مرشَّح حتى تكتمل الستّة) — فيُعرَض على المحرّك أضعفُ ما في اليد بقدرٍ يسع اليومَ
 * كلَّه مضروباً في احتياطٍ للمحبوس بقيد الاقتران، لا السجلُّ كلُّه. رقمُ عدّةٍ معلَن.
 */
export const DAY_POOL = 120;

/**
 * **مادّةُ جلسة اليوم**: المستحقُّ وما فُتح ولم يُقَس بعد، **مخلوطين بميزان الضعف**،
 * ويتصدّرهما ما يفتح بابَ العقدة القائمة. وبها لا يبقى مفتاحٌ في المنهج بلا قياسٍ
 * في عمر الجهاز (حارسُ الوعد، الجلسة ٧).
 */
export function todaySkills(today = dayNumber(), limit = DAY_POOL) {
  /* **والبِكرُ يُخلَط بالمستحقّ بالضعف لا يُذيَّل به** (قِيس في حارس الوعد): لو ذُيِّل
     لَابتلع المستحقُّ الجلسةَ كلَّها كلَّ يوم — سجلٌّ من مئات المفاتيح يعود منه
     ثلاثون في اليوم، وسقفُ اليوم خمسَ عشرة دقيقة — فلا يبلغ الطفلُ مفتاحاً بِكراً
     أبداً وتبقى عشراتُ المهارات بلا قياسٍ في عمر الجهاز. **وما لم يُقَس قطّ أضعفُ
     ممّا قِيس** (صندوقُه صفر ولا إصابةَ له)، فترتيبُ الضعف نفسُه يُنصفه. */
  const all = [...dueSkills(today), ...freshSkills()]
    .sort((a, b) => a.box - b.box || b.wrong - a.wrong
      || (a.due ?? today) - (b.due ?? today) || String(a.key).localeCompare(String(b.key)));
  // **وما يفتح بابَ العقدة القائمة يتصدّر** (`pendingListenOf` — حارسُ الوعد):
  // ترتيبُ السؤال لا ترتيبُ ليتنر: المفتاحُ يبقى مستحقّاً أو بِكراً كما كان، وإنما
  // يُصرَف دورُه إلى ما ينتظره الطفلُ عند بابٍ واقف (وإلّا وقف أسابيعَ بلا علّة).
  const opening = new Set(pendingListenOf(nextNode()?.id));
  const at = (s) => opening.has(skillKey(s.unit, s.range, s.kind));
  return [...all.filter(at), ...all.filter((s) => !at(s))].slice(0, limit);
}

/**
 * حصيلةُ كل وحدةٍ من سجلّها — مادّةُ أقسام لوحة الوالد (`METHOD.md §٧`: «ولوحةُ
 * الوالد تعرض **بالمهارة لا بالدرجة**»): متقنة (كل تمارينها بلغت صندوق الإتقان)،
 * أو متعثّرة (خطآن فأكثر وما زالت في الصناديق الدنيا)، أو قيد التعلّم.
 */
export function unitStats() {
  const byUnit = new Map();
  for (const s of skills()) {
    const acc = byUnit.get(s.unit)
      || { unit: s.unit, right: 0, wrong: 0, minBox: MAX_BOX, kinds: 0, seen: 0, parts: [] };
    acc.right += s.right;
    acc.wrong += s.wrong;
    acc.minBox = Math.min(acc.minBox, s.box);
    acc.kinds++;
    acc.seen = Math.max(acc.seen, s.seen);
    acc.parts.push(s);
    byUnit.set(s.unit, acc);
  }
  return [...byUnit.values()]
    .map((a) => ({
      ...a,
      // **ومهاراتُ الوحدة بالأضعف أوّلاً**: منها تُبنى عبارةُ اللوحة — أقصى ما أتقن،
      // وما يحتاج تثبيتَه — بترتيب الضعف نفسِه الذي تبني به المراجعة.
      parts: a.parts.sort(byWeakness),
      attempts: a.right + a.wrong,
      mastered: a.minBox >= MASTERED_BOX,
      struggling: a.wrong >= 2 && a.minBox <= 1,
    }))
    .sort((a, b) => a.unit.localeCompare(b.unit));
}

// ————— دقائق الاستعمال —————

/** إضافة زمن استعمال فعلي (يُستدعى بنبضة من main.js وقت انتباه الطفل فقط). */
export function addSeconds(sec, key = dayKey()) {
  const n = Math.max(0, Math.round(sec));
  if (!n) return;
  state.seconds += n;
  state.days[key] = (state.days[key] || 0) + n;
  save();
}

export function secondsOn(key = dayKey()) {
  return state.days[key] || 0;
}

export function totalSeconds() {
  return state.seconds;
}

/** آخر N يوماً منتهيةً باليوم: [{key, seconds}] — للوحة وليّ الأمر. */
export function usageDays(count = 7, today = new Date()) {
  const out = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    out.push({ key: dayKey(d), seconds: secondsOn(dayKey(d)) });
  }
  return out;
}

// ————— جلسة المراجعة اليومية —————

export function reviewOf(key = dayKey()) {
  return state.reviews[key] || null;
}

/**
 * تسجيل مراجعة أُتمّت اليوم. الوحدة **محاولة** لا تمرين — تمرينٌ فيه محاولة لكل
 * عنصر، فخلطهما يكذب على وليّ الأمر في نسبة الإصابة. وهي وحدةُ عبور البوابة نفسُها.
 */
export function markReview(tries, right, key = dayKey()) {
  const before = state.reviews[key];
  state.reviews[key] = {
    tries: (before?.tries || 0) + tries,
    right: (before?.right || 0) + right,
    at: Date.now(),
  };
  save();
  return state.reviews[key];
}

/** أيام المراجعة المتتالية المنتهية باليوم أو بالأمس (لا تنكسر السلسلة قبل نوم الطفل). */
export function reviewStreak(today = new Date()) {
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    if (state.reviews[dayKey(d)]) streak++;
    else if (i > 0 || streak) break;
  }
  return streak;
}

// ————— النسخة الاحتياطية: نقلُ تقدّم الطفل بين الأجهزة —————
//
// **العلّة** (بذرةُ اقرأ): التقدّم في هذا الجهاز وحده — لا حساب ولا سحابة (عهدُ
// الخصوصية). وثمنُها أن **محو بيانات المتصفّح أو حذف التطبيق المثبَّت يمحو رحلة
// الطفل كلها**، وأن تبديل الجهاز يبدأ من الصفر. فالمخرج ملفٌّ صغير يملكه وليّ الأمر:
// نجومٌ وصناديقُ ليتنر ودقائقُ ومراجعات.

export const BACKUP_KIND = 'english.progress';
export const BACKUP_FORMAT = 1;      // شكل الملف نفسه — لا نسخة حالة الطفل (`VERSION`)

/** النسخة كما تُكتب في الملف: ترويسةٌ تعرّف نفسها، وحالةُ الطفل كاملةً. */
export function backup(at = Date.now()) {
  return { kind: BACKUP_KIND, format: BACKUP_FORMAT, savedAt: at, state: snapshot() };
}

export function backupText(bundle = backup()) {
  return JSON.stringify(bundle, null, 1);
}

/** اسم الملف بيومه — فتتراكم نسخُ وليّ الأمر مرتَّبةً بلا أن يطمس بعضها بعضاً. */
export function backupName(date = new Date()) {
  return `english-progress-${dayKey(date)}.json`;
}

/**
 * قراءة ملفٍ اختاره وليّ الأمر. **لا يُستعاد مجهولٌ**: كل رفضٍ يُعلَن بسببه بالعربية،
 * لأن الاستعادة تكتب فوق تقدّم قائم — وخطؤها لا يُستدرك.
 * @returns {{bundle: object}|{error: string}}
 */
export function readBackup(text) {
  let raw;
  try {
    raw = JSON.parse(String(text ?? ''));
  } catch {
    return { error: 'تعذّرت قراءة الملف — ليس ملفَ نسخةٍ صالحاً.' };
  }
  if (!raw || typeof raw !== 'object' || raw.kind !== BACKUP_KIND) {
    return { error: 'هذا الملف ليس نسخةَ تقدّمٍ من هذا التطبيق.' };
  }
  const format = Number(raw.format);
  if (!Number.isFinite(format)) return { error: 'ملف النسخة معطوب — لا يعلن شكله.' };
  if (format > BACKUP_FORMAT) {
    return { error: 'هذه النسخة من إصدارٍ أحدث من التطبيق — حدِّث التطبيق ثم استعِدها.' };
  }
  const next = migrate(raw.state);
  if (!next) return { error: 'ملف النسخة معطوب — لا تقدّم فيه.' };
  return { bundle: { ...raw, state: next } };
}

/**
 * ما في النسخة بعبارة وليّ الأمر — يُعرض **قبل** التأكيد: نسخةٌ خاطئة تُستعاد فوق
 * تقدّمٍ حقيقيّ خسارةٌ لا رجعة فيها، ورقمُ نجومها ويومُها يميّزانها في نظرة.
 * والنجومُ تُحسب على عقد الرحلة الحالية وحدها (لا على مفاتيح لا وجود لها اليوم).
 */
export function backupSummary(bundle) {
  const stars = bundle?.state?.stars || {};
  const done = allNodes().filter((n) => stars[n.id] > 0);
  return {
    savedAt: bundle?.savedAt || 0,
    nodes: done.length,
    stars: done.reduce((sum, n) => sum + Math.min(MAX_STARS, stars[n.id]), 0),
    skills: Object.keys(bundle?.state?.skills || {}).length,
    seconds: bundle?.state?.seconds || 0,
  };
}

/**
 * الاستعادة: حالةُ النسخة تحلّ محلّ الحالة القائمة كاملةً (لا دمج — دمجُ رحلتين
 * يصنع طفلاً ثالثاً لا وجود له).
 */
export function restore(bundle) {
  const next = bundle?.state;
  if (!next || typeof next.stars !== 'object') return false;
  state = { ...blank(), ...next, v: VERSION };
  save();
  return true;
}

// ————— تحكّم وليّ الأمر في الرحلة (خلف بوابته الحسابية) —————

/**
 * فتحٌ يدويّ إلى عقدةٍ بعينها — لطفلٍ يعرف ما قبلها فلا يُحبَس في أوّلها.
 * كل ما قبلها يُعدّ متماً **بنجمةٍ واحدة**: تفكّ القفل ولا تدّعي إتقاناً، فتبقى
 * العقدةُ تدعوه إلى لعبها والنجومُ تعلو حين يلعبها. ولا تُنقَص نجمةٌ كُسبت.
 *
 * **ولا يمسّ قيدَ الاقتران**: القفلُ يُفتَح والقياسُ لا يُكتب، فكلمةٌ لم يتقنها سمعاً
 * تبقى خارج تمارين القراءة ولو فُتح طريقُها — **القيدُ من ليتنر لا من الجبهة**.
 * @returns {number} عدد العقد التي فُتحت فعلاً
 */
export function unlockUpTo(id) {
  const pending = unfinishedBefore(id);
  for (const node of pending) state.stars[node.id] = 1;
  if (pending.length) save();
  return pending.length;
}

function unfinishedBefore(id) {
  const index = indexOf(id);
  return index < 0 ? [] : allNodes().slice(0, index).filter((n) => !getStars(n.id));
}

/** كم عقدةً ناقصة قبل هذه العقدة — ما سيفتحه `unlockUpTo` **قبل** أن يفعله. */
export const pendingBefore = (id) => unfinishedBefore(id).length;

/**
 * تصفير محطةٍ لإعادة التدريب: نجومُ عقدها إلى الصفر، فتعود جبهةُ الفتح إليها.
 *
 * وثلاثة قيود مقصودة: **سجلّ ليتنر لا يُمسّ** (ما قِيس من مهارات الطفل حقٌّ له،
 * وإعادةُ التدريب لا تمحو تاريخه)؛ و**نجومُ ما بعدها تبقى محفوظة** (تُقفل حتى يتمّ
 * المحطة، فإذا أتمّها عادت كما كانت — إعادةُ قفلٍ لا محو)؛ ودقائقُ الاستعمال
 * والمراجعات لا تُمسّ.
 * @returns {number} عدد العقد التي صُفِّرت
 */
export function clearSection(sectionId) {
  const section = journey().find((s) => s.id === sectionId);
  if (!section) return 0;
  let cleared = 0;
  for (const node of section.nodes || []) {
    if (!state.stars[node.id]) continue;
    delete state.stars[node.id];
    cleared++;
  }
  if (cleared) save();
  return cleared;
}

/** حصيلةُ محطةٍ (عقدُها والمنجَز منها ونجومُه) — لعرض أثر التصفير **قبل** وقوعه. */
export function sectionProgress(sectionId) {
  const section = journey().find((s) => s.id === sectionId);
  if (!section) return null;
  const done = (section.nodes || []).filter((n) => getStars(n.id) > 0);
  return {
    nodes: (section.nodes || []).length,
    done: done.length,
    stars: done.reduce((sum, n) => sum + getStars(n.id), 0),
  };
}

// ————— صلابة التخزين —————
//
// التقدّم في `localStorage`، والمتصفّح **يُخلي** تخزين المواقع حين يضيق القرص —
// وiOS أشدّها في ذلك — فيذهب تقدّم الطفل بلا فعلٍ من أحد. والوسمُ الدائم يستثنيه
// من الإخلاء. يُطلب عند بوابة وليّ الأمر (فعلُ بالغٍ لا فعلُ طفل)، و**رفضُه لا
// يعطّل شيئاً**: الجواب يُعرض على وليّ الأمر ليعرف أنّ النسخة الاحتياطية آكد.

const storageApi = () => (typeof navigator !== 'undefined' && navigator.storage) || null;

/** طلب التخزين الدائم. يردّ `true`/`false`، و`null` إن كان المتصفّح لا يعرفه. */
export async function askPersistence() {
  const api = storageApi();
  if (!api?.persist) return null;
  try {
    return await api.persist();
  } catch {
    return null;   // تصفّح خاص أو منعٌ من المستخدم: لا شيء ينكسر
  }
}

/** حال التخزين اليوم بلا طلبٍ جديد (للعرض في اللوحة). */
export async function persistedStorage() {
  const api = storageApi();
  if (!api?.persisted) return null;
  try {
    return await api.persisted();
  } catch {
    return null;
  }
}

/**
 * **كم من بنك الصوت على هذا الجهاز؟** (يعرضه وليّ الأمر)
 *
 * العلّةُ من اقرأ حرفاً: كان إخفاقُ الخزن **يُبتلَع صامتاً** — ومنه ضيقُ حصة التخزين
 * على الأجهزة الأقدم — فتنقص ملفاتٌ ولا يعلم أحد، ثم يصمت الصوتُ في الطائرة أو
 * السيارة فيُظنّ العيبُ في البرنامج. فالعددُ معروضٌ: يرى وليُّ الأمر النقصَ قبل أن
 * يفاجئه. **وهو ههنا أثقلُ**: بنكُنا **قناتان** (توجيهٌ عربيّ ومادةٌ إنكليزية)،
 * فنقصُ إحداهما يترك الدرسَ نصفَ ناطق.
 *
 * ويُقرأ **من المخزون نفسِه** لا من تقديرٍ عندنا: عاملُ الخدمة يملك المخزن، وهذه
 * تعدّ ما فيه وتقابله ببيان البنك. و`null` تعني «لا جواب» (متصفّحٌ بلا Cache API أو
 * تصفّحٌ خاصّ أو بنكٌ لم يُولَّد) — فيسقط السطرُ ولا ينكسر شيء.
 */
export async function audioStored() {
  if (typeof caches === 'undefined') return null;
  try {
    const name = (await caches.keys()).find((n) => n.startsWith('english-audio'));
    if (!name) return null;
    const app = new URL('../', import.meta.url);
    const hit = await caches.match(new URL('audio/manifest.json', app));
    const manifest = hit ? await hit.json() : null;
    const total = manifest ? Object.keys(manifest).length : 0;
    if (!total) return null;
    const have = (await (await caches.open(name)).keys()).length;
    return { stored: Math.min(have, total), total };
  } catch {
    return null;
  }
}

// ————— إدارة —————

export function snapshot() {
  return JSON.parse(JSON.stringify(state));
}

export function reset() {
  state = blank();
  save();
}
