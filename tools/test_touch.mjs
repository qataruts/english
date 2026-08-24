// **حارسُ اللمسة الحيّة — «لا لمسةَ ميتة»**:
//   node tools/test_touch.mjs [--seed N] [--trace] [--no-ripen] [--self-test]
//
// ————— علّتُه بلاغُ ميدانٍ حابس (البلاغ ٣ · `docs/FIELD.md`) —————
//
// بلفظ المالك: «**لقد توقف التطبيق عند هذه الحلقة — ارجوا المتابعة بسرعة وتشييك كل
// الحلقات انها تفتح**». وتشخيصُه: عقدةُ قصةِ ح٦ **خطتُها لا تُبنى** بحالة الطفل
// (كلمةٌ من نصّها لم تنضج سمعاً ⇒ `buildStation` تردّ `null` بقيد الاقتران)، فكانت
// الشاشةُ تردّ `null` معها **فترجع اللمسةُ إلى الخريطة صامتة** — زرٌّ ظاهرُه حيٌّ
// ولمستُه ميتة.
//
// **وحدُّ الحرّاس قيل في البلاغ نفسِه**: البطاريةُ وحارسُ الوعد يحاكيان طفلاً يتقدّم
// **بإيقاع ليتنر نفسِه** — فمادّتُه تنضج قبل أن يبلغ بابَها، ولم يحاكِ أحدٌ **طفلاً
// يسبق جبهتُه نضجَه**. فصنفُ «اللمسة الميتة» عاش خارج مرمى القياس، وهذا الحارسُ
// بابُه.
//
// ————— وطفلُ هذا الحارس نقيضُ طفلِ حارس الوعد —————
//
// ذاك **مثاليٌّ في القياس**: يصيب كلَّ جولة ويراجع كلَّ يوم، فتنضج مادّتُه بأسرع ما
// يسمح ليتنر. وهذا **سابقٌ لجبهته**:
//   • **نجومُ كلِّ عقدةٍ تُكسَب فورَ فتحها** — فالقفلُ التسلسليّ يتقدّم بأقصى سرعته
//     (والنجومُ هي التي تفتح، `progress.unlockFrontier`).
//   • **ولا جلسةَ مراجعةٍ البتّة** — فلا يُنضج مفاتيحَه إلا ما تكتبه محطاتُه.
//   • **والإتقانُ على أبطأ جدوله**: مفتاحٌ واحدٌ لا يُقاس مرّتين في اليوم (صندوقُ
//     ليتنر يرتفع بالإصابة، فلو كُرّر في اليوم الواحد لبلغ الإتقانَ **حفظاً في
//     جلسة** لا **في مجرى الأيام**) — وهو عينُ قيد `runReview` في حارس الوعد.
//
// فيبلغ هذا الطفلُ كلَّ بابٍ **قبل** أن تنضج مادّتُه — وهي الحالُ التي جلس فيها طفلُ
// الميدان. **والدعوى المقيسة**: عند كلِّ عقدةٍ مفتوحة، إمّا أن **خطتَها تُبنى**
// (فتُلعَب)، وإمّا أن **حالَها «تنضج»** معلَنةً في السجلّ (`registerRipening`)
// **وجلسةُ إنضاجها تُبنى** (`ripenItems`) — فلا لمسةَ ترجع صامتةً في الرحلة كلِّها.
// وهو عينُ «تشييك كل الحلقات انها تفتح» بلفظ المالك.
//
// ————— **والدسّة تُعيد الحالَ إلى سلوك اليوم** (`--no-ripen`) —————
//
// «لا يُصدَّق حارسٌ لم يُرَ وهو يمسك»: بالراية تُقطَع طريقُ الإنضاج فتعود اللمسةُ
// صامتةً كما كانت يومَ البلاغ — **فيلزم أن يحمرّ**. ويُشغَّل ذلك مع كلِّ تشغيل في
// عمليةٍ مستقلّة («فحصٌ لا يُشغَّل ليس حارساً»).

import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const APP = new URL('../app/js/', import.meta.url);

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const at = args.indexOf(name);
  return at < 0 ? fallback : Number(args[at + 1]);
};
const TRACE = args.includes('--trace');
/** الدسّة: تُقطَع طريقُ الإنضاج فيعود سلوكُ اليوم — لمسةٌ صامتة، ويلزم الأحمر. */
const NO_RIPEN = args.includes('--no-ripen');
const SEED = flag('--seed', 20260824);

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const p = await import(new URL('progress.js', APP));
const gate = await import(new URL('gate.js', APP));
const registry = await import(new URL('registry.js', APP));
const { seeded } = await import(new URL('ui.js', APP));
const { scoreOf } = await import(new URL('station.js', APP));

/* **ووحداتُ التمارين تُجرَد لا تُسمّى** (سنّةُ حارس الوعد): كلُّ ما يصدّر
   `buildStation` شاشةُ محطة، وكلُّ ما يصدّر `ripenItems` يملك جلسةَ إنضاجٍ لنوعه —
   فوحدةٌ تُكتب غداً تدخل هذا الحارسَ يومَ تُكتب بلا سطرٍ يُضاف. **واستيرادُها هو
   الذي يسجّل مسابيرَها** في `registry.js` كما يسجّل شاشاتِها. */
const SEEDLESS = new Set(['main.js', 'progress.js', 'curriculum.js', 'ui.js', 'audio.js',
  'review.js', 'parent.js', 'registry.js', 'figures.js', 'station.js', 'gate.js']);
const screens = [];
const ripeners = [];
for (const file of readdirSync(APP).filter((f) => f.endsWith('.js') && !SEEDLESS.has(f))) {
  const mod = await import(new URL(file, APP));
  if (typeof mod.buildStation === 'function') screens.push({ file, mod });
  if (typeof mod.ripenItems === 'function') ripeners.push({ file, mod });
}

let fails = 0;
const ok = (cond, msg) => {
  if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg);
};

const rnd = seeded(SEED >>> 0);

/** خطةُ عقدةٍ بحالة الطفل الحقيقية — أو `null` (وهو موضعُ البلاغ). */
const planOf = (id, day) => {
  for (const { mod } of screens) {
    const plan = mod.buildStation(id, (SEED ^ (day * 7919)) >>> 0, p.isMastered);
    if (plan) return plan;
  }
  return null;
};

/** جلسةُ إنضاجٍ لهذه العقدة من عدّة المراجعة — تمارينُها أو `[]`. */
const ripenOf = (id) => {
  for (const { mod } of ripeners) {
    const items = mod.ripenItems(id, rnd);
    if (items.length) return items;
  }
  return [];
};

/**
 * **ما تعرضه الخريطةُ عن هذه العقدة**: `open` (خطتُها تُبنى) · `ripening` (معلَنةٌ
 * في السجلّ وجلستُها تُبنى) · `dead` (لا هذه ولا تلك — **لمسةٌ ميتة**).
 *
 * **ويُسأل السجلُّ لا نوعُ العقدة**: هو نفسُه الذي تسأله الخريطةُ في `main.js`، فما
 * يراه الحارسُ هو ما يراه الطفلُ حرفاً.
 */
function touchOf(node, day) {
  if (node.type === 'gate') {
    return gate.gateItems(node.part, rnd).length ? { state: 'open', plan: null } : { state: 'dead' };
  }
  const plan = planOf(node.id, day);
  if (plan) return { state: 'open', plan };
  if (NO_RIPEN) return { state: 'dead' };          // ————— سلوكُ اليوم: صمتٌ —————
  const keys = registry.ripeningFor(node.type)?.(node.part) || null;
  if (!keys?.length) return { state: 'dead' };
  return ripenOf(node.id).length ? { state: 'ripening', keys } : { state: 'dead' };
}

// ————— المشي: عقدةٌ في يومٍ، ونجومُها تُكسَب فورَ فتحها —————

const dead = [];
const ripening = [];
let day = 0;
let played = 0;

for (const node of p.allNodes()) {
  day++;
  const touch = touchOf(node, day);
  if (touch.state === 'dead') {
    dead.push(node);
    if (TRACE) console.log(`  ✗ يوم ${day}: لمسةٌ ميتة — «${node.title}» (${node.id})`);
  } else if (touch.state === 'ripening') {
    ripening.push({ node, keys: touch.keys });
    if (TRACE) {
      console.log(`  ⏳ يوم ${day}: «${node.title}» تنضج — ${touch.keys.join('، ')}`);
    }
  } else if (TRACE) {
    console.log(`  ✓ يوم ${day}: «${node.title}»`);
  }

  /* **ويُكتب قياسُ ما لُعب** — بمفاتيح مَن بنى الجولة (`scoreOf`)، **ومفتاحٌ واحدٌ
     مرّةً في اليوم**: أبطأُ ما يسمح به ليتنر، وهو شرطُ «طفلٍ سابقٍ لجبهته». */
  if (touch.plan) {
    const asked = new Set();
    const write = (unit, range, kind, correct) => {
      const key = p.skillKey(unit, range, kind);
      if (asked.has(key)) return;
      asked.add(key);
      p.recordAttempt(unit, range, kind, correct, day);
    };
    for (const round of (touch.plan.solo || [])) {
      const score = scoreOf(round.kind, round.by ?? 0);
      if (score) score(round, true, write);
      else write(round.unit, round.range, round.kind, true);
    }
    played++;
  }

  // **والنجومُ تُكسَب فورَ الفتح** — فتتقدّم الجبهةُ بأقصى سرعتها (وهي عينُ العلّة)
  p.setStars(node.id, p.MAX_STARS);
}

const nodes = p.allNodes();

console.log('\n— طفلٌ سابقٌ لجبهته: نجومٌ فورَ الفتح، ولا مراجعةَ تُنضج —');
console.log(`  · عقدُ الرحلة: ${nodes.length} · لُعبت خطتُها: ${played} · `
  + `تنضج مادّتُها: ${ripening.length}`);
if (ripening.length) {
  for (const { node, keys } of ripening.slice(0, 8)) {
    console.log(`     ⏳ ${node.id} — ${keys.length} مفتاحاً (${keys.slice(0, 4).join('، ')}…)`);
  }
}

/* **ولا بدّ أن يقع الإنضاجُ في هذا المشي**: حارسٌ لا يمرّ بالحال التي وُجد لها
   يخضرّ كاذباً — فيُشترَط أن يجد الطفلُ السابقُ بابَاً واحداً على الأقلّ ينتظر
   نضجَ مادّته (وهو البابُ الذي جلس عنده طفلُ الميدان). */
ok(NO_RIPEN || ripening.length > 0,
  `ومرّ الطفلُ بعقدةٍ تنتظر نضجَ مادّتها فعلاً (${ripening.length}) — وإلّا فالحارسُ `
  + 'يخضرّ بلا أن يمرّ بحاله');

console.log('\n— الدعوى: **لا لمسةَ ميتة في الرحلة كلِّها** —');
for (const node of dead.slice(0, 8)) {
  console.log(`     ✗ «${node.title}» (${node.id}) — خطتُها لا تُبنى ولا جلسةَ إنضاجٍ لها`);
}
ok(dead.length === 0,
  `كلُّ عقدةٍ بلغها الطفلُ لمستُها تعمل: ${nodes.length - dead.length} من ${nodes.length}`
  + (dead.length ? ` — ميتةٌ: ${dead.length}` : ''));

// ————— **الدسّة تُشغَّل مع كلِّ تشغيل** («فحصٌ لا يُشغَّل ليس حارساً») —————
//
// في عمليةٍ مستقلّة: الدسّةُ تمشي الرحلةَ بسجلٍّ خالٍ من الصفر، فلا يلوّث أحدُهما
// الآخر — ويلزمها **الأحمر**، فإن اخضرّت فالحارسُ لا يمسك شيئاً.
if (!NO_RIPEN) {
  console.log('\n— الدسّة: أعِد الحالَ إلى سلوك اليوم (`--no-ripen`) فيلزم الأحمر —');
  const dose = spawnSync(process.execPath,
    [fileURLToPath(import.meta.url), '--no-ripen', '--seed', String(SEED)],
    { encoding: 'utf8' });
  const caught = (dose.stdout || '').split('\n').find((l) => l.includes('✗ كلُّ عقدةٍ'))
    || (dose.stdout || '').split('\n').find((l) => l.includes('✗')) || '';
  ok(dose.status !== 0,
    '**سلوكُ اليوم يحمرّ**: لمسةٌ ترجع صامتةً تُمسَك'
    + (dose.status === 0 ? ' — لكنّه اخضرّ! الحارسُ لا يمسك شيئاً' : `\n     ${caught.trim()}`));
}

console.log(fails
  ? `\n${fails} فشل`
  : '\nلا لمسةَ ميتة: كلُّ عقدةٍ بلغها الطفلُ إمّا تُلعَب وإمّا تُنضج بلمسة');
process.exit(fails ? 1 : 0);
