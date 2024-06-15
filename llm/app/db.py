from llama_index.vector_stores.qdrant import QdrantVectorStore
from llama_index.core import VectorStoreIndex

from qdrant_client import QdrantClient, models

from . import embeddings
from . import config


qdrant_client = QdrantClient(config.QDRANT_HOST)
vector_store = QdrantVectorStore(
    collection_name=config.MAIN_COLLECTION_NAME,
    client=qdrant_client,
)
vector_index = VectorStoreIndex.from_vector_store(
    vector_store=vector_store,
    embed_model=embeddings.embedding_model
)