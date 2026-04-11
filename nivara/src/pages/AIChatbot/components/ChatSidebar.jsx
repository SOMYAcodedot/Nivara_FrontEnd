import React from "react";
import { FaComments, FaChevronLeft, FaPlus } from "react-icons/fa";
import "./ChatSidebar.css";

export default function ChatSidebar({
  sessions,
  sessionId,
  sessionLabel,
  onSelectSession,
  onClose,
  onNewConversation,
  loading,
}) {
  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar-glow" aria-hidden />
      <div className="chat-sidebar-head">
        <div className="chat-sidebar-head-inner">
          <span className="chat-sidebar-icon-wrap">
            <FaComments />
          </span>
          <span className="chat-sidebar-title">Your chats</span>
        </div>
        <button
          type="button"
          className="chat-sidebar-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <FaChevronLeft />
        </button>
      </div>

      <ul className="chat-sidebar-list">
        {sessions.length === 0 && (
          <li className="chat-sidebar-empty">No saved threads yet</li>
        )}
        {sessions.map((s, i) => {
          const id = s.id ?? s.session_id ?? s.pk;
          const active =
            id != null && sessionId != null && Number(id) === Number(sessionId);
          const label = sessionLabel(s);
          return (
            <li
              key={id != null ? String(id) : `s-${i}`}
              className="chat-sidebar-li"
              style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}
            >
              <button
                type="button"
                className={`chat-sidebar-item ${active ? "active" : ""}`}
                onClick={() => onSelectSession(id)}
                disabled={loading}
              >
                <span className="chat-sidebar-item-dot" aria-hidden />
                <span className="chat-sidebar-item-text">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="chat-sidebar-footer">
        <button
          type="button"
          className="chat-sidebar-new"
          onClick={onNewConversation}
          disabled={loading}
        >
          <FaPlus className="chat-sidebar-new-icon" />
          New conversation
        </button>
      </div>
    </aside>
  );
}
