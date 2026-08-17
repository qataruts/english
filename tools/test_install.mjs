// حارسُ بابِ التثبيت (`app/js/install.js`):
//   node tools/test_install.mjs
//
// ————— بذرةُ المنصة (`docs/SEED.md §٦`) —————
// الأصلُ «اِقْرَأْ» (`read@HEAD`) — وُلد هناك من أسئلة المالك (١١ أغسطس ٢٠٢٦)،
// ونُقل معه حارسُه يومَ نُقلت وحدتُه (الجلسة ٩). **وزِيد بابان**: مفتاحُ التذكّر
// بسابقتنا نحن (لا يُسكِت شريطَ أخينا على منفذٍ مشترك)، واسمُ التطبيق يُقرأ من
// `ui.js` لا يُكتب هنا (ثنائيةُ الهوية).
//
// المحروسُ ثلاثة، وكلُّها من أسئلة المالك التي وُلد بها الشريط:
//   ١) **الرسالةُ الصحيحة لكل جهاز** — قرارُ العرض دالّةٌ نقيّة تُفحَص بجدول حالات:
//      زرٌّ حقيقيّ حيث يُمسَك حدثُ التثبيت، وخطوتا سفاري على iOS، وصمتٌ حيث لا طريق.
//   ٢) **لا يظهر في التطبيق المثبَّت** — `standalone` يُسكِته، و`appinstalled` يُسكِته
//      أبداً، والإغلاقُ يُسكِته أسبوعاً (فلا يصير الشريطُ إزعاجاً يعلّم تجاهلَه).
//   ٣) **بنيوياً**: الوحدةُ لا تعرف الشبكة، ومركَّبةٌ في القشرة والموجّه، ومعفاةٌ في
//      وضع المعاينة (شريطان فوق الشاشة ضجيجٌ على المقيّم).

import { readFileSync } from 'node:fs';

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg); };

const { installState } = await import('../app/js/install.js');

console.log('\n١. الرسالةُ الصحيحة لكل جهاز (جدول الحالات)');

const UA = {
  iphoneSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  ipadDesktopUA: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  iphoneChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0 Mobile/15E148 Safari/604.1',
  macDesktop: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  androidChrome: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36',
};
const base = { standalone: false, touchPoints: 0, promptReady: false, memo: {}, now: 1000000000000 };
const at = (over) => installState({ ...base, ...over });

ok(at({ standalone: true, promptReady: true }) === 'hidden',
  'التطبيقُ المثبَّت (standalone): لا شريطَ أبداً — ولو كان الحدثُ جاهزاً');
ok(at({ memo: { installed: true }, promptReady: true }) === 'hidden',
  'وبعد appinstalled: صمتٌ دائم');
ok(at({ ua: UA.androidChrome, promptReady: true, touchPoints: 5 }) === 'button',
  'أندرويد/كروم والحدثُ مُمسَك: زرُّ «ثبّت الآن» الحقيقيّ');
ok(at({ ua: UA.iphoneSafari, touchPoints: 5 }) === 'ios',
  'آيفون سفاري: خطوتا المشاركة والإضافة');
ok(at({ ua: UA.ipadDesktopUA, touchPoints: 5 }) === 'ios',
  'آيباد iPadOS (يتنكّر بهيئة Macintosh): يفضحه تعدّدُ اللمس ⇒ خطوتا سفاري');
ok(at({ ua: UA.iphoneChrome, touchPoints: 5 }) === 'ios-other',
  'كروم على آيفون: «افتح في سفاري أولاً» — فالتثبيتُ على iOS منه وحدَه');
ok(at({ ua: UA.macDesktop, touchPoints: 0 }) === 'hidden',
  'حاسوبُ ماك بلا حدثٍ ولا لمس: صمتٌ — لا نعِد بما لا نملك طريقَه');
ok(at({ ua: UA.androidChrome, touchPoints: 5 }) === 'hidden',
  'أندرويد قبل أن يجهز الحدث: صمتٌ لا تعليماتٌ يدوية تسبق الزرّ');

console.log('\n٢. الرقادُ بعد الإغلاق — أسبوعٌ ثم عودةٌ لطيفة');

const DAY = 86400000;
ok(at({ ua: UA.iphoneSafari, touchPoints: 5, memo: { dismissedAt: base.now - 3 * DAY } }) === 'hidden',
  'أُغلق قبل ٣ أيام: ما زال راقداً');
ok(at({ ua: UA.iphoneSafari, touchPoints: 5, memo: { dismissedAt: base.now - 8 * DAY } }) === 'ios',
  'وبعد ٨ أيام: يعود بلطف');
ok(at({ promptReady: true, memo: { dismissedAt: base.now - 8 * DAY } }) === 'button',
  'والزرُّ كذلك يعود بعد رقاده');

console.log('\n٣. البنية');

const src = readFileSync(new URL('../app/js/install.js', import.meta.url), 'utf8');
ok(!/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/.test(src),
  'الوحدةُ لا تعرف الشبكة — عرضٌ وقرارٌ محليان صرفان');
ok(/beforeinstallprompt/.test(src) && /preventDefault/.test(src) && /appinstalled/.test(src),
  'وتُمسك حدثَ التثبيت وتصغي لنجاحه');

// **ومفتاحُ التذكّر بسابقتنا** (زيادةُ هذا التطبيق — درسُ سابقة التخزين في `sw.js`):
// أربعةُ تطبيقاتٍ من بذرةٍ واحدة تُختبَر على منفذٍ واحد، ومفتاحٌ موروثٌ باسم أخينا
// يجعل إغلاقَ شريطِه يُسكِت شريطَنا أسبوعاً — عيبٌ لا يظهر إلا على جهازِ فحصٍ واحد.
ok(/const KEY = 'listen\.install\./.test(src),
  'ومفتاحُ تذكّره بسابقتنا `listen.` (لا يشاركه إخوتُنا مخزنَ متصفّحٍ واحد)');
ok(/BRAND/.test(src) && !/«اِسْمَعْ»/.test(src.replace(/^\/\/.*$/gm, '')),
  'واسمُ التطبيق في جملته يُقرأ من `ui.js` (ثنائيةُ الهوية: النصُّ بالاسم العربي)');

const mainSrc = readFileSync(new URL('../app/js/main.js', import.meta.url), 'utf8');
ok(/if \(!progress\.PREVIEW\) install\.mount\(\);/.test(mainSrc),
  'ومركَّبةٌ في الموجّه — ومعفاةٌ في وضع المعاينة');

const swSrc = readFileSync(new URL('../app/sw.js', import.meta.url), 'utf8');
ok(swSrc.includes("'js/install.js'"),
  'وفي قشرة عامل الخدمة — فالشريطُ يعمل دون إنترنت كسائر التطبيق');

const welcome = readFileSync(new URL('../app/welcome/index.html', import.meta.url), 'utf8');
ok(!/install\.js/.test(welcome) && !/<script/.test(welcome),
  'وصفحةُ التعريف لم تلمسها — صفرُ جافاسكربت فيها عهدٌ قائم');

// ————— ٤. بطاقةُ أول تشغيل: «ثبّت أولاً ثم امتحن» (الجلسة ب٢) —————
//
// **العلّة** (بلاغ `install-before-exam-first-run-card`): مخزنُ المثبَّت مستقلٌّ عن
// سفاري على iOS، فامتحانُ لحاقٍ في المتصفّح **يضيع بالتثبيت بعده**. والمحروسُ ثلاثة:
//   ١) **جدولُ حالاتٍ كامل** — رحلةٌ بكرٌ وحدَها، وفي المتصفّح دعوةُ التثبيت وحدَها.
//   ٢) **لا تحبس أحداً** — «لاحقاً» يُغلقها أبداً (لا أسبوعاً)، وأولُ نجمةٍ تُغيّبها.
//   ٣) **بنيوياً** — بطاقةُ والدٍ في صدر الصفحة لا زرٌّ في شاشة الطفل، وزرُّ الامتحان
//      يفتح **بوابةَ اللوحة** لا الامتحانَ مباشرة، ومعفاةٌ في المعاينة كأخيها.

console.log('\n٤. بطاقةُ أول تشغيل — «ثبّت أولاً ثم امتحن»');

const { firstRunState } = await import('../app/js/install.js');
const virgin = { standalone: false, stars: 0, attempts: 0, memo: {} };
const card = (over) => firstRunState({ ...virgin, ...over });

ok(card({}) === 'install',
  'رحلةٌ بكرٌ في المتصفّح: **دعوةُ التثبيت وحدَها** — ولا تُعرَض دعوةُ امتحانٍ يضيع');
ok(card({ standalone: true }) === 'exam',
  'ومن التطبيق المثبَّت: دعوةُ امتحان اللحاق — القياسُ يبقى حيث يمشي الطفل');
ok(card({ standalone: true, stars: 1 }) === 'hidden'
  && card({ stars: 1 }) === 'hidden',
  'وبأول نجمةٍ تغيب — الرحلةُ بدأت فلا دعوةَ إلى بدايةٍ أخرى');
ok(card({ standalone: true, attempts: 1 }) === 'hidden',
  'وبأول محاولةٍ كذلك — ولو لم يكسب نجمةً بعد');
ok(card({ standalone: true, memo: { firstRunDone: true } }) === 'hidden'
  && card({ memo: { firstRunDone: true } }) === 'hidden',
  '**و«لاحقاً» يُغلقها أبداً** — دعوةٌ مرّةً واحدة لا مطالبةٌ تتكرّر');
ok(card({ memo: { dismissedAt: base.now } }) === 'install',
  'ورقادُ شريط التثبيت لا يُسكِتها — بابان لا باب، ولكلٍّ ذاكرتُه');

ok(/remember\(\{ firstRunDone: true \}\)[\s\S]{0,180}go\('#\/parent'\)/.test(src),
  'وزرُّ الامتحان يفتح **بوابةَ اللوحة** لا الامتحانَ مباشرة — فلا يفتحه طفلٌ على نفسه');
const paintSrc = src.match(/export function paintFirstRun[\s\S]*?\n\}/)?.[0] || '';
ok(/document\.body\.prepend\(card\)/.test(paintSrc) && !/\.map\b|screen/.test(paintSrc),
  'وموضعُها صدرُ الصفحة لا داخلُ الخريطة — بطاقةُ والدٍ لا زرٌّ في شاشة الطفل');
ok(/if \(!progress\.PREVIEW\) \{\s*\n\s*install\.paintFirstRun\(\{ stars: progress\.totalStars\(\), attempts: progress\.skills\(\)\.length \}\)/
  .test(mainSrc),
  'وتُقاس عند كل تصييرٍ بعددَي التقدّم — ومعفاةٌ في المعاينة كأخيها');

console.log(fails ? `\n${fails} فشل` : '\nكل اختبارات باب التثبيت ناجحة');
process.exit(fails ? 1 : 0);
