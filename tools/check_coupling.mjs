// حارسُ **قيد الاقتران** — أثقلُ عهود هذا التطبيق:
//   node tools/check_coupling.mjs
//
// ————— العلّة —————
//
// المرشَّحُ ب الذي اختاره المالك (١٢ أغسطس ٢٠٢٦) مساران مقترنان، **وقرارُه الثالث**
// (`METHOD.md §١٢-٣`): «لا كلمةَ تُقرأ قبل إتقانها سمعاً». والفخُّ الذي وُجد القيدُ
// ليُغلِقه بنيوياً: **«فكٌّ بلا معنى»** — طفلٌ ينطق `sat` نطقاً صحيحاً ولا يعرف ما هي.
// وهو فخٌّ **لا يظهر في اختبار ولا في لقطة**: الشاشةُ تعمل، والنجومُ تُكتب، والصوتُ
// يخرج — والطفلُ يتعلّم صوتاً بلا لغة.
//
// ونصُّ §٦: «لا يدخل تمرينَ قراءةٍ (decode/build/text) كلمةٌ لم تبلغ **صندوقَ
// الإتقان** (`MASTERED_BOX`) في مفتاحها السمعي … يفرضها `check_coupling` جرداً
// آلياً على كل تمرينٍ قابلِ التوليد — **مُجرَّباً سالباً** بكلمةٍ مدسوسة غيرِ متقنة».
//
// ————— أربعةُ أبوابٍ يفحصها —————
//
//   ١) **الإعلان**: كلُّ كلمةِ قراءةٍ تحمل مفتاحاً سمعياً **مكتوباً**، والمفتاحُ
//      موجودٌ في مفاتيح مسار السمع — لا يُشتقّ بمطابقة رسمٍ ولا يُخمَّن.
//   ٢) **الترتيب**: محطةُ المفتاح السمعيّ **قبل** درجة القراءة على الخريطة — وإلا
//      استحال القيدُ على الطفل: كلمةٌ لا يمكن إتقانُها سمعاً في وقتها تقفل درجتَها
//      إلى الأبد، ولا يظهر ذلك إلا في جهازٍ بعد أسابيع.
//   ٣) **البنية**: `readableAt` هي البابُ الوحيد، **وتأبى أن تُستدعى بلا سؤال
//      ليتنر**؛ ولا وحدةَ تمارينٍ تلتفّ عليها إلى حوض المنهج مباشرةً.
//   ٤) **المحاكاة (سالباً)**: بحالة ليتنر **مصنوعة** — تُرفَع كلماتٌ إلى صندوق
//      الإتقان وتُترك أخرى دونه، ويُطالَب المولّدُ بألّا يخرج غيرَ المتقَن. وتُدسّ
//      كلمةُ قراءةٍ غيرُ متقنةٍ سمعاً في كل صندوقٍ دون العتبة، فلا تخرج في واحدٍ منها.

import { readFileSync, readdirSync } from 'node:fs';

const APP = new URL('../app/js/', import.meta.url);
const read = (name) => readFileSync(new URL(name, APP), 'utf8');

let fails = 0;
let asleep = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg); };
const dormant = (msg) => { asleep++; console.log('  ⏸', `${msg} — نائم، يستيقظ ذاتياً`); };

// تخزينٌ في الذاكرة: `progress.js` يقرأ `localStorage` عند التحميل
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const c = await import(new URL('curriculum.js', APP));
const progress = await import(new URL('progress.js', APP));

// ————— ١) الإعلان: كلُّ كلمةِ قراءةٍ تعلن مفتاحَها، والمفتاحُ في الرصيد —————

console.log('\n١. الإعلان: كلُّ كلمةِ قراءةٍ تعلن مفتاحَها السمعيّ');

const readingWords = c.GRADES.flatMap((g) => g.words.map((w) => ({ ...w, grade: g.id })));
const listenStations = c.stations().filter((s) => s.track === 'listen');
const heard = new Set(listenStations.flatMap((s) => s.skills));

ok(readingWords.length > 0, `كلماتُ القراءة القابلةُ للتوليد: ${readingWords.length}`);

const silent = readingWords.filter((w) => !w.listen);
ok(silent.length === 0,
  `ولكلٍّ مفتاحٌ سمعيّ مكتوب${silent.length ? ` — بلا مفتاح: ${silent.map((w) => w.w).join('، ')}` : ''}`);

const shaped = readingWords.filter((w) => w.listen && w.listen.split('|').length !== 3);
ok(shaped.length === 0,
  `والمفتاحُ ثلاثيّ (وحدة × مدى × نوع تمرين)${shaped.length ? ` — معطوب: ${shaped.map((w) => w.listen).join('، ')}` : ''}`);

const orphan = readingWords.filter((w) => w.listen && !heard.has(w.listen));
ok(orphan.length === 0,
  `والمفتاحُ موجودٌ في مفاتيح مسار السمع (${heard.size} مفتاحاً)`
  + (orphan.length ? ` — بلا مصدر: ${orphan.map((w) => `${w.w} → ${w.listen}`).join('، ')}` : ''));

// **والمدى هو الكلمةُ نفسُها**: مفتاحٌ مدَاه كلمةٌ أخرى يقترن بغير ما يُقرأ — وهو
// خطأٌ صامتٌ تماماً: القيدُ يعمل ويقيس، ولكن على كلمةٍ غير التي على الشاشة.
const crossed = readingWords.filter((w) => w.listen && w.listen.split('|')[1] !== w.w);
ok(crossed.length === 0,
  'ومدَى المفتاح هو الكلمةُ نفسُها لا كلمةٌ أخرى'
  + (crossed.length ? ` — مقترنةٌ بغيرها: ${crossed.map((w) => `${w.w} → ${w.listen}`).join('، ')}` : ''));

// ————— ٢) الترتيب: السمعُ قبل الحرف على الخريطة —————

console.log('\n٢. الترتيب: محطةُ المفتاح السمعيّ قبل درجة القراءة');

const order = new Map();
c.sections().forEach((section, si) => section.nodes.forEach((node, ni) => {
  order.set(node.id, si * 1000 + ni);
}));
const stationOfSkill = new Map();
for (const station of c.stations()) {
  for (const key of station.skills) if (!stationOfSkill.has(key)) stationOfSkill.set(key, station.id);
}

const gradeStation = new Map(c.stations()
  .filter((s) => s.track === 'letter' && s.type !== 'story')
  .map((s) => [s.part, s.id]));

const late = readingWords.filter((w) => {
  const source = stationOfSkill.get(w.listen);
  const at = order.get(gradeStation.get(w.grade));
  return source === undefined || at === undefined || order.get(source) >= at;
});
ok(late.length === 0,
  'وكلُّ مفتاحٍ سمعيّ تسبق محطتُه درجةَ قراءته'
  + (late.length ? ` — متأخّر: ${late.slice(0, 6).map((w) => `${w.w} (${stationOfSkill.get(w.listen) || '؟'})`).join('، ')}` : ''));

// ————— ٣) البنية: بابٌ واحد يأبى أن يُفتَح بلا مفتاح —————

console.log('\n٣. البنية: `readableAt` بابٌ واحد لا يُلتَفّ عليه');

let threw = false;
try {
  c.readableAt('h05');
} catch {
  threw = true;
}
ok(threw, '`readableAt` بلا دالّةِ إتقانٍ **ترمي خطأً** ولا تُرجع قائمةً صامتة');

let threwNull = false;
try {
  c.readableAt('h05', null);
} catch {
  threwNull = true;
}
ok(threwNull, 'و`null` مكانَ الدالّة ترمي كذلك (لا التفافَ بقيمةٍ كاذبة)');

// وحداتُ البذرة ليست شاشاتِ تمارين (نظيرُ `SEED` في `test_nodes.mjs`)
const SEED = new Set(['main.js', 'progress.js', 'curriculum.js', 'ui.js', 'audio.js',
  'review.js', 'parent.js', 'registry.js']);
const modules = readdirSync(APP).filter((f) => f.endsWith('.js') && !SEED.has(f));

// **الالتفافُ الوحيد الممكن**: شاشةٌ تقرأ حوضَ المنهج مباشرةً (`wordsUpTo` أو
// `GRADES`) فتبني تمرينَ قراءةٍ بلا سؤال ليتنر. ويُجرَد **كلُّ ما ليس من البذرة**،
// فيشتدّ الحارسُ من تلقائه كلَّما دخلت شاشةٌ جديدة (الجلسات ٢–٧).
const BYPASS = /\b(wordsUpTo|GRADES|gradesUpTo)\b/;
const bypassing = modules.filter((f) => BYPASS.test(read(f)) && !/readableAt/.test(read(f)));
ok(bypassing.length === 0,
  `ولا شاشةَ تصل إلى حوض المنهج دون الباب (${modules.length} وحدةً مجرودة: ${modules.join('، ')})`
  + (bypassing.length ? ` — ملتفّة: ${bypassing.join('، ')}` : ''));

// **وأخطرُ موضعٍ للقيد المراجعةُ** (`SEED.md §٢`): هي الموضعُ الوحيد الذي يخلط
// الجبهتين، فمن ولّد فيها تمرينَ قراءةٍ بلا تحقّقٍ نقض القيدَ من حيث لا يُنظَر إليه.
if (!/setBuilders\s*\(/.test(modules.map(read).join('\n'))) {
  dormant('ولا بانِيَ تمارينَ محقونٌ في المراجعة بعد (`setBuilders` — الجلسة ٢)');
}

// ————— ٤) المحاكاة: حالةُ ليتنر مصنوعة، والدسّةُ الرابعة —————
//
// **لا يُصدَّق قيدٌ لم يُرَ وهو يمنع.** فتُصنَع حالةُ طفلٍ بيدنا: كلماتٌ تُرفَع إلى
// صندوق الإتقان، وأخرى تُترك في كل صندوقٍ دونه — ويُسأل البابُ عن كلٍّ منها.

console.log('\n٤. المحاكاة بحالة ليتنر مصنوعة (سالباً)');

const GRADE = 'h05';                     // آخرُ درجات العهد الأول: حوضٌ فيه ١٤ كلمة
const pool = c.wordsUpTo(GRADE);
ok(pool.length > 0, `حوضُ ${GRADE} في المنهج: ${pool.length} كلمة`);

/** يرفع مهارةً إلى صندوقٍ بعينه بمحاولاتٍ صحيحة متعاقبة (آليةُ ليتنر نفسُها). */
function raiseTo(key, box) {
  const [unit, range, kind] = key.split('|');
  for (let i = 0; i < box; i++) progress.recordAttempt(unit, range, kind, true);
}

progress.reset();
const [held, ...mastered] = pool;        // **المدسوسة**: كلمةٌ واحدة تبقى غيرَ متقنة
for (const word of mastered) raiseTo(word.listen, progress.MASTERED_BOX);

const out = c.readableAt(GRADE, progress.isMastered);
ok(out.length === mastered.length,
  `${mastered.length} كلمةً بلغت صندوقَ الإتقان (${progress.MASTERED_BOX}) فخرجت من الباب`);
ok(!out.some((w) => w.w === held.w),
  `**والمدسوسةُ «${held.w}» لم تخرج**: مفتاحُها «${held.listen}» لم يبلغ الصندوق ${progress.MASTERED_BOX}`);

// وكلُّ صندوقٍ دون العتبة يُجرَّب واحداً واحداً — فلا يُقال «مُنعت عند الصفر» ويُترك
// الباقي، والعتبةُ **تُقرأ من `progress.js`** لا تُكتب هنا (مصدرٌ واحد).
let leaked = [];
for (let box = 0; box < progress.MASTERED_BOX; box++) {
  progress.reset();
  raiseTo(held.listen, box);
  if (c.readableAt(GRADE, progress.isMastered).some((w) => w.w === held.w)) leaked.push(box);
}
ok(leaked.length === 0,
  `ولا تخرج في أيّ صندوقٍ دون العتبة (جُرِّبت الصناديق ٠..${progress.MASTERED_BOX - 1})`
  + (leaked.length ? ` — تسرّبت عند: ${leaked.join('، ')}` : ''));

progress.reset();
raiseTo(held.listen, progress.MASTERED_BOX);
ok(c.readableAt(GRADE, progress.isMastered).some((w) => w.w === held.w),
  `وتخرج ما إن تبلغ الصندوق ${progress.MASTERED_BOX} — فالقيدُ بابٌ لا جدار`);

// **والخطأُ يُعيدها إلى الحبس**: صندوقُ ليتنر يعود صفراً بالخطأ (`METHOD.md §٧`)،
// فكلمةٌ أُتقنت ثم نُسيت تخرج من تمارين القراءة حتى تُتقَن ثانيةً — وهذا ما يجعل
// القيدَ حيّاً لا شهادةً تُمنح مرّة.
const [unit, range, kind] = held.listen.split('|');
progress.recordAttempt(unit, range, kind, false);
ok(!c.readableAt(GRADE, progress.isMastered).some((w) => w.w === held.w),
  'وخطأٌ واحد يعيدها إلى الحبس — القيدُ حيٌّ لا شهادةٌ تُمنح مرّة');

// **وشائكاتُ الدرجة خارج القيد بعلّتها المكتوبة** (لا بإهمال): كلماتُ وظيفةٍ لا
// معنى مصوَّرَ لها ولا محطةَ سمعية، وحدُّها ميزانيةٌ معدودة (`METHOD.md §١٢-١`).
progress.reset();
const tricky = c.trickyAt(GRADE);
ok(tricky.length > 0 && tricky.every((w) => typeof w === 'string'),
  `وشائكاتُ ${GRADE} (${tricky.length}) خارج القيد بعلّتها المكتوبة في \`curriculum.js\``);
ok(!tricky.some((w) => c.WORDS.some((x) => x.w === w)),
  'ولا شائكةَ منها في الرصيد المصوَّر (فلا يُظنّ أنّ لها مفتاحاً سمعياً سقط)');

// ————— ٥) **الشائكاتُ درجتان** (حكمُ المدير · `METHOD.md §٦`) —————
//
// «الشائكةُ **ذاتُ المدخل في الرصيد السمعي** يسري عليها القيدُ كسائر الكلمات،
// والمستثنى **كلماتُ الوظيفة الصرفة بلا مدخلٍ سمعيّ** بعلّتها المعلنة». فالبابُ
// يفحص الإعلانَ (لكلٍّ **أحدُ** الحقلين لا كلاهما ولا واحدَ منهما)، وشكلَ المفتاح
// ومدَاه، **ثم أثرَه في المولّد نفسِه سالباً**: شائكةٌ ذاتُ مدخلٍ لم ينضج مفتاحُها
// لا يخرج لها `tricky|…|read` في جولةٍ واحدة، وتخرج ما إن ينضج.

console.log('\n٥. الشائكاتُ درجتان: ذاتُ المدخل تحت القيد، والوظيفةُ بعلّتها');

const hearts = Object.entries(c.HEART_WORDS);
const allTricky = c.GRADES.flatMap((g) => g.tricky);

const undeclared = hearts.filter(([, s]) => !s.listen === !s.why);
ok(undeclared.length === 0,
  `كلُّ شائكةٍ تعلن **أحدَ** الحقلين: مفتاحاً سمعياً أو علّةَ استثناء (${hearts.length} شائكة)`
  + (undeclared.length ? ` — معطوبة: ${undeclared.map(([w]) => w).join('، ')}` : ''));

const coupled = hearts.filter(([, s]) => s.listen);
const exempt = hearts.filter(([, s]) => s.why);
ok(coupled.length > 0 && exempt.length > 0,
  `والصنفان قائمان: ${coupled.length} ذاتُ مدخلٍ سمعيّ (${coupled.map(([w]) => w).join('، ')})`
  + ` · ${exempt.length} وظيفةٌ صرفة (${exempt.map(([w]) => w).join('، ')})`);

const badKey = coupled.filter(([w, s]) => s.listen.split('|').length !== 3
  || s.listen.split('|')[1] !== w);
ok(badKey.length === 0,
  'ومفتاحُها ثلاثيٌّ ومدَاه الكلمةُ نفسُها — كمفاتيح كلمات القراءة سواءً'
  + (badKey.length ? ` — معطوب: ${badKey.map(([w, s]) => `${w} → ${s.listen}`).join('، ')}` : ''));

// **ومحطتُها السمعية**: ما وُجدت منها يُطالَب بالترتيب (سمعٌ قبل حرف)، وما لم توجد
// **ينام بعلّته المكتوبة** ويستيقظ يومَ تُكتب — فلا رايةَ تُضبط بيد ولا وعدٌ يُنسى.
const homeless = coupled.filter(([, s]) => !heard.has(s.listen));
if (homeless.length) {
  dormant(`و${homeless.length} شائكةً مفتاحُها معلَنٌ ولا محطةَ سمعيةَ له بعد `
    + `(${homeless.map(([w]) => w).join('، ')}) — بيتُها جملُ س٥-٦ (الجلسة ٧)، `
    + 'وحتى ذلك اليوم يمنعها القيدُ من القراءة (بندٌ يُرفَع)');
}
const lateTricky = coupled.filter(([w, s]) => {
  const source = stationOfSkill.get(s.listen);
  if (source === undefined) return false;                 // نائمةٌ في بابها أعلاه
  const grade = c.GRADES.find((g) => g.tricky.includes(w));
  return order.get(source) >= order.get(gradeStation.get(grade?.id));
});
ok(lateTricky.length === 0,
  'ومحطةُ ما وُجد منها تسبق درجةَ شائكتها على الخريطة'
  + (lateTricky.length ? ` — متأخّرة: ${lateTricky.map(([w]) => w).join('، ')}` : ''));

let threwTricky = false;
try {
  c.readableTrickyAt('h06');
} catch {
  threwTricky = true;
}
ok(threwTricky, 'و`readableTrickyAt` بلا دالّةِ إتقانٍ ترمي خطأً — بابٌ كأخيه لا يُلتَفّ عليه');

// **والدسّةُ في المولّد لا في الدالّة وحدَها**: تُصنَع حالُ طفلٍ نضجت فيها شائكةٌ
// ذاتُ مدخلٍ وبقيت أختُها دونها، وتُجرَد **كلُّ جولةٍ يمكن أن تقع** في درجتها.
const grade = await import(new URL('grade.js', APP));
const withTricky = c.GRADES.find((g) => g.tricky.some((w) => c.HEART_WORDS[w]?.listen));
const [heldTricky, ...ripeTricky] = withTricky.tricky.filter((w) => c.HEART_WORDS[w]?.listen);

/** ما يُسأل عنه من شائكاتٍ في درجةٍ بحالِ ليتنر مصنوعة (جولاتُ خمسين بذرة). */
const askedIn = (gradeId, isMastered) => {
  const asked = new Set();
  for (let seed = 1; seed <= 50; seed++) {
    const plan = grade.buildStation(`grade:${gradeId}`, seed, isMastered);
    for (const round of plan ? [plan.model, ...plan.guided, ...plan.solo] : []) {
      if (round.kind === 'read') asked.add(round.range);
    }
  }
  return asked;
};

const ripenAll = (except) => (key) => {
  const word = String(key).split('|')[1];
  return word !== except;
};

const guarded = askedIn(withTricky.id, ripenAll(heldTricky));
ok(!guarded.has(heldTricky),
  `**والمدسوسةُ «${heldTricky}» لم يُسأل عنها في خمسين بذرة** — مفتاحُها `
  + `«${c.HEART_WORDS[heldTricky].listen}» دون صندوق الإتقان (${withTricky.id})`);
ok(ripeTricky.some((w) => guarded.has(w)),
  `وأختُها الناضجةُ سُئل عنها فعلاً (${[...guarded].join('، ') || 'لا شيء'}) — `
  + 'فالغيابُ يُقاس على مولّدٍ يولّد');
ok(askedIn(withTricky.id, () => true).has(heldTricky),
  `وتدخل ما إن ينضج مفتاحُها — بابٌ لا جدار (${withTricky.id})`);

// **والوظيفةُ الصرفة تمضي بلا سؤال ليتنر**: حالٌ فارغةٌ تماماً، فتخرج شائكاتُ
// العهد الأول كلُّها (‏`the` · `to`…) ولا تخرج ذواتُ المدخل — درجتان في جردٍ واحد.
progress.reset();
const empty = c.readableTrickyAt(withTricky.id, progress.isMastered);
ok(empty.length > 0 && empty.every((w) => !c.HEART_WORDS[w]?.listen),
  `وعلى حالٍ فارغةٍ تمضي الوظيفةُ الصرفة وحدَها (${empty.length}: ${empty.join('، ')})`);
ok(allTricky.filter((w) => c.HEART_WORDS[w]?.listen).every((w) => !empty.includes(w)),
  'ولا شائكةَ ذاتُ مدخلٍ تمرّ بلا إتقانٍ سمعيّ — وهذا هو الحكمُ نصّاً');

console.log(fails
  ? `\n${fails} فشل`
  : `\nقيدُ الاقتران محروسٌ من الجهتين${asleep ? ` (و${asleep} نائم بقيدٍ في docs/SEED.md)` : ''}`);
process.exit(fails ? 1 : 0);
