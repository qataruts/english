// بوابةُ اللحاق — امتحانُ تحديد المستوى الاختياريّ (الجلسة ب، ١٧ أغسطس ٢٠٢٦).
//
// **الغاية** (قاعدةُ المالك — بلاغ `2026-08-16-catchup-gate-rule.md`): جمهورُنا ليس
// المبتدئَ من الصفر وحدَه؛ تلميذُ المدرسة والمركز يصل بمستوىً قائم — يعرف بعضَ
// الكلمات سمعاً وربما بعضَ الحروف — وإجبارُه على أوّل السلّم مللٌ فهجر. ورحلتُنا
// **اثنتان وستون عقدة**، فالبدءُ من أوّلها لمن أثبت ربعَها ظلمٌ للوقت. فيُمتحَن
// **فيُفتح له ما أثبته ويقف حيث ينكسر**.
//
// وهو **اختياريّ**: بابُه الوحيد قسمٌ في لوحة وليّ الأمر، فلا يراه طفلٌ ولا يقع
// بنقرةٍ عابرة — **ولا مسارَ له في `main.js`** فلا يبلغه عنوانٌ يُكتب في شريط المتصفّح.
//
// ————— القيودُ الخمسة (نصُّ البلاغ)، وقيدُنا السادس —————
//
// ١) **اختياريٌّ ومن لوحة وليّ الأمر حصراً** — لا زرَّ في شاشة طفل (يجرده حارسُه).
// ٢) **يفتح ما أُثبت لا ما ادُّعي**: سلّميٌّ يصعد شريحةً شريحة ويقف عند أوّل شرخ،
//    **ولكلِّ محطةٍ في الشريحة مفتاحٌ مضمون في كل محاولة** (`PER_STATION`) — فلا
//    تُفتح محطةٌ لم يُذكَر منها شيء، والتغطيةُ **تُحسب لا تُوعَد**.
// ٣) **صرامتُه صرامةُ بوابات الإتقان**: `passed` من `gate.js` **بأعيانها** لا رقمٌ
//    يُكتب هنا — فلو تحرّكت الثمانون غداً تحرّكتا معاً. **والبواباتُ الثلاث لا
//    تُقفز**: تُجتاز بنفسها، فتقصُر السلّمَ عندها.
// ٤) **نتائجُه تُزرع في ليتنر قياساً حقيقياً بمفاتيحَ حقيقية بلا وسم**: `renderSession`
//    تكتب محاولاته كما تكتب محاولةَ المراجعة — **ولا تُقيَّد مراجعةَ يوم** (امتحانُ
//    موضعٍ لا جلسةُ تثبيت)، **والمراجعةُ اليومية شبكةُ أمانه** إن سخا الفتح.
// ٥) **فتحٌ لا قفل**: نجمةٌ واحدة تفكّ القفل ولا تدّعي إتقاناً، ولا تُنقَص نجمةٌ
//    كسبها بيده، والإعادةُ تستأنف من آخر حدّ ولا تغلق شيئاً.
//
// ————— **٦) وقيدُنا الذي لا نظيرَ له عند الإخوة: المساران مقترنان** —————
//
// عندنا **جبهتان** (`METHOD.md §١`)، و«لا كلمةَ تُقرأ قبل إتقانها سمعاً». فدرجةُ
// السلّم عندنا **شريحةٌ لا محطة** (قسمُ الرحلة وما يلحق به)، **وقيدُ الاقتران يُحترَم
// في الفتح**: لا يُفتَح حرفٌ لكلمةٍ لم تُثبَت سمعاً **ولو اجتاز الطفلُ درجتَه** —
// ويمرّ الحكمُ بـ`readableAt`/`readableTrickyAt` أنفسِهما (`coupledReadyAt` في
// `curriculum.js`) لا بنسخةٍ ثانية. **فالسلّمُ يقف عند الجدار كما يقف عند الشرخ**،
// ويُسمّى الجدارُ لوليّ الأمر في اللوحة: هذه الدرجةُ تنتظر أذنَ طفلك لا يدَه.
//
// ————— **٧) ومسطرةُ الامتحان الواحدة** (بلاغ `support-and-placement-coexist`) —————
//
// طفلٌ في وضع الدعم يُمتحَن هنا **بمقادير القائم لا بمقاديره**: ما **يريح** يسري
// (نموذجُ الصوت الأبطأ · الهدوءُ الحسّيّ) فلا يُمتحَن بشاشةٍ تُربكه ولا بنموذجٍ يفوته،
// وما **يجيب** يُمنع قطعاً (جرعةٌ وحوضٌ أضيق وتلقين) فلا يُفتح له بامتحانٍ أسهلَ من
// امتحان غيره. وموضعُ التعطيل `rungItems` أدناه — حيث تُبنى التمارين وتُقرأ المقادير.

import { stations, coupledReadyAt } from './curriculum.js';
import { GATE_SIZE, passed } from './gate.js';
import * as progress from './progress.js';
import { renderSession, sessionItems } from './review.js';
// **مسطرةُ الامتحان الواحدة**: يُستورَد نطاقُ الامتحان وحدَه — لا مقدارٌ من مقادير
// وضع الدعم يُقرأ في هذا الملفّ.
import { duringExam } from './support.js';
import { h, icon, faceEl, go, arNum, arCount, mascot, pick, shuffle, PAUSE_ACCENT } from './ui.js';

/**
 * **سقفُ عيّنة الدرجة: أثقلُ جلوسٍ مقرَّرٍ في رحلتنا** — وهو جلسةُ بوابة الإتقان
 * (`GATE_SIZE`) **مستوردٌ لا مكتوب** (درسُ اكتب): لا يطلب امتحانُ اللحاق من الممتحَن
 * في الجلوس ما لا تطلبه أيُّ محطةٍ من طفلها. وأثقلُ محطاتنا عشرُ جولات (محطةُ الحركات
 * القصار)، وجلسةُ المراجعة ستّ، والبوابةُ عشر — فيقابله حارسُه بالثلاثة محسوبةً من
 * المنهج، ومحطةٌ أثقلُ تدخل غداً **تحرّك السقفَ ولا تمرّ صامتة**.
 */
export const CAP = GATE_SIZE;

/**
 * عيّنةُ الدرجة الواحدة: ثمانيةُ تمارين — بين جلسة المراجعة (ستّ) وجلسة البوابة (عشر).
 * وهي **الأدنى**: إن احتاجت تغطيةُ محطات الشريحة أكثرَ منها زادت إلى قدرها ولم تتجاوز
 * `CAP` (القاعدةُ في `sizeFor` أدناه، ويحرسها بابُها).
 */
export const SAMPLE = 8;

/**
 * كم مفتاحاً يُضمَن من كل محطةٍ في الشريحة: **واحد**. وهو الحدُّ الأدنى الذي يجعل الفتحَ
 * **مُثبَتاً** — لا تُفتح محطةٌ لم تُمَسّ. وواحدٌ لا اثنان لأنّ شريحتنا الواحدة تبلغ
 * إحدى عشرةَ محطة، فمفتاحان من كلٍّ يتجاوزان أثقلَ جلوسٍ في الرحلة (القيد ٥).
 *
 * **ومحطتان تتشاركان مفتاحاً يكفيهما مفتاحٌ واحد**: مفتاحُ ليتنر (وحدة × مدى × نوع)
 * هو وحدةُ القياس عندنا، فمن أُثبت مفتاحُه أُثبت في كلِّ محطةٍ تدرّسه — **وعندنا هذا
 * واقعٌ لا فرض**: محطاتُ عودة الأذن في مسار الحرف تحمل **مفتاحَ زوجها نفسَه**
 * (`METHOD.md §٤` — «مهارةٌ واحدة تُمرَّن مرّتين لا مهارةٌ تنشقّ»).
 */
export const PER_STATION = 1;

/** نجمةُ الفتح: **واحدة** — تفكّ القفل ولا تدّعي إتقاناً (حكمُ `unlockUpTo` نفسُه). */
export const PLACEMENT_STARS = 1;

/**
 * **رؤوسُ الشرائح**: أقسامُ الرحلة كلُّها إلا البوابات (`stage` مرحلةُ سمعٍ · `era`
 * جزءُ عهدِ حرف). فالدرجةُ اليومَ شريحةٌ من قسمٍ واحد — **وصنفٌ جديد يُوضَع بينها غداً
 * يلحق بشريحة ما قبله** فيُمتحَن معها ويُفتح معها، بلا سطرٍ يُعدَّل هنا (وهو الحدُّ
 * الصامتُ الذي تُحقَن به `rungsOf` في حارسها).
 */
const HEADS = new Set(['stage', 'era']);

/**
 * وجوهُ الشاشة — **من أيقونات الواجهة الخطية** لا من رموز البيانات (`ICONS` في
 * `ui.js`): عينٌ تنظر للامتحان، وهديّةُ «فُتحت لك» لمن صعد درجة، ووثبةُ فرحٍ لمن أتمّ
 * السلّم، وابتسامةٌ لمن وقف — **وهي وجهُ «لَيْسَ بَعْدُ» في البوابة نفسُه**: لا وجهَ
 * عبوسٍ في هذا التطبيق.
 */
const FACES = { exam: 'eye', step: 'gift', done: 'party', stop: 'smile' };

// ————— السلّم —————

/**
 * **درجاتُ السلّم: شرائحُ الرحلة بترتيبها — مشتقّةٌ من `sections()` لا مكتوبة.**
 *
 * وثلاثةُ حدودٍ مرسومةٌ هنا لا في موضعٍ آخر، فتُقرأ حيث تعمل:
 *   • **البوابةُ التي لم تُجتز تقطع السلّم** — «تُجتاز بنفسها»؛ وإن كان الطفلُ قد
 *     عبَرها مضى السلّمُ إلى ما بعدها. **والمجتازةُ تُتخطّى ولا تُضمّ** إلى شريحة:
 *     لا يُفتح ما يُجتاز بنفسه.
 *   • **وقسمٌ ليس رأساً يلحق بشريحة ما قبله** — فما يُوضَع بين قسمين غداً يدخل
 *     شريحتَه يومَ يُوضَع.
 *   • **وقيدُ الاقتران جدارٌ يقف عنده السلّم**: قسمٌ فيه محطةٌ لم تنضج مادّةُ قراءتها
 *     سمعاً لا يُمتحَن ولا يُفتح — ولا يُمتحَن ما بعده (والقفلُ تسلسليّ فلا معنى
 *     لفتحِ ما بعد مقفول).
 *
 * **والقاعدةُ دالّةٌ خالصة** تُحقَن بالأقسام وبمن يعرف المجتازَ والرؤوسَ والناضج،
 * فيمتحنها حارسُها **بأقسامٍ مصنوعة**: بوابةٌ بين قسمين تقصُر السلّم، ومجتازةٌ لا
 * تقصُره، وقسمٌ ليس رأساً ينضمّ إلى شريحته، وجدارُ اقترانٍ يقف عنده. ولولا الحقنُ
 * لكان بعضُ الحدود **صامتاً** في رحلة اليوم — والحدُّ الصامت لا يُعرَف صحيحاً من فاسد.
 *
 * @param {object[]} list أقسامُ الرحلة بترتيبها (`progress.journey()`)
 * @param {(section) => boolean} crossed هل اجتاز هذا القسمَ (للبوابات)؟
 * @param {(section) => boolean} head أيبدأ هذا القسمُ شريحةً؟
 * @param {(section) => boolean} ready أنضجت مادّةُ قراءة هذا القسم سمعاً؟
 */
export function rungsOf(list, { crossed, head, ready = () => true }) {
  const parts = [];
  for (const section of list) {
    if (section.kind === 'gate') {
      if (crossed(section)) continue;
      break;
    }
    if (!ready(section)) break;
    if (head(section)) parts.push([section]);
    else if (parts.length) parts[parts.length - 1].push(section);
  }
  return parts.flatMap((slice) => split({
    id: slice[0].id,
    title: slice[0].title,
    sections: slice,
    nodes: slice.flatMap((section) => section.nodes || []),
  }));
}

/**
 * **شريحةٌ أثقلُ من سقف الجلوس تُشطَر أجزاءً متساوية** — ولا تُختصَر تغطيتُها في الظلّ.
 *
 * وعلّتُه مقيسة: عهدُنا الثاني قسمٌ من **إحدى عشرةَ محطة** وسقفُ الجلوس عشر، فلو
 * امتُحن كتلةً واحدة لَسقطت محطةٌ من الضمان (فتُفتح ولم تُمَسّ) أو لَجلس الطفلُ جلسةً
 * أثقلَ من أثقل محطةٍ في رحلته — وكلاهما نقضُ قيد. **فالوسطُ الصادق: يُشطَر السلّمُ
 * لا التغطية**، والشطرُ **متساوٍ** (كسنّة `evenChunks` في الخريطة) فلا يبقى ذيلٌ
 * لا يُفهَم لِمَ هو.
 */
function split(rung) {
  if (rung.nodes.length <= CAP) return [rung];
  const parts = Math.ceil(rung.nodes.length / CAP);
  const size = Math.ceil(rung.nodes.length / parts);
  const out = [];
  for (let i = 0; i < parts; i++) {
    const nodes = rung.nodes.slice(i * size, (i + 1) * size);
    if (!nodes.length) continue;
    out.push({
      ...rung,
      id: i === 0 ? rung.id : `${rung.id}#${i + 1}`,
      title: `${rung.title} — جزءٌ ${arNum(i + 1)} من ${arNum(parts)}`,
      // **والشطرُ معلَنٌ في الدرجة نفسِها** لا يُستنتَج من معرّفٍ ولا من عنوان
      part: i + 1,
      parts,
      nodes,
    });
  }
  return out;
}

/**
 * محطةٌ بمعرّف عقدتها — الرحلةُ تُقرأ من `curriculum.js` وحدَه.
 *
 * **وفهرسُها يُبنى مرّةً**: `stations()` تؤلّف المنهجَ كلَّه في كل نداء (بياناتُ منهجٍ
 * ثابتةٌ وقتَ التشغيل)، وهذا الملفُّ يسأل عن محطةِ كل عقدةٍ في كل درجةٍ في كل محاولة —
 * فبلا فهرسٍ يصير الامتحانُ يبني الرحلةَ آلافَ المرّات (قِيس: دقائقُ في حارسٍ واحد).
 * وهو نظيرُ `indexCache` في `progress.js` حرفاً.
 */
let index = null;
const stationOf = (id) => {
  if (!index) index = new Map(stations().map((s) => [s.id, s]));
  return index.get(id) || null;
};

/** أنضجت مادّةُ قراءة هذا القسم سمعاً؟ — **بالبابين نفسِهما** (`coupledReadyAt`). */
const sectionReady = (section, isMastered = progress.isMastered) =>
  (section.nodes || []).every((node) => {
    const station = stationOf(node.id);
    return !station || coupledReadyAt(station, isMastered);
  });

export function rungs() {
  return rungsOf(progress.journey(), {
    crossed: (section) => (section.nodes || []).every((node) => progress.isDone(node.id)),
    head: (section) => HEADS.has(section.kind),
    ready: sectionReady,
  });
}

/**
 * موضعُ الاستئناف: أوّلُ درجةٍ لم تكتمل عقدُها بعد — **«من آخر حدّ»**. فالإعادةُ لا
 * تُعيد امتحانَ ما فُتح، ولا حاجةَ إلى سجلٍّ ثانٍ يقول أين وقف: النجومُ تقوله.
 * (وتعود بطول القائمة إن لم يبق شيء — أي: لا امتحانَ له.)
 */
export function startRung(list = rungs()) {
  const at = list.findIndex((rung) => rung.nodes.some((node) => !progress.isDone(node.id)));
  return at < 0 ? list.length : at;
}

// ————— مادّةُ الدرجة: مفاتيحُ عقدها لا قائمةٌ تُكتب —————

/** محطاتُ الشريحة **التي تُقاس** — وهي التي تعلن مفاتيحَ ليتنر في المنهج. */
export const measuredNodes = (rung) =>
  rung.nodes.filter((node) => (stationOf(node.id)?.skills || []).length);

/** وما يُفتح تبعاً ولا يُقاس — ولا محطةَ من هذا الصنف في رحلتنا اليوم (يجرده حارسُه). */
export const exemptNodes = (rung) =>
  rung.nodes.filter((node) => !(stationOf(node.id)?.skills || []).length);

/** مفاتيحُ الشريحة كلُّها بلا تكرار — **من عقدها** لا من قائمةٍ تُكتب. */
export function rungKeys(rung) {
  return [...new Set(measuredNodes(rung).flatMap((node) => stationOf(node.id).skills))];
}

/**
 * **المفاتيحُ المضمونة**: `PER_STATION` من كل محطةٍ مقيسة في الشريحة، تتقدّم في `due`
 * فلا يبتلعها الخلط. **ومحطةٌ يغطّيها مفتاحٌ اختير قبلها لا تطلب ثانياً** — فمفتاحُ
 * ليتنر وحدةُ القياس، ومن أُثبت مفتاحُه أُثبت في كل محطةٍ تدرّسه.
 */
export function stationKeys(rung, rnd = Math.random) {
  const out = [];
  for (const node of measuredNodes(rung)) {
    const own = stationOf(node.id).skills;
    if (out.some((key) => own.includes(key))) continue;
    for (let i = 0; i < Math.min(PER_STATION, own.length); i++) {
      const fresh = own.filter((key) => !out.includes(key));
      if (!fresh.length) break;
      out.push(pick(fresh, rnd));
    }
  }
  return out;
}

/**
 * حجمُ عيّنة الدرجة: `SAMPLE` أدنى، **وتغطيتُها إن زادت عليها**، ولا يتجاوز `CAP`.
 * فلا تُفتح محطةٌ لم تُمَسّ (القيد ٢)، ولا يُطلَب جلوسٌ أثقلُ ممّا في الرحلة (القيد ٥)
 * — والشطرُ أعلاه يضمن ألّا تجتمع الحاجتان في تعارض.
 */
export const sizeFor = (cover) => Math.min(CAP, Math.max(SAMPLE, cover.length));

/**
 * تمارينُ درجةٍ واحدة — **بمُنشئات المراجعة والبوابة نفسِها** (`sessionItems`)، فكلُّ
 * ما تنطقه له ملفٌّ مولَّد أصلاً و**صفرُ شكلِ تمرينٍ جديد** بالبناء لا بالوعد.
 *
 * ومادّتُها حصّتان: **المفاتيحُ المضمونة أوّلاً** فلا تُفتح محطةٌ لم تُمَسّ، ثم بقيةُ
 * مفاتيح الشريحة مخلوطةً تُكمل العدد، **ثم تُعاد مفاتيحُها مخلوطةً ثالثة**: شريحةٌ
 * مفاتيحُها أقلُّ من العيّنة تُسأل عنها مراراً بجولاتٍ مولَّدةٍ جديدة — وهو أصدقُ من
 * امتحانٍ من سؤالٍ واحد يُفتح به قسمٌ كامل. **ولا تُكمَّل من خارج الشريحة**: حوضُ
 * التنويع يُمرَّر فارغاً، فلا يُحكَم على شريحةٍ بخطأٍ في مادّةٍ ليست منها.
 *
 * **وهنا تُشدّ مسطرةُ الامتحان الواحدة** (القيد ٧): البناءُ كلُّه داخل `duringExam`،
 * وفيه تُقرأ مقاديرُ الصعوبة كلُّها — سعةُ حوض الخيارات في مُنشئات المحطات، وحجمُ
 * العيّنة (وهو `sizeFor` هنا لا جرعةُ وليّ الأمر)، والتلقينُ الذي لا تعرفه هذه الشاشة
 * أصلاً. **ومقابضُ الراحة تسري في الحالين** لأنّها لا تُقرأ هنا: سرعةُ النموذج عند
 * التشغيل، والهدوءُ صنفٌ على الجذر — كلاهما بعد انقضاء هذا النطاق.
 */
export function rungItems(index, rnd = Math.random) {
  const rung = rungs()[index];
  if (!rung) return [];
  const cover = stationKeys(rung, rnd);
  const keys = rungKeys(rung);
  const due = [
    ...cover,
    ...shuffle(keys.filter((key) => !cover.includes(key)), rnd),
    ...shuffle(keys, rnd),
  ].map((key) => progress.parseSkillKey(key));
  return duringExam(() => sessionItems(due, sizeFor(cover), rnd, []));
}

// ————— الفتح: نجمةٌ تفكّ القفل ولا تدّعي إتقاناً —————

/**
 * ما لا يُفتَح بحال — **مكتوبٌ هنا وإن لم تقع البوابةُ في شريحةٍ اليوم**: هو الذي يبقى
 * صحيحاً حين تتبدّل الرحلة، والحارسُ يقرؤه لا يقرأ حالَ اليوم.
 */
const NEVER_OPENED = new Set(['gate']);

export function openableNodes(rung) {
  return rung.nodes.filter((node) => !NEVER_OPENED.has(node.type)).map((node) => node.id);
}

/**
 * **فتحُ شريحةٍ اجتازها**: نجمةٌ واحدة لكل عقدةٍ **لم يكسب فيها شيئاً** — فلا تُنقَص
 * نجمةٌ كسبها بلعبه (`setStars` لا تخفض أصلاً، والشرطُ هنا ليُحصى ما فُتح فعلاً).
 * **ولا يُعلَّم معرّفٌ لا موضعَ له في الرحلة.**
 * @returns {number} عددُ العقد التي فُتحت فعلاً
 */
export function openRung(rung) {
  let count = 0;
  for (const id of openableNodes(rung)) {
    if (!progress.findNode(id) || progress.getStars(id) > 0) continue;
    if (progress.setStars(id, PLACEMENT_STARS)) count++;
  }
  return count;
}

// ————— ما يقرؤه وليُّ الأمر —————

/**
 * حالُ اللحاق لقسم اللوحة: كم درجةً بقيت، وأين يستأنف، **وما الذي يقصُر سلّمَه** —
 * بوابةٌ لم تُجتز (تُجتاز بنفسها فلا تُقفز)، **أو جدارُ اقترانٍ** (قسمٌ ينتظر أذنَ
 * الطفل لا يدَه). ولا سجلَّ ثانياً: النجومُ تقول أين وقف.
 */
export function state() {
  const journey = progress.journey();
  const list = rungs();
  const at = startRung(list);
  const last = list[list.length - 1];
  const after = last ? journey.indexOf(last.sections[last.sections.length - 1]) + 1 : 0;
  /* **وما يقصُر السلّمَ هو أوّلُ قسمٍ بعده يقف فعلاً**: إمّا بوّابةٌ لم تُجتز، وإمّا
     قسمٌ وقف عنده جدارُ الاقتران — **والبوّابةُ المجتازة تُتخطّى** (السلّمُ يمضي عبرها،
     فلو سُمّيت لَقيل لوليّ الأمر «يقف عند بوّابةٍ عبَرها» وهو خبرٌ كاذب). ولا يُسمّى
     شيءٌ ما دامت في السلّم درجةٌ تُمتحَن: الخبرُ حينئذٍ «أمامه كذا درجة» لا «وقف». */
  const crossed = (section) => section.kind === 'gate'
    && (section.nodes || []).every((node) => progress.isDone(node.id));
  const stopper = at >= list.length
    ? journey.slice(after).find((section) => (section.nodes || []).length && !crossed(section))
    : null;
  return {
    total: list.length,
    at,
    left: Math.max(0, list.length - at),
    next: list[at]?.title || null,
    gate: stopper?.kind === 'gate' ? stopper.title : null,
    // **والجدارُ يُسمّى كما تُسمّى البوابة**: وليُّ الأمر يقرأ لِمَ وقف الامتحانُ —
    // درجةُ حرفٍ تنتظر أن تنضج كلماتُها في أذن طفله، لا عطبٌ ولا رسوب.
    wall: stopper && stopper.kind !== 'gate' ? stopper.title : null,
  };
}

// ————— الشاشة: جلسةُ ملء شاشةٍ بنسق بوّابتنا —————

const nodesText = (n) => arCount(n, ['عقدةً واحدة', 'عقدتين', 'عقد', 'عقدةً']);
const rungsText = (n) => arCount(n, ['درجةً واحدة', 'درجتين', 'درجات', 'درجةً']);

/**
 * @param {{onDone: () => void}} opts `onDone` تُنهي الامتحان وتعيد وليَّ الأمر إلى لوحته.
 * @returns {Node|null} `null` إن لم تبق درجةٌ تُمتحَن (فتعرض اللوحةُ نفسَها).
 */
export function renderPlacement({ onDone = () => go('#/') } = {}) {
  let list = rungs();
  let at = startRung(list);
  if (at >= list.length) return null;

  const opened = [];        // عناوينُ الدرجات التي فُتحت في هذه الجلسة
  let count = 0;            // كم عقدةً فُتحت فعلاً

  /**
   * **الترويسةُ تتبع الدرجة**: المحرّكُ يرسم `header` مرّةً واحدة عند التركيب ولا يعيده
   * مع كل جلسة — فلو كُتب اسمُ الدرجة فيه نصّاً ساكناً لبقي اسمُ الأولى فوق تمارين
   * الثالثة. فيُملَك السطرُ هنا ويُعاد طلاؤه عند كل صعود.
   *
   * **ولا عددَ تمارينَ يُكتب فيه**: حجمُ العيّنة يتبع تغطيةَ محطات الشريحة (`sizeFor`)
   * فيختلف من درجةٍ إلى درجة، **وخرزاتُ الجلسة تقوله مرسوماً**.
   */
  const where = h('p', { class: 'hint' });
  const paintHead = () => {
    where.textContent = `${list[at]?.title || ''} — من تمارين المراجعة نفسِها،`
      + ' وما يجتازه يُفتح له بمحطاته كلِّها.';
  };
  paintHead();
  const head = h('div', { class: 'gate-head' },
    faceEl(icon(FACES.exam), 'gate-face'),
    h('div', {}, h('h2', {}, 'امْتِحَانُ اللَّحَاق'), where),
  );

  return renderSession({
    make: () => rungItems(at),
    pill: 'امتحان اللحاق',
    accent: PAUSE_ACCENT,
    leaveAsk: 'تريد إنهاء امتحان اللحاق؟ ما فُتح يبقى مفتوحاً.',
    header: head,
    verdict: ({ right, errors, again }) => {
      const rung = list[at];
      const tries = right + errors;
      const rate = tries ? Math.round((right / tries) * 100) : 0;
      const open = passed(right, errors);

      // **الكتابةُ عند كل درجة لا عند الختام**: مَن أغلق الجهازَ في منتصف السلّم يبقى
      // له ما أثبته — والامتحانُ لا يُطالَب بأن يُتَمّ ليُثمر.
      if (open) {
        opened.push(rung.title);
        count += openRung(rung);
        /* **ويُعاد حسابُ السلّم بعد كل صعود**: محاولاتُ الامتحان تدخل ليتنر قياساً
           حقيقياً، فقد ينضج بها مفتاحٌ سمعيّ **فيسقط جدارُ اقتران** كان يقصُر السلّم
           — فيمتدّ من نفسه. وموضعُ الاستئناف من النجوم لا من عدّادٍ نحفظه. */
        list = rungs();
        at = startRung(list);
      }

      const score = h('p', { class: 'hint' },
        `${rung.title} — أصاب ${arNum(right)} من ${arNum(tries)} محاولة (${arNum(rate)}٪)`);
      const tally = count
        ? h('p', { class: 'note' },
          `فُتح له حتى الآن: ${rungsText(opened.length)} · ${nodesText(count)}.`)
        : null;
      const toMap = h('button', {
        class: 'btn',
        onclick: () => { onDone(); go('#/'); },
      }, icon('map'), ' الخريطة');

      // **أوّلُ إخفاقٍ يُنهي**: لا زرَّ إعادةٍ هنا — الإعادةُ من اللوحة، وهي تستأنف من
      // آخر حدّ. فلا يدور الطفلُ على درجةٍ واحدة حتى يصيبها بالحظّ.
      if (!open) {
        return h('div', { class: 'celebrate celebrate--again' },
          mascot('mascot mascot--hello'),
          h('div', { class: 'celebrate-face' }, icon(FACES.stop)),
          h('h2', {}, 'وَقَفْنَا هُنَا'),
          h('p', { class: 'rule' }, 'مِنْ هُنَا تَبْدَأُ رِحْلَتُكْ'),
          score,
          tally,
          h('p', { class: 'note' }, 'وهذه بدايتُه لا نهايتُه — الرحلةُ تبدأ من هنا بالضبط.'),
          h('div', { class: 'row foot' }, toMap),
        );
      }

      const more = at < list.length;
      if (more) paintHead();
      return h('div', { class: 'celebrate' },
        mascot('mascot mascot--cheer'),
        h('div', { class: 'celebrate-face' }, icon(more ? FACES.step : FACES.done)),
        h('h2', {}, more ? 'أَحْسَنْتْ!' : 'أَتْمَمْتَ السُّلَّمْ!'),
        h('p', { class: 'rule' }, more ? 'فُتِحَتْ لَكْ' : 'فُتِحَ لَكَ السُّلَّمُ كُلُّهْ'),
        score,
        tally,
        h('div', { class: 'row foot' },
          more && h('button', {
            class: 'btn btn--primary next-rung',
            onclick: () => { again(); },
          }, icon('onward'), ` ${list[at].title}`),
          more && h('button', { class: 'btn', onclick: onDone }, icon('check'), ' يكفي اليوم'),
          !more && toMap),
      );
    },
  });
}
