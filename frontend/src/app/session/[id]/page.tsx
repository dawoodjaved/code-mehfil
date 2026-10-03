"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FileExplorer } from "@/components/file-tree/file-explorer";
import { RequireAuth } from "@/components/auth/require-auth";
import { apiBase, authHeaders, clearAuthToken, signInPath } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Code, FileText, Terminal as TerminalIcon, Users, Clipboard, Share2, Copy, Mail, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SUPPORTED_LANGUAGES } from "@/lib/languages";
import Link from "next/link";

const tabFallback = (
  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
    Loading…
  </div>
);

const MonacoEditor = dynamic(
  () => import("@/components/editor/monaco-editor").then((mod) => ({ default: mod.MonacoEditor })),
  { ssr: false, loading: () => tabFallback }
);
const VideoRoom = dynamic(
  () => import("@/components/video/video-room").then((mod) => ({ default: mod.VideoRoom })),
  { ssr: false, loading: () => tabFallback }
);
const Terminal = dynamic(
  () => import("@/components/terminal/terminal").then((mod) => ({ default: mod.Terminal })),
  { ssr: false, loading: () => tabFallback }
);
const InterviewMode = dynamic(
  () => import("@/components/interview/interview-mode").then((mod) => ({ default: mod.InterviewMode })),
  { ssr: false, loading: () => tabFallback }
);
const EnhancedChat = dynamic(
  () => import("@/components/chat/enhanced-chat").then((mod) => ({ default: mod.EnhancedChat })),
  { ssr: false }
);
const Whiteboard = dynamic(
  () => import("@/components/whiteboard/whiteboard").then((mod) => ({ default: mod.Whiteboard })),
  { ssr: false, loading: () => tabFallback }
);

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

  return (
    <RequireAuth next={`/session/${sessionId}`}>
      <SessionWorkspace sessionId={sessionId} />
    </RequireAuth>
  );
}

function SessionWorkspace({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [access, setAccess] = useState<"loading" | "granted" | "denied">("loading");
  const [accessMessage, setAccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("code");
  const [code, setCode] = useState("// Welcome to CodeMehfil!\n// Start coding...\n");
  const [language, setLanguage] = useState("javascript");
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const fileSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<"collaboration" | "interview">("collaboration");
  const [sessionData, setSessionData] = useState<{
    title?: string;
    code?: string;
    language?: string;
    default_language?: string;
    session_type?: string;
    participants?: any[];
  } | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const response = await fetch(`${apiBase()}/api/sessions/${sessionId}`, {
          headers: authHeaders(),
        });

        if (cancelled) return;

        if (response.status === 401) {
          clearAuthToken();
          router.replace(signInPath(`/session/${sessionId}`));
          return;
        }

        if (response.status === 403 || response.status === 404) {
          const data = await response.json().catch(() => ({}));
          setAccessMessage(
            data.error ||
              "You don’t have access to this session. Ask the host for an invite or join code."
          );
          setAccess("denied");
          return;
        }

        if (!response.ok) {
          setAccessMessage("Could not load this session.");
          setAccess("denied");
          return;
        }

        const data = await response.json();
        setSessionData(data);
        if (data.default_language) setLanguage(data.default_language);
        else if (data.language) setLanguage(data.language);
        if (data.session_type === "interview") setSessionType("interview");
        setAccess("granted");

        // Prefer payload from show — avoids 2–3 extra round trips on open
        if (Array.isArray(data.participants)) {
          setParticipants(data.participants);
        }

        const hydrateFiles = Array.isArray(data.files)
          ? applyFilesPayload(data.files)
          : fetchSessionFiles();

        await Promise.all([
          Array.isArray(data.participants) ? Promise.resolve() : fetchParticipants(),
          fetchCurrentUser(),
          hydrateFiles,
        ]);
      } catch {
        if (!cancelled) {
          setAccessMessage("Failed to reach the server.");
          setAccess("denied");
        }
      }
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Fetch LiveKit only when the video tab is opened
  useEffect(() => {
    if (access !== "granted" || activeTab !== "video" || livekitToken) return;
    void fetchLivekitToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access, activeTab, livekitToken, sessionId]);

  const fetchLivekitToken = async () => {
    try {
      const res = await fetch(`${apiBase()}/api/livekit/token`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ roomName: sessionId }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.token) {
        setLivekitToken(data.token);
        setLivekitUrl(data.livekitUrl || process.env.NEXT_PUBLIC_LIVEKIT_URL || null);
      }
    } catch (err) {
      console.warn("LiveKit token error:", err);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${apiBase()}/api/auth/me`, {
        headers: authHeaders(),
      });
      if (!response.ok) return;

      const data = await response.json();
      const user = data.user || data;
      if (user?.id) {
        setCurrentUser({
          id: String(user.id),
          name: user.name || user.email || "You",
        });
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  const mapApiFile = (f: any): FileNode => ({
    id: String(f.id),
    name: f.filename || f.name || "untitled",
    type: "file",
    path: f.path || `/${f.filename || "untitled"}`,
    language: f.language || "javascript",
  });

  const createDefaultFile = async () => {
    const createRes = await fetch(`${apiBase()}/api/sessions/${sessionId}/files`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        filename: "main.js",
        path: "/main.js",
        language: "javascript",
        content: "// Welcome to CodeMehfil!\n// Start coding...\n",
      }),
    });
    if (!createRes.ok) return;
    const created = await createRes.json();
    const node = mapApiFile(created);
    setFiles([node]);
    setSelectedFile(node);
    setLanguage(created.language || "javascript");
    setCode(created.content || "");
  };

  const applyFilesPayload = async (data: any[]) => {
    const mapped: FileNode[] = (Array.isArray(data) ? data : []).map(mapApiFile);
    setFiles(mapped);

    if (mapped.length === 0) {
      await createDefaultFile();
      return;
    }

    const first = mapped[0];
    const full = data.find((f: any) => String(f.id) === first.id);
    setSelectedFile(first);
    setLanguage(first.language || "javascript");
    setCode(full?.content ?? `// ${first.name}\n`);
  };

  const fetchSessionFiles = async () => {
    try {
      const response = await fetch(`${apiBase()}/api/sessions/${sessionId}/files`, {
        headers: authHeaders(),
      });
      if (!response.ok) return;
      const data = await response.json();
      await applyFilesPayload(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch session files:", error);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await fetch(`${apiBase()}/api/sessions/${sessionId}/participants`, {
        headers: authHeaders(),
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

  const joinUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const code = sessionData?.code;
    return code ? `${origin}/join?code=${encodeURIComponent(code)}` : `${origin}/join`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl());
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
      const response = await fetch(`${apiBase()}/api/sessions/${sessionId}/participants`, {
        method: "POST",
        headers: authHeaders(),
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

  const persistFileContent = (fileId: string, content: string) => {
    if (fileSaveTimer.current) clearTimeout(fileSaveTimer.current);
    fileSaveTimer.current = setTimeout(async () => {
      try {
        await fetch(`${apiBase()}/api/sessions/${sessionId}/files/${fileId}`, {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ content }),
        });
      } catch (error) {
        console.error("Failed to save file:", error);
      }
    }, 600);
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    if (selectedFile?.id) {
      persistFileContent(selectedFile.id, value);
    }
  };

  const handleFileSelect = async (file: FileNode) => {
    setSelectedFile(file);
    setLanguage(file.language || "javascript");
    try {
      const response = await fetch(
        `${apiBase()}/api/sessions/${sessionId}/files/${file.id}`,
        { headers: authHeaders() }
      );
      if (response.ok) {
        const data = await response.json();
        setCode(data.content ?? `// ${file.name}\n`);
        if (data.language) setLanguage(data.language);
      } else {
        setCode(`// ${file.name}\n`);
      }
    } catch {
      setCode(`// ${file.name}\n`);
    }
  };

  const handleFileCreate = async (path: string, type: "file" | "folder") => {
    if (type === "folder") {
      // Folders are virtual in the explorer; create a placeholder path file
      return;
    }
    const ext =
      SUPPORTED_LANGUAGES.find((l) => l.value === language)?.value === "python"
        ? "py"
        : language === "typescript"
          ? "ts"
          : language === "java"
            ? "java"
            : language === "cpp"
              ? "cpp"
              : language === "c"
                ? "c"
                : language === "go"
                  ? "go"
                  : language === "rust"
                    ? "rs"
                    : language === "php"
                      ? "php"
                      : language === "ruby"
                        ? "rb"
                        : language === "swift"
                          ? "swift"
                          : "js";
    const filename = `untitled.${ext}`;
    const filePath = path.endsWith("/") ? `${path}${filename}` : `${path}/${filename}`;

    try {
      const response = await fetch(`${apiBase()}/api/sessions/${sessionId}/files`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          filename,
          path: filePath.startsWith("/") ? filePath : `/${filePath}`,
          language,
          content: `// ${filename}\n`,
        }),
      });
      if (response.ok) {
        const created = await response.json();
        const node = mapApiFile(created);
        setFiles((prev) => [...prev, node]);
        setSelectedFile(node);
        setCode(created.content || "");
      }
    } catch (error) {
      console.error("Failed to create file:", error);
    }
  };

  const handleFileDelete = async (id: string) => {
    try {
      const response = await fetch(`${apiBase()}/api/sessions/${sessionId}/files/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (response.ok || response.status === 204) {
        setFiles((prev) => prev.filter((f) => f.id !== id));
        if (selectedFile?.id === id) {
          setSelectedFile(null);
          setCode("// Select or create a file\n");
        }
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  const [executionOutput, setExecutionOutput] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);

  const executeCode = async (): Promise<string> => {
    if (!code.trim()) {
      const msg = "No code to execute";
      setExecutionOutput(msg);
      return msg;
    }

    setIsExecuting(true);
    setExecutionOutput("Executing...");

    try {
      const response = await fetch(`${apiBase()}/api/sessions/${sessionId}/executions`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          code,
          language: (language || "javascript").toLowerCase(),
          stdin: "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        const errorMessage =
          errorData.error || errorData.errors?.join(", ") || `Execution failed: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.status === "completed" || result.status === "failed") {
        const out = result.output || result.error || "Execution completed";
        setExecutionOutput(out);
        setIsExecuting(false);
        return out;
      }

      return await new Promise<string>((resolve) => {
        let attempts = 0;
        const maxAttempts = 30;
        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const statusResponse = await fetch(`${apiBase()}/api/executions/${result.id}`, {
              headers: authHeaders(),
            });

            if (statusResponse.ok) {
              const execution = await statusResponse.json();

              if (execution.status === "completed" || execution.status === "failed") {
                clearInterval(pollInterval);
                const out = execution.output || execution.error || "Execution completed";
                setExecutionOutput(out);
                setIsExecuting(false);
                resolve(out);
              } else if (attempts >= maxAttempts) {
                clearInterval(pollInterval);
                const out = "Execution timeout - check execution status";
                setExecutionOutput(out);
                setIsExecuting(false);
                resolve(out);
              }
            } else {
              clearInterval(pollInterval);
              const errorData = await statusResponse.json().catch(() => ({ error: statusResponse.statusText }));
              const out = `Error checking status: ${errorData.error || statusResponse.statusText}`;
              setExecutionOutput(out);
              setIsExecuting(false);
              resolve(out);
            }
          } catch (error: any) {
            clearInterval(pollInterval);
            const out = `Error checking status: ${error.message || "Unknown error"}`;
            setExecutionOutput(out);
            setIsExecuting(false);
            resolve(out);
          }
        }, 1000);
      });
    } catch (error: any) {
      const out = `Error: ${error.message}`;
      setExecutionOutput(out);
      setIsExecuting(false);
      return out;
    }
  };

  const handleTerminalCommand = async (command: string): Promise<string> => {
    if (command.startsWith("run") || command === "run") {
      return await executeCode();
    }
    return `Command not found: ${command.split(/\s+/)[0]}. Type 'help' for available commands.`;
  };

  if (access === "loading") {
    return (
      <div className="h-screen flex items-center justify-center text-sm text-muted-foreground">
        Verifying session access…
      </div>
    );
  }

  if (access === "denied") {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="text-sm text-muted-foreground max-w-md">{accessMessage}</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button asChild>
            <Link href="/join">Join with code</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/sessions">My sessions</Link>
          </Button>
        </div>
      </div>
    );
  }

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
              Guests must sign in, then use this join link or code. Direct session URLs only work for people already in the session.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Join Link</label>
                <div className="flex gap-2">
                  <Input
                    value={joinUrl()}
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
                        <Copy className="w-4 h-4 mr-2" />
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
                <p className="text-xs text-muted-foreground mt-1">
                  Opens the join page with this session code filled in
                </p>
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
                        navigator.clipboard.writeText(sessionData.code!);
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2000);
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Or share this code — others can enter it at{" "}
                    <Link href="/join" className="underline">
                      /join
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/sessions"
              className="shrink-0 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="" width={22} height={22} className="rounded-md" />
              CodeMehfil
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <h1 className="text-lg font-semibold truncate">
              {sessionData?.title || `Session ${sessionId.slice(0, 8)}…`}
            </h1>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1 border rounded text-sm shrink-0"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
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
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Sidebar - File Explorer */}
        <FileExplorer
          files={files}
          onFileSelect={handleFileSelect}
          onFileCreate={handleFileCreate}
          onFileDelete={handleFileDelete}
          selectedFileId={selectedFile?.id}
        />

        {/* Main Area - fills remaining height */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <TabsList className="border-b rounded-none flex-shrink-0 shrink-0">
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

            <TabsContent value="code" className="flex-1 flex flex-col m-0 min-h-0 overflow-hidden data-[state=inactive]:hidden data-[state=active]:flex">
              <div className="flex items-center justify-between p-2 border-b bg-muted/50 flex-shrink-0 shrink-0">
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
              <div className="flex-1 min-h-0 overflow-hidden bg-background">
                {selectedFile?.id ? (
                  <MonacoEditor
                    key={selectedFile.id}
                    sessionId={sessionId}
                    fileId={selectedFile.id}
                    language={language}
                    initialValue={code}
                    onChange={handleCodeChange}
                    userId={currentUser?.id}
                    userName={currentUser?.name}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    Loading editor…
                  </div>
                )}
              </div>
              {executionOutput && (
                <div className="border-t bg-background p-4 max-h-48 overflow-y-auto flex-shrink-0">
                  <div className="text-sm font-semibold mb-2">Output:</div>
                  <pre className="text-xs font-mono whitespace-pre-wrap">{executionOutput}</pre>
                </div>
              )}
            </TabsContent>

            <TabsContent value="interview" className="flex-1 flex flex-col m-0 min-h-0 overflow-hidden data-[state=inactive]:hidden data-[state=active]:flex">
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                {activeTab === "interview" ? (
                  <InterviewMode
                    sessionId={sessionId}
                    fileId={selectedFile?.id}
                    code={code}
                    language={language}
                    onCodeChange={handleCodeChange}
                    onLanguageChange={setLanguage}
                  />
                ) : null}
              </div>
            </TabsContent>

            <TabsContent value="video" className="flex-1 flex flex-col m-0 min-h-0 overflow-hidden data-[state=inactive]:hidden data-[state=active]:flex">
              <div className="flex-1 min-h-0 flex flex-col bg-background">
                {activeTab !== "video" ? null : livekitToken ? (
                  <VideoRoom
                    roomName={sessionId}
                    token={livekitToken}
                    serverUrl={livekitUrl}
                    onDisconnect={() => {
                      setLivekitToken(null);
                      setLivekitUrl(null);
                    }}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p>Loading video room...</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent
              value="whiteboard"
              className="flex-1 flex flex-col m-0 min-h-0 p-0 overflow-hidden data-[state=inactive]:hidden data-[state=active]:flex"
            >
              {activeTab === "whiteboard" ? (
                <div className="relative isolate z-0 flex-1 min-h-0 overflow-hidden">
                  <Whiteboard sessionId={sessionId} />
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="terminal" className="flex-1 flex flex-col m-0 min-h-0 overflow-hidden data-[state=inactive]:hidden data-[state=active]:flex">
              {activeTab === "terminal" ? (
                <Terminal
                  sessionId={sessionId}
                  onCommand={handleTerminalCommand}
                  fileNames={files.map((f) => f.name)}
                />
              ) : null}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar - Participants & Chat */}
        <aside className="w-80 border-l bg-muted/50 flex flex-col min-h-0">
          <div className="p-4 space-y-4 flex flex-col flex-1 min-h-0 overflow-hidden">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Participants ({participants.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
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

            {activeTab === "code" && (
              <Card className="shrink-0">
                <CardHeader>
                  <CardTitle className="text-sm">Quick Run</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => executeCode()}
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
                </CardContent>
              </Card>
            )}

            <div className="min-h-0 flex-1 flex flex-col">
              {currentUser ? (
                <EnhancedChat
                  sessionId={sessionId}
                  userId={currentUser.id}
                  userName={currentUser.name}
                  participants={participants.map((p) => ({
                    id: String(p.user?.id || p.id),
                    name: p.user?.name || p.user?.email || "User",
                  }))}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Chat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      Sign in to use chat
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
