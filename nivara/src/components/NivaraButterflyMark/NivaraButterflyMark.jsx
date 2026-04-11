import { useId } from "react";
import "./NivaraButterflyMark.css";

/**
 * Nivara brand mark — butterfly silhouette (women’s health / growth / freedom).
 * @param {"gradient" | "mono"} variant — gradient for light backgrounds; mono uses currentColor (e.g. white on accent chips).
 */
export default function NivaraButterflyMark({
  className = "",
  variant = "gradient",
  title = "Nivara",
  decorative = false,
}) {
  const safeId = useId().replace(/:/g, "");
  const gradId = `nbf-w-${safeId}`;
  const bodyGradId = `nbf-b-${safeId}`;

  const wingFill = variant === "mono" ? "currentColor" : `url(#${gradId})`;
  const bodyFill = variant === "mono" ? "currentColor" : `url(#${bodyGradId})`;
  const lineColor = variant === "mono" ? "currentColor" : "#5b3d91";

  return (
    <svg
      className={`nivara-butterfly-mark ${className}`.trim()}
      viewBox="0 0 64 56"
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
      focusable="false"
    >
      {variant === "gradient" && (
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
          <linearGradient id={bodyGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6d5ce8" />
            <stop offset="100%" stopColor="#5a3d8a" />
          </linearGradient>
        </defs>
      )}
      <g className="nivara-butterfly-mark__silhouette">
        <ellipse cx="22" cy="40" rx="11" ry="10" transform="rotate(-32 22 40)" fill={wingFill} />
        <ellipse cx="42" cy="40" rx="11" ry="10" transform="rotate(32 42 40)" fill={wingFill} />
        <ellipse cx="20" cy="22" rx="15" ry="16" transform="rotate(-38 20 22)" fill={wingFill} />
        <ellipse cx="44" cy="22" rx="15" ry="16" transform="rotate(38 44 22)" fill={wingFill} />
        <ellipse cx="32" cy="28" rx="3.3" ry="14" fill={bodyFill} />
        <path
          d="M30 14 Q28 8 25.5 5.5 M34 14 Q36 8 38.5 5.5"
          stroke={lineColor}
          strokeWidth="1.15"
          strokeLinecap="round"
          fill="none"
          opacity={variant === "mono" ? 0.9 : 1}
        />
        <circle cx="25.5" cy="5.5" r="1.1" fill={lineColor} />
        <circle cx="38.5" cy="5.5" r="1.1" fill={lineColor} />
      </g>
    </svg>
  );
}
