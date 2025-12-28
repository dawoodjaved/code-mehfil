"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Video, Users, Zap, Shield, Brain } from "lucide-react";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl font-bold tracking-tight">
            CodePair <span className="text-primary">Demo</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the future of real-time coding collaboration
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-5 w-5 text-primary" />
                <CardTitle>Monaco Editor</CardTitle>
              </div>
              <CardDescription>
                Full-featured code editor with 80+ languages, syntax highlighting, and IntelliSense
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Multi-cursor editing</li>
                <li>• Real-time collaboration</li>
                <li>• Vim/Emacs keybindings</li>
                <li>• Custom themes</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Video className="h-5 w-5 text-primary" />
                <CardTitle>Live Video/Audio</CardTitle>
              </div>
              <CardDescription>
                WebRTC-powered video calls with screen sharing and spatial audio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 1080p video quality</li>
                <li>• Screen sharing</li>
                <li>• Spatial audio</li>
                <li>• Low latency</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Real-Time Collaboration</CardTitle>
              </div>
              <CardDescription>
                See cursors, selections, and changes in real-time with Y.js
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Multi-cursor awareness</li>
                <li>• Live typing indicators</li>
                <li>• Presence indicators</li>
                <li>• Conflict-free sync</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle>Code Execution</CardTitle>
              </div>
              <CardDescription>
                Run code in isolated Docker containers with 40+ languages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Python, JavaScript, Go, Rust</li>
                <li>• Sandboxed execution</li>
                <li>• Time/memory limits</li>
                <li>• Auto-grading</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Interview Mode</CardTitle>
              </div>
              <CardDescription>
                Professional interview platform with anti-cheating and scoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 200+ LeetCode questions</li>
                <li>• Automated scoring</li>
                <li>• Anti-cheat detection</li>
                <li>• PDF reports</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle>AI Interviewer</CardTitle>
              </div>
              <CardDescription>
                Fully autonomous AI interviewer powered by Claude/GPT
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Follow-up questions</li>
                <li>• Real-time analysis</li>
                <li>• Automated scoring</li>
                <li>• Transcript generation</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="text-muted-foreground">
            Create an account and start coding collaboratively in seconds
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/signup">Sign Up Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

