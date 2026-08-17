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

const c = await import(new URL('app/js/curriculum.js', ROOT));

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
  raised: () => c.RAISED.length,
  grades: () => c.GRADES.length,
  graphemes: () => c.GRADES.flatMap((g) => g.symbols).length,
  phonemes: () => c.PHONEMES.length,
  tricky: () => c.GRADES.flatMap((g) => g.tricky).length,
  decodable: () => c.GRADES.flatMap((g) => g.words).length,
  stories: () => stations.filter((s) => s.type === 'story').length,
  returns: () => stations.filter((s) => String(s.part).endsWith('-again')).length,
  coupled: coupledCount,
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

const used = new Set(claims.map((claim) => claim.name));
const idle = Object.keys(FIGURES).filter((name) => !used.has(name));
console.log(`  · ${used.size} مصدراً مستعمَلاً في الصفحات، و${idle.length} محسوباً `
  + 'ينتظر موضعَه');

console.log(fails ? `\n${fails} فشل` : '\nأرقامُ الصفحات كلُّها مقيسةٌ من البيانات');
process.exit(fails ? 1 : 0);
