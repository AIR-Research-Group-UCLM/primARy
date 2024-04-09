from __future__ import annotations

from typing import BinaryIO, Any, TYPE_CHECKING
from dataclasses import dataclass

from .exceptions import InvalidDocumentException
from . import preprocessing

if TYPE_CHECKING:
    from fastapi import UploadFile
    from llama_index.core import Document


# TODO: All of this code should be in its own module because it is exactly the same 
# as the one in api

@dataclass
class FileWithExtension:
    name: str
    extension: str
    size: int
    blob: BinaryIO


def split_extension(filename: str):
    delimiter_index = filename.rfind(".")
    if delimiter_index == -1 or delimiter_index == len(filename) - 1:
        return filename, ""
    return filename[:delimiter_index], filename[delimiter_index + 1:]


def file_upload_to_node_file(file: UploadFile) -> FileWithExtension:
    # TODO: perform mime sniffing
    name, extension = split_extension(file.filename)
    if extension == "":
        raise InvalidDocumentException(
            f"{file.filename} does not contain any extension")
    if name == "":
        raise InvalidDocumentException(
            f"The uploaded file does not have a name")

    return FileWithExtension(
        name=name,
        extension=extension,
        size=file.size,
        blob=file.file
    )

def from_file_to_llama_index_document(
    file: FileWithExtension,
    random_id: bool=False,
    metadata: dict[str, Any] | None=None
) -> list[Document]:
    doc_id = file.name if not random_id else None
    documents: list[Document] = []

    if file.extension == "pdf":
        documents = preprocessing.pdf_to_llama_index_document(file.blob, doc_id)
    elif file.extension == "txt":
        documents = [preprocessing.flat_to_llama_index_document(file.blob, doc_id)]
    else:
        raise InvalidDocumentException(f"File extension {file.extension} not supported")

    for document in documents:
        document.metadata.update(metadata)

    return documents