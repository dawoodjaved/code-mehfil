import { create } from "zustand";
import { Monaco } from "@/lib/monaco-config";

interface RemoteCursor {
  userId: string;
  userName: string;
  color: string;
  position: Monaco.Position;
  selection?: Monaco.Selection;
  fileId?: string;
}

type EditorSet = Set<Monaco.editor.IStandaloneCodeEditor>;

interface SessionState {
  cable: WebSocket | null;
  cableIdentifier: string | null;
  connectedSessionId: string | null;
  editors: Map<string, EditorSet>;
  remoteCursors: Map<string, RemoteCursor>;
  decorations: Map<string, string[]>;
  onlineUsers: Map<string, { id: string; name: string; email?: string }>;
  /** Latest known content per session:file — used when an editor mounts late */
  fileContents: Map<string, string>;
  connectYjs: (
    sessionId: string,
    fileId: string,
    editor: Monaco.editor.IStandaloneCodeEditor,
    userId: string,
    userName: string
  ) => void;
  disconnectYjs: (sessionId: string, fileId: string, editor?: Monaco.editor.IStandaloneCodeEditor) => void;
  broadcastCursor: (fileId: string, position: Monaco.Position, selection?: Monaco.Selection) => void;
  getFileContent: (sessionId: string, fileId: string) => string | undefined;
}

const CURSOR_COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#a855f7", "#f59e0b", "#06b6d4"];

/** Keep collab snappy without flooding the wire on every keystroke / cursor move */
const CODE_BROADCAST_MS = 80;
const CURSOR_BROADCAST_MS = 40;

const pendingCodeBroadcasts = new Map<string, () => void>();
const codeBroadcastTimers = new Map<string, ReturnType<typeof setTimeout>>();
let cursorBroadcastTimer: ReturnType<typeof setTimeout> | null = null;
let pendingCursorBroadcast: (() => void) | null = null;

function scheduleCodeBroadcast(key: string, send: () => void) {
  pendingCodeBroadcasts.set(key, send);
  if (codeBroadcastTimers.has(key)) return;
  codeBroadcastTimers.set(
    key,
    setTimeout(() => {
      codeBroadcastTimers.delete(key);
      const fn = pendingCodeBroadcasts.get(key);
      pendingCodeBroadcasts.delete(key);
      fn?.();
    }, CODE_BROADCAST_MS)
  );
}

function flushCodeBroadcast(key: string) {
  const timer = codeBroadcastTimers.get(key);
  if (timer) {
    clearTimeout(timer);
    codeBroadcastTimers.delete(key);
  }
  const fn = pendingCodeBroadcasts.get(key);
  pendingCodeBroadcasts.delete(key);
  fn?.();
}

function scheduleCursorBroadcast(send: () => void) {
  pendingCursorBroadcast = send;
  if (cursorBroadcastTimer) return;
  cursorBroadcastTimer = setTimeout(() => {
    cursorBroadcastTimer = null;
    const fn = pendingCursorBroadcast;
    pendingCursorBroadcast = null;
    fn?.();
  }, CURSOR_BROADCAST_MS);
}

function colorForUser(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = (hash + userId.charCodeAt(i) * 17) % CURSOR_COLORS.length;
  return CURSOR_COLORS[hash];
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
}

function getCableUrl() {
  const explicit =
    process.env.NEXT_PUBLIC_CABLE_URL ||
    process.env.NEXT_PUBLIC_WS_URL;
  if (explicit) return explicit;
  const apiUrl = getApiUrl();
  return apiUrl.replace(/^http/i, "ws").replace(/\/+$/, "") + "/cable";
}

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function applyRemoteCursorDecorations(
  editor: Monaco.editor.IStandaloneCodeEditor,
  fileId: string,
  cursors: Map<string, RemoteCursor>,
  previousIds: string[]
) {
  const monaco = (window as any).monaco;
  if (!monaco?.editor) return previousIds;

  const forFile = [...cursors.values()].filter((c) => c.fileId === fileId && c.position);
  const decorations = forFile.map((c) => {
    const line = c.position.lineNumber || 1;
    const col = c.position.column || 1;
    return {
      range: new monaco.Range(line, col, line, col),
      options: {
        className: "remote-cursor",
        stickiness: 1,
        hoverMessage: { value: c.userName || "Collaborator" },
        beforeContentClassName: "remote-cursor-cap",
        overviewRuler: {
          color: c.color,
          position: 4,
        },
        glyphMarginClassName: undefined,
        inlineClassName: undefined,
        after: {
          content: ` ${c.userName || "•"}`,
          inlineClassName: "remote-cursor-label",
          cursorStops: null,
        },
      },
    };
  });

  return editor.deltaDecorations(previousIds, decorations);
}

function setEditorValueRemote(editor: Monaco.editor.IStandaloneCodeEditor, content: string) {
  if (editor.getValue() === content) return;
  (editor as any).__isApplyingRemote = true;
  try {
    editor.setValue(content);
  } finally {
    setTimeout(() => {
      (editor as any).__isApplyingRemote = false;
    }, 0);
  }
}

function applyContentToEditors(
  editors: Map<string, EditorSet>,
  key: string,
  content: string
) {
  const set = editors.get(key);
  if (!set) return;
  set.forEach((ed) => setEditorValueRemote(ed, content));
}

export const useSessionStore = create<SessionState>((set, get) => ({
  cable: null,
  cableIdentifier: null,
  connectedSessionId: null,
  editors: new Map(),
  remoteCursors: new Map(),
  decorations: new Map(),
  onlineUsers: new Map(),
  fileContents: new Map(),

  getFileContent: (sessionId, fileId) => {
    return get().fileContents.get(`${sessionId}:${fileId}`);
  },

  connectYjs: (
    sessionId: string,
    fileId: string,
    editor: Monaco.editor.IStandaloneCodeEditor,
    userId: string,
    userName: string
  ) => {
    const { cable, cableIdentifier, connectedSessionId, editors, fileContents } = get();

    const docKey = `${sessionId}:${fileId}`;
    const existing = editors.get(docKey) || new Set();
    existing.add(editor);
    editors.set(docKey, existing);
    set({ editors: new Map(editors) });

    // Apply any already-synced content for late-mounted editors
    const cached = fileContents.get(docKey);
    if (typeof cached === "string" && editor.getValue() !== cached) {
      setEditorValueRemote(editor, cached);
    }

    const token = localStorage.getItem("token") || "";
    const cableUrlBase = getCableUrl();
    const cableUrl = token
      ? `${cableUrlBase}${cableUrlBase.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
      : cableUrlBase;
    const identifier = JSON.stringify({ channel: "SessionsChannel", session_id: sessionId });

    const ensureCable = () => {
      if (
        cable &&
        (cable.readyState === WebSocket.OPEN || cable.readyState === WebSocket.CONNECTING) &&
        connectedSessionId === sessionId &&
        cableIdentifier === identifier
      ) {
        return;
      }

      if (cable && connectedSessionId && connectedSessionId !== sessionId) {
        try {
          cable.close();
        } catch {
          // ignore
        }
        set({ cable: null, cableIdentifier: null, connectedSessionId: null });
      }

      const ws = new WebSocket(cableUrl);
      set({ cable: ws, cableIdentifier: identifier, connectedSessionId: sessionId });

      const send = (payload: any) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        ws.send(JSON.stringify(payload));
      };

      ws.onopen = () => {
        send({ command: "subscribe", identifier });
      };

      ws.onmessage = (event) => {
        const data = typeof event.data === "string" ? safeJsonParse<any>(event.data) : null;
        if (!data) return;
        if (data.type === "welcome" || data.type === "ping" || data.type === "confirm_subscription") return;
        if (!data.message) return;

        const msg = data.message;

        if (msg.type === "user_joined" && msg.user?.id) {
          const next = new Map(get().onlineUsers);
          next.set(String(msg.user.id), {
            id: String(msg.user.id),
            name: msg.user.name,
            email: msg.user.email,
          });
          set({ onlineUsers: next });
          return;
        }

        if (msg.type === "user_left" && msg.user?.id) {
          const next = new Map(get().onlineUsers);
          next.delete(String(msg.user.id));
          set({ onlineUsers: next });
          return;
        }

        if ((msg.type === "code_change" || msg.type === "code_sync") && msg.file_id) {
          if (msg.type === "code_change" && msg.user_id?.toString?.() === userId?.toString?.()) {
            // Still cache our own writes so late editors get them
            const key = `${sessionId}:${msg.file_id}`;
            const nextContents = new Map(get().fileContents);
            nextContents.set(key, typeof msg.content === "string" ? msg.content : "");
            set({ fileContents: nextContents });
            return;
          }

          const key = `${sessionId}:${msg.file_id}`;
          const incoming = typeof msg.content === "string" ? msg.content : "";
          const nextContents = new Map(get().fileContents);
          nextContents.set(key, incoming);
          set({ fileContents: nextContents });
          applyContentToEditors(get().editors, key, incoming);
          return;
        }

        if (msg.type === "cursor_update" && msg.user_id && msg.position && msg.file_id) {
          if (msg.user_id?.toString?.() === userId?.toString?.()) return;

          const cursor: RemoteCursor = {
            userId: msg.user_id.toString(),
            userName: msg.user_name || "Anonymous",
            color: colorForUser(String(msg.user_id)),
            position: msg.position,
            fileId: String(msg.file_id),
          };

          const next = new Map(get().remoteCursors);
          next.set(cursor.userId, cursor);
          set({ remoteCursors: next });

          const key = `${sessionId}:${msg.file_id}`;
          const targetSet = get().editors.get(key);
          if (targetSet) {
            targetSet.forEach((targetEditor) => {
              const prev = get().decorations.get(key) || [];
              const ids = applyRemoteCursorDecorations(targetEditor, String(msg.file_id), next, prev);
              const dec = new Map(get().decorations);
              dec.set(key, ids);
              set({ decorations: dec });
            });
          }
          return;
        }
      };
    };

    ensureCable();

    // Avoid stacking listeners on reconnect / remount
    const disposables: { dispose: () => void }[] = (editor as any).__collabDisposables || [];
    disposables.forEach((d) => {
      try {
        d.dispose();
      } catch {
        // ignore
      }
    });
    const nextDisposables: { dispose: () => void }[] = [];

    nextDisposables.push(
      editor.onDidChangeModelContent(() => {
        if ((editor as any).__isApplyingRemote) return;
        const content = editor.getValue();

        const nextContents = new Map(get().fileContents);
        nextContents.set(docKey, content);
        set({ fileContents: nextContents });

        // Keep sibling editors (Code + Interview for same file) in sync locally
        const siblings = get().editors.get(docKey);
        siblings?.forEach((sib) => {
          if (sib !== editor && sib.getValue() !== content) {
            setEditorValueRemote(sib, content);
          }
        });

        scheduleCodeBroadcast(docKey, () => {
          const activeCable = get().cable;
          const activeId = get().cableIdentifier;
          if (!activeCable || activeCable.readyState !== WebSocket.OPEN || !activeId) return;

          activeCable.send(
            JSON.stringify({
              command: "message",
              identifier: activeId,
              data: JSON.stringify({
                action: "code_change",
                file_id: fileId,
                content: get().fileContents.get(docKey) ?? content,
                cursor_position: editor.getPosition(),
                user_id: userId,
                user_name: userName,
              }),
            })
          );
        });
      })
    );

    nextDisposables.push(
      editor.onDidChangeCursorPosition((e) => {
        get().broadcastCursor(fileId, e.position, editor.getSelection() || undefined);
      })
    );

    nextDisposables.push(
      editor.onDidChangeCursorSelection((e) => {
        const selection = e.selection;
        const position = selection.getStartPosition();
        get().broadcastCursor(fileId, position, selection);
      })
    );

    (editor as any).__collabDisposables = nextDisposables;
  },

  broadcastCursor: (fileId: string, position: Monaco.Position, selection?: Monaco.Selection) => {
    scheduleCursorBroadcast(() => {
      const { cable, cableIdentifier, connectedSessionId } = get();
      if (!cable || cable.readyState !== WebSocket.OPEN || !cableIdentifier || !connectedSessionId) return;

      const payload = {
        command: "message",
        identifier: cableIdentifier,
        data: JSON.stringify({
          action: "cursor_update",
          file_id: fileId,
          position: {
            lineNumber: position.lineNumber,
            column: position.column,
          },
          selection: selection
            ? {
                startLineNumber: selection.startLineNumber,
                startColumn: selection.startColumn,
                endLineNumber: selection.endLineNumber,
                endColumn: selection.endColumn,
              }
            : undefined,
        }),
      };
      try {
        cable.send(JSON.stringify(payload));
      } catch {
        // ignore
      }
    });
  },

  disconnectYjs: (sessionId: string, fileId: string, editor?: Monaco.editor.IStandaloneCodeEditor) => {
    const { editors, decorations } = get();
    const docKey = `${sessionId}:${fileId}`;
    flushCodeBroadcast(docKey);
    const setForKey = editors.get(docKey);

    if (setForKey && editor) {
      const disposables: { dispose: () => void }[] = (editor as any).__collabDisposables || [];
      disposables.forEach((d) => {
        try {
          d.dispose();
        } catch {
          // ignore
        }
      });
      (editor as any).__collabDisposables = [];
      setForKey.delete(editor);
      if (setForKey.size === 0) {
        editors.delete(docKey);
      }
      set({ editors: new Map(editors) });
    } else if (setForKey) {
      editors.delete(docKey);
      set({ editors: new Map(editors) });
    }

    if (decorations.has(docKey) && (!setForKey || setForKey.size === 0)) {
      decorations.delete(docKey);
      set({ decorations: new Map(decorations) });
    }

    // Count remaining editors across all keys
    let remaining = 0;
    get().editors.forEach((s) => {
      remaining += s.size;
    });

    if (remaining === 0) {
      const { cable } = get();
      try {
        cable?.close();
      } catch {
        // ignore
      }
      set({ cable: null, cableIdentifier: null, connectedSessionId: null });
    }
  },
}));
