#!/usr/bin/env python3
"""لوحةُ فحص الأصوات — **يسمع بها المالكُ بنفسه** ويحكم ملفاً ملفاً.

    python3 tools/audio_panel.py            # يبني scratch/panel/index.html
    python3 tools/audio_panel.py --serve    # ويشغّل خادماً على 8110

منسوخةٌ ومجرَّدةٌ من `read@42b1a50` عبر `calc@fa9e6ae` (`docs/SEED.md §٦`).

**العلّةُ التي تعالجها** (`docs/AUDIO_QUEUE.md` — قرارُ المالك في اقرأ ١٢ أغسطس ٢٠٢٦:
«لا حارسَ رجعٍ صوتيّ — الفحصُ بأذنه»): عيبُ **المخرج** لا يكشفه حارسٌ آليّ. أدواتُنا
تقيس المدد والبصمات والأحجام ولا **تسمع** الحروف. والعيبُ عندنا صنفان لا واحد:
**نقاءُ الصوت المعزول** (‏/t/ صوتاً لا «تِي» ولا «تُه») و**لكنةُ المادّة** — وكلاهما
لا يُقاس إلا بأذن.

——————————— وثلاثةُ مفارقٍ عن أختها عند اِحْسِبْ ———————————

١) **قناتان في لوحةٍ واحدة**: لكل صفٍّ لغتُه وصوتُه (سُلافات/Leda) ونموذجُه — فيُعرَف
   بأيّ لسانٍ نطق، ويُمسَك **بالعين** ما لا يُسمع فرقُه أحياناً: نصٌّ إنكليزيّ نُطق
   بصوت العربية. واتجاهُ كل نصٍّ من لغته لا من الصفحة (`dir`).

٢) **القبولُ فعلٌ لا سكوت**: عند اقرأ يُعَدّ ما سُمع ويُبلَّغ عن العيب، والسكوتُ قبول.
   وبندُنا «القبولُ ملفاً ملفاً بأذنه لا جملةً» — فللقبول زرُّه (✓) كما للردّ زرُّه
   (⚑)، **وما لم يُحكَم فيه يبقى معلَّقاً ظاهراً** ولا يُحسَب مقبولاً بمرور الوقت.

٣) **الحكمُ يخرج أمراً جاهزاً**: تنسخ اللوحةُ سطورَ التقييد والإعادة كما تُنفَّذ —
   `--verdict` للمقبول (فيُقيَّد بياناً ولا يتكرّر السؤال) و`--requeue` للمردود.
   **ولا تقرّ اللوحةُ شيئاً بنفسها**: تعرض وتسجّل، والحكمُ للأذن البشرية وحدَها.
"""

import argparse
import http.server
import json
import socketserver
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import generate_audio as gen  # noqa: E402

PANEL = gen.ROOT / "scratch" / "panel"
GROUP_AR = dict(gen.CATEGORY_AR)      # الفئاتُ السبع من المولّد نفسِه لا مكتوبةً هنا
# **وقسما المقارنة** (جلسةُ ص٣، بلاغُ الميدان ٢): حين يُعاد صوتٌ بتعليمةٍ جديدة
# يُعرَض **قديمُه بجوار جديده** — فالأذنُ تحكم بالفرق لا بالانطباع؛ والمعادُ خارج
# `app/` حتى يقع اللفظ، فيُشغَّل من مجلَّد انتظاره لا من الفهرس.
GROUP_AR["current"] = "القائم"
GROUP_AR["redone"] = "المعاد"


def rows(since: float = 0.0, texts: tuple = (), stage_dir: Path | None = None) -> list:
    """صفوفُ اللوحة — لكل ملفٍ في الفهرس: نصُّه ولغتُه وفئتُه وصوتُه ومدّتُه وحكمُه.

    و`texts` تصفيةٌ بنصوصٍ بعينها (دفعةٌ تُعرَض وحدَها فلا تُتعَب الأذنُ بما حُكم فيه)،
    و`stage_dir` يضمّ **المعادَ المنتظِر** صفوفاً إلى جوار القائم بقسمَيهما.
    """
    manifest_path = gen.OUT_DIR / "manifest.json"
    if not manifest_path.exists():
        return []
    man = json.loads(manifest_path.read_text(encoding="utf-8"))
    done, pending = gen.expected_texts()
    cats = {**done, **pending}
    queue = {e["text"]: e for e in gen.load_queue()}
    verdicts = gen.load_verdicts()
    # **وبصمةُ البايتات تدخل هُويّةَ الصفّ** (إصلاحُ ١٧ أغسطس): الحكمُ كان يُحفَظ
    # بمفتاح الملفّ وحدَه، **والمفتاحُ من النصّ لا من الصوت** — فملفٌّ رُدَّ ثم أُعيدت
    # رميتُه يعود إلى اللوحة **موسوماً بالردّ** وهو صوتٌ جديد لم يُسمَع بعد؛ وأخطرُ
    # منه عكسُه: مقبولٌ قديم يُبقي قبولَه على بديلٍ لم تسمعه أذن. فصار الحكمُ
    # معلَّقاً بـ«مفتاح:بصمة» — يسقط من تلقائه متى تبدّل الصوت، ويبقى ما لم يتبدّل.
    versions_path = gen.OUT_DIR / "versions.json"
    versions = json.loads(versions_path.read_text(encoding="utf-8")) \
        if versions_path.exists() else {}

    staged = {e["text"]: e["staged"] for e in queue.values()
              if e.get("staged") and (not texts or e["text"] in texts)} if stage_dir else {}

    out = []
    for key, text in man.items():
        path = gen.OUT_DIR / f"{key}.mp3"
        if not path.exists():
            continue
        if texts and text not in texts:
            continue                      # دفعةٌ مصفّاة: ما سُمّي وحدَه
        if since and path.stat().st_mtime < since:
            continue                      # «الجديدُ فقط»: ما كُتب بعد لحظةٍ بعينها
        e = queue.get(text, {})
        cat = cats.get(text, "instruction")
        lang = gen.CATEGORY_LANG.get(cat, "ar")
        say = gen.speech_form(text, cat)
        out.append({
            "key": key,
            "rid": f"{key}:{versions.get(key, '')}",
            "src": f"../../app/audio/{key}.mp3",
            "group": "current" if text in staged else cat,
            "v": versions.get(key, ""),
            "text": text,
            "say": "" if say == text else say,      # ما أُرسل فعلاً إن خالف المكتوب
            "cat": cat,
            "lang": lang,
            "voice": e.get("voice") or gen.VOICES.get(lang, ""),
            "model": gen.short_model(e.get("model", "")),
            "sec": round(gen.mp3_duration(path), 2),
            "by": e.get("requestedBy", "المنهج"),
            "verdict": verdicts.get(text, {}).get("verdict", ""),
        })
    # **والمعادُ ينضمّ من مجلَّد انتظاره** — لا من الفهرس: فهو لم يدخله ولا يدخله قبل اللفظ.
    for text, rec in staged.items():
        path = ROOT_OF(rec.get("file", ""))
        if not path or not path.exists():
            print(f"  ⚠ معادٌ مقيَّدٌ ولا ملفَ له: «{text}» ({rec.get('file')})", file=sys.stderr)
            continue
        cat = cats.get(text, "phoneme")
        lang = gen.CATEGORY_LANG.get(cat, "en")
        say = gen.speech_form(text, cat)
        out.append({
            "key": gen.key_for(text),
            "rid": f"{gen.key_for(text)}:{rec.get('v', '')}",
            "src": "../../" + rec.get("file", ""),
            "group": "redone",
            "v": rec.get("v", ""),
            "text": text,
            "say": "" if say == text else say,
            "cat": cat,
            "lang": lang,
            "voice": rec.get("voice") or gen.VOICES.get(lang, ""),
            "model": gen.short_model(rec.get("model", "")),
            "sec": round(gen.mp3_duration(path), 2),
            "by": rec.get("reason", ""),
            "verdict": "",
        })

    order = ["current", "redone"] + list(gen.CATEGORY_AR)
    rank = {g: i for i, g in enumerate(order)}
    if staged:      # وضعُ المقارنة: قديمُ كلِّ نصٍّ يليه جديدُه مباشرةً
        out.sort(key=lambda r: (r["text"], rank.get(r["group"], 99)))
    else:
        out.sort(key=lambda r: (rank.get(r["group"], 99), r["text"]))
    return out


def ROOT_OF(rel: str) -> Path | None:
    """مسارٌ نسبيٌّ من جذر المستودع ← مطلقاً (ولا شيء إن كان فارغاً)."""
    return (gen.ROOT / rel) if rel else None


def build(since: float = 0.0, title: str = "", texts: tuple = (),
          stage_dir: Path | None = None) -> Path:
    data = rows(since, texts, stage_dir)
    PANEL.mkdir(parents=True, exist_ok=True)
    groups = {}
    for r in data:
        groups.setdefault(r["group"], []).append(r)
    compare = any(r["group"] == "redone" for r in data)
    tabs = "".join(
        f'<button class="tab" data-cat="{g}">{GROUP_AR.get(g, g)}'
        f'<small>{len(items)} · {items[0]["voice"]}</small></button>'
        for g, items in sorted(groups.items(),
                               key=lambda kv: ["current", "redone"].index(kv[0])
                               if kv[0] in ("current", "redone") else 9))
    if compare:      # **والمقارنةُ أوّلاً**: قديمٌ فجديدٌ في شاشةٍ واحدة لا في تبويبين
        tabs = ('<button class="tab" data-cat="*">الكل — للمقارنة'
                f'<small>{len(data)} ملفاً</small></button>') + tabs
    payload = json.dumps(data, ensure_ascii=False)
    html = """<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>لوحة فحص الأصوات — اِسْمَعْ</title>
<style>
 :root { --ink:#241f1a; --paper:#faf7f2; --line:#ddd2c2; --gold:#f0e8db; --green:#2f7d4f;
         --berry:#B0326E; }
 body { font-family:"Noto Naskh Arabic","Geeza Pro",serif; margin:0; background:var(--paper);
        color:var(--ink) }
 header { position:sticky; top:0; background:var(--paper); border-bottom:1px solid var(--line);
          padding:1rem 1.5rem .6rem; z-index:5 }
 h1 { font-size:1.25rem; margin:0 0 .5rem; color:var(--berry) }
 .tabs { display:flex; flex-wrap:wrap; gap:.35rem; margin-bottom:.5rem }
 button { font-family:inherit; cursor:pointer; border:1px solid var(--line);
          border-radius:.5rem; background:#fdfaf4; padding:.35rem .8rem; font-size:.95rem }
 button.tab.on { background:var(--gold); font-weight:700 }
 button small { display:block; font-size:.62rem; color:#8a7a66; font-family:system-ui }
 .bar { display:flex; gap:.5rem; align-items:center; flex-wrap:wrap; font-family:system-ui;
        font-size:.85rem }
 input[type=search] { font-family:inherit; padding:.4rem .7rem; border:1px solid var(--line);
                      border-radius:.5rem; min-width:12rem }
 #list { padding:.5rem 1.5rem 7rem }
 .row { display:grid; grid-template-columns:2.6rem 1fr 4rem 8rem 4.4rem 4.4rem;
        align-items:center; gap:.6rem; padding:.4rem .5rem; border-bottom:1px solid #eee6da }
 .row:hover { background:#fff }
 .row.playing { background:#eaf3ec }
 .row.good { background:#eef6f0 }
 .row.bad { background:#fbeee8 }
 .t { font-size:1.15rem; line-height:1.8 }
 .t[dir=ltr] { font-family:"Andika","Segoe UI",system-ui; font-size:1.05rem }
 .say { font-size:.72rem; color:#a07a4a; margin-inline-start:.6rem; font-family:system-ui }
 .prog { height:4px; background:#e8ddcc; border-radius:2px; overflow:hidden; min-width:8rem }
 .prog i { display:block; height:100%; background:var(--green); width:0 }
 .meta { font-family:system-ui; font-size:.72rem; color:#8a7a66 }
 .play { font-size:1rem; padding:.25rem .6rem }
 .ok { font-size:.78rem; background:#eef6f0; border-color:#9cc2ab }
 .ok.on { background:var(--green); color:#fff }
 .flag { font-size:.78rem; background:#fbeee8; border-color:#d6a9a0 }
 .flag.on { background:#c0392b; color:#fff }
 footer { position:fixed; bottom:0; inset-inline:0; background:var(--ink); color:#fdfaf4;
          padding:.7rem 1.5rem; font-family:system-ui; font-size:.85rem; display:flex;
          gap:1rem; align-items:center; flex-wrap:wrap }
 footer button { background:#fdfaf4 }
 .grow { flex:1 }
 #cmd { position:fixed; inset:10% 8%; background:#fffdf8; border:1px solid var(--line);
        border-radius:.6rem; padding:1rem; overflow:auto; display:none; z-index:9;
        font-family:ui-monospace,Menlo,monospace; font-size:.78rem; white-space:pre-wrap;
        direction:ltr; text-align:left; box-shadow:0 8px 40px #0004 }
</style></head><body>
<header>
  <h1>TITLE</h1>
  <div class="tabs">TABS</div>
  <div class="bar">
    <input type="search" id="q" placeholder="ابحث عن نصّ…">
    <button id="auto">▶ شغّل بالتتابع</button>
    <label>السرعة <select id="rate">
      <option value="0.85">٠٫٨٥×</option><option value="1" selected>١×</option>
      <option value="1.25">١٫٢٥×</option><option value="1.5">١٫٥×</option></select></label>
    <label><input type="checkbox" id="hideJudged"> أخفِ ما حكمتُ فيه</label>
    <span class="grow"></span>
    <span class="prog"><i id="bar"></i></span>
    <span id="stat"></span>
  </div>
</header>
<div id="list"></div>
<pre id="cmd" onclick="this.style.display='none'"></pre>
<footer>
  <span id="tally">لم يُحكَم في شيء</span>
  <button id="cmds">أخرِج الأحكام أوامرَ</button>
  <button id="clearbad">امسح المردود</button>
  <button id="reset">امسح الأحكام كلَّها</button>
  <span class="grow"></span>
  <span id="whence">الملف يُشغَّل من <code>app/audio</code> — واللوحةُ لا تغيّر شيئاً</span>
</footer>
<script>
const DATA = PAYLOAD;
const COMPARE = IS_COMPARE;
const KEY_GOOD = 'panel.good', KEY_BAD = 'panel.bad';
const good = new Set(JSON.parse(localStorage.getItem(KEY_GOOD) || '[]'));
const bad = new Set(JSON.parse(localStorage.getItem(KEY_BAD) || '[]'));
let cat = COMPARE ? '*' : (DATA.length ? DATA[0].group : ''), auto = false, cur = null, curRow = null;

/** هُويّةُ الحكم — **مفتاحٌ وبصمةُ صوته**: يسقط الحكمُ متى تبدّل الصوت. */
const idOf = (r) => `${r.key}:${r.v}`;
const $ = (s) => document.querySelector(s);
const save = () => {
  localStorage.setItem(KEY_GOOD, JSON.stringify([...good]));
  localStorage.setItem(KEY_BAD, JSON.stringify([...bad]));
};
const judged = (id) => good.has(id) || bad.has(id);

function visible() {
  const q = $('#q').value.trim();
  return DATA.filter((r) => (cat === '*' || r.group === cat)
    && (!q || r.text.includes(q))
    && !($('#hideJudged').checked && judged(idOf(r))));
}

function render() {
  const items = visible();
  $('#list').innerHTML = items.map((r) => `
    <div class="row ${good.has(idOf(r)) ? 'good' : ''} ${bad.has(idOf(r)) ? 'bad' : ''}" data-rid="${r.rid}">
      <button class="play" data-rid="${r.rid}">▶</button>
      <div class="t" dir="${r.lang === 'en' ? 'ltr' : 'rtl'}">${r.text}${
        COMPARE ? `<span class="say">${r.group === 'redone' ? 'المعاد' : 'القائم'}</span>` : ''}${
        r.say ? `<span class="say">أُرسل: ${r.say}</span>` : ''}</div>
      <div class="meta">${r.sec}ث</div>
      <div class="meta">${r.voice} · ${r.model || '—'}${
        r.verdict ? `<br>حُكم: ${r.verdict}` : ''}</div>
      <button class="ok ${good.has(idOf(r)) ? 'on' : ''}" data-ok="${idOf(r)}">✓ قُبِل</button>
      <button class="flag ${bad.has(idOf(r)) ? 'on' : ''}" data-flag="${idOf(r)}">⚑ رُدَّ</button>
    </div>`).join('');
  const done = items.filter((r) => judged(idOf(r))).length;
  $('#stat').textContent = `${done}/${items.length} حُكم فيه هنا · ${good.size} قُبِل و${bad.size} رُدَّ من ${DATA.length}`;
  $('#tally').textContent = (good.size || bad.size)
    ? `${good.size} مقبولاً · ${bad.size} مردوداً · ${DATA.length - good.size - bad.size} معلَّقاً`
    : 'لم يُحكَم في شيء';
  $('#bar').style.width = `${Math.round(100 * (good.size + bad.size) / (DATA.length || 1))}%`;
}

function play(rid, then) {
  const r = DATA.find((x) => x.rid === rid);
  if (!r) return;
  if (cur) cur.pause();
  if (curRow) curRow.classList.remove('playing');
  curRow = document.querySelector(`.row[data-rid="${rid}"]`);
  if (curRow) curRow.classList.add('playing');
  cur = new Audio(r.src);
  cur.playbackRate = +$('#rate').value;
  cur.onended = () => { if (then) then(); };
  cur.onerror = () => { if (then) then(); };
  cur.play();
}

function playFrom(i) {
  const items = visible();
  if (!auto || i >= items.length) { auto = false; $('#auto').textContent = '▶ شغّل بالتتابع'; return; }
  play(items[i].rid, () => setTimeout(() => playFrom(i + 1), 500));
}

/** الأحكامُ أوامرَ جاهزة — المقبولُ يُقيَّد بياناً، والمردودُ يعود إلى الانتظار. */
function commands() {
  const esc = (s) => s.replace(/"/g, '\\\\"');
  const okTexts = DATA.filter((r) => good.has(idOf(r)) && r.group !== 'redone');
  const badTexts = DATA.filter((r) => bad.has(idOf(r)) && r.group !== 'redone');
  const okNew = DATA.filter((r) => good.has(idOf(r)) && r.group === 'redone');
  const badNew = DATA.filter((r) => bad.has(idOf(r)) && r.group === 'redone');
  const lines = ['# ——— حكمُ الأذن (يُنفَّذ من جذر المستودع) ———'];
  if (okNew.length) {
    lines.push('', `# قُبِل المعادُ في ${okNew.length} — **وبه وحدَه يُقلَب الفهرسان**:`);
    lines.push(`python3 tools/generate_audio.py --adopt "${okNew.map((r) => esc(r.text)).join(',')}" --note "لفظ المالك هنا"`);
    for (const r of okNew) {
      lines.push(`python3 tools/generate_audio.py --verdict "${esc(r.text)}=قُبِل المعاد بالأذن"`);
    }
  }
  if (badNew.length) {
    lines.push('', `# رُدَّ المعادُ في ${badNew.length} — **القائمُ يبقى كما هو**، ورميةٌ بتعليمةٍ أخرى:`);
    lines.push(`# عدّل style_hint في tools/audio_queue.json ثم:`);
    lines.push(`.venv/bin/python tools/generate_audio.py --restage "${badNew.map((r) => esc(r.text)).join(',')}" --restage-reason "ردُّ الأذن على المعاد"`);
  }
  if (okTexts.length) {
    lines.push('', `# قُبِل ${okTexts.length}:`);
    for (const r of okTexts) {
      lines.push(`python3 tools/generate_audio.py --verdict "${esc(r.text)}=قُبِل بالأذن"`);
    }
  }
  if (badTexts.length) {
    lines.push('', `# رُدَّ ${badTexts.length} — رميةً بالتعليمة نفسِها:`);
    lines.push(`python3 tools/generate_audio.py --requeue "${badTexts.map((r) => esc(r.text)).join(',')}" --requeue-reason "حكم الأذن"`);
    lines.push('# ثم:  .venv/bin/python tools/generate_audio.py --from-queue');
  }
  if (okTexts.length + badTexts.length + okNew.length + badNew.length === 0) lines.push('# لا حكمَ بعد.');
  return lines.join('\\n');
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.classList.contains('tab')) {
    cat = t.dataset.cat;
    document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('on', b === t));
    render(); return;
  }
  if (t.dataset.rid) { auto = false; play(t.dataset.rid); return; }
  if (t.dataset.ok) {
    const k = t.dataset.ok;
    if (good.has(k)) good.delete(k); else { good.add(k); bad.delete(k); }
    save(); render(); return;
  }
  if (t.dataset.flag) {
    const k = t.dataset.flag;
    if (bad.has(k)) bad.delete(k); else { bad.add(k); good.delete(k); }
    save(); render(); return;
  }
  if (t.id === 'auto') {
    auto = !auto;
    t.textContent = auto ? '⏸ أوقف' : '▶ شغّل بالتتابع';
    if (auto) {
      const items = visible();
      const start = items.findIndex((r) => !judged(idOf(r)));
      playFrom(start < 0 ? 0 : start);
    } else if (cur) cur.pause();
    return;
  }
  if (t.id === 'cmds') {
    const box = $('#cmd');
    box.textContent = commands();
    box.style.display = 'block';
    navigator.clipboard?.writeText(commands());
    return;
  }
  if (t.id === 'clearbad') {
    if (confirm('يُمسح المردودُ وحدَه (لا المقبول). أتمضي؟')) { bad.clear(); save(); render(); }
    return;
  }
  if (t.id === 'reset') {
    if (confirm('تُمسح الأحكامُ كلُّها (المقبولُ والمردود). أتمضي؟')) {
      good.clear(); bad.clear(); save(); render();
    }
  }
});
$('#q').addEventListener('input', render);
$('#hideJudged').addEventListener('change', render);
$('#rate').addEventListener('change', () => { if (cur) cur.playbackRate = +$('#rate').value; });
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'Space' && curRow) { e.preventDefault(); play(curRow.dataset.rid); }
  if ((e.key === 'c' || e.key === 'a') && curRow) {
    const k = idOf(DATA.find((x) => x.rid === curRow.dataset.rid));
    if (good.has(k)) good.delete(k); else { good.add(k); bad.delete(k); }
    save(); render();
  }
  if (e.key === 'x' && curRow) {
    const k = idOf(DATA.find((x) => x.rid === curRow.dataset.rid));
    if (bad.has(k)) bad.delete(k); else { bad.add(k); good.delete(k); }
    save(); render();
  }
});
document.querySelector('.tab')?.classList.add('on');
if (COMPARE) {
  $('#whence').innerHTML = 'القائمُ من <code>app/audio</code> والمعادُ من مجلَّد انتظاره خارج <code>app/</code>'
    + ' — واللوحةُ لا تغيّر شيئاً، ولا يُقلَب فهرسٌ إلا بأمرِ الاستبدال بلفظك';
}
render();
</script></body></html>"""
    html = (html.replace("TABS", tabs).replace("PAYLOAD", payload)
            .replace("IS_COMPARE", "true" if compare else "false")
            .replace("TITLE", title or "لوحة فحص الأصوات — اسمع واحكم ملفاً ملفاً"))
    out = PANEL / "index.html"
    out.write_text(html, encoding="utf-8")
    print(f"اللوحة: {out}  ({len(data)} ملفاً في {len(groups)} أقسام)")
    for c, items in groups.items():
        print(f"  · {GROUP_AR.get(c, c)}: {len(items)} — {items[0]['voice']}"
              f" ({gen.CATEGORY_LANG.get(items[0]['cat'], '؟')})")
    return out


class Panel(socketserver.TCPServer):
    """**والمنفذُ يُعاد استعمالُه فوراً** (‏`SO_REUSEADDR` — عيبٌ أمسكه استعمالٌ حيّ):

    `TCPServer` يترك `allow_reuse_address = False` بخلاف `HTTPServer`. فمن أوقف
    اللوحةَ ثم أرادها من فوره وجد المنفذَ «مشغولاً» دقائقَ — والمقبسُ الميت في
    `TIME_WAIT` لا خادمَ يعمل. وهو ما يدفع إلى تركِ منافذَ عالقة وانتقاءِ منفذٍ جديدٍ
    كلَّ مرّة، حتى تُنسى خوادمُ جلساتٍ مضت تعمل في الخلفية. فسطرٌ واحد يكفيه.
    """

    allow_reuse_address = True


def serve(port: int = 8110) -> None:
    class H(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=str(gen.ROOT), **kw)

        def log_message(self, *a):
            pass

    try:
        srv = Panel(("127.0.0.1", port), H)
    except OSError as e:
        # **والعثرةُ تُقال بعلاجها**: منفذٌ يشغله خادمٌ آخرُ يعمل فعلاً — يُسمّى ويُقترح
        # بديلُه، فلا يُقرأ الخطأُ الخام في طرفيّة من يريد أن يسمع.
        sys.exit(f"المنفذ {port} مشغولٌ بخادمٍ آخر ({e}).\n"
                 f"  · اعرف من يشغله:  lsof -nP -iTCP:{port} -sTCP:LISTEN\n"
                 f"  · أو اختر غيره:   python3 tools/audio_panel.py --serve --port {port + 1}")
    with srv:
        print(f"افتح: http://127.0.0.1:{port}/scratch/panel/index.html   (Ctrl+C للإيقاف)")
        srv.serve_forever()


def main() -> int:
    ap = argparse.ArgumentParser(description="لوحةُ فحص الأصوات — الحكمُ بالأذن")
    ap.add_argument("--serve", action="store_true")
    ap.add_argument("--since", default="",
                    help="لا تُدرج إلا ما كُتب بعد هذا الملف الشاهد (أو طابع زمني)")
    ap.add_argument("--title", default="")
    ap.add_argument("--texts", default="",
                    help="تصفيةٌ بنصوصٍ بعينها مفصولةً بفاصلة — دفعةٌ تُعرَض وحدَها")
    ap.add_argument("--stage-dir", default="",
                    help="ضمُّ المعاد المنتظِر في هذا المجلَّد إلى جوار القائم (قسما مقارنة)")
    ap.add_argument("--port", type=int, default=8110)
    args = ap.parse_args()
    since = 0.0
    if args.since:
        marker = Path(args.since)
        since = marker.stat().st_mtime if marker.exists() else float(args.since)
    texts = tuple(t.strip() for t in args.texts.split(",") if t.strip())
    build(since, args.title, texts, (gen.ROOT / args.stage_dir) if args.stage_dir else None)
    if args.serve:
        serve(args.port)
    return 0


if __name__ == "__main__":
    sys.exit(main())
