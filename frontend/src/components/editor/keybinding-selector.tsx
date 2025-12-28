"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";

interface Keybinding {
  id: string;
  name: string;
  value: "default" | "vim" | "emacs";
}

const keybindings: Keybinding[] = [
  { id: "default", name: "Default", value: "default" },
  { id: "vim", name: "Vim", value: "vim" },
  { id: "emacs", name: "Emacs", value: "emacs" },
];

interface KeybindingSelectorProps {
  currentKeybinding: string;
  onKeybindingChange: (keybinding: string) => void;
}

export function KeybindingSelector({
  currentKeybinding,
  onKeybindingChange,
}: KeybindingSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
        <Keyboard className="w-4 h-4 mr-2" />
        {keybindings.find((k) => k.value === currentKeybinding)?.name || "Default"}
      </Button>
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-background border rounded shadow-lg z-50 min-w-[150px]">
          {keybindings.map((kb) => (
            <button
              key={kb.id}
              onClick={() => {
                onKeybindingChange(kb.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 hover:bg-muted ${
                currentKeybinding === kb.value ? "bg-primary/10" : ""
              }`}
            >
              {kb.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

