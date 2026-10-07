import { TodoCopilotPopup } from "@/components/copilot/TodoCopilotPopup";
import { TodoList } from "@/components/TodoList";

export default function Home() {
  return (
    <main className="min-h-[100dvh] px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <TodoList />
      </div>
      <TodoCopilotPopup />
    </main>
  );
}
