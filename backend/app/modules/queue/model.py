from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
import enum

class QueueStatus(str, enum.Enum):
    WAITING = "waiting"
    CALLED = "called"
    COMPLETED = "completed"
    SKIPPED = "skipped"

class Queue(Base):
    __tablename__ = "queues"

    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(String, ForeignKey("clinics.id"), nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    
    token_number = Column(Integer, nullable=False)
    status = Column(String, nullable=False, default=QueueStatus.WAITING)
    
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True) # M, F, O
    
    joined_at = Column(DateTime, default=datetime.utcnow)
    called_at = Column(DateTime, nullable=True)

    # Relationships
    clinic = relationship("Clinic")
