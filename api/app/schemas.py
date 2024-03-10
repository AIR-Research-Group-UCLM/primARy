from __future__ import annotations

import sqlalchemy as sa
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
)


class Base(DeclarativeBase):
    pass


class Edge(Base):
    __tablename__ = "edges"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    protocol_id: Mapped[int] = mapped_column(
        sa.ForeignKey("protocols.id", ondelete="CASCADE"),
    )
    source: Mapped[str] = mapped_column(
        sa.ForeignKey("nodes.id", ondelete="CASCADE"))
    target: Mapped[str] = mapped_column(
        sa.ForeignKey("nodes.id", ondelete="CASCADE"))

    label: Mapped[str] = mapped_column(sa.String(255))
    source_handle: Mapped[str] = mapped_column(sa.String(255))
    target_handle: Mapped[str] = mapped_column(sa.String(255))


class Node(Base):
    __tablename__ = "nodes"

    id: Mapped[str] = mapped_column(sa.CHAR(21), primary_key=True)
    protocol_id: Mapped[int] = mapped_column(
        sa.ForeignKey("protocols.id", ondelete="CASCADE"), primary_key=True
    )
    name: Mapped[str] = mapped_column(sa.String(255))
    description: Mapped[str] = mapped_column(sa.Text)
    pos_x: Mapped[float]
    pos_y: Mapped[float]


class NodeResource(Base):
    __tablename__ = "nodes_resources"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    protocol_id: Mapped[int] = mapped_column()
    node_id: Mapped[str] = mapped_column(sa.CHAR(21))
    name: Mapped[str] = mapped_column(sa.String(255))
    size: Mapped[int] = mapped_column()

    __table_args__ = (
        sa.ForeignKeyConstraint([protocol_id, node_id], [Node.protocol_id, Node.id]),)


class Protocol(Base):
    __tablename__ = "protocols"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    initial_node_id: Mapped[str] = mapped_column(sa.CHAR(21))
    name: Mapped[str] = mapped_column(sa.String(255))
    nodes: Mapped[list[Node]] = relationship()
    edges: Mapped[list[Edge]] = relationship()


if __name__ == "__main__":
    from db import SessionLocal
    with SessionLocal.begin() as session:
        Base.metadata.create_all(session.get_bind())
