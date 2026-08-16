#!/usr/bin/env python3
# يحرس: app/CNAME app/index.html app/welcome/** app/sw.js .github/workflows/pages.yml
#   (المنشورُ وقائمةُ صفحاته المشتقّة وقشرتُه وسيرُ نشره)

"""فحصُ الموقع الحيّ — هل ما في الشجرة هو ما يُخدَم فعلاً على `listen.mishkat.qa`؟

    python3 tools/check_live.py              # يجلب الصفحات والأصول ويطبع الحصيلة
    python3 tools/check_live.py --base URL   # على نطاقٍ آخر (معاينة، أو خادم محلّي)
    python3 tools/check_live.py --self-test  # بلا شبكة: يتحقّق من العدّة نفسِها

————— بذرةُ المنصة (`docs/SEED.md §٦`) —————
منقولةٌ عن «اِحْسِبْ» (وأصلُها «اِقْرَأْ») بدرسها كلِّه — الجلسة ٩، يومَ صار لنا نطاق.

**لماذا أداةٌ لا اطمئنان**: عند «اِقْرَأْ» ردّت صفحتان من المرجع **٤٠٤** على الموقع
الحيّ بينما أختاهما ٢٠٠ — فبدت البوّابةُ منشورةً نصفَها أمام معلّم. ولم يكن العيبُ في
الشيفرة ولا في اسمٍ ولا في عامل الخدمة: **الملفّان كانا في الشجرة وفي التزامٍ محلّيّ
ولم يبلغا `origin/main` بعد**، و`pages.yml` ينشر عند الدفع لا عند الالتزام. فالفجوةُ
صنفٌ لا يمسكه فحصٌ على القرص أبداً — «مُلتزَمٌ» ليست «منشورة» — ولا يُغلق إلا **بجلبٍ
فعليّ بعد النشر**. وهذا أوّلُ نشرٍ لـ«اِسْمَعْ»، فالدرسُ يدخل معه لا بعده.

**وقائمةُ الصفحات مشتقّةٌ من الشجرة لا مكتوبةً بيد**: كلُّ `app/welcome/*.html` يدخل
الفحص، فصفحةٌ خامسة تُكتب غداً تُفحَص حيّةً **يوم تُكتب** بلا سطرٍ يُعدَّل هنا. ومعها
أصولٌ مُشتقّة كذلك (التنسيق والخطوط ولقطةٌ وأيقونة) — فالصفحةُ بلا أصولها ورقةٌ عارية.

————— **تفريقُ الحافة من الأصل** (بندُ الجلسة ٩ — بلاغ `sw-edge-cache-lag`) —————

قشرةُ الحيّ إن خالفت الشجرةَ فالمتَّهمان اثنان **ولا يُسوَّى بينهما**:
  · **الأصلُ متخلّف** — النشرُ لم يبلغ GitHub Pages بعد: عيبٌ حقيقيّ، وعلاجُه دفعٌ
    أو انتظارُ سير النشر.
  · **الحافّةُ متلكئة** — Cloudflare يخدم نسخةً مخزونة (`cf-cache-status: HIT`
    وعمرٌ غيرُ صفر): ليس عيباً في شجرتنا، وعلاجُه دقائقُ أو كنسُ الحافّة.
والفرقُ يُقرأ من الترويسة لا يُظنّ — **وحُمرةٌ تتّهم الشجرةَ بذنب الحافّة أسوأُ من
حمرةٍ صادقة**: تدفع إلى نبشِ شيفرةٍ سليمة. (وقاعدةُ المنطقة `sw-bypass` قائمةٌ على
`mishkat.qa` فتشملنا آلياً — فالمنتظَر `DYNAMIC` لملفّ القشرة، و`HIT` فيه يعني
سقوطَ القاعدة عنّا.)

**وهي خارج السَّوقة القياسية عمداً**: تحتاج شبكةً ونشراً، والسَّوقةُ تعمل بلا إنترنت.
و`--self-test` فيها **بلا شبكة** (يفحص العدّةَ لا الموقع) فتدخل جردَ `test_selftests`
كأخواتها — «فحصٌ لا يُشغَّل ليس حارساً». **وفحصُها الحيّ واجبُ ما بعد النشر**: يُشغَّل
باسمه ويُقيَّد جوابُه في بند الجلسة.
"""

import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "app"
WELCOME = APP / "welcome"
BASE = "https://listen.mishkat.qa/"
TIMEOUT = 25

# حالاتُ الحافّة التي تعني «خُدِم من المخزون» — وهي وحدَها ما يبرّئ الشجرة.
EDGE_CACHED = {"HIT", "STALE", "UPDATING", "REVALIDATED"}


def pages() -> list[tuple[str, str]]:
    """(المسار، العنوان المتوقَّع) لكل صفحةٍ في `app/welcome/` — مشتقٌّ من القرص."""
    out = []
    for path in sorted(WELCOME.glob("*.html")):
        title = re.search(r"<title>([^<]+)</title>", path.read_text(encoding="utf-8"))
        url = "welcome/" if path.name == "index.html" else f"welcome/{path.name}"
        out.append((url, title.group(1).strip() if title else ""))
    return out


def assets() -> list[str]:
    """أصولٌ تُثبت أن المنشور كاملٌ لا هيكلاً: التنسيق والخطُّ ولقطةٌ وأيقونة والتطبيق.

    **وفهرسُ البنك أصلٌ كسائرها** (‏٤١٢ ملفاً صوتياً لا تعمل بلا فهرسها): فهرسٌ لا
    يُخدَم يعني تطبيقاً أخرسَ على جهازٍ جديد — خبرٌ يُعلَن باسمه لا صمتٌ يُؤوَّل.
    **وملفُّ النطاق كذلك** (`CNAME`): هو ما يجعل GitHub يخدم نطاقَنا، وغيابُه من
    المنشور يعني نطاقاً يردّ ٤٠٤ بلا سببٍ ظاهر.
    """
    shot = sorted((WELCOME / "shots").glob("*.png"))
    font = sorted((WELCOME / "fonts").glob("*.woff2"))
    out = ["", "welcome/welcome.css", "css/app.css", "manifest.webmanifest", "sw.js",
           "js/install.js", "js/feedback.js", "audio/manifest.json", "audio/versions.json",
           "CNAME"]
    if shot:
        out.append(f"welcome/shots/{shot[0].name}")
    if font:
        out.append(f"welcome/fonts/{font[0].name}")
    return out


def fetch(url: str, cap: int = 4096) -> tuple[int, str]:
    """(الرمز، أولُ الجسم) — و٤٠٤ خبرٌ لا عطب، فتُقرأ كما تُقرأ ٢٠٠.

    و`cap` حدُّ القراءة: أربعةُ كيلوباتٍ تكفي ترويسةَ صفحةٍ ولا تكفي **فهرساً يُحلَّل**
    (`cap=0` يقرأ الجسم كلَّه) — وقصُّ الفهرس يجعله لا يُقرأ فيُتَّهم المنشورُ بالفراغ.
    """
    request = urllib.request.Request(url, headers={"User-Agent": "listen-live-check"})
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
            raw = response.read() if cap <= 0 else response.read(cap)
            return response.status, raw.decode("utf-8", "replace")
    except urllib.error.HTTPError as error:
        return error.code, ""
    except Exception as error:                       # شبكةٌ لا تُجيب: عطبٌ يُقال
        return 0, str(error)


def blame_shell(local: str, live: str, cf: str, age: str) -> tuple[bool, str]:
    """**مَن المتّهم حين تخالف قشرةُ الحيّ الشجرةَ؟** — دالّةٌ خالصة تُجرَّب سالباً.

    تُرجِع (أمُطابِقٌ؟، السطرُ الذي يُقرأ). والتفريقُ من ترويسة الحافّة نفسِها:
    مخزونٌ في الحافّة ⇒ **الحافّةُ متلكئة** (شجرتُنا بريئة)، وإلا ⇒ **الأصلُ متخلّف**.
    """
    if local and live and local == live:
        return True, f"قشرة الحيّ {live} تطابق الشجرة (الحافّة: {cf or '؟'})"
    seen = (cf or "").upper()
    if seen in EDGE_CACHED:
        why = (f"**الحافّةُ متلكئة** — cf-cache-status: {seen}، العمر {age or '؟'}ث؛ "
               "الأصلُ قد يكون سليماً: أعِد بعد دقائق أو اكنس الحافّة "
               "(وقاعدةُ sw-bypass للمنطقة سقطت عنّا؟)")
    else:
        why = (f"**الأصلُ متخلّف** — النشرُ لم يبلغ GitHub Pages بعد "
               f"(cf-cache-status: {seen or '؟'})")
    return False, f"قشرة الحيّ {live or '؟'} والشجرة {local or '؟'} — {why}"


def check(base: str) -> int:
    base = base if base.endswith("/") else base + "/"
    fails = 0
    print(f"الموقع الحيّ: {base}\n")

    print("— الصفحات —")
    for url, title in pages():
        code, body = fetch(base + url)
        got = re.search(r"<title>([^<]+)</title>", body)
        got = got.group(1).strip() if got else ""
        good = code == 200 and got == title
        fails += 0 if good else 1
        mark = "✓" if good else "✗"
        note = f"{code}" + (f" — «{got}»" if got else "")
        if code == 200 and got != title:
            note += f" ✗ والمنتظَر «{title}»"
        print(f"  {mark} /{url:<28} {note}")

    print("\n— الأصول —")
    for url in assets():
        code, _ = fetch(base + url)
        fails += 0 if code == 200 else 1
        print(f"  {'✓' if code == 200 else '✗'} /{url or '(جذر التطبيق)':<28} {code}")

    print("\n— القشرة: الأصلُ متخلّف أم الحافّةُ متلكئة؟ —")
    local = re.search(r"VERSION = '(v\d+)'", (APP / "sw.js").read_text(encoding="utf-8"))
    request = urllib.request.Request(base + "sw.js",
                                     headers={"User-Agent": "listen-live-check"})
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
            body = response.read(8192).decode("utf-8", "replace")
            live = re.search(r"VERSION = '(v\d+)'", body)
            cf = response.headers.get("cf-cache-status", "")
            age = response.headers.get("age", "")
        same, line = blame_shell(local.group(1) if local else "",
                                 live.group(1) if live else "", cf, age)
        fails += 0 if same else 1
        print(f"  {'✓' if same else '✗'} {line}")
    except Exception as error:
        fails += 1
        print(f"  ✗ تعذّر فحص قشرة الحيّ: {error}")

    print(f"\n{fails} إخفاق — المنشورُ ليس ما في الشجرة" if fails
          else "\nالمنشورُ هو ما في الشجرة: كلُّ صفحةٍ وأصلٍ يردّ ٢٠٠ بعنوانه.")
    return 1 if fails else 0


def self_test() -> int:
    """بلا شبكة: العدّةُ نفسُها — القائمةُ مشتقّةٌ، ولكل صفحةٍ عنوانٌ يُقابَل به."""
    fails = 0
    found = pages()
    on_disk = {p.name for p in WELCOME.glob("*.html")}
    listed = {("index.html" if u == "welcome/" else u.split("/")[-1]) for u, _ in found}
    if listed != on_disk:
        print(f"  ✗ القائمةُ لا تطابق الشجرة: {sorted(on_disk ^ listed)}")
        fails += 1
    else:
        print(f"  ✓ قائمةُ الصفحات مشتقّةٌ من الشجرة ({len(found)} صفحات)")

    empty = [u for u, t in found if not t]
    if empty:
        print(f"  ✗ صفحةٌ بلا عنوان تُقابَل به: {'، '.join(empty)}")
        fails += 1
    else:
        print("  ✓ ولكلٍّ عنوانٌ في ترويستها يُقابَل به المنشور")

    needed = assets()
    missing = [a for a in needed if a and not (APP / a).exists()]
    if missing:
        print(f"  ✗ أصلٌ مطلوبٌ ليس في الشجرة: {'، '.join(missing)}")
        fails += 1
    else:
        print(f"  ✓ وأصولُها موجودةٌ في الشجرة ({len(needed)} مسارات)")

    # **وملفُّ النطاق منشورٌ ومطابقٌ لِما تفحصه هذه الأداة**: يُنسَخ مع `app/` كلِّه
    # فيقرؤه GitHub Pages عند كل نشرة — فالنطاقُ مكتوبٌ في المنشور لا في لوحة
    # إعداداتٍ وحدَها، ويُقرأ من هنا كما يقرؤه GitHub.
    cname = APP / "CNAME"
    host = BASE.split("//")[1].strip("/")
    if cname.exists() and cname.read_text(encoding="utf-8").strip() == host:
        print(f"  ✓ وملفُّ النطاق منشورٌ في app/CNAME بنطاقنا ({host})")
    else:
        print(f"  ✗ ملفُّ النطاق مفقودٌ أو يخالف {host}")
        fails += 1

    # ————— **تفريقُ الحافة من الأصل يُجرَّب سالباً** (بندُ الجلسة ٩) —————
    #
    # «لا يُصدَّق حارسٌ لم يُرَ وهو يمسك»: يُقاس **الحكمُ نفسُه** بجردٍ مصنوع — أيمسك
    # الاختلاف؟ وأينسبه إلى الحافّة حين تقول الترويسةُ إنها خدمت مخزوناً، وإلى الأصل
    # حين تقول إنها لم تخزّن؟ فحارسٌ يخلط النسبتين يبعث الجلسةَ تنبش شيفرةً سليمة.
    cases = [
        ("مطابقٌ يمرّ", blame_shell("v8", "v8", "DYNAMIC", "0"), True, ""),
        ("واختلافٌ والحافّةُ خدمت مخزوناً ⇒ **الحافّة**",
         blame_shell("v8", "v7", "HIT", "180"), False, "الحافّةُ متلكئة"),
        ("واختلافٌ والحافّةُ لم تخزّن ⇒ **الأصل**",
         blame_shell("v8", "v7", "DYNAMIC", "0"), False, "الأصلُ متخلّف"),
        ("وقشرةٌ لا تُقرأ ⇒ إخفاقٌ يُسمّى",
         blame_shell("v8", "", "", ""), False, "الأصلُ متخلّف"),
    ]
    for title, (same, line), want_same, want_in in cases:
        good = same is want_same and (want_in in line)
        fails += 0 if good else 1
        print(("  ✓ " if good else "  ✗ ") + title + ("" if good else f" — قال: {line}"))

    workflow = (ROOT / ".github" / "workflows" / "pages.yml").read_text(encoding="utf-8")
    # علّةُ وجود هذه الأداة: النشرُ **عند الدفع** لا عند الالتزام، وينسخ `app/` كلَّه.
    if "branches: [main]" in workflow and "path: app" in workflow:
        print("  ✓ والنشرُ عند الدفع إلى main ينسخ `app/` كلَّه (فالفجوةُ دفعٌ لا ملفّ)")
    else:
        print("  ✗ سيرُ النشر تغيّر — يُراجَع نصُّ هذه الأداة")
        fails += 1

    print(f"\n{fails} إخفاق" if fails else "\nعدّةُ الفحص الحيّ سليمة (بلا شبكة).")
    return 1 if fails else 0


def main() -> int:
    parser = argparse.ArgumentParser(description="فحصُ الموقع الحيّ بعد النشر")
    parser.add_argument("--base", default=BASE, help=f"عنوان الموقع (افتراضه {BASE})")
    parser.add_argument("--self-test", action="store_true", help="فحصُ العدّة بلا شبكة")
    parser.add_argument("--json", action="store_true", help="الحصيلة بيانات لا نصّاً")
    args = parser.parse_args()

    if args.self_test:
        return self_test()
    if args.json:
        base = args.base if args.base.endswith("/") else args.base + "/"
        out = {u: fetch(base + u)[0] for u, _ in pages()}
        out.update({a: fetch(base + a)[0] for a in assets()})
        print(json.dumps(out, ensure_ascii=False, indent=2))
        return 0 if all(v == 200 for v in out.values()) else 1
    return check(args.base)


if __name__ == "__main__":
    sys.exit(main())
