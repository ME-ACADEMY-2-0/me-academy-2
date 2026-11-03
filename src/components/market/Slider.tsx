"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Horizontal scroll-snap slider with a progress bar and previous/next buttons.
export function Slider({ children, label }: { children: React.ReactNode; label: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const measure = () => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 1);
  };
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const read = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 1);
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  const go = (dir: number) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div className="h2-slider" role="region" aria-label={label}>
      <div className="h2-track" ref={track} onScroll={measure} tabIndex={0}>
        {children}
      </div>
      <div className="h2-slider-bar">
        <div className="h2-progress" aria-hidden="true">
          <i style={{ width: `${Math.max(12, progress * 100)}%` }} />
        </div>
        <button type="button" className="h2-arrow" onClick={() => go(-1)} aria-label="Previous">
          <ArrowLeft size={16} />
        </button>
        <button type="button" className="h2-arrow is-solid" onClick={() => go(1)} aria-label="Next">
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
