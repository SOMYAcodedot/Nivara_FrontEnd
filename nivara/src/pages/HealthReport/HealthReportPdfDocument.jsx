import React, { forwardRef, useRef, useImperativeHandle } from "react";
import "./HealthReportPdfDocument.css";
import { formatSleepTargetHours } from "../../utils/sleepTargetFormat";
import { hasLifestyleRecommendationContent } from "../../utils/lifestyleRecsHasContent";

function readUserDisplayName() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    if (typeof u.full_name === "string" && u.full_name.trim()) return u.full_name.trim();
    if (typeof u.name === "string" && u.name.trim()) return u.name.trim();
    if (typeof u.email === "string" && u.email.trim()) return u.email.trim();
  } catch {
    /* ignore */
  }
  return null;
}

function reportRefId(generatedAt) {
  if (!generatedAt) return `NR-${Date.now()}`;
  const d = new Date(generatedAt);
  if (Number.isNaN(d.getTime())) return `NR-${Date.now()}`;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `NR-${y}${m}${day}-${h}${min}`;
}

/** Short overview lines: mood / stress / cycle / lifestyle from section summaries only. */
function overviewBulletsFromSections(reportSections) {
  const matchers = [
    { test: (t) => /mood/i.test(t), prefix: "Mood" },
    { test: (t) => /stress/i.test(t), prefix: "Stress" },
    { test: (t) => /cycle/i.test(t), prefix: "Cycle" },
    { test: (t) => /lifestyle/i.test(t), prefix: "Lifestyle" },
  ];
  const seen = new Set();
  const out = [];
  for (const sec of reportSections || []) {
    const title = sec.title || "";
    for (const m of matchers) {
      if (m.test(title) && sec.summary && !seen.has(m.prefix)) {
        seen.add(m.prefix);
        out.push(`${m.prefix}: ${sec.summary}`);
        break;
      }
    }
    if (out.length >= 4) break;
  }
  return out;
}

/**
 * Grid places items row-wise ([0][1], [2][3]). Default API order stacks mood over cycle in the
 * left column; reorder so mood | cycle share the first row and stress | lifestyle the second.
 */
function orderReportSectionsForPdfGrid(sections) {
  if (!sections?.length) return [];
  const rank = (sec) => {
    const t = (sec.title || "").toLowerCase();
    if (/mood/i.test(t)) return 0;
    if (/cycle/i.test(t)) return 1;
    if (/stress/i.test(t)) return 2;
    if (/lifestyle/i.test(t)) return 3;
    return 50;
  };
  return [...sections].sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== rb) return ra - rb;
    return sections.indexOf(a) - sections.indexOf(b);
  });
}

function pdfTipText(tip) {
  if (tip == null) return "";
  if (typeof tip === "string") return tip;
  return tip.text || tip.title || tip.name || String(tip);
}

const ROW_DEPTH_MAX = 8;

function humanizeReportKey(key) {
  if (key == null || typeof key !== "string") return "";
  return key
    .split("_")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");
}

function cellTextFromScalar(value) {
  if (value === null || value === undefined) return "Not recorded";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "—";
    if (Number.isInteger(value)) return String(value);
    const t = value.toFixed(2);
    return t.replace(/\.?0+$/, "");
  }
  if (typeof value === "string") return value.trim() === "" ? "Not recorded" : value;
  return String(value);
}

/** Flatten section content into lab-style parameter / value rows. */
function rowsFromReportContent(value, prefix, depth) {
  if (depth > ROW_DEPTH_MAX) {
    return [{ parameter: prefix || "Field", value: "…" }];
  }
  if (value === null || value === undefined) {
    return [{ parameter: prefix || "Detail", value: "Not recorded" }];
  }
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return [{ parameter: prefix || "Result", value: cellTextFromScalar(value) }];
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [{ parameter: prefix || "List", value: "None noted" }];
    }
    const allScalar = value.every(
      (item) =>
        item === null ||
        item === undefined ||
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean"
    );
    if (allScalar) {
      return [
        {
          parameter: prefix || "Values",
          value: value.map((item) => cellTextFromScalar(item)).join(" · "),
        },
      ];
    }
    const rows = [];
    value.forEach((item, i) => {
      const label = prefix ? `${prefix} (${i + 1})` : `Item ${i + 1}`;
      rows.push(...rowsFromReportContent(item, label, depth + 1));
    });
    return rows;
  }
  if (typeof value === "object") {
    const rows = [];
    for (const [key, val] of Object.entries(value)) {
      if (val === undefined) continue;
      const label = prefix ? `${prefix} · ${humanizeReportKey(key)}` : humanizeReportKey(key);
      if (val !== null && typeof val === "object") {
        rows.push(...rowsFromReportContent(val, label, depth + 1));
      } else {
        rows.push({ parameter: label, value: cellTextFromScalar(val) });
      }
    }
    return rows.length > 0 ? rows : [{ parameter: prefix || "Detail", value: "—" }];
  }
  return [{ parameter: prefix || "Detail", value: String(value) }];
}

function PdfReportSectionTable({ sec }) {
  const rows = sec.content != null ? rowsFromReportContent(sec.content, "", 0) : [];

  return (
    <div className="health-report-pdf-finding-wrap">
      <table className="health-report-pdf-table">
        <thead>
          <tr>
            <th className="health-report-pdf-table-title" colSpan={2}>
              {sec.title || "Finding"}
            </th>
          </tr>
        </thead>
        <tbody>
          {sec.summary && (
            <tr>
              <th scope="row" className="health-report-pdf-table-label">
                Summary
              </th>
              <td className="health-report-pdf-table-value">{sec.summary}</td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr key={i}>
              <th scope="row" className="health-report-pdf-table-label">
                {row.parameter}
              </th>
              <td className="health-report-pdf-table-value">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PdfReportSectionsBlock({ reportSections }) {
  if (!reportSections?.length) return null;
  const ordered = orderReportSectionsForPdfGrid(reportSections);
  return (
    <div className="health-report-pdf-report-sections-block">
      <h2 className="health-report-pdf-section-title">Report sections</h2>
      <p className="health-report-pdf-findings-lead">
        Structured parameters from tracked wellness data for the report period.
      </p>
      <div
        className={`health-report-pdf-sections-grid${
          ordered.length === 1 ? " health-report-pdf-sections-grid--single" : ""
        }`}
      >
        {ordered.map((sec) => (
          <div className="health-report-pdf-sections-grid-cell" key={sec.id || sec.title}>
            <PdfReportSectionTable sec={sec} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Lifestyle recommendations as narrative + bullets (lab report prose, not data grids). */
function PdfYogaRecommendationsProse({ yoga_suggestions }) {
  const tips = (yoga_suggestions.suggestions || []).filter((x) => x != null);
  const hasSummary = Boolean(yoga_suggestions.summary);
  if (!hasSummary && tips.length === 0) return null;
  return (
    <section className="health-report-pdf-rec-section">
      <h3 className="health-report-pdf-rec-h3">Yoga</h3>
      {hasSummary && <p className="health-report-pdf-rec-lead">{yoga_suggestions.summary}</p>}
      {tips.length > 0 && (
        <ul className="health-report-pdf-rec-ul">
          {tips.map((item, i) => {
            if (typeof item === "string") {
              return <li key={i}>{item}</li>;
            }
            const t = item.title || item.name;
            const dur =
              item.duration_min != null && item.duration_min !== ""
                ? `${item.duration_min} min`
                : null;
            const desc = item.description;
            return (
              <li key={i} className="health-report-pdf-rec-li">
                {t ? <strong>{t}</strong> : null}
                {dur ? <span className="health-report-pdf-rec-meta"> ({dur})</span> : null}
                {desc ? <span className="health-report-pdf-rec-desc"> — {desc}</span> : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function PdfDietRecommendationsProse({ diet_adjustments }) {
  const rows = diet_adjustments.adjustments || [];
  const hasNote = Boolean(diet_adjustments.phase_note);
  if (!hasNote && rows.length === 0) return null;
  return (
    <section className="health-report-pdf-rec-section">
      <h3 className="health-report-pdf-rec-h3">Diet</h3>
      {hasNote && <p className="health-report-pdf-rec-lead">{diet_adjustments.phase_note}</p>}
      {rows.length > 0 && (
        <ul className="health-report-pdf-rec-ul">
          {rows.map((adj, i) => {
            if (typeof adj === "string") {
              return <li key={i}>{adj}</li>;
            }
            return (
              <li key={i} className="health-report-pdf-rec-li">
                {adj.category ? (
                  <>
                    <strong>{adj.category}</strong>
                    {adj.tip ? <span> — {adj.tip}</span> : null}
                  </>
                ) : (
                  adj.tip || "—"
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function PdfSleepRecommendationsProse({ sleep_guidance, sleepTarget }) {
  const tips = sleep_guidance.tips || [];
  const hasLead = Boolean(sleepTarget || sleep_guidance.summary);
  if (!hasLead && tips.length === 0) return null;
  return (
    <section className="health-report-pdf-rec-section">
      <h3 className="health-report-pdf-rec-h3">Sleep</h3>
      {sleepTarget && (
        <p className="health-report-pdf-rec-lead">
          <strong>Target:</strong> {sleepTarget}
        </p>
      )}
      {sleep_guidance.summary && (
        <p className="health-report-pdf-rec-lead">{sleep_guidance.summary}</p>
      )}
      {tips.length > 0 && (
        <ul className="health-report-pdf-rec-ul">
          {tips.map((t, i) => (
            <li key={i}>{pdfTipText(t)}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PdfEmotionalRecommendationsProse({ emotional_regulation_tips }) {
  const tips = emotional_regulation_tips.tips || [];
  const hasNote = Boolean(emotional_regulation_tips.context_note);
  if (!hasNote && tips.length === 0) return null;
  return (
    <section className="health-report-pdf-rec-section">
      <h3 className="health-report-pdf-rec-h3">Emotional regulation</h3>
      {hasNote && (
        <p className="health-report-pdf-rec-lead">{emotional_regulation_tips.context_note}</p>
      )}
      {tips.length > 0 && (
        <ul className="health-report-pdf-rec-ul">
          {tips.map((t, i) => (
            <li key={i}>{pdfTipText(t)}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function computeSleepTargetHours(sleep_guidance) {
  if (
    sleep_guidance?.target_hours == null ||
    sleep_guidance.target_hours === ""
  ) {
    return null;
  }
  return typeof sleep_guidance.target_hours === "number"
    ? `${sleep_guidance.target_hours} h`
    : formatSleepTargetHours(sleep_guidance.target_hours) ||
        String(sleep_guidance.target_hours);
}

/**
 * Full lifestyle block for PDF segment 2: starts at top of canvas so page 2 is not a sparse slice
 * of segment 1. Yoga, diet, sleep, and emotional stay in one capture (target: 2-page PDF).
 */
function PdfLifestyleFullPageBlock({
  recs,
  lifestyleLlmGenerated,
  sleepTarget,
  refId,
  generatedStr,
}) {
  const {
    yoga_suggestions = {},
    diet_adjustments = {},
    sleep_guidance = {},
    emotional_regulation_tips = {},
  } = recs || {};

  const yogaHasContent =
    Boolean(yoga_suggestions.summary) ||
    (yoga_suggestions.suggestions?.length > 0 &&
      yoga_suggestions.suggestions.some((x) => x != null));
  const dietHasContent =
    Boolean(diet_adjustments.phase_note) || (diet_adjustments.adjustments?.length > 0);
  const sleepHasContent =
    Boolean(sleepTarget) ||
    Boolean(sleep_guidance.summary) ||
    (sleep_guidance.tips?.length > 0 && sleep_guidance.tips.some((t) => pdfTipText(t)));
  const emotionalHasContent =
    Boolean(emotional_regulation_tips.context_note) ||
    (emotional_regulation_tips.tips?.length > 0 &&
      emotional_regulation_tips.tips.some((t) => pdfTipText(t)));

  return (
    <div className="health-report-pdf-lifestyle health-report-pdf-lifestyle--prose health-report-pdf-lifestyle--compact">
      <h2 className="health-report-pdf-section-title health-report-pdf-lifestyle-main-title">
        Lifestyle recommendations
      </h2>
      <div className="health-report-pdf-lifestyle-source">
        {/* {lifestyleLlmGenerated === true && (
          <span className="health-report-pdf-lifestyle-ai">AI-generated</span>
        )} */}
        {lifestyleLlmGenerated === false && (
          <span className="health-report-pdf-lifestyle-rules">Rule-based</span>
        )}
      </div>
      <p className="health-report-pdf-lifestyle-intro">
        Guidance below is aligned with your report period.
      </p>
      <p className="health-report-pdf-lifestyle-ref-line">
        Ref <span className="health-report-pdf-lifestyle-ref-id">{refId}</span>
        {generatedStr ? ` · ${generatedStr}` : ""}
      </p>
      {yogaHasContent ? (
        <PdfYogaRecommendationsProse yoga_suggestions={yoga_suggestions} />
      ) : (
        <section className="health-report-pdf-rec-section">
          <h3 className="health-report-pdf-rec-h3">Yoga</h3>
          <p className="health-report-pdf-rec-empty">Not specified for this period.</p>
        </section>
      )}
      {dietHasContent ? (
        <PdfDietRecommendationsProse diet_adjustments={diet_adjustments} />
      ) : (
        <section className="health-report-pdf-rec-section">
          <h3 className="health-report-pdf-rec-h3">Diet</h3>
          <p className="health-report-pdf-rec-empty">Not specified for this period.</p>
        </section>
      )}
      {sleepHasContent ? (
        <PdfSleepRecommendationsProse sleep_guidance={sleep_guidance} sleepTarget={sleepTarget} />
      ) : (
        <section className="health-report-pdf-rec-section">
          <h3 className="health-report-pdf-rec-h3">Sleep</h3>
          <p className="health-report-pdf-rec-empty">Not specified for this period.</p>
        </section>
      )}
      {emotionalHasContent ? (
        <PdfEmotionalRecommendationsProse emotional_regulation_tips={emotional_regulation_tips} />
      ) : (
        <section className="health-report-pdf-rec-section">
          <h3 className="health-report-pdf-rec-h3">Emotional regulation</h3>
          <p className="health-report-pdf-rec-empty">Not specified for this period.</p>
        </section>
      )}
    </div>
  );
}

const HealthReportPdfDocument = forwardRef(function HealthReportPdfDocument(
  { data, report },
  ref
) {
  const {
    report_sections = [],
    risk_flags = [],
    summary_insights = [],
    professional_summary,
    generated_at,
    llm_insights,
    llm_generated,
    lifestyle_recommendations,
    lifestyle_llm_generated,
  } = report || {};

  const hasLlmNarrative =
    llm_insights &&
    typeof llm_insights === "object" &&
    (Boolean(llm_insights.professional_summary) ||
      (Array.isArray(llm_insights.insight_bullets) && llm_insights.insight_bullets.length > 0) ||
      Boolean(llm_insights.highlights) ||
      Boolean(llm_insights.supportive_note));

  const hasStructuredBody =
    report_sections?.length > 0 ||
    Boolean(professional_summary) ||
    summary_insights?.length > 0 ||
    risk_flags?.length > 0 ||
    hasLifestyleRecommendationContent(lifestyle_recommendations);

  const showStructuredOnlyNote =
    llm_generated === false && !hasLlmNarrative && hasStructuredBody;

  const periodDays = data?.period_days;
  const generatedStr = generated_at
    ? new Date(generated_at).toLocaleString()
    : new Date().toLocaleString();
  const subscriber = readUserDisplayName();
  const refId = reportRefId(generated_at);
  const overviewLines = overviewBulletsFromSections(report_sections);
  const riskTop = (risk_flags || []).slice(0, 3);

  const llmSecondary = [llm_insights?.highlights, llm_insights?.supportive_note]
    .filter(Boolean)
    .join(" ");

  const getSeverityColor = (severity) => {
    if (!severity) return "#000080";
    switch (String(severity).toLowerCase()) {
      case "high":
        return "#8b0000";
      case "moderate":
        return "#b8860b";
      case "low":
        return "#2e5aac";
      default:
        return "#000080";
    }
  };

  const hasLifestylePdf = hasLifestyleRecommendationContent(lifestyle_recommendations);

  const hasPdfBody =
    hasLlmNarrative ||
    (!hasLlmNarrative && Boolean(professional_summary)) ||
    (!hasLlmNarrative && summary_insights?.length > 0) ||
    overviewLines.length > 0 ||
    riskTop.length > 0 ||
    (report_sections?.length > 0) ||
    hasLifestylePdf;

  const partARef = useRef(null);
  const partBRef = useRef(null);
  const singleRef = useRef(null);
  const sleepTargetRow2 = computeSleepTargetHours(lifestyle_recommendations?.sleep_guidance);

  useImperativeHandle(
    ref,
    () => ({
      getPdfExportSegments: () => {
        if (hasLifestylePdf) {
          return [partARef.current, partBRef.current].filter(Boolean);
        }
        return singleRef.current ? [singleRef.current] : [];
      },
    }),
    [hasLifestylePdf]
  );

  const headerThroughPage1 = (
    <>
      <div className="health-report-pdf-header-top">
        <div className="health-report-pdf-header-cell">
          <div className="health-report-pdf-brand">NIVARA</div>
          <div className="health-report-pdf-brand-sub">WELLNESS INTELLIGENCE</div>
        </div>
        <div className="health-report-pdf-header-cell health-report-pdf-header-center">
          NIVARA HEALTH ANALYTICS
          <br />
          CONFIDENTIAL CLIENT REPORT
        </div>
        <div className="health-report-pdf-header-cell health-report-pdf-header-right">
          DIGITAL WELLNESS LAB
          <div className="health-report-pdf-header-right-sub">Generated document</div>
        </div>
      </div>

      <div className="health-report-pdf-meta">
        <div className="health-report-pdf-meta-col">
          <div className="health-report-pdf-meta-row">
            <span className="health-report-pdf-meta-label">Subscriber / Account: </span>
            <span className="health-report-pdf-meta-value">
              {subscriber ? subscriber.toUpperCase() : "NOT ON FILE"}
            </span>
          </div>
          <div className="health-report-pdf-meta-row">
            <span className="health-report-pdf-meta-label">Report source: </span>
            <span className="health-report-pdf-meta-value">
              {data?.source === "ai_engine" ? "Nivara AI Engine" : "Nivara analytics"}
            </span>
          </div>
          <div className="health-report-pdf-meta-row">
            <span className="health-report-pdf-meta-label">Product: </span>
            <span className="health-report-pdf-meta-value">Nivara wellness platform</span>
          </div>
          {data?.generated_by && (
            <div className="health-report-pdf-meta-row">
              <span className="health-report-pdf-meta-label">Generator: </span>
              <span className="health-report-pdf-meta-value">{data.generated_by}</span>
            </div>
          )}
        </div>
        <div className="health-report-pdf-meta-col">
          <div className="health-report-pdf-meta-row">
            <span className="health-report-pdf-meta-label">Report reference: </span>
            <span className="health-report-pdf-meta-value-navy">{refId}</span>
          </div>
          <div className="health-report-pdf-meta-row">
            <span className="health-report-pdf-meta-label">Report period: </span>
            <span className="health-report-pdf-meta-value">
              {periodDays != null ? `Last ${periodDays} days` : "As specified by system"}
            </span>
          </div>
          <div className="health-report-pdf-meta-row">
            <span className="health-report-pdf-meta-label">Generated at: </span>
            <span className="health-report-pdf-meta-value">{generatedStr}</span>
          </div>
        </div>
      </div>

      <hr className="health-report-pdf-double-rule" />

      <h1 className="health-report-pdf-title">Nivara wellness summary report</h1>

      <hr className="health-report-pdf-double-rule" />

      <div className="health-report-pdf-page1">
        {showStructuredOnlyNote && (
          <p className="health-report-pdf-para health-report-pdf-muted">
            Structured report only — AI narrative is unavailable. Content is derived from logged
            wellness data.
          </p>
        )}

        <PdfReportSectionsBlock reportSections={report_sections} />

        {!(report_sections?.length > 0) && overviewLines.length > 0 && (
          <>
            <h2 className="health-report-pdf-section-title">Key observations</h2>
            <ul className="health-report-pdf-ul health-report-pdf-ul-tight">
              {overviewLines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </>
        )}

        {hasLlmNarrative && (
          <div className="health-report-pdf-narrative">
            <h2 className="health-report-pdf-section-title">Narrative summary</h2>
            {llm_generated && (
              <p className="health-report-pdf-para health-report-pdf-muted health-report-pdf-small">
                Includes AI-assisted language for context only; not a medical diagnosis.
              </p>
            )}
            {llm_insights.professional_summary && (
              <p className="health-report-pdf-para">{llm_insights.professional_summary}</p>
            )}
            {llm_insights.insight_bullets?.length > 0 && (
              <ul className="health-report-pdf-ul health-report-pdf-ul-tight">
                {llm_insights.insight_bullets.map((b, i) => (
                  <li key={i}>{typeof b === "string" ? b : String(b)}</li>
                ))}
              </ul>
            )}
            {llmSecondary && (
              <p className="health-report-pdf-para health-report-pdf-muted health-report-pdf-small">
                {llmSecondary}
              </p>
            )}
          </div>
        )}

        {!hasLlmNarrative && professional_summary && (
          <>
            <h2 className="health-report-pdf-section-title">Professional summary</h2>
            <p className="health-report-pdf-para">{professional_summary}</p>
          </>
        )}

        {!hasLlmNarrative && summary_insights?.length > 0 && (
          <>
            <h2 className="health-report-pdf-section-title">Summary insights</h2>
            <ul className="health-report-pdf-ul health-report-pdf-ul-tight">
              {summary_insights.map((insight, i) => (
                <li key={i}>{insight}</li>
              ))}
            </ul>
          </>
        )}

        {riskTop.length > 0 && (
          <>
            <h2 className="health-report-pdf-section-title">Risk indicators (titles)</h2>
            <ul className="health-report-pdf-ul health-report-pdf-ul-tight">
              {riskTop.map((flag, i) => (
                <li key={flag.id || i}>
                  {flag.severity && (
                    <span
                      style={{
                        color: getSeverityColor(flag.severity),
                        fontWeight: 700,
                        marginRight: "6px",
                      }}
                    >
                      [{String(flag.severity).toUpperCase()}]
                    </span>
                  )}
                  {flag.title || "Flag"}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );

  const footerBlock = (
    <p className="health-report-pdf-footer">
      This report is generated from self-reported wellness data. It does not replace professional
      medical advice, diagnosis, or treatment. Full structured tables and suggestions are available
      in the Nivara app.
    </p>
  );

  if (hasLifestylePdf) {
    return (
      <>
        <div
          ref={partARef}
          className="health-report-pdf-root health-report-pdf-export-segment"
          aria-hidden="true"
        >
          {headerThroughPage1}
          {!hasPdfBody && (
            <p className="health-report-pdf-para health-report-pdf-muted">
              No report body for this period. Continue logging mood and lifestyle data to populate
              this document.
            </p>
          )}
        </div>
        <div
          ref={partBRef}
          className="health-report-pdf-root health-report-pdf-export-segment health-report-pdf-root--lifestyle-second"
          aria-hidden="true"
        >
          <PdfLifestyleFullPageBlock
            recs={lifestyle_recommendations}
            lifestyleLlmGenerated={lifestyle_llm_generated}
            sleepTarget={sleepTargetRow2}
            refId={refId}
            generatedStr={generatedStr}
          />
          {footerBlock}
        </div>
      </>
    );
  }

  return (
    <div ref={singleRef} className="health-report-pdf-root" aria-hidden="true">
      {headerThroughPage1}
      <div className="health-report-pdf-page2">
        {!hasPdfBody && (
          <p className="health-report-pdf-para health-report-pdf-muted">
            No report body for this period. Continue logging mood and lifestyle data to populate
            this document.
          </p>
        )}
        {footerBlock}
      </div>
    </div>
  );
});

export default HealthReportPdfDocument;
