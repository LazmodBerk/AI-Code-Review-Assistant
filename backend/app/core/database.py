import os
from pathlib import Path
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import get_settings

settings = get_settings()

# Use aiosqlite for async SQLite
DATABASE_URL = settings.DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///") if not settings.DATABASE_URL.startswith("sqlite+aiosqlite") else settings.DATABASE_URL

engine = create_async_engine(DATABASE_URL, echo=settings.DEBUG, connect_args={"check_same_thread": False})
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db():
    """Create all tables and required directories."""
    from app.models import analysis  # noqa: F401 - import to register models
    settings = get_settings()
    for d in ["data", settings.UPLOAD_DIR, settings.REPORTS_DIR]:
        Path(d).mkdir(parents=True, exist_ok=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
