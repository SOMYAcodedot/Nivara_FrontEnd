/**
 * AI Chatbot API — http://localhost:8000/api
 * Guest: POST /chat/nivara/ { message, history } — no auth
 * Logged-in: POST /chat/sessions/ (JWT) → session_id; then POST /chat/nivara/ { message, session_id }
 */

import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

/** Guest — never sends Authorization (CORS + no JWT for /chat/nivara/) */
const guestClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/** JWT for sessions + session-scoped chat */
const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const postNivaraGuest = (message, history = []) =>
  guestClient.post("/chat/nivara/", { message, history }).then((r) => r.data);

/** Logged-in: omit history; backend loads thread by session */
export const postNivaraWithSession = (message, sessionId) =>
  authClient
    .post("/chat/nivara/", { message, session_id: sessionId })
    .then((r) => r.data);

export const createChatSession = (body = {}) =>
  authClient.post("/chat/sessions/", body).then((r) => r.data);

export const listChatSessions = () =>
  authClient.get("/chat/sessions/").then((r) => r.data);

export const getChatSession = (sessionId) =>
  authClient.get(`/chat/sessions/${sessionId}/`).then((r) => r.data);

/**
 * Normalize GET session payload to [{ human_msg, ai_msg }, ...]
 */
export function normalizeSessionThread(data) {
  if (!data) return [];
  if (Array.isArray(data.history) && data.history.length) {
    const h = data.history[0];
    if (h && (h.human_msg != null || h.ai_msg != null)) return data.history;
  }
  if (Array.isArray(data.messages)) {
    const m = data.messages;
    if (m.length && m[0]?.human_msg != null) return m;
    const turns = [];
    for (let i = 0; i < m.length; i++) {
      const row = m[i];
      if (row.human_msg != null && row.ai_msg != null) {
        turns.push({ human_msg: row.human_msg, ai_msg: row.ai_msg });
        continue;
      }
      const role = String(row.role || row.sender || "").toLowerCase();
      const text = row.content ?? row.text ?? row.message ?? "";
      if (role === "user" || role === "human") {
        const next = m[i + 1];
        const nRole = String(next?.role || next?.sender || "").toLowerCase();
        if (next && (nRole === "assistant" || nRole === "ai")) {
          turns.push({
            human_msg: text,
            ai_msg: next.content ?? next.text ?? next.message ?? "",
          });
          i++;
        }
      }
    }
    if (turns.length) return turns;
  }
  return [];
}

export function extractSessionId(res) {
  if (res == null) return null;
  const id = res.session_id ?? res.sessionId ?? res.id;
  return id != null ? Number(id) || id : null;
}

export function extractSessionsList(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.sessions)) return res.sessions;
  if (Array.isArray(res?.results)) return res.results;
  return [];
}

export const chatbotApi = {
  postNivaraGuest,
  postNivaraWithSession,
  createChatSession,
  listChatSessions,
  getChatSession,
  normalizeSessionThread,
  extractSessionId,
  extractSessionsList,
};

export default chatbotApi;
