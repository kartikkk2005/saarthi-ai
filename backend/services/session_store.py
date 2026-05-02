import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from services.database import database

class SessionStore:
    """Manages chat sessions in MongoDB."""

    async def create_session(self) -> str:
        """Creates a new session and returns the session_id."""
        session_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        session_doc = {
            "session_id": session_id,
            "score": 0,
            "classification": "Cold",
            "language": "en",
            "messages": [],
            "created_at": now,
            "updated_at": now
        }
        
        db = database.get_db()
        await db.sessions.insert_one(session_doc)
        return session_id

    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a session by session_id."""
        db = database.get_db()
        session = await db.sessions.find_one({"session_id": session_id})
        return session

    async def add_message(self, session_id: str, role: str, content: str) -> None:
        """Adds a message to the session's history."""
        now = datetime.now(timezone.utc).isoformat()
        message = {
            "role": role,
            "content": content,
            "timestamp": now
        }
        
        db = database.get_db()
        await db.sessions.update_one(
            {"session_id": session_id},
            {
                "$push": {"messages": message},
                "$set": {"updated_at": now}
            }
        )

    async def update_lead_status(self, session_id: str, score: int, classification: str, language: str) -> None:
        """Updates the lead score, classification, and language."""
        now = datetime.now(timezone.utc).isoformat()
        db = database.get_db()
        await db.sessions.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "score": score,
                    "classification": classification,
                    "language": language,
                    "updated_at": now
                }
            }
        )

session_store = SessionStore()
