import { TodoCopilotChat } from "@/components/copilot/TodoCopilotChat";
import { TodoThreadsDrawer } from "@/components/copilot/TodoThreadsDrawer";
import { TodoList } from "@/components/TodoList";

export default function Home() {
  return (
    <div className="flex min-h-[100dvh]">
      <TodoThreadsDrawer />
      <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
        <main className="flex min-w-0 flex-1 flex-col px-6 py-12">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
            <TodoList />
          </div>
        </main>
        <TodoCopilotChat />
      </div>
    </div>
  );
}
