import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
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

const API_BASE_URL = "http://localhost:8000/api";

const HealthReport = () => {
  const reportRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [days] = useState(30);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE_URL}/report/summary/?days=${days}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data);
    } catch (err) {
      console.error("Error fetching health report:", err);
      setError(
        err.response?.status === 401
          ? "Please log in to generate your health report."
          : err.response?.data?.detail || "Failed to load report."
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExportPdf = useCallback(async () => {
    const element = reportRef.current;
    if (!element) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        ignoreElements: (el) => el.classList.contains("no-print"),
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      let heightLeft = imgHeight - pageHeight;
      let position = -pageHeight;
      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        position -= pageHeight;
        heightLeft -= pageHeight;
      }
      pdf.save("Nivara_Health_Report.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  }, []);

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

  const renderContent = (content) => {
    if (content == null) return null;
    if (typeof content === "string") return <p>{content}</p>;
    if (Array.isArray(content)) {
      return (
        <ul>
          {content.map((item, i) => (
            <li key={i}>{typeof item === "object" ? JSON.stringify(item) : String(item)}</li>
          ))}
        </ul>
      );
    }
    if (typeof content === "object") {
      return (
        <ul className="report-content-list">
          {Object.entries(content).map(([key, value]) => (
            <li key={key}>
              <strong>{key.replace(/_/g, " ")}:</strong>{" "}
              {typeof value === "object" ? JSON.stringify(value) : String(value)}
            </li>
          ))}
        </ul>
      );
    }
    return null;
  };

  if (loading && !data) {
    return (
      <div className="health-report-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Generating your AI health report...</p>
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
  } = report;

  return (
    <div className="health-report-page">
      <div ref={reportRef} className="health-report-print-area">
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

      {/* Professional summary */}
      {professional_summary && (
        <section className="report-block professional-summary-block">
          <h2 className="block-title">Professional Summary</h2>
          <p className="professional-summary-text">{professional_summary}</p>
        </section>
      )}

      {/* Summary insights */}
      {summary_insights?.length > 0 && (
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
                    {renderContent(sec.content)}
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

      {!report_sections?.length && !professional_summary && !summary_insights?.length && (
        <p className="no-data-note">No report content yet. Add mood logs and optional cycle data to generate a full report.</p>
      )}
      </div>
    </div>
  );
};

export default HealthReport;
