/** Strip HTML / odd escapes so ReactMarkdown gets plain markdown text. */
export function formatNivaraAssistantMarkdown(raw) {
  if (raw == null) return "";
  let s = String(raw).replace(/\r\n/g, "\n");
  if (!s.includes("\n") && /\\n/.test(s)) s = s.replace(/\\n/g, "\n");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<\/(p|div|li|h[1-6])>/gi, "\n");
  s = s.replace(/<li[^>]*>/gi, "\n- ");
  s = s.replace(/<[^>]+>/g, "");
  s = s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  return s.replace(/\n{3,}/g, "\n\n").trim();
}
