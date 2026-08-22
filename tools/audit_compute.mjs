// عدّةُ التدقيق التربويّ — الحساباتُ الأربع من بيانات المنهج نفسِها
// (بلاغ العائلة 2026-08-19-write-computed-curriculum-method.md)
// تُشغَّل: node tools/audit_compute.mjs — ومخرجُها ملحقُ PEDAGOGY_AUDIT.md المحسوب.
// **أوزانُ مقياس الصعوبة اجتهادٌ معلَن** (يُحتجّ به في الأطراف لا في الوسط).

import * as c from '../app/js/curriculum.js';

const out = [];
const p = (s='') => out.push(s);

// ———— ١) التسلسل الفعليّ من الشيفرة ————
p('## م١ · التسلسلُ الفعليّ (من `sections()` لا من الوثيقة)\n');
const secs = c.sections();
secs.forEach((s, i) => {
  const nodes = (s.nodes || []).map(n => n.id || n).join(' · ');
  p(`${i + 1}. **${s.id}** — ${s.title || ''}: ${nodes}`);
});

// خريطة: الدرجة ← ترتيبها بين الأقسام، والمحطة السمعية ← ترتيبها
const orderOf = {};
secs.forEach((s, i) => (s.nodes || []).forEach(n => { orderOf[(n.id || n)] = i; }));

// ———— ٢) مقياسُ الصعوبة المحسوب للأصوات ————
p('\n## م٢ · مقياسُ صعوبة الأصوات (محسوبٌ من بياناتنا — **الأوزانُ اجتهاد**)\n');
// غيابُ الصوت عن عربيّة طفلِ قطر — من دراسة STUDY.md §٣ (إعلانُ مصدر لا اختراع)
const ABSENT = new Set(['p','v','ng','th','TH','zh','ch','j','r','e','i','u','oo','ue','er','ur','ir','ow','oi','air','ear','ure','ai','igh','oa','ay','a-e','i-e','o-e','u-e','ee']);
const HARD_VOWEL = new Set(['i','e','a','u','o']); // الحركات القصار — فجوة القياس ٤٧٪
// دعمُ المادة: كم كلمةَ قراءةٍ عندنا تحمل رمزَ الصوت
const allReadWords = c.GRADES.flatMap(g => g.words || []);
const support = {};
for (const ph of c.PHONEMES) {
  support[ph.id] = allReadWords.filter(w => (w.gpc || []).some(g2 => (ph.graphemes || []).includes(g2))).length;
}
// أول درجةٍ يُفتح فيها رسمٌ للصوت
const firstGrade = {};
c.GRADES.forEach((g, gi) => (g.symbols || []).forEach(sym => {
  for (const ph of c.PHONEMES) if ((ph.graphemes || []).includes(sym.g) && firstGrade[ph.id] === undefined) firstGrade[ph.id] = gi;
}));
const scored = c.PHONEMES.map(ph => {
  const vowel = c.isVowelSound ? c.isVowelSound(ph.id) : HARD_VOWEL.has(ph.id);
  const score = (vowel ? 3 : 0)                       // فجوة الصوائت (٤٧٪ مقابل ٨٦٪) — وزن ٣
    + (ABSENT.has(ph.id) ? 2 : 0)                     // لا نظيرَ في عربية الطفل — وزن ٢
    + ((ph.graphemes || []).some(g2 => g2.length > 1) ? 1 : 0)  // رسمٌ مركّب — وزن ١
    + (support[ph.id] < 3 ? 1 : 0);                   // مادةُ تدريبٍ شحيحة — وزن ١
  return { id: ph.id, say: ph.say, vowel, score, support: support[ph.id], grade: firstGrade[ph.id] };
});
scored.sort((a, b) => b.score - a.score);
p('| الصوت | الصعوبة (٠–٧) | دعمُ المادة (كلمات) | أولُ درجةٍ يُفتح فيها |');
p('|---|---|---|---|');
scored.slice(0, 14).forEach(s => p(`| ${s.say} | ${s.score} | ${s.support} | ${s.grade === undefined ? '—' : 'ح' + (s.grade + 1)} |`));
// المفارقات: أصعبُ الأصوات المفتوحة مبكراً
const early = scored.filter(s => s.score >= 4 && s.grade !== undefined && s.grade <= 3);
p(`\n**مفارقاتُ الأطراف** (صعوبة ≥٤ وتُفتح في العهد الأول): ${early.map(s => s.say + '←ح' + (s.grade + 1)).join(' · ') || 'لا شيء'}`);

// ———— ٣) عائدُ كل درجة ————
p('\n## م٣ · عائدُ كل درجة (كم كلمةً ذاتَ معنى تنفتح؟)\n');
// أ: العائد الكامن — كم من رصيد Starters يصير مفكوكاً بالكامل (بحروف الدرجات المفتوحة)
// نبني فكّاً تقريبياً: كلمةُ Starters مفكوكة إن كانت كلَّ أحرفها ضمن رسومٍ مفتوحة أحادية
// (تقريبٌ معلَن: لا تحليلَ مقطعياً كاملاً لرصيد السمع — الدقيقُ محسوبٌ لكلمات القراءة المرمَّزة)
p('| الدرجة | رموزها | كلماتُ قراءةٍ جديدة (مرمَّزة gpc) | تراكميّ | شائكاتٌ جديدة |');
p('|---|---|---|---|---|');
let cum = 0;
c.GRADES.forEach((g, gi) => {
  const n = (g.words || []).length; cum += n;
  p(`| ح${gi + 1} | ${(g.symbols || []).map(s => s.g).join(' ')} | ${n} | ${cum} | ${(g.tricky || []).length} |`);
});
// أدنى العائد
const yields = c.GRADES.map((g, gi) => ({ gi, n: (g.words || []).length }));
const zero = yields.filter(y => y.n === 0);
p(`\n**درجاتٌ بعائد صفر كلمة**: ${zero.map(y => 'ح' + (y.gi + 1)).join(' · ') || 'لا شيء'}`);

// ———— ٤) المتطلَّبُ الحقيقيّ ————
p('\n## م٤ · المتطلَّبُ الحقيقيّ (ما يُدرَّس ولا تطلبه مادّة)\n');
// رموز لا تظهر في أي كلمة قراءة ولا قصة
const usedG = new Set();
allReadWords.forEach(w => (w.gpc || []).forEach(g2 => usedG.add(g2)));
// القصصُ نصوصٌ: تُجرَد كلماتُها بمطابقتها على كلمات القراءة المرمَّزة
const storyWords = new Set();
Object.values(c.STORIES || {}).forEach(st => (st.pages || []).forEach(pg =>
  String(pg.text || '').split(/\s+/).forEach(t => storyWords.add(t.toLowerCase()))));
allReadWords.forEach(w => { if (storyWords.has(w.w)) (w.gpc || []).forEach(g2 => usedG.add(g2)); });
const taughtG = c.GRADES.flatMap(g => (g.symbols || []).map(s => s.g));
const unused = taughtG.filter(g2 => !usedG.has(g2));
p(`- **رموزٌ تُدرَّس ولا تظهر في كلمة قراءةٍ ولا قصة**: ${unused.length ? unused.join(' · ') : 'صفر'} (من ${taughtG.length})`);
// شائكات بلا سياق قصة
// جردُ كلمات القصص كلماتٍ لا نصاً (كان البابُ الأول مكسوراً: بحثٌ باقتباسٍ لا يقع)
const storyTokens = new Set();
Object.values(c.STORIES || {}).forEach(st => (st.pages || []).forEach(pg =>
  String(pg.text || '').toLowerCase().split(/[^a-z'-]+/).forEach(t => t && storyTokens.add(t))));
const allTricky = c.GRADES.flatMap(g => g.tricky || []).map(t => (t.w || t).toLowerCase());
const noStory = allTricky.filter(t => !storyTokens.has(t));
p(`- **شائكاتٌ لا تظهر في قصةٍ قط**: ${noStory.length} من ${allTricky.length}${noStory.length ? ' — ' + noStory.slice(0, 12).join(' · ') + (noStory.length > 12 ? ' …' : '') : ''}`);
// أصوات بدعم مادة < ٣
const weak = scored.filter(s => s.support < 3).map(s => s.say);
p(`- **أصواتٌ دعمُ مادّتها أقلُّ من ٣ كلمات قراءة**: ${weak.length} — ${weak.join(' · ')}`);
// تأخيرُ الاقتران: كلمة قراءة محطتُها السمعية بعد درجتها في ترتيب الأقسام
let delayed = [];
c.GRADES.forEach((g, gi) => (g.words || []).forEach(w => {
  const lk = w.listen || ''; const m = lk.split('|')[1];
  const stn = c.stations().find(s => (s.words || []).some(x => x.w === m));
  if (stn && orderOf[stn.id] !== undefined) {
    const gradeNode = Object.keys(orderOf).find(k => k.includes(g.id));
    if (gradeNode && orderOf[stn.id] > orderOf[gradeNode]) delayed.push(`${w.w} (سمعُها بعد درجتها)`);
  }
}));
p(`- **كلماتُ قراءةٍ محطتُها السمعية تلي درجتَها في الخريطة** (يؤخّرها القيد بالبنية لا بالحاجة): ${delayed.length ? delayed.join(' · ') : 'صفر — التداخلُ المحسوب أدّى غرضه'}`);

// ———— م٥ · المجموعةُ الأولى المثلى (حسابُ العائد يحسم الترتيب — للمقابلة) ————
p('\n## م٥ · لو اختيرت المجموعةُ الأولى بعائد رصيدنا نحن؟ (مقابلةٌ لا قرار)\n');
// الكلماتُ المتاحة: كلماتُ الرصيد المصوَّرة ثلاثيةُ الأصوات (من soundsOf إن وُجدت)
const cand = [];
(c.WORDS || []).forEach(w => { const ww = w.w || w; try { const snd = c.soundsOf ? c.soundsOf(ww) : null; if (snd && snd.length >= 2 && snd.length <= 4) cand.push({ w: ww, snd }); } catch(e){} });
// جشعٌ: نختار ٤ أصواتٍ تعظّم كلماتِ الرصيد المفكوكة كاملةً
let chosen = [];
for (let k = 0; k < 6; k++) {
  let best = null, bestN = -1;
  for (const ph of c.PHONEMES) {
    if (chosen.includes(ph.id)) continue;
    const set = new Set([...chosen, ph.id]);
    const n = cand.filter(x => x.snd.every(sn => set.has(sn))).length;
    if (n > bestN) { bestN = n; best = ph.id; }
  }
  chosen.push(best);
  p(`- بعد اختيار **${chosen.join(' ')}**: ${bestN} كلمةً من رصيدنا المصوَّر مفكوكةٌ سمعاً-ورمزاً`);
}
const satpin = ['s','a','t','p','i','n'];
const nSat = cand.filter(x => x.snd.every(sn => satpin.includes(sn))).length;
p(`- **وبمجموعة L&S الأولى وتاليتها (s a t p i n)**: ${nSat} كلمة من رصيدنا — والفرقُ هو ثمنُ وراثة الترتيب.`);
p('\n> تنبيهُ صدق: الجشعُ توضيحيٌّ أحاديُّ الهدف (عائدُ الرصيد المصوَّر وحدَه) — لا يزن تواتر الحرف ولا يسرَ نطقه ولا نسقَ CVC، فلا يُتَّخذ ترتيباً بديلاً بل مقياسَ فجوة.');
console.log(out.join('\n'));
