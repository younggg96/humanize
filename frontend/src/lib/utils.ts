export function countWords(text: string): number {
  const words = text.trim().split(/\s+/);
  return words.length > 0 && words[0] !== "" ? words.length : 0;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
