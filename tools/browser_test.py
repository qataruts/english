#!/usr/bin/env python3
"""تشغيل اختبارات الواجهة في متصفّح حقيقي (Chrome بلا واجهة) بلا أي تبعيات.

    python3 tools/browser_test.py             # يسوق التطبيق ويطبع التقرير
    python3 tools/browser_test.py --shots out.png   # لقطة للمراجعة البصرية
    python3 tools/browser_test.py --device    # مقاسات الآيباد الخمسة: فائضٌ أفقيّ؟
    python3 tools/browser_test.py --show      # بمتصفّح مرئي لتتبّع ما يجري

————— بذرةُ المنصة (منسوخٌ من «اِقْرَأْ» ومكيَّف) —————
البنيةُ منه: خادمٌ صغير يخدم مجلد `app/` ويضيف صفحاتِ الاختبار وحدها من هذا المجلد،
وتُرسَل النتائجُ من الصفحة نفسها بـ`POST /result` ثم يُقتل المتصفّح. فلا تبقى في
`app/` صفحةُ اختبارٍ تُخدَم للطفل. ويخدم `/__queue.json` (نصوص قائمة الانتظار
الصوتية) كي تستثنيها الصفحاتُ من فحص «لا لجوء للنطق الآلي».

ملاحظة: `--dump-dom` و`--virtual-time-budget` غير موثوقين مع fetch والصوت، لذلك
تُرسَل النتائج من الصفحة نفسها.
"""

import argparse
import hashlib
import http.server
import json
import os
import re
import shutil
import signal
import socketserver
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "app"
TOOLS = Path(__file__).resolve().parent
QUEUE_FILE = TOOLS / "audio_queue.json"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
# بصمةُ صفحاتنا في تقرير النتيجة — تُقرأ في `do_POST` وتُفحَص في `--self-test`
REPORT_FROM = "english"

# **والمرجعُ التعريفيّ (`__welcome.html`) يدخل هنا في الجلسة ٩** بصفحته — يُقاس في
# متصفّحٍ حقيقيّ لأنّ ثلاثةً من شروطه لا يراها فحصُ نصّ: الطلبُ الشبكيّ الخارجيّ،
# والتمريرُ الأفقيّ، وابتلاعُ عامل الخدمة للصفحة بعد تفعيله.
PAGES = {
    "/__test.html": TOOLS / "browser_test.html",
    "/__device.html": TOOLS / "browser_device.html",
}

# مقاسات الآيباد الخمسة (نقاط CSS، طولاً) — عليها تُقاس الشاشات في `--device`.
# **بلا فائض أفقي** عهدٌ مطلق (`METHOD.md §١٠.٧`): طفلُ الرابعة لا يسحب ليجد زرّاً.
IPADS = [
    ("iPad mini", "744,1133"),
    ("iPad 10.2", "810,1080"),
    ("iPad Air 10.9", "820,1180"),
    ("iPad Pro 11", "834,1194"),
    ("iPad Pro 12.9", "1024,1366"),
]
VIEWPORT_PAD = 87   # فرقُ نافذة Chrome عن منظورها (شريطُ العنوان في الوضع المرئي)


def pending_texts() -> list:
    """**ما يُعذَر أن ينطقه الطفلُ اليوم** — تُخدَم على `/__queue.json`.

    صفحاتُ الاختبار تستثني هذه من فحص «لا نصَّ يُنطَق خارج قائمة الصوت»، وهما صنفان
    لا ثالث (`docs/AUDIO_QUEUE.md`):

      • **منتظِرٌ في القائمة**: لا ملفَّ له بعدُ لأنّ جلسةَ الصوتيات لم تصرّفه، فاحتياطُ
        النطق هو السلوك الصحيح مؤقتاً.
      • **ومُصرَّفٌ له ملفٌّ على القرص**: يُسمَع من ملفّه لا من الاحتياط.

    **وأُضيف الصنفُ الثاني يومَ بدأ البنكُ يُولَّد** (الجلسة ص): كان الشرطُ «منتظِرٌ»
    وحدَه لأنّ البنك كان صفراً، فأولُ ملفٍّ وُلِّد صار نصُّه **شارداً** في نظر الفحص —
    وهو أصحُّ ما يكون. والصفحةُ لم تُمَسّ بحرف كما وُعد في نصّها: **الخادمُ يقرّر
    ما يُعذَر**. والحكمُ يبقى صارماً على ما لا ملفَّ له ولا صفَّ: `done` سقط ملفُّه
    من القرص يظهر شارداً كما ينبغي.
    """
    if not QUEUE_FILE.exists():
        return []
    try:
        data = json.loads(QUEUE_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []
    out = []
    for e in data:
        if not isinstance(e, dict) or not e.get("text"):
            continue
        if e.get("status", "pending") != "done":
            out.append(e["text"])
            continue
        key = hashlib.sha1(e["text"].encode("utf-8")).hexdigest()[:12]
        if (APP / "audio" / f"{key}.mp3").exists():
            out.append(e["text"])
    return out


def make_server(port: int, results: list):
    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=str(APP), **kw)

        def do_GET(self):
            path, _, _query = self.path.partition("?")
            if path == "/__queue.json":
                body = json.dumps(pending_texts(), ensure_ascii=False).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return
            page = PAGES.get(path)
            if page and page.exists():
                body = page.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return
            super().do_GET()

        def do_POST(self):
            raw = self.rfile.read(int(self.headers.get("Content-Length", 0)))
            # **ولا تُقرَأ نتيجةٌ إلا من صفحتنا** (`REPORT_FROM`): تطبيق الإنكليزية و«اِقْرَأْ»
            # في مساحة عملٍ واحدة وعدّتُهما من بذرةٍ واحدة، فإن سبق أحدُهما إلى المنفذ
            # أرسل متصفّحُ الآخر تقريرَه **إلى خادمنا** فقرأناه تقريرَنا — أخضرَ كاذباً
            # أو أحمرَ بلا سبب. فالبصمةُ تُغلق البابَ بنيوياً: غريبٌ يُهمَل، وتنتهي
            # المهلةُ بجملة «لم تصل نتيجة» الصادقة بدل تقريرِ جارٍ يُقرأ تقريرَنا.
            try:
                body = json.loads(raw.decode("utf-8"))
                if isinstance(body, dict) and body.get("from") == REPORT_FROM:
                    results[:] = body.get("rows") or []
            except json.JSONDecodeError:
                pass
            self.send_response(204)
            self.end_headers()

        def log_message(self, *a):
            pass

    class Quiet(socketserver.TCPServer):
        allow_reuse_address = True

        def handle_error(self, request, client_address):
            """المتصفّحُ يُقتل وسط نقلِ ملفّ فينكسر الأنبوب — **ضجيجٌ لا عطب**.

            وأثرُه ليس جمالياً: أثرُ مكدَّسٍ من عشرين سطراً يطبعه الخادمُ فوق تقرير
            الفحص يدفع القارئَ إلى تخطّي المخرَج، فيمرّ فشلٌ حقيقيّ تحت الضجيج.
            وما سوى انكسارِ الأنبوب يبقى معروضاً كما كان.
            """
            kind = sys.exc_info()[0]
            if kind and issubclass(kind, (BrokenPipeError, ConnectionResetError)):
                return
            super().handle_error(request, client_address)

    try:
        return Quiet(("127.0.0.1", port), Handler)
    except OSError as e:
        # **والمنفذُ المشغول يُقال ولا يُصمَت عنه**: كان الخادمُ يرتمي أثرَ مكدَّسٍ في
        # `stderr`، والسائقُ (`guards.mjs`) يقرأ حصيلتَه من `stdout` — فيظهر الحارسُ
        # **أحمرَ بلا سببٍ مقروء** ويُظنّ عطباً في الشيفرة وهو منفذٌ يشغله جارٌ لحظةً.
        sys.exit(f"تعذّر فتحُ خادم الفحص على المنفذ {port}: {e}\n"
                 f"  — منفذٌ مشغولٌ الآن (فحصٌ آخر يعمل؟). جرّب: --port {port + 1}")


# سوابقُ حظائرنا — كلُّ `user-data-dir` تصنعه هذه الأداة يبدأ بواحدةٍ منها،
# **وبها يصير التنظيفُ الذاتيّ آمناً بالبناء** (بلاغ العائلة: نسخةٌ باسم صاحبها).
OUR_PROFILES = ("english-browser-", "english-shot-", "english-device-")


def sweep_stale(prefixes=OUR_PROFILES) -> list:
    """نظافةُ الحظيرة عند الإقلاع — بلاغُ العائلة `2026-08-12-stale-headless-chrome.md`.

    نسخُ كروم الخفية التي خلّفتها جولاتٌ ماتت (جلسةٌ قُتلت، فحصٌ قوطع) تبقى قائمةً
    بلا نوافذ، **وماك يوجّه نقرةَ أيقونة كروم إليها فيبدو كروم المالك معطّلاً وهو
    مخطوف**. والخروجُ النظيف وحده لا يكفي — فيُكنَس الأثرُ عند الإقلاع لا عند الخروج.

    **ولا يُقتل إلا يتيمُنا نحن**: شرطان معاً — `user-data-dir` بسابقةٍ من سوابقنا
    (فلا تُقرَب نسخُ الجيران كـ`write-browser-*` ولا متصفّحُ المالك الحيّ الذي لا
    سابقةَ له أصلاً)، **ووالدُه ماتَ** (`ppid == 1`) — فنسخةُ جولةٍ حيّةٍ تعمل الآن
    والدُها بايثونُها القائم، ولا تُمَسّ.
    """
    try:
        rows = subprocess.run(["ps", "-axo", "pid=,ppid=,command="],
                              capture_output=True, text=True).stdout
    except OSError:
        return []
    swept = []
    for row in rows.splitlines():
        parts = row.strip().split(None, 2)
        if len(parts) < 3:
            continue
        pid, ppid, cmd = parts
        hit = re.search(r"--user-data-dir=(\S+)", cmd)
        if not hit or not Path(hit.group(1)).name.startswith(prefixes):
            continue
        if ppid != "1":
            continue          # والدُه حيّ: جولةٌ قائمةٌ الآن — جارُنا في الزمن لا يُمَسّ
        try:
            os.kill(int(pid), signal.SIGKILL)
            swept.append(f"{pid} ({Path(hit.group(1)).name})")
        except (OSError, ValueError):
            pass
    if swept:
        print(f"  🧹 كُنست {len(swept)} نسخة كروم يتيمة من جولات سابقة: {'، '.join(swept)}")
    return swept


def run_chrome(url: str, profile: Path, extra: list, show: bool):
    if not Path(CHROME).exists():
        sys.exit(f"لم يُعثر على Chrome في {CHROME}")
    cmd = [CHROME, f"--user-data-dir={profile}", "--no-first-run", "--no-default-browser-check"]
    if not show:
        cmd += ["--headless=new", "--disable-gpu"]
    cmd += extra + [url]
    return subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def window_of(size: str) -> str:
    """مقاس نافذةٍ يعطي منظوراً بمقاس الجهاز المطلوب تماماً."""
    w, h = (int(x) for x in size.split(","))
    return f"{w},{h + VIEWPORT_PAD}"


def device_main(args) -> int:
    """مقاسات الآيباد: **لا فائض أفقيّ** على أيٍّ منها."""
    results: list = []
    server = make_server(args.port, results)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    fails = 0
    profiles = []
    try:
        for name, size in IPADS:
            results.clear()
            # **مِلفٌّ جديد لكل مقاس**: المقتولُ يترك قفلَ ملفّه خلفه لحظاتٍ، فتنضمّ
            # اللقطةُ التالية إلى نسخةٍ ميتة بمقاسٍ ليس مقاسَها فلا تصل نتيجةٌ أبداً
            # (وتُقرأ «لم تصل نتيجة» عطبَ جهازٍ أو قِصَرَ مهلة، وليست كذلك).
            profile = Path(tempfile.mkdtemp(prefix="english-device-"))
            profiles.append(profile)
            proc = run_chrome(f"http://127.0.0.1:{args.port}/__device.html", profile,
                              [f"--window-size={window_of(size)}", "--hide-scrollbars"], args.show)
            deadline = time.time() + args.timeout
            while time.time() < deadline and not results:
                time.sleep(0.25)
            proc.kill()
            if not results:
                print(f"  ✗ {name}: لم تصل نتيجة")
                fails += 1
                continue
            row = results[0]
            over = row.get("overflow", -1)
            vw, _vh = (int(x) for x in size.split(","))
            # **وهدفُ اللمس يُحاسَب كالفائض**: كلاهما عيبُ جهازٍ لا يُرى في شجرة.
            taps = row.get("taps") or []
            floor = row.get("floor", 44)
            good = over <= 0 and row.get("width") == vw and not taps
            fails += not good
            print(("  ✓ " if good else "  ✗ ")
                  + f"{name} ({size}): منظورٌ {row.get('width')}×{row.get('height')}"
                  + f" · فائضٌ أفقيّ {over}px"
                  + (f" · أهدافُ لمسٍ دون {floor}px: {len(taps)}" if taps
                     else f" · لا هدفَ لمسٍ دون {floor}px")
                  + ("" if row.get("width") == vw else " — عايِر VIEWPORT_PAD"))
            for t in taps:
                print(f"      ↳ {t.get('side')}px — {t.get('what')}   ({t.get('at')})")
    finally:
        server.shutdown()
        for p in profiles:
            shutil.rmtree(p, ignore_errors=True)
    print(f"\n{fails} إخفاق" if fails else "\nلا فائضَ أفقيّ على أيّ مقاس آيباد.")
    return 1 if fails else 0


SCRIPT_RE = re.compile(r'<script type="module">(.*?)</script>', re.S)


def script_parses(html: str) -> tuple:
    """أيُحلَّل نصُّ الوحدة في صفحة الفحص؟ — بـ`node --check` بلا متصفّحٍ ولا شبكة."""
    scripts = SCRIPT_RE.findall(html)
    if not scripts:
        return True, ""            # صفحةٌ بلا وحدة: لا شيء يُحلَّل
    for body in scripts:
        run = subprocess.run(["node", "--input-type=module", "--check"],
                             input=body, capture_output=True, text=True)
        if run.returncode != 0:
            first = next((ln.strip() for ln in run.stderr.splitlines()
                          if "Error" in ln), run.stderr.strip()[:120])
            return False, first
    return True, ""


def self_test() -> int:
    """بلا Chrome ولا شبكة: **العدّةُ نفسُها** — أصفحاتُها موجودةٌ وموصولةٌ وتردّ؟

    العلّةُ صنفُ عيبٍ خاصّ بهذه الأداة: صفحةُ اختبارٍ لا تُرسِل نتيجتها **لا تُفشِل
    شيئاً** — تنتهي المهلةُ فيُقال «لم تصل نتيجة»، وقد يُقرأ ذلك عطبَ متصفّحٍ أو
    بطءَ جهاز فيُعاد التشغيل بمهلةٍ أطول. فتُفحَص الوصلةُ هنا صراحةً.
    """
    checks = []
    for route, page in PAGES.items():
        checks.append((page.exists(), f"صفحةُ `{route}` موجودة ({page.name})"))
        if not page.exists():
            continue
        text = page.read_text(encoding="utf-8")
        checks.append(("fetch('/result'" in text,
                       f"  و`{route}` تُرسِل نتيجتَها إلى `/result` (وإلا انتهت المهلةُ صامتة)"))
        # **وتبصمها باسمنا**: بلا البصمة يُهمِلها خادمُنا فتنتهي المهلةُ بلا نتيجة —
        # وهو أهونُ من قراءة تقرير جارٍ، لكنّه يُكشَف هنا قبل أن يُشغَّل متصفّح.
        checks.append((f"from: '{REPORT_FROM}'" in text,
                       f"  وتبصم تقريرَها باسمنا (`from: '{REPORT_FROM}'`) "
                       "— فلا يُقرأ تقريرُ جارٍ على المنفذ نفسِه"))
        checks.append(('src="/' in text,
                       f"  و`{route}` تسوق التطبيقَ نفسَه من الخادم لا نسخةً منه"))
        # **والمساقُ مبذورٌ فيصير حتمياً** (بندُ الجلسة ٩): صفحةُ الفحص الرئيسة تسوق
        # التطبيقَ بـ`?seed=` وتحمله في كل إعادة تحميل — فبلا ذلك تعود الحمرةُ
        # المتذبذبة التي عولجت (فحوصٌ تشترط سحبَ نوع جولةٍ بعينه). ويُقاس الشرطان
        # معاً: البذرةُ في العنوان، **والعنوانُ نفسُه** هو ما يُعاد التحميلُ به.
        if route == "/__test.html":
            checks.append(("src=\"/?seed=" in text,
                           "  وتسوقه **ببذرةٍ ثابتة** (`?seed=`) — فالجولاتُ حتميةٌ لا تتذبذب"))
            checks.append(("location.replace(APP_URL)" in text
                           and "const APP_URL = frame.getAttribute('src')" in text,
                           "  وتحمل البذرةَ في كل إعادة تحميلٍ للإطار (وإلّا انقطع الحبل)"))
        # **وتُحلَّل**: خطأُ صياغةٍ واحد في نصّ الصفحة يمنع تشغيلَ **كل** فحوصها بلا
        # أثر — لا خطأ في الطرفية ولا نتيجةٌ في الخادم، فيُقرأ ذلك بطءَ جهازٍ أو قِصَرَ
        # مهلة. وثمنُ كشفِه هنا نداءُ `node --check` قبل أن يُشغَّل المتصفّح أصلاً.
        ok_parse, why = script_parses(text)
        checks.append((ok_parse, f"  و`{route}` نصُّها يُحلَّل بلا خطأ صياغة"
                                 + ("" if ok_parse else f" — {why}")))

    # **الاستثناءُ الصوتيّ موصولٌ**: صفحاتُ الاختبار تستثني نصوصَ قائمة الانتظار من
    # فحص «لا لجوء للنطق الآلي» — والقائمةُ تُخدَم من هنا، فإن سقط المسارُ صار الفحصُ
    # صارماً على نصٍّ لم يُولَّد بعدُ فيُفشِل جلسةَ تطويرٍ لا ذنبَ لها.
    checks.append((QUEUE_FILE.exists(), f"وقائمةُ الانتظار الصوتية موجودة ({QUEUE_FILE.name})"))
    checks.append(("/__queue.json" in Path(__file__).read_text(encoding="utf-8"),
                   "ويخدمها الخادمُ على `/__queue.json` (استثناءُ «لا نطق آليّ» موصول)"))

    # **مقاسات الآيباد الخمسة** (`METHOD.md §١٠.٧`) — لا أربعة ولا واحد
    checks.append((len(IPADS) == 5, f"ومقاساتُ الآيباد خمسةٌ ({len(IPADS)})"))
    checks.append((all("," in size for _n, size in IPADS), "ولكلٍّ عرضُه وارتفاعُه"))
    checks.append((APP.exists() and (APP / "index.html").exists(),
                   "وجذرُ التطبيق الذي يُخدَم موجود (`app/index.html`)"))

    # **ودسّةُ التقرير نفسِه** (بندُ المراقبة، قبولُ الجلسة ٤): صفٌّ مخفقٌ بلا نصّ
    # كان يُطبَع سطراً فارغاً فيُعَدّ ولا يُسمّى. تُدسّ هنا صفوفٌ عوراءُ ويُشهَد أنّ
    # لكلٍّ اسماً يُقرأ — فلا يعود «١ إخفاق» بلا صاحبٍ ممكناً بالبناء.
    checks.append(("صفُّه الخام" in row_label({"ok": False}),
                   "وصفٌّ مخفقٌ بلا `msg` يُطبَع باسمٍ خام لا سطراً فارغاً"))
    checks.append(("صفُّه الخام" in row_label({"ok": False, "msg": "   "}),
                   "  و`msg` فارغٌ كذلك (مسافاتٌ أو `None`)"))
    checks.append(("ليس قاموساً" in row_label("صفٌّ غريب"),
                   "  وصفٌّ ليس قاموساً يُعرَض بشكله ونوعه"))
    checks.append((row_label({"ok": False, "msg": "اسمُه هنا"}) == "اسمُه هنا",
                   "  والصفُّ السليم يبقى كما هو"))

    bad = [m for good, m in checks if not good]
    for good, m in checks:
        print(("  ✓ " if good else "  ✗ ") + m)
    print("\n" + ("عدّةُ المتصفّح سليمة (بلا Chrome ولا شبكة)." if not bad else f"{len(bad)} فشل"))
    return 1 if bad else 0


def row_label(row) -> str:
    """اسمُ الصفّ كما يُقرأ — وما لا اسمَ له يُعرَض **خاماً** لا فارغاً."""
    if isinstance(row, dict):
        msg = row.get("msg")
        if isinstance(msg, str) and msg.strip():
            return msg
        return ("فحصٌ بلا نصٍّ يسمّيه — صفُّه الخام: "
                + json.dumps(row, ensure_ascii=False)[:300])
    return f"صفٌّ ليس قاموساً ({type(row).__name__}): {str(row)[:300]}"


def report_rows(rows: list) -> int:
    """طباعةُ صفوف التقرير — **وكلُّ إخفاقٍ يُطبَع سطرُه أياً كان شكلُ صفّه**.

    عيبٌ أمسكه بندُ المراقبة في قبول الجلسة ٤: جولتان خُتمتا «١ إخفاق» **بلا سطر
    ✗ يسمّي صاحبَه** — فتقريرٌ يَعُدّ ولا يُسمّي لا يُشخَّص به شيء، والحارسُ الذي
    لا يُقرأ إخفاقُه حارسٌ مهدور. والعلّةُ ثقةٌ بشكل الصفّ: كان السطرُ يفترض
    قاموساً بمفتاح `msg` نصّاً، فصفٌّ بلا `msg` (أو `msg` فارغٌ أو `None` أو ليس
    نصّاً، أو صفٌّ ليس قاموساً أصلاً) يُعَدّ إخفاقاً ويُطبَع **سطراً فارغاً** يمرّ
    تحت العين. فالآن ثلاثةُ أحكام: رقمُ الصفّ يسبق كلَّ سطر (فيُرى النقصُ في
    العدد)، وما لا نصَّ له يُعرَض خاماً، **والإخفاقاتُ تُجمَع في ذيل التقرير**
    حيث تُقرأ ولو طال المخرَجُ مئةَ سطر.
    """
    fails = []
    for i, row in enumerate(rows, 1):
        good = isinstance(row, dict) and bool(row.get("ok"))
        label = row_label(row)
        print(("  ✓ " if good else "  ✗ ") + f"[{i:>3}] {label}")
        if not good:
            fails.append((i, label))
    if fails:
        print(f"\n  ✗ الإخفاقاتُ بأسمائها ({len(fails)}):")
        for i, label in fails:
            print(f"    [{i}] {label}")
    return len(fails)


def main() -> int:
    ap = argparse.ArgumentParser(description="اختبارات الواجهة في متصفّح حقيقي")
    # **ومنفذُنا غيرُ منفذ اقرأ**: العدّتان من بذرةٍ واحدة والتطبيقان في مساحة عملٍ
    # واحدة، فمنفذٌ مشترك يجعل تشغيلَ أحدهما يُفشِل الآخر بلا ذنب.
    ap.add_argument("--port", type=int, default=8793)
    # **والمهلةُ تتبع ما يُساق**: صفحةُ الفحص تسوق المحطاتِ والمراجعةَ والبوابةَ لمساً
    # بأصواتها، فكلُّ جلسةٍ تزيد شاشاتٍ تزيدها ثوانيَ. وتبقى **فوق** مهلة الصفحة
    # الحارسة كي يصل التقريرُ الناقص بدل أن يُقتَل المتصفّح صامتاً — وهي **٤٨٠ث** في
    # `browser_test.html` (رفعتها الجلسةُ ٣ من ١٥٠ مع ثمانِ محطاتٍ جديدة وبوابةٍ
    # تُقاد مرّتين، ورفعتها الجلسةُ ٤ إلى ٦٦٠، والجلسةُ ٥ إلى ٩٦٠ بسبع درجاتٍ
    # وشاهدَين ومراجعةٍ ثانية). **والرقمُ يُقرأ من هناك**: مهلةٌ هنا دون مهلة الصفحة
    # تجعل كلَّ جولةٍ بطيئة «لم تصل نتيجة» بلا سبب.
    ap.add_argument("--timeout", type=int, default=2200, help="ثوانٍ قبل الاستسلام")
    ap.add_argument("--shots", metavar="PNG", help="لقطة للمراجعة البصرية بدل الاختبارات")
    # **المراجعةُ البصرية تحتاج الشاشةَ بعينها**: لقطةُ الجذر تُري الخريطةَ وحدَها،
    # وشاشاتُ المحطات خلف مسارها — فتُساق بمسارها كما يسوقها الطفل (`?preview=1`
    # يفتح القفلَ ولا يكتب تقدّماً).
    ap.add_argument("--at", default="", metavar="PATH",
                    help="مسارُ اللقطة داخل التطبيق، مثل '?preview=1#/count/ten'")
    # **ولقطةُ شاشةٍ تنطق تحتاج زمناً أطول** (الجلسة ٢): حلقةُ المحطة تنتظر تمامَ
    # الكلام قبل أن تعرض شكلَها، وبلا بنكٍ مولَّد يأخذ كلُّ نصٍّ مهلتَه المقدَّرة —
    # فأربعةُ آلاف مللٍ من الزمن الافتراضيّ تنقضي في أوّل جملة. والقيمةُ **معلَنةٌ
    # لا مرفوعةٌ صامتاً**: مَن أراد لقطةً لجولةٍ رفعها بيده وعرف لماذا.
    ap.add_argument("--budget", type=int, default=4000,
                    help="ميزانيةُ الزمن الافتراضيّ للقطة (مللي ثانية)")
    ap.add_argument("--device", action="store_true", help="مقاسات الآيباد الخمسة")
    ap.add_argument("--size", help="مقاس النافذة W,H")
    ap.add_argument("--show", action="store_true", help="متصفّح مرئي")
    ap.add_argument("--self-test", action="store_true", help="فحصُ العدّة بلا Chrome")
    args = ap.parse_args()

    if args.self_test:
        return self_test()

    # **التنظيفُ عند الإقلاع لا عند الخروج وحده** (بلاغ العائلة): كلُّ مسارٍ يُطلق
    # كروم يكنس أولاً يتائمَنا من جولاتٍ ماتت — و`--self-test` فوقه بلا كروم أصلاً.
    sweep_stale()

    if args.device:
        return device_main(args)

    results: list = []
    server = make_server(args.port, results)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    profile = Path(tempfile.mkdtemp(prefix="english-browser-"))

    try:
        if args.shots:
            out = Path(args.shots).resolve()
            if out.exists():
                out.unlink()
            size = args.size or "834,1194"
            proc = run_chrome(f"http://127.0.0.1:{args.port}/{args.at}", profile,
                              ["--headless=new", "--disable-gpu", "--hide-scrollbars",
                               "--virtual-time-budget=" + str(args.budget),
                               f"--screenshot={out}", f"--window-size={size}"], False)
            deadline = time.time() + args.timeout
            while time.time() < deadline and not out.exists():
                time.sleep(0.3)
            time.sleep(0.4)
            proc.kill()
            print(("✓ اللقطة في " if out.exists() else "✗ تعذّرت اللقطة: ") + str(out))
            return 0 if out.exists() else 1

        proc = run_chrome(f"http://127.0.0.1:{args.port}/__test.html", profile,
                          [f"--window-size={args.size or '834,1194'}"], args.show)
        deadline = time.time() + args.timeout
        while time.time() < deadline and not results:
            time.sleep(0.25)
        proc.kill()
    finally:
        server.shutdown()
        shutil.rmtree(profile, ignore_errors=True)

    if not results:
        print(f"لم تصل نتيجة من المتصفّح خلال {args.timeout} ثانية.")
        return 1

    fails = report_rows(results)
    print(f"\n{fails} إخفاق من {len(results)} فحصاً" if fails
          else f"\nكل فحوص المتصفّح ناجحة ({len(results)} فحصاً).")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
