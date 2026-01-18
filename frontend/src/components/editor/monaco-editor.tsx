"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useSessionStore } from "@/store/session-store";

interface MonacoEditorProps {
  sessionId: string;
  fileId: string;
  language: string;
  initialValue?: string;
  onChange?: (value: string) => void;
}

export function MonacoEditor({
  sessionId,
  fileId,
  language,
  initialValue = "",
  onChange,
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [userId, setUserId] = useState<string>("anonymous");
  const [userName, setUserName] = useState<string>("Anonymous User");
  const { connectYjs, disconnectYjs } = useSessionStore();

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

  // Handle editor mount
  const handleEditorDidMount = useCallback(
    (editor: editor.IStandaloneCodeEditor) => {
      editorRef.current = editor;
    },
    []
  );

  // Connect to Y.js when both editor and user info are ready
  useEffect(() => {
    if (!editorRef.current || !userId || !userName || userId === "anonymous") return;
    
    connectYjs(sessionId, fileId, editorRef.current, userId, userName);
    
    return () => {
      disconnectYjs(sessionId, fileId);
    };
  }, [sessionId, fileId, userId, userName, connectYjs, disconnectYjs]);

  // Handle value changes
  const handleChange = useCallback(
    (value: string | undefined) => {
      onChange?.(value || "");
    },
    [onChange]
  );

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={language}
        value={initialValue}
        theme="vs-dark"
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          automaticLayout: true,
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false,
          cursorStyle: "line",
        }}
      />
    </div>
  );
}

