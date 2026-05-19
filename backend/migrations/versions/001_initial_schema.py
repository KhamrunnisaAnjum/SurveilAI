"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-05-19

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from geoalchemy2 import Geometry

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS postgis')

    op.create_table('districts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('state', sa.String(50), nullable=False),
        sa.Column('geom', Geometry('POLYGON', srid=4326), nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('NOW()')),
    )

    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('mobile_number', sa.String(15), unique=True, nullable=False, index=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('language', sa.Enum('en', 'hi', 'kn', 'ta', 'te', 'mr', 'bn', 'or', name='languageenum'), server_default='en'),
        sa.Column('role', sa.Enum('patient', 'asha_worker', 'nurse', 'public_health_officer', 'admin', name='roleenum'), nullable=False),
        sa.Column('district_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('districts.id')),
        sa.Column('village_cluster_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('ward_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('fcm_token', sa.String(500), nullable=True),
        sa.Column('is_active', sa.Boolean, server_default='true'),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('NOW()')),
    )

    op.create_table('facilities',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('type', sa.Enum('hospital', 'clinic', 'blood_bank', 'phc', 'ambulance', name='facilitytypeenum'), nullable=False),
        sa.Column('district_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('districts.id'), nullable=False),
        sa.Column('location', Geometry('POINT', srid=4326), nullable=False),
        sa.Column('address', sa.String(500), nullable=True),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('google_maps_url', sa.String(500), nullable=True),
        sa.Column('is_active', sa.Boolean, server_default='true'),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('NOW()')),
    )

    op.create_table('facility_inventory',
        sa.Column('facility_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('facilities.id'), primary_key=True),
        sa.Column('icu_beds_total', sa.Integer, server_default='0'),
        sa.Column('icu_beds_available', sa.Integer, server_default='0'),
        sa.Column('o2_cylinders_total', sa.Integer, server_default='0'),
        sa.Column('o2_cylinders_available', sa.Integer, server_default='0'),
        sa.Column('blood_units', postgresql.JSON, server_default='{}'),
        sa.Column('ambulances_total', sa.Integer, server_default='0'),
        sa.Column('ambulances_available', sa.Integer, server_default='0'),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('NOW()')),
    )

    op.create_table('patients',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), unique=True, nullable=False),
        sa.Column('age', sa.Integer, nullable=False),
        sa.Column('gender', sa.Enum('male', 'female', 'other', name='genderenum'), nullable=False),
        sa.Column('ward_id', sa.String(50), nullable=True),
        sa.Column('admission_date', sa.Date, nullable=False),
        sa.Column('discharge_date', sa.Date, nullable=True),
        sa.Column('is_active', sa.Boolean, server_default='true'),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('NOW()')),
    )

    op.create_table('vitals',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('patients.id'), nullable=False),
        sa.Column('recorded_at', sa.DateTime, nullable=False),
        sa.Column('heart_rate', sa.Integer, nullable=True),
        sa.Column('spo2', sa.Integer, nullable=True),
        sa.Column('temperature', sa.Float, nullable=True),
        sa.Column('bp_systolic', sa.Integer, nullable=True),
        sa.Column('bp_diastolic', sa.Integer, nullable=True),
        sa.Column('respiratory_rate', sa.Integer, nullable=True),
        sa.Column('recorded_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
    )

    op.create_table('risk_scores',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('patients.id'), nullable=False),
        sa.Column('score', sa.Float, nullable=False),
        sa.Column('computed_at', sa.DateTime, server_default=sa.text('NOW()')),
        sa.Column('shap_values', postgresql.JSON, server_default='{}'),
        sa.Column('model_version', sa.String(50), nullable=True),
    )

    op.create_table('symptom_reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('reporter_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('reported_at', sa.DateTime, server_default=sa.text('NOW()')),
        sa.Column('body_area', sa.Enum('head', 'chest', 'abdomen', 'limbs', 'skin', 'other', name='bodyareaenum'), nullable=False),
        sa.Column('symptoms', postgresql.ARRAY(sa.String), nullable=False),
        sa.Column('severity', sa.Integer, nullable=False),
        sa.Column('location', Geometry('POINT', srid=4326), nullable=False),
        sa.Column('district_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('districts.id'), nullable=False),
        sa.Column('synced_at', sa.DateTime, nullable=True),
        sa.Column('status', sa.Enum('pending', 'reviewed', 'escalated', name='reportstatusenum'), server_default='pending'),
    )

    op.create_table('alerts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('type', sa.Enum('outbreak', 'high_risk_patient', 'resource_shortage', 'broadcast', name='alerttypeenum'), nullable=False),
        sa.Column('severity', sa.Enum('low', 'medium', 'high', 'critical', name='alertseverityenum'), nullable=False),
        sa.Column('district_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('districts.id'), nullable=False),
        sa.Column('source_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('message', sa.String(1000), nullable=False),
        sa.Column('details', postgresql.JSON, server_default='{}'),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('NOW()')),
        sa.Column('acknowledged_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('acknowledged_at', sa.DateTime, nullable=True),
        sa.Column('status', sa.Enum('active', 'acknowledged', 'dismissed', 'escalated', name='alertstatusenum'), server_default='active'),
    )

    op.create_table('home_visits',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('asha_worker_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('patients.id'), nullable=False),
        sa.Column('scheduled_date', sa.DateTime, nullable=False),
        sa.Column('status', sa.Enum('pending', 'completed', 'missed', name='visitstatusenum'), server_default='pending'),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('NOW()')),
    )

    op.create_index('ix_vitals_patient_recorded', 'vitals', ['patient_id', 'recorded_at'])
    op.create_index('ix_symptom_reports_district_reported', 'symptom_reports', ['district_id', 'reported_at'])
    op.create_index('ix_alerts_district_status', 'alerts', ['district_id', 'status'])


def downgrade() -> None:
    op.drop_table('home_visits')
    op.drop_table('alerts')
    op.drop_table('symptom_reports')
    op.drop_table('risk_scores')
    op.drop_table('vitals')
    op.drop_table('patients')
    op.drop_table('facility_inventory')
    op.drop_table('facilities')
    op.drop_table('users')
    op.drop_table('districts')
