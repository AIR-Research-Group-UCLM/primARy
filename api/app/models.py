from __future__ import annotations

from pydantic import BaseModel as PydanticBaseModel, Field, ConfigDict
from pydantic import alias_generators


class BaseModel(PydanticBaseModel):
    model_config = ConfigDict(
        alias_generator=alias_generators.to_camel,
        populate_by_name=True,
        from_attributes=True
    )


class Position(BaseModel):
    x: float
    y: float


class NodeData(BaseModel):
    name: str = Field(min_length=1)
    description: str = Field(min_length=1)


class Node(BaseModel):
    id: str = Field(min_length=1)
    position: Position
    data: NodeData


class NodeResource(BaseModel):
    id: int
    filename: str
    name: str
    size: int


class Edge(BaseModel):
    source: str = Field(min_length=1)
    target: str = Field(min_length=1)
    label: str | None
    source_handle: str
    target_handle: str


class ProtocolCreate(BaseModel):
    name: str = Field(min_length=1)
    initial_node_id: str | None = None
    nodes: list[Node] = []
    edges: list[Edge] = []


class ProtocolSummary(BaseModel):
    id: int
    name: str = Field(min_length=1)


class Protocol(BaseModel):
    id: int
    initial_node_id: str = Field(min_length=1)
    name: str = Field(min_length=1)
    nodes: list[Node]
    edges: list[Edge]


class PatchNodeResource(BaseModel):
    name: str = Field(min_length=1)
