import React from "react";
import { FaLeaf, FaUtensils, FaMoon, FaHeart } from "react-icons/fa";
import { formatSleepTargetHours } from "../../utils/sleepTargetFormat";
import "./LifestyleRecommendationsBlock.css";

function tipText(tip) {
  if (tip == null) return "";
  if (typeof tip === "string") return tip;
  return tip.text || tip.title || tip.name || String(tip);
}

/**
 * Same shape as GET /lifestyle/recommendations/ — used on Health Report screen.
 */
export default function LifestyleRecommendationsBlock({
  recommendations = {},
  lifestyleLlmGenerated,
  className = "",
}) {
  const {
    yoga_suggestions = {},
    diet_adjustments = {},
    sleep_guidance = {},
    emotional_regulation_tips = {},
  } = recommendations || {};

  const hasAny =
    (yoga_suggestions.suggestions?.length > 0) ||
    yoga_suggestions.summary ||
    (diet_adjustments.adjustments?.length > 0) ||
    diet_adjustments.phase_note ||
    (sleep_guidance.tips?.length > 0) ||
    sleep_guidance.summary ||
    sleep_guidance.target_hours != null ||
    (emotional_regulation_tips.tips?.length > 0) ||
    emotional_regulation_tips.context_note;

  if (!hasAny) return null;

  return (
    <section className={`report-lifestyle-block ${className}`.trim()}>
      <div className="report-lifestyle-header">
        <h2 className="block-title">
          <FaLeaf className="report-lifestyle-title-icon" /> Lifestyle recommendations
        </h2>
        {lifestyleLlmGenerated === true && (
          <span className="report-lifestyle-ai-badge" title="Generated with AI for clinical context">
            AI-generated
          </span>
        )}
        {lifestyleLlmGenerated === false && (
          <span className="report-lifestyle-rule-badge">Rule-based</span>
        )}
      </div>
      <p className="report-lifestyle-lead">
        Yoga, diet, sleep, and emotional tips aligned with this report period (same data as Lifestyle
        Intelligence when cached).
      </p>

      <div className="report-lifestyle-grid">
        {(yoga_suggestions.suggestions?.length > 0 || yoga_suggestions.summary) && (
          <div className="report-lifestyle-card report-lifestyle-yoga">
            <div className="report-lifestyle-card-head">
              <FaLeaf /> Yoga
            </div>
            {yoga_suggestions.summary && (
              <p className="report-lifestyle-summary">{yoga_suggestions.summary}</p>
            )}
            {yoga_suggestions.suggestions?.length > 0 && (
              <ul className="report-lifestyle-list">
                {yoga_suggestions.suggestions.map((item, i) => {
                  if (typeof item === "string") {
                    return <li key={i}>{item}</li>;
                  }
                  const title = item.title || item.name;
                  const desc = item.description;
                  const dur =
                    item.duration_min != null && item.duration_min !== ""
                      ? `${item.duration_min} min`
                      : null;
                  return (
                    <li key={i} className="report-lifestyle-structured">
                      <div className="report-lifestyle-row">
                        {title ? <strong>{title}</strong> : null}
                        {dur ? <span className="report-lifestyle-meta">{dur}</span> : null}
                      </div>
                      {desc ? <p className="report-lifestyle-desc">{desc}</p> : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {(diet_adjustments.adjustments?.length > 0 || diet_adjustments.phase_note) && (
          <div className="report-lifestyle-card report-lifestyle-diet">
            <div className="report-lifestyle-card-head">
              <FaUtensils /> Diet
            </div>
            {diet_adjustments.phase_note && (
              <p className="report-lifestyle-summary">{diet_adjustments.phase_note}</p>
            )}
            {diet_adjustments.adjustments?.length > 0 && (
              <ul className="report-lifestyle-list">
                {diet_adjustments.adjustments.map((adj, i) => {
                  if (typeof adj === "string") {
                    return <li key={i}>{adj}</li>;
                  }
                  return (
                    <li key={i} className="report-lifestyle-structured">
                      {adj.category ? <strong className="report-lifestyle-cat">{adj.category}</strong> : null}
                      {adj.tip ? <p className="report-lifestyle-desc">{adj.tip}</p> : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {(sleep_guidance.tips?.length > 0 ||
          sleep_guidance.summary ||
          sleep_guidance.target_hours != null) && (
          <div className="report-lifestyle-card report-lifestyle-sleep">
            <div className="report-lifestyle-card-head">
              <FaMoon /> Sleep
            </div>
            {sleep_guidance.target_hours != null && sleep_guidance.target_hours !== "" && (
              <p className="report-lifestyle-target">
                Target:{" "}
                <strong>
                  {typeof sleep_guidance.target_hours === "number"
                    ? `${sleep_guidance.target_hours} h`
                    : formatSleepTargetHours(sleep_guidance.target_hours) ||
                      String(sleep_guidance.target_hours)}
                </strong>
              </p>
            )}
            {sleep_guidance.summary && (
              <p className="report-lifestyle-summary">{sleep_guidance.summary}</p>
            )}
            {sleep_guidance.tips?.length > 0 && (
              <ul className="report-lifestyle-list">
                {sleep_guidance.tips.map((tip, i) => (
                  <li key={i}>{tipText(tip)}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {(emotional_regulation_tips.tips?.length > 0 ||
          emotional_regulation_tips.context_note) && (
          <div className="report-lifestyle-card report-lifestyle-emotional">
            <div className="report-lifestyle-card-head">
              <FaHeart /> Emotional regulation
            </div>
            {emotional_regulation_tips.context_note && (
              <p className="report-lifestyle-summary">{emotional_regulation_tips.context_note}</p>
            )}
            {emotional_regulation_tips.tips?.length > 0 && (
              <ul className="report-lifestyle-list">
                {emotional_regulation_tips.tips.map((tip, i) => (
                  <li key={i}>{tipText(tip)}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
