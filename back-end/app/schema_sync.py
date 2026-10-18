"""Lightweight schema sync: create missing tables and add columns introduced after the first release.

The project has no migration tool, so new nullable columns are added here with idempotent statements.
"""

from sqlalchemy import text

from app import models  # noqa: F401  (registers tables on Base.metadata)
from app.db import Base, engine

ADDED_COLUMNS = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS course VARCHAR(80)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS semester INTEGER",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS shift VARCHAR(20)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS registration VARCHAR(20)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(280) NOT NULL DEFAULT ''",
    "ALTER TABLE events ADD COLUMN IF NOT EXISTS area VARCHAR(20)",
]


def init_db() -> None:
    Base.metadata.create_all(engine)
    with engine.begin() as connection:
        for statement in ADDED_COLUMNS:
            connection.execute(text(statement))
