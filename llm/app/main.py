from __future__ import annotations

from typing import Annotated, TYPE_CHECKING

from fastapi import FastAPI, UploadFile, Request, Form, Query
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

from qdrant_client import models as qdrant_models

from llama_index.core.response_synthesizers import ResponseMode

from .db import vector_index, qdrant_client
from .exceptions import InvalidDocumentException, LLMNotAvailableException
from .preprocessing import pipeline
from . import config
from . import llm
from . import utils
from . import models as md

if TYPE_CHECKING:
    from llama_index.core import Document

app = FastAPI(
    title="llm-bot",
    description="LLM which answers questions using the information uploaded by the user"
)

# This is a temporal solution. This API should not be contacted directly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(InvalidDocumentException)
async def invalid_file_exception_handler(request: Request, exc: InvalidDocumentException):
    return JSONResponse(
        status_code=404,
        content={"detail": str(exc)}
    )


@app.exception_handler(LLMNotAvailableException)
async def invalid_file_exception_handler(request: Request, exc: LLMNotAvailableException):
    return JSONResponse(
        status_code=503,
        content={
            "detail": "The LLM is in the process of generating text and is not available"}
    )


@app.post("/docs/{protocol_id}")
def create_doc(
    protocol_id: int,
    docs: list[UploadFile],
    docs_ids: Annotated[list[str], Form(default_factory=list)]
):

    files = [utils.file_upload_to_node_file(doc) for doc in docs]
    for file, doc_id in zip(files, docs_ids):
        file.id = doc_id

    documents: list[Document] = []

    # Extract llama index documents and save the id for each document
    for file in files:
        document = utils.from_file_to_llama_index_document(
            file,
            metadata={
                "protocol_id": protocol_id,
                "filename": file.filename
            }
        )
        documents.append(document)

    for document in documents:
        document.excluded_embed_metadata_keys = ["protocol_id"]
        document.excluded_llm_metadata_keys = ["protocol_id"]

    nodes = pipeline.run(documents=documents)
    vector_index.insert_nodes(nodes)

    return [md.Document(id=document.doc_id, filename=document.metadata["filename"]) for document in documents]


@app.delete("/docs/{protocol_id}/{doc_id}")
def delete_doc(
    protocol_id: int,
    doc_id: str
):
    qdrant_client.delete(
        collection_name=config.MAIN_COLLECTION_NAME,
        points_selector=qdrant_models.FilterSelector(
            filter=qdrant_models.Filter(
                must=[
                    qdrant_models.FieldCondition(
                        key="protocol_id",
                        match=qdrant_models.MatchValue(value=protocol_id),
                    ),
                    qdrant_models.FieldCondition(
                        key="doc_id",
                        match=qdrant_models.MatchValue(value=doc_id),
                    )
                ],
            )
        )
    )


@app.delete("/docs/{protocol_id}")
def delete_all_docs(protocol_id: int):
    qdrant_client.delete(
        collection_name=config.MAIN_COLLECTION_NAME,
        points_selector=qdrant_models.FilterSelector(
            filter=qdrant_models.Filter(
                must=[
                    qdrant_models.FieldCondition(
                        key="protocol_id",
                        match=qdrant_models.MatchValue(value=protocol_id),
                    )
                ],
            )
        )
    )


@app.post("/llm/generate")
def generate_answer(
    prompt: md.Prompt,
    protocol_id: Annotated[int | None, Query(alias="protocol")] = None,
):
    if protocol_id is not None:
        streaming_response = llm.query(
            prompt=prompt.prompt,
            protocol_id=protocol_id,
            response_mode=ResponseMode.COMPACT,
            similarity_top_k=4
        )
    else:
        streaming_response = llm.complete(prompt.prompt)
    return StreamingResponse(streaming_response, media_type="application/x-ndjson")
