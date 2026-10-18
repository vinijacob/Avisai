from pydantic import BaseModel, Field

from app.schemas.common import Course, Email, TrimmedStr


class RegisterIn(BaseModel):
    name: TrimmedStr = Field(min_length=2, max_length=80)
    email: Email
    password: str = Field(min_length=8, max_length=128)
    course: Course


class LoginIn(BaseModel):
    email: Email
    password: str = Field(max_length=128)
