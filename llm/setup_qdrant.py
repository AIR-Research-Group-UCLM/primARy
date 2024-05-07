import app.config as config
from qdrant_client import QdrantClient, models

qdrant_client = QdrantClient(config.QDRANT_HOST)

def setup_qdrant():
    """This function must be run just one time. Since we are always going to filter
    by the protocol id, this function adjust the indexes of the main collection
    so that a global search is not performed, improving the performance
    """

    qdrant_client.create_collection(
        collection_name=config.MAIN_COLLECTION_NAME,
        vectors_config=models.VectorParams(
            size=config.EMBEDDING_DIMENSION,
            distance=models.Distance.COSINE
        ),
        # TODO: search what these parameters mean
        hnsw_config=models.HnswConfigDiff(
            payload_m=16,
            m=0,
        ),
    )

    qdrant_client.create_payload_index(
        collection_name=config.MAIN_COLLECTION_NAME,
        field_name="protocol_id",
        field_type=models.PayloadSchemaType.KEYWORD,
    )

    qdrant_client.update_collection(
        collection_name=config.MAIN_COLLECTION_NAME,
        hnsw_config=models.HnswConfigDiff(payload_m=16, m=0),
    )

if __name__ == "__main__":
    if not qdrant_client.collection_exists(config.MAIN_COLLECTION_NAME):
        setup_qdrant()