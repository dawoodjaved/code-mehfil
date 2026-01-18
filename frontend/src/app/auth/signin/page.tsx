"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    
    // Trim email to remove leading/trailing spaces
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login response:", data);
        // Store token - check both data.token and data.user.token
        const token = data.token || data.user?.token;
        if (token) {
          localStorage.setItem("token", token);
          console.log("Token stored:", token.substring(0, 20) + "...");
          // Redirect to sessions page directly (better UX)
          window.location.href = "/sessions";
        } else {
          console.error("No token in response:", data);
          setError("No token received from server");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Invalid credentials");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in. Please try again.";
      const port = apiUrl.replace('http://localhost:', '');
      setError(`Network error: ${errorMessage}. Make sure the backend is running on port ${port}.`);
      console.error("Sign in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-bg-primary p-4 overflow-hidden">
      {/* Background Blur Orbs */}
      <div className="fixed inset-0 pointer-events-none z-background">
        <div 
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-orb-strong"
          style={{
            background: "#ff0033",
            transform: "translate(50%, -50%)",
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full blur-orb"
          style={{
            background: "#9333ea",
            transform: "translate(-30%, 30%)",
          }}
        />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-5xl relative z-cards">
        {/* Illustration Side - 3D Vector */}
        <div className="hidden md:flex flex-1 justify-center items-center">
          <svg width="400" height="400" viewBox="0 0 400 400" className="w-full max-w-md h-auto opacity-90">
            <defs>
              <linearGradient id="loginGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff1493" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#9333ea" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="loginGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#9333ea" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            
            {/* 3D User Icon */}
            <g transform="translate(150, 100)">
              {/* Head */}
              <circle cx="50" cy="30" r="25" fill="url(#loginGrad1)" opacity="0.8">
                <animate attributeName="cy" values="30;28;30" dur="3s" repeatCount="indefinite" />
              </circle>
              {/* Body */}
              <path d="M 30 60 Q 30 80 50 80 Q 70 80 70 60 L 70 55 L 30 55 Z" 
                fill="url(#loginGrad2)" opacity="0.8" />
              {/* 3D Effect */}
              <ellipse cx="50" cy="30" rx="20" ry="18" fill="#ffffff" opacity="0.2" />
            </g>
            
            {/* Lock Icon */}
            <g transform="translate(200, 250)">
              <rect x="0" y="20" width="40" height="30" rx="4" fill="url(#loginGrad1)" opacity="0.8" />
              <path d="M 20 20 Q 20 10 30 10 Q 40 10 40 20" 
                stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.6" />
              <circle cx="20" cy="35" r="3" fill="#00d4ff" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
            
            {/* Floating Particles */}
            <circle cx="100" cy="150" r="4" fill="#ff1493" opacity="0.4">
              <animate attributeName="cy" values="150;140;150" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="300" cy="200" r="3" fill="#00d4ff" opacity="0.4">
              <animate attributeName="cy" values="200;190;200" dur="2.5s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        <Card className="w-full max-w-md glass" style={{
          borderColor: "rgba(255, 255, 255, 0.1)",
        }}>
        <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4 md:hidden">
              <svg width="192" height="192" viewBox="0 0 192 192" className="opacity-90">
                <defs>
                  <linearGradient id="loginGradMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff1493" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#9333ea" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                <circle cx="96" cy="60" r="30" fill="url(#loginGradMobile)" opacity="0.8" />
                <path d="M 60 100 Q 60 130 96 130 Q 132 130 132 100 L 132 95 L 60 95 Z" 
                  fill="url(#loginGradMobile)" opacity="0.8" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-text-primary">Sign In</CardTitle>
            <CardDescription className="text-text-muted">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div 
                className="p-3 text-sm text-status-red rounded-md"
                style={{
                  background: "rgba(255, 0, 51, 0.1)",
                  border: "1px solid rgba(255, 0, 51, 0.3)",
                }}
              >
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-text-secondary">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-bg-card border-[rgba(255,255,255,0.1)] text-text-primary placeholder:text-text-muted focus:border-accent-red"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-text-secondary">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-bg-card border-[rgba(255,255,255,0.1)] text-text-primary placeholder:text-text-muted focus:border-accent-red"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-accent-red hover:bg-accent-red-hover text-white font-semibold rounded-full py-3 transition-all duration-300 hover:scale-105 hover:shadow-glow-red" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-text-muted">Don't have an account? </span>
            <Link href="/auth/signup" className="text-accent-red hover:text-accent-red-hover hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

