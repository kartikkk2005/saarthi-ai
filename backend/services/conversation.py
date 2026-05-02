from typing import Dict, Any
from services.language import detect_language
from services.lead_scorer import lead_scorer
from services.llm import mock_llm
from services.session_store import session_store

class ConversationService:
    """Orchestrates the chat logic."""

    async def process_message(self, message: str, session_id: str | None = None) -> Dict[str, Any]:
        """
        Processes a user message:
        1. Retrieves or creates session
        2. Detects language
        3. Updates lead score
        4. Generates response
        5. Saves to DB
        """
        # 1. Get or Create Session
        if not session_id:
            session_id = await session_store.create_session()
            session = await session_store.get_session(session_id)
        else:
            session = await session_store.get_session(session_id)
            if not session:
                # Fallback if session ID is invalid
                session_id = await session_store.create_session()
                session = await session_store.get_session(session_id)
                
        # Add user message to DB
        await session_store.add_message(session_id, "user", message)
        
        # 2. Detect Language
        lang = detect_language(message)
        
        # 3. Calculate Score and Classification
        current_score = session.get("score", 0)
        score_delta = lead_scorer.calculate_score_delta(message)
        new_score = max(0, min(100, current_score + score_delta))  # Clamp between 0-100
        classification = lead_scorer.classify(new_score)
        
        # Update Session with new score
        await session_store.update_lead_status(session_id, new_score, classification, lang)
        
        # 4. Generate AI Response
        ai_response = mock_llm.generate_response(message, lang)
        
        # Save AI response to DB
        await session_store.add_message(session_id, "assistant", ai_response)
        
        return {
            "session_id": session_id,
            "response": ai_response,
            "score": new_score,
            "classification": classification,
            "language": lang
        }

conversation_service = ConversationService()
