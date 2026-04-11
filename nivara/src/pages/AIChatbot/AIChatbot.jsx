import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FaRobot,
  FaPaperPlane,
  FaSpinner,
  FaMicrophone,
  FaStop,
  FaVolumeUp,
  FaPlus,
  FaComments,
} from "react-icons/fa";
import {
  chatbotApi,
  extractSessionId,
  extractSessionsList,
  normalizeSessionThread,
} from "./chatbotApi";
import { useSpeechVoice } from "./hooks/useSpeechVoice";
import ReadAloudBar from "./components/ReadAloudBar";
import ChatSidebar from "./components/ChatSidebar";
import SupportiveRobo from "./components/SupportiveRobo";
import { formatNivaraAssistantMarkdown } from "./utils/nivaraReplyFormat";
import "./AIChatbot.css";

const getSpeechRecognition = () =>
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const AIChatbot = () => {
  const [history, setHistory] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [listening, setListening] = useState(false);
  const [readAloud, setReadAloud] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const toastTimerRef = useRef(null);
  const isFirstScrollAfterMount = useRef(true);

  const { speak, stop: stopSpeaking, speakingKey, isSpeaking } = useSpeechVoice();

  const isAuthed = !!localStorage.getItem("access_token");

  const showToast = useCallback((message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = setTimeout(() => setToast(""), 5000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      try {
        recognitionRef.current?.stop?.();
      } catch (_) {}
    };
  }, []);

  const refreshSessions = useCallback(async () => {
    if (!isAuthed) return;
    try {
      const data = await chatbotApi.listChatSessions();
      setSessions(extractSessionsList(data));
    } catch (e) {
      console.warn("list sessions:", e);
    }
  }, [isAuthed]);

  const startNewSession = useCallback(async () => {
    if (!isAuthed) return;
    stopSpeaking();
    setLoading(true);
    try {
      const res = await chatbotApi.createChatSession({});
      const sid = extractSessionId(res);
      if (sid == null) throw new Error("No session_id from server");
      setSessionId(sid);
      setHistory(normalizeSessionThread(res).length ? normalizeSessionThread(res) : []);
      isFirstScrollAfterMount.current = true;
      await refreshSessions();
    } catch (err) {
      console.error(err);
      showToast(
        err.response?.status === 401
          ? "Please log in to save chat sessions."
          : err.response?.data?.detail || "Could not start a new chat."
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthed, refreshSessions, showToast, stopSpeaking]);

  useEffect(() => {
    if (isAuthed) {
      refreshSessions();
    } else {
      setSessionId(null);
      setHistory([]);
      setSessions([]);
    }
  }, [isAuthed, refreshSessions]);

  /* Landing on /chat: show top of page (scrollIntoView on messages was scrolling window to bottom) */
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    isFirstScrollAfterMount.current = true;
    const panel = messagesContainerRef.current;
    if (panel) panel.scrollTop = 0;
  }, []);

  useEffect(() => {
    const hasThread = history.length > 0;
    const panel = messagesContainerRef.current;
    if (!panel) return;

    const run = () => {
      if (!hasThread && !loading) {
        panel.scrollTop = 0;
        return;
      }
      const instant = isFirstScrollAfterMount.current && hasThread;
      if (isFirstScrollAfterMount.current) isFirstScrollAfterMount.current = false;
      panel.scrollTo({
        top: panel.scrollHeight,
        behavior: instant ? "auto" : loading ? "auto" : "smooth",
      });
    };

    const id = requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });
    return () => cancelAnimationFrame(id);
  }, [history, loading]);

  const mergeNivaraResult = (message, data, prevHistory) => {
    if (Array.isArray(data.history) && data.history.length) {
      const first = data.history[0];
      if (first && (first.human_msg != null || first.ai_msg != null))
        return data.history;
    }
    const reply = data.reply ?? data.message ?? "";
    return [...prevHistory, { human_msg: message, ai_msg: reply }];
  };

  const handleSend = async () => {
    const message = inputMessage.trim();
    if (!message || loading) return;

    setInputMessage("");
    setLoading(true);

    try {
      let data;
      if (isAuthed) {
        let sid = sessionId;
        if (sid == null) {
          const created = await chatbotApi.createChatSession({});
          sid = extractSessionId(created);
          if (sid == null) throw new Error("No session_id from server");
          setSessionId(sid);
          await refreshSessions();
        }
        data = await chatbotApi.postNivaraWithSession(message, sid);
        refreshSessions();
      } else {
        data = await chatbotApi.postNivaraGuest(message, history);
      }
      const sidFromReply = extractSessionId(data);
      if (sidFromReply != null) setSessionId(sidFromReply);
      setHistory((prev) => mergeNivaraResult(message, data, prev));
      const replyText =
        data.reply ||
        (Array.isArray(data.history) && data.history.length
          ? data.history[data.history.length - 1]?.ai_msg
          : "");
      if (readAloud && replyText) {
        speak(replyText, `auto-${Date.now()}`);
      }
    } catch (err) {
      console.error("Chatbot error:", err);
      const status = err.response?.status;
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "Something went wrong. Please try again.";
      if (!err.response) {
        showToast("Network error — check that the server is running.");
      } else if (status >= 500) {
        showToast("Server error — please try again later.");
      } else {
        showToast(typeof detail === "string" ? detail : "Request failed.");
      }
      setInputMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    stopSpeaking();
    if (isAuthed) await startNewSession();
    else {
      setHistory([]);
      isFirstScrollAfterMount.current = true;
      if (messagesContainerRef.current) messagesContainerRef.current.scrollTop = 0;
      showToast("New guest thread — previous messages cleared in this tab.");
    }
  };

  const loadSession = async (id) => {
    if (!id || loading) return;
    stopSpeaking();
    setLoading(true);
    try {
      const data = await chatbotApi.getChatSession(id);
      setSessionId(extractSessionId(data) ?? id);
      setHistory(normalizeSessionThread(data));
      isFirstScrollAfterMount.current = true;
      if (window.innerWidth < 900) setSidebarOpen(false);
    } catch (err) {
      showToast(
        err.response?.status === 404
          ? "That chat was not found."
          : err.response?.data?.detail || "Could not load chat."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMic = () => {
    const SR = getSpeechRecognition();
    if (!SR) {
      showToast("Voice input is not supported in this browser.");
      return;
    }
    if (listening) {
      try {
        recognitionRef.current?.stop?.();
      } catch (_) {}
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = "en-IN";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (event) => {
      const t = event.results[0]?.[0]?.transcript?.trim();
      if (t) setInputMessage((prev) => (prev ? `${prev} ${t}` : t));
      setListening(false);
    };
    rec.onerror = () => {
      setListening(false);
      showToast("Could not capture speech. Check mic permission.");
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch (_) {
      showToast("Could not start microphone.");
    }
  };

  const sessionLabel = (s) => {
    const id = s.id ?? s.session_id ?? s.pk;
    return (
      s.title ||
      s.subject ||
      (s.updated_at && new Date(s.updated_at).toLocaleString()) ||
      `Chat ${id ?? ""}`
    );
  };

  return (
    <div className="ai-chatbot-page">
      <div className="ai-chatbot-page-bg" aria-hidden />

      {toast && (
        <div className="ai-chatbot-toast" role="status">
          {toast}
        </div>
      )}

      <section className="ai-chatbot-header ai-chatbot-header--light">
        <div className="ai-chatbot-header-shimmer" aria-hidden />
        <div className="ai-chatbot-header-content">
          <div className="ai-chatbot-header-left">
            <div className="ai-chatbot-header-icon">
              <FaRobot />
            </div>
            <div className="ai-chatbot-header-text">
              <h1>AI Chatbot</h1>
              <p>
                {isAuthed
                  ? "Signed in — chats are saved per session. Start a new thread anytime."
                  : "Guest mode — history is sent with each message only in this browser."}
              </p>
            </div>
          </div>
          <div className="ai-chatbot-header-mascot">
            <SupportiveRobo placement="header" />
          </div>
          <div className="ai-chatbot-header-actions">
            <ReadAloudBar
              readAloudEnabled={readAloud}
              onReadAloudChange={setReadAloud}
              isSpeaking={isSpeaking}
              onStopSpeaking={stopSpeaking}
            />
            <button
              type="button"
              className="ai-chatbot-btn-new-chat"
              onClick={handleNewChat}
              disabled={loading}
            >
              <FaPlus className="ai-chatbot-btn-new-chat-icon" aria-hidden />
              New chat
            </button>
          </div>
        </div>
      </section>

      <div className={`ai-chatbot-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
        {isAuthed && (
          <div className="ai-chatbot-sidebar-wrap">
            <ChatSidebar
              sessions={sessions}
              sessionId={sessionId}
              sessionLabel={sessionLabel}
              onSelectSession={loadSession}
              onClose={() => setSidebarOpen(false)}
              onNewConversation={handleNewChat}
              loading={loading}
            />
          </div>
        )}

        <section className="ai-chatbot-main">
          {isAuthed && !sidebarOpen && (
            <button
              type="button"
              className="ai-chatbot-open-sidebar"
              onClick={() => setSidebarOpen(true)}
            >
              <FaComments /> Chats
            </button>
          )}
          <div className="ai-chatbot-card">
            <div
              className="ai-chatbot-messages"
              ref={messagesContainerRef}
              role="log"
              aria-live="polite"
              aria-relevant="additions"
            >
              {history.length === 0 && !loading && (
                <div className="ai-chatbot-welcome">
                  <span className="welcome-orbit" aria-hidden />
                  <FaRobot className="welcome-icon" />
                  <p>
                    Hi! I&apos;m your Nivara assistant. Ask about wellness, periods, mood, or
                    general health.
                  </p>
                </div>
              )}
              {history.map((turn, index) => {
                const speakKey = `turn-${index}`;
                const autoOnLast =
                  speakingKey != null &&
                  String(speakingKey).startsWith("auto-") &&
                  index === history.length - 1;
                const showPlaying = speakingKey === speakKey || autoOnLast;

                return (
                  <div
                    key={`${index}-${turn.human_msg?.slice(0, 12)}`}
                    className="chat-turn"
                    style={{ animationDelay: `${Math.min(index, 12) * 0.06}s` }}
                  >
                    <div className="chat-message user">
                      <span className="message-label">You</span>
                      <div className="message-bubble user-bubble" style={{ whiteSpace: "pre-line" }}>
                        {turn.human_msg}
                      </div>
                    </div>
                    <div className="chat-message assistant">
                      <span className="message-label">Nivara</span>
                      <div className="assistant-row">
                        <div className="message-bubble assistant-bubble nivara-reply">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {formatNivaraAssistantMarkdown(turn.ai_msg)}
                          </ReactMarkdown>
                        </div>
                        <button
                          type="button"
                          className={`ai-chatbot-speak-btn ${showPlaying ? "playing" : ""}`}
                          title={showPlaying ? "Stop" : "Read aloud"}
                          aria-label={showPlaying ? "Stop reading" : "Read this reply aloud"}
                          onClick={() =>
                            showPlaying ? stopSpeaking() : speak(turn.ai_msg, speakKey)
                          }
                        >
                          {showPlaying ? <FaStop /> : <FaVolumeUp />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="chat-message assistant chat-typing-wrap">
                  <span className="message-label">Nivara</span>
                  <div className="message-bubble assistant-bubble typing">
                    <span className="typing-dots" aria-hidden>
                      <span />
                      <span />
                      <span />
                    </span>
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            <div className="ai-chatbot-input-wrap">
              <button
                type="button"
                className={`ai-chatbot-mic ${listening ? "active" : ""}`}
                onClick={toggleMic}
                disabled={loading}
                aria-label={listening ? "Stop recording" : "Voice input"}
                title="Voice input (English India)"
              >
                {listening ? <FaStop /> : <FaMicrophone />}
              </button>
              <textarea
                className="ai-chatbot-input"
                placeholder="Type or use the mic…"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                rows={1}
              />
              <button
                type="button"
                className="ai-chatbot-send"
                onClick={handleSend}
                disabled={loading || !inputMessage.trim()}
                aria-label="Send message"
              >
                {loading ? <FaSpinner className="spin" /> : <FaPaperPlane />}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AIChatbot;
