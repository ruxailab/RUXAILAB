from typing import Dict, Optional, List
from schemas.output_schema import SentimentOutput, Modality, UsabilityLabel
from utils.emotion_mapper import map_emotion_to_usability
from explainability.contributions import compute_contributions

DEFAULT_WEIGHTS = {
    "face": 0.4,
    "audio": 0.35,
    "text": 0.25,
}

class MultimodalFusion:
    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self.weights = weights or DEFAULT_WEIGHTS

    def fuse(self, modality_outputs: Dict[str, SentimentOutput]) -> SentimentOutput:
        """
        Late fusion: weighted combination of per-modality predictions.
        modality_outputs: e.g. {"text": <SentimentOutput>, "audio": <SentimentOutput>}
        """
        all_emotions = set()
        for output in modality_outputs.values():
            if output.raw_scores:
                all_emotions.update(output.raw_scores.keys())

        fused_scores: Dict[str, float] = {e: 0.0 for e in all_emotions}
        weight_total = 0.0
        modality_confidences: Dict[str, float] = {}

        for modality, output in modality_outputs.items():
            w = self.weights.get(modality, 1.0 / len(modality_outputs))
            weight_total += w
            modality_confidences[modality] = output.confidence
            if output.raw_scores:
                for emotion, score in output.raw_scores.items():
                    fused_scores[emotion] = fused_scores.get(emotion, 0.0) + w * score

        # Normalize
        if weight_total > 0:
            fused_scores = {e: v / weight_total for e, v in fused_scores.items()}

        top_emotion = max(fused_scores, key=fused_scores.get)
        top_confidence = fused_scores[top_emotion]
        contributions = compute_contributions(modality_confidences, self.weights)

        return SentimentOutput(
            emotion=top_emotion,
            confidence=round(top_confidence, 4),
            usability_label=map_emotion_to_usability(top_emotion),
            modality=Modality.FUSED,
            raw_scores={e: round(v, 4) for e, v in fused_scores.items()},
            contributions=contributions
        )