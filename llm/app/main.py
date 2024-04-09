from __future__ import annotations

from typing import Annotated, TYPE_CHECKING
import json

from fastapi import FastAPI, UploadFile, Request, Query, Depends
from fastapi.responses import JSONResponse, StreamingResponse

from qdrant_client import models as qdrant_models

from llama_index.core.response_synthesizers import ResponseMode

from .db import vector_index, qdrant_client, MAIN_COLLECTION_NAME
from .exceptions import InvalidDocumentException
from .preprocessing import pipeline
from . import llm
from . import utils
from . import models as md

if TYPE_CHECKING:
    from llama_index.core import Document

app = FastAPI(
    title="llm-bot",
    description="LLM which answers questions using the information uploaded by the user"
)


@app.exception_handler(InvalidDocumentException)
async def invalid_file_exception_handler(request: Request, exc: InvalidDocumentException):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)}
    )


@app.post("/docs/{protocol_id}", response_model=list[md.Document])
def create_doc(
    protocol_id: int,
    docs: list[UploadFile],
    random_id: bool = False
):
    # TODO: find the way of properly documenting the following comment
    # If random_id is set to true, the document id is calculated randomly.
    # Otherwise, the filename without the extension serves as the id

    files = [utils.file_upload_to_node_file(doc) for doc in docs]
    documents: list[Document] = []
    return_documents = list[md.Document] = []

    # Extract llama index documents and save the id for each document
    for file in files:
        filename = f"{file.name}.{file.extension}"
        new_documents = utils.from_file_to_llama_index_document(
            file,
            random_id=random_id,
            metadata={
                "protocol_id": protocol_id,
                "filename": f"{file.name}.{file.extension}"
            }
        )
        return_documents.append(md.Document(
            id=new_documents[0].doc_id, filename=filename))

    for document in documents:
        document.excluded_embed_metadata_keys = ["protocol_id"]
        document.excluded_llm_metadata_keys = ["protocol_id"]

    nodes = pipeline.run(documents=documents)
    vector_index.insert_nodes(nodes)

    return return_documents


@app.delete("/docs/{protocol_id}/{doc_id}")
def delete_doc(
    protocol_id: int,
    doc_id: str
):
    qdrant_client.delete(
        collection_name=MAIN_COLLECTION_NAME,
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
        collection_name=MAIN_COLLECTION_NAME,
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
    protocol_id: Annotated[int, Query(alias="protocol")],
    prompt: md.Prompt
):
    streaming_response = llm.query(
        prompt=prompt.prompt,
        protocol_id=protocol_id,
        response_mode=ResponseMode.GENERATION
    )
    return StreamingResponse(streaming_response, media_type="application/x-ndjson")
