# Surveil Backend

AI-Powered Integrated Rural Health Intelligence Platform

## Tech Stack

- Python 3.12 + FastAPI
- PostgreSQL 16 + PostGIS
- Redis 7
- Celery + Celery Beat
- SQLAlchemy 2.0 (async)
- scikit-learn + SHAP for ML risk scoring

## Setup

```bash
cd backend
cp .env.example .env
docker-compose up -d
```

## Running Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Train ML model
python scripts/train_model.py

# Seed data
python scripts/seed_data.py

# Start API
uvicorn app.main:app --reload

# Start Celery worker
celery -A app.tasks.celery_app worker --loglevel=info

# Start Celery beat
celery -A app.tasks.celery_app beat --loglevel=info
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Running Tests

```bash
pytest tests/ -v --cov=app --cov-report=html
```

## Environment Variables

See `.env.example` for all required variables.

## Project Structure

```
app/
  main.py              - FastAPI app entry point
  config.py            - Settings
  database.py          - DB engine + session
  models/              - SQLAlchemy models
  schemas/             - Pydantic schemas
  routers/             - API routers
  services/            - Business logic
  tasks/               - Celery tasks
  websocket/           - WS connection manager
  middleware/          - Auth, logging, rate limiting
  utils/               - JWT, OTP helpers
scripts/
  train_model.py       - ML model training
  seed_data.py         - Database seeding
```
