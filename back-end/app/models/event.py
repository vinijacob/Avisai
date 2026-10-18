from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.catalog import Area
from app.db import Base
from app.models.mixins import TimestampMixin
from app.models.user import Role

if TYPE_CHECKING:
    from app.models.attendance import Attendance
    from app.models.user import User


class Event(TimestampMixin, Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text, default="")
    location: Mapped[str | None] = mapped_column(String(120))
    category: Mapped[str | None] = mapped_column(String(40))
    area: Mapped[Area | None] = mapped_column(Enum(Area, native_enum=False, length=20))
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    capacity: Mapped[int | None]
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))

    author: Mapped[User] = relationship(back_populates="events")
    attendances: Mapped[list[Attendance]] = relationship(
        back_populates="event", cascade="all, delete-orphan", passive_deletes=True
    )

    def is_open_to(self, user: User) -> bool:
        """General events (no area) are open to everyone; restricted ones only to that area."""
        return self.area is None or user.role == Role.admin or user.area == self.area
