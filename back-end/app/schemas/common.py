from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, EmailStr

from app.catalog import COURSES


def _check_course(value: str) -> str:
    value = value.strip()
    if value not in COURSES:
        raise ValueError("Curso inválido.")
    return value


TrimmedStr = Annotated[str, AfterValidator(str.strip)]
Email = Annotated[EmailStr, AfterValidator(lambda value: value.strip().lower())]
Course = Annotated[str, AfterValidator(_check_course)]


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
