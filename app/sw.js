// عامل الخدمة — التطبيق يعمل دون إنترنت (عهدُ العائلة: PWA يعمل بلا شبكة).
//
// ————— بذرةُ المنصة (`docs/SEED.md §٢`) —————
// المنطقُ من «اِقْرَأْ» v20 عبر «اِحْسِبْ» بدروسه كلِّها: مخزنُ صوتٍ ثابتُ الاسم يعبر
// النسخ، وجلبٌ مدفَّعٌ معدودُ الإخفاق لا يُبتلَع، وشفاءٌ عند أول اتصال، وإبلاغُ
// النوافذ بتقدّم الخزن، ولا يُهدَم مخزونٌ كاملٌ لأجل ناقص. والمبدَّلُ **سابقةُ
// التخزين** وقائمةُ القشرة وحدَهما.
//
// استراتيجيتان لا ثالثة:
//   • الهيكل (HTML/CSS/JS/الفهارس): اعرض المخزون فوراً وحدِّثه في الخلفية
//     (stale-while-revalidate) — فتحٌ فوريّ، والتحديث يظهر في الفتحة التالية.
//   • الصوت (mp3): من المخزون دائماً — **بالرابط الموسوم ببصمة محتواه**.
//
// **ولماذا الوسم؟** اسم ملف الصوت sha1 **نصّه** لا محتواه، فاستبدال الصوت تحت
// المفتاح نفسه (تسجيلٌ أفضل، انتقاءُ أداء، **أو صوتٌ إنكليزيٌّ يُبدَّل بعد أذن
// المالك**) لا يغيّر الرابط — والجهاز الذي خزّن النسخة القديمة يبقى عليها إلى الأبد،
// فيُسمع النصُّ الواحد بصوتين بحسب تاريخ أول طلبٍ لكل جهاز (بلاغُ المالك في اقرأ،
// ٥ أغسطس ٢٠٢٦). فيُطلَب `<key>.mp3?v=<بصمة البايتات>` من `audio/versions.json`،
// وهنا **يُخزَن بالرابط الموسوم ويُنظَّف الوسم الأقدم لذلك الملف وحده** — فتبديل
// ملفٍّ واحد لا يُسقِط مخزون البقية.
//
// **وسابقةُ التخزين خاصّةٌ بهذا التطبيق** (`listen-*`): أربعةُ تطبيقاتٍ من بذرةٍ
// واحدة قد تُنشَر على نطاقٍ واحد أو تُختبَر على منفذٍ واحد، وسابقةٌ مشتركة تجعل
// `activate` أحدِها يكنس مخزونَ أخيه. والكنسُ أدناه مقيَّدٌ بسابقتنا وحدها.
//
// **وكانت `english-*`** (وصفُ المشروع لا اسمُ المنتج) فصارت `listen-*` يومَ وقعت
// الهوية (`listen.mishkat.qa` — جلسةُ الهوية هـ). ويكنس `activate` **السابقتين
// معاً**: اليتيمةُ القديمة لا تُترك على جهازٍ فُتح فيه التطبيقُ قبل اليوم (أجهزةُ
// تطويرٍ وفحصٍ لا غير — **لا طفلَ استعمله بعدُ**، فلا تقدُّمَ يُفقَد ولا هجرةَ
// بيانات تُكتب: `progress.js` يبدأ من مفتاحه الجديد).
//
// **وبنكُ الصوت بدأ يُولَّد** (الجلسة ص — حُسم ق١ وق٢ بحكم المالك السابع: لكنةٌ
// أمريكية بصوت Leda عبر خطّ Gemini، `REVIEW_IDENTITY.md`): فدخل `audio/manifest.json`
// و`audio/versions.json` قائمةَ القشرة أعلاه **كما وَعَد هذا السطرُ يومَ كُتب** —
// ولم يُعدَّل سطرُ منطقٍ واحد في الخزن. **والبنكُ يُبنى مرحلةً مرحلة** (`METHOD.md
// §١٠`)، و`precacheAudio` تحتمل نقصَه كما احتملت غيابَه: ما ليس في الفهرس لا يُطلَب،
// وما فيه يُجلَب الناقصُ منه وحدَه.
//
// **وكذلك فهرسُ الرموز** (`emoji/index.json`): يجلبه `tools/fetch_twemoji.py` يومَ
// يُكتب الرصيدُ السمعيّ بصوره (الجلسة ١) — و`precacheEmoji` تحتمل غيابَه اليوم.
//
// عند تغيير أي ملف من ملفات الهيكل: ارفع VERSION فيُمحى مخزون **القشرة** القديم.
// ويحرس `tools/test_pwa.mjs` أن قائمة SHELL لا تنسى ملفاً موجوداً في `app/` ولا
// تَعِد بملفٍ غير موجود.
const VERSION = 'v18';
const SHELL_CACHE = `listen-shell-${VERSION}`;
const AUDIO_CACHE = 'listen-audio';       // ثابتٌ عمداً — لا يحمل VERSION
const KEEP = [SHELL_CACHE, AUDIO_CACHE];
// سابقاتُ ما نملك: الحاليةُ وسابقةُ ما قبل الهوية (يتيمةٌ تُكنَس، انظر أعلاه).
const OURS = ['listen-', 'english-'];

const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/app.css',
  'fonts/NotoNaskhArabic-arabic.woff2',
  'fonts/NotoNaskhArabic-latin.woff2',
  'fonts/BalooBhaijaan2-arabic.woff2',
  'fonts/BalooBhaijaan2-latin.woff2',
  'fonts/Andika-latin.woff2',
  'fonts/Caveat-latin.woff2',
  'js/audio.js',
  'js/cluster.js',
  'js/contrast.js',
  'js/curriculum.js',
  'js/ear.js',
  'js/figures.js',
  'js/gate.js',
  'js/feedback.js',
  'js/grade.js',
  'js/install.js',
  'js/main.js',
  'js/parent.js',
  'js/placement.js',
  'js/progress.js',
  'js/quiz.js',
  'js/registry.js',
  'js/review.js',
  'js/station.js',
  'js/story.js',
  'js/support.js',
  'js/tpr.js',
  'js/ui.js',
  // فهرسُ الرموز في القشرة، و**ملفاتُها من فهرسها** (`precacheEmoji` أدناه): كُتب
  // الرصيدُ المصوَّر في `curriculum.js` (الجلسة ١) فوُجد الفهرس، ولا يدخل مخزونَ
  // القشرة رمزٌ بسطرٍ يدويّ.
  'emoji/index.json',
  // **وبيانا الصوت كذلك** (الجلسة ص — وُلِّد البنكُ فدخلا كما نصّ رأسُ هذا الملف):
  // الفهرسُ وبيانُ البصمات في القشرة **ليُقرآ دون إنترنت** — فجهازٌ مفصولٌ يعرف ما
  // يجب أن يملك ويقيس تمامَه (`audioComplete`)، ولا يدخل المخزونَ ملفٌّ صوتيّ بسطرٍ
  // يدويّ هنا: `precacheAudio` تجلبها **من الفهرس** كما تجلب `precacheEmoji` رموزَها.
  'audio/manifest.json',
  'audio/versions.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png',
];

// ملفات الصوت: مفتاحٌ من ١٢ خانة سُداسيّة عشرية (sha1 نصّه).
const AUDIO_RE = /\/audio\/[0-9a-f]{12}\.mp3$/;

// مسار الصفحة التعريفية (`app/welcome/` — الجلسة ٩) — ليست من التطبيق: لا في SHELL
// ولا في المخزون ولا في ردّ التنقّل. مشتقٌّ من النطاق فيصحّ في أي مجلدٍ نُشر فيه.
const WELCOME = new URL('welcome/', self.registration.scope).pathname;

const json = (path) => fetch(new URL(path, self.registration.scope))
  .then((r) => (r.ok ? r.json() : null))
  .catch(() => null);

/** خزن أيقونات الرموز **من فهرسها** لا من قائمة يدوية (مهمة «أيقونات لا إيموجي»).
 *
 *  رمزٌ جديد في المنهج غداً يجلبه `tools/fetch_twemoji.py` فيدخل المخزون بلا سطرٍ
 *  في هذا الملف. وغيابُ الفهرس اليوم (الجلسة ١ تنشئه) لا يُخفق شيئاً. */
async function precacheEmoji() {
  const index = await json('emoji/index.json');
  const cache = await caches.open(SHELL_CACHE);
  await Promise.all(Object.keys(index?.files || {}).map((key) =>
    cache.add(new URL(`emoji/${key}.svg`, self.registration.scope)).catch(() => {})));
}

/** رابط ملف صوتٍ باسمه على القرص، موسوماً ببصمة محتواه (بلا بصمة: الرابط كما هو). */
function audioUrl(stem, tags) {
  const href = new URL(`audio/${stem}.mp3`, self.registration.scope).href;
  return tags[stem] ? `${href}?v=${tags[stem]}` : href;
}

/** حجم الدفعة: آلافُ الطلبات المتوازية في `install` قطيعٌ يخنق الشبكة على جهازٍ
 *  منزليّ ويزاحم أصواتَ الطفل نفسِه وهو يلعب. ستَّ عشرةَ في النفَس تكفي ولا تخنق. */
const AUDIO_BATCH = 16;

/** ترتيب الأولوية بلا أن يعرف عاملُ الخدمة أين بلغ الطفل (تقدّمُه في تخزين الصفحة،
 *  ولا طريق من هنا إليه ولا يُراد): **ما سمعه الطفل مخزونٌ سلفاً** (يخزنه `cacheFirst`)
 *  فيسقط من قائمة الجلب أصلاً؛ والباقي يُرتَّب بأثر المنهج نفسِه في النصّ: المنهج
 *  يصعد من الكلمة المفردة إلى تعليمة التمرين إلى جملة «الآن وهنا»، **وطولُ النصّ هو
 *  أثرُ ذلك الصعود** — فالأقصر أوّلُ ما يحتاجه، والأطول أبعدُه. فإن انقطع التخزين كان
 *  الناقصُ أبعدَ ما يحتاج. */
function audioOrder(generated) {
  return Object.entries(generated || {})
    .map(([stem, text]) => ({ stem, far: [...String(text)].length }))
    .sort((a, b) => (a.far - b.far) || (a.stem < b.stem ? -1 : 1))
    .map((e) => e.stem);
}

/** خزن الأصوات كلها من بيانها — بعدها لا يحتاج التطبيق شبكةً البتّة.
 *  ثم **تُكنَس الأوسمة الغابرة**: كل مخزونٍ ليس في المتوقَّع اليوم (وسمٌ أقدم لملفٍ
 *  استُبدل، أو رابطٌ بلا وسم خُزن قبل قراءة البصمات) يُحذف — فلا يبقى في الجهاز أثرٌ
 *  للصوت القديم يُسمَع من طريقٍ آخر.
 *
 *  **ولا يُجلَب إلا الناقص**: `cache.add` يجلب من الشبكة دائماً وإن كان الملف مخزوناً،
 *  فبه كانت الترقيةُ تعيد تنزيل الصوت كلِّه ولو ثبت اسمُ المخزن.
 *
 *  **والإخفاق يُعدّ ولا يُبتلَع**: `catch(() => {})` كان يُخفي تجاوزَ حصة التخزين
 *  فتفشل ملفات ويصمت الصوت خارج الشبكة بلا خبر. فإن أخفق شيءٌ **لا نكنس**: القديمُ
 *  الصالح خيرٌ من فراغٍ في أذن الطفل. */
async function precacheAudio() {
  const cache = await caches.open(AUDIO_CACHE);
  const [generated, versions] = await Promise.all([
    json('audio/manifest.json'), json('audio/versions.json'),
  ]);
  const tags = { ...(versions || {}) };

  const urls = audioOrder(generated).map((stem) => audioUrl(stem, tags));
  const have = new Set((await cache.keys()).map((request) => request.url));
  const missing = urls.filter((url) => !have.has(url));

  let failed = 0;
  const total = urls.length;
  let done = total - missing.length;
  await report({ stored: done, total, busy: missing.length > 0 });
  for (let i = 0; i < missing.length; i += AUDIO_BATCH) {
    // واحداً واحداً داخل الدفعة: ملفٌ ناقص لا يُسقِط الدفعة كلها (بخلاف cache.addAll)
    const batch = await Promise.all(missing.slice(i, i + AUDIO_BATCH)
      .map((url) => cache.add(url).then(() => true, () => false)));
    failed += batch.filter((ok) => !ok).length;
    done += batch.filter(Boolean).length;
    await report({ stored: done, total, busy: true });   // **بعد كل دفعة**: تقدّمٌ حقيقيّ
  }
  await report({ stored: done, total, busy: false, failed });
  if (failed) console.warn(`[sw] تعذّر خزن ${failed} ملفاً صوتياً من ${missing.length}`);

  if (!generated) return { complete: false, failed, missing: missing.length };
  if (failed) return { complete: false, failed, missing: missing.length };
  const wanted = new Set(urls);
  const stale = (await cache.keys()).filter((request) => !wanted.has(request.url));
  await Promise.all(stale.map((request) => cache.delete(request)));
  return { complete: true, failed: 0, missing: 0 };
}

/** هل المخزونُ الصوتيّ تامٌّ الآن؟ — يُحسب من البيان والمخزن، لا يُؤخذ من ذاكرة
 *  نسخةٍ سابقة من العامل: العاملُ يُنهى ويُبعَث بين `install` و`activate`، فحالةٌ
 *  محفوظةٌ في متغيّرٍ لا يُوثَق بها في قرارٍ يُتلف مخزوناً. */
async function audioComplete() {
  const [generated, versions] = await Promise.all([
    json('audio/manifest.json'), json('audio/versions.json'),
  ]);
  if (!generated) return false;                 // بيانٌ لم يصل: لا نحكم بالتمام
  const urls = audioOrder(generated).map((stem) => audioUrl(stem, { ...(versions || {}) }));
  const cache = await caches.open(AUDIO_CACHE);
  const have = new Set((await cache.keys()).map((request) => request.url));
  return urls.every((url) => have.has(url));
}

/* **شفاءُ المخزون عند أول اتصال** (بلاغُ المالك في اقرأ، ١٣ أغسطس ٢٠٢٦): كان
   التنزيلُ يقع مرّةً واحدة في `install`؛ فجهازٌ حُذف تطبيقُه وأُعيد تثبيته **وهو
   مفصولٌ عن الشبكة** لا يخزّن ملفاً واحداً، ولا تعود المحاولةُ إلا بترقيةٍ جديدة —
   فيصمت الصوتُ ولا يُصلحه إلا صدفة. فصارت المحاولةُ تتكرّر عند كل فتحةٍ للتطبيق،
   مكبوحةً بمهلة، ولا تجلب إلا الناقص. */
let syncing = false;
let healed = false;             // مرّةً في عمر العامل (وكلُّ بعثٍ فرصةٌ جديدة)
const HEAL_AFTER = 10000;       // عشرُ ثوانٍ: تكفي لتمضي الفتحةُ للطفل، ولا تطول
                                // حتى يُنهي iOS العاملَ قبل أن يبدأ الشفاء أصلاً

async function syncAudio() {
  if (syncing) return;
  syncing = true;
  try {
    await precacheAudio();
  } catch (e) {
    console.warn('[sw] تعذّرت مزامنة الصوت', e);
  } finally {
    syncing = false;
  }
}

/** شفاءُ الناقص — **مرّةً في عمر العامل وبعد مهلة**، وثلاثةُ قيودٍ لكلٍّ علّته:
 *
 *  ١) **مرّةً لا كلَّ فتحة**: العاملُ يُنهى ويُبعث، فمع كل بعثٍ فرصةٌ جديدة.
 *  ٢) **بعد مهلة**: الفتحةُ الأولى للطفل أَولى بالشبكة من تنزيلٍ خلفيّ.
 *  ٣) **ولا يعمل على تامّ**: الجردُ أولاً، فجهازٌ مخزونُه كامل لا يطلب بايتاً. */
async function healAudio() {
  if (healed || syncing) return;
  healed = true;
  await new Promise((resolve) => setTimeout(resolve, HEAL_AFTER));
  if (await audioComplete()) return;
  await syncAudio();
}

/** **إبلاغُ النوافذ بحال خزن الصوت** (أمرُ المالك في اقرأ، ١٣ أغسطس ٢٠٢٦): كان الخزنُ
 *  يجري صامتاً في الخلفية، فلا يعرف أحدٌ أتمَّ أم لا — حتى يفاجئه صمتٌ في الطائرة.
 *  فصار العاملُ يبعث حالَه بعد كل دفعة، وتعرضه لوحةُ وليّ الأمر شريطاً حيّاً. */
async function report(state) {
  // بيئةٌ بلا `clients` (فحصٌ مزيَّف أو متصفّحٌ قديم): الخزنُ يمضي والإبلاغُ يسقط
  // وحدَه — فالبلاغ زينةُ شفافيةٍ لا شرطُ عمل.
  if (typeof self.clients?.matchAll !== 'function') return;
  const windows = await self.clients.matchAll({ type: 'window' });
  for (const client of windows) client.postMessage({ type: 'audio-progress', ...state });
}

/**
 * **نسخةُ القشرة تُرى** (أمرُ المالك — `METHOD.md §١٢-١٠` وبلاغ
 * `2026-08-13-version-visibility.md`): «القشرةُ تجيب `{type:'version'}` من ثابت
 * `VERSION` نفسِه، ولوحةُ الوالد تسأل وتعرض نسخةَ **ما يعمل** على الجهاز — فلا يشهد
 * ميدانٌ على شيفرةٍ لم تصله».
 *
 * **والجوابُ من الثابت نفسِه** الذي يسمّي مخزنَ القشرة (`SHELL_CACHE`): فلا رقمُ
 * نسخةٍ ثانٍ يُكتب في موضعٍ آخر فيفترق عن الشيفرة العاملة — وهو عينُ ما يُراد قياسُه.
 *
 * ويُجاب على القناة التي سأل بها السائل: منفذُ الرسالة إن أرسله (`ports[0]`)، وإلّا
 * فالنافذةُ نفسُها (`source`) — فلا يحتاج السائلُ أن يعرف أيَّهما يملك هذا المتصفّح.
 */
function reply(event, message) {
  const port = event.ports && event.ports[0];
  if (port) port.postMessage(message);
  else event.source?.postMessage(message);
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'version') {
    reply(event, { type: 'version', version: VERSION });
    return;
  }
  /** طلبٌ صريح من المستعمل: «نزّل الأصوات الآن» — يتجاوز مهلةَ الشفاء ولا ينتظرها. */
  if (event.data?.type !== 'audio-sync') return;
  event.waitUntil(syncAudio());
});

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await Promise.all(SHELL.map((path) =>
      cache.add(new URL(path, self.registration.scope)).catch(() => {})));
    await precacheEmoji();
    await precacheAudio();
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // **ولا يُهدَم مخزونٌ كاملٌ لأجل ناقص** (بلاغُ المالك في اقرأ): مخازنُ الصوت
    // القديمة تبقى حتى يثبت تمامُ الجديد **بالجرد لا بالظنّ**.
    // **وسابقتُنا وحدَها تُكنَس**: مخزونُ إخوتنا في العائلة لا يُمَسّ.
    // **وصوتُنا الحيُّ محميٌّ، واليتيمُ يُكنَس**: `listen-audio` في `KEEP` فلا
    // يُهدَم أبداً (عهدُ «لا يُهدَم كاملٌ لأجل ناقص»)، أمّا `english-audio` فلن
    // يُقرأ منه بايتٌ بعد اليوم — فتركُه وزنٌ ميتٌ على جهازٍ لا احتياطُ صوت.
    const names = await caches.keys();
    const stale = names.filter((n) => OURS.some((p) => n.startsWith(p)) && !KEEP.includes(n));
    await Promise.all(stale
      .filter((n) => n !== AUDIO_CACHE)
      .map((n) => caches.delete(n)));
    await self.clients.claim();
    await syncAudio();
  })());
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

/**
 * الصوت: المخزون أولاً **بالرابط الموسوم**.
 * وسمٌ جديد = مفتاحُ خزنٍ جديد = طلبُ شبكةٍ لهذا الملف وحده، وبعد خزنه يُحذف
 * وسمُه الأقدم فوراً (فلا نسختان لملفٍ واحد، ولا يعود القديم من باب خلفيّ).
 * وإن سقطت الشبكة ولم يكن الوسمُ الجديد مخزوناً: نسخةٌ بوسمٍ أقدم خيرٌ من صمتٍ
 * في أذن الطفل — نُخرجها ولا نخزنها بالوسم الجديد، فتُصحَّح أول اتصال.
 */
async function cacheFirst(request) {
  const cache = await caches.open(AUDIO_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request).catch(() => null);
  if (response && response.ok) {
    await cache.put(request, response.clone());
    await dropOtherTags(cache, request);
    return response;
  }
  return (await cache.match(request, { ignoreSearch: true })) || response || Response.error();
}

/** حذف ما خُزن لهذا الملف بأوسمةٍ أخرى (أو بلا وسم) — إبقاءُ الجديد وحده. */
async function dropOtherTags(cache, request) {
  const siblings = await cache.keys(request, { ignoreSearch: true });
  await Promise.all(siblings
    .filter((other) => other.url !== request.url)
    .map((other) => cache.delete(other)));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;      // لا مصدر خارجياً في هذا التطبيق أصلاً

  // الصفحة التعريفية خارج القشرة عمداً: لا تُخزَّن، ولا يبتلعها ردُّ التنقّل أدناه —
  // ولولا هذا السطر لفُتح التطبيقُ مكانَها على كل جهازٍ ثبّته، فلا يبلغ المعلّمُ
  // الصفحةَ أصلاً. تُترك للشبكة كأنّ لا عاملَ خدمةٍ هنا.
  if (url.pathname.startsWith(WELCOME)) return;

  if (AUDIO_RE.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  // التنقّل دائماً إلى index.html: التطبيق صفحة واحدة بمسارات hash
  if (request.mode === 'navigate') {
    // وكلُّ فتحةٍ فرصةُ شفاء: ما نقص من الصوت يُستكمَل الآن إن كانت هناك شبكة —
    // مكبوحاً بمهلة، ولا يجلب إلا الناقص، فلا يثقل فتحةً ولا يكرّر تنزيلاً.
    event.waitUntil(healAudio());
    event.respondWith(staleWhileRevalidate(new Request(new URL('index.html', self.registration.scope))));
    return;
  }
  event.respondWith(staleWhileRevalidate(request));
});
