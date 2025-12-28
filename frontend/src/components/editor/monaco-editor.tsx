"use client";

import { useEffect, useRef } from "react";
import * as Monaco from "monaco-editor";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const { connectYjs, disconnectYjs } = useSessionStore();

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Monaco Editor
    const editor = Monaco.editor.create(containerRef.current, {
      value: initialValue,
      language,
      theme: "vs-dark",
      automaticLayout: true,
      minimap: { enabled: true },
      fontSize: 14,
      lineNumbers: "on",
      roundedSelection: false,
      scrollBeyondLastLine: false,
      readOnly: false,
      cursorStyle: "line",
    });

    editorRef.current = editor;

    // Connect to Y.js for real-time collaboration
    connectYjs(sessionId, fileId, editor);

    // Handle content changes
    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      onChange?.(value);
    });

    return () => {
      disconnectYjs(sessionId, fileId);
      editor.dispose();
    };
  }, [sessionId, fileId, language, initialValue, onChange, connectYjs, disconnectYjs]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: "400px" }}
    />
  );
}

