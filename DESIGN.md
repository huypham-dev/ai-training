# Design System

Visual rules for the todo app and its copilot chat. The colors of the chat come from [Aurora UI](https://designmd.app/library/aurora-ui); the page is a plain white layout with one card per task. Follow them when adding or changing UI so new parts match the existing ones.

Tokens are defined in the `@theme` block of `src/app/globals.css` and used as Tailwind CSS 4 utilities (`bg-primary`, `text-ink`, `shadow-card`). Use these tokens and do not add default Tailwind palette colors such as `blue-500`.

## Principles

- The page is plain white. There is no gradient, no glow and no animated background.
- Every task is its own white card with a border and a soft shadow. The page itself has no card around it.
- Color is used sparingly: dark `ink` for the main button, `accent` for the copilot action, tinted pills for details.
- UI feedback takes 200ms.
- Light theme only. There is no dark mode.

## Colors

| Role | Token | Value | Used for |
| --- | --- | --- | --- |
| Primary | `primary` | `#0080FF` | Focus ring, typing dots, tints |
| Primary strong | `primary-strong` | `#0066CC` | Chat send button, user chat bubble, checkbox, text and icons in the primary color |
| Primary strong hover | `primary-strong-hover` | `#005EBC` | Hover of a `primary-strong` button (8% darker) |
| Secondary | `secondary` | `#FF1493` | Assignee pill tint and border |
| Secondary strong | `secondary-strong` | `#B8006B` | Assignee pill text |
| Accent | `accent` | `#F59E0B` | Tint of the copilot action pill, dot of an open task |
| Accent strong | `accent-strong` | `#9A4A00` | Text of the copilot action pill |
| Text | `ink` | `#1A1A2E` | Main text, fill of the page's primary button |
| Text muted | `ink-muted` | `#5B6072` | Labels, hints, completed todos, placeholders |
| Border | `line` | `#E2E8F0` | All default borders, dot of a completed task |
| Surface | `surface` | `#FFFFFF` | Page, cards, inputs, chat input bar |
| Surface muted | `surface-muted` | `#F8FAFC` | Copilot bubble, resting chat input |
| Surface sunken | `surface-sunken` | `#F1F5F9` | New task bar, search bar, date pill |
| Danger | `danger` | `#D92D20` | Delete button, error card |

`primary` and `secondary` are Aurora UI colors. The `-strong` variants are darker shades added for this app, because white text on `#0080FF`, magenta text on white and amber text on its own tint do not reach WCAG AA.

- Text on `primary-strong` and on `ink` is `white`.
- No pure black. Use `ink`.

## Typography

Font: system UI stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`), set as `--font-sans`.

| Style | Classes | Used for |
| --- | --- | --- |
| H1 | `text-3xl font-bold tracking-tight` | Page title (1.875rem, 700) |
| Body | `text-base leading-[1.6]` | Page text, main input (1rem / 1.6) |
| Task title | `text-base font-semibold leading-[1.6]` | Text of a task on its card |
| Small | `text-sm` | Chat messages, inline inputs, cards |
| Caption | `text-xs text-ink-muted` | Sender names, hints, tool progress, task dates, task counts |
| Pill | `text-xs` | Date pill, and with `font-medium` the assignee pill. Text is shown as typed, not uppercase |
| Action pill | `text-xs font-bold uppercase tracking-wide` | Copilot action on a task card |

Completed text: `text-ink-muted line-through`.

## Spacing and layout

- Base unit: 0.5rem (8px).
- Page: a `flex min-h-[100dvh]` row with the threads drawer on the left, `main` in the middle and the chat panel on the right. Below `lg` the chat panel sits under `main`. `main` is `min-w-0 flex-1 px-6 py-12`, with one centered column of `max-w-3xl` and no card around it. Never use `h-screen`.
- Task card padding: `p-4`. Between task cards: `gap-3`.
- Bubbles and chat cards: `px-4 py-2`.
- Between blocks on the page: `mb-6`. Between chat messages: `mb-4`.
- Between the actions of a task card and between its pills: `gap-2`.
- Chat bubbles: `max-w-[80%]`.
- Chat content under a copilot bubble (progress label, typing dots, suggestion pills): `ml-10`, so it lines up with the bubble and not with the avatar.

## Shape and elevation

| Radius | Used for |
| --- | --- |
| `rounded-xl` (0.75rem) | Buttons, inputs, cards, chat bubbles |
| `rounded-sm` (4px) | Icon buttons, the tight corner of a chat bubble |
| `rounded-full` | Pills, the status dot, avatar, typing dots |

Chat bubbles have one tight corner on the side of the sender: `rounded-tl-sm` for the copilot, `rounded-tr-sm` for the user.

Shadow: `shadow-card` (`0 2px 12px rgb(0 0 0 / 0.06)`) on task cards, chat cards and chat bubbles, always together with a 1px border on white surfaces. There is no other shadow and no glow.

## Motion

| Motion | Rule |
| --- | --- |
| Entry | `motion-safe:animate-enter`: fade and move up 16px over 480ms ease-out. Used for new task cards |
| Feedback | `transition duration-200` on color, opacity, shadow or transform |
| Reorder | While a task is dragged, its card and its sub-tasks follow the pointer and the other cards slide apart to show where it will land. Only `transform` moves, the dragged card sits above the others (`relative z-10`) and gets no extra shadow |
| Typing indicator | Three dots with `animate-bounce` and staggered delays |

Animate `transform` and `opacity` only. With `prefers-reduced-motion`, the entry animation does not run.

## Icons

Heroicons, outline style, as inline SVG with `strokeWidth={1.5}` and `stroke="currentColor"`.

- Size `w-5 h-5` on task cards and in the new task bar, `w-4 h-4` inside a button, a pill or the avatar.
- Color comes from the text color of the parent.
- Every icon button has an `aria-label` and a `title`. An icon next to text is `aria-hidden`.
- No emoji in the UI.

## States

| State | Rule |
| --- | --- |
| Focus | 2px ring in `primary`, offset 2px: `outline-2 outline-offset-2 outline-primary` with `focus:` on inputs and `focus-visible:` on buttons |
| Hover (primary button) | `hover:bg-ink/90 hover:shadow-card` on the page, `hover:bg-primary-strong-hover` in the chat |
| Active (primary button) | `active:translate-y-px` |
| Disabled | `disabled:opacity-40 disabled:cursor-not-allowed` |
| Card actions | Always visible, so they also work on touch. Icon buttons are `text-ink-muted` and turn `text-ink` on hover, the delete button `text-danger` |
| Loading | Muted caption text such as "Updating the task...". No spinners |
| Error | White card with `border-danger text-danger` |

## Components

| Component | File | Look |
| --- | --- | --- |
| Page header | `components/AddTodoForm.tsx` | The H1 on the left and the primary button on the right, `mb-6 flex items-center justify-between` |
| Primary button | `components/AddTodoForm.tsx` | "New todo" with a plus icon: `rounded-xl bg-ink px-4 py-3 font-semibold text-white`. It submits the new task bar, and with an empty bar it moves the focus there |
| New task bar | `components/AddTodoForm.tsx` | `rounded-xl bg-surface-sunken px-4 py-3`, no border. A muted clipboard icon, then a transparent input with a placeholder and an `aria-label`. The focus ring is on the bar (`focus-within:`). Enter adds the task |
| Search bar | `components/TodoSearch.tsx` | Same look as the new task bar, with a muted magnifying-glass icon and a `type="search"` input with the placeholder "Search todos". Sits above the status filter with `mb-6` and is always shown. The reorder hint sits directly under it. It filters the task cards by title as you type; the search text is not saved. A matching sub-task is shown with the tasks above it, so it never shows without its parent. Sub-tasks of a matching task are shown only when they match too. Tasks added or changed while the search has text, from the new task bar or by the copilot, are shown only when they match |
| Status filter | `components/TodoStatusFilter.tsx` | Segmented control under the search bar with "All", "Active" and "Done", no counts: `mb-6 flex w-fit gap-1 rounded-xl bg-surface-sunken p-1`. Each option is a visually hidden native radio (`sr-only`, so arrow keys move between options) with a `rounded-xl px-3 py-1 text-sm font-medium text-ink-muted` label. The selected option is a white segment: `border-line bg-surface text-ink shadow-card`. The focus ring sits on the label. "All" is selected on load and the choice is not saved. It works together with the search (a task must match both), and a matching sub-task is shown with the tasks above it, as with search |
| Reorder hint | `components/TodoSearch.tsx` | Caption line `mt-2 text-xs text-ink-muted` directly under the search bar, shown only while reordering is locked: "Clear search to reorder", "Show all to reorder" or "Clear search and show all to reorder" |
| No-match state | `components/TodoList.tsx` | `text-sm text-ink-muted` line in place of the task cards, shown when the search has text or the status filter is not "All" and no task matches. Such as `No todos match "xyz"`, "No active todos", "No completed todos" or `No active todos match "xyz"` |
| Inline input | `components/InlineInput.tsx` | `rounded-xl border px-2 py-1 text-sm` |
| Task counts | `components/TodoList.tsx` | Caption right above the task cards with `mb-2`, such as "3 left · 2 done · 5 total". Sub-tasks are counted too. Always counts the whole list, also while a search or the status filter hides some tasks. Hidden when there are no tasks |
| Clear completed | `components/TodoList.tsx` | Text button "Clear completed" right after the task counts, in a `flex items-center gap-3` row: `rounded-sm text-xs font-medium text-ink-muted`, hover `text-ink`. Shown only when a task is completed. It removes every completed task at once, also ones hidden by the search or the status filter, with no confirmation. Sub-tasks of a removed task stay and move to the top level |
| Task card | `components/TodoItem.tsx` | `rounded-xl border bg-surface p-4 shadow-card`, one per task, in `flex flex-col gap-3`. From the left: the drag handle, a status dot (`h-2 w-2 rounded-full`, `bg-accent` when open, `bg-line` when completed), the checkbox, then the task title with the pills under it, and the actions on the right. The actions wrap below the text on a narrow screen. A sub-task sits right below its parent with `ml-8` and a muted arrow-turn-down-right icon before the dot |
| Drag handle | `components/DragHandle.tsx` | Muted `bars-2` icon button (`w-5 h-5 text-ink-muted`, hover `text-ink`) at the start of every task card, with `touch-none` so touch drags work. A drag starts only from it. A task moves with all of its sub-tasks and only among the tasks with the same parent; a drop outside that area changes nothing. While the search has text or the status filter is not "All", every handle is greyed out (`disabled:opacity-40`) and does nothing, but stays in place so the rows do not shift |
| Card actions | `components/TodoItem.tsx` | In `ml-auto flex items-center gap-2`: the copilot action pill, then the icon buttons edit, dates, assign and delete |
| Copilot action pill | `components/TodoItem.tsx` | "Break down" with the sparkles icon: `rounded-full bg-accent/20 px-3 py-1 text-accent-strong`, hover `bg-accent/30`. Only on a task that is not a sub-task |
| Pills | `components/TodoItem.tsx` | Under the task title in `mt-1 flex flex-wrap items-center gap-2`, `rounded-full px-2.5 py-0.5 text-xs`. A task with no assignee and no dates has no second line |
| Assignee pill | `components/TodoItem.tsx` | `rounded-full border border-secondary/30 bg-secondary/10 font-medium text-secondary-strong`. A click edits the assignee |
| Date pill | `components/TodoItem.tsx` | `bg-surface-sunken text-ink-muted` with a calendar icon, such as "Oct 7, 2026 – Oct 12, 2026", "Starts Oct 7, 2026" or "Due Oct 12, 2026". A click opens the date inputs |
| Date inputs | `components/TodoItem.tsx` | Opened by the calendar action or by clicking the date pill, and replace the pill. Two `type="date"` inputs with the inline input look, each after a caption label ("Start", "Due"). A change is saved at once, only when both dates are between 1900 and 2099 and the due date is not before the start date. They close on Enter, Escape or when the focus leaves both |
| Date error | `components/TodoItem.tsx` | A full-width `text-xs text-danger` line with `role="alert"` below the date inputs, which also get `aria-invalid`. It says "Pick a date between 1900 and 2099." or "The due date is before the start date." and goes away with the next valid change or when the inputs close |
| Copilot avatar | `components/chat/SystemMessage.tsx` | Round, `border-primary/30 bg-primary/10`, sparkles icon |
| Copilot bubble | `components/chat/SystemMessage.tsx` | `rounded-xl border bg-surface-muted shadow-card` |
| User bubble | `components/chat/UserMessage.tsx` | Right aligned, `rounded-xl bg-primary-strong text-white shadow-card` |
| Chat input | `components/chat/Input.tsx` | `rounded-xl` field with a square `primary-strong` send button |
| Page suggestions | `components/TodoSuggestions.tsx` | Row of suggestion pills under the new task bar, after the caption "Ask the copilot". `mb-6 flex flex-wrap gap-2` |
| Suggestion pill | `components/chat/SuggestionPill.tsx` | `rounded-xl border bg-surface px-3 py-1 text-xs font-medium text-primary-strong`, hover `bg-primary/10`. Not a primary button |
| Delete confirmation | `components/chat/TodoDeleteCard.tsx` | Same card as the update card, with a `text-danger` question and two small buttons on the right: "Keep" (`border bg-surface text-ink`) and "Delete" (`bg-danger text-white`). After the answer it shows a muted "Task deleted" or "Task kept" |
| Cleared card | `components/chat/TodoClearCard.tsx` | Same card as the update card. A muted title counts the cleared tasks, such as "2 completed tasks cleared", and they are listed below it as completed text. With nothing to clear it only shows "No completed tasks to clear" |
| Added card | `components/chat/TodoAddCard.tsx` | Same card as the update card. The title is `text-primary-strong` with a check-circle icon (`w-4 h-4`) and counts the added tasks, which are listed below it. A task with dates shows them as a caption after its text |
| Update card | `components/chat/TodoUpdateCard.tsx` | `rounded-xl border bg-surface shadow-card` |
| Typing indicator | `components/chat/TypingIndicator.tsx` | Three bouncing `primary` dots |
| Chat panel | `components/copilot/TodoCopilotChat.tsx` | The copilot chat as a panel right of the page, not a popup: `lg:sticky lg:top-0 lg:h-[100dvh] lg:w-96 lg:border-l`. Below `lg` it sits under the page with `h-[70dvh] border-t`. It has no header and no card around it |
| Threads drawer | `components/copilot/TodoThreadsDrawer.tsx` | The prebuilt CopilotKit drawer with the saved conversations, in a `sticky top-0 h-[100dvh] shrink-0` sidebar left of the page. It renders in a shadow root, so it is not styled with utility classes: its colors come from the `--cpk-drawer-*` variables, which the sidebar sets to the tokens of this app (`surface`, `ink`, `ink-muted`, `surface-sunken`, `line`, `danger`, `primary` for the focus ring). Its layout, radius and width are the defaults of the drawer. On a narrow screen it opens over the page from its own launcher |

## Do and don't

- Do keep the page white and put content on cards.
- Do reuse the assignee pill classes wherever a person is shown.
- Do format dates with `formatDate` and `formatDateRange` from `utils/date.ts` wherever a date is shown.
- Do keep one primary button per view.
- Do give every input a label: a visible one, or an `aria-label` when it has a placeholder like the new task bar.
- Do give long text `break-words` and `min-w-0` so it wraps inside flex rows.
- Don't add a gradient, a glow or an animated background.
- Don't hide the actions of a task card until hover.
- Don't use `primary`, `secondary` or `accent` for text. Use their `-strong` variants.
- Don't use emoji as icons.
