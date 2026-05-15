import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTimes } from "react-icons/fa";
import { articles } from "./data/articles";
import ArticleCard from "./components/ArticleCard";
import ArticleModal from "./components/ArticleModal";
import "./HealthAwareness.css";

const ALL = "All";

const categories = [ALL, ...Array.from(new Set(articles.map((a) => a.category)))];

const floatVariants = {
  animate: (i) => ({
    y: [0, -18, 0],
    transition: { duration: 4 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 },
  }),
};

export default function HealthAwareness() {
  const [selected, setSelected] = useState(null);
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [search, setSearch] = useState("");

  const featured = articles[0];
  const rest = articles.slice(1);

  const filtered = useMemo(() => {
    return rest.filter((a) => {
      const matchCat = activeCategory === ALL || a.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch = !q || a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [activeCategory, search, rest]);

  const openArticle = (article) => setSelected(article);
  const closeArticle = () => setSelected(null);

  return (
    <div className="ha-page">
      {/* Ambient background blobs */}
      {[0, 1, 2].map((i) => (
        <motion.div key={i} className={`ha-blob ha-blob-${i + 1}`} custom={i} variants={floatVariants} animate="animate" aria-hidden />
      ))}

      {/* Header */}
      <motion.section
        className="ha-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="ha-header-deco" aria-hidden>
          <span className="ha-deco-circle ha-deco-circle--1" />
          <span className="ha-deco-circle ha-deco-circle--2" />
          <span className="ha-deco-circle ha-deco-circle--3" />
        </div>
        <div className="ha-header-inner">
          <motion.div
            className="ha-header-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.45 }}
          >
            ✦ Wellness Editorial
          </motion.div>
          <h1 className="ha-title">
            Health <span className="ha-title-gradient">Awareness</span>
          </h1>
          <p className="ha-subtitle">
            Trusted wellness insights, self-care guides, and women's health education curated for a healthier life.
          </p>
          <motion.div
            className="ha-title-underline"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </motion.section>

      {/* Search + Filters */}
      <motion.section
        className="ha-controls"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        <div className="ha-search-wrap">
          <FaSearch className="ha-search-icon" size={14} />
          <input
            className="ha-search"
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="ha-search-clear" onClick={() => setSearch("")} aria-label="Clear search">
              <FaTimes size={12} />
            </button>
          )}
        </div>

        <div className="ha-filters" role="group" aria-label="Filter by category">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              className={`ha-filter-pill${activeCategory === cat ? " ha-filter-pill--active" : ""}`}
              onClick={() => setActiveCategory(cat)}
              whileTap={{ scale: 0.95 }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Featured article */}
      {activeCategory === ALL && !search && (
        <motion.section
          className="ha-featured-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="ha-section-label">⭐ Featured Article</div>
          <motion.article
            className="ha-featured-card"
            style={{ "--accent": featured.categoryColor }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
          >
            <div className="ha-featured-img-wrap">
              <img src={featured.image} alt={featured.title} className="ha-featured-img" />
              <div className="ha-featured-img-overlay" />
            </div>
            <div className="ha-featured-body">
              <div className="ha-featured-badges">
                <span className="ha-badge" style={{ background: featured.categoryColor + "22", color: featured.categoryColor, border: `1px solid ${featured.categoryColor}44` }}>
                  {featured.category}
                </span>
                <span className="ha-badge ha-badge--featured">⭐ Featured</span>
              </div>
              <h2 className="ha-featured-title">{featured.title}</h2>
              <p className="ha-featured-excerpt">{featured.excerpt}</p>
              <div className="ha-featured-meta">
                <span>{featured.author}</span>
                <span className="ha-card-dot">·</span>
                <span>{featured.readTime}</span>
              </div>
              <button className="ha-featured-cta" onClick={() => openArticle(featured)}>
                Read Full Article <span>→</span>
              </button>
            </div>
            <div className="ha-card-glow ha-featured-glow" style={{ background: `radial-gradient(circle at 50% 120%, ${featured.categoryColor}44, transparent 70%)` }} />
          </motion.article>
        </motion.section>
      )}

      {/* Article grid */}
      <section className="ha-grid-section">
        {activeCategory === ALL && !search && (
          <div className="ha-section-label">📚 All Articles</div>
        )}
        {filtered.length === 0 ? (
          <motion.div className="ha-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="ha-empty-icon">🌸</div>
            <h3>No articles found</h3>
            <p>Try a different search or category.</p>
            <button className="ha-empty-reset" onClick={() => { setSearch(""); setActiveCategory(ALL); }}>
              Show all articles
            </button>
          </motion.div>
        ) : (
          <motion.div
            className="ha-grid"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          >
            <AnimatePresence>
              {filtered.map((article, i) => (
                <ArticleCard key={article.id} article={article} index={i} onRead={openArticle} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Floating wellness quote */}
      <motion.section
        className="ha-quote-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <blockquote className="ha-quote">
          <span className="ha-quote-mark">"</span>
          Taking care of yourself is the most powerful way to begin to take care of others.
          <span className="ha-quote-author">— Women's Wellness Philosophy</span>
        </blockquote>
      </motion.section>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <ArticleModal article={selected} onClose={closeArticle} onRead={openArticle} />
        )}
      </AnimatePresence>
    </div>
  );
}
