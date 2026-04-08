from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(String, ForeignKey("clinics.id"), nullable=False)
    queue_entry_id = Column(Integer, ForeignKey("queues.id"), nullable=True) # Allow null for history/manual entries
    user_id = Column(String, index=True, nullable=False) # Phone number as unique user ID
    
    patient_name = Column(String, nullable=False)
    patient_age = Column(Integer, nullable=True)
    patient_gender = Column(String, nullable=True)
    
    diagnosis = Column(String, nullable=False)
    
    # Snapshot Metadata (Professional Branding)
    doctor_name = Column(String, nullable=True)
    doctor_specialty = Column(String, nullable=True)
    doctor_reg_number = Column(String, nullable=True)
    
    clinic_name = Column(String, nullable=True)
    clinic_address = Column(String, nullable=True)
    clinic_phone = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    clinic = relationship("Clinic")
    medicines = relationship("Medicine", back_populates="prescription", cascade="all, delete-orphan")

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False)
    
    name = Column(String, nullable=False)
    dosage = Column(String, nullable=False)
    duration = Column(String, nullable=False) # e.g., "5 days"

    prescription = relationship("Prescription", back_populates="medicines")

class MedicineMaster(Base):
    __tablename__ = "medicine_master"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    default_dosage = Column(String)
    default_duration = Column(String)

class PrescriptionTemplate(Base):
    __tablename__ = "prescription_templates"

    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(String, ForeignKey("clinics.id"), nullable=True) # Optional link to clinic
    name = Column(String, nullable=False) # e.g. "Viral Fever"
    diagnosis = Column(String, nullable=False)
    
    # Store medicines as a simple JSON string for easy retrieval
    # Format: [{"name": "...", "dosage": "...", "duration": "..."}]
    medicines_json = Column(String, nullable=False) 
