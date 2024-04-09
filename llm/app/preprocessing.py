from __future__ import annotations

from typing import BinaryIO, TextIO

from llama_index.core.ingestion import IngestionPipeline
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core import Document

import pypdf

from .embeddings import embedding_model, EMBEDDING_MODEL_MAX_SEQUENCE_LEN

pipeline = IngestionPipeline(
    transformations=[
        SentenceSplitter(
            chunk_size=EMBEDDING_MODEL_MAX_SEQUENCE_LEN,
            chunk_overlap=100
        ),
        embedding_model
    ]
)

# Adapted from
# https://github.com/run-llama/llama_index/blob/main/llama-index-integrations/readers/llama-index-readers-file/llama_index/readers/file/docs/base.py
# The main difference is that this function allows you a byte stream instead of forcing you to use a filesystem
# path, like LlamaIndex does

# NOTE: extracting from a PDF is a hard task because there is not a semantic layer. There is only visual information
# so the text extraction is based on heuristics.

# TODO: check if there is something more sophisticated to extract the text

def pdf_to_llama_index_document(
    stream: BinaryIO,
    doc_id: str | None = None,
) -> list[Document]:
    pdf = pypdf.PdfReader(stream)
    num_pages = len(pdf.pages)

    documents: list[Document] = []
    for page in range(num_pages):
        page_text = pdf.pages[page].extract_text()
        page_label = pdf.page_labels[page]
        document = Document(
            text=page_text,
            metadata={"page_label": page_label}
        )

        documents.append(document)

    if doc_id is not None:
        for document in documents:
            document.doc_id = doc_id

    return documents


def flat_to_llama_index_document(
    stream: TextIO,
    doc_id: str | None=None
) -> Document:
    text = stream.read()
    document = Document(text=text)
    document.doc_id = doc_id
    return Document