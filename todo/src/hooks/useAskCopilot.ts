import {
  UseAgentUpdate,
  useAgent,
  useCopilotKit,
} from "@copilotkit/react-core/v2";
import { nanoid } from "nanoid";
import { useCallback } from "react";

// Streamed messages would otherwise re-render the whole list on every token
const updates = [UseAgentUpdate.OnRunStatusChanged];

// Sends a message to the copilot from outside the chat. It uses the agent of
// the chat, so the message and the answer also show up there
export const useAskCopilot = () => {
  const { agent, isReady } = useAgent({ updates });
  const { copilotkit } = useCopilotKit();

  const isBusy = !isReady || agent.isRunning;

  const askCopilot = useCallback(
    async (message: string) => {
      if (agent.isRunning) {
        return;
      }
      agent.addMessage({ id: nanoid(), role: "user", content: message });
      try {
        await copilotkit.runAgent({ agent });
      } catch (error) {
        console.error("Failed to run the copilot", error);
      }
    },
    [agent, copilotkit],
  );

  return { askCopilot, isBusy };
};
