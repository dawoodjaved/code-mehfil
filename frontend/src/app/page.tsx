"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BlurOrbs } from "@/components/vr-landing/blur-orbs";

export default function HomePage() {
  const router = useRouter();
  // Default signed-out so SSR/crawlers get full marketing HTML (not a Loading… shell)
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const response = await fetch(`${apiUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        }
      } catch {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    router.refresh();
  };

  return (
    <div className="relative min-h-screen bg-bg-primary overflow-hidden">
      {/* Background Blur Orbs */}
      <BlurOrbs />
      
      {/* Optional Grid Pattern */}
      <div 
        className="fixed inset-0 opacity-[0.02] pointer-events-none z-background"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      />

      <div className="container mx-auto px-4 py-16 relative z-cards">
        <div className="text-center space-y-6 mb-16">
          {/* Hero Illustration - 3D Vector */}
          <div className="flex justify-center mb-8">
            <svg 
              width="400" 
              height="300" 
              viewBox="0 0 400 300" 
              className="w-full max-w-md h-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
            >
              <defs>
                <linearGradient id="heroGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff1493" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#9333ea" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="heroGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#9333ea" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              
              {/* 3D Code Blocks */}
              <g transform="translate(50, 50)">
                {/* Code Block 1 */}
                <rect x="0" y="0" width="120" height="80" rx="8" fill="url(#heroGrad1)" opacity="0.8" />
                <rect x="10" y="15" width="60" height="8" rx="4" fill="#ffffff" opacity="0.9" />
                <rect x="10" y="30" width="80" height="8" rx="4" fill="#ffffff" opacity="0.7" />
                <rect x="10" y="45" width="50" height="8" rx="4" fill="#ffffff" opacity="0.9" />
                <rect x="10" y="60" width="70" height="8" rx="4" fill="#ffffff" opacity="0.6" />
                
                {/* 3D Effect */}
                <polygon points="120,0 140,20 140,100 120,80" fill="url(#heroGrad1)" opacity="0.6" />
                <polygon points="0,80 20,100 140,100 120,80" fill="url(#heroGrad1)" opacity="0.4" />
              </g>
              
              {/* Code Block 2 */}
              <g transform="translate(200, 100)">
                <rect x="0" y="0" width="120" height="80" rx="8" fill="url(#heroGrad2)" opacity="0.8" />
                <rect x="10" y="15" width="70" height="8" rx="4" fill="#ffffff" opacity="0.9" />
                <rect x="10" y="30" width="55" height="8" rx="4" fill="#ffffff" opacity="0.7" />
                <rect x="10" y="45" width="65" height="8" rx="4" fill="#ffffff" opacity="0.9" />
                <rect x="10" y="60" width="45" height="8" rx="4" fill="#ffffff" opacity="0.6" />
                
                {/* 3D Effect */}
                <polygon points="120,0 140,20 140,100 120,80" fill="url(#heroGrad2)" opacity="0.6" />
                <polygon points="0,80 20,100 140,100 120,80" fill="url(#heroGrad2)" opacity="0.4" />
              </g>
              
              {/* Connection Lines */}
              <line x1="170" y1="90" x2="200" y2="140" stroke="#00d4ff" strokeWidth="2" opacity="0.5" />
              <line x1="170" y1="100" x2="200" y2="150" stroke="#ff1493" strokeWidth="2" opacity="0.5" />
              
              {/* Floating Icons */}
              <circle cx="100" cy="200" r="20" fill="#ff1493" opacity="0.3">
                <animate attributeName="cy" values="200;190;200" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx="300" cy="180" r="15" fill="#00d4ff" opacity="0.3">
                <animate attributeName="cy" values="180;170;180" dur="2.5s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
          
          <div className="flex flex-col items-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="CodeMehfil"
              width={88}
              height={88}
              className="rounded-[22px] shadow-[0_0_40px_rgba(255,0,51,0.35)]"
            />
            <h1 className="text-6xl font-bold tracking-tight text-text-primary">
              CodeMehfil <span className="text-accent-red">2025</span>
            </h1>
          </div>
          <p className="text-2xl text-text-muted max-w-2xl mx-auto">
            The Definitive Real-Time Coding Collaboration & Interview Platform
          </p>
          <p className="text-lg text-text-muted/80">
            LiveShare + CoderPad + Replit + Zoom had a baby on steroids
          </p>
          <div className="flex gap-4 justify-center pt-4">
            {isAuthenticated ? (
              <>
                <Button 
                  asChild 
                  size="lg"
                  className="bg-accent-red hover:bg-accent-red-hover text-white rounded-full px-8 py-3 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-glow-red"
                >
                  <Link href="/sessions">My Sessions</Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="lg" 
                  onClick={handleLogout}
                  className="text-text-muted hover:text-text-primary hover:bg-[rgba(255,255,255,0.05)] rounded-full px-8 py-3"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  asChild 
                  size="lg"
                  className="bg-accent-red hover:bg-accent-red-hover text-white rounded-full px-8 py-3 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-glow-red"
                >
                  <Link href="/auth/signin">Get Started</Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg"
                  className="border-[rgba(255,255,255,0.2)] text-text-primary hover:bg-[rgba(255,255,255,0.1)] rounded-full px-8 py-3"
                >
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 mb-12">
          <h2 className="text-4xl font-bold text-center text-text-primary mb-4">
            Everything You Need for <span className="text-accent-red">Collaborative Coding</span>
          </h2>
          <p className="text-xl text-center text-text-muted max-w-3xl mx-auto mb-12">
            A complete platform combining the best features of LiveShare, CoderPad, Replit, and Zoom into one powerful tool
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="glass border-[rgba(255,255,255,0.1)] transition-all duration-400 hover:-translate-y-1 hover:border-[rgba(255,255,255,0.2)] overflow-hidden">
            <div className="p-4 flex justify-center">
              <svg width="128" height="128" viewBox="0 0 128 128" className="opacity-90">
                <defs>
                  <linearGradient id="collabGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="100%" stopColor="#9333ea" />
                  </linearGradient>
                </defs>
                {/* 3D Collaboration Icons */}
                <g transform="translate(20, 20)">
                  <circle cx="20" cy="20" r="15" fill="url(#collabGrad)" opacity="0.8">
                    <animate attributeName="r" values="15;18;15" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="60" cy="20" r="15" fill="url(#collabGrad)" opacity="0.8">
                    <animate attributeName="r" values="15;18;15" dur="2s" begin="0.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="88" cy="44" r="15" fill="url(#collabGrad)" opacity="0.8">
                    <animate attributeName="r" values="15;18;15" dur="2s" begin="1s" repeatCount="indefinite" />
                  </circle>
                  <line x1="35" y1="20" x2="50" y2="20" stroke="#00d4ff" strokeWidth="2" opacity="0.6" />
                  <line x1="75" y1="25" x2="78" y2="35" stroke="#9333ea" strokeWidth="2" opacity="0.6" />
                </g>
              </svg>
            </div>
            <CardHeader>
              <CardTitle className="text-text-primary">Real-Time Collaboration</CardTitle>
              <CardDescription className="text-text-muted">
                Multi-cursor editing, live video/audio, instant sync, and user presence indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-text-muted space-y-1">
                <li>• Monaco Editor (VS Code's editor)</li>
                <li>• Multi-cursor tracking</li>
                <li>• Live WebSocket synchronization</li>
                <li>• User presence indicators</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass border-[rgba(255,255,255,0.1)] transition-all duration-400 hover:-translate-y-1 hover:border-[rgba(255,255,255,0.2)] overflow-hidden">
            <div className="p-4 flex justify-center">
              <svg width="128" height="128" viewBox="0 0 128 128" className="opacity-90">
                <defs>
                  <linearGradient id="securityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff1493" />
                    <stop offset="100%" stopColor="#ff0000" />
                  </linearGradient>
                </defs>
                {/* 3D Shield */}
                <g transform="translate(40, 30)">
                  <path d="M 24 10 L 10 20 L 10 40 Q 10 50 24 60 Q 38 50 38 40 L 38 20 Z" 
                    fill="url(#securityGrad)" opacity="0.8" />
                  <path d="M 24 10 L 10 20 L 10 40 Q 10 50 24 60 Q 38 50 38 40 L 38 20 Z" 
                    fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.5" />
                  <circle cx="24" cy="35" r="8" fill="#ffffff" opacity="0.9" />
                  <path d="M 20 35 L 22 37 L 28 31" stroke="#ff0000" strokeWidth="2" fill="none" />
                </g>
              </svg>
            </div>
            <CardHeader>
              <CardTitle className="text-text-primary">Code Execution</CardTitle>
              <CardDescription className="text-text-muted">
                11+ languages with instant execution and sandboxed security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-text-muted space-y-1">
                <li>• JavaScript, Python, Java, C++, Go</li>
                <li>• Rust, TypeScript, Ruby, PHP, Swift</li>
                <li>• Real-time output & error handling</li>
                <li>• Sandboxed execution environment</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass border-[rgba(255,255,255,0.1)] transition-all duration-400 hover:-translate-y-1 hover:border-[rgba(255,255,255,0.2)] overflow-hidden">
            <div className="p-4 flex justify-center">
              <svg width="128" height="128" viewBox="0 0 128 128" className="opacity-90">
                <defs>
                  <linearGradient id="interviewGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9333ea" />
                    <stop offset="100%" stopColor="#ff1493" />
                  </linearGradient>
                </defs>
                {/* Interview Icon */}
                <g transform="translate(30, 25)">
                  <rect x="20" y="20" width="48" height="38" rx="4" fill="url(#interviewGrad)" opacity="0.8" />
                  <rect x="28" y="28" width="32" height="4" rx="2" fill="#ffffff" opacity="0.9" />
                  <rect x="28" y="36" width="24" height="4" rx="2" fill="#ffffff" opacity="0.7" />
                  <rect x="28" y="44" width="28" height="4" rx="2" fill="#ffffff" opacity="0.9" />
                  <circle cx="44" cy="52" r="6" fill="#ffffff" opacity="0.6" />
                </g>
              </svg>
            </div>
            <CardHeader>
              <CardTitle className="text-text-primary">Interview Mode</CardTitle>
              <CardDescription className="text-text-muted">
                Built-in timer, question bank, and Codeforces problem integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-text-muted space-y-1">
                <li>• Curated coding questions</li>
                <li>• Built-in countdown timer</li>
                <li>• Codeforces problem recommender</li>
                <li>• Test case validation</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass border-[rgba(255,255,255,0.1)] transition-all duration-400 hover:-translate-y-1 hover:border-[rgba(255,255,255,0.2)] overflow-hidden">
            <div className="p-4 flex justify-center">
              <svg width="128" height="128" viewBox="0 0 128 128" className="opacity-90">
                <defs>
                  <linearGradient id="videoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="100%" stopColor="#9333ea" />
                  </linearGradient>
                </defs>
                {/* Video Icon */}
                <g transform="translate(40, 30)">
                  <rect x="10" y="10" width="48" height="36" rx="4" fill="url(#videoGrad)" opacity="0.8" />
                  <polygon points="24,22 24,34 36,28" fill="#ffffff" opacity="0.9" />
                  <circle cx="20" cy="18" r="2" fill="#ff1493" opacity="0.8">
                    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                </g>
              </svg>
            </div>
            <CardHeader>
              <CardTitle className="text-text-primary">Video & Audio</CardTitle>
              <CardDescription className="text-text-muted">
                In-session camera and mic preview; LiveKit room tokens when configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-text-muted space-y-1">
                <li>• Local camera / mic controls</li>
                <li>• LiveKit token endpoint ready</li>
                <li>• Room name tied to session</li>
                <li>• Falls back gracefully without LiveKit</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass border-[rgba(255,255,255,0.1)] transition-all duration-400 hover:-translate-y-1 hover:border-[rgba(255,255,255,0.2)] overflow-hidden">
            <div className="p-4 flex justify-center">
              <svg width="128" height="128" viewBox="0 0 128 128" className="opacity-90">
                <defs>
                  <linearGradient id="whiteboardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff1493" />
                    <stop offset="100%" stopColor="#9333ea" />
                  </linearGradient>
                </defs>
                {/* Whiteboard Icon */}
                <g transform="translate(30, 25)">
                  <rect x="10" y="10" width="68" height="48" rx="4" fill="url(#whiteboardGrad)" opacity="0.8" />
                  <line x1="20" y1="25" x2="60" y2="30" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
                  <line x1="25" y1="35" x2="65" y2="40" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
                  <circle cx="30" cy="45" r="8" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
                </g>
              </svg>
            </div>
            <CardHeader>
              <CardTitle className="text-text-primary">Interactive Whiteboard</CardTitle>
              <CardDescription className="text-text-muted">
                Excalidraw whiteboard synced over ActionCable
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-text-muted space-y-1">
                <li>• Collaborative drawing sync</li>
                <li>• Export as PNG or Excalidraw</li>
                <li>• Multiple drawing tools</li>
                <li>• Live when peers are connected</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass border-[rgba(255,255,255,0.1)] transition-all duration-400 hover:-translate-y-1 hover:border-[rgba(255,255,255,0.2)] overflow-hidden">
            <div className="p-4 flex justify-center">
              <svg width="128" height="128" viewBox="0 0 128 128" className="opacity-90">
                <defs>
                  <linearGradient id="terminalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="100%" stopColor="#ff1493" />
                  </linearGradient>
                </defs>
                {/* Terminal Icon */}
                <g transform="translate(30, 25)">
                  <rect x="10" y="10" width="68" height="48" rx="4" fill="#000000" opacity="0.9" />
                  <rect x="15" y="15" width="58" height="38" rx="2" fill="url(#terminalGrad)" opacity="0.3" />
                  <text x="20" y="30" fill="#00ff00" fontSize="12" fontFamily="monospace">$</text>
                  <rect x="25" y="25" width="40" height="3" fill="#00ff00" opacity="0.8" />
                  <rect x="20" y="35" width="45" height="3" fill="#00ff00" opacity="0.6" />
                </g>
              </svg>
            </div>
            <CardHeader>
              <CardTitle className="text-text-primary">Integrated Terminal</CardTitle>
              <CardDescription className="text-text-muted">
                Built-in terminal for command execution and code management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-text-muted space-y-1">
                <li>• Command execution</li>
                <li>• Code running shortcuts</li>
                <li>• File operations</li>
                <li>• Real-time output</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass border-[rgba(255,255,255,0.1)] transition-all duration-400 hover:-translate-y-1 hover:border-[rgba(255,255,255,0.2)] overflow-hidden">
            <div className="p-4 flex justify-center">
              <svg width="128" height="128" viewBox="0 0 128 128" className="opacity-90">
                <defs>
                  <linearGradient id="fileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9333ea" />
                    <stop offset="100%" stopColor="#00d4ff" />
                  </linearGradient>
                </defs>
                {/* File Explorer Icon */}
                <g transform="translate(30, 25)">
                  <rect x="10" y="10" width="20" height="25" rx="2" fill="url(#fileGrad)" opacity="0.8" />
                  <rect x="35" y="10" width="20" height="25" rx="2" fill="url(#fileGrad)" opacity="0.6" />
                  <rect x="60" y="10" width="20" height="25" rx="2" fill="url(#fileGrad)" opacity="0.4" />
                  <rect x="10" y="40" width="20" height="18" rx="2" fill="url(#fileGrad)" opacity="0.7" />
                </g>
              </svg>
            </div>
            <CardHeader>
              <CardTitle className="text-text-primary">File Explorer</CardTitle>
              <CardDescription className="text-text-muted">
                Multi-file project management with tree structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-text-muted space-y-1">
                <li>• Create/edit/delete files</li>
                <li>• Folder organization</li>
                <li>• Language detection</li>
                <li>• Quick file switching</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass border-[rgba(255,255,255,0.1)] transition-all duration-400 hover:-translate-y-1 hover:border-[rgba(255,255,255,0.2)] overflow-hidden">
            <div className="p-4 flex justify-center">
              <svg width="128" height="128" viewBox="0 0 128 128" className="opacity-90">
                <defs>
                  <linearGradient id="chatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="100%" stopColor="#ff1493" />
                  </linearGradient>
                </defs>
                {/* Chat Icon */}
                <g transform="translate(30, 25)">
                  <rect x="10" y="10" width="68" height="48" rx="8" fill="url(#chatGrad)" opacity="0.8" />
                  <circle cx="25" cy="25" r="6" fill="#ffffff" opacity="0.9" />
                  <circle cx="45" cy="25" r="6" fill="#ffffff" opacity="0.9" />
                  <circle cx="65" cy="25" r="6" fill="#ffffff" opacity="0.9" />
                  <rect x="15" y="35" width="50" height="4" rx="2" fill="#ffffff" opacity="0.7" />
                  <rect x="15" y="43" width="40" height="4" rx="2" fill="#ffffff" opacity="0.7" />
                </g>
              </svg>
            </div>
            <CardHeader>
              <CardTitle className="text-text-primary">Live Chat</CardTitle>
              <CardDescription className="text-text-muted">
                Real-time messaging with typing indicators and @mentions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-text-muted space-y-1">
                <li>• Instant messaging</li>
                <li>• Typing indicators</li>
                <li>• Message history</li>
                <li>• @user mentions</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass border-[rgba(255,255,255,0.1)] transition-all duration-400 hover:-translate-y-1 hover:border-[rgba(255,255,255,0.2)] overflow-hidden">
            <div className="p-4 flex justify-center">
              <svg width="128" height="128" viewBox="0 0 128 128" className="opacity-90">
                <defs>
                  <linearGradient id="sessionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff1493" />
                    <stop offset="100%" stopColor="#9333ea" />
                  </linearGradient>
                </defs>
                {/* Session Management Icon */}
                <g transform="translate(30, 25)">
                  <rect x="10" y="10" width="68" height="20" rx="4" fill="url(#sessionGrad)" opacity="0.8" />
                  <rect x="10" y="35" width="68" height="20" rx="4" fill="url(#sessionGrad)" opacity="0.6" />
                  <circle cx="20" cy="20" r="3" fill="#ffffff" opacity="0.9" />
                  <circle cx="20" cy="45" r="3" fill="#ffffff" opacity="0.9" />
                  <rect x="28" y="17" width="45" height="6" rx="2" fill="#ffffff" opacity="0.7" />
                  <rect x="28" y="42" width="45" height="6" rx="2" fill="#ffffff" opacity="0.7" />
                </g>
              </svg>
            </div>
            <CardHeader>
              <CardTitle className="text-text-primary">Session Management</CardTitle>
              <CardDescription className="text-text-muted">
                Create, share, and manage coding sessions effortlessly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-text-muted space-y-1">
                <li>• Shareable session links</li>
                <li>• Session history</li>
                <li>• Participant management</li>
                <li>• Session codes for quick join</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
