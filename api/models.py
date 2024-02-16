from pydantic import BaseModel, Field

class Position(BaseModel):
    x: int
    y: int

class Node(BaseModel):
    id: int = Field(gt=0)
    position: Position
    title: str = Field(min_length=1)
    description: str = Field(min_length=1)

# TODO: convert to camel case in the serialization
class Edge(BaseModel):
    source: str
    target: str
    label: str | None
    source_handle: str
    target_handle: str

class ProtocolCreate(BaseModel):
    title: str = Field(min_length=1)
    nodes: list[Node] = []
    edges: list[Node] = []

class ProtocolSummary(BaseModel):
    id: int = Field(gt=0)
    title: str = Field(min_length=1)

class Protocol(BaseModel):
    id: int = Field(gt=0)
    title: str = Field(min_length=1)
    nodes: list[Node]
    edges: list[Edge]
