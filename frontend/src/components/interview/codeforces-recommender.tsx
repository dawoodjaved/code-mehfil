"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, RefreshCw } from "lucide-react";

interface CodeforcesProblem {
  contestId: number;
  index: string;
  name: string;
  type: string;
  rating?: number;
  tags: string[];
  solvedCount?: number;
}

interface CodeforcesContest {
  id: number;
  name: string;
  type: string;
  phase: string;
  frozen: boolean;
  durationSeconds: number;
  startTimeSeconds?: number;
  relativeTimeSeconds?: number;
  preparedBy?: string;
  websiteUrl?: string;
  description?: string;
  difficulty?: number;
  kind?: string;
  icpcRegion?: string;
  country?: string;
  city?: string;
  season?: string;
}

interface CodeforcesRecommenderProps {
  onProblemSelect: (problem: CodeforcesProblem) => void;
}

export function CodeforcesRecommender({ onProblemSelect }: CodeforcesRecommenderProps) {
  const [problems, setProblems] = useState<CodeforcesProblem[]>([]);
  const [contests, setContests] = useState<CodeforcesContest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedContest, setSelectedContest] = useState<number | null>(null);

  // Fetch recent contests
  const fetchRecentContests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://codeforces.com/api/contest.list?gym=false");
      const data = await response.json();

      if (data.status === "OK") {
        // Get recent finished contests (last 10)
        const recentContests = data.result
          .filter((c: CodeforcesContest) => c.phase === "FINISHED")
          .slice(0, 10);
        setContests(recentContests);
      } else {
        setError(data.comment || "Failed to fetch contests");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch contests");
    } finally {
      setLoading(false);
    }
  };

  // Fetch problems from a specific contest
  const fetchContestProblems = async (contestId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=1`);
      const data = await response.json();

      if (data.status === "OK" && data.result?.problems) {
        setProblems(data.result.problems);
        setSelectedContest(contestId);
      } else {
        setError(data.comment || "Failed to fetch problems");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch problems");
    } finally {
      setLoading(false);
    }
  };

  // Fetch problems with rating filter
  const fetchProblemsByRating = async (minRating: number, maxRating: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://codeforces.com/api/problemset.problems");
      const data = await response.json();

      if (data.status === "OK" && data.result?.problems) {
        const filtered = data.result.problems
          .filter((p: CodeforcesProblem) => {
            if (!p.rating) return false;
            return p.rating >= minRating && p.rating <= maxRating;
          })
          .slice(0, 20); // Get top 20
        setProblems(filtered);
        setSelectedContest(null);
      } else {
        setError(data.comment || "Failed to fetch problems");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch problems");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentContests();
  }, []);

  const getDifficultyColor = (rating?: number) => {
    if (!rating) return "bg-gray-500";
    if (rating < 1200) return "bg-green-500";
    if (rating < 1600) return "bg-cyan-500";
    if (rating < 2000) return "bg-blue-500";
    if (rating < 2400) return "bg-purple-500";
    if (rating < 2800) return "bg-orange-500";
    return "bg-red-500";
  };

  const formatContestDate = (timestamp?: number) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden min-w-0">
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <CardHeader className="flex-shrink-0 shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>Codeforces Problem Recommender</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRecentContests}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden pt-0">
          <div className="flex-1 flex flex-col min-h-0 gap-4">
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProblemsByRating(800, 1200)}
              disabled={loading}
            >
              Easy (800-1200)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProblemsByRating(1200, 1600)}
              disabled={loading}
            >
              Medium (1200-1600)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProblemsByRating(1600, 2000)}
              disabled={loading}
            >
              Hard (1600-2000)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProblemsByRating(2000, 2400)}
              disabled={loading}
            >
              Expert (2000-2400)
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded text-sm flex-shrink-0">
              {error}
            </div>
          )}

          {/* Recent Contests - grows to fill when no problems shown */}
          {contests.length > 0 && (
            <div className={problems.length > 0 ? "flex-shrink-0" : "flex-1 flex flex-col min-h-0 overflow-hidden"}>
              <h3 className="text-sm font-semibold mb-2 flex-shrink-0">Recent Contests</h3>
              <div className={`space-y-2 overflow-y-auto overflow-x-hidden ${problems.length > 0 ? "max-h-48" : "flex-1 min-h-0"}`}>
                {contests.map((contest) => (
                  <div
                    key={contest.id}
                    className="flex items-center justify-between p-2 border rounded hover:bg-muted/50 cursor-pointer"
                    onClick={() => fetchContestProblems(contest.id)}
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium">{contest.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatContestDate(contest.startTimeSeconds)}
                      </div>
                    </div>
                    {selectedContest === contest.id && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Problems List */}
          {loading && (
            <div className="flex items-center justify-center p-8 flex-shrink-0">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}

          {problems.length > 0 && !loading && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <h3 className="text-sm font-semibold mb-2 flex-shrink-0">
                {selectedContest ? `Problems from Contest ${selectedContest}` : "Recommended Problems"}
              </h3>
              <div className="flex-1 space-y-2 overflow-y-auto min-h-0 overflow-x-hidden">
                {problems.map((problem, idx) => (
                  <Card
                    key={`${problem.contestId}-${problem.index}`}
                    className="hover:bg-muted/50 cursor-pointer transition-colors flex-shrink-0"
                    onClick={() => onProblemSelect(problem)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">
                              {problem.contestId}{problem.index}. {problem.name}
                            </span>
                            {problem.rating && (
                              <Badge
                                className={getDifficultyColor(problem.rating)}
                              >
                                {problem.rating}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {problem.tags.slice(0, 5).map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
                              "_blank"
                            );
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
