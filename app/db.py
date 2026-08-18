from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import DATABASE_URL


class Base(DeclarativeBase):
    pass


# Managed Postgres (DigitalOcean/Heroku-style) hands out postgres:// URLs;
# SQLAlchemy needs the explicit driver scheme.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

engine_kwargs: dict = {}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
    if DATABASE_URL in ("sqlite://", "sqlite:///:memory:"):
        # in-memory DB (tests): every pooled connection must see the same database
        engine_kwargs["poolclass"] = StaticPool
engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def init_db() -> None:
    from app import models  # noqa: F401  (register tables)

    Base.metadata.create_all(engine)
    _migrate()


def _migrate() -> None:
    """create_all never alters existing tables, so columns added to models
    after a table is live in prod are patched in here (works on SQLite and
    Postgres). Replace with Alembic when migrations get non-trivial."""
    from sqlalchemy import inspect, text

    inspector = inspect(engine)
    added_columns = {
        "users": [
            ("password_hash", "VARCHAR(300) DEFAULT ''"),
            ("is_owner", "BOOLEAN DEFAULT FALSE"),
        ],
    }
    for table, columns in added_columns.items():
        if table not in inspector.get_table_names():
            continue
        existing = {c["name"] for c in inspector.get_columns(table)}
        with engine.begin() as conn:
            for name, ddl in columns:
                if name not in existing:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {ddl}"))


def get_session():
    """FastAPI dependency."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
