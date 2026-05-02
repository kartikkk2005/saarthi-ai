import os
from google import genai
from google.genai import types
from config import settings
from services.objection_handler import objection_handler

class GeminiLLM:
    """A real LLM integration using Gemini 3 Flash Preview."""

    def __init__(self):
        if settings.llm_api_key:
            os.environ["GEMINI_API_KEY"] = settings.llm_api_key
        self._client = None

    @property
    def client(self):
        # Lazy initialization to avoid global async loop issues in FastAPI
        if self._client is None:
            if not os.environ.get("GEMINI_API_KEY"):
                print("Warning: Failed to initialize Gemini Client: No API key was provided.")
                return None
                
            try:
                self._client = genai.Client()
            except Exception as e:
                print(f"Warning: Failed to initialize Gemini Client: {e}")
        return self._client

    def generate_response(self, message: str, language: str) -> str:
        """Generates a contextual response using Gemini or Objections KB."""
        
        # Phase 5: Check for specific objections using the Knowledge Base first
        # (We keep this to ensure immediate, deterministic handling of core objections)
        objection_response = objection_handler.get_objection_response(message, language)
        if objection_response:
            return objection_response
            
        # Fallback to Gemini for dynamic conversational responses
        if not self.client:
            return "Sorry, the AI engine is currently misconfigured. Please check the API key."
            
        system_prompt = f"""
        You are Saarthi.AI, a conversational agent for Rupeezy.
        Your goal is to onboard Authorized Persons (APs) / Partners.
        Respond in a friendly, professional manner.
        Keep your response concise (1-2 sentences max).
        The user is communicating in '{language}' (en, hi, or hi-en). Match their language.
        """
        
        try:
            response = self.client.models.generate_content(
                model="gemini-3-flash-preview",
                contents=[system_prompt, f"User: {message}"]
            )
            return response.text.strip()
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return "Sorry, I am having trouble connecting to my brain right now."

# Export as mock_llm to avoid breaking imports in conversation.py, 
# even though it's now a real LLM.
mock_llm = GeminiLLM()
