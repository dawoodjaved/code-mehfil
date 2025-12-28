"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import * as Monaco from "monaco-editor";

interface Theme {
  id: string;
  name: string;
  value: string;
}

const themes: Theme[] = [
  { id: "vs-dark", name: "Dark", value: "vs-dark" },
  { id: "vs", name: "Light", value: "vs" },
  { id: "one-dark-pro", name: "One Dark Pro", value: "one-dark-pro" },
  { id: "dracula", name: "Dracula", value: "dracula" },
  { id: "monokai", name: "Monokai", value: "monokai" },
  { id: "github", name: "GitHub", value: "github" },
];

interface ThemeSelectorProps {
  editor: Monaco.editor.IStandaloneCodeEditor | null;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

export function ThemeSelector({ editor, currentTheme, onThemeChange }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (theme: Theme) => {
    if (editor) {
      Monaco.editor.setTheme(theme.value);
      onThemeChange(theme.value);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
        <Palette className="w-4 h-4 mr-2" />
        Theme
      </Button>
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-background border rounded shadow-lg z-50 min-w-[200px]">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme)}
              className={`w-full text-left px-4 py-2 hover:bg-muted ${
                currentTheme === theme.value ? "bg-primary/10" : ""
              }`}
            >
              {theme.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

