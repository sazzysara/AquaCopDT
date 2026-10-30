"""
AquaCop – SQLAlchemy Database Models
SQLite (PostGIS-ready schema) with User, WaterBody, Alert, Complaint tables.
"""
from sqlalchemy import (
    Column, String, Float, Integer, Text, DateTime, Boolean, ForeignKey,
    create_engine, JSON
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aquacop.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="citizen")  # "officer" or "citizen"
    department = Column(String, nullable=True)
    badge_id = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    complaints = relationship("Complaint", back_populates="citizen")


class WaterBody(Base):
    __tablename__ = "waterbodies"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    district = Column(String, nullable=True)
    type = Column(String, nullable=True)  # Lake, Marsh, Coastal, Reservoir
    center_lat = Column(Float)
    center_lon = Column(Float)
    bbox = Column(JSON)  # [west, south, east, north]
    historical_area_sqkm = Column(Float)
    current_area_sqkm = Column(Float, nullable=True)
    encroached_area_sqkm = Column(Float, nullable=True)
    ndwi_index = Column(Float, nullable=True)
    flood_risk_score = Column(Integer, nullable=True)
    status = Column(String, default="MONITORED")
    last_satellite_pass = Column(String, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    alerts = relationship("Alert", back_populates="waterbody")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True)
    waterbody_id = Column(String, ForeignKey("waterbodies.id"), nullable=False)
    severity = Column(String, default="MODERATE")  # CRITICAL, HIGH, MODERATE
    lat = Column(Float)
    lon = Column(Float)
    survey_plot = Column(String, nullable=True)
    detected_at = Column(DateTime, default=datetime.utcnow)
    encroachment_type = Column(String, nullable=True)
    buffer_distance_meters = Column(Float, nullable=True)
    disaster_impact = Column(Text, nullable=True)
    status = Column(String, default="PENDING_DISPATCH")
    officer_assigned = Column(String, nullable=True)
    satellite_image_before = Column(String, nullable=True)
    satellite_image_after = Column(String, nullable=True)
    data_source = Column(String, nullable=True)  # Which satellite/source detected it
    created_at = Column(DateTime, default=datetime.utcnow)

    waterbody = relationship("WaterBody", back_populates="alerts")


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String, primary_key=True)
    citizen_id = Column(String, ForeignKey("users.id"), nullable=True)
    citizen_name = Column(String, nullable=False)
    citizen_phone = Column(String, nullable=True)
    waterbody_name = Column(String, nullable=False)
    city_zone = Column(String, nullable=True)
    survey_number = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    lat = Column(Float)
    lon = Column(Float)
    evidence_type = Column(String, nullable=True)
    evidence_hash = Column(String, nullable=True)  # SHA-256 for chain of custody
    satellite_crosscheck = Column(String, default="PENDING_PASS")
    status = Column(String, default="Under Review")
    created_at = Column(DateTime, default=datetime.utcnow)

    citizen = relationship("User", back_populates="complaints")


class SatelliteCache(Base):
    """Cache for processed satellite data (NDWI, change detection results)."""
    __tablename__ = "satellite_cache"

    id = Column(String, primary_key=True)
    waterbody_id = Column(String, nullable=False, index=True)
    scene_id = Column(String, nullable=False)
    scene_date = Column(DateTime)
    ndwi_mean = Column(Float, nullable=True)
    water_area_sqkm = Column(Float, nullable=True)
    change_from_baseline_pct = Column(Float, nullable=True)
    data_source = Column(String)
    processed_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    """Create all tables."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency for FastAPI routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
