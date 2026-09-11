# Kanban Board with AI Assistant

A polished, interactive Kanban app with sign-in, saved boards, and an AI assistant that can answer questions about your board.

## Look and feel

Taken from your reference images: soft off-white canvas, deep violet accent, rounded cards with gentle shadows, colored pill labels, a slim left sidebar with icons, and a clean top bar with search and your avatar. Cards tilt and lift while dragging, columns highlight as you hover over them, and counts sit next to each column name.

## Board

- Three columns: To Do, In Progress, Done, each showing a card count and an "add card" button.
- Cards hold a title, a description, and a colored priority label (Low / Medium / High) plus custom labels.
- Drag cards between and within columns to reorder; click a card to open a panel for editing or deleting it.
- Everything saves automatically as you work, so your board is exactly as you left it when you return.

## Accounts

- Email and password sign-in, with a sign-up screen.
- Each person sees only their own board; nobody else can read or change it.

## AI assistant

- A slide-out chat panel on the board.
- It can read your current cards, so you can ask things like "what's high priority?", "summarize what's in progress", or "what should I tackle first?".
- Answers stream in as they're written, and the conversation stays in view while you work.

## Pages

- Sign in / sign up
- Board (main screen, with the assistant panel)

## Technical notes

- Lovable Cloud for auth and storage: `cards` table (title, description, priority, labels, column, position, user_id) with row-level security scoped to `auth.uid()`, plus grants for `authenticated`.
- Board reads/writes through authenticated server functions; board route lives under the protected `_authenticated` layout, with `/auth` public.
- Drag and drop with `@dnd-kit` (sortable lists, drag overlay).
- Assistant: a streaming server route calling Lovable AI (`openai/gpt-6-astra` via the Responses API), with the user's own cards injected as context. Chat UI built from AI Elements primitives; chat history is per-session, not persisted.
- Design tokens (violet accent, surfaces, shadows) defined in `src/styles.css`; no hardcoded colors in components.
