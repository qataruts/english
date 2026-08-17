#!/usr/bin/env python3
"""حارسُ الجبهة الثلاثيّ — **نظيرُ المفكوكية في اقرأ وجبهةِ العدد في احسب**.

القاعدة الملزمة (`METHOD.md §٥` نصاً): «والنصُّ المعروض في أي تمرينٍ = رموزُ الدرجات
المفتوحة + شائكاتُها **لا غير**»، ومعها قاعدةُ الرصيد (§٣): «**ولا كلمةَ في تمرينٍ
خارجه**». فصار للحارس **ثلاثةُ رفضٍ لا واحد**، وهي أبوابُه الثلاثة:

  ١) **رمزٌ فوق درجة محطته**: كلُّ كلمةِ قراءةٍ تُعلن مقاطعَها بمعرّفات الرموز
     (`gpc: ['d','u','ck']`)، فرمزٌ لم يُفتَح بعدُ في درجةٍ يُرفَض.
  ٢) **كلمةٌ خارج الرصيد السمعي المعلَن**: كلُّ كلمةٍ في أيّ تمرينٍ يجب أن تكون في
     `WORDS` (الرصيد المصوَّر)، و`WORDS` كلُّها في `STARTERS` (٤٩٥ مدخلاً من ملفّ
     كامبردج)، وحقلُها في جبهة محطتها، وليست ممّا رُفع لانعدام الصورة الصادقة.
  ٣) **شائكةٌ فوق ميزانية درجتها**: شائكةٌ لم تُفتَح تُرفَض، **وميزانيةُ العهد**
     (٥ ← ١٧ ← ٣١ ← ٥٦ — `METHOD.md §٥`) تُقابَل بالمحصيّ من البيانات.

ومعها بابانِ من عقد الرحلة: بنيةُ الجبهة، والبواباتُ في مواضعها.

**والعددُ يُطبَع محسوباً لا مكتوباً** (عهدُ «أرقامٌ محسوبة لا مكتوبة»): محطاتٌ وعقدٌ
ومفاتيحُ وكلماتٌ ورموزٌ — كلُّها من `curriculum.js` وقتَ التشغيل.

الاستعمال:
    python3 tools/check_range.py              # الفحص على المنهج الحيّ
    python3 tools/check_range.py --self-test  # فحصُ الفاحص: أيمسك المدسوس؟

يخرج بـ ١ عند وجود خطأ واحد على الأقل، وبـ ٠ إن مرّ الفحص.
"""

import argparse
import copy
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP_JS = ROOT / "app" / "js"
CURRICULUM = APP_JS / "curriculum.js"
FIGURES = APP_JS / "figures.js"
# وثيقةُ الهوية: فيها اللكنةُ المحسومة بقرار المالك — يقرؤها بابُ اللكنة (حسمُ أ-٢)
IDENTITY = ROOT / "docs" / "REVIEW_IDENTITY.md"

# وحداتُ البذرة ليست شاشاتِ تمارين — هي المنصةُ نفسُها (نظيرُ `SEED` في `test_nodes.mjs`)
SEED_MODULES = {
    "main.js", "progress.js", "curriculum.js", "ui.js", "audio.js", "review.js",
    "parent.js", "registry.js",
}

FRONTIER_FIELDS = ("fields", "symbols", "tricky")

# أنماطُ التصوير المعروفة (`curriculum.js` — رأسُ الرصيد المصوَّر): صورةٌ واحدة ·
# كمّيةٌ تُعَدّ · بقعةُ لونٍ مُصيَّرة · مشهدٌ من شيئين · حركةٌ تُفعَل · نصٌّ يُفكّ.
PICTURE_KINDS = ("face", "count", "swatch", "scene", "act", "text")

# **البقعةُ قيمةُ لونٍ لا كلمة** (حكمُ المدير ١٣ أغسطس — `METHOD.md §٤`): تُكتب
# ستَّ عشريةً كما تُكتب في اللوح، فما يُصيَّر هو ما يُسمّى.
SWATCH_RE = re.compile(r"^#[0-9A-Fa-f]{6}$")

# والحقلُ الوحيد الذي تصدُق فيه البقعةُ صورةً: الألوان. وبلا هذا القيد لَكانت البقعةُ
# باباً خلفياً لكل كلمةٍ عجزت عن صورتها («cat» بقعةٌ بنّية!) — والحكمُ إنّما أباحها
# **لأنّ اللون هو الكلمة**.
SWATCH_FIELD = "colours"

# عقدُ المولّد (تلتزم به الجلسات ٢+): وحدةٌ **خالصة** تُستورَد في node بلا متصفّح،
# تُعلن ما تستهلك (`CONSUMES`) وتفتح جولاتِها للجرد (`probeRounds`).
CONSUMES_DECL = re.compile(r"export\s+const\s+CONSUMES\b")
PROBE_DECL = re.compile(r"export\s+(?:function|const)\s+probeRounds\b")


# ————— قراءةُ المنهج: تُشغَّل الوحدةُ نفسُها ولا يُخمَّن نصُّها —————
#
# **ولِمَ تشغيلٌ لا تعبيرٌ نمطيّ؟** لأنّ الرحلةَ هنا **محسوبة** لا مكتوبة: `sections()`
# تؤلّف المراحلَ والعهودَ والبوابات تأليفاً، وجبهةُ كل درجةٍ تُجمع تراكمياً — فقارئٌ
# نصّيّ يقرأ الجداول ولا يقرأ الرحلة التي يراها الطفل. والوحدةُ محايدةٌ للمتصفّح.

def load_curriculum() -> dict:
    js = f"""
    const m = await import({json.dumps(CURRICULUM.as_uri())});
    const figures = await import({json.dumps(FIGURES.as_uri())});
    console.log(JSON.stringify({{
      starters: m.STARTERS, forms: [...m.starterForms()],
      words: m.WORDS, raised: m.RAISED, resolved: m.RESOLVED, ritual: m.RITUAL,
      // **ميزانيةُ الأزواج الدنيا** (حسمُ أ-٣): الخرقُ الثاني المحصور لقيد Starters —
      // يقرؤها بابُ الرصيد فيأذن لها وحدَها، وبابٌ خاصٌّ يقابلها بشرطها.
      pairBudget: m.PAIR_BUDGET,
      // **واللكنةُ المحسومة** (حسمُ أ-٢): بها يُقابَل جدولُ الأصوات صوتاً صوتاً.
      accent: m.ACCENT,
      fields: m.FIELDS,
      eras: m.ERAS, grades: m.GRADES,
      phonemes: m.PHONEMES,
      vowels: [...m.VOWEL_SYMBOLS], clusterGrade: m.CLUSTER_GRADE,
      storyFrom: m.STORY_FROM,
      // **وأيُّ كلمةٍ لها صورةٌ مفردة تُلمَس يجيب عنه المنهجُ نفسُه** (`isTouchable`)
      // — فلا تُكتب القاعدةُ هنا ثانيةً فتفترق عن الشاشة يومَ تتحرّك.
      touchable: m.WORDS.filter((w) => m.isTouchable(w.w)).map((w) => w.w),
      units: m.UNIT_UNITS, unitSections: m.UNIT_SECTIONS,
      gates: m.GATES, tracks: m.TRACKS,
      hearts: m.HEART_WORDS, sectionCap: m.SECTION_CAP,
      // **والمراجعُ الضميريةُ المرسومة صنفٌ يُعلَن** (`DEIXIS` — س٥-٧): مَن يُرسَم
      // متكلّماً أو مخاطَباً، فيُقابَل به ما رسمته الجولةُ ولا يمرّ مرجعٌ لا إعلانَ له.
      deixis: m.DEIXIS,
      // **ولكلِّ مرجعٍ رسمٌ مُصيَّر أو لا يُعلَن**: أسماءُ ما يرسمه `figures.js` فعلاً
      // — فمرجعٌ بوضعٍ لا رسمَ له بطاقةٌ فارغة يُسأل عنها الطفل ولا يشتكي أحد.
      deixisPoses: figures.DEIXIS_POSE_NAMES,
      stations: m.stations(),
      sections: m.sections().map((s) => ({{
        kind: s.kind, id: s.id, title: s.title, accent: s.accent,
        nodes: (s.nodes || []).map((n) => ({{
          id: n.id, type: n.type, part: n.part, title: n.title,
        }})),
      }})),
    }}));
    """
    run = subprocess.run(["node", "--input-type=module", "-e", js],
                         capture_output=True, text=True)
    if run.returncode != 0:
        sys.exit(f"تعذّرت قراءة المنهج من {CURRICULUM.name}:\n{run.stderr.strip()}")
    return json.loads(run.stdout)


def label_of(station: dict) -> str:
    return f"[{station['id']}] «{station.get('title', '')}»"


# ————— جردُ المحطة: ما تستهلكه فعلاً، صنفاً صنفاً —————
#
# **جردٌ واحد لكل مصدر**: تُجرَد المحطةُ من بياناتها هنا، وتُجرَد جولةُ المولّد من
# `probeRounds` هناك — ويُحكَم على الجردين **بالدالّة نفسِها** (`usage_errors`). فلا
# يفترق حكمُ البيانات عن حكم الشاشة، وهو عينُ ما يُنسى حين يُكتب لكلٍّ حارسُه.

def story_index(data: dict) -> dict:
    """كلمةُ قراءةٍ ← مقاطعُها، وأسماءُ الشائكات — بهما يُجرَد سطرُ القصة صنفاً صنفاً."""
    return {
        "gpc": {w["w"]: w["gpc"] for g in data["grades"] for w in g["words"]},
        "tricky": {t for g in data["grades"] for t in g["tricky"]},
    }


def used_of(station: dict, index: dict | None = None) -> dict:
    """ما تستهلكه محطةٌ من أصنافٍ ثلاثة: كلماتٌ · رموزٌ · شائكات."""
    # **وأدواتُ المشهد تُجرَد ككلمات التمرين** (`props` — الجلسة ٢): التفاحةُ والصندوق
    # والكرةُ يراها الطفلُ ويسمع اسمَها، فحكمُها حكمُ ما يُقاس وإن لم تُقَس. ولولا
    # جردُها لَدخلت الشاشةَ كلمةٌ من خارج الرصيد من بابٍ لا يمرّ عليه حارس.
    shown = (station.get("words") or []) + (station.get("props") or [])
    words = [w["w"] for w in shown]
    # والحقلُ الدلاليّ للكلمة المصوَّرة وحدَها: كلماتُ القراءة تُحكَم برموزها لا بحقلها
    fields = [w["field"] for w in shown if w.get("field")]
    gpcs, tricky = [], []
    for word in station.get("pool") or []:
        words.append(word["w"])
        gpcs += word["gpc"]
    for sentence in station.get("sentences") or []:
        words += sentence["uses"]
    if station["type"] in ("grade", "cluster"):
        tricky += station["frontier"]["tricky"]
    # ————— **القصةُ تُجرَد ككلِّ تمرين** (`METHOD.md §٥`) —————
    #
    # ونصُّها **صنفان لا صنف**: كلمةُ قراءةٍ تُحاكَم بمقاطعها على السلّم (فكلمةٌ فوق
    # درجة القصة تُرفَض برمزها)، وشائكةٌ تُحاكَم بميزانية درجتها — وهي الخرقُ المعلَن
    # الوحيد، فلو جُرِدت كلمةً لَطولبت بمدخلٍ في الرصيد المصوَّر ليس لها. وما ليس من
    # الصنفين يبقى كلمةً فيسمّيه البابُ الثاني، ويسمّيه بابُ القصة بعلّته.
    for token in (station.get("text") or "").split():
        word = re.sub(r"[^A-Za-z'’-]", "", token)
        if not word:
            continue
        if index and word in index["tricky"]:
            tricky.append(word)
            continue
        if index:
            gpcs += index["gpc"].get(word, [])
        words.append(word)
    # **والصوتُ المعزول صنفٌ خامس** (س٣ وس٤): ليس كلمةً فلا يُقابَل بالرصيد، وليس
    # رسماً فلا يُقابَل بالسلّم — يُقابَل بجدول أصوات المنهج (`PHONEMES`).
    sounds = list(station.get("sounds") or [])
    # **وقالبُ الأمر المنطوق يُجرَد بكلماته** (`order` — س٢): ما يُقال للطفل مادّةٌ
    # كما يُعرَض له، وحدُّه مداخلُ Starters لا الرصيدُ المصوَّر (كلماتُ الوظيفة فيه
    # لا صورةَ لها). و`{…}` موضعُ الكلمة فيُسقَط: كلمتُه مجرودةٌ في `words` أصلاً.
    said = [w for w in re.sub(r"\{\w+\}", " ", station.get("order") or "").split() if w]
    return {
        "words": [w for w in words if w],
        "fields": fields,
        "gpcs": gpcs,
        "tricky": tricky,
        "said": said,
        "sounds": sounds,
    }


def usage_errors(label: str, used: dict, frontier: dict, bank: dict) -> list:
    """**الحكمُ الواحد** — الأبوابُ الثلاثة في دالّةٍ خالصة، تُجرَّب سالباً بلا مولّد.

    `bank` = {"words": الرصيدُ المصوَّر, "forms": صِيَغُ Starters, "raised": المرفوعات}.
    """
    errors = []
    lex = bank["words"]

    # ————— ١) رمزٌ فوق درجة محطته —————
    open_symbols = set(frontier.get("symbols") or [])
    for gpc in used.get("gpcs", []):
        if gpc not in open_symbols:
            errors.append(f"{label}: الرمز «{gpc}» فوق درجة محطته "
                          f"(المفتوحُ عندها {len(open_symbols)} رمزاً)")

    # ————— ٢) كلمةٌ خارج الرصيد السمعي المعلَن —————
    for word in used.get("words", []):
        if word in bank["raised"]:
            errors.append(f"{label}: «{word}» **مرفوعةٌ لانعدام الصورة الصادقة** "
                          f"({bank['raised'][word]}) — ولا تدخل محطةً بلا قرار")
        elif word not in lex:
            errors.append(f"{label}: «{word}» خارج الرصيد السمعي المعلَن "
                          f"(`WORDS` في `curriculum.js`)")
        elif word not in bank["forms"] and word not in bank["budget"]:
            errors.append(f"{label}: «{word}» في الرصيد وليست من مداخل "
                          "Cambridge Pre A1 Starters ‏2025 ولا من ميزانية الأزواج المعلَنة")

    # **وكلماتُ الأمر المنطوق تُقابَل بالقائمة الأصل**: `point to the cat` — «cat»
    # مجرودةٌ في الرصيد المصوَّر أعلاه، و«point» و«to» و«the» مداخلُ في Starters ولا
    # صورةَ لها. ولولا هذا البابُ لَدخل الأمرَ فعلٌ من خارج القائمة («touch») بلا حارس.
    for word in used.get("said", []):
        bare = re.sub(r"[^A-Za-z'’-]", "", word)
        if bare and bare not in bank["forms"] and bare.lower() not in bank["forms"]:
            errors.append(f"{label}: «{bare}» في أمرٍ منطوق وليست من مداخل "
                          "Cambridge Pre A1 Starters ‏2025")

    # **وصوتٌ يُنطَق ليس من أصوات المنهج**: `/s/` لا يمرّ على بابَي الكلمة والرمز
    # (ليس كلمةً ولا رسماً)، فلولا هذا البابُ لَدخل شاشةَ الطفل صوتٌ مخترَع بلا حارس —
    # ولا يُسمَع خطؤه إلا في أذنه (`PHONEMES` في `curriculum.js`).
    for sound in used.get("sounds", []):
        if sound not in bank["sounds"]:
            errors.append(f"{label}: الصوت «{sound}» ليس من أصوات المنهج "
                          f"({len(bank['sounds'])} صوتاً في `PHONEMES`)")

    # **ومرجعٌ ضميريٌّ يُرسَم وليس في جدوله**: لا يُقابَل بالرصيد (لا صورةَ له) ولا
    # بالسلّم (ليس رسماً) — فلولا هذا البابُ لَرُسمت للطفل بطاقةٌ فارغة يُسأل عنها،
    # أو لَدخل المشهدَ مرجعٌ لم يُدرَّس في النمذجة (`DEIXIS` في `curriculum.js`).
    for one in used.get("deixis", []):
        if one not in bank["deixis"]:
            errors.append(f"{label}: المرجع «{one}» يُرسَم في مشهدٍ وليس من المراجع "
                          f"المعلَنة ({'، '.join(sorted(bank['deixis'])) or 'لا مرجع'})")

    open_fields = set(frontier.get("fields") or [])
    for field in used.get("fields", []):
        if field not in open_fields:
            errors.append(f"{label}: كلمةٌ من حقل «{field}» وليس في جبهة محطته "
                          f"({'، '.join(sorted(open_fields)) or 'لا حقل'})")

    # ————— ٣) شائكةٌ فوق ميزانية درجتها —————
    open_tricky = set(frontier.get("tricky") or [])
    for word in used.get("tricky", []):
        if word not in open_tricky:
            errors.append(f"{label}: الشائكة «{word}» فوق شائكات درجته "
                          f"({len(open_tricky)} شائكة)")
    return errors


# ————— بنيةُ الجبهة والقياس —————

def frontier_errors(stations: list, bank: dict) -> list:
    """كلُّ محطةٍ تعلن جبهةً تامّةً ومفاتيحَها — أو إعفاءً بجملةٍ تُقرأ."""
    errors = []
    seen = set()
    for station in stations:
        label = label_of(station)
        if station["id"] in seen:
            errors.append(f"{label}: معرّفٌ مكرَّر (محطتان بمعرّفٍ واحد ⇒ نجمةٌ تُكتب "
                          "في غير موضعها)")
        seen.add(station["id"])
        for field in ("type", "part", "title", "track"):
            if not station.get(field):
                errors.append(f"{label}: بلا {field}")

        f = station.get("frontier")
        if not isinstance(f, dict):
            errors.append(f"{label}: بلا جبهةٍ معلَنة — ولا محطةَ بلا جبهة (`METHOD.md §٥`)")
            continue
        missing = [k for k in FRONTIER_FIELDS if k not in f]
        extra = [k for k in f if k not in FRONTIER_FIELDS]
        if missing:
            errors.append(f"{label}: جبهةٌ ناقصةُ الحقول: {'، '.join(missing)}")
            continue
        if extra:
            errors.append(f"{label}: في الجبهة حقلٌ لا يعرفه الحارس: {'، '.join(extra)}")
        for field in f["fields"]:
            if field not in bank["fields"]:
                errors.append(f"{label}: حقلٌ خارج حقول القائمة الموضوعية: «{field}»")

        skills = station.get("skills") or []
        exempt = station.get("exempt") or ""
        if bool(skills) == bool(exempt):
            errors.append(f"{label}: {'قياسٌ وإعفاءٌ معاً' if skills else 'بلا قياسٍ ولا إعفاء'}"
                          " — لكلِّ محطةٍ مفاتيحُها **أو** إعفاؤها المكتوب")
        if exempt and len(exempt) <= 40:
            errors.append(f"{label}: سببُ الإعفاء كلمةٌ تُكتب للمرور لا جملةٌ تُقرأ")
        for key in skills:
            parts = key.split("|")
            if len(parts) != 3 or not all(parts):
                errors.append(f"{label}: مفتاحٌ ليس (وحدة × مدى × نوع تمرين): «{key}»")
                continue
            if parts[0] not in bank["units"]:
                errors.append(f"{label}: المفتاح «{key}» وحدتُه ليست في جدول الوحدات")

        # **والصورةُ صادقةٌ أو مُعلَنٌ سببُ غيابها**: محطةُ صورٍ كلمتُها بلا `face`
        # سؤالٌ بلا جواب — إلا أن تُعلن المحطةُ أنّ تصويرَها كمّيةٌ أو مشهدٌ أو حركة.
        #
        # **ونمطُ التصوير من معجمٍ مغلَق**: لولا ذلك لَكفى أن يُكتب `pictures: 'x'`
        # ليصمت هذا الفحصُ كلُّه — وهو تعطيلُ حارسٍ بكلمة، لا إعلانُ سبب.
        pictures = station.get("pictures")
        if pictures not in PICTURE_KINDS:
            errors.append(f"{label}: نمطُ تصويرٍ لا يعرفه الحارس: «{pictures}» "
                          f"(المعروف: {'، '.join(PICTURE_KINDS)})")
        elif pictures == "face":
            blind = [w["w"] for w in station.get("words") or [] if not w.get("face")]
            if blind:
                errors.append(f"{label}: كلماتٌ بلا صورةٍ في محطةِ صور: {'، '.join(blind)}")
        elif pictures == "count":
            blind = [w["w"] for w in station.get("words") or [] if not w.get("count")]
            if blind:
                errors.append(f"{label}: كلماتٌ بلا كمّيةٍ في محطةِ عدّ: {'، '.join(blind)}")
        elif pictures == "swatch":
            # **ولا تُرخي البقعةُ حكمَ الصورة**: كلمةُ محطةِ الألوان **صورةٌ أو بقعة**،
            # وليس لها أن تكون بلا واحدةٍ منهما — وإلا صار `swatch` كلمةً تُعطَّل بها
            # مطالبةُ الصورة كما كان يصير بنمطٍ مخترَع.
            blind = [w["w"] for w in station.get("words") or []
                     if not w.get("face") and not w.get("swatch")]
            if blind:
                errors.append(f"{label}: كلماتٌ بلا صورةٍ ولا بقعةِ لون: {'، '.join(blind)}")
    return errors


def story_errors(data: dict, index: dict, bank: dict) -> list:
    """**القصةُ شبهُ المفكوكة** (`METHOD.md §٥`): «نصٌّ قصير مصوَّر **كلُّه** من رموز
    الدرجات المفتوحة + شائكاتها — يفحصه `check_range` ككل تمرين».

    والأبوابُ الثلاثة تكفي كلمةً **عرفها المنهج**: رمزُها يُقابَل بالسلّم وشائكتُها
    بالميزانية. وهذا البابُ لِما لا تراه تلك: **كلمةٌ لا هي كلمةُ قراءةٍ ولا شائكة**
    (‏`banana` مثلاً: في الرصيد المصوَّر ولا مقاطعَ لها، فتمرّ على البابين صامتةً وهي
    غيرُ مفكوكة)، وشكلُ النصّ الذي لم يُدرَّس (حرفٌ كبير · علامةُ وقف)، وصفحةٌ تسأل
    عن صورةِ ما لم يُقرأ فيها.
    """
    errors = []
    order = [g["id"] for g in data["grades"]]
    start = data.get("storyFrom")
    first = order.index(start) if start in order else 0
    for station in [s for s in data["stations"] if s["type"] == "story"]:
        label = label_of(station)
        at = order.index(station["part"]) if station["part"] in order else -1
        if at < first:
            errors.append(f"{label}: قصةٌ قبل 🚪٢ — «كتابٌ لكل درجةٍ **من بعد** البوابة "
                          f"الثانية» (`METHOD.md §٥`: أوّلُها «{start}»)")
        pages = station.get("pages") or []
        # ثلاثٌ حدُّها الأدنى: صفحةٌ يقرؤها المعلّم، وصفحةٌ بعون، وواحدةٌ «وحدك» فأكثر
        if len(pages) < 3:
            errors.append(f"{label}: {len(pages)} صفحة — والقصةُ ثلاثُ صفحاتٍ فأكثر "
                          "(نمذجةٌ ثم عونٌ ثم «وحدك»، وإلّا فلا مقيسَ فيها)")
        for page in pages:
            tokens = str(page.get("text") or "").split()
            words = [re.sub(r"[^A-Za-z'’-]", "", t) for t in tokens]
            for raw, word in zip(tokens, words):
                if not word:
                    errors.append(f"{label}: «{raw}» ليست كلمة")
                    continue
                if raw != word:
                    errors.append(f"{label}: «{raw}» فيها علامةُ وقفٍ — و`METHOD.md §٨` "
                                  "تستثنيها من التأسيس نصّاً، فلا تُعرَض قبل أن تُدرَّس")
                # **والحرفُ الكبير رسمٌ لم يُدرَّس** (ولا يُستثنى إلا شائكةٌ رسمُها هو
                # كما أُعلن: `I` كلُّها شوكة) — فيُسمّى بعلّته لا يُخلَط بالمجهولة.
                if word in index["tricky"] or word in index["gpc"]:
                    continue
                low = word.lower()
                if low in index["tricky"] or low in index["gpc"]:
                    errors.append(f"{label}: «{word}» بحرفٍ كبير — والكبيرُ رسمٌ لم يُدرَّس "
                                  "في السلّم (ولا يُستثنى إلا شائكةٌ رسمُها هو)")
                else:
                    errors.append(f"{label}: «{word}» في سطرٍ وليست كلمةَ قراءةٍ ولا شائكة "
                                  "— ونصُّ القصة رموزُ الدرجات المفتوحة وشائكاتُها لا غير")
            pick = page.get("pick")
            if pick not in words:
                errors.append(f"{label}: صفحةٌ تسأل عن صورة «{pick}» وليست من كلمات سطرها "
                              "— ولا يُسأل الطفلُ عمّا لم يقرأ")
            elif pick not in bank["touchable"]:
                errors.append(f"{label}: «{pick}» لا صورةَ مفردةَ لها تُلمَس — وصفحةُ "
                              "القصة تُقاس بلمس صورة ما قُرئ")
    return errors


def budget_errors(eras: list, grades: list) -> list:
    """**ميزانيةُ الشائكات** (`METHOD.md §٥` و§١٢-١): ٥ ← ١٧ ← ٣١ ← ٥٦ — تُقابَل بالمحصيّ.

    وهي الخرقُ الوحيد المحصور لمبدأ المفكوكية، فحدُّه **عددٌ يُقَرّ** لا تقديرٌ يتوسّع:
    من زاد شائكةً في درجةٍ زاد على العهد كلِّه، ولا يظهر ذلك إلا هنا.
    """
    errors = []
    seen, running = set(), 0
    for era in eras:
        mine = [g for g in grades if g["era"] == era["id"]]
        if not mine:
            errors.append(f"[{era['id']}] عهدٌ بلا درجة")
        for grade in mine:
            for word in grade["tricky"]:
                if word in seen:
                    errors.append(f"[{grade['id']}] الشائكة «{word}» مكرَّرةٌ في السلّم "
                                  "— وتكرارُها يضخّم الميزانية بلا مادّةٍ جديدة")
                seen.add(word)
                running += 1
        if running != era["trickyBudget"]:
            errors.append(f"[{era['id']}] الشائكاتُ حتى نهايته {running} "
                          f"وميزانيتُه {era['trickyBudget']} (`METHOD.md §٥`: ٥ ← ١٧ ← ٣١ ← ٥٦)")
    return errors


def ladder_errors(grades: list, vowels: set, cluster_grade: str) -> list:
    """سلّمُ الرموز: لا رمزَ يتكرّر معرّفُه، ولا كلمةَ تُفكّ قبل أن يُفتَح أحدُ رموزها.

    **وتجاورُ الساكنين درجةٌ كالرمز**: المرحلةُ ٤ (`METHOD.md §٥`) لا رمزَ جديدَ فيها،
    فلولا هذا الشرطُ لَحُسِب `stand` مفكوكاً عند ح٢ — ورموزُه كلُّها مفتوحةٌ هناك،
    وإنّما يعجز الطفلُ عن `st` نفسِه (وهو علّةُ إقحام الحركة العربيّ).
    """
    errors = []
    opened, order = set(), {}
    cluster_at = next((i for i, g in enumerate(grades) if g["id"] == cluster_grade), None)
    if cluster_at is None:
        errors.append(f"[السلّم] لا درجةَ عناقيدَ بالمعرّف «{cluster_grade}» — "
                      "والمرحلةُ ٤ منها (`METHOD.md §٥`)")
        cluster_at = 0
    elif grades[cluster_at]["symbols"]:
        errors.append(f"[{cluster_grade}] درجةُ العناقيد ومعها رموزٌ جديدة — "
                      "«العناقيد **بلا رموزٍ جديدة**» (`METHOD.md §٥`)")

    def first_at(gpc: list) -> int:
        """أوّلُ درجةٍ تُفكّ عندها الكلمة: أقصى رموزها، وتجاورُ الساكنين درجةٌ فيها."""
        places = [order.get(g, 99) for g in gpc]
        adjacent = any(i > 0 and gpc[i] not in vowels and gpc[i - 1] not in vowels
                       for i in range(len(gpc)))
        return max(places + ([cluster_at] if adjacent else []))

    for index, grade in enumerate(grades):
        for symbol in grade["symbols"]:
            if symbol["id"] in opened:
                errors.append(f"[{grade['id']}] الرمز «{symbol['id']}» مفتوحٌ قبلها "
                              "— ومعرّفُ الرمز مفتاحُ مهارةٍ، فتكرارُه يخلط قياسين")
            opened.add(symbol["id"])
            order[symbol["id"]] = index
        for word in grade["words"]:
            if not word["gpc"]:
                errors.append(f"[{grade['id']}] «{word['w']}» بلا مقاطعَ معلَنة")
            late = [g for g in word["gpc"] if order.get(g, 99) > index]
            if late:
                errors.append(f"[{grade['id']}] «{word['w']}» فيها رمزٌ لم يُفتَح بعدُ: "
                              f"{'، '.join(late)}")
            early = [g for g in word["gpc"] if g not in order]
            if early:
                errors.append(f"[{grade['id']}] «{word['w']}» فيها رمزٌ لا وجودَ له في "
                              f"السلّم: {'، '.join(early)}")
            # **وأولُ درجةٍ تُفكّ عندها الكلمةُ هي درجتُها**: كلمةٌ صارت مفكوكةً قبل
            # درجتها تأخّرت بلا سبب — والتأخيرُ يحرم الطفلَ مادّةً يملكها.
            if word["gpc"] and not late and not early and first_at(word["gpc"]) < index:
                errors.append(f"[{grade['id']}] «{word['w']}» صارت مفكوكةً قبل درجتها "
                              f"(عند {grades[first_at(word['gpc'])]['id']}) — فموضعُها "
                              "أبكر (ولا كلمةَ تُؤخَّر بلا علّة)")
    return errors


# ————— عقدُ الرحلة —————

def journey_errors(data: dict) -> list:
    errors = []
    gates = data["gates"]
    section_ids = [s["id"] for s in data["sections"]]

    # «البواباتُ **الثلاث**» نصُّ `METHOD.md §٤–§٥` — ثابتُ منهجٍ لا عددٌ محصيّ
    if len(gates) != 3:
        errors.append(f"[البوابات] في الرحلة {len(gates)} بوابة، والمنهج ثلاث "
                      "(`METHOD.md §٤–§٥`)")
    for gate in gates:
        for field in ("title", "hint", "face", "again"):
            if not gate.get(field):
                errors.append(f"[بوابة {gate['id']}]: بلا {field}")
        if gate["after"] not in section_ids:
            errors.append(f"[بوابة {gate['id']}] موضعُها بعد قسمٍ مجهول: «{gate['after']}»")
        if not gate.get("scope"):
            errors.append(f"[بوابة {gate['id']}] بلا مدىً تسأل عنه — فجلستُها فارغة")
        after = section_ids.index(gate["after"]) if gate["after"] in section_ids else -1
        at = section_ids.index(f"gate-{gate['id']}") if f"gate-{gate['id']}" in section_ids else -1
        if after >= 0 and at >= 0 and at != after + 1:
            errors.append(f"[بوابة {gate['id']}] تلي «{gate['after']}» في الإعلان "
                          "ولا تليه على الخريطة")

    # **بوابةُ الأذن بابُ منهجٍ** (ق٤): تُعلن ما تفتحه، ولا يسبقها شيءٌ من مسار الحرف
    opener = next((g for g in gates if g.get("opens") == "letter"), None)
    if not opener:
        errors.append("[البوابات] لا بوابةَ تُعلن أنّها تفتح مسار الحرف — وق٤ نصُّها "
                      "«يُفتح مسارُ الحرف باجتياز 🚪١» (`METHOD.md §٦`)")
    else:
        at = section_ids.index(f"gate-{opener['id']}")
        letters = [s for s in data["sections"] if s["kind"] == "era"]
        early = [s["id"] for s in letters if section_ids.index(s["id"]) < at]
        if early:
            errors.append(f"[بوابة {opener['id']}] عهدٌ من مسار الحرف قبلها: "
                          f"{'، '.join(early)} — وهي بابُ فتحه (ق٤)")

    known = {s["id"] for s in data["stations"]}
    gate_nodes, station_nodes = [], []
    for section in data["sections"]:
        if not section["nodes"]:
            errors.append(f"[{section['id']}] قسمٌ بلا عقدة")
        if not section.get("title") or not section.get("accent"):
            errors.append(f"[{section['id']}] قسمٌ لا يصف نفسَه (عنوانٌ أو لون)")
        for node in section["nodes"]:
            (gate_nodes if node["type"] == "gate" else station_nodes).append(node)
            if node["id"] != f"{node['type']}:{node['part']}":
                errors.append(f"[{node['id']}] المعرّفُ ليس «<النوع>:<الجزء>»")
    if len(gate_nodes) != len(gates):
        errors.append(f"[البوابات] {len(gates)} في `GATES` و{len(gate_nodes)} عقدةً في الرحلة")

    stray = [n["id"] for n in station_nodes if n["id"] not in known]
    if stray:
        errors.append(f"[الرحلة] عقدةٌ على الخريطة ليست محطةً في المنهج: {'، '.join(stray)}")
    unseen = known - {n["id"] for n in station_nodes}
    if unseen:
        errors.append(f"[الرحلة] محطةٌ في المنهج لا تصل إلى الخريطة: {'، '.join(sorted(unseen))}")
    return errors


# ————— حدُّ المجموعة: **سقفٌ لا هدف** (قرار المالك · `FAMILY §١٠ب`) —————
#
# «لا قسمَ في الخريطة فوق ١٢ عقدة». وعلّتُه في يد الطفل لا في الشيفرة: درجٌ يُفرَد
# فيملأ الشاشةَ بما لا يُحاط به نظراً، فيضيع «أين أنا» — وهو ما تقوم عليه الخريطة.
#
# **وهو سقفٌ لا هدف**: قسمٌ من ثلاثٍ صحيحٌ تماماً، وإنّما يُمنَع تجاوزُ الاثنتي عشرة.
# والرقمُ يُقرأ من `curriculum.js` (‏`SECTION_CAP`) لا يُكتب هنا — مصدرٌ واحد.

def group_errors(data: dict) -> list:
    cap = data.get("sectionCap") or 12
    errors = []
    for section in data["sections"]:
        count = len(section["nodes"])
        if count > cap:
            errors.append(f"[{section['id']}] «{section.get('title', '')}» فيه {count} عقدة "
                          f"وحدُّ المجموعة {cap} (`FAMILY §١٠ب` — سقفٌ لا هدف)")
    return errors


# ————— الشائكاتُ بطريقة heart words: لكلِّ مفتوحةٍ رسمُها وشوكتُها وسياقُها —————
#
# «كلُّ شائكةٍ **مفكوكةٌ إلا موضعَ شوكتها**» (`METHOD.md §١٢-١`)، فلا تُعرَض شائكةٌ في
# شاشةِ طفلٍ بلا مقاطعَ يُوسَم فيها موضعُ الشوكة. **والغيابُ ههنا صامتٌ لولا هذا الباب**:
# شائكةٌ بلا رسمٍ معلَن تسقط من جولات محطتها بلا خبر، ويبقى مفتاحُها في ليتنر أبداً.
#
# **ونومُه بالدرجة لا بالجميع، وشرطُه مجرود**: الشائكاتُ ستٌّ وخمسون تُكتب في أربع
# جلسات (٤–٧)، فمطالبةُ الجميع يومَ تُكتب أولاها تُسقِط الجلسةَ الرابعة بذنب السابعة.
# فالمطلوبُ **التمامُ حتى آخر درجةٍ أُعلن فيها رسم** — فمن كتب `he` (ح٦) طُولب بـ`she`
# معها في الحال، وما بعدَها نائمٌ حتى يُكتب. ولا رايةَ تُضبط بيد.

def wanted_hearts(data: dict) -> list:
    """الشائكاتُ المطلوبُ رسمُها اليوم: كلُّ ما حتى آخر درجةٍ فيها رسمٌ معلَن."""
    hearts = data.get("hearts") or {}
    reached = -1
    for at, grade in enumerate(data["grades"]):
        if any(word in hearts for word in grade["tricky"]):
            reached = at
    return [w for g in data["grades"][:reached + 1] for w in g["tricky"]]


def heart_errors(data: dict) -> list:
    errors = []
    hearts = data.get("hearts") or {}
    open_tricky = [w for g in data["grades"] for w in g["tricky"]]
    for word in wanted_hearts(data):
        shape = hearts.get(word)
        if not shape:
            errors.append(f"[شائكة {word}] بلا رسمٍ معلَن في `HEART_WORDS` — "
                          "فلا موضعَ لشوكتها يُوسَم")
            continue
        joined = "".join(shape["parts"])
        if joined != word:
            errors.append(f"[شائكة {word}] مقاطعُها «{joined}» لا تؤلّفها")
        # **والشوكةُ موضعٌ أو موضعان** (`was`: ‏`a` تقول /o/ و`s` تقول /z/) — تُقرأ
        # قائمةً في الحالين، فلا يسقط الموضعُ الثاني من الفحص كما لا يسقط من الوسم.
        hearts_at = shape["heart"] if isinstance(shape["heart"], list) else [shape["heart"]]
        if not hearts_at:
            errors.append(f"[شائكة {word}] بلا موضعِ شوكةٍ أصلاً — وكلُّ شائكةٍ شوكة")
        for at in hearts_at:
            if not 0 <= at < len(shape["parts"]):
                errors.append(f"[شائكة {word}] موضعُ شوكتها ({at}) خارج مقاطعها")
        if not shape.get("say"):
            errors.append(f"[شائكة {word}] بلا سياقٍ مسموع — و`METHOD.md §٦`: "
                          "«تُدرَّس داخل سياقٍ مسموعٍ مألوف لا معزولةً»")
        # **ودرجتُها من القيد معلَنةٌ لا مسكوتٌ عنها** (حكمُ المدير · `METHOD.md §٦`):
        # مفتاحٌ سمعيٌّ (ذاتُ المدخل) **أو** علّةُ استثناء (الوظيفةُ الصرفة) — أحدُهما
        # لا كلاهما. وأثرُ المفتاح يحرسه `check_coupling` (بابُه الخامس، سالباً).
        if bool(shape.get("listen")) == bool(shape.get("why")):
            errors.append(f"[شائكة {word}] لا تعلن درجتَها من قيد الاقتران: "
                          "لها `listen` (مفتاحٌ سمعيّ) أو `why` (علّةُ استثنائها) "
                          "— أحدُهما لا كلاهما ولا واحدَ منهما")
    stray = [w for w in hearts if w not in open_tricky]
    if stray:
        errors.append(f"[الشائكات] رسمٌ لشائكةٍ ليست في المنهج: {'، '.join(stray)}")
    return errors


def deixis_errors(data: dict) -> list:
    """**المراجعُ الضميريةُ المرسومة** (س٥-٧ — بندُ الجلسة ٨): لكلٍّ رسمُه وعبارتُه.

    **العلّة**: مرجعُ الضمير (المتكلمُ والمخاطَب) **يُرسَم ولا يُصوَّر** — فليس له
    مدخلٌ في الرصيد يحرسه بابُ الكلمة، ولا مقاطعُ رسمٍ يحرسها بابُ السلّم. فلو أُعلن
    مرجعٌ بوضعٍ لا رسمَ له في `figures.js` لَخرجت بطاقةٌ **فارغة** يُسأل عنها الطفل،
    ولا يشتكي أحد: الجولةُ تُبنى، والمفتاحُ يُقاس، والحرّاسُ خضر.
    """
    errors = []
    drawn = set(data.get("deixisPoses") or [])
    for one in data.get("deixis") or []:
        if one.get("pose") not in drawn:
            errors.append(f"المرجع «{one.get('w')}» يعلن وضعاً لا رسمَ له في "
                          f"`figures.js` ({one.get('pose')}) — بطاقةٌ فارغة تُعرَض")
        if not one.get("ar"):
            errors.append(f"المرجع «{one.get('w')}» بلا عبارةٍ عربية تسمّيه")
    return errors


def bank_of(data: dict) -> dict:
    return {
        "words": {w["w"] for w in data["words"]},
        "touchable": set(data.get("touchable") or []),
        "forms": set(data["forms"]),
        # **ميزانيةُ الأزواج**: كلماتٌ خارج Starters بإذنٍ معدودٍ معلَّل — تمرّ على
        # بابِ الكلمة كما تمرّ مداخلُ القائمة، ولا تمرّ على غيره بلا شرطها.
        "budget": {b["w"] for b in data.get("pairBudget") or []},
        "raised": {r["w"]: r["why"] for r in data["raised"]},
        "fields": {f["id"] for f in data["fields"]},
        "units": {u["id"] for u in data["units"]},
        "sounds": {p["say"] for p in data.get("phonemes") or []},
        "deixis": {d["w"] for d in data.get("deixis") or []},
    }


# ————— أصواتُ المنهج: لا رمزَ بلا صوت، ولا صوتَين بنصٍّ واحد —————

SAY_RE = re.compile(r"^/[^/\s]+/$")


def sound_errors(data: dict) -> list:
    """**جدولُ الأربعة والأربعين صوتاً** (`METHOD.md §٤` — مادّةُ س٣ وس٤).

    ثلاثةُ شروطٍ لكلٍّ علّتُه:
      ١) **لا رمزَ في السلّم بلا صوتٍ معلَن** — وإلا سقطت كلمتُه من حوض س٤ صامتةً
         (`soundsOf` تردّ `null`)، فينقص مدىً ولا يشتكي أحد.
      ٢) **ولا صوتان بنصٍّ منطوقٍ واحد** — مفتاحُ ملفّ الصوت بصمةُ نصّه وحدَه
         (`audio.js`)، فيتقاسم الصوتان ملفاً واحداً ويُسمع أحدُهما مكانَ الآخر.
      ٣) **ورسومُ الصوت الواحد صائتةٌ كلُّها أو ساكنةٌ كلُّها** — القافيةُ تُحسب من
         أوّل صائت (`rimeOf`)، فصوتٌ رسمٌ منه صائتٌ ورسمٌ ساكن يخلط القوافي.
    """
    errors = []
    vowels = set(data["vowels"])
    says = {}
    known = set()
    for phoneme in data.get("phonemes") or []:
        if not SAY_RE.match(str(phoneme.get("say") or "")):
            errors.append(f"[صوت {phoneme['id']}] نصُّه المنطوق ليس على صورة `/x/`: "
                          f"«{phoneme.get('say')}»")
        if phoneme["say"] in says:
            errors.append(f"[صوت {phoneme['id']}] نصُّه المنطوق «{phoneme['say']}» هو نصُّ "
                          f"«{says[phoneme['say']]}» — وملفُّ الصوت بصمةُ نصّه وحدَه")
        says[phoneme["say"]] = phoneme["id"]
        kinds = {g in vowels for g in phoneme["graphemes"]}
        if len(kinds) > 1:
            errors.append(f"[صوت {phoneme['id']}] رسومُه بين صائتٍ وساكن: "
                          f"{'، '.join(phoneme['graphemes'])}")
        for grapheme in phoneme["graphemes"]:
            if grapheme in known:
                errors.append(f"[صوت {phoneme['id']}] الرسم «{grapheme}» منسوبٌ إلى صوتين")
            known.add(grapheme)
    for grade in data["grades"]:
        for symbol in grade["symbols"]:
            if symbol["id"] not in known:
                errors.append(f"[{grade['id']}] الرمز «{symbol['id']}» بلا صوتٍ معلَن في "
                              "`PHONEMES` — فكلماتُه تسقط من حوض س٤ صامتةً")
    errors += bank_sound_errors(data)
    return errors


def bank_sound_errors(data: dict) -> list:
    """**أصواتُ الرصيد المصوَّر: مُعلَنةٌ أو مُعلَّلة، ولا ثالثَ** (توسعةُ الجلسة ٥).

    حكمُ قبول الجلسة ٣ (البند ٣): «توسعةُ أصوات الرصيد المصوَّر (~٩٠ كلمة) بندٌ محدود
    يُضاف للجلسة ٥» — فبها يتّسع حوضُ س٤ (الدمجُ والتقطيع والقافية). **والعلّةُ التي
    أوجبت باباً**: كلمةٌ بلا أصواتٍ تسقط من الحوض **صامتةً** (`soundsOf` تردّ `null`)،
    فتضيق القافيةُ ولا يشتكي أحد — وهو عينُ العيب الذي رُفع في الجلسة ٣.

    فلكلِّ كلمةٍ مصوَّرة **أحدُ ثلاثة**: مقاطعُ رسمها في السلّم (كلمةُ قراءة)، أو
    `sounds` معلَنة، أو `soundless` **بعلّةٍ تُقرأ** (شوا ليست في الأربعين، أو كلمتان
    لا كلمة). ولا تجمع كلمةٌ بين السلّم والإعلان: **مصدرٌ واحد لأصوات الكلمة** وإلّا
    افترق ما يسمعه الطفلُ في س٤ عمّا يفكّه في مسار الحرف بلا حارس.
    """
    errors = []
    known = {p["id"] for p in data.get("phonemes") or []}
    ladder = {w["w"] for g in data["grades"] for w in g["words"]}
    for word in data["words"]:
        name, declared = word["w"], word.get("sounds")
        if declared and name in ladder:
            errors.append(f"[{name}] تعلن أصواتَها وهي كلمةُ قراءةٍ في السلّم — "
                          "ومصدرُ أصوات الكلمة واحد (مقاطعُ رسمها)")
        if word.get("soundless") and (declared or name in ladder):
            errors.append(f"[{name}] تعلن علّةَ خلوّها من الأصوات ولها أصواتٌ — "
                          "أحدُ الحقلين لا كلاهما")
        for sound in declared or []:
            if sound not in known:
                errors.append(f"[{name}] الصوت «{sound}» ليس من أصوات المنهج "
                              f"({len(known)} صوتاً في `PHONEMES`)")
        if not declared and name not in ladder and not word.get("soundless"):
            errors.append(f"[{name}] بلا أصواتٍ معلَنة ولا علّةٍ مكتوبة — "
                          "فتسقط من حوض س٤ صامتةً (`sounds` أو `soundless`)")
    return errors


def pair_errors(data: dict) -> list:
    """**صورةُ الزوج بالبيانات لا باليد** (`METHOD.md §٤` وحكمُ المدير في f/v).

    «بالصور **حيث** للزوجين معنى مصوَّر»: فالشكلُ (`mode`) **محسوبٌ** من كون حاملَيه
    في الرصيد المصوَّر — ويقابله هذا البابُ بقاعدته، فلا يُكتب شكلٌ بيد ولا ينقلب
    شكلُ زوجٍ صامتاً يومَ تسقط صورةُ حامله.
    """
    errors = []
    faced = {w["w"] for w in data["words"] if w.get("face")}
    forms = set(data["forms"])
    budget = {b["w"] for b in data.get("pairBudget") or []}
    for station in data["stations"]:
        for pair in station.get("pairs") or []:
            label = f"[{station['id']} · زوج {pair['key']}]"
            for name in pair.get("names") or []:
                if name not in forms and name not in budget:
                    errors.append(f"{label}: الحاملُ «{name}» ليس من مداخل "
                                  "Cambridge Pre A1 Starters ‏2025 ولا من ميزانية "
                                  "الأزواج المعلَنة")
            names = pair.get("names") or []
            pictured = len(names) == 2 and all(n in faced for n in names)
            if (pair["mode"] == "word") != pictured:
                errors.append(f"{label}: شكلُه «{pair['mode']}» ويخالف قاعدةَ الصورة "
                              f"(حاملاه المصوَّران: {sum(n in faced for n in names)} من "
                              f"{len(names)})")
            sounds = pair.get("sounds") or []
            if pair["mode"] == "sound" and len(set(sounds)) != 2:
                errors.append(f"{label}: تمييزٌ صوتيٌّ خالص بلا صوتين **مختلفين** "
                              f"({'، '.join(sounds) or 'لا صوت'}) — فلا فرقَ يُسأل عنه")
            if not names and not pair.get("why"):
                errors.append(f"{label}: بلا حاملَين وبلا علّةٍ مكتوبة "
                              "(ولِمَ لا زوجَ أدنى مصوَّرٌ له؟)")
    return errors


def budget_word_errors(data: dict, bank: dict) -> list:
    """**ميزانيةُ الأزواج الدنيا: خرقٌ محصورٌ لا بابٌ خلفيّ** (حسمُ أ-٣).

    أُذن لكلماتٍ معدوداتٍ أن تدخل الرصيدَ المصوَّر وهي خارج مداخل Starters — **لأنّ
    الرصيدَ خادمُ المنهج لا حاكمٌ عليه**، ولأنّ أصعبَ زوجين على أذن طفلنا بقيا بلا
    كلمة. ولولا هذا البابُ لَصار الإذنُ ثقباً: تدخل منه كلمةٌ لا زوجَ لها فيتّسع
    الرصيدُ من غير بابه المُعلَن.

    فأربعةُ شروطٍ لكلِّ كلمةٍ فيها، ولكلٍّ علّتُه:
      ١) **لها علّةٌ مكتوبة** — لا اسمُ زوجٍ وحدَه.
      ٢) **وهي فعلاً خارج Starters** — فمن أدخل فيها مدخلاً من القائمة وسّع الميزانيةَ
         بلا حاجة، وأوهم أنّ الخرقَ أكبرُ ممّا هو.
      ٣) **وهي حاملُ زوجٍ في محطة تمييزٍ فعلاً** — لا كلمةً تدخل الرصيدَ باسم زوجٍ
         ثم تُدرَّس مفرداتٍ.
      ٤) **ولا تدخل سلّمَ الفكّ** (`GRADES`): بابُها الأذنُ وحدَها — وإلّا صارت
         الميزانيةُ توسيعاً لمقروء الطفل من غير قرار مالك (أ-٦).
    """
    errors = []
    budget = data.get("pairBudget") or []
    carriers = {n for s in data["stations"] for p in (s.get("pairs") or [])
                for n in (p.get("names") or [])}
    ladder = {w["w"] for g in data["grades"] for w in g["words"]}
    for entry in budget:
        name = entry.get("w")
        label = f"[ميزانية الأزواج · {name}]"
        if len(str(entry.get("why") or "")) <= 20:
            errors.append(f"{label}: بلا علّةٍ مكتوبة تُقرأ")
        if name in bank["forms"]:
            errors.append(f"{label}: مدخلٌ في Starters أصلاً — فلا حاجةَ به إلى ميزانية")
        if name not in carriers:
            errors.append(f"{label}: ليست حاملَ زوجٍ في أيّ محطة تمييز — "
                          "وبابُ الميزانية الأزواجُ وحدَها")
        if name not in bank["words"]:
            errors.append(f"{label}: ليست في الرصيد المصوَّر (`WORDS`)")
        if name in ladder:
            errors.append(f"{label}: دخلت سلّمَ الفكّ — وميزانيةُ الأزواج بابُها "
                          "الأذنُ وحدَها (توسيعُ المقروء قرارُ مالك)")
    return errors


def accent_errors(data: dict) -> list:
    """**جدولُ الأصوات يتبع اللكنة المحسومة** (حسمُ أ-٢، ١٧ أغسطس ٢٠٢٦).

    سلّمُ الرموز L&S **رسمٌ لا لهجة** فيبقى؛ **وتحقيقُ الصوت لهجةٌ فيتبع الصوتَ
    المقرَّر** (لكنةٌ أمريكية، صوتُ Leda — `docs/REVIEW_IDENTITY.md`). وكان الجدولُ
    منقولاً عن مصدرٍ بريطانيٍّ غيرِ راتع، فكان يقول للطفل «هذا الرمزُ صوتٌ واحد»
    ويُسمعه صائتاً وراءً — والراءُ في العربية فونيمٌ بارز يسمعه يقيناً.

    وثلاثةُ شروطٍ يقابل بها كلَّ صوت:
      ١) **اللكنةُ المُعلَنة في الوثيقة هي اللكنةُ في البيانات** — فإن تبدّلت هناك
         ولم تتبدّل هنا وقف البابُ ولم يمرّ صامتاً.
      ٢) **ما رُسم بالراء يُنطَق راتعاً**: نصُّه ينتهي براءٍ، **ولا يكون اسمَ رسمه**
         (‏`/ar/` نصُّ الجدول البريطانيّ لا نطقُ لسانِنا).
      ٣) **ولا يدخل الجدولَ صوتٌ لا يقوله لسانُنا**: المركّباتُ المركزية
         (‏/ɪə/ /ɛə/ /ʊə/) وعلامةُ الطول الطويلة — كلاهما عرفُ RP لا العامّة الأمريكية.
    """
    errors = []
    accent = data.get("accent") or {}
    phonemes = data.get("phonemes") or []
    declared = (IDENTITY.read_text(encoding="utf-8") if IDENTITY.exists() else "")
    if accent.get("ar") and accent["ar"] not in declared:
        errors.append(f"[اللكنة] البياناتُ تقول «{accent['ar']}» ولا تقولها "
                      f"{IDENTITY.name} — واللكنةُ قرارُ مالكٍ يُقرأ من موضعه")
    absent = set(accent.get("absent") or [])
    rhotic = set(accent.get("rhotic") or [])
    mark = accent.get("lengthMark") or "ː"
    for phoneme in phonemes:
        say, pid = str(phoneme.get("say") or ""), phoneme.get("id")
        if say in absent:
            errors.append(f"[صوت {pid}] «{say}» لا يقوله لسانُنا المقرَّر "
                          f"({accent.get('ar')}) — وهو مركّبٌ مركزيٌّ غيرُ راتع")
        if mark in say:
            errors.append(f"[صوت {pid}] «{say}» فيه علامةُ الطول «{mark}» — "
                          f"وهي عرفُ الجدول البريطانيّ لا لكنتَنا")
        if pid in rhotic:
            if not say.endswith("r/"):
                errors.append(f"[صوت {pid}] رمزٌ فيه راءٌ مرسومة ونصُّه «{say}» غيرُ "
                              "راتع — والطفلُ سامعُ الراء يقيناً")
            if say.strip("/") == str(pid):
                errors.append(f"[صوت {pid}] نصُّه المنطوق اسمُ رسمه «{say}» — "
                              "نقلٌ عن جدولٍ لا نطقٌ في لسانٍ مقرَّر")
    missing = [s for s in rhotic if not any(p.get("id") == s for p in phonemes)]
    if missing:
        errors.append(f"[اللكنة] رموزٌ مُعلَنةٌ راتعةً لا وجودَ لها في الجدول: "
                      f"{'، '.join(missing)}")
    return errors


def source_errors(data: dict) -> list:
    """الرصيدُ المنقول: عددُه ما أعلنه مصدرُه، وكلُّ مصوَّرٍ منه مدخلٌ فيه."""
    errors = []
    if len(data["starters"]) != len(set(data["starters"])):
        errors.append("[الرصيد] مدخلٌ مكرَّر في `STARTERS`")
    bank = bank_of(data)
    outside = sorted(w for w in bank["words"]
                     if w not in bank["forms"] and w not in bank["budget"])
    if outside:
        errors.append(f"[الرصيد] كلمةٌ في الرصيد المصوَّر ليست من مداخل Starters "
                      f"ولا من ميزانية الأزواج: {'، '.join(outside)}")
    errors += budget_word_errors(data, bank)
    raised_in = sorted(set(bank["raised"]) & bank["words"])
    if raised_in:
        errors.append(f"[الرصيد] كلمةٌ مرفوعةٌ وهي في الرصيد المصوَّر: {'، '.join(raised_in)}")
    for word in data["words"]:
        if word["field"] not in bank["fields"]:
            errors.append(f"[الرصيد] «{word['w']}» في حقلٍ مجهول: «{word['field']}»")
        if not (word.get("face") or word.get("count") or word.get("swatch")
                or word.get("pictured")):
            errors.append(f"[الرصيد] «{word['w']}» بلا صورةٍ ولا سببٍ معلَن لغيابها")
        swatch = word.get("swatch")
        if swatch and not SWATCH_RE.match(str(swatch)):
            errors.append(f"[الرصيد] «{word['w']}» بقعتُها ليست قيمةَ لونٍ ستَّ عشرية: "
                          f"«{swatch}»")
        if swatch and word["field"] != SWATCH_FIELD:
            errors.append(f"[الرصيد] «{word['w']}» بقعةُ لونٍ في حقل «{word['field']}» — "
                          "والبقعةُ لا تصدُق إلا حيث اللونُ هو الكلمة (حقل الألوان)")

    # ————— **سجلُّ ما حُلَّ من المرفوعات** (`RESOLVED` — حكمُ المدير ١٣ أغسطس) —————
    #
    # كلمةٌ خرجت من `RAISED` بحكم: إمّا بلغت مقصدَها في الرصيد (بقعةً أو حركةً) وإمّا
    # صارت طقساً منطوقاً. **والسجلُّ يُقابَل بالواقع** لا يُصدَّق: فمن كتب «حُلَّت»
    # ولم يُدخلها موضعَها كتب سطراً لا أثرَ له.
    resolved = {r["w"]: r for r in data.get("resolved") or []}
    ritual_words = {re.sub(r"[^a-z]", "", part.lower())
                    for text in (data.get("ritual") or {}).values()
                    for part in str(text).split()}
    for word, row in resolved.items():
        if word in bank["raised"]:
            errors.append(f"[المرفوعات] «{word}» في سجلّ المحلولة وهي ما تزال مرفوعة")
        if not row.get("to") or not row.get("why"):
            errors.append(f"[المرفوعات] «{word}» حُلَّت بلا مقصدٍ أو بلا علّةٍ مكتوبة")
        reached = word in bank["words"] if row.get("to") != "ritual" else word in ritual_words
        if not reached:
            errors.append(f"[المرفوعات] «{word}» أُعلن حلُّها إلى «{row.get('to')}» "
                          "ولم تبلغه — لا في الرصيد المصوَّر ولا في طقس المعلم")
    for text in (data.get("ritual") or {}).values():
        outside = [p for p in str(text).split()
                   if re.sub(r"[^A-Za-z]", "", p) not in bank["forms"]
                   and re.sub(r"[^a-z]", "", p.lower()) not in bank["forms"]]
        if outside:
            errors.append(f"[الطقس] «{text}» فيه كلمةٌ خارج الرصيد: {'، '.join(outside)}")
    return errors


# ————— المولّدات: ما تستهلكه ⊆ جبهةُ محطتها (نائمٌ حتى تُكتب أولى وحدات التمارين) —————

def generator_modules() -> list:
    out = []
    for path in sorted(APP_JS.glob("*.js")):
        if path.name in SEED_MODULES:
            continue
        src = path.read_text(encoding="utf-8")
        if CONSUMES_DECL.search(src) or PROBE_DECL.search(src):
            out.append(path)
    return out


def probe(modules: list, stations: list) -> tuple:
    """يستورد المولّدات في node ويجرد جولاتِها. يُرجِع (جولات، خطأُ استيراد)."""
    js = f"""
    const paths = {json.dumps([p.as_uri() for p in modules])};
    const stations = {json.dumps([s['id'] for s in stations])};
    const out = {{ consumes: {{}}, rounds: [] }};
    for (const path of paths) {{
      const m = await import(path);
      for (const [type, used] of Object.entries(m.CONSUMES || {{}})) out.consumes[type] = used;
      if (typeof m.probeRounds !== 'function') continue;
      for (const id of stations) {{
        for (const seed of [1, 7, 23, 101]) {{
          for (const [i, used] of (m.probeRounds(id, seed) || []).entries()) {{
            out.rounds.push({{ id, seed, index: i, used }});
          }}
        }}
      }}
    }}
    console.log(JSON.stringify(out));
    """
    run = subprocess.run(["node", "--input-type=module", "-e", js],
                         capture_output=True, text=True)
    if run.returncode != 0:
        names = "، ".join(p.name for p in modules)
        return None, (f"[المولّدات] تعذّر استيراد ({names}) في node — ووحدةُ المولّد يجب "
                      "أن تكون **خالصة** لا تمسّ الـDOM ولا تستورد `main.js`:\n"
                      + run.stderr.strip()[:300])
    return json.loads(run.stdout), None


# ————— التشغيل —————

def check(data: dict) -> int:
    fails, asleep = 0, 0
    stations = data["stations"]
    bank = bank_of(data)

    def door(title, errors, count):
        nonlocal fails
        print(f"\n— {title} —")
        for e in errors[:12]:
            print("  ✗", e)
        if len(errors) > 12:
            print(f"  … و{len(errors) - 12} خطأً آخر")
        if not errors:
            print("  ✓", count)
        fails += len(errors)

    def dormant(msg):
        nonlocal asleep
        asleep += 1
        print("  ⏸", f"{msg} — نائم، يستيقظ ذاتياً")

    nodes = sum(len(s["nodes"]) for s in data["sections"])
    skills = sum(len(s["skills"]) for s in stations)
    symbols = sum(len(g["symbols"]) for g in data["grades"])

    door("مصدرُ الرصيد: منقولٌ لا مقدَّر", source_errors(data),
         f"{len(data['starters'])} مدخلاً من Cambridge Pre A1 Starters ‏2025، "
         f"و{len(bank['words'])} منها مصوَّرةٌ في الرصيد، و{len(bank['raised'])} مرفوعةٌ بسببها")
    door("بنيةُ الجبهة: كلُّ محطةٍ تعلن حدودَها وقياسَها",
         frontier_errors(stations, bank),
         f"{len(stations)} محطةً بجبهاتها، و{skills} مفتاحَ ليتنر في "
         f"{len(bank['units'])} وحدة")
    door("سلّمُ الرموز: لا رمزَ يسبق درجتَه ولا كلمةَ تتأخّر عنها",
         ladder_errors(data["grades"], set(data["vowels"]), data["clusterGrade"]),
         f"{symbols} رمزاً في {len(data['grades'])} درجة، وكلُّ كلمةٍ عند أوّل درجةٍ تُفكّ فيها")
    door("ميزانيةُ الشائكات: المحصيُّ = المقَرّ", budget_errors(data["eras"], data["grades"]),
         "، ".join(f"{e['id']}: {e['trickyBudget']}" for e in data["eras"]))
    door("أصواتُ المنهج: لا رمزَ بلا صوت ولا صوتان بنصٍّ واحد", sound_errors(data),
         f"{len(data.get('phonemes') or [])} صوتاً لـ{symbols} رمزاً، ولكلٍّ نصُّه المنطوق")
    accent = data.get("accent") or {}
    door("لكنةُ الجدول: تحقيقُ الصوت يتبع اللسانَ المقرَّر", accent_errors(data),
         f"لكنةٌ {accent.get('ar')} ({accent.get('id')})، و{len(accent.get('rhotic') or [])} "
         f"رمزاً راتعاً نصُّه راءٌ مسموعة، ولا صوتَ من {len(accent.get('absent') or [])} "
         "لا يقولها لساننا")
    pairs = [p for s in stations for p in (s.get("pairs") or [])]
    door("المراجعُ الضميرية: لكلٍّ رسمٌ مُصيَّر وعبارةٌ تسمّيه",
         deixis_errors(data),
         f"{len(data.get('deixis') or [])} مرجعاً مرسوماً "
         f"({'، '.join(one['w'] for one in data.get('deixis') or [])})")
    door("أزواجُ التمييز: شكلُها محسوبٌ من صورة حاملَيها", pair_errors(data),
         f"{len(pairs)} زوجاً، منها {sum(1 for p in pairs if p['mode'] == 'word')} مصوَّرٌ "
         f"و{sum(1 for p in pairs if p['mode'] == 'sound')} صوتيٌّ خالص بعلّته")

    index = story_index(data)
    triple = []
    for station in stations:
        triple += usage_errors(label_of(station), used_of(station, index),
                               station["frontier"], bank)
    words_used = sum(len(used_of(s, index)["words"]) for s in stations)
    door("الأبوابُ الثلاثة على المنهج الحيّ: رمزٌ · كلمةٌ · شائكة", triple,
         f"{words_used} كلمةً في {len(stations)} محطةً، كلُّها تحت جبهاتها")

    door("عقدُ الرحلة: البوابات في مواضعها والعقدُ محطةٌ أو بوابة", journey_errors(data),
         f"{len(data['sections'])} قسماً و{nodes} عقدة و{len(data['gates'])} بوابات")
    biggest = max((len(s["nodes"]) for s in data["sections"]), default=0)
    door("حدُّ المجموعة: لا قسمَ فوق سقف العقد", group_errors(data),
         f"أكبرُ قسمٍ {biggest} عقدة، وحدُّ المجموعة {data.get('sectionCap')} "
         "(`FAMILY §١٠ب` — سقفٌ لا هدف)")
    door("الشائكاتُ بطريقة heart words: لكلٍّ رسمُها وشوكتُها وسياقُها",
         heart_errors(data),
         f"{len(data.get('hearts') or {})} شائكةً معلَنةَ الرسم، ولكلٍّ موضعُ شوكةٍ "
         "يُوسَم وسياقٌ مسموع")

    stories = [s for s in stations if s["type"] == "story"]
    pages = sum(len(s.get("pages") or []) for s in stories)
    if not stories:
        print("\n— القصصُ شبهُ المفكوكة: نصُّها يُفحَص ككل تمرين —")
        dormant("لا قصةَ في الرحلة بعد — والقصةُ تدخلها يومَ يُكتب نصُّها (`STORIES`)")
    else:
        door("القصصُ شبهُ المفكوكة: نصُّها يُفحَص ككل تمرين",
             story_errors(data, index, bank),
             f"{len(stories)} قصةً و{pages} صفحةً، كلُّ كلمةٍ فيها مفكوكةٌ أو شائكةٌ "
             "مفتوحة، ولكلِّ صفحةٍ صورةُ ما قُرئ فيها")

    print("\n— المولّدات: ما تستهلكه ⊆ جبهةُ محطتها —")
    modules = generator_modules()
    if not modules:
        dormant("لا وحدةَ تمارينَ تُعلن `CONSUMES` ولا `probeRounds` (الجلسة ٢ تكتب أولاها)")
    else:
        rounds, error = probe(modules, stations)
        if error:
            print("  ✗", error)
            fails += 1
        else:
            by_id = {s["id"]: s for s in stations}
            errors = []
            for type_name, used in rounds["consumes"].items():
                for station in [s for s in stations if s["type"] == type_name]:
                    errors += usage_errors(f"[إعلان {type_name} · {station['id']}]",
                                           used, station["frontier"], bank)
                if not any(s["type"] == type_name for s in stations):
                    errors.append(f"[{type_name}] مولّدٌ لنوعٍ لا محطةَ له في الرحلة")
            for round_ in rounds["rounds"]:
                station = by_id.get(round_["id"])
                if not station:
                    continue
                errors += usage_errors(
                    f"[جولة {round_['id']} · بذرة {round_['seed']}/{round_['index']}]",
                    round_["used"], station["frontier"], bank)
            for e in errors[:12]:
                print("  ✗", e)
            if not errors:
                print("  ✓", f"{len(modules)} وحدةَ مولّدٍ و{len(rounds['rounds'])} جولةً "
                             "مولَّدة، كلُّها تحت جبهاتها")
            fails += len(errors)

    print(f"\n{fails} فشل" if fails
          else "\nكل تمارين الرحلة تحت جبهاتها الثلاث"
               + (f" (و{asleep} نائم بقيدٍ في docs/SEED.md)" if asleep else ""))
    return 1 if fails else 0


# ————— فحصُ الفاحص: **مُجرَّبٌ سالباً** (شرطُ بند الجلسة ١) —————
#
# لا يُصدَّق حارسٌ لم يُرَ وهو يمسك. فتُصنَع المخالفاتُ من **المنهج الحيّ نفسِه**
# (نسخةٌ عميقة تُدسّ فيها)، ويُطالَب الفاحصُ بأن يمسك كلَّ واحدة — فإذا رقّ يوماً
# تحت بياناتٍ تحرّكت، سقط ههنا لا في جهاز طفل.

def self_test(data: dict) -> int:
    fails = 0
    stations = data["stations"]
    bank = bank_of(data)

    def ok(cond, msg):
        nonlocal fails
        if cond:
            print("  ✓", msg)
        else:
            fails += 1
            print("  ✗", msg)

    def find(rows, needle):
        return any(needle in row for row in rows)

    index = story_index(data)

    def dosed(mutate, station_id=None):
        """نسخةٌ من المنهج الحيّ دُسّ فيها — وتُعاد أخطاءُ الأبواب الثلاثة عليها."""
        clone = copy.deepcopy(stations)
        target = next(s for s in clone if s["id"] == station_id) if station_id else clone[0]
        mutate(target)
        return usage_errors(label_of(target), used_of(target, index), target["frontier"], bank)

    def dosed_story(mutate):
        """نسخةٌ دُسّ فيها **بابُ القصة** وحدَه (شكلُ النصّ وصفحاتُه)."""
        clone = copy.deepcopy(data)
        mutate(next(s for s in clone["stations"] if s["type"] == "story"))
        return story_errors(clone, index, bank)

    print("\n— المنهج الحيّ يمرّ نظيفاً —")
    live = []
    for station in stations:
        live += usage_errors(label_of(station), used_of(station, index), station["frontier"], bank)
    for name, rows in (
        ("مصدرُ الرصيد", source_errors(data)),
        ("بنيةُ الجبهة", frontier_errors(stations, bank)),
        ("سلّمُ الرموز", ladder_errors(data["grades"], set(data["vowels"]),
                                       data["clusterGrade"])),
        ("ميزانيةُ الشائكات", budget_errors(data["eras"], data["grades"])),
        ("أصواتُ المنهج", sound_errors(data)),
        ("أزواجُ التمييز", pair_errors(data)),
        ("الأبوابُ الثلاثة", live),
        ("عقدُ الرحلة", journey_errors(data)),
        ("حدُّ المجموعة", group_errors(data)),
        ("الشائكاتُ heart words", heart_errors(data)),
        ("القصصُ شبهُ المفكوكة", story_errors(data, index, bank)),
    ):
        ok(not rows, f"{name}: نظيف" + ("" if not rows else f" — {rows[0]}"))

    print("\n— الدسّةُ الأولى: **رمزٌ مبكر** (GPC فوق درجة محطته) —")
    grade2 = next(s for s in stations if s["id"] == "grade:h02")
    ok(find(dosed(lambda s: s["pool"].append(
        {"w": "ship", "gpc": ["sh", "i", "p"], "listen": "word|ship|listen-pick"}),
        "grade:h02"), "فوق درجة محطته"),
       "كلمةٌ فيها «sh» تُدسّ في ح٢ فتُمسَك (وsh إنّما يُفتَح في ح٨)")
    ok(find(dosed(lambda s: s["pool"].append(
        {"w": "cow", "gpc": ["c", "ow"], "listen": "word|cow|listen-pick"}),
        "grade:h05"), "الرمز «ow»"),
       "و«ow» في العهد الأول تُمسَك (وموضعُها ح١١)")
    ok(find(dosed(lambda s: s["frontier"].__setitem__(
        "symbols", s["frontier"]["symbols"][:2]), "grade:h02"), "فوق درجة محطته"),
       f"وجبهةٌ تُقلَّم (٢ من {len(grade2['frontier']['symbols'])} رمزاً) تجعل كلماتِ "
       "محطتها فوقها — فالجبهةُ محسوبةٌ تراكمياً لا مكتوبة")
    ok(find(dosed(lambda s: s["pool"].append(
        {"w": "yellow", "gpc": ["y", "e", "ll", "ow-alt"], "listen": "word|yellow|listen-pick"}),
        "grade:h11"), "الرمز «ow-alt»"),
       "**و«yellow» في ح١١ تُمسَك** — رسمُها `ow` مفتوحٌ ونطقُها البديل ح١٦، "
       "والمعرّفُ يفرّق بينهما")

    print("\n— الدسّةُ الثانية: **كلمةٌ دخيلة** (خارج الرصيد السمعي المعلَن) —")
    ok(find(dosed(lambda s: s["words"].append(
        {"w": "penguin", "field": "animals", "at": "s1-3", "face": "🐧"}), "quiz:s1-3"),
        "خارج الرصيد السمعي المعلَن"),
       "«penguin» تُدسّ في محطة الحيوانات فتُمسَك (وهي من Movers لا Starters)")
    ok(find(dosed(lambda s: s["pool"].append(
        {"w": "pot", "gpc": ["p", "o", "t"], "listen": "word|pot|listen-pick"}), "grade:h03"),
        "خارج الرصيد السمعي المعلَن"),
       "**وكلمةٌ مفكوكةٌ تماماً لكنها ليست في الرصيد تُمسَك** — «pot» مفكوكةٌ بـ p·o·t "
       "ولا مدخلَ لها في Starters (وهو الخطأُ الذي لا يمسكه حارسُ الرموز وحدَه)")
    ok(find(dosed(lambda s: s["words"].append(
        {"w": "brother", "field": "family", "at": "s1-1", "face": "👦"}), "quiz:s1-1"),
        "مرفوعةٌ لانعدام الصورة الصادقة"),
       "وكلمةٌ **مرفوعةٌ** تعود إلى محطتها بصورةٍ متكلَّفة تُمسَك بسببِ رفعها")
    # **وأداةُ المشهد تُجرَد كالكلمة** (`props` — الجلسة ٢): تُعرَض ولا تُقاس، فلولا
    # جردُها لَدخلت الشاشةَ كلمةٌ من خارج الرصيد بلا حارس.
    ok(find(dosed(lambda s: s["props"].append(
        {"w": "penguin", "field": "animals", "at": "s2-2", "face": "🐧"}), "tpr:s2-2"),
        "خارج الرصيد السمعي المعلَن"),
       "**وأداةُ مشهدٍ دخيلة تُمسَك كما تُمسَك كلمةُ التمرين** — «penguin» صندوقاً في س٢-٢")
    ok(find(dosed(lambda s: s["props"].append(
        {"w": "hat", "field": "clothes", "at": "s5-1", "face": "🎩"}), "tpr:s2-2"),
        "من حقل «clothes»"),
       "وأداةٌ من حقلٍ خارج جبهة محطتها تُمسَك")
    ok(find(dosed(lambda s: s["words"].append(
        {"w": "bed", "field": "home", "at": "s5-3", "face": "🛏️"}), "quiz:s1-3"),
        "من حقل «home»"),
       "وكلمةٌ من حقلٍ خارج جبهة المحطة تُمسَك")

    print("\n— الدسّةُ الثالثة: **شائكةٌ زائدة** (فوق ميزانية درجتها) —")
    h06 = next(s for s in stations if s["id"] == "grade:h06")["frontier"]
    ok(find(usage_errors("[دسّة ح٦]",
                         {"words": [], "fields": [], "gpcs": [], "tricky": ["because"]},
                         h06, bank), "فوق شائكات درجته"),
       f"«because» تُدسّ في تمرين ح٦ فتُمسَك (المفتوحُ عنده {len(h06['tricky'])} شائكة، "
       "وموضعُها العهد الرابع)")

    def budgeted(mutate):
        grades = copy.deepcopy(data["grades"])
        mutate(grades)
        return budget_errors(data["eras"], grades)

    ok(find(budgeted(lambda g: g[2]["tricky"].append("said")), "وميزانيتُه"),
       "**وشائكةٌ واحدة تُزاد في ح٣ تُسقِط ميزانيةَ العهود الأربعة** "
       "(٥ ← ١٧ ← ٣١ ← ٥٦ نصُّ `METHOD.md §٥`)")
    ok(find(budgeted(lambda g: g[12]["tricky"].pop()), "وميزانيتُه"),
       "وشائكةٌ تسقط من ح١٣ تُمسَك كذلك — والميزانيةُ حدٌّ من الجهتين")
    ok(find(budgeted(lambda g: g[5]["tricky"].append("the")), "مكرَّرةٌ في السلّم"),
       "وشائكةٌ تتكرّر في درجتين تُمسَك (تضخيمُ ميزانيةٍ بلا مادّةٍ جديدة)")

    print("\n— سلّمُ الرموز يُمسك السبق والتأخّر —")
    def laddered(mutate):
        grades = copy.deepcopy(data["grades"])
        mutate(grades)
        return ladder_errors(grades, set(data["vowels"]), data["clusterGrade"])

    ok(find(laddered(lambda g: g[1]["words"].append(
        {"w": "fish", "gpc": ["f", "i", "sh"], "listen": "word|fish|listen-pick"})),
        "رمزٌ لم يُفتَح بعدُ"),
       "كلمةٌ في درجةٍ قبل رموزها تُمسَك في السلّم أيضاً (حارسان لا واحد)")
    ok(find(laddered(lambda g: g[7]["words"].append(
        {"w": "cat", "gpc": ["c", "a", "t"], "listen": "word|cat|listen-pick"})),
        "فموضعُها أبكر"),
       "وكلمةٌ تأخّرت عن أوّل درجةٍ تُفكّ فيها تُمسَك (لا تُحرَم مادّةً يملكها)")
    ok(find(laddered(lambda g: g[3]["symbols"].append({"id": "s", "g": "s", "ex": "sun"})),
            "مفتوحٌ قبلها"),
       "ورمزٌ يتكرّر معرّفُه في درجتين يُمسَك (خلطُ قياسين في مفتاحٍ واحد)")
    ok(find(laddered(lambda g: g[4]["words"].append(
        {"w": "hat", "gpc": ["h", "a", "zzz"], "listen": "word|hat|listen-pick"})),
        "لا وجودَ له في السلّم"),
       "ومقطعٌ ليس رمزاً في السلّم أصلاً يُمسَك")

    print("\n— بنيةُ الجبهة والرحلة تُمسكان الاختلال —")
    def structured(mutate):
        clone = copy.deepcopy(stations)
        mutate(clone)
        return frontier_errors(clone, bank)

    ok(find(structured(lambda s: s[0].pop("frontier")), "بلا جبهةٍ معلَنة"),
       "محطةٌ بلا جبهةٍ تُمسَك")
    ok(find(structured(lambda s: s[0]["frontier"].pop("tricky")), "ناقصةُ الحقول"),
       "وجبهةٌ ناقصةُ حقل تُمسَك")
    ok(find(structured(lambda s: s[0].__setitem__("skills", [])), "بلا قياسٍ ولا إعفاء"),
       "ومحطةٌ بلا قياسٍ ولا إعفاءٍ تُمسَك (لا تدريسَ بلا قياس)")
    ok(find(structured(lambda s: s[0].__setitem__("skills", ["word|cat"])),
            "ليس (وحدة × مدى × نوع تمرين)"),
       "ومفتاحٌ ليس ثلاثياً يُمسَك")
    ok(find(structured(lambda s: s[0]["skills"].append("thing|cat|listen-pick")),
            "وحدتُه ليست في جدول الوحدات"),
       "ووحدةٌ لا يعرفها جدولُ لوحة الوالد تُمسَك (فلا يُعرَض للوالد مفتاحٌ خام)")
    ok(find(structured(lambda s: s[0]["words"].append(
        {"w": "cat", "field": "animals", "at": "s1-3"})), "بلا صورةٍ في محطةِ صور"),
       "وكلمةٌ بلا صورةٍ في محطةِ صورٍ تُمسَك (سؤالٌ مصوَّرٌ بلا صورة)")
    ok(find(structured(lambda s: s[0].__setitem__("pictures", "somehow")),
            "نمطُ تصويرٍ لا يعرفه الحارس"),
       "**ونمطُ تصويرٍ مخترَع يُمسَك** — وإلا عُطِّل فحصُ الصورة كلُّه بكلمة")
    ok(find(structured(lambda s: s[0].append if False else s[0].__setitem__(
        "frontier", {**s[0]["frontier"], "fields": ["ghost"]})), "خارج حقول القائمة"),
       "وحقلٌ ليس من حقول القائمة الموضوعية يُمسَك")
    ok(find(structured(lambda s: s.append(copy.deepcopy(s[0]))), "معرّفٌ مكرَّر"),
       "ومحطتان بمعرّفٍ واحد تُمسَكان (النجمةُ تُكتب في غير موضعها)")

    def journeyed(mutate):
        clone = copy.deepcopy(data)
        mutate(clone)
        return journey_errors(clone)

    ok(find(journeyed(lambda d: d["gates"].pop()), "والمنهج ثلاث"),
       "وسقوطُ بوابةٍ من الثلاث يُمسَك")
    ok(find(journeyed(lambda d: d["gates"][0].pop("opens")), "لا بوابةَ تُعلن"),
       "وبوابةٌ لا تُعلن أنّها تفتح مسار الحرف تُمسَك (ق٤)")
    ok(find(journeyed(lambda d: d["sections"].insert(
        0, next(s for s in d["sections"] if s["kind"] == "era"))), "قبلها"),
       "**وعهدُ حرفٍ قبل بوابة الأذن يُمسَك** — وهي بابُ فتحه لا زينةٌ في طريقه")
    ok(find(journeyed(lambda d: d["sections"][0]["nodes"].pop(0)), "لا تصل إلى الخريطة"),
       "ومحطةٌ في المنهج لا تصل إلى الخريطة تُمسَك (بيانٌ ميّت)")
    ok(find(journeyed(lambda d: d["sections"][0]["nodes"][0].update(id="ghost:x")),
            "ليست محطةً في المنهج"),
       "وعقدةٌ على الخريطة بلا محطةٍ في المنهج تُمسَك")
    ok(find(journeyed(lambda d: d["gates"][1].update(scope=[])), "بلا مدىً"),
       "وبوابةٌ بلا مدىً تُمسَك (جلسةٌ لا مهارةَ فيها)")

    print("\n— المصدرُ المنقول يُمسك ما لم يُنقَل —")
    def sourced(mutate):
        clone = copy.deepcopy(data)
        mutate(clone)
        return source_errors(clone)

    ok(find(sourced(lambda d: d["words"].append(
        {"w": "penguin", "field": "animals", "at": "s1-3", "face": "🐧"})),
        "ليست من مداخل Starters"),
       "كلمةٌ في الرصيد المصوَّر ليست مدخلاً في القائمة تُمسَك")
    ok(find(sourced(lambda d: d["words"].append(
        {"w": "cake", "field": "food", "at": "s1-4"})), "بلا صورةٍ ولا سببٍ معلَن"),
       "وكلمةٌ بلا صورةٍ ولا سببٍ معلَن لغيابها تُمسَك")
    ok(find(sourced(lambda d: d["words"].append(
        {"w": "brother", "field": "family", "at": "s1-1", "face": "👦"})),
        "مرفوعةٌ وهي في الرصيد"),
       "وكلمةٌ مرفوعةٌ تعود إلى الرصيد تُمسَك من جهة المصدر أيضاً")
    ok(find(sourced(lambda d: d["starters"].append(d["starters"][0])), "مدخلٌ مكرَّر"),
       "ومدخلٌ مكرَّر في الرصيد المنقول يُمسَك")

    print("\n— البقعةُ والمحلولُ من المرفوعات (أحكامُ ١٣ أغسطس) —")
    ok(find(sourced(lambda d: d["words"].append(
        {"w": "cat", "field": "animals", "at": "s1-3", "swatch": "#8B5A2B"})),
        "والبقعةُ لا تصدُق إلا حيث اللونُ هو الكلمة"),
       "**بقعةُ لونٍ لكلمةٍ ليست لوناً تُمسَك** — «cat» بنّيةً: البابُ الخلفيّ لكل "
       "كلمةٍ عجزت عن صورتها")
    ok(find(sourced(lambda d: d["words"].append(
        {"w": "purple", "field": "colours", "at": "s1-5", "swatch": "بنفسجي"})),
        "ليست قيمةَ لونٍ ستَّ عشرية"),
       "وبقعةٌ بلا قيمة لونٍ تُمسَك (ما يُصيَّر هو ما يُسمّى)")
    ok(find(structured(lambda s: next(x for x in s if x["id"] == "quiz:s1-5")["words"]
                       .append({"w": "black", "field": "colours", "at": "s1-5"})),
            "بلا صورةٍ ولا بقعةِ لون"),
       "وكلمةُ لونٍ بلا صورةٍ ولا بقعةٍ تُمسَك — فالنمطُ الجديد لا يُرخي حكمَ الصورة")
    ok(find(sourced(lambda d: d["raised"].append(
        {"w": "pink", "field": "colours", "why": "دسّة"})), "وهي ما تزال مرفوعة"),
       "وكلمةٌ في سجلّ المحلولة وهي في `RAISED` تُمسَك (سجلّان يفترقان)")
    ok(find(sourced(lambda d: d["resolved"].append(
        {"w": "zoo", "to": "swatch", "why": "دسّة"})), "ولم تبلغه"),
       "**ودعوى حلٍّ لم تبلغ موضعَها تُمسَك** — «حُلَّت» سطراً بلا أثرٍ في الرصيد")
    ok(find(sourced(lambda d: d["ritual"].__setitem__("open", "Welcome!")),
            "فيه كلمةٌ خارج الرصيد"),
       "وطقسٌ منطوقٌ بكلمةٍ خارج الرصيد يُمسَك (المادّةُ من القائمة ولو في تحيّة)")

    print("\n— أصواتُ المنهج وأزواجُ التمييز (مادّةُ س٣ وس٤) —")

    def sounded(mutate):
        clone = copy.deepcopy(data)
        mutate(clone)
        return sound_errors(clone)

    ok(find(sounded(lambda d: d["grades"][0]["symbols"].append(
        {"id": "zh", "g": "zh", "ex": "vision"})), "بلا صوتٍ معلَن"),
       "رمزٌ يُزاد في السلّم بلا صوتٍ معلَن يُمسَك — وكلماتُه كانت تسقط من حوض س٤ صامتةً")
    ok(find(sounded(lambda d: d["phonemes"].append(
        {"id": "ss2", "say": "/s/", "ex": "grass", "graphemes": []})), "هو نصُّ"),
       "**وصوتان بنصٍّ منطوقٍ واحد يُمسَكان** — مفتاحُ الملفّ بصمةُ نصّه وحدَه، "
       "فيتقاسمان ملفاً ويُسمع أحدُهما مكانَ الآخر")
    ok(find(sounded(lambda d: d["phonemes"][0]["graphemes"].append("a")),
            "بين صائتٍ وساكن"),
       "وصوتٌ رسمٌ منه صائتٌ ورسمٌ ساكن يُمسَك (القافيةُ تُحسب من أوّل صائت)")
    ok(find(sounded(lambda d: d["phonemes"][1]["graphemes"].append("s")),
            "منسوبٌ إلى صوتين"),
       "ورسمٌ واحد منسوبٌ إلى صوتين يُمسَك")
    ok(find(sounded(lambda d: d["phonemes"][0].__setitem__("say", "sss")),
            "ليس على صورة"),
       "ونصٌّ منطوقٌ ليس على صورة `/x/` يُمسَك (فئةُ `phoneme` في قائمة الصوت)")

    # **وأصواتُ الرصيد المصوَّر تُدسّ من جهاتها الأربع** (توسعةُ الجلسة ٥): الصمتُ،
    # والصوتُ المخترَع، والمصدران المتزاحمان، والعلّةُ مع الأصوات — وكلُّها كانت
    # تسقط بلا خبرٍ فتضيق القافيةُ ولا يشتكي أحد.
    def worded(clone, name):
        return next(w for w in clone["words"] if w["w"] == name)

    ok(find(sounded(lambda d: worded(d, "baby").pop("sounds")), "بلا أصواتٍ معلَنة"),
       "**وكلمةٌ مصوَّرة بلا أصواتٍ ولا علّةٍ تُمسَك** — كانت تسقط من حوض س٤ صامتةً")
    ok(find(sounded(lambda d: worded(d, "baby")["sounds"].append("zh")),
            "ليس من أصوات المنهج"),
       "  وصوتٌ مخترَعٌ في إعلانها يُمسَك (الجدولُ الأربعينيّ حاكمٌ هنا كما في الرمز)")
    ok(find(sounded(lambda d: worded(d, "cat").__setitem__("sounds", ["k", "a", "t"])),
            "ومصدرُ أصوات الكلمة واحد"),
       "  **وكلمةُ قراءةٍ تعلن أصواتَها تُمسَك** — مصدرُها مقاطعُ رسمها، ومصدران "
       "يفترقان يوماً بلا حارس")
    ok(find(sounded(lambda d: worded(d, "banana").__setitem__("sounds", ["b"])),
            "أحدُ الحقلين لا كلاهما"),
       "  وعلّةُ خلوٍّ مع أصواتٍ معلَنة تُمسَك")
    ok(not find(sound_errors(data), "بلا أصواتٍ معلَنة"),
       "  والقائمُ اليومَ سليم: لكلِّ كلمةٍ مصوَّرة أصواتُها أو علّتُها")

    def paired(mutate):
        clone = copy.deepcopy(data)
        mutate(clone)
        return pair_errors(clone)

    def pair_of(clone, key):
        return next(p for s in clone["stations"] for p in (s.get("pairs") or [])
                    if p["key"] == key)

    ok(find(paired(lambda d: next(w for w in d["words"] if w["w"] == "pear").pop("face")),
            "ويخالف قاعدةَ الصورة"),
       "**وصورةٌ تسقط عن حامل زوجٍ مصوَّر تُمسَك** — الشكلُ محسوبٌ من الصورة، "
       "فسقوطُها يقلبه صامتاً إلى تمييزٍ صوتيّ بلا صوتين")
    ok(find(paired(lambda d: pair_of(d, "f-v").update(mode="word")),
            "ويخالف قاعدةَ الصورة"),
       "وزوجٌ يُعلَن مصوَّراً بلا حاملَين مصوَّرين يُمسَك (الحكمُ بالبيانات لا باليد)")
    ok(find(paired(lambda d: pair_of(d, "f-v").update(sounds=[])),
            "بلا صوتين **مختلفين**"),
       "وتمييزٌ صوتيٌّ خالص بلا صوتين يُمسَك (سؤالٌ بلا مادّة)")
    ok(find(paired(lambda d: pair_of(d, "f-v").update(sounds=["/f/", "/f/"])),
            "بلا صوتين **مختلفين**"),
       "**وزوجٌ صوتاه واحد يُمسَك** — «أهما سواء؟» بلا فرقٍ جوابُه واحدٌ أبداً")
    ok(find(paired(lambda d: pair_of(d, "f-v").update(why="")), "وبلا علّةٍ مكتوبة"),
       "وزوجٌ بلا حاملَين وبلا علّةٍ مكتوبة يُمسَك (ولِمَ لا زوجَ أدنى مصوَّرٌ له؟)")
    ok(find(paired(lambda d: pair_of(d, "p-b")["names"].append("penguin")),
            "ليس من مداخل"),
       "وحاملُ زوجٍ من خارج Starters يُمسَك")

    print("\n— حدُّ المجموعة: **سقفٌ لا هدف** (قرار المالك · `FAMILY §١٠ب`) —")

    def grouped(mutate):
        clone = copy.deepcopy(data)
        mutate(clone)
        return group_errors(clone)

    cap = data.get("sectionCap") or 12
    biggest = max(data["sections"], key=lambda s: len(s["nodes"]))
    ok(find(grouped(lambda d: d["sections"][0]["nodes"].extend(
        [{"id": f"x{i}", "type": "quiz", "part": f"x{i}", "title": "مدسوسة"}
         for i in range(cap)])), "وحدُّ المجموعة"),
       f"قسمٌ يُنفَخ فوق {cap} عقدة يُمسَك (وهو الصنفُ الذي وُجد له الباب)")
    ok(not grouped(lambda d: d["sections"][0]["nodes"].extend(
        [{"id": f"x{i}", "type": "quiz", "part": f"x{i}", "title": "مدسوسة"}
         for i in range(cap - len(d["sections"][0]["nodes"]))])),
       f"**والبلوغُ حتى السقف يمرّ**: {cap} عقدة تماماً — سقفٌ لا هدف")
    ok(not group_errors(data),
       f"وأكبرُ أقسام الرحلة اليومَ «{biggest['id']}» بـ{len(biggest['nodes'])} عقدة")

    print("\n— الشائكاتُ بطريقة heart words —")

    def hearted(mutate):
        clone = copy.deepcopy(data)
        mutate(clone)
        return heart_errors(clone)

    ok(find(hearted(lambda d: d["hearts"].pop("the")), "بلا رسمٍ معلَن"),
       "**وشائكةٌ في المنهج بلا رسمٍ معلَن تُمسَك** — كانت تسقط من جولات محطتها صامتةً "
       "ويبقى مفتاحُها في ليتنر أبداً")
    ok(find(hearted(lambda d: d["hearts"]["to"].update(parts=["t", "oo"])), "لا تؤلّفها"),
       "ومقاطعُ رسمٍ لا تؤلّف كلمتَها تُمسَك")
    ok(find(hearted(lambda d: d["hearts"]["no"].update(heart=5)), "خارج مقاطعها"),
       "وموضعُ شوكةٍ خارج المقاطع يُمسَك (ولا قلبَ يُرسَم تحت شيء)")
    ok(find(hearted(lambda d: d["hearts"]["go"].update(say="")), "بلا سياقٍ مسموع"),
       "**وشائكةٌ بلا سياقٍ مسموع تُمسَك** — `METHOD.md §٦`: تُدرَّس في سياقٍ مألوف "
       "لا معزولة")
    ok(find(hearted(lambda d: d["hearts"].update(
        pot={"parts": ["p", "o", "t"], "heart": 2, "say": "a pot"})),
        "ليست في المنهج"),
       "ورسمٌ لكلمةٍ ليست شائكةً في المنهج يُمسَك (ميزانيةُ الشائكات مقَرّة)")
    # **والنومُ يُجرَّب كما تُجرَّب اليقظة**: يُعلَن رسمُ شائكةٍ من ح٦ فتُطالَب أختُها
    # في الحال، وما بعدَها يبقى نائماً — فلا تُسقِط الجلسةَ الرابعة شائكاتُ السابعة.
    ok(len(wanted_hearts(data)) == len(data["hearts"]),
       f"**والمطلوبُ اليومَ ما أُعلن مثلُه**: {len(wanted_hearts(data))} شائكةً "
       f"(من {sum(len(g['tricky']) for g in data['grades'])} في المنهج) — والبقيةُ نائمة")
    # (وكانت الدسّةُ بـ`he` حتى الجلسة ٥؛ فلمّا كُتب رسمُها انتقلت إلى أوّل درجةٍ
    #  لم تُكتب — والدسّةُ تتبع الجبهةَ ولا تُثبَّت على كلمةٍ بعينها.)
    asleep_word = next((w for g in data["grades"] for w in g["tricky"]
                        if w not in data["hearts"]), None)
    if asleep_word is not None:
        ok(find(hearted(lambda d: d["hearts"].update(
            **{asleep_word: {"parts": [asleep_word], "heart": 0, "say": asleep_word,
                             "why": "دسّة"}})), "بلا رسمٍ معلَن"),
           f"**وإعلانُ رسمٍ في درجةٍ يُوقظ أخواتِه فيها** — `{asleep_word}` وحدَها "
           "تُطالِب بأخواتها في درجتها")
    else:
        # **ولمّا كُتبت الشائكاتُ كلُّها (الجلسة ٧) بلغت الجبهةُ آخرَ درجة، فانعكست
        # الدسّة**: لا شائكةَ نائمةً تُوقَظ، فتُنزَع واحدةٌ من آخر درجةٍ فتُطالَب في
        # الحال — والمقيسُ واحد: **المطلوبُ يتبع البياناتِ لا رايةً تُضبط بيد**.
        last = data["grades"][-1]["tricky"][-1]
        ok(find(hearted(lambda d: d["hearts"].pop(last)), "بلا رسمٍ معلَن"),
           f"**ورسمٌ يُنزَع من درجةٍ معلَنةٍ يُمسَك** — `{last}` تُطالَب لأنّ أخواتِها "
           "في درجتها معلَنة (والجبهةُ بلغت آخرَ الرحلة، فلا نائمَ يُوقَظ)")
        era = data["grades"][-1]["tricky"]

        def strip_last(d):
            for word in era:
                d["hearts"].pop(word, None)
            return d

        ok(not any(w in wanted_hearts(strip_last(copy.deepcopy(data))) for w in era),
           "**والمطلوبُ يتبع آخرَ درجةٍ أُعلن فيها رسم**: تُنزَع شائكاتُ آخر درجةٍ "
           "كلُّها فلا يبقى منها مطلوبٌ — نومٌ بالبيانات لا بيد")
    # **ودرجتُها من قيد الاقتران تُدسّ من الجهتين** (حكمُ المدير · `METHOD.md §٦`):
    # شائكةٌ بلا إعلانٍ أصلاً، وشائكةٌ تعلن الحقلين معاً — كلتاهما تُمسَك، فلا يمرّ
    # سكوتٌ عن سؤال «أتُقرأ قبل أن تُسمَع؟» ولا يمرّ جوابان متناقضان.
    ok(find(hearted(lambda d: d["hearts"]["the"].pop("why")), "لا تعلن درجتَها"),
       "**وشائكةٌ لا تعلن درجتَها من قيد الاقتران تُمسَك** (لا مفتاحَ سمعيّ ولا علّة)")
    ok(find(hearted(lambda d: d["hearts"]["he"].update(why="علّةٌ ومفتاحٌ معاً")),
            "لا تعلن درجتَها"),
       "  والجمعُ بين المفتاح والعلّة يُمسَك كذلك — أحدُهما لا كلاهما")
    ok(not find(hearted(lambda d: d), "لا تعلن درجتَها"),
       "  والقائمُ اليومَ سليمٌ: لكلِّ شائكةٍ أحدُ الحقلين")

    print("\n— القصةُ تُفحَص ككل تمرين (معيارُ قبول الجلسة ٦) —")
    #
    # **والدسّةُ صفحةٌ تُعدَّل ثم يُعاد اشتقاقُ النصّ** كما يشتقّه المنهج — فيمرّ
    # المدسوسُ على البابين معاً: الأبوابُ الثلاثة على نصّها، وبابُ القصة على شكلها.

    def dosed_page(mutate):
        clone = copy.deepcopy(data)
        station = next(s for s in clone["stations"] if s["type"] == "story")
        mutate(station)
        station["text"] = " ".join(p["text"] for p in station["pages"])
        return (usage_errors(label_of(station), used_of(station, index),
                             station["frontier"], bank)
                + story_errors(clone, index, bank))

    def line_plus(word):
        return lambda s: s["pages"][0].__setitem__("text", f"{s['pages'][0]['text']} {word}")

    ok(find(dosed_page(line_plus("green")), "فوق درجة محطته"),
       "🔒 **كلمةٌ فوق الدرجة تُدسّ في قصةٍ فتُرفَض** — «green» رسمُها `ee` من ح٩ "
       "وقصّتُنا ح٦ (معيارُ القبول نصّاً)")
    ok(find(dosed_page(line_plus("was")), "فوق شائكات درجته"),
       "🔒 **وشائكةٌ فوق الميزانية تُرفَض** — «was» شائكةُ ح٨ في قصة ح٦")
    ok(find(dosed_page(line_plus("banana")), "وليست كلمةَ قراءةٍ ولا شائكة"),
       "**وكلمةٌ من الرصيد المصوَّر ليست كلمةَ قراءةٍ تُرفَض** — «banana» تمرّ على "
       "البابين الأوّلين صامتةً (لا مقاطعَ لها تُقابَل بالسلّم) ولا تُفكّ")
    ok(find(dosed_page(line_plus("The")), "بحرفٍ كبير"),
       "**وحرفٌ كبير يُرفَض** — رسمٌ لم يُدرَّس في السلّم، و«T» ليست «t» في عين طفل")
    ok(find(dosed_page(lambda s: s["pages"][0].__setitem__(
        "text", f"{s['pages'][0]['text']}.")), "علامةُ وقف"),
       "وعلامةُ وقفٍ تُرفَض (`METHOD.md §٨` تستثنيها من التأسيس نصّاً)")
    ok(find(dosed_page(lambda s: s["pages"][0].__setitem__("pick", "cat")),
            "وليست من كلمات سطرها"),
       "**وصفحةٌ تسأل عن صورةِ ما لم يُقرأ فيها تُرفَض** — «cat» ليست في سطرها")
    ok(find(dosed_page(lambda s: s["pages"][1].__setitem__("pick", "in")),
            "لا صورةَ مفردةَ لها تُلمَس"),
       "وكلمةُ مشهدٍ جواباً لصفحةٍ تُرفَض («in» تُفكّ في مشهدٍ ولا تُلمَس صورتُها)")
    ok(find(dosed_page(lambda s: s.__setitem__("pages", s["pages"][:2])),
            "ثلاثُ صفحاتٍ فأكثر"),
       "وقصةٌ بصفحتين تُرفَض (لا نمذجةٌ وعونٌ و«وحدك» فيها)")
    ok(find(dosed_page(lambda s: s.__setitem__("part", "h05")), "قبل 🚪٢"),
       "**وقصةٌ قبل بوابة الفكّ تُرفَض** — «كتابٌ لكل درجةٍ **من بعد** 🚪٢»")
    # ————— **والدسّةُ تتبع الرصيد الجديد** (الجلسة ٧: عشرُ قصصٍ دخلت) —————
    #
    # الدسّاتُ أعلاه على **أوّل** قصة (ح٦) بكلماتٍ مُسمّاة، فلو بقيت وحدَها لَشهد
    # الحارسُ لقصةٍ واحدة والرصيدُ إحدى عشرة. فتُدسّ **قصةٌ من وسط الرحلة** بكلمةٍ
    # وشائكةٍ **من درجةٍ بعدها** — والمدسوسُ يُحسَب من البيانات لا يُكتب بيد، فيتبع
    # الرصيدَ يومَ يزيد.
    order = [g["id"] for g in data["grades"]]
    told = [st["part"] for st in data["stations"] if st["type"] == "story"]
    if len(told) > 2:
        mid = told[len(told) // 2]
        after = [g for g in data["grades"] if order.index(g["id"]) > order.index(mid)]
        late_word = next(w["w"] for g in after for w in g["words"])
        late_tricky = next(w for g in after for w in g["tricky"])

        def dosed_mid(word):
            clone = copy.deepcopy(data)
            station = next(st for st in clone["stations"]
                           if st["type"] == "story" and st["part"] == mid)
            station["pages"][0]["text"] += f" {word}"
            station["text"] = " ".join(page["text"] for page in station["pages"])
            return (usage_errors(label_of(station), used_of(station, index),
                                 station["frontier"], bank)
                    + story_errors(clone, index, bank))

        ok(find(dosed_mid(late_word), "فوق درجة محطته"),
           f"🔒 **وكلمةٌ من درجةٍ لاحقة تُدسّ في قصة {mid} فتُرفَض** («{late_word}») — "
           "والدسّةُ تتبع الرصيدَ الجديد لا تقف على أوّل قصة")
        ok(find(dosed_mid(late_tricky), "فوق شائكات درجته"),
           f"  **وشائكةٌ من عهدٍ لاحق كذلك** («{late_tricky}» في قصة {mid})")

    ok(not story_errors(data, index, bank),
       f"والقائمُ اليومَ سليم: {sum(len(s.get('pages') or []) for s in stations if s['type'] == 'story')} "
       "صفحةً كلُّ كلمةٍ فيها مفكوكةٌ أو شائكةٌ مفتوحة")

    print("\n— حكمُ الاستهلاك دالّةٌ خالصة: يُجرَّب بلا مولّدٍ ولا متصفّح —")
    letters = next(s for s in stations if s["id"] == "grade:h05")["frontier"]
    ok(not usage_errors("ج", {"words": ["cat"], "fields": [], "gpcs": ["c", "a", "t"],
                              "tricky": ["the"]}, letters, bank),
       "جولةٌ تحت جبهتها تمرّ")
    ok(find(usage_errors("ج", {"words": [], "fields": [], "gpcs": ["igh"], "tricky": []},
                         letters, bank), "فوق درجة محطته"),
       "وجولةٌ ترسم رمزاً لم يُفتَح تُمسَك")
    ok(find(usage_errors("ج", {"words": ["queen"], "fields": [], "gpcs": [], "tricky": []},
                         letters, bank), "خارج الرصيد"),
       "وجولةٌ تعرض كلمةً خارج الرصيد تُمسَك")
    ok(find(usage_errors("ج", {"words": [], "fields": [], "gpcs": [], "tricky": ["said"]},
                         letters, bank), "فوق شائكات درجته"),
       "وجولةٌ تعرض شائكةً لم تُفتَح تُمسَك")
    animals = next(s for s in stations if s["id"] == "tpr:s2-1")["frontier"]
    ok(not usage_errors("ج", {"words": ["cat"], "fields": ["animals"], "gpcs": [],
                              "tricky": [], "said": ["point", "to", "the", "cat"]},
                        animals, bank),
       "وأمرٌ كلماتُه كلُّها من Starters يمرّ (`point to the cat`)")
    ok(find(usage_errors("ج", {"words": ["cat"], "fields": ["animals"], "gpcs": [],
                               "tricky": [], "said": ["touch", "the", "cat"]},
                         animals, bank), "في أمرٍ منطوق"),
       "**وأمرٌ فيه فعلٌ من خارج القائمة يُمسَك** — «touch» ليست في Starters ‏2025، "
       "وهي مثالُ `METHOD.md §٤` التوضيحيّ (وقد أمسكها الحارسُ ساعةَ كُتب)")
    ears = next(s for s in stations if s["id"] == "ear:s4-1")["frontier"]
    ok(not usage_errors("ج", {"words": [], "fields": [], "gpcs": [], "tricky": [],
                              "sounds": ["/s/"]}, ears, bank),
       "وجولةٌ تنطق صوتاً من أصوات المنهج تمرّ (`/s/`)")
    ok(find(usage_errors("ج", {"words": [], "fields": [], "gpcs": [], "tricky": [],
                               "sounds": ["/zh/"]}, ears, bank), "ليس من أصوات المنهج"),
       "**وجولةٌ تنطق صوتاً مخترَعاً تُمسَك** — لا يمرّ على بابَي الكلمة والرمز "
       "(ليس كلمةً ولا رسماً)، ولا يُسمَع خطؤه إلا في أذن طفل")

    # ————— بابُ اللكنة: **صوتٌ لا يقوله لسانُنا يُمسَك** (حسمُ أ-٢) —————
    print("\n— بابُ اللكنة: تحقيقُ الصوت يتبع اللسانَ المقرَّر —")

    def dosed_accent(mutate):
        clone = copy.deepcopy(data)
        mutate(clone)
        return accent_errors(clone)

    def phoneme_of(clone, pid):
        return next(p for p in clone["phonemes"] if p["id"] == pid)

    ok(not accent_errors(data), "جدولُ الأصوات الحيّ يمرّ نظيفاً على لكنته")
    ok(find(dosed_accent(lambda c: phoneme_of(c, "ear").update({"say": "/ɪə/"})),
            "لا يقوله لسانُنا"),
       "**وصائتٌ مركّبٌ مركزيٌّ يُمسَك** — «/ɪə/» لا وجودَ لها في العامّة الأمريكية، "
       "والطفلُ سامعُ الراء يقيناً")
    ok(find(dosed_accent(lambda c: phoneme_of(c, "ar").update({"say": "/ɑː/"})),
            "علامةُ الطول"),
       "**وعلامةُ الطول الطويلة تُمسَك** — «/ɑː/» عرفُ الجدول البريطانيّ غيرِ الراتع")
    ok(find(dosed_accent(lambda c: phoneme_of(c, "ar").update({"say": "/ar/"})),
            "اسمُ رسمه"),
       "**ونصٌّ هو اسمُ رسمه يُمسَك** — «/ar/» نقلٌ عن جدولٍ لا نطقٌ في لسان "
       "(وهو عينُ ما كان قبل الحسم)")
    ok(find(dosed_accent(lambda c: phoneme_of(c, "ur").update({"say": "/ɜ/"})),
            "غيرُ راتع"),
       "**ورمزٌ فيه راءٌ مرسومة ونصُّه بلا راء يُمسَك**")
    ok(find(dosed_accent(lambda c: c["accent"].update({"ar": "بريطانية"})),
            "ولا تقولها"),
       "**وبياناتٌ تُعلن لكنةً لا تقولها وثيقةُ الهوية تُمسَك** — واللكنةُ قرارُ مالك")

    # ————— بابُ ميزانية الأزواج: **إذنٌ محصورٌ لا ثقبٌ في الرصيد** (حسمُ أ-٣) —————
    print("\n— بابُ ميزانية الأزواج: خرقٌ معدودٌ معلَّل —")

    def dosed_budget(mutate):
        clone = copy.deepcopy(data)
        mutate(clone)
        return budget_word_errors(clone, bank_of(clone))

    ok(not budget_word_errors(data, bank), "ميزانيةُ الأزواج الحيّة تمرّ بشرطها")
    ok(find(dosed_budget(lambda c: c["pairBudget"].append(
        {"w": "queen", "pair": "?", "why": "علّةٌ مكتوبةٌ طويلةٌ تكفي البابَ لفظاً"})),
        "ليست حاملَ زوج"),
       "**وكلمةٌ تدخل الميزانيةَ بلا زوجٍ يحملها تُمسَك** — وإلّا صار الإذنُ باباً "
       "خلفياً يتّسع منه الرصيدُ بلا قرار")
    ok(find(dosed_budget(lambda c: c["pairBudget"].append(
        {"w": "cat", "pair": "?", "why": "قصيرة"})), "بلا علّةٍ مكتوبة"),
       "  وبلا علّةٍ تُقرأ تُمسَك")
    ok(find(dosed_budget(lambda c: next(
        b for b in c["pairBudget"] if b["w"] == "pin").update({"w": "pear"})),
        "مدخلٌ في Starters"),
       "  ومدخلٌ من القائمة أُقحم في الميزانية يُمسَك (فالخرقُ يُعَدّ على قدره)")
    ok(find(dosed_budget(lambda c: c["grades"][0]["words"].append(
        {"w": "pin", "gpc": ["p", "i", "n"], "listen": "word|pin|listen-pick"})),
        "سلّمَ الفكّ"),
       "**وكلمةُ ميزانيةٍ تسلّلت إلى سلّم الفكّ تُمسَك** — بابُها الأذنُ وحدَها، "
       "وتوسيعُ المقروء قرارُ مالك (أ-٦)")

    print(f"\n{fails} فشل" if fails else "\n✓ الفاحصُ يمسك المدسوسَ كلَّه")
    return 1 if fails else 0


def main():
    ap = argparse.ArgumentParser(description="حارسُ الجبهة الثلاثيّ (رمزٌ · كلمةٌ · شائكة)")
    ap.add_argument("--self-test", action="store_true",
                    help="فحصُ الفاحص نفسه: هل يمسك المدسوس؟")
    args = ap.parse_args()
    data = load_curriculum()
    sys.exit(self_test(data) if args.self_test else check(data))


if __name__ == "__main__":
    main()
