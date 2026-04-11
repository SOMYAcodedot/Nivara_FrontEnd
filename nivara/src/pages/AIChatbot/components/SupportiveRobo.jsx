import React from "react";
import "./SupportiveRobo.css";

/**
 * Companion robot — float, blink, wave.
 * @param {{ placement?: 'header' | 'inline' }} props
 */
export default function SupportiveRobo({ placement = "header" }) {
  const rootClass =
    placement === "header" ? "supportive-robo supportive-robo--header" : "supportive-robo";
  return (
    <div className={rootClass} aria-hidden title="Nivara assistant">
      <span className="supportive-robo-caption">Here for you</span>
      <svg
        className="supportive-robo-svg"
        viewBox="0 0 120 140"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Antenna */}
        <g className="supportive-robo-antenna">
          <line x1="60" y1="18" x2="60" y2="8" stroke="url(#roboGrad)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="60" cy="6" r="5" fill="#f472b6" className="supportive-robo-antenna-ball" />
        </g>
        {/* Head */}
        <rect
          x="32"
          y="22"
          width="56"
          height="48"
          rx="14"
          fill="url(#roboGrad)"
          className="supportive-robo-head"
        />
        {/* Face screen */}
        <rect x="38" y="30" width="44" height="32" rx="8" fill="#1a1a2e" opacity="0.92" />
        {/* Eyes */}
        <g className="supportive-robo-eyes">
          <ellipse cx="50" cy="44" rx="5" ry="6" fill="#7dd3fc" className="supportive-robo-eye" />
          <ellipse cx="70" cy="44" rx="5" ry="6" fill="#7dd3fc" className="supportive-robo-eye" />
        </g>
        {/* Smile */}
        <path
          d="M 48 52 Q 60 58 72 52"
          fill="none"
          stroke="#a5f3fc"
          strokeWidth="2"
          strokeLinecap="round"
          className="supportive-robo-smile"
        />
        {/* Body */}
        <rect
          x="28"
          y="72"
          width="64"
          height="52"
          rx="16"
          fill="url(#roboGrad2)"
          className="supportive-robo-body"
        />
        {/* Heart badge */}
        <path
          className="supportive-robo-heart"
          d="M60 88c-4-6-14-5-14 4 0 8 14 14 14 14s14-6 14-14c0-9-10-10-14-4z"
          fill="#f472b6"
        />
        {/* Arms */}
        <g className="supportive-robo-arm supportive-robo-arm-l">
          <rect x="14" y="78" width="18" height="10" rx="5" fill="#8b5cf6" transform="rotate(-25 23 83)" />
        </g>
        <g className="supportive-robo-arm supportive-robo-arm-r">
          <rect x="88" y="78" width="18" height="10" rx="5" fill="#8b5cf6" transform="rotate(25 97 83)" />
        </g>
        <defs>
          <linearGradient id="roboGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="roboGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="supportive-robo-shadow" />
    </div>
  );
}
