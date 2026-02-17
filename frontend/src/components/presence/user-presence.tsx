"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

interface PresenceUser {
  id: string;
  name: string;
  avatar?: string;
  isTyping: boolean;
  cursor?: { line: number; column: number };
  isFollowing: boolean;
}

interface UserPresenceProps {
  sessionId: string;
  currentUserId: string;
}

export function UserPresence({ sessionId, currentUserId }: UserPresenceProps) {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Note: /presence SSE endpoint is not implemented on backend - presence comes from ActionCable
    // This will 404; participants are shown via /api/sessions/:id/participants
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const presenceUrl = `${apiUrl}/api/sessions/${sessionId}/presence`;
    const eventSource = new EventSource(presenceUrl);

    eventSource.onerror = () => eventSource.close(); // Endpoint may not exist

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "user-joined") {
        setUsers((prev) => [...prev, data.user]);
      } else if (data.type === "user-left") {
        setUsers((prev) => prev.filter((u) => u.id !== data.userId));
      } else if (data.type === "typing") {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          if (data.isTyping) {
            next.add(data.userId);
          } else {
            next.delete(data.userId);
          }
          return next;
        });
      } else if (data.type === "cursor") {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === data.userId
              ? { ...u, cursor: data.cursor }
              : u
          )
        );
      }
    };

    return () => eventSource.close();
  }, [sessionId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <User className="w-4 h-4" />
          Participants ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 p-2 rounded hover:bg-muted"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                {user.name[0]}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{user.name}</div>
                {typingUsers.has(user.id) && (
                  <div className="text-xs text-muted-foreground">typing...</div>
                )}
                {user.cursor && (
                  <div className="text-xs text-muted-foreground">
                    Line {user.cursor.line}, Col {user.cursor.column}
                  </div>
                )}
              </div>
              {user.isFollowing && (
                <span className="text-xs text-primary">Following</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

