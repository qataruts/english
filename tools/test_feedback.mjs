// حارسُ «بلِّغنا» (أمرُ المالك، ١٥ أغسطس ٢٠٢٦ — نمطُ العائلة):
//   node tools/test_feedback.mjs
//
// ————— بذرةُ المنصة (`docs/SEED.md`) —————
// الأصلُ «اِقْرَأْ» (`read@HEAD` — الجلسة ٩ عندنا)، **وزِيد فيه بابان**: قناةُ
// الوحدة نفسُها (لا تعرف الشبكة) تُقاس مع **جردِ كل ملفٍّ في `app/js/`** لا وحدةٍ
// بعينها، **وسياقُ البلاغ يُجرَد نصّاً** فلا يتسرّب إليه مفتاحُ تقدّمٍ ولا مهارة.
//
// المحروسُ خمسة:
//   ١) البابُ في لوحة وليّ الأمر وحدَها — لا زرَّ بلاغٍ في شاشة طفل.
//   ٢) القناتان: واتساب بالرقم المعتمد، وبريدُ العائلة المرجع `info@mishkat.qa`.
//   ٣) صفرُ شبكةٍ من التطبيق نفسِه — روابطُ `<a>` تُفتح ولا تُجلَب.
//   ٤) **صفرُ بيانات طفل في السياق**: اسمُ التطبيق ونسخةُ القشرة لا غير.
//   ٥) و`parent.js` تبقى **صفرَ عناوينَ خارجية** — وعلّتُه عندنا بنيوية:
//      لا صوتَ طفلٍ في هذا التطبيق أصلاً (`SEED.md §٥·٣`)، والفصلُ يحفظ ذلك.

import { readFileSync, readdirSync } from 'node:fs';

const APP = new URL('../app/', import.meta.url);
const read = (p) => readFileSync(new URL(p, APP), 'utf8');
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('  ✗', m); } else console.log('  ✓', m); };

const parent = read('js/parent.js');
const feedback = read('js/feedback.js');

console.log('\n— القناتان والموضع —');

ok(feedback.includes('wa.me/97433882806'), 'واتساب بالرقم المعتمد (+974 3388 2806)');
ok(feedback.includes('mailto:info@mishkat.qa'), 'والبريدُ المرجع info@mishkat.qa');
ok(/feedbackSection/.test(parent) && feedback.includes('بلِّغنا'),
  'وقسمُ «بلِّغنا» في لوحة وليّ الأمر (خلف بوابتها الحسابية — فعلُ راشدٍ متعمَّد)');

console.log('\n— لا شبكةَ ولا بياناتِ طفل —');

ok(!/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/.test(feedback),
  'والوحدةُ لا تعرف الشبكة — روابطُ فتحٍ لا جلب');
ok(!/https:\/\//.test(parent),
  'وparent.js صفرُ عناوينَ خارجية — أقربُ ملفٍّ إلى بيانات الطفل يبقى نظيفاً بالبناء');

/* **وسياقُ البلاغ يُجرَد نصّاً لا يُوثَق بنيّته**: ما يُملأ به الرابطُ سطرٌ واحد،
   فأيُّ ذكرٍ لتقدّمٍ أو مهارةٍ أو مخزنٍ فيه تسريبٌ لا يراه أحد حتى يقع. والجردُ
   على أسماء المصادر نفسِها: `progress` و`localStorage` ومفاتيحُ التخزين. */
const LEAKS = [
  ['localStorage', /localStorage/],
  ['مخزنُ التقدّم', /listen\.progress/],
  ['وحدةُ التقدّم', /progress\./],
  ['سجلُّ ليتنر', /skills|boxes|stars/],
];
for (const [name, re] of LEAKS) {
  ok(!re.test(feedback), `ولا ${name} في سياق البلاغ (صفرُ بيانات طفل)`);
}
ok(/BRAND/.test(feedback) && !/'اِسْمَعْ'/.test(feedback),
  'واسمُ التطبيق يُقرأ من `ui.js` لا يُكتب هنا (ثنائيةُ الهوية: النصُّ بالاسم العربي)');

console.log('\n— لا بابَ بلاغٍ في شاشة طفل —');

for (const mod of readdirSync(new URL('js/', APP)).sort()) {
  if (mod === 'parent.js' || mod === 'feedback.js') continue;
  const src = read(`js/${mod}`);
  ok(!src.includes('wa.me') && !src.includes('mailto:'),
    `js/${mod}: لا بابَ بلاغٍ فيه`);
}

console.log(fails ? `\n${fails} فشل` : '\nكل اختبارات «بلِّغنا» ناجحة');
process.exit(fails ? 1 : 0);
