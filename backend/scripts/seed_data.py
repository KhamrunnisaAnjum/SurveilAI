import asyncio
import uuid
from datetime import datetime, date, timedelta
from sqlalchemy import text
from app.database import async_session, engine, Base
from app.models import User, District, Facility, FacilityInventory, Patient, Vital, SymptomReport, Alert, HomeVisit


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        districts = []
        for name, state in [("Nagpur Rural", "Maharashtra"), ("Wardha", "Maharashtra"), ("Gondia", "Maharashtra"), ("Chandrapur", "Maharashtra"), ("Amravati", "Maharashtra")]:
            d = District(name=name, state=state)
            db.add(d)
            districts.append(d)
        await db.flush()

        facilities = []
        facility_types = ["hospital", "clinic", "blood_bank", "phc", "ambulance"]
        for i, district in enumerate(districts):
            for j, ftype in enumerate(facility_types):
                f = Facility(
                    name=f"{ftype.replace('_', ' ').title()} {i+1}",
                    type=ftype,
                    district_id=district.id,
                    location=text(f"ST_SetSRID(ST_MakePoint({78.9 + i*0.1 + j*0.01}, {20.5 + i*0.05}), 4326)"),
                    address=f"Address {i}-{j}",
                    phone=f"+9198765432{i}{j}",
                )
                db.add(f)
                facilities.append(f)
        await db.flush()

        for f in facilities:
            inv = FacilityInventory(
                facility_id=f.id,
                icu_beds_total=20,
                icu_beds_available=5 + (hash(f.name) % 10),
                o2_cylinders_total=50,
                o2_cylinders_available=20 + (hash(f.name) % 20),
                blood_units={"A+": 10, "B+": 8, "O+": 15, "AB+": 5},
                ambulances_total=5,
                ambulances_available=2 + (hash(f.name) % 3),
            )
            db.add(inv)

        roles = ["patient", "asha_worker", "nurse", "public_health_officer", "admin"]
        users = []
        for i, role in enumerate(roles):
            u = User(
                mobile_number=f"987654320{i}",
                name=f"Demo {role.replace('_', ' ').title()}",
                role=role,
                district_id=districts[0].id,
            )
            db.add(u)
            users.append(u)
        await db.flush()

        patients = []
        for i in range(50):
            p = Patient(
                user_id=users[0].id if i < 10 else users[i % len(users)].id,
                age=20 + (i * 37 % 60),
                gender=["male", "female", "other"][i % 3],
                ward_id=f"Ward {chr(65 + i % 4)}",
                admission_date=date.today() - timedelta(days=i % 30),
            )
            db.add(p)
            patients.append(p)
        await db.flush()

        for i, patient in enumerate(patients[:200]):
            v = Vital(
                patient_id=patient.id,
                heart_rate=60 + (i * 7 % 50),
                spo2=90 + (i * 3 % 10),
                temperature=36 + (i * 0.1 % 3),
                bp_systolic=100 + (i * 5 % 60),
                bp_diastolic=60 + (i * 3 % 30),
                respiratory_rate=12 + (i * 2 % 10),
                recorded_by=users[2].id,
                recorded_at=datetime.utcnow() - timedelta(hours=i),
            )
            db.add(v)

        for i in range(30):
            sr = SymptomReport(
                reporter_id=users[1].id,
                body_area=["head", "chest", "abdomen", "limbs"][i % 4],
                symptoms=["fever", "cough", "pain"][:(i % 3) + 1],
                severity=1 + (i % 10),
                location=text(f"ST_SetSRID(ST_MakePoint({78.9 + i*0.01}, {20.5 + i*0.005}), 4326)"),
                district_id=districts[i % len(districts)].id,
                synced_at=datetime.utcnow(),
            )
            db.add(sr)

        alert_types = ["outbreak", "high_risk_patient", "resource_shortage"]
        for i in range(10):
            a = Alert(
                type=alert_types[i % 3],
                severity=["low", "medium", "high", "critical"][i % 4],
                district_id=districts[i % len(districts)].id,
                message=f"Demo alert {i+1}",
                created_by=users[3].id,
            )
            db.add(a)

        await db.commit()
        print("Seed data created successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
