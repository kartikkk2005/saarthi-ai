import os
from typing import List, Dict, Any, Optional
from google import genai
from google.genai import types
from config import settings
from services.objection_handler import objection_handler
from services.memory import memory_manager

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

    def _build_contents(
        self,
        message: str,
        language: str,
        history: Optional[List[Dict[str, Any]]] = None,
        tone: str = "",
        memory_summary: Optional[str] = None,
    ) -> list:
        """
        Builds the full `contents` list for Gemini, including:
        1. System prompt (with memory summary + tone adaptation)
        2. Conversation history (recent messages)
        3. Current user message
        """
        # Build the memory context block
        memory_context = memory_manager.build_memory_prompt(memory_summary)

        # Build system prompt with memory + tone
        system_prompt = f"""You are Saarthi.AI, a conversational agent for Rupeezy.
Your goal is to onboard Authorized Persons (APs) / Partners.
Respond in a friendly, professional manner.
Keep your response concise (1-3 sentences max).
The user is communicating in '{language}' (en=English, hi=Hindi, hi-en=Hinglish, kn=Kannada, kn-en=Kanglish). Match their language exactly.
If language is 'kn', respond fully in Kannada script (ಕನ್ನಡ).
If language is 'kn-en', respond in romanized Kannada (Kanglish) mixed with English.
If language is 'hi', respond in Hindi (Devanagari).
If language is 'hi-en', respond in Hinglish (romanized Hindi mixed with English).
{memory_context}
{f"TONE ADAPTATION: {tone}" if tone else ""}

IMPORTANT RULES:
- Remember and reference information the user shared earlier in the conversation.
- If the user told you their name, use it naturally.
- Never ask for information the user already provided.
- Build on previous topics discussed in the conversation."""

        contents = [system_prompt]

        # Add conversation history
        if history:
            for msg in history:
                role = msg.get("role", "user").upper()
                content = msg.get("content", "")
                contents.append(f"{role}: {content}")

        # Add current user message
        contents.append(f"USER: {message}")

        return contents

    def generate_response(
        self,
        message: str,
        language: str,
        history: Optional[List[Dict[str, Any]]] = None,
        tone: str = "",
        memory_summary: Optional[str] = None,
    ) -> str:
        """
        Generates a contextual response using Gemini with full conversation memory.
        
        Args:
            message: The current user message.
            language: Detected language code (en, hi, hi-en).
            history: List of past message dicts [{role, content, timestamp}, ...].
            tone: Tone adaptation instruction based on detected emotion.
            memory_summary: Compressed summary of older conversation (for long chats).
        """
        
        # Phase 5: Check for specific objections using the Knowledge Base first
        # (We keep this to ensure immediate, deterministic handling of core objections)
        objection_response = objection_handler.get_objection_response(message, language)
        if objection_response:
            return objection_response
            
        # Fallback to Gemini for dynamic conversational responses
        if not self.client:
            return "Sorry, the AI engine is currently misconfigured. Please check the API key."
        
        # Build full contents with history and memory
        contents = self._build_contents(
            message=message,
            language=language,
            history=history,
            tone=tone,
            memory_summary=memory_summary,
        )
            
        try:
            response = self.client.models.generate_content(
                model="gemini-3-flash-preview",
                contents=contents
            )
            return response.text.strip()
        except Exception as e:
            error_str = str(e)
            # Auto-retry on rate limit (429)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                import time, re
                # Extract retry delay from error message if available
                delay_match = re.search(r'retryDelay.*?(\d+)', error_str)
                wait_time = int(delay_match.group(1)) if delay_match else 30
                print(f"Rate limited. Retrying in {wait_time}s...")
                time.sleep(wait_time)
                try:
                    response = self.client.models.generate_content(
                        model="gemini-3-flash-preview",
                        contents=contents
                    )
                    return response.text.strip()
                except Exception as retry_err:
                    print(f"Retry also failed: {retry_err}")
            else:
                print(f"Gemini API Error: {e}")
            return "I'm currently experiencing high demand. Please try again in a few seconds."

    def generate_memory_summary(self, older_messages: List[Dict[str, Any]]) -> Optional[str]:
        """
        Uses Gemini to compress older messages into a concise summary.
        This summary preserves key facts (names, preferences, decisions)
        so the agent can reference them even when the full history is trimmed.
        """
        if not self.client or not older_messages:
            return None

        prompt = memory_manager.format_summary_prompt(older_messages)

        try:
            response = self.client.models.generate_content(
                model="gemini-3-flash-preview",
                contents=[prompt]
            )
            summary = response.text.strip()
            print(f"[MEMORY] Generated summary ({len(summary)} chars) for {len(older_messages)} older messages")
            return summary
        except Exception as e:
            print(f"[MEMORY-ERROR] Failed to generate summary: {e}")
            return None

    def summarize_transcript(self, messages: list) -> str:
        """Generates a structured post-call summary of a chat transcript."""
        if not self.client:
            return "{\"objections\": [\"N/A\"], \"topics\": [\"API Misconfigured\"], \"action\": \"Check API Key\"}"
            
        transcript = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in messages])
        
        system_prompt = """
        You are an AI analyst reviewing a sales call transcript for Rupeezy.
        Analyze the conversation and return ONLY a JSON object with this exact structure (no markdown fences):
        {
          "duration_turns": <number of messages>,
          "objections": ["list", "of", "objections", "raised by user"],
          "topics": ["list", "of", "topics", "discussed"],
          "action": "1 sentence recommended next action for the RM based on the user's sentiment"
        }
        """
        
        try:
            response = self.client.models.generate_content(
                model="gemini-3-flash-preview",
                contents=[system_prompt, transcript],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return response.text.strip()
        except Exception as e:
            print(f"Summary Error: {e}")
            return "{\"objections\": [\"Error generating summary\"], \"topics\": [\"Error\"], \"action\": \"Review manually\"}"

# Export as mock_llm to avoid breaking imports in conversation.py, 
# even though it's now a real LLM.
mock_llm = GeminiLLM()
