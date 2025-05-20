from sqlalchemy import Column, Integer, String, CheckConstraint, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), nullable=False)
    password = Column(String, nullable=False)
    patients = relationship("Patient", back_populates="provider", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("LENGTH(email) <= 255", name="email_max_255"),
        CheckConstraint("email LIKE '%@%.%'", name="email_must_contain_at_and_dot"),
    )

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    first_name = Column(String(50), nullable=False)
    middle_name = Column(String(50))
    last_name = Column(String(50), nullable=False)
    dob = Column(String, nullable=False)
    status = Column(String, nullable=False)
    address = Column(String, nullable=False)
    provider = relationship("Provider", back_populates="patients")

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
