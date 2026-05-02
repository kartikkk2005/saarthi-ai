"""
Emotion Detection Service for Saarthi.AI

Analyzes user messages to detect emotional state across 5 dimensions:
  - Excited: High buying intent, enthusiasm
  - Curious: Asking questions, seeking information
  - Skeptical: Doubt, comparison, uncertainty
  - Frustrated: Annoyance, impatience, rejection
  - Neutral: Default baseline

Each emotion is scored 0-100. The dominant emotion drives the AI's tone adaptation.
"""

import re

# Keyword-to-emotion mapping with weights
EMOTION_SIGNALS = {
    "excited": {
        "keywords": [
            "yes", "great", "amazing", "interested", "join", "sign up", "love",
            "perfect", "definitely", "absolutely", "wow", "fantastic", "start",
            "ready", "let's go", "sounds good", "impressive", "haan", "bahut accha",
            "zaroor", "mujhe chahiye", "karna hai"
        ],
        "weight": 18
    },
    "curious": {
        "keywords": [
            "how", "what", "tell me", "explain", "details", "more", "?",
            "kaise", "kya", "kitna", "batao", "samjhao", "process", "commission",
            "brokerage", "portal", "payout", "requirements", "eligibility"
        ],
        "weight": 12
    },
    "skeptical": {
        "keywords": [
            "but", "really", "sure", "trust", "guarantee", "proof", "compare",
            "better", "why should", "doubt", "confused", "not sure", "risky",
            "lekin", "sach mein", "pakka", "bharosa", "competitor", "zerodha",
            "groww", "angel", "difference"
        ],
        "weight": 15
    },
    "frustrated": {
        "keywords": [
            "no", "stop", "busy", "later", "waste", "scam", "spam", "annoying",
            "don't call", "not interested", "leave me", "enough", "bad", "worst",
            "nahi", "band karo", "mat karo", "bakwas", "time waste", "pareshan"
        ],
        "weight": 20
    }
}


class EmotionDetector:
    """Detects emotional state from user messages."""

    def analyze(self, message: str) -> dict:
        """
        Returns a dict of emotion scores (0-100) based on keyword matching.
        Also returns the dominant emotion label.
        """
        text = message.lower()
        scores = {
            "excited": 10,    # baseline
            "curious": 10,
            "skeptical": 10,
            "frustrated": 10,
            "neutral": 40     # default dominant
        }

        for emotion, config in EMOTION_SIGNALS.items():
            hits = 0
            for kw in config["keywords"]:
                if kw in text:
                    hits += 1
            # Each hit adds the configured weight, capped at 100
            scores[emotion] = min(100, scores[emotion] + hits * config["weight"])

        # Neutral drops as other emotions rise
        max_active = max(scores["excited"], scores["curious"], scores["skeptical"], scores["frustrated"])
        scores["neutral"] = max(5, 50 - max_active)

        # Determine dominant emotion
        dominant = max(scores, key=scores.get)

        return {
            "scores": scores,
            "dominant": dominant
        }

    def get_tone_instruction(self, dominant: str) -> str:
        """Returns a tone modifier string for the LLM prompt."""
        tone_map = {
            "excited": "The user is enthusiastic! Match their energy. Be upbeat and move towards closing.",
            "curious": "The user is curious. Be informative, give clear facts, and answer thoroughly.",
            "skeptical": "The user has doubts. Be empathetic, provide proof points and comparisons calmly.",
            "frustrated": "The user is frustrated. Be very respectful, brief, and do NOT push the sale. Acknowledge their time.",
            "neutral": "The user is neutral. Be warm and professional."
        }
        return tone_map.get(dominant, tone_map["neutral"])


emotion_detector = EmotionDetector()
