from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Prescription(Base):
    """
    Prescription model placeholder. 
    Add __tablename__ and Columns when starting the Prescriptions module.
    """
    __abstract__ = True
