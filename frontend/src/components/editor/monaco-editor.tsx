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
  /** Skip a duplicate /auth/me when the parent already knows the user */
  userId?: string;
  userName?: string;
}

export function MonacoEditor({
  sessionId,
  fileId,
  language,
  initialValue = "",
  onChange,
  userId: userIdProp,
  userName: userNameProp,
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [userId, setUserId] = useState<string>(userIdProp || "");
  const [userName, setUserName] = useState<string>(userNameProp || "");
  const [mounted, setMounted] = useState(false);
  const connectYjs = useSessionStore((s) => s.connectYjs);
  const disconnectYjs = useSessionStore((s) => s.disconnectYjs);
  const synced = useSessionStore((s) => s.fileContents.get(`${sessionId}:${fileId}`));
  const seedValue = typeof synced === "string" ? synced : initialValue;

  useEffect(() => {
    if (userIdProp) {
      setUserId(userIdProp);
      setUserName(userNameProp || "User");
      return;
    }

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
          setUserId(userData.id?.toString() || userData.user?.id?.toString() || "");
          setUserName(userData.name || userData.user?.name || "User");
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    fetchUserInfo();
  }, [userIdProp, userNameProp]);

  const handleEditorDidMount = useCallback((ed: editor.IStandaloneCodeEditor) => {
    editorRef.current = ed;
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !editorRef.current || !userId || !fileId) return;

    const ed = editorRef.current;
    connectYjs(sessionId, fileId, ed, userId, userName || "User");

    return () => {
      disconnectYjs(sessionId, fileId, ed);
    };
  }, [mounted, sessionId, fileId, userId, userName, connectYjs, disconnectYjs]);

  const handleChange = useCallback(
    (value: string | undefined) => {
      onChange?.(value || "");
    },
    [onChange]
  );

  // Uncontrolled after mount (defaultValue) so React value props don't fight remote setValue.
  // Remount when fileId changes via key on the parent or here.
  return (
    <div className="h-full w-full">
      <Editor
        key={fileId}
        height="100%"
        language={language}
        defaultValue={seedValue}
        theme="vs-dark"
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false,
          cursorStyle: "line",
          renderWhitespace: "none",
          smoothScrolling: false,
        }}
      />
    </div>
  );
}
