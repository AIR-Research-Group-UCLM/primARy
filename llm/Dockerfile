ARG UBUNTU_VERSION=22.04
ARG CUDA_VERSION=12.4.1
ARG BASE_CUDA_DEV_CONTAINER=nvidia/cuda:${CUDA_VERSION}-devel-ubuntu${UBUNTU_VERSION}

FROM ubuntu:${UBUNTU_VERSION} AS models
RUN apt-get update && apt-get install -y wget git
RUN wget -q https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q5_K_S.gguf?download=true \
    -O mistral-7b-instruct-v0.2.Q5_K_S.gguf
RUN git clone https://huggingface.co/BAAI/bge-large-en-v1.5 \
    && wget -q https://huggingface.co/BAAI/bge-large-en-v1.5/resolve/main/model.safetensors?download=true \
    -O bge-large-en-v1.5/model.safetensors


FROM ${BASE_CUDA_DEV_CONTAINER}
RUN apt-get update \
    && apt-get install -y python3.10 python3-pip \
    && rm -rf /var/lib/apt/lists/*

RUN ln -sf /usr/bin/python3.10 /usr/bin/python \
    && ln -sf /usr/bin/python3.10 /usr/bin/python3 \
    && ln -sf /usr/bin/pip3 /usr/bin/pip

COPY --from=models /mistral-7b-instruct-v0.2.Q5_K_S.gguf /models/
COPY --from=models /bge-large-en-v1.5/ /models/bge-large-en-v1.5/

WORKDIR /code

COPY ./requirements.txt ./setup_qdrant.py ./run-service.sh ./
RUN CMAKE_ARGS="-DLLAMA_CUDA=on" pip install --no-cache-dir --upgrade -r requirements.txt

COPY ./app ./app
CMD ["./run-service.sh"]

EXPOSE 80