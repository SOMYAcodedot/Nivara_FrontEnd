import React, { useState, useEffect, useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaFileAlt,
  FaSyncAlt,
  FaExclamationTriangle,
  FaRobot,
  FaPrint,
  FaExclamationCircle,
  FaLightbulb,
  FaCheckCircle,
} from "react-icons/fa";
import "./HealthReport.css";
import { tryRefreshAccessToken, friendlyApiError } from "../../utils/apiAuth";
import {
  ensureMinElapsed,
  MIN_AWARE_LOADING_MS,
} from "../../utils/minLoadingDelay";
import HealthReportPdfDocument from "./HealthReportPdfDocument";
import { exportHealthReportPdf } from "./exportHealthReportPdf";
import LifestyleRecommendationsBlock from "./LifestyleRecommendationsBlock";
import { hasLifestyleRecommendationContent } from "../../utils/lifestyleRecsHasContent";

const API_BASE_URL = "http://localhost:8000/api";

const REPORT_VALUE_DEPTH_MAX = 6;

function humanizeReportKey(key) {
  if (key == null || typeof key !== "string") return "";
  return key
    .split("_")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");
}

function formatScalarReportValue(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "—";
    if (Number.isInteger(value)) return String(value);
    const t = value.toFixed(2);
    return t.replace(/\.?0+$/, "");
  }
  if (typeof value === "string") return value.trim() === "" ? null : value;
  return String(value);
}

function renderReportValueNode(value, depth) {
  if (depth > REPORT_VALUE_DEPTH_MAX) {
    return <span className="report-value-muted">…</span>;
  }

  if (value === null || value === undefined) {
    return <span className="report-value-muted">Not recorded</span>;
  }

  if (typeof value === "boolean") {
    return <span>{value ? "Yes" : "No"}</span>;
  }

  if (typeof value === "number") {
    const s = formatScalarReportValue(value);
    return <span>{s ?? "—"}</span>;
  }

  if (typeof value === "string") {
    const s = formatScalarReportValue(value);
    if (s == null) {
      return <span className="report-value-muted">Not recorded</span>;
    }
    return <span>{s}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="report-value-muted">None noted</span>;
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
      const parts = value.map((item) => formatScalarReportValue(item) ?? "—");
      return <span className="report-inline-values">{parts.join(" · ")}</span>;
    }
    return (
      <ul className="report-nested-ul">
        {value.map((item, i) => (
          <li key={i}>
            {item !== null &&
            typeof item === "object" &&
            !Array.isArray(item) ? (
              renderReportObjectDl(item, depth + 1)
            ) : (
              renderReportValueNode(item, depth + 1)
            )}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof value === "object") {
    return renderReportObjectDl(value, depth + 1);
  }

  return <span>{String(value)}</span>;
}

function renderReportObjectDl(obj, depth = 0) {
  const entries = Object.entries(obj || {}).filter(
    ([, v]) => v !== undefined
  );
  if (entries.length === 0) {
    return <span className="report-value-muted">—</span>;
  }

  return (
    <dl className={`report-content-dl report-content-dl-depth-${Math.min(depth, 3)}`}>
      {entries.map(([key, val]) => (
        <React.Fragment key={key}>
          <dt>{humanizeReportKey(key)}</dt>
          <dd>{renderReportValueNode(val, depth + 1)}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

function renderReportSectionContent(content) {
  if (content == null) return null;
  if (typeof content === "string") {
    return <p className="section-content-text">{content}</p>;
  }
  if (Array.isArray(content)) {
    return (
      <ul className="section-content-ul">
        {content.map((item, i) => (
          <li key={i}>
            {item !== null && typeof item === "object" && !Array.isArray(item) ? (
              renderReportObjectDl(item)
            ) : (
              renderReportValueNode(item, 0)
            )}
          </li>
        ))}
      </ul>
    );
  }
  if (typeof content === "object") {
    return renderReportObjectDl(content, 0);
  }
  return null;
}

const HealthReport = () => {
  const location = useLocation();
  const pdfDocRef = useRef(null);
  const mountedRef = useRef(true);
  const healthBannerDelayConsumedRef = useRef(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [pdfExportPayload, setPdfExportPayload] = useState(null);
  const [days] = useState(30);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchReport = useCallback(async () => {
    const started = Date.now();
    let minMs = MIN_AWARE_LOADING_MS;
    if (
      location.state?.fromHealthReportBanner === true &&
      !healthBannerDelayConsumedRef.current
    ) {
      healthBannerDelayConsumedRef.current = true;
      minMs = 0;
    }
    setLoading(true);
    setError("");
    const url = `${API_BASE_URL}/report/summary/?days=${days}`;
    const getOnce = (token) =>
      axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
    try {
      const token = localStorage.getItem("access_token");
      let response;
      try {
        response = await getOnce(token);
      } catch (firstErr) {
        if (firstErr.response?.status === 401) {
          const next = await tryRefreshAccessToken();
          if (next) {
            response = await getOnce(next);
          } else {
            throw firstErr;
          }
        } else {
          throw firstErr;
        }
      }
      setData(response.data);
    } catch (err) {
      console.error("Error fetching health report:", err);
      setError(
        friendlyApiError(err, "Failed to load your health report. Please try again shortly.")
      );
      setData(null);
    } finally {
      await ensureMinElapsed(started, minMs);
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [days, location.state?.fromHealthReportBanner]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport, location.key]);

  const handleExportPdf = useCallback(async () => {
    const element = pdfDocRef.current;
    if (!element) return;
    setExporting(true);
    const exportUrl = `${API_BASE_URL}/report/summary/export/?days=${days}`;
    const getExport = (token) =>
      axios.get(exportUrl, { headers: { Authorization: `Bearer ${token}` } });
    try {
      const token = localStorage.getItem("access_token");
      let exportRes;
      try {
        exportRes = await getExport(token);
      } catch (firstErr) {
        if (firstErr.response?.status === 401) {
          const next = await tryRefreshAccessToken();
          if (next) {
            exportRes = await getExport(next);
          } else {
            throw firstErr;
          }
        } else {
          throw firstErr;
        }
      }
      flushSync(() => {
        setPdfExportPayload(exportRes.data);
      });
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });
      await exportHealthReportPdf(element, "Nivara_Health_Report.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      flushSync(() => {
        setPdfExportPayload(null);
      });
      setExporting(false);
    }
  }, [days]);

  const getSeverityColor = (severity) => {
    if (!severity) return "#666";
    switch (String(severity).toLowerCase()) {
      case "high":
        return "#EF5350";
      case "moderate":
        return "#FF9800";
      case "low":
        return "#FFC107";
      default:
        return "#666";
    }
  };

  const getPriorityColor = (priority) => {
    if (!priority) return "#667eea";
    switch (String(priority).toLowerCase()) {
      case "high":
        return "#EF5350";
      case "medium":
        return "#FF9800";
      case "low":
        return "#4CAF50";
      default:
        return "#667eea";
    }
  };

  if (loading && !data) {
    return (
      <div className="health-report-page">
        <div className="loading-container loading-container-aware">
          <div className="loading-spinner"></div>
          <p className="loading-title">Preparing your health report</p>
          <p className="loading-sub">
            Compiling mood, stress, cycle, and lifestyle signals into your summary…
          </p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="health-report-page">
        <div className="page-header">
          <div className="header-content">
            <h1>
              <FaFileAlt className="header-icon" /> AI Health Report
            </h1>
            <p>Your wellness summary from mood, cycle, stress and lifestyle data</p>
          </div>
        </div>
        <div className="error-container">
          <FaExclamationTriangle className="error-icon" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const report = data?.report || {};
  const {
    report_sections = [],
    risk_flags = [],
    suggestions = [],
    summary_insights = [],
    professional_summary,
    generated_at,
    llm_insights,
    llm_generated,
    lifestyle_recommendations,
    lifestyle_llm_generated,
  } = report;

  const hasLlmNarrative =
    llm_insights &&
    typeof llm_insights === "object" &&
    (Boolean(llm_insights.professional_summary) ||
      (Array.isArray(llm_insights.insight_bullets) &&
        llm_insights.insight_bullets.length > 0) ||
      Boolean(llm_insights.highlights) ||
      Boolean(llm_insights.supportive_note));

  const hasLifestyleRecs = hasLifestyleRecommendationContent(lifestyle_recommendations);

  const hasStructuredBody =
    report_sections?.length > 0 ||
    Boolean(professional_summary) ||
    summary_insights?.length > 0 ||
    risk_flags?.length > 0 ||
    suggestions?.length > 0 ||
    hasLifestyleRecs;

  const showStructuredOnlyNote =
    llm_generated === false && !hasLlmNarrative && hasStructuredBody;

  return (
    <div className="health-report-page health-report-page-with-overlay">
      {loading && data && (
        <div
          className="page-refresh-overlay no-print"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="page-refresh-overlay-inner">
            <div className="loading-spinner"></div>
            <p className="loading-title">Refreshing your report</p>
            <p className="loading-sub">Pulling the latest wellness summary…</p>
          </div>
        </div>
      )}
      <div className="health-report-print-area">
        <div className="page-header">
          <div className="header-content">
            <h1>
              <FaFileAlt className="header-icon" /> AI Health Report
            </h1>
            <p>Your wellness summary from mood, cycle, stress and lifestyle data</p>
          </div>
          <div className="header-actions no-print">
            <button
              className="refresh-btn"
              onClick={() => fetchReport()}
              disabled={loading}
              title="Regenerate report"
            >
              <FaSyncAlt className={loading ? "spin" : ""} /> {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              className="export-btn"
              onClick={handleExportPdf}
              disabled={exporting}
              title="Download PDF"
            >
              <FaPrint /> {exporting ? "Generating PDF..." : "Export to PDF"}
            </button>
          </div>
        </div>

        {/* AI Engine badge & message */}
      {(data?.source === "ai_engine" || data?.generated_by || data?.message) && (
        <section className="ai-engine-banner">
          {data.source === "ai_engine" && (
            <span className="ai-powered-badge">
              <FaRobot /> Powered by AI Engine
            </span>
          )}
          {data.generated_by && (
            <h3 className="ai-generated-by">{data.generated_by}</h3>
          )}
          {data.message && (
            <p className="ai-message">{data.message}</p>
          )}
          {data.period_days != null && (
            <p className="ai-period">Report period: last {data.period_days} days</p>
          )}
          {generated_at && (
            <p className="ai-generated-at">Generated at: {new Date(generated_at).toLocaleString()}</p>
          )}
        </section>
      )}

      {showStructuredOnlyNote && (
        <p className="structured-report-note" role="status">
          Structured report only — AI narrative is unavailable right now. Sections below are
          based on your logged data.
        </p>
      )}

      {/* LLM narrative (distinct from rule-based professional_summary) */}
      {hasLlmNarrative && (
        <section className="report-block llm-summary-block">
          <div className="llm-summary-header">
            <h2 className="block-title llm-summary-title">
              <FaRobot /> AI summary
            </h2>
            {llm_generated && (
              <span className="llm-summary-badge">Personalized with AI</span>
            )}
          </div>
          {llm_insights.professional_summary && (
            <p className="llm-summary-lead">{llm_insights.professional_summary}</p>
          )}
          {llm_insights.insight_bullets?.length > 0 && (
            <ul className="llm-insight-bullets">
              {llm_insights.insight_bullets.map((b, i) => (
                <li key={i}>{typeof b === "string" ? b : String(b)}</li>
              ))}
            </ul>
          )}
          {llm_insights.highlights && (
            <p className="llm-secondary-text llm-highlights">{llm_insights.highlights}</p>
          )}
          {llm_insights.supportive_note && (
            <p className="llm-secondary-text llm-supportive">{llm_insights.supportive_note}</p>
          )}
        </section>
      )}

      {/* Rule-based summary (hidden when LLM narrative is present to avoid repeating the same facts) */}
      {professional_summary && !hasLlmNarrative && (
        <section className="report-block professional-summary-block">
          <h2 className="block-title">Professional Summary</h2>
          <p className="professional-summary-text">{professional_summary}</p>
        </section>
      )}

      {summary_insights?.length > 0 && !hasLlmNarrative && (
        <section className="report-block insights-block">
          <h2 className="block-title">
            <FaLightbulb /> Summary Insights
          </h2>
          <ul className="insights-list">
            {summary_insights.map((insight, i) => (
              <li key={i}>{insight}</li>
            ))}
          </ul>
        </section>
      )}

      {hasLifestyleRecs && (
        <LifestyleRecommendationsBlock
          recommendations={lifestyle_recommendations}
          lifestyleLlmGenerated={lifestyle_llm_generated}
        />
      )}

      {/* Report sections */}
      {report_sections?.length > 0 && (
        <section className="report-sections">
          <h2 className="section-title">Report Sections</h2>
          <div className="sections-grid">
            {report_sections.map((sec) => (
              <div key={sec.id || sec.title} className="report-section-card">
                <h3 className="section-card-title">{sec.title}</h3>
                {sec.summary && (
                  <p className="section-summary">{sec.summary}</p>
                )}
                {sec.content && (
                  <div className="section-content">
                    {renderReportSectionContent(sec.content)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Risk flags */}
      {risk_flags?.length > 0 && (
        <section className="report-block risk-flags-block">
          <h2 className="block-title">
            <FaExclamationCircle /> Risk Flags
          </h2>
          <div className="risk-flags-list">
            {risk_flags.map((flag, i) => (
              <div
                key={flag.id || i}
                className="risk-flag-item"
                style={{ borderLeftColor: getSeverityColor(flag.severity) }}
              >
                <span className="risk-flag-severity" style={{ color: getSeverityColor(flag.severity) }}>
                  {flag.severity}
                </span>
                {flag.title && <h4 className="risk-flag-title">{flag.title}</h4>}
                {flag.description && <p className="risk-flag-desc">{flag.description}</p>}
                {flag.category && (
                  <span className="risk-flag-category">Category: {flag.category}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Suggestions */}
      {suggestions?.length > 0 && (
        <section className="report-block suggestions-block">
          <h2 className="block-title">
            <FaCheckCircle /> Suggestions
          </h2>
          <div className="suggestions-list">
            {suggestions.map((sug, i) => (
              <div key={i} className="suggestion-item">
                <span
                  className="suggestion-priority"
                  style={{ background: getPriorityColor(sug.priority), color: "#fff" }}
                >
                  {sug.priority || "General"}
                </span>
                {sug.area && <span className="suggestion-area">{sug.area}</span>}
                {sug.title && <h4 className="suggestion-title">{sug.title}</h4>}
                {sug.action && <p className="suggestion-action">{sug.action}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {!report_sections?.length &&
        !professional_summary &&
        !summary_insights?.length &&
        !hasLlmNarrative &&
        !hasLifestyleRecs && (
        <p className="no-data-note">
          No report content yet. Add mood logs and optional cycle data to generate a full
          report.
        </p>
      )}
      </div>

      {(data || pdfExportPayload) && (
        <HealthReportPdfDocument
          ref={pdfDocRef}
          data={pdfExportPayload ?? data}
          report={(pdfExportPayload ?? data)?.report || {}}
        />
      )}
    </div>
  );
};

export default HealthReport;
