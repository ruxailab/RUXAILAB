# Multimodal Fusion and Explainability

Branch: `feature/multimodal-fusion-explainability`

This branch adds the fusion layer that combines predictions from text, audio, and facial sentiment modules into a single output — and the explainability component that breaks down how much each modality contributed to the final result.

This is the last of the three implementation phases. It builds on the schema layer (Phase 1) and the input modules (Phase 2).

---

## What's in here

```
fusion/
  multimodal_fusion.py       — Weighted late fusion over per-modality SentimentOutput objects

explainability/
  contributions.py           — Computes normalized modality contribution scores

tests/
  test_multimodal_fusion.py
  test_contributions.py
```

---

## Setup

This branch requires both Phase 1 (`feature/unified-sentiment-pipeline`) and Phase 2 (`feature/multimodal-input-modules`) to be merged first.

```bash
clone repository
cd sentiment-engine
git checkout feature/multimodal-fusion-explainability

python -m venv venv
source venv/bin/activate

pip install -r requirements.txt
```

---

## Fusion

### Approach

**Weighted late fusion.** Each modality runs its full pipeline independently and returns a `SentimentOutput` with a complete emotion probability distribution. The fusion module receives all of these and combines them.

For each emotion class, the fused score is a weighted average of that class's probability across all available modalities:

```
fused_score(emotion) = Σ [ weight(m) × P(emotion | m) ]
                       ─────────────────────────────────
                              Σ weight(m)
```

The fusion then picks the emotion with the highest fused score, normalizes all scores so they sum to 1, and returns a `SentimentOutput` with `modality: "fused"`.

### Default weights

```
face:  0.40
audio: 0.35
text:  0.25
```
---

## Explainability — modality contributions

The `contributions` field in the fused output answers the question: which modality most influenced this prediction?

### Formula

```
contribution(m) = weight(m) × confidence(m)
                  ─────────────────────────────────
                  Σ [ weight(i) × confidence(i) ]
```

This multiplies each modality's assigned weight by its prediction confidence on this specific input, then normalizes. A modality that had a high weight but low confidence will contribute less than its weight alone would suggest — and vice versa.

Contributions always sum to 1.0.

### What contributions mean in practice

If a session is flagged as "high frustration" and the contributions show `{"face": 0.71, "audio": 0.19, "text": 0.10}`, a researcher knows the facial signal was almost entirely responsible for that label. They might want to look at the video clip for that segment. If instead contributions were `{"face": 0.38, "audio": 0.35, "text": 0.27}`, the signal was distributed across all three and any of them would be worth examining.

This is more useful than just the top label and confidence because it tells you *why* the system said what it said, not just *what* it said.

---

## Running the tests

```bash
pytest tests/test_fusion.py -v
```

Tests cover:

- Three modalities available — contributions sum to 1.0
- Two modalities only — renormalization is correct
- Modalities agree — high confidence fused output
- Modalities disagree — contributions reflect per-modality confidence, not just weights
- Custom weights — fusion and contributions both respect them
- Zero confidence edge case — handled without division by zero
- Schema validation — all outputs pass Pydantic validation

---

## What's not in here yet

**Attention-based fusion.** The weighted average approach is a strong baseline, but it treats the weights as fixed. An attention mechanism could learn weights as a function of the inputs — for example, learning that audio is more informative when text contains hedging language. That's a meaningful extension but requires training data and a differentiable fusion model. When the annotated usability dataset is available, this is worth revisiting.

**Temporal fusion.** Right now, fusion happens at the clip or utterance level. For longer recordings, it would be valuable to fuse across time — tracking how affect changes across the session and flagging specific moments where frustration or confusion spiked. That's a separate architectural concern and out of scope for this phase.

---

## How all three phases fit together

```
Text input     → TextSentimentAnalyzer     → SentimentOutput (modality: text)  ┐
Audio input    → AudioEmotionAnalyzer      → SentimentOutput (modality: audio) ├─→ MultimodalFusion → SentimentOutput (modality: fused)
Facial input   → FacialSentimentAnalyzer  → SentimentOutput (modality: face)  ┘         ↑
                                                                            contributions.py
```

Phase 1 (`feature/unified-sentiment-pipeline`) — schema, confidence extraction, emotion mapping

Phase 2 (`feature/multimodal-input-modules`) — text and audio models, audio feature extraction

Phase 3 (this branch) — fusion, contribution tracking, explainable output