import { TodoCopilotPopup } from "@/components/copilot/TodoCopilotPopup";
import { TodoList } from "@/components/TodoList";

export default function Home() {
  return (
    <main className="min-h-[100dvh] px-6 py-12">
      <div className="mx-auto max-w-2xl rounded-xl border bg-surface p-6 shadow-card">
        <h1 className="text-4xl font-bold tracking-tight">Hello CopilotKit</h1>
        <h2 className="mb-6 text-base text-ink-muted">Todo List Example</h2>
        <TodoList />
      </div>
      <TodoCopilotPopup />
    </main>
  );
}
