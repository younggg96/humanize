import re
import asyncio
import logging
from typing import Optional

import aiohttp

logger = logging.getLogger(__name__)


class Humanizer:
    """Core humanization engine using StealthGPT API."""

    ENDPOINT = "https://stealthgpt.ai/api/stealthify"
    MAX_CHUNK_WORDS = 1000
    MIN_WORDS_TO_PROCESS = 30

    def __init__(self, api_key: str):
        self.api_key = api_key

    async def humanize(self, text: str, tone: str = "Standard") -> str:
        if not text or not text.strip():
            return text

        chunks = self._split_into_chunks(text)
        async with aiohttp.ClientSession() as session:
            tasks = [
                self._humanize_chunk(chunk, session, tone) for chunk in chunks
            ]
            results = await asyncio.gather(*tasks)

        return " ".join(r for r in results if r)

    async def humanize_by_paragraphs(
        self, text: str, tone: str = "Standard"
    ) -> list[dict[str, str]]:
        if not text or not text.strip():
            return []

        paragraphs = self._split_into_paragraphs(text)

        async with aiohttp.ClientSession() as session:
            tasks = [
                self._humanize_single_paragraph(p, session, tone)
                for p in paragraphs
            ]
            results = await asyncio.gather(*tasks)

        return [
            {"original": orig, "humanized": hum}
            for orig, hum in zip(paragraphs, results)
        ]

    async def _humanize_single_paragraph(
        self,
        text: str,
        session: aiohttp.ClientSession,
        tone: str = "Standard",
    ) -> str:
        chunks = self._split_into_chunks(text)
        tasks = [self._humanize_chunk(c, session, tone) for c in chunks]
        results = await asyncio.gather(*tasks)
        return " ".join(r for r in results if r)

    def _split_into_paragraphs(self, text: str) -> list[str]:
        parts = re.split(r"\n\s*\n", text.strip())
        return [p.strip() for p in parts if p.strip()]

    async def _humanize_chunk(
        self,
        text: str,
        session: aiohttp.ClientSession,
        tone: str = "Standard",
    ) -> str:
        alpha_words = [w for w in text.split() if w.isalpha()]
        if len(alpha_words) < self.MIN_WORDS_TO_PROCESS:
            return text

        headers = {
            "api-token": self.api_key,
            "Content-Type": "application/json",
        }
        payload = {"prompt": text, "rephrase": True, "tone": tone}

        try:
            async with session.post(
                self.ENDPOINT, headers=headers, json=payload
            ) as resp:
                if resp.status != 200:
                    logger.error("StealthGPT API returned status %d", resp.status)
                    resp.raise_for_status()
                data = await resp.json()
                return data.get("result", text)
        except aiohttp.ClientError as exc:
            logger.error("StealthGPT client error: %s", exc)
            raise
        except Exception as exc:
            logger.error("Unexpected error during humanization: %s", exc)
            raise

    def _split_into_chunks(self, text: str) -> list[str]:
        words = text.split()
        if len(words) <= self.MAX_CHUNK_WORDS:
            return [text]

        chunks: list[str] = []
        current: list[str] = []
        count = 0

        for word in words:
            if count >= self.MAX_CHUNK_WORDS:
                chunks.append(" ".join(current))
                current = []
                count = 0
            current.append(word)
            count += 1

        if current:
            if len(current) < 50 and chunks:
                chunks[-1] += " " + " ".join(current)
            else:
                chunks.append(" ".join(current))

        return chunks
