import React from "react";
import { FaVolumeUp, FaStop } from "react-icons/fa";
import "./ReadAloudBar.css";

/**
 * Premium read-aloud toggle + global stop when TTS is active.
 */
export default function ReadAloudBar({
  readAloudEnabled,
  onReadAloudChange,
  isSpeaking,
  onStopSpeaking,
}) {
  return (
    <div className="read-aloud-bar">
      <button
        type="button"
        className={`read-aloud-toggle ${readAloudEnabled ? "on" : ""}`}
        onClick={() => onReadAloudChange(!readAloudEnabled)}
        aria-pressed={readAloudEnabled}
        aria-label={readAloudEnabled ? "Disable auto read replies" : "Enable auto read replies"}
      >
        <span className="read-aloud-toggle-track">
          <span className="read-aloud-toggle-thumb" />
        </span>
        <span className="read-aloud-toggle-label">
          <FaVolumeUp className="read-aloud-icon" />
          Auto read replies
        </span>
      </button>

      {isSpeaking && (
        <button
          type="button"
          className="read-aloud-stop"
          onClick={onStopSpeaking}
          aria-label="Stop reading aloud"
        >
          <span className="read-aloud-waves" aria-hidden>
            <span />
            <span />
            <span />
            <span />
          </span>
          <FaStop className="read-aloud-stop-icon" />
          Stop reading
        </button>
      )}
    </div>
  );
}
