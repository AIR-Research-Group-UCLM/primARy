from typing import TYPE_CHECKING

import sqlalchemy as sa

from .schemas import Protocol, NodeData, Node

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

# TODO: Add a sort of pagination
def get_protocols(session: Session):
    query = sa.select(Protocol.id, NodeData.name).join(Node).join(NodeData)
    result = session.execute(query)
    return result.mappings()