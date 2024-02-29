from __future__ import annotations

import sqlalchemy as sa
from sqlalchemy.orm import (
    Session,
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
    sessionmaker
)

class Base(DeclarativeBase):
    pass

class Position(Base):
    __tablename__ = "positions"

    node_id: Mapped[str] = mapped_column(sa.ForeignKey("nodes.id"), primary_key=True)
    x: Mapped[float]
    y: Mapped[float]

class NodeData(Base):
    __tablename__ = "nodes_data"

    node_id: Mapped[str] = mapped_column(sa.ForeignKey("nodes.id"), primary_key=True)
    name: Mapped[str] = mapped_column(sa.String(255))
    description: Mapped[str] = mapped_column(sa.Text)

class Edge(Base):
    __tablename__ = "edges"

    protocol_id: Mapped[int] = mapped_column(sa.ForeignKey("protocols.id"), primary_key=True)
    source: Mapped[str] = mapped_column(sa.ForeignKey("nodes.id"), primary_key=True)
    target: Mapped[str] = mapped_column(sa.ForeignKey("nodes.id"), primary_key=True)

    label: Mapped[str | None] = mapped_column(sa.String(255))
    source_handle: Mapped[str] = mapped_column(sa.String(255))
    target_handle: Mapped[str] = mapped_column(sa.String(255))

class Node(Base):
    __tablename__ = "nodes"

    id: Mapped[str] = mapped_column(sa.CHAR(21), primary_key=True)
    protocol_id: Mapped[int] = mapped_column(sa.ForeignKey("protocols.id"), primary_key=True)

    position: Mapped[Position] = relationship()
    data: Mapped[NodeData] = relationship()

class Protocol(Base):
    __tablename__ = "protocols"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nodes: Mapped[list[Node]] = relationship()
    edges: Mapped[list[Edge]] = relationship()


DB_URL = sa.URL.create(
    "mysql+pymysql",
    username="root",
    password="root",
    host="127.0.0.1",
    database="protocols",
    port=3306,
)

engine = sa.create_engine(DB_URL)
Session = sessionmaker(bind=engine)

if __name__ == "__main__":
    with Session.begin() as session:
        Base.metadata.create_all(session.get_bind())