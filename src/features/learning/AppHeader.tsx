"use client";

import { useEffect, useState } from "react";

interface AppHeaderProps {
  backLabel?: string;
  onBack?: () => void;
  onReset?: () => void;
}

export function AppHeader({ backLabel, onBack, onReset }: AppHeaderProps) {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    function updateVisibility() {
      setIsHidden(window.scrollY > 8);
    }

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <header className={"app-header" + (isHidden ? " app-header-hidden" : "")}>
      <div className="brand-lockup">
        <span className="brand-mark" aria-hidden="true">
          <svg className="brand-mark-glyph" viewBox="0 0 46 46" fill="none">
            <circle cx="15" cy="31" r="3.2" fill="var(--accent-ink)" />
            <path d="M21 25a9 9 0 0 1 0 12" stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M26.5 19.5a17 17 0 0 1 0 23" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" opacity=".7" />
            <path d="M32 14a25 25 0 0 1 0 34" stroke="var(--accent-light)" strokeWidth="2.2" strokeLinecap="round" opacity=".45" />
          </svg>
        </span>
        <span className="header-brand">EchoMap</span>
      </div>
      <div className="header-actions">
        {onBack ? (
          <button className="header-back-action" type="button" onClick={onBack}>
            <svg className="header-action-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M12.5 5 7.5 10l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{backLabel ?? "返回"}</span>
          </button>
        ) : null}
        {onReset ? (
          <button className="header-text-action" type="button" onClick={onReset}>
            <svg className="header-action-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M15.2 9.2a5.2 5.2 0 1 0-1.4 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M15.2 5.5v3.7h-3.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>重新開始</span>
          </button>
        ) : null}
      </div>
    </header>
  );
}
