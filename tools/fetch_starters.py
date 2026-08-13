#!/usr/bin/env python3
"""مقابلةُ الرصيد السمعيّ بمصدره — **الأرقامُ والكلمات تُنقل لا تُقدَّر**.

**العلّة** (بندُ الجلسة ١ نصاً): «كلماتُها من قائمة Cambridge Pre-A1 Starters ‏2025
الرسمية حصراً — حمّل الملفَّ من رابطه واستخرج منه … وممنوعٌ منعاً قاطعاً تقديرُ
كلماتٍ من الذاكرة». وأشدُّ ما يهدّد هذا البندَ ليس اليومَ بل بعد شهور: أحدٌ يضيف
كلمةً «يعرف أنها في القائمة» فتدخل بلا مصدر، ولا يظهر ذلك في اختبارٍ ولا لقطة.

فهذه الأداةُ تُبقي الدعوى **قابلةً للتفنيد**: تُنزّل ملفّ كامبردج الرسميّ نفسَه
(الرابطُ من `STARTERS_SOURCE` في `curriculum.js`، لا مكتوباً هنا)، وتستخرج جدولَ
«Pre A1 Starters A–Z wordlist» من صفحاته، وتقابله بـ`STARTERS` مدخلاً مدخلاً.

    python3 tools/fetch_starters.py            # تنزيلٌ ومقابلة
    python3 tools/fetch_starters.py --cached   # مقابلةٌ بملفٍّ منزَّلٍ سلفاً
    python3 tools/fetch_starters.py --keep P   # يحفظ الملفّ في P بعد التنزيل

**وهي ليست من حرّاس كل جلسة**: تطلب الشبكةَ وتحتاج `pdftotext`، وعهدُ التطبيق «دون
إنترنت» — فتُشغَّل حين تتبدّل بياناتُ الرصيد أو حين يُراجَع المصدر، كما `fetch_twemoji.py`.

يخرج بـ ١ عند أيّ اختلاف، وبـ ٠ إن طابق النقلُ مصدرَه.
"""

import argparse
import json
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CURRICULUM = ROOT / "app" / "js" / "curriculum.js"

# مفاتيحُ القسم النحويّ في الجدول (ص٤: «Grammatical key») — بها يُقصّ المدخلُ عن نوعه
POS = ("adj", "adv", "conj", "det", "dis", "excl", "int", "n", "poss", "prep",
       "pron", "title", "v")
POS_TAIL = re.compile(
    r"^(?P<entry>.*?)\s+(?:" + "|".join(POS) + r")"
    r"(?:\s*\+\s*(?:" + "|".join(POS) + r"))*"
    r"(?:\s+of\s+\w+(?:\s*\+\s*\w+)*)?$")
# ذيلٌ نحويٌّ ثانٍ يتبع المفتاح بلا «+» («her poss adj + pron»)
POSS_TAIL = re.compile(r"\s+poss$")

SKIP = ("Pre A1 Starters", "Grammatical key", "adjective", "adverb", "conjunction",
        "determiner", "discourse", "exclamation", "Letters & numbers", "Names",
        "Candidates will be", "(No words at this level)")


def declared() -> dict:
    """يقرأ `STARTERS` ومصدرَه من الوحدة نفسِها — لا يُخمَّن نصُّها بتعبيرٍ نمطيّ."""
    js = f"""
    const m = await import({json.dumps(CURRICULUM.as_uri())});
    console.log(JSON.stringify({{ source: m.STARTERS_SOURCE, entries: m.STARTERS,
      note: m.STARTERS_LETTERS_NOTE }}));
    """
    run = subprocess.run(["node", "--input-type=module", "-e", js],
                         capture_output=True, text=True)
    if run.returncode != 0:
        sys.exit(f"تعذّرت قراءة المنهج:\n{run.stderr.strip()}")
    return json.loads(run.stdout)


def download(url: str, out: Path) -> None:
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=120) as response:
        out.write_bytes(response.read())


def extract(pdf: Path, first: int, last: int) -> list:
    """مداخلُ جدول A–Z من صفحاته — عمودياً كما كُتبت، مع إسقاط ذيلها النحويّ."""
    if not shutil.which("pdftotext"):
        sys.exit("هذه الأداةُ تحتاج `pdftotext` (poppler) — وهي خارج حرّاس الجلسات.")
    text = subprocess.run(["pdftotext", "-layout", "-f", str(first), "-l", str(last),
                           str(pdf), "-"], capture_output=True, text=True, check=True).stdout
    out, in_names = [], False
    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        if line == "Names":
            in_names = True
            continue
        if "Letters & numbers" in line:
            in_names = False
        if in_names or any(s in line for s in SKIP) or re.fullmatch(r"[A-Z]", line):
            continue
        for cell in re.split(r"\s{2,}", line):
            cell = cell.strip()
            if not cell or cell == "﻿":
                continue
            match = POS_TAIL.match(cell)
            if not match:
                continue                      # سطرُ ترقيمٍ أو ذيلُ صفحة
            out.append(POSS_TAIL.sub("", match.group("entry").strip()))
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description="مقابلةُ الرصيد السمعيّ بملفّ كامبردج")
    ap.add_argument("--cached", type=Path, help="ملفٌّ منزَّلٌ سلفاً (بلا شبكة)")
    ap.add_argument("--keep", type=Path, help="احفظ الملفّ المنزَّل هنا")
    args = ap.parse_args()

    data = declared()
    source, entries = data["source"], data["entries"]

    with tempfile.TemporaryDirectory() as tmp:
        pdf = args.cached
        if pdf is None:
            pdf = Path(tmp) / "starters.pdf"
            print(f"تنزيلُ المصدر: {source['url']}")
            try:
                download(source["url"], pdf)
            except (urllib.error.URLError, urllib.error.HTTPError) as error:
                print(f"✗ تعذّر التنزيل: {error}", file=sys.stderr)
                return 1
            if args.keep:
                shutil.copy(pdf, args.keep)
        found = extract(pdf, *source["pages"]["alphabetic"])

    unique = sorted(set(found), key=lambda w: (w.lower(), w))
    fails = 0

    def ok(cond, msg):
        nonlocal fails
        print(("  ✓ " if cond else "  ✗ ") + msg)
        if not cond:
            fails += 1

    print(f"\n— {source['title']} —")
    ok(len(found) == len(unique),
       f"لا مدخلَ مكرَّرٌ في المصدر ({len(found)} مدخلاً في الصفحات "
       f"{source['pages']['alphabetic'][0]}–{source['pages']['alphabetic'][1]})")
    ok(len(unique) == source["entries"],
       f"عددُ المداخل في المصدر {len(unique)} وفي `STARTERS_SOURCE` {source['entries']}")

    missing = [w for w in unique if w not in set(entries)]
    extra = [w for w in entries if w not in set(unique)]
    ok(not missing, f"وكلُّ مدخلٍ في المصدر منقولٌ في `STARTERS`"
                    + (f" — ناقص: {'، '.join(missing[:14])}" if missing else ""))
    ok(not extra, "ولا مدخلَ في `STARTERS` ليس في المصدر"
                  + (f" — زائد: {'، '.join(extra[:14])}" if extra else ""))
    ok(len(entries) == len(unique),
       f"والعددان متساويان: {len(entries)} منقولاً، {len(unique)} في المصدر")

    print(f"\n{fails} اختلاف" if fails else "\n✓ الرصيدُ السمعيُّ منقولٌ عن مصدره حرفاً بحرف")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
