"""
Saarthi.AI -- FastAPI Backend Application

Multilingual Partner Acquisition Engine.
This is the main entry point for the backend server.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from services.database import database
from routers.chat import router as chat_router
from routers.leads import router as leads_router


# ---------------------------------------------------------------------------
# Lifespan: connect / disconnect MongoDB on startup / shutdown
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle -- DB connect on start, disconnect on stop."""
    await database.connect()
    yield
    await database.disconnect()


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Saarthi.AI API",
    description="Multilingual Partner Acquisition Engine -- Backend API",
    version="0.1.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS -- allow frontend to call the API
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(leads_router)

# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["System"])
async def health_check():
    """
    Health check endpoint.
    Returns server status and MongoDB connectivity.
    """
    db_status = "disconnected"
    try:
        if database.is_connected:
            db = database.get_db()
            await db.command("ping")
            db_status = "connected"
    except Exception as e:
        error_msg = str(e)
        print(f"[HEALTH-CHECK-ERROR] {e}")
        db_status = f"error: {error_msg}"

    return {
        "status": "ok",
        "service": "saarthi-ai-backend",
        "version": "0.1.0",
        "database": db_status,
    }


# ---------------------------------------------------------------------------
# Root
# ---------------------------------------------------------------------------
@app.get("/", tags=["System"])
async def root():
    """Root endpoint -- basic service info."""
    return {
        "service": "Saarthi.AI API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health",
    }
