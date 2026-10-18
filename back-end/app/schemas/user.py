from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator

from app.catalog import Area
from app.models import Role, Shift
from app.schemas.common import Course, ORMModel, TrimmedStr

MIN_AGE = 14
MAX_AGE = 100


class UserOut(ORMModel):
    id: int
    name: str
    email: str
    role: Role
    course: str | None
    area: Area | None
    semester: int | None
    shift: Shift | None
    birth_date: date | None
    age: int | None
    registration: str | None
    phone: str | None
    bio: str
    created_at: datetime


class AuthorOut(ORMModel):
    id: int
    name: str


class RoleIn(BaseModel):
    role: Role


class ProfileIn(BaseModel):
    name: TrimmedStr = Field(min_length=2, max_length=80)
    course: Course | None = None
    semester: int | None = Field(default=None, ge=1, le=12)
    shift: Shift | None = None
    birth_date: date | None = None
    registration: TrimmedStr | None = Field(default=None, max_length=20)
    phone: TrimmedStr | None = Field(default=None, max_length=20)
    bio: TrimmedStr = Field(default="", max_length=280)

    @field_validator("course", "registration", "phone", mode="before")
    @classmethod
    def blank_to_none(cls, value: object) -> object:
        return None if isinstance(value, str) and not value.strip() else value

    @field_validator("birth_date")
    @classmethod
    def check_birth_date(cls, value: date | None) -> date | None:
        if value is None:
            return None
        today = date.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if not MIN_AGE <= age <= MAX_AGE:
            raise ValueError(f"A idade deve estar entre {MIN_AGE} e {MAX_AGE} anos.")
        return value
