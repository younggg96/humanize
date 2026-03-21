# Humanize AI

A standalone tool to transform AI-generated text into natural, human-like writing.

## Architecture

```
humanize/
├── backend/              # FastAPI backend
│   ├── main.py           # API entry point (POST /humanize)
│   ├── humanizer.py      # StealthGPT integration
│   ├── requirements.txt
│   └── .env.example
├── frontend/             # Next.js frontend
│   └── src/
│       ├── app/page.tsx  # Main UI
│       └── lib/api.ts    # API client
└── README.md
```

## Quick Start

```bash
cd /Users/guanggengyang/Documents/GitHub/humanize
# 后端
cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && uvicorn main:app --reload --port 8000
# 前端（新终端）
cd frontend && pnpm install && pnpm dev
```

> 首次运行需在 `backend/.env` 中配置 `STEALTH_API_KEY`（可复制 `.env.example` 并填入密钥）。若 8000 端口被占用，后端可改用 `--port 8001`，并修改 `frontend/.env.local` 中的 `NEXT_PUBLIC_API_URL=http://localhost:8001`。

Open [http://localhost:3000](http://localhost:3000).

## API

### POST /humanize

```json
// Request
{ "text": "AI-generated text...", "tone": "Standard" }

// Response
{ "original_text": "...", "humanized_text": "..." }
```

Tones: `Standard` | `HighSchool` | `College` | `PhD`

## Tech Stack

- **Backend**: Python, FastAPI, aiohttp, StealthGPT API
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS v4
