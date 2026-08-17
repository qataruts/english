// لوحة وليّ الأمر (`METHOD.md §٧`: «ولوحةُ الوالد تعرض **بالمهارة لا بالدرجة**») —
// خلف بوابة عملية حسابية لا يحلّها طفل السادسة: أين يتعثّر بالضبط، وكم دقيقة تعلّم،
// وما توصية اليوم.
//
// ————— بذرةُ المنصة (`docs/SEED.md §٢`) —————
// المنقولُ **البنيةُ والبوابةُ الحسابية** (`FAMILY.md §٥`): تركيبُ الشاشة، وقفلُها،
// وتوصيةُ اليوم بترتيبها، وقسمُ النسخة الاحتياطية، وتحكّمُ وليّ الأمر في الرحلة،
// وبابُ المعاينة. وسقط ما كان يعرف حرفاً عربياً أو مفهوماً حسابياً.
//
// **وأقسامُ اللوحة تكتبها الجلسة ١ ويفصّلها بندُ الجلسة ٨** (`SESSIONS.md`): «قسمُ
// السمع وقسمُ الحرف **وقيدُ الاقتران مرئياً**: يقرأ ما أتقن سمعَه». وهذه الوحدةُ
// **تُترجم ولا تخترع**: أسماءُ الوحدات وعباراتُها بياناتُ منهج (`curriculum.js` —
// مَن كتب مفتاحَ ليتنر يسمّيه)، **والمدى يُقرأ من سجلّ ليتنر الحيّ**. فلا رقمَ في هذه
// اللوحة مكتوبٌ بيد ولا عبارةَ تُقال بلا سجلٍّ يسندها.
//
// الشاشة لا تنطق شيئاً (لا صوت فيها أصلاً — ولا قناةَ لغويةً تُختار)، وتُبنى من
// مفردات التنسيق القائمة (pill · note · chip) وتُلوَّن بمتغيّر `--accent`.

import * as progress from './progress.js';
import {
  UNIT_SECTIONS, unitOf, rangeText, journeyUnits, coupledWords, listenFields,
} from './curriculum.js';
import { h, go, toast, arNum, arCount, topbar, shake, BRAND, PAUSE_ACCENT } from './ui.js';
import { feedbackSection } from './feedback.js';
import * as support from './support.js';
import * as placement from './placement.js';

const ACCENT = PAUSE_ACCENT;
const GOOD = 'var(--ok)';
const BAD = 'var(--err)';
const DAY_NAMES = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

/** نصيبُ اليوم لطفل السادسة — بعده تُنصح الاستراحة. (حلقةُ المحطة ٣–٥ دقائق،
 *  `METHOD.md §٤`، فهذا نحوُ ثلاث محطاتٍ ومراجعة.) **ويراجعه بندُ الجلسة ٨.** */
const ENOUGH_MINUTES = 15;

/**
 * **متى يصير التعثّرُ «متكرراً أسابيع»** (`METHOD.md §١٣`) — عتبةُ عبارة «راجِع مختصاً».
 *
 * نصُّ الحدّ: «التعثّرُ المتكرر إشارةُ «راجِع مختصاً» لا حكماً — تدريسٌ لا تشخيص».
 * و«أسابيع» جمعُ كثرةٍ أدناه ثلاثة — فثلاثةُ أسابيع من يوم أوّل قياسٍ لتلك المهارة
 * (`since`)، **وهي ما تزال في الصندوق الأدنى** بعدها. فلا تُقال العبارةُ لأسبوعٍ عثر
 * فيه، ولا تُخبَّأ عن والدٍ طال تعثّرُ طفله.
 */
const STUCK_DAYS = 21;

/**
 * **كم مهارةً تُسمّى بأسمائها قبل أن تُعَدّ عدّاً** (تصحيحُ الجلسة ٨).
 *
 * أسماءُ ستٍّ يقرؤها الوالدُ في سطرٍ واحد فينتفع بها («يعرف cat وdog وbird»)، وسردُ
 * ثمانين اسماً لاتينياً في لوحةٍ عربية جدارٌ لا يُقرأ — فما جاوزها يُعَدّ عدّاً
 * (وتفصيلُه في صفّ الحقول: «الحيوانات ٩ من ١١»).
 */
const NAME_LIMIT = 6;

let unlocked = false;        // البوابة تُفتح لهذه الجلسة فقط (لا تُحفظ في التخزين)
let examining = false;       // امتحانُ اللحاق جارٍ — يحلّ محلّ اللوحة ما دام

/** ثوانٍ ← نصّ عربي مقروء. */
export function minutesText(seconds) {
  if (!seconds) return 'لا شيء';
  if (seconds < 60) return 'أقل من دقيقة';
  return arCount(Math.round(seconds / 60), ['دقيقة واحدة', 'دقيقتان', 'دقائق', 'دقيقة']);
}

/** «مهارة واحدة» · «مهارتين» · «٥ مهارات» — مفعولاً به في سياق التثبيت. */
export const skillsText = (n) => arCount(n, ['مهارة واحدة', 'مهارتين', 'مهارات', 'مهارة']);

/** لحظةٌ كما يقرؤها وليّ الأمر: «أحد ٣/٨ · ٦:٤٠». */
export function whenText(at) {
  const d = new Date(at);
  const time = `${arNum(d.getHours())}:${arNum(String(d.getMinutes()).padStart(2, '0'))}`;
  return `${DAY_NAMES[d.getDay()]} ${arNum(d.getDate())}/${arNum(d.getMonth() + 1)} · ${time}`;
}

/**
 * توصية اليوم — دالّة خالصة تُختبر وحدها.
 * الترتيب مقصود: صحّة الطفل (سقف الوقت) قبل التحصيل، والمراجعة قبل الجديد
 * (ما تعثّر فيه أولى بالتثبيت من محطةٍ جديدة تُبنى على متزعزع).
 */
export function recommend({
  started = false, dueCount = 0, secondsToday = 0, reviewDone = false, nextTitle = '',
} = {}) {
  const minutes = Math.round(secondsToday / 60);
  if (!started) {
    return {
      title: 'ابدآ الرحلة معاً',
      body: 'أول محطة في مسار السمع — اجلس معه في أول محطتين حتى تتضح له اللعبة.'
        + ' وأوّلُ الرحلة سمعٌ وصورٌ لا حروف، فلا يحتاج قراءةً بالعربية ولا بالإنكليزية.',
      action: { label: 'افتح الخريطة', hash: '#/' },
    };
  }
  if (minutes >= ENOUGH_MINUTES) {
    return {
      title: 'أخذ نصيبه اليوم',
      body: `تعلّم اليوم ${minutesText(secondsToday)} — الزيادة على هذا تُتعب طفلاً في هذه`
        + ' السنّ أكثر مما تنفعه، ولغةٌ ثانية تُبنى بالقليل المتّصل لا بالكثير المتقطّع.'
        + ' أعِده غداً.',
      action: null,
    };
  }
  if (dueCount && !reviewDone) {
    return {
      title: 'ابدأ بمراجعة اليوم',
      body: `حان وقت تثبيت ${skillsText(dueCount)} (تمارين قصيرة مما درسه).`
        + ' المراجعة قبل المحطة الجديدة.',
      action: { label: 'ابدأ المراجعة', hash: '#/review' },
    };
  }
  if (nextTitle) {
    return {
      title: 'واصِلا المحطة التالية',
      body: `التالي في رحلته: ${nextTitle}.`,
      action: { label: 'افتح الخريطة', hash: '#/' },
    };
  }
  return {
    title: 'أتمّ الرحلة كلها',
    body: 'أعِد معه المراجعة اليومية — التثبيت بعد الإتمام هو ما يُبقي اللغة في أذنه.',
    action: { label: 'ابدأ المراجعة', hash: '#/review' },
  };
}

// ————— البوابة الحسابية —————
//
// **عمليةُ ضربٍ خارجَ منهج هذا التطبيق وخارجَ سنّ صاحبه**: طفلُ السادسة لا يحلّها،
// ولا هي من مادّتنا في شيء — فلا تُفتَح بمصادفةِ درسٍ ولا بتكرار محاولة.

function question() {
  const a = 6 + Math.floor(Math.random() * 7);    // ٦…١٢
  const b = 7 + Math.floor(Math.random() * 6);    // ٧…١٢
  return { a, b, answer: a * b };
}

/** يقبل الرقمين المشرقيّ والمغربيّ معاً (وليّ الأمر يكتب بلوحة مفاتيح جهازه). */
export function readNumber(text) {
  const normalized = String(text ?? '').trim()
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  return /^\d+$/.test(normalized) ? Number(normalized) : NaN;
}

/**
 * بطاقة البوابة — عمليةُ ضربٍ لا يحلّها طفلُ هذه السنّ.
 * تُستعمل شاشةً كاملة للوحة، وتصلح نافذةً فوق شاشةٍ أخرى إن احتيج إذنُ بالغ —
 * بوابةٌ واحدة لا نسختان منها.
 */
export function gateCard({ hint: hintText = 'هذه الشاشة لوليّ الأمر — أجب لتدخل.', onPass, onCancel } = {}) {
  let q = question();
  const prompt = h('div', { class: 'giant', css: { '--accent': ACCENT, 'font-size': '2.6rem' } },
    `${arNum(q.a)} × ${arNum(q.b)}`);
  const input = h('input', {
    class: 'chip',
    type: 'text',
    inputmode: 'numeric',
    autocomplete: 'off',
    'aria-label': 'ناتج الضرب',
    css: { 'min-width': '8rem', 'text-align': 'center', border: '2px solid var(--line)', font: 'inherit' },
  });
  const hint = h('p', { class: 'hint' }, hintText);

  function check() {
    if (readNumber(input.value) === q.answer) {
      // عند أول بوابةِ وليّ أمر يُطلب التخزين الدائم — فعلُ بالغٍ لا فعلُ طفل، ووراءه
      // نيّةٌ معلَنة. ورفضُه لا يعطّل شيئاً، ولا ننتظر جوابه كي لا تتأخّر الشاشة عليه.
      progress.askPersistence();
      return onPass();
    }
    shake(input);
    input.value = '';
    q = question();
    prompt.textContent = `${arNum(q.a)} × ${arNum(q.b)}`;
    hint.textContent = 'ليس هذا الناتج — جرّب هذه.';
    input.focus();
  }

  return h('div', { class: 'gate', css: { '--accent': ACCENT } },
    h('h2', {}, 'كم الناتج؟'),
    prompt,
    hint,
    h('div', { class: 'row' },
      input,
      h('button', { class: 'btn btn--primary gate-go', onclick: check }, 'ادخل'),
      onCancel && h('button', { class: 'btn gate-cancel', onclick: onCancel }, 'ليس الآن'),
    ),
  );
}

function gateScreen(onPass) {
  return h('div', { class: 'screen', css: { '--accent': ACCENT } },
    topbar(
      h('button', { class: 'btn', onclick: () => go('#/') }, '→ الخريطة'),
      h('span', { class: 'spacer' }),
      h('span', { class: 'pill' }, 'لوحة وليّ الأمر'),
    ),
    h('main', { class: 'screen-card' }, gateCard({ onPass })),
  );
}

// ————— اللوحة —————

function pill(label, value) {
  return h('span', { class: 'pill' }, `${label}: `, h('b', {}, value));
}

/**
 * تأكيدٌ صريح **في الصفحة** لا بـ`confirm()` — وهذه الأفعال تكتب فوق رحلة الطفل
 * فلا تقع بنقرةٍ واحدة. ونافذة المتصفّح لا تصلح هنا: أزرارها بلغة الجهاز لا بلغتنا،
 * ولا تتّسع لشرح أثر الفعل — وهنا يُقرأ ما سيقع بالضبط قبل أن يقع.
 */
function askThen(box, { question: ask, body, yes, onYes }) {
  const close = () => box.replaceChildren();
  box.replaceChildren(h('div', { class: 'note confirm' },
    h('b', {}, ask),
    body && h('p', { class: 'hint', css: { margin: '.35rem 0 0' } }, body),
    h('div', { class: 'row', css: { 'justify-content': 'flex-start', 'margin-top': '.6rem' } },
      h('button', { class: 'btn btn--primary confirm-yes', onclick: () => { close(); onYes(); } }, yes),
      h('button', { class: 'btn confirm-no', onclick: close }, 'إلغاء')),
  ));
}

const nodesText = (n) => arCount(n, ['عقدة واحدة', 'عقدتين', 'عقد', 'عقدة']);

/** تنزيل ملف النسخة — نصٌّ في `Blob`، بلا شبكةٍ ولا خادم (كل شيء في الجهاز). */
function saveBackupFile() {
  const url = URL.createObjectURL(
    new Blob([progress.backupText()], { type: 'application/json' }));
  const link = h('a', { href: url, download: progress.backupName() });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 20000);
}

/** ما في النسخة بعبارة وليّ الأمر — يُقرأ قبل التأكيد لا بعده. */
function summaryText(sum) {
  return `★ ${arNum(sum.stars)} في ${nodesText(sum.nodes)} · ${skillsText(sum.skills)} مقيسة`
    + (sum.savedAt ? ` · حُفظت ${whenText(sum.savedAt)}` : '');
}

/** **بابُ وضع المعاينة — خلف بوابة وليّ الأمر** (بذرةُ اقرأ):
 *
 *  المقيّمُ يحتاج أن يرى المحطات كلَّها، والطفلُ يحتاج ألّا يقفز إلى ما لم يبلغه.
 *  ولو وُضع الزرُّ في شاشة الطفل لَفتحه بنفسه ولو باللمس العابر — **فموضعُه هذه
 *  اللوحة**: هي محميّةٌ سلفاً بمسألةِ ضربٍ يعجز عنها الطفل. */
function previewSection() {
  return h('div', {},
    h('p', { class: 'hint' },
      'تفتح المحطاتِ كلَّها للاطّلاع — ولا يُحفَظ أيُّ تقدّم: تُغلق الصفحةَ'
      + ' فيعود الجهازُ كما كان.'),
    h('div', { class: 'row' },
      h('button', {
        class: 'btn btn--primary',
        onclick: () => { location.href = `${location.pathname}?preview=1`; },
      }, 'افتح وضع المعاينة')),
    h('p', { class: 'note' },
      'وهو للمعلّم أو وليّ الأمر يقيّم التطبيق — لا للطفل: القفلُ التسلسليّ'
      + ' (لا يُعرض عليه ما لم يبلغه) من أسس المنهج لا قيدٍ عليه.'),
  );
}

/**
 * **قسمُ وضع الدعم** (الجلسة ب — بلاغ العقد، البند ٦ من توجيهنا): مفتاحٌ أعلى واحد
 * تتبعه المقابضُ كلُّها، ثم يُطفئ وليُّ الأمر ما لا يحتاجه طفلُه، و«أعِد الافتراضات»
 * يردّ المخزنَ إلى فراغه. **والمفاتيحُ من الجدول لا مكتوبةً بيد** (`PANEL_KEYS` — فما
 * لم تبلغه شاشةٌ بعدُ لا مفتاحَ له)، وكلُّ اسمٍ وسطرِ شرحٍ يُقرأ من `support.js` — فلا
 * يفترق ما يقرؤه الوالدُ عمّا يقع في الشاشة.
 *
 * **وسطرُ الوعد الصادق فوقها** بنصّه (`support.PROMISE`) — هو نفسُه في الصفحة
 * التعريفية حرفاً بحرف: لا يشخّص، ولا يعالج، ولا يحكم على النطق، ولا يخدم الكفيفَ ولا
 * الأصمَّ المُشير ولا غيرَ الناطق، ولا يَعِد بحجم أثر.
 */
function supportSection(rerender) {
  const on = support.modeOn();

  const toggle = (label, active, onclick, className = '') => h('button', {
    class: `btn ${className}`.trim(),
    'aria-pressed': active ? 'true' : 'false',
    css: active ? { 'border-color': 'var(--star-text)', color: 'var(--star-text)' } : {},
    onclick,
  }, active ? `✓ ${label}` : label);

  return h('div', {},
    h('p', { class: 'hint' }, support.PROMISE),

    h('div', { class: 'row', css: { 'justify-content': 'flex-start' } },
      toggle(on ? 'وضعُ الدعم مشتغل' : 'شغّل وضعَ الدعم', on,
        () => { support.setMode(!on); rerender(); }, 'support-mode btn--primary')),

    // المقابضُ تتبع المفتاح الأعلى، فلا تُعرَض إلا وهو مشتغل — ولا مفتاحَ بلا أثر.
    on && h('div', { class: 'support-knobs' },
      support.PANEL_KEYS.map((key) => {
        const knob = support.KNOBS[key];
        const active = support.isOn(key);
        return h('div', { class: 'note', css: { 'text-align': 'start', 'margin-top': '.5rem' } },
          h('div', { class: 'row', css: { 'justify-content': 'flex-start' } },
            toggle(knob.title, active, () => { support.set(key, !active); rerender(); },
              `support-knob knob-${key}`)),
          h('p', { class: 'hint', css: { margin: '.35rem 0 0' } }, knob.line));
      })),

    on && h('div', { class: 'row', css: { 'justify-content': 'flex-start', 'margin-top': '.75rem' } },
      h('button', {
        class: 'btn support-reset',
        onclick: () => { support.reset(); toast('عاد وضعُ الدعم إلى الافتراضات'); rerender(); },
      }, 'أعِد الافتراضات')),

    h('p', { class: 'note' }, support.MARK.note),
    // **ومسطرةُ الامتحان الواحدة تُقال هنا** (بلاغ `support-and-placement-coexist`):
    // فلا يظنّ وليُّ الأمر أنّ تشغيلَ الوضع يفتح لطفله في امتحان اللحاق ما لم يُثبته.
    h('p', { class: 'note support-exam' },
      h('b', {}, 'وفي البوابات وامتحان اللحاق مسطرةٌ واحدة للجميع. '),
      'ما يريح يسري فيها (النموذجُ الأبطأ والهدوء) فلا يُمتحَن طفلُك بشاشةٍ تُربكه؛'
      + ' وما يمسّ القياس يُعطَّل فيها (الجرعةُ وضيقُ الحوض) فلا يُفتح له بامتحانٍ'
      + ' أسهلَ من امتحان غيره.'),
  );
}

/**
 * **قسمُ بوابة اللحاق** (الجلسة ب — قاعدةُ `catchup-gate-rule` بقيودها الخمسة):
 * بابُه هذا القسمُ وحدَه، **ولا زرَّ له في شاشة طفل ولا مسارَ في التوجيه**.
 *
 * ويقول لوليّ الأمر ثلاثةً بلا وعدٍ زائد: كم درجةً بقيت وأين يستأنف، **وما الذي يقصُر
 * السلّم** (بوّابةٌ يجتازها طفلُه بنفسه، **أو جدارُ اقتران**: درجةُ حرفٍ تنتظر أن تنضج
 * كلماتُها في أذنه)، وأنّ ما فُتح لا يُغلق.
 */
function placementSection(rerender) {
  const info = placement.state();

  const start = h('button', {
    class: 'btn btn--primary start-placement',
    onclick: () => {
      if (!info.left) { toast('لا درجةَ تُمتحَن الآن'); return; }
      examining = true;
      // مغادرةُ الشاشة تُنهي الامتحان: فلا يعود وليُّ الأمر إلى نصفِ امتحانٍ لم يطلبه
      addEventListener('hashchange', () => { examining = false; }, { once: true });
      rerender();
    },
  }, 'امتحان اللحاق');

  return h('div', {},
    h('p', { class: 'hint' },
      'طفلٌ يعرف بعضَ الإنكليزية أصلاً (من مدرسةٍ أو مركز)؟ امتحنه هنا: درجةً درجة'
      + ` بحتى ${arNum(placement.CAP)} تمارين من تمارين المراجعة نفسِها — ما يجتازه`
      + ' بإصابة ٨٠٪ (عتبةُ بوابة الإتقان نفسُها) يُفتح له بمحطاته، وعند أول إخفاقٍ يقف'
      + ' فتبدأ رحلتُه من هناك.'),
    h('div', { class: 'row parent-tool' }, start,
      h('span', { class: 'pill' }, info.left
        ? `أمامه ${arNum(info.left)} من ${arNum(info.total)}`
        : 'لا درجةَ تُمتحَن الآن')),
    info.next && h('p', { class: 'hint' }, `يبدأ من: ${info.next}.`),
    // **والبوابةُ تُسمّى حين تقصُر السلّم**: فلا يظنّ الوالدُ أنّ الامتحان انتهى وقد
    // وقف عند بوابةٍ يجتازها طفلُه بنفسه.
    info.gate && h('p', { class: 'note' },
      `والسلّمُ يقف عند «${info.gate}» — البواباتُ لا تُقفز: يعبرها بنفسه، ثم يُستأنف`
      + ' الامتحانُ لما بعدها.'),
    // **وجدارُ الاقتران يُسمّى كذلك** (قيدُنا الخاصّ — `METHOD.md §٦`): درجةُ حرفٍ لا
    // تُفتح لكلمةٍ لم تُثبَت سمعاً ولو اجتاز الطفلُ درجتَها.
    info.wall && h('p', { class: 'note coupling-wall' },
      `والسلّمُ يقف عند «${info.wall}» — لا لأنّه أخطأ، بل لأنّ كلمات هذه الدرجة لم`
      + ' تثبت في أذنه بعد: لا يُفتح عندنا حرفٌ لكلمةٍ لم تُتقَن سمعاً. تمضي المراجعةُ'
      + ' اليومية أياماً فتنضج، ثم يُستأنف الامتحانُ من هنا.'),
    h('p', { class: 'note' },
      'ولا يُغلق ما فُتح أبداً: الإعادةُ تستأنف من آخر حدٍّ بلغه، والنجمةُ الواحدة تفكّ'
      + ' القفل ولا تدّعي إتقاناً — تبقى المحطةُ تدعوه إلى لعبها. وكلُّ محاولةٍ فيه'
      + ' تُسجَّل في سجلّ مهاراته كأيّ محاولةٍ أخرى، ولا تُعَدّ مراجعةَ اليوم.'),
  );
}

/**
 * **سطرُ النسخة العاملة** (`METHOD.md §١٢-١٠` — أمرُ المالك): «لوحةُ الوالد تسأل
 * وتعرض نسخةَ **ما يعمل** على الجهاز».
 *
 * **ولا يُقرأ الرقمُ من الشيفرة التي تعمل الآن في الصفحة**: تلك تُحمَّل من الشبكة أو
 * من المخزون، وقد تكون أحدثَ من القشرة المسيطرة — فالسؤالُ **للقشرة الحيّة نفسِها**
 * (`navigator.serviceWorker.controller`) وجوابُها من ثابتها. وبلا قشرةٍ مسيطرة
 * (أوّلُ فتحةٍ قبل التسجيل، أو `file://`) يُقال ذلك صريحاً ولا يُخترَع رقم.
 *
 * وهو سطرٌ **هادئ**: لوحةُ الوالد للتقدّم لا للتقنية، وموضعُ هذا السطرِ ذيلُها —
 * ولكنّه يُقرأ يومَ يُسأل «أيّ نسخةٍ على جهاز الميدان؟».
 */
function versionLine() {
  // **ومعرّفُه يُقرأ من «بلِّغنا»** (`feedback.js`): سطرُ سياق البلاغ يحمل نسخةَ
  // القشرة العاملة إن وصلت — فلا سؤالٌ ثانٍ للقشرة ولا رقمٌ يُكتب في موضعين.
  const line = h('p', { class: 'note sw-version', id: 'app-version' },
    'نسخةُ التطبيق العاملة: جارٍ السؤال…');
  const sw = typeof navigator !== 'undefined' && navigator.serviceWorker;
  const controller = sw && sw.controller;
  if (!controller) {
    line.textContent = 'نسخةُ التطبيق العاملة: لم تُسجَّل قشرةُ العمل دون إنترنت بعد'
      + ' — تظهر النسخةُ بعد أول فتحةٍ مكتملة (أو بعد تثبيت التطبيق).';
    return line;
  }
  const channel = new MessageChannel();
  const timer = setTimeout(() => {
    if (line.isConnected) line.textContent = 'نسخةُ التطبيق العاملة: لم تُجب القشرة.';
  }, 3000);
  channel.port1.onmessage = (event) => {
    if (event.data?.type !== 'version') return;
    clearTimeout(timer);
    line.dataset.v = String(event.data.version);   // تقرؤه «بلِّغنا» فيدخل السياقَ
    line.replaceChildren('نسخةُ التطبيق العاملة على هذا الجهاز: ',
      h('b', { class: 'sw-version-num' }, String(event.data.version)),
      ' — وهي نسخةُ القشرة التي تعمل الآن، لا التي في الخادم.');
  };
  controller.postMessage({ type: 'version' }, [channel.port2]);
  return line;
}

function backupSection(rerender) {
  const slot = h('div', { class: 'confirm-slot' });
  const storage = h('p', { class: 'hint' }, 'التخزين على هذا الجهاز: جارٍ الفحص…');

  /* ————— سطرُ الأصوات المخزونة —————

     **حالُ التحميل تُرى وتُدار** (أمر المالك في اقرأ، ١٣ أغسطس ٢٠٢٦): كان الخزنُ
     يجري صامتاً فلا يعرف أحدٌ أتمَّ أم لا — حتى فُتح التطبيقُ بلا شبكةٍ فصمت الصوت،
     وظُنّ العيبُ في البرنامج. فصار السطرُ **شريطاً حيّاً** يتحرّك مع كل دفعةٍ يبلّغها
     عاملُ الخدمة، ومعه **زرٌّ يبدأ التحميل الآن** بدل انتظار مهلة الشفاء.
     **وهو ينام حتى يُولَّد البنك** (الجلسة ص): لا سطرَ قبل أن يُعرَف أنّ ثمّ ما يُخزَّن. */
  const cached = h('p', { class: 'hint' });
  const bar = h('div', { class: 'dl-bar' }, h('span', { class: 'dl-fill' }));
  const fill = bar.firstChild;
  const dlBtn = h('button', { class: 'btn' }, 'نزّل الأصوات الآن');
  const dlRow = h('div', { class: 'dl' }, cached, bar, dlBtn);
  dlRow.hidden = true;

  const paint = (stored, total, busy) => {
    if (!total) return;
    dlRow.hidden = false;
    const pct = Math.min(100, Math.round((stored / total) * 100));
    fill.style.width = `${pct}%`;
    bar.classList.toggle('dl-bar--done', stored >= total);
    const head = `الأصوات المخزونة: ${arNum(stored)} من ${arNum(total)} (${arNum(pct)}٪)`;
    cached.textContent = stored >= total
      ? `${head} — كلُّها على الجهاز، فيعمل التطبيق بلا إنترنت.`
      : busy
        ? `${head} — يُنزَّل الآن، أبقِ التطبيق مفتوحاً.`
        : `${head} — ما نقص يُجلَب عند سماعه، ويكتمل حين يُفتح التطبيق متصلاً.`;
    dlBtn.hidden = stored >= total;
    dlBtn.textContent = busy ? 'يُنزَّل…' : 'نزّل الأصوات الآن';
    dlBtn.disabled = Boolean(busy);
  };

  /** طلبٌ صريح إلى عامل الخدمة — هو وحدَه يملك المخزن. */
  dlBtn.onclick = () => {
    const sw = navigator.serviceWorker?.controller;
    if (!sw) return void toast('التحميل يبدأ بعد تثبيت التطبيق');
    sw.postMessage({ type: 'audio-sync' });
    dlBtn.disabled = true;
    dlBtn.textContent = 'يُنزَّل…';
  };

  // بلاغاتُ العامل بعد كل دفعة — فالشريطُ يتحرّك بما يجري لا بتقديرٍ منّا
  navigator.serviceWorker?.addEventListener?.('message', (e) => {
    if (e.data?.type === 'audio-progress') paint(e.data.stored, e.data.total, e.data.busy);
  });
  progress.audioStored().then((count) => {
    if (count) paint(count.stored, count.total, false);
  });

  progress.persistedStorage().then((persisted) => {
    if (!storage.isConnected) return;
    storage.textContent = persisted === null
      ? 'هذا المتصفّح لا يعلن حال تخزينه — والنسخة الاحتياطية تكفيك مؤونته.'
      : persisted
        ? 'تخزين هذا الجهاز موسومٌ دائماً: لا يخليه المتصفّح عند ضيق المساحة.'
        : 'لم يسم المتصفّح تخزين التطبيق دائماً بعدُ — قد يُخليه عند ضيق المساحة،'
          + ' فاحتفظ بنسخةٍ حديثة. (تثبيت التطبيق على الشاشة الرئيسية يرجّح تثبيته.)';
  });

  const file = h('input', {
    type: 'file',
    accept: '.json,application/json',
    class: 'file-pick',
    'aria-label': 'اختر ملف نسخةٍ لاستعادته',
    onchange: async (event) => {
      const chosen = event.target.files?.[0];
      if (!chosen) return;
      const read = progress.readBackup(await chosen.text());
      file.value = '';                       // كي يقبل اختيار الملف نفسه ثانيةً
      if (read.error) {
        slot.replaceChildren(h('p', { class: 'note note--bad' }, read.error));
        return;
      }
      const sum = progress.backupSummary(read.bundle);
      askThen(slot, {
        question: 'استعادة هذه النسخة؟',
        body: `فيها: ${summaryText(sum)}. وستحلّ محلّ ما في هذا الجهاز الآن`
          + ` (${summaryText(progress.backupSummary(progress.backup()))}) — فلا رجعة بعدها.`,
        yes: 'استعِد الآن',
        onYes: () => {
          if (!progress.restore(read.bundle)) {
            slot.replaceChildren(h('p', { class: 'note note--bad' }, 'تعذّرت الاستعادة.'));
            return;
          }
          toast('استُعيد تقدّم طفلك');
          rerender();
        },
      });
    },
  });

  return h('div', {},
    h('p', { class: 'hint' },
      'تقدّم طفلك محفوظ في هذا الجهاز وحده — لا حساب ولا سحابة. فاحفظ نسخةً بين'
      + ' حينٍ وآخر: ملفٌّ صغير يعيد رحلته كما هي إن حذفتَ التطبيق أو بدّلتَ الجهاز.'),
    h('div', { class: 'row', css: { 'justify-content': 'flex-start' } },
      h('button', {
        class: 'btn btn--primary backup-save',
        onclick: () => { saveBackupFile(); toast('حُفظت نسخةُ التقدّم'); },
      }, 'انسخ تقدّم طفلي'),
      // الملصق زرٌّ بحقّ: يُفتح باللمس وبالفأرة **وبلوحة المفاتيح** — ومدخلُ الملف
      // مخفيٌّ فيه لأن مظهره الأصليّ نصٌّ بلغة الجهاز لا بلغة اللوحة.
      h('label', {
        class: 'btn file-label',
        role: 'button',
        tabindex: '0',
        onkeydown: (e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          file.click();
        },
      }, 'استعِد من ملف', file),
    ),
    slot,
    dlRow,
    storage,
    h('p', { class: 'note' },
      'في النسخة: النجوم وصناديق المراجعة ودقائق التعلّم. ولا شيء فيها يخرج من'
      + ' جهازك إلا إن أرسلتَ الملفَّ بنفسك.'),
  );
}

/** اسم المحطة كما يقرؤه وليّ الأمر في قائمة الاختيار. */
const sectionLabel = (section, index) => `${arNum(index + 1)} — ${section.title || section.id}`;

function journeySection(rerender) {
  const sections = progress.journey();
  if (!sections.length) {
    return h('p', { class: 'hint' },
      'لا محطة في الرحلة بعد — تُكتب بيانات المنهج ثم تظهر هنا محطةً محطة.');
  }

  const next = progress.nextNode();
  const here = sections.findIndex((s) => (s.nodes || []).some((n) => n.id === next?.id));

  // ١) تخطٍّ للأمام: القفل التسلسلي طوعُ وليّ الأمر — لطفلٍ يعرف ما قبله أصلاً
  const nodePick = h('select', { class: 'chip pick', 'aria-label': 'العقدة التي يُفتح الطريق إليها' },
    sections.map((section, i) => h('optgroup', { label: sectionLabel(section, i) },
      (section.nodes || []).map((node) => h('option', { value: node.id }, node.title || node.id)))));
  if (next) nodePick.value = next.id;
  const openSlot = h('div', { class: 'confirm-slot' });

  const openBtn = h('button', {
    class: 'btn open-to',
    onclick: () => {
      const node = progress.findNode(nodePick.value);
      const count = progress.pendingBefore(nodePick.value);
      if (!node) return;
      if (!count) { toast('هذه مفتوحة له أصلاً'); return; }
      askThen(openSlot, {
        question: `تفتح الطريق إلى «${node.title || node.id}»؟`,
        body: `${nodesText(count)} قبلها ستُعدّ منجَزةً بنجمةٍ واحدة — تبقى مفتوحةً`
          + ' يلعبها متى شاء، ولا تُنقَص نجمةٌ كسبها. والقياس لا يتغيّر: لم يُمتحن فيها'
          + ' بعد — وقيدُ الاقتران قائم: لا يقرأ كلمةً لم يتقنها سمعاً ولو فُتح طريقُها.',
        yes: 'افتح الطريق',
        onYes: () => {
          toast(`فُتحت ${nodesText(progress.unlockUpTo(node.id))}`);
          rerender();
        },
      });
    },
  }, 'افتح الطريق إلى هنا');

  // ٢) إعادة التدريب: تصفير محطةٍ بعينها — نجومُها وحدها، وسجلّ ليتنر لا يُمسّ
  const sectionPick = h('select', { class: 'chip pick', 'aria-label': 'المحطة التي تُصفَّر' },
    sections.map((section, i) => h('option', { value: section.id }, sectionLabel(section, i))));
  if (here >= 0) sectionPick.value = sections[here].id;
  const resetSlot = h('div', { class: 'confirm-slot' });

  const resetBtn = h('button', {
    class: 'btn reset-section',
    css: { color: 'var(--err-text)' },
    onclick: () => {
      const index = sections.findIndex((s) => s.id === sectionPick.value);
      const section = sections[index];
      const info = progress.sectionProgress(sectionPick.value);
      if (!section || !info) return;
      if (!info.done) { toast('لم يبدأ هذه المحطة بعد'); return; }
      askThen(resetSlot, {
        question: `تصفّر محطة «${sectionLabel(section, index)}» ليعيدها؟`,
        body: `${nodesText(info.done)} فيها تعود إلى أولها و${arNum(info.stars)} نجمة تسقط،`
          + ' ويُقفل ما بعدها حتى يتمّها من جديد — ونجومُه هناك محفوظة تعود كما كانت.'
          + ' أما سجلّ مهاراته ودقائق تعلّمه فلا يمسّها التصفير.',
        yes: 'صفِّر المحطة',
        onYes: () => {
          toast(`صُفِّرت ${nodesText(progress.clearSection(section.id))}`);
          rerender();
        },
      });
    },
  }, 'صفِّر هذه المحطة');

  return h('div', {},
    h('p', { class: 'hint' },
      'الرحلة مقفلة بالتسلسل: لا تُفتح عقدةٌ قبل ما قبلها. وهنا تتجاوز القفل إن كان'
      + ' طفلك يعرف ما قبله، أو تعيد محطةً كاملة إن رأيت أن يعيد تدريبها.'),
    h('div', { class: 'row parent-tool' }, nodePick, openBtn),
    openSlot,
    h('div', { class: 'row parent-tool' }, sectionPick, resetBtn),
    resetSlot,
  );
}

// ————— أقسامُ المهارة: **جملةٌ فعلية لا درجة** (`METHOD.md §٧`) —————
//
// **وهذه الوحدةُ تُترجم ولا تخترع**: أسماءُ الوحدات وعباراتُها بياناتُ منهج
// (`UNIT_UNITS` في `curriculum.js`)، **والمدى يُقرأ من سجلّ ليتنر الحيّ**: أقصى ما
// بلغ صندوقَ الإتقان في «يفعل»، ومدى أضعف مهارةٍ في «يحتاج».
//
// **ولا درجةَ ولا نسبة**: عددا الصواب والخطأ يبقيان في `title` لمن أراد التفصيل،
// وما يقع عليه بصرُ الوالد **جملةٌ فعلية**.

/**
 * سطرُ وحدةٍ واحدة من حصيلتها في ليتنر — دالّةٌ خالصة (تُختبَر بسجلٍّ مصنوع).
 *
 * @param {object} stat  عنصرٌ من `progress.unitStats()` (وفيه `parts` بالأضعف أولاً)
 * @param {number} today رقمُ اليوم — لقياس طول التعثّر (`STUCK_DAYS`)
 * @returns {object|null} و`null` لوحدةٍ لا تعرفها بياناتُ المنهج — فلا يُعرَض للوالد
 *   مفتاحٌ خام، ويمسكه حارسُ اللوحة يومَ يُكتب.
 */
export function unitLine(stat, today = progress.dayNumber()) {
  const spec = unitOf(stat.unit);
  if (!spec) return null;
  const parts = stat.parts || [];
  const weakest = parts[0];                       // `unitStats` رتّبها بالضعف
  /**
   * ————— **المعدودُ مدىً لا مفتاح، والمتقَنُ ما أُتقن كلُّه** (تصحيحُ الجلسة ٨) —————
   *
   * المدى الواحد (`cat`) يُسأل بمفاتيحَ عدّة (تُلمَس صورتُه · يُنفَّذ أمرُه · تُدمَج
   * أصواتُه)، فعدُّ المفاتيح **يكرّر الاسمَ في السطر** («يعرف cat، cat سمعاً» — رآه
   * أوّلُ عرضٍ للوحة على عينٍ بشرية) ويضخّم العددَ على الوالد. فتُجمَع مفاتيحُ المدى
   * تحته، **ولا يُعَدّ متقَناً إلا بإتقانها كلِّها** — وهي قاعدةُ صفّ الحقول عينُها
   * (`listenFields`)، فلا يقرأ الوالدُ في لوحةٍ واحدة رقمين بقاعدتين.
   */
  const byRange = new Map();
  for (const part of parts) byRange.set(part.range, [...(byRange.get(part.range) || []), part]);
  const done = [...byRange]
    .filter(([, keys]) => keys.every((s) => s.box >= progress.MASTERED_BOX))
    .map(([range]) => range);
  /**
   * **وما جاوز العدَّ يُعَدّ لا يُسرَد**: مسارُ السمع خمسُ مئةِ مدخل، فسردُ ما أتقن
   * مدىً مدىً يصير **جدارَ كلماتٍ لاتينية** في لوحةٍ عربية لا يقرؤه والدٌ ولا ينتفع
   * به. فالقليلُ يُسمّى بأسمائه (ينتفع بها: «يعرف cat وdog»)، والكثيرُ يُعَدّ عدّاً —
   * **وتفصيلُه في صفّ الحقول** (`fieldsSection`)، وهو نصُّ البند: «بالحقول والمهارات».
   */
  const reached = done.length > NAME_LIMIT && spec.count
    ? arCount(done.length, spec.count)
    : done.map((range) => rangeText(range, stat.unit)).filter(Boolean).join('، ');
  const fill = (text, what) => String(text || '').replace('{ما}', what);

  // ثلاثُ حالات: أتقن كلَّ تمارينه · تعثّر · بينهما — ولكلٍّ عبارتُها من بيانات المنهج
  const state = stat.mastered ? 'mastered' : stat.struggling ? 'struggling' : 'learning';
  const stuck = Boolean(stat.struggling && weakest
    && today - (weakest.since ?? weakest.seen ?? today) >= STUCK_DAYS);
  const learning = weakest ? `يتدرّب على ${rangeText(weakest.range, stat.unit)}` : '';
  const line = state === 'mastered'
    ? fill(spec.does, reached)
    : state === 'struggling'
      ? fill(spec.needs, rangeText(weakest.range, stat.unit))
      // **وما أتقنه يُقال قبل ما يتدرّب عليه**: الوالدُ يقرأ تقدّمَ طفله لا نقصَه
      : [reached && fill(spec.does, reached), learning].filter(Boolean).join('، و');

  return {
    unit: stat.unit,
    section: spec.section,
    title: spec.title,
    line,
    state,
    stuck,
    right: stat.right,
    wrong: stat.wrong,
  };
}

/**
 * أسطرُ الوحدات كلُّها من السجلّ الحيّ — **بترتيب اللوحة ثم بترتيب الرحلة**:
 * الأقسامُ كما أعلنها المنهج (السمعُ ثم الحرف)، وداخلَ القسم يقرأ الوالدُ الوحداتِ
 * بالترتيب الذي لقيها طفلُه لا بترتيب حروفها اللاتينية.
 */
export function unitLines(stats = progress.unitStats(), today = progress.dayNumber()) {
  const order = UNIT_SECTIONS.map((s) => s.id);
  const flow = journeyUnits();
  return stats.map((stat) => unitLine(stat, today)).filter(Boolean)
    .sort((a, b) => order.indexOf(a.section) - order.indexOf(b.section)
      || flow.indexOf(a.unit) - flow.indexOf(b.unit));
}

/**
 * ————— **قسمُ السمع بالحقول** (بندُ الجلسة ٨: «بالحقول والمهارات لا بالدرجات») —————
 *
 * الوالدُ لا يسأل «أيَّ كلمةٍ يعرف؟» بل «**ماذا صار يفهم؟**» — فيُعرَض حقلٌ حقل
 * بترتيب الأثر الذي رتّبه المنهج (الأهلُ ثم الجسدُ ثم الحيوانات…)، ولكلٍّ **كم أتقن
 * من كم**. والحقولُ ومفاتيحُها من `curriculum.js`، والإتقانُ من ليتنر — دالّةٌ خالصة.
 */
export function fieldLines(fields = listenFields(), mastered = progress.isMastered) {
  return fields.map((field) => ({
    id: field.id,
    title: field.title,
    // **والكلمةُ متقنةٌ سمعاً إذا أتقن كلَّ ما سُئل عنه فيها** (لا بعضَه): تُلمَس
    // صورتُها وينفَّذ أمرُها وتُدمَج أصواتُها — فمن أتقن اللمسَ وحدَه لم يتقنها بعد.
    done: field.words.filter((word) => word.keys.every(mastered)).length,
    all: field.words.length,
  })).filter((row) => row.all > 0);
}

function fieldsSection(rows = fieldLines()) {
  const touched = rows.filter((row) => row.done > 0);
  return h('div', {},
    h('p', { class: 'hint' },
      touched.length
        ? 'وهذه حقولُ ما يسمعه — كم كلمةً أتقن من كلٍّ. والكلمةُ تُعَدّ متقنةً إذا'
          + ' أصاب فيها كلَّ ما سُئل عنه (صورتُها وأمرُها وأصواتُها) مرّاتٍ متباعدة،'
          + ' لا مرّةً واحدة.'
        : 'تظهر هنا حقولُ ما يسمعه (الأهلُ والحيواناتُ والطعام…) وكم أتقن من كلٍّ —'
          + ' حين يتقن أوّلَها.'),
    h('div', { class: 'audit-row fields' }, rows.map((row) => h('span', {
      class: `pill field${row.done === row.all ? ' field--done' : ''}`,
      css: row.done ? {} : { opacity: '.55' },
    }, `${row.title}: `, h('b', {}, `${arNum(row.done)} من ${arNum(row.all)}`)))),
  );
}

function unitsSection(lines) {
  if (!lines.length) {
    return h('p', { class: 'hint' },
      'لم يُقَس شيءٌ بعد — تظهر هنا مهاراتُه بعباراتها (ما يسمعه ويفهمه، وما يفكّه'
      + ' مكتوباً) حين يبدأ رحلته.');
  }
  const colour = (state) => (state === 'mastered' ? GOOD : state === 'struggling' ? BAD : ACCENT);
  const row = (item) => h('div', {
    class: `unit unit--${item.state}`,
    css: { '--chip': colour(item.state) },
    // **التفصيلُ عند الطلب لا في السطر**: مَن أراد العددَ وجده، ولا يزاحم العبارةَ
    title: `${item.title}: ${arNum(item.right)} صواب، ${arNum(item.wrong)} خطأ`,
  },
    h('b', {}, item.title),
    h('span', { class: 'unit-line' }, item.line));

  return h('div', { class: 'units' }, UNIT_SECTIONS.map((section) => {
    const mine = lines.filter((item) => item.section === section.id);
    return h('div', { class: 'unit-group' },
      h('h4', {}, section.title),
      mine.length
        ? mine.map(row)
        // **وقسمٌ لم يبلغه بعدُ يقول ذلك** ولا يُخفى: الوالدُ يرى الرحلةَ كلَّها
        : h('p', { class: 'hint' }, 'لم يبلغ هذا القسم بعد.'));
  }));
}

// ————— **قيدُ الاقتران مرئياً: «يقرأ ما أتقن سمعَه»** (`METHOD.md §٦` · بندُ الجلسة ٨) —————
//
// **العهدُ الذي يميّز هذا التطبيق يُرى في لوحة والده**: مساران مقترنان لا متعاقبان،
// فلا كلمةَ تُعرَض مكتوبةً قبل أن تثبت في أذنه. وهو قيدٌ **بنيويّ** يفرضه `readableAt`
// ويجرده `check_coupling` — ولكنّ الوالدَ لا يرى بنيةً، فيراه **عدّاداً حيّاً**.
//
// **وكلُّ رقمٍ فيه مقروءٌ من سجلّ ليتنر**: لا عددَ مكتوبٌ بيد ولا نسبةَ تُقدَّر —
// الحوضُ من المنهج (`coupledWords`)، والحالُ من القياس (`isMastered` · `getSkill`).

/**
 * عدّادُ الاقتران — دالّةٌ خالصة (تُختبَر بسجلٍّ مصنوع، وبها معيارُ القبول: كلمةٌ
 * متقنةٌ سمعاً غيرُ مقروءةٍ **تظهر في عدّاده**).
 *
 * `heard` ما بلغ صندوقَ الإتقان في مفتاحه السمعي · `read` ما لقيه الطفلُ **مكتوباً
 * فعلاً** (له قياسٌ في مفتاح قراءةٍ — `build`/`decode`/`tricky…read`) · `waiting` ما
 * نضج سمعاً وينتظر درجةَ رمزه. **والفرقُ هو القيدُ نفسُه في رقم**.
 *
 * @param {object} deps حَقنُ الاعتماد للاختبار (الحوضُ ودالّتا القياس)
 */
export function couplingCount({
  pool = coupledWords(),
  mastered = progress.isMastered,
  measured = progress.getSkill,
} = {}) {
  const heard = pool.filter((word) => mastered(word.listen));
  const read = heard.filter((word) => word.read.some((key) => measured(key)));
  return { pool: pool.length, heard: heard.length, read: read.length,
    waiting: heard.length - read.length };
}

const wordsText = (n) => arCount(n, ['كلمةٌ واحدة', 'كلمتان', 'كلمات', 'كلمة']);

function couplingSection(count = couplingCount()) {
  return h('div', {},
    h('div', { class: 'audit-row coupling' },
      pill('أتقن سمعاً', `${arNum(count.heard)} من ${arNum(count.pool)}`),
      pill('صارت مقروءةً عنده', arNum(count.read)),
      pill('تنتظر درجةَ رمزها', arNum(count.waiting)),
    ),
    h('p', { class: 'hint' },
      `من كلمات القراءة كلِّها (${arNum(count.pool)}) أتقن سمعاً ${wordsText(count.heard)}،`
      + ` وقرأ منها مكتوبةً ${arNum(count.read)} — والباقيةُ (${arNum(count.waiting)}) نضجت في`
      + ' أذنه وتنتظر أن تبلغ رحلتُه درجةَ رموزها.'),
    h('p', { class: 'note' },
      h('b', {}, 'يقرأ ما أتقن سمعَه. '),
      'هذه قاعدةُ التطبيق لا خيارَ فيها: لا تدخل كلمةٌ تمرينَ قراءةٍ حتى يثبت معناها في'
      + ' أذنه أوّلاً — كي لا يصير فكُّ الحروف نطقاً بلا معنى. فإن رأيتَ كلمةً يعرفها'
      + ' سمعاً ولمّا يقرأها بعد، فذاك الترتيبُ يعمل لا تأخّرٌ فيه.'),
  );
}

/**
 * **حدُّ النطاق في اللوحة** (`METHOD.md §١٣`): «التعثّرُ المتكرر إشارةُ «راجِع
 * مختصاً» لا حكماً — تدريسٌ لا تشخيص».
 *
 * فالسياسةُ مكتوبةٌ دائماً (أدناه في اللوحة)، **والإشارةُ تُرفَع حين تقع**: وحدةٌ
 * تعثّر فيها ثلاثةَ أسابيع فأكثر وما زالت في الصندوق الأدنى — تُسمّى باسمها، بلا
 * لفظِ حكمٍ ولا تشخيصٍ ولا نسبة.
 */
function stuckNote(lines) {
  const stuck = lines.filter((item) => item.stuck);
  if (!stuck.length) return null;
  return h('p', { class: 'note note--bad unit-stuck' },
    h('b', {}, 'راجِع مختصاً — إشارةٌ لا حكم. '),
    `تعثّر طفلك أسابيعَ متّصلة في: ${stuck.map((item) => item.title).join('، ')}.`
    + ' وهذا التطبيق يدرّس ويقيس ولا يشخّص — فأرِ طفلك مختصاً ليطمئنّ قلبك،'
    + ' وواصِلا اللعب معاً كما أنتما: مراجعتُه اليومية تعيد هذه المهارات بنفسها.');
}

function dashboard(rerender = () => {}) {
  const due = progress.dueSkills();
  const next = progress.nextNode();
  const today = progress.secondsOn();
  const week = progress.usageDays(7);
  const streak = progress.reviewStreak();
  const lines = unitLines();
  const tip = recommend({
    started: progress.totalStars() > 0,
    dueCount: due.length,
    secondsToday: today,
    reviewDone: Boolean(progress.reviewOf()),
    nextTitle: next?.title || '',
  });

  const section = (title, ...children) => [h('h3', {}, title), ...children];

  const main = h('main', { class: 'screen-card audit' },
    // **واسمُ التطبيق عربياً هنا** (ثنائيةُ الهوية): لوحةُ الوالد نصٌّ عربيٌّ
    // يقرؤه بالغ، فيُسمّى فيها التطبيقُ باسمه «اِسْمَعْ» لا بعلامته المرسومة —
    // والمصدرُ `BRAND` في `ui.js` وحدَه.
    h('h2', {}, `لوحة وليّ الأمر · ${BRAND}`),

    h('div', { class: 'audit-row' },
      pill('اليوم', minutesText(today)),
      pill('هذا الأسبوع', minutesText(week.reduce((s, d) => s + d.seconds, 0))),
      pill('المجموع', minutesText(progress.totalSeconds())),
      pill('النجوم', `${arNum(progress.totalStars())} / ${arNum(progress.maxTotalStars())}`),
      pill('مراجعات متتابعة', arNum(streak)),
    ),

    ...section('توصية اليوم',
      h('div', { class: 'note', css: { 'text-align': 'start' } },
        h('b', {}, tip.title),
        h('p', { class: 'hint', css: { margin: '.25rem 0 0' } }, tip.body)),
      tip.action && h('div', { class: 'row', css: { 'justify-content': 'flex-start', 'margin-top': '.75rem' } },
        h('button', { class: 'btn btn--primary', onclick: () => go(tip.action.hash) }, tip.action.label)),
      // **وسقفُ اليوم معلَنٌ دائماً لا يومَ يُبلَغ** (`METHOD.md §١٢-٨`): الوالدُ يقرأ
      // الحدَّ وعلّتَه قبل أن يصل إليه، فيعرف أنّ القِصَرَ منهجٌ لا نقصُ مادّة.
      h('p', { class: 'note parent-cap' },
        h('b', {}, `سقفُ اليوم: ${arNum(ENOUGH_MINUTES)} دقيقة. `),
        `اليومَ ${minutesText(today)} منها. ولغةٌ ثانية تُبنى بالقليل المتّصل لا بالكثير`
        + ' المتقطّع — وهذا الحدُّ قرارُ منهجٍ مكتوب، فبعده نوصي بالاستراحة ونعيده غداً.')),

    ...section('ما يعرفه طفلك', unitsSection(lines), stuckNote(lines)),

    ...section('حقولُ ما يسمعه', fieldsSection()),

    ...section('يقرأ ما أتقن سمعَه', couplingSection()),

    ...section('دقائق آخر سبعة أيام',
      h('div', { class: 'audit-row' }, week.map((day) => {
        const d = new Date(`${day.key}T00:00:00`);
        const minutes = Math.round(day.seconds / 60);
        return h('span', {
          class: 'pill',
          css: day.seconds ? { color: 'var(--star-text)' } : { opacity: '.55' },
        }, `${DAY_NAMES[d.getDay()]}: `, h('b', {}, minutes ? arNum(minutes) : '—'));
      })),
      h('p', { class: 'hint' }, 'الزمن يُحسب وقت انتباهه للشاشة فقط (لا يُحسب إن تركها مفتوحة).')),

    ...section('أين هو الآن',
      h('p', { class: 'hint' }, next
        ? `التالي: ${next.title || next.id}.`
        : 'لا محطة تالية — الرحلة تُكتب بعد.'),
      h('p', { class: 'hint' },
        `بانتظار التثبيت الآن: ${arNum(due.length)} من ${arNum(progress.skills().length)} مهارة سُجّلت.`)),

    // **البابان الاختياريان** (الجلسة ب): وضعُ الدعم يقول **كيف يمشي**، وامتحانُ
    // اللحاق يقول **من أين يبدأ** — متعامدان بالبناء، وبابُهما هذه اللوحةُ وحدَها.
    ...section('وضعُ الدعم', supportSection(rerender)),

    ...section('امتحان اللحاق — لطفلٍ يعرف بعضَ الإنكليزية', placementSection(rerender)),

    ...section('نسخة احتياطية من تقدّمه', backupSection(rerender)),

    ...section('تحكّم في الرحلة', journeySection(rerender)),

    ...section('معاينةُ التطبيق كلِّه', previewSection()),

    // **«بلِّغنا»** (قرارُ المالك ١٥ أغسطس — نمطُ العائلة): بابُ الراشد لا الطفل،
    // فموضعُه هذه اللوحةُ خلف بوابتها الحسابية. **ووحدتُه مفصولة** (`feedback.js`)
    // فيبقى هذا الملفُّ صفرَ عناوينَ خارجية — يقيسه `tools/test_feedback.mjs`.
    ...section('بلِّغنا', feedbackSection()),

    // **حدودُ النطاق معلَنةٌ في ذيل اللوحة نفسِها** (`METHOD.md §١٣` — بندُ الجلسة ٨):
    // تدريسٌ وقياسٌ لا تشخيص، ولا قياسَ نطقٍ ولا كتابةَ يد، وفئةٌ لا تُمدَّد ضمنياً،
    // ورحلةٌ لها آخِرٌ معلوم. **والترديدُ يُدعى ولا يُقاس** (§١٢-٥) — يُعلَن للوالد
    // نصّاً لأنّه أوّلُ ما يسأل عنه: «لِمَ لا يصحّح له التطبيقُ نطقَه؟».
    ...section('ما يفعله هذا التطبيق وما لا يفعله',
      h('p', { class: 'note' },
        'المهارة = الوحدة × المدى × نوع التمرين. الخطأ يعيدها إلى مراجعة الغد،'
        + ' والإصابة تُباعد موعدها (١ ← ٢ ← ٤ ← ٨ ← ١٦ يوماً).'
        + ' ويقرأ طفلك ما أتقن سمعَه وحدَه — لا كلمةَ تُعرَض مكتوبةً قبل أن تثبت في أذنه.'),
      h('p', { class: 'note say-not-scored' },
        h('b', {}, 'الترديدُ يُدعى ولا يُقاس. '),
        'بعد كل إجابةٍ صحيحة يقول المعلّمُ الكلمةَ ويدعو طفلك أن يقولها معه — ولا يسجّل'
        + ' صوتَه ولا يحكم على نطقه. تقييمُ النطق يحتاج أذناً بشرية أو خدمةً على'
        + ' الإنترنت، والأولى عندك أنت والثانية خارج عهدنا (لا يخرج من هذا الجهاز شيء).'),
      h('p', { class: 'note scope-note' },
        h('b', {}, 'وحدودُ ما نعد به. '),
        'نعلّم ونقيس فهماً مسموعاً وقراءةً — لا نطقاً ولا كتابةَ يد (تلك بابٌ آخر).'
        + ' والفئةُ: السادسة ± سنة، خرّيجُ «اِقْرَأْ» أو في أثنائه.'
        + ' والرحلةُ تنتهي عند تمام رصيد Starters سمعاً والمرحلة الخامسة من سلّم الفكّ'
        + ' — وما بعدها أفقٌ لا وعد. وهذا التطبيق يدرّس ويقيس ولا يشخّص: إن تكرّر'
        + ' تعثّرُ طفلك في مهارةٍ واحدة أسابيع فراجِع مختصاً — هذه إشارةٌ لا حكم.')),

    versionLine(),
  );

  return h('div', { class: 'screen', css: { '--accent': ACCENT } },
    topbar(
      h('button', { class: 'btn', onclick: () => go('#/') }, '→ الخريطة'),
      h('span', { class: 'spacer' }),
      h('span', { class: 'pill' }, 'لوحة وليّ الأمر'),
    ),
    main,
  );
}

/**
 * الشاشة: البوابة أولاً، ثم اللوحة — والفتح يبقى ما دامت الصفحة مفتوحة.
 *
 * **وامتحانُ اللحاق يحلّ محلّ اللوحة خلف بوابتها** (لا مسارَ ثانياً في `main.js`):
 * فلا يبلغه طفلٌ بعنوانٍ يكتبه في شريط المتصفّح. ويعود إلى اللوحة بـ`onDone`،
 * ومغادرةُ الشاشة تُنهيه (المستمعُ في `placementSection`).
 */
export function renderParent(rerender) {
  if (!unlocked) {
    return gateScreen(() => {
      unlocked = true;
      rerender();
    });
  }
  if (examining) {
    const exam = placement.renderPlacement({
      onDone: () => { examining = false; rerender(); },
    });
    if (exam) return exam;
    examining = false;      // لم تبق درجةٌ تُمتحَن: اللوحةُ نفسُها لا شاشةٌ فارغة
  }
  return dashboard(rerender);
}

/** لإعادة إغلاق البوابة في الاختبارات. */
export function lockGate() {
  unlocked = false;
  examining = false;
}
