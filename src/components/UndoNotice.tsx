import { useEffect, useRef, useState } from "react";

const TIMEOUT_MS = 8000;

interface UndoNoticeProps {
  // A new id restarts the countdown, also when the message stays the same
  id: number;
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
}

export const UndoNotice: React.FC<UndoNoticeProps> = ({
  id,
  message,
  onUndo,
  onDismiss,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const remainingRef = useRef(TIMEOUT_MS);
  const countedIdRef = useRef(id);
  const isPaused = isHovered || hasFocus;

  // mouseenter does not fire for a pointer that is already there when it shows
  useEffect(() => {
    if (ref.current?.matches(":hover")) {
      setIsHovered(true);
    }
  }, []);

  // The countdown keeps what is left while paused and resumes from there
  useEffect(() => {
    if (countedIdRef.current !== id) {
      countedIdRef.current = id;
      remainingRef.current = TIMEOUT_MS;
    }
    if (isPaused) {
      return;
    }
    const startedAt = Date.now();
    const timeout = setTimeout(onDismiss, remainingRef.current);
    return () => {
      clearTimeout(timeout);
      remainingRef.current -= Date.now() - startedAt;
    };
  }, [id, isPaused, onDismiss]);

  return (
    <div
      ref={ref}
      className="mt-6 flex items-center gap-3 rounded-xl border bg-surface px-4 py-3 shadow-card"
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
