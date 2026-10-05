import { useCopilotChatConfiguration } from "@copilotkit/react-core/v2";
import { SystemMessage } from "./SystemMessage";

interface WelcomeScreenProps {
  input: React.ReactElement;
  suggestionView: React.ReactElement;
}

// Shown instead of the message list while the chat is still empty
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  input,
  suggestionView,
}) => {
  const welcomeMessage = useCopilotChatConfiguration()?.labels.welcomeMessageText;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-6 pt-4">
        {welcomeMessage && <SystemMessage content={welcomeMessage} />}
      </div>
      {suggestionView}
      {input}
    </div>
  );
};
