# Design System

Visual rules for the todo app and its copilot chat, based on [Aurora UI](https://designmd.app/library/aurora-ui). Follow them when adding or changing UI so new parts match the existing ones.

Tokens are defined in the `@theme` block of `src/app/globals.css` and used as Tailwind CSS 4 utilities (`bg-primary`, `text-ink`, `shadow-card`). Use these tokens and do not add default Tailwind palette colors such as `blue-500`.

## Principles

- One aurora moment per viewport. Here it is the page background: a slow mesh gradient in the three brand colors. Nothing else uses a gradient.
- Content sits on plain white surfaces above the gradient, so text contrast never depends on the animation.
- Slow beats fast. The background loop takes 12 seconds; UI feedback takes 200ms.
- Light theme only. There is no dark mode.

## Colors

| Role | Token | Value | Used for |
| --- | --- | --- | --- |
| Primary | `primary` | `#0080FF` | Focus ring, typing dots, tints, background gradient |
| Primary strong | `primary-strong` | `#0066CC` | Button fill, user chat bubble, checkbox, text and icons in the primary color |
| Primary strong hover | `primary-strong-hover` | `#005EBC` | Hover of a primary button (8% darker) |
| Secondary | `secondary` | `#FF1493` | Assignee badge tint and border, background gradient |
| Secondary strong | `secondary-strong` | `#B8006B` | Assignee badge text |
| Tertiary | `tertiary` | `#00FFFF` | Background gradient only |
| Text | `ink` | `#1A1A2E` | Main text |
| Text muted | `ink-muted` | `#5B6072` | Labels, hints, completed todos, placeholders |
| Border | `line` | `#E2E8F0` | All default borders |
| Surface | `surface` | `#FFFFFF` | Cards, inputs, chat input bar |
| Surface muted | `surface-muted` | `#F8FAFC` | Page base under the gradient, copilot bubble, resting chat input |
| Danger | `danger` | `#D92D20` | Delete button, error card |

`primary`, `secondary` and `tertiary` are the Aurora UI colors. The `-strong` variants are darker shades added for this app, because white text on `#0080FF` and magenta text on white do not reach WCAG AA.

- Text on `primary-strong` is `white`.
- Never put text on `tertiary`, and never use it as a text color.
- No pure black. Use `ink`.

## Typography

Font: system UI stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`), set as `--font-sans`.

| Style | Classes | Used for |
| --- | --- | --- |
| H1 | `text-4xl font-bold tracking-tight` | Page title (2.25rem, 700) |
| Body | `text-base leading-[1.6]` | Todo text, page text, main input (1rem / 1.6) |
| Small | `text-sm` | Chat messages, inline inputs, cards |
| Label | `text-sm font-medium` | Label above an input |
| Caption | `text-xs text-ink-muted` | Sender names, hints, tool progress |
| Badge | `text-xs font-medium uppercase tracking-wide` | Assignee badge |

Completed text: `text-ink-muted line-through`.

## Spacing and layout

- Base unit: 0.5rem (8px).
- Page: `min-h-[100dvh] px-6 py-12`, with one centered card of `max-w-2xl`. Never use `h-screen`.
- Card padding: `p-6`.
- Rows: `px-4 py-3`. Bubbles and chat cards: `px-4 py-2`.
- Between blocks on the page: `mb-6`. Between chat messages: `mb-4`.
- Between items in a row: `ml-2`.
- Chat bubbles: `max-w-[80%]`.
- Chat content under a copilot bubble (progress label, typing dots): `ml-10`, so it lines up with the bubble and not with the avatar.

## Shape and elevation

| Radius | Used for |
| --- | --- |
| `rounded-xl` (0.75rem) | Buttons, inputs, cards, list container, chat bubbles |
| `rounded-sm` (4px) | Badges, icon buttons, the tight corner of a chat bubble |
| `rounded-full` | Avatar, typing dots |

Chat bubbles have one tight corner on the side of the sender: `rounded-tl-sm` for the copilot, `rounded-tr-sm` for the user.

Shadow: `shadow-card` (`0 2px 12px rgb(0 0 0 / 0.06)`) on cards and chat bubbles, always together with a 1px border on white surfaces. There is no other shadow and no glow.

## Background

The gradient is drawn by `body::before` in `globals.css`:

- Three radial gradients, one per brand color, at 22% to 35% opacity over `surface-muted`.
- `filter: saturate(1.2)`.
- Animation `aurora`: 12s, `ease-in-out`, `infinite alternate`. Only `transform` is animated.
- Fixed behind the content (`z-index: -1`) and ignores pointer events.

## Motion

| Motion | Rule |
| --- | --- |
| Background | 12s loop, see above |
| Entry | `motion-safe:animate-enter`: fade and move up 16px over 480ms ease-out. Used for new todo rows |
| Feedback | `transition duration-200` on color, opacity, shadow or transform |
| Typing indicator | Three dots with `animate-bounce` and staggered delays |

Animate `transform` and `opacity` only. With `prefers-reduced-motion`, the background and the entry animation do not run.

Do not put `animate-enter` on an element that contains the copilot popup. The animation leaves a transform on the element, and the popup would then be positioned against it and not against the window.

## Icons

Heroicons, outline style, as inline SVG with `strokeWidth={1.5}` and `stroke="currentColor"`.

- Size `w-5 h-5` in rows, `w-4 h-4` inside a button or the avatar.
- Color comes from the text color of the parent.
- Every icon button has an `aria-label` and a `title`.
- No emoji in the UI.

## States

| State | Rule |
| --- | --- |
| Focus | 2px ring in `primary`, offset 2px: `outline-2 outline-offset-2 outline-primary` with `focus:` on inputs and `focus-visible:` on buttons |
| Hover (primary button) | `hover:bg-primary-strong-hover hover:shadow-card` |
| Active (primary button) | `active:translate-y-px` |
| Disabled | `disabled:opacity-40 disabled:cursor-not-allowed` |
| Hover reveal | Row actions are `opacity-0` and show with `group-hover:opacity-100` and `focus-visible:opacity-100` |
| Loading | Muted caption text such as "Updating the task...". No spinners |
| Error | White card with `border-danger text-danger` |

## Components

| Component | File | Look |
| --- | --- | --- |
| Page card | `app/page.tsx` | `rounded-xl border bg-surface p-6 shadow-card` |
| Primary button | `components/AddTodoForm.tsx` | `rounded-xl bg-primary-strong px-4 py-3 font-semibold text-white` |
| Text input | `components/AddTodoForm.tsx` | Label above, `rounded-xl border bg-surface p-3` |
| Inline input | `components/InlineInput.tsx` | `rounded-xl border px-2 py-1 text-sm` |
| Todo row | `components/TodoItem.tsx` | `px-4 py-3`, `border-b` between rows, actions on hover |
| Assignee badge | `components/TodoItem.tsx` | `rounded-sm border border-secondary/30 bg-secondary/10 text-secondary-strong` |
| Copilot avatar | `components/chat/SystemMessage.tsx` | Round, `border-primary/30 bg-primary/10`, sparkles icon |
| Copilot bubble | `components/chat/SystemMessage.tsx` | `rounded-xl border bg-surface-muted shadow-card` |
| User bubble | `components/chat/UserMessage.tsx` | Right aligned, `rounded-xl bg-primary-strong text-white shadow-card` |
| Chat input | `components/chat/Input.tsx` | `rounded-xl` field with a square `primary-strong` send button |
| Update card | `components/chat/TodoUpdateCard.tsx` | `rounded-xl border bg-surface shadow-card` |
| Typing indicator | `components/chat/TypingIndicator.tsx` | Three bouncing `primary` dots |

## Do and don't

- Do keep the gradient to the page background and to three colors.
- Do reuse the assignee badge classes wherever a person is shown.
- Do keep one primary button per view.
- Do put a label above every standalone input.
- Do give long text `break-words` and `min-w-0` so it wraps inside flex rows.
- Don't add a second gradient, a glow or an animated background inside cards or the chat.
- Don't speed the background up. A loop under 8 seconds reads as nervous.
- Don't use `primary` or `secondary` for text. Use their `-strong` variants.
- Don't use emoji as icons.
