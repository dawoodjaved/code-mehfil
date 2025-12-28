"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MonacoEditor } from "@/components/editor/monaco-editor";
import { VideoRoom } from "@/components/video/video-room";
import { Whiteboard } from "@/components/whiteboard/whiteboard";
import { FileExplorer } from "@/components/file-tree/file-explorer";
import { Terminal } from "@/components/terminal/terminal";
import { InterviewMode } from "@/components/interview/interview-mode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Code, FileText, Terminal as TerminalIcon, Users, Clipboard } from "lucide-react";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  language?: string;
  children?: FileNode[];
}

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [activeTab, setActiveTab] = useState("code");
  const [code, setCode] = useState("// Welcome to CodePair!\n// Start coding...\n");
  const [language, setLanguage] = useState("javascript");
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [files, setFiles] = useState<FileNode[]>([
    {
      id: "1",
      name: "main.js",
      type: "file",
      path: "/main.js",
      language: "javascript",
    },
  ]);
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<"collaboration" | "interview">("collaboration");

  useEffect(() => {
    // Fetch LiveKit token from backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    fetch(`${apiUrl}/api/livekit/token`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
      },
      body: JSON.stringify({ roomName: sessionId }),
    })
      .then((res) => {
        if (!res.ok) {
          console.error("Failed to fetch LiveKit token");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.token) {
          setLivekitToken(data.token);
        }
      })
      .catch((err) => {
        console.error("Error fetching LiveKit token:", err);
      });
  }, [sessionId]);

  const handleFileSelect = (file: FileNode) => {
    setSelectedFile(file);
    // Load file content
    setCode(`// ${file.name}\n// File content here...`);
  };

  const handleFileCreate = (path: string, type: "file" | "folder") => {
    const newFile: FileNode = {
      id: Date.now().toString(),
      name: type === "file" ? "newfile.js" : "newfolder",
      type,
      path: `${path}${type === "file" ? "newfile.js" : "newfolder"}`,
      language: type === "file" ? "javascript" : undefined,
    };
    setFiles([...files, newFile]);
  };

  const handleFileDelete = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
    if (selectedFile?.id === id) {
      setSelectedFile(null);
    }
  };

  const handleTerminalCommand = async (command: string): Promise<string> => {
    // Execute terminal commands
    if (command.startsWith("run ")) {
      const fileName = command.substring(4).trim();
      // Execute code
      const response = await fetch(`/api/executions/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
        }),
      });
      const result = await response.json();
      return result.output || result.error || "Execution completed";
    }
    return `Command: ${command}`;
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Session: {sessionId}</h1>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="rust">Rust</option>
              <option value="go">Go</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Participants
            </Button>
            <Button variant="outline" size="sm">
              Share
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File Explorer */}
        <FileExplorer
          files={files}
          onFileSelect={handleFileSelect}
          onFileCreate={handleFileCreate}
          onFileDelete={handleFileDelete}
          selectedFileId={selectedFile?.id}
        />

        {/* Main Area */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="border-b rounded-none">
              <TabsTrigger value="code">
                <Code className="w-4 h-4 mr-2" />
                Code
              </TabsTrigger>
              <TabsTrigger value="interview">
                <Clipboard className="w-4 h-4 mr-2" />
                Interview
              </TabsTrigger>
              <TabsTrigger value="video">
                <Video className="w-4 h-4 mr-2" />
                Video
              </TabsTrigger>
              <TabsTrigger value="whiteboard">
                <FileText className="w-4 h-4 mr-2" />
                Whiteboard
              </TabsTrigger>
              <TabsTrigger value="terminal">
                <TerminalIcon className="w-4 h-4 mr-2" />
                Terminal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="code" className="flex-1 flex flex-col m-0">
              <div className="flex-1">
                <MonacoEditor
                  sessionId={sessionId}
                  fileId={selectedFile?.id || "main"}
                  language={language}
                  initialValue={code}
                  onChange={setCode}
                />
              </div>
            </TabsContent>

            <TabsContent value="interview" className="flex-1 m-0">
              <InterviewMode sessionId={sessionId} />
            </TabsContent>

            <TabsContent value="video" className="flex-1 m-0">
              {livekitToken ? (
                <VideoRoom
                  roomName={sessionId}
                  token={livekitToken}
                  onDisconnect={() => setLivekitToken(null)}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  Loading video room...
                </div>
              )}
            </TabsContent>

            <TabsContent value="whiteboard" className="flex-1 m-0">
              <Whiteboard sessionId={sessionId} />
            </TabsContent>

            <TabsContent value="terminal" className="flex-1 m-0">
              <Terminal sessionId={sessionId} onCommand={handleTerminalCommand} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar - Participants & Chat */}
        <aside className="w-80 border-l bg-muted/50 flex flex-col">
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary"></div>
                    <span className="text-sm">You</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Output</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-background p-2 rounded max-h-32 overflow-y-auto">
                  {code ? "Ready to execute..." : "No output yet"}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <div className="text-xs text-muted-foreground">
                    Chat messages will appear here
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}
