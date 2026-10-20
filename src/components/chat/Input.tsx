import {
  CopilotChatInputProps,
  useCopilotChatConfiguration,
} from "@copilotkit/react-core/v2";
import { useEffect, useRef } from "react";

const MAX_HEIGHT = 120;

// Rendered through the `input` slot of the chat
export const Input: React.FC<CopilotChatInputProps> = ({
  value = "",
  onChange,
  onSubmitMessage,
  onStop,
  isRunning = false,
}) => {
  const placeholder = useCopilotChatConfiguration()?.labels.chatInputPlaceholder;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = !isRunning && value.trim() !== "";

  const send = () => {
    if (!canSend) return;
    onSubmitMessage?.(value.trim());
    textareaRef.current?.focus();
  };

  // Grow the textarea with its content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ignore Enter while an IME composition is being confirmed
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    // The chat places the input in an overlay that ignores pointer events
    <div className="pointer-events-auto border-t bg-surface p-3 rounded-b-xl">
      <div className="flex items-end rounded-xl border bg-surface-muted px-3 py-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary focus-within:bg-surface transition-colors duration-200">
        <textarea
          ref={textareaRef}
          className="flex-1 resize-none bg-transparent text-sm text-ink placeholder:text-ink-muted outline-hidden py-1"
          rows={1}
          value={value}
          placeholder={placeholder}
          aria-label={placeholder}
          autoFocus
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {isRunning ? (
          <button
            className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-strong text-white transition duration-200 hover:bg-primary-strong-hover active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onStop}
            aria-label="Stop generating"
            title="Stop generating"
          >
            <span className="h-3 w-3 rounded-sm bg-white" />
          </button>
        ) : (
          <button
            className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-strong text-white transition duration-200 hover:bg-primary-strong-hover active:translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary-strong disabled:active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={send}
            disabled={!canSend}
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>
          </button>
        )}
      </div>
      <p className="mt-1 ml-1 text-xs text-ink-muted">
        Enter to send, Shift + Enter for a new line
      </p>
    </div>
  );
};
