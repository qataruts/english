// حارسُ «بوابة اللحاق» — امتحانُ تحديد المستوى الاختياريّ (الجلسة ب):
//   node tools/test_placement.mjs
// يحرس: app/js/placement.js app/js/parent.js app/js/review.js app/js/gate.js
//   app/js/curriculum.js app/js/progress.js app/js/support.js app/js/main.js app/sw.js
//   (السلّمُ والشريحةُ ومفاتيحُها المضمونة والعتبةُ والسقفُ والفتحُ وقيدُ الاقتران
//    ومسطرةُ الامتحان)
// يخرج بـ١ عند أي إخفاق.
//
// **العلّة التي يحرسها**: امتحانٌ **يفتح محطاتٍ بلا أن يلعبها الطفل**. فخطؤه ليس شاشةً
// تُخفق بل **رحلةً تُختصَر بغير حقّ** — لا تُرى في شاشةٍ ولا يشتكي منها أحد. فالمحروسُ
// عشرةٌ كلُّها قيودُ صدق:
//   ١) **السلّمُ مشتقٌّ من `sections()` لا مكتوب، ودرجتُه شريحة** (قسمٌ وما يلحق به).
//   ٢) **مادّةُ الدرجة مفاتيحُ عقدها** — وما لا يُقاس بإعفاءٍ مكتوبٍ في المنهج.
//   ٣) **لا تُفتح محطةٌ لم تُمَسّ**: لكل محطةٍ مفتاحٌ مضمون **في كل محاولة** لا بحظّ
//      خلطة — **والتغطيةُ تُحسب** ببذورٍ كثيرة، محطةً محطة، **ولا تُكمَّل من خارج الشريحة**.
//   ٤) **سقفُ العيّنة ≤ أثقلِ جلوسٍ مقرَّرٍ في رحلتنا** — محسوباً من المنهج لا مكتوباً،
//      **وشريحةٌ أثقلُ منه تُشطَر ولا تُختصَر تغطيتُها**.
//   ٥) **العتبةُ عتبةُ بوّابة الإتقان نفسُها**، **وأوّلُ إخفاقٍ يُنهي**.
//   ٦) **البواباتُ لا تُقفز** (تُجتاز بنفسها) — **مُمتحَنٌ بأقسامٍ مصنوعة**.
//   ٧) **الفتحُ نجمةٌ واحدة، ولا قفلَ رجوعاً**، والإعادةُ تستأنف من آخر حدّ.
//   ٨) **ليتنر يقرأ محاولاته كسائرها** بلا وسمٍ خاصّ، ولا تُقيَّد مراجعةَ يوم.
//   ٩) **قيدُ الاقتران في الفتح — خصوصيّتُنا**: لا يُفتَح حرفٌ لكلمةٍ لم تُثبَت سمعاً
//      **ولو اجتاز الطفلُ درجتَها**، والحكمُ يمرّ بالبابين نفسِهما.
//  ١٠) **مسطرةُ الامتحان الواحدة** (وضعُ الدعم لا يُخفّف امتحاناً)، **وبابُه لوحةُ
//      وليّ الأمر وحدَها**.
//
// **ومُجرَّبٌ سالباً** — على شيفرةٍ مُعدَّلة عمداً ثم رُدَّت، كلُّها احمرّت هنا بالاسم:
//   • حذفُ فرع البوّابة من `rungsOf` (فتُتخطّى دائماً)   ⇒ §٦ «لم تُجتز تقصُر السلّم»
//   • حذفُ شرط `ready` من `rungsOf`                      ⇒ §٩ بالاسم (جدارُ الاقتران)
//   • ردُّ `coupledReadyAt` بـ`true` دائماً                ⇒ §٩ «كلمةٌ غيرُ متقنةٍ تُفتح»
//   • إسقاطُ `stationKeys` من `due` في `rungItems`       ⇒ §٣ يحمرّ بأسماء المحطات
//   • تعطيلُ `split` (شريحةٌ من ١١ محطة)                  ⇒ §٤ بالأرقام
//   • نزعُ `duringExam` من `rungItems`                    ⇒ §١٠ بسعة الحوض
//   • رفعُ `PLACEMENT_STARS` إلى ثلاث                    ⇒ §٧ «تفكّ القفل ولا تدّعي إتقاناً»
// **وواحدةٌ لم تُمسَك ويُقيَّد لِمَ**: نزعُ شرط `getStars` من `openRung` لا يحمرّ —
// **ولا يجب**: `setStars` لا تخفض نجمةً أصلاً (تردّ `false` لما دونها)، فالشرطُ هناك
// عدٌّ صادقٌ لما فُتح فعلاً لا حارسُ نجوم. والقاعدةُ محروسةٌ في موضعها ومقيسةٌ هنا حيّةً
// («وإعادةُ الامتحان لا تُنقص نجمةً كسبها بلعبه»).
//
// و**حدودُ الحارس معلَنة**: لا يفتح متصفّحاً — المشهدُ الحيّ في `browser_test.html`.

import { readFileSync, readdirSync } from 'node:fs';

const APP = new URL('../app/js/', import.meta.url);
const ROOT = new URL('../', import.meta.url);

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const curriculum = await import(new URL('curriculum.js', APP));
const p = await import(new URL('progress.js', APP));
const gate = await import(new URL('gate.js', APP));
const review = await import(new URL('review.js', APP));
const support = await import(new URL('support.js', APP));
const pl = await import(new URL('placement.js', APP));

/**
 * وحداتُ التمارين — **تُجرَد من الشجرة لا تُكتب قائمةً**: كلُّ وحدةٍ تعلن `probeRounds`
 * هي وحدةُ تمارين، فوحدةٌ جديدة تدخل هذا الحارسَ يومَ تُكتب. وبتحميلها تسجّل بانيها في
 * `station.js` — ولا يُقاس امتحانٌ بمُنشئاتٍ ناقصة.
 */
const makers = [];
for (const f of readdirSync(APP).sort()) {
  if (!f.endsWith('.js')) continue;
  if (!/export (?:function|const) probeRounds/.test(readFileSync(new URL(f, APP), 'utf8'))) continue;
  makers.push(await import(new URL(f, APP)));
}

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg); };
const src = (name) => readFileSync(new URL(name, APP), 'utf8');
const rootSrc = (name) => readFileSync(new URL(name, ROOT), 'utf8');
const placementSrc = src('placement.js');
/** الشيفرةُ بلا تعليقاتٍ — فلا يُصدَّق جردٌ على جملةٍ في تعليق. */
const bare = (text) => text.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const byId = new Map(curriculum.stations().map((s) => [s.id, s]));
const listenKeys = [...new Set(curriculum.stations()
  .filter((s) => s.track === 'listen').flatMap((s) => s.skills || []))];

/** طفلٌ عبَر البوابات الثلاث بنفسه — فيمتدّ السلّمُ إلى ما بعدها. */
function crossGates() {
  for (const node of p.allNodes()) if (node.type === 'gate') p.setStars(node.id, 1);
}

/** **وأذنٌ ناضجة**: كلُّ مفاتيح مسار السمع في صندوق الإتقان — فينفتح قيدُ الاقتران. */
function ripenEar(skip = new Set()) {
  for (const key of listenKeys) {
    if (skip.has(key)) continue;
    const { unit, range, kind } = p.parseSkillKey(key);
    for (let i = 0; i < 4; i++) p.recordAttempt(unit, range, kind, true);
  }
}

const fresh = () => { p.reset(); store.clear(); };

// ————— ١) السلّمُ مشتقٌّ من `sections()`، ودرجتُه شريحة —————

console.log('\n١. السلّم مشتقٌّ من الرحلة، ودرجتُه شريحة');

fresh();
const journey = p.journey();
const firstGate = journey.findIndex((s) => s.kind === 'gate');
const newborn = pl.rungs();

ok(newborn.length === firstGate,
  `طفلٌ جديد: سلّمُه ما قبل أوّل بوّابة (${newborn.length} درجاتٍ من ${journey.length} قسماً)`);
ok(newborn.map((r) => r.id).join('،') === journey.slice(0, firstGate).map((s) => s.id).join('،'),
  `وبترتيب الرحلة نفسِه (${newborn.map((r) => r.id).join(' ← ')})`);
ok(newborn.every((r) => r.nodes.length > 1),
  '**ودرجتُه شريحةٌ لا محطة**: كلُّ درجةٍ قسمٌ بعقده كلِّها '
  + `(${newborn.map((r) => r.nodes.length).join('، ')} عقدة)`);

crossGates();
ripenEar();
const list = pl.rungs();
ok(list.length > newborn.length,
  `ومَن عبَر البوابات وأنضج أذنَه امتدّ سلّمُه (${list.length} درجة)`);
ok(list.every((r) => r.sections.every((s) => journey.includes(s))),
  'وكلُّ قسمٍ في الشريحة هو القسمُ نفسُه من الرحلة — لا نسخةٌ تفترق عنه يوماً');
ok(list.every((r) => r.parts
  || r.nodes.length === r.sections.reduce((n, s) => n + (s.nodes || []).length, 0)),
  'وعقدُ الشريحة مسطَّحُ عقد أقسامها كلِّها (إلا المشطورةَ بالسقف — وشطرُها مُعلَن)');

const ladder = list.flatMap((r) => r.nodes.map((n) => n.id));
const wanted = p.allNodes().filter((n) => n.type !== 'gate').map((n) => n.id);
ok(ladder.join('،') === wanted.join('،'),
  `وعقدُ السلّم عقدُ الرحلة كلُّها إلا البوابات (${ladder.length} من ${p.allNodes().length})`);
ok(new Set(ladder).size === ladder.length, 'ولا عقدةَ تتكرّر في درجتين (الشطرُ لا يزدوج)');

// ————— ٢) مادّةُ الدرجة: مفاتيحُ عقدها —————

console.log('\n٢. مادّتُها مفاتيحُ عقدها');

let keysFromNodes = true;
for (const rung of list) {
  const declared = new Set(rung.nodes.flatMap((n) => byId.get(n.id)?.skills || []));
  if (pl.rungKeys(rung).some((k) => !declared.has(k))) keysFromNodes = false;
  if (pl.rungKeys(rung).length !== declared.size) keysFromNodes = false;
}
ok(keysFromNodes, 'مفاتيحُ كل درجةٍ هي مفاتيحُ عقدها بلا زيادةٍ ولا نقص');

const measured = list.reduce((n, r) => n + pl.measuredNodes(r).length, 0);
const exempt = list.flatMap((r) => pl.exemptNodes(r));
ok(measured + exempt.length === ladder.length,
  `وعقدُ السلّم إمّا تُقاس (${measured}) وإمّا تُعفى (${exempt.length}) — لا ثالثَ`);
ok(exempt.length === 0,
  `ولا محطةَ معفاةً في رحلتنا اليوم — كلُّها تعلن مفاتيحَها (${exempt.length})`);

// **ولا مفتاحَ في السلّم بلا بانٍ**: مهارةٌ تُمتحَن ولا تُبنى لها جولةٌ تسقط صامتةً من
// العيّنة — فتُفتح محطتُها بلا أن تُمَسّ. (وهو نظيرُ «لا مهارةَ تُقاس بلا تمرين».)
const kinds = new Set(list.flatMap((r) => pl.rungKeys(r)).map((k) => k.split('|')[2]));
ok(kinds.size > 8, `وأنواعُ تمارين السلّم كلُّها (${kinds.size} نوعاً)`);

// ————— ٣) لا تُفتح محطةٌ لم تُمَسّ — التغطيةُ تُحسب لا تُوعَد —————

console.log('\n٣. كلُّ محطةٍ في الشريحة تُمتحَن في كل محاولة');

const SEEDS = 16;
const lengths = [];
for (let i = 0; i < list.length; i++) {
  const rung = list[i];
  const holes = [];
  const sizes = new Set();
  const own = new Set(pl.rungKeys(rung));
  for (let seed = 1; seed <= SEEDS; seed++) {
    const items = pl.rungItems(i, rng(seed * 17 + i + 1));
    sizes.add(items.length);
    const asked = new Set(items.flatMap((it) => (it.skills || [it])
      .map((s) => p.skillKey(s.unit, s.range, s.kind))));
    for (const node of pl.measuredNodes(rung)) {
      const mine = byId.get(node.id).skills;
      if (!mine.some((k) => asked.has(k))) holes.push(`${node.id}/${seed}`);
    }
    // **ولا يُسأل عمّا ليس من الشريحة**: العيّنةُ لا تُكمَّل من خارجها
    for (const key of asked) if (!own.has(key)) holes.push(`أجنبيّ ${key}/${seed}`);
  }
  lengths.push(`${rung.id}:${[...sizes].join('/')}`);
  ok(!holes.length,
    `[${rung.id}] ${pl.measuredNodes(rung).length} محطةً تُمَسّ كلُّها في ${SEEDS} محاولة`
    + (holes.length ? ` — سقط: ${holes.slice(0, 4).join('، ')}` : ''));
}
console.log(`     أطوالُ العيّنات: ${lengths.join(' · ')}`);

// ————— ٤) سقفُ العيّنة: أثقلُ جلوسٍ مقرَّرٍ في رحلتنا —————

console.log('\n٤. سقفُ العيّنة ≤ أثقلِ جلوسٍ في الرحلة (محسوباً من المنهج)');

let heaviestStation = 0;
let heaviestId = '';
for (const s of curriculum.stations()) {
  for (const m of makers) {
    if (typeof m.probeRounds !== 'function') continue;
    for (const seed of [1, 7, 23, 101]) {
      const rounds = m.probeRounds(s.id, seed) || [];
      if (rounds.length > heaviestStation) { heaviestStation = rounds.length; heaviestId = s.id; }
    }
  }
}
const heaviest = Math.max(heaviestStation, review.SESSION_SIZE, gate.GATE_SIZE);
ok(heaviestStation > 0, `أثقلُ محطةٍ في الرحلة ${heaviestStation} جولة (${heaviestId})`);
/* **والشرطُ «لا يتجاوز» لا «يساوي»** (الجلسة ع): كان يُكتب `===` وهو **صادقٌ
   بالمصادفة** يومَ كُتب — جولاتُ «وحدك» خمسٌ ثابتة، فأثقلُ محطةٍ عشرُ جولاتٍ وهي
   `GATE_SIZE` بعينها. فلمّا صارت جولاتُ المحطة **دالّةَ مفاتيحها** (قاعدةُ الكفاية —
   `station.js`) بلغت أثقلُ محطةٍ مئةً وأربعاً وسبعين جولة، **والعيّنةُ لا تكبر
   بكبرها**: امتحانُ اللحاق **جلوسٌ قصيرٌ يضع الطفلَ في موضعه** لا محطةٌ تُدرِّب.
   فبقي السقفُ سقفَ البوّابة (يحرسه البابُ التالي: مستوردٌ لا مكتوب)، وصار الشرطُ
   نصَّ عنوانه: **لا يتجاوز أثقلَ جلوسٍ مقرَّر**. */
ok(pl.CAP <= heaviest,
  `والسقفُ ${pl.CAP} لا يتجاوز أثقلَ جلوسٍ مقرَّر (محطةٌ ${heaviestStation} · مراجعةٌ `
  + `${review.SESSION_SIZE} · بوّابةٌ ${gate.GATE_SIZE})`);
ok(/CAP = GATE_SIZE/.test(placementSrc),
  'وهو **مستوردٌ لا مكتوب** — يتحرّك بتحرّك جلسة البوّابة');
ok(pl.SAMPLE <= pl.CAP && pl.SAMPLE > review.SESSION_SIZE,
  `والعيّنةُ ${pl.SAMPLE}: فوق جلسة المراجعة ودون السقف`);
const overCap = [];
for (let i = 0; i < list.length; i++) {
  for (let seed = 1; seed <= 8; seed++) {
    const items = pl.rungItems(i, rng(seed * 29 + i + 1));
    if (items.length > pl.CAP) overCap.push(`${list[i].id}/${seed}:${items.length}`);
  }
}
ok(!overCap.length,
  `ولا درجةَ تتجاوزه في محاولةٍ واحدة${overCap.length ? ` — ${overCap.slice(0, 3).join('، ')}` : ''}`);
ok(pl.sizeFor(new Array(pl.CAP + 5).fill('x')) === pl.CAP && pl.sizeFor([]) === pl.SAMPLE,
  'و`sizeFor` تحدّه بالسقف وترفعه إلى العيّنة');
// **والشطرُ يقع فعلاً**: عهدُنا الثاني قسمٌ من إحدى عشرةَ محطة وسقفُ الجلوس عشر
const split = list.filter((r) => r.id.includes('#'));
const heavySection = journey.filter((s) => (s.nodes || []).length > pl.CAP);
ok(split.length === heavySection.length && split.length > 0,
  `وشريحةٌ أثقلُ من السقف تُشطَر: ${heavySection.map((s) => `${s.id}(${s.nodes.length})`).join('، ')}`
  + ` ← ${list.filter((r) => r.title.includes('جزءٌ')).map((r) => r.nodes.length).join('+')}`);
ok(list.every((r) => r.nodes.length <= pl.CAP),
  `ولا درجةَ في السلّم أعرضُ من السقف (أكبرُها ${Math.max(...list.map((r) => r.nodes.length))})`);

// ————— ٥) العتبةُ عتبةُ البوّابة نفسُها، وأوّلُ إخفاقٍ يُنهي —————

console.log('\n٥. عتبةُ الثمانين والوقوفُ عند الشرخ');

ok(/from '\.\/gate\.js'/.test(placementSrc) && /\bpassed\(/.test(placementSrc),
  'الحكمُ بـ`passed` من `gate.js` — عتبةٌ واحدة لا اثنتان تفترقان');
ok(gate.PASS_RATE === 0.8, `والعتبةُ ٨٠٪ (${gate.PASS_RATE * 100})`);
ok(!/0\.8|PASS_RATE\s*=/.test(bare(placementSrc)), 'ولا رقمَ عتبةٍ ثانٍ مكتوبٌ في الملفّ');
ok(gate.passed(8, 0) && gate.passed(7, 1) && !gate.passed(6, 2) && !gate.passed(0, 0),
  'على عيّنة الثماني: سبعٌ ⇒ عبور، وستٌّ ⇒ لا عبور، وجلسةٌ فارغة لا تفتح شيئاً');
const failBlock = placementSrc.slice(placementSrc.indexOf('if (!open)'),
  placementSrc.indexOf('const more'));
ok(failBlock.length > 100 && !/\bagain\s*(?:\(|[,)])/.test(failBlock),
  'وشاشةُ الإخفاق بلا زرِّ إعادةٍ — أوّلُ إخفاقٍ يُنهي (والإعادةُ من اللوحة)');
const verdictBlock = placementSrc.slice(placementSrc.indexOf('verdict: ({'));
ok(verdictBlock.includes('openRung(rung)')
  && verdictBlock.indexOf('if (open)') < verdictBlock.indexOf('openRung(rung)')
  && verdictBlock.indexOf('openRung(rung)') < verdictBlock.indexOf('if (!open)'),
  'ولا يُفتح شيءٌ إلا بعد `passed` — الفتحُ في فرع العبور وحدَه');

// ————— ٦) البواباتُ لا تُقفز، والشريحةُ تضمّ ما ليس رأساً —————

console.log('\n٦. البواباتُ لا تُقفز (بأقسامٍ مصنوعة)');

const fake = (kind, id, nodes = []) => ({ kind, id, title: id, nodes });
const ids = (out) => out.map((r) => r.id).join('،');
const head = (s) => s.kind === 'stage' || s.kind === 'era';
const never = () => false;
const always = () => true;

const withGate = [fake('stage', 'a'), fake('gate', 'gate-x'), fake('stage', 'b')];
ok(ids(pl.rungsOf(withGate, { crossed: never, head })) === 'a',
  'بوّابةٌ لم تُجتز تقصُر السلّمَ عندها — «البواباتُ لا تُقفز، تُجتاز بنفسها»');
ok(ids(pl.rungsOf(withGate, { crossed: always, head })) === 'a،b',
  'وإن اجتازها بنفسه مضى السلّمُ إلى ما بعدها');
ok(pl.rungsOf(withGate, { crossed: always, head })
  .every((r) => !r.sections.some((s) => s.kind === 'gate')),
  'ولا تدخل بوّابةٌ مجتازةٌ شريحةً — تُتخطّى ولا تُضمّ (لا يُفتح ما يُجتاز بنفسه)');

const between = [
  fake('stage', 'a', [{ id: 'a:1', type: 'x' }]),
  fake('interlude', 'after-a', [{ id: 'mid:1', type: 'y' }]),
  fake('stage', 'b', [{ id: 'b:1', type: 'x' }]),
];
const sliced = pl.rungsOf(between, { crossed: always, head });
ok(ids(sliced) === 'a،b', 'وقسمٌ ليس رأساً لا يقطع السلّمَ ولا يزيد درجة');
ok(sliced[0].sections.map((s) => s.id).join('،') === 'a،after-a'
  && sliced[0].nodes.map((n) => n.id).join('،') === 'a:1،mid:1',
  'بل يدخل شريحةَ ما قبله فيُمتحَن معها ويُفتح معها — «تُمتحَن الشريحةُ كلُّها فتُفتح كلُّها»');

const mixed = { nodes: [{ id: 'a:1', type: 'x' }, { id: 'gate:y', type: 'gate' }] };
ok(pl.openableNodes(mixed).join('،') === 'a:1',
  `والفتحُ يستثني عقدةَ البوّابة (${pl.openableNodes(mixed).join('،')})`);
ok(list.flatMap((r) => r.nodes).every((n) => n.type !== 'gate'),
  'ولا عقدةَ بوّابةٍ في السلّم أصلاً — الحدُّ الأوّل قبل الثاني');

// ————— ٧) الفتحُ: نجمةٌ واحدة، ولا قفلَ رجوعاً —————

console.log('\n٧. فتحٌ لا قفل');

fresh();
const r0 = pl.rungs()[0];
const openedCount = pl.openRung(r0);
ok(openedCount === r0.nodes.length,
  `اجتيازُ الدرجة الأولى يفتح عقدَها كلَّها (${openedCount} عقدة)`);
ok(r0.nodes.every((n) => p.getStars(n.id) === pl.PLACEMENT_STARS) && pl.PLACEMENT_STARS === 1,
  'بنجمةٍ واحدة — تفكّ القفل ولا تدّعي إتقاناً (حكمُ `unlockUpTo` نفسُه)');
const beyond = pl.rungs().slice(1).flatMap((r) => r.nodes);
ok(beyond.every((n) => !p.isDone(n.id)),
  `وما بعد الدرجة لم يُفتح منه شيء (${beyond.length} عقدةً على حالها)`);
ok(pl.startRung() === 1, `والإعادةُ تستأنف من الدرجة التالية (${pl.startRung()})`);

p.setStars(r0.nodes[0].id, 3);
ok(pl.openRung(r0) === 0 && p.getStars(r0.nodes[0].id) === 3,
  'وإعادةُ الامتحان لا تُنقص نجمةً كسبها بلعبه ولا تعيد عدَّ ما فُتح');
ok(pl.openRung({ nodes: [{ id: 'لا-وجود-لها', type: 'x' }] }) === 0
  && !p.snapshot().stars['لا-وجود-لها'],
  'ولا يُعلَّم معرّفٌ لا موضعَ له في الرحلة');

fresh();
for (const rung of pl.rungs()) pl.openRung(rung);
const stalled = pl.state();
ok(stalled.left === 0 && stalled.gate === journey[firstGate].title,
  `ومَن أثبت ما قبل البوّابة وقف سلّمُه عندها باسمها («${stalled.gate}»)`);
crossGates();
ripenEar();      // **وأذنٌ ناضجة**: البوّابةُ حدٌّ، وقيدُ الاقتران حدٌّ ثانٍ بعدها
ok(pl.state().left > 0, `فإذا عبَرها بنفسه وأنضج أذنَه استُؤنف الامتحانُ (${pl.state().left} درجةً)`);

fresh();
ok(pl.startRung() === 0 && pl.state().at === 0 && pl.state().left === pl.rungs().length,
  'وطفلٌ جديد يبدأ من أوّلها');

// ————— ٨) ليتنر: كلُّ محاولةٍ قياسٌ حقيقيّ بلا وسمٍ خاصّ —————

console.log('\n٨. ليتنر يقرأ محاولاته كسائرها');

ok(!/recordAttempt/.test(bare(placementSrc)),
  'الامتحانُ لا يكتب في ليتنر بيده — `renderSession` تكتب كلَّ محاولةٍ كما تكتبها المراجعة');
ok(/progress\.recordAttempt\(unit, range, kind, correct\)/.test(src('review.js')),
  'والمحرّكُ يكتب بمفتاح المهارة نفسِه — لا وسمَ «لحاق» ولا استثناء');
ok(!/markReview/.test(bare(placementSrc)),
  'ولا يُقيَّد مراجعةَ يوم: امتحانُ موضعٍ لا جلسةُ تثبيت — فلا يقول للوالد «راجَع» ولم يراجع');
ok(/from '\.\/review\.js'/.test(placementSrc)
  && /sessionItems\(/.test(placementSrc) && /renderSession\(/.test(placementSrc),
  'ويُبنى بـ`sessionItems` ويُعرَض بـ`renderSession` — لا محرّكَ ثانياً');
ok(!/registerExercise|registerScreen|options:\s*\[/.test(placementSrc),
  'ولا يصنع تمريناً بيده — **صفرُ شكلِ تمرينٍ جديد** بالبناء لا بالوعد');
ok(!/\bsay\(|sayEn\(|SPOKEN|audio\./.test(bare(placementSrc)),
  'ولا ينطق حرفاً من عنده — **صفرُ نصٍّ منطوقٍ جديد** (ولا سطرَ يدخل قائمة الصوت)');

// ————— ٩) قيدُ الاقتران في الفتح — خصوصيّتُنا —————
//
// **العلّة**: مسارانا مقترنان («لا كلمةَ تُقرأ قبل إتقانها سمعاً»)، فلو فتح اللحاقُ
// درجةَ حرفٍ كلماتُها لم تنضج في الأذن لَبلغها الطفلُ **جوفاء**: يمنعها `readableAt`
// فتُعرَض بلا كلماتها — واختُصر عليه ما لم يُثبته.

console.log('\n٩. لا يُفتَح حرفٌ لكلمةٍ لم تُثبَت سمعاً');

fresh();
crossGates();
const bare0 = pl.rungs();
ok(bare0.length < journey.filter((s) => s.kind !== 'gate').length,
  `طفلٌ عبَر البوابات بأذنٍ لم تنضج: سلّمُه يقف قبل مسار الحرف (${bare0.length} درجة)`);
ok(bare0.every((r) => r.nodes.every((n) => byId.get(n.id).track === 'listen')),
  'ولا درجةَ حرفٍ في سلّمه — **جدارُ الاقتران لا شرخُ إجابة**');
/* **ولا يُسمّى الجدارُ ما دامت في السلّم درجةٌ تُمتحَن**: الخبرُ حينئذٍ «أمامه كذا
   درجة». فإذا أثبتها كلَّها ووقف — سُمّي له الموضعُ وعلّتُه. */
ok(!pl.state().wall && pl.state().left === bare0.length,
  `وما دامت درجاتُه تنتظره لا يُقال «وقف» (${pl.state().left} درجةً أمامه)`);
for (const rung of bare0) pl.openRung(rung);
ok(pl.state().wall && !pl.state().gate,
  `فإذا أثبتها كلَّها سمّت اللوحةُ الجدارَ لوليّ الأمر: «${pl.state().wall}»`);

/* **والسالبةُ بعينها** (نصُّ معيار القبول): تُنضَج الأذنُ كلُّها **إلا كلمةً واحدة**
   (`cat` — وهي من كلمات ح٣)، **ويُجتاز ما قبلها**، فيجب أن يقف السلّمُ عند درجتها
   ولا يفتحها — **ولو اجتاز الطفلُ درجتَها**. ثم تنضج فيمتدّ السلّمُ من نفسه. */
const CAT = 'word|cat|listen-pick';
const catStation = curriculum.stations()
  .find((s) => s.track === 'letter' && (s.skills || []).includes('word|cat|build'));
fresh();
crossGates();
ripenEar(new Set([CAT]));
const withoutCat = pl.rungs();
const catSection = journey.find((s) => (s.nodes || []).some((n) => n.id === catStation.id));
ok(!withoutCat.some((r) => r.nodes.some((n) => n.id === catStation.id)),
  `أذنٌ ناضجةٌ إلا «cat»: لا تدخل «${catStation.title}» السلّمَ (${withoutCat.length} درجة)`);
ok(withoutCat.every((r) => journey.indexOf(r.sections[0]) < journey.indexOf(catSection)),
  `والسلّمُ يقف قبل قسمها «${catSection.title}» — ولا يُمتحَن ما بعدها`);
// **ولو اجتاز درجتَها**: تُفتَح الشريحةُ التي قبلها كلُّها، ثم تُعرَض عليه — فلا تُفتح
for (const rung of withoutCat) pl.openRung(rung);
ok(!p.isDone(catStation.id) && !p.isNodeUnlockedById(catStation.id) === false
  || !p.isDone(catStation.id),
  'ولو فُتح كلُّ ما قبلها بالامتحان لا تُفتح هي — نجمتُها صفر');
ok(pl.state().wall === catSection.title,
  `واللوحةُ تقول أين وقف ولماذا: «${pl.state().wall}»`);
ok(curriculum.coupledReadyAt(catStation, p.isMastered) === false
  && curriculum.readableAt(catStation.part, p.isMastered).every((w) => w.w !== 'cat'),
  'والحكمُ من البابين نفسِهما (`coupledReadyAt` ← `readableAt`) لا من نسخةٍ ثانية');
for (let i = 0; i < 4; i++) p.recordAttempt('word', 'cat', 'listen-pick', true);
const withCat = pl.rungs();
ok(withCat.length > withoutCat.length
  && withCat.some((r) => r.nodes.some((n) => n.id === catStation.id)),
  `فإذا نضجت «cat» في أذنه امتدّ السلّمُ من نفسه (${withoutCat.length} ← ${withCat.length} درجة)`);
ok(/coupledReadyAt/.test(placementSrc) && !/isMastered\(\s*['"`]/.test(placementSrc),
  'ولا يبني اللحاقُ حكمَ اقترانٍ بيده — يستدعي بابَ المنهج');

// ————— ١٠) مسطرةُ الامتحان الواحدة، وبابُه لوحةُ وليّ الأمر —————

console.log('\n١٠. وضعُ الدعم لا يُخفّف امتحاناً، وبابُه اللوحةُ وحدَها');

fresh();
crossGates();
ripenEar();
const widths = (rnd) => {
  const out = {};
  for (let i = 0; i < pl.rungs().length; i++) {
    for (const item of pl.rungItems(i, rnd)) {
      if (!item.options) continue;
      (out[item.kind] ??= new Set()).add(item.options.length);
    }
  }
  return Object.fromEntries(Object.entries(out).sort()
    .map(([kind, set]) => [kind, [...set].sort()]));
};
support.reset();
const standingWidth = widths(rng(5));
const standingSize = pl.rungItems(0, rng(9)).length;
support.setMode(true);
ok(support.modeOn() && support.optionCount() === support.KNOBS.pool.supported
  && support.sessionSize() === support.KNOBS.dose.supported,
  `وضعُ الدعم مشتغلٌ الآن: حوضُه ${support.optionCount()} وجرعتُه ${support.sessionSize()} خارج الامتحان`);
const supportedWidth = widths(rng(5));
ok(JSON.stringify(supportedWidth) === JSON.stringify(standingWidth)
  && Object.keys(standingWidth).length > 0,
  `وحوضُ الامتحان لا يضيق بتشغيله — نوعاً نوعاً (${JSON.stringify(supportedWidth)})`);
ok(pl.rungItems(0, rng(9)).length === standingSize && standingSize > support.KNOBS.dose.supported,
  `وعيّنتُه ${standingSize} لا جرعةَ وليّ الأمر (${support.KNOBS.dose.supported})`);
ok(/duringExam\(/.test(placementSrc) && !/KNOBS|sessionSize\(|optionCount\(/.test(placementSrc),
  'ونطاقُه `duringExam` وحدَه — لا مقدارَ من مقادير الوضع يُقرأ في الملفّ');
ok(support.EXAM_OFF.includes('prompt') && !/mayPrompt/.test(placementSrc),
  'ولا تلقينَ فيه بطبقتين: لا تستدعيه الشاشةُ أصلاً، ويعود إلى القائم في النطاق');
ok(support.rate('en') === support.KNOBS.model.supported && support.calm() === true,
  'ومقابضُ الراحة تسري كما هي — يُقاس بمسطرةٍ واحدة ولا يُمتحَن بنموذجٍ يفوته');
ok(!support.examOn(), 'والنطاقُ مردودٌ بعد البناء — لا عَلَمَ يعلق مفتوحاً');
support.reset();
fresh();

const parentSrc = src('parent.js');
ok(/placementSection/.test(parentSrc) && /امتحان اللحاق/.test(parentSrc),
  'قسمُ «امتحان اللحاق» في اللوحة');
ok(/placement\.renderPlacement\(/.test(parentSrc) && /examining/.test(parentSrc),
  'والامتحانُ يحلّ محلّ اللوحة خلف بوابتها — لا مسارَ ثانياً يبلغه طفل');
ok(!/placement/.test(bare(src('main.js'))),
  'ولا بابَ له في التوجيه — فلا يفتحه طفلٌ بعنوانٍ يكتبه');
ok(!/https:\/\//.test(parentSrc), 'واللوحةُ تبقى صفرَ عناوينَ خارجية');

/* **والمحروسُ حضورُهما في القشرة ورفعُ رقمها — لا رقمٌ بعينه** (تصحيحُ ب٢): كان
   الرقمُ مكتوباً `v11` في الحارس، فكلُّ نشرةٍ تليه تُحمِرُّه بلا عيب — **حارسٌ يحمرّ
   من صوابٍ يُعلّم تجاهلَ الحمرة**. فصار يقرأ الرقمَ من مصدره ويشترط أن يكون مرفوعاً
   عن `v11` (النشرةُ التي دخلت فيها الوحدتان القشرة). */
const sw = rootSrc('app/sw.js');
const shellVersion = sw.match(/const VERSION = 'v(\d+)'/)?.[1];
ok(/'js\/placement\.js'/.test(sw) && /'js\/support\.js'/.test(sw) && Number(shellVersion) >= 11,
  `وهو في قشرة v${shellVersion || '؟'} مع وحدة الدعم فيعملان دون إنترنت`);

console.log(fails ? `\n${fails} فشل` : '\nكل اختبارات «بوابة اللحاق» ناجحة');
process.exit(fails ? 1 : 0);
