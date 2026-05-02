from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from services.database import database
from services.session_store import session_store
from services.lead_router import lead_router

router = APIRouter(tags=["Leads"])

@router.get("/leads", response_model=List[Dict[str, Any]])
async def get_all_leads():
    """Returns all session summaries without full message history."""
    db = database.get_db()
    # Exclude the full messages array to save bandwidth on dashboard list
    cursor = db.sessions.find({}, {"messages": 0})
    sessions = await cursor.to_list(length=100)
    
    # MongoDB returns _id as ObjectId, convert to str
    for s in sessions:
        s["_id"] = str(s["_id"])
    return sessions

@router.get("/leads/{session_id}")
async def get_lead_details(session_id: str):
    """Returns full details of a specific lead session."""
    session = await session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session["_id"] = str(session["_id"])
    return session

@router.post("/leads/{session_id}/route")
async def route_lead(session_id: str):
    """Simulates routing the lead to RM, WhatsApp, or Nurture Campaign."""
    session = await session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    routing_result = lead_router.simulate_routing(session)
    return routing_result
