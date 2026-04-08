from pydantic import BaseModel

class ClinicCreate(BaseModel):
    name: str
    address: str

class ClinicResponse(ClinicCreate):
    id: int

    class Config:

        from_attributes = True