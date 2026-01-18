import { create } from "zustand";
import { Monaco } from "@/lib/monaco-config";

interface RemoteCursor {
  userId: string;
  userName: string;
  color: string;
  position: Monaco.Position;
  selection?: Monaco.Selection;
}

interface SessionState {
  cable: WebSocket | null;
  cableIdentifier: string | null;
  connectedSessionId: string | null;
  editors: Map<string, Monaco.editor.IStandaloneCodeEditor>;
  remoteCursors: Map<string, RemoteCursor>;
  decorations: Map<string, string[]>;
  connectYjs: (
    sessionId: string,
    fileId: string,
    editor: Monaco.editor.IStandaloneCodeEditor,
    userId: string,
    userName: string
  ) => void;
  disconnectYjs: (sessionId: string, fileId: string) => void;
  broadcastCursor: (fileId: string, position: Monaco.Position, selection?: Monaco.Selection) => void;
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
}

function getCableUrl() {
  // Prefer explicit WS/Cable URL envs if present; otherwise derive from API URL.
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

export const useSessionStore = create<SessionState>((set, get) => ({
  cable: null,
  cableIdentifier: null,
  connectedSessionId: null,
  editors: new Map(),
  remoteCursors: new Map(),
  decorations: new Map(),

  connectYjs: (
    sessionId: string,
    fileId: string,
    editor: Monaco.editor.IStandaloneCodeEditor,
    userId: string,
    userName: string
  ) => {
    const { cable, cableIdentifier, connectedSessionId, editors } = get();

    // Track editor for this file so incoming broadcasts can update it.
    const docKey = `${sessionId}:${fileId}`;
    if (editors.has(docKey)) return;
    editors.set(docKey, editor);
    set({ editors });

    // Ensure a cable connection + subscription exists for this session.
    const token = localStorage.getItem("token") || "";
    const cableUrlBase = getCableUrl();
    const cableUrl = token ? `${cableUrlBase}${cableUrlBase.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}` : cableUrlBase;
    const identifier = JSON.stringify({ channel: "SessionsChannel", session_id: sessionId });

    // If we’re already connected (or connecting) to this session, we’re done.
    if (
      cable &&
      (cable.readyState === WebSocket.OPEN || cable.readyState === WebSocket.CONNECTING) &&
      connectedSessionId === sessionId &&
      cableIdentifier === identifier
    ) {
      return;
    }

    // Tear down old connection if switching sessions.
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
      // ActionCable handshake happens server-side; we subscribe after open.
      send({ command: "subscribe", identifier });
    };

    ws.onmessage = (event) => {
      const data = typeof event.data === "string" ? safeJsonParse<any>(event.data) : null;
      if (!data) return;
      // Ignore non-message frames.
      if (data.type === "welcome" || data.type === "ping" || data.type === "confirm_subscription") return;
      if (!data.message) return;

      const msg = data.message;

      // Code changes
      if (msg.type === "code_change" && msg.file_id) {
        // Don’t apply our own echoes
        if (msg.user_id?.toString?.() === userId?.toString?.()) return;

        const key = `${sessionId}:${msg.file_id}`;
        const targetEditor = get().editors.get(key);
        if (!targetEditor) return;

        const model = targetEditor.getModel();
        if (!model) return;

        // Simple sync: replace whole buffer.
        const incoming = typeof msg.content === "string" ? msg.content : "";
        if (targetEditor.getValue() !== incoming) {
          targetEditor.setValue(incoming);
        }
        return;
      }

      // Cursor updates (currently not rendered elsewhere, but we keep the state for future UI)
      if (msg.type === "cursor_update" && msg.user_id && msg.position && msg.file_id) {
        if (msg.user_id?.toString?.() === userId?.toString?.()) return;

        const cursor: RemoteCursor = {
          userId: msg.user_id.toString(),
          userName: msg.user_name || "Anonymous",
          color: "#3b82f6",
          position: msg.position,
        };

        const next = new Map(get().remoteCursors);
        next.set(cursor.userId, cursor);
        set({ remoteCursors: next });
        return;
      }
    };

    // Broadcast local edits via ActionCable.
    let isApplyingRemote = false;
    const originalSetValue = editor.setValue.bind(editor);
    editor.setValue = ((value: string) => {
      isApplyingRemote = true;
      try {
        originalSetValue(value);
      } finally {
        setTimeout(() => {
          isApplyingRemote = false;
        }, 0);
      }
    }) as any;

    editor.onDidChangeModelContent(() => {
      if (isApplyingRemote) return;
      const content = editor.getValue();

      send({
        command: "message",
        identifier,
        data: JSON.stringify({
          action: "code_change",
          file_id: fileId,
          content,
          cursor_position: editor.getPosition(),
          user_id: userId,
          user_name: userName,
        }),
      });
    });

    editor.onDidChangeCursorPosition((e) => {
      get().broadcastCursor(fileId, e.position, editor.getSelection() || undefined);
    });

    editor.onDidChangeCursorSelection((e) => {
      const selection = e.selection;
      const position = selection.getStartPosition();
      get().broadcastCursor(fileId, position, selection);
    });
  },

  broadcastCursor: (fileId: string, position: Monaco.Position, selection?: Monaco.Selection) => {
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
      }),
    };
    try {
      cable.send(JSON.stringify(payload));
    } catch {
      // ignore
    }
  },

  disconnectYjs: (sessionId: string, fileId: string) => {
    const { editors } = get();
    const docKey = `${sessionId}:${fileId}`;
    if (editors.has(docKey)) {
      editors.delete(docKey);
      set({ editors });
    }

    // Keep the cable connection alive for other open files in the same session.
    // If no editors remain, we can close the socket to avoid leaking connections.
    if (get().editors.size === 0) {
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
