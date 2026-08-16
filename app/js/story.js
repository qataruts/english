// **القصةُ شبهُ المفكوكة** (`METHOD.md §٥`): «نصٌّ قصير مصوَّر كلُّه من رموز الدرجات
// المفتوحة + شائكاتها — يفحصه `check_range` ككل تمرين»، ومفتاحُه `text|<درجة>|read`.
//
// ————— أوّلُ نصٍّ متّصل يقع تحت عين الطفل، وثلاثةُ أحكامٍ فيه —————
//
// ١) **القصةُ نصٌّ لا حوضُ توليد**: سائرُ شاشاتنا تنتقي مادّتَها من حوضٍ بحسب ما نضج،
//    وهذه **تُعرَض كما كُتبت أو لا تُعرَض**. فقيدُ الاقتران يحكمها كلَّها دفعةً واحدة
//    (`METHOD.md §٦` يسمّي `text` مع `decode` و`build`): كلمةٌ من كلماتها لم تنضج
//    سمعاً ⇒ **لا قصةَ اليوم** — ولا تُنقَص كلمةٌ منها ولا تُبدَّل، فيبقى النصُّ نصّاً.
// ٢) **ولا صوتَ للسطر في يد الطفل**: لو نُطق لَحفظه ولم يفكّه — فلا زرَّ أذنٍ في
//    الصفحة (حكمُ `decode` نفسُه). **والمعلّمُ يقرأ الصفحةَ الأولى في النمذجة**
//    وحدَها، لأنّ **مؤشّر بدء السطر تدريسٌ لا افتراض** (`METHOD.md §٩·٣`): لا يُعرَف
//    «من أين أبدأ وإلى أين أمضي» إلا بأن يُرى ويُسمَع مرّةً — ثم يقرأ الطفلُ بقيّتَها.
// ٣) **والقياسُ صفحةً صفحة على مفتاح القصة**: يقرأ السطرَ فيلمس **صورةَ ما قرأ**
//    (`METHOD.md §٧`) — فالمقيسُ فهمُ ما فُكّ لا نطقُه (§١٣: لا قياسَ نطق).
//
// ————— والوسمُ في القصة أقلُّ منه في البطاقة، عن قصد —————
//
// في تمرين الشائكة تُنقَّط المقاطعُ المفكوكة ويُوسَم موضعُ الشوكة بقلب (طريقةُ heart
// words). وفي **النصّ المتّصل** تُترك النقاط: سطرٌ كلُّه نقاطٌ ضجيجٌ يزاحم الكلمة،
// **ويبقى القلبُ وحدَه** — لأنّه تحذيرٌ يحتاجه الطفلُ وهو يقرأ: «هذه لا تُفكّ».

import * as progress from './progress.js';
import { registerScreen } from './registry.js';
import {
  stations, readableAt, readableTrickyAt, markedTricky, symbolById, isTouchable, WORDS,
} from './curriculum.js';
import { figureEl, specOf } from './figures.js';
import {
  say, sayEn, praiseThen, missedThen, seeder, skillOf, stationById,
  registerExercise, stationScreen, usedOf,
} from './station.js';
import { h, pick, shuffle, seeded, pop, STORY_ACCENT, roundSeed } from './ui.js';

/** أنواعُ الشاشات التي تملكها هذه الوحدة (يقابلها `STATIONS` في `test_measure.mjs`). */
const TYPES = new Set(['story']);

const OPTIONS = 3;

// ————— التعليماتُ المنطوقة (عربيةٌ كلُّها — `METHOD.md §٩·١`) —————

const ASK = {
  read: 'اقْرَأِ السَّطْرَ وَالْمَسْ صُورَةَ مَا قَرَأْت',
  model: 'انْظُرْ وَاسْمَعْ — الْمُعَلِّمُ يَقْرَأُ مِنْ حَيْثُ تَبْدَأُ النُّقْطَة',
};

/** محطاتُ هذه الوحدة من المنهج. */
const owned = () => stations().filter((s) => TYPES.has(s.type));

/** صفحاتُ القصص كلِّها — مادّةُ الإعلان والجولات معاً. */
const pagesOf = (station) => station.pages || [];

/**
 * **كلُّ نصٍّ قد تنطقه هذه الوحدة** — إعلانٌ لا استنتاج (`tools/queue_texts.mjs`):
 * تعليمتاها العربيتان · **أسطرُ القصص** (يقرأ المعلّمُ أوّلَها في النمذجة) · وكلماتُ
 * الصور التي تُلمَس (تُقال بعد الصواب وفي التصحيح).
 */
export const SPOKEN = [
  ...Object.values(ASK).map((text) => ({ text, lang: 'ar', category: 'instruction' })),
  ...[...new Set(owned().flatMap((s) => pagesOf(s).map((page) => page.text)))]
    .map((text) => ({ text, lang: 'en', category: 'sentence' })),
  ...[...new Set(owned().flatMap((s) => pagesOf(s).map((page) => page.pick)))]
    .map((text) => ({ text, lang: 'en', category: 'word' })),
];

// ————— ما تستهلكه هذه الوحدة (البابُ الرابع في `check_range.py`) —————

export const CONSUMES = {
  story: { words: [], fields: [], gpcs: [], tricky: [], sounds: [] },
};

// ————— رسمُ السطر: كلمةٌ كلمة، ولكلٍّ صنفُها معلَناً —————

/** صورةُ كلمةٍ من الرصيد المصوَّر — بإعلانها هي (`specOf` القاعدةُ الواحدة). */
const PICTURED = new Map(WORDS.map((word) => [word.w, word]));
const pictureSpec = (name) => specOf(PICTURED.get(name) || { w: name });

/** كلمةُ قراءةٍ في النصّ: مقاطعُها **بلا وسم** — النصُّ يُقرأ ولا يُشرَح. */
const textSpec = (word) => ({
  kind: 'letter',
  unit: 'word',
  word: word.w,
  parts: word.gpc.map((id) => ({ id, g: symbolById(id)?.g || id, mark: '' })),
});

/** شائكةٌ في النصّ: **القلبُ وحدَه** تحت شوكتها (والنقاطُ تُترك — رأسُ الملفّ). */
function heartSpec(word, gradeId) {
  const marked = markedTricky(word, gradeId);
  if (!marked) return null;
  return {
    kind: 'letter',
    unit: 'tricky',
    word,
    parts: marked.parts.map((part) => ({ ...part, mark: part.mark === 'heart' ? 'heart' : '' })),
  };
}

/**
 * **سطرٌ إلى أوصافٍ مرسومة، أو `null`** — وهو موضعُ قيد الاقتران في هذه الشاشة:
 * كلمةٌ ليست كلمةَ قراءةٍ **ناضجةً سمعاً** ولا شائكةً **مقروءة** تُسقِط السطرَ كلَّه،
 * فتسقط معه القصةُ (فوق ما يحرسه `check_range` في النصّ نفسِه).
 */
function lineSpecs(text, gradeId, isMastered) {
  const words = new Map(readableAt(gradeId, isMastered).map((word) => [word.w, word]));
  const tricky = new Set(readableTrickyAt(gradeId, isMastered));
  const out = [];
  for (const token of String(text).split(/\s+/).filter(Boolean)) {
    const spec = words.has(token) ? textSpec(words.get(token))
      : tricky.has(token) ? heartSpec(token, gradeId) : null;
    if (!spec) return null;
    out.push(spec);
  }
  return out;
}

/**
 * **صفحةٌ واحدة**: سطرُها يُقرأ، وصورةُ ما فيه تُلمَس بين ثلاث.
 *
 * **والمشتّتاتُ صورُ ما نضج سمعاً** (قاعدةُ `decode` نفسُها): صورةٌ لم يلقَها الطفلُ
 * تجعل السؤالَ حزراً. **والمسؤولُ عنه من كلمات السطر** — يحرسه `check_range` كذلك،
 * فلا يُسأل الطفلُ عمّا لم يقرأ.
 */
function pageRound(station, page, rnd, isMastered) {
  const line = lineSpecs(page.text, station.part, isMastered);
  const skill = skillOf(station, station.part, 'read');
  if (!line || !skill || !isTouchable(page.pick)) return null;
  if (!line.some((spec) => spec.word === page.pick)) return null;
  const others = shuffle(readableAt(station.part, isMastered)
    .filter((word) => word.w !== page.pick && isTouchable(word.w)), rnd)
    .slice(0, OPTIONS - 1)
    .map((word) => word.w);
  if (!others.length) return null;
  const options = shuffle([page.pick, ...others], rnd).map(pictureSpec);
  const next = seeder(rnd);
  return {
    kind: 'read',
    shape: 'page',
    unit: skill.unit,
    range: skill.range,
    ask: ASK.read,
    text: page.text,
    target: page.pick,
    line,
    options,
    figures: [...line, ...options],
    saying: [page.pick, ...others],
    sig: `${station.id}|${page.pick}|${next()}`,
  };
}

/**
 * **خطةُ القصة**: المعلّمُ يقرأ الصفحةَ الأولى، ثم صفحةٌ بعونٍ، ثم البقيةُ «وحدك».
 *
 * **والصفحاتُ بترتيبها لا مخلوطة**: هي قصةٌ تُتابَع لا حوضُ جولات — والبذرةُ تخلط
 * المشتّتاتِ وحدَها.
 */
export function buildStation(stationId, seed, isMastered = progress.isMastered) {
  const station = stationById(stationId);
  if (!station || !TYPES.has(station.type)) return null;
  const rnd = seeded(seed >>> 0);
  const pages = pagesOf(station).map((page) => pageRound(station, page, rnd, isMastered));
  if (!pages.length || pages.some((page) => !page)) return null;
  const [first, second, ...rest] = pages;
  if (!second || !rest.length) return null;
  return {
    model: {
      title: station.title,
      hint: ASK.model,
      items: [{
        en: first.text,
        el: () => modelEl(first),
        after: async (box, api) => { if (api.alive()) await sayEn(first.target); },
      }],
      figures: first.figures,
      saying: first.saying,
    },
    guided: [second],
    solo: rest,
  };
}

/** جردُ الجولات للحارس — بأوسع الحالات (علّتُه في `grade.js`). */
export function probeRounds(stationId, seed) {
  const plan = buildStation(stationId, seed, () => true);
  if (!plan) return [];
  return [plan.model, ...plan.guided, ...plan.solo].map(usedOf);
}

// ————— تسجيلُ المحاولة —————
//
// **مفتاحٌ واحد للقصة كلِّها** (`text|<درجة>|read` — `METHOD.md §٧`): صفحاتُها
// محاولاتٌ على مهارةٍ واحدة هي قراءةُ نصٍّ في مدى تلك الدرجة.

const score = (round, correct, recordAttempt = progress.recordAttempt) => {
  recordAttempt(round.unit, round.range, 'read', correct);
};

// ————— الشاشة —————

/**
 * **السطرُ يُصَفّ من اليسار ومعه مؤشّرُ بدء السطر** (`METHOD.md §٩·٣`): نقطةُ انطلاقٍ
 * خضراء يسارَ السطر، علاجاً لانقلاب المسح الموثَّق في الدراسة **تدريساً لا افتراضاً**
 * — وهي النقطةُ نفسُها التي يبني عندها الطفلُ كلمتَه في الدمج والتقطيع.
 */
const lineEl = (round) => {
  const line = h('div', { class: 'q-line' });
  for (const spec of round.line) line.append(figureEl(spec));
  return line;
};

/** مشهدُ النمذجة: السطرُ وصورتُه معاً — يقرأ المعلّمُ ويُري ما قرأ. */
const modelEl = (round) => h('div', { class: 'q-page' },
  lineEl(round),
  h('div', { class: 'q-shown-one' },
    figureEl(round.options.find((option) => option.word === round.target) || round.options[0])));

function pageView(round, hooks) {
  const stage = h('div', { class: 'q-stage q-stage--read' });
  stage.dataset.ask = round.target;
  // **ولا زرَّ أذنٍ**: القراءةُ بالعين (رأسُ الملفّ) — والسطرُ وحدَه في الساحة
  stage.append(lineEl(round));

  const choices = h('div', { class: 'q-choices q-choices--page' });
  let locked = false;
  const buttons = round.options.map((spec) => {
    const btn = h('button', { class: 'qcard', 'aria-label': 'هَذِهِ' }, figureEl(spec));
    btn.addEventListener('click', async () => {
      if (locked) return;
      locked = true;
      const chosen = btn.querySelector('.fig')?.dataset.word;
      const correct = chosen === round.target;
      hooks.attempt(round, correct);
      if (correct) {
        btn.classList.add('good');
        pop(btn);
        await praiseThen(hooks, round.target);
        return;
      }
      await missedThen(hooks, {
        chosen,
        target: round.target,
        chosenEl: btn,
        targetEl: buttons.find((el) => el.querySelector('.fig')?.dataset.word === round.target),
      });
    });
    return btn;
  });
  choices.append(...buttons);

  say(round.ask);
  return h('div', {}, h('p', { class: 'hint' }, round.ask), stage, choices);
}

// ————— التسجيل في الموجِّه وفي المراجعة —————

registerScreen('story', (part) => {
  const station = stationById(`story:${part}`);
  if (!station || !buildStation(station.id, 1)) return null;
  return stationScreen({
    nodeId: station.id,
    title: station.title,
    accent: STORY_ACCENT,
    make: () => buildStation(station.id, roundSeed()),
    view: pageView,
    score,
    save: (stars) => progress.setStars(station.id, stars),
  });
});

/**
 * تمرينُ مراجعةٍ للقصة: **صفحةٌ منها** — فالقصةُ تُقرأ كاملةً في محطتها، ويُعاد في
 * المراجعة ما يقيس المهارةَ نفسَها بلا إعادة الكتاب كلِّه على طفلٍ في جلسةِ خلط.
 *
 * **وقيدُ الاقتران يعمل ههنا كما يعمل في المحطة**: `pageRound` يمرّ من `readableAt`
 * نفسِها، فصفحةٌ سقطت كلمتُها سمعاً لا تُنتج تمريناً وتُملأ الجلسةُ بغيرها.
 */
const single = (skill, rnd) => {
  const station = stations().find((s) => TYPES.has(s.type)
    && (s.skills || []).includes(`${skill.unit}|${skill.range}|${skill.kind}`));
  if (!station) return null;
  const page = pick(pagesOf(station), rnd);
  return page ? pageRound(station, page, rnd, progress.isMastered) : null;
};

registerExercise('read', { build: single, view: pageView, score });
