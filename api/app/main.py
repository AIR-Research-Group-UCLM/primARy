from __future__ import annotations

from typing import Annotated
from sqlalchemy.orm import Session

from fastapi import FastAPI, Depends

from .models import Protocol, ProtocolCreate, ProtocolSummary, Node, Edge, Position, NodeData
from .db import SessionLocal

from . import crud

app = FastAPI(
    title="primARy",
    description="Services to assist healthcare professionals"
)

nodes = [
    Node(id="0", position=Position(x=-147.92721663945105, y=-172.05908143665363),
         data=NodeData(name="Patient encounter", description="Say hello to the patient")),
    Node(id="1", position=Position(x=-178.61448169456492, y=32.33052768517064),
         data=NodeData(name="Hx of BMI >= 25?", description="Has the patient had a BMI greater than 25?")),
    Node(id="2", position=Position(x=-259.1331589740406, y=204.18612519118378),
         data=NodeData(name="Diagnosis", description="You probably don't have overweight.")),
    Node(id="3", position=Position(x=157.60418721966138, y=173.7673407974829),
         data=NodeData(name="Measure BMI", description="Start measuring the BMI"))
]

edges = [
    Edge(source="0", source_handle="bottom",
         target="1", target_handle="top", label=None),
    Edge(source="1", source_handle="bottom",
         target="2", target_handle="top", label="Yes"),
    Edge(source="1", source_handle="right",
         target="3", target_handle="left", label="No"),
]

new_protocol = ProtocolCreate(
    name="Overweight disease",
    nodes=nodes,
    edges=edges
)

def get_session() -> Session:
    with SessionLocal() as session:
        return session


@app.get("/protocols", response_model=list[ProtocolSummary])
def get_protocols(session: Annotated[Session, Depends(get_session)]):
    return crud.get_protocols(session)


@app.get("/protocols/{protocol_id}", response_model=Protocol)
def get_protocol(session: Annotated[Session, Depends(get_session)], protocol_id: int):
    protocol = crud.get_protocol(session, protocol_id)
    print(protocol.nodes)

@app.put("/protocols/{protocol_id}")
def update_protocol(
    session: Annotated[Session, Depends(get_session)],
    protocol_id: int,
    protocol: ProtocolCreate
):
    pass


@app.post("/protocols", response_model=ProtocolSummary)
def create_protocol(session: Annotated[Session, Depends(get_session)], protocol: ProtocolCreate):
    return crud.create_protocol(session, new_protocol)


@app.delete("/protocols/{protocol_id}")
def delete_protocol(protocol_id: int):
    pass
