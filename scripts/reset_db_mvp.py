import sys
import os

# Robust path discovery
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "..", "backend"))
sys.path.insert(0, project_root)

from app.core.database import engine, Base
# Import all models to ensure they are registered for table creation
from app.modules.clinic.model import Clinic
from app.modules.users.model import User
from app.modules.queue.model import Queue
import json
from app.modules.prescriptions.model import Prescription, Medicine, MedicineMaster, PrescriptionTemplate

def reset_database():
    print("Starting FlowCare FINAL REFACTOR Database Reset...")
    
    # Drop all tables safely
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    # Create all tables from scratch
    print("Creating new schema (Now with History & Medicine Tables)...")
    Base.metadata.create_all(bind=engine)
    
    # SEED DATA
    print("Seeding Smart Prescription Data...")
    from sqlalchemy.orm import Session
    from app.core.database import SessionLocal
    db = SessionLocal()
    
    # 0. Clinic & Doctor
    clinic = Clinic(
        id="amogh-clinic", 
        name="FlowCare Speciality Center",
        address="123 Healthcare Blvd, Medical District, NY 10001",
        phone="+1 555-0199",
        owner_name="Dr. Amogh Pathak",
        reg_number="MC-22345",
        specialty="General Physician"
    )
    db.add(clinic)
    db.flush()

    doctor = User(
        clinic_id=clinic.id,
        name="Dr. Amogh Pathak",
        phone="1234567890",
        hashed_password="123", # Using raw for simplicity in demo
        role="doctor",
        specialty="General Physician",
        reg_number="MC-22345"
    )
    db.add(doctor)

    # 1. Medicines
    meds = [
        MedicineMaster(name="Paracetamol", default_dosage="1-0-1", default_duration="5 days"),
        MedicineMaster(name="Ibuprofen", default_dosage="1-0-1", default_duration="3 days"),
        MedicineMaster(name="Amoxicillin", default_dosage="1-1-1", default_duration="7 days"),
        MedicineMaster(name="Cetirizine", default_dosage="0-0-1", default_duration="5 days"),
        MedicineMaster(name="Azithromycin", default_dosage="1-0-0", default_duration="3 days"),
    ]
    db.add_all(meds)
    
    # 2. Templates
    templates = [
        PrescriptionTemplate(
            clinic_id=clinic.id,
            name="Viral Fever", 
            diagnosis="Viral Fever / URI", 
            medicines_json=json.dumps([{"name": "Paracetamol", "dosage": "1-0-1", "duration": "5 days"}])
        ),
        PrescriptionTemplate(
            clinic_id=clinic.id,
            name="Common Cold", 
            diagnosis="Common Cold Symptoms", 
            medicines_json=json.dumps([
                {"name": "Paracetamol", "dosage": "1-0-1", "duration": "3 days"},
                {"name": "Cetirizine", "dosage": "0-0-1", "duration": "5 days"}
            ])
        ),
    ]
    db.add_all(templates)
    db.commit()
    db.close()

    print("Database synchronized with Historical Medical Record Support & Templates!")
    print("\nNext steps:")
    print("1. Start backend: uvicorn app.main:app --reload")
    print("2. Start frontend: npm run dev")
    print("3. Try Revisit History: Signup -> Patient Joins -> Save Presc -> Re-join later.")

if __name__ == "__main__":
    reset_database()
