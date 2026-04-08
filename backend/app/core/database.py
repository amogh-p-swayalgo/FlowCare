from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base:
    pass

Base = declarative_base(cls=Base)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
