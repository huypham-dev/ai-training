import { CopilotChatSuggestionPillProps } from "@copilotkit/react-core/v2";

// Rendered through the `suggestion` slot of the suggestion view
export const SuggestionPill: React.FC<CopilotChatSuggestionPillProps> = ({
  children,
  isLoading = false,
  disabled,
  onClick,
}) => {
  return (
    // The chat places the suggestions in a container that ignores pointer events
    <button
      type="button"
      className="pointer-events-auto max-w-full rounded-xl border bg-surface px-3 py-1 text-left text-xs font-medium text-primary-strong break-words transition duration-200 hover:bg-primary/10 active:translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface disabled:active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      onClick={onClick}
      disabled={isLoading || disabled}
      aria-busy={isLoading || undefined}
    >
      {children}
    </button>
  );
};
