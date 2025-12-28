"use client";

import { useEffect, useRef, useState } from "react";
import * as Monaco from "monaco-editor";
import { useSessionStore } from "@/store/session-store";
import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles } from "lucide-react";

interface MonacoEditorEnhancedProps {
  sessionId: string;
  fileId: string;
  language: string;
  initialValue?: string;
  onChange?: (value: string) => void;
  userId: string;
  userName: string;
  theme?: string;
  keybindings?: "default" | "vim" | "emacs";
}

export function MonacoEditorEnhanced({
  sessionId,
  fileId,
  language,
  initialValue = "",
  onChange,
  userId,
  userName,
  theme = "vs-dark",
  keybindings = "default",
}: MonacoEditorEnhancedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Monaco.languages.CompletionItem[]>([]);
  const { connectYjs, disconnectYjs } = useSessionStore();

  useEffect(() => {
    if (!containerRef.current) return;

    // Register custom themes
    Monaco.editor.defineTheme("one-dark-pro", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#282c34",
      },
    });

    Monaco.editor.defineTheme("dracula", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#282a36",
      },
    });

    // Initialize Monaco Editor
    const editor = Monaco.editor.create(containerRef.current, {
      value: initialValue,
      language,
      theme,
      automaticLayout: true,
      minimap: { enabled: true },
      fontSize: 14,
      lineNumbers: "on",
      roundedSelection: false,
      scrollBeyondLastLine: false,
      readOnly: false,
      cursorStyle: "line",
      wordWrap: "on",
      formatOnPaste: true,
      formatOnType: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
    });

    // Set keybindings
    if (keybindings === "vim") {
      // Vim keybindings would require monaco-vim extension
      // For now, we'll note it needs the extension
    } else if (keybindings === "emacs") {
      // Emacs keybindings would require monaco-emacs extension
    }

    editorRef.current = editor;

    // Connect to Y.js for real-time collaboration
    connectYjs(sessionId, fileId, editor, userId, userName);

    // Register AI autocomplete provider
    Monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: async (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        try {
          const response = await fetch("/api/ai/autocomplete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: textUntilPosition.slice(-50),
              context: textUntilPosition,
            }),
          });

          const data = await response.json();
          const suggestions = data.suggestions?.map((s: any) => ({
            label: s.text,
            kind: Monaco.languages.CompletionItemKind.Text,
            insertText: s.text,
            detail: s.type,
          })) || [];

          return { suggestions };
        } catch (error) {
          return { suggestions: [] };
        }
      },
    });

    // Register formatting provider
    Monaco.languages.registerDocumentFormattingEditProvider(language, {
      provideDocumentFormattingEdits: async (model) => {
        try {
          // Use Prettier or language-specific formatter
          const response = await fetch("/api/format", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: model.getValue(),
              language,
            }),
          });

          const data = await response.json();
          return [
            {
              range: model.getFullModelRange(),
              text: data.formatted || model.getValue(),
            },
          ];
        } catch (error) {
          return [];
        }
      },
    });

    // Register linting/error provider
    Monaco.languages.registerDocumentSemanticTokensProvider(language, {
      getLegend: () => ({
        tokenTypes: ["error", "warning", "info"],
        tokenModifiers: [],
      }),
      provideDocumentSemanticTokens: async (model) => {
        try {
          const response = await fetch("/api/lint", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: model.getValue(),
              language,
            }),
          });

          const data = await response.json();
          const errors = data.errors || [];
          
          // Update errors state for error lens
          setErrors(errors.map((e: any) => ({
            line: e.line || 1,
            column: e.column || 1,
            length: e.length || 1,
            message: e.message || "Error",
            severity: e.severity || "error",
          })));

          // Convert errors to semantic tokens
          const tokens: number[] = [];
          errors.forEach((error: any) => {
            const line = error.line || 1;
            const column = error.column || 1;
            tokens.push(line - 1, column - 1, error.length || 1, 0, 0);
          });

          return { data: new Uint32Array(tokens) };
        } catch (error) {
          return { data: new Uint32Array([]) };
        }
      },
    });

    // Handle content changes
    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      onChange?.(value);
    });

    return () => {
      disconnectYjs(sessionId, fileId);
      editor.dispose();
    };
  }, [sessionId, fileId, language, initialValue, onChange, connectYjs, disconnectYjs, userId, userName, theme, keybindings]);

  // Apply error lens
  useErrorLens({ editor: editorRef.current, errors });

  const handleFormat = async () => {
    if (!editorRef.current) return;
    await editorRef.current.getAction("editor.action.formatDocument")?.run();
  };

  const handleAIChat = () => {
    setShowAIChat(!showAIChat);
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="border-b p-2 flex items-center gap-2 bg-background">
        <Button variant="ghost" size="sm" onClick={handleFormat}>
          Format
        </Button>
        <Button variant="ghost" size="sm" onClick={handleAIChat}>
          <MessageSquare className="w-4 h-4 mr-2" />
          AI Chat
        </Button>
        <Button variant="ghost" size="sm">
          <Sparkles className="w-4 h-4 mr-2" />
          AI Autocomplete
        </Button>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <div ref={containerRef} className="w-full h-full" style={{ minHeight: "400px" }} />

        {/* AI Chat Sidebar */}
        {showAIChat && (
          <div className="absolute right-0 top-0 bottom-0 w-80 border-l bg-background shadow-lg z-10">
            <AIChatPanel
              code={editorRef.current?.getValue() || ""}
              language={language}
              onClose={() => setShowAIChat(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function AIChatPanel({
  code,
  language,
  onClose,
}: {
  code: string;
  language: string;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          codeContext: code,
        }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response || "No response" }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Failed to get AI response" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4 flex items-center justify-between">
        <h3 className="font-semibold">AI Assistant</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === "user" ? "text-right" : "text-left"}>
            <div
              className={`inline-block p-2 rounded ${
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-muted-foreground">Thinking...</div>}
      </div>
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about code..."
            className="flex-1 px-3 py-2 border rounded"
          />
          <Button onClick={handleSend} disabled={loading}>
            Send
          </Button>
        </div>
        <div className="mt-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("Explain this code")}
            className="text-xs"
          >
            Explain
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("Fix this bug")}
            className="text-xs"
          >
            Fix Bug
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("Write tests")}
            className="text-xs"
          >
            Write Tests
          </Button>
        </div>
      </div>
    </div>
  );
}

