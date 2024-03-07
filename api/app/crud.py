from __future__ import annotations

from typing import TYPE_CHECKING

import sqlalchemy as sa

from . import schemas as sc
from . import models as md
from . import utils

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

initial_node = utils.node_to_schema(md.Node(
    id="0",
    position=md.Position(x=0, y=0),
    data=md.NodeData(name="Initial Node",
                     description="Initial Node description")
))


def get_protocols(session: Session):
    query = sa.select(sc.Protocol.id, sc.Protocol.name)
    result = session.execute(query)
    return result.mappings()


def get_protocol(session: Session, protocol_id: int) -> sc.Protocol:
    query = sa.select(sc.Protocol).where(sc.Protocol.id == protocol_id)
    result = session.execute(query).first()
    if result is None:
        return None

    result = result[0]
    return {
        "id": result.id,
        "name": result.name,
        "nodes": [utils.schema_to_node(node) for node in result.nodes],
        "edges": result.edges
    }


def delete_protocol(session: Session, protocol_id: int) -> bool:
    result = session.execute(
        sa.delete(sc.Protocol).where(sc.Protocol.id == protocol_id))
    session.commit()
    return result.rowcount != 0


def update_protocol(session: Session, protocol_id: int, protocol: md.ProtocolCreate) -> bool:
    update_protocol = sa.update(sc.Protocol).where(sc.Protocol.id == protocol_id).values(
        name=protocol.name
    )
    row_count = session.execute(update_protocol).rowcount
    if row_count == 0:
        return False

    session.execute(sa.delete(sc.Node).where(
        sc.Node.protocol_id == protocol_id)
    )

    _insert_nodes_edges(session, protocol_id, protocol.nodes, protocol.edges)

    session.commit()
    return True


def create_protocol(session: Session, protocol: md.ProtocolCreate) -> md.ProtocolSummary:
    insert_protocol = sa.insert(sc.Protocol).values(
        name=protocol.name
    ).returning(sc.Protocol.id)

    protocol_id = session.execute(insert_protocol).one()[0]

    if len(protocol.nodes) == 0:
        session.execute(sa.insert(sc.Node).values(
            protocol_id=protocol_id, **initial_node
        ))
    else:
        _insert_nodes_edges(session, protocol_id,
                            protocol.nodes, protocol.edges)

    session.commit()
    return md.ProtocolSummary(
        id=protocol_id,
        name=protocol.name
    )


def _insert_nodes_edges(
    session: Session,
    protocol_id: int,
    nodes: list[md.Node],
    edges: list[md.Edge]
):
    if len(nodes) != 0:
        session.execute(
            sa.insert(sc.Node),
            [
                {"protocol_id": protocol_id, **utils.node_to_schema(node)} for node in nodes
            ]
        )
    if len(edges) != 0:
        session.execute(
            sa.insert(sc.Edge),
            [
                {"protocol_id": protocol_id, **edge.model_dump()} for edge in edges
            ]
        )
