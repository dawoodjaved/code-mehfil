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

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    setHistory((prev) => [...prev, { type: "input", content: `$ ${command}` }]);
    setIsExecuting(true);

    try {
      let output = "";

      if (onCommand) {
        output = await onCommand(command);
      } else {
        // Default command handling
        switch (command.toLowerCase().split(" ")[0]) {
          case "help":
            output = `Available commands:
  help          - Show this help message
  clear         - Clear terminal
  ls            - List files
  pwd           - Show current directory
  echo <text>   - Echo text
  run <file>    - Execute a file`;
            break;
          case "clear":
            setHistory([]);
            setIsExecuting(false);
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
            output = "Executing file...";
            break;
          default:
            output = `Command not found: ${command.split(" ")[0]}`;
        }
      }

      setHistory((prev) => [...prev, { type: "output", content: output }]);
    } catch (error) {
      setHistory((prev) => [
        ...prev,
        { type: "output", content: `Error: ${error.message}` },
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
    <div className="h-full flex flex-col bg-black text-green-400 font-mono text-sm">
      <div className="border-b border-gray-700 p-2 flex items-center gap-2">
        <TerminalIcon className="w-4 h-4" />
        <span className="text-xs">Terminal</span>
      </div>
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
        style={{ maxHeight: "400px" }}
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
      <div className="border-t border-gray-700 p-2 flex items-center gap-2">
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

