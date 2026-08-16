// حارسُ الهوية — «إخوةٌ لا توائم» (`FAMILY.md §٩`):
//   node tools/test_identity.mjs
// يحرس: app/css/app.css app/fonts/** app/sw.js (اللوحُ والخطُّ وقشرةُ `sw` بجردها)
//
// ————— العلّة —————
//
// بذرةُ المنصة تُنسخ من اقرأ، **فيولد التطبيقُ بوجه أخيه**: ورقُه ورقَه، وغالبُه
// غالبَه، وخطُّ علامته خطَّ علامته. وذلك عيبُ ولادةٍ يُصلَح بقرار — لكنّ إصلاحَه
// **لا يُمسِكه اختبارٌ عاديّ**: لونٌ مستعارٌ يعمل عملَ اللون الصحيح تماماً، والتطبيقُ
// يفتح ويعمل ويمرّ حرّاسُه كلُّهم وهو يلبس وجهَ أخيه. فالعيبُ يُرى يومَ تُصفّ
// الأيقونتان على شاشة آيبادٍ واحدة أمام طفل — لا في سَوقةِ فحص.
//
// وهذا الحارس يقلب القاعدة: **الوجهُ المستعار يحمرّ يومَ يُنسى لا يومَ يُلاحَظ**.
//
// ————— وبابٌ ثانٍ: **حكمُ المالك لا يُنسَخ منه إلا نصُّه** —————
//
// اللوحُ عندنا **قرارُ مالكٍ بلفظه** (`docs/REVIEW_IDENTITY.md` البند ٢: «توتيُّ
// الاحتفال `#B0326E` غالباً لمسار السمع، ودرجتُه العميقة `#7E2450` لمسار الحرف»)،
// فلا يكفي أن نخالف اقرأ: يُقابَل اللوحُ **بالحكم نفسِه** — فقيمةٌ تُصقَل بذوق جلسةٍ
// بعد اليوم تحمرّ، ويعود صاحبُ القرار إلى قراره.
//
// ————— المرجعُ مبصوم، والبصمةُ تُقابَل إن وُجد المرجع —————
//
// قيمُ اقرأ أدناه **منقولةٌ من التزامٍ مبصوم** (`read@aee22b6` — آخر التزامٍ مسّ
// لوحَه)، لا من شجرة عمله: المرجعُ الحيّ فيه جلساتٌ تعمل وشجرتُه قد لا تستقرّ،
// والبصمةُ وحدَها هي المرجع (قاعدةُ النقل — سنّةُ احسب).
//
// **وبابٌ أخيرٌ يقابل البصمةَ نفسَها**: إن وُجد مستودعُ اقرأ بجوارنا (وهو مجلدُ مرجعٍ
// في ورشتنا) قُرئ منه ذلك الالتزام وقوبلت القيمُ المكتوبة هنا بما فيه — فلا تبلى
// بصمةٌ صامتةً ولا تُكتب قيمةُ مرجعٍ من الذاكرة. وإن غاب المستودع **نام هذا الباب
// وحدَه** وأعلن نومَه، والأبوابُ قبله تعمل بلا مرجعٍ حاضر.

import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const css = readFileSync(new URL('app/css/app.css', ROOT), 'utf8');

// ————— مرجعُ اقرأ المبصوم —————
const READ = {
  commit: 'aee22b6',
  file: 'app/css/app.css',
  vars: {
    '--paper': '#FAF4E8',            // ورقُه الدافئ
    '--paper-deep': '#F3EAD8',
    '--star': '#DFAE3F',             // غالبُه: لونُ الفعل الرئيس (ذهبيّ)
    '--brand-1': '#F7B733',          // سُلَّمُ علامته (برتقاليّ)
    '--brand-2': '#F5A524',
    '--brand-3': '#E8590C',
    '--font-brand': "'Marhey', 'Baloo Bhaijaan 2', 'Geeza Pro', sans-serif",
  },
};

// ————— حكمُ المالك بلفظه (`docs/REVIEW_IDENTITY.md`، ١٦ أغسطس ٢٠٢٦) —————
const OWNER = {
  '--accent-listen': '#B0326E',      // البند ٢: توتيُّ الاحتفال — غالبُ مسار السمع
  '--accent-letter': '#7E2450',      // البند ٢: درجتُه العميقة — مسارُ الحرف
  '--brand-2': '#B0326E',            // البند ٣: أرضيةُ الأيقونة هي التوتيّ نفسُه
};
const OWNER_FONTS = {
  '--font-brand': 'Caveat',          // البند ٤: خطُّ العلامة Caveat Bold
  '--font-en': 'Andika',             // البند ٦: خطُّ مادّة الإنكليزية
};

/** قيمةُ متغيّرٍ من اللوح — أوّلُ إعلانٍ له (جذرُ الوضع النهاريّ). */
function cssVar(text, name) {
  const m = text.match(new RegExp(`^\\s*${name}:\\s*([^;]+);`, 'm'));
  return m ? m[1].trim() : null;
}

/** أوّلُ عائلةٍ في تراص الخطوط — هي الخطّ، وما بعدها احتياط. */
const firstFamily = (stack) => (stack || '').split(',')[0].trim().replace(/^['"]|['"]$/g, '');

/** درجةُ اللون (٠–٣٦٠) من `#rrggbb` — بها يُقاس بُعدُ غالبٍ عن غالب. */
function hue(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (!d) return 0;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}

/** أقصرُ قوسٍ بين درجتَي لون (٠–١٨٠) — فالأحمرُ ٥° والأحمرُ ٣٥٥° لونٌ واحد. */
function hueGap(a, b) {
  const d = Math.abs(hue(a) - hue(b)) % 360;
  return d > 180 ? 360 - d : d;
}

const MIN_GAP = 40;      // ما دون ذلك عينُ طفلٍ لا تفرّق بين الغالبَين

const checks = [];
const ok = (good, msg) => checks.push([good, msg]);

// ————— ١) اللوحُ هو حكمُ المالك بعينه —————
for (const [name, want] of Object.entries(OWNER)) {
  const ours = cssVar(css, name);
  ok(!!ours && ours.toUpperCase() === want.toUpperCase(),
    `${name}: ${ours || 'لا شيء'} — وحكمُ المالك ${want}`);
}
for (const [name, want] of Object.entries(OWNER_FONTS)) {
  const ours = firstFamily(cssVar(css, name));
  ok(ours === want, `${name}: «${ours || 'لا شيء'}» — وحكمُ المالك «${want}»`);
}

// ————— ٢) الورقُ يخالف ورقَ اقرأ —————
// (الورقُ والحبرُ من عائلةٍ واحدة عمداً — دفترُ أطفالٍ دافئ — لكن **القيمةَ لنا**:
//  ورقٌ مستنسخٌ حرفاً بحرف علامةُ نسخٍ نُسي لا قرارِ لوحٍ اتُّخذ.)
for (const name of ['--paper', '--paper-deep']) {
  const ours = cssVar(css, name);
  ok(!!ours && ours.toUpperCase() !== READ.vars[name].toUpperCase(),
    `${name}: ورقُنا ${ours} يخالف ورقَ اقرأ ${READ.vars[name]}`);
}

// ————— ٣) الغالبُ يخالف غالبَ اقرأ **بُعداً تراه العين** —————
// لا يكفي أن تختلف القيمة: الميثاق «لا يتشارك تطبيقان لوناً غالباً»، وتوتيٌّ يفارق
// ذهبياً بدرجةٍ واحدة يمرّ في مقابلةِ نصوصٍ ويسقط في صفّ الأيقونات.
for (const name of ['--star', '--brand-1', '--brand-2', '--brand-3']) {
  const ours = cssVar(css, name);
  const gap = ours && /^#[0-9a-f]{6}$/i.test(ours) ? hueGap(ours, READ.vars[name]) : null;
  ok(gap !== null && gap >= MIN_GAP,
    `${name}: غالبُنا ${ours} يبعد عن ${READ.vars[name]} بـ${gap === null ? '—' : Math.round(gap)}°`
    + ` (الحدّ ${MIN_GAP}°)`);
}

// ————— ٤) خطُّ العلامة ليس خطَّ علامة اقرأ —————
// «وخطُّ Marhey لعلامة اقرأ وحدَها فلا يُورَّث بالنسخ» — والاسمُ يُقرأ من مرجعه
// المبصوم لا يُكتب هنا بيد، فلو بدّلت اقرأ خطَّها يوماً بقي البابُ يقيس المعنى.
const theirs = firstFamily(READ.vars['--font-brand']);
const ourFont = firstFamily(cssVar(css, '--font-brand'));
ok(!!ourFont && ourFont !== theirs,
  `خطُّ علامتنا «${ourFont || 'لا شيء'}» يخالف خطَّ علامة اقرأ «${theirs}»`);

// ولا يبقى منه **حِملٌ** في الشجرة: ملفٌّ يُحمَّل أو يُخزَّن في القشرة وزنٌ ميتٌ على
// جهاز طفل. والمقيسُ **الحِملُ لا الاسم**: ذكرُ الخطّ المهجور في تعليقٍ يشرح لماذا
// هُجر أثرٌ من آثار القرار لا بقيّةٌ منه — فيُطلَب اسمُه في موضع تحميلٍ حقيقيّ
// (`url()` أو مسارٌ في قائمة القشرة) أو إعلانِ وجهٍ، لا في نصٍّ يُقرأ.
if (ourFont && ourFont !== theirs) {
  const sw = readFileSync(new URL('app/sw.js', ROOT), 'utf8');
  const loads = new RegExp(`['"(][^'")]*${theirs}-[\\w-]*\\.woff2`);
  const declares = new RegExp(`font-family:\\s*['"]${theirs}['"]`);
  const stray = [
    ['app.css', loads.test(css) || declares.test(css)],
    ['app/sw.js', loads.test(sw)],
    [`app/fonts/${theirs}-arabic.woff2`, existsSync(new URL(`app/fonts/${theirs}-arabic.woff2`, ROOT))],
  ].filter(([, hit]) => hit).map(([where]) => where);
  ok(stray.length === 0,
    `ولا حِملَ لخطّ اقرأ في شجرتنا${stray.length ? ` — بقي في: ${stray.join(' · ')}` : ''}`);
}

// **وخطّانا موجودان حِملاً لا اسماً**: خطُّ العلامة وخطُّ المادّة يُعلَنان في اللوح
// ويُحمَّلان من `app/fonts/` — فلا يُقَرّ خطٌّ ثم يُنسى ملفُّه فيُرسَم بخطّ الجهاز.
for (const [name, family] of Object.entries(OWNER_FONTS)) {
  const face = css.match(new RegExp(`fonts/${family}-(\\w+)\\.woff2`));
  const file = face ? `${family}-${face[1]}.woff2` : '';
  ok(!!file && existsSync(new URL(`app/fonts/${file}`, ROOT)),
    `وملفُّ ${name} في الشجرة (${file || 'لا مِلفَّ يُحمَّل'})`);
}

// ————— ٥) البصمةُ تُقابَل بمرجعها (نائمٌ يستيقظ ذاتياً) —————
const readRepo = fileURLToPath(new URL('../read/', ROOT));
const hasRepo = existsSync(readRepo);
let asleep = null;
if (!hasRepo) {
  asleep = 'مستودعُ اقرأ ليس بجوارنا — تُقابَل البصمةُ يومَ يوجد';
} else {
  const show = spawnSync('git', ['-C', readRepo, 'show', `${READ.commit}:${READ.file}`],
    { encoding: 'utf8' });
  if (show.status !== 0) {
    asleep = `الالتزام ${READ.commit} غيرُ موجودٍ في مستودع اقرأ — لا مقابلة`;
  } else {
    const drift = Object.entries(READ.vars)
      .filter(([name, value]) => cssVar(show.stdout, name) !== value)
      .map(([name]) => name);
    ok(drift.length === 0,
      `بصمةُ المرجع صادقة: قيمُ اقرأ أعلاه هي قيمُ \`read@${READ.commit}\` نفسُها`
      + (drift.length ? ` — تخلّفت: ${drift.join(' · ')}` : ''));
  }
}

for (const [good, msg] of checks) console.log((good ? '  ✓ ' : '  ✗ ') + msg);
if (asleep) console.log(`  ⏸ نائم، يستيقظ ذاتياً — ${asleep}`);

const bad = checks.filter(([good]) => !good).length;
console.log('\n' + (bad === 0
  ? `الهوية لنا لا لأخينا: ${checks.length} باباً${asleep ? ' (وبابٌ نائم)' : ''}.`
  : `${bad} إخفاق — وجهُ اقرأ ما زال علينا (ميثاق الهوية، FAMILY.md §٩).`));
process.exit(bad === 0 ? 0 : 1);
