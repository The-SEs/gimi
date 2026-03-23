import httpx
import json
import re
from django.conf import settings

def analyze_mood(content: str) -> tuple[dict, dict]:
    prompt = f"""Analyze this journal entry and respond ONLY with a JSON object, no extra text:
{{
  "mood_label": "<happy|sad|anxious|calm|angry|neutral|excited|stressed>",
  "confidence": <float 0.0-1.0>,
  "summary": "<1-2 sentence empathetic insight>"
}}

Journal entry:
{content}"""

    try:
        resp = httpx.post(
            settings.LLM_BASE_URL,
            json={
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,
            },
            timeout=30,
        )
        resp.raise_for_status()
        raw = resp.json()
        text = raw["choices"][0]["message"]["content"]
        clean = re.sub(r"(?:json)?|", "", text).strip()
        return json.loads(clean), raw

    except Exception:
        # journal save must never fail because of mood analysis
        return {"mood_label": "neutral", "confidence": 0.0, "summary": ""}, {}
