"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { io, Socket } from "socket.io-client";

interface WhiteboardProps {
  sessionId: string;
}

export function Whiteboard({ sessionId }: WhiteboardProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [initialData, setInitialData] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const [userId, setUserId] = useState<string>("anonymous");
  const [userName, setUserName] = useState<string>("Anonymous User");
  const isInitialSyncRef = useRef(false);

  // Fetch user info on mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const response = await fetch(`${apiUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUserId(userData.id?.toString() || userData.user?.id?.toString() || "anonymous");
          setUserName(userData.name || userData.user?.name || "Anonymous User");
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  // Initialize socket connection for collaboration
  useEffect(() => {
    if (!sessionId || userId === "anonymous") return;

    // Whiteboard collaboration requires a Socket.IO server (not provided by Rails ActionCable).
    // To enable it, set NEXT_PUBLIC_SOCKET_IO_URL (example: http://localhost:4002).
    const socketIoUrl = process.env.NEXT_PUBLIC_SOCKET_IO_URL;
    if (!socketIoUrl) {
      console.warn("Whiteboard realtime disabled: NEXT_PUBLIC_SOCKET_IO_URL is not set");
      return;
    }

    const socket = io(`${socketIoUrl}/sessions`, {
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    socket.emit("join-session", { sessionId });
    socketRef.current = socket;

    // Listen for whiteboard updates from other users
    socket.on("whiteboard-update", (data: { elements: any; appState: any; files: any }) => {
      if (!excalidrawAPI || isInitialSyncRef.current) return;
      
      excalidrawAPI.updateScene({
        elements: data.elements,
        appState: data.appState,
        files: data.files,
      });
    });

    // Request initial whiteboard state
    socket.emit("whiteboard-sync-request", { sessionId });

    // Listen for initial sync
    socket.on("whiteboard-sync", (data: { elements: any; appState: any; files: any }) => {
      if (isInitialSyncRef.current) return;
      isInitialSyncRef.current = true;
      
      setInitialData({
        elements: data.elements || [],
        appState: data.appState || {},
        files: data.files || {},
      });
    });

    return () => {
      socket.emit("leave-session", { sessionId });
      socket.disconnect();
    };
  }, [sessionId, userId, excalidrawAPI]);

  // Handle scene changes and broadcast to other users
  const handleChange = useCallback(
    (elements: readonly any[], appState: any, files: any) => {
      if (!socketRef.current || !isInitialSyncRef.current) return;

      // Broadcast changes to other users
      socketRef.current.emit("whiteboard-update", {
        sessionId,
        elements,
        appState,
        files,
      });
    },
    [sessionId]
  );

  // Export whiteboard as image
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
  }, [sessionId]);

  // Export as Excalidraw file
  const handleExportAsExcalidraw = useCallback(async () => {
    if (!excalidrawAPI) return;

    try {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const files = excalidrawAPI.getFiles();

      const data = {
        type: "excalidraw",
        version: 2,
        source: "code-pair",
        elements,
        appState,
        files,
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
  }, [sessionId]);

  // Load Excalidraw file
  const handleLoad = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [excalidrawAPI]);

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full bg-background">
      {/* Toolbar */}
      <div className="border-b p-2 flex items-center gap-2 bg-muted/50 flex-shrink-0">
        <button
          onClick={handleExport}
          className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          title="Export as PNG"
        >
          Export PNG
        </button>
        <button
          onClick={handleExportAsExcalidraw}
          className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors"
          title="Export as Excalidraw file"
        >
          Export .excalidraw
        </button>
        <label className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors cursor-pointer">
          Load File
          <input
            type="file"
            accept=".excalidraw,.json"
            onChange={handleLoad}
            className="hidden"
          />
        </label>
        <div className="flex-1" />
        <div className="text-sm text-muted-foreground">
          Session: {sessionId}
        </div>
      </div>

      {/* Excalidraw Canvas */}
      <div className="flex-1 overflow-hidden relative">
        <Excalidraw
          excalidrawAPI={(api: any) => {
            if (api) {
              setExcalidrawAPI(api);
            }
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
            tools: {
              // Enable all tools
              image: true,
            },
          }}
          renderTopRightUI={() => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => excalidrawAPI?.resetScene()}
                className="px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors"
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
