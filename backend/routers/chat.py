from fastapi import APIRouter
from routers.schemas import ChatRequest, ChatResponse
from services.conversation import conversation_service

router = APIRouter(tags=["Chat"])

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Handles an incoming chat message.
    Returns the AI response, current lead score, and classification.
    """
    result = await conversation_service.process_message(
        message=request.message,
        session_id=request.session_id
    )
    
    return ChatResponse(
        session_id=result["session_id"],
        response=result["response"],
        score=result["score"],
        classification=result["classification"]
    )
