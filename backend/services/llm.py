import random

from services.objection_handler import objection_handler

class MockLLM:
    """A simulated LLM for demo purposes that uses pattern matching to respond."""

    def __init__(self):
        self.responses = {
            "en": {
                "greeting": ["Hello! I'm Saarthi.AI from Rupeezy. Are you interested in becoming an Authorized Person?", "Hi there! I'm reaching out from Rupeezy. Looking to partner with us?"],
                "interest": ["That's great! To get started, I'll need some basic details. How long have you been in the market?", "Awesome! The onboarding is completely digital and takes just 5 minutes. Are you ready to proceed?"],
                "rejection": ["No problem at all. If you ever change your mind, we're here. Have a great day!", "I understand. Thanks for your time! Let me know if you want to explore this later."],
                "fallback": ["Could you tell me a bit more about what you're looking for in a partnership?", "Interesting. How does that impact your business right now?"]
            },
            "hi-en": {
                "greeting": ["Namaste! Main Saarthi.AI Rupeezy se. Kya aap hamare Authorized Person banne mein interested hain?", "Hello! Kya aap Rupeezy ke saath partner banke extra income generate karna chahte hain?"],
                "interest": ["Bahut badhiya! Start karne ke liye, aap market mein kitne saal se hain?", "Awesome! Onboarding bilkul digital hai aur sirf 5 minute lagte hain. Aage badhe?"],
                "rejection": ["Koi baat nahi. Agar kabhi mind change ho toh batana. Have a good day!", "Samajh gaya. Apna time dene ke liye shukriya! Future mein kabhi connect karte hain."],
                "fallback": ["Kya aap thoda detail mein bata sakte hain ki aap partnership mein kya dhoondh rahe hain?", "Accha. Toh abhi aapka current setup kaisa chal raha hai?"]
            },
            "hi": {
                "greeting": ["नमस्ते! मैं रुपीज़ी से सारथी.एआई हूँ। क्या आप हमारे अधिकृत व्यक्ति (AP) बनने में रुचि रखते हैं?", "नमस्कार! क्या आप रुपीज़ी के साथ जुड़कर अपनी आय बढ़ाना चाहते हैं?"],
                "interest": ["बहुत बढ़िया! शुरुआत करने के लिए, क्या आप बता सकते हैं कि आपको मार्केट का कितना अनुभव है?", "शानदार! प्रक्रिया पूरी तरह से डिजिटल है। क्या हम आगे बढ़ें?"],
                "rejection": ["कोई बात नहीं। समय देने के लिए धन्यवाद। आपका दिन शुभ हो!", "मैं समझता हूँ। यदि आप भविष्य में जुड़ना चाहें, तो हमें खुशी होगी।"],
                "fallback": ["क्या आप मुझे थोड़ा और बता सकते हैं कि आप क्या चाहते हैं?", "ठीक है, तो आप अभी कैसे काम कर रहे हैं?"]
            }
        }

    def generate_response(self, message: str, language: str) -> str:
        """Generates a contextual response based on keywords and language."""
        msg_lower = message.lower()
        
        # Select language dictionary (fallback to English if not found)
        lang_dict = self.responses.get(language, self.responses["en"])
        
        # Phase 5: Check for specific objections using the Knowledge Base
        objection_response = objection_handler.get_objection_response(message, language)
        if objection_response:
            return objection_response
        
        # Simple intent matching
        if any(word in msg_lower for word in ['hello', 'hi', 'namaste']):
            return random.choice(lang_dict["greeting"])
            
        if any(word in msg_lower for word in ['no', 'not', 'nahi', 'stop', 'busy']):
            return random.choice(lang_dict["rejection"])
            
        if any(word in msg_lower for word in ['yes', 'interested', 'haan', 'batao', 'how', 'tell']):
            return random.choice(lang_dict["interest"])
            
        return random.choice(lang_dict["fallback"])

mock_llm = MockLLM()
