from __future__ import annotations

from typing import BinaryIO, TYPE_CHECKING
from dataclasses import dataclass

from . import models as md
if TYPE_CHECKING:
    from . import schemas as sc


@dataclass
class NodeFile:
    filename: str
    size: int
    blob: BinaryIO


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
