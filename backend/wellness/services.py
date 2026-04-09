import httpx
import json
import re
from django.conf import settings

import base64, io
from PIL import Image
import torch
import clip
import requests
import os
from dotenv import load_dotenv
try:
    import pytesseract
    HAS_PYTESSERACT = True
except ImportError:
    HAS_PYTESSERACT = False

load_dotenv()
raw_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
BASE_URL = raw_url.split("/api")[0].split("/v1")[0].rstrip("/")
llama_endpoint = f"{BASE_URL}/api/generate"

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

def analyze_drawing_with_vision(image_b64: str, prompt: str = "Describe this drawing in detail"):
    """Use Ollama LLM to analyze drawing content with OCR enhancement"""
    try:
        print("[DEBUG] Starting drawing vision analysis...")

        # Strip data URL prefix if present (e.g., "data:image/png;base64,...")
        if ',' in image_b64:
            image_b64 = image_b64.split(',', 1)[1]

        # Optional: Extract text from image using OCR
        extracted_text = None
        if HAS_PYTESSERACT:
            try:
                print("[DEBUG] Extracting text from drawing with OCR...")
                image_data = base64.b64decode(image_b64)
                image = Image.open(io.BytesIO(image_data))
                extracted_text = pytesseract.image_to_string(image).strip()
                if extracted_text:
                    print(f"[DEBUG] OCR found text: {extracted_text[:50]}...")
                    prompt += f"\n\nText/words visible in drawing: '{extracted_text}'"
            except Exception as e:
                print(f"[DEBUG] OCR extraction failed (non-critical): {e}")

        # Convert base64 image to text description using vision model if available
        # Falls back to llama3.2 with text-based analysis
        model = "llava"  # Vision-capable model, falls back to llama3.2 if unavailable

        payload = {
            "model": model,
            "prompt": prompt,
            "images": [image_b64],  # Ollama supports embedded base64 images
            "stream": False,
            "temperature": 0  # Set to 0 for deterministic/consistent responses
        }

        print(f"[DEBUG] Sending request to {llama_endpoint} with model: {model}")
        # Increased timeout to 120 seconds for vision analysis (can be slow)
        response = requests.post(llama_endpoint, json=payload, timeout=120)
        response.raise_for_status()
        result = response.json().get('response', '')
        print(f"[DEBUG] Got response from LLM: {result[:100] if result else 'Empty'}...")
        return result
    except Exception as e:
        print(f"[DEBUG] Vision analysis failed: {e}")
        # Fallback: text-based analysis
        return analyze_drawing_text_only(prompt)

def analyze_drawing_text_only(prompt: str):
    """Text-based analysis when vision model unavailable"""
    payload = {
        "model": "llama3.2",
        "prompt": prompt,
        "stream": False,
        "temperature": 0  # Deterministic responses
    }

    try:
        # Increased timeout for text analysis too
        response = requests.post(llama_endpoint, json=payload, timeout=60)
        response.raise_for_status()
        return response.json().get('response', '')
    except Exception as e:
        print(f"Text analysis failed: {e}")
        return None

def parse_emotional_analysis_json(llm_response: str) -> dict:
    """
    Parse and validate emotional analysis JSON from LLM.
    Handles cases where LLM wraps response in markdown code blocks.
    """
    if not llm_response:
        raise ValueError("Empty response from LLM")

    try:
        # Try direct parse first
        return json.loads(llm_response)
    except json.JSONDecodeError:
        pass

    # Handle markdown code blocks: ```json { ... } ```
    try:
        match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', llm_response, re.DOTALL)
        if match:
            json_str = match.group(1)
            return json.loads(json_str)
    except (json.JSONDecodeError, AttributeError):
        pass

    # Handle case where JSON might be wrapped in extra text
    try:
        start = llm_response.find('{')
        end = llm_response.rfind('}') + 1
        if start != -1 and end > start:
            json_str = llm_response[start:end]
            return json.loads(json_str)
    except json.JSONDecodeError:
        pass

    # Validation failed
    print(f"[DEBUG] Failed to parse emotional analysis JSON from: {llm_response[:200]}")
    raise ValueError(f"Invalid emotional analysis response format. Expected JSON, got: {llm_response[:100]}")

def validate_emotional_analysis(data: dict) -> dict:
    """
    Validate emotional analysis has required fields and correct types.
    Returns validated data with defaults for missing fields.
    """
    required_fields = {
        "mood_label": str,
        "confidence": (int, float),
        "summary": str
    }

    for field, expected_type in required_fields.items():
        if field not in data:
            raise ValueError(f"Missing required field: {field}")
        if not isinstance(data[field], expected_type):
            raise ValueError(f"Field '{field}' must be {expected_type}, got {type(data[field])}")

    # Validate mood_label is one of the allowed values
    valid_moods = ['happy', 'sad', 'anxious', 'calm', 'angry', 'excited', 'stressed', 'neutral']
    if data['mood_label'].lower() not in valid_moods:
        raise ValueError(f"Invalid mood_label '{data['mood_label']}'. Must be one of: {valid_moods}")

    # Validate confidence is 0.0-1.0
    if not (0.0 <= data['confidence'] <= 1.0):
        raise ValueError(f"Confidence must be between 0.0 and 1.0, got {data['confidence']}")

    # Ensure lowercase mood_label
    data['mood_label'] = data['mood_label'].lower()

    return data

def get_drawing_emotional_analysis(image_b64: str):
    """
    Analyze emotional content of drawing with labeled mood.
    Returns validated JSON with mood_label, confidence, and summary.
    """
    print("[DEBUG] get_drawing_emotional_analysis called with image_b64 length:", len(image_b64))

    prompt = """You are an expert art therapist analyzing a student's drawing for emotional insight.

DETAILED ANALYSIS:

1. TEXT CONTENT (HIGHEST PRIORITY)
   - Look for any words, phrases, or expressions written
   - Aggressive/violent language (kill, murder, hate, destroy) = strong anger indicator
   - Sad words (sad, lonely, dark, hurt) = strong sadness indicator
   - Positive words (happy, fun, love, excited) = happiness/positivity indicator
   - Text reflecting self-doubt/worry = anxiety indicator

2. LINE CHARACTERISTICS
   - Sharp/jagged/angular lines: anger, anxiety, tension
   - Heavy/deep pressure marks: intensity, anger, stress
   - Soft/flowing/curved lines: calm, happiness, peacefulness
   - Light/uncertain strokes: sadness, anxiety, vulnerability
   - Aggressive repetitive marks: anger, frustration
   - Loose/expressive variety: excitement, creativity

3. SPATIAL PATTERNS
   - Tight/crowded/overlapping: overwhelm, anxiety, stress, anger
   - Centered/balanced: calm, control, focus
   - Scattered/spread out: playfulness, happiness, peace
   - Downward flowing: sadness, depression
   - Explosive/outward: anger, excitement

4. OVERALL INTENSITY
   - Heavy dark marks, forceful strokes = strong negative emotions (anger, sadness)
   - Aggressive overwriting/crossing out = anger, frustration, regret
   - Gentle/minimal marks = calm, sadness, detachment

MOOD DETECTION RULES:
- angry: jagged sharp lines + heavy pressure + aggressive marks + violent/angry language
- sad: downward flow + soft heavy lines + sad language + isolation
- anxious: sharp chaotic lines + repetitive patterns + uncertain strokes
- calm: flowing soft curves + balanced space + controlled marks
- excited/happy: varied expressive marks + playful energy + positive language
- stressed: crowded overlapping + tangled patterns + urgent marks
- neutral: minimal controlled simple marks

CONFIDENCE GUIDANCE:
- HIGH (0.8-1.0): Clear text matching mood + visual characteristics strongly align
- MEDIUM (0.5-0.8): Visual cues clearly present but some ambiguity
- LOW (0.3-0.5): Mixed signals or subtle indicators
- VERY LOW (0.0-0.3): Conflicting signals or unclear

RESPONSE FORMAT (JSON only, no other text):
{
  "mood_label": "<happy|sad|anxious|calm|angry|excited|stressed|neutral>",
  "confidence": <float 0.0-1.0>,
  "summary": "<1-2 sentence empathetic observation about the emotional expression in the drawing>"
}"""

    try:
        result_text = analyze_drawing_with_vision(image_b64, prompt)

        if not result_text:
            print("[DEBUG] LLM returned empty response")
            return None

        print(f"[DEBUG] Raw LLM response: {result_text[:200]}...")

        # Parse JSON from response
        parsed = parse_emotional_analysis_json(result_text)
        print(f"[DEBUG] Parsed JSON: {parsed}")

        # Validate required fields and types
        validated = validate_emotional_analysis(parsed)
        print(f"[DEBUG] Validated emotional analysis: {validated}")

        return validated

    except Exception as e:
        print(f"[DEBUG] Emotional analysis failed: {e}")
        return None
