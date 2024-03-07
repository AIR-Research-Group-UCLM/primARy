from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from . import models as md
    from . import schemas as sc


def node_to_schema(node: md.Node):
    return {
        "id": node.id,
        "name": node.data.name,
        "description": node.data.description,
        "pos_x": node.position.x,
        "pos_y": node.position.y,
    }


def schema_to_node(node: sc.Node):
    return {
        "id": node.id,
        "position": {
            "x": node.pos_x,
            "y": node.pos_y
        },
        "data": {
            "name": node.name,
            "description": node.description
        }
    }
