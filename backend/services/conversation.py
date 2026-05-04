from typing import Dict, Any
from services.language import detect_language
from services.lead_scorer import lead_scorer
from services.llm import mock_llm
from services.session_store import session_store
from services.emotion import emotion_detector
from services.memory import memory_manager

class ConversationService:
    """Orchestrates the chat logic with full conversation memory."""

    async def process_message(self, message: str, session_id: str | None = None) -> Dict[str, Any]:
        """
        Processes a user message with full conversation memory:
        1. Retrieves or creates session
        2. Detects language
        3. Updates lead score
        4. Detects emotion + tone adaptation
        5. Builds memory context from conversation history
        6. Generates response with full history awareness
        7. Handles memory summarization for long conversations
        8. Saves to DB
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
                
        # 2. Detect Language
        lang = detect_language(message)
        
        # 3. Calculate Score and Classification
        current_score = session.get("score", 0)
        score_delta = lead_scorer.calculate_score_delta(message)
        new_score = max(0, min(100, current_score + score_delta))  # Clamp between 0-100
        classification = lead_scorer.classify(new_score)
        
        # Update Session with new score
        await session_store.update_lead_status(session_id, new_score, classification, lang)
        
        # 4. Detect Emotion and get tone instruction
        emotion_result = emotion_detector.analyze(message)
        tone = emotion_detector.get_tone_instruction(emotion_result["dominant"])
        
        # 5. Build Memory Context
        # Get existing conversation history from the session
        history = session.get("messages", [])
        existing_summary = session.get("memory_summary", None)
        
        # Use MemoryManager to build optimized context
        memory_context = memory_manager.build_context(history, existing_summary)
        recent_messages = memory_context["recent_messages"]
        memory_summary = memory_context["memory_summary"]
        
        # Add user message to DB (AFTER reading history, so current msg isn't duplicated in context)
        await session_store.add_message(session_id, "user", message)
        
        # 6. Handle memory summarization for long conversations
        if memory_context.get("needs_summarization") and memory_context.get("older_messages"):
            new_summary = mock_llm.generate_memory_summary(memory_context["older_messages"])
            if new_summary:
                memory_summary = new_summary
                await session_store.update_memory_summary(session_id, new_summary)
        
        # 7. Generate AI Response WITH full memory
        ai_response = mock_llm.generate_response(
            message=message,
            language=lang,
            history=recent_messages,
            tone=tone,
            memory_summary=memory_summary,
        )
        
        # Save AI response to DB
        await session_store.add_message(session_id, "assistant", ai_response)
        
        return {
            "session_id": session_id,
            "response": ai_response,
            "score": new_score,
            "classification": classification,
            "language": lang,
            "emotion": emotion_result
        }

conversation_service = ConversationService()
