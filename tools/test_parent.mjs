// حارسُ لوحة الوالد — «لا رقمَ في اللوحة مكتوبٌ بيد»:
//   node tools/test_parent.mjs
//
// ————— العلّة —————
//
// لوحةُ الوالد **الشهادةُ الوحيدة** التي يقرؤها من ليس معنا: لا يرى الوالدُ سجلَّ
// ليتنر ولا مفاتيحَه، فما يقوله له هذا النصُّ **هو** ما يعرفه عن طفله. فعبارةٌ تُكتب
// بيد أو رقمٌ يُقدَّر يصير كذباً لا يُمسَك: كلُّ الاختبارات خضراء، والشاشةُ تعمل،
// والوالدُ يقرأ ما لم يقع.
//
// فمقياسُ هذا الحارس واحد: **كلُّ معروضٍ في اللوحة مقروءٌ من القياس** — تُبدَّل قيمةٌ
// في سجلّ ليتنر فيتبدّل عرضُها، ولا يتبدّل ما لم يُقَس. وهو معيارُ قبول الجلسة ٨ نصّاً.
//
// وأثقلُ أبوابه **قيدُ الاقتران مرئياً** (`METHOD.md §٦`): «يقرأ ما أتقن سمعَه» —
// يُجرَّب على **حالةٍ مصنوعة**: كلمةٌ أُتقنت سمعاً ولم تُقرأ بعدُ **يجب أن تظهر في
// عدّاده**، وكلمةٌ دون صندوق الإتقان **يجب ألّا تُعَدّ**. فالعدّادُ يقول القيدَ نفسَه
// في رقم، ولو كذب لَطمأن والداً إلى ترتيبٍ لم يقع.

import { readFileSync } from 'node:fs';

const APP = new URL('../app/js/', import.meta.url);

let fails = 0;
let asleep = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg); };
const dormant = (msg) => { asleep++; console.log('  ⏸', `${msg} — نائم، يستيقظ ذاتياً`); };

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const progress = await import(new URL('progress.js', APP));
const curriculum = await import(new URL('curriculum.js', APP));
const parent = await import(new URL('parent.js', APP));

const record = (key, correct = true, times = 1) => {
  const [unit, range, kind] = key.split('|');
  for (let i = 0; i < times; i++) progress.recordAttempt(unit, range, kind, correct);
};

// ————— ١) حوضُ الاقتران: من المنهج لا من اللوحة —————

console.log('\n١. حوضُ قيد الاقتران — مُعلَنٌ في المنهج بمفاتيحه');

const pool = curriculum.coupledWords();
ok(pool.length > 0, `كلماتُ القراءة في الحوض: ${pool.length}`);
ok(pool.every((w) => w.listen && w.read.length),
  'ولكلٍّ مفتاحٌ سمعيّ ومفاتيحُ قراءةٍ مُعلَنة (لا تخمّنها اللوحةُ ولا تبنيها بيدها)');

// **والمفاتيحُ هي هي التي تقيسها المحطات**: لو بنت اللوحةُ اسمَ مفتاحٍ من عندها
// لَعَدّت أبداً صفراً وهي خضراء — فيُقابَل الحوضُ بما تُعلنه الرحلةُ من مفاتيح.
const declared = new Set(curriculum.stations().flatMap((s) => s.skills || []));
const strayListen = pool.filter((w) => !declared.has(w.listen));
const strayRead = pool.filter((w) => !w.read.some((key) => declared.has(key)));
// **ومفتاحٌ سمعيٌّ بلا محطةٍ تقيسه كلمةٌ لا تُقرأ أبداً**: مفتاحُها لا يبلغ صندوقَ
// الإتقان في عمر الجهاز، فيحبسها القيدُ حبساً لا فكاكَ منه. وهي اليومَ **الضمائرُ
// النائمة المعلَنة** (`curriculum.js` — لا مشهدَ صادقَ لها بعد)، فتُعَدّ نائمةً
// بأسمائها **وتستيقظ من تلقائها** يومَ تُبنى محطتُها.
if (strayListen.length) {
  dormant(`${strayListen.length} كلمةً في الحوض مفتاحُها السمعيّ بلا محطةٍ تقيسه `
    + `(${strayListen.map((w) => w.w).join('، ')}) — فلا تُقرأ حتى تُبنى محطتُها`);
} else {
  ok(true, 'وكلُّ مفتاحٍ سمعيّ فيه تقيسه محطةٌ في الرحلة (فما من كلمةٍ محبوسةٍ أبداً)');
}
ok(strayRead.length === 0,
  'ولكلِّ كلمةٍ فيه مفتاحُ قراءةٍ تقيسه درجتُها'
  + (strayRead.length ? ` — بلا قياس: ${strayRead.slice(0, 3).map((w) => w.w).join('، ')}` : ''));

// ————— ٢) عدّادُ الاقتران على حالةٍ مصنوعة —————

console.log('\n٢. «يقرأ ما أتقن سمعَه» — العدّادُ يصدُق على حالةٍ مصنوعة');

const blank = parent.couplingCount();
ok(blank.heard === 0 && blank.read === 0 && blank.pool === pool.length,
  `بلا قياسٍ: أتقن سمعاً ${blank.heard} وقرأ ${blank.read} من ${blank.pool}`);

// **الحالةُ المصنوعة**: كلمةٌ تبلغ صندوقَ الإتقان سمعاً ولا تُقرأ بعد — وهي عينُ
// الحال التي يخلقها القيدُ كلَّ يوم (نضجت الأذنُ ولمّا تبلغ درجةُ رمزها).
const first = pool[0];
record(first.listen, true, progress.MASTERED_BOX);
const ripe = parent.couplingCount();
ok(ripe.heard === 1 && ripe.read === 0 && ripe.waiting === 1,
  `وكلمةٌ أُتقنت سمعاً ولم تُقرأ تظهر في العدّاد («${first.w}»: أتقن ${ripe.heard}`
  + `، قرأ ${ripe.read}، تنتظر ${ripe.waiting})`);

record(first.read[0], true);
const done = parent.couplingCount();
ok(done.heard === 1 && done.read === 1 && done.waiting === 0,
  `ثم قُرئت مكتوبةً فانتقلت في العدّاد نفسِه (قرأ ${done.read}، تنتظر ${done.waiting})`);

// **ودسّةٌ سالبة**: ما دون صندوق الإتقان لا يُعَدّ — وإلّا لَقال العدّادُ «أتقن سمعاً»
// عن كلمةٍ ما تزال في مراجعة الغد، فبطل معنى القيد كلِّه.
const second = pool[1];
record(second.listen, true, progress.MASTERED_BOX - 1);
const half = parent.couplingCount();
ok(half.heard === 1,
  `ودون صندوق الإتقان لا يُعَدّ («${second.w}» في الصندوق ${progress.MASTERED_BOX - 1}`
  + ` — والعدّادُ ما يزال ${half.heard})`);
record(second.listen, true);
ok(parent.couplingCount().heard === 2, 'فإذا بلغه عُدّ من يومه');

// ————— ٣) أسطرُ المهارات تتبدّل بتبدّل القياس —————

console.log('\n٣. أسطرُ المهارات — تُبدَّل قيمةٌ في القياس فيتبدّل عرضُها');

const lineOf = (unit) => parent.unitLines().find((l) => l.unit === unit) || null;
// **والمدى لا يُقال «أتقنه» حتى تُتقَن مفاتيحُه كلُّها** (قاعدةُ اللوحة وصفِّ الحقول
// معاً): فتُرفَع مفاتيحُ «in» كلُّها إلى صندوق الإتقان لتُقال باسمها.
record(first.read[0], true, progress.MASTERED_BOX - 1);
const wordLine = lineOf('word');
ok(!!wordLine && wordLine.line.includes(first.w),
  `وحدةُ «${wordLine?.title ?? '؟'}» تُعرَض بما قِيس فعلاً («${wordLine?.line ?? '—'}»)`);
const logged = progress.skills().filter((s) => s.unit === 'word')
  .reduce((sum, s) => ({ right: sum.right + s.right, wrong: sum.wrong + s.wrong }),
    { right: 0, wrong: 0 });
ok(!!wordLine && wordLine.right === logged.right && wordLine.wrong === logged.wrong,
  `وعددا صوابها وخطئها جمعُ سجلّها لا تقديرٌ (${wordLine?.right ?? '؟'} صواب`
  + `، ${wordLine?.wrong ?? '؟'} خطأ — وفي السجلّ ${logged.right}/${logged.wrong})`);

const before = wordLine.line;
record(first.listen, false);          // خطأٌ واحد يُسقط الصندوق إلى الصفر
const after = lineOf('word');
ok(after && after.line !== before && after.state !== 'mastered',
  `وخطأٌ يُسجَّل فيتبدّل السطرُ نفسُه («${after?.line ?? '—'}»)`);
ok(parent.couplingCount().heard === 1,
  'ويتبدّل معه عدّادُ الاقتران — فالكلمةُ لم تعد متقنةً سمعاً');

// **ولا مفتاحَ خامٌ يُعرَض لوالد**: وحدةٌ لا يعرفها المنهجُ تسقط ولا تُطبع كما هي.
ok(parent.unitLine({ unit: 'zzz', parts: [], right: 0, wrong: 0 }) === null,
  'ووحدةٌ لا يعرفها المنهجُ لا تُعرَض للوالد مفتاحاً خاماً');

// ————— ٤) توصيةُ اليوم بترتيبها المقصود —————
//
// الترتيبُ حكمٌ منهجيّ لا ذوق: **صحّةُ الطفل قبل التحصيل** (سقفُ ١٥ دقيقة —
// `METHOD.md §١٢-٨`)، **والمراجعةُ قبل الجديد** (محطةٌ تُبنى على متزعزع تنهار).

console.log('\n٤. توصيةُ اليوم — سقفُ الوقت أوّلاً، ثم المراجعة، ثم الجديد');

const tip = (state) => parent.recommend(state).title;
ok(tip({ started: false }) === 'ابدآ الرحلة معاً', 'بلا بداية: تدعو إلى أول محطة');
ok(tip({ started: true, secondsToday: 16 * 60, dueCount: 9, nextTitle: 'س١-٢' })
  === 'أخذ نصيبه اليوم',
  'وبعد سقف اليوم: تُوصي بالاستراحة ولو كان عليه مراجعة (الصحّةُ قبل التحصيل)');
ok(tip({ started: true, secondsToday: 5 * 60, dueCount: 9, nextTitle: 'س١-٢' })
  === 'ابدأ بمراجعة اليوم', 'ودون السقف بمستحقٍّ: المراجعةُ قبل المحطة الجديدة');
ok(tip({ started: true, secondsToday: 5 * 60, dueCount: 0, nextTitle: 'س١-٢' })
  === 'واصِلا المحطة التالية', 'وبلا مستحقّ: المحطةُ التالية باسمها');
// **والسقفُ خمسَ عشرة دقيقة لا رقماً آخر** (§١٢-٨): يُقرأ من عتبة التوصية نفسِها.
const cap = [...Array(30).keys()].find((m) =>
  parent.recommend({ started: true, secondsToday: m * 60, dueCount: 1 }).title === 'أخذ نصيبه اليوم');
ok(cap === 15, `وسقفُ اليوم ${cap} دقيقة — عينُ ما نصّ عليه \`METHOD.md §١٢-٨\``);

// ————— ٥) حدودُ النطاق والترديدُ معلَنان في اللوحة —————
//
// **نصوصٌ يقرؤها والدٌ لا يقرأ وثيقتَنا** (`METHOD.md §١٣` و§١٢-٥): إعلانُها في
// اللوحة **شرطُ قبول** لا زينة — ولو سقطت لَظنّ الوالدُ أنّ التطبيق يقيس نطقَ طفله
// أو يشخّصه. (والمرسومَ منها في متصفّحٍ حقيقيّ يقيسه `browser_test.html`.)

console.log('\n٥. حدودُ النطاق والترديد — معلَنةٌ في ذيل اللوحة');

const src = readFileSync(new URL('parent.js', APP), 'utf8');
const dashboard = src.slice(src.indexOf('function dashboard'));
for (const [what, re] of [
  ['الترديدُ يُدعى ولا يُقاس', /الترديدُ يُدعى ولا يُقاس/],
  ['لا قياسَ نطق', /لا يحكم على نطقه/],
  ['تدريسٌ لا تشخيص', /يدرّس ويقيس ولا يشخّص/],
  ['الفئةُ لا تُمدَّد ضمنياً', /السادسة ± سنة/],
  ['آخِرُ الرحلة معلوم', /أفقٌ لا وعد/],
  ['سقفُ اليوم معلَنٌ دائماً', /سقفُ اليوم/],
  ['قيدُ الاقتران مرئيّ', /يقرأ ما أتقن سمعَه/],
]) ok(re.test(dashboard), `«${what}» معلَنٌ في اللوحة`);

console.log(fails
  ? `\n${fails} فشل`
  : `\nكل اختبارات لوحة الوالد ناجحة${asleep ? ` (و${asleep} نائم يستيقظ بجرده)` : ''}`);
process.exit(fails ? 1 : 0);
