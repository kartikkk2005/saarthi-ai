import asyncio
import aiosqlite

async def test():
    db = await aiosqlite.connect("test_check.db")
    cursor = await db.execute("SELECT 1")
    row = await cursor.fetchone()
    print("Result:", row)
    await db.close()

asyncio.run(test())
