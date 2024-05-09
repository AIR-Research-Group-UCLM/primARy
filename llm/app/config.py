import os

MAIN_COLLECTION_NAME = "main"
EMBEDDING_DIMENSION = 1024
# If I have correctly understood, if I give a sentence greater
# than that number of tokens then it will perform poorly. In
# fact, SentenceTransformers will truncate it
EMBEDDING_MODEL_MAX_SEQUENCE_LEN = 512

QDRANT_HOST=os.getenv("QDRANT_HOST", "http://qdrant:6333")

MODEL_PATH = os.getenv("MODEL_PATH", "/models/mistral-7b-instruct-v0.2.Q5_K_S.gguf")
CONTEXT_WINDOW = int(os.getenv("CONTEXT_WINDOW", "8192"))
N_GPU_LAYERS = int(os.getenv("N_GPU_LAYERS", "20"))