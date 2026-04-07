# Drawing Emotional Analysis - Developer Guide

This document explains how the LLM emotional analysis pipeline works and how to ensure consistency across developers.
If the LLM is not being run by the school, this will allow drawings to be analyzed with a local LLM still llama 3.2
---

## ⚡ 5-Minute Setup (TL;DR)

**Step 1: Install dependencies**
```bash
cd backend
pip install -r requirements.txt
```

**Step 2: Start Ollama** (in a new terminal)
```bash
ollama serve
```

In another terminal, pull the models:
```bash
ollama pull llava
ollama pull llama3.2
```

**Step 3: Verify everything works**
```bash
python manage.py test_drawing_analysis
```

Expected: `✅ All tests passed!`

**Step 4: Run Django**
```bash
python manage.py runserver
```

Now users can draw → save → get emotional analysis! 🎨

---

## 🎯 Quick Start

### Prerequisites
- Ollama running locally: `ollama serve`
- Models pulled: `ollama pull llava && ollama pull llama3.2`
- Python dependencies: `pip install -r requirements.txt` (includes `easyocr`)

### Test the Pipeline
```bash
python manage.py test_drawing_analysis
```

Expected output:
```
✅ Ollama accessible at http://localhost:11434
✅ Required models available: [llava, llama3.2]
✅ Test drawing created
✅ Analysis successful
   Mood: angry
   Confidence: 0.85
   Summary: "The drawing shows clear signs of anger through aggressive lines..."
✅ All tests passed! Pipeline is working correctly.
```

---

## 🔍 How It Works

### Architecture
```
Canvas Drawing (PNG)
        ↓
Base64 Encode
        ↓
Send to Backend API
        ↓
[Phase 1] Extract text with EasyOCR
        ↓
[Phase 2] Send image + prompt to llava vision model
        ↓
[Phase 3] Parse LLM JSON response
        ↓
[Phase 4] Validate response format
        ↓
Store in Database + Return to Frontend
        ↓
Display in UI with mood badge, confidence bar, summary
```

### Key Configuration

**File**: `wellness/services.py`

**Temperature**: `0` (deterministic)
- Temperature 0 = Always same response for same input
- This ensures consistency across all developers
- If you need more creative responses, temperature can be increased (0-1.0)

**Models**:
- `llava`: Vision model that understands images and text
- `llama3.2`: Text fallback if vision fails
- Both configured in Ollama (no version pinning - use latest)

**Timeouts**:
- Vision analysis: 120 seconds (large model, first run can be slow)
- Text fallback: 60 seconds

---

## 📊 Expected Responses

### Successful Analysis (Status 200)
```json
{
  "mood_label": "angry",
  "confidence": 0.85,
  "summary": "The drawing shows clear signs of anger through aggressive lines and heavy pressure marks combined with violent language."
}
```

### Failed Analysis (Status 200 with null emotional_analysis)
When LLM fails or times out, the drawing still saves with `emotional_analysis: null`
```json
{
  "id": 1,
  "title": "My Drawing",
  "canvas_data": {...},
  "emotional_analysis": null
}
```

### Valid Moods
- `happy`: Playful, energetic, positive
- `sad`: Heavy, isolated, downward
- `anxious`: Chaotic, sharp, uncertain
- `calm`: Flowing, balanced, controlled
- **`angry`**: Jagged, aggressive, violent language
- `excited`: Varied, expressive, vibrant
- `stressed`: Crowded, tangled, overwhelming
- `neutral`: Simple, minimal, controlled

---

## 🧪 Testing Checklist for Developers

Before pushing changes:

```bash
# 1. Ensure Ollama is running
ollama serve

# 2. Run the test suite
python manage.py test_drawing_analysis

# 3. Manually test via API (with frontend)
# - Draw something and save
# - Check Django console for [DEBUG] logs
# - Verify emotional_analysis in response

# 4. Check debug logs for:
✅ "[DEBUG] Starting drawing vision analysis..."
✅ "[DEBUG] Sending request to http://localhost:11434/api/generate with model: llava"
✅ "[DEBUG] Got response from LLM: ..."
✅ "[DEBUG] Parsed JSON: {'mood_label': '...', 'confidence': ..., 'summary': '...'}"
✅ "[DEBUG] Validated emotional analysis: ..."
```

---

## 🐛 Troubleshooting

### Error: "Max retries exceeded"
**Cause**: Ollama not running or unreachable
**Fix**: 
```bash
ollama serve
# In another terminal, verify:
curl http://localhost:11434/api/tags
```

### Error: "Model llava not found"
**Cause**: Model not pulled
**Fix**:
```bash
ollama pull llava    # ~4.7GB
ollama pull llama3.2  # ~2GB
```

### Error: "Timeout reading response"
**Cause**: Vision model is slow (especially first run)
**Fix**: 
- First analysis takes 1-2 minutes (model loads to RAM)
- Subsequent analyses are faster (cached)
- If still timing out, increase timeout in `analyze_drawing_with_vision()` from 120 to 180

### Error: "Failed to parse emotional analysis JSON"
**Cause**: LLM returned invalid JSON format
**Fix**:
1. Check Django console `[DEBUG]` logs for raw LLM response
2. Verify prompt structure in `get_drawing_emotional_analysis()`
3. May need to regenerate with different LLM if consistent

### Error: "Invalid mood_label"
**Cause**: LLM returned mood not in valid list
**Valid moods**: `happy|sad|anxious|calm|angry|excited|stressed|neutral`
**Fix**: Update the mood detection rules in prompt if new moods needed

---

## 👥 For Code Review

When reviewing PR with drawing analysis changes:

- [ ] Temperature is set to `0` (deterministic)
- [ ] Mood labels are only from: `happy|sad|anxious|calm|angry|excited|stressed|neutral`
- [ ] Confidence is float between 0.0-1.0
- [ ] Summary is 1-2 sentences
- [ ] Validation functions check all required fields
- [ ] Debug logs show full pipeline: OCR → LLM → Parsing → Validation
- [ ] Test command passes: `python manage.py test_drawing_analysis`

---

## 📝 Environment Variables

Required in `.env`:
```env
OLLAMA_BASE_URL=http://localhost:11434
```

Optional:
```env
# Can be tuned if needed
DRAWING_ANALYSIS_TIMEOUT_VISION=120
DRAWING_ANALYSIS_TIMEOUT_TEXT=60
```

---

## 📚 Files Modified

- `wellness/services.py`: Core analysis pipeline
- `wellness/models.py`: Added `emotional_analysis` JSONField to VectorDrawing
- `wellness/serializers.py`: Serializes `emotional_analysis` in API response
- `wellness/views.py`: Calls analysis on drawing save
- `frontend/src/components/canvas-widget/SketchbookCanvas.tsx`: Displays analysis in UI
- `frontend/src/services/canvasService.ts`: Updated Drawing type
- `wellness/management/commands/test_drawing_analysis.py`: Test/validation command (NEW)

---

## 🚀 Deployment

Everything needed is in `requirements.txt`. On production:

```bash
pip install -r requirements.txt
# Ollama should be running locally (same server or via docker)
python manage.py runserver
```

The pipeline is production-ready with:
- Graceful degradation (if LLM fails, drawing still saves)
- Comprehensive error handling
- Extensive logging for debugging
- Response validation
- Consistent deterministic outputs (temperature=0)
