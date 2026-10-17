from __future__ import annotations

import enum
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.event import Event
    from app.models.user import User


class AttendanceStatus(enum.StrEnum):
    going = "going"
    not_going = "not_going"


class Attendance(TimestampMixin, Base):
    __tablename__ = "attendances"
    __table_args__ = (UniqueConstraint("user_id", "event_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), index=True)
    status: Mapped[AttendanceStatus] = mapped_column(Enum(AttendanceStatus, name="attendance_status"))

    user: Mapped[User] = relationship()
    event: Mapped[Event] = relationship(back_populates="attendances")
