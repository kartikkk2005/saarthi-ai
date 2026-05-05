import re

def detect_language(text: str) -> str:
    """
    Language detection module (Phase 3).
    Returns: 
        - 'hi': Hindi (detects Devanagari script)
        - 'kn': Kannada (detects Kannada script)
        - 'hi-en': Hinglish (detects romanized Hindi keywords)
        - 'kn-en': Kanglish (detects romanized Kannada keywords)
        - 'en': English (fallback default)
    """
    text_lower = text.lower()
    
    # Check for Devanagari script (Hindi)
    if re.search(r'[\u0900-\u097F]', text):
        return 'hi'
    
    # Check for Kannada script
    if re.search(r'[\u0C80-\u0CFF]', text):
        return 'kn'
        
    # Check for common Hinglish words
    hinglish_keywords = ['mera', 'hai', 'kya', 'nahi', 'broker', 'mujhe', 'batao', 'kaise', 'accha', 'aur']
    words = text_lower.split()
    hinglish_matches = [w for w in words if w in hinglish_keywords]
    
    if len(hinglish_matches) > 0:
        return 'hi-en'
    
    # Check for common Kanglish (romanized Kannada) words
    kanglish_keywords = [
        'nanu', 'naanu', 'hege', 'yenu', 'illa', 'houdu', 'beku', 'enu',
        'helri', 'heli', 'gottu', 'gottilla', 'nodri', 'sari', 'channagi',
        'baruttini', 'maadi', 'madri', 'beda', 'kodsri', 'yavaga', 'alli',
        'illi', 'kelsa', 'tumba', 'olledu', 'guru', 'swami', 'andre',
        'namma', 'nimma', 'avru', 'yake', 'hengidira', 'yeshtu'
    ]
    kanglish_matches = [w for w in words if w in kanglish_keywords]
    
    if len(kanglish_matches) > 0:
        return 'kn-en'
        
    return 'en'
