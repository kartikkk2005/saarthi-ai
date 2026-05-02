"""
Application configuration loaded from environment variables.
Uses pydantic-settings to validate and type-check all config values.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # MongoDB
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "saarthi_ai"

    # CORS -- frontend origin
    frontend_url: str = "http://localhost:3000"

    # LLM provider: "mock" | "gemini" | "openai"
    llm_provider: str = "mock"
    llm_api_key: str = ""

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


# Singleton instance
settings = Settings()
