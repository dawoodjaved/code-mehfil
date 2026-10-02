"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Code } from "lucide-react";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  type: "text" | "code" | "system" | "file";
  createdAt: Date;
}

interface ChatParticipant {
  id: string;
  name: string;
}

interface EnhancedChatProps {
  sessionId: string;
  userId: string;
  userName: string;
  participants?: ChatParticipant[];
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
}

function getCableUrl(token: string) {
  const explicit =
    process.env.NEXT_PUBLIC_CABLE_URL || process.env.NEXT_PUBLIC_WS_URL;
  const base =
    explicit ||
    getApiUrl().replace(/^http/i, "ws").replace(/\/+$/, "") + "/cable";
  if (!token) return base;
  return `${base}${base.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`;
}

function mapApiMessage(m: {
  id: string;
  content: string;
  message_type?: string;
  created_at?: string;
  user?: { id?: string; name?: string };
}): ChatMessage {
  return {
    id: String(m.id),
    userId: m.user?.id ?? "",
    userName: m.user?.name ?? "Unknown",
    content: m.content,
    type: ((m.message_type || "text").toLowerCase() as ChatMessage["type"]),
    createdAt: m.created_at ? new Date(m.created_at) : new Date(),
  };
}

function renderWithMentions(content: string) {
  const parts = content.split(/(@[\w.-]+)/g);
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="font-semibold text-sky-400">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function EnhancedChat({
  sessionId,
  userId,
  userName,
  participants = [],
}: EnhancedChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [codeMode, setCodeMode] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cableRef = useRef<WebSocket | null>(null);
  const identifierRef = useRef<string>("");
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingIdsRef = useRef<Set<string>>(new Set());

  const authHeaders = useMemo(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }, []);

  const mentionCandidates = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return participants
      .filter((p) => String(p.id) !== String(userId))
      .filter((p) => !q || p.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [mentionQuery, participants, userId]);

  const upsertMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      const withoutOptimistic = prev.filter(
        (m) =>
          !(
            m.id.startsWith("temp-") &&
            m.userId === msg.userId &&
            m.content === msg.content
          )
      );
      return [...withoutOptimistic, msg];
    });
    pendingIdsRef.current.delete(msg.id);
  }, []);

  const sendCable = useCallback((payload: Record<string, unknown>) => {
    const ws = cableRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !identifierRef.current) return;
    ws.send(
      JSON.stringify({
        command: "message",
        identifier: identifierRef.current,
        data: JSON.stringify(payload),
      })
    );
  }, []);

  const setTyping = useCallback(
    (isTyping: boolean) => {
      sendCable({ action: "typing", is_typing: isTyping });
    },
    [sendCable]
  );

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      try {
        const res = await fetch(
          `${getApiUrl()}/api/sessions/${sessionId}/chat_messages`,
          { headers: authHeaders }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setMessages((Array.isArray(data) ? data : []).map(mapApiMessage));
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [sessionId, authHeaders]);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const identifier = JSON.stringify({
      channel: "SessionsChannel",
      session_id: sessionId,
    });
    identifierRef.current = identifier;

    const ws = new WebSocket(getCableUrl(token));
    cableRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ command: "subscribe", identifier }));
    };

    ws.onmessage = (event) => {
      let data: any;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      if (data.type === "welcome" || data.type === "ping") return;
      if (data.type === "confirm_subscription") {
        setConnected(true);
        return;
      }
      if (data.type === "reject_subscription") {
        setConnected(false);
        return;
      }
      if (!data.message) return;

      const msg = data.message;

      if (msg.type === "chat_message" && msg.message) {
        upsertMessage(mapApiMessage(msg.message));
        return;
      }

      if (msg.type === "typing" && msg.user_id) {
        const uid = String(msg.user_id);
        if (uid === String(userId)) return;
        setTypingUsers((prev) => {
          const next = { ...prev };
          if (msg.is_typing) {
            next[uid] = msg.user_name || "Someone";
          } else {
            delete next[uid];
          }
          return next;
        });
      }
    };

    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    return () => {
      try {
        ws.send(JSON.stringify({ command: "unsubscribe", identifier }));
      } catch {
        // ignore
      }
      try {
        ws.close();
      } catch {
        // ignore
      }
      cableRef.current = null;
      setConnected(false);
    };
  }, [sessionId, userId, upsertMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const insertMention = (name: string) => {
    const el = inputRef.current;
    const value = input;
    const cursor = el?.selectionStart ?? value.length;
    const before = value.slice(0, cursor);
    const after = value.slice(cursor);
    const match = before.match(/@([\w.-]*)$/);
    if (!match) {
      setMentionQuery(null);
      return;
    }
    const start = before.length - match[0].length;
    const next = `${before.slice(0, start)}@${name.replace(/\s+/g, "")} ${after}`;
    setInput(next);
    setMentionQuery(null);
    setMentionIndex(0);
    requestAnimationFrame(() => {
      const pos = start + name.replace(/\s+/g, "").length + 2;
      el?.focus();
      el?.setSelectionRange(pos, pos);
    });
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;

    const messageType = codeMode ? "code" : "text";
    const tempId = `temp-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: tempId,
      userId,
      userName,
      content,
      type: messageType,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setMentionQuery(null);
    setTyping(false);
    setSending(true);

    try {
      const res = await fetch(
        `${getApiUrl()}/api/sessions/${sessionId}/chat_messages`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            content,
            message_type: messageType,
          }),
        }
      );

      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        const err = await res.json().catch(() => ({}));
        console.error("Failed to send chat message:", err);
        return;
      }

      const saved = await res.json();
      upsertMessage(mapApiMessage(saved));
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (value: string, cursor?: number) => {
    setInput(value);
    setTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setTyping(false), 1200);

    const pos = cursor ?? value.length;
    const before = value.slice(0, pos);
    const match = before.match(/@([\w.-]*)$/);
    if (match && !codeMode) {
      setMentionQuery(match[1]);
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
    }
  };

  const typingLabel = Object.values(typingUsers).join(", ");

  return (
    <Card className="flex h-full min-h-[280px] flex-col">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">Chat</CardTitle>
          <span
            className={`text-[10px] uppercase tracking-wide ${
              connected ? "text-emerald-500" : "text-muted-foreground"
            }`}
          >
            {connected ? "Live" : "Connecting…"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 p-0">
        <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-2">
          {messages.length === 0 ? (
            <div className="text-xs text-muted-foreground">
              No messages yet. Say hello to your pair. Use @name to mention.
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.userId === userId ? "items-end" : "items-start"
                }`}
              >
                <div className="mb-1 text-xs text-muted-foreground">
                  {msg.userName}
                </div>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    msg.userId === userId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.type === "code" ? (
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                      {msg.content}
                    </pre>
                  ) : (
                    <span className="whitespace-pre-wrap">
                      {renderWithMentions(msg.content)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {typingLabel ? (
          <div className="px-4 text-[11px] text-muted-foreground">
            {typingLabel} typing…
          </div>
        ) : null}

        <div className="relative space-y-2 border-t p-3">
          {mentionCandidates.length > 0 ? (
            <div className="absolute bottom-full left-3 right-3 z-20 mb-1 overflow-hidden rounded-md border bg-background shadow-md">
              {mentionCandidates.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  className={`flex w-full items-center px-3 py-2 text-left text-sm hover:bg-muted ${
                    i === mentionIndex ? "bg-muted" : ""
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    insertMention(p.name);
                  }}
                >
                  @{p.name.replace(/\s+/g, "")}
                </button>
              ))}
            </div>
          ) : null}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={codeMode ? "default" : "ghost"}
              size="sm"
              onClick={() => setCodeMode((v) => !v)}
              title="Toggle code message"
            >
              <Code className="h-4 w-4" />
            </Button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) =>
                handleInputChange(e.target.value, e.target.selectionStart ?? undefined)
              }
              onKeyDown={(e) => {
                if (mentionCandidates.length > 0) {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setMentionIndex((i) => (i + 1) % mentionCandidates.length);
                    return;
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setMentionIndex(
                      (i) =>
                        (i - 1 + mentionCandidates.length) % mentionCandidates.length
                    );
                    return;
                  }
                  if (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey)) {
                    e.preventDefault();
                    insertMention(mentionCandidates[mentionIndex].name);
                    return;
                  }
                  if (e.key === "Escape") {
                    setMentionQuery(null);
                    return;
                  }
                }
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder={codeMode ? "Paste code…" : "Type a message… (@ to mention)"}
              className="flex-1 rounded border bg-background px-3 py-2 text-sm"
            />
            <Button
              type="button"
              onClick={() => void handleSend()}
              size="sm"
              disabled={!input.trim() || sending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
