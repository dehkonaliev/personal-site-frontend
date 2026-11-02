import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const MOBILE_QUERY = "(max-width: 767px)";

interface SeeMoreTextProps {
  text: string;
  className?: string;
}

const isPhone = () =>
  typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches;

export default function SeeMoreText({ text, className = "" }: SeeMoreTextProps) {
  const { t } = useTranslation();
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isMobile, setIsMobile] = useState(isPhone);
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(isPhone);
  const [overflowing, setOverflowing] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState(0);
  const [fullHeight, setFullHeight] = useState(0);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const update = () => {
      setIsMobile(query.matches);
      setClamped(query.matches);
      if (!query.matches) setExpanded(false);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const element = textRef.current;
    if (!element || !isMobile) return;

    const measure = () => {
      const full = element.scrollHeight;
      setFullHeight(full);
      if (clamped) {
        const collapsed = element.clientHeight;
        setCollapsedHeight(collapsed);
        setOverflowing(full > collapsed + 1);
      }
    };

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text, isMobile, clamped]);

  useEffect(() => {
    if (!isMobile || expanded || clamped) return;
    const timer = window.setTimeout(() => setClamped(true), 300);
    return () => window.clearTimeout(timer);
  }, [isMobile, expanded, clamped]);

  const toggle = () => {
    if (expanded) {
      setExpanded(false);
      return;
    }

    const element = textRef.current;
    if (element) setFullHeight(element.scrollHeight);
    setExpanded(true);
    setClamped(false);
  };

  const animate = isMobile && collapsedHeight > 0;
  const maxHeight = animate
    ? expanded
      ? `${fullHeight}px`
      : `${collapsedHeight}px`
    : undefined;

  return (
    <div className={className}>
      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out motion-reduce:transition-none"
        style={{ maxHeight }}
      >
        <p ref={textRef} className={clamped ? "line-clamp-1" : undefined}>
          {text}
        </p>
      </div>
      {isMobile && (overflowing || expanded) && (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={expanded}
          className="mt-1 inline-flex items-center text-sm font-medium text-signal transition-opacity duration-300 hover:underline"
        >
          {expanded ? t("common.seeLess") : t("common.seeMore")}
        </button>
      )}
    </div>
  );
}
