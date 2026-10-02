"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resolveNextPath } from "@/lib/auth";

function SignInForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const next = resolveNextPath(searchParams.get("next"));

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token || data.user?.token;
        if (token) {
          localStorage.setItem("token", token);
          window.location.href = next;
        } else {
          setError("No token received from server");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || errorData.error || "Invalid credentials");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in.";
      setError(`Network error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md relative z-cards glass border-[rgba(255,255,255,0.1)]">
      <CardHeader>
        <CardTitle className="text-text-primary">Sign in</CardTitle>
        <CardDescription className="text-text-muted">
          You must be signed in to open or join a session
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent-red hover:bg-accent-red-hover rounded-full"
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-sm text-text-muted">
            No account?{" "}
            <Link
              href={`/auth/signup?next=${encodeURIComponent(resolveNextPath(searchParams.get("next")))}`}
              className="text-accent-red hover:underline"
            >
              Sign up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-bg-primary p-4 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-background">
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-orb-strong"
          style={{ background: "#ff0033", transform: "translate(50%, -50%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full blur-orb"
          style={{ background: "#9333ea", transform: "translate(-30%, 30%)" }}
        />
      </div>
      <Suspense
        fallback={
          <Card className="w-full max-w-md glass border-white/10">
            <CardHeader>
              <CardTitle className="text-text-primary">Sign in</CardTitle>
              <CardDescription>Loading…</CardDescription>
            </CardHeader>
          </Card>
        }
      >
        <SignInForm />
      </Suspense>
    </div>
  );
}
