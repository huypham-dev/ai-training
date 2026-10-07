import { SuggestionPill } from "@/components/chat/SuggestionPill";
import { useSuggestions } from "@copilotkit/react-core/v2";

interface TodoSuggestionsProps {
  askCopilot: (message: string) => void;
  isBusy: boolean;
}

// The suggestions of the chat, shown on the page so they work with the chat closed
export const TodoSuggestions: React.FC<TodoSuggestionsProps> = ({
  askCopilot,
  isBusy,
}) => {
  const { suggestions } = useSuggestions();

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-xs text-ink-muted">Ask the copilot</span>
      {suggestions.map((suggestion, index) => (
        <SuggestionPill
          key={`${suggestion.title}-${index}`}
          isLoading={suggestion.isLoading}
          disabled={isBusy}
          onClick={() => askCopilot(suggestion.message)}
        >
          {suggestion.title}
        </SuggestionPill>
      ))}
    </div>
  );
};
