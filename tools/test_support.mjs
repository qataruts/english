// اختبار «وضع الدعم» — الجلسة ب: نغيّر الإيقاع لا المادة.
//   node tools/test_support.mjs
// يحرس: app/js/support.js app/js/progress.js app/js/review.js app/js/gate.js
//   app/js/placement.js app/js/audio.js app/js/ui.js app/js/main.js app/js/parent.js
//   app/css/app.css app/welcome/index.html ووحدات التمارين كلَّها
//   (المقابضُ وقاعدةُ الملقَّن ومسطرةُ الامتحان والمؤشّرُ وسطرُ الوعد)
// يخرج بـ١ عند أي إخفاق.
//
// **بابٌ لكل بندٍ من بنود العقد التسعة** (بلاغ
// `2026-08-17-support-mode-contract-for-siblings` و`support-and-placement-coexist`):
//   ١) **الافتراضُ الصامت هو السلوكُ القائم حرفاً** — مطفأً لا فرقَ ببايت.
//   ٢) المقابضُ تعمل حين تُشغَّل، والإطفاءُ يردّ القائم بلا فقدِ اختيارات الوالد.
//   ٣) **الملقَّنُ لا يرقّي صندوقاً ولا يُحتسب إتقاناً** — **ولا يفتح كلمةً للقراءة**
//      (عندنا `MASTERED_BOX` عتبةُ قيد الاقتران نفسِها، فالعونُ لو احتُسب لَفتح ما لم
//      تُثبته الأذن).
//   ٤) **التلقينُ في الاكتساب وحدَه** — ولا في المراجعة ولا البوابات ولا اللحاق:
//      حصانةٌ بنيوية تُجرد على المصدر، **والمطابقةُ في الاتجاهين**، **وبابُ وسم العون
//      نائمٌ** يستيقظ يومَ تستدعيه شاشة.
//   ٥) **لا مِقبضَ يمسّ نصَّ محتوىً أو كلمةً إنكليزية** — جردٌ على المصدر وعلى الجدول.
//   ٦) **مسطرةُ الامتحان الواحدة**: ما يمسّ القياسَ يعود إلى القائم داخل النطاق وما
//      يريح يسري، والنطاقُ يُردّ ولو رمى ولا يُخزَّن — في البوابات الثلاث واللحاق معاً.
//   ٧) **المقاديرُ من مخزنٍ واحد** لا ثوابتَ متناثرة (والجرعةُ والحوضُ يُقرآن عند
//      البناء لا عند التحميل).
//   ٨) **المؤشّر**: في الشريط اللاصق، بلا كلمةٍ تَسِمُ الطفل ولا زحزحةِ تخطيط، ويغيب
//      بالإطفاء.
//   ٩) **سطرُ الوعد الصادق** في اللوحة والتعريفية معاً بنصٍّ واحد.
//
// **ومُجرَّبٌ سالباً** — على شيفرةٍ مُعدَّلة عمداً ثم رُدَّت، كلُّها احمرّت هنا بالاسم:
//   • ردُّ `value` إلى `supported` بلا شرط الامتحان        ⇒ §٦ بالأرقام
//   • حذفُ فرع `helped` من `recordAttempt`                 ⇒ §٣ بالصندوق والإتقان
//   • إعادةُ `const OPTIONS = 3` إلى وحدةِ تمارين          ⇒ §٧ «لا ثابتَ حوضٍ»
//   • نزعُ `duringExam` من `gateItems`                      ⇒ §٦ بسعة حوض البوابة
//   • رفعُ وسم `pending` عن مقبض التلقين                    ⇒ §٤ بالمطابقة في الاتجاهين
//   • جعلُ المؤشّر حدّاً (`border-bottom`) بدل الظلّ         ⇒ §٨ «لا تزحزح تخطيطاً»
//   • إسقاطُ عبارةٍ من حدّ الوعد في الصفحة التعريفية        ⇒ §٩ حرفاً بحرف

import { readFileSync, readdirSync } from 'node:fs';

const APP = new URL('../app/js/', import.meta.url);
const ROOT = new URL('../', import.meta.url);
const src = (name) => readFileSync(new URL(name, APP), 'utf8');
const file = (path) => readFileSync(new URL(path, ROOT), 'utf8');

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const support = await import(new URL('support.js', APP));
const progress = await import(new URL('progress.js', APP));
const review = await import(new URL('review.js', APP));
const gate = await import(new URL('gate.js', APP));
const curriculum = await import(new URL('curriculum.js', APP));
const station = await import(new URL('station.js', APP));
const { seeded, shuffle } = await import(new URL('ui.js', APP));

/** وحداتُ التمارين — تُجرَد ولا تُكتب بأسمائها (وحدةٌ جديدة تدخل الجردَ يومَ تُكتب). */
const SEED = new Set(['main.js', 'progress.js', 'curriculum.js', 'ui.js', 'audio.js',
  'review.js', 'parent.js', 'support.js', 'registry.js', 'station.js', 'gate.js',
  'placement.js', 'install.js', 'feedback.js', 'figures.js']);
const appFiles = readdirSync(APP).filter((f) => f.endsWith('.js'));
const unitFiles = appFiles.filter((f) => !SEED.has(f));
for (const f of unitFiles) await import(new URL(f, APP));

let fails = 0;
let asleep = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg); };
const dormant = (msg) => { asleep++; console.log('  ⏸', `${msg} — نائم، يستيقظ ذاتياً`); };

const css = file('app/css/app.css');
const KNOB_COUNT = support.KEYS.length;

// ————— ١) الافتراضُ الصامت: السلوكُ القائم حرفاً —————

console.log('\n١. الافتراض الصامت = السلوك القائم');

support.reset();
ok(support.modeOn() === false, 'وضعُ الدعم مطفأٌ ابتداءً (مخزنٌ فارغ)');
ok(support.KEYS.every((k) => support.value(k) === support.KNOBS[k].standing),
  `وكلُّ مقبضٍ يقرأ قيمتَه القائمة (${KNOB_COUNT} مقابض)`);
ok(support.KEYS.every((k) => support.isOn(k) === false), 'ولا مِقبضَ مشتغلٌ والوضعُ مطفأ');

ok(support.sessionSize() === 6, `جرعةُ المراجعة ستّةُ تمارين (${support.sessionSize()})`);
ok(support.optionCount() === 3, `وبطاقاتُ الاختيار ثلاث (${support.optionCount()})`);
ok(support.rate('en') === 1 && support.rate('ar') === 1,
  'وسرعةُ الصوت ١ في القناتين — فلا يُمَسّ عنصرُ الصوت أصلاً');
ok(support.calm() === false, 'ولا هدوءَ حسّياً');
ok(support.mayPrompt(0) === false, 'ولا تلقينَ ألبتّة — ولو في صندوق الاكتساب');

ok(review.SESSION_SIZE === support.KNOBS.dose.standing,
  '`SESSION_SIZE` في المراجعة هو عينُ القائم في الجدول (لا رقمان يفترقان)');
let seq = 0;
const sizeOf = () => review.buildSession({
  fillers: Array.from({ length: 12 }, () => () => ({ id: `x${++seq}`, kind: 'k' })),
}).length;
ok(sizeOf() === 6, `وجلسةٌ تُبنى بستّة تمارين (${sizeOf()})`);

// ————— ٢) المقابضُ تعمل حين تُشغَّل —————

console.log('\n٢. المقابض تعمل من مفتاحٍ واحد');

support.setMode(true);
ok(support.PANEL_KEYS.every((k) => support.isOn(k)),
  `تشغيلُ الوضع يشغّل مقابضَه كلَّها (${support.PANEL_KEYS.length} معروضة)`);
ok(support.sessionSize() === 4, `الجرعة: أربعةُ تمارين (${support.sessionSize()})`);
ok(sizeOf() === 4, `وجلسةُ المراجعة تُبنى بأربعة فعلاً (${sizeOf()})`);
ok(support.optionCount() === 2, `الحوض: بطاقتان (${support.optionCount()})`);
ok(support.rate('en') < 1, `نموذجُ المادّة الإنكليزية: أبطأ (${support.rate('en')})`);
ok(support.rate('ar') === support.KNOBS.model.standing,
  `**والتوجيهُ العربيّ على سرعته** (${support.rate('ar')}) — لسانُ الطفل الأول لا يُبطَّأ`);
ok(support.calm() === true, 'الهدوء الحسّي: مشتغل');

/* **وضيقُ الحوض يُقاس على جولاتٍ حقيقية** لا على الرقم وحدَه: يُصنَع سجلُّ طفلٍ أتمّ
   الرحلةَ كلَّها **وأتقن مفاتيحَه سمعاً** (وإلّا لم تُبنَ جولةُ قراءةٍ واحدة — قيدُ
   الاقتران)، ثم تُبنى جلستُه بالمقبض مشتغلاً ومطفأً، فتُقابَل بطاقاتُ الجولات بالمُعلَن.
   (وأزواجُ التمييز والصائتُ الأوسط بطاقتان بطبعهما — فالمقيسُ **ألّا يزيد** أحدٌ على
   المُعلَن، وأنّ الضيقَ يقع فعلاً في جولاتٍ منها.) */
const seedRecord = () => {
  progress.reset();
  for (const s of curriculum.stations()) {
    progress.setStars(s.id, 3);
    for (const key of s.skills || []) {
      const [unit, range, kind] = key.split('|');
      // أربعُ إصاباتٍ تبلغ صندوقَ الإتقان فينفتح قيدُ الاقتران، ثم خطأٌ يردّها ضعيفةً
      for (let i = 0; i < 4; i++) progress.recordAttempt(unit, progress.spanOf(range), kind, true);
    }
  }
};
/** بطاقاتُ جولاتِ ثماني جلساتٍ ببذورٍ مختلفة — فلا يُحكَم على الحوض بجلسةٍ واحدة. */
const cardsIn = () => Array.from({ length: 8 }, (_, s) => s + 1)
  /* **والحصيلةُ تُخلَط قبل كل جلسة**: صناديقُ سجلٍّ مصنوع متساوية، فترتيبُ الضعف يردّ
     المفاتيحَ بترتيب حروفها — فتُبنى ثماني جلساتٍ من صدر القائمة نفسِه ولا يُرى إلا
     نوعان. والخلطُ يُري الأنواعَ كلَّها كما يراها طفلٌ سجلُّه حيّ. */
  .flatMap((s) => review.sessionItems(
    shuffle(progress.weakestSkills(), seeded(s * 977)), 24, seeded(s * 977)))
  .filter((i) => i.options?.length).map((i) => [i.kind, i.options.length]);
seedRecord();
const narrow = cardsIn();
support.setMode(false);
const standing = cardsIn();
support.setMode(true);
/* **والمقابلةُ بالنوع لا بالترتيب**: ضيقُ الحوض يغيّر عددَ السحبات من مولّد البذرة،
   فتفترق الجلستان في مادّتهما ولو اتّحدت بذرتُهما — **وهو أثرٌ لا عيب**. فيُقابَل
   **أقصى ما بلغه كلُّ نوعٍ** في الحالين: لا نوعَ يتّسع، وأنواعٌ تضيق. */
const byKind = (rows) => rows.reduce((m, [k, n]) => m.set(k, Math.max(m.get(k) ?? 0, n)), new Map());
const [narrowMax, standingMax] = [byKind(narrow), byKind(standing)];
ok(narrow.length > 20 && narrowMax.size > 4,
  `وجولاتٌ ببطاقاتٍ تُقاس فعلاً في ثماني جلسات (${narrow.length} جولة · ${narrowMax.size} نوعاً)`);
const grew = [...narrowMax].filter(([k, n]) => n > (standingMax.get(k) ?? n));
const shrank = [...narrowMax].filter(([k, n]) => n < (standingMax.get(k) ?? n));
ok(grew.length === 0 && shrank.length >= 3,
  `والحوضُ يضيق ولا يتّسع: ${shrank.length} نوعاً ضاق وصفرٌ اتّسع`
  + (grew.length ? ` — اتّسع: ${grew.map(([k, n]) => `${k}:${n}`).join('، ')}` : '')
  + ` (${shrank.map(([k, n]) => `${k} ${standingMax.get(k)}←${n}`).join(' · ')})`);
ok(Math.min(...narrow.map(([, n]) => n)) >= 2,
  'ولا جولةَ تنزل دون بطاقتين — ضيقٌ لا يمحو الخيار');
progress.reset();

console.log('\n٣. مِقبضٌ يُطفأ وحده، والإطفاءُ يردّ القائم بلا فقد');

support.set('pool', false);
ok(support.optionCount() === 3 && support.sessionSize() === 4,
  'إطفاءُ مقبضٍ بعينه يردّه وحدَه إلى القائم');
support.setMode(false);
ok(support.KEYS.every((k) => support.value(k) === support.KNOBS[k].standing),
  'وإطفاءُ الوضع يردّ الجميع');
support.setMode(true);
ok(support.isOn('pool') === false && support.isOn('dose') === true,
  'وإعادةُ التشغيل تحفظ ما أطفأه الوالدُ بيده');
support.reset();
ok(support.modeOn() === false && support.isOn('pool') === false,
  'و«أعِد الافتراضات» يفرّغ المخزن كلَّه');

// ————— ٤) الملقَّنُ لا يرقّي صندوقاً ولا يُحتسب إتقاناً —————

console.log('\n٤. العون يُسجَّل ولا يُزوَّر القياس');

const KEY = ['word', 'cat', 'listen-pick'];
const HELPED = ['word', 'dog', 'listen-pick'];
const boxOf = (k) => progress.getSkill(progress.skillKey(...k));

progress.recordAttempt(...KEY, true);
ok(boxOf(KEY)?.box === 1, 'محاولةٌ صحيحة بلا عون ترفع الصندوق (١)');

for (let i = 0; i < 6; i++) progress.recordAttempt(...HELPED, true, progress.dayNumber(), true);
const aided = boxOf(HELPED);
ok(aided?.box === 0, `ستُّ إجاباتٍ ملقَّنة صحيحة لا ترفع الصندوق (${aided?.box})`);
ok(aided?.right === 0 && aided?.wrong === 0, 'ولا تُحتسب صواباً ولا خطأً');
ok(aided?.helped === 6, `وتُسجَّل محاولاتٍ معانة (${aided?.helped})`);
ok(aided?.due <= progress.dayNumber(), 'وتبقى المهارةُ مستحقّةً للمراجعة — العونُ لا يُبعد موعداً');
ok(aided.box < progress.MASTERED_BOX,
  'و**لا يبلغ الملقَّنُ صندوقَ الإتقان أبداً** — فما في «ما يفعله» أثبته بنفسه');
/* **وعندنا أثقلُ**: صندوقُ الإتقان عتبةُ **قيد الاقتران** (`METHOD.md §٦`) — فلو
   احتُسب الملقَّنُ لَفُتحت كلمةٌ للقراءة لم تثبت في أذن الطفل، وهو عينُ الفخّ
   المُغلَق بنيوياً: «فكٌّ بلا معنى». */
ok(progress.isMastered(progress.skillKey(...HELPED)) === false,
  '**ولا يفتح الملقَّنُ كلمةً للقراءة** — العونُ لا يعبر قيدَ الاقتران');
/* **والشاهدُ مقابلةٌ لا نفيٌ وحدَه**: كلمةٌ أُتقنت بنفسها تدخل المقروء، وأختُها التي
   «أُتقنت» بالعون تبقى خارجه — في الدرجة الواحدة وبالبابِ الواحد. */
for (let i = 0; i < 4; i++) progress.recordAttempt(...KEY, true);
const readable = curriculum.readableAt('h03', progress.isMastered).map((w) => w.w);
ok(readable.includes('cat') && !readable.includes('dog'),
  `وبابُ القراءة نفسُه يشهد: «cat» (أثبتها بنفسه) داخلَ المقروء و«dog» (أُعين عليها)`
  + ` خارجَه — ${readable.join('، ') || 'لا شيء'}`);

for (let i = 0; i < 3; i++) progress.recordAttempt(...KEY, true);
const before = boxOf(KEY).box;
progress.recordAttempt(...KEY, false, progress.dayNumber(), true);
ok(boxOf(KEY).box === before && boxOf(KEY).wrong === 0,
  `وخطأٌ مع العون لا يُصفّر صندوقاً ولا يُسجَّل ضعفاً (${boxOf(KEY).box})`);
progress.reset();

// ————— ٥) التلقين في الاكتساب وحدَه — والمطابقةُ في الاتجاهين —————

console.log('\n٥. لا تلقين خارج الاكتساب');

support.setMode(true);
ok(support.mayPrompt(0) === true, 'التلميحُ يجوز في صندوق الاكتساب (صفر) والوضعُ مشتغل');
ok([1, 2, 3, 4, 5].every((box) => support.mayPrompt(box) === false),
  'ولا يجوز في صندوقٍ ارتفع — الطلاقةُ لا تُلقَّن (Haring 1978)');
support.set('prompt', false);
ok(support.mayPrompt(0) === false, 'ومفتاحُه يُطفأ وحدَه');
support.reset();

/* **والمطابقةُ في الاتجاهين**: مفتاحٌ في اللوحة ⇔ شاشةٌ تستدعيه. واليومَ لا شاشةَ
   تستدعيه — شاشاتُ التمارين السبعُ خارج ملفّات هذه الجلسة — فالوسمُ `pending` باقٍ
   والمفتاحُ غائبٌ عن اللوحة. ومن كتب استدعاءً غداً **يُحمِّر هذا البابَ** حتى يرفع الوسمَ. */
const CALLS = /mayPrompt\s*\(/;
const promptScreens = appFiles.filter((f) => f !== 'support.js' && CALLS.test(src(f)));
ok(Boolean(support.KNOBS.prompt.pending) === (promptScreens.length === 0),
  promptScreens.length
    ? `شاشاتٌ تستدعي التلقين (${promptScreens.join('، ')}) — فالوسمُ يجب أن يُرفَع`
    : 'ولا شاشةَ تستدعي التلقين اليومَ، فالوسمُ `pending` باقٍ ومفتاحُه غائبٌ عن اللوحة');
ok(support.PANEL_KEYS.includes('prompt') === !support.KNOBS.prompt.pending,
  'واللوحةُ تعرض ما لا وسمَ عليه وحدَه — فلا مفتاحَ يقلّبه الوالدُ بلا أثر');
ok(!/mayPrompt/.test(src('review.js')) && !/mayPrompt/.test(src('gate.js'))
  && !/mayPrompt/.test(src('placement.js')),
  'ولا المراجعةُ ولا البوابات ولا اللحاقُ تعرف `mayPrompt` بحال (حصانةٌ بنيوية على المصدر)');

/* **وبابُ وسم العون نائمٌ بشرطٍ مجرود**: يومَ تستدعي شاشةٌ التلقينَ يُطالَب كلُّ موضع
   قياسٍ فيها بتمرير الوسم — فموضعٌ جديد بلا وسمٍ يسجّل إتقاناً كاذباً على تلميحٍ
   معروض. ولا يُطفَأ بيدٍ ولا يُضبَط: شرطُه وجودُ مستدعٍ. */
if (!promptScreens.length) {
  dormant('بابُ وسم العون: لا شاشةَ تلقّن اليومَ، فلا موضعَ قياسٍ يلزمه الوسم');
} else {
  const CALL = /recordAttempt\((?:[^()]|\([^()]*\))*\)/g;
  const TAGGED = /,\s*[\w.]+\s*,\s*[\w.]+\s*\)$/;
  for (const f of promptScreens) {
    const found = src(f).match(CALL) || [];
    const bare = found.filter((c) => !TAGGED.test(c));
    ok(found.length > 0 && bare.length === 0,
      `[${f}] كلُّ مواضع القياس فيه تمرّر وسمَ العون (${found.length} موضعاً`
      + `${bare.length ? ` — بلا وسم: ${bare.length}` : ''})`);
  }
}

// ————— ٦) لا مِقبضَ يمسّ نصَّ محتوىً أو كلمةً إنكليزية —————

console.log('\n٦. المقابض مقاديرُ لا مادّة');

const supportSrc = src('support.js');
ok(!/^\s*import\s/m.test(supportSrc),
  'وحدةُ الدعم **لا تستورد شيئاً** — فلا تبلغ منهجاً ولا محطةً ولا مُصيِّراً بحال');
ok(!/['"]\.\/(curriculum|station|progress|review|figures)\.js['"]/.test(supportSrc),
  'ولا مسارَ ملفِّ بياناتٍ أو رسمٍ مكتوبٌ فيها ألبتّة');
const kinds = Object.values(support.KNOBS)
  .flatMap((k) => [typeof k.standing, typeof k.supported]);
ok(kinds.every((t) => t === 'number' || t === 'boolean'),
  `وكلُّ مقدارٍ رقمٌ أو نعم/لا — لا قيمةَ نصّية بينها (${[...new Set(kinds)].join('، ')})`);
ok(Object.values(support.KNOBS).every((k) => typeof k.standing === typeof k.supported),
  'والقائمُ وبديلُه من صنفٍ واحد في كل مقبض');
ok(Object.values(support.KNOBS).every((k) => k.title && k.line),
  'ولكلٍّ اسمُه وسطرُ شرحه في الجدول نفسِه (فلا يفترق ما يُقرأ عمّا يُفعَل)');
/* **ولا نصَّ منطوقاً جديداً**: `SPOKEN` جردُ ما يُنطق (يقرؤه `queue_texts`)، وعناوينُ
   المقابض وسطورُها نصُّ لوحةٍ لوليّ الأمر — فلا يقع منها حرفٌ في المنطوق، **ولا حرفَ
   لاتينيٌّ فيها أصلاً** فلا تمسّ مادّتنا الإنكليزية. */
const spoken = new Set(station.SPOKEN.map((one) => one.text));
const said = Object.values(support.KNOBS).flatMap((k) => [k.title, k.line])
  .concat([support.MARK.label, support.MARK.note, support.PROMISE])
  .filter((t) => spoken.has(t));
ok(said.length === 0,
  `ولا نصَّ من نصوص الوضع منطوقٌ في التطبيق (${said.length})`
  + (said.length ? ` — ${said.join('، ')}` : ''));
const latin = Object.values(support.KNOBS).flatMap((k) => [k.title, k.line])
  .filter((t) => /[A-Za-z]/.test(t));
ok(latin.length === 0,
  `ولا حرفَ لاتينيٍّ في أسماء المقابض وسطورها — فلا تمسّ كلمةً من مادّتنا (${latin.length})`);

// ————— ٧) مسطرةُ الامتحان الواحدة —————

console.log('\n٧. مسطرةُ الامتحان الواحدة');

support.reset();
support.setMode(true);

ok(support.KEYS.every((k) => typeof support.KNOBS[k].measures === 'boolean'),
  `كلُّ مقبضٍ مصنَّفٌ في الجدول: أيمسّ ما يُقاس أم يريح؟ (${KNOB_COUNT} مقابض)`);
ok(support.EXAM_OFF.join('،') === support.KEYS.filter((k) => support.KNOBS[k].measures).join('،')
  && support.EXAM_OFF.length === 3,
  'والذي يُعطَّل في الامتحان **مشتقٌّ من التصنيف** لا قائمةٌ ثانية '
  + `(${support.EXAM_OFF.join('، ')})`);
ok(!/EXAM_OFF\s*=\s*\[/.test(supportSrc),
  'ولا قائمةَ مكتوبةٌ بيدٍ في المصدر — اشتقاقٌ بـ`filter` لا حرف');

ok(!support.examOn(), 'وخارج النطاق لا امتحانَ مشتغل');
const inExam = support.duringExam(() => ({
  on: support.examOn(),
  dose: support.sessionSize(),
  pool: support.optionCount(),
  prompt: support.mayPrompt(0),
  model: support.rate('en'),
  calm: support.calm(),
}));
ok(inExam.on && !support.examOn(), 'والنطاق يُفتَح ويُغلَق مع النداء المتزامن');
ok(inExam.pool === support.KNOBS.pool.standing
  && inExam.dose === support.KNOBS.dose.standing && inExam.prompt === false,
  `وفيه يعود ما يجيب إلى القائم: حوضٌ ${inExam.pool} · جرعةٌ ${inExam.dose} · لا تلقين`);
ok(inExam.model === support.KNOBS.model.supported && inExam.calm === true,
  `ويسري ما يريح: نموذجٌ ${inExam.model} · هدوءٌ حسّيّ`);
ok(support.optionCount() === support.KNOBS.pool.supported,
  'وبعد انقضائه يعود الوضعُ إلى مقاديره — لا أثرَ يبقى على شاشات الطفل');

let threw = false;
try { support.duringExam(() => { throw new Error('عطب'); }); } catch { threw = true; }
ok(threw && !support.examOn(), 'ولو رمى النداءُ رُدّ الحالُ — لا يعلق الامتحانُ مفتوحاً');
ok(!String(store.get('listen.support.v1') || '').includes('exam'),
  'ولا يُخزَّن النطاقُ في الجهاز أصلاً — مدّةُ بناءٍ لا عَلَمٌ يعبر النسخ');

const gateSrc = src('gate.js');
ok(/duringExam\(\(\) => sessionItems\(/.test(gateSrc),
  'وبواباتُ الإتقان تبني تمارينَها داخل النطاق (`duringExam(() => sessionItems(`)');
ok(!/sessionSize|optionCount|mayPrompt|\brate\(/.test(gateSrc),
  'ولا تقرأ مقداراً من مقادير الوضع بيدها — تستورد النطاقَ وحدَه');
ok(/PASS_RATE = 0\.8/.test(gateSrc) && !/support\.[a-z]*[Pp]ass/.test(gateSrc),
  'وعتبتُها ٨٠٪ واحدةٌ للجميع — لا مقبضَ يمسّها');

/* **والأثرُ يُقاس على بوابةٍ حقيقية**: تُبنى جلستُها والوضعُ مشتغل، فيجب أن تكون
   بعشرة تمارين (لا بالجرعة المخفَّضة) وببطاقاتٍ ثلاث (لا ببطاقتين). */
seedRecord();
const gateRound = gate.gateItems(curriculum.GATES[0].id, seeded(37));
const gateCards = gateRound.filter((i) => i.options?.length);
ok(gateRound.length === gate.GATE_SIZE,
  `وجلسةُ البوابة عشرةُ تمارين والوضعُ مشتغل (${gateRound.length})`);
ok(gateCards.length > 0 && gateCards.some((i) => i.options.length >= 3)
  && gateCards.every((i) => i.options.length >= 2),
  `وبطاقاتُها ثلاثٌ حيث يكون الحوضُ ثلاثاً (${[...new Set(gateCards.map((i) => i.options.length))].join('، ')})`);
progress.reset();
support.reset();

// ————— ٨) المقادير من مخزنٍ واحد —————

console.log('\n٨. مخزنٌ واحد لا ثوابتُ متناثرة');

const reviewSrc = src('review.js');
ok(/size = sessionSize\(\)/.test(reviewSrc) && !/= SESSION_SIZE,/.test(reviewSrc),
  'جرعةُ الجلسة تُقرأ عند كل بناء لا مرّةً عند التحميل');
const stray = unitFiles.filter((f) => /const (SOLO_)?OPTIONS\s*=/.test(src(f)));
ok(stray.length === 0,
  `ولا ثابتَ حوضٍ في وحدةِ تمارين (${unitFiles.length} وحدة)`
  + (stray.length ? ` — ${stray.join('، ')}` : ''));
const users = unitFiles.filter((f) => /optionCount\(\)/.test(src(f)));
ok(users.length >= 5 && users.every((f) => /from '\.\/support\.js'/.test(src(f))),
  `وكلُّ وحدةٍ تبني بطاقاتٍ تقرأ سَعتَها من المخزن (${users.length} وحدة: ${users.join('، ')})`);
const audioSrc = src('audio.js');
ok(/playbackRate = speed/.test(audioSrc) && /const speed = rate\(lang\)/.test(audioSrc),
  'والصوتُ يسأل المخزنَ عن سرعته **بلسان قناته** (`rate(lang)`)');
ok(/preservesPitch = true/.test(audioSrc),
  'وطبقتُه محفوظة — إبطاءٌ بلا تشويهِ نبرةِ المعلّم المُقَرّة بالأذن');
ok(/\/ speed \+ 1500/.test(audioSrc),
  'ومهلةُ التجميد تُقسَم على السرعة — فلا يُقطَع نموذجٌ بُطِّئ قبل أن يتمّ');
ok(!/generate|synthes|SpeechSynthesisUtterance\(text\)[\s\S]{0,80}rate = rate/.test(audioSrc)
  && /el\.playbackRate/.test(audioSrc),
  'و**بطءُ النموذج معالجةُ تشغيلٍ لا توليد** — عنصرُ الصوت نفسُه بالملفّ نفسِه');
ok(/classList\.toggle\('calm'/.test(src('main.js')),
  'والهدوءُ صنفٌ على الجذر يصبغه `main.js` (والوحدةُ لا تعرف DOM)');

// ————— ٩) المؤشّر: يُرى ولا يَسِم، ولا يزحزح —————

console.log('\n٩. مؤشّرُ وضع الدعم');

const uiSrc = src('ui.js');
const mainSrc = src('main.js');
const markCss = css.match(/:root\.support-on \.topbar \.pill\s*\{[^}]*\}/)?.[0] || '';

ok(support.MARK.label && support.MARK.note,
  `واسمُها وسطرُها في جدول support.js حيث تُملَك العلامة («${support.MARK.label}»)`);
ok(/support\.modeOn\(\)[\s\S]{0,60}title: support\.MARK\.label/.test(uiSrc),
  'واسمُها على الشريط اللاصق نفسِه (`title`) — لوليّ الأمر، ولا نصَّ يقرؤه طفل');
/* **ولا موضعَ لاسمها إلا `title`**: تُجرَد مواضعُ ذكره في `ui.js` كلُّها، فكلٌّ منها
   يجب أن يسبقه `title: ` — فمن مرّره ولداً في الشريط (نصّاً يقرؤه طفل) يحمرّ هنا،
   **ويقيسه المتصفّحُ على الشاشة نفسِها** (نصُّ الشريط لا يتغيّر بتشغيل الوضع). */
const NAME = 'support.MARK.label';
const spots = [...uiSrc.matchAll(new RegExp(NAME.replace(/\./g, '\\.'), 'g'))].map((m) => m.index);
ok(spots.length > 0 && spots.every((i) => uiSrc.slice(Math.max(0, i - 7), i) === 'title: '),
  `ولا موضعَ لاسمها في الواجهة إلا \`title\` (${spots.length} موضعاً)`);
ok(!/>\s*وضعُ الدعم/.test(uiSrc) && !uiSrc.includes(`'${support.MARK.label}'`),
  'ولا تُكتب كلمتُها في الشاشة البتّة');
ok(markCss && !/content:\s*['"]/.test(markCss),
  'وعلامتُها خطٌّ في اللوح بلا حرفٍ يُرسَم' + (markCss ? '' : ' — **لا قاعدةَ لها**'));
ok(/box-shadow/.test(markCss) && !/\b(height|padding|margin|border(-bottom)?\s*:|position)/.test(markCss),
  'ولا تزحزح تخطيطاً: ظلٌّ داخليّ لا حدٌّ يزيد ارتفاعَ الشارة ولا حشوة');
ok(/classList\.toggle\('support-on', on\)/.test(mainSrc) && /support\.onChange\(paintSupport\)/.test(mainSrc),
  'وصبغُها معلَّقٌ بالمفتاح الأعلى وحدَه، ويتبعه في اللحظة نفسِها');
ok(/removeAttribute\('title'\)/.test(mainSrc),
  'وتغيب بالإطفاء — اسمُها يُرفَع عن الشرائط الحيّة كما يُرفَع خطُّها');

/* **وقواعدُ الهدوء تُجرَد من اللوح**: كلُّ قاعدةٍ منها **تُسكِن حركةً** لا تغيّر مقاساً
   ولا لوناً — فمن أضاف تحت `:root.calm` قاعدةً تزحزح تخطيطاً أو تُخفي عنصراً احمرّ
   هنا. **ولا تُكتب قاعدةُ تفضيل النظام هنا بيدٍ**: ليست في لوحنا اليوم، وكتابتُها
   تغيّر السلوكَ القائم لمن لم يمسّ الوضعَ قطّ (بند العقد ٢) — فهي بندٌ يُرفَع. */
const calmRules = (css.match(/^:root\.calm [^{}]+\{[^{}]*\}/gm) || []);
ok(calmRules.length >= 3,
  `وقواعدُ الهدوء في اللوح (${calmRules.length} قاعدة): `
  + calmRules.map((r) => r.replace(/\s+/g, ' ').replace(':root.calm ', '')).join(' | '));
ok(calmRules.every((r) => /animation:\s*none|transition-duration:\s*1ms/.test(r)),
  'وكلُّها تُسكِن حركةً لا غير — لا مقاسَ يتبدّل ولا عنصرَ يُخفى');

// ————— ١٠) سطرُ الوعد الصادق: في اللوحة والتعريفية معاً —————

console.log('\n١٠. سطرُ الوعد الصادق');

const parentSrc = src('parent.js');
const welcome = file('app/welcome/index.html');
const flat = (t) => t.replace(/\s+/g, ' ').trim();
ok(/support\.PANEL_KEYS\.map/.test(parentSrc) && /support\.setMode/.test(parentSrc),
  'وبابُ الوضع قسمٌ في اللوحة — مفاتيحُه من الجدول لا مكتوبةً بيد');
ok(/support\.reset\(\)/.test(parentSrc), 'وفيها «أعِد الافتراضات»');
ok(parentSrc.includes('support.PROMISE'), 'وسطرُ الوعد فيها من مصدره لا منسوخاً');
ok(parentSrc.includes('support.MARK.note'),
  'وتذكر علامتَها بنصّها من الجدول — فلا يفترق ما يقرؤه عمّا يراه');
ok(flat(welcome).includes(flat(support.PROMISE)),
  'والصفحةُ التعريفية تحمل السطرَ نفسَه حرفاً بحرف');
for (const [what, re] of [
  ['لا يشخّص ولا يعالج ولا يحكم', /لا يشخّص ولا يعالج ولا يحكم/],
  ['ولا على نطقه (حدُّ نطاقنا)', /ولا على نطقه/],
  ['ولا يَعِد بحجم أثر', /لا يَعِد بقدرِ أثرٍ/],
  ['ولا يخدم الكفيفَ ولا الأصمَّ المُشير ولا غيرَ الناطق',
    /لا يخدم الكفيفَ ولا الأصمَّ المُشير ولا غيرَ الناطق/],
]) ok(re.test(support.PROMISE), `وحدودُه مكتوبةٌ فيه: ${what}`);

console.log(fails
  ? `\n${fails} فشل`
  : `\nكل اختبارات «وضع الدعم» ناجحة${asleep ? ` (و${asleep} نائم)` : ''}`);
process.exit(fails ? 1 : 0);
