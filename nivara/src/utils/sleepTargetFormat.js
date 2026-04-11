/**
 * Normalizes sleep target strings from the API (e.g. "7-9 hours hours" → "7–9 h").
 */
export function formatSleepTargetHours(raw) {
  if (raw == null || raw === "") return null;
  let s = String(raw).trim().replace(/\s+/g, " ");
  s = s.replace(/hours\s+hours/gi, "hours");
  s = s.replace(/\b(hours)(\s+\1)+\b/gi, "$1");
  s = s.replace(/\b(h)\s+\1\b/gi, "$1");
  s = s.replace(/\bhours\b/gi, "h");
  s = s.replace(/\bhr(s)?\b/gi, "h");
  s = s.replace(/\s+h\s+h\b/gi, " h");
  s = s.replace(/\bh\s+h\b/gi, "h");
  s = s.replace(/(\d)\s*[-–]\s*(\d)/g, "$1–$2");
  s = s.replace(/\bhh\b/gi, "h");
  s = s.replace(/\bh\s+h\b/gi, "h");
  return s.trim().replace(/\s+/g, " ");
}
