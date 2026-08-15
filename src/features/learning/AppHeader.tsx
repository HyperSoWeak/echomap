import Image from "next/image";

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
          <Image src="/icons/echomap-mark.svg" alt="" width={29} height={29} />
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
