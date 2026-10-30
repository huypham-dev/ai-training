export const APP_TITLE = "Todo Assistant - CopilotKit";

// No "(0)" when nothing is left to do
export const formatTabTitle = (activeCount: number) =>
  activeCount >= 1 ? `(${activeCount}) ${APP_TITLE}` : APP_TITLE;
