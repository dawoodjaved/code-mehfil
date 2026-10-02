"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonacoEditor } from "@/components/editor/monaco-editor";
import { CodeforcesRecommender } from "./codeforces-recommender";
import { HackerRankRecommender } from "./hackerrank-recommender";
import { QuestionBank, BankQuestion } from "@/components/questions/question-bank";
import { TimeExtension } from "./time-extension";
import { ExternalLink, Plus, Trash2 } from "lucide-react";

interface LocalTestCase {
  id?: string;
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  localOnly?: boolean;
}

interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  topics: string[];
  testCases: LocalTestCase[];
  templates: Array<{ language: string; code: string }>;
  starterCode?: Record<string, string>;
  source?: string;
  externalUrl?: string;
}

interface InterviewModeProps {
  sessionId: string;
  questionId?: string;
  fileId?: string;
  code?: string;
  language?: string;
  onCodeChange?: (value: string) => void;
  onLanguageChange?: (language: string) => void;
}

function apiBase() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
}

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function isPersistedQuestionId(id: string | undefined) {
  if (!id) return false;
  // Only persist against real bank/HackerRank rows (UUID primary keys)
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

const DEFAULT_STARTERS: Record<string, string> = {
  python: "# Write your solution here\n",
  javascript: "// Write your solution here\n",
  typescript: "// Write your solution here\n",
  java: "// Write your solution here\n",
  cpp: "// Write your solution here\n",
  rust: "// Write your solution here\n",
  go: "// Write your solution here\n",
};

export function InterviewMode({
  sessionId,
  questionId,
  fileId,
  code: controlledCode,
  language: controlledLanguage,
  onCodeChange,
  onLanguageChange,
}: InterviewModeProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [localCode, setLocalCode] = useState("");
  const [localLanguage, setLocalLanguage] = useState("javascript");
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activePanel, setActivePanel] = useState("bank");
  const [testResults, setTestResults] = useState<
    Array<{ passed: boolean; input: string; expected: string; actual: string }>
  >([]);
  const [score, setScore] = useState<number | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [runOutput, setRunOutput] = useState<string | null>(null);
  const [newInput, setNewInput] = useState("");
  const [newExpected, setNewExpected] = useState("");
  const [addingTest, setAddingTest] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const code = controlledCode !== undefined ? controlledCode : localCode;
  const language = controlledLanguage || localLanguage;
  const editorFileId = fileId;

  const setCode = useCallback(
    (value: string) => {
      if (onCodeChange) onCodeChange(value);
      else setLocalCode(value);
    },
    [onCodeChange]
  );

  const setLanguage = useCallback(
    (value: string) => {
      if (onLanguageChange) onLanguageChange(value);
      else setLocalLanguage(value);
    },
    [onLanguageChange]
  );

  useEffect(() => {
    if (questionId) {
      fetchQuestion(questionId);
    }
  }, [questionId]);

  useEffect(() => {
    if (!question || controlledCode !== undefined) return;

    const template = question.templates?.find((t) => t.language === language);
    if (template) {
      setLocalCode(template.code);
    } else if (question.starterCode?.[language]) {
      setLocalCode(question.starterCode[language]);
    } else {
      setLocalCode(DEFAULT_STARTERS[language] || "");
    }
  }, [language, question, controlledCode]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const applyStarterToSharedEditor = (q: Question, lang: string) => {
    if (controlledCode === undefined) return;
    // Only seed shared editor when it's still empty / welcome stub
    const trimmed = (controlledCode || "").trim();
    const isStub =
      !trimmed ||
      trimmed.startsWith("// Welcome to CodeMehfil") ||
      trimmed.startsWith("// Write your solution") ||
      trimmed.startsWith("# Write your solution");
    if (!isStub) return;

    const template = q.templates?.find((t) => t.language === lang);
    const starter =
      template?.code ||
      q.starterCode?.[lang] ||
      DEFAULT_STARTERS[lang] ||
      "";
    if (starter) setCode(starter);
  };

  const handleCodeforcesProblemSelect = (problem: any) => {
    const newQuestion: Question = {
      id: `${problem.contestId}-${problem.index}`,
      title: `${problem.contestId}${problem.index}. ${problem.name}`,
      description: `Solve this problem from Codeforces Contest ${problem.contestId}.\n\nProblem: ${problem.name}\n\nTags: ${problem.tags.join(", ")}\n${problem.rating ? `Difficulty: ${problem.rating}` : ""}\n\nView full problem: https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
      difficulty: problem.rating
        ? problem.rating < 1200
          ? "Easy"
          : problem.rating < 1600
            ? "Medium"
            : problem.rating < 2000
              ? "Hard"
              : "Expert"
        : "Unknown",
      topics: problem.tags || [],
      testCases: [],
      templates: [],
    };
    setQuestion(newQuestion);
    setTestResults([]);
    setScore(null);
    setRunOutput(null);
    setActivePanel("interview");
    applyStarterToSharedEditor(newQuestion, language);
  };

  const handleBankSelect = (q: BankQuestion) => {
    const mapped: Question = {
      id: q.id,
      title: q.title,
      description: q.description,
      difficulty: q.difficulty,
      topics: q.topics || [],
      testCases: Array.isArray(q.testCases)
        ? q.testCases.map((tc: any) => ({
            id: tc.id,
            input: tc.input || tc.expected_input || "",
            expectedOutput: tc.expectedOutput || tc.expected_output || "",
            isPublic: tc.isPublic !== false && tc.is_public !== false,
          }))
        : [],
      templates: q.templates || [],
      starterCode: q.starterCode,
      source: q.source,
      externalUrl: q.externalUrl,
    };
    setQuestion(mapped);
    setTestResults([]);
    setScore(null);
    setRunOutput(null);
    let lang = language;
    if (q.starterCode?.javascript) lang = "javascript";
    else if (q.starterCode?.python) lang = "python";
    setLanguage(lang);
    setActivePanel("interview");
    applyStarterToSharedEditor(mapped, lang);
  };

  const fetchQuestion = async (id: string) => {
    try {
      const response = await fetch(`${apiBase()}/api/questions/${id}`, {
        headers: authHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch question: ${response.statusText}`);
      }

      const data = await response.json();
      const mapped: Question = {
        ...data,
        testCases: Array.isArray(data.testCases)
          ? data.testCases.map((tc: any) => ({
              id: tc.id,
              input: tc.input || "",
              expectedOutput: tc.expectedOutput || tc.expected_output || "",
              isPublic: tc.isPublic !== false && tc.is_public !== false,
            }))
          : [],
      };
      setQuestion(mapped);
      applyStarterToSharedEditor(mapped, language);
    } catch (error) {
      console.error("Failed to fetch question:", error);
    }
  };

  const addTestCase = async () => {
    if (!question) return;
    if (!newExpected.trim() && !newInput.trim()) {
      setStatusMessage("Enter at least an expected output (input can be empty).");
      return;
    }

    setAddingTest(true);
    setStatusMessage(null);

    const draft: LocalTestCase = {
      input: newInput,
      expectedOutput: newExpected,
      isPublic: true,
      localOnly: true,
    };

    try {
      if (isPersistedQuestionId(question.id)) {
        const response = await fetch(
          `${apiBase()}/api/questions/${question.id}/test_cases`,
          {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({
              input: draft.input,
              expected_output: draft.expectedOutput,
              is_public: true,
            }),
          }
        );

        if (response.ok) {
          const created = await response.json();
          draft.id = created.id;
          draft.localOnly = false;
          draft.input = created.input ?? draft.input;
          draft.expectedOutput = created.expectedOutput ?? draft.expectedOutput;
        }
        // If API fails (e.g. Codeforces id), still keep local case
      }

      setQuestion({
        ...question,
        testCases: [...question.testCases, draft],
      });
      setNewInput("");
      setNewExpected("");
      setStatusMessage("Test case added. Use Run Tests to check your solution.");
    } catch (error) {
      console.error("Failed to add test case:", error);
      setQuestion({
        ...question,
        testCases: [...question.testCases, draft],
      });
      setNewInput("");
      setNewExpected("");
      setStatusMessage("Test case added locally for this session.");
    } finally {
      setAddingTest(false);
    }
  };

  const removeTestCase = async (index: number) => {
    if (!question) return;
    const tc = question.testCases[index];
    const next = question.testCases.filter((_, i) => i !== index);
    setQuestion({ ...question, testCases: next });

    if (tc.id && isPersistedQuestionId(question.id) && !tc.localOnly) {
      try {
        await fetch(`${apiBase()}/api/questions/${question.id}/test_cases/${tc.id}`, {
          method: "DELETE",
          headers: authHeaders(),
        });
      } catch (error) {
        console.error("Failed to delete test case:", error);
      }
    }
  };

  const executeOnce = async (stdin: string) => {
    const response = await fetch(`${apiBase()}/api/sessions/${sessionId}/executions`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        code,
        language,
        input: stdin,
        stdin,
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(
        errBody.error || errBody.errors?.join?.(", ") || `Execution failed (${response.status})`
      );
    }

    return response.json();
  };

  const runTests = async (includeHidden = false) => {
    if (!question) return;

    const cases = includeHidden
      ? question.testCases
      : question.testCases.filter((tc) => tc.isPublic !== false);

    if (cases.length === 0) {
      setStatusMessage(
        "No test cases yet. Add input/expected pairs below, or use Run Code to try your solution."
      );
      setTestResults([]);
      setScore(null);
      return;
    }

    setIsRunningTests(true);
    setStatusMessage(null);
    setRunOutput(null);
    const results = [];

    for (const testCase of cases) {
      try {
        const execution = await executeOnce(testCase.input);
        const actualOutput = (execution.output || "").toString().trim();
        const expectedOutput = (testCase.expectedOutput || "").toString().trim();
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
    const nextScore = results.length > 0 ? (passedCount / results.length) * 100 : 0;
    setScore(nextScore);
    setIsRunningTests(false);
    return { passedCount, total: results.length, score: nextScore };
  };

  const runCode = async () => {
    setIsRunningTests(true);
    setStatusMessage(null);
    setTestResults([]);
    setScore(null);
    try {
      const execution = await executeOnce("");
      const out =
        (execution.output || "").toString() ||
        execution.error ||
        "(no output)";
      setRunOutput(out);
    } catch (error: any) {
      setRunOutput(`Error: ${error.message || error}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  const submitSolution = async () => {
    if (!question) return;
    if (question.testCases.length === 0) {
      setStatusMessage("Add at least one test case before submitting.");
      return;
    }
    const result = await runTests(true);
    if (result) {
      setStatusMessage(
        `Submitted: ${result.passedCount}/${result.total} tests passed (${result.score.toFixed(0)}%).`
      );
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <Tabs
        value={activePanel}
        onValueChange={setActivePanel}
        className="flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        <TabsList className="border-b rounded-none flex-shrink-0 shrink-0 flex-wrap h-auto">
          <TabsTrigger value="bank">Our Bank</TabsTrigger>
          <TabsTrigger value="hackerrank">HackerRank</TabsTrigger>
          <TabsTrigger value="recommender">Codeforces</TabsTrigger>
          <TabsTrigger value="interview">
            Interview{question ? "" : " (pick a problem)"}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="bank"
          className="flex-1 flex flex-col m-0 p-4 min-h-0 overflow-hidden data-[state=inactive]:hidden data-[state=active]:flex"
        >
          <QuestionBank
            onSelectQuestion={handleBankSelect}
            source="internal"
            title="Our Question Bank"
          />
        </TabsContent>

        <TabsContent
          value="hackerrank"
          className="flex-1 flex flex-col m-0 p-4 min-h-0 overflow-hidden data-[state=inactive]:hidden data-[state=active]:flex"
        >
          <HackerRankRecommender onSelectQuestion={handleBankSelect} />
        </TabsContent>

        <TabsContent
          value="recommender"
          className="flex-1 flex flex-col m-0 p-4 min-h-0 overflow-hidden data-[state=inactive]:hidden data-[state=active]:flex"
        >
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
                          <Badge key={topic} variant="outline">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      <Button onClick={() => setActivePanel("interview")} className="mt-2">
                        Start Interview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent
          value="interview"
          className="flex-1 flex flex-col m-0 min-h-0 overflow-hidden data-[state=inactive]:hidden data-[state=active]:flex"
        >
          {!question ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <p className="text-muted-foreground">No problem selected yet</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => setActivePanel("bank")}>
                    Our Bank
                  </Button>
                  <Button variant="outline" onClick={() => setActivePanel("hackerrank")}>
                    HackerRank
                  </Button>
                  <Button onClick={() => setActivePanel("recommender")}>Codeforces</Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b p-4 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold">{question.title}</h2>
                  <div className="flex gap-2 mt-1 flex-wrap items-center">
                    <span className="text-xs px-2 py-1 bg-muted rounded">
                      {question.difficulty}
                    </span>
                    {question.source ? (
                      <span className="text-xs px-2 py-1 bg-muted rounded">
                        {question.source}
                      </span>
                    ) : null}
                    {question.topics.map((topic) => (
                      <span key={topic} className="text-xs px-2 py-1 bg-muted rounded">
                        {topic}
                      </span>
                    ))}
                    {question.externalUrl ? (
                      <a
                        href={question.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 rounded border inline-flex items-center gap-1 hover:bg-muted"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Official problem
                      </a>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <TimeExtension
                    sessionId={sessionId}
                    currentTime={timer}
                    canExtend={true}
                    onExtend={(mins) => setTimer((t) => Math.max(0, t - mins * 60))}
                  />
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
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 grid grid-cols-2 min-h-0 overflow-hidden">
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

                      <Card className="mt-4">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            Test Cases
                            {question.testCases.length === 0 ? (
                              <span className="ml-2 text-xs font-normal text-muted-foreground">
                                (none yet — add your own)
                              </span>
                            ) : null}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {question.testCases.map((tc, idx) => (
                              <div
                                key={tc.id || idx}
                                className="text-xs p-2 bg-muted rounded relative group"
                              >
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-60 hover:opacity-100"
                                  onClick={() => removeTestCase(idx)}
                                  title="Remove test case"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                                <div className="font-semibold">Input:</div>
                                <pre className="font-mono whitespace-pre-wrap pr-6">
                                  {tc.input || "(empty)"}
                                </pre>
                                <div className="font-semibold mt-1">Expected:</div>
                                <pre className="font-mono whitespace-pre-wrap">
                                  {tc.expectedOutput || "(empty)"}
                                </pre>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 space-y-2 border-t pt-3">
                            <div className="text-xs font-medium text-muted-foreground">
                              Add a test case
                            </div>
                            <textarea
                              value={newInput}
                              onChange={(e) => setNewInput(e.target.value)}
                              placeholder="Input (stdin) — can be empty"
                              className="w-full min-h-[56px] text-xs font-mono border rounded p-2 bg-background"
                            />
                            <textarea
                              value={newExpected}
                              onChange={(e) => setNewExpected(e.target.value)}
                              placeholder="Expected output"
                              className="w-full min-h-[56px] text-xs font-mono border rounded p-2 bg-background"
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={addTestCase}
                              disabled={addingTest}
                              className="gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              {addingTest ? "Adding…" : "Add test case"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex flex-col min-h-0">
                      <div className="border-b p-2 flex items-center gap-2 flex-shrink-0 flex-wrap">
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
                        <Button onClick={() => runTests(false)} size="sm" disabled={isRunningTests}>
                          {isRunningTests ? "Running…" : "Run Tests"}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={runCode}
                          disabled={isRunningTests}
                        >
                          Run Code
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={submitSolution}
                          disabled={isRunningTests}
                        >
                          Submit
                        </Button>
                      </div>
                      {statusMessage ? (
                        <div className="px-3 py-1.5 text-xs border-b bg-muted/40 text-muted-foreground">
                          {statusMessage}
                        </div>
                      ) : null}
                      <div className="flex-1 min-h-0">
                        {editorFileId ? (
                          <MonacoEditor
                            sessionId={sessionId}
                            fileId={editorFileId}
                            language={language}
                            initialValue={code}
                            onChange={setCode}
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                            Waiting for session file…
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {runOutput !== null && (
                    <div className="border-t p-4 bg-muted/50 flex-shrink-0 max-h-40 overflow-y-auto">
                      <h3 className="font-semibold text-sm mb-1">Program output</h3>
                      <pre className="text-xs font-mono whitespace-pre-wrap">{runOutput}</pre>
                    </div>
                  )}

                  {testResults.length > 0 && (
                    <div className="border-t p-4 bg-muted/50 flex-shrink-0 max-h-48 overflow-y-auto">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Test Results</h3>
                        {score !== null && (
                          <div className="text-lg font-bold">Score: {score.toFixed(0)}%</div>
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
