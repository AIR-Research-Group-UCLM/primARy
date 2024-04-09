from __future__ import annotations

from pydantic import BaseModel as PydanticBaseModel, ConfigDict
from pydantic import alias_generators


class BaseModel(PydanticBaseModel):
    model_config = ConfigDict(
        alias_generator=alias_generators.to_camel,
        populate_by_name=True,
        from_attributes=True
    )

class Document(BaseModel):
    id: str
    filename: str

class Prompt(BaseModel):
    prompt: str