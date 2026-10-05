"use client";

import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";

// Client boundary for CopilotKit, so that the layout stays a server component
export const CopilotProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <CopilotKitProvider runtimeUrl="/api/copilotkit">
      {children}
    </CopilotKitProvider>
  );
};
