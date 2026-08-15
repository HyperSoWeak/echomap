"use client";

import { useEffect, useState } from "react";
import { AudioLines, ChevronLeft, RotateCcw } from "lucide-react";

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
          <AudioLines className="brand-mark-glyph" strokeWidth={2.3} />
        </span>
        <span className="header-brand">EchoMap</span>
      </div>
      <div className="header-actions">
        {onBack ? (
          <button className="header-back-action" type="button" onClick={onBack}>
            <ChevronLeft className="header-action-icon" strokeWidth={2.2} aria-hidden="true" />
            <span>{backLabel ?? "返回"}</span>
          </button>
        ) : null}
        {onReset ? (
          <button className="header-text-action" type="button" onClick={onReset}>
            <RotateCcw className="header-action-icon" strokeWidth={2.1} aria-hidden="true" />
            <span>重新開始</span>
          </button>
        ) : null}
      </div>
    </header>
  );
}
