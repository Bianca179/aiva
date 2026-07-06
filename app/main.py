"""AIVA - Dashboard & Chatbot fuer Lexware Office.

Start:  uvicorn app.main:app --reload
"""

from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel

from . import chatbot, service

app = FastAPI(title="AIVA", docs_url="/api/docs")

STATIC_DIR = Path(__file__).parent / "static"


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


@app.get("/")
def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/summary")
def summary() -> dict:
    return service.get_summary()


@app.get("/api/invoices/open")
def open_invoices() -> list[dict]:
    return service.get_open_invoices()


@app.get("/api/receipts/missing")
def missing_receipts() -> list[dict]:
    return service.get_missing_receipts()


@app.get("/api/bank/matching")
def bank_matching() -> dict:
    return service.get_bank_matching()


@app.post("/api/bank/upload")
async def bank_upload(file: UploadFile) -> dict:
    try:
        return service.import_bank_csv(await file.read())
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))


@app.post("/api/chat")
def chat(req: ChatRequest) -> dict:
    reply = chatbot.chat(req.message, req.history)
    return {"reply": reply}
