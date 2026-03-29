# Unified Sentiment Processing Pipeline

Branch: `feature/unified-sentiment-pipeline`

This branch introduces the core processing layer for the RUXAILAB multimodal sentiment analysis engine. It establishes a shared output schema, a confidence extraction mechanism, and a usability-oriented emotion mapping layer that all downstream modules (text, audio, face) will depend on.

---

## Why this exists

Sentiment models whether they analyze text, audio, or facial expressions, tend to return predictions in whatever format the underlying library spits out. When you have one modality that's fine. When you're trying to combine three, it becomes a mess fast.

This layer exists to enforce a single output contract across the entire pipeline. It also handles two things the raw model outputs don't give you: a normalized confidence score (softmax over raw logits) and a mapping from general emotion labels to the usability-specific categories that RUXAILAB's research taxonomy uses.

---

## Structure

```
schemas/
  output_schema.py       — Pydantic model defining the standard output structure

utils/
  emotion_mapper.py      — Maps emotion labels to usability-oriented categories

pipeline/
  sentiment_processor.py — Core processor: takes raw scores, returns SentimentOutput

tests/
  test_sentiment_processor.py
  test_emotion_mapper.py
```

---

## Quick start

```bash
git clone https://github.com/HITESH-S-P/multimodal-sentiment-engine.git
cd sentiment-engine
git checkout feature/unified-sentiment-pipeline

python -m venv venv
source venv/bin/activate

pip install -r requirements.txt
```

Run the tests:

```bash
pytest tests/test_sentiment_processor.py tests/test_emotion_mapper.py -v
```

Try it manually:

```python
from pipeline.sentiment_processor import SentimentProcessor
from schemas.output_schema import Modality

processor = SentimentProcessor(modality=Modality.TEXT)
result = processor.process({
    "anger": 2.4,
    "neutral": 0.8,
    "joy": 0.3,
    "confusion": 1.1
})

print(result.model_dump_json(indent=2))
```

Output:

```json
{
  "emotion": "anger",
  "confidence": 0.7023,
  "usability_label": "frustration",
  "modality": "text",
  "raw_scores": {
    "anger": 0.7023,
    "confusion": 0.1941,
    "neutral": 0.0742,
    "joy": 0.0294
  },
  "contributions": null
}
```

---

## The output schema

Every module in this system returns a `SentimentOutput` object. Here's what each field means:

| Field | Type | Description |
|---|---|---|
| `emotion` | string | The top predicted emotion label |
| `confidence` | float (0–1) | Softmax probability of the top prediction |
| `usability_label` | enum | Mapped usability category from the RUXAILAB taxonomy |
| `modality` | enum | Source of the prediction: `text`, `audio`, `face`, or `fused` |
| `raw_scores` | dict (optional) | Full probability distribution over all emotion classes |
| `contributions` | dict (optional) | Populated by the fusion module — modality contribution weights |

The `usability_label` field uses a closed enum:

```
cognitive_load   — high mental effort, confusion, overload
frustration      — negative affect, friction, annoyance
satisfaction     — positive affect, task completion, ease
confusion        — uncertainty, disorientation
engagement       — active interest, positive surprise
neutral          — no strong signal
```

---

## The emotion mapper

The mapper in `utils/emotion_mapper.py` translates generic model-level labels to usability categories. The current mapping:

| Emotion | Usability label |
|---|---|
| anger | frustration |
| disgust | frustration |
| fear | cognitive_load |
| sadness | frustration |
| surprise | engagement |
| joy | satisfaction |
| neutral | neutral |
| confusion | confusion |
| complaint | frustration |
| suggestion | engagement |

If a label isn't in the mapping, it falls back to `neutral`. The mapping is a plain dictionary — no classes, no inheritance — so it's easy to read and easy to extend.

To add a new mapping, open `utils/emotion_mapper.py` and add an entry to `EMOTION_TO_USABILITY`. That's it.

---

## How confidence works

The processor receives a dictionary of raw scores (logits or unnormalized probabilities) keyed by emotion label. It runs softmax to normalize them into a proper probability distribution, picks the label with the highest probability as the top prediction, and reports that probability as the confidence score.

Softmax with numerical stability:

```python
logits = np.array(list(scores.values()))
logits -= logits.max()   # prevents overflow
exp = np.exp(logits)
probs = exp / exp.sum()
```

The confidence attached to the output is always the post-softmax probability of the top label, rounded to 4 decimal places.

---

## Running the tests

```bash
pytest tests/ -v 
```

The test suite covers:

- Correct top label selection
- Confidence between 0 and 1
- Probabilities summing to 1.0
- Correct usability label mapping
- Edge cases: uniform logits, single-label input, unknown emotion fallback

---

## Dependencies

```
pydantic>=2.0
numpy>=1.24
pytest>=7.0
```

---

## Relation to the full project

This branch is Phase 1 of the multimodal sentiment engine. It does not load any ML model, it's purely the processing and schema layer.