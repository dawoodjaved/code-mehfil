"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { io, Socket } from "socket.io-client";

interface WhiteboardProps {
  sessionId: string;
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
}

function getCableUrl(token: string) {
  const explicit =
    process.env.NEXT_PUBLIC_CABLE_URL || process.env.NEXT_PUBLIC_WS_URL;
  const base =
    explicit ||
    getApiUrl().replace(/^http/i, "ws").replace(/\/+$/, "") + "/cable";
  if (!token) return base;
  return `${base}${base.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`;
}

export function Whiteboard({ sessionId }: WhiteboardProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [initialData, setInitialData] = useState<any>(null);
  const [collabMode, setCollabMode] = useState<"socket.io" | "actioncable" | "local">("local");
  const socketRef = useRef<Socket | null>(null);
  const cableRef = useRef<WebSocket | null>(null);
  const identifierRef = useRef<string>("");
  const [userId, setUserId] = useState<string>("anonymous");
  const applyingRemoteRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch(`${getApiUrl()}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const userData = await response.json();
          setUserId(userData.id?.toString() || userData.user?.id?.toString() || "anonymous");
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };
    fetchUserInfo();
  }, []);

  // Prefer Socket.IO when configured; otherwise ActionCable for realtime sync.
  useEffect(() => {
    if (!sessionId || userId === "anonymous") return;

    const socketIoUrl = process.env.NEXT_PUBLIC_SOCKET_IO_URL;
    if (socketIoUrl) {
      const socket = io(`${socketIoUrl}/sessions`, {
        auth: { token: localStorage.getItem("token") },
      });
      socket.emit("join-session", { sessionId });
      socketRef.current = socket;
      setCollabMode("socket.io");

      socket.on("whiteboard-update", (data: { elements: any; appState: any; files: any; userId?: string }) => {
        if (!excalidrawAPI || data.userId === userId) return;
        applyingRemoteRef.current = true;
        excalidrawAPI.updateScene({
          elements: data.elements,
          appState: data.appState,
          files: data.files,
        });
        setTimeout(() => {
          applyingRemoteRef.current = false;
        }, 50);
      });

      socket.emit("whiteboard-sync-request", { sessionId });
      socket.on("whiteboard-sync", (data: { elements: any; appState: any; files: any }) => {
        setInitialData({
          elements: data.elements || [],
          appState: data.appState || {},
          files: data.files || {},
        });
      });

      return () => {
        socket.emit("leave-session", { sessionId });
        socket.disconnect();
        socketRef.current = null;
      };
    }

    const token = localStorage.getItem("token") || "";
    const identifier = JSON.stringify({
      channel: "SessionsChannel",
      session_id: sessionId,
    });
    identifierRef.current = identifier;
    const ws = new WebSocket(getCableUrl(token));
    cableRef.current = ws;
    setCollabMode("actioncable");

    ws.onopen = () => {
      ws.send(JSON.stringify({ command: "subscribe", identifier }));
    };

    ws.onmessage = (event) => {
      let data: any;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      if (!data.message || data.message.type !== "whiteboard_update") return;
      const msg = data.message;
      if (String(msg.user_id) === String(userId)) return;
      if (!excalidrawAPI) return;
      applyingRemoteRef.current = true;
      excalidrawAPI.updateScene({
        elements: msg.elements || [],
        appState: msg.app_state || {},
        files: msg.files || {},
      });
      setTimeout(() => {
        applyingRemoteRef.current = false;
      }, 50);
    };

    return () => {
      try {
        ws.send(JSON.stringify({ command: "unsubscribe", identifier }));
        ws.close();
      } catch {
        // ignore
      }
      cableRef.current = null;
    };
  }, [sessionId, userId, excalidrawAPI]);

  const broadcastScene = useCallback(
    (elements: readonly any[], appState: any, files: any) => {
      if (applyingRemoteRef.current) return;

      if (socketRef.current) {
        socketRef.current.emit("whiteboard-update", {
          sessionId,
          userId,
          elements,
          appState,
          files,
        });
        return;
      }

      const ws = cableRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN || !identifierRef.current) return;
      ws.send(
        JSON.stringify({
          command: "message",
          identifier: identifierRef.current,
          data: JSON.stringify({
            action: "whiteboard_update",
            elements,
            app_state: {
              viewBackgroundColor: appState?.viewBackgroundColor,
            },
            files: {},
          }),
        })
      );
    },
    [sessionId, userId]
  );

  const handleChange = useCallback(
    (elements: readonly any[], appState: any, files: any) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        broadcastScene(elements, appState, files);
      }, 200);
    },
    [broadcastScene]
  );

  const handleExport = useCallback(async () => {
    if (!excalidrawAPI) return;
    try {
      const { exportToCanvas } = await import("@excalidraw/excalidraw");
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const files = excalidrawAPI.getFiles();
      const canvas = await exportToCanvas({
        elements,
        appState,
        files,
        getDimensions: (width: number, height: number) => ({ width, height, scale: 1 }),
      });
      const link = document.createElement("a");
      link.download = `whiteboard-${sessionId}-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Failed to export whiteboard:", error);
    }
  }, [sessionId, excalidrawAPI]);

  const handleExportAsExcalidraw = useCallback(async () => {
    if (!excalidrawAPI) return;
    try {
      const data = {
        type: "excalidraw",
        version: 2,
        source: "codemehfil",
        elements: excalidrawAPI.getSceneElements(),
        appState: excalidrawAPI.getAppState(),
        files: excalidrawAPI.getFiles(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `whiteboard-${sessionId}-${Date.now()}.excalidraw`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export as Excalidraw file:", error);
    }
  }, [sessionId, excalidrawAPI]);

  const handleLoad = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !excalidrawAPI) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.type === "excalidraw" && data.elements) {
          excalidrawAPI.updateScene({
            elements: data.elements,
            appState: data.appState || {},
            files: data.files || {},
          });
        }
      } catch (error) {
        console.error("Failed to load Excalidraw file:", error);
      }
    },
    [excalidrawAPI]
  );

  return (
    <div className="relative z-0 flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-background">
      <div className="relative z-10 flex flex-shrink-0 items-center gap-2 border-b bg-muted/50 p-2">
        <button
          onClick={handleExport}
          className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
          title="Export as PNG"
        >
          Export PNG
        </button>
        <button
          onClick={handleExportAsExcalidraw}
          className="rounded bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-colors hover:bg-secondary/90"
          title="Export as Excalidraw file"
        >
          Export .excalidraw
        </button>
        <label className="cursor-pointer rounded bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-colors hover:bg-secondary/90">
          Load File
          <input
            type="file"
            accept=".excalidraw,.json"
            onChange={handleLoad}
            className="hidden"
          />
        </label>
        <div className="flex-1" />
        <div className="text-xs text-muted-foreground">
          Sync:{" "}
          {collabMode === "socket.io"
            ? "Socket.IO"
            : collabMode === "actioncable"
              ? "ActionCable (live)"
              : "local only"}
        </div>
      </div>

      {/* Isolate Excalidraw so its layers cannot cover session tabs */}
      <div className="relative z-0 min-h-0 flex-1 overflow-hidden isolate">
        <Excalidraw
          excalidrawAPI={(api: any) => {
            if (api) setExcalidrawAPI(api);
          }}
          initialData={initialData}
          onChange={handleChange}
          UIOptions={{
            canvasActions: {
              saveToActiveFile: false,
              loadScene: false,
              export: false,
              toggleTheme: true,
            },
            tools: { image: true },
          }}
          renderTopRightUI={() => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => excalidrawAPI?.resetScene()}
                className="rounded bg-destructive px-2 py-1 text-xs text-destructive-foreground transition-colors hover:bg-destructive/90"
                title="Clear whiteboard"
              >
                Clear
              </button>
            </div>
          )}
          theme="dark"
          name={`Whiteboard - ${sessionId}`}
        />
      </div>
    </div>
  );
}
