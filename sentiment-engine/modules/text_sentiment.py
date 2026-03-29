from transformers import pipeline as hf_pipeline
from pipeline.sentiment_processor import SentimentProcessor
from schemas.output_schema import SentimentOutput, Modality

class TextSentimentAnalyzer:
    def __init__(self):
        #BERT-based model fine-tuned on emotions
        self.classifier = hf_pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            top_k=None 
        )
        self.processor = SentimentProcessor(modality=Modality.TEXT)

    def analyze(self, text: str) -> SentimentOutput:
        raw_results = self.classifier(text)[0]
        # Convert list of {label, score} to {label: score} dict
        label_scores = {item["label"]: item["score"] for item in raw_results}
        return self.processor.process(label_scores)