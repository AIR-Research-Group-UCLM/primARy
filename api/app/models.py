from pydantic import BaseModel as PydanticBaseModel, Field, ConfigDict
from pydantic import alias_generators

class BaseModel(PydanticBaseModel):
    model_config = ConfigDict(alias_generator=alias_generators.to_camel, populate_by_name=True)

class Position(BaseModel):
    x: float
    y: float

class Node(BaseModel):
    id: int = Field(ge=0)
    position: Position
    title: str = Field(min_length=1)
    description: str = Field(min_length=1)

class Edge(BaseModel):
    id: int = Field(ge=0)
    source: int = Field(ge=0)
    target: int = Field(ge=0)
    label: str | None
    source_handle: str
    target_handle: str

class ProtocolCreate(BaseModel):
    title: str = Field(min_length=1)
    nodes: list[Node] = []
    edges: list[Node] = []

class ProtocolSummary(BaseModel):
    id: int = Field(ge=0)
    title: str = Field(min_length=1)

class Protocol(BaseModel):
    id: int = Field(ge=0)
    title: str = Field(min_length=1)
    nodes: list[Node]
    edges: list[Edge]
