from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.llama_cpp import LlamaCPP

EMBEDDING_DIMENSION = 1024

# If I have correctly understood, if I give a sentence greater
# than that number of tokens then it will perform poorly. In
# fact, SentenceTransformers will truncate it
EMBEDDING_MODEL_MAX_SEQUENCE_LEN = 512

embedding_model = HuggingFaceEmbedding(
    "BAAI/bge-large-en-v1.5",
    cache_folder="",
    # TODO: change this when I solve the problem with the drivers
    device="cpu"
)

# llm = LlamaCPP(
#     model_path="mixtral-8x7b-instruct-v0.1.Q4_K_M.gguf",
#     temperature=0.7,
#     context_window=32768,
#     model_kwargs=dict(
#         n_gpu_layers=33,
#         max_tokens=None
#     ),
# )
