from enum import Enum
from typing import Optional, Dict
from pydantic import BaseModel, Field





class Modality(str, Enum):
    TEXT = "text"
    AUDIO = "audio"
    FACE = "face"
    FUSED = "fused"

class UsabilityLabel(str, Enum):
    COGNITIVE_LOAD = "cognitive_load"
    FRUSTRATION = "frustration"
    SATISFACTION = "satisfaction"
    CONFUSION = "confusion"
    ENGAGEMENT = "engagement"
    NEUTRAL = "neutral"

class SentimentOutput(BaseModel):
    emotion: str
    confidence: float = Field(ge=0.0, le=1.0)
    usability_label: UsabilityLabel
    modality: Modality
    raw_scores: Optional[Dict[str, float]] = None  
    contributions: Optional[Dict[str, float]] = None  
    class Config:
        use_enum_values = True