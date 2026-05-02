"""
MongoDB connection manager using Motor (async driver).

Provides a singleton database instance that connects on app startup
and disconnects on shutdown via FastAPI lifespan events.

If MongoDB is unavailable, the app still starts and falls back to
in-memory storage for demo purposes.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config import settings


class Database:
    """Manages the MongoDB connection lifecycle."""

    client: AsyncIOMotorClient | None = None
    db: AsyncIOMotorDatabase | None = None
    is_connected: bool = False

    async def connect(self) -> None:
        """Establish connection to MongoDB."""
        try:
            self.client = AsyncIOMotorClient(
                settings.mongodb_url,
                serverSelectionTimeoutMS=2000,
            )
            # Verify connection by pinging the server
            await self.client.admin.command("ping")
            self.db = self.client[settings.mongodb_db_name]
            self.is_connected = True
            print(f"[OK] Connected to MongoDB: {settings.mongodb_db_name}")

            # Create indexes for performance
            await self._create_indexes()

        except Exception as e:
            print(f"[WARN] MongoDB not available: {e}")
            print("[INFO] App will start, but database features need MongoDB.")
            self.is_connected = False

    async def _create_indexes(self) -> None:
        """Create necessary indexes on collections."""
        if not self.is_connected or self.db is None:
            return

        # Sessions collection -- index on session_id for fast lookups
        await self.db.sessions.create_index("session_id", unique=True)
        # Sessions collection -- index on classification for dashboard queries
        await self.db.sessions.create_index("classification")
        # Sessions collection -- index on updated_at for sorting
        await self.db.sessions.create_index("updated_at")

    async def disconnect(self) -> None:
        """Close the MongoDB connection."""
        if self.client:
            self.client.close()
            self.is_connected = False
            print("[INFO] Disconnected from MongoDB")

    def get_db(self) -> AsyncIOMotorDatabase:
        """Return the database instance."""
        if not self.is_connected or self.db is None:
            raise RuntimeError(
                "Database not connected. Ensure MongoDB is running."
            )
        return self.db


# Singleton instance
database = Database()
