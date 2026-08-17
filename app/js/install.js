// بابُ التثبيت — شريطٌ داخل التطبيق يقود كلَّ زائرٍ إلى تثبيته (أمرُ المالك في اقرأ،
// ١١ أغسطس ٢٠٢٦: «من المتصفح ليس عملياً — من التطبيق هو ما نريده، فكيف نجعل كلَّ
// زائرٍ يثبّته؟»).
//
// ————— بذرةُ المنصة (`docs/SEED.md §٦` — المؤجَّلُ إلى الجلسة ٩، وقد حان) —————
// الأصلُ «اِقْرَأْ» (`read@HEAD`) بمنطقه كلِّه: قرارُ العرض دالّةٌ نقيّة، وثلاثةُ
// أحوالٍ لثلاثة أجهزة، ورقادٌ بعد الإغلاق. **والمبدَّلُ اسمُ التطبيق ومفتاحُ
// تذكّره** — والاسمُ يُقرأ من `ui.js` لا يُكتب هنا (ثنائيةُ الهوية: النصُّ العربيُّ
// «اِسْمَعْ»، والعلامةُ المرسومة `Listen!` موضعُها الترويسةُ والأيقونة لا جملةُ نصّ).
//
// **لماذا شريطٌ داخل التطبيق لا صفحةُ شرح**: الزائر يصل إلى التطبيق نفسِه (رابطٌ من
// معلم أو مجموعة)، وصفحةُ التعريف — وفيها قسمُ «ثبّته أولاً» — لا يمرّ بها كلُّ أحد.
// فالشريطُ يلقاه حيث هو، **ويقول لكل جهازٍ ما يخصّه**:
//
//   · أندرويد/كروم/إيدج (وحاسوب): النظامُ يعطينا حدثَ `beforeinstallprompt` — نمسكه
//     ونعرض زرَّ «ثبّت الآن» **يفتح نافذةَ التثبيت الحقيقية بنقرة** — صفرُ شرح.
//   · آيباد/آيفون: آبل لا تتيح تثبيتاً برمجياً ألبتّة (لا حدثَ ولا واجهة) — فالشريطُ
//     يشرح الخطوتين بلفظهما («زرُّ المشاركة ← إضافة إلى الشاشة الرئيسية»)، وإن كان
//     المتصفحُ غيرَ سفاري قال أولاً: افتح في سفاري — فالتثبيتُ على iOS منه وحدَه.
//   · **ومن التطبيق المثبَّت لا يظهر أبداً**: وضعُ `standalone` يكشفه فيصمت الشريط.
//
// **وهو شريطُ كبارٍ لا شاشةُ طفل** (قاعدةُ اللاقراءة بلغتين — `METHOD.md §٩·٢`):
// جملتُه عربيةٌ يقرؤها وليُّ الأمر، **ولا فعلَ يلزم الطفلَ وسيلتُه قراءتُها** — زرُّ
// «ثبّت الآن» فعلُ راشدٍ يقرّر، والطفلُ يمضي إلى الخريطة ولا يحتاجه. ولذلك يُجرَد
// خارج جرد أزرار شاشة الطفل (`.screen button`) — موضعُه صدرُ الصفحة لا الشاشة.
//
// **ولا إزعاج**: زرُّ إغلاقٍ يُسكِته أسبوعاً (يتذكّره localStorage)، ونجاحُ التثبيت
// (`appinstalled`) يُسكته أبداً. والوحدةُ لا تعرف الشبكة — عرضٌ وقرارٌ محليان صرفان.
//
// وقرارُ العرض دالّةٌ نقيّة (`installState`) تُفحَص في node بجدول حالاتٍ كامل
// (`tools/test_install.mjs`) — فمنطقُ «أيُّ رسالةٍ لأيّ جهاز» محروسٌ لا مظنون.

// ————— وبطاقةُ أول تشغيل: «ثبّت أولاً ثم امتحن» (الجلسة ب٢) —————
//
// **العيبُ الذي تعالجه** (بلاغ `2026-08-17-install-before-exam-first-run-card.md`،
// وصار يعنينا يومَ بنينا بوابةَ اللحاق): على الآيباد والآيفون **للتطبيق المثبَّت مخزنٌ
// مستقلٌّ عن سفاري**. فوالدٌ يمتحن ابنَه في المتصفّح ثم يثبّت التطبيق يجد الرحلةَ من
// أولها — **وقياسٌ صحيحٌ ضاع بسبب بابٍ خاطئ**، وهو أسوأُ من ألّا يمتحن.
//
// **وطبقتا المدير قُرئتا ولم يُنسَخ ما لا يناسب بيتَنا**: بوابتُه وحقيبةُ معلّمه تقولان
// «ثبّت أولاً» — ونحن لا بوابةَ لنا ولا حقيبة، فموضعُ القول عندنا **داخل التطبيق**.
// وبطاقتُه بزرَّين على كل جهاز؛ **وعندنا الزرّان مشروطان بالجهاز**: في المتصفّح
// **دعوةُ التثبيت وحدَها ولا دعوةَ امتحان** (وإلا دعوناه إلى ما يضيع)، وفي المثبَّت
// **دعوةُ الامتحان** — و«امتحانُ اللحاق» يفتح **بوابةَ اللوحة** لا الامتحانَ مباشرة،
// فلا يفتحه طفلٌ على نفسه.
//
// **ولا تحبس أحداً**: «لاحقاً» يُغلقها **أبداً** (لا أسبوعاً كالشريط — دعوةٌ مرّةً
// واحدة لا مطالبةٌ تتكرّر)، وتغيب من تلقائها بأول نجمةٍ أو أول محاولة: **رحلةٌ بكرٌ
// وحدَها** موضعُها. وهي **بطاقةُ والدٍ لا شاشةُ طفل**، فموضعُها موضعُ شريط التثبيت —
// صدرُ الصفحة فوق الشاشة لا داخلَ الخريطة (وهو الفرقُ الذي يجعل جردَ «لا زرَّ نصّيّ
// في شاشة الطفل» صادقاً بلا استثناءٍ يُكتب له).

import { h, toast, go, BRAND } from './ui.js';

/** مفتاحُ التذكّر — **بسابقتنا نحن** (`listen.`) كمفتاح التقدّم: أربعةُ تطبيقاتٍ من
 *  بذرةٍ واحدة قد تُختبَر على منفذٍ واحد، ومفتاحٌ مشترك يُسكِت شريطَ أخينا. */
const KEY = 'listen.install.v1';
const REST_DAYS = 7;                      // رقادُ الشريط بعد الإغلاق — أسبوعٌ ثم يعود بلطف

let deferredPrompt = null;                // حدثُ التثبيت المُمسَك (كروم/إيدج/أندرويد)
let bar = null;

/** قرارُ العرض — نقيٌّ ليُفحَص: ماذا نُري هذا الجهازَ الآن؟
 *  @returns {'hidden'|'button'|'ios'|'ios-other'} */
export function installState({ standalone, ua, touchPoints, promptReady, memo, now }) {
  if (standalone || memo.installed) return 'hidden';
  if (memo.dismissedAt && now - memo.dismissedAt < REST_DAYS * 86400000) return 'hidden';
  if (promptReady) return 'button';
  // آيباد iPadOS يقدّم نفسَه «Macintosh» — يفضحه تعدّدُ نقاط اللمس
  const ios = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && touchPoints > 1);
  if (!ios) return 'hidden';              // جهازٌ لا نملك له طريقاً (فَيَرفُكس مثلاً): الصمتُ أهدأ
  const safari = /Safari\//.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/.test(ua);
  return safari ? 'ios' : 'ios-other';
}

const memo = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const remember = (patch) => {
  try { localStorage.setItem(KEY, JSON.stringify({ ...memo(), ...patch })); } catch { /* تخزينٌ ممتلئ: يظهر الشريط أكثر، ولا يضرّ */ }
};

function state() {
  const standalone = matchMedia('(display-mode: standalone)').matches
    || navigator.standalone === true;
  return installState({
    standalone,
    ua: navigator.userAgent,
    touchPoints: navigator.maxTouchPoints || 0,
    promptReady: Boolean(deferredPrompt),
    memo: memo(),
    now: Date.now(),
  });
}

function paint() {
  if (bar) { bar.remove(); bar = null; }
  const mode = state();
  if (mode === 'hidden') return;

  const close = h('button', {
    class: 'install-x',
    'aria-label': 'أغلق شريط التثبيت',
    onclick: () => { remember({ dismissedAt: Date.now() }); paint(); },
  }, '✕');

  let body;
  if (mode === 'button') {
    body = [
      h('span', { class: 'install-text' },
        `ثبّت «${BRAND}» على هذا الجهاز — يفتح من أيقونته ويعمل بلا إنترنت.`),
      h('button', {
        class: 'btn btn--primary install-go',
        onclick: async () => {
          const prompt = deferredPrompt;
          if (!prompt) return;
          deferredPrompt = null;          // الحدثُ يُستهلك مرةً واحدة بحكم المنصة
          prompt.prompt();
          const { outcome } = await prompt.userChoice;
          if (outcome !== 'accepted') remember({ dismissedAt: Date.now() });
          paint();                         // نجاحُ التثبيت يصمُت عبر appinstalled
        },
      }, 'ثبّت الآن'),
    ];
  } else if (mode === 'ios') {
    body = [h('span', { class: 'install-text' },
      `ثبّت «${BRAND}» على الجهاز: اضغط زرَّ المشاركة (المربّع الذي يخرج منه سهمٌ`
      + ' إلى أعلى)، ثم «إضافة إلى الشاشة الرئيسية».')];
  } else {
    body = [h('span', { class: 'install-text' },
      'للتثبيت على هذا الجهاز: افتح هذا العنوان في متصفّح سفاري، ثم زرُّ المشاركة'
      + ' ← «إضافة إلى الشاشة الرئيسية».')];
  }

  bar = h('div', { class: 'install-bar' }, ...body, close);
  document.body.prepend(bar);
}

// الحدثان يُلتقطان عند تحميل الوحدة — `beforeinstallprompt` يقع بُعيد التحميل ولا يعاد
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();                   // نؤجّل عرضَ النظام إلى زرّنا نحن
    deferredPrompt = e;
    if (document.body) paint();
  });
  window.addEventListener('appinstalled', () => {
    remember({ installed: true });
    deferredPrompt = null;
    if (bar) { bar.remove(); bar = null; }
    toast('ثُبّت التطبيق — افتحه من أيقونته');
  });
}

/** تركيبُ الشريط عند الإقلاع (لا يُنادى في وضع المعاينة — شريطان فوق الشاشة ضجيج). */
export function mount() {
  paint();
}

// ————— بطاقةُ أول تشغيل —————

/** قرارُ البطاقة — نقيٌّ ليُفحَص بجدول حالاتٍ كامل كأخيه.
 *  @returns {'hidden'|'install'|'exam'} */
export function firstRunState({ standalone, stars, attempts, memo }) {
  if (memo.firstRunDone) return 'hidden';       // «لاحقاً» أو دخولُ اللوحة: لا تعود
  if (stars > 0 || attempts > 0) return 'hidden';  // ليست رحلةً بكراً: الطفلُ في الدرب
  return standalone ? 'exam' : 'install';       // في المتصفّح: التثبيتُ وحدَه يُدعى إليه
}

let card = null;

/** رسمُ البطاقة (أو رفعُها) — تُنادى عند كل تصيير، فتغيب بأول نجمةٍ بلا إعادة تحميل. */
export function paintFirstRun({ stars, attempts }) {
  const mode = firstRunState({
    standalone: matchMedia('(display-mode: standalone)').matches
      || navigator.standalone === true,
    stars,
    attempts,
    memo: memo(),
  });
  if (card) { card.remove(); card = null; }
  if (mode === 'hidden') return;

  const later = h('button', {
    class: 'btn first-run-later',
    onclick: () => { remember({ firstRunDone: true }); paintFirstRun({ stars, attempts }); },
  }, 'لاحقاً');

  const body = mode === 'install'
    ? [
      h('b', {}, 'ثبّته أولاً، ثم امتحن'),
      h('p', {}, `تنوي أن تمتحن مستوى طفلك؟ ثبّت «${BRAND}» على الجهاز أولاً: `
        + 'على الآيباد والآيفون للتطبيق المثبَّت ذاكرةٌ مستقلّةٌ عن ذاكرة المتصفّح — '
        + 'فامتحانٌ هنا ثم تثبيتٌ بعده يبدأ الرحلةَ من أولها، ويضيع قياسُه.'),
      h('div', { class: 'first-run-go' }, later),
    ]
    : [
      h('b', {}, 'طفلُك يعرف بعضَ الإنكليزية؟'),
      h('p', {}, 'امتحانُ اللحاق يبدأ به من مستواه لا من أوّل كلمة — '
        + 'من لوحة وليّ الأمر، وقبل أن يمشي في الدرب.'),
      h('div', { class: 'first-run-go' },
        h('button', {
          class: 'btn btn--primary first-run-exam',
          // **بوابةُ اللوحة لا الامتحانُ مباشرة**: فلا يفتحه طفلٌ على نفسه
          onclick: () => { remember({ firstRunDone: true }); card?.remove(); card = null; go('#/parent'); },
        }, 'امتحانُ اللحاق'),
        later),
    ];

  card = h('div', { class: 'first-run' }, ...body);
  document.body.prepend(card);
}
