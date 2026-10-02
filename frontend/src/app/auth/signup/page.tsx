"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resolveNextPath } from "@/lib/auth";

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-bg-primary p-4 overflow-hidden">
      <Suspense fallback={<div className="text-text-muted text-sm">Loading…</div>}>
        <SignUpForm />
      </Suspense>
    </div>
  );
}

function SignUpForm() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedName) {
      setError("Name is required");
      return;
    }
    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }
    if (trimmedPassword !== trimmedConfirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (trimmedPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    const next = resolveNextPath(searchParams.get("next"));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: {
            name: trimmedName,
            email: trimmedEmail,
            password: trimmedPassword,
            password_confirmation: trimmedConfirmPassword,
          },
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
        setError(
          (Array.isArray(errorData.errors) && errorData.errors.join(", ")) ||
            errorData.error ||
            "Could not create account"
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md relative z-cards glass border-[rgba(255,255,255,0.1)]">
      <CardHeader>
        <CardTitle className="text-text-primary">Create account</CardTitle>
        <CardDescription className="text-text-muted">
          Sign up to create and join coding sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent-red hover:bg-accent-red-hover rounded-full"
          >
            {isLoading ? "Creating…" : "Sign up"}
          </Button>
          <p className="text-center text-sm text-text-muted">
            Already have an account?{" "}
            <Link
              href={`/auth/signin?next=${encodeURIComponent(resolveNextPath(searchParams.get("next")))}`}
              className="text-accent-red hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
