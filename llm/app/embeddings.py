from llama_index.embeddings.huggingface import HuggingFaceEmbedding

EMBEDDING_DIMENSION = 1024

# If I have correctly understood, if I give a sentence greater
# than that number of tokens then it will perform poorly. In
# fact, SentenceTransformers will truncate it
EMBEDDING_MODEL_MAX_SEQUENCE_LEN = 512

embedding_model = HuggingFaceEmbedding(
    "BAAI/bge-large-en-v1.5",
    # TODO: create env var for this
    cache_folder="/home/pablo/llms/embedding_models",
)
