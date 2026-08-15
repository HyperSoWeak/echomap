interface AppHeaderProps {
  backLabel?: string;
  onBack?: () => void;
  onReset?: () => void;
}

export function AppHeader({ backLabel, onBack, onReset }: AppHeaderProps) {
  return (
    <header className="app-header">
      {onBack ? (
        <button className="header-round-action" type="button" aria-label={backLabel ?? "返回"} onClick={onBack}>
          <span aria-hidden="true">←</span>
        </button>
      ) : (
        <span className="header-logo" aria-hidden="true" />
      )}
      <span className="header-brand">Learn Audio Map</span>
      {onReset ? (
        <button className="header-text-action" type="button" onClick={onReset}>重新 Demo</button>
      ) : null}
    </header>
  );
}
