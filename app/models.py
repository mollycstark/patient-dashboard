from sqlalchemy import Column, Integer, String, CheckConstraint
from app.db import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True)
    first_name = Column(String(50), nullable=False)
    middle_name = Column(String(50))
    last_name = Column(String(50), nullable=False)
    dob = Column(String, nullable=False)
    status = Column(String, nullable=False)
    address = Column(String, nullable=False)

    __table_args__ = (
        CheckConstraint("LENGTH(first_name) <= 50", name="first_name_max_50"),
        CheckConstraint("LENGTH(middle_name) <= 50", name="middle_name_max_50"),
        CheckConstraint("LENGTH(last_name) <= 50", name="last_name_max_50"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "middle_name": self.middle_name,
            "last_name": self.last_name,
            "dob": self.dob,
            "status": self.status,
            "address": self.address,
        }
