import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes, FaClock, FaBookmark, FaRegBookmark,
  FaShareAlt, FaTwitter, FaLinkedin, FaLink, FaChevronUp,
} from "react-icons/fa";
import { articles } from "../data/articles";
import ArticleCard from "./ArticleCard";

function parseContent(text) {
  return text.split("\n\n").map((block, i) => {
    if (block.startsWith("**") && block.endsWith("**") && !block.slice(2).includes("**")) {
      return <h3 key={i} className="ha-modal-h3">{block.slice(2, -2)}</h3>;
    }
    const parts = block.split(/(\*\*[^*]+\*\*)/g).map((p, j) => {
      if (p.startsWith("**") && p.endsWith("**")) {
        return <strong key={j}>{p.slice(2, -2)}</strong>;
      }
      if (p.startsWith("*") && p.endsWith("*")) {
        return <em key={j}>{p.slice(1, -1)}</em>;
      }
      return p;
    });
    if (block.trim().startsWith("- ")) {
      const items = block.split("\n").filter((l) => l.trim().startsWith("- "));
      return (
        <ul key={i} className="ha-modal-ul">
          {items.map((item, j) => <li key={j}>{item.replace(/^- /, "")}</li>)}
        </ul>
      );
    }
    if (/^\d+\./.test(block.trim())) {
      const items = block.split("\n").filter((l) => /^\d+\./.test(l.trim()));
      return (
        <ol key={i} className="ha-modal-ol">
          {items.map((item, j) => <li key={j}>{item.replace(/^\d+\.\s*/, "")}</li>)}
        </ol>
      );
    }
    return <p key={i} className="ha-modal-p">{parts}</p>;
  });
}

export default function ArticleModal({ article, onClose, onRead }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef(null);
  const related = articles.filter((a) => a.id !== article.id).slice(0, 3);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setProgress(Math.min(100, (scrollTop / (scrollHeight - clientHeight)) * 100));
      setShowTop(scrollTop > 300);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="ha-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="ha-modal"
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.97 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bar */}
          <div className="ha-modal-progress-track">
            <motion.div
              className="ha-modal-progress-fill"
              style={{ width: `${progress}%`, background: article.categoryColor }}
            />
          </div>

          {/* Close button */}
          <button className="ha-modal-close" onClick={onClose} aria-label="Close">
            <FaTimes size={16} />
          </button>

          {/* Scrollable body */}
          <div className="ha-modal-body" ref={bodyRef}>
            {/* Hero image */}
            <div className="ha-modal-hero">
              <img src={article.image} alt={article.title} className="ha-modal-hero-img" />
              <div className="ha-modal-hero-overlay" />
              <div className="ha-modal-hero-content">
                <span className="ha-badge" style={{ background: article.categoryColor + "33", color: article.categoryColor, border: `1px solid ${article.categoryColor}55` }}>
                  {article.category}
                </span>
                <h1 className="ha-modal-title">{article.title}</h1>
                <div className="ha-modal-hero-meta">
                  <span className="ha-modal-author">{article.author}</span>
                  <span className="ha-card-dot">·</span>
                  <span className="ha-modal-time"><FaClock size={12} /> {article.readTime}</span>
                </div>
              </div>
            </div>

            {/* Actions bar */}
            <div className="ha-modal-actions">
              <div className="ha-modal-actions-left">
                <button
                  className={`ha-modal-action-btn${bookmarked ? " ha-modal-action-btn--active" : ""}`}
                  onClick={() => setBookmarked((b) => !b)}
                >
                  {bookmarked ? <FaBookmark size={14} /> : <FaRegBookmark size={14} />}
                  {bookmarked ? "Saved" : "Save"}
                </button>
              </div>
              <div className="ha-modal-actions-right">
                <span className="ha-modal-share-label"><FaShareAlt size={12} /> Share</span>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}`} target="_blank" rel="noreferrer" className="ha-modal-share-btn ha-modal-share-btn--twitter"><FaTwitter size={14} /></a>
                <a href={`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer" className="ha-modal-share-btn ha-modal-share-btn--linkedin"><FaLinkedin size={14} /></a>
                <button className="ha-modal-share-btn" onClick={copyLink} title="Copy link">
                  {copied ? <span style={{ fontSize: 11 }}>Copied!</span> : <FaLink size={13} />}
                </button>
              </div>
            </div>

            {/* Article content */}
            <div className="ha-modal-content">
              <p className="ha-modal-lead">{article.excerpt}</p>
              <div className="ha-modal-divider" style={{ background: article.categoryColor }} />
              {parseContent(article.content)}
            </div>

            {/* Related articles */}
            <div className="ha-modal-related">
              <h2 className="ha-modal-related-title">Related Articles</h2>
              <div className="ha-modal-related-grid">
                {related.map((rel, i) => (
                  <ArticleCard key={rel.id} article={rel} index={i} onRead={onRead} />
                ))}
              </div>
            </div>
          </div>

          {/* Scroll to top */}
          <AnimatePresence>
            {showTop && (
              <motion.button
                className="ha-modal-scroll-top"
                style={{ background: article.categoryColor }}
                onClick={() => bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                aria-label="Scroll to top"
              >
                <FaChevronUp size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
