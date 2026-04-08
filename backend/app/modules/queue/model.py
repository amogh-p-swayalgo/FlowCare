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
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    
    token_number = Column(Integer, nullable=False)
    status = Column(String, nullable=False, default=QueueStatus.WAITING)
    
    joined_at = Column(DateTime, default=datetime.utcnow)
    called_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User")
    clinic = relationship("Clinic")
