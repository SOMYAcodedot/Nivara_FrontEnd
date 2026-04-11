import { useState, useCallback, useRef, useEffect } from "react";

const stripMarkdownForSpeech = (s) =>
  String(s)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_~>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const FEMALE_HINT =
  /female|zira|hazel|raveena|veena|samantha|karen|moira|tessa|fiona|serena|emma|amy|joanna|kimberly|ivy|nicole|salli|marlene|vicki|helena|ines|carmen|laura|linda|susan|victoria|priya|swara|aditi|pooja|google uk english female|microsoft.*zira|microsoft.*hazel/i;
const MALE_HINT =
  /male|^david\b|^daniel\b|^fred\b|^james\b|^mark\b|^richard\b|^tom\b|^thomas\b|^arthur\b|^brian\b|^ralph\b|^alex\b|^bruce\b/i;

function pickFemaleVoice(voices) {
  if (!voices?.length) return null;
  const L = (v) => (v.lang || "").toLowerCase().replace("_", "-");
  const name = (v) => (v.name || "").toLowerCase();

  const hit = voices.find((v) => FEMALE_HINT.test(name(v)));
  if (hit) return hit;

  const enIN = voices.filter((v) => L(v).startsWith("en-in"));
  const inOk = enIN.find((v) => !MALE_HINT.test(name(v)));
  if (inOk) return inOk;

  const en = voices.filter((v) => L(v).startsWith("en"));
  const enFemale = en.find((v) => FEMALE_HINT.test(name(v)));
  if (enFemale) return enFemale;

  const enNotMale = en.find((v) => !MALE_HINT.test(name(v)));
  return enNotMale || en[0] || null;
}

/**
 * TTS with female voice preference (en-IN friendly), trackable key + stop.
 */
export function useSpeechVoice() {
  const [speakingKey, setSpeakingKey] = useState(null);
  const keyRef = useRef(null);
  const voiceRef = useRef(null);

  useEffect(() => {
    const load = () => {
      const v = pickFemaleVoice(window.speechSynthesis?.getVoices?.() || []);
      if (v) voiceRef.current = v;
    };
    load();
    window.speechSynthesis?.addEventListener?.("voiceschanged", load);
    return () => window.speechSynthesis?.removeEventListener?.("voiceschanged", load);
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    keyRef.current = null;
    setSpeakingKey(null);
  }, []);

  const speak = useCallback((text, key) => {
    if (!text || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const plain = stripMarkdownForSpeech(text);
    if (!plain) return;

    keyRef.current = key;
    setSpeakingKey(key);

    const voices = window.speechSynthesis.getVoices();
    const voice = pickFemaleVoice(voices) || voiceRef.current;
    if (voice) voiceRef.current = voice;

    const u = new SpeechSynthesisUtterance(plain);
    u.lang = voice?.lang?.replace("_", "-") || "en-IN";
    if (voice) u.voice = voice;
    u.rate = 0.92;
    u.pitch = 1.08;
    u.volume = 1;

    const done = () => {
      if (keyRef.current === key) {
        keyRef.current = null;
        setSpeakingKey(null);
      }
    };
    u.onend = done;
    u.onerror = done;
    window.speechSynthesis.speak(u);
  }, []);

  useEffect(() => () => stop(), [stop]);

  return {
    speak,
    stop,
    speakingKey,
    isSpeaking: speakingKey != null,
  };
}
