interface AppHeaderProps {
  backLabel?: string;
  onBack?: () => void;
  onReset?: () => void;
}

export function AppHeader({ backLabel, onBack, onReset }: AppHeaderProps) {
  return (
    <header className="app-header">
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
            <span aria-hidden="true">←</span>{backLabel ?? "返回"}
          </button>
        ) : null}
        {onReset ? (
          <button className="header-text-action" type="button" onClick={onReset}>重新 Demo</button>
        ) : null}
      </div>
    </header>
  );
}
