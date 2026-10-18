from datetime import datetime

from pydantic import BaseModel

from app.models import AttendanceStatus
from app.schemas.user import AuthorOut


class AttendanceIn(BaseModel):
    status: AttendanceStatus


class AttendeeOut(BaseModel):
    user: AuthorOut
    email: str
    course: str | None
    status: AttendanceStatus
    updated_at: datetime
