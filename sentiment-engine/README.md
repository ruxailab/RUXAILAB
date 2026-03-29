# Multimodal Input Modules — Text & Audio

Branch: `feature/multimodal-input-modules`

This branch adds the text sentiment and audio emotion modules to the RUXAILAB sentiment analysis engine. Both modules produce `SentimentOutput` objects that conform to the shared schema from Phase 1. This is the branch where actual models start doing inference.

---

## What's in here

```
modules/
  text_sentiment.py       — BERT-based text emotion classifier
  audio_emotion.py        — MFCC + SVM audio emotion classifier

preprocessing/
  audio_features.py       — Feature extraction from raw audio files

```

---

## Setup

This branch depends on the schema and processing layer from `feature/unified-sentiment-pipeline`. Make sure that code is available before running anything here — either by merging that branch first, or by checking out this branch on top of it.

```bash
git clone https://github.com/HITESH-S-P/multimodal-sentiment-engine.git
cd sentiment-engine

python -m venv venv
source venv/bin/activate

pip install -r requirements.txt
```

The first time you run the text module, it will download the DistilRoBERTa model weights (~300MB) from Hugging Face. After that it's cached locally.

---

## Text sentiment analysis

### Model

`j-hartmann/emotion-english-distilroberta-base` — a DistilRoBERTa model fine-tuned on emotion classification. Returns probabilities for 7 classes: anger, disgust, fear, joy, neutral, sadness, surprise.

### Usage

```python
from modules.text_sentiment import TextSentimentAnalyzer

analyzer = TextSentimentAnalyzer()

result = analyzer.analyze("I have absolutely no idea what this button is supposed to do")
print(result.model_dump_json(indent=2))
```

```json
{
  "emotion": "confusion",
  "confidence": 0.7834,
  "usability_label": "confusion",
  "modality": "text",
  "raw_scores": {
    "confusion": 0.7834,
    "fear": 0.1102,
    "neutral": 0.0621,
    "sadness": 0.0281,
    "anger": 0.0098,
    "joy": 0.0042,
    "disgust": 0.0022
  },
  "contributions": null
}
```

### Intent detection

The text module also detects intent from the surface-level content of the text. When intent signals are found, they override the usability label from the emotion model:

| Detected signal | Override label |
|---|---|
| Complaint indicators ("doesn't work", "can't find") | frustration |
| Suggestion indicators ("should be", "would be better") | engagement |
| Question about navigation ("where is", "how do I") | confusion |

This is a pattern-matching layer, not an ML model. It runs after the emotion classifier and only fires if a pattern matches. If nothing matches, the usability label comes from the emotion mapper as usual.

---

## Audio emotion recognition

### Feature extraction

Before classification, audio files are processed into a 16-dimensional feature vector:

```python
from preprocessing.audio_features import extract_audio_features

features = extract_audio_features("recording.wav")
# Returns:
# {
#   "mfcc_mean": [f1, f2, ..., f13],   # 13 MFCC coefficients
#   "pitch_mean": 182.4,                # Hz, voiced frames only
#   "energy_mean": 0.031,               # RMS amplitude
#   "zcr_mean": 0.094                   # zero crossings per frame
# }
```

Features are extracted using `librosa`. Supported formats: WAV, MP3. The function returns a dict — call `.values()` and flatten to get the raw numpy array for the classifier.

### Classifier

```python
from modules.audio_emotion import AudioEmotionAnalyzer
import numpy as np

analyzer = AudioEmotionAnalyzer()

# If you have labeled training data:
# analyzer.train(X_train, y_train)  # X: (n_samples, 16), y: list of emotion strings

# Without training, the module uses a rule-based heuristic fallback
result = analyzer.analyze("session_clip.wav")
print(result.model_dump_json(indent=2))
```

```json
{
  "emotion": "anger",
  "confidence": 0.6412,
  "usability_label": "frustration",
  "modality": "audio",
  "raw_scores": {
    "anger": 0.6412,
    "neutral": 0.2103,
    "fear": 0.0881,
    "sadness": 0.0421,
    "joy": 0.0183
  },
  "contributions": null
}
```

### Training the classifier

```python
from preprocessing.audio_features import extract_audio_features
from modules.audio_emotion import AudioEmotionAnalyzer
import numpy as np

# Build feature matrix from labeled audio files
file_label_pairs = [
    ("recordings/frustration_01.wav", "anger"),
    ("recordings/confusion_01.wav", "confusion"),
    # ... more files
]

X, y = [], []
for path, label in file_label_pairs:
    features = extract_audio_features(path)
    vector = features["mfcc_mean"] + [
        features["pitch_mean"],
        features["energy_mean"],
        features["zcr_mean"]
    ]
    X.append(vector)
    y.append(label)

analyzer = AudioEmotionAnalyzer()
analyzer.train(np.array(X), y)

# Now analyzer.analyze() uses the trained classifier
result = analyzer.analyze("new_recording.wav")
```

---

## Dependencies

In addition to the Phase 1 dependencies:

```
transformers>=4.35
torch>=2.0
librosa>=0.10
scikit-learn>=1.3
soundfile>=0.12
```

---

## Current limitations

**Text module is English-only.** The underlying model doesn't handle other languages. Multilingual support will need a separate model.

**Audio classifier needs training data.** The heuristic fallback works for basic testing, but accurate predictions require labeled usability session recordings. Once the RUXAILAB dataset is annotated, run `.train()` on it.

**Short audio clips only.** The feature extractor averages over the full clip. For clips longer than ~30 seconds, consider splitting into chunks and analyzing each chunk separately.

---

## Relation to the full project

This is Phase 2. Phase 1 (`feature/unified-sentiment-pipeline`) has to be merged first, this branch imports from `pipeline/`, `schemas/`, and `utils/` defined there.