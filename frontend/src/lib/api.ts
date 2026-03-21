const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ParagraphMapping {
  original: string;
  humanized: string;
}

export interface HumanizeResponse {
  original_text: string;
  humanized_text: string;
  paragraphs: ParagraphMapping[];
}

export async function humanizeText(
  text: string,
  tone: string = "Standard"
): Promise<HumanizeResponse> {
  const res = await fetch(`${API_BASE}/humanize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, tone }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  return res.json();
}
