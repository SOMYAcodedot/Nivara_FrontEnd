import { useState } from "react";
import { motion } from "framer-motion";
import { FaClock, FaArrowRight, FaBookmark, FaRegBookmark, FaFire, FaRobot } from "react-icons/fa";

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function ArticleCard({ article, index, onRead, featured = false }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      className={`ha-card${featured ? " ha-card--featured" : ""}`}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ "--accent": article.categoryColor }}
    >
      {/* Image */}
      <div className="ha-card-img-wrap">
        {!imgLoaded && <div className="ha-card-img-skeleton" />}
        <img
          src={article.image}
          alt={article.title}
          className={`ha-card-img${imgLoaded ? " ha-card-img--loaded" : ""}`}
          onLoad={() => setImgLoaded(true)}
        />
        <div className="ha-card-img-overlay" />

        {/* Badges */}
        <div className="ha-card-badges">
          <span className="ha-badge" style={{ background: article.categoryColor + "22", color: article.categoryColor, border: `1px solid ${article.categoryColor}44` }}>
            {article.category}
          </span>
          {article.trending && (
            <span className="ha-badge ha-badge--trending">
              <FaFire size={10} /> Trending
            </span>
          )}
          {article.aiCurated && (
            <span className="ha-badge ha-badge--ai">
              <FaRobot size={10} /> AI Curated
            </span>
          )}
        </div>

        {/* Bookmark */}
        <button
          className={`ha-card-bookmark${bookmarked ? " ha-card-bookmark--active" : ""}`}
          onClick={(e) => { e.stopPropagation(); setBookmarked((b) => !b); }}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark article"}
        >
          {bookmarked ? <FaBookmark size={13} /> : <FaRegBookmark size={13} />}
        </button>
      </div>

      {/* Body */}
      <div className="ha-card-body">
        <div className="ha-card-meta">
          <span className="ha-card-author">{article.author}</span>
          <span className="ha-card-dot">·</span>
          <span className="ha-card-time"><FaClock size={11} /> {article.readTime}</span>
        </div>

        <h3 className="ha-card-title">{article.title}</h3>
        <p className="ha-card-excerpt">{article.excerpt}</p>

        <button
          className="ha-card-cta"
          onClick={() => onRead(article)}
        >
          <span>Read Article</span>
          <motion.span
            animate={{ x: hovered ? 5 : 0 }}
            transition={{ duration: 0.2 }}
            className="ha-card-cta-arrow"
          >
            <FaArrowRight size={13} />
          </motion.span>
        </button>
      </div>

      {/* Hover glow */}
      <div className="ha-card-glow" style={{ background: `radial-gradient(circle at 50% 120%, ${article.categoryColor}33, transparent 70%)` }} />
    </motion.article>
  );
}
