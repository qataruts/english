#!/usr/bin/env python3
"""مصرِّفُ القائمة الصوتية — يحوّل `tools/audio_queue.json` إلى `app/audio/*.mp3`.

    python3 tools/generate_audio.py --queue-status    # ماذا في القائمة (بلا شبكة)
    python3 tools/generate_audio.py --dry-run         # ماذا سيُصرَّف وبأيّ نموذجٍ وصوت
    python3 tools/generate_audio.py --self-test       # فحصُ الفاحص: بلا شبكة ولا مفتاح
    python3 tools/generate_audio.py --verify-only     # التحقّق الختامي بلا توليد
    python3 tools/generate_audio.py --sync-versions   # إعادة اشتقاق البصمات من القرص

**وما يولّد صوتاً يحتاج المرمِّز** — ولا ffmpeg في بيئتنا، فبيئةُ بايثون المحلّية
(‏`.venv` غيرُ ملتزَمة، تُبنى بأمرٍ واحد: `python3 -m venv .venv && .venv/bin/pip
install lameenc`):

    .venv/bin/python tools/generate_audio.py --calibrate    # عيّنةُ المعايرة (قبل الإقرار)
    .venv/bin/python tools/generate_audio.py --from-queue   # التصريف بالأولوية فالأقدمية

منسوخٌ ومجرَّدٌ من `read@29db723` عبر `calc@56d382d` (`docs/SEED.md §٦`). ودروسُ اقرأ
التي دُفع ثمنُها باقيةٌ بحرفها: مفاتيحُ لا تُطبع · حصةٌ مستقلّة لكل (مفتاح × نموذج) ·
سقفٌ ذاتيّ يوميّ لا يعتمد على الخادم · إيقاعٌ يخنق كلَّ طلب · قصُّ صمت الطرفين في
الأنبوب · فهرسٌ يُكتب بعد كل ملف · بصماتُ محتوى تكسر الكاش · تسجيلُ الإنجاز **دمجاً
لا استبدالاً** · وسلفُ كل ملفٍ يُحفَظ قبل أن يُكتَب فوقه.

——————————— وأربعةُ مفارقٍ عن أخوَيه، لكلٍّ علّتُه ———————————

١) **قناتان لغويتان لا قناةٌ واحدة** (`METHOD.md §١٠` · `docs/AUDIO_QUEUE.md`):
   **`ar` التوجيهُ بصوت سُلافات** بمساره القائم عند «اِحْسِبْ» حرفاً (النموذجُ نفسُه
   والتعليماتُ نفسُها) — **هويةُ المعلّم الصوتية عهدُ عائلةٍ لا يُجتهَد فيه**؛
   **و`en` المادّةُ بصوت Leda** بلكنةٍ أمريكية (حكمُ المالك ٧ في `REVIEW_IDENTITY.md`).
   ولكلِّ قناةٍ صوتُها في `VOICES`، ولا يُنطَق نصُّ قناةٍ بلسان الأخرى أبداً.

٢) **تعليمةُ الأداء الإنكليزية تُكتب مرّةً واحدة** (`EN_PERSONA`) — وهي **نصُّ لوحة
   المرشّحين التي حكم عليها المالكُ بأذنه** (`scratch/phoneme-board/generate_board.py`،
   المرشَّح `leda-us`) منقولةً حرفاً. فلا يتبدّل صوتُ ملفٍّ بتبدّل صياغةِ من ولّده:
   الصياغةُ مقيَّدةٌ في العدّة، ومَن أرادها غيرها بدّلها هنا **معلَناً** فأُعيد البنك.

٣) **الفونيمُ المعزول فئةٌ بتعليمةِ نقاءٍ خاصة**: الصوتُ الخالص بلا اسم حرفٍ ولا
   حركةٍ دخيلة — وصياغتُها من اللوحة نفسِها، **ومثالُها من `curriculum.js`** (حقل
   `ex` في جدول الأربعة والأربعين صوتاً) لا مكتوبٌ بيد. والقائمةُ تبقى **مصدرَ
   النصوص الوحيد**؛ وإنما يُقرأ الجدولُ ليُعرَف مثالُ الصوت الذي يثبّت هويتَه.

٤) **الموجِّهُ يختار النموذجَ بفئة النصّ لا بأولويته** (بلاغُ العائلة
   `2026-08-15-six-sounds-regenerated.md`: «الأمتنُ المجرَّب صفةُ نموذجٍ في صنفٍ لا
   في كل صنف»): القصيرُ على نموذج النواة، والجملُ على نموذج الجمل — **من اليوم
   الأول**، فلا يُصلَح عندنا عيبُ جملةٍ بنقلها إلى نموذجٍ يقرأ الجملةَ في ضِعف زمنها.

**وبابُ الإقرار قبل البنك** (سنّةُ البيت: لا يُولَّد بنكٌ على تعليمةٍ لم تُقَرّ):
عيّنةُ معايرةٍ تعبر الفئات كلَّها تُولَّد بـ`--calibrate` وتُعرَض على الأذن؛ ولا
يفتح `--from-queue` بابَه إلا بعد `--approve-style` على القناتين وفئةِ الفونيم.

المفتاح: `GEMINI_API_KEY` من البيئة أو من `.env` (غيرُ متتبَّع في git) — لا يُطبع أبداً.
"""

import argparse
import array
import base64
import collections
import datetime
import hashlib
import json
import os
import re
import shutil
import statistics
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "app" / "audio"
ENV_FILE = ROOT / ".env"
CURRICULUM = ROOT / "app" / "js" / "curriculum.js"
QUEUE_FILE = ROOT / "tools" / "audio_queue.json"
VERDICTS = ROOT / "tools" / "audio_verdicts.json"     # ما سمعه المالك وحكم فيه
APPROVAL_FILE = ROOT / "tools" / "style_approval.json"  # إقرارُ الأذن على التعليمات
PREV_DIR = ROOT / "scratch" / "prev"                  # سلفُ كل ملفٍ استُبدل — بابُ الرجوع
SPEND_FILE = ROOT / "scratch" / "spend.json"
TODAY = datetime.date.today().isoformat()

GEMINI_HOST = "https://generativelanguage.googleapis.com"

# ————————————— القناتان: صوتٌ لكلِّ لسان (`METHOD.md §١٠`) —————————————
#
# **سُلافات لا تُبدَّل**: هويةُ العائلة الصوتية العربية (`FAMILY.md §٦`) — وهي في
# التوجيه هنا كما هي في «اِحْسِبْ» و«اِقْرَأْ»، ليعرف الطفلُ معلّمَه عبر التطبيقات.
# **وLeda حكمُ المالك السابع** (`REVIEW_IDENTITY.md`: «المرشح ٢ — Leda بلكنة أمريكية»)
# — وباختياره على لوحة الاستماع **قَبِلت أذنُه نقاءَ الفونيمات المعزولة**.
VOICES = {"ar": "Sulafat", "en": "Leda"}

# ————————————— النماذجُ وحصصُها (المفرق ٤) —————————————
MODEL_CORE = "gemini-3.1-flash-tts-preview"      # القصير: عربيّةُ التوجيه كلُّها + فونيم/دمج/كلمة
MODEL_SENTENCE = "gemini-2.5-pro-preview-tts"    # الجملُ الإنكليزية وحدَها
DAILY_CAPS = {MODEL_CORE: 100, MODEL_SENTENCE: 50}   # حصةُ **المفتاح المجانيّ** لكل نموذج

# ————— رافدٌ مفوتَر: حزامُه مالٌ لا عددُ طلبات (سنّةُ اقرأ في رافد Vertex) —————
#
# **وقد صُحِّح هذا بالقياس** (١٦ أغسطس ٢٠٢٦): ظُنّ أنّ `GEMINI_API_KEY_PRO` بلا حصةٍ
# يومية، **فبلغ المئةَ ووقف كأخيه المجانيّ سواءً** — فرُدَّ إلى حصة الطلبات، ولم يبقَ
# مفوتَراً بحقٍّ إلا **رافدُ Vertex**: بابٌ آخر إلى النماذج نفسِها بفوترةٍ لا عدّ.
# فحزامُه مالٌ: سقفٌ يوميٌّ بالدولار نحاسب به أنفسنا (لا الخادمَ)، وبلوغُه يوقف
# التصريف — وهو أصدقُ ميزانٍ: ما يُخشى في المفوتَر إنفاقٌ لا عدد.
VERTEX_KEY = "VERTEX"
PAID_KEYS = {VERTEX_KEY}
PAID_DAILY_USD = 1.00            # ≈ خمسةُ أضعاف كلفة البنك كلِّه — حزامٌ لا خنق
# **وإيقاعُ كلِّ رافدٍ من جنسه**: AI Studio محدودٌ بعشرةٍ في الدقيقة فنبقى دونه،
# وVertex لا حدَّ دقيقيّ له بل فوترة — فخنقُه بإيقاع الآخر يضيّع أهمَّ ما جاء به.
RPM_BY_KEY = {VERTEX_KEY: 60.0}
# مقيسٌ من اقرأ: ٢٥ رمزَ صوتٍ لكل ثانية، والسعرُ (إدخالٌ، خرجٌ صوتيّ) بالدولار/مليون
PRICE_PER_M = {MODEL_CORE: (0.50, 10.0), MODEL_SENTENCE: (1.00, 20.0)}
AUDIO_TOKENS_PER_SEC = 25
USD_KEY = "USD"                  # مفتاحُ الإنفاق في سجلّ اليوم
SENTENCE_CATEGORIES = ("sentence",)              # ما يذهب إلى نموذج الجمل
URGENT_PRIORITY = 10                             # إصلاحُ عيبٍ مسموع يتقدّم الصفَّ
EMPTY_STREAK_LIMIT = 3                           # استجاباتٌ متتابعة بلا صوت ← تنحيةُ الجولة

# ————————————— الفئاتُ سبعٌ لا ثامنَ لها (`docs/AUDIO_QUEUE.md`) —————————————
#
# **ولزومُ اللغة للفئة مكتوبٌ هنا مستقلاً** عن `tools/queue_texts.mjs` عمداً: مقابلةُ
# نسخةٍ بنسختها لا تُثبت شيئاً (درسُ احسب)، فإن اختلف الحكمان ظهر الخلافُ ولم يُدفَن.
CATEGORY_LANG = {
    "phoneme": "en", "blend": "en", "word": "en", "sentence": "en",
    "instruction": "ar", "celebration": "ar", "modeling": "ar",
}
CATEGORY_AR = {
    "phoneme": "صوت معزول",
    "blend": "دمج مقطَّع",
    "word": "كلمة",
    "sentence": "جملة",
    "instruction": "تعليمة",
    "celebration": "احتفال",
    "modeling": "نمذجة",
}
CATEGORY_ORDER = list(CATEGORY_AR)

# ————— تعليماتُ القناة العربية: **مسارُ سُلافات كما هو حرفاً** (`calc@56d382d`) —————
#
# لم يُبدَّل فيها حرف: هويةُ المعلّم الصوتية واحدةٌ عبر العائلة، وتبديلُ صياغةٍ هنا
# يجعل الطفلَ يسمع معلّماً آخرَ في تطبيقٍ آخر. **وكلُّها تنصّ على «مرة واحدة»**:
# بلاغُ المالك في اقرأ (٤ أغسطس ٢٠٢٦) أنّ بعض الملفات نُطقت مرّتين — والمدةُ تكشفه
# بعد التوليد، والتعليمةُ تمنعه قبله.
STYLE_AR = {
    "instruction": ("اقرأ هذه التعليمة بتأنٍّ ووضوحٍ وودّ، كمعلّمٍ يخاطب طفلاً في "
                    "السادسة، وأظهرْ آخرَ كل كلمة نطقاً بيّناً بلا إبدال ولا ابتلاع، "
                    "مرة واحدة: "),
    "modeling": ("قلها بهدوءٍ ودعوةٍ لطيفة، كمعلّمٍ يدعو طفلاً ليعمل معه، وأظهرْ آخرَ "
                 "كل كلمة نطقاً بيّناً بلا إبدال ولا ابتلاع، مرة واحدة: "),
    "celebration": ("قلها بفرحٍ هادئٍ وتشجيع، بلا مبالغةٍ ولا صياح، لطفلٍ أصاب، "
                    "مرة واحدة: "),
}

# ————— تعليمةُ الأداء الإنكليزية: **تُكتب مرّةً فلا تتبدّل بصمت** (المفرق ٢) —————
#
# منقولةٌ حرفاً من المرشَّح `leda-us` في `scratch/phoneme-board/generate_board.py` —
# وهو الذي حكم عليه المالكُ بأذنه واختاره («المرشح ٢ — Leda بلكنة أمريكية»). فالنصُّ
# الذي سمعته الأذنُ هو النصُّ الذي يولّد البنك، لا صياغةٌ تشبهه.
EN_PERSONA = ("Speak with a warm, clear General American English accent, gently, "
              "as a kind teacher speaking to a six-year-old child. ")

STYLE_EN = {
    "word": EN_PERSONA + "Say the word once, clearly and warmly: ",
    "sentence": EN_PERSONA + "Say this sentence once, warmly and clearly: ",
    # الدمجُ المقطَّع: صياغةُ اللوحة نفسُها («sss... aaa... t... sat»)
    "blend": (EN_PERSONA + "Sound out the word slowly, separating each sound, "
              "then say the whole word once: "),
}

# **تعليمةُ نقاء الفونيم** (المفرق ٣): صياغتُها من عيّنات اللوحة الثلاث مجموعةً —
# «الصوتُ الخالص وحدَه · مرّةً واحدة · لا اسمَ حرفٍ · ولا حركةَ قبله ولا بعده»،
# **ومثالُه من جدول المنهج** فيثبت الهويةُ (وبلا مثالٍ يخمّن المولّدُ: علّةُ «عين»
# في بلاغ `2026-08-15-six-sounds-regenerated.md` بعينها).
PHONEME_STYLE = (
    EN_PERSONA
    + "Say only the pure isolated speech sound {say} — the bare sound you hear in "
      "the word '{ex}'. Say it once, cleanly, and nothing else. Do NOT say the "
      "letter name, and do NOT add any vowel before or after it (not 'tuh', not "
      "'ess' — just the bare sound). The sound: ")


def key_for(text: str) -> str:
    """مفتاحُ النصّ = اسمُ ملفه — sha1 نصِّه، أولُ ١٢ خانة.

    الاشتقاقُ نفسُه في `app/js/audio.js` (بايثون وجافاسكربت)، فاستبدالُ ملفٍ بتسجيلٍ
    بشريٍّ لاحقاً لا يمسّ الشيفرة بحرف. **ولا لغةَ في المفتاح**: الخطّان لا يلتقيان
    (عربيةٌ بحروفها وإنكليزيةٌ بحروفها) — ويحرسه القيدُ ١ في `docs/AUDIO_QUEUE.md`.
    """
    return hashlib.sha1(text.encode("utf-8")).hexdigest()[:12]


# ————————— مثالُ كل صوتٍ من جدول المنهج — لا خريطةَ ثانية تُكتب بيد —————————

_PHONEME_RE = re.compile(r"\{\s*id:\s*'[^']+',\s*say:\s*'([^']+)',\s*ex:\s*'([^']+)'")
_PHONEME_EX = None


def phoneme_examples() -> dict:
    """`/s/` ← `sun` — من `app/js/curriculum.js` (جدولُ الأربعة والأربعين صوتاً).

    **والقائمةُ تبقى مصدرَ النصوص الوحيد**: لا يُستخرَج من هنا نصٌّ يُولَّد، وإنما
    يُقرأ مثالُ الصوت الذي تحتاجه تعليمةُ النقاء. وصوتٌ في القائمة لا مثالَ له في
    الجدول **يُحجَز عند البوّابة** ولا يُخمَّن له مثال.
    """
    global _PHONEME_EX
    if _PHONEME_EX is None:
        src = CURRICULUM.read_text(encoding="utf-8") if CURRICULUM.exists() else ""
        _PHONEME_EX = {m.group(1): m.group(2) for m in _PHONEME_RE.finditer(src)}
    return _PHONEME_EX


# ————————————— الحارسُ عند البوّابة: قبل أيّ طلبٍ يُنفَق —————————————
#
# **همزةُ الوصل** (بلاغ `2026-08-13-wasl-hamza…` بحدّ مدير المجموعة): تُكتب عاريةً في
# المنطوق الذي لا يُعرَض للقراءة — **وبنكُنا العربيُّ كلُّه من هذا الصنف**. والشكلُ
# عليها يُملي على المولّد نطقاً خاطئاً لا يظهر إلا في أذن طفل. والحكمُ ضيّقٌ عن قصد:
# ألفٌ **عارية** تحمل حركة (ولا تحملها ألفٌ في العربية إلا أن تكون همزةَ وصلٍ شُكِلت)،
# ومعها `ٱ`. **والتنوينُ خارج** (`شكراً`): كرسيٌّ لا حركةَ ابتداء.
_WASL_RE = re.compile(r"ا[َُِ]|ٱ")
_ARABIC_RE = re.compile(r"[؀-ۿ]")
_LATIN_RE = re.compile(r"[A-Za-z]")


def wasl_at(text: str) -> int:
    """موضعُ همزة وصلٍ مشكولة في نصّ، أو `-1`."""
    m = _WASL_RE.search(str(text))
    return m.start() if m else -1


def gate_reason(text: str, category: str = "", lang: str = "") -> str:
    """علّةُ ردّ النصّ قبل أيّ طلب — أو `""` إن كان سليماً."""
    want = CATEGORY_LANG.get(category)
    if want is None:
        return f"فئةٌ لا نعرفها ({category or '؟'}): الفئاتُ سبعٌ لا ثامنَ لها"
    if lang and lang != want:
        return f"لغةٌ تخالف فئتَها ({lang} في فئة {CATEGORY_AR[category]} وهي {want} دائماً)"
    if want == "ar":
        at = wasl_at(text)
        if at >= 0:
            return f"همزةُ وصلٍ مشكولة عند الحرف {at + 1}: المنطوقُ يُكتب عارياً"
        if _LATIN_RE.search(text):
            return "حرفٌ لاتينيّ في نصٍّ عربيّ منطوق: لا لسانَ ثانياً في القناة"
    else:
        if _ARABIC_RE.search(text):
            return "حرفٌ عربيّ في مادّةٍ إنكليزية: **لا تُنطَق المادّةُ معرَّبةً أبداً**"
        if category == "phoneme" and text not in phoneme_examples():
            return "صوتٌ لا مثالَ له في جدول المنهج: تعليمةُ النقاء تحتاج مثالَه"
    return ""


def speech_form(text: str, category: str = "") -> str:
    """صورةُ النصّ **كما تُنطق** — تُرسَل للمولّد، ولا تمسّ المفتاح ولا البيانات.

    وجهان لا ثالث:
      • **عربيّ**: التاءُ المربوطة الساكنة تُنطق تاءً والعربُ تقف عليها هاءً (بلاغُ
        المالك في اقرأ، ٥ أغسطس ٢٠٢٦). **وسكونُ الوقف يبقى**: حذفُه يترك الآخرَ بلا
        حكمٍ فيُشكِّله المولّد.
      • **فونيمٌ معزول**: الشرطتان علامةُ كتابةٍ لا صوت — تُنزَعان فلا يقرؤهما
        المولّدُ «slash»، وهويةُ الصوت محفوظةٌ في التعليمة بمثالها.
    """
    if category == "phoneme":
        return text.strip("/") or text
    if text.endswith("ةْ"):
        return text[:-2] + "هْ"
    if text.endswith("ة"):
        return text[:-1] + "هْ"
    return text


def style_for(entry: dict) -> str:
    """تعليمةُ الأداء: توجيهُ المدخل إن أعلنه، وإلّا تعليمةُ فئته."""
    hint = (entry.get("style_hint") or "").strip()
    if hint:
        return hint.rstrip(":：").rstrip() + ": "
    cat = entry.get("category", "instruction")
    if cat == "phoneme":
        text = entry.get("text", "")
        return PHONEME_STYLE.format(say=text, ex=phoneme_examples().get(text, ""))
    return STYLE_AR.get(cat) or STYLE_EN[cat]


def voice_for(entry: dict) -> str:
    """صوتُ المدخل بلغة فئته — لا بحقلٍ يُكتب بيد (اللغةُ هي المصدرُ الحاكم)."""
    return VOICES[CATEGORY_LANG[entry.get("category", "instruction")]]


def model_for(entry: dict) -> str:
    """أيُّ نموذجٍ يولّد هذا المدخل؟ — **بفئته لا بأولويته** (المفرق ٤).

    والجملةُ لا تُحوَّل إلى نموذج النواة أبداً ولو كانت إصلاحَ عيبٍ مسموع: قياسُ
    جلسة صوتيات اقرأ (١٥ أغسطس ٢٠٢٦) أنّ النواة تقرأ الجملة في ضِعف زمن نموذج
    الجمل — فكان «الإصلاحُ» نفسُه هو ما يصنع التثاقلَ الذي رُدَّت به.
    """
    if entry.get("category") in SENTENCE_CATEGORIES:
        return MODEL_SENTENCE
    return MODEL_CORE


def short_model(name: str) -> str:
    """اسمٌ مختصر للعرض: `gemini-2.5-pro-preview-tts` ← `2.5-pro`."""
    m = re.search(r"gemini-([\d.]+)-(flash|pro)", name or "")
    return f"{m.group(1)}-{m.group(2)}" if m else (name or "")


# ————————————— إقرارُ الأذن على التعليمات: بابُ البنك —————————————
#
# «لا يُولَّد بنكٌ على تعليمةٍ لم تُقَرّ» — ولا يُصدَّق ذلك بنيّة: البابُ **مقفلٌ
# بالبنية**. ثلاثةٌ تُقَرّ على حدة: العربيةُ (مسارُ سُلافات) · الإنكليزيةُ
# (`EN_PERSONA`) · وفئةُ الفونيم (تعليمةُ النقاء) — لأنّ ردَّ الفونيمات صنفاً **قرارُ
# مسارٍ يُرفَع للمدير** (تسجيلٌ بشريّ) لا إعادةُ صياغةٍ تُجتهَد.
APPROVAL_KEYS = ("ar", "en", "phoneme")


def load_approval() -> dict:
    if not APPROVAL_FILE.exists():
        return {}
    try:
        return json.loads(APPROVAL_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def set_approval(which: str, approved: bool, note: str = "") -> None:
    data = load_approval()
    data[which] = {"approved": approved, "decidedAt": TODAY, "note": note,
                   "styleHash": style_hash(which)}
    APPROVAL_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n",
                             encoding="utf-8")
    print(f"{'أُقِرّت' if approved else 'رُدَّت'} تعليمةُ «{which}» بتاريخ {TODAY}"
          + (f" — {note}" if note else ""))


def style_hash(which: str) -> str:
    """بصمةُ التعليمة التي أُقِرّت — فتبديلُها بعد الإقرار **يُبطله من تلقائه**.

    وهو الفرقُ بين «أُقِرّت» و«أُقِرّ نصُّها»: لو بدّلنا صياغةً بعد أن سمعت الأذنُ،
    لَبقيت الرايةُ خضراءَ على صوتٍ لم يُسمَع. فالإقرارُ معلَّقٌ ببصمة نصِّه.
    """
    if which == VERTEX_KEY.lower():
        return ""            # إذنُ رافدٍ لا نصُّ أداء — فلا بصمةَ نصٍّ تُعلَّق به
    if which == "ar":
        blob = "".join(STYLE_AR[c] for c in sorted(STYLE_AR))
    elif which == "en":
        blob = EN_PERSONA + "".join(STYLE_EN[c] for c in sorted(STYLE_EN))
    else:
        blob = PHONEME_STYLE
    return hashlib.sha1(blob.encode("utf-8")).hexdigest()[:8]


def approved(which: str) -> bool:
    entry = load_approval().get(which) or {}
    return bool(entry.get("approved")) and entry.get("styleHash") == style_hash(which)


def unapproved_langs() -> list:
    """ما لم يُقَرّ بعد — بأسمائه، فيُقال في الخطأ ما ينقص لا «مرفوض»."""
    return [w for w in APPROVAL_KEYS if not approved(w)]


# ————————————————————— المفتاح والبيئة —————————————————————
#
# **ومفتاحُنا من بيئة اقرأ**: لا نسخةَ في هذا المستودع ولا في `.env` عندنا (بندُ
# الجلسة). فيُقرأ من `read/.env` إن لم يكن في البيئة — ولا يُطبع أبداً بحال.
KEY_NAMES = ("GEMINI_API_KEY", "GEMINI_API_KEY_PRO", "GEMINI_API_KEY_3")
SIBLING_ENV = ROOT.parent / "read" / ".env"


def read_env_key(name: str) -> str | None:
    """المفتاح من البيئة أو `.env` بمحلّلٍ بسيط (لا حزم جديدة، ولا طباعةٌ للقيمة)."""
    val = os.environ.get(name)
    if val:
        return val.strip()
    for path in (ENV_FILE, SIBLING_ENV):
        if not path.exists():
            continue
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            if k.strip() == name:
                got = v.strip().strip("'\"")
                if got:
                    return got
    return None


class VertexRafid:
    """مغلِّفُ رافد Vertex بواجهة `synth` — يُحمَّل كسولاً ولا يُطبع توثيقُه."""

    def __init__(self):
        sys.path.insert(0, str(ROOT / "tools"))
        import vertex_tts as vx  # noqa: PLC0415
        self._vx = vx
        self._auth = vx.VertexAuth()

    def synth(self, text: str, style: str, model: str, voice: str):
        return self._vx.synth(self._auth, text, style,
                              self._vx.VERTEX_NAMES.get(model, model), voice)


def vertex_enabled() -> bool:
    """مُفعَّلٌ متى وُجد حسابُ الخدمة **وأُقِرّ الرافد** — إذنُ المالك ١٦ أغسطس ٢٠٢٦.

    **والإذنُ شرطٌ لا زينة**: Vertex مشروعُ سحابةٍ مفوتَرٌ باسم المالك لا مفتاحٌ
    مجانيّ، فتشغيلُه بلا إذنٍ إنفاقُ مالِ غيرِك. (سنّةُ اقرأ: `is_approved("vertex")`.)
    """
    try:
        sys.path.insert(0, str(ROOT / "tools"))
        import vertex_tts as vx  # noqa: PLC0415
        return bool(vx.sa_path()) and bool(load_approval().get("vertex", {}).get("approved"))
    except Exception:  # noqa: BLE001
        return False


def read_keys() -> list:
    """[(اسمُ الرافد، قيمتُه)] بالترتيب — والقيمُ لا تُطبع في أيّ مخرَجٍ أبداً.

    **وVertex أوّلُ الصفّ متى أُقِرّ**: بلا حصّةٍ يومية وبإيقاعٍ أسرع، فيُستبقى
    المجانيُّ لما بعده. والقيمةُ فيه **كائنٌ لا سلسلة** (`VertexRafid`).
    """
    out = []
    if vertex_enabled():
        try:
            out.append((VERTEX_KEY, VertexRafid()))
        except Exception as e:  # noqa: BLE001
            print(f"  ! تعذّر رافدُ Vertex: {str(e)[:80]}", file=sys.stderr)
    for name in KEY_NAMES:
        val = read_env_key(name)
        if val and all(val != v for _n, v in out):     # مفتاحٌ مكرَّر لا يفيد
            out.append((name, val))
    return out


# ————————————————————— الأخطاء والإيقاع —————————————————————

class TTSError(RuntimeError):
    pass


class QuotaExhausted(TTSError):
    """الحصةُ اليومية نفدت — لا تُعاد المحاولة، يُنتظر التجدد."""

    def __init__(self, seconds: int, detail: str = ""):
        super().__init__(f"الحصة اليومية نفدت — التجدد بعد {seconds} ثانية. {detail}".strip())
        self.seconds = seconds


class EmptyAudio(TTSError):
    """استجابةُ ٢٠٠ بلا صوت — عيبُ النموذج في نصٍّ بعينه."""


_MIN_INTERVAL = 0.0        # ثوانٍ بين طلبين على المفتاح الواحد (يضبطها --rpm)
_LAST_REQUEST = {}         # «مفتاح:نموذج» ← وقتُ آخر طلبٍ له


def set_rpm(rpm: float) -> None:
    """سقفُ الطلبات في الدقيقة **لكل (مفتاح × نموذج)** — دون حدّ النموذج كي لا تُحرق
    محاولاتٌ على 429."""
    global _MIN_INTERVAL
    _MIN_INTERVAL = 60.0 / rpm if rpm > 0 else 0.0


def _pace(pace_key: str) -> None:
    """مَخنَقُ كلّ طلب: يباعد بالإيقاع **ويقيّد الإنفاق** — فلا طلبَ بلا عدّ.

    **والإيقاعُ من جنس الرافد** (`RPM_BY_KEY`): مفتاحٌ اسمُه في الجدول يمضي بإيقاعه،
    وما سواه بالإيقاع العامّ الذي يضبطه `--rpm`.
    """
    rpm = RPM_BY_KEY.get(pace_key.split(":")[0])
    interval = 60.0 / rpm if rpm else _MIN_INTERVAL
    if interval:
        wait = _LAST_REQUEST.get(pace_key, 0.0) + interval - time.monotonic()
        if wait > 0:
            time.sleep(wait)
    _LAST_REQUEST[pace_key] = time.monotonic()
    bump_spend(pace_key)


def parse_429(body: str) -> tuple[bool, int]:
    """يفكّ جسمَ خطأ 429: (أهي حصةٌ يومية؟، ثوانٍ حتى التجدد)."""
    per_day, seconds = False, 0
    try:
        err = json.loads(body).get("error", {})
    except json.JSONDecodeError:
        return "per_day" in body or "PerDay" in body, 0
    for det in err.get("details", []):
        for v in det.get("violations", []):
            qid = f'{v.get("quotaId", "")} {v.get("quotaMetric", "")}'
            if "PerDay" in qid or "per_day" in qid:
                per_day = True
        if det.get("@type", "").endswith("RetryInfo"):
            m = re.match(r"(\d+)", str(det.get("retryDelay", "")))
            if m:
                seconds = int(m.group(1))
    if not per_day:
        msg = err.get("message", "")
        per_day = "per_day" in msg or "per day" in msg
    return per_day, seconds


# ————————————————————— سقفُ الإنفاق الذاتيّ —————————————————————
#
# حزامُ أمانٍ لا يعتمد على الخادم: نحاسب أنفسنا لكل (مفتاح × نموذج) ونرفض التجاوز ولو
# سمح الخادم — فأيّ مستهلكٍ خارجيّ أو خللِ عدٍّ لا يُفاجئنا بنفادٍ يوقف عملَ يومٍ كامل.

def load_spend() -> dict:
    """{"مفتاح:نموذج": عدد} ليوم اليوم — ويُنسى ما قبله."""
    if not SPEND_FILE.exists():
        return {}
    try:
        data = json.loads(SPEND_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    return data.get(TODAY, {}) if isinstance(data, dict) else {}


def bump_spend(pace_key: str) -> None:
    """يُزاد عند كلّ طلبٍ فعليّ (من `_pace`، وهو مَخنَقُ الطلبات كلِّها)."""
    SPEND_FILE.parent.mkdir(parents=True, exist_ok=True)
    data = {}
    if SPEND_FILE.exists():
        try:
            data = json.loads(SPEND_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            data = {}
    day = data.setdefault(TODAY, {})
    day[pace_key] = day.get(pace_key, 0) + 1
    for old in [k for k in data if k != TODAY]:
        data.pop(old)
    tmp = SPEND_FILE.with_suffix(f".{os.getpid()}.tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    os.replace(tmp, SPEND_FILE)


def usd_spent() -> float:
    """ما أُنفق اليومَ على المفاتيح المفوترة (بالدولار)."""
    return float(load_spend().get(USD_KEY, 0.0))


def usd_left() -> float:
    return max(0.0, PAID_DAILY_USD - usd_spent())


def usd_of(model: str, audio_sec: float, chars: int) -> float:
    """كلفةُ طلبٍ واحد — تُحسَب من مدّة صوته المقيسة لا من تخمين."""
    price_in, price_out = PRICE_PER_M.get(model, (0.5, 10.0))
    return (chars / 4) / 1e6 * price_in + audio_sec * AUDIO_TOKENS_PER_SEC / 1e6 * price_out


def bump_usd(model: str, audio_sec: float, chars: int) -> float:
    """يقيّد كلفةَ ما وُلِّد على مفتاحٍ مفوتَر — بعد أن يصل الصوتُ وتُقاس مدّتُه."""
    usd = usd_of(model, audio_sec, chars)
    SPEND_FILE.parent.mkdir(parents=True, exist_ok=True)
    data = {}
    if SPEND_FILE.exists():
        try:
            data = json.loads(SPEND_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            data = {}
    day = data.setdefault(TODAY, {})
    day[USD_KEY] = round(day.get(USD_KEY, 0.0) + usd, 6)
    tmp = SPEND_FILE.with_suffix(f".{os.getpid()}.tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    os.replace(tmp, SPEND_FILE)
    return usd


def spend_left(key_name: str, model: str) -> int:
    """ما بقي اليومَ لهذا (المفتاح × النموذج) — حصّةٌ مستقلّة لكلٍّ.

    **والمفوتَرُ يُحاسَب بالمال**: يبقى مفتوحاً ما بقي من سقف الدولار، فيُترجَم
    الباقي إلى عددِ طلباتٍ **بكلفة أغلى نموذجٍ عندنا** — تقديرٌ متحفّظ يقف قبل
    السقف لا بعده.
    """
    if key_name in PAID_KEYS:
        if usd_left() <= 0:
            return 0
        worst = usd_of(MODEL_SENTENCE, 3.0, 300)      # جملةٌ طويلة على أغلى نموذج
        return max(1, int(usd_left() / worst))
    return max(0, DAILY_CAPS.get(model, 0) - load_spend().get(f"{key_name}:{model}", 0))


class KeyPool:
    """مفاتيحُ متعددة بحسابِ حصةٍ مستقلٍّ لكلٍّ — نفادُ الأول لا يوقف الثاني.

    **والحصّةُ لكل (مفتاح × نموذج)**: نفادُ نموذج الجمل على مفتاحٍ لا يمنع نموذجَ
    النواة عليه — وهو عينُ سياسة اقرأ التي جعلت بنكَه ينزل على حصصٍ يومية.
    """

    def __init__(self, keys: list):
        self.keys = keys
        self.exhausted = {}                 # «مفتاح:نموذج» ← ثوانٍ حتى التجدد
        self.used = collections.Counter()   # اسمُ المفتاح ← عددُ ما وُلِّد به

    def available(self, model: str) -> list:
        """المتاحُ الآن لهذا النموذج، **الأقدمُ استعمالاً أولاً** — فلا يُستنزف الأولُ
        وحدَه ويقيّدنا إيقاعُه."""
        free = [(n, v) for n, v in self.keys
                if f"{n}:{model}" not in self.exhausted and spend_left(n, model) > 0]
        return sorted(free, key=lambda kv: _LAST_REQUEST.get(f"{kv[0]}:{model}", 0.0))

    def capped(self, model: str) -> list:
        """مفاتيحُ بلغت **سقفَنا الذاتيّ** اليوم في هذا النموذج (لا سقفَ الخادم)."""
        return [n for n, _v in self.keys
                if f"{n}:{model}" not in self.exhausted and spend_left(n, model) <= 0]

    def retry_seconds(self) -> int:
        return min(self.exhausted.values()) if self.exhausted else 3600

    def call(self, text: str, style: str, model: str, voice: str) -> tuple[bytes, int, str]:
        """يجرّب المتاحَ بالترتيب؛ ويرفع `QuotaExhausted` متى نفدت كلُّها لهذا النموذج."""
        for name, value in self.available(model):
            pace_key = f"{name}:{model}"
            try:
                if hasattr(value, "synth"):     # رافدٌ بواجهته (Vertex) لا مفتاحُ ترويسة
                    _pace(pace_key)             # الإيقاعُ والعدُّ هنا، فلا طلبَ بلا عدّ
                    pcm, rate = value.synth(text, style, model, voice)
                else:
                    pcm, rate = gemini_pcm(text, style, value, model, voice, pace_key=pace_key)
                self.used[name] += 1
                return pcm, rate, name
            except QuotaExhausted as e:
                self.exhausted[pace_key] = e.seconds
                print(f"  ⏸ {name} × {short_model(model)}: {e}", file=sys.stderr)
        if self.capped(model):
            paid = [n for n in self.capped(model) if n in PAID_KEYS]
            print(f"  🛑 بلغ سقفُنا الذاتيّ اليوميّ لـ{short_model(model)} "
                  + (f"(المفوتَرُ عند ${PAID_DAILY_USD:.2f}: أُنفق ${usd_spent():.4f})"
                     if paid else f"({DAILY_CAPS.get(model)} لكل مفتاح مجانيّ)")
                  + " — يتوقّف حزامَ أمان", file=sys.stderr)
        raise QuotaExhausted(self.retry_seconds())


# ————————————————————— PCM ← Gemini —————————————————————

def gemini_pcm(text: str, style: str, api_key: str, model: str, voice: str,
               retries: int = 5, empty_retries: int = 2,
               pace_key: str = "") -> tuple[bytes, int]:
    """يعيد (PCM خام ١٦ بت، معدّلَ العيّنات). يعيد المحاولة عند 429/5xx."""
    body = json.dumps({
        "contents": [{"parts": [{"text": style + text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}},
        },
    }, ensure_ascii=False).encode("utf-8")

    url = f"{GEMINI_HOST}/v1beta/models/{model}:generateContent"
    delay, last, empty = 2.0, None, 0
    for attempt in range(retries):
        req = urllib.request.Request(url, data=body, method="POST", headers={
            "Content-Type": "application/json",
            "x-goog-api-key": api_key,
        })
        try:
            _pace(pace_key or model)
            with urllib.request.urlopen(req, timeout=180) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
            return extract_audio(payload)
        except urllib.error.HTTPError as e:
            code = e.code
            detail = e.read().decode("utf-8", "replace")
            last = TTSError(f"HTTP {code}: {detail[:300]}")   # لا رابطَ ولا ترويسة تُطبع
            if code == 429:
                per_day, seconds = parse_429(detail)
                if per_day:                     # لا فائدةَ من محاولةٍ قبل التجدد
                    raise QuotaExhausted(seconds or 3600) from e
                if seconds:                     # حدُّ الدقيقة: ننتظر ما يطلبه الخادم
                    delay = max(delay, min(seconds + 1, 120))
            if code not in (408, 429, 500, 502, 503, 504):
                raise last from e
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
            last = TTSError(f"{type(e).__name__}: {e}")
        except EmptyAudio as e:
            # غيرُ حتميّ فتُعاد المحاولة — **مرّتين فقط**: كلُّ محاولةٍ طلبٌ يُخصم من
            # حصة اليوم، وحرقُ خمسٍ على نصٍّ عصيٍّ يضيّع عشراتِ الطلبات (٣ أغسطس ٢٠٢٦).
            last = e
            empty += 1
            if empty >= empty_retries:
                raise
        except TTSError as e:
            last = e
        if attempt < retries - 1:
            time.sleep(delay)
            delay = min(delay * 2, 60)
    raise last or TTSError("فشل غير معروف")


def extract_audio(payload: dict) -> tuple[bytes, int]:
    """يجمع أجزاءَ `inlineData` الصوتية ويستخرج معدّلَ العيّنات من `mimeType`."""
    chunks, rate = [], 24000
    for cand in payload.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            inline = part.get("inlineData") or part.get("inline_data")
            if not inline:
                continue
            mime = inline.get("mimeType") or inline.get("mime_type") or ""
            if not mime.startswith("audio/"):
                continue
            m = re.search(r"rate=(\d+)", mime)
            if m:
                rate = int(m.group(1))
            chunks.append(base64.b64decode(inline["data"]))
    if not chunks:
        reason = payload.get("promptFeedback") or payload.get("candidates") or payload
        raise EmptyAudio(f"لا صوت في الاستجابة: {json.dumps(reason, ensure_ascii=False)[:200]}")
    return b"".join(chunks), rate


# ————————————————————— PCM → MP3 —————————————————————

_HAVE_FFMPEG = shutil.which("ffmpeg")
_ENCODER = None
SILENCE_RATIO = 0.02        # ٢٪ من الذروة يُعَدّ صمتاً
SILENCE_PAD_MS = 60         # هامشٌ يبقى قبل الصوت وبعده

NO_ENCODER = ("يلزم ffmpeg أو الحزمة lameenc — ولا ffmpeg في بيئتنا. ابنِ البيئةَ مرّةً:\n"
              "    python3 -m venv .venv && .venv/bin/pip install lameenc\n"
              "ثم شغّل المصرِّفَ بها:  .venv/bin/python tools/generate_audio.py …")


def encoder_name() -> str:
    """اسمُ المرمِّز الذي سيحوّل PCM إلى mp3 — أو `""` إن لم يوجد واحدٌ منهما.

    **ويُسأل قبل أوّل طلبٍ شبكيّ لا بعده** (قيدُ اقرأ المرصود في دفعتها الثالثة): كان
    جردُ `lameenc` داخل `pcm_to_mp3` — أي **بعد** أن يُطلَب الصوتُ ويصل ويُدفع ثمنُه،
    فمات الأمرُ وقد ضاع طلبٌ من سقف اليوم وصوتٌ وصل ولم يُحفَظ. والقاعدةُ أنّ ما يمنع
    العملَ **يُجرَد على البوابة**، فلا يُدفع ثمنُ نقصٍ معروفٍ سلفاً.
    """
    if _HAVE_FFMPEG:
        return "ffmpeg"
    try:
        import lameenc  # noqa: F401, PLC0415
    except ImportError:
        return ""
    return "lameenc"


def trim_pcm(pcm: bytes, rate: int) -> bytes:
    """قصُّ صمت الطرفين من PCM خام (١٦ بت أحادي) **قبل الترميز**.

    المولّد يعيد أحياناً صمتاً طويلاً قبل النطق (بلغ ١٫٢٨ث في اقرأ) — والطفلُ ينقر
    فينتظر. والقصُّ هنا في الأنبوب: بلا حصة، وينفع كلَّ ملفٍ يُولَّد بعده.
    """
    samples = array.array("h")
    samples.frombytes(pcm[:len(pcm) - len(pcm) % 2])
    if sys.byteorder == "big":
        samples.byteswap()
    if not samples:
        return pcm
    peak = max(max(samples), -min(samples))
    if peak == 0:
        return pcm
    thr = peak * SILENCE_RATIO
    start, end = 0, len(samples) - 1
    while start < len(samples) and abs(samples[start]) < thr:
        start += 1
    while end > start and abs(samples[end]) < thr:
        end -= 1
    pad = int(rate * SILENCE_PAD_MS / 1000)
    cut = samples[max(0, start - pad):min(len(samples), end + pad + 1)]
    if len(cut) < rate * 0.1:          # لا يُقَصّ إلى لا شيء (صمتٌ تامّ عيبٌ آخر)
        return pcm
    if sys.byteorder == "big":
        cut.byteswap()
    return cut.tobytes()


def pcm_to_mp3(pcm: bytes, rate: int, path: Path, trim: bool = True) -> None:
    """تحويلُ PCM (l16 mono) إلى mp3 — ffmpeg إن وُجد، وإلّا `lameenc` داخل بايثون."""
    if trim:
        pcm = trim_pcm(pcm, rate)
    path.parent.mkdir(parents=True, exist_ok=True)
    if _HAVE_FFMPEG:
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", str(rate),
             "-ac", "1", "-i", "pipe:0", "-codec:a", "libmp3lame", "-b:a", "64k", str(path)],
            input=pcm, check=True,
        )
        return
    global _ENCODER
    if _ENCODER is None:
        # وهنا لا يُتوقَّع فقدُه: البوّابةُ في `main` جردته قبل أوّل طلب (`encoder_name`)
        if not encoder_name():
            sys.exit(NO_ENCODER)
        import lameenc  # noqa: PLC0415
        _ENCODER = lameenc
    enc = _ENCODER.Encoder()
    enc.set_bit_rate(64)
    enc.set_in_sample_rate(rate)
    enc.set_channels(1)
    enc.set_quality(2)          # ٠ الأبطأ/الأجود … ٩ الأسرع
    enc.silence()
    path.write_bytes(enc.encode(pcm) + enc.flush())


# ————————————— مدةُ mp3 (بلا مكتبات ولا ffmpeg): تُقرأ من إطاراتها —————————————

BITRATES_V1L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]
BITRATES_V2L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0]
RATES = {3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000]}


def mp3_duration(path: Path) -> float:
    """مدةُ الملف بالثواني من إطاراته (يتخطّى ID3 ويعدّ الإطارات فعلاً)."""
    data = path.read_bytes()
    i = 0
    if data[:3] == b"ID3":
        size = ((data[6] & 0x7F) << 21 | (data[7] & 0x7F) << 14
                | (data[8] & 0x7F) << 7 | (data[9] & 0x7F))
        i = 10 + size
    total = 0.0
    n = len(data)
    while i + 4 <= n:
        if data[i] != 0xFF or (data[i + 1] & 0xE0) != 0xE0:
            i += 1
            continue
        ver = (data[i + 1] >> 3) & 0x03          # 3=MPEG1 · 2=MPEG2 · 0=MPEG2.5
        layer = (data[i + 1] >> 1) & 0x03        # 1 = Layer III
        bidx = (data[i + 2] >> 4) & 0x0F
        ridx = (data[i + 2] >> 2) & 0x03
        pad = (data[i + 2] >> 1) & 0x01
        if layer != 1 or ver == 1 or bidx in (0, 15) or ridx == 3:
            i += 1
            continue
        rate = RATES[ver][ridx]
        kbps = (BITRATES_V1L3 if ver == 3 else BITRATES_V2L3)[bidx]
        spf = 1152 if ver == 3 else 576
        length = (spf // 8 * kbps * 1000) // rate + pad
        if length <= 4:
            i += 1
            continue
        total += spf / rate
        i += length
    return total


# ————————————————————— القائمة (docs/AUDIO_QUEUE.md) —————————————————————

def load_queue() -> list:
    """القائمةُ التي تصفّ فيها جلساتُ التطوير نصوصَها — وهي **مصدرُ النصوص الوحيد**."""
    if not QUEUE_FILE.exists():
        return []
    try:
        data = json.loads(QUEUE_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        sys.exit(f"{QUEUE_FILE.name} ليس JSON صالحاً: {e}")
    if not isinstance(data, list):
        sys.exit(f"{QUEUE_FILE.name} يجب أن يكون مصفوفة JSON")
    for i, entry in enumerate(data):
        if not isinstance(entry, dict) or not entry.get("text"):
            sys.exit(f"مدخل {i} في {QUEUE_FILE.name} بلا نصّ")
        cat = entry.get("category")
        if cat not in CATEGORY_LANG:
            sys.exit(f"مدخل {i}: فئة غير معروفة «{cat}» — السبع: {'، '.join(CATEGORY_LANG)}")
    return data


def save_queue(queue: list) -> None:
    """كتابةٌ ذرّية: ملفٌّ مؤقّت ثم استبدال — فلا يقرأ أحدٌ ملفاً نصفَ مكتوب.

    واسمُ المؤقّت **يحمل رقمَ العملية**: عمليتان تكتبان معاً كانتا تتنازعان اسماً
    واحداً فيسقط أحدُهما بـ`FileNotFoundError` (وقع في اقرأ، ٥ أغسطس ٢٠٢٦).
    """
    tmp = QUEUE_FILE.with_suffix(f".{os.getpid()}.tmp")
    tmp.write_text(json.dumps(queue, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(tmp, QUEUE_FILE)


def _merge(text: str, edit) -> bool:
    """تعديلُ مدخلٍ بنصّه **دمجاً لا استبدالاً**: تُعاد قراءةُ القرص عند كل تسجيل.

    التصريفُ يستغرق دقائق وجلسةُ تطويرٍ قد تُضيف نصوصاً أثناءه؛ فكتابةُ اللقطة القديمة
    كاملةً كانت تمحو إضافاتِها.
    """
    disk = load_queue()
    changed = False
    for e in disk:
        if e.get("text") == text and edit(e):
            changed = True
    if changed:
        save_queue(disk)
    return changed


def mark_done(text: str, model: str, voice: str) -> bool:
    """`pending` ← `done` بتاريخه **ومعه صوتُه** (`voice` يملؤه المصرِّف لا الطالب —
    `docs/AUDIO_QUEUE.md`): فيُعرَف كلُّ ملفٍّ بمن نطقه، ويومَ يُبدَّل صوتٌ يُعرَف ما
    يجب أن يُعاد."""
    def edit(e):
        if e.get("status", "pending") == "done":
            return False
        e.update(status="done", doneAt=TODAY, model=model, voice=voice)
        return True
    return _merge(text, edit)


def mark_failed(text: str, model: str) -> bool:
    def edit(e):
        if e.get("status", "pending") == "done":
            return False
        e["failCount"] = e.get("failCount", 0) + 1
        e["lastFailModel"] = model
        return True
    return _merge(text, edit)


def mark_hold(text: str, reason: str) -> bool:
    """يحجز نصّاً عن التوليد بعلّةٍ مكتوبة — فلا يُردّ مرّتين بلا أن يُعرَف لِمَ."""
    def edit(e):
        if e.get("hold") == reason:
            return False
        e["hold"] = reason
        return True
    return _merge(text, edit)


def requeue(texts: list, reason: str) -> int:
    """يعيد نصّاً مُصرَّفاً إلى الانتظار بأولوية العيوب المسموعة (١٠).

    وليس مسّاً بالسجل: الحالةُ تعود `pending` ويبقى ما كان مقيَّداً في `fixHistory`.
    """
    disk = load_queue()
    n = 0
    for e in disk:
        if e.get("text") in texts:
            e.setdefault("fixHistory", []).append(
                {"was": e.get("model", ""), "voice": e.get("voice", ""),
                 "doneAt": e.get("doneAt"), "reason": reason, "requeuedAt": TODAY})
            e.update(status="pending", voice="",
                     priority=min(e.get("priority", 100), URGENT_PRIORITY))
            for dead in ("failCount", "lastFailModel", "model", "hold"):
                e.pop(dead, None)
            n += 1
    if n:
        save_queue(disk)
    return n


def queue_pending(queue: list) -> list:
    """المصفوفون بالأولوية (الأصغرُ أسبق) ثم بالأقدمية (ترتيبُ الإضافة)."""
    pending = [(i, e) for i, e in enumerate(queue)
               if e.get("status", "pending") != "done" and not e.get("retired")]
    pending.sort(key=lambda p: (p[1].get("priority", 100), p[0]))
    return pending


def queue_texts(queue: list, status: str) -> dict:
    """نصوصُ القائمة بحالةٍ معيّنة ← فئتُها (والمتقاعدُ خارجها)."""
    return {e["text"]: e.get("category", "instruction")
            for e in queue if e.get("status", "pending") == status and not e.get("retired")}


def expected_texts() -> tuple[dict, dict]:
    """(ما يُتوقَّع أن له ملف = منجَزُ القائمة، وما زال منتظِراً)."""
    queue = load_queue()
    return queue_texts(queue, "done"), queue_texts(queue, "pending")


def manifest_map() -> dict:
    """مفتاحٌ ← نصّ **لكل ملفٍ موجودٍ فعلاً**.

    شرطُ «موجودٌ على القرص» مقصود: بحذف ملفٍ يخرج نصُّه من الفهرس، ولا يَعِد الفهرسُ
    بملفٍّ غائبٍ فيُهدَر طلبُ شبكةٍ فاشل قبل النطق الاحتياطيّ.
    """
    done, _pending = expected_texts()
    return {key_for(t): t for t in done if (OUT_DIR / f"{key_for(t)}.mp3").exists()}


# ————————————— بصماتُ المحتوى: كسرُ كاش الملف المستبدَل وحدَه —————————————
#
# **العيبُ المُعالَج**: اسمُ الملف مشتقٌّ من **نصّه** لا من محتواه، فاستبدالُ صوتٍ تحت
# المفتاح نفسه لا يغيّر الرابط — والجهاز الذي خزّن القديم في عامل الخدمة يبقى عليه،
# فيُسمع النصُّ الواحد بصوتين بحسب تاريخ أوّل طلبٍ لكل جهاز.
#
# **ولا تُبنى تراكمياً أبداً**: كلُّ كتابةٍ تعيد اشتقاقَ البيان كلِّه من بايتات القرص،
# فأيُّ استبدالٍ سبق بشيفرةٍ قديمة يُشفى من تلقائه — ولا يُترك ملفٌّ ببصمةٍ **كاذبة**،
# وهي أخطرُ من غيابها.

def fingerprint(path: Path) -> str:
    """بصمةُ محتوى الملف — أولُ ٨ خانات من sha1 بايتاته."""
    return hashlib.sha1(path.read_bytes()).hexdigest()[:8]


def versions_map(manifest: dict) -> dict:
    out = {}
    for key in sorted(manifest):
        path = OUT_DIR / f"{key}.mp3"
        if path.exists():
            out[key] = fingerprint(path)
    return out


def write_versions(manifest: dict) -> dict:
    """كتابةُ `versions.json` **ذرّياً** — فلا يقرأ التطبيقُ ولا فاحصٌ بياناً نصفَ مكتوب."""
    versions = versions_map(manifest)
    path = OUT_DIR / "versions.json"
    tmp = path.with_suffix(f".{os.getpid()}.tmp")
    tmp.write_text(json.dumps(versions, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    tmp.replace(path)
    print(f"البصمات: {path.relative_to(ROOT)} ({len(versions)} ملفاً)")
    return versions


def write_manifest(manifest: dict) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / "manifest.json"
    tmp = path.with_suffix(f".{os.getpid()}.tmp")
    tmp.write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    tmp.replace(path)
    print(f"الفهرس: {path.relative_to(ROOT)} ({len(manifest)} نصاً)")
    write_versions(manifest)


def stale_versions(manifest: dict) -> list:
    """مفاتيحُ بصمتُها في البيان تخالف بايتاتِ ملفها (أو غائبة) — عيبُ الخلط عائداً."""
    if not (OUT_DIR / "versions.json").exists():
        return sorted(k for k in manifest if (OUT_DIR / f"{k}.mp3").exists())
    have = json.loads((OUT_DIR / "versions.json").read_text(encoding="utf-8"))
    return sorted(k for k, v in versions_map(manifest).items() if have.get(k) != v)


# ————————————— السلف: بابُ الرجوع عن استبدالٍ لم تقبله الأذن —————————————

def archive_prev(path: Path) -> bool:
    """يحفظ الملفَّ القائم قبل أن يُكتَب فوقه — والمجلَّد خارج المستودع (`scratch/`)."""
    if not path.exists():
        return False
    PREV_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, PREV_DIR / path.name)
    return True


def revert_prev(texts: list) -> tuple:
    back, none = [], []
    for t in texts:
        src = PREV_DIR / f"{key_for(t)}.mp3"
        if src.exists():
            OUT_DIR.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, OUT_DIR / src.name)
            back.append(t)
        else:
            none.append(t)
    if back:
        write_manifest(manifest_map())
    return back, none


# ————————————— أحكامُ الأذن: تُقيَّد بياناً فلا يتكرّر السؤال —————————————

def load_verdicts() -> dict:
    """ما سمعه المالكُ وحكم فيه: نصّ ← (الحكم، التاريخ). التنبيهُ بعده خبرٌ لا مطالبة."""
    if not VERDICTS.exists():
        return {}
    try:
        return json.loads(VERDICTS.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def record_verdict(text: str, verdict: str) -> None:
    data = load_verdicts()
    data[text] = {"verdict": verdict, "at": TODAY}
    VERDICTS.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def accepted_texts() -> set:
    """ما قَبِلته الأذنُ صراحةً — حكمُه يبدأ بـ«قُبِل» (لغةُ اللوحة نفسُها)."""
    return {t for t, v in load_verdicts().items()
            if str(v.get("verdict", "")).startswith("قُبِل")}


# ————————————— التحقّق الختاميّ: مدةٌ شاذّة، ويتيمٌ، ومبتور —————————————

DURATION_RATIO = 1.7        # مدةٌ تتجاوز هذا × وسيطَ فئتها = شذوذٌ يُبلَّغ (تكرارٌ داخليّ)
DURATION_SHORT = 0.55       # ومدةٌ دونه × الوسيط = مبتورة (نطقٌ ناقص أو قصٌّ زائد)
DURATION_FLOOR = 4          # فئةٌ دون هذا العدد لا وسيطَ لها يُعتدّ به

# ————— فئةٌ لا يحكم فيها الوسيط: **الصوتُ المعزول** —————
#
# **قِيس فلم يُظَنّ** (بنكُ الأربعة والأربعين، ١٦ أغسطس ٢٠٢٦): مدى المدد ٠٫٢٩–٢٫٨١ث،
# وطرفاه ليسا عيبَين بل **صنفَين صوتيَّين**: الانفجاريُّ (‏`/t/ /d/ /k/ /p/ /b/`) نقرةٌ
# لا تُمَدّ بطبعها، والاحتكاكيُّ والأنفيُّ (‏`/f/ /s/ /th/ /ng/`) يُمَدّان بطبعهما. فوسيطٌ
# واحدٌ يجمعهما يُبلّغ عن **تسعةٍ من أربعةٍ وأربعين** وكلُّها سليمة — وحارسٌ يصرخ في
# السليم يُعلَّم أن يُتجاهَل، فيُدفَن معه الصياحُ الصادق. **والأذنُ هي الفيصل هنا**
# (وقد حكمت فعلاً: «فقط س طويلة»). فالمددُ تُعرَض خبراً بمداها ولا يُحكَم بها.
DURATION_BLIND = ("phoneme",)


def duration_outliers(texts: dict) -> list:
    """شواذُّ المدة داخل كلِّ فئة — كاشفٌ رخيص يُشغَّل مع كل تحقّق.

    بلاغُ المالك في اقرأ (٤ أغسطس ٢٠٢٦): «بعض الأصوات منطوقة مرتين» — والملفُّ المكرَّر
    يطول عن نظائره. **والمقارنةُ داخل الفئة** لأنّ الجملة أطولُ من الصوت المعزول طبعاً.
    """
    by_cat = {}
    for text, cat in texts.items():
        p = OUT_DIR / f"{key_for(text)}.mp3"
        if p.exists():
            by_cat.setdefault(cat, []).append((text, mp3_duration(p)))
    out = []
    for cat, items in by_cat.items():
        if len(items) < DURATION_FLOOR or cat in DURATION_BLIND:
            continue
        med = statistics.median(s for _t, s in items)
        if not med:
            continue
        out += [(t, cat, s, med) for t, s in items
                if s > DURATION_RATIO * med or s < DURATION_SHORT * med]
    return sorted(out, key=lambda r: -r[2] / r[3])


def verify(texts: dict, pending: dict | None = None, min_bytes: int = 1500) -> int:
    """لكل نصٍّ متوقَّعٍ ملفُّه، ولا ملفَ يتيم، ولا ملفَ أصغرَ من الحدّ المعقول."""
    pending = pending or {}
    problems = []
    on_disk = {p.stem for p in OUT_DIR.glob("*.mp3")} if OUT_DIR.exists() else set()
    for t in texts:
        p = OUT_DIR / f"{key_for(t)}.mp3"
        if not p.exists():
            problems.append(f"ناقص: {t}")
        elif p.stat().st_size < min_bytes:
            problems.append(f"صغير جداً ({p.stat().st_size}B): {t}")
    known = {key_for(t) for t in texts} | {key_for(t) for t in pending}
    for orphan in sorted(on_disk - known):
        problems.append(f"يتيم (لا نصَّ له في القائمة): {orphan}.mp3")
    for key in stale_versions({key_for(t): t for t in texts}):
        problems.append(f"بصمة قديمة ({key}.mp3) — أصلحها بـ`--sync-versions` قبل النشر")

    print(f"\nالتحقّق الختامي: {len(texts)} نصاً متوقَّعاً، {len(on_disk)} ملفاً على القرص.")
    verdicts = load_verdicts()
    for text, cat, sec, med in duration_outliers(texts):
        kind = "أطول" if sec > med else "أقصر"
        why = "تكرارٍ داخليّ" if sec > med else "نطقٍ مبتور"
        if text in verdicts:                    # سمعه المالكُ وحكم — خبرٌ لا مطالبة
            print(f"  ℹ شذوذ مدة معلوم ({CATEGORY_AR.get(cat, cat)}): «{text}» {sec:.2f}ث — "
                  f"بحكم المالك ({verdicts[text]['at']}): {verdicts[text]['verdict']}")
            continue
        print(f"  ⚠ شذوذ مدة ({CATEGORY_AR.get(cat, cat)}): «{text}» {sec:.2f}ث "
              f"= {sec / med:.1f}× وسيطَ فئته ({med:.2f}ث) — {kind} من نظائره، "
              f"يُسمَع لاحتمال {why}")
    # **والفئةُ العمياءُ عن الوسيط تُعرَض خبراً بمداها** — لا تُطوى ولا يُصاح فيها
    for cat in DURATION_BLIND:
        spans = sorted(((s, t) for t, c in texts.items() if c == cat
                        and (OUT_DIR / f"{key_for(t)}.mp3").exists()
                        for s in [mp3_duration(OUT_DIR / f"{key_for(t)}.mp3")]), reverse=True)
        if len(spans) < DURATION_FLOOR:
            continue
        longest = "، ".join(f"{t} {s:.2f}ث" for s, t in spans[:3])
        shortest = "، ".join(f"{t} {s:.2f}ث" for s, t in spans[-3:])
        print(f"  ℹ مددُ «{CATEGORY_AR.get(cat, cat)}» لا يحكم فيها وسيطٌ "
              f"({len(spans)} صوتاً، {spans[-1][0]:.2f}–{spans[0][0]:.2f}ث): "
              f"الممدودُ صنفٌ والانفجاريُّ صنف — الأطولُ {longest}؛ والأقصرُ {shortest}. "
              f"**والأذنُ هي الفيصل**.")
    if pending:
        print(f"  ⏳ {len(pending)} نصاً في القائمة لم يُصرَّف بعد (غيابُها متوقَّع).")
    for p in problems:
        print(f"  ✗ {p}", file=sys.stderr)
    if not problems:
        print("  ✓ كل نصّ متوقَّع له ملفه، ولا يتيم، ولا مبتور، ولا بصمة كاذبة.")
    return len(problems)


# ————————————————————— عيّنةُ المعايرة —————————————————————
#
# **لا يُولَّد بنكٌ على تعليمةٍ لم تُقَرّ**: عيّنةٌ تعبر الفئات كلَّها تُعرَض على الأذن
# أولاً. والاختيارُ **مكتوبٌ هنا بنصّه** لا يُلتقط عشوائياً: عيّنةٌ يُحتجّ بها لا بدّ
# أن تُعاد بعينها إن رُدَّت — وفيها الصوتُ المعزولُ المفرد والرمزُ المركَّب والكلمةُ
# والجملةُ وطقسا التحية وتوجيهُ العربية بفئاتها الثلاث.
CALIBRATION = [
    "/s/", "/a/", "/t/", "/m/",                  # فونيماتٌ مفردة (صامتان وصائتان)
    "/sh/", "/igh/", "/ng/", "/ʊ/",              # أصواتُ رموزٍ مركَّبة (ومنها الاستثناء)
    "cat", "apple", "water",                     # كلماتٌ من الرصيد المصوَّر
    "Hello!", "Bye bye!",                        # طقسا التحية (`METHOD.md §٣`)
    "come here please", "I can see the water", "he is happy",   # جملٌ
    "اسْمَعْ وَالْمَسْ",                              # تعليمةٌ قصيرة
    "اسْمَعِ الْأَصْوَاتَ وَاجْمَعْهَا — أَيَّةُ صُورَةٍ هِيَ؟",         # وتعليمةٌ طويلة
    "قُلْهَا مَعِي",                                 # دعوةُ الترديد
    "الْآنَ جَرِّبْ مَعِي",                            # نمذجة
    "أَحْسَنْتْ",                                    # احتفال
    "خُتِمَ جَوَازُكْ",                                # ختمُ الجواز — المنتظَر منذ الهوية
]


def calibration_plan(queue: list) -> list:
    """[(الفهرس، المدخل)] لعيّنة المعايرة بترتيبها المكتوب — والمفقودُ يُقال.

    **والمُصرَّفُ لا يُعاد توليدُه** (عيبٌ أمسكه أولُ حكمِ أذن): كان يُجمَع بالنصّ من
    القائمة كلِّها، فأمرُ معايرةٍ ثانٍ يعيد رميَ **الاثنين والعشرين** فوق ملفاتٍ
    قَبِلتها الأذنُ — إنفاقٌ بلا داعٍ، **وإتلافُ مقبولٍ بصمت**. فصار يجمع المنتظِرَ
    وحدَه: مَن ردَّته الأذنُ عاد `pending` بـ`--requeue` فيُعاد **هو وحدَه**.
    """
    waiting = {e["text"] for _i, e in queue_pending(queue)}
    by_text = {e["text"]: (i, e) for i, e in enumerate(queue) if e["text"] in waiting}
    plan, done_now, missing = [], [], []
    for text in CALIBRATION:
        if text in by_text:
            plan.append(by_text[text])
        elif any(e["text"] == text for e in queue):
            done_now.append(text)
        else:
            missing.append(text)
    for text in missing:
        print(f"  ⚠ نصُّ معايرةٍ ليس في القائمة: «{text}»", file=sys.stderr)
    if done_now:
        print(f"  · مُصرَّفٌ سلفاً فلا يُعاد ({len(done_now)}): "
              f"{'، '.join(done_now[:6])}{'…' if len(done_now) > 6 else ''}")
    return plan


# ————————————————————— التصريف —————————————————————

def drain_queue(pool: KeyPool, dry_run: bool = False, limit: int = 0,
                plan: list | None = None, only: tuple = ()) -> int:
    """تصريفُ القائمة بالأولوية فالأقدمية — والفهرسُ يُكتب بعد كل ملف.

    **و`only` دفعةٌ بفئةٍ مكتملة**: البنكُ يُبنى مرحلةً مرحلة (`METHOD.md §١٠`)
    والأذنُ تراجعه كذلك — فتُصرَّف الفئةُ كلُّها ثم تُعرَض، ولا تُخلَط الفئاتُ في
    دفعةٍ نصفِها معروضٌ ونصفُها لا. (وبلا `only` تمضي أولويةُ القائمة كما هي.)
    """
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    queue = load_queue()
    if plan is None:
        plan = queue_pending(queue)
    if only:
        plan = [(i, e) for i, e in plan if e.get("category") in only]
    if limit:
        plan = plan[:limit]
    if not plan:
        print("قائمة الانتظار فارغة — لا شيء يُصرَّف.")
        return 0

    by_cat = collections.Counter(e.get("category") for _i, e in plan)
    print(f"قائمة الانتظار: {len(queue_pending(queue))} منتظِراً من {len(queue)}.")
    for c, n in by_cat.most_common():
        print(f"  · {CATEGORY_AR.get(c, c)}: {n} نصاً")

    made = failed = held = 0
    empty_streak = 0
    for n, (_idx, entry) in enumerate(plan, 1):
        text = entry["text"]
        cat = entry.get("category", "instruction")
        lang = CATEGORY_LANG[cat]
        model, voice = model_for(entry), voice_for(entry)
        label = (f"[{n}/{len(plan)}] {text} ({CATEGORY_AR.get(cat, cat)}/{lang}"
                 f"، {short_model(model)}، {voice})")

        # **الحارسُ عند البوّابة**: قيودُ القناتين قبل أيّ طلب — طلبٌ لا يُنفَق، وأذنٌ لا تُتعَب.
        why = gate_reason(text, cat, entry.get("lang", lang))
        if why:
            held += 1
            print(f"  ⛔ {label}: {why} — يُحجَز ولا يُطلَب", file=sys.stderr)
            mark_hold(text, why)
            continue
        if entry.get("hold"):
            held += 1
            print(f"  ⏸ {label}: محجوزٌ بحكمٍ سابق ({entry['hold']})", file=sys.stderr)
            continue

        path = OUT_DIR / f"{key_for(text)}.mp3"
        if dry_run:
            print(f"  ⟶ {label} → {path.name}")
            made += 1
            continue
        try:
            pcm, rate, used_key = pool.call(
                speech_form(text, cat), style_for(entry), model, voice)
            archive_prev(path)                  # السلفُ يُحفَظ قبل الكتابة فوقَه
            pcm_to_mp3(pcm, rate, path)
            mark_done(text, model, voice)       # دمجاً لا استبدالاً — وبعد كل نصّ
            write_manifest(manifest_map())      # فهرسٌ صادقٌ ولو توقّف التصريفُ الآن
            made += 1
            empty_streak = 0
            secs = mp3_duration(path)
            # **والمفوتَرُ يُقيَّد إنفاقُه بعد أن يصل الصوت** — من مدّته المقيسة لا تخميناً
            paid_note = ""
            if used_key in PAID_KEYS:
                bump_usd(model, secs, len(style_for(entry)) + len(text))
                paid_note = f" · ${usd_spent():.4f}/{PAID_DAILY_USD:.2f}"
            print(f"  ✓ {label} → {path.name} {path.stat().st_size // 1024}KB "
                  f"· {secs:.2f}ث · {used_key}{paid_note}")
        except QuotaExhausted as e:
            print(f"\n  ⏸ {e}  (توقّف عند {n}/{len(plan)} بلا إحراق محاولات)", file=sys.stderr)
            print(f"RETRY_AFTER_SECONDS={e.seconds}")
            break
        except EmptyAudio as e:
            failed += 1
            mark_failed(text, model)
            empty_streak += 1
            print(f"  ✗ {label}: {e}", file=sys.stderr)
            if empty_streak >= EMPTY_STREAK_LIMIT:
                print(f"  ⏸ {EMPTY_STREAK_LIMIT} استجابات متتابعة بلا صوت — "
                      f"يتوقّف صوناً للحصة.", file=sys.stderr)
                break
        except Exception as e:  # noqa: BLE001
            failed += 1
            mark_failed(text, model)
            print(f"  ✗ {label}: [{type(e).__name__}] {e}", file=sys.stderr)

    if dry_run:
        print(f"\nسيُصرَّف: {made}، ومحجوز: {held}. (تجربة جافّة — لم يُطلب شيء)")
        return 0

    write_manifest(manifest_map())
    left = queue_pending(load_queue())
    print(f"\nتم التصريف: {made} مولّد، {failed} فشل، {held} محجوز، {len(left)} ما زال منتظِراً.")
    if pool.used:
        print("  بالمفاتيح: " + "، ".join(f"{k}: {c}" for k, c in pool.used.most_common()))
    return failed


# ————————————————————— فحصُ الفاحص: بلا شبكةٍ ولا مفتاح —————————————————————

def self_test() -> int:
    """دوالُّ خالصةٌ تُجرَّب سالباً — يجدها `test_selftests.mjs` بالجرد فيشغّلها."""
    ok_n = bad_n = 0

    def ok(cond, msg):
        nonlocal ok_n, bad_n
        print(("  ✓ " if cond else "  ✗ ") + msg)
        ok_n, bad_n = ok_n + bool(cond), bad_n + (not cond)

    print("\n— المفتاح: الاشتقاقُ نفسُه في بايثون وجافاسكربت —")
    ok(key_for("cat") == hashlib.sha1("cat".encode()).hexdigest()[:12],
       f"مفتاحُ «cat» = {key_for('cat')} (١٢ خانة من sha1)")
    ok(len(key_for("أَيُّ نَصّ")) == 12 and key_for("a") != key_for("b"),
       "ومفتاحان لنصّين مختلفين لا يتساويان")

    print("\n— القناتان: صوتٌ لكلِّ لسان، ولا يُنطَق نصٌّ بلسان الأخرى —")
    ok(VOICES["ar"] == "Sulafat" and VOICES["en"] == "Leda",
       f"العربيةُ بصوت {VOICES['ar']} والإنكليزيةُ بصوت {VOICES['en']}")
    ok(voice_for({"category": "instruction"}) == "Sulafat"
       and voice_for({"category": "word"}) == "Leda"
       and voice_for({"category": "phoneme"}) == "Leda",
       "والصوتُ يُختار بلغة الفئة لا بحقلٍ يُكتب بيد")
    ok(set(CATEGORY_LANG) == set(CATEGORY_AR) and len(CATEGORY_LANG) == 7,
       "والفئاتُ سبعٌ لا ثامنَ لها")
    ok(sum(1 for v in CATEGORY_LANG.values() if v == "en") == 4,
       "أربعٌ إنكليزيةٌ دائماً وثلاثٌ عربيةٌ دائماً")

    print("\n— الحارسُ عند البوّابة: قيودُ القناتين تُمسَك قبل أيّ طلب —")
    ok(wasl_at("اِسْمَعْ وَالْمَسْ") == 0 and wasl_at("اسْمَعْ وَالْمَسْ") < 0,
       "همزةُ الوصل المشكولة تُمسَك، والعاريةُ تمرّ")
    ok(wasl_at("شُكْراً") < 0 and wasl_at("أَحْسَنْتْ") < 0,
       "والتنوينُ وهمزةُ القطع خارجُ الحكم")
    ok(gate_reason("اِسْمَعْ", "instruction", "ar").startswith("همزةُ وصل"),
       "وعلّةُ الردّ تُسمّى بحرفها")
    ok(gate_reason("cat", "instruction", "ar").startswith("حرفٌ لاتينيّ"),
       "ولا لسانَ لاتينيّ في نصٍّ عربيّ منطوق")
    ok(gate_reason("كات", "word", "en").startswith("حرفٌ عربيّ"),
       "**ولا تُنطَق المادّةُ معرَّبةً أبداً** — حرفٌ عربيّ في كلمةٍ إنكليزية يُحجَز")
    ok(gate_reason("cat", "word", "ar").startswith("لغةٌ تخالف"),
       "ولغةٌ تخالف فئتَها تُمسَك (الفئةُ تلزمها لغتُها)")
    ok(gate_reason("/zz/", "phoneme", "en").startswith("صوتٌ لا مثالَ له"),
       "وصوتٌ لا مثالَ له في جدول المنهج يُحجَز ولا يُخمَّن له مثال")
    ok(gate_reason("cat", "word", "en") == "" and gate_reason("أَحْسَنْتْ", "celebration", "ar") == "",
       "والسليمُ يمرّ بلا علّة")
    # **والحارسُ يُقاس على القائمة الحيّة**: مدخلٌ واحدٌ يخالف ⇒ فحصٌ أحمر هنا.
    live = [e["text"] for e in load_queue()
            if gate_reason(e["text"], e.get("category", ""), e.get("lang", ""))]
    ok(not live, f"وكلُّ ما في القائمة اليومَ يمرّ البوّابة ({len(load_queue())} مدخلاً)"
       + (f" — مخالف: {'، '.join(live[:4])}" if live else ""))

    print("\n— صورةُ النطق: تُرسَل ولا تمسّ المفتاح —")
    ok(speech_form("أَحْسَنْتَةْ") == "أَحْسَنْتَهْ", "التاءُ المربوطة الساكنة تُرسَل هاءً")
    ok(speech_form("/s/", "phoneme") == "s" and speech_form("/ʊ/", "phoneme") == "ʊ",
       "والفونيمُ يُرسَل بلا شرطتين (علامةُ كتابةٍ لا صوت)")
    ok(speech_form("cat", "word") == "cat", "والكلمةُ الإنكليزية لا تُمَسّ")
    ok(key_for("/s/") != key_for(speech_form("/s/", "phoneme")),
       "**والمفتاحُ من المكتوب لا من المنطوق** — فصورةُ النطق لا تُبدّل اسمَ الملف")

    print("\n— تعليمةُ الأداء: عربيةٌ كما هي، وإنكليزيةٌ مرّةً واحدة —")
    ok(set(STYLE_AR) == {"instruction", "modeling", "celebration"}
       and all("مرة واحدة" in s for s in STYLE_AR.values()),
       "تعليماتُ سُلافات الثلاث كما هي عند اِحْسِبْ، وكلُّها تمنع النطقَ مرّتين")
    ok("General American" in EN_PERSONA and "six-year-old" in EN_PERSONA,
       "وتعليمةُ Leda فيها اللكنةُ الأمريكية وطفلُ السادسة (حكمُ المالك ٧)")
    ok(all(s.startswith(EN_PERSONA) for s in STYLE_EN.values())
       and PHONEME_STYLE.startswith(EN_PERSONA),
       "وكلُّ تعليمةٍ إنكليزية مبنيّةٌ على النصّ الواحد — فلا تتبدّل مسحةٌ بتبدّل صياغة")
    ok("once" in STYLE_EN["word"] and "once" in STYLE_EN["sentence"],
       "والإنكليزيةُ تنصّ على «مرة واحدة» كأختها العربية")
    ok(style_for({"category": "phoneme", "text": "/s/"}).find("'sun'") > 0,
       "وتعليمةُ الفونيم تحمل مثالَه من جدول المنهج (‏/s/ ← sun)")
    ok("letter name" in PHONEME_STYLE and "vowel" in PHONEME_STYLE,
       "وتنهى عن اسم الحرف وعن الحركة الدخيلة (نقاءُ الصوت المعزول)")
    ok(style_for({"category": "word", "style_hint": "Whisper it"}) == "Whisper it: ",
       "وتوجيهُ المدخل يعلو على تعليمة الفئة")

    print("\n— الموجِّه: النموذجُ بفئة النصّ لا بأولويته —")
    ok(model_for({"category": "sentence"}) == MODEL_SENTENCE
       and model_for({"category": "word"}) == MODEL_CORE,
       f"الجملُ على {short_model(MODEL_SENTENCE)} والقصيرُ على {short_model(MODEL_CORE)}")
    ok(model_for({"category": "sentence", "priority": 1}) == MODEL_SENTENCE,
       "**وجملةٌ عاجلة تبقى على نموذج الجمل** — عبرةُ بلاغ ٢٠٢٦-٠٨-١٥ بحرفها")
    ok(model_for({"category": "instruction"}) == MODEL_CORE,
       "والعربيةُ كلُّها على نموذج النواة (مسارُ سُلافات كما هو)")
    ok(set(DAILY_CAPS) == {MODEL_CORE, MODEL_SENTENCE},
       f"ولكلِّ نموذجٍ حصّتُه المعلَنة ({DAILY_CAPS[MODEL_CORE]}/{DAILY_CAPS[MODEL_SENTENCE]})")

    print("\n— بابُ الإقرار: لا بنكَ على تعليمةٍ لم تُقَرّ —")
    ok(len(style_hash("en")) == 8 and style_hash("en") != style_hash("ar"),
       "لكلِّ تعليمةٍ بصمتُها")
    saved = load_approval()
    ok(all(not saved.get(w) or saved[w].get("styleHash") in (style_hash(w), None)
           for w in APPROVAL_KEYS),
       "وإقرارٌ قائمٌ على تعليمةٍ بُدِّلت **يبطل من تلقائه** (البصمةُ تكشفه)")
    ok(isinstance(unapproved_langs(), list),
       f"وما لم يُقَرّ يُسمّى: {'، '.join(unapproved_langs()) or 'لا شيء — الثلاثةُ مُقَرّة'}")

    print("\n— عيّنةُ المعايرة: تعبر الفئات كلَّها، ولا تعيد رميَ مُصرَّف —")
    ok(len(CALIBRATION) >= 20, f"العيّنةُ {len(CALIBRATION)} نصاً")
    ok("خُتِمَ جَوَازُكْ" in CALIBRATION and "Hello!" in CALIBRATION and "Bye bye!" in CALIBRATION,
       "وفيها طقسا التحية وختمُ الجواز")
    # قائمةٌ مصنوعة: نصّان من العيّنة، أحدُهما مُصرَّفٌ — فيُجرَّب الحكمُ سالباً وموجباً
    made = [{"text": CALIBRATION[0], "category": "phoneme", "status": "done"},
            {"text": CALIBRATION[1], "category": "phoneme", "status": "pending"}]
    picked = [e["text"] for _i, e in calibration_plan(made)]
    ok(picked == [CALIBRATION[1]],
       f"**والمُصرَّفُ لا يُعاد توليدُه** — يُجمَع المنتظِرُ وحدَه ({'، '.join(picked) or 'لا شيء'})")
    cats = {e.get("category") for _i, e in calibration_plan(
        [{"text": t, "category": c, "status": "pending"}
         for t, c in queue_texts(load_queue(), "pending").items()]
        + [{"text": t, "category": c, "status": "pending"}
           for t, c in queue_texts(load_queue(), "done").items()])}
    ok({"phoneme", "word", "sentence", "instruction", "modeling", "celebration"} <= cats,
       f"وتعبر الفئات الحيّة كلَّها ({'، '.join(sorted(cats))})")

    print("\n— قصُّ الصمت: يقصّ الأطراف ولا يبتلع الصوت —")
    rate = 24000
    quiet = array.array("h", [0] * rate)                  # ثانيةُ صمت
    loud = array.array("h", [12000 if i % 2 else -12000 for i in range(rate)])
    pcm = (quiet + loud + quiet).tobytes()
    cut = trim_pcm(pcm, rate)
    kept = len(cut) / 2 / rate
    ok(0.9 < kept < 1.3, f"ثانيةُ صوتٍ بين ثانيتَي صمتٍ تبقى وحدَها بهامشها ({kept:.2f}ث)")
    ok(len(trim_pcm(quiet.tobytes(), rate)) == len(quiet.tobytes()),
       "وملفٌّ كلُّه صمتٌ لا يُقَصّ إلى لا شيء (صمتٌ تامٌّ عيبٌ آخر يجب أن يظهر)")
    ok(len(trim_pcm(loud.tobytes(), rate)) == len(loud.tobytes()),
       "وصوتٌ بلا صمتٍ يبقى كما هو")

    print("\n— مدةُ mp3 من إطاراتها (بلا مكتبةٍ ولا ffmpeg) —")
    frame = bytes([0xFF, 0xF3, 0x84, 0xC4]) + b"\x00" * 188   # MPEG2 L3 · 24kHz · 64kbps
    tmp = ROOT / "scratch" / "selftest.mp3"
    tmp.parent.mkdir(parents=True, exist_ok=True)
    tmp.write_bytes(frame * 10)
    ok(abs(mp3_duration(tmp) - 0.24) < 0.005, f"عشرةُ إطاراتٍ = ٠٫٢٤ث ({mp3_duration(tmp):.3f})")
    tmp.write_bytes(b"ID3\x03\x00\x00\x00\x00\x00\x0a" + b"\x00" * 10 + frame * 10)
    ok(abs(mp3_duration(tmp) - 0.24) < 0.005, "ووسمُ ID3 في الرأس يُتخطّى بطوله المعلَن")
    ok(len(fingerprint(tmp)) == 8 and fingerprint(tmp) == hashlib.sha1(tmp.read_bytes()).hexdigest()[:8],
       "والبصمةُ أولُ ٨ خاناتٍ من sha1 **البايتات** لا النصّ")
    tmp.unlink()

    print("\n— شواذُّ المدة: تُقاس داخل الفئة لا عبر الفئات —")
    ok(DURATION_FLOOR == 4 and DURATION_RATIO > 1 > DURATION_SHORT,
       "الحدودُ معقولةٌ: أرضيةٌ للوسيط، وسقفٌ للتكرار، وقاعٌ للبتر")

    print("\n— حصةُ اليوم: سقفٌ ذاتيّ لكل (مفتاح × نموذج) —")
    ok(spend_left("مفتاحٌ لا وجودَ له", MODEL_CORE) == DAILY_CAPS[MODEL_CORE],
       f"مفتاحٌ لم يُستعمل يملك حصتَه كاملة ({DAILY_CAPS[MODEL_CORE]})")
    ok(spend_left("مفتاحٌ لا وجودَ له", MODEL_SENTENCE) == DAILY_CAPS[MODEL_SENTENCE],
       "وحصةُ نموذج الجمل مستقلّةٌ عنها — نفادُ إحداهما لا يوقف الأخرى")

    print("\n— والمفوتَرُ يُحاسَب بالمال لا بعدد الطلبات —")
    ok(PAID_KEYS == {VERTEX_KEY} and "GEMINI_API_KEY_3" in KEY_NAMES,
       f"المفوتَرُ رافدُ {VERTEX_KEY} وحدَه، والمفاتيحُ المجرودة {len(KEY_NAMES)}")
    # **وقد صُحِّح بالقياس**: `_PRO` ظُنّ مفوتَراً فبلغ المئةَ ووقف كالمجانيّ سواءً
    ok("GEMINI_API_KEY_PRO" not in PAID_KEYS
       and spend_left("GEMINI_API_KEY_PRO", MODEL_CORE) <= DAILY_CAPS[MODEL_CORE],
       "و«PRO» عاد إلى حصة الطلبات — بلغ المئةَ ووقف كالمجانيّ (قياسُ ١٦ أغسطس)")
    ok(RPM_BY_KEY.get(VERTEX_KEY, 0) > 10,
       f"وإيقاعُ الرافد من جنسه ({RPM_BY_KEY[VERTEX_KEY]:g}/دقيقة لا إيقاعُ AI Studio)")
    # كلفةٌ محسوبةٌ لا مخمَّنة: جملةُ ثانيتين على نموذج الجمل = ٥٠ رمزَ صوت
    cost = usd_of(MODEL_SENTENCE, 2.0, 200)
    ok(abs(cost - (50 / 1e6 * 20.0 + 50 / 1e6 * 1.0)) < 1e-9,
       f"وكلفةُ الطلب من مدّته المقيسة (جملةُ ٢ث = ${cost:.6f})")
    ok(usd_of(MODEL_CORE, 2.0, 200) < cost,
       "ونموذجُ النواة أرخصُ من نموذج الجمل للمدّة نفسِها")
    ok(usd_left() <= PAID_DAILY_USD and usd_spent() >= 0,
       f"والباقي اليومَ ${usd_left():.4f} من ${PAID_DAILY_USD:.2f}")
    day, per = False, False
    for body, want_day, want_sec in (
        ('{"error":{"details":[{"violations":[{"quotaId":"GenerateRequestsPerDayPerProject"}]}]}}', True, 0),
        ('{"error":{"details":[{"@type":"type.googleapis.com/google.rpc.RetryInfo",'
         '"retryDelay":"41s"}]}}', False, 41),
    ):
        got_day, got_sec = parse_429(body)
        day = day or (got_day == want_day and want_day)
        per = per or (got_sec == want_sec and want_sec)
    ok(day, "و429 اليوميّ يُميَّز فلا تُحرَق محاولاتٌ قبل التجدد")
    ok(per, "و429 الدقيقيّ يُقرأ منه زمنُ الانتظار الذي يطلبه الخادم")

    print("\n— المرمِّزُ يُجرَد قبل أوّل طلب —")
    # **الموضعُ هو المحروس لا الوجود**: أن يوجد مرمِّزٌ على هذا الحاسوب لا يثبت شيئاً —
    # المقيسُ أنّ السؤالَ يقع **قبل** أوّل طلبٍ شبكيّ.
    src = Path(__file__).read_text(encoding="utf-8")
    body = src[src.index("\ndef main() -> int:"):]
    gate = body.find("encoder = encoder_name()")
    first_request = body.find("drain_queue(")
    ok(gate > 0 and first_request > 0 and gate < first_request,
       "جردُ المرمِّز يقع قبل أوّل طلبٍ شبكيّ في `main` "
       f"(البوّابة عند {gate if gate > 0 else '؟'}، وأوّلُ طلبٍ عند {first_request if first_request > 0 else '؟'})")
    ok("sys.exit(NO_ENCODER)" in body,
       "وفقدُه يوقف الأمرَ عند البوّابة بعلّته لا بعد أن يصل صوتٌ فيضيع")
    ok(encoder_name() in ("ffmpeg", "lameenc", ""),
       f"ودالّةُ الجرد تسمّي ما وجدت في هذا المفسِّر: «{encoder_name() or 'لا مرمِّز'}»")
    ok("المرمِّز {encoder" in body,
       "ويُعلَن اسمُه في سطر الافتتاح — فيرى المصرِّفُ بأيّ مرمِّزٍ يعمل قبل أن يبدأ")

    print("\n— المفتاحُ لا يُطبع، ولا يُنسَخ إلى مستودعنا —")
    # **يُقاس بالجرد لا بالنيّة**: كلُّ سطرٍ يُخرِج شيئاً (طباعةً أو خروجاً بعلّة)
    # يُقابَل بأسماء ما يحمل قيمةَ مفتاح. سطرٌ واحدٌ يجمعهما ⇒ أحمر.
    SECRETS = ("api_key", "api_key)", "value", "GEMINI_API_KEY=")
    talkers = [ln.strip() for ln in src.splitlines()
               if ("print(" in ln or "sys.exit(" in ln)
               and any(s in ln for s in SECRETS)]
    ok(not talkers, "لا سطرَ يُخرِج قيمةَ مفتاح"
       + (f" — مخالف: {talkers[0][:60]}" if talkers else f" ({len(src.splitlines())} سطراً جُردت)"))
    ok("x-goog-api-key" in src and "detail[:300]" in src,
       "والمفتاحُ في ترويسةٍ لا في رابط، وجسمُ الخطأ يُقتطَع فلا يحمل ترويسةً في سجلّ")
    ok(not (ROOT / ".env").exists(),
       "ولا نسخةَ لـ`.env` في مستودعنا (يُقرأ من بيئة اقرأ ولا يُنقَل)")

    print("\n— الاستجابةُ الفارغة تُميَّز عن الصوت —")
    audio = {"candidates": [{"content": {"parts": [{"inlineData": {
        "mimeType": "audio/L16;rate=24000", "data": base64.b64encode(b"\x01\x02").decode()}}]}}]}
    pcm2, rate2 = extract_audio(audio)
    ok(pcm2 == b"\x01\x02" and rate2 == 24000, "الصوتُ يُستخرج ومعه معدّلُ عيّناته")
    try:
        extract_audio({"candidates": [{"content": {"parts": [{"text": "لا صوت"}]}}]})
        ok(False, "واستجابةٌ بلا صوتٍ تُرمى `EmptyAudio`")
    except EmptyAudio:
        ok(True, "واستجابةٌ بلا صوتٍ تُرمى `EmptyAudio` (فتُعاد مرّتين لا خمساً)")

    print(f"\n{ok_n}/{ok_n + bad_n} تحقّقاً ناجحاً")
    return 1 if bad_n else 0


# ————————————————————————— main —————————————————————————

def main() -> int:
    ap = argparse.ArgumentParser(description="مصرِّفُ القائمة الصوتية لـ«اِسْمَعْ»")
    ap.add_argument("--from-queue", action="store_true", help="تصريفُ القائمة بالأولوية فالأقدمية")
    ap.add_argument("--calibrate", action="store_true",
                    help="عيّنةُ المعايرة وحدَها — تُعرَض على الأذن قبل أن يُبنى بنك")
    ap.add_argument("--dry-run", action="store_true", help="عرضُ ما سيُصرَّف بلا أيّ طلب")
    ap.add_argument("--limit", type=int, default=0, help="حدُّ عددِ ما يُصرَّف في هذه الجولة")
    ap.add_argument("--only", default="",
                    help="دفعةٌ بفئاتٍ بعينها (phoneme,word,…) — البنكُ مرحلةً مرحلة")
    ap.add_argument("--rpm", type=float, default=8.0,
                    help="سقفُ الطلبات في الدقيقة لكل (مفتاح × نموذج) — افتراضي ٨")
    ap.add_argument("--queue-status", action="store_true", help="حالةُ القائمة (بلا شبكة)")
    ap.add_argument("--verify-only", action="store_true", help="التحقّقُ الختاميّ بلا توليد")
    ap.add_argument("--sync-versions", action="store_true",
                    help="إعادةُ اشتقاق البصمات من بايتات القرص — بلا شبكةٍ ولا توليد")
    ap.add_argument("--requeue", metavar="TEXTS", help="إعادةُ نصوصٍ إلى الانتظار بأولوية ١٠")
    ap.add_argument("--requeue-reason", default="عيب مسموع")
    ap.add_argument("--revert", metavar="TEXTS", help="ردُّ نصوصٍ إلى سلفها في scratch/prev")
    ap.add_argument("--verdict", metavar="نص=الحكم",
                    help="تقييدُ حكم الأذن على نصّ (فلا يتكرّر السؤال ولا يُنسى الجواب)")
    ap.add_argument("--approve-style", metavar="ar|en|phoneme",
                    help="إقرارُ الأذن على تعليمة قناةٍ أو فئة — به يُفتح بابُ البنك")
    ap.add_argument("--reject-style", metavar="ar|en|phoneme",
                    help="ردُّ تعليمةٍ بحكم الأذن (وردُّ الفونيمات صنفاً يُرفَع للمدير)")
    ap.add_argument("--note", default="", help="لفظُ الحكم كما قاله المالك")
    ap.add_argument("--self-test", action="store_true", help="فحصُ الفاحص بلا شبكةٍ ولا مفتاح")
    args = ap.parse_args()

    if args.self_test:
        return self_test()

    if args.approve_style or args.reject_style:
        which = args.approve_style or args.reject_style
        if which not in APPROVAL_KEYS + ("vertex",):
            sys.exit(f"الإقرارُ على واحدٍ من: {'، '.join(APPROVAL_KEYS)}، vertex")
        set_approval(which, bool(args.approve_style), args.note)
        return 0

    if args.verdict:
        text, _, verdict = args.verdict.partition("=")
        if not verdict:
            sys.exit("الصيغة: --verdict \"النص=الحكم\"")
        record_verdict(text.strip(), verdict.strip())
        print(f"قُيّد حكمُ الأذن على «{text.strip()}»: {verdict.strip()}")
        return 0

    if args.requeue:
        wanted = [t.strip() for t in args.requeue.split(",") if t.strip()]
        n = requeue(wanted, args.requeue_reason)
        print(f"أُعيد {n} نصاً إلى الانتظار بأولوية {URGENT_PRIORITY} ({args.requeue_reason}).")
        return 0 if n else 1

    if args.revert:
        wanted = [t.strip() for t in args.revert.split(",") if t.strip()]
        back, none = revert_prev(wanted)
        print(f"رُدّ {len(back)} نصاً إلى سلفه المحفوظ.")
        for t in none:
            print(f"  ✗ لا سلفَ محفوظ لـ«{t}»", file=sys.stderr)
        return 0 if back else 1

    queue = load_queue()
    done, pending = expected_texts()

    if args.queue_status:
        waiting = queue_pending(queue)
        by_cat = collections.Counter(e.get("category") for _i, e in waiting)
        print(f"قائمة الانتظار ({QUEUE_FILE.relative_to(ROOT)}): "
              f"{len(waiting)} منتظِراً، {len(queue) - len(waiting)} مُصرَّفاً.")
        for c, n in by_cat.most_common():
            print(f"  · {CATEGORY_AR.get(c, c)} ({CATEGORY_LANG.get(c, '؟')}، "
                  f"{short_model(model_for({'category': c}))}): {n}")
        for e in [e for e in queue if e.get("hold")]:
            print(f"  ⛔ محجوز: «{e['text']}» — {e['hold']}")
        lacking = unapproved_langs()
        print(f"  إقرارُ التعليمات: {'الثلاثةُ مُقَرّة' if not lacking else 'ينقص ' + '، '.join(lacking)}")
        return 0

    if args.sync_versions:
        write_versions(manifest_map())
        return 0

    if args.verify_only:
        return 1 if verify(done, pending) else 0

    if not (args.from_queue or args.calibrate):
        ap.print_help()
        return 0

    # **بابُ الإقرار**: البنكُ لا يُبنى على تعليمةٍ لم تسمعها الأذن — والمعايرةُ هي البابُ.
    if args.from_queue and not args.dry_run:
        lacking = unapproved_langs()
        if lacking:
            sys.exit("لم تُقَرّ تعليمةُ: " + "، ".join(lacking)
                     + " — ولّد العيّنة بـ`--calibrate`، واعرضها في `audio_panel.py`،"
                       " ثم `--approve-style <الاسم> --note \"لفظ المالك\"`.")

    keys = read_keys()
    if not keys and not args.dry_run:
        sys.exit("التصريف يحتاج GEMINI_API_KEY في البيئة أو في .env")
    # **الحارسُ عند البوّابة**: المرمِّزُ يُجرَد **قبل** أوّل طلبٍ شبكيّ لا بعده — فلا
    # يُدفَع ثمنُ نقصٍ معروفٍ سلفاً (`encoder_name` أعلاه).
    encoder = encoder_name()
    if not encoder and not args.dry_run:
        sys.exit(NO_ENCODER)
    set_rpm(args.rpm)
    plan = calibration_plan(queue) if args.calibrate else None
    print(f"{'معايرةٌ' if args.calibrate else 'تصريفُ القائمة'} · النواة "
          f"{short_model(MODEL_CORE)} والجملُ {short_model(MODEL_SENTENCE)} · الأصوات "
          f"{VOICES['ar']}/{VOICES['en']} · المرمِّز {encoder or 'لا شيء'} "
          f"· ≤{args.rpm:g} طلب/دقيقة (و{RPM_BY_KEY.get(VERTEX_KEY):g} لـ{VERTEX_KEY}) "
          f"· روافد: {'، '.join(n for n, _v in keys) or 'لا شيء'}")
    only = tuple(c.strip() for c in args.only.split(",") if c.strip())
    for cat in only:
        if cat not in CATEGORY_LANG:
            sys.exit(f"فئةٌ لا نعرفها «{cat}» — السبع: {'، '.join(CATEGORY_LANG)}")
    failed = drain_queue(KeyPool(keys), args.dry_run, args.limit, plan, only)
    if args.dry_run:
        return 0
    done, pending = expected_texts()
    return 1 if (failed or verify(done, pending)) else 0


if __name__ == "__main__":
    sys.exit(main())
