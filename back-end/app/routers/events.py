from datetime import UTC, datetime
from typing import Literal

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import joinedload

from app.deps import AdminUser, CurrentUser, DbSession
from app.models import Attendance, AttendanceStatus, Event, User
from app.schemas import AttendanceIn, AttendeeOut, AuthorOut, EventIn, EventOut

router = APIRouter(prefix="/events", tags=["events"])


def _event_query(user: User) -> Select:
    going_count = (
        select(func.count(Attendance.id))
        .where(Attendance.event_id == Event.id, Attendance.status == AttendanceStatus.going)
        .scalar_subquery()
    )
    my_status = (
        select(Attendance.status)
        .where(Attendance.event_id == Event.id, Attendance.user_id == user.id)
        .scalar_subquery()
    )
    return select(Event, going_count, my_status).options(joinedload(Event.author))


def _to_out(event: Event, going_count: int, my_status: AttendanceStatus | None) -> EventOut:
    out = EventOut.model_validate(event)
    out.going_count = going_count
    out.my_status = my_status
    return out


def _get_event_out(db: DbSession, event_id: int, user: User) -> EventOut:
    row = db.execute(_event_query(user).where(Event.id == event_id)).first()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Evento não encontrado.")
    return _to_out(*row)


@router.get("", response_model=list[EventOut])
def list_events(
    db: DbSession,
    user: CurrentUser,
    scope: Literal["upcoming", "past"] = "upcoming",
    q: str | None = None,
) -> list[EventOut]:
    now = datetime.now(UTC)
    finishes_at = func.coalesce(Event.ends_at, Event.starts_at)
    stmt = _event_query(user)
    if scope == "upcoming":
        stmt = stmt.where(finishes_at >= now).order_by(Event.starts_at.asc())
    else:
        stmt = stmt.where(finishes_at < now).order_by(Event.starts_at.desc())
    if q and q.strip():
        pattern = f"%{q.strip()}%"
        stmt = stmt.where(
            or_(Event.title.ilike(pattern), Event.description.ilike(pattern), Event.category.ilike(pattern))
        )
    return [_to_out(*row) for row in db.execute(stmt.limit(200)).all()]


@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: int, db: DbSession, user: CurrentUser) -> EventOut:
    return _get_event_out(db, event_id, user)


@router.post("", response_model=EventOut, status_code=status.HTTP_201_CREATED)
def create_event(data: EventIn, db: DbSession, admin: AdminUser) -> EventOut:
    event = Event(**data.model_dump(), author_id=admin.id)
    db.add(event)
    db.commit()
    return _get_event_out(db, event.id, admin)


@router.put("/{event_id}", response_model=EventOut)
def update_event(event_id: int, data: EventIn, db: DbSession, admin: AdminUser) -> EventOut:
    event = db.get(Event, event_id)
    if event is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Evento não encontrado.")
    for field, value in data.model_dump().items():
        setattr(event, field, value)
    db.commit()
    return _get_event_out(db, event.id, admin)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: int, db: DbSession, _: AdminUser) -> None:
    event = db.get(Event, event_id)
    if event is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Evento não encontrado.")
    db.delete(event)
    db.commit()


@router.put("/{event_id}/attendance", response_model=EventOut)
def set_attendance(event_id: int, data: AttendanceIn, db: DbSession, user: CurrentUser) -> EventOut:
    event = db.get(Event, event_id, with_for_update=True)
    if event is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Evento não encontrado.")

    attendance = db.scalar(
        select(Attendance).where(Attendance.event_id == event_id, Attendance.user_id == user.id)
    )
    joining = data.status == AttendanceStatus.going and (
        attendance is None or attendance.status != AttendanceStatus.going
    )
    if joining and event.capacity is not None:
        going = db.scalar(
            select(func.count(Attendance.id)).where(
                Attendance.event_id == event_id, Attendance.status == AttendanceStatus.going
            )
        )
        if going >= event.capacity:
            raise HTTPException(status.HTTP_409_CONFLICT, "Este evento já está lotado.")

    if attendance is None:
        db.add(Attendance(event_id=event_id, user_id=user.id, status=data.status))
    else:
        attendance.status = data.status
    db.commit()
    return _get_event_out(db, event_id, user)


@router.delete("/{event_id}/attendance", response_model=EventOut)
def clear_attendance(event_id: int, db: DbSession, user: CurrentUser) -> EventOut:
    attendance = db.scalar(
        select(Attendance).where(Attendance.event_id == event_id, Attendance.user_id == user.id)
    )
    if attendance is not None:
        db.delete(attendance)
        db.commit()
    return _get_event_out(db, event_id, user)


@router.get("/{event_id}/attendees", response_model=list[AttendeeOut])
def list_attendees(event_id: int, db: DbSession, _: AdminUser) -> list[AttendeeOut]:
    rows = db.scalars(
        select(Attendance)
        .where(Attendance.event_id == event_id)
        .options(joinedload(Attendance.user))
        .order_by(Attendance.status, Attendance.updated_at.desc())
    ).all()
    return [
        AttendeeOut(
            user=AuthorOut.model_validate(row.user),
            email=row.user.email,
            status=row.status,
            updated_at=row.updated_at,
        )
        for row in rows
    ]
