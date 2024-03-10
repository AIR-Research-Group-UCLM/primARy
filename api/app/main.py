from __future__ import annotations

from typing import Annotated
from sqlalchemy.orm import Session

from fastapi import FastAPI, Depends, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse

from fastapi.middleware.cors import CORSMiddleware

from .models import Protocol, ProtocolCreate, ProtocolSummary
from .db import SessionLocal
from .exceptions import InvalidProtocolException

from . import crud

app = FastAPI(
    title="primARy",
    description="Services to assist healthcare professionals"
)

# This is a temporal solution
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_session() -> Session:
    with SessionLocal() as session:
        return session


@app.exception_handler(InvalidProtocolException)
async def invalid_protocol_exception_handler(request: Request, exc: InvalidProtocolException):
    return JSONResponse(
        status_code=409,
        content={"detail": str(exc)}
    )


@app.get("/protocols/{protocol_id}/nodes")
def get_nodes(session: Annotated[Session, Depends(get_session)], protocol_id: int):
    return crud.get_nodes(session, protocol_id)


@app.post("/protocols/{protocol_id}/nodes/{node_id}/resources")
def create_node_resource(protocol_id: int, node_id: str, files: list[UploadFile]):
    print(files)


@app.get("/protocols", response_model=list[ProtocolSummary])
def get_protocols(session: Annotated[Session, Depends(get_session)]):
    return crud.get_protocols(session)


@app.get("/protocols/{protocol_id}", response_model=Protocol)
def get_protocol(session: Annotated[Session, Depends(get_session)], protocol_id: int):
    protocol = crud.get_protocol(session, protocol_id)
    if protocol is None:
        raise HTTPException(status_code=404, detail="Protocol not found")
    return protocol


@app.put("/protocols/{protocol_id}")
def update_protocol(
    session: Annotated[Session, Depends(get_session)],
    protocol_id: int,
    protocol: ProtocolCreate
):
    success = crud.update_protocol(session, protocol_id, protocol)
    if not success:
        raise HTTPException(status_code=404, detail="Protocol not found")


@app.post("/protocols", response_model=ProtocolSummary)
def create_protocol(session: Annotated[Session, Depends(get_session)], protocol: ProtocolCreate):
    return crud.create_protocol(session, protocol)


@app.delete("/protocols/{protocol_id}")
def delete_protocol(session: Annotated[Session, Depends(get_session)], protocol_id: int):
    success = crud.delete_protocol(session, protocol_id)
    if not success:
        raise HTTPException(status_code=404, detail="Protocol not found")
