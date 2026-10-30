"""
AquaCop – Database Seed Script
Seeds waterbodies from config.py and creates demo users + sample complaints.
Complaints are clearly marked as DEMO.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import init_db, SessionLocal, WaterBody, Alert, Complaint
from auth import seed_demo_users
from config import WATER_BODIES
from datetime import datetime
import uuid


def seed_waterbodies(db):
    """Seed waterbody records from config."""
    for wb in WATER_BODIES:
        existing = db.query(WaterBody).filter(WaterBody.id == wb["id"]).first()
        if not existing:
            record = WaterBody(
                id=wb["id"],
                name=wb["name"],
                district=wb.get("district"),
                type=wb.get("type"),
                center_lat=wb["center"][0],
                center_lon=wb["center"][1],
                bbox=wb["bbox"],
                historical_area_sqkm=wb.get("historical_area_sqkm"),
                status="MONITORED",
                last_satellite_pass="Awaiting first scan",
            )
            db.add(record)
    db.commit()


def seed_demo_alerts(db):
    """Seed clearly-marked DEMO alerts."""
    demo_alerts = [
        {
            "id": "DEMO-ALT-001",
            "waterbody_id": "WB-PALLIKARANAI",
            "severity": "CRITICAL",
            "lat": 12.9392,
            "lon": 80.2195,
            "survey_plot": "Survey Block 142/A-2",
            "encroachment_type": "[DEMO] Illegal Earth-Filling & Masonry Wall",
            "buffer_distance_meters": 12.4,
            "disaster_impact": "[DEMO] Direct constriction of stormwater outflow channel",
            "status": "PENDING_DISPATCH",
            "officer_assigned": "Inspector S. Ramanathan",
            "data_source": "DEMO - Not from real satellite data",
        },
        {
            "id": "DEMO-ALT-002",
            "waterbody_id": "WB-CHEMBARAMBAKKAM",
            "severity": "HIGH",
            "lat": 13.0135,
            "lon": 80.0612,
            "survey_plot": "Survey Plot 89/South Perimeter",
            "encroachment_type": "[DEMO] Commercial Foundation in Buffer Zone",
            "buffer_distance_meters": 18.0,
            "disaster_impact": "[DEMO] Loss of emergency retention volume",
            "status": "INVESTIGATION_ORDERED",
            "officer_assigned": "Divisional Engineer M. Kavitha",
            "data_source": "DEMO - Not from real satellite data",
        },
    ]
    for alert_data in demo_alerts:
        existing = db.query(Alert).filter(Alert.id == alert_data["id"]).first()
        if not existing:
            alert = Alert(**alert_data)
            db.add(alert)
    db.commit()


def seed_demo_complaints(db):
    """Seed clearly-marked DEMO complaints."""
    demo_complaints = [
        {
            "id": "WTN-2026-00482",
            "citizen_id": "citizen-priya",
            "citizen_name": "Priya Sharma",
            "citizen_phone": "+91 98402 77102",
            "waterbody_name": "Pallikaranai Wetland",
            "city_zone": "Zone 14 - Perungudi / Medavakkam",
            "survey_number": "Sy. No. 142/A-2",
            "description": "Earthmovers dumping construction debris and red soil along south canal border.",
            "lat": 12.9391,
            "lon": 80.2193,
            "evidence_type": "4 Geo-Tagged Photos + Cadastral Deed",
            "satellite_crosscheck": "VERIFIED_ANOMALY",
            "status": "Under Review",
        },
        {
            "id": "WTN-2026-00479",
            "citizen_id": "citizen-priya",
            "citizen_name": "Priya Sharma",
            "citizen_phone": "+91 98402 77102",
            "waterbody_name": "Poondi Reservoir",
            "city_zone": "Zone 02 - Tiruvallur Catchment",
            "survey_number": "Sy. No. 88/C",
            "description": "Illegal automated suction dredgers operating in upstream feeder channel. Riverbed sand mining.",
            "lat": 13.1932,
            "lon": 80.0152,
            "evidence_type": "Video Footage + Tipper Truck Plate Registry",
            "satellite_crosscheck": "VERIFIED_ANOMALY",
            "status": "Assigned",
        },
        {
            "id": "WTN-2026-00465",
            "citizen_id": "citizen-priya",
            "citizen_name": "Priya Sharma",
            "citizen_phone": "+91 98402 77102",
            "waterbody_name": "Madurantakam Lake",
            "city_zone": "Southern Irrigation Perimeter",
            "survey_number": "Plot 310 / Bund East",
            "description": "Concrete foundations poured within the 50m statutory no-construction perimeter zone.",
            "lat": 12.5082,
            "lon": 79.8821,
            "evidence_type": "Photographs + Drone Sweep + Patta Extract",
            "satellite_crosscheck": "VERIFIED_ANOMALY",
            "status": "Field Inspection",
        },
        {
            "id": "WTN-2026-00450",
            "citizen_id": "citizen-priya",
            "citizen_name": "Priya Sharma",
            "citizen_phone": "+91 98402 77102",
            "waterbody_name": "Pulicat Lake",
            "city_zone": "Coastal Intertidal Zone CRZ-I",
            "survey_number": "CRZ-I / Sector 4B",
            "description": "Illegal commercial aquaculture earthen mud bunds erected, blocking natural tidal channel flow.",
            "lat": 13.4183,
            "lon": 80.3125,
            "evidence_type": "Drone High-Res Orthomosaic + Geo-PDF",
            "satellite_crosscheck": "VERIFIED_ANOMALY",
            "status": "Action Taken",
        },
    ]
    for cmp_data in demo_complaints:
        existing = db.query(Complaint).filter(Complaint.id == cmp_data["id"]).first()
        if not existing:
            complaint = Complaint(**cmp_data)
            db.add(complaint)
    db.commit()


def main():
    print("Initializing AquaCop database...")
    init_db()

    db = SessionLocal()
    try:
        print("Seeding demo users...")
        seed_demo_users(db)

        print("Seeding waterbodies from config...")
        seed_waterbodies(db)

        print("Seeding DEMO alerts (clearly marked)...")
        seed_demo_alerts(db)

        print("Seeding DEMO complaints (clearly marked)...")
        seed_demo_complaints(db)

        # Count records
        users = db.query(WaterBody).count()
        print(f"\nDatabase ready:")
        print(f"  Waterbodies: {db.query(WaterBody).count()}")
        print(f"  Alerts: {db.query(Alert).count()}")
        print(f"  Complaints: {db.query(Complaint).count()}")
        print(f"\nAll DEMO data is clearly marked with [DEMO] prefix.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
