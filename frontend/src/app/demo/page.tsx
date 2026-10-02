"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Video, Users, Zap, Shield, Brain } from "lucide-react";
import { BlurOrbs } from "@/components/vr-landing/blur-orbs";

export default function DemoPage() {
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
            <svg width="400" height="300" viewBox="0 0 400 300" className="w-full max-w-md h-auto opacity-90 hover:opacity-100 transition-opacity duration-300">
              <defs>
                <linearGradient id="demoHeroGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff1493" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#9333ea" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="demoHeroGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#9333ea" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              
              {/* 3D Terminal/Code Window */}
              <g transform="translate(50, 50)">
                {/* Window Frame */}
                <rect x="0" y="0" width="300" height="200" rx="8" fill="url(#demoHeroGrad1)" opacity="0.8" />
                <rect x="10" y="10" width="280" height="30" rx="4" fill="#000000" opacity="0.6" />
                
                {/* Window Controls */}
                <circle cx="25" cy="25" r="6" fill="#ff0000" opacity="0.8" />
                <circle cx="45" cy="25" r="6" fill="#ff6b35" opacity="0.8" />
                <circle cx="65" cy="25" r="6" fill="#00ff88" opacity="0.8" />
                
                {/* Code Lines */}
                <rect x="20" y="55" width="120" height="8" rx="2" fill="#ffffff" opacity="0.9" />
                <rect x="20" y="75" width="100" height="8" rx="2" fill="#ffffff" opacity="0.7" />
                <rect x="20" y="95" width="140" height="8" rx="2" fill="#ffffff" opacity="0.9" />
                <rect x="20" y="115" width="90" height="8" rx="2" fill="#ffffff" opacity="0.6" />
                <rect x="20" y="135" width="110" height="8" rx="2" fill="#ffffff" opacity="0.8" />
                
                {/* Cursor */}
                <rect x="130" y="55" width="3" height="8" fill="#00d4ff" opacity="1">
                  <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
                </rect>
                
                {/* 3D Effect */}
                <polygon points="300,0 320,20 320,220 300,200" fill="url(#demoHeroGrad1)" opacity="0.6" />
                <polygon points="0,200 20,220 320,220 300,200" fill="url(#demoHeroGrad1)" opacity="0.4" />
              </g>
              
              {/* Floating Code Elements */}
              <g transform="translate(280, 100)">
                <rect x="0" y="0" width="40" height="30" rx="4" fill="url(#demoHeroGrad2)" opacity="0.6">
                  <animate attributeName="y" values="0;10;0" dur="3s" repeatCount="indefinite" />
                </rect>
                <rect x="5" y="8" width="25" height="3" rx="1" fill="#ffffff" opacity="0.8" />
                <rect x="5" y="15" width="20" height="3" rx="1" fill="#ffffff" opacity="0.6" />
              </g>
            </svg>
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight text-text-primary">
            CodeMehfil <span className="text-accent-red">Demo</span>
          </h1>
          <p className="text-xl text-text-muted max-w-2xl mx-auto">
            Experience the future of real-time coding collaboration
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="glass border-[rgba(255,255,255,0.1)] transition-all duration-400 hover:-translate-y-1 hover:border-[rgba(255,255,255,0.2)] overflow-hidden">
            <div className="p-4 flex justify-center bg-gradient-to-br from-accent-red/10 to-accent-purple/10">
              <svg width="128" height="128" viewBox="0 0 128 128" className="opacity-90">
                <defs>
                  <linearGradient id="monacoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff1493" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#9333ea" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                <rect x="20" y="20" width="88" height="88" rx="6" fill="url(#monacoGrad)" opacity="0.8" />
                <rect x="30" y="35" width="50" height="5" rx="2" fill="#ffffff" opacity="0.9" />
                <rect x="30" y="50" width="40" height="5" rx="2" fill="#ffffff" opacity="0.7" />
                <rect x="30" y="65" width="55" height="5" rx="2" fill="#ffffff" opacity="0.9" />
                <polygon points="108,20 120,32 120,108 108,88" fill="url(#monacoGrad)" opacity="0.5" />
              </svg>
            </div>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-5 w-5 text-accent-red" />
                <CardTitle className="text-text-primary">Monaco Editor</CardTitle>
              </div>
              <CardDescription className="text-text-muted">
                Full-featured code editor with 80+ languages, syntax highlighting, and IntelliSense
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-text-muted">
                <li>• Multi-cursor editing</li>
                <li>• Real-time collaboration</li>
                <li>• Vim/Emacs keybindings</li>
                <li>• Custom themes</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass border-[rgba(255,255,255,0.1)] transition-all duration-400 hover:-translate-y-1 hover:border-[rgba(255,255,255,0.2)] overflow-hidden">
            <div className="p-4 flex justify-center bg-gradient-to-br from-accent-cyan/10 to-accent-blue/10">
              <svg width="128" height="128" viewBox="0 0 128 128" className="opacity-90">
                <defs>
                  <linearGradient id="videoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#9333ea" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                <rect x="20" y="25" width="88" height="66" rx="6" fill="url(#videoGrad)" opacity="0.8" />
                <circle cx="64" cy="58" r="15" fill="#ffffff" opacity="0.3" />
                <polygon points="58,52 58,64 68,58" fill="#ffffff" opacity="0.8" />
                <circle cx="30" cy="30" r="8" fill="#00d4ff" opacity="0.6">
                  <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite" />
                </circle>
                <polygon points="108,25 120,37 120,91 108,79" fill="url(#videoGrad)" opacity="0.5" />
              </svg>
            </div>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Video className="h-5 w-5 text-accent-cyan" />
                <CardTitle className="text-text-primary">Live Video/Audio</CardTitle>
              </div>
              <CardDescription className="text-text-muted">
                Local camera/mic preview in-session; LiveKit when your server is configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-text-muted">
                <li>• Camera and mic controls</li>
                <li>• LiveKit token API</li>
                <li>• Session-scoped rooms</li>
                <li>• Graceful offline fallback</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass border-[rgba(255,255,255,0.1)] transition-all duration-400 hover:-translate-y-1 hover:border-[rgba(255,255,255,0.2)] overflow-hidden">
            <div className="p-4 flex justify-center bg-gradient-to-br from-accent-green/10 to-accent-cyan/10">
              <svg width="128" height="128" viewBox="0 0 128 128" className="opacity-90">
                <defs>
                  <linearGradient id="teamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00ff88" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                <circle cx="40" cy="50" r="18" fill="url(#teamGrad)" opacity="0.8">
                  <animate attributeName="r" values="18;20;18" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="88" cy="50" r="18" fill="url(#teamGrad)" opacity="0.8">
                  <animate attributeName="r" values="18;20;18" dur="2s" begin="0.5s" repeatCount="indefinite" />
                </circle>
                <path d="M 30 70 Q 30 85 64 85 Q 98 85 98 70 L 98 68 L 30 68 Z" fill="url(#teamGrad)" opacity="0.8" />
                <line x1="58" y1="50" x2="70" y2="50" stroke="#00d4ff" strokeWidth="2" opacity="0.6" />
              </svg>
            </div>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-accent-green" />
                <CardTitle className="text-text-primary">Real-Time Collaboration</CardTitle>
              </div>
              <CardDescription className="text-text-muted">
                See cursors, selections, and edits live over ActionCable
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-text-muted">
                <li>• Multi-cursor awareness</li>
                <li>• Live typing indicators</li>
                <li>• Presence indicators</li>
                <li>• Session-scoped sync</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass border-[rgba(255,255,255,0.1)] transition-all duration-400 hover:-translate-y-1 hover:border-[rgba(255,255,255,0.2)] overflow-hidden">
            <div className="p-4 flex justify-center bg-gradient-to-br from-accent-orange/10 to-accent-red/10">
              <svg width="128" height="128" viewBox="0 0 128 128" className="opacity-90">
                <defs>
                  <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#ff1493" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                {/* 3D Rocket */}
                <g transform="translate(40, 30)">
                  <ellipse cx="24" cy="50" rx="20" ry="8" fill="url(#rocketGrad)" opacity="0.8" />
                  <path d="M 24 10 L 10 50 L 24 50 Z" fill="url(#rocketGrad)" opacity="0.8" />
                  <path d="M 24 10 L 38 50 L 24 50 Z" fill="url(#rocketGrad)" opacity="0.6" />
                  <circle cx="24" cy="30" r="8" fill="#ffffff" opacity="0.9" />
                  {/* Flame */}
                  <ellipse cx="24" cy="58" rx="12" ry="15" fill="#ff6b35" opacity="0.6">
                    <animate attributeName="ry" values="15;20;15" dur="1s" repeatCount="indefinite" />
                  </ellipse>
                </g>
              </svg>
            </div>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-accent-orange" />
                <CardTitle className="text-text-primary">Code Execution</CardTitle>
              </div>
              <CardDescription className="text-text-muted">
                Run code in isolated Docker containers with 40+ languages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-text-muted">
                <li>• Python, JavaScript, Go, Rust</li>
                <li>• Sandboxed execution</li>
                <li>• Time/memory limits</li>
                <li>• Auto-grading</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass border-[rgba(255,255,255,0.1)] transition-all duration-400 hover:-translate-y-1 hover:border-[rgba(255,255,255,0.2)] overflow-hidden">
            <div className="p-4 flex justify-center bg-gradient-to-br from-accent-red/10 to-accent-pink/10">
              <svg width="128" height="128" viewBox="0 0 128 128" className="opacity-90">
                <defs>
                  <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff1493" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#ff0000" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                <g transform="translate(40, 30)">
                  <path d="M 24 10 L 10 20 L 10 40 Q 10 50 24 60 Q 38 50 38 40 L 38 20 Z" 
                    fill="url(#shieldGrad)" opacity="0.8" />
                  <path d="M 24 10 L 10 20 L 10 40 Q 10 50 24 60 Q 38 50 38 40 L 38 20 Z" 
                    fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.5" />
                  <circle cx="24" cy="35" r="8" fill="#ffffff" opacity="0.9" />
                  <path d="M 20 35 L 22 37 L 28 31" stroke="#ff0000" strokeWidth="2" fill="none" />
                </g>
              </svg>
            </div>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-accent-red" />
                <CardTitle className="text-text-primary">Interview Mode</CardTitle>
              </div>
              <CardDescription className="text-text-muted">
                Professional interview platform with anti-cheating and scoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-text-muted">
                <li>• 200+ LeetCode questions</li>
                <li>• Automated scoring</li>
                <li>• Anti-cheat detection</li>
                <li>• PDF reports</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass border-[rgba(255,255,255,0.1)] transition-all duration-400 hover:-translate-y-1 hover:border-[rgba(255,255,255,0.2)] overflow-hidden">
            <div className="p-4 flex justify-center bg-gradient-to-br from-accent-purple/10 to-accent-pink/10">
              <svg width="128" height="128" viewBox="0 0 128 128" className="opacity-90">
                <defs>
                  <linearGradient id="aiBrainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9333ea" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#ff1493" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                <g transform="translate(30, 25)">
                  <ellipse cx="34" cy="30" rx="25" ry="20" fill="url(#aiBrainGrad)" opacity="0.8" />
                  <ellipse cx="28" cy="25" rx="8" ry="6" fill="#ffffff" opacity="0.6" />
                  <ellipse cx="40" cy="25" rx="8" ry="6" fill="#ffffff" opacity="0.6" />
                  <circle cx="30" cy="35" r="3" fill="#00d4ff" opacity="0.8">
                    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="38" cy="35" r="3" fill="#00d4ff" opacity="0.8">
                    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" begin="0.5s" repeatCount="indefinite" />
                  </circle>
                  <line x1="20" y1="20" x2="30" y2="30" stroke="#00d4ff" strokeWidth="1" opacity="0.4" />
                  <line x1="48" y1="20" x2="38" y2="30" stroke="#00d4ff" strokeWidth="1" opacity="0.4" />
                </g>
              </svg>
            </div>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-accent-purple" />
                <CardTitle className="text-text-primary">AI Interviewer</CardTitle>
              </div>
              <CardDescription className="text-text-muted">
                Fully autonomous AI interviewer powered by Claude/GPT
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-text-muted">
                <li>• Follow-up questions</li>
                <li>• Real-time analysis</li>
                <li>• Automated scoring</li>
                <li>• Transcript generation</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <svg width="192" height="192" viewBox="0 0 192 192" className="opacity-80">
              <defs>
                <linearGradient id="startupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff1493" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              {/* 3D Rocket Launch */}
              <g transform="translate(60, 40)">
                <ellipse cx="36" cy="100" rx="30" ry="10" fill="url(#startupGrad)" opacity="0.8" />
                <path d="M 36 20 L 15 100 L 36 100 Z" fill="url(#startupGrad)" opacity="0.8" />
                <path d="M 36 20 L 57 100 L 36 100 Z" fill="url(#startupGrad)" opacity="0.6" />
                <circle cx="36" cy="50" r="12" fill="#ffffff" opacity="0.9" />
                <ellipse cx="36" cy="110" rx="18" ry="20" fill="#ff6b35" opacity="0.6">
                  <animate attributeName="ry" values="20;25;20" dur="1s" repeatCount="indefinite" />
                </ellipse>
              </g>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-text-primary">Ready to get started?</h2>
          <p className="text-text-muted">
            Create an account and start coding collaboratively in seconds
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              asChild 
              size="lg"
              className="bg-accent-red hover:bg-accent-red-hover text-white rounded-full px-8 py-3 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-glow-red"
            >
              <Link href="/auth/signup">Sign Up Free</Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="border-[rgba(255,255,255,0.2)] text-text-primary hover:bg-[rgba(255,255,255,0.1)] rounded-full px-8 py-3"
            >
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

