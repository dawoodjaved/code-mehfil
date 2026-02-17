"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonacoEditor } from "@/components/editor/monaco-editor";
import { CodeforcesRecommender } from "./codeforces-recommender";

interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  topics: string[];
  testCases: Array<{ input: string; expectedOutput: string; isPublic: boolean }>;
  templates: Array<{ language: string; code: string }>;
}

interface InterviewModeProps {
  sessionId: string;
  questionId?: string;
}

export function InterviewMode({ sessionId, questionId }: InterviewModeProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<Array<{
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
  }>>([]);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (questionId) {
      fetchQuestion(questionId);
    }
  }, [questionId]);

  // Update code when language changes and question is loaded
  useEffect(() => {
    if (!question) return;
    
    const template = question.templates?.find((t: any) => t.language === language);
    if (template) {
      setCode(template.code);
    } else if (question.starterCode && question.starterCode[language]) {
      setCode(question.starterCode[language]);
    } else {
      // Default starter code based on language
      const defaultCode: Record<string, string> = {
        python: "# Write your solution here\n",
        javascript: "// Write your solution here\n",
        java: "// Write your solution here\n",
        cpp: "// Write your solution here\n",
      };
      setCode(defaultCode[language] || "");
    }
  }, [language, question]);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  const handleCodeforcesProblemSelect = (problem: any) => {
    // Convert Codeforces problem to our question format
    const newQuestion: Question = {
      id: `${problem.contestId}-${problem.index}`,
      title: `${problem.contestId}${problem.index}. ${problem.name}`,
      description: `Solve this problem from Codeforces Contest ${problem.contestId}.\n\nProblem: ${problem.name}\n\nTags: ${problem.tags.join(", ")}\n${problem.rating ? `Difficulty: ${problem.rating}` : ""}\n\nView full problem: https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
      difficulty: problem.rating 
        ? problem.rating < 1200 ? "Easy" 
        : problem.rating < 1600 ? "Medium"
        : problem.rating < 2000 ? "Hard"
        : "Expert"
        : "Unknown",
      topics: problem.tags || [],
      testCases: [],
      templates: [],
    };
    setQuestion(newQuestion);
  };

  const fetchQuestion = async (id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${apiUrl}/api/questions/${id}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch question: ${response.statusText}`);
      }
      
      const data = await response.json();
      setQuestion(data);
      
      // Get starter code for current language
      const template = data.templates?.find((t: any) => t.language === language);
      if (template) {
        setCode(template.code);
      } else if (data.starterCode && data.starterCode[language]) {
        // Fallback to starterCode object if templates not available
        setCode(data.starterCode[language]);
      } else {
        // Default starter code based on language
        const defaultCode: Record<string, string> = {
          python: "# Write your solution here\n",
          javascript: "// Write your solution here\n",
          java: "// Write your solution here\n",
          cpp: "// Write your solution here\n",
        };
        setCode(defaultCode[language] || "");
      }
    } catch (error) {
      console.error("Failed to fetch question:", error);
    }
  };

  const runTests = async () => {
    if (!question) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const token = localStorage.getItem("token");
    const results = [];
    
    // Get public test cases (isPublic: true or isHidden: false)
    const publicTestCases = question.testCases.filter(
      (tc: any) => tc.isPublic === true || tc.isHidden === false
    );

    for (const testCase of publicTestCases) {
      try {
        const response = await fetch(`${apiUrl}/api/executions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            session_id: sessionId,
            code,
            language,
            input: testCase.input,
          }),
        });

        if (!response.ok) {
          throw new Error(`Execution failed: ${response.statusText}`);
        }

        const execution = await response.json();
        const actualOutput = execution.output?.trim() || "";
        const expectedOutput = testCase.expectedOutput?.trim() || "";
        const passed = actualOutput === expectedOutput;

        results.push({
          passed,
          input: testCase.input,
          expected: expectedOutput,
          actual: actualOutput || execution.error || "No output",
        });
      } catch (error: any) {
        results.push({
          passed: false,
          input: testCase.input,
          expected: testCase.expectedOutput || "",
          actual: `Error: ${error.message || error}`,
        });
      }
    }

    setTestResults(results);
    const passedCount = results.filter((r) => r.passed).length;
    setScore(results.length > 0 ? (passedCount / results.length) * 100 : 0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <Tabs defaultValue="recommender" className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <TabsList className="border-b rounded-none flex-shrink-0 shrink-0">
          <TabsTrigger value="recommender">Problem Recommender</TabsTrigger>
          <TabsTrigger value="interview" disabled={!question}>
            Interview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommender" className="flex-1 flex flex-col m-0 p-4 min-h-0 overflow-hidden data-[state=inactive]:hidden data-[state=active]:flex">
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden min-w-0">
            <CodeforcesRecommender onProblemSelect={handleCodeforcesProblemSelect} />
            {question && (
              <div className="mt-4 flex-shrink-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Selected Problem</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h3 className="font-semibold">{question.title}</h3>
                      <div className="flex gap-2">
                        <Badge>{question.difficulty}</Badge>
                        {question.topics.map((topic) => (
                          <Badge key={topic} variant="outline">{topic}</Badge>
                        ))}
                      </div>
                      <Button
                        onClick={() => {
                          const tabs = document.querySelector('[role="tablist"]') as HTMLElement;
                          const interviewTab = Array.from(tabs?.children || []).find(
                            (child) => (child as HTMLElement).textContent?.includes("Interview")
                          ) as HTMLElement;
                          interviewTab?.click();
                        }}
                        className="mt-2"
                      >
                        Start Interview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="interview" className="flex-1 flex flex-col m-0 min-h-0 overflow-hidden data-[state=inactive]:hidden data-[state=active]:flex">
          {!question ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">No problem selected</p>
                <Button
                  onClick={() => {
                    const tabs = document.querySelector('[role="tablist"]') as HTMLElement;
                    const recommenderTab = Array.from(tabs?.children || []).find(
                      (child) => (child as HTMLElement).textContent?.includes("Recommender")
                    ) as HTMLElement;
                    recommenderTab?.click();
                  }}
                >
                  Select a Problem
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="border-b p-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold">{question.title}</h2>
          <div className="flex gap-2 mt-1">
            <span className="text-xs px-2 py-1 bg-muted rounded">
              {question.difficulty}
            </span>
            {question.topics.map((topic) => (
              <span key={topic} className="text-xs px-2 py-1 bg-muted rounded">
                {topic}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-2xl font-mono">{formatTime(timer)}</div>
          <Button
            onClick={() => setIsRunning(!isRunning)}
            variant={isRunning ? "destructive" : "default"}
          >
            {isRunning ? "Pause" : "Start"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Question & Editor */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 grid grid-cols-2 min-h-0 overflow-hidden">
            {/* Question Description */}
            <div className="border-r p-4 overflow-y-auto min-h-0">
              <Card>
                <CardHeader>
                  <CardTitle>Problem Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm">
                    {question.description}
                  </div>
                </CardContent>
              </Card>

              {/* Test Cases */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Test Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {question.testCases
                      .filter((tc) => tc.isPublic)
                      .map((tc, idx) => (
                        <div key={idx} className="text-xs p-2 bg-muted rounded">
                          <div className="font-semibold">Input:</div>
                          <div className="font-mono">{tc.input}</div>
                          <div className="font-semibold mt-1">Expected:</div>
                          <div className="font-mono">{tc.expectedOutput}</div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Code Editor */}
            <div className="flex flex-col min-h-0">
              <div className="border-b p-2 flex items-center gap-2 flex-shrink-0">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="rust">Rust</option>
                  <option value="go">Go</option>
                </select>
                <Button onClick={runTests} size="sm">
                  Run Tests
                </Button>
                <Button variant="outline" size="sm">
                  Submit
                </Button>
              </div>
              <div className="flex-1 min-h-0">
                <MonacoEditor
                  sessionId={sessionId}
                  fileId="solution"
                  language={language}
                  initialValue={code}
                  onChange={setCode}
                />
              </div>
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="border-t p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Test Results</h3>
                {score !== null && (
                  <div className="text-lg font-bold">
                    Score: {score.toFixed(0)}%
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {testResults.map((result, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded text-xs ${
                      result.passed ? "bg-green-500/20" : "bg-red-500/20"
                    }`}
                  >
                    <div className="font-semibold">
                      Test {idx + 1}: {result.passed ? "✓ Passed" : "✗ Failed"}
                    </div>
                    <div className="mt-1">
                      <div>Expected: {result.expected}</div>
                      <div>Got: {result.actual}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

