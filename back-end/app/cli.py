"""Usage:
python -m app.cli create-admin "Name" email@example.com password
python -m app.cli seed-demo
"""

import sys
from datetime import UTC, datetime, timedelta

from sqlalchemy import select

from app.db import Base, SessionLocal, engine
from app.models import Event, Role, User
from app.security import hash_password

DEMO_EVENTS = [
    ("Semana de Tecnologia", "Palestra", "Auditório A", 2, 19, 3, 120),
    ("Workshop de UX Design", "Workshop", "Laboratório 4", 4, 14, 2, 30),
    ("Prova de Cálculo II", "Prova", "Sala 203", 6, 8, 2, None),
    ("Sarau da Primavera", "Cultural", "Pátio central", 9, 18, 3, None),
    ("Reunião com a coordenação", "Reunião", "Sala da coordenação", 12, 10, 1, 15),
    ("Torneio de Vôlei", "Esportes", "Quadra coberta", 16, 9, 4, 48),
    ("Feira de Estágios", "Aviso", "Hall de entrada", -5, 13, 5, None),
]


def create_admin(name: str, email: str, password: str) -> None:
    Base.metadata.create_all(engine)
    email = email.strip().lower()
    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.email == email))
        if user is None:
            user = User(name=name, email=email, password_hash=hash_password(password))
            db.add(user)
        user.role = Role.admin
        db.commit()
    print(f"Admin ready: {email}")


def seed_demo() -> None:
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        admin = db.scalar(select(User).where(User.role == Role.admin))
        if admin is None:
            print("Create an admin first.")
            return
        today = datetime.now(UTC).astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
        for title, category, location, days, hour, duration, capacity in DEMO_EVENTS:
            starts_at = today + timedelta(days=days, hours=hour)
            db.add(
                Event(
                    title=title,
                    description=f"{title}: participe e confirme sua presença pelo Avisaí!",
                    category=category,
                    location=location,
                    starts_at=starts_at,
                    ends_at=starts_at + timedelta(hours=duration),
                    capacity=capacity,
                    author_id=admin.id,
                )
            )
        db.commit()
    print(f"{len(DEMO_EVENTS)} demo events created.")


if __name__ == "__main__":
    command = sys.argv[1] if len(sys.argv) > 1 else None
    if command == "create-admin" and len(sys.argv) == 5:
        create_admin(*sys.argv[2:])
    elif command == "seed-demo":
        seed_demo()
    else:
        print(__doc__)
        sys.exit(1)
