"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Code, Users, Clock, Tag } from "lucide-react";
import { BlurOrbs } from "@/components/vr-landing/blur-orbs";
import { SUPPORTED_LANGUAGES } from "@/lib/languages";
import { AppNav } from "@/components/dashboard/app-nav";
import { RequireAuth } from "@/components/auth/require-auth";

export default function NewSessionPage() {
  return (
    <RequireAuth next="/session/new">
      <NewSessionForm />
    </RequireAuth>
  );
}

function NewSessionForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    session_type: "collaboration",
    time_limit_minutes: "",
    language: "javascript",
    tags: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/auth/signin?next=/session/new");
        return;
      }

      const tagsArray = formData.tags
        ? formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [];

      // Trim all string inputs to remove leading/trailing spaces
      const trimmedTitle = formData.title?.trim() || "";
      const trimmedDescription = formData.description?.trim() || "";

      const response = await fetch(`${apiUrl}/api/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          session: {
            title: trimmedTitle || "Untitled Session",
            description: trimmedDescription,
            session_type: formData.session_type,
            time_limit_minutes: formData.time_limit_minutes
              ? parseInt(formData.time_limit_minutes.trim())
              : null,
            tags: tagsArray,
            default_language: formData.language,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/session/${data.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.errors?.join(", ") || "Failed to create session");
      }
    } catch (err) {
      console.error("Error creating session:", err);
      setError("Failed to create session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="relative min-h-screen bg-bg-primary overflow-hidden">
      <BlurOrbs />
      <AppNav />

      <div 
        className="fixed inset-0 opacity-[0.02] pointer-events-none z-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      />

      <div className="container mx-auto max-w-4xl py-8 px-4 relative z-cards">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Illustration Side - 3D Vector */}
          <div className="hidden md:flex flex-1 justify-center items-center sticky top-8">
            <svg width="400" height="400" viewBox="0 0 400 400" className="w-full max-w-md h-auto opacity-90">
              <defs>
                <linearGradient id="newSessionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ff1493" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              
              {/* 3D Rocket */}
              <g transform="translate(150, 100)">
                <ellipse cx="50" cy="200" rx="40" ry="15" fill="url(#newSessionGrad)" opacity="0.8" />
                <path d="M 50 20 L 20 200 L 50 200 Z" fill="url(#newSessionGrad)" opacity="0.8" />
                <path d="M 50 20 L 80 200 L 50 200 Z" fill="url(#newSessionGrad)" opacity="0.6" />
                <circle cx="50" cy="100" r="20" fill="#ffffff" opacity="0.9" />
                <ellipse cx="50" cy="215" rx="25" ry="30" fill="#ff6b35" opacity="0.6">
                  <animate attributeName="ry" values="30;35;30" dur="1s" repeatCount="indefinite" />
                </ellipse>
                
                {/* 3D Effect */}
                <polygon points="80,200 100,220 100,230 80,215" fill="url(#newSessionGrad)" opacity="0.4" />
              </g>
              
              {/* Floating Code Elements */}
              <g transform="translate(80, 50)">
                <rect x="0" y="0" width="60" height="40" rx="4" fill="url(#newSessionGrad)" opacity="0.5">
                  <animate attributeName="y" values="0;10;0" dur="3s" repeatCount="indefinite" />
                </rect>
                <rect x="8" y="10" width="35" height="4" rx="2" fill="#ffffff" opacity="0.8" />
                <rect x="8" y="20" width="28" height="4" rx="2" fill="#ffffff" opacity="0.6" />
              </g>
            </svg>
          </div>

          <Card className="w-full md:flex-1 glass" style={{
            borderColor: "rgba(255, 255, 255, 0.1)",
          }}>
            <CardHeader>
              <div className="flex justify-center mb-4 md:hidden">
                <svg width="192" height="192" viewBox="0 0 192 192" className="opacity-90">
                  <defs>
                    <linearGradient id="newSessionMobileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#ff1493" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                  <g transform="translate(60, 40)">
                    <ellipse cx="36" cy="100" rx="30" ry="12" fill="url(#newSessionMobileGrad)" opacity="0.8" />
                    <path d="M 36 20 L 15 100 L 36 100 Z" fill="url(#newSessionMobileGrad)" opacity="0.8" />
                    <path d="M 36 20 L 57 100 L 36 100 Z" fill="url(#newSessionMobileGrad)" opacity="0.6" />
                    <circle cx="36" cy="50" r="12" fill="#ffffff" opacity="0.9" />
                    <ellipse cx="36" cy="112" rx="20" ry="25" fill="#ff6b35" opacity="0.6">
                      <animate attributeName="ry" values="25;30;25" dur="1s" repeatCount="indefinite" />
                    </ellipse>
                  </g>
                </svg>
              </div>
              <CardTitle className="text-2xl text-text-primary">Create New Session</CardTitle>
              <CardDescription className="text-text-muted">
                Start a new coding session for collaboration or interviews
              </CardDescription>
            </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <Label htmlFor="title" className="text-text-secondary">
                  Session Title <span className="text-status-red">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="My Coding Session"
                  required
                  className="bg-bg-card border-[rgba(255,255,255,0.1)] text-text-primary placeholder:text-text-muted focus:border-accent-red"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-text-secondary">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What will you be working on?"
                  rows={3}
                  className="bg-bg-card border-[rgba(255,255,255,0.1)] text-text-primary placeholder:text-text-muted focus:border-accent-red"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session_type" className="text-text-secondary">
                  <Code className="w-4 h-4 inline mr-2" />
                  Session Type
                </Label>
                <select
                  id="session_type"
                  name="session_type"
                  value={formData.session_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-bg-card border-[rgba(255,255,255,0.1)] rounded-md text-text-primary focus:border-accent-red focus:outline-none"
                >
                  <option value="collaboration">Collaboration</option>
                  <option value="interview">Interview</option>
                  <option value="practice">Practice</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time_limit_minutes" className="text-text-secondary">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Time Limit (minutes)
                  </Label>
                  <Input
                    id="time_limit_minutes"
                    name="time_limit_minutes"
                    type="number"
                    value={formData.time_limit_minutes}
                    onChange={handleChange}
                    placeholder="Optional"
                    min="1"
                    className="bg-bg-card border-[rgba(255,255,255,0.1)] text-text-primary placeholder:text-text-muted focus:border-accent-red"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="text-text-secondary">
                    <Code className="w-4 h-4 inline mr-2" />
                    Default Language
                  </Label>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-bg-card border-[rgba(255,255,255,0.1)] rounded-md text-text-primary focus:border-accent-red focus:outline-none"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-text-secondary">
                  <Tag className="w-4 h-4 inline mr-2" />
                  Tags (comma-separated)
                </Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="algorithm, data-structures, interview"
                  className="bg-bg-card border-[rgba(255,255,255,0.1)] text-text-primary placeholder:text-text-muted focus:border-accent-red"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="border-[rgba(255,255,255,0.2)] text-text-primary hover:bg-[rgba(255,255,255,0.1)] rounded-full px-6 py-2"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-accent-red hover:bg-accent-red-hover text-white font-semibold rounded-full px-6 py-2 transition-all duration-300 hover:scale-105 hover:shadow-glow-red"
                >
                  {isLoading ? "Creating..." : "Create Session"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
