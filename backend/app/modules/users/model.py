from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class UserRole(str, enum.Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(String, ForeignKey("clinics.id"), nullable=False)
    name = Column(String, nullable=True)
    phone = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True) # For Doctor login
    role = Column(String, nullable=False, default=UserRole.PATIENT)
    
    # Doctor Professional Details
    specialty = Column(String, nullable=True)
    reg_number = Column(String, nullable=True)

    # Relationships
    clinic = relationship("Clinic", back_populates="users")
