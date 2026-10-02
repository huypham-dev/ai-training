import { InputProps, useChatContext } from "@copilotkit/react-ui";
import { useEffect, useRef, useState } from "react";

const MAX_HEIGHT = 120;

export const Input: React.FC<InputProps> = ({
  inProgress,
  onSend,
  isVisible = false,
}) => {
  const { labels } = useChatContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");

  const canSend = !inProgress && text.trim() !== "";

  const send = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText("");
    textareaRef.current?.focus();
  };

  useEffect(() => {
    if (isVisible) {
      textareaRef.current?.focus();
    }
  }, [isVisible]);

  // Grow the textarea with its content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT)}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ignore Enter while an IME composition is being confirmed
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="border-t bg-white p-3 rounded-b-xl">
      <div className="flex items-end rounded-2xl border bg-gray-50 px-3 py-2 focus-within:border-blue-500 focus-within:bg-white transition-colors duration-200">
        <textarea
          ref={textareaRef}
          className="flex-1 resize-none bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none py-1"
          rows={1}
          value={text}
          placeholder={labels.placeholder}
          aria-label={labels.placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white transition-opacity duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
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
      </div>
      <p className="mt-1 ml-1 text-xs text-gray-500">
        Enter to send, Shift + Enter for a new line
      </p>
    </div>
  );
};
