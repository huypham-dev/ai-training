"use client";

import { CopilotThreadsDrawer } from "@copilotkit/react-core/v2";

// The drawer renders in a shadow root and takes no className, so its colors
// are set through the CSS variables it reads from its parent
const tokens = [
  "[--cpk-drawer-bg:var(--color-surface)]",
  "[--cpk-drawer-fg:var(--color-ink)]",
  "[--cpk-drawer-surface:var(--color-surface)]",
  "[--cpk-drawer-surface-fg:var(--color-ink)]",
  "[--cpk-drawer-muted:var(--color-surface-sunken)]",
  "[--cpk-drawer-muted-fg:var(--color-ink-muted)]",
  "[--cpk-drawer-accent:var(--color-surface-sunken)]",
  "[--cpk-drawer-accent-fg:var(--color-ink)]",
  "[--cpk-drawer-primary:var(--color-ink)]",
  "[--cpk-drawer-primary-fg:var(--color-surface)]",
  "[--cpk-drawer-danger:var(--color-danger)]",
  "[--cpk-drawer-border:var(--color-line)]",
  "[--cpk-drawer-ring:var(--color-primary)]",
  "[--cpk-drawer-indicator:var(--color-primary)]",
  "[--cpk-drawer-font-family:var(--font-sans)]",
].join(" ");

// The saved conversations of the copilot chat, as a sidebar next to the page
export const TodoThreadsDrawer: React.FC = () => {
  return (
    <aside className={`sticky top-0 h-[100dvh] shrink-0 ${tokens}`}>
      <CopilotThreadsDrawer label="Conversations" />
    </aside>
  );
};
