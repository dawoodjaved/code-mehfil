"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonacoEditor } from "@/components/editor/monaco-editor";

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

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  const fetchQuestion = async (id: string) => {
    try {
      const response = await fetch(`/api/questions/${id}`);
      const data = await response.json();
      setQuestion(data);
      const template = data.templates?.find((t: any) => t.language === language);
      if (template) {
        setCode(template.code);
      }
    } catch (error) {
      console.error("Failed to fetch question:", error);
    }
  };

  const runTests = async () => {
    if (!question) return;

    const results = [];
    for (const testCase of question.testCases.filter((tc) => tc.isPublic)) {
      try {
        const response = await fetch(`/api/executions/${sessionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            language,
            input: testCase.input,
          }),
        });

        const execution = await response.json();
        const passed = execution.output?.trim() === testCase.expectedOutput.trim();

        results.push({
          passed,
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: execution.output || execution.error || "No output",
        });
      } catch (error) {
        results.push({
          passed: false,
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: `Error: ${error}`,
        });
      }
    }

    setTestResults(results);
    const passedCount = results.filter((r) => r.passed).length;
    setScore((passedCount / results.length) * 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!question) {
    return <div className="p-4">Loading question...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
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

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Question & Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 grid grid-cols-2">
            {/* Question Description */}
            <div className="border-r p-4 overflow-y-auto">
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
            <div className="flex flex-col">
              <div className="border-b p-2 flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    const template = question.templates?.find(
                      (t: any) => t.language === e.target.value
                    );
                    if (template) setCode(template.code);
                  }}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
                <Button onClick={runTests} size="sm">
                  Run Tests
                </Button>
                <Button variant="outline" size="sm">
                  Submit
                </Button>
              </div>
              <div className="flex-1">
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
    </div>
  );
}

