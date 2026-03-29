import numpy as np
from typing import Dict, List
from utils.emotion_mapper import map_emotion_to_usability
from schemas.output_schema import SentimentOutput, Modality, UsabilityLabel

class SentimentProcessor:
    def __init__(self, modality: Modality):
        self.modality = modality

    def extract_confidence(self, raw_logits: List[float]) -> (str, float, Dict[str, float]):
        """
        Apply softmax and return top emotion, its confidence, and all scores.
        raw_logits: list of floats for each emotion class
        """
        logits = np.array(raw_logits)
        probs = np.exp(logits) / np.sum(np.exp(logits))
        return probs

    def process(
        self,
        label_scores: Dict[str, float] 
    ) -> SentimentOutput:
        labels = list(label_scores.keys())
        logits = list(label_scores.values())
        probs = self.extract_confidence(logits)
        prob_dict = {label: float(prob) for label, prob in zip(labels, probs)}

        top_emotion = max(prob_dict, key=prob_dict.get)
        top_confidence = prob_dict[top_emotion]
        usability_label = map_emotion_to_usability(top_emotion)

        return SentimentOutput(
            emotion=top_emotion,
            confidence=round(top_confidence, 4),
            usability_label=usability_label,
            modality=self.modality,
            raw_scores=prob_dict
        )