"use client";

import { useState } from "react";
import { File, Folder, FolderOpen, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  language?: string;
  children?: FileNode[];
}

interface FileExplorerProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  onFileCreate: (path: string, type: "file" | "folder") => void;
  onFileDelete: (id: string) => void;
  selectedFileId?: string;
}

export function FileExplorer({
  files,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  selectedFileId,
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFolders(newExpanded);
  };

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = selectedFileId === node.id;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-muted ${
            isSelected ? "bg-primary/10" : ""
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (node.type === "folder") {
              toggleFolder(node.id);
            } else {
              onFileSelect(node);
            }
          }}
        >
          {node.type === "folder" ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-blue-500" />
            ) : (
              <Folder className="w-4 h-4 text-blue-500" />
            )
          ) : (
            <File className="w-4 h-4 text-gray-500" />
          )}
          <span className="text-sm flex-1">{node.name}</span>
          {node.type === "file" && node.language && (
            <span className="text-xs text-muted-foreground">{node.language}</span>
          )}
        </div>
        {node.type === "folder" && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col border-r bg-muted/20">
      <div className="border-b p-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Files</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFileCreate("/", "file")}
            title="New File"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFileCreate("/", "folder")}
            title="New Folder"
          >
            <Folder className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        {files.map((file) => renderNode(file))}
      </div>
    </div>
  );
}

