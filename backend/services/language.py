import re

def detect_language(text: str) -> str:
    """
    Very basic heuristic language detection for the demo.
    Returns: 'hi' (Hindi script), 'hi-en' (Hinglish), or 'en' (English)
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
