from __future__ import annotations

from typing import Annotated
from sqlalchemy.orm import Session

from fastapi import FastAPI, Depends, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from fastapi.middleware.cors import CORSMiddleware

from .models import Protocol, ProtocolCreate, ProtocolSummary, NodeResource
from .db import SessionLocal
from .exceptions import InvalidProtocolException

from . import utils
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

# TODO: delete this. This is only for testing purposes
app.mount("/static", StaticFiles(directory="env"), name="static")


def get_session() -> Session:
    with SessionLocal() as session:
        return session


# TODO: handle InvalidFileException
@app.exception_handler(InvalidProtocolException)
async def invalid_protocol_exception_handler(request: Request, exc: InvalidProtocolException):
    return JSONResponse(
        status_code=409,
        content={"detail": str(exc)}
    )


@app.get("/protocols/{protocol_id}/nodes")
def get_nodes(session: Annotated[Session, Depends(get_session)], protocol_id: int):
    return crud.get_nodes(session, protocol_id)

@app.get("/protocols/{protocol_id}/nodes/{node_id}/resources", response_model=list[NodeResource])
def get_node_resources(
    session: Annotated[Session, Depends(get_session)],
    protocol_id: int,
    node_id: str
):
    result = crud.get_node_resources(session, protocol_id, node_id)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Protocol with id {protocol_id} does not have a node with id {node_id}"
        )
    return result

@app.post("/protocols/{protocol_id}/nodes/{node_id}/resources")
def create_node_resource(
    session: Annotated[Session, Depends(get_session)],
    files: list[UploadFile],
    protocol_id: int,
    node_id: str
) -> list[NodeResource]:

    # TODO: check actual content (mime sniffing, what the command file does)
    node_files = [utils.file_upload_to_node_file(file) for file in files]

    result = crud.create_node_resources(
        session, protocol_id, node_id, node_files)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Protocol with id {protocol_id} does not have a node with id {node_id}"
        )
    return result


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
