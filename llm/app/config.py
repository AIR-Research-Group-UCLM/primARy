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

# Maximum number of tokens that will be generated. It can't exceed the context window (controlled
# by python-llama-cpp). This number includes the prompt. When it is a negative number or zero, it will generate
# tokens until the number of generated token plus the input tokens (the prompt) exceeds the context window.
MAX_TOKENS = int(os.getenv("MAX_TOKENS", str(CONTEXT_WINDOW)))

DEFAULT_TOP_K = int(os.getenv("DEFAULT_TOP_K", "6"))
