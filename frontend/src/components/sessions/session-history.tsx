"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Tag, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Session {
  id: string;
  title: string;
  type: string;
  status: string;
  createdAt: Date;
  tags: string[];
}

interface SessionHistoryProps {
  workspaceId?: string;
  onSelectSession: (session: Session) => void;
}

export function SessionHistory({ workspaceId, onSelectSession }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    fetchSessions();
  }, [workspaceId, tagFilter]);

  const fetchSessions = async () => {
    try {
      const params = new URLSearchParams();
      if (workspaceId) params.append("workspaceId", workspaceId);
      if (searchQuery) params.append("search", searchQuery);
      if (tagFilter !== "all") params.append("tag", tagFilter);

      const response = await fetch(`/api/sessions?${params}`);
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  };

  const allTags = Array.from(new Set(sessions.flatMap((s) => s.tags || [])));

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => session.tags?.includes(tag));
    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Session History</h2>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              fetchSessions();
            }}
            className="pl-10"
          />
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTag(tag)}
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {filteredSessions.map((session) => (
          <Card
            key={session.id}
            className="cursor-pointer hover:border-primary transition"
            onClick={() => onSelectSession(session)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{session.title}</CardTitle>
                <Badge variant="outline">{session.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {new Date(session.createdAt).toLocaleDateString()}
              </div>
              {session.tags && session.tags.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {session.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

