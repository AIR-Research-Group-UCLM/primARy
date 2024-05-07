import os

from llama_index.embeddings.huggingface import HuggingFaceEmbedding

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "/models/bge-large-en-v1.5")
if not os.path.exists(EMBEDDING_MODEL):
    EMBEDDING_MODEL = "BAII/bge-large-en-v1.5"

embedding_model = HuggingFaceEmbedding(EMBEDDING_MODEL)
