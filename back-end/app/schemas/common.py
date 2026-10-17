from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, EmailStr

TrimmedStr = Annotated[str, AfterValidator(str.strip)]
Email = Annotated[EmailStr, AfterValidator(lambda value: value.strip().lower())]


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
