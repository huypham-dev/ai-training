import { useEffect, useRef, useState } from "react";

const TIMEOUT_MS = 8000;

interface UndoNoticeProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
}

export const UndoNotice: React.FC<UndoNoticeProps> = ({
  message,
  onUndo,
  onDismiss,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const remainingRef = useRef(TIMEOUT_MS);
  const isPaused = isHovered || hasFocus;

  // The countdown keeps what is left while paused and resumes from there
  useEffect(() => {
    if (isPaused) {
      return;
    }
    const startedAt = Date.now();
    const timeout = setTimeout(onDismiss, remainingRef.current);
    return () => {
      clearTimeout(timeout);
      remainingRef.current -= Date.now() - startedAt;
    };
  }, [isPaused, onDismiss]);

  return (
    <div
      className="flex items-center gap-3 rounded-xl border bg-surface px-4 py-3 shadow-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setHasFocus(true)}
      // Stays paused while the focus moves between the two buttons
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setHasFocus(false);
        }
      }}
    >
      <p className="min-w-0 flex-1 text-sm text-ink break-words">{message}</p>
      <button
        type="button"
        onClick={onUndo}
        className="rounded-sm text-sm font-semibold text-primary-strong transition-colors duration-200 hover:text-primary-strong-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Undo
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        title="Dismiss"
        className="rounded-sm text-ink-muted transition-colors duration-200 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};
