export function searchStringFn(pattern: string): (text: string) => boolean {
  const patternNorm = normaliseString(pattern);
  const patternParts = patternNorm
    .split(" ")
    .map((s) => s.trim())
    .filter(Boolean);
  if (patternParts.length === 0) {
    return () => true;
  }
  return (text) => {
    const normText = normaliseString(text);
    return patternParts.every((p) => normText.includes(p));
  };
}

function normaliseString(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
