// A slow, endless right-to-left loop. The items are rendered twice and the track slides by exactly one copy.
// The second copy is inert so keyboard users and screen readers only meet each item once.
export function Marquee({ children, label, seconds = 70 }: { children: React.ReactNode; label: string; seconds?: number }) {
  return (
    <div className="h2-marquee" role="region" aria-label={label}>
      <div className="h2-marquee-track" style={{ animationDuration: `${seconds}s` }}>
        <div className="h2-marquee-group">{children}</div>
        <div className="h2-marquee-group" aria-hidden="true" inert>
          {children}
        </div>
      </div>
    </div>
  );
}
