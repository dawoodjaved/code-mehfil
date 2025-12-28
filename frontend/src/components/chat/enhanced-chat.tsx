"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Smile, Code, Bold, Italic } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  type: "TEXT" | "CODE" | "SYSTEM" | "REACTION";
  reactions?: Array<{ emoji: string; userId: string }>;
  createdAt: Date;
}

interface EnhancedChatProps {
  sessionId: string;
  userId: string;
  userName: string;
}

export function EnhancedChat({ sessionId, userId, userName }: EnhancedChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [codeBlock, setCodeBlock] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch messages
    fetch(`/api/chat/${sessionId}`)
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch(console.error);

    // Listen for new messages via WebSocket
    // In production, use Socket.io or similar
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      userId,
      userName,
      content: input,
      type: codeBlock ? "CODE" : "TEXT",
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, message]);

    try {
      await fetch(`/api/chat/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: codeBlock || input,
          type: codeBlock ? "CODE" : "TEXT",
        }),
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }

    setInput("");
    setCodeBlock("");
  };

  const addReaction = async (messageId: string, emoji: string) => {
    // Add reaction to message
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              reactions: [
                ...(msg.reactions || []),
                { emoji, userId },
              ],
            }
          : msg
      )
    );
  };

  const emojis = ["👍", "❤️", "😂", "🎉", "🔥", "💯"];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm">Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.userId === userId ? "items-end" : "items-start"
              }`}
            >
              <div className="text-xs text-muted-foreground mb-1">
                {msg.userName}
              </div>
              <div
                className={`max-w-[80%] rounded-lg p-2 ${
                  msg.userId === userId
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {msg.type === "CODE" ? (
                  <SyntaxHighlighter
                    language="javascript"
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, borderRadius: "4px" }}
                  >
                    {msg.content}
                  </SyntaxHighlighter>
                ) : (
                  <ReactMarkdown
                    components={{
                      code: ({ node, inline, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <SyntaxHighlighter
                            language={match[1]}
                            style={vscDarkPlus}
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
              {msg.reactions && msg.reactions.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {msg.reactions.map((r, idx) => (
                    <span key={idx}>{r.emoji}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-1 mt-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => addReaction(msg.id, emoji)}
                    className="text-xs hover:scale-125 transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-2 space-y-2">
          {codeBlock && (
            <textarea
              value={codeBlock}
              onChange={(e) => setCodeBlock(e.target.value)}
              placeholder="Enter code..."
              className="w-full p-2 border rounded font-mono text-sm"
              rows={4}
            />
          )}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMarkdown(!showMarkdown)}
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCodeBlock(codeBlock ? "" : "// Enter code here")}
            >
              <Code className="w-4 h-4" />
            </Button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border rounded text-sm"
            />
            <Button onClick={handleSend} size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

