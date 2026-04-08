from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Clinic(Base):
    __tablename__ = "clinics"

    id = Column(String, primary_key=True, index=True) # Slug e.g., 'sunrise'
    name = Column(String, nullable=False)
    address = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    
    # Professional details
    owner_name = Column(String, nullable=True)
    reg_number = Column(String, nullable=True) # Medical Reg No
    specialty = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    users = relationship("User", back_populates="clinic")