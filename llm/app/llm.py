import threading

import json

from llama_index.core import set_global_tokenizer
from llama_index.llms.llama_cpp import LlamaCPP
from llama_index.core.response_synthesizers import ResponseMode
from llama_index.core.vector_stores import MetadataFilters, ExactMatchFilter
from llama_index.core.types import TokenGen
from llama_index.core.base.llms.types import CompletionResponseGen

from .import config
from .db import vector_index
from .exceptions import LLMNotAvailableException

def _mistral_completion_to_prompt(completion: str, system_prompt: str | None = None) -> str:
    return f"<s>[INST]{completion}[/INST]"


_llm_lock = threading.Lock()

_llm = LlamaCPP(
    model_path=config.MODEL_PATH,
    temperature=0.7,
    context_window=config.CONTEXT_WINDOW,
    model_kwargs=dict(
        n_gpu_layers=config.N_GPU_LAYERS,
        # max_tokens=30
    ),
    completion_to_prompt=_mistral_completion_to_prompt
)

set_global_tokenizer(
   lambda text: _llm._model.tokenize(text.encode())
)


def aquire_llm_lock(timeout: int = 2):
    if not _llm_lock.acquire(timeout=timeout):
        raise LLMNotAvailableException


def release_llm_lock():
    _llm_lock.release()


def stream_llm_response(generator: TokenGen) -> TokenGen:
    try:
        yield from (json.dumps({"text": text}) + "\n" for text in generator)
    finally:
        release_llm_lock()


def to_token_gen(generator: CompletionResponseGen) -> TokenGen:
    yield from (completion_response.delta for completion_response in generator)


def complete(prompt: str):
    """Follows an instruction given by prompt. """
    aquire_llm_lock()
    try:
        response = _llm.stream_complete(prompt)
        return stream_llm_response(
            to_token_gen(response)
        )
    except Exception as exc:
        release_llm_lock()
        raise exc


def query(
    prompt: str,
    protocol_id: int,
    response_mode: ResponseMode = ResponseMode.COMPACT,
    similarity_top_k: int = 2
):
    """
    Queries the LLM using LlamaIndex. When that happens, a lock is aquired to avoid bugs
    associated with calling the LlamaCPP object concurrently. The lock is released the llm
    finishes streaming the response
    """

    aquire_llm_lock()
    try:
        query_engine = vector_index.as_query_engine(
            llm=_llm,
            streaming=True,
            response_mode=response_mode,
            filters=MetadataFilters(
                filters=[
                    ExactMatchFilter(
                        key="protocol_id",
                        value=protocol_id
                    )
                ]
            ),
            similarity_top_k=similarity_top_k
        )

        response = query_engine.query(prompt)
        return stream_llm_response(response.response_gen)
    except Exception as exc:
        release_llm_lock()
        raise exc
