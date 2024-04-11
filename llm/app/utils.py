from __future__ import annotations

from typing import BinaryIO, Any, TYPE_CHECKING
from dataclasses import dataclass

from .exceptions import InvalidDocumentException
from . import preprocessing

if TYPE_CHECKING:
    from fastapi import UploadFile
    from llama_index.core import Document

import copy

# TODO: All of this code should be in its own module because it is exactly the same
# as the one in api


@dataclass
class FileWithExtension:
    name: str
    extension: str
    size: int
    blob: BinaryIO
    id: str | None = None

    @property
    def filename(self):
        return f"{self.name}.{self.extension}"


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
    metadata: dict[str, Any] | None = None
) -> Document:
    if file.extension == "pdf":
        document = preprocessing.pdf_to_llama_index_document(file.blob)
    elif file.extension == "txt":
        document = preprocessing.flat_to_llama_index_document(file.blob)
    else:
        raise InvalidDocumentException(
            f"File extension {file.extension} not supported")

    if file.id is not None:
        document.doc_id = file.id

    document.metadata.update(metadata)
    return document
