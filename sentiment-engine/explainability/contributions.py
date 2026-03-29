from typing import Dict

def compute_contributions(
    modality_confidences: Dict[str, float],
    modality_weights: Dict[str, float]
) -> Dict[str, float]:
    """
    Compute normalized contribution of each modality to the final prediction.
    contribution = weight × confidence / sum(all weight × confidence)
    """
    weighted = {
        modality: modality_weights.get(modality, 0.33) * conf
        for modality, conf in modality_confidences.items()
    }
    total = sum(weighted.values())
    if total == 0:
        n = len(weighted)
        return {m: round(1/n, 4) for m in weighted}
    return {m: round(v / total, 4) for m, v in weighted.items()}