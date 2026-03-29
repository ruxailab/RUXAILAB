# import sys
# print(sys.path)



from schemas.output_schema import Modality
from pipeline.sentiment_processor import SentimentProcessor

def test_text_processor_output():
    processor = SentimentProcessor(modality=Modality.TEXT)
    result = processor.process({"joy": 2.1, "anger": 0.3, "neutral": 0.5})
    assert result.emotion == "joy"
    assert result.confidence > 0.5
    assert result.usability_label == "satisfaction"
    assert result.modality == "text"

def test_confidence_sums_to_one():
    processor = SentimentProcessor(modality=Modality.TEXT)
    result = processor.process({"joy": 1.0, "anger": 1.0, "neutral": 1.0})
    total = sum(result.raw_scores.values())
    assert abs(total - 1.0) < 1e-6