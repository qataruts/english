// **حارسُ الوعد — يوماً بيوم**:
//   node tools/test_promise.mjs [--days N] [--seed N] [--trace]
//
// ————— لماذا حارسٌ سادس، وما الذي لا يمسكه الخمسةُ قبله (سنّةُ اكتب) —————
//
// بلاغُ العائلة `2026-08-15-write-file-closed.md`: «حارسٌ يحرس **وقوعَ الوعد**».
// وحرّاسُنا حتى اليوم يحرسون **الحال**: `check_range` يجرد جولةً جولة على جبهتها،
// و`check_coupling` يصنع حالَ ليتنر بيده ويشهد أنّ البابَ يُغلق ويُفتح، و`test_measure`
// يطالب كلَّ مفتاحٍ بمادّة. وثلاثتُهم يسألون: «أهذه اللحظةُ سليمة؟» — ولا أحدَ منهم
// يسأل: **«أيقع وعدُنا في مجرى الأيام؟»**
//
// والوعدُ المعلَن ثلاثةُ أجزاء (`METHOD.md §١` و§٦ و§٤):
//   ١) **لا كلمةَ قراءةٍ تُعرَض إلا بعد إتقانها سمعاً** — قيدُ الاقتران **واقعاً** لا
//      مصنوعاً بيد: بحالةِ طفلٍ نمت يوماً بيوم من الصفر.
//   ٢) **وأولُ فكٍّ يقع في موضعه** — بعد عبور 🚪١ (ق٤) وعند أوّل درجةٍ تحمل كلمات.
//   ٣) **والرحلةُ تُبلَغ ختاماً** — كلُّ عقدةٍ تُبلَغ وتُقاس، فلا ثقبَ في القفل
//      التسلسليّ يقف عنده طفلٌ ما حيي الجهاز (عيبُ الجلسة ٦).
//
// **والمحاكاةُ طفلٌ لا مولّد**: تمشي الرحلةَ بترتيبها الحقيقيّ (`progress.allNodes`)،
// بسقف اليوم المنصوص (١٥ دقيقة — `METHOD.md §١٢-٨`)، وبمواعيد ليتنر كما هي
// ([0,1,2,4,8,16] يوماً) — فالمهارةُ لا تبلغ صندوقَ الإتقان إلا في **أيامٍ** لا في
// جلسة. ومخرَجُه **عددُ أيام الرحلة**: رقمٌ مقيسٌ يُرفَع إلى المالك.
//
// ————— وطفلُنا مثاليٌّ عن قصد —————
//
// يصيب كلَّ جولة. وذلك **أضيقُ الحالات على الوعد لا أوسعُها**: الإصابةُ تُصعِّد
// الصناديق بأسرع ما يمكن، فتنضج الكلماتُ سمعاً في **أقلّ** عددٍ من الأيام — فإن
// وقع عرضُ كلمةٍ قبل نضجها في هذه الحال فهو في حال الطفل المتعثّر أوقع. وعددُ
// الأيام المطبوع **أرضيةٌ** كذلك: رحلةُ طفلٍ حقيقيّ أطول، ولا يُقرأ رقمُنا وعداً.

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
/** سقفُ الأمان: رحلةٌ لا تنتهي عيبٌ يُمسَك لا حلقةٌ تدور أبداً. */
const MAX_DAYS = flag('--days', 900);
/** انتظارُ عقدةٍ لمادّتها مقبولٌ أياماً (نضجُ ليتنر ١+٢+٤)، وطولُه ثقبُ قفلٍ يُسمّى. */
const WAIT_LIMIT = 30;
/** أيامُ الهدوء بعد تمام العقد التي تُعلن أنّ الاستيعاب توقّف (فيُطبَع ما بقي). */
const QUIET_LIMIT = 30;
const SEED = flag('--seed', 20260817);

// ————— سقفُ اليوم وكلفةُ ما فيه (أرقامُ منهجٍ لا اجتهاد) —————
//
// **سقفُ اليوم ١٥ دقيقة**: `METHOD.md §١٢-٨` (حكمُ مدير المشروع، ١٣ أغسطس) —
// «سقفُ توصية اليوم في لوحة الوالد: ١٥ دقيقة». **وكلفةُ المحطة ٤ دقائق**: أوسطُ
// «٣–٥ دقائق» المنصوصة في `METHOD.md §٤` (حلقةُ كل محطة). وجلسةُ المراجعة والبوابةُ
// أطولُ قليلاً بعدد تمارينهما. وهذه **أرقامُ محاكاةٍ معلَنة**: من غيّرها غيّر عددَ
// الأيام المطبوع، فلا يُقرأ الرقمُ إلا بها.
const DAY_MINUTES = 15;
const STATION_MINUTES = 4;
const REVIEW_MINUTES = 3;
const GATE_MINUTES = 5;

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
const { scoreOf } = await import(new URL('station.js', APP));

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

// ————— مفاتيحُ السمع التي يقف عليها كلُّ ما يُقرأ —————
//
// **ولا تُشتقّ بمطابقة رسم**: مكتوبةٌ في المنهج نفسِه — `words[].listen` لكلمة القراءة،
// و`HEART_WORDS[].listen` للشائكة ذاتِ المدخل (والوظيفةُ الصرفة بعلّتها فلا مفتاحَ لها).
const LISTEN_OF_WORD = new Map(c.GRADES.flatMap((g) => g.words.map((w) => [w.w, w.listen])));
const LISTEN_OF_TRICKY = new Map(Object.entries(c.HEART_WORDS)
  .filter(([, shape]) => shape.listen).map(([word, shape]) => [word, shape.listen]));

/**
 * **ما رُسم في الجولة نصّاً يُقرأ** — لا ما سُمع ولا ما صُوِّر.
 *
 * والوعدُ نصُّه: «لا يدخل **تمرينَ قراءةٍ** كلمةٌ لم تبلغ صندوقَ الإتقان في مفتاحها
 * السمعيّ» (`METHOD.md §٦`) — فالمقيسُ **الرسمُ المعروض** (`kind: 'letter'` بصنفه
 * المعلَن: كلمةٌ تُفكّ أو شائكةٌ محفوظة)، أمّا صورةُ الكلمة في محطةٍ سمعية فهي
 * **موضعُ تعلُّمها** لا خرقاً لوعدها. ولذلك يُقرأ الوصفُ نفسُه الذي يجرده
 * `check_range` (‏`unit` في كل شكل)، لا قائمةُ الكلمات المخلوطة.
 */
const drawnText = (round) => (round.figures || []).filter((f) => f.kind === 'letter');

/** أهذه الجولةُ ترسم كلمةَ قراءةٍ أو شائكةً لم ينضج مفتاحُها السمعيّ؟ — سطرُ الوعد. */
function promiseBreaks(round) {
  const broken = [];
  for (const fig of drawnText(round)) {
    const key = fig.unit === 'word' ? LISTEN_OF_WORD.get(fig.word)
      : fig.unit === 'tricky' ? LISTEN_OF_TRICKY.get(fig.word) : null;
    if (key && !p.isMastered(key)) broken.push(`${fig.word} (${key})`);
  }
  return broken;
}

// ————— يومُ الطفل: مراجعةٌ ثم عقدةٌ فأخرى حتى يُستنفَد السقف —————

const station = (id, day) => {
  for (const { mod: m } of screens) {
    const plan = m.buildStation(id, (SEED ^ (day * 7919)) >>> 0, p.isMastered);
    if (plan) return { m, plan };
  }
  return null;
};

const roundsOf = (plan) => [
  ...(plan.model ? [plan.model] : []),
  ...(plan.guided || []),
  ...(plan.solo || []),
];

const state = {
  day: 0,
  minutes: 0,
  breaks: [],                 // خروقُ الوعد بيومها
  firstRead: null,            // أوّلُ جولة فكٍّ أو دمج: يومُها وموضعُها
  gatesAt: {},                // البواباتُ المعبورة بيومها
  measured: new Set(),        // مفاتيحُ كُتب لها قياسٌ فعلاً
  waiting: new Map(),         // عقدةٌ تنتظر نضجَ مادّتها ← عددُ أيام انتظارها
  longestWait: 0,             // أطولُ وقفةٍ عند بابٍ ينتظر مادّتَه
  lastCount: 0,               // آخرُ عددٍ مقيس (لقياس توقّف الاستيعاب)
  quiet: 0,                   // أيامٌ بلا مفتاحٍ جديد يدخل القياس
  finishedAt: 0,              // يومُ بلوغ آخر عقدة
  played: new Set(),          // عقدٌ لُعبت
  reviews: 0,
};

/**
 * جولةٌ تُلعَب: يُفحَص وعدُها ثم يُكتب قياسُها (والطفلُ مصيبٌ دائماً).
 *
 * **والجردُ بالدالّة الواحدة** (`usedOf` في `station.js`): هي التي يجرد بها
 * `check_range` جولاتِ الشاشات، فما يراه هذا الحارسُ هو ما تراه الحرّاسُ كلُّها —
 * **وتشمل جولاتِ المراجعة والبوابات** كما تشمل جولاتِ المحطة، وهي أخطرُ موضعٍ للقيد
 * (`review.js` في رأسه).
 */
function play(round, day, { measure = true } = {}) {
  const broken = promiseBreaks(round);
  if (broken.length) {
    state.breaks.push({ day, node: round.node || '', words: broken });
  }
  if (!measure || !round.kind) return;
  if (['build', 'decode', 'read'].includes(round.kind) && !state.firstRead
    && round.unit !== 'tricky') {
    state.firstRead = { day, kind: round.kind, range: round.range };
  }
  // **ومَن بنى الجولةَ يكتب مفاتيحَها** (`scoreOf` — لا يستنتج الحارسُ المكتوبَ من
  // حقلَي الجولة): الأمرُ المركّب يكتب صفتيه معاً، فلو كتبنا مفتاحاً واحداً لَشهدنا
  // على التطبيق بما لا يفعل، وبقي نصفُ مفاتيحه «بلا قياس» في تقريرٍ كاذب.
  const write = (unit, range, kind, correct) => {
    p.recordAttempt(unit, range, kind, correct, day);
    state.measured.add(p.skillKey(unit, range, kind));
  };
  const score = scoreOf(round.kind, round.by ?? 0);
  if (score) score(round, true, write);
  else write(round.unit, round.range, round.kind, true);
}

const ALL_KEYS = [...new Set(c.stations().flatMap((s) => s.skills || []))];

const rnd = seeded(SEED >>> 0);

/**
 * جلسةُ مراجعةٍ واحدة — **ولا يُسأل مفتاحٌ مرّتين في يوم**: صندوقُه يرتفع بالإصابة،
 * فلو كُرّر في اليوم الواحد لَبلغ الإتقانَ **حفظاً في جلسة** لا **في مجرى الأيام**،
 * وذاك نقضُ ليتنر ونقضُ الوعد الذي نقيسه.
 */
function runReview(day, asked) {
  const pool = p.todaySkills(day)
    .filter((skill) => !asked.has(p.skillKey(skill.unit, skill.range, skill.kind)));
  if (!pool.length) return 0;
  const items = review.sessionItems(pool, review.SESSION_SIZE, rnd);
  for (const item of items) {
    asked.add(p.skillKey(item.unit, item.range, item.kind));
    play(item, day);
  }
  if (items.length) state.reviews++;
  return items.length;
}

// ————— **الدسّة: لا يُصدَّق حارسٌ لم يُرَ وهو يمسك** (`--self-test`) —————
//
// وعينُ هذا الحارس **رسمٌ يقع تحت بصر الطفل**، فتُجرَّب من ثلاث جهات: كلمةُ قراءةٍ
// تُرسَم ومفتاحُها السمعيّ خالٍ ⇒ تُمسَك · وشائكةٌ ذاتُ مدخلٍ كذلك · **وصورةُ الكلمة
// في محطةٍ سمعية ليست خرقاً** (وهي موضعُ تعلُّمها لا موضعُ قراءتها) ⇒ تمرّ. ولولا
// الثالثة لَصار الحارسُ يصرخ في كل جولة فلا يُقرأ صراخُه.

if (args.includes('--self-test')) {
  const grade = await import(new URL('grade.js', APP));
  const plan = grade.buildStation('grade:h05', 3, () => true);
  const rounds = [plan.model, ...plan.guided, ...plan.solo];
  const read = rounds.find((r) => (r.figures || [])
    .some((f) => f.kind === 'letter' && f.unit === 'word'));
  ok(Boolean(read), 'تُبنى جولةُ قراءةٍ تُرسَم فيها كلمةٌ (مادّةُ الدسّة)');
  ok(read && promiseBreaks(read).length > 0,
    `**وكلمةُ قراءةٍ تُرسَم ولا سجلَّ لمفتاحها السمعيّ تُمسَك** `
    + `(${promiseBreaks(read || {}).join('، ') || 'لا شيء'})`);
  for (const fig of drawnText(read || {})) {
    const key = LISTEN_OF_WORD.get(fig.word);
    if (key) for (let i = 0; i < p.MASTERED_BOX; i++) p.recordAttempt(...key.split('|'), true, i);
  }
  ok(read && promiseBreaks(read).length === 0,
    'وتمرّ ما إن تبلغ مفاتيحُها صندوقَ الإتقان — بابٌ لا جدار');

  const quiz = await import(new URL('quiz.js', APP));
  const listen = quiz.buildStation('quiz:s1-1', 3);
  const pictured = [listen.model, ...listen.guided, ...listen.solo]
    .filter((r) => promiseBreaks(r).length);
  ok(pictured.length === 0,
    '**وصورةُ الكلمة في محطةٍ سمعية ليست خرقاً** — تلك موضعُ تعلُّمها، والوعدُ على '
    + 'الرسم المقروء وحدَه (وإلّا صرخ الحارسُ في كل جولةٍ فلم يُقرأ صراخُه)');

  const heart = Object.entries(c.HEART_WORDS).find(([, shape]) => shape.listen)?.[0];
  const dosed = { figures: [{ kind: 'letter', unit: 'tricky', word: heart }] };
  ok(heart && promiseBreaks(dosed).length > 0,
    `**وشائكةٌ ذاتُ مدخلٍ تُرسَم قبل نضجها تُمسَك** («${heart}» — `
    + `${c.HEART_WORDS[heart]?.listen})`);
  const free = Object.entries(c.HEART_WORDS).find(([, shape]) => shape.why)?.[0];
  ok(free && promiseBreaks({ figures: [{ kind: 'letter', unit: 'tricky', word: free }] })
    .length === 0,
    `  وكلمةُ الوظيفة الصرفة تمرّ بعلّتها المكتوبة («${free}») — وهي خارج القيد بحكم `
    + '`METHOD.md §٦`');

  console.log(fails ? `\n${fails} فشل` : '\n✓ حارسُ الوعد يمسك المدسوسَ كلَّه');
  process.exit(fails ? 1 : 0);
}

/* **ودسّتُه تُشغَّل مع كلِّ تشغيل** («فحصٌ لا يُشغَّل ليس حارساً» — أمرُ المالك):
   تُشغَّل في عمليةٍ مستقلّة لأنّ الدسّةَ تكتب في سجلٍّ خالٍ، والمحاكاةُ تحتاج سجلَّها
   من الصفر — فلا يلوّث أحدُهما الآخر. */
{
  const own = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--self-test'],
    { encoding: 'utf8' });
  process.stdout.write(own.stdout || '');
  if (own.status !== 0) {
    fails++;
    console.log('  ✗ دسّةُ حارس الوعد نفسِها حمراء (`--self-test`)');
  }
}

console.log('\n— محاكاةُ طفلٍ يمشي الرحلةَ يوماً بيوم —');

for (state.day = 1; state.day <= MAX_DAYS; state.day++) {
  const day = state.day;
  const asked = new Set();
  let minutes = 0;

  // ١) **المراجعةُ أولاً كما في التطبيق**: المستحقُّ والبِكرُ من الجبهتين معاً
  if (runReview(day, asked)) minutes += REVIEW_MINUTES;

  // ٢) ثم العقدُ بترتيبها حتى يُستنفَد سقفُ اليوم
  let stalled = false;
  while (minutes < DAY_MINUTES) {
    const node = p.nextNode();
    if (!node) break;
    if (node.type === 'gate') {
      if (minutes + GATE_MINUTES > DAY_MINUTES) break;
      const items = gate.gateItems(node.part, rnd);
      for (const item of items) play(item, day);
      // **والبوابةُ تقيس ولا تدرّس**: تمارينُها تمارينُ المراجعة، فتُكتب بمفاتيحها
      p.markReview(items.length, items.length);
      p.setStars(node.id, p.MAX_STARS);
      state.gatesAt[node.part] = day;
      state.played.add(node.id);
      minutes += GATE_MINUTES;
      if (TRACE) console.log(`  يوم ${day}: 🚪 ${node.title}`);
      continue;
    }
    if (minutes + STATION_MINUTES > DAY_MINUTES) break;
    const built = station(node.id, day);
    if (!built) {
      /* **وعقدةٌ تنتظر مادّتَها ليست عقدةً ميّتة**: القصةُ نصٌّ كلُّه أو لا شيء
         (`story.js`)، فتنتظر نضجَ كلماتها سمعاً — والطفلُ يصرف يومَه في المراجعة.
         **وانتظارٌ لا ينتهي عيبٌ**: يُعَدّ، فإن طال فهو ثقبُ قفلٍ يُسمّى بيومه. */
      const waited = (state.waiting.get(node.id) || 0) + 1;
      state.waiting.set(node.id, waited);
      state.longestWait = Math.max(state.longestWait, waited);
      if (waited > WAIT_LIMIT) {
        console.log(`  ✗ يوم ${day}: عقدةٌ وقفت عندها الجبهةُ ${WAIT_LIMIT} يوماً بلا `
          + `مادّة — «${node.title}» (${node.id})`);
        fails++;
        state.day = MAX_DAYS + 1;
      }
      stalled = true;
      break;
    }
    for (const round of roundsOf(built.plan)) {
      play({ ...round, node: node.id }, day,
        { measure: (built.plan.solo || []).includes(round) });
    }
    p.setStars(node.id, p.MAX_STARS);
    state.played.add(node.id);
    minutes += STATION_MINUTES;
    if (TRACE) console.log(`  يوم ${day}: ${node.title}`);
  }

  // ٣) **وما بقي من اليوم مراجعة**: بابٌ واقفٌ ينتظر نضجَ مادّته، أو رحلةٌ تمّت
  // عقدُها والمفاتيحُ تُثبَّت — والشاشةُ نفسُها تُعاد بتمارين جديدة في كل مرة.
  const idle = stalled || !p.nextNode();
  while (idle && minutes + REVIEW_MINUTES <= DAY_MINUTES) {
    if (!runReview(day, asked)) break;
    minutes += REVIEW_MINUTES;
  }

  if (!p.nextNode() && !state.finishedAt) state.finishedAt = day;
  // **وتمامُ الرحلة عقدٌ ومفاتيح**: العقدُ كلُّها بُلغت، وكلُّ مفتاحٍ كُتب له قياسٌ مرّةً
  if (state.finishedAt && state.measured.size >= ALL_KEYS.length) break;
  /* **وتوقُّفُ الاستيعاب يُقاس ولا يُنتظَر إلى السقف**: إن مضت أسابيعُ بعد تمام العقد
     ولم يدخل القياسَ مفتاحٌ جديد فقد بلغت الرحلةُ حدَّها — يُطبَع ما بقي بلا قياس
     باسمه، فذاك خبرٌ يُرفَع لا حلقةٌ تدور. */
  if (state.measured.size > state.lastCount) {
    state.lastCount = state.measured.size;
    state.quiet = 0;
  } else if (state.finishedAt) {
    state.quiet++;
    if (state.quiet >= QUIET_LIMIT) break;
  }
}

const days = Math.min(state.day, MAX_DAYS);
const nodes = p.allNodes();
const done = nodes.filter((n) => p.isDone(n.id));

console.log(`\n— رقمُ الرحلة المقيس: ${state.finishedAt || '—'} يوماً إلى بوابة الختام، `
  + `و${days} يوماً إلى تمام قياس كل مفتاح —`);
ok(done.length === nodes.length,
  `كلُّ عقد الرحلة بُلغت ولُعبت: ${done.length} من ${nodes.length}`);
ok(days < MAX_DAYS, `والرحلةُ تنتهي (سقفُ الأمان ${MAX_DAYS} يوماً)`);
ok(state.longestWait <= WAIT_LIMIT,
  `وأطولُ وقفةٍ عند بابٍ ينتظر نضجَ مادّته ${state.longestWait} يوماً (الحدّ ${WAIT_LIMIT})`);
ok(nodes.at(-1) && p.isDone(nodes.at(-1).id) && nodes.at(-1).type === 'gate',
  `وآخرُها بوابةُ الختام — «${nodes.at(-1)?.title}»`);

console.log('\n— الوعدُ الأول: لا كلمةَ قراءةٍ تُعرَض قبل إتقانها سمعاً —');
if (state.breaks.length) {
  for (const b of state.breaks.slice(0, 8)) {
    console.log(`     يوم ${b.day} · ${b.node}: ${b.words.join('، ')}`);
  }
}
ok(state.breaks.length === 0,
  `صفرُ خرقٍ في ${days} يوماً — كلُّ كلمةٍ عُرضت للقراءة كانت ناضجةً سمعاً يومَها`
  + (state.breaks.length ? ` (${state.breaks.length} خرقاً)` : ''));

console.log('\n— الوعدُ الثاني: أولُ فكٍّ في موضعه —');
const firstGradeWithWords = c.GRADES.find((g) => g.words.length)?.id;
ok(Boolean(state.firstRead), 'وقع في الرحلة تمرينُ قراءةٍ (دمجٌ أو فكّ) فعلاً');
ok(state.firstRead && state.gatesAt.ear && state.firstRead.day >= state.gatesAt.ear,
  `ولا يقع قبل عبور 🚪١ (عبورُ الأذن يوم ${state.gatesAt.ear} · أوّلُ فكٍّ يوم `
  + `${state.firstRead?.day}) — وهي ق٤ نصّاً`);
const firstWords = new Set((c.GRADES.find((g) => g.id === firstGradeWithWords)?.words || [])
  .map((w) => w.w));
ok(state.firstRead && firstWords.has(state.firstRead.range),
  `وأوّلُ كلمةٍ تُقرأ من كلمات ${firstGradeWithWords} — «${state.firstRead?.range}»`);

console.log('\n— الوعدُ الثالث: كلُّ محطةٍ تُبلَغ وتُقاس —');
const stationsOf = c.stations();
const silent = stationsOf.filter((s) => !(s.skills || [])
  .some((key) => state.measured.has(key)));
ok(silent.length === 0,
  `كلُّ المحطات كتبت قياسَها: ${stationsOf.length - silent.length} من ${stationsOf.length}`
  + (silent.length ? ` — صامتة: ${silent.map((s) => s.id).join('، ')}` : ''));
const allKeys = ALL_KEYS;
const unmeasured = allKeys.filter((key) => !state.measured.has(key));
/* **والشائكةُ التي لا محطةَ لمفتاحها السمعيّ محبوسةٌ بحقّ** (حكمُ الدرجتين ·
   `METHOD.md §٦`): قيدُ الاقتران يمنع قراءتَها ما لم يُقَس معناها سمعاً، ولا محطةَ
   تقيسه اليوم — فمفتاحُ قراءتها **بلا قياسٍ عن عمد**، وهو القيدُ يعمل لا نقصٌ في
   الشاشة. ويُعلَن نائماً بشرطٍ **مجرودٍ من البيانات**: يستيقظ يومَ تُبنى محطتُه. */
const measurable = new Set(stationsOf.flatMap((s) => s.skills || []));
const sleeping = (key) => {
  const [unit, range] = key.split('|');
  const listen = unit === 'tricky' ? c.HEART_WORDS[range]?.listen : null;
  return Boolean(listen && !measurable.has(listen));
};
const asleep = unmeasured.filter(sleeping);
const orphans = unmeasured.filter((key) => !sleeping(key));
ok(orphans.length === 0,
  `ولكلِّ مفتاحٍ قياسٌ في مجرى الأيام: ${allKeys.length - unmeasured.length} من `
  + `${allKeys.length}`
  + (orphans.length ? ` — بلا قياس: ${orphans.slice(0, 12).join('، ')}` : ''));
if (asleep.length) {
  console.log(`  ⏸ و${asleep.length} مفتاحاً محبوساً بقيد الاقتران بحقّ `
    + `(${asleep.join('، ')}) — شائكاتٌ لا محطةَ سمعيةَ لمفاتيحها بعد — نائم، يستيقظ ذاتياً`);
}

console.log(`\n(الجلساتُ: ${state.reviews} جلسةَ مراجعة · البواباتُ: `
  + `${Object.entries(state.gatesAt).map(([id, at]) => `${id}@${at}`).join(' · ')})`);

console.log(fails
  ? `\n${fails} فشل`
  : `\nوعدُنا يقع: بوابةُ الختام في اليوم ${state.finishedAt}، وتمامُ قياس المفاتيح `
    + `في اليوم ${days} — وكلُّ ما وُعد به واقعٌ في مجرى الأيام`);
process.exit(fails ? 1 : 0);
