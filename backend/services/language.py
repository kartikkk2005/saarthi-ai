import re

def detect_language(text: str) -> str:
    """
    Language detection module (Phase 3).
    Returns: 
        - 'hi': Hindi (detects Devanagari script)
        - 'hi-en': Hinglish (detects romanized Hindi keywords)
        - 'en': English (fallback default)
    """
    text = text.lower()
    
    # Check for Devanagari script (Hindi)
    if re.search(r'[\u0900-\u097F]', text):
        return 'hi'
        
    # Check for common Hinglish words
    hinglish_keywords = ['mera', 'hai', 'kya', 'nahi', 'broker', 'mujhe', 'batao', 'kaise', 'accha', 'aur']
    words = text.split()
    hinglish_matches = [w for w in words if w in hinglish_keywords]
    
    if len(hinglish_matches) > 0:
        return 'hi-en'
        
    return 'en'
