from __future__ import annotations

import enum
from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.catalog import COURSES, Area
from app.db import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.event import Event


class Role(enum.StrEnum):
    admin = "admin"
    student = "student"


class Shift(enum.StrEnum):
    morning = "morning"
    afternoon = "afternoon"
    evening = "evening"
    full_time = "full_time"


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(Enum(Role, name="user_role"), default=Role.student)

    course: Mapped[str | None] = mapped_column(String(80))
    semester: Mapped[int | None]
    shift: Mapped[Shift | None] = mapped_column(Enum(Shift, native_enum=False, length=20))
    birth_date: Mapped[date | None] = mapped_column(Date)
    registration: Mapped[str | None] = mapped_column(String(20))
    phone: Mapped[str | None] = mapped_column(String(20))
    bio: Mapped[str] = mapped_column(String(280), default="", server_default="")

    events: Mapped[list[Event]] = relationship(back_populates="author")

    @property
    def area(self) -> Area | None:
        return COURSES.get(self.course) if self.course else None

    @property
    def age(self) -> int | None:
        if self.birth_date is None:
            return None
        today = date.today()
        had_birthday = (today.month, today.day) >= (self.birth_date.month, self.birth_date.day)
        return today.year - self.birth_date.year - (0 if had_birthday else 1)
