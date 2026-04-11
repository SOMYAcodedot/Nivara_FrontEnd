/** True if `recommendations` has any displayable yoga/diet/sleep/emotional content. */
export function hasLifestyleRecommendationContent(recs) {
  if (!recs || typeof recs !== "object") return false;
  const y = recs.yoga_suggestions;
  const d = recs.diet_adjustments;
  const s = recs.sleep_guidance;
  const e = recs.emotional_regulation_tips;
  const yogaOk = y?.suggestions?.length > 0 || Boolean(y?.summary);
  const dietOk = d?.adjustments?.length > 0 || Boolean(d?.phase_note);
  const sleepOk =
    s?.tips?.length > 0 || Boolean(s?.summary) || s?.target_hours != null;
  const emoOk = e?.tips?.length > 0 || Boolean(e?.context_note);
  return yogaOk || dietOk || sleepOk || emoOk;
}
