import numpy as np
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from preprocessing.audio_features import extract_audio_features
from pipeline.sentiment_processor import SentimentProcessor
from schemas.output_schema import SentimentOutput, Modality

EMOTION_LABELS = ["neutral", "anger", "joy", "sadness", "fear", "confusion"]

class AudioEmotionAnalyzer:
    def __init__(self):
        self.processor = SentimentProcessor(modality=Modality.AUDIO)
        self.scaler = StandardScaler()
        self.model = SVC(probability=True)
        self._is_trained = False

    def train(self, feature_matrix: np.ndarray, labels: list):
        """Train the classifier. Call this with your usability dataset."""
        X_scaled = self.scaler.fit_transform(feature_matrix)
        self.model.fit(X_scaled, labels)
        self._is_trained = True

    def analyze(self, audio_path: str) -> SentimentOutput:
        features = extract_audio_features(audio_path)
        feature_vector = features["mfcc_mean"] + [
            features["pitch_mean"],
            features["energy_mean"],
            features["zcr_mean"]
        ]
        X = np.array(feature_vector).reshape(1, -1)

        if self._is_trained:
            X_scaled = self.scaler.transform(X)
            probs = self.model.predict_proba(X_scaled)[0]
            label_scores = {label: float(prob) for label, prob in zip(self.model.classes_, probs)}
        else:
            label_scores = self._heuristic_predict(features)

        return self.processor.process(label_scores)

    def _heuristic_predict(self, features: dict) -> dict:
        """Simple rule-based fallback when no trained model is available."""
        energy = features["energy_mean"]
        pitch = features["pitch_mean"]
        scores = {label: 0.1 for label in EMOTION_LABELS}
        if energy > 0.05 and pitch > 200:
            scores["anger"] += 0.5
        elif energy < 0.01:
            scores["sadness"] += 0.4
        else:
            scores["neutral"] += 0.4
        return scores