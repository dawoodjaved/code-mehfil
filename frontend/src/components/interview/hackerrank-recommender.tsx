"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Search } from "lucide-react";
import { BankQuestion } from "@/components/questions/question-bank";

interface HackerRankRecommenderProps {
  onSelectQuestion: (question: BankQuestion) => void;
}

function mapToBankQuestion(q: any): BankQuestion {
  return {
    id: String(q.id),
    title: q.title || "Untitled",
    description: q.description || "",
    difficulty: String(q.difficulty || "medium").toLowerCase(),
    topics: Array.isArray(q.topics) ? q.topics : [],
    category: q.category,
    testCases: Array.isArray(q.testCases) ? q.testCases.length : 0,
    templates: q.templates,
    starterCode: q.starterCode || q.starter_code,
    source: q.source,
    externalUrl: q.externalUrl || q.external_url,
    sourceMetadata: q.sourceMetadata || q.source_metadata,
  };
}

export function HackerRankRecommender({ onSelectQuestion }: HackerRankRecommenderProps) {
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [trackFilter, setTrackFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetchQuestions();
  }, [difficultyFilter]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ source: "hackerrank" });
      if (difficultyFilter !== "all") params.set("difficulty", difficultyFilter);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${apiUrl}/api/questions?${params}`, { headers });
      if (!response.ok) throw new Error("Failed to load HackerRank catalog");
      const data = await response.json();
      setQuestions((Array.isArray(data) ? data : []).map(mapToBankQuestion));
    } catch (err) {
      console.error(err);
      setError("Could not load HackerRank challenges. Import clean JSON first.");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const tracks = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      const track = (q.sourceMetadata as any)?.track || q.topics?.[0];
      if (track) set.add(String(track));
    });
    return Array.from(set).sort();
  }, [questions]);

  const filtered = questions.filter((q) => {
    const hay = `${q.title} ${q.description}`.toLowerCase();
    const matchesSearch = !searchQuery || hay.includes(searchQuery.toLowerCase());
    const track = String((q.sourceMetadata as any)?.track || q.topics?.[0] || "");
    const matchesTrack = trackFilter === "all" || track === trackFilter;
    return matchesSearch && matchesTrack;
  });

  return (
    <div className="space-y-4 h-full overflow-y-auto p-1">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-lg font-bold">HackerRank Catalog</h2>
          <p className="text-xs text-muted-foreground">
            Curated metadata + link-out to official statements ({questions.length} loaded)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void fetchQuestions()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 relative min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void fetchQuestions();
            }}
            className="pl-10"
          />
        </div>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-3 py-2 border rounded bg-background"
        >
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select
          value={trackFilter}
          onChange={(e) => setTrackFilter(e.target.value)}
          className="px-3 py-2 border rounded bg-background"
        >
          <option value="all">All Tracks</option>
          {tracks.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((question) => (
          <Card key={question.id} className="hover:border-primary transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{question.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">{question.difficulty}</Badge>
                <Badge variant="outline">hackerrank</Badge>
                {question.topics.slice(0, 2).map((topic) => (
                  <Badge key={topic} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3">{question.description}</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onSelectQuestion(question)}>
                  Use in interview
                </Button>
                {question.externalUrl ? (
                  <Button size="sm" variant="outline" asChild>
                    <a href={question.externalUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Open HR
                    </a>
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground col-span-full">
            No HackerRank challenges yet. Run the clean script +{" "}
            <code className="text-xs">rake questions:import_hackerrank</code>.
          </p>
        ) : null}
      </div>
    </div>
  );
}
