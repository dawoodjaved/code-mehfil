"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BlurOrbs } from "@/components/vr-landing/blur-orbs";
import { AppNav } from "@/components/dashboard/app-nav";
import { RequireAuth } from "@/components/auth/require-auth";

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fromQuery = searchParams.get("code");
    if (fromQuery) setCode(fromQuery.trim().toUpperCase());
  }, [searchParams]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Enter a session code");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push(`/auth/signin?next=${encodeURIComponent(`/join?code=${trimmed}`)}`);
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/sessions/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: trimmed }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "Could not join session");
        return;
      }

      const sessionId = data.session?.id || data.id;
      if (!sessionId) {
        setError("Invalid join response");
        return;
      }
      router.push(`/session/${sessionId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to join session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md relative z-cards glass border-[rgba(255,255,255,0.1)]">
      <CardHeader>
        <CardTitle className="text-text-primary">Join a Session</CardTitle>
        <CardDescription className="text-text-muted">
          Enter the session code shared with you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleJoin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-text-secondary">
              Session Code
            </Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABCD1234"
              maxLength={12}
              className="uppercase tracking-widest font-mono text-lg"
              autoFocus
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent-red hover:bg-accent-red-hover rounded-full"
          >
            {isLoading ? "Joining…" : "Join Session"}
          </Button>
          <p className="text-center text-sm text-text-muted">
            <Link href="/sessions" className="text-accent-red hover:underline">
              Back to My Sessions
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export default function JoinSessionPage() {
  return (
    <RequireAuth next="/join">
      <div className="relative min-h-screen bg-bg-primary overflow-hidden">
        <BlurOrbs />
        <AppNav />
        <div className="relative z-cards flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
          <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
            <div className="hidden md:block">
              <JoinHeroArt />
              <h2 className="mt-4 text-2xl font-semibold text-text-primary">Enter the mehfil</h2>
              <p className="text-text-muted text-sm mt-2 max-w-sm">
                Paste the 8-character code from your host. You must be signed in — then you&apos;ll
                land in the same live room.
              </p>
            </div>
            <Suspense
              fallback={
                <Card className="w-full glass border-white/10">
                  <CardHeader>
                    <CardTitle className="text-text-primary">Join a Session</CardTitle>
                    <CardDescription className="text-text-muted">Loading…</CardDescription>
                  </CardHeader>
                </Card>
              }
            >
              <JoinForm />
            </Suspense>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

function JoinHeroArt() {
  return (
    <svg viewBox="0 0 360 240" className="w-full max-w-md opacity-95" aria-hidden>
      <defs>
        <linearGradient id="joinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff0033" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <rect x="40" y="40" width="200" height="140" rx="16" fill="url(#joinGrad)" />
      <rect x="60" y="70" width="100" height="10" rx="5" fill="#fff" opacity="0.8" />
      <rect x="60" y="95" width="140" height="10" rx="5" fill="#fff" opacity="0.45" />
      <rect x="60" y="120" width="80" height="10" rx="5" fill="#fff" opacity="0.6" />
      <circle cx="280" cy="90" r="36" fill="#00d4ff" opacity="0.25">
        <animate attributeName="r" values="32;40;32" dur="2.2s" repeatCount="indefinite" />
      </circle>
      <path
        d="M265 90h30M280 75v30"
        stroke="#00d4ff"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.9"
      />
      <circle cx="250" cy="170" r="10" fill="#ff0033" opacity="0.7" />
      <circle cx="275" cy="170" r="10" fill="#ff0033" opacity="0.45" />
      <circle cx="300" cy="170" r="10" fill="#ff0033" opacity="0.3" />
    </svg>
  );
}
