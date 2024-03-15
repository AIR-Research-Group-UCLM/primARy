from __future__ import annotations

from typing import Annotated
from sqlalchemy.orm import Session

from fastapi import FastAPI, Depends, HTTPException, Request, UploadFile, Body
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from fastapi.middleware.cors import CORSMiddleware

from . import models as md
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


@app.get("/protocols/{protocol_id}/nodes/{node_id}/resources", response_model=list[md.NodeResource])
def get_node_resources(
    session: Annotated[Session, Depends(get_session)],
    protocol_id: int,
    node_id: str
):
    result = crud.get_node_resources(session, protocol_id, node_id)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Node {node_id} not found protocol {protocol_id}"
        )
    return result


# TODO: decide if PUT or UPDATE fit better
@app.patch("/protocols/{protocol_id}/nodes/{node_id}/resources/{resource_id}")
def change_name_resource_name(
    session: Annotated[Session, Depends(get_session)],
    protocol_id: int,
    node_id: str,
    resource_id: int,
    patch: md.PatchNodeResource
):
    success = crud.change_name_resource_name(
        session, protocol_id, node_id, resource_id, patch)
    if not success:
        raise HTTPException(
            status_code=404,
            detail=f"Node resource '{resource_id}' not found"
        )


@app.delete("/protocols/{protocol_id}/nodes/{node_id}")
def delete_node(
    session: Annotated[Session, Depends(get_session)],
    protocol_id: int,
    node_id: str
):
    success = crud.delete_node(session, protocol_id, node_id)
    if not success:
        raise HTTPException(
            status_code=404,
            detail=f"Node id '{node_id}' not found"
        )

# This is an atomic operation. Either all of them fail or all of them succeed
@app.delete("/protocols/{protocol_id}/nodes")
def delete_nodes(
    session: Annotated[Session, Depends(get_session)],
    protocol_id: int,
    nodes_ids: Annotated[list[str], Body()] = []
):
    success = crud.delete_nodes(session, protocol_id, nodes_ids)
    if not success:
        raise HTTPException(
            status_code=404,
            detail=f"Some node ids do not exist"
        )

# This is an atomic operation. Either all of them fail or all of them succeed
@app.delete("/protocols/{protocol_id}/edges")
def delete_edges(
    session: Annotated[Session, Depends(get_session)],
    protocol_id: int,
    edges_ids: Annotated[list[str], Body()] = []
):
    success = crud.delete_edges(session, protocol_id, edges_ids)
    if not success:
        raise HTTPException(
            status_code=404,
            detail=f"Some edges ids do not exist"
        )

@app.post("/protocols/{protocol_id}/nodes")
def create_node(
    session: Annotated[Session, Depends(get_session)],
    protocol_id: int,
    node: md.Node
):
    # Catch integrity exceptions
    crud.create_node(session, protocol_id, node)


@app.delete("/protocols/{protocol_id}/nodes/{node_id}/resources/{resource_id}")
def delete_node_resources(
    session: Annotated[Session, Depends(get_session)],
    protocol_id: int,
    node_id: str,
    resource_id: int
):
    success = crud.delete_node_resource(
        session, protocol_id, node_id, resource_id
    )
    if not success:
        raise HTTPException(
            status_code=404,
            detail=f"Node resource '{resource_id}' not found"
        )


@app.post("/protocols/{protocol_id}/nodes/{node_id}/resources")
def create_node_resource(
    session: Annotated[Session, Depends(get_session)],
    files: list[UploadFile],
    protocol_id: int,
    node_id: str
) -> list[md.NodeResource]:

    # TODO: check actual content (mime sniffing, what the unix command file does)
    # TODO: check filename is nonempty
    node_files = [utils.file_upload_to_node_file(file) for file in files]

    result = crud.create_node_resources(
        session, protocol_id, node_id, node_files)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Node {node_id} not found protocol {protocol_id}"
        )
    return result


@app.get("/protocols", response_model=list[md.ProtocolSummary])
def get_protocols(session: Annotated[Session, Depends(get_session)]):
    return crud.get_protocols(session)


@app.get("/protocols/{protocol_id}", response_model=md.Protocol)
def get_protocol(session: Annotated[Session, Depends(get_session)], protocol_id: int):
    protocol = crud.get_protocol(session, protocol_id)
    if protocol is None:
        raise HTTPException(status_code=404, detail="Protocol not found")
    return protocol


@app.put("/protocols/{protocol_id}")
def update_protocol(
    session: Annotated[Session, Depends(get_session)],
    protocol_id: int,
    protocol: md.ProtocolCreate
):
    success = crud.update_protocol(session, protocol_id, protocol)
    if not success:
        raise HTTPException(status_code=404, detail="Protocol not found")


@app.post("/protocols", response_model=md.ProtocolSummary)
def create_protocol(session: Annotated[Session, Depends(get_session)], protocol: md.ProtocolCreate):
    return crud.create_protocol(session, protocol)


@app.delete("/protocols/{protocol_id}")
def delete_protocol(session: Annotated[Session, Depends(get_session)], protocol_id: int):
    success = crud.delete_protocol(session, protocol_id)
    if not success:
        raise HTTPException(status_code=404, detail="Protocol not found")
