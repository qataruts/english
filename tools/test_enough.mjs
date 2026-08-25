// **حارسُ الكفاية — أَتُدرَّبُ الكلمةُ قبل أن تُقرَأ؟**:
//   node tools/test_enough.mjs [--days N] [--seed N] [--thin] [--self-test]
//
// ————— لماذا حارسٌ ثامن، وما الذي لا يمسكه السبعةُ قبله —————
//
// بلاغُ الميدان ٦ (٢٤ أغسطس ٢٠٢٦)، بلفظ المالك: «فتح الان ولكن الطفل غير مجهز، لا
// كلمات ولا حروف مكتملة ولم يتدرب على شيئ ثم نريده ان يقرأ — من صور واصوات الى
// قراءة جمل. ما هذا التدريب؟». وحرّاسُنا كلُّهم كانوا **خضراً يومَها**:
//
//   • `check_range` يسأل: «أهذه الجولةُ داخل جبهتها؟» — نعم.
//   • `check_coupling` يسأل: «أبلغت الكلمةُ صندوقَ الإتقان قبل أن تُقرأ؟» — نعم،
//     **وثلاثُ إصاباتٍ متباعدة تبلغه**، ولا يسأل أحدٌ: أثلاثٌ **كافيةٌ تدريباً**؟
//   • `test_promise` يسأل: «أيقع الوعدُ في مجرى الأيام؟» — نعم، في ٢٣ يوماً.
//   • `test_touch` يسأل: «أتقف حلقةٌ؟» — لا.
//
// **فالعيبُ في حجم التمرين لا في البوابة**، وهو ما لا يراه حارسٌ يسأل عن الحال أو
// عن السلامة: يحتاج سؤالاً ثالثاً — **«كم مرّةً لقي الطفلُ هذه الكلمةَ قبل أن
// نطلب منه قراءتَها؟»**. وهذا الملفُّ يسأله ويجيب بعددٍ لا بانطباع.
//
// ————— الدعوى المحروسة —————
//
//   **لا تُطلَب كلمةٌ في قصةٍ إلا وقد قِيست `ENOUGH_TOUCHES` مرّاتٍ فأكثرَ قبل يوم
//   القصة** — والعتبةُ ثابتٌ معلَن يُقرأ حيث يُطبَّق (أدناه).
//
// وبابٌ ثانٍ معه، وهو أصلُ الأول: **جلسةُ المحطة الواحدة تُصيب كلَّ مفتاحٍ من
// مفاتيحها `DRILL_TOUCHES` مرّتين فأكثر** (`station.js` — قاعدةُ الكفاية).
//
// **والمحاكاةُ هي محاكاةُ حارس الوعد نفسِها** (طفلٌ مثاليٌّ يمشي الرحلةَ بسقف يومها
// المنصوص) — فلا ميزانان لرحلةٍ واحدة، ورقمُ الأيام الذي يطبعه هذا الحارسُ هو رقمُ
// ذاك: من غيّر أحدَهما غيّر الآخر.
//
// ————— والدسّةُ ترفع التكرارَ عن الرحلة (`--thin`) —————
//
// **لا يُصدَّق حارسٌ لم يُرَ وهو يمسك**: تُشغَّل المحاكاةُ نفسُها وقد **خُفِّض
// التكرارُ إلى مرّةٍ واحدة** — تُشذَّب جولاتُ كلِّ محطةٍ فلا يبقى لكلِّ مفتاحٍ إلا
// جولةٌ واحدة، ويُرفَع النسجُ — فتحمرّ الدعوى. **ولا تمسّ الدسّةُ شيفرةَ التطبيق**:
// التشذيبُ في هذا الملفّ، على خطةٍ بناها التطبيقُ كما هي.

import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const APP = new URL('../app/js/', import.meta.url);

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const at = args.indexOf(name);
  return at < 0 ? fallback : Number(args[at + 1]);
};
const THIN = args.includes('--thin');
const MAX_DAYS = flag('--days', 900);
const SEED = flag('--seed', 20260817);

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const p = await import(new URL('progress.js', APP));
const c = await import(new URL('curriculum.js', APP));
const review = await import(new URL('review.js', APP));
const gate = await import(new URL('gate.js', APP));
const { seeded } = await import(new URL('ui.js', APP));
const { scoreOf, keysWritten, DRILL_TOUCHES, isDrilled, stationById: stationOf } = await import(new URL('station.js', APP));

/**
 * **عتبةُ الكفاية**: كم مرّةً تُقاس الكلمةُ قبل أن تُطلَب في قصة.
 *
 * **وهي صندوقُ الإتقان نفسُه ولا رقمَ ثانٍ** (`progress.MASTERED_BOX` — وهو عتبةُ
 * قيد الاقتران في `METHOD.md §٦`، وعتبةُ تدريب المحطة في `station.js`). **وما
 * تزيده هذه الدعوى** أنّ الثلاثَ تُعَدّ **قياساً واقعاً في مجرى الأيام** لا صندوقاً
 * يُقرأ لحظةَ السؤال — والفرقُ بينهما هو عينُ ما كشفه بلاغُ الميدان ٦: كان الصندوقُ
 * يبلغ الثلاثةَ **بإصاباتٍ متباعدةٍ في المراجعة**، والطفلُ لم يلقَ الكلمةَ في محطتها
 * إلا مرّة.
 */
const ENOUGH_TOUCHES = p.MASTERED_BOX;

const SEEDLESS = new Set(['main.js', 'progress.js', 'curriculum.js', 'ui.js', 'audio.js',
  'review.js', 'parent.js', 'registry.js', 'figures.js', 'station.js', 'gate.js']);
const screens = [];
for (const file of readdirSync(APP).filter((f) => f.endsWith('.js') && !SEEDLESS.has(f))) {
  const mod = await import(new URL(file, APP));
  if (typeof mod.buildStation === 'function') screens.push({ file, mod });
}

let fails = 0;
const ok = (cond, msg) => {
  if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg);
};

// ————— سقفُ اليوم وكلفتُه: **أرقامُ حارس الوعد نفسُها** (`METHOD.md §١٢-٨ و§١٢-١٦`) —————
const DAY_MINUTES = 15;
const VISIT_MINUTES = 1;
const ROUND_MINUTES = 0.25;
const KEY_MINUTES = 0.15;

const KEYS_OF_NODE = new Map(c.stations().map((s) => [s.id, (s.skills || []).length]));
const roundsOf = (plan) => [
  ...(plan.model ? [plan.model] : []),
  ...(plan.guided || []),
  ...(plan.solo || []),
];
const stationMinutes = (nodeId, plan) =>
  VISIT_MINUTES + roundsOf(plan).length * ROUND_MINUTES
  + (KEYS_OF_NODE.get(nodeId) || 0) * KEY_MINUTES;
const sessionMinutes = (items) => VISIT_MINUTES + items * ROUND_MINUTES;

/**
 * **التشذيب — دسّةُ هذا الحارس** (`--thin`): تُردّ خطةُ المحطة إلى ما كانت عليه قبل
 * قاعدة الكفاية — **جولةٌ واحدة لكلِّ مفتاح، ولا نسجَ من السابق**. فهذه هي الحالُ
 * التي قاسها بلاغُ الميدان ٦، ويجب أن تحمرّ.
 */
function thin(plan) {
  const seen = new Set();
  const solo = [];
  for (const round of plan.solo || []) {
    if (round.woven) continue;
    const keys = keysWritten(round);
    if (keys.length && keys.every((key) => seen.has(key))) continue;
    for (const key of keys) seen.add(key);
    solo.push(round);
  }
  return { ...plan, solo };
}

const station = (id, day) => {
  for (const { mod: m } of screens) {
    const plan = m.buildStation(id, (SEED ^ (day * 7919)) >>> 0, p.isMastered);
    if (plan) return { m, plan: THIN ? thin(plan) : plan };
  }
  return null;
};

// ————— عدُّ اللمسات: كم مرّةً قِيس كلُّ مفتاحٍ حتى اليوم —————

/** مفتاحٌ ← عددُ المرّات التي كُتب فيها قياسٌ له (في محطةٍ أو مراجعةٍ أو بوابة). */
const touches = new Map();
const bump = (key) => touches.set(key, (touches.get(key) || 0) + 1);
const touchesOf = (key) => touches.get(key) || 0;

/** مفاتيحُ السمع كما يعلنها المنهج — لا تُشتقّ بمطابقة رسم (سُنّةُ حارس الوعد). */
const LISTEN_OF_WORD = new Map(c.GRADES.flatMap((g) => g.words.map((w) => [w.w, w.listen])));
const LISTEN_OF_TRICKY = new Map(Object.entries(c.HEART_WORDS)
  .filter(([, shape]) => shape.listen).map(([word, shape]) => [word, shape.listen]));

const state = {
  day: 0,
  starved: [],                // كلماتُ قصصٍ طُلبت ولم تُدرَّب كفايةً
  storyDays: [],              // كلُّ قصةٍ بيومها وأقلِّ لمساتِ كلماتها
  thinStations: [],           // محطاتٌ وجدت مادّةَ مفتاحٍ ثم لم تدرّبه كفايةً
  material: new Map(),        // محطة ← مفاتيحُ وجدت مادّتَها في زياراتها
  dryKeys: 0,                 // مفاتيحُ لا مادّةَ لها يومَ محطتها (قيدُ الاقتران)
  storiesExempt: 0,           // قصصٌ خارج بابِ التدريب بعلّتها (نصٌّ يُتابَع)
  woven: 0,                   // جولاتٌ منسوجةٌ من محطاتٍ سابقة وقعت فعلاً
  soloRounds: 0,
  paying: null,
  finishedAt: 0,
  measuredKeys: new Set(),
};

/** جولةٌ تُلعَب: تُكتب مفاتيحُها بمن بناها (`scoreOf`)، وتُعَدّ لمساتُها. */
function play(round, day, { measure = true } = {}) {
  if (!measure || !round.kind) return;
  const write = (unit, range, kind, correct) => {
    p.recordAttempt(unit, range, kind, correct, day);
    const key = p.skillKey(unit, range, kind);
    bump(key);
    state.measuredKeys.add(key);
  };
  const score = scoreOf(round.kind, round.by ?? 0);
  if (score) score(round, true, write);
  else write(round.unit, round.range, round.kind, true);
}

/**
 * **يومُ القصة يُقاس قبل أن تُلعَب**: لكلِّ كلمةٍ تُرسَم في صفحاتها — كلمةَ فكٍّ أو
 * شائكةً ذاتَ مدخل — يُقرأ مفتاحُها السمعيّ وعددُ لمساته **حتى أمسِ**.
 */
function auditStory(node, plan, day) {
  const drawn = new Map();
  for (const round of roundsOf(plan)) {
    for (const fig of (round.figures || []).filter((f) => f.kind === 'letter')) {
      const key = fig.unit === 'word' ? LISTEN_OF_WORD.get(fig.word)
        : fig.unit === 'tricky' ? LISTEN_OF_TRICKY.get(fig.word) : null;
      if (key) drawn.set(fig.word, key);
    }
  }
  if (!drawn.size) return;
  let least = Infinity;
  for (const [word, key] of drawn) {
    const seen = touchesOf(key);
    least = Math.min(least, seen);
    if (seen < ENOUGH_TOUCHES) {
      state.starved.push({ day, node: node.id, word, key, seen });
    }
  }
  state.storyDays.push({ node: node.id, day, words: drawn.size, least });
}

/** جلسةُ مراجعةٍ واحدة — بعقد `test_promise` نفسِه: لا يُسأل مفتاحٌ مرّتين في يوم. */
const rnd = seeded(SEED >>> 0);
function runReview(day, asked) {
  const pool = p.todaySkills(day)
    .filter((skill) => !asked.has(p.skillKey(skill.unit, skill.range, skill.kind)));
  if (!pool.length) return 0;
  const items = review.sessionItems(pool, review.SESSION_SIZE, rnd);
  for (const item of items) {
    asked.add(p.skillKey(item.unit, item.range, item.kind));
    play(item, day);
  }
  return items.length;
}

// ————— **الدسّةُ الأولى: أَيمسك البابُ الثاني ما دُسّ فيه؟** (`--self-test`) —————
//
// وعينُ البابِ الثاني **خطةُ محطةٍ تُبنى**، فتُجرَّب بجهتين: خطةٌ كما يبنيها التطبيق
// ⇒ كلُّ مفتاحٍ مرّتان · وخطةٌ مشذَّبةٌ بيدنا ⇒ تُمسَك. **والدسّةُ الكبرى** (رفعُ
// التكرار عن الرحلة كلِّها) تجري أدناه في عمليةٍ مستقلّة بـ`--thin`.

const keyHits = (plan, skills) => {
  const hits = new Map(skills.map((key) => [key, 0]));
  for (const round of plan.solo || []) {
    for (const key of keysWritten(round)) {
      if (hits.has(key)) hits.set(key, hits.get(key) + 1);
    }
  }
  return hits;
};

if (args.includes('--self-test')) {
  const quiz = await import(new URL('quiz.js', APP));
  const target = c.stations().find((s) => s.id === 'quiz:s1-3');
  const plan = quiz.buildStation(target.id, 3);
  ok(Boolean(plan), 'تُبنى خطةُ محطةٍ من الرحلة (مادّةُ الدسّة)');

  /* **والنصيبُ يُبلَغ بالزيارات لا بجلسةٍ واحدة** (بلاغُ الميدان ٧): كانت الدعوى
     «كلُّ مفتاحٍ يُصاب ثلاثاً **في جلستها**» — فبلغت المحطةُ الثقيلةُ أربعاً وخمسين
     دقيقةً بلا استئناف، **وذلك جدارٌ**. فصارت الجلسةُ **قضمةً** بقدر سقف اليوم
     (`VISIT_ROUNDS`)، والنصيبُ يُستكمَل بالعودة من سجلّ ليتنر نفسِه. فالدعوى الآن:
     **المحطةُ تُدرَّب كاملةً بزياراتٍ كلُّ واحدةٍ منها تحت سقف اليوم**. */
  let visits = 0; let longest = 0;
  while (!isDrilled(target) && visits < 20) {
    const bite = quiz.buildStation(target.id, 3 + visits, p.isMastered);
    if (!bite) break;
    visits++;
    longest = Math.max(longest, stationMinutes(target.id, bite));
    for (const round of roundsOf(bite)) {
      for (const key of keysWritten(round)) {
        const [unit, range, kind] = key.split('|');
        p.recordAttempt(unit, range, kind, true, visits);
      }
    }
  }
  ok(isDrilled(target) && longest <= DAY_MINUTES,
    `**ونصيبُ كلِّ مفتاحٍ يُبلَغ بالزيارات وكلُّ زيارةٍ تحت سقف اليوم** `
    + `(${target.skills.length} مفتاحاً · ${visits} زيارة · أطولُها `
    + `${longest.toFixed(1)} دقيقة من ${DAY_MINUTES})`);

  const thinned = keyHits(thin(plan), target.skills);
  const thinShort = [...thinned].filter(([, n]) => n < DRILL_TOUCHES);
  ok(thinShort.length === target.skills.length,
    `**وخفضُ التكرار إلى مرّةٍ يُمسَك**: ${thinShort.length} من ${target.skills.length} `
    + 'مفتاحاً تحت العتبة — فالبابُ يفرّق بين المدرَّب وغير المدرَّب');

  console.log(fails ? `\n${fails} فشل` : '\n✓ بابُ التدريب يمسك المدسوسَ فيه');
  process.exit(fails ? 1 : 0);
}

// ————— محاكاةُ الرحلة: طفلٌ مثاليٌّ بسقف يومه —————

console.log(THIN
  ? '\n— الدسّة: الرحلةُ نفسُها وقد خُفِّض التكرارُ إلى مرّةٍ ورُفع النسج —'
  : '\n— محاكاةُ طفلٍ يمشي الرحلةَ يوماً بيوم (بأرقام حارس الوعد) —');

if (!THIN) {
  const own = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--self-test'],
    { encoding: 'utf8' });
  process.stdout.write(own.stdout || '');
  if (own.status !== 0) {
    fails++;
    console.log('  ✗ دسّةُ بابِ التدريب نفسِها حمراء (`--self-test`)');
  }
  /* **والدسّةُ الكبرى تُشغَّل مع كلِّ تشغيل** («فحصٌ لا يُشغَّل ليس حارساً» — أمرُ
     المالك): الرحلةُ نفسُها وقد خُفِّض التكرارُ إلى مرّةٍ ورُفع النسج — **يجب أن
     تحمرّ**. وفي عمليةٍ مستقلّة لأنّ لكلٍّ سجلَّ طفلٍ من الصفر. */
  const lean = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--thin'],
    { encoding: 'utf8' });
  const starved = /(\d+) كلمةً دون العتبة/.exec(lean.stdout || '')?.[1] || '0';
  ok(lean.status !== 0,
    `**وخفضُ التكرار إلى مرّةٍ في الرحلة كلِّها يحمرّ** (\`--thin\`): ${starved} كلمةً `
    + 'تُطلَب في قصةٍ ولم تُدرَّب كفايةً — فالحارسُ يفرّق بين الرحلتين');
}


/* **ومقياسُ التمام يُمرَّر كما يمرّره `main.js` حرفاً** (بلاغُ الميدان ٧): صارت
   المحطةُ تُزار مراتٍ بالقضمة، والسهمُ يبقى عليها حتى تُدرَّب مفاتيحُها — فلو مشى
   الحارسُ بغير ذلك لَقاس رحلةً لا يمشيها طفل. */
const drilled = (node) => {
  const st = stationOf(node.id);
  return !st || isDrilled(st);
};
/* **والدسّةُ تُعيد الحالَ «قبل» كاملةً**: خفضُ التكرار وحدَه لم يعد يفرّق بعد أن
   صار السهمُ يُعيد إلى المحطة حتى تتمّ — فالحالُ التي شكا منها بلاغُ الميدان ٦
   **مرّةٌ واحدة ثم يمضي**، وهي بلا مقياس التمام. */
const nextNode = () => (THIN ? p.nextNode() : p.nextNode(drilled));

for (state.day = 1; state.day <= MAX_DAYS; state.day++) {
  const day = state.day;
  const asked = new Set();
  let minutes = 0;

  const first = runReview(day, asked);
  if (first) minutes += sessionMinutes(first);

  let stalled = false;
  while (minutes < DAY_MINUTES) {
    const node = nextNode();
    if (!node) break;
    if (node.type === 'gate') {
      const items = gate.gateItems(node.part, rnd);
      if (minutes + sessionMinutes(items.length) > DAY_MINUTES && minutes > 0) break;
      for (const item of items) play(item, day);
      p.markReview(items.length, items.length);
      p.setStars(node.id, p.MAX_STARS);
      minutes += sessionMinutes(items.length);
      continue;
    }
    const built = station(node.id, day);
    if (!built) { stalled = true; break; }
    const cost = stationMinutes(node.id, built.plan);
    const paid = state.paying?.id === node.id ? state.paying.paid : 0;
    const spend = Math.max(0, Math.min(cost - paid, DAY_MINUTES - minutes));
    minutes += spend;
    if (paid + spend < cost - 1e-9) {
      state.paying = { id: node.id, paid: paid + spend };
      break;
    }
    state.paying = null;

    /* **البابُ الثاني يُقاس على كلِّ محطةٍ تُلعَب** — لا على عيّنةٍ منتقاة.
       **ومفتاحٌ لا مادّةَ له يومَها ليس نقصَ تدريب**: كلمةُ فكٍّ لم تنضج سمعاً أو
       شائكةٌ محبوسة لا تُنتج جولةً أصلاً (`بابٌ لا جدار` — `grade.js`)، فتُعَدّ
       **جافّةً** وتُعلَن بعددها، و`test_promise` هو الذي يشهد أنّها تُقاس يوماً ما.
       والنقصُ المحروسُ هنا **ما بين الواحدة والعتبة**: مفتاحٌ وجد مادّتَه ثم لم
       يُدرَّب كفايةً — وهو وحدَه عيبُ التدريب. */
    const hits = keyHits(built.plan, c.stations().find((s) => s.id === node.id)?.skills || []);
    const short = [...hits].filter(([, n]) => n > 0 && n < DRILL_TOUCHES);
    state.dryKeys += [...hits].filter(([, n]) => n === 0).length;
    /* **والقصةُ مستثناةٌ من هذا الباب بعلّتها المكتوبة** (`story.js` — الحكمُ الأول):
       هي **نصٌّ يُتابَع لا حوضُ جولات**، مفتاحُها واحدٌ تقيسه صفحاتُها بترتيبها —
       فقصةٌ من أربع صفحاتٍ تقيسه مرّتين، وبلوغُ الثالثة فيها **إعادةُ صفحةٍ بعينها**
       (استظهارٌ لا تدريب). وتدريبُ كلماتها موضعُه محطاتُ الدرجة التي تسبقها،
       **وذاك ما يحرسه البابُ الأول أعلاه بعينه** — فلا يفلت شيء. ويُعلَن العددُ
       ولا يُسكَت عنه. */
    if (node.type === 'story') state.storiesExempt++;
    /* **والمحطةُ تُحاسَب عند فراغها لا عند كلِّ قضمة** (بلاغُ الميدان ٧): صارت
       الزيارةُ قضمةً بقدر سقف اليوم، فالنقصُ في زيارةٍ **مقصودٌ** يُستكمَل بالعودة —
       والدعوى أن يبلغ نصيبُ كلِّ مفتاحٍ **قبل أن تفارقها الطفلةُ نهائياً**، وذلك ما
       يقوله `isDrilled` (السهمُ يبقى عليها حتى تصدق). */
    /* **والنصيبُ يُحاسَب تراكماً من السجلّ لا لكلِّ خطة** (بلاغُ الميدان ٧): القضمةُ
       تعني أنّ خطةَ الزيارة الثانية لا تُعيد ما بلغ نصيبَه — فعدُّ لمساتِ **هذه
       الخطة** يقول «ناقص» عن مفتاحٍ تمَّ أمس. فيُجمَع ما وجد مادّتَه في زياراتها،
       ويُقابَل آخرَ الرحلة بلمساته في ليتنر. */
    const found = state.material.get(node.id) || new Set();
    for (const round of built.plan.solo || []) {
      for (const key of keysWritten(round)) {
        if ((node.skills || []).includes(key)) found.add(key);
      }
    }
    state.material.set(node.id, found);
    state.soloRounds += (built.plan.solo || []).length;
    state.woven += (built.plan.solo || []).filter((r) => r.woven).length;

    // **والبابُ الأول يُقاس قبل أن تُلعَب القصة** — بلمساتٍ وقعت قبل يومها
    if (node.type === 'story') auditStory(node, built.plan, day);

    for (const round of roundsOf(built.plan)) {
      play(round, day, { measure: (built.plan.solo || []).includes(round) });
    }
    p.setStars(node.id, p.MAX_STARS);
  }

  const idle = stalled || !nextNode();
  while (idle && minutes < DAY_MINUTES) {
    const items = runReview(day, asked);
    if (!items) break;
    minutes += sessionMinutes(items);
  }
  if (!nextNode() && !state.finishedAt) state.finishedAt = day;
  if (state.finishedAt) break;
}

const days = Math.min(state.day, MAX_DAYS);

console.log(`\n— رقمُ الرحلة إلى بوابة الختام: ${state.finishedAt || '—'} يوماً —`);
console.log(`  (جولاتُ «وحدك» في الرحلة كلِّها: ${state.soloRounds} · منها `
  + `${state.woven} منسوجةٌ من محطاتٍ سابقة)`);

console.log(`\n— البابُ الأول: لا كلمةَ تُطلَب في قصةٍ إلا وقد قِيست ${ENOUGH_TOUCHES} `
  + 'مرّاتٍ فأكثرَ قبل يومها —');
for (const one of state.storyDays) {
  console.log(`     · ${one.node} (يوم ${one.day}): ${one.words} كلمةً مرسومة — `
    + `أقلُّها تدريباً ${one.least} لمسة`);
}
for (const one of state.starved.slice(0, 10)) {
  console.log(`     ✗ يوم ${one.day} · ${one.node}: «${one.word}» (${one.key}) — `
    + `${one.seen} لمسة فقط`);
}
ok(state.storyDays.length > 0, `وقعت في الرحلة قصصٌ فعلاً (${state.storyDays.length})`);
ok(state.starved.length === 0,
  `كلُّ كلمةٍ طُلبت في قصةٍ كانت مدرَّبةً ${ENOUGH_TOUCHES} مرّاتٍ فأكثر`
  + (state.starved.length ? ` — ${state.starved.length} كلمةً دون العتبة` : ''));

console.log(`\n— البابُ الثاني: المحطةُ تُدرَّب كاملةً قبل أن تُفارَق (${DRILL_TOUCHES} لكلِّ مفتاح) —`);
const records = new Map(p.skills().map((skill) => [skill.key, skill]));
const touchesDone = (key) => {
  const rec = records.get(key);
  return rec ? (rec.right || 0) + (rec.wrong || 0) : 0;
};
const pending = [...state.material]
  .map(([id, keys]) => [id, [...keys].filter((key) => touchesDone(key) < DRILL_TOUCHES)])
  .filter(([, short]) => short.length);
ok(pending.length === 0,
  'كلُّ مفتاحٍ وجد مادّتَه في محطته بلغ نصيبَه من التدريب في الرحلة'
  + (pending.length
    ? ` — ${pending.length} محطةً ناقصة (${pending.slice(0, 4)
      .map(([id, short]) => `${id}:${short.length}`).join('، ')})`
    : ''));
console.log(`  ⏸ و${state.dryKeys} مفتاحاً لا مادّةَ له يومَ محطته (قيدُ الاقتران — `
  + 'بابٌ لا جدار)، ويشهد `test_promise` أنّها تُقاس في مجرى الأيام');
console.log(`  ⏸ و${state.storiesExempt} قصّةً خارج هذا الباب بعلّتها المكتوبة `
  + '(نصٌّ يُتابَع لا حوضُ جولات — وكلماتُها يحرسها البابُ الأول)');

console.log(fails
  ? `\n${fails} فشل`
  : `\nقاعدةُ الكفاية قائمة: لا كلمةَ تُقرأ قبل أن تُدرَّب ${ENOUGH_TOUCHES} مرّات`);
process.exit(fails ? 1 : 0);
