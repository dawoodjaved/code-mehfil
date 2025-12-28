import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-6xl font-bold tracking-tight">
            CodePair <span className="text-primary">2025</span>
          </h1>
          <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
            The Definitive Real-Time Coding Collaboration & Interview Platform
          </p>
          <p className="text-lg text-muted-foreground/80">
            LiveShare + CoderPad + Replit + Zoom had a baby on steroids
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/auth/signin">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/demo">View Demo</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Collaboration</CardTitle>
              <CardDescription>
                Multi-cursor editing with Y.js, live video/audio, and instant sync
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Secure Code Execution</CardTitle>
              <CardDescription>
                40+ languages in isolated Docker containers with sandboxing
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>AI Interviewer</CardTitle>
              <CardDescription>
                Fully autonomous AI interviewer powered by Claude 3.5 / GPT-4o
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}

