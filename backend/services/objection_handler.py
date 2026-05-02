import json
import os
import random
from typing import Optional

class ObjectionHandler:
    """
    Objection Handling Knowledge Base (Phase 5).
    Loads structured objection rules from JSON and resolves user intents.
    """
    
    def __init__(self, filepath: str = "data/objections.json"):
        self.objections = {}
        # Try to resolve relative path correctly
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.filepath = os.path.join(base_dir, filepath)
        self.load_knowledge_base()

    def load_knowledge_base(self):
        try:
            with open(self.filepath, 'r', encoding='utf-8') as f:
                self.objections = json.load(f)
        except Exception as e:
            print(f"[OBJECTION-HANDLER-ERROR] Failed to load objections.json: {e}")
            self.objections = {}

    def get_objection_response(self, message: str, language: str) -> Optional[str]:
        """
        Scans message for objection keywords and returns a contextual response.
        Returns None if no objection is detected.
        """
        msg_lower = message.lower()
        
        for category, data in self.objections.items():
            keywords = data.get("keywords", [])
            if any(keyword in msg_lower for keyword in keywords):
                responses = data.get("responses", {})
                # Fallback to English if the required language isn't present
                lang_responses = responses.get(language, responses.get("en", []))
                if lang_responses:
                    return random.choice(lang_responses)
                    
        return None

objection_handler = ObjectionHandler()
