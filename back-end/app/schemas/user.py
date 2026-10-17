from datetime import datetime

from pydantic import BaseModel

from app.models import Role
from app.schemas.common import ORMModel


class UserOut(ORMModel):
    id: int
    name: str
    email: str
    role: Role
    created_at: datetime


class AuthorOut(ORMModel):
    id: int
    name: str


class RoleIn(BaseModel):
    role: Role
