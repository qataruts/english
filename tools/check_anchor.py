#!/usr/bin/env python3
"""مرساةُ القسم في متصفّحٍ حقيقيّ — أتُرى ترويسةُ `#pace` بعد النقر، أم يبتلعها الشريط؟

    python3 tools/check_anchor.py            # قياسٌ في Chrome بلا واجهة (يخرج بـ١ عند الابتلاع)
    python3 tools/check_anchor.py --self-test  # فحصٌ ذاتيّ بلا شبكة ولا متصفّح

————— العلّة (درسُ احسب — بلاغ `2026-08-17-calc-silent-guard-and-sticky-anchor`) —————

رابطُ شريط الإنصاف ينزل إلى `#pace`، **وشريطُ التنقّل لاصقٌ في أعلى الصفحة**
(`.w-top { position: sticky }`). فإن كان `scroll-margin-top` أصغرَ من ارتفاعه وقعت
الترويسةُ **تحته** فابتُلعت — والقارئُ يظنّ أنّ الرابط لم يعمل. **وهو صنفُ «يعمل ولا
يبدو أنّه عمل»، أخطرُ من رابطٍ ميت**: لا حمرةَ ولا شكوى، ووالدٌ ينصرف.

**ولا يمسكه جردُ قرص**: الارتفاعُ حاصلُ خطٍّ ولفٍّ وخطوطٍ محمَّلة — لا يُعرَف إلا
بالقياس، **ويختلف بالعرض** (روابطُ الشريط تلتفّ على الضيّق فيعلو). فيُقاس في عروضٍ
عدة، ويُقابَل الأصغرُ من الفسحة بأكبر ارتفاعٍ مقيس.

**ويقيس معه تباينَ شريط الإنصاف** (القاعدةُ المرافقة — «مَن لا يقيس يقول لم أقس»):
لا عدّةَ تباينٍ في شجرتنا، وخلفيةُ الشريط `color-mix` — وهو بعينه ما خرج صامتاً من
قياس احسب أمس. فيُقرأ اللونُ **محسوباً من المحرّك نفسِه** لا من قيمةٍ مكتوبة، نهاراً
وليلاً: والليليُّ يُقاس بحقن قيم اللوح الليلي — **مقروءةً من `@media` نفسِها في
`app.css`** — على الجذر، فيمزجها المحرّكُ كما يمزجها ليلاً.
"""

import argparse
import http.server
import socketserver
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / 'app'
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

# العروضُ المقيسة (بكسل CSS): هاتفٌ ضيّق، وهواتفُ، وآيبادات، وحاسوب — وعلى الضيّق
# تلتفّ روابطُ الشريط فيعلو، وهو الحالُ الأسوأ الذي يبتلع الترويسة.
WIDTHS = [320, 360, 414, 744, 834, 1024, 1280]
HEIGHT = 900
AA = 4.5          # حدُّ WCAG AA لنصّ المتن
collected: list[str] = []

PAGE = """<!doctype html><meta charset="utf-8"><title>قياسُ المرساة</title>
<body style="margin:0">
<script>
const WIDTHS = __WIDTHS__, HEIGHT = __HEIGHT__;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** نسبةُ التباين من لونين مُحسَبين — صيغةُ WCAG.
 *  **والصيغتان تُقرآن**: `rgb(0-255)` و`color(srgb 0-1)` — وهذه صيغةُ `color-mix`
 *  في Chrome. وقراءةُ الثانية بمسطرة الأولى تجعل كلَّ سطحٍ ممزوجٍ **أسودَ** فيخرج
 *  رقمٌ كاذب: أحمرُ كاذبٌ هنا، وكان يمكن أن يكون أخضرَ كاذباً — وهو عينُ عيب احسب. */
function ratio(a, b) {
  const lum = (css) => {
    const scale = css.startsWith('color(') ? 1 : 255;
    const nums = css.replace(/^color\\(srgb/, '').match(/[\\d.]+/g).slice(0, 3).map(Number);
    const [r, g, b] = nums.map((v) => v / scale)
      .map((v) => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    return .2126 * r + .7152 * g + .0722 * b;
  };
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + .05) / (y + .05);
}

async function frameAt(width) {
  const f = document.createElement('iframe');
  f.style.cssText = `width:${width}px;height:${HEIGHT}px;border:0;display:block`;
  f.src = '/welcome/';
  document.body.append(f);
  await new Promise((r) => f.addEventListener('load', r, { once: true }));
  if (f.contentDocument.fonts) await f.contentDocument.fonts.ready;
  await wait(120);
  return f;
}

/** قيمُ اللوح الليليّ **من `@media` نفسِها** — لا مكتوبةً هنا بيد. */
function darkVars(doc) {
  for (const sheet of doc.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of rules) {
      if (rule.media && /prefers-color-scheme: *dark/.test(rule.conditionText || rule.media.mediaText)) {
        for (const inner of rule.cssRules) if (inner.selectorText === ':root') return inner.style.cssText;
      }
    }
  }
  return '';
}

(async () => {
  const out = [];
  for (const width of WIDTHS) {
    const f = await frameAt(width);
    const doc = f.contentDocument;
    const bar = doc.querySelector('.w-top');
    const link = doc.querySelector('.w-band-link');
    const head = doc.querySelector('#pace > h2');
    if (!bar || !link || !head) { out.push({ width, error: 'عنصرٌ مفقود' }); f.remove(); continue; }
    const barH = bar.getBoundingClientRect().height;
    link.click();
    await wait(250);
    const box = head.getBoundingClientRect();
    const style = getComputedStyle(doc.querySelector('.w-section'));
    out.push({
      width,
      bar: +barH.toFixed(1),
      margin: style.scrollMarginTop,
      top: +box.top.toFixed(1),
      clear: +(box.top - barH).toFixed(1),
      whole: box.bottom <= f.clientHeight,
    });
    f.remove();
  }

  // التباين: الحبرُ على سطح الشريط نفسِه (لا على ورق الصفحة) — نهاراً وليلاً
  const f = await frameAt(1024);
  const doc = f.contentDocument;
  const band = doc.querySelector('.w-band');
  const link = doc.querySelector('.w-band-link');
  const read = () => {
    const s = getComputedStyle(band), l = getComputedStyle(link);
    return { bg: s.backgroundColor, ink: +ratio(s.color, s.backgroundColor).toFixed(2),
             linkInk: +ratio(l.color, s.backgroundColor).toFixed(2) };
  };
  const day = read();
  const vars = darkVars(doc);
  const style = doc.createElement('style');
  style.textContent = `:root{${vars}}`;
  doc.head.append(style);
  await wait(60);
  const night = read();
  const measured = Boolean(vars);
  f.remove();

  fetch('/__anchor', { method: 'POST', body: JSON.stringify({ rows: out, day, night, measured }) });
})();
</script>
"""


def contrast_lines(day: dict, night: dict, measured: bool) -> list:
    """سطورُ تقرير التباين — دالّةٌ خالصة تُجرَّب بلا متصفّح."""
    lines = []
    for name, got in (('نهاراً', day), ('ليلاً', night)):
        for what, key in (('حبرُ المتن', 'ink'), ('حبرُ الرابط', 'linkInk')):
            value = got[key]
            mark = '✓' if value >= AA else '✗'
            lines.append(f'  {mark} {what} {name} على سطح الشريط: {value}:١'
                         f' (الحدُّ {AA}:١)')
    if not measured:
        lines.append('  ✗ **لم أقس الليليّ**: لم أجد قيمَ اللوح الليلي في اللوح')
    return lines


def verdict(rows: list) -> tuple:
    """الحكمُ من الصفوف المقيسة: (أخضرُ؟، سطورٌ تُطبَع) — خالصةٌ تُجرَّب بصفوفٍ مصنوعة."""
    lines, good = [], True
    for row in rows:
        if row.get('error'):
            good = False
            lines.append(f"  ✗ {row['width']}بك — {row['error']}")
            continue
        ok = row['clear'] >= 0 and row['whole']
        good = good and ok
        lines.append(f"  {'✓' if ok else '✗'} {row['width']}بك · الشريطُ {row['bar']}بك"
                     f" · الفسحةُ {row['margin']} · ترويسةُ #pace عند {row['top']}بك"
                     f" (فوق الشريط بـ{row['clear']}بك)"
                     + ('' if ok else ' — **مبتلَعة**'))
    return good, lines


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(APP), **kw)

    def do_GET(self):                                     # noqa: N802 (واجهة المكتبة)
        if self.path.startswith('/__anchor.html'):
            body = (PAGE.replace('__WIDTHS__', str(WIDTHS))
                    .replace('__HEIGHT__', str(HEIGHT)).encode('utf-8'))
            self.send_response(200)
            self.send_header('content-type', 'text/html; charset=utf-8')
            self.send_header('content-length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        return super().do_GET()

    def do_POST(self):                                    # noqa: N802
        if self.path != '/__anchor':
            return self.send_error(404)
        size = int(self.headers.get('content-length') or 0)
        collected.append(self.rfile.read(size).decode('utf-8'))
        self.send_response(204)
        self.end_headers()

    def log_message(self, *a):
        pass


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


def run(port: int, timeout: int) -> int:
    import json
    if not Path(CHROME).exists():
        print('✗ لم أجد Chrome — لا قياسَ بلا متصفّحٍ حقيقيّ')
        return 1
    server = Server(('127.0.0.1', port), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    # (وكنسُ ملفّ التعريف يتسامح: Chrome يكتب فيه وهو يُغلَق — عيبُ سباقٍ لا قياس)
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as profile:
        proc = subprocess.Popen(
            [CHROME, '--headless=new', '--disable-gpu', '--no-first-run',
             f'--user-data-dir={profile}', f'http://127.0.0.1:{port}/__anchor.html'],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        deadline = time.time() + timeout
        while not collected and time.time() < deadline:
            time.sleep(0.2)
        proc.terminate()
    server.shutdown()
    if not collected:
        print(f'✗ لم تصل أرقامٌ خلال {timeout} ثانية')
        return 1

    data = json.loads(collected[0])
    print('— مرساةُ `#pace` تحت الشريط اللاصق: مقيسةٌ في متصفّحٍ حقيقيّ —')
    good, lines = verdict(data['rows'])
    print('\n'.join(lines))
    print('\n— وتباينُ شريط الإنصاف (لا عدّةَ تباينٍ عندنا — فهذا قياسُه) —')
    print('\n'.join(contrast_lines(data['day'], data['night'], data['measured'])))
    colors = [data['day']['ink'], data['day']['linkInk'],
              data['night']['ink'], data['night']['linkInk']]
    good = good and data['measured'] and all(v >= AA for v in colors)
    print('\n✓ المرساةُ تُرى والتباينُ فوق الحدّ' if good else '\n✗ قياسٌ دون الحدّ')
    return 0 if good else 1


def self_test() -> int:
    fails = 0

    def ok(cond, msg):
        nonlocal fails
        print(('  ✓ ' if cond else '  ✗ ') + msg)
        if not cond:
            fails += 1

    print('— فحصُ الفاحص: أيمسك المدسوس؟ —')
    swallowed = [{'width': 834, 'bar': 54.0, 'margin': '24px', 'top': 20.0,
                  'clear': -34.0, 'whole': True}]
    seen = [{'width': 834, 'bar': 54.0, 'margin': '80px', 'top': 60.0,
             'clear': 6.0, 'whole': True}]
    ok(verdict(swallowed)[0] is False, '**ترويسةٌ تقع تحت الشريط تُمسَك** (فسحةٌ دون ارتفاعه)')
    ok(verdict(seen)[0] is True, '  وترويسةٌ تُرى كاملةً تمرّ')
    ok(verdict([{'width': 834, 'error': 'عنصرٌ مفقود'}])[0] is False,
       'وسقوطُ الشريط أو رابطِه يُمسَك هنا أيضاً')
    low = {'ink': 3.1, 'linkInk': 9.0}
    ok(any('✗' in line for line in contrast_lines(low, low, True)),
       '**وتباينٌ دون الحدّ يُمسَك** — لا يخرج لونٌ من القياس صامتاً')
    ok(any('لم أقس' in line for line in contrast_lines(low, low, False)),
       'ومن لم يجد اللوحَ الليليّ **يقول «لم أقس»** ولا يسكت')
    print(f'\n{fails} فشل' if fails else '\n✓ الفاحصُ يمسك المدسوسَ كلَّه')
    return 1 if fails else 0


def main() -> int:
    ap = argparse.ArgumentParser(description='قياسُ مرساة القسم وتباينِ الشريط')
    ap.add_argument('--self-test', action='store_true', help='فحصٌ ذاتيّ بلا متصفّح')
    ap.add_argument('--port', type=int, default=8897)
    ap.add_argument('--timeout', type=int, default=90)
    args = ap.parse_args()
    return self_test() if args.self_test else run(args.port, args.timeout)


if __name__ == '__main__':
    sys.exit(main())
