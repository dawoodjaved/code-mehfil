"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter } from "lucide-react";

interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  topics: string[];
  testCases: number;
}

interface QuestionBankProps {
  workspaceId?: string;
  onSelectQuestion: (question: Question) => void;
  onCreateQuestion: () => void;
}

export function QuestionBank({ workspaceId, onSelectQuestion, onCreateQuestion }: QuestionBankProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");

  useEffect(() => {
    fetchQuestions();
  }, [workspaceId, difficultyFilter, topicFilter]);

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams();
      if (workspaceId) params.append("workspaceId", workspaceId);
      if (difficultyFilter !== "all") params.append("difficulty", difficultyFilter);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch(`${apiUrl}/api/questions?${params}`, { headers });
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter;
    const matchesTopic = topicFilter === "all" || q.topics.includes(topicFilter);
    return matchesSearch && matchesDifficulty && matchesTopic;
  });

  const allTopics = Array.from(new Set(questions.flatMap((q) => q.topics)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Question Bank</h2>
        <Button onClick={onCreateQuestion}>
          <Plus className="w-4 h-4 mr-2" />
          Create Question
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
          className="px-3 py-2 border rounded"
        >
          <option value="all">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="all">All Topics</option>
          {allTopics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQuestions.map((question) => (
          <Card
            key={question.id}
            className="cursor-pointer hover:border-primary transition"
            onClick={() => onSelectQuestion(question)}
          >
            <CardHeader>
              <CardTitle className="text-sm">{question.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-2">
                <Badge variant={question.difficulty === "EASY" ? "default" : question.difficulty === "MEDIUM" ? "secondary" : "destructive"}>
                  {question.difficulty}
                </Badge>
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
                {question.testCases} test cases
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

