"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Trim all inputs to remove leading/trailing spaces
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    // Validate trimmed values
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
            password_confirmation: trimmedConfirmPassword 
          } 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Signup response:", data);
        // Store token - check both data.token and data.user.token
        const token = data.token || data.user?.token;
        if (token) {
          localStorage.setItem("token", token);
          console.log("Token stored:", token.substring(0, 20) + "...");
          // Redirect to sessions page directly
          window.location.href = "/sessions";
        } else {
          console.error("No token in response:", data);
          setError("No token received from server");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create account");
      }
    } catch (err) {
      setError("Failed to sign up. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-bg-primary p-4 overflow-hidden">
      {/* Background Blur Orbs */}
      <div className="fixed inset-0 pointer-events-none z-background">
        <div 
          className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full blur-orb"
          style={{
            background: "#00d4ff",
            transform: "translate(-50%, -50%)",
          }}
        />
        <div 
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-orb-strong"
          style={{
            background: "#9333ea",
            transform: "translate(30%, 30%)",
          }}
        />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-5xl relative z-cards">
        {/* Illustration Side - 3D Vector */}
        <div className="hidden md:flex flex-1 justify-center items-center">
          <svg width="400" height="400" viewBox="0 0 400 400" className="w-full max-w-md h-auto opacity-90">
            <defs>
              <linearGradient id="signupGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#9333ea" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="signupGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff1493" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            
            {/* 3D User with Plus */}
            <g transform="translate(150, 100)">
              {/* Head */}
              <circle cx="50" cy="30" r="25" fill="url(#signupGrad1)" opacity="0.8">
                <animate attributeName="cy" values="30;28;30" dur="3s" repeatCount="indefinite" />
              </circle>
              {/* Body */}
              <path d="M 30 60 Q 30 80 50 80 Q 70 80 70 60 L 70 55 L 30 55 Z" 
                fill="url(#signupGrad2)" opacity="0.8" />
              {/* Plus Icon */}
              <g transform="translate(80, 20)">
                <circle cx="0" cy="0" r="15" fill="#ff1493" opacity="0.8" />
                <line x1="-8" y1="0" x2="8" y2="0" stroke="#ffffff" strokeWidth="2" />
                <line x1="0" y1="-8" x2="0" y2="8" stroke="#ffffff" strokeWidth="2" />
              </g>
            </g>
            
            {/* Document/Form Icon */}
            <g transform="translate(180, 250)">
              <rect x="0" y="0" width="50" height="60" rx="4" fill="url(#signupGrad1)" opacity="0.8" />
              <line x1="10" y1="15" x2="40" y2="15" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
              <line x1="10" y1="25" x2="35" y2="25" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
              <line x1="10" y1="35" x2="30" y2="35" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
              {/* 3D Effect */}
              <polygon points="50,0 60,10 60,70 50,60" fill="url(#signupGrad1)" opacity="0.5" />
            </g>
            
            {/* Floating Particles */}
            <circle cx="100" cy="150" r="5" fill="#00d4ff" opacity="0.4">
              <animate attributeName="cy" values="150;140;150" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="300" cy="180" r="4" fill="#ff1493" opacity="0.4">
              <animate attributeName="cy" values="180;170;180" dur="2.5s" repeatCount="indefinite" />
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
                  <linearGradient id="signupGradMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#9333ea" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                <circle cx="96" cy="60" r="30" fill="url(#signupGradMobile)" opacity="0.8" />
                <path d="M 60 100 Q 60 130 96 130 Q 132 130 132 100 L 132 95 L 60 95 Z" 
                  fill="url(#signupGradMobile)" opacity="0.8" />
                <circle cx="140" cy="40" r="12" fill="#ff1493" opacity="0.8" />
                <line x1="134" y1="40" x2="146" y2="40" stroke="#ffffff" strokeWidth="2" />
                <line x1="140" y1="34" x2="140" y2="46" stroke="#ffffff" strokeWidth="2" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-text-primary">Create Account</CardTitle>
            <CardDescription className="text-text-muted">
              Enter your information to create a new account
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
              <Label htmlFor="name" className="text-text-secondary">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="bg-bg-card border-[rgba(255,255,255,0.1)] text-text-primary placeholder:text-text-muted focus:border-accent-red"
              />
            </div>
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
                minLength={8}
                className="bg-bg-card border-[rgba(255,255,255,0.1)] text-text-primary placeholder:text-text-muted focus:border-accent-red"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-text-secondary">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
                className="bg-bg-card border-[rgba(255,255,255,0.1)] text-text-primary placeholder:text-text-muted focus:border-accent-red"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-accent-red hover:bg-accent-red-hover text-white font-semibold rounded-full py-3 transition-all duration-300 hover:scale-105 hover:shadow-glow-red" 
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-text-muted">Already have an account? </span>
            <Link href="/auth/signin" className="text-accent-red hover:text-accent-red-hover hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

