from schemas.output_schema import UsabilityLabel

EMOTION_TO_USABILITY = {
    # Positive
    "joy": UsabilityLabel.SATISFACTION,
    "happy": UsabilityLabel.SATISFACTION,
    "surprise": UsabilityLabel.ENGAGEMENT,
    # Negative
    "anger": UsabilityLabel.FRUSTRATION,
    "disgust": UsabilityLabel.FRUSTRATION,
    "fear": UsabilityLabel.COGNITIVE_LOAD,
    "sadness": UsabilityLabel.FRUSTRATION,
    # Neutral 
    "neutral": UsabilityLabel.NEUTRAL,
    "confusion": UsabilityLabel.CONFUSION,

    "complaint": UsabilityLabel.FRUSTRATION,
    "suggestion": UsabilityLabel.ENGAGEMENT,
}

def map_emotion_to_usability(emotion: str) -> UsabilityLabel:
    emotion_lower = emotion.lower()
    return EMOTION_TO_USABILITY.get(emotion_lower, UsabilityLabel.NEUTRAL)