import httpx
import json
import re
from django.conf import settings

import base64, io
from PIL import Image
import torch
import clip


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


_model, _preprocess, _device = None, None, None

def _load_clip():
    global _model, _preprocess, _device
    if _model is None:
        _device = "cuda" if torch.cuda.is_available() else "cpu"
        _model, _preprocess = clip.load("ViT-B/32", device=_device)

def embed_drawing(image_b64: str) -> list[float] | None:
    """Convert a base64 PNG to a  512-dim CLIP embedding. Returns None on failure."""
    try:
        _load_clip()
        if ',' in image_b64:
            image_b64 = image_b64.split(',', 1)[1]
        img = image.open(io.BytesIO(base64.b64decode(image_b64))).convert("RGB")
        tensor = _preprocess(img).unsqueeze(0).to(_device)
        with torch.no_grad():
            feat = _model.encode_image(tensor)
            feat = feat / feat.norm(dim=-1, keepdim=True)
        return feat[0].cpu().tolist()
    except Exception:
        return None