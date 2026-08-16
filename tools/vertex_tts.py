#!/usr/bin/env python3
"""رافدُ Vertex AI للتوليد الصوتي — **بجوار مفاتيح AI Studio لا بديلاً عنها**.

    python3 tools/vertex_tts.py --probe      # توفّرُ النموذجين والصوتين (طلبٌ لكلٍّ)
    python3 tools/vertex_tts.py --self-test  # فحصُ الفاحص: بلا شبكةٍ ولا توثيق

منسوخٌ ومجرَّدٌ من `read@a41df30` (`docs/SEED.md §٦·١`) — **بإذن المالك، ١٦ أغسطس
٢٠٢٦**: «استعمله من فضلك وانهِ جميع الأصوات».

**لماذا جاء**: حصةُ AI Studio اليومية **مئةُ طلبٍ لكل مفتاحٍ ونموذج** — بلغها
المفتاحان معاً (المجانيُّ والمفوتَر سواءً) فوقف البنكُ عند ٢٩٩ من ٤١٢ وستُّ ساعاتٍ
حتى التجدّد. وVertex **بابٌ آخر إلى النماذج نفسِها بلا حصّةٍ يومية**: فوترةٌ بدل
العدّ، وستّون طلباً في الدقيقة بدل ثمانية. فما بقي دقائقُ لا يومٌ آخر.

**والتوثيقُ حسابُ خدمة لا مفتاح**: يُقرأ من بيئة «اِقْرَأْ» (`../read/tools/gcloud-sa.json`
— صلاحيتُه ٦٠٠ وخارج git) **ولا يُنسَخ إلى مستودعنا**، كما يُقرأ `GEMINI_API_KEY`
من `../read/.env` سواءً بسواء. ويُسَكّ منه **رمزُ وصولٍ قصيرُ الأجل** يُجدَّد قبل
انقضائه — **ولا يُطبع الحسابُ ولا الرمزُ ولا يُقتبس محتواهما** في أيّ مخرَجٍ أو تقرير.

**والفرقُ عن AI Studio**: نقطةُ النداء إقليميةٌ بالمشروع، والنموذجُ يُسمّى باسمه هناك،
والتوثيقُ ترويسةُ `Bearer` لا مفتاحٌ في ترويسة. وما سوى ذلك — الجسمُ والصوتُ
والتعليمةُ واستخراجُ الصوت — **واحدٌ حرفاً**، فالملفُّ الخارجُ منه أخو الخارج من هناك.
"""

import argparse
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import generate_audio as gen  # noqa: E402

# **حسابُ الخدمة من بيئة اقرأ، ولا نسخةَ عندنا** — ويُقبَل محلّيٌّ إن وُجد يوماً.
SA_FILE = gen.ROOT / "tools" / "gcloud-sa.json"
SIBLING_SA = gen.ROOT.parent / "read" / "tools" / "gcloud-sa.json"
REGION = "us-central1"
SCOPE = "https://www.googleapis.com/auth/cloud-platform"
TOKEN_SKEW = 120          # يُجدَّد الرمزُ قبل انقضائه بهذا الهامش

# أسماءُ نموذجينا على Vertex (قد تخالف AI Studio) — ولا ثالثَ لنا (`generate_audio`)
VERTEX_NAMES = {
    gen.MODEL_CORE: "gemini-3.1-flash-tts-preview",
    gen.MODEL_SENTENCE: "gemini-2.5-pro-preview-tts",
}
AVAILABILITY = gen.ROOT / "scratch" / "vertex_models.json"


def sa_path() -> Path | None:
    """ملفُّ حساب الخدمة حيث وُجد — أو `None`. (لا يُقرأ محتواه هنا ولا يُطبع.)"""
    for p in (SA_FILE, SIBLING_SA):
        if p.exists():
            return p
    return None


class VertexAuth:
    """رمزُ وصولٍ من حساب الخدمة، يُسَكّ عند الحاجة ويُجدَّد قبل انقضائه."""

    def __init__(self, path: Path | None = None):
        path = path or sa_path()
        if not path:
            sys.exit(f"لا ملفَّ حساب خدمة: {SA_FILE} ولا {SIBLING_SA}")
        self.info = json.loads(path.read_text(encoding="utf-8"))
        self.project = self.info["project_id"]
        self._token = None
        self._expires = 0.0

    def token(self) -> str:
        if self._token and time.time() < self._expires - TOKEN_SKEW:
            return self._token
        from google.auth import crypt, jwt  # noqa: PLC0415

        signer = crypt.RSASigner.from_service_account_info(self.info)
        now = int(time.time())
        assertion = jwt.encode(signer, {
            "iss": self.info["client_email"], "scope": SCOPE,
            "aud": self.info["token_uri"], "iat": now, "exp": now + 3600,
        })
        body = urllib.parse.urlencode({
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": assertion.decode() if isinstance(assertion, bytes) else assertion,
        }).encode()
        req = urllib.request.Request(self.info["token_uri"], data=body, method="POST",
                                     headers={"Content-Type": "application/x-www-form-urlencoded"})
        with urllib.request.urlopen(req, timeout=60) as r:
            data = json.loads(r.read())
        self._token = data["access_token"]
        self._expires = time.time() + int(data.get("expires_in", 3600))
        return self._token


def endpoint(project: str, model: str, region: str = REGION) -> str:
    return (f"https://{region}-aiplatform.googleapis.com/v1/projects/{project}"
            f"/locations/{region}/publishers/google/models/{model}:generateContent")


def synth(auth: VertexAuth, text: str, style: str, model: str, voice: str,
          region: str = REGION, retries: int = 3) -> tuple[bytes, int]:
    """نداءُ الصوت على Vertex — يعيد (PCM، معدّلَ العيّنات) كنظيره في AI Studio."""
    body = json.dumps({
        "contents": [{"role": "user", "parts": [{"text": style + text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}},
        },
    }, ensure_ascii=False).encode("utf-8")
    url = endpoint(auth.project, model, region)
    delay, last = 2.0, None
    for attempt in range(retries):
        req = urllib.request.Request(url, data=body, method="POST", headers={
            "Authorization": f"Bearer {auth.token()}",
            "Content-Type": "application/json",
        })
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                return gen.extract_audio(json.loads(r.read().decode("utf-8")))
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "replace")[:300]   # لا ترويسةَ تُطبع
            last = gen.TTSError(f"HTTP {e.code}: {detail}")
            if e.code == 429:
                per_day, secs = gen.parse_429(detail)
                if per_day:
                    raise gen.QuotaExhausted(secs or 3600) from e
            elif e.code not in (408, 500, 502, 503, 504):
                raise last from e
        except gen.EmptyAudio:
            raise
        except Exception as e:  # noqa: BLE001
            last = gen.TTSError(f"{type(e).__name__}: {e}")
        if attempt < retries - 1:
            time.sleep(delay)
            delay *= 2
    raise last or gen.TTSError("فشل غير معروف")


def probe(auth: VertexAuth, region: str = REGION) -> dict:
    """طلبٌ واحد لكل (نموذج × قناة): أمتوفّرٌ هو والصوتُ على Vertex؟ (أربعةُ طلبات)"""
    out = {}
    for ours, there in VERTEX_NAMES.items():
        label = gen.short_model(ours)
        for lang, voice in gen.VOICES.items():
            text, style = ("cat", gen.STYLE_EN["word"]) if lang == "en" \
                else ("نَعَمْ", gen.STYLE_AR["celebration"])
            key = f"{ours}/{voice}"
            try:
                pcm, rate = synth(auth, text, style, there, voice, region, retries=1)
                out[key] = {"vertexName": there, "voice": voice, "available": True,
                            "sampleBytes": len(pcm), "rate": rate}
                print(f"  ✓ {label} × {voice} → «{there}» متوفّر "
                      f"({len(pcm) // 1024}KB PCM @ {rate}Hz)")
            except Exception as e:  # noqa: BLE001
                msg = str(e)[:160].replace("\n", " ")
                out[key] = {"vertexName": there, "voice": voice, "available": False, "error": msg}
                print(f"  ✗ {label} × {voice}: {msg}", file=sys.stderr)
    AVAILABILITY.parent.mkdir(parents=True, exist_ok=True)
    AVAILABILITY.write_text(json.dumps(
        {"project": auth.project, "region": region, "checkedAt": gen.TODAY, "models": out},
        ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\nالجرد: {AVAILABILITY.relative_to(gen.ROOT)}")
    return out


def self_test() -> int:
    """بلا شبكةٍ ولا توثيق — يُجرَّب ما يُجرَّب بلا سِرّ."""
    ok_n = bad_n = 0

    def ok(cond, msg):
        nonlocal ok_n, bad_n
        print(("  ✓ " if cond else "  ✗ ") + msg)
        ok_n, bad_n = ok_n + bool(cond), bad_n + (not cond)

    print("\n— نقطةُ النداء إقليميةٌ بالمشروع —")
    url = endpoint("proj-x", "gemini-3.1-flash-tts-preview")
    ok(url.startswith(f"https://{REGION}-aiplatform.googleapis.com/v1/projects/proj-x"),
       "الرابطُ إقليميٌّ باسم المشروع")
    ok(url.endswith(":generateContent") and "publishers/google/models/" in url,
       "وينتهي بالفعل نفسِه الذي في AI Studio")

    print("\n— النموذجان اثنان لا ثلاثة (لا نُسمّي ما لا نملك) —")
    ok(set(VERTEX_NAMES) == {gen.MODEL_CORE, gen.MODEL_SENTENCE},
       f"المسمَّى هنا هو المسمَّى في المصرِّف ({len(VERTEX_NAMES)})")

    print("\n— حسابُ الخدمة: يُقرأ من بيئة اقرأ ولا يُنسَخ —")
    ok(not SA_FILE.exists(), "لا نسخةَ لحساب الخدمة في مستودعنا")
    found = sa_path()
    ok(found is None or found == SIBLING_SA,
       f"ويُقرأ من بيئة اقرأ إن وُجد ({'وُجد' if found else 'غير موجود الآن'})")
    src = Path(__file__).read_text(encoding="utf-8")
    talkers = [ln.strip() for ln in src.splitlines()
               if ("print(" in ln or "sys.exit(" in ln)
               and any(s in ln for s in ("self.info", "_token", "assertion", "token()"))]
    ok(not talkers, "ولا سطرَ يُخرِج الحسابَ ولا الرمز"
       + (f" — مخالف: {talkers[0][:50]}" if talkers else ""))

    print(f"\n{ok_n}/{ok_n + bad_n} تحقّقاً ناجحاً")
    return 1 if bad_n else 0


def main() -> int:
    ap = argparse.ArgumentParser(description="رافد Vertex للتوليد الصوتي")
    ap.add_argument("--probe", action="store_true", help="جردُ توفّر النماذج والأصوات")
    ap.add_argument("--region", default=REGION)
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()
    if args.self_test:
        return self_test()
    if args.probe:
        probe(VertexAuth(), args.region)
        return 0
    ap.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())
