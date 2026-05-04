"""
Memory Manager for Saarthi.AI

Handles conversation context building and summarization for long conversations.
Ensures the LLM always has relevant context without exceeding token limits.

Strategy:
  - For short conversations (≤ MAX_RECENT_MESSAGES): pass all messages as-is
  - For long conversations (> MAX_RECENT_MESSAGES): summarize older messages into a
    compact "memory summary" and prepend it to the recent messages
"""

from typing import Dict, Any, List, Optional

# Maximum number of recent messages to send as full context to the LLM
MAX_RECENT_MESSAGES = 20

# Threshold at which we trigger summarization of older messages
SUMMARIZATION_THRESHOLD = 25


class MemoryManager:
    """
    Builds optimized conversation context for the LLM.
    
    For short conversations, returns all messages directly.
    For long conversations, compresses older messages into a summary
    and returns only the most recent messages as full context.
    """

    def build_context(
        self,
        messages: List[Dict[str, Any]],
        existing_summary: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Build the context payload for the LLM.
        
        Returns:
            {
                "recent_messages": [...],       # Recent messages as full context
                "memory_summary": str | None,   # Compressed summary of older messages
                "needs_summarization": bool      # Whether we need to generate a new summary
            }
        """
        total = len(messages)

        if total <= MAX_RECENT_MESSAGES:
            # Short conversation — send everything, no summary needed
            return {
                "recent_messages": messages,
                "memory_summary": existing_summary,
                "needs_summarization": False,
            }

        # Long conversation — split into old + recent
        recent_messages = messages[-MAX_RECENT_MESSAGES:]

        # Check if we need to generate/update the summary
        # We regenerate when there are new messages beyond what was previously summarized
        needs_new_summary = (
            existing_summary is None
            or total > SUMMARIZATION_THRESHOLD
            and (total % 10 == 0)  # Re-summarize every 10 messages to stay fresh
        )

        return {
            "recent_messages": recent_messages,
            "memory_summary": existing_summary,
            "needs_summarization": needs_new_summary,
            "older_messages": messages[:-MAX_RECENT_MESSAGES] if needs_new_summary else [],
        }

    def build_memory_prompt(self, memory_summary: Optional[str]) -> str:
        """
        Builds a memory context string to prepend to the system prompt.
        
        Args:
            memory_summary: Compressed summary of older conversation, or None.
            
        Returns:
            A string to inject into the system prompt, or empty string if no summary.
        """
        if not memory_summary:
            return ""

        return (
            "\n\n--- CONVERSATION MEMORY ---\n"
            "The following is a summary of the earlier part of this conversation. "
            "Use this to maintain context and avoid asking for information the user "
            "has already provided:\n"
            f"{memory_summary}\n"
            "--- END MEMORY ---\n"
        )

    def format_summary_prompt(self, older_messages: List[Dict[str, Any]]) -> str:
        """
        Builds the prompt to ask Gemini to summarize older messages.
        
        Args:
            older_messages: List of message dicts with 'role' and 'content'.
            
        Returns:
            A prompt string for the LLM to generate a conversation summary.
        """
        transcript = "\n".join(
            [f"{m['role'].upper()}: {m['content']}" for m in older_messages]
        )

        return (
            "Summarize the following conversation excerpt concisely. "
            "Capture ALL key facts the user shared (name, preferences, questions, "
            "concerns, decisions, any personal details). "
            "Keep it under 200 words. Do not add any commentary.\n\n"
            f"Conversation:\n{transcript}"
        )


# Singleton instance
memory_manager = MemoryManager()
