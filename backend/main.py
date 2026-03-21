import os
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

from humanizer import Humanizer

load_dotenv()
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Humanize API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STEALTH_API_KEY = os.getenv("STEALTH_API_KEY", "")
humanizer = Humanizer(api_key=STEALTH_API_KEY)


class HumanizeRequest(BaseModel):
    text: str
    tone: Optional[str] = "Standard"


class ParagraphMapping(BaseModel):
    original: str
    humanized: str


class HumanizeResponse(BaseModel):
    original_text: str
    humanized_text: str
    paragraphs: list[ParagraphMapping]


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/humanize", response_model=HumanizeResponse)
async def humanize_text(req: HumanizeRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    try:
        mappings = await humanizer.humanize_by_paragraphs(
            req.text, tone=req.tone or "Standard"
        )
        humanized_text = "\n\n".join(m["humanized"] for m in mappings)
        return HumanizeResponse(
            original_text=req.text,
            humanized_text=humanized_text,
            paragraphs=[
                ParagraphMapping(original=m["original"], humanized=m["humanized"])
                for m in mappings
            ],
        )
    except Exception as exc:
        logging.error("Humanization failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
