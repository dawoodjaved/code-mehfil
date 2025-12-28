import { create } from "zustand";
import * as Y from "yjs";
import { io, Socket } from "socket.io-client";
import * as Monaco from "monaco-editor";
import { WebsocketProvider } from "y-websocket";

interface RemoteCursor {
  userId: string;
  userName: string;
  color: string;
  position: Monaco.Position;
  selection?: Monaco.Selection;
}

interface SessionState {
  socket: Socket | null;
  ydoc: Y.Doc | null;
  providers: Map<string, WebsocketProvider>;
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

export const useSessionStore = create<SessionState>((set, get) => ({
  socket: null,
  ydoc: null,
  providers: new Map(),
  remoteCursors: new Map(),
  decorations: new Map(),

  connectYjs: (
    sessionId: string,
    fileId: string,
    editor: Monaco.editor.IStandaloneCodeEditor,
    userId: string,
    userName: string
  ) => {
    const { providers, socket } = get();

    // Initialize socket if not exists
    if (!socket) {
      const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}/sessions`, {
        auth: {
          token: localStorage.getItem("token"),
        },
      });

      newSocket.emit("join-session", { sessionId });

      set({ socket: newSocket });
    }

    const docKey = `${sessionId}:${fileId}`;

    // Create or get Y.js document
    let ydoc = get().ydoc;
    if (!ydoc) {
      ydoc = new Y.Doc();
      set({ ydoc });
    }

    // Create WebSocket provider for real-time sync
    const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws") || "ws://localhost:4000";
    const provider = new WebsocketProvider(`${wsUrl}/yjs`, docKey, ydoc);

    providers.set(docKey, provider);

    // Get Y.js text type
    const ytext = ydoc.getText("content");

    // Initialize content from Y.js
    if (ytext.length === 0 && editor.getValue()) {
      ytext.insert(0, editor.getValue());
    } else if (ytext.length > 0) {
      editor.setValue(ytext.toString());
    }

    // Sync Y.js changes to Monaco
    ytext.observe((event) => {
      if (event.transaction.origin !== userId) {
        const model = editor.getModel();
        if (!model) return;

        // Apply Y.js changes to Monaco
        event.delta.forEach((delta) => {
          if (delta.retain !== undefined) {
            // Retain (no change)
          }
          if (delta.insert) {
            const pos = model.getPositionAt(delta.retain || 0);
            editor.executeEdits("yjs", [
              {
                range: new Monaco.Range(
                  pos.lineNumber,
                  pos.column,
                  pos.lineNumber,
                  pos.column
                ),
                text: delta.insert as string,
              },
            ]);
          }
          if (delta.delete) {
            const startPos = model.getPositionAt(delta.retain || 0);
            const endPos = model.getPositionAt((delta.retain || 0) + delta.delete);
            editor.executeEdits("yjs", [
              {
                range: new Monaco.Range(
                  startPos.lineNumber,
                  startPos.column,
                  endPos.lineNumber,
                  endPos.column
                ),
                text: "",
              },
            ]);
          }
        });
      }
    });

    // Sync Monaco changes to Y.js
    let isApplyingYjs = false;
    editor.onDidChangeModelContent((e) => {
      if (isApplyingYjs) return;

      const model = editor.getModel();
      if (!model) return;

      e.changes.forEach((change) => {
        const startOffset = model.getOffsetAt(change.range.getStartPosition());
        const endOffset = model.getOffsetAt(change.range.getEndPosition());

        // Delete old text
        if (endOffset > startOffset) {
          ytext.delete(startOffset, endOffset - startOffset);
        }

        // Insert new text
        if (change.text) {
          ytext.insert(startOffset, change.text);
        }
      });
    });

    // Handle cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      get().broadcastCursor(fileId, e.position, editor.getSelection() || undefined);
    });

    // Handle selection changes
    editor.onDidChangeCursorSelection((e) => {
      get().broadcastCursor(fileId, e.position, e.selection);
    });

    set({ providers });
  },

  broadcastCursor: (fileId: string, position: Monaco.Position, selection?: Monaco.Selection) => {
    const { socket } = get();
    if (!socket) return;

    socket.emit("cursor-change", {
      fileId,
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
    });
  },

  disconnectYjs: (sessionId: string, fileId: string) => {
    const { socket, ydoc, providers } = get();
    const docKey = `${sessionId}:${fileId}`;

    const provider = providers.get(docKey);
    if (provider) {
      provider.destroy();
      providers.delete(docKey);
    }

    if (socket) {
      socket.emit("leave-session", { sessionId });
    }

    set({ providers });
  },
}));
