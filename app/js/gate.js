// البوابات الثلاث (`METHOD.md §٤–§٥`) — إتقانٌ بلا رسوب.
//
// ————— بذرةُ المنصة (`docs/SEED.md §٢`) — ونموذجُها مُقَرٌّ حرفياً —————
// نصُّ المنهج: «من **أضعف** مهارات س١–س٤ (إصابة ≥٨٠٪، **لا رسوب** — سنّةُ بوابات
// العائلة)». وهي عينُ قاعدة اقرأ واحسب بعللها الأربع:
//
// ١) **مادّتها أضعف ما في يده** لا ما حان موعده: `weakestSkills()` بدل `dueSkills()`
//    — البوابة سؤالٌ عن الإتقان، وليتنر جدولُ تثبيتٍ لا امتحان. (وإلا حان موعدُ
//    القويّ وحده يوم البوابة فمرّت بلا معنى.)
// ٢) **لا محتوى جديداً ولا نصّ منطوق جديد**: تمارينها تمارينُ المراجعة نفسُها
//    (`sessionItems`)، فكلُّ ما تنطقه له ملفٌّ مولَّد أصلاً — ولذلك لا تُضيف البوابةُ
//    سطراً واحداً إلى `tools/audio_queue.json`، ولا تكسر قيدَ الاقتران من بابٍ خلفيّ.
// ٣) **لا رسوب**: دون العتبة لا نجمة ولا عبور، لكن لا عقاب ولا حدّ للمحاولات —
//    «لَيْسَ بَعْدُ» ثم إعادةٌ فورية تُبنى تمارينها من جديد (لا نمط يُحفَظ فيُستظهَر).
// ٤) **الحكم بالمحاولة لا بالتمرين**: نسبة الإصابة = الصواب ÷ كل اللمسات، وهي وحدةُ
//    `markReview` نفسُها في لوحة الوالد — فلا يفترق ما يقرؤه الوالد عمّا فتح
//    البوابة أو أبقاها.
//
// **وبوابتُنا الأولى بابُ منهجٍ لا بابُ تشجيع** (ق٤ · `METHOD.md §٦`): «يُفتح مسارُ
// الحرف باجتياز 🚪١ (عبورُ الأذن)، ثم يحكم قيدُ الاقتران كلمةً كلمة» — فعبورُها هو
// **الشرطُ الهيكليّ** لفتح المسار الثاني، ووراءه قيدٌ ثانٍ يعمل كلمةً كلمة.

import { gateById, gateSkills } from './curriculum.js';
import * as progress from './progress.js';
import { renderSession, sessionItems, starsForReview } from './review.js';
// **مسطرةُ الامتحان الواحدة**: يُستورَد نطاقُ الامتحان وحدَه — لا مقدارٌ من مقادير
// وضع الدعم يُقرأ في هذا الملفّ.
import { duringExam } from './support.js';
import {
  h, icon, faceEl, go, arNum, starsRow, mascot, passportStamp, chance, PAUSE_ACCENT,
} from './ui.js';

export const GATE_SIZE = 10;      // عشرة تمارين: أطول من مراجعة اليوم ودون إرهاق
export const PASS_RATE = 0.8;     // العبور بإصابة ≥٨٠٪ من المحاولات

/** هل تعبر هذه النتيجة البوابة؟ (بلا محاولة أصلاً لا عبور — لئلا تُفتح بجلسة فارغة) */
export const passed = (right, errors) =>
  right + errors > 0 && right / (right + errors) >= PASS_RATE;

/**
 * تمارين محاولةٍ واحدة: **الأضعف أولاً** من سجلّ ليتنر، ثم تنويعٌ يكمل العدد.
 *
 * **والأضعفُ من مدى البوابة المعلَن**: `METHOD.md` يذكر لكلٍّ ممّ تسأل — 🚪١ «من
 * أضعف مهارات س١–س٤»، و🚪٢ «من أضعف ح١–ح٥»، و🚪٣ «من أضعف الرحلة كلِّها (السمعُ
 * والحرفُ معاً)». فتُصفّى قائمةُ الضعف بمفاتيح مداها (`gateSkills`). ولولا ذلك
 * لَتصدّر جلسةَ **بوابةِ الفكّ** ضعفٌ في السمع، فمضى الطفلُ وفكُّه متزعزع — وهي عينُ
 * العلّة التي وُجدت البوابةُ لها.
 *
 * **والتنويعُ يبقى من الحصيلة كلِّها**: المدى يحكم **مادّةَ الضعف** لا حوضَ التنويع.
 *
 * **وتُبنى بمسطرةٍ واحدة** (وضعُ الدعم — بلاغ `support-and-placement-coexist`): البوابةُ
 * سؤالٌ عن الإتقان **بعتبةٍ واحدة للجميع** (٨٠٪ أعلاه)، فلا يعبرها حوضٌ أضيق ولا جرعةٌ
 * أقصر — ومقابضُ الراحة تسري (نموذجٌ أبطأ وهدوءٌ حسّيّ) فلا يُمتحَن بشاشةٍ تُربكه.
 * **ونطاقُه مدّةُ البناء**: `duringExam` نداءٌ متزامن يُردّ في `finally`، لا عَلَمٌ
 * يُخزَّن فيعلق مفتوحاً ويعبر إعادةَ التحميل.
 */
export function gateItems(gateId, rnd = chance) {
  const scope = new Set(gateSkills(gateId));
  const weakest = progress.weakestSkills()
    .filter((s) => scope.has(`${s.unit}|${s.range}|${s.kind}`));
  return duringExam(() => sessionItems(weakest, GATE_SIZE, rnd));
}

export function renderGate(gateId) {
  const gate = gateById(gateId);
  if (!gate) return null;
  const nodeId = `gate:${gate.id}`;

  return renderSession({
    make: () => gateItems(gate.id),
    pill: 'بوابة',
    accent: PAUSE_ACCENT,
    leaveAsk: 'تريد الخروج قبل إتمام البوابة؟',
    header: h('div', { class: 'gate-head' },
      faceEl(gate.face, 'gate-face'),
      h('div', {},
        h('h2', {}, gate.title),
        h('p', { class: 'hint' }, gate.hint),
      ),
    ),
    verdict: ({ right, errors, items, again }) => {
      const tries = right + errors;
      const rate = tries ? Math.round((right / tries) * 100) : 0;
      const open = passed(right, errors);
      progress.markReview(tries, right);           // البوابة مراجعةٌ كسائر المراجعات
      if (open) progress.setStars(nodeId, starsForReview(errors, items.length));

      const score = h('p', { class: 'hint' },
        `أصبتَ ${arNum(right)} من ${arNum(tries)} محاولة (${arNum(rate)}٪)`);

      // العبور: احتفال ونجوم. ودونه: «ليس بعدُ» — لا لفظ رسوب ولا حدّ للإعادة.
      return open
        ? h('div', { class: 'celebrate' },
          // **والمرشدُ يختم الجوازَ هنا** (حكمُ المالك في المرشد — البند الثامن):
          // فحلّت لوحةُ الختم محلَّ ميدالية الوجه — الطائرُ الرحّالة إلى جانب حلقةِ
          // حبرٍ يقع فيها وجهُ البوابة. **الاستعارةُ عاملةٌ لا موصوفة**.
          passportStamp(gate.face),
          h('h2', {}, 'فُتِحَتِ البَوَّابَة!'),
          starsRow(starsForReview(errors, items.length), 'big-stars'),
          // **وسطرُ الختم مكتوبٌ يقرؤه الوالد** لا شيءَ يُنطَق — والبوابةُ **لا
          // تُضيف نصّاً منطوقاً** بعهدها في رأس الملف (وله ملفُّه في البنك سلفاً).
          h('p', { class: 'rule' }, 'خُتِمَ جَوَازُكْ — إلى المحطة التالية!'),
          score,
          // **وما بعد البوابة يُذكَر إن أعلنته هي** (بوابةُ الختام وحدَها اليوم):
          // ذكرٌ لا وعدٌ يُقاس — لا عقدةَ له في الخريطة ولا مفتاحَ في ليتنر.
          gate.next && h('p', { class: 'rule' }, gate.next),
          h('div', { class: 'row foot' },
            h('button', { class: 'btn btn--primary', onclick: () => go('#/') },
              icon('map'), ' الخريطة')),
        )
        : h('div', { class: 'celebrate celebrate--again' },
          mascot('mascot mascot--hello'),
          h('div', { class: 'celebrate-face' }, icon('smile')),
          h('h2', {}, 'لَيْسَ بَعْدُ'),
          // **ونصُّ التشجيع من بيان البوابة لا مكتوباً هنا**: بوابةُ الأذن تشدّ
          // السمعَ وبوابةُ الفكّ تشدّ الفكّ، فجملةٌ واحدة لثلاثتها تكذب على إحداها.
          gate.again && h('p', { class: 'rule' }, gate.again),
          score,
          h('p', { class: 'note' }, 'أعِد المحاولة متى شئت — بتمارين جديدة في كل مرة.'),
          h('div', { class: 'row foot' },
            h('button', { class: 'btn btn--primary', onclick: again },
              icon('repeat'), ' أعِد المحاولة'),
            h('button', { class: 'btn', onclick: () => go('#/') }, icon('map'), ' الخريطة')),
        );
    },
  });
}
