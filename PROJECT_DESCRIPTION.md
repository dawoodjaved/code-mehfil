# CodeMehfil – Real-Time Collaborative Coding Platform

---

## Portfolio / Résumé blurb (short form)

**CodeMehfil – Real-Time Collaborative Coding Platform**  
*[Date range, e.g. Aug 2025 – Present]*

A streamlined real-time code collaboration platform that enables developers to code together seamlessly. Think "Google Docs for Code" with live execution. Built with Next.js 14 and Rails 7.2, featuring real-time collaborative editing, instant code execution, and interview mode for technical assessments. — concise; original listed Monaco Editor (VS Code’s editor) with ActionCable WebSocket sync and live cursor/selection broadcast, instant code execution via Judge0 API or local fallback (11 languages: Python, JavaScript, Java, C++, Go, TypeScript, PHP, Ruby, Rust, Swift, C), session management with shareable links and join-by-code, and interview mode with built-in timer, question bank (algorithms, data structures, system design, etc.), and ability to mark sessions as interview or practice.

**Key highlights:**
- **Real-time collaborative editor** – Monaco Editor (VS Code's editor) with ActionCable WebSocket sync, whole-document sync per file, and live cursor/selection broadcast (remote cursors tracked in store; optional in-editor rendering).
- **Code execution** – Instant execution via Judge0 API when configured, or local Open3 fallback; supports 11 languages: Python, JavaScript, TypeScript, Java, C++, C, Go, PHP, Ruby, Rust, Swift.
- **Session management** – Create shareable coding sessions with unique links and 8-character join codes, join by code, invite by email, view session list; types: collaboration, interview, practice.
- **Interview mode** – Built-in start/stop timer, question bank (algorithms, data structures, system design, database, frontend, backend, debugging), Codeforces problem recommender, run tests against question test cases, time extension API.
- **Chat** – Live chat on the session page via `EnhancedChat`: history from `/api/sessions/:id/chat_messages`, ActionCable `chat_message` + typing broadcasts over SessionsChannel.
- **Participants** – List from API; ActionCable broadcasts user_joined/user_left. Cursor/typing data broadcast over SessionsChannel.
- **Terminal** – In-session terminal with help, clear, ls, pwd, echo, and **run** wired to code execution.
- **Multi-file** – File explorer UI and per-file sync in the store; session_files API exists and is schema-aligned (path/language/id); session page file list is still local state. Optional: Video (LiveKit token), whiteboard (Excalidraw; real-time via separate Socket.IO server when `NEXT_PUBLIC_SOCKET_IO_URL` is set).

Demonstrates expertise in Next.js 14, Rails 7.2, ActionCable/WebSockets, real-time collaboration, code execution APIs (Judge0, local fallback), and developer tooling for technical interviews and pair programming.

---

## Full technical description

A real-time code collaboration platform that lets developers code together in shared sessions. Built with **Next.js 14** and **Rails 7.2**. Core flow: Monaco Editor (VS Code–style) with live sync over Rails ActionCable, code execution via Judge0 or local fallback, session-based sharing and join-by-code, and an interview mode with timer and question bank.

---

## Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Monaco Editor (`@monaco-editor/react`), Tailwind CSS, Zustand, TanStack Query
- **Backend:** Ruby on Rails 7.2, PostgreSQL, ActionCable (WebSockets), JWT auth, Pundit
- **Execution:** Judge0 API (when configured) or local fallback (Open3) for 11 languages
- **Optional:** LiveKit (token API for video), Excalidraw (whiteboard via separate Socket.IO server)

---

## Key Features (as implemented in the codebase)

### 1. Real-time collaborative editor

- **Monaco Editor** (VS Code’s editor) with **ActionCable** WebSocket sync.
- **Whole-document sync** per file: each `code_change` broadcasts full content; other clients replace the buffer. Sync is keyed by `sessionId` and `fileId`.
- **Cursor and selection broadcast:** `cursor_update` and `selection_update` over SessionsChannel; remote cursors are stored in the session store (backend persists `cursor_position` on session_participants).
- **Per-file collaboration:** Multiple files can be edited; each uses the same WebSocket with a different `file_id`.

### 2. Code execution

- **Judge0 API** when `JUDGE0_API_KEY` (and related env) are set: 11 languages — JavaScript, TypeScript, Python, Java, C++, C, Go, Rust, PHP, Ruby, Swift.
- **Local fallback** when Judge0 is not configured: Open3-based execution for the same set of languages (requires corresponding runtimes on the server).
- **Execution flow:** Session page “Run Code” and in-session terminal `run` command → `POST /api/sessions/:session_id/executions` → async job or fallback → client polls `GET /api/executions/:id` until completion. Output is shown in the session UI and in the terminal for `run`.

### 3. Session management

- **Create sessions:** Title, description, `session_type` (collaboration / interview / practice), `time_limit_minutes`, tags.
- **Join by code:** `POST /api/sessions/join` with unique 8-character `code`; backend uses `Session.find_by(code: params[:code])` and adds the user as a participant.
- **Share:** Session page share dialog shows session link (`/session/:id`) and session code; “invite by email” UI exists (implementation may call backend).
- **Session list:** `GET /api/sessions` returns sessions where the user is creator or participant; session-history component is built to consume this (uses relative `/api/sessions` — needs `NEXT_PUBLIC_API_URL` or proxy in production).

### 4. Interview mode

- **Session types:** `collaboration`, `interview`, `practice` (Session model enums).
- **Timer:** InterviewMode component has a start/stop timer (seconds), displayed as MM:SS.
- **Question bank:** Backend `Question` model with categories: algorithms, data_structures, system_design, database, frontend, backend, debugging, other; difficulty: easy, medium, hard. Seed data and questions API support filtering and loading by id.
- **Codeforces integration:** CodeforcesRecommender fetches problems from Codeforces API; user can pick a problem and use it as the current question (title, description, difficulty, topics).
- **Run tests:** InterviewMode runs question test cases by calling the execution API (code + language + input); results and score are shown.
- **Time extension:** Backend `extend_time` (member action on sessions); TimeExtension component exists (uses relative `/api/sessions/:id/extend-time` — should align with `POST /api/sessions/:id/extend_time` and API base URL).

### 5. Chat

- **Backend:** `GET/POST /api/sessions/:session_id/chat_messages`; index returns last 100 messages with user info; create stores content and `message_type` (text/code/system/file).
- **SessionsChannel:** Handles `typing` and broadcasts `chat_message` on create.
- **Frontend:** `EnhancedChat` is rendered on the session page — loads history, posts new messages, shows Live status over ActionCable, and displays typing indicators.

### 6. Participants and presence

- **Participants list:** Session page fetches `GET /api/sessions/:id/participants` and displays participants in the sidebar.
- **ActionCable:** SessionsChannel broadcasts `user_joined` and `user_left` on subscribe/unsubscribe.
- **UserPresence component:** Still optional/orphaned (SSE route not used); presence events are available via ActionCable.

### 7. Terminal

- In-session terminal with history and local commands: `help`, `clear`, `ls`, `pwd`, `echo`, `run`.
- **Run:** Wired to `executeCode` (Judge0 or local). Other commands are local/mock (e.g. `ls` returns a static file list).

### 8. File explorer

- **UI:** FileExplorer component supports tree view, file/folder create, delete, and selection.
- **Session page:** Uses local state for the file list (e.g. initial `main.js`). Backend has `session_files` (CRUD under sessions); the session payload includes `files`. Fully wiring the session page to load/save files via `session_files` and to pass `fileId`/path into Monaco would complete multi-file persistence and sync.

### 9. Video and whiteboard

- **Video:** LiveKit token endpoint `POST /api/livekit/token`; session page passes token into VideoRoom. VideoRoom currently uses only `getUserMedia` and shows a local preview (“In production, integrate with LiveKit SDK”); full multi-user video would require LiveKit client integration.
- **Whiteboard:** Excalidraw-based; real-time collaboration expects a **separate Socket.IO server** (`NEXT_PUBLIC_SOCKET_IO_URL`). Comment in code: “Whiteboard collaboration requires a Socket.IO server (not provided by Rails ActionCable).”

---

## Technical highlights

- **Real-time sync:** ActionCable channel per session; client subscribes with JWT; messages include `code_change`, `cursor_update`, `selection_update`, `typing`, `user_joined`, `user_left`.
- **Auth:** JWT (register, login, `auth/me`); session and channel access require participant check.
- **Execution:** Judge0Service + ExecuteCodeJob for async runs; ExecutionsController fallback uses Open3 for the 11 languages above.
- **Policy:** SessionPolicy and Pundit for authorization where used.

---

## Summary for résumés or short blurbs

**CodeMehfil** is a real-time collaborative coding platform built with Next.js 14 and Rails 7.2. It provides a Monaco-based shared editor with ActionCable WebSocket sync (whole-document sync and cursor/selection broadcast per file), instant code execution via Judge0 or a local fallback for 11 languages, session management with unique shareable links and join-by-code, and an interview mode with a timer, question bank (algorithms, data structures, system design, etc.), and test execution. The stack includes Rails ActionCable, PostgreSQL, JWT, and optional LiveKit and Excalidraw-based whiteboard (the latter via a separate Socket.IO server). The project demonstrates real-time collaboration, code execution APIs, and tooling for technical interviews and pair programming.
