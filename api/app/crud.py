from __future__ import annotations

from typing import TYPE_CHECKING
import shutil
import os

from pymysql.err import IntegrityError
import sqlalchemy as sa

from . import schemas as sc
from . import models as md
from . import utils
from .exceptions import InvalidProtocolException

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

# TODO: pass this data as an env variable
RESOURCES_PATH = "env/"

initial_node = md.Node(
    id="V1StGXR8_Z5jdHi6B-myT",
    position=md.Position(x=0, y=0),
    data=md.NodeData(name="Initial Node")
)

def create_node(session: Session, protocol_id: int, node: md.Node):
    session.execute(sa.insert(sc.Node).values(
        protocol_id=protocol_id,
        **utils.node_to_schema(node)
    ))
    session.commit()

def get_protocols(session: Session):
    query = sa.select(sc.Protocol.id, sc.Protocol.name)
    result = session.execute(query)
    return result.mappings()

def delete_edges(session: Session, protocol_id: int, edges_ids: list[str]):
    query = sa.delete(sc.Edge).where(
        (sc.Edge.protocol_id == protocol_id) &
        (sc.Edge.id.in_(edges_ids))
    )
    results = session.execute(query)
    if results.rowcount != len(edges_ids):
        return False
    session.commit()
    return True

def delete_nodes(session: Session, protocol_id: int, nodes_ids: list[str]):
    # TODO: Check you are not trying to delete the initial node

    query = sa.delete(sc.Node).where(
        (sc.Node.protocol_id == protocol_id) &
        (sc.Node.id.in_(nodes_ids))
    )
    results = session.execute(query)
    if results.rowcount != len(nodes_ids):
        return False
    session.commit()
    return True

def get_nodes(session: Session, protocol_id: int) -> list[md.Node]:
    query = sa.select(sc.Node).where(sc.Node.protocol_id == protocol_id)
    nodes = session.execute(query).all()
    return [utils.schema_to_node(node[0]) for node in nodes]

def delete_node(session: Session, protocol_id: int, node_id: str):
    result = session.execute(
        sa.delete(sc.Node)
        .where(
            (sc.Node.id == node_id) &
            (sc.Node.protocol_id == protocol_id)
        )
    )
    session.commit()
    return result.rowcount != 0


def delete_node_resource(
    session: Session,
    protocol_id: int,
    node_id: str,
    resource_id: str
):
    result = session.execute(
        sa.delete(sc.NodeResource)
        .where(
            (sc.NodeResource.id == resource_id) &
            (sc.NodeResource.protocol_id == protocol_id) &
            (sc.NodeResource.node_id == node_id)
        )
    )
    # TODO: delete files from filesystem
    session.commit()
    return result.rowcount != 0


def get_node_resources(session: Session, protocol_id: int, node_id: str) -> list[md.NodeResource]:
    node_query = sa.select(sc.Node.id).where(
        (sc.Node.protocol_id == protocol_id) & (sc.Node.id == node_id)
    )
    result = session.execute(node_query).first()
    if result is None:
        return None

    resource_query = (
        sa.select(
            sc.NodeResource.id, sc.NodeResource.name, sc.NodeResource.extension, sc.NodeResource.size
        )
        .where(
            (sc.NodeResource.protocol_id == protocol_id) & (
                sc.NodeResource.node_id == node_id)
        ))

    result = session.execute(resource_query)

    return (
        md.NodeResource(**row, filename=f"{row['id']}.{row['extension']}") for row in result.mappings()
    )


def change_name_resource_name(
    session: Session,
    protocol_id: int,
    node_id: str,
    resource_id: str,
    patch: md.PatchNodeResource
) -> bool:
    update_node_resource = (
        sa.update(sc.NodeResource)
        .where((sc.NodeResource.id == resource_id) &
               (sc.NodeResource.protocol_id == protocol_id) &
               (sc.NodeResource.node_id == node_id))
        .values(
            name=patch.name
        )
    )
    rowcount = session.execute(update_node_resource).rowcount
    session.commit()
    return rowcount != 0


def get_protocol(session: Session, protocol_id: int) -> md.Protocol:
    query = sa.select(sc.Protocol).where(sc.Protocol.id == protocol_id)
    result = session.execute(query).first()
    if result is None:
        return None

    result = result[0]
    return md.Protocol(
        id=result.id,
        initial_node_id=result.initial_node_id,
        name=result.name,
        nodes=[utils.schema_to_node(node) for node in result.nodes],
        edges=result.edges
    )


def create_node_resources(
    session: Session,
    protocol_id: int,
    node_id: str,
    node_files: list[utils.NodeFile]
) -> list[md.NodeResource]:
    query = sa.insert(sc.NodeResource).returning(
        sc.NodeResource.id, sc.NodeResource.extension, sc.NodeResource.name, sc.NodeResource.size
    )

    try:
        result = session.execute(
            query,
            [
                {
                    "protocol_id": protocol_id,
                    "node_id": node_id,
                    "extension": node_file.extension,
                    "name": node_file.name,
                    "size": node_file.size
                }
                for node_file in node_files
            ]
        )
    except IntegrityError:
        return None

    saved_resources = [
        md.NodeResource(**row, filename=f"{row['id']}.{row['extension']}") for row in result.mappings()
    ]

    for node_file, saved_resource in zip(node_files, saved_resources):
        path = os.path.join(RESOURCES_PATH, saved_resource.filename)
        with open(path, "wb") as f:
            shutil.copyfileobj(node_file.blob, f)

    session.commit()

    return saved_resources


def delete_protocol(session: Session, protocol_id: int) -> bool:
    result = session.execute(
        sa.delete(sc.Protocol).where(sc.Protocol.id == protocol_id))
    session.commit()
    return result.rowcount != 0


def update_protocol(session: Session, protocol_id: int, protocol: md.ProtocolCreate) -> bool:
    if protocol.initial_node_id is None:
        raise InvalidProtocolException(
            "The initial node has not been specified"
        )

    # TODO: check that the initial_node_id actually references a node
    update_protocol = sa.update(sc.Protocol).where(sc.Protocol.id == protocol_id).values(
        name=protocol.name,
        initial_node_id=protocol.initial_node_id
    )
    row_count = session.execute(update_protocol).rowcount
    if row_count == 0:
        return False

    session.execute(
        sa.delete(sc.Node)
        .where(
            sc.Node.protocol_id == protocol_id
        )
    )
    _insert_nodes_edges(session, protocol_id, protocol.nodes, protocol.edges)

    session.commit()
    return True


def create_protocol(session: Session, protocol: md.ProtocolCreate) -> md.ProtocolSummary:
    if (protocol.initial_node_id is None or protocol.initial_node_id == "") and len(protocol.nodes) > 0:
        raise InvalidProtocolException(
            "The initial node has not been specified"
        )

    insert_protocol = sa.insert(sc.Protocol).values(
        name=protocol.name,
        initial_node_id=protocol.initial_node_id if len(
            protocol.nodes) > 0 else initial_node.id
    ).returning(sc.Protocol.id)

    protocol_id = session.execute(insert_protocol).one()[0]

    if len(protocol.nodes) == 0:
        session.execute(sa.insert(sc.Node).values(
            protocol_id=protocol_id, **utils.node_to_schema(initial_node)
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
