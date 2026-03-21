"use client";

import { useState, useRef, useCallback } from "react";
import { humanizeText, type ParagraphMapping } from "@/lib/api";
import { countWords, downloadBlob } from "@/lib/utils";

const TONES = [
  { value: "Standard", label: "Standard" },
  { value: "HighSchool", label: "High School" },
  { value: "College", label: "College" },
  { value: "PhD", label: "PhD" },
];

export default function Home() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [inputText, setInputText] = useState("");
  const [output, setOutput] = useState("");
  const [paragraphs, setParagraphs] = useState<ParagraphMapping[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tone, setTone] = useState("Standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const wordCount = countWords(inputText);
  const outputWordCount = countWords(output);
  const hasParagraphs = paragraphs.length > 0;

  const handleHumanize = useCallback(async () => {
    if (!inputText.trim() || loading) return;
    setError("");
    setLoading(true);
    setOutput("");
    setParagraphs([]);
    setHoveredIndex(null);

    try {
      const result = await humanizeText(inputText, tone);
      setOutput(result.humanized_text);
      setParagraphs(result.paragraphs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Humanization failed");
    } finally {
      setLoading(false);
    }
  }, [inputText, tone, loading]);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    downloadBlob(blob, `humanized-${Date.now()}.txt`);
  }, [output]);

  const handleClear = useCallback(() => {
    setInputText("");
    setOutput("");
    setParagraphs([]);
    setHoveredIndex(null);
    setError("");
    textareaRef.current?.focus();
  }, []);

  const handleEdit = useCallback(() => {
    setOutput("");
    setParagraphs([]);
    setHoveredIndex(null);
    textareaRef.current?.focus();
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
      textareaRef.current?.focus();
    } catch {
      setError("Failed to read clipboard");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold tracking-tight">
              Humanize AI
            </h1>
          </div>
          <p className="text-sm text-muted hidden sm:block">
            Transform AI text into natural human writing
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Controls bar */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted">Tone:</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              {TONES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {inputText && (
            <button
              onClick={handleClear}
              className="h-9 px-4 rounded-lg text-sm border border-border hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Editor panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input panel */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border flex flex-col min-h-[500px]">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-primary" />
              <span className="font-medium text-sm">Your Content</span>
              <span className="ml-auto text-xs text-muted flex items-center gap-2">
                {wordCount} words
                {hasParagraphs && (
                  <button
                    onClick={handleEdit}
                    className="p-1 rounded hover:bg-background transition-colors text-muted hover:text-foreground"
                    title="Edit text"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
                    </svg>
                  </button>
                )}
              </span>
            </div>

            <div className="flex-1 relative p-5">
              {hasParagraphs ? (
                <ParagraphView
                  paragraphs={paragraphs.map((p) => p.original)}
                  hoveredIndex={hoveredIndex}
                  onHover={setHoveredIndex}
                />
              ) : (
                <>
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={loading}
                    placeholder="Paste or type your AI-generated text here..."
                    className="w-full h-full min-h-[380px] text-sm leading-relaxed resize-none outline-none bg-transparent placeholder:text-muted/50 show-scrollbar disabled:opacity-50"
                    spellCheck={false}
                  />

                  {!inputText && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <button
                        onClick={handlePaste}
                        className="pointer-events-auto flex flex-col items-center gap-2 w-24 h-24 rounded-xl bg-background hover:bg-border/40 transition-colors justify-center text-muted/60 text-xs"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="8"
                            y="2"
                            width="8"
                            height="4"
                            rx="1"
                            ry="1"
                          />
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                        </svg>
                        Paste Text
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Humanize button */}
            <div className="px-5 py-4 border-t border-border">
              <button
                onClick={handleHumanize}
                disabled={!inputText.trim() || loading}
                className="h-10 px-6 rounded-lg text-sm font-medium bg-foreground text-accent hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {loading ? (
                  <Spinner />
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
                  </svg>
                )}
                Humanize
              </button>
            </div>
          </div>

          {/* Output panel */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border flex flex-col min-h-[500px]">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-[#22c55e]" />
              <span className="font-medium text-sm">Output</span>
              {output && (
                <span className="ml-auto text-xs text-muted">
                  {outputWordCount} words
                </span>
              )}
            </div>

            <div className="flex-1 relative p-5">
              {loading ? (
                <div className="space-y-5 pt-2">
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-4/5" />
                  <div className="skeleton h-4 w-3/5" />
                  <div className="skeleton h-4 w-4/5" />
                  <div className="skeleton h-4 w-2/5" />
                </div>
              ) : hasParagraphs ? (
                <ParagraphView
                  paragraphs={paragraphs.map((p) => p.humanized)}
                  hoveredIndex={hoveredIndex}
                  onHover={setHoveredIndex}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[380px] text-muted/30">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <line x1="10" y1="9" x2="8" y2="9" />
                  </svg>
                  <p className="mt-4 text-sm font-medium uppercase tracking-wider">
                    Humanized text appears here
                  </p>
                </div>
              )}
            </div>

            {/* Output actions */}
            {output && (
              <div className="px-5 py-4 border-t border-border flex justify-end gap-3">
                <button
                  onClick={handleCopy}
                  className="h-9 px-4 rounded-lg text-sm border border-border hover:bg-primary hover:border-primary hover:text-white transition-all flex items-center gap-2"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      width="14"
                      height="14"
                      x="8"
                      y="8"
                      rx="2"
                      ry="2"
                    />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="h-9 px-4 rounded-lg text-sm border border-border hover:bg-primary hover:border-primary hover:text-white transition-all flex items-center gap-2"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7,10 12,15 17,10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mt-6 rounded-xl bg-red-50 border border-red-200 text-red-700 px-5 py-3 text-sm flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              &times;
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-muted">
          Humanize AI &mdash; Powered by StealthGPT
        </div>
      </footer>
    </div>
  );
}

function ParagraphView({
  paragraphs,
  hoveredIndex,
  onHover,
}: {
  paragraphs: string[];
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
}) {
  return (
    <div className="show-scrollbar h-full overflow-y-auto min-h-[380px] space-y-1">
      {paragraphs.map((text, i) => {
        const isActive = hoveredIndex === i;
        return (
          <div
            key={i}
            className={`flex gap-3 p-3 rounded-lg transition-all duration-200 cursor-default ${
              isActive
                ? "bg-primary/6 ring-1 ring-primary/20"
                : "hover:bg-background/60"
            }`}
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(null)}
          >
            <span
              className={`shrink-0 w-5 h-5 rounded-full text-[11px] font-semibold flex items-center justify-center mt-0.5 transition-colors duration-200 ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {i + 1}
            </span>
            <p className="text-sm leading-relaxed whitespace-pre-wrap flex-1">
              {text}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
