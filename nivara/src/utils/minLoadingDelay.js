/**
 * Keeps loading UI visible at least `minMs` from `startTime` (Date.now()).
 * Useful when the API returns instantly (e.g. Django LocMem cache) so the
 * experience still feels like something was prepared.
 */
export async function ensureMinElapsed(startTime, minMs) {
  const elapsed = Date.now() - startTime;
  if (elapsed >= minMs) return;
  await new Promise((resolve) => setTimeout(resolve, minMs - elapsed));
}

/** Default minimum visible loading time for LLM-backed / cached endpoints (ms). */
export const MIN_AWARE_LOADING_MS = 1200;
