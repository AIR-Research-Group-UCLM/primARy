from __future__ import annotations

import io

from typing import BinaryIO, TYPE_CHECKING
from dataclasses import dataclass

from . import models as md
from .exceptions import InvalidFileException

if TYPE_CHECKING:
    from fastapi import UploadFile
    from . import schemas as sc


@dataclass
class FileWithExtension:
    name: str
    extension: str
    size: int
    mime: str
    blob: BinaryIO

    @property
    def filename(self) -> str:
        return f"{self.name}.{self.extension}"

    def wrapped_blob(self):
        """This sets the stream offset to 0 (the beginning) and returns it"""
        self.blob.seek(0)
        return self.blob


def split_extension(filename: str):
    delimiter_index = filename.rfind(".")
    if delimiter_index == -1 or delimiter_index == len(filename) - 1:
        return filename, ""
    return filename[:delimiter_index], filename[delimiter_index + 1:]


def file_upload_to_node_file(file: UploadFile) -> FileWithExtension:
    # TODO: perform mime sniffing
    name, extension = split_extension(file.filename)
    if extension == "":
        raise InvalidFileException(
            f"{file.filename} does not contain any extension")
    if name == "":
        raise InvalidFileException(
            f"The uploaded file does not have a name")

    return FileWithExtension(
        name=name,
        extension=extension,
        size=file.size,
        blob=file.file,
        mime=file.content_type
    )


def node_to_schema(node: md.Node) -> sc.Node:
    return {
        "id": node.id,
        "name": node.data.name,
        "description": node.data.description,
        "pos_x": node.position.x,
        "pos_y": node.position.y,
    }


def schema_to_node(node: sc.Node) -> md.Node:
    return md.Node(
        id=node.id,
        position=md.Position(
            x=node.pos_x,
            y=node.pos_y
        ),
        data=md.NodeData(
            name=node.name,
            description=node.description
        )
    )
