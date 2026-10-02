"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export interface BankQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  topics: string[];
  category?: string;
  testCases?: number | any[];
  templates?: Array<{ language: string; code: string }>;
  starterCode?: Record<string, string>;
  source?: string;
  externalUrl?: string;
  sourceMetadata?: Record<string, any>;
}

interface QuestionBankProps {
  onSelectQuestion: (question: BankQuestion) => void;
  source?: string;
  title?: string;
}

function normalizeQuestion(q: any): BankQuestion {
  const difficulty = String(q.difficulty || "medium").toLowerCase();
  const topics = Array.isArray(q.topics)
    ? q.topics
    : q.category
      ? [q.category]
      : [];
  const testCases = Array.isArray(q.testCases)
    ? q.testCases.length
    : Array.isArray(q.test_cases)
      ? q.test_cases.length
      : typeof q.testCases === "number"
        ? q.testCases
        : 0;

  return {
    id: String(q.id),
    title: q.title || "Untitled",
    description: q.description || "",
    difficulty,
    topics,
    category: q.category,
    testCases,
    templates: q.templates,
    starterCode: q.starterCode || q.starter_code,
    source: q.source,
    externalUrl: q.externalUrl || q.external_url,
    sourceMetadata: q.sourceMetadata || q.source_metadata,
  };
}

export function QuestionBank({
  onSelectQuestion,
  source = "internal",
  title = "Question Bank",
}: QuestionBankProps) {
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, [difficultyFilter, source]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (difficultyFilter !== "all") params.append("difficulty", difficultyFilter);
      if (source && source !== "all") params.append("source", source);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${apiUrl}/api/questions?${params}`, { headers });
      if (!response.ok) throw new Error("Failed to load questions");
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      setQuestions(list.map(normalizeQuestion));
    } catch (err) {
      console.error("Failed to fetch questions:", err);
      setError("Could not load question bank");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty =
      difficultyFilter === "all" ||
      q.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="space-y-4 h-full overflow-y-auto p-1">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">{title}</h2>
        <Button variant="outline" size="sm" onClick={fetchQuestions} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 relative min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredQuestions.map((question) => (
          <Card
            key={question.id}
            className="cursor-pointer hover:border-primary transition"
            onClick={() => onSelectQuestion(question)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{question.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-2 flex-wrap">
                <Badge variant="secondary">{question.difficulty}</Badge>
                {question.source ? (
                  <Badge variant="outline" className="text-xs">
                    {question.source}
                  </Badge>
                ) : null}
                {question.topics.slice(0, 2).map((topic) => (
                  <Badge key={topic} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {question.description}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {typeof question.testCases === "number"
                  ? question.testCases
                  : 0}{" "}
                test cases
              </p>
            </CardContent>
          </Card>
        ))}
        {!loading && filteredQuestions.length === 0 ? (
          <p className="text-sm text-muted-foreground col-span-full">
            No questions found. Seed the database or adjust filters.
          </p>
        ) : null}
      </div>
    </div>
  );
}
