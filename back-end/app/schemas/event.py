from datetime import datetime

from pydantic import BaseModel, Field, model_validator

from app.catalog import Area
from app.models import AttendanceStatus
from app.schemas.common import ORMModel, TrimmedStr
from app.schemas.user import AuthorOut


class EventIn(BaseModel):
    title: TrimmedStr = Field(min_length=3, max_length=120)
    description: TrimmedStr = Field(default="", max_length=5000)
    location: TrimmedStr | None = Field(default=None, max_length=120)
    category: TrimmedStr | None = Field(default=None, max_length=40)
    area: Area | None = None
    starts_at: datetime
    ends_at: datetime | None = None
    capacity: int | None = Field(default=None, ge=1, le=100_000)

    @model_validator(mode="after")
    def check_dates(self) -> "EventIn":
        if self.starts_at.tzinfo is None:
            raise ValueError("starts_at must include a timezone")
        if self.ends_at and self.ends_at <= self.starts_at:
            raise ValueError("O término deve ser depois do início.")
        self.location = self.location or None
        self.category = self.category or None
        return self


class EventOut(ORMModel):
    id: int
    title: str
    description: str
    location: str | None
    category: str | None
    area: Area | None
    starts_at: datetime
    ends_at: datetime | None
    capacity: int | None
    author: AuthorOut
    created_at: datetime
    going_count: int = 0
    my_status: AttendanceStatus | None = None
    can_attend: bool = True
