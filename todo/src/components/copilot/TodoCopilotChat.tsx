"use client";

import { AssistantMessage } from "@/components/chat/AssistantMessage";
import { Input } from "@/components/chat/Input";
import { SuggestionPill } from "@/components/chat/SuggestionPill";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { UserMessage } from "@/components/chat/UserMessage";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import {
  CopilotChat,
  CopilotChatAssistantMessage,
  CopilotChatInput,
  CopilotChatSuggestionPill,
  CopilotChatUserMessage,
} from "@copilotkit/react-core/v2";

const labels = {
  welcomeMessageText: "Hi you! I can help you manage your todo list.",
  chatInputPlaceholder: "Ask me to add, update or remove todos...",
};

// The slot types also expect the static members of the default components,
// which a replacement does not need
const messageView = {
  assistantMessage: AssistantMessage as typeof CopilotChatAssistantMessage,
  userMessage: UserMessage as typeof CopilotChatUserMessage,
  cursor: TypingIndicator,
};

// `ml-10` lines the suggestions up with the copilot bubble above them
const suggestionView = {
  suggestion: SuggestionPill as typeof CopilotChatSuggestionPill,
  className: "ml-10 mb-3",
};

// The copilot chat with the custom chat components of this app, as a panel
// next to the page
export const TodoCopilotChat: React.FC = () => {
  return (
    <aside
      aria-label="Todo List Copilot"
      className="h-[70dvh] shrink-0 border-t lg:sticky lg:top-0 lg:h-[100dvh] lg:w-96 lg:border-l lg:border-t-0"
    >
      <CopilotChat
        labels={labels}
        welcomeScreen={WelcomeScreen}
        messageView={messageView}
        suggestionView={suggestionView}
        input={Input as typeof CopilotChatInput}
      />
    </aside>
  );
};
