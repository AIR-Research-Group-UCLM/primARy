from __future__ import annotations

from typing import TYPE_CHECKING

import sqlalchemy as sa

from . import schemas as sc
from . import models as md

if TYPE_CHECKING:
    from sqlalchemy.orm import Session


def node_to_schema(node: md.Node):
    return {
        "id": node.id,
        "name": node.data.name,
        "description": node.data.description,
        "pos_x": node.position.x,
        "pos_y": node.position.y,
    }

# TODO: Add a sort of pagination


def get_protocols(session: Session):
    query = sa.select(sc.Protocol.id, sc.Protocol.name)
    result = session.execute(query)
    return result.mappings()


def get_protocol(session: Session, protocol_id: int) -> sc.Protocol:
    query = sa.select(sc.Protocol).where(sc.Protocol.id == protocol_id)
    result = session.execute(query).first()
    if result is not None:
        result = result[0]
    return result


def create_protocol(session: Session, protocol: md.ProtocolCreate) -> md.ProtocolSummary:
    insert_protocol = sa.insert(sc.Protocol).values(
        name=protocol.name
    ).returning(sc.Protocol.id)

    protocol_id = session.execute(insert_protocol).one()[0]
    if len(protocol.nodes) != 0:
        session.execute(
            sa.insert(sc.Node),
            [{"protocol_id": protocol_id, **
                node_to_schema(node)} for node in protocol.nodes]
        )
    if len(protocol.edges) != 0:
        session.execute(
            sa.insert(sc.Edge),
            [{"protocol_id": protocol_id, **edge.model_dump()}
             for edge in protocol.edges]
        )

    session.commit()
    return md.ProtocolSummary(
        id=protocol_id,
        name=protocol.name
    )
