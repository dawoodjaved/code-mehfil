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
import { Video, Code, FileText, Terminal as TerminalIcon, Users, Clipboard, Share2, Copy, Mail, X } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  const [sessionData, setSessionData] = useState<{ title?: string; code?: string; participants?: any[] } | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchSessionData();
    fetchParticipants();
    
    // For now, set a mock token to enable video room
    // In production, fetch LiveKit token from backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    
    // Try to fetch LiveKit token, but if it fails, use mock token
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
          console.warn("LiveKit token endpoint not available, using mock token");
          // Use mock token if endpoint doesn't exist
          setLivekitToken("mock-token-" + sessionId);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.token) {
          setLivekitToken(data.token);
        } else if (!livekitToken) {
          // Fallback to mock token
          setLivekitToken("mock-token-" + sessionId);
        }
      })
      .catch((err) => {
        console.warn("Error fetching LiveKit token, using mock:", err);
        // Use mock token on error
        setLivekitToken("mock-token-" + sessionId);
      });
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${apiUrl}/api/sessions/${sessionId}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessionData(data);
      }
    } catch (error) {
      console.error("Failed to fetch session data:", error);
    }
  };

  const fetchParticipants = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${apiUrl}/api/sessions/${sessionId}/participants`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setParticipants(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch participants:", error);
    }
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  const handleCopyLink = async () => {
    const sessionUrl = `${window.location.origin}/session/${sessionId}`;
    try {
      await navigator.clipboard.writeText(sessionUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleInviteByEmail = async () => {
    if (!inviteEmail.trim()) return;
    
    setIsInviting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${apiUrl}/api/sessions/${sessionId}/participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ email: inviteEmail }),
      });
      
      if (response.ok) {
        setInviteEmail("");
        await fetchParticipants();
        alert("Invitation sent successfully!");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to invite participant");
      }
    } catch (error) {
      console.error("Failed to invite participant:", error);
      alert("Failed to invite participant");
    } finally {
      setIsInviting(false);
    }
  };

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

  const [executionOutput, setExecutionOutput] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);

  const executeCode = async () => {
    if (!code.trim()) {
      setExecutionOutput("No code to execute");
      return;
    }

    setIsExecuting(true);
    setExecutionOutput("Executing...");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${apiUrl}/api/sessions/${sessionId}/executions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          code,
          language,
          stdin: "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        const errorMessage = errorData.error || errorData.errors?.join(", ") || `Execution failed: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Check if execution is already completed (fallback execution)
      if (result.status === "completed" || result.status === "failed") {
        setExecutionOutput(
          result.output || result.error || "Execution completed"
        );
        setIsExecuting(false);
        return;
      }
      
      // Poll for execution result (for async Judge0 execution)
      let attempts = 0;
      const maxAttempts = 30;
      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const statusResponse = await fetch(`${apiUrl}/api/executions/${result.id}`, {
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          });
          
          if (statusResponse.ok) {
            const execution = await statusResponse.json();
            
            if (execution.status === "completed" || execution.status === "failed") {
              clearInterval(pollInterval);
              setExecutionOutput(
                execution.output || execution.error || "Execution completed"
              );
              setIsExecuting(false);
            } else if (attempts >= maxAttempts) {
              clearInterval(pollInterval);
              setExecutionOutput("Execution timeout - check execution status");
              setIsExecuting(false);
            }
          } else {
            clearInterval(pollInterval);
            const errorData = await statusResponse.json().catch(() => ({ error: statusResponse.statusText }));
            setExecutionOutput(`Error checking status: ${errorData.error || statusResponse.statusText}`);
            setIsExecuting(false);
          }
        } catch (error: any) {
          clearInterval(pollInterval);
          setExecutionOutput(`Error checking status: ${error.message || "Unknown error"}`);
          setIsExecuting(false);
        }
      }, 1000);
    } catch (error: any) {
      setExecutionOutput(`Error: ${error.message}`);
      setIsExecuting(false);
    }
  };

  const handleTerminalCommand = async (command: string): Promise<string> => {
    // Execute terminal commands
    if (command.startsWith("run") || command === "run") {
      await executeCode();
      return executionOutput || "Executing code...";
    }
    return `Command: ${command}`;
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Share Modal */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowShareDialog(false)}>
          <div className="bg-background border rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Share Session</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowShareDialog(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Invite others to join this coding session
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Session Link</label>
                <div className="flex gap-2">
                  <Input
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/session/${sessionId}`}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                  >
                    {copySuccess ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Or invite by email</label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleInviteByEmail}
                    disabled={isInviting || !inviteEmail.trim()}
                    size="sm"
                  >
                    {isInviting ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Inviting...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Invite
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {sessionData?.code && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Session Code</label>
                  <div className="flex gap-2">
                    <Input
                      value={sessionData.code}
                      readOnly
                      className="flex-1 font-mono text-center text-lg"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(sessionData.code);
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2000);
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Share this code for others to join via the join page
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">{sessionData?.title || `Session ${sessionId.slice(0, 8)}...`}</h1>
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
              Participants ({participants.length})
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
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
        <div className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="border-b rounded-none flex-shrink-0">
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

            <TabsContent value="code" className="flex-1 flex flex-col m-0 min-h-0">
              <div className="flex items-center justify-between p-2 border-b bg-muted/50 flex-shrink-0">
                <div className="text-sm text-muted-foreground">
                  {language.toUpperCase()} • {code.split('\n').length} lines
                </div>
                <Button
                  onClick={executeCode}
                  disabled={isExecuting || !code.trim()}
                  size="sm"
                  className="gap-2"
                >
                  {isExecuting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Running...
                    </>
                  ) : (
                    <>
                      <TerminalIcon className="w-4 h-4" />
                      Run Code
                    </>
                  )}
                </Button>
              </div>
              <div className="flex-1 min-h-0">
                <MonacoEditor
                  sessionId={sessionId}
                  fileId={selectedFile?.id || "main"}
                  language={language}
                  initialValue={code}
                  onChange={setCode}
                />
              </div>
              {executionOutput && (
                <div className="border-t bg-background p-4 max-h-48 overflow-y-auto flex-shrink-0">
                  <div className="text-sm font-semibold mb-2">Output:</div>
                  <pre className="text-xs font-mono whitespace-pre-wrap">{executionOutput}</pre>
                </div>
              )}
            </TabsContent>

            <TabsContent value="interview" className="flex-1 flex flex-col m-0 min-h-0">
              <InterviewMode sessionId={sessionId} />
            </TabsContent>

            <TabsContent value="video" className="flex-1 flex flex-col m-0 min-h-0">
              {livekitToken ? (
                <VideoRoom
                  roomName={sessionId}
                  token={livekitToken}
                  onDisconnect={() => setLivekitToken(null)}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading video room...</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="whiteboard" className="flex-1 flex flex-col m-0 min-h-0 p-0 overflow-hidden">
              <Whiteboard sessionId={sessionId} />
            </TabsContent>

            <TabsContent value="terminal" className="flex-1 flex flex-col m-0 min-h-0">
              <Terminal sessionId={sessionId} onCommand={handleTerminalCommand} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar - Participants & Chat */}
        <aside className="w-80 border-l bg-muted/50 flex flex-col">
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Participants ({participants.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {participants.length === 0 ? (
                    <div className="text-xs text-muted-foreground">No participants yet</div>
                  ) : (
                    participants.map((participant) => (
                      <div key={participant.id} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold">
                          {participant.user?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {participant.user?.name || "Unknown User"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {participant.user?.email}
                          </div>
                        </div>
                        {participant.role && (
                          <span className="text-xs px-2 py-1 bg-muted rounded">
                            {participant.role}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Run</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={executeCode}
                  disabled={isExecuting || !code.trim()}
                  size="sm"
                  className="w-full gap-2"
                >
                  {isExecuting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Running...
                    </>
                  ) : (
                    <>
                      <TerminalIcon className="w-4 h-4" />
                      Run Code
                    </>
                  )}
                </Button>
                {executionOutput && (
                  <pre className="text-xs bg-background p-2 rounded max-h-32 overflow-y-auto mt-2 whitespace-pre-wrap">
                    {executionOutput}
                  </pre>
                )}
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
