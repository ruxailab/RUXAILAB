import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./data/default.db")
engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

class Base(DeclarativeBase):
    pass

async def init_db():
    """Initialize database and create tables if they don't exist"""
    data_dir = os.path.dirname(DATABASE_URL.split('///')[-1])
    if data_dir and not os.path.exists(data_dir):
         os.makedirs(data_dir)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database initialized successfully")

async def get_db():
    """Dependency for getting database session"""
    async with AsyncSessionLocal() as session:
        yield session