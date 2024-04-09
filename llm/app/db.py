from llama_index.vector_stores.qdrant import QdrantVectorStore
from llama_index.core import VectorStoreIndex

from qdrant_client import QdrantClient, models

from . import embeddings

MAIN_COLLECTION_NAME = "main"

# TODO: create env var for this
qdrant_client = QdrantClient()
vector_store = QdrantVectorStore(
    collection_name=MAIN_COLLECTION_NAME,
    client=qdrant_client,
)
vector_index = VectorStoreIndex.from_vector_store(
    vector_store=vector_store,
    embed_model=embeddings.embedding_model
)


def _setup_qdrant():
    """This function must be run just one time. Since we are always going to filter
    by the protocol id, this function adjust the indexes of the main collection
    so that a global search is not performed, improving the performance
    """

    qdrant_client.create_collection(
        collection_name=MAIN_COLLECTION_NAME,
        vectors_config=models.VectorParams(
            size=embeddings.EMBEDDING_DIMENSION,
            distance=models.Distance.COSINE
        ),
        # TODO: search what these parameters mean
        hnsw_config=models.HnswConfigDiff(
            payload_m=16,
            m=0,
        ),
    )

    qdrant_client.create_payload_index(
        collection_name=MAIN_COLLECTION_NAME,
        field_name="protocol_id",
        field_type=models.PayloadSchemaType.KEYWORD,
    )

    qdrant_client.update_collection(
        collection_name="main",
        hnsw_config=models.HnswConfigDiff(payload_m=16, m=0),
    )


if __name__ == "__main__":
    _setup_qdrant()
