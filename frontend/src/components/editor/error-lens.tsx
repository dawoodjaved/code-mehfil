"use client";

import { useEffect, useRef } from "react";
import * as Monaco from "monaco-editor";

export interface ErrorLensError {
  line: number;
  column: number;
  length: number;
  message: string;
  severity: "error" | "warning" | "info";
}

interface ErrorLensProps {
  editor: Monaco.editor.IStandaloneCodeEditor | null;
  errors: ErrorLensError[];
}

export function useErrorLens({ editor, errors }: ErrorLensProps) {
  const decorationsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!editor || !errors.length) {
      return;
    }

    const model = editor.getModel();
    if (!model) return;

    // Create markers for errors
    const markers: Monaco.editor.IMarkerData[] = errors.map((error) => ({
      startLineNumber: error.line,
      startColumn: error.column,
      endLineNumber: error.line,
      endColumn: error.column + error.length,
      message: error.message,
      severity:
        error.severity === "error"
          ? Monaco.MarkerSeverity.Error
          : error.severity === "warning"
          ? Monaco.MarkerSeverity.Warning
          : Monaco.MarkerSeverity.Info,
    }));

    Monaco.editor.setModelMarkers(model, "error-lens", markers);

    // Create inline decorations (error lens)
    const decorations: Monaco.editor.IModelDeltaDecoration[] = errors.map((error) => ({
      range: new Monaco.Range(
        error.line,
        error.column + error.length,
        error.line,
        error.column + error.length
      ),
      options: {
        after: {
          content: ` ${error.message}`,
          inlineClassName: `error-lens-${error.severity}`,
          inlineClassNameAffectsLetterSpacing: true,
        },
        hoverMessage: {
          value: error.message,
        },
      },
    }));

    const newDecorations = editor.deltaDecorations(decorationsRef.current, decorations);
    decorationsRef.current = newDecorations;

    return () => {
      if (model) {
        Monaco.editor.setModelMarkers(model, "error-lens", []);
      }
      editor.deltaDecorations(decorationsRef.current, []);
    };
  }, [editor, errors]);
}

