"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal as TerminalIcon, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TerminalProps {
  sessionId: string;
  onCommand?: (command: string) => Promise<string>;
}

export function Terminal({ sessionId, onCommand }: TerminalProps) {
  const [history, setHistory] = useState<Array<{ type: "input" | "output"; content: string }>>([
    { type: "output", content: "Welcome to CodePair Terminal" },
    { type: "output", content: "Type 'help' for available commands" },
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const builtInHelp = `Available commands:
  help          - Show this help message
  clear         - Clear terminal
  ls            - List files
  pwd           - Show current directory
  echo <text>   - Echo text
  run           - Run code from the editor`;

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    setHistory((prev) => [...prev, { type: "input", content: `$ ${command}` }]);
    setIsExecuting(true);

    try {
      let output = "";
      const cmd = command.toLowerCase().trim().split(/\s+/)[0];

      // Always handle built-in commands locally so they work even when onCommand is provided
      switch (cmd) {
        case "help":
          output = builtInHelp;
          break;
        case "clear":
          setHistory([]);
          setIsExecuting(false);
          setCurrentInput("");
          inputRef.current?.focus();
          return;
        case "ls":
          output = "main.py\napp.js\nREADME.md";
          break;
        case "pwd":
          output = "/workspace";
          break;
        case "echo":
          output = command.substring(5).trim();
          break;
        case "run":
          if (onCommand) {
            output = await onCommand(command);
          } else {
            output = "Run code from the Code tab, or use the Run Code button.";
          }
          break;
        default:
          if (onCommand) {
            output = await onCommand(command);
          } else {
            output = `Command not found: ${cmd}`;
          }
      }

      setHistory((prev) => [...prev, { type: "output", content: output }]);
    } catch (error) {
      setHistory((prev) => [
        ...prev,
        { type: "output", content: `Error: ${error instanceof Error ? error.message : String(error)}` },
      ]);
    } finally {
      setIsExecuting(false);
      setCurrentInput("");
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isExecuting) {
      executeCommand(currentInput);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full bg-black text-green-400 font-mono text-sm">
      <div className="border-b border-gray-700 p-2 flex items-center gap-2 flex-shrink-0">
        <TerminalIcon className="w-4 h-4" />
        <span className="text-xs">Terminal</span>
      </div>
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
      >
        {history.map((item, index) => (
          <div
            key={index}
            className={item.type === "input" ? "text-blue-400" : "text-green-400"}
          >
            {item.content}
          </div>
        ))}
        {isExecuting && (
          <div className="text-yellow-400">Executing...</div>
        )}
      </div>
      <div className="border-t border-gray-700 p-2 flex items-center gap-2 flex-shrink-0">
        <span className="text-green-400">$</span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isExecuting}
          className="flex-1 bg-transparent border-none outline-none text-green-400"
          placeholder="Enter command..."
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => executeCommand(currentInput)}
          disabled={isExecuting || !currentInput.trim()}
        >
          <Play className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

