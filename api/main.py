from typing import Annotated

from fastapi import FastAPI

from models import Protocol, ProtocolCreate, ProtocolSummary

app = FastAPI(
    title="primARy",
    description="Services to assist healthcare professionals"
)

@app.get("/protocols", response_model=list[ProtocolSummary])
async def get_protocols():
    pass

@app.get("/protocols/{protocol_id}", response_model=Protocol)
async def get_protocol(protocol_id: int):
    pass

@app.put("/protocols/{protocol_id}")
async def update_protocol(protocol_id: int, protocol: ProtocolCreate):
    pass

@app.post("/protocols")
async def create_protocol(protocol: ProtocolCreate):
    pass

@app.delete("/protocols/{protocol_id}")
async def delete_protocol(protocol_id: int):
    pass
