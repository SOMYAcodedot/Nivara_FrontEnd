import { useEffect, useMemo, useRef, useState } from "react";

const NUMBER_PREFIX_PATTERN = /^(\D*)(\d+)(.*)$/;

const parseStatValue = (value) => {
  const text = String(value ?? "").trim();
  const match = text.match(NUMBER_PREFIX_PATTERN);

  if (!match) {
    return { prefix: "", target: 0, suffix: text, hasNumber: false };
  }

  return {
    prefix: match[1],
    target: Number(match[2]),
    suffix: match[3],
    hasNumber: true,
  };
};

const AnimatedStatNumber = ({ value, duration = 1200 }) => {
  const numberRef = useRef(null);
  const parsed = useMemo(() => parseStatValue(value), [value]);
  const [current, setCurrent] = useState(parsed.hasNumber ? 0 : parsed.suffix);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!numberRef.current || !parsed.hasNumber) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    observer.observe(numberRef.current);

    return () => {
      observer.disconnect();
    };
  }, [parsed.hasNumber]);

  useEffect(() => {
    if (!parsed.hasNumber) {
      setCurrent(parsed.suffix);
      return undefined;
    }

    if (!isInView) {
      setCurrent(0);
      return undefined;
    }

    const frameTime = 1000 / 60;
    const totalFrames = Math.max(1, Math.round(duration / frameTime));
    let frame = 0;
    setCurrent(0);

    const intervalId = window.setInterval(() => {
      frame += 1;
      const progress = frame / totalFrames;
      const eased = 1 - (1 - progress) ** 3;
      const nextValue = Math.min(parsed.target, Math.round(parsed.target * eased));

      setCurrent(nextValue);

      if (frame >= totalFrames) {
        window.clearInterval(intervalId);
      }
    }, frameTime);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [duration, isInView, parsed]);

  const displayValue = parsed.hasNumber
    ? `${parsed.prefix}${current}${parsed.suffix}`
    : current;

  return <span ref={numberRef}>{displayValue}</span>;
};

export default AnimatedStatNumber;
