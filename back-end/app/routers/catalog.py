from fastapi import APIRouter

from app.catalog import AREA_LABELS, COURSES
from app.schemas import AreaOut, CatalogOut, CourseOut

router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get("", response_model=CatalogOut)
def get_catalog() -> CatalogOut:
    return CatalogOut(
        areas=[AreaOut(value=area, label=label) for area, label in AREA_LABELS.items()],
        courses=[CourseOut(name=name, area=area) for name, area in COURSES.items()],
    )
