from schemas.output_schema import SentimentOutput, Modality, UsabilityLabel
from fusion.multimodal_fusion import MultimodalFusion

def make_output(emotion, conf, scores, modality):
    return SentimentOutput(
        emotion=emotion,
        confidence=conf,
        usability_label=UsabilityLabel.NEUTRAL,
        modality=modality,
        raw_scores=scores
    )

def test_fusion_output_has_contributions():
    fusion = MultimodalFusion()
    outputs = {
        "text": make_output("anger", 0.7, {"anger": 0.7, "neutral": 0.3}, Modality.TEXT),
        "audio": make_output("anger", 0.6, {"anger": 0.6, "joy": 0.2, "neutral": 0.2}, Modality.AUDIO),
    }
    result = fusion.fuse(outputs)
    assert result.modality == "fused"
    assert result.contributions is not None
    assert abs(sum(result.contributions.values()) - 1.0) < 1e-4
    assert result.emotion == "anger"

def test_fusion_output_matches_schema():
    fusion = MultimodalFusion()
    outputs = {
        "text": make_output("joy", 0.9, {"joy": 0.9, "neutral": 0.1}, Modality.TEXT),
    }
    result = fusion.fuse(outputs)
    assert result.usability_label == "satisfaction"
    assert 0.0 <= result.confidence <= 1.0