from pydantic import BaseModel

from app.catalog import Area


class AreaOut(BaseModel):
    value: Area
    label: str


class CourseOut(BaseModel):
    name: str
    area: Area


class CatalogOut(BaseModel):
    areas: list[AreaOut]
    courses: list[CourseOut]
