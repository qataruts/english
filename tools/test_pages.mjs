// **حارسُ أرقام الصفحات** — يقابل ما تقوله صفحاتُ `welcome/` بما تقوله البيانات:
//   node tools/test_pages.mjs [--self-test]
//
// ————— العلّة: وعدٌ يُقرأ اليومَ ولا يُقابَل بشيء (حسمُ أ-١، ١٧ أغسطس ٢٠٢٦) —————
//
// قالت صفحةُ التعريف: «رحلتُه تنتهي عند **تمام** رصيد Cambridge English: Starters
// سمعاً» — والمقيسُ في البيانات مئةٌ وخمسٌ وثلاثون كلمةً من أربعمئةٍ وخمسٍ وتسعين.
// **وذلك دَينٌ على كلِّ والدٍ يفتح الصفحة**، ولم يكن في الشجرة ما يمسكه: صفحاتُنا
// نصٌّ ساكن، وأرقامُها مكتوبةٌ بيدٍ يومَ كُتبت — فتتخلّف عن البيانات بلا حمرةٍ واحدة.
// (وقد كان في رأس `curriculum.html` عهدٌ مكتوب: «كلُّ عددٍ في هذه الصفحة مقروءٌ من
// `curriculum.js`» — عهدٌ صحيحٌ ساعةَ كُتب، **بلا حارسٍ يُبقيه صحيحاً**.)
//
// ————— والعلاج: العددُ يُعلن مصدرَه في الصفحة نفسِها —————
//
// كلُّ رقمٍ من المنهج يُكتب في الصفحة داخل عنصرٍ يحمل `data-fig="اسمُه"`، والاسمُ
// مفتاحٌ في `FIGURES` أدناه يُحسَب من `curriculum.js` حساباً. فهذا الحارسُ:
//   ١) يجرد كلَّ `data-fig` في صفحات `welcome/`، ويقابل نصَّه بالمحسوب (بالأرقام
//      العربية-الهندية كما تُعرَض).
//   ٢) **ويمسك اسماً لا حسابَ له** — فلا يُسكَت حارسٌ بكتابة `data-fig="x"`.
//   ٣) **ويمسك رقماً بلا مصدر**: عددٌ من جدول الأرقام (`w-figs`) بلا `data-fig`
//      رقمٌ يُكتب بيد في موضع الأرقام المحسوبة.
//
// **ولا يحرس هذا نصَّ الوعد نفسَه** — ذاك حكمُ قارئ. وإنما يحرس أن يبقى ما يقوله
// الرقمُ صادقاً، وأن يتحرّك مع البيانات يومَ تتحرّك.

import { readFileSync, readdirSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const WELCOME = new URL('app/welcome/', ROOT);

/* **ووحدةُ الدعم تُقرأ كما يُقرأ المنهج** (الجلسة ب): بطاقةُ التعريفية تعلن عددَ
   مقابضها، **ويُجرَد اسمُ كل مقبضٍ فيها** — فبطاقةٌ تنسى مقبضاً تحمرّ. وهي تقرأ
   `localStorage` عند تحميلها (مخزنُ وليّ الأمر)، فيُوضَع لها شبَحٌ في العقدة. */
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const c = await import(new URL('app/js/curriculum.js', ROOT));
const support = await import(new URL('app/js/support.js', ROOT));

let fails = 0;
const ok = (cond, msg) => {
  if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg);
};

// ————— الأرقامُ المحسوبة: اسمٌ ← دالّةٌ تقرأ المنهج —————

const stations = c.stations();
const skillsOf = (list) => new Set(list.flatMap((s) => s.skills || []));
const track = (name) => stations.filter((s) => s.track === name);
const listenKeys = skillsOf(track('listen'));
const letterKeys = skillsOf(track('letter'));

/** كلماتُ القراءة والشائكاتُ ذواتُ المدخل — ما يجرده `check_coupling` فعلاً. */
const coupledCount = () => {
  const words = c.GRADES.flatMap((g) => g.words).length;
  const hearts = Object.values(c.HEART_WORDS).filter((h) => h.listen).length;
  return words + hearts;
};

export const FIGURES = {
  stations: () => stations.length,
  sections: () => c.sections().length,
  gates: () => c.GATES.length,
  listen: () => track('listen').length,
  letter: () => track('letter').length,
  keys: () => new Set([...listenKeys, ...letterKeys]).size,
  'listen-keys': () => listenKeys.size,
  'letter-keys': () => letterKeys.size,
  'shared-keys': () => [...listenKeys].filter((k) => letterKeys.has(k)).length,
  words: () => c.WORDS.length,
  starters: () => c.STARTERS.length,
  budget: () => c.PAIR_BUDGET.length,
  'decode-budget': () => c.DECODE_BUDGET.length,
  raised: () => c.RAISED.length,
  grades: () => c.GRADES.length,
  graphemes: () => c.GRADES.flatMap((g) => g.symbols).length,
  phonemes: () => c.PHONEMES.length,
  tricky: () => c.GRADES.flatMap((g) => g.tricky).length,
  decodable: () => c.GRADES.flatMap((g) => g.words).length,
  stories: () => stations.filter((s) => s.type === 'story').length,
  returns: () => stations.filter((s) => String(s.part).endsWith('-again')).length,
  coupled: coupledCount,
  // **ومقابضُ وضع الدعم المعروضة** — عددٌ يُحسب من الجدول لا يُكتب في الصفحة
  knobs: () => support.PANEL_KEYS.length,
};

// **ومراحلُ السمع تُعَدّ بأسمائها** (`stage:listen1`): كلُّ مرحلةٍ رقمٌ في صفحتها
for (const station of track('listen')) {
  const key = `stage:${station.stage}`;
  if (!FIGURES[key]) {
    FIGURES[key] = () => track('listen').filter((s) => s.stage === station.stage).length;
  }
}

/** الرقمُ كما يُعرَض في صفحاتنا: عربيٌّ هنديّ. */
const arabic = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

// ————— الجرد: `data-fig` في الصفحات —————

const TAG = /<(\w+)([^>]*\bdata-fig="([^"]+)"[^>]*)>([^<]*)</g;
const FIGS_BLOCK = /<ul class="w-figs">([\s\S]*?)<\/ul>/;
const DIGITS = /[٠-٩]/;

/** ما تدّعيه صفحةٌ: [{ page, name, text }] — دالّةٌ خالصة تُجرَّب بنصٍّ مصنوع. */
export function claimsIn(page, html) {
  const out = [];
  for (const m of html.matchAll(TAG)) {
    out.push({ page, name: m[3], text: m[4].trim() });
  }
  return out;
}

/** أرقامٌ في جدول الأرقام بلا مصدرٍ معلَن — رقمٌ يُكتب بيد حيث تُحسَب الأرقام. */
export function looseFigures(html) {
  const block = html.match(FIGS_BLOCK)?.[1] || '';
  return [...block.matchAll(/<(b|span)(?![^>]*data-fig)[^>]*>([^<]*)<\/\1>/g)]
    .map((m) => m[2].trim())
    .filter((text) => DIGITS.test(text));
}

/* ————— بابُ حقيبة المعلم في صدر الدليل (بلاغ `teacher-kit-link-and-whatsapp-form`) —————

   **الحقيبةُ صفحةُ العائلة العامّة** (`learn.mishkat.qa/teacher.html`) للأربعة، ودليلُنا
   **خاصٌّ أعمق** — فالمكتوبُ عندنا **إحالةٌ لا نسخ** (درسُ حقن النصّ من مصدره: النسخُ
   يفترق نصفاه بعد شهر). **وعلّةُ حراسته**: سطرٌ في صدر صفحةٍ يقرؤه محرِّرٌ لاحق زينةً
   فيسقط، ورابطُه يسقط أهونَ منه — فيبقى النصُّ يَعِد بحقيبةٍ لا بابَ إليها.
   **وبابان لا باب**: حضورُ الإحالة باسمها · **ورابطُها إلى الحقيبة بعينه**. */

export const KIT_URL = 'https://learn.mishkat.qa/teacher.html';

/** إحالةُ الحقيبة كما تقرؤها الصفحة — دالّةٌ خالصة تُجرَّب بنصٍّ مصنوع. */
export function kitBand(html) {
  const band = [...html.matchAll(/<aside class="w-band"[\s\S]*?<\/aside>/g)]
    .map((m) => m[0].replace(/\s+/g, ' '))
    .find((b) => b.includes('حقيبةُ المعلّم')) || '';
  return { present: band.length > 0, linked: band.includes(`href="${KIT_URL}"`) };
}

/* ————— بابُ صيغة رقم واتساب (أمرُ المالك، البلاغ نفسُه) —————

   الرقمُ **يُكتب رابطاً بلا فراغات** بـ`dir="ltr"` و`unicode-bidi: isolate` — وإلّا
   انقلب شكلُه في نصٍّ عربيّ فقرأه الوالدُ مقلوباً. **وجردُ اليوم: لا موضعَ يعرضه
   نصّاً** (وحدةُ «بلِّغنا» تكتبه في `href` وحدَه ونصُّها «عبر واتساب») — **فالبابُ
   لمنع عودته**، لا لإصلاح حال. **وصورةٌ مأذونةٌ واحدة**: الرقمُ عارياً بعد
   `wa.me/` (وهو الرابطُ نفسُه)، أو داخل رابطٍ موافقٍ بالسمتين. وما سواهما نصٌّ
   يُعرَض للناس فيحمرّ. */

/** ظهورُ الرقم في نصٍّ معروضٍ خارج الرابط الموافق — دالّةٌ خالصة. */
export function bareNumbers(src, number) {
  if (!number) return [];
  const sep = '[\\s\\u200e\\u200f\\u2066-\\u2069+\\-().]*';
  const digit = (d) => `[${d}${'٠١٢٣٤٥٦٧٨٩'[Number(d)]}]`;
  const shape = new RegExp([...number].map(digit).join(sep), 'g');
  const link = new RegExp(`href="https://wa\\.me/${number}`);
  const stripped = src
    // الرابطُ الموافق يُطرَح كلُّه — نصُّه داخله معزولٌ بالسمتين
    .replace(/<a\b[^>]*>[\s\S]*?<\/a>/g, (a) => (
      link.test(a) && /\bdir="ltr"/.test(a) && /unicode-bidi:\s*isolate/.test(a) ? '' : a))
    // وصورةُ الرابط نفسُها مأذونةٌ حيث تُكتب (‏`feedback.js` تبنيها في شيفرتها)
    .replace(new RegExp(`https://wa\\.me/${number}`, 'g'), '');
  return [...stripped.matchAll(shape)].map((m) => m[0]);
}

if (process.argv.includes('--self-test')) {
  console.log('— فحصُ الفاحص: أيمسك المدسوس؟ —');
  const good = '<b data-fig="gates">٣</b>';
  ok(claimsIn('د', good)[0]?.text === '٣', 'يقرأ العددَ ومصدرَه من الوسم');
  ok(claimsIn('د', good)[0]?.name === 'gates', 'ويقرأ اسمَ مصدره');
  ok(arabic(590) === '٥٩٠', 'ويكتب الرقمَ بالعربية الهندية كما يُعرَض');
  ok(looseFigures('<ul class="w-figs"><li><b>٥٢</b><span>محطة</span></li></ul>').length === 1,
    '**ورقمٌ في جدول الأرقام بلا `data-fig` يُمسَك** — وهو الصنفُ الذي تخلّف بالأمس');
  ok(looseFigures('<ul class="w-figs"><li><b data-fig="gates">٣</b><span>ب</span></li></ul>')
    .length === 0, '  والمُعلَنُ مصدرُه يمرّ');

  // **إحالةُ الحقيبة**: بابان يفترقان — يسقط السطرُ، أو يبقى نصّاً بلا رابط
  const BAND = `<aside class="w-band"><p>حقيبةُ المعلّم للعائلة</p>`
    + `<a href="${KIT_URL}">learn.mishkat.qa/teacher.html</a></aside>`;
  ok(kitBand(BAND).present && kitBand(BAND).linked, 'يقرأ إحالةَ الحقيبة ورابطَها');
  ok(!kitBand('<aside class="w-band"><p>شريطٌ آخر</p></aside>').present,
    '**وحذفُ السطر يُمسَك** — إحالةٌ باسمها لا شريطٌ أيّاً كان');
  const NAKED = BAND.replace(/<a\b[^>]*>[\s\S]*?<\/a>/, 'learn.mishkat.qa/teacher.html');
  ok(kitBand(NAKED).present && !kitBand(NAKED).linked,
    '**وتحويلُ الرابط نصّاً يُمسَك وحدَه** — الحضورُ يمرّ والرابطُ يحمرّ');

  // **ورقمُ واتساب**: عارياً في نصٍّ معروض يُمسَك، ورابطاً موافقاً يمرّ
  const N = '97433882806';
  const GOOD = `<a href="https://wa.me/${N}" dir="ltr" style="unicode-bidi: isolate">+${N}</a>`;
  ok(bareNumbers(`<p>للتواصل: +974 3388 2806</p>`, N).length === 1,
    '**ورقمٌ عارٍ في نصٍّ معروض يُمسَك** — ولو فرّقته فراغاتٌ');
  ok(bareNumbers(`<p>للتواصل: ${GOOD}</p>`, N).length === 0, '  والرابطُ الموافق بالسمتين يمرّ');
  ok(bareNumbers(`<p>${GOOD.replace(' dir="ltr" style="unicode-bidi: isolate"', '')}</p>`, N)
    .length === 1, '  **ورابطٌ بلا السمتين يحمرّ** — نصُّه ينقلب في العربية');
  ok(bareNumbers(`wa.href = \`https://wa.me/${N}?text=\${t}\`;`, N).length === 0,
    '  وعنوانُ الرابط في الشيفرة يمرّ — رابطٌ لا نصٌّ يُعرَض');
  ok(bareNumbers('<p>لا رقمَ هنا</p>', N).length === 0, '  وصفحةٌ بلا رقمٍ تمرّ');
  console.log(fails ? `\n${fails} فشل` : '\n✓ حارسُ الصفحات يمسك المدسوسَ كلَّه');
  process.exit(fails ? 1 : 0);
}

// ————— التشغيل —————

console.log('— أرقامُ الصفحات: محسوبةٌ من `curriculum.js` لا مكتوبةٌ بيد —');

const pages = readdirSync(WELCOME).filter((f) => f.endsWith('.html'));
const claims = pages.flatMap((page) =>
  claimsIn(page, readFileSync(new URL(page, WELCOME), 'utf8')));

const unknown = claims.filter((claim) => !FIGURES[claim.name]);
ok(unknown.length === 0,
  `كلُّ مصدرٍ مُعلَن له حسابٌ في الحارس (${claims.length} رقماً في ${pages.length} صفحات)`
  + (unknown.length ? ` — بلا حساب: ${unknown.map((u) => u.name).join('، ')}` : ''));

const wrong = claims.filter((claim) => FIGURES[claim.name]
  && claim.text !== arabic(FIGURES[claim.name]()));
for (const claim of wrong) {
  console.log(`     ${claim.page} · «${claim.name}»: الصفحةُ تقول ${claim.text} `
    + `والبياناتُ تقول ${arabic(FIGURES[claim.name]())}`);
}
ok(wrong.length === 0, 'وكلُّ رقمٍ في الصفحات يطابق المقيسَ في البيانات');

const loose = pages.flatMap((page) =>
  looseFigures(readFileSync(new URL(page, WELCOME), 'utf8')).map((text) => `${page}:${text}`));
ok(loose.length === 0,
  'ولا رقمَ في جدول الأرقام بلا مصدرٍ معلَن'
  + (loose.length ? ` — ${loose.join('، ')}` : ''));

// ————— جردُ تغطية الميزتين في التعريفية (بلاغ `features-need-their-own-sections`) —————
//
// **العلّة**: القسمُ يُكتب مرّةً ثم يُزاد مقبضٌ في `support.js` فلا يُسمّى فيه — فيقرأ
// مديرُ المركز قائمةً ناقصة ويظنّها تامّة. **فيُجرَد الجدولُ على الصفحة**: اسمُ كل
// مقبضٍ معروض يجب أن يقع في القسم بنصّه، ومعه اسمُ الميزتين وحدُّهما.
//
// **وهو جردُ حضورٍ لا جردُ صياغة**: لا يحكم على نصّ الصفحة، وإنّما يمنع أن يسقط منها
// ما تعلنه الشيفرةُ اليوم.

const HOME = readFileSync(new URL('index.html', WELCOME), 'utf8');
const section = HOME.match(/<section class="w-section" id="pace"[\s\S]*?<\/section>/)?.[0] || '';

ok(section.length > 0, 'وفي الرئيسة **قسمٌ مستقلٌّ** للميزتين (`id="pace"`)');
const heads = [...section.matchAll(/<h3>([^<]*)<\/h3>/g)].map((m) => m[1].trim());
ok(heads.length === 2 && heads.some((t) => t.includes('اللحاق'))
  && heads.some((t) => t.includes('وضعُ الدعم')),
  `وفيه بطاقتان بعنوانيهما (${heads.join(' · ') || 'لا بطاقات'})`);
/* **والمقابلةُ على نصٍّ مسطَّح**: سطورُ HTML تُلَفّ عند حدّ العرض، فاسمُ مقبضٍ قد
   يقع على سطرين — والمقيسُ حضورُه لا موضعُ لفّه. */
const flat = (t) => t.replace(/\s+/g, ' ').trim();
const page = flat(section);
const missing = support.PANEL_KEYS.map((k) => support.KNOBS[k].title)
  .filter((title) => !page.includes(title));
ok(missing.length === 0,
  `وكلُّ مقبضٍ معروضٍ مسمّىً فيه بنصّه (${support.PANEL_KEYS.length} مقابض)`
  + (missing.length ? ` — سقط: ${missing.join('، ')}` : ''));
ok(page.includes(flat(support.PROMISE)),
  'وعبارةُ الحدّ فيه **من مصدرها** (`support.PROMISE`) حرفاً بحرف لا مُعادَ صياغة');
for (const [what, needle] of [
  ['البابُ لوحةُ وليّ الأمر لا شاشةُ الطفل', 'لا من شاشة الطفل'],
  ['العتبةُ عتبةُ بوابات الإتقان', 'عتبةُ بوّابات الإتقان'],
  ['ما فُتح لا يُغلق', 'لا يُغلق'],
  ['ولا يُحتسب ما أُعين عليه إتقاناً', 'أُعين عليه'],
  ['وقيدُ الاقتران في الفتح (خصوصيتُنا)', 'لم تثبت في أذنه'],
  ['ولا نَعِد بحجم أثر', 'ولا نَعِد بحجم أثر'],
  ['وهو في تجربةٍ ميدانية', 'تجربةٍ ميدانية'],
]) ok(page.includes(needle), `  وفيه: ${what}`);

/* **وشريطُ الإنصاف يدخل الجردَ** (بلاغ `equity-band-under-hero` — الجلسة ب٢):
   سطران تحت الصدر مباشرة يقولان إنّ للطفل بابين اختياريين، **ورابطُهما ينزل إلى
   القسم المفصَّل**. **وعلّةُ حراستهما**: الشريطُ زينةٌ في نظر محرِّرٍ لاحق فيسقط،
   ورابطُه يسقط أهونَ منه — وسقوطُهما يعيد الميزتين إلى عمق الصفحة حيث لا يمرّ
   مديرُ مركز. **وثلاثةُ أبوابٍ لا باب**: حضورُ الشريط · ورابطُه إلى `#pace`
   بعينه · **وموضعُه فوق قسم التثبيت** (فترتيبُ «ثبّته أولاً» أمرُ مالكٍ: الشريطُ
   سطران فوقه لا قسمٌ يزاحمه). */
const band = HOME.match(/<aside class="w-band"[\s\S]*?<\/aside>/)?.[0] || '';
ok(band.length > 0, 'وتحت الصدر **شريطُ الإنصاف** (`aside.w-band`)');
ok(/href="#pace"/.test(band),
  'ورابطُه ينزل إلى القسم المفصَّل (`#pace`)'
  + (band && !/href="#pace"/.test(band) ? ' — **الشريطُ بلا رابط**' : ''));
ok(band.includes('امتحانُ اللحاق') && band.includes('وضعُ الدعم'),
  'وفيه البابان بلفظنا — لا وعدَ بما ليس في التطبيق');
const bandAt = HOME.indexOf('<aside class="w-band"');
const installAt = HOME.indexOf('id="install-first"');
ok(band.length > 0 && bandAt > 0 && installAt > bandAt,
  'وموضعُه **تحت الصدر وفوق قسم التثبيت** — سطران فوقه لا قسمٌ يزاحمه');

/* **وإحالةُ الحقيبة تدخل الجرد** (بلاغ `teacher-kit-link-and-whatsapp-form`): في صدر
   `guide.html` سطرٌ يحيل إلى حقيبة المعلم العائلية — **إحالةٌ لا نسخ**، وهو الرابطُ
   الخارجيُّ الثالث بقاعدته المعلَنة (`<a>` يُفتَح إن نُقر ولا يُجلَب). */
const GUIDE = readFileSync(new URL('guide.html', WELCOME), 'utf8');
const kit = kitBand(GUIDE);
ok(kit.present, 'وفي صدر الدليل **إحالةُ حقيبة المعلم** باسمها'
  + (kit.present ? '' : ' — **سقط سطرُ الحقيبة**'));
ok(kit.linked, `ورابطُها إلى الحقيبة بعينه (${KIT_URL})`
  + (kit.present && !kit.linked ? ' — **الإحالةُ نصٌّ بلا رابط**' : ''));

/* **وصيغةُ رقم واتساب** (أمرُ المالك): الرقمُ من مصدره — `feedback.js` — لا مكتوباً
   هنا بيد، **ويُجرَد كلُّ نصٍّ يُعرَض للناس**: التعريفياتُ الأربع ووحداتُ التطبيق. */
const FEEDBACK = readFileSync(new URL('app/js/feedback.js', ROOT), 'utf8');
const number = FEEDBACK.match(/wa\.me\/(\d+)/)?.[1] || '';
ok(number.length > 0, 'ورقمُ واتساب يُقرأ من مصدره (`feedback.js`) لا يُكتب في الحارس');
const scanned = [
  ...pages.map((page) => [`welcome/${page}`, readFileSync(new URL(page, WELCOME), 'utf8')]),
  ...readdirSync(new URL('app/js/', ROOT)).filter((f) => f.endsWith('.js'))
    .map((f) => [`js/${f}`, readFileSync(new URL(`app/js/${f}`, ROOT), 'utf8')]),
];
const bare = scanned.flatMap(([name, src]) =>
  bareNumbers(src, number).map((hit) => `${name}: «${hit}»`));
ok(bare.length === 0,
  `ولا ظهورَ للرقم في نصٍّ معروضٍ خارج رابط \`wa.me\` بسمتيه (${scanned.length} ملفاً)`
  + (bare.length ? ` — ${bare.join('، ')}` : ''));

const used = new Set(claims.map((claim) => claim.name));
const idle = Object.keys(FIGURES).filter((name) => !used.has(name));
console.log(`  · ${used.size} مصدراً مستعمَلاً في الصفحات، و${idle.length} محسوباً `
  + 'ينتظر موضعَه');

console.log(fails ? `\n${fails} فشل` : '\nأرقامُ الصفحات كلُّها مقيسةٌ من البيانات');
process.exit(fails ? 1 : 0);
