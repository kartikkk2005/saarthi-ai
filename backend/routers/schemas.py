from pydantic import BaseModel, Field
from typing import Optional, Dict

class ChatRequest(BaseModel):
    message: str = Field(..., description="The user's input message")
    session_id: Optional[str] = Field(None, description="Optional session ID to continue a conversation")

class ChatResponse(BaseModel):
    session_id: str = Field(..., description="The current session ID")
    response: str = Field(..., description="The AI's response text")
    score: int = Field(..., description="The current lead score (0-100)")
    classification: str = Field(..., description="Hot, Warm, or Cold")
    emotion: Dict = Field(default_factory=dict, description="Emotion radar scores")
