"use client";

import { AssistantMessage } from "@/components/chat/AssistantMessage";
import { Input } from "@/components/chat/Input";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { UserMessage } from "@/components/chat/UserMessage";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import {
  CopilotChatAssistantMessage,
  CopilotChatInput,
  CopilotChatUserMessage,
  CopilotPopup,
} from "@copilotkit/react-core/v2";

const labels = {
  modalHeaderTitle: "Todo List Copilot",
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

// The copilot chat popup with the custom chat components of this app
export const TodoCopilotPopup: React.FC = () => {
  return (
    <CopilotPopup
      defaultOpen={true}
      clickOutsideToClose={false}
      labels={labels}
      welcomeScreen={WelcomeScreen}
      messageView={messageView}
      input={Input as typeof CopilotChatInput}
    />
  );
};
