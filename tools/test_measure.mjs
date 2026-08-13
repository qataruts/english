// حارس «لا تدريسَ بلا قياس»:
//   node tools/test_measure.mjs
//
// ————— بذرةُ المنصة (منسوخٌ من «اِقْرَأْ» ومكيَّف) —————
//
// **العلّة** (من ميدان اقرأ): فجوةُ قياسٍ عاشت أربع عشرة حزمةً صامتة. لا لأنّ أحداً
// أخطأ، بل لأنّ **غياب القياس لا يُفشِل اختباراً**: كلُّ حارسٍ يفحص ما كُتب، ولا حارسَ
// يسأل عمّا لم يُكتب. فكان الدرسُ يعلّم ولا يسجّل مهارةً واحدة، وكانت كلُّ الاختبارات
// خضراء — والبوابةُ ولوحةُ وليّ الأمر عمياوان.
//
// وهذا الحارس يقلب القاعدة: **يجرد الرحلةَ نفسَها** نوعَ محطةٍ نوعَ محطة، ويطالب
// كلَّ محطةٍ تدرّس مهارةً بقياسٍ مقابلٍ في ليتنر — فالغيابُ نفسُه صار فشلاً أحمر.
// ومحطةٌ جديدة تدخل الرحلة بلا قياسٍ ولا إعفاءٍ مكتوب **تُسقِط هذا الاختبار يومَ تُضاف**.
//
// وثلاثةُ أبوابٍ يفحصها لكل نوع محطة:
//   ١) **الإعلان**: لكل نوعٍ في الرحلة إمّا أنواعُ قياسٍ، وإمّا إعفاءٌ بسببٍ مكتوب.
//   ٢) **الشيفرة**: الشاشةُ المالكة تكتب فعلاً بذلك النوع (`recordAttempt`)،
//      والمعفاةُ لا تكتب شيئاً.
//   ٣) **المراجعة**: لكل نوع قياسٍ تمرينٌ يراجعه فعلاً — تُبنى منه جلسةٌ حقيقية،
//      وإلا بقيت المهارة في صندوق ليتنر الأول أبداً فكذبت لوحةُ وليّ الأمر.
//
// ————— النومُ الذاتيّ (`docs/SEED.md §٥`) —————
//
// المقياسُ **الجردُ لا رايةٌ تُضبط بيد**: أوّلُ محطةٍ تُكتب في `curriculum.js` توقظ
// **بابَ الإعلان** فيطالب بجدول `STATIONS` أدناه؛ وأوّلُ شاشةٍ تُكتب توقظ **بابَي
// الشيفرة والمراجعة**. فلا يملك أحدٌ أن ينسى إيقاظه.
//
// **وقد أيقظت الجلسةُ ١ بابَ الإعلان** بكتابة الرحلة، وملأت الجدولَ أدناه بأنواع
// محطاتها كلِّها (والعددُ يطبعه الحارسُ محسوباً). وبقي البابان الآخران نائمين بشرطَيهما
// المجرودين: الشيفرةُ تنام **لكل نوعٍ لم يُكتب ملفُّ شاشته**، والمراجعةُ تنام ما دامت
// **لا وحدةَ تمارينَ تحقن بانِيَ التمارين** (`setBuilders` في `review.js`) — فلا
// مهارةَ يمكن أن تُنتج تمرينَها قبل أن يُحقَن بانيها. وشرطُ نومها **مجرودٌ من
// `app/js/` لا مضبوطٌ بيد**، فتستيقظ من تلقائها يومَ تكتب الجلسةُ ٢ أوّلَ مولّد.

import { readFileSync, readdirSync, existsSync } from 'node:fs';

const APP = new URL('../app/js/', import.meta.url);
const src = (name) => readFileSync(new URL(name, APP), 'utf8');
const has = (name) => existsSync(new URL(name, APP));

// وحداتُ البذرة ليست شاشاتِ تمارين (نظيرُ `SEED` في `test_nodes.mjs`)
const SEED = new Set([
  'main.js', 'progress.js', 'curriculum.js', 'ui.js', 'audio.js', 'review.js', 'parent.js',
  'registry.js',
]);
const screenFiles = readdirSync(APP).filter((f) => f.endsWith('.js') && !SEED.has(f));

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const p = await import(new URL('progress.js', APP));
const curriculum = await import(new URL('curriculum.js', APP));

let fails = 0;
let asleep = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg); };
const dormant = (msg) => { asleep++; console.log('  ⏸', `${msg} — نائم، يستيقظ ذاتياً`); };

// ————— الجرد المُعلَن: نوعُ المحطة ← قياسُها أو سببُ إعفائها —————
//
// **هذا الجدول هو العقد**. مَن أضاف محطةً إلى الرحلة فعليه أن يُدخلها هنا: بقياسٍ
// تملكه، أو بإعفاءٍ يبرّره — ولا ثالث. وليس التعديلُ فيه هروباً من الفشل: كتابةُ
// «هذه المحطة تعلّم ولا تقيس» سطراً صريحاً هي عينُ ما نريده أن يُقرأ في المراجعة.
//
// **والمفاتيحُ مفاتيحُ `METHOD.md §٧`**: (الوحدة × المدى × نوع التمرين) — مثل
// `word|cat|listen-pick` و`gpc|s|sound-pick` و`text|h05|read`. و`kinds` هنا **أنواعُ
// التمرين** (الحقلُ الثالث)، وهي ما يُكتب في `recordAttempt`.
//
// **والنوعُ اسمُ الشاشة لا اسمُ الوحدة**: شاشتان قد تقيسان وحدةً واحدة لأنهما درسان
// في جلستين — `gpc|s|sound-pick` (اسمع الصوتَ واختر رسمَه) و`gpc|s|letter-pick`
// (انظر الرسمَ واختر صوتَه). ولذلك **كلُّ نوعٍ يُنجَز في جلسةٍ واحدة**: نوعٌ تتوزّع
// أنواعُ تمارينه على جلستين يبقى أحمرَ بينهما بحقّ، وليس ذلك عيباً في الجدول بل في
// تقسيم الشاشات.
//
// **والجلساتُ ٢–٧ تملؤه** على الرحلة التي تكتبها الجلسة ١ (`METHOD.md §٤–§٥`):
// س١ `quiz` · س٢ `tpr` · س٣ `contrast` · س٤ الأذنُ الفونيمية · ح١–ح١٦ `build`
// و`decode` · القصصُ `text`. ومن إعفاءاته المنصوصة سلفاً:
//   • **البوابات الثلاث**: تقيس ولا تدرّس (أدناه).
//   • **القصةُ شبهُ المفكوكة** (`text|<درجة>|read`) **ليست معفاة**: هي مقيسةٌ بنصّ
//     `METHOD.md §٧` — وهذا يفارق اقرأ حيث «القصةُ تُقرأ ولا تُمتحَن»، لأنّ قصّتنا
//     تُفحَص بـ`check_range` **ويُسأل عنها** في ليتنر. فمن أعفاها هنا خالف المنهج.

const STATIONS = {
  // ————— مسارُ السمع (`METHOD.md §٤`) —————
  quiz: {
    title: 'افهم والمس · توسعةُ الرصيد (س١ · س٥)',
    file: 'quiz.js',
    kinds: ['listen-pick'],
  },
  tpr: {
    title: 'اسمع ونفّذ — TPR (س٢)',
    file: 'tpr.js',
    // ثلاثةُ أوامرَ لا واحد: لمسُ المسمّى · وضعٌ مكانيّ (in/on/under) · أمرٌ مركّب
    // («المس السمكةَ الحمراء»). وأفعالُ الحركة تُقاس بـ`tpr-do` نفسِه على وحدة `verb`.
    kinds: ['tpr-do', 'tpr-put', 'tpr-two'],
  },
  contrast: {
    title: 'ميّز الزوجين (س٣)',
    file: 'contrast.js',
    kinds: ['pick'],
  },
  ear: {
    title: 'الأذنُ الفونيمية (س٤)',
    file: 'ear.js',
    // أوّلُ الصوت والقافيةُ اختيارٌ (`pick`)، والدمجُ والتقطيعُ لهما نوعاهما لأنّهما
    // مهارتان متعاكستان: من يدمج قد لا يقطّع (عينُ L&S المرحلة ١).
    kinds: ['pick', 'blend-ear', 'segment-ear'],
  },

  // ————— مسارُ الحرف (`METHOD.md §٥`) —————
  grade: {
    title: 'درجةُ الحرف: رموزٌ ودمجٌ وشائكات (ح١–ح١٢ · ح١٤–ح١٦)',
    file: 'grade.js',
    // `sound-pick` اسمع الصوتَ واختر رسمَه · `letter-pick` انظر الرسمَ واختر صوتَه
    // (§٧ نصاً) · `build` دمجٌ بالرموز · `decode` فكُّ الكلمة · `read` للشائكة.
    kinds: ['sound-pick', 'letter-pick', 'build', 'decode', 'read'],
  },
  cluster: {
    title: 'العناقيد والصائتُ الأوسط (ح١٣)',
    file: 'cluster.js',
    // **ولها شاشتُها لا شاشةُ الدرجات**: لا رمزَ جديدَ فيها (`METHOD.md §٥`)، ومعها
    // شكلُ `mid-pick` (نظيرُ `haraka`) الذي تكتبه الجلسة ٦ — ولو جُمعت مع `grade`
    // لبقي نوعُ `grade` أحمرَ من الجلسة ٤ إلى السادسة بلا ذنب.
    kinds: ['build', 'decode', 'read', 'mid-pick'],
  },
  story: {
    title: 'القصةُ شبهُ المفكوكة (من بعد 🚪٢)',
    file: 'story.js',
    // **ولا إعفاءَ للقصة عندنا** (رأسُ الجدول أعلاه): `text|<درجة>|read` مقيسٌ بنصّ
    // `METHOD.md §٧`، وهو ما نفارق فيه اقرأ.
    kinds: ['read'],
  },

  // ————— المعفاةُ بسببها المكتوب —————
  gate: {
    title: 'بوابة الإتقان',
    file: 'gate.js',
    exempt: 'البوابةُ **تقيس ولا تدرّس**: تمارينُها تمارينُ المراجعة نفسُها '
      + '(`sessionItems`)، فتكتب بأنواعِ غيرِها ولا نوعَ لها. وهذا الإعفاءُ منقولٌ '
      + 'من اقرأ بعلّته لا بنصّه — والبوابةُ عندنا ثلاثٌ: عبورُ الأذن، وعبورُ الفكّ، '
      + 'وختامُ التأسيس (`METHOD.md §٤–§٥`).',
  },
};

// ————— ١) الإعلان: لا نوعَ محطةٍ في الرحلة خارج الجرد —————

console.log('\n— جرد الرحلة: كل نوع محطةٍ مُعلَن —');

const types = [...new Set(p.allNodes().map((n) => n.type))].sort();

if (!types.length) {
  dormant('الرحلةُ فارغة (`app/js/curriculum.js` بذرةٌ تملؤها الجلسة ١)');
} else {
  const unknown = types.filter((t) => !STATIONS[t]);
  ok(unknown.length === 0,
    `${types.length} نوعَ محطةٍ في الرحلة، كلُّها في الجرد (${types.join('، ')})`
    + (unknown.length ? ` — **خارج الجرد: ${unknown.join('، ')}** (قياساً أو إعفاءً)` : ''));

  const stale = Object.keys(STATIONS).filter((t) => !types.includes(t));
  ok(stale.length === 0,
    'ولا سطرَ في الجرد لمحطةٍ سقطت من الرحلة'
    + (stale.length ? ` — بائدة: ${stale.join('، ')}` : ''));

  const declared = Object.entries(STATIONS).filter(([t]) => types.includes(t));
  ok(declared.every(([, s]) => (s.kinds?.length > 0) !== Boolean(s.exempt)),
    'ولكلٍّ قياسُها **أو** إعفاؤها المكتوب — لا الاثنان ولا لا شيء');
  ok(declared.filter(([, s]) => s.exempt).every(([, s]) => s.exempt.length > 40),
    'وسببُ الإعفاء جملةٌ تُقرأ لا كلمةٌ تُكتب للمرور');

  // ————— ١ب) لا انحرافَ بين الجردين (زيادةُ الجلسة ١) —————
  //
  // **العلّة**: صار للقياس مصدران — المنهجُ يعلن مفاتيح كل محطة (`skills` في
  // `curriculum.js`)، وهذا الجدولُ يعلن أنواعَ تمارين كل شاشة. ومصدران لحقيقةٍ
  // واحدة يفترقان بلا حارس: تُضاف محطةٌ بنوع تمرينٍ جديد فيبقى الجدولُ ساكتاً،
  // فيمرّ بابُ الشيفرة أخضرَ وهو لا يطالب بالجديد. فيُقابَل الجردان هنا صنفاً بصنف.

  const fromCurriculum = new Map();
  for (const station of curriculum.stations()) {
    const set = fromCurriculum.get(station.type) || new Set();
    for (const key of station.skills || []) set.add(key.split('|')[2]);
    fromCurriculum.set(station.type, set);
  }
  const drift = [...fromCurriculum].filter(([type, set]) => {
    const listed = new Set(STATIONS[type]?.kinds || []);
    return set.size !== listed.size || [...set].some((k) => !listed.has(k));
  });
  ok(drift.length === 0,
    `وأنواعُ تمارين كل شاشةٍ في الجدول هي التي يعلنها المنهج (${fromCurriculum.size} نوعاً)`
    + (drift.length ? ` — منحرفة: ${drift.map(([t, s]) => `${t} (المنهج: ${[...s].join('،') || 'لا شيء'
      })`).join('، ')}` : ''));

  const claiming = [...fromCurriculum].filter(([type, set]) => set.size && STATIONS[type]?.exempt);
  ok(claiming.length === 0,
    'ولا محطةَ معفاةٍ تعلن مفتاحَ ليتنر في المنهج'
    + (claiming.length ? ` — ${claiming.map(([t]) => t).join('، ')}` : ''));

  // ————— ٢) الشيفرة: المالكةُ تكتب فعلاً، والمعفاةُ لا تكتب —————

  console.log('\n— الشيفرة: مَن أعلن قياساً كتبه —');
  for (const [type, station] of declared) {
    if (!has(station.file)) {
      dormant(`[${type}] ${station.title}: شاشتُها (\`${station.file}\`) لم تُكتب بعد`);
      continue;
    }
    const body = src(station.file);
    if (station.exempt) {
      ok(!/progress\.recordAttempt\s*\(/.test(body),
        `[${type}] ${station.title}: لا تسجّل مهارةً — ${station.exempt.split('(')[0].trim()}`);
      continue;
    }
    const written = station.kinds.filter((kind) =>
      new RegExp(`recordAttempt\\([^;]*['"\`]${kind}['"\`]`, 's').test(body)
      || new RegExp(`score\\([^;]*['"\`]${kind}['"\`]`, 's').test(body));
    ok(written.length === station.kinds.length,
      `[${type}] ${station.title} تكتب ${station.kinds.join(' و')} في ${station.file}`
      + (written.length < station.kinds.length
        ? ` — **غائب: ${station.kinds.filter((k) => !written.includes(k)).join('، ')}**` : ''));
  }

  // ————— ٣) المراجعة: لكل قياسٍ تمرينٌ يراجعه فعلاً —————
  //
  // **لا مهارةَ تُقاس بلا تمرينٍ يراجعها**: فحصٌ حيّ لا نصيّ — يُبنى لكل نوعٍ مستحقٌّ
  // وتُطلَب منه جلسة، فإن لم تُنتج تمرينَه بقيت مهاراتُه في الصندوق الأول أبداً.

  console.log('\n— المراجعة: لكل نوع قياسٍ تمرينُه —');
  const kinds = [...new Set(Object.values(STATIONS).flatMap((s) => s.kinds || []))];
  // **والنومُ بالنوع لا بالجميع** (نظيرُ ما وقع لـ`test_nodes`): أنواعُ التمارين
  // تُكتب شاشاتُها في **ستّ جلسات** (٢–٧)، فمطالبةُ الجميع يومَ يُحقَن أوّلُ بانٍ
  // تُسقِط الجلسةَ الثانية بذنب السابعة. والشرطُ الصحيحُ شرطُ بابِ الشيفرة نفسِه:
  // **نوعُ تمرينٍ لا ملفَّ لأيّ
  // شاشةٍ تدرّسه بعد** نائمٌ، وما وُجد ملفُّ شاشته **يُطالَب فوراً** — والجردُ يجيب،
  // لا رايةٌ تُضبط بيد.
  const owners = (kind) => Object.values(STATIONS)
    .filter((s) => (s.kinds || []).includes(kind));
  const injectors = screenFiles.filter((f) => /setBuilders\s*\(/.test(src(f)));
  if (!kinds.length) {
    dormant('لا نوعَ قياسٍ مُعلَناً بعد (الجلسة ١ تكتب المفاتيح، والجلسة ٢ بانيَها)');
  } else if (!injectors.length) {
    dormant(`${kinds.length} نوعَ قياسٍ مُعلَناً، ولا وحدةَ تمارينَ تحقن بانيَها بعد `
      + '(`setBuilders` — الجلسة ٢ تكتب أولاها)');
  } else {
    // **تُحمَّل وحداتُ التمارين كلُّها**: هي التي تسجّل بانِيَ كل نوع، فبلا تحميلها
    // يُقاس الهيكلُ فارغاً فيُقال «لا تمرين» وفي الشجرة تمرين. وتحميلُها هنا يُثبت
    // معه **عقدَ الوحدة الخالصة**: تُستورَد في node بلا متصفّح (`check_range.py`).
    for (const file of screenFiles) await import(new URL(file, APP));
    const review = await import(new URL('review.js', APP));
    const { seeded } = await import(new URL('ui.js', APP));
    for (const kind of kinds) {
      const waiting = owners(kind).every((s) => !has(s.file));
      if (waiting) {
        dormant(`[${kind}] لا شاشةَ تدرّسه بعد `
          + `(${[...new Set(owners(kind).map((s) => s.file))].join('، ')})`);
        continue;
      }
      const due = [{ kind, box: 0, wrong: 1, concept: 'probe', range: 'probe' }];
      const built = [1, 5, 11, 23].some((seed) =>
        review.sessionItems(due, review.SESSION_SIZE, seeded(seed))
          .some((item) => item.kind === kind));
      ok(built, `[${kind}] مهارةٌ مستحقّة تُنتج تمرينَها في جلسة المراجعة`);
    }
    // والبوابةُ تُبنى بالمحرّك نفسِه، فما دخل المراجعةَ دخلها
    ok(/sessionItems/.test(src('gate.js')) && /weakestSkills/.test(src('gate.js')),
      'والبوابةُ تبني بالمحرّك نفسِه من أضعف المهارات — فما يُقاس يُسأل عنه فيها');

    // ————— ٣ب) **ولكلِّ مفتاحٍ مادّةٌ تُنتجه بمداه** (زيادةُ الجلسة ٢) —————
    //
    // البابُ الذي قبله يسأل: «أللنوع تمرينٌ؟» — ويكفيه **مفتاحٌ واحد** من النوع.
    // وبينهما ثغرةٌ صامتة: **مفتاحٌ بعينه لا تستطيع شاشتُه أن تسأل عنه**. مثالُها
    // حاضر: كلمةٌ تُعلَن `pictured: 'act'` ولا وضعَ مرسومَ لها (`figures.js`)، أو
    // حرفُ جرٍّ لا موضعَ له في مشهد الصندوق — فيبنى تمرينُ النوع **بكلمةٍ أخرى**،
    // ويبقى المفتاحُ في الصندوق الأول أبداً: لوحةُ الوالد تعدّه مهارةً «قيد التعلّم»
    // وهو لا يُسأل عنه في عمر الجهاز. ولا يُحمِر ذلك بابَ النوع ولا `check_range`.
    //
    // **والنومُ بالمحطة لا بالجميع**: محطةٌ لا تولّد جولةً بعد (`probeRounds` فارغة —
    // جملُ س٥-٦ مثلاً، شاشتُها في الجلسة ٧) نائمةٌ بشرطٍ **مجرود**، وما ولّد يُطالَب
    // بكل مفاتيحه. فيستيقظ الحارسُ يومَ تُكتب شاشتُها بلا سطرٍ يُضاف.

    console.log('\n— ولكلِّ مفتاحٍ مادّةٌ تُنتجه بمداه —');
    const generators = [];
    for (const file of screenFiles) {
      const mod = await import(new URL(file, APP));
      if (typeof mod.probeRounds === 'function') generators.push(mod);
    }
    const probeOf = (id) => generators.flatMap((m) => m.probeRounds(id, 5) || []);
    const asked = (round, range) => (round.skills || [round])
      .some((s) => String(s.range) === String(range));

    let checked = 0;
    let sleeping = 0;
    const orphans = [];
    for (const station of curriculum.stations()) {
      const known = STATIONS[station.type];
      if (!known || known.exempt || !has(known.file)) continue;
      if (!probeOf(station.id).length) { sleeping++; continue; }
      for (const key of station.skills || []) {
        const [unit, range, kind] = key.split('|');
        checked++;
        const due = [{ unit, range: p.spanOf(range), kind, box: 0, wrong: 1 }];
        const built = [3, 9].map((seed) =>
          review.sessionItems(due, 1, seeded(seed))[0]).filter(Boolean);
        if (!built.length || !built.some((round) => asked(round, range))) {
          orphans.push(key);
        }
      }
    }
    ok(orphans.length === 0,
      `${checked} مفتاحاً في المحطات المكتوبة، لكلٍّ تمرينٌ يسأل عن مداه هو`
      + (orphans.length ? ` — **بلا مادّة: ${orphans.slice(0, 6).join('، ')}**`
        + (orphans.length > 6 ? ` و${orphans.length - 6} غيرُها` : '') : ''));
    if (sleeping) dormant(`${sleeping} محطةً لم تولّد جولةً بعد (شاشتُها في جلسةٍ تالية)`);
  }
}

// ————— ٤) لوحة وليّ الأمر: لا مهارةَ مقيسةٌ لا يقرؤها الوالد —————
//
// **بالمهارة لا بالدرجة** (`METHOD.md §٧`): قسما اللوحة (ما يسمعه ويفهمه · ما يفكّه
// ويقرؤه) يُبنيان من سجلّ ليتنر نفسِه لا من عدٍّ ثانٍ يفترق عنه — بندُ الجلسة ٨.
// والوصلةُ محروسةٌ من اليوم.

console.log('\n— لوحة وليّ الأمر: تقرأ من ليتنر نفسِه —');
const parentSrc = src('parent.js');
ok(/progress\.unitStats\(\)/.test(parentSrc),
  'اللوحةُ تقرأ حصيلةَ الوحدات من سجلّ ليتنر الحيّ');
ok(/progress\.dueSkills\(\)/.test(parentSrc) && /progress\.skills\(\)/.test(parentSrc),
  'وعددُ المستحقّ والمسجَّل من المصدر نفسِه (لا رقمٌ يُكتب بيد)');
ok(/راجِع مختصاً/.test(parentSrc),
  'وحدُّ النطاق معلَنٌ فيها: تدريسٌ وقياسٌ لا تشخيص (`METHOD.md §١٣`)');

console.log(fails
  ? `\n${fails} فشل`
  : `\nكل اختبارات «لا تدريسَ بلا قياس» ناجحة${asleep ? ` (و${asleep} نائم بقيدٍ في docs/SEED.md)` : ''}`);
process.exit(fails ? 1 : 0);
