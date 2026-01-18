"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Code, Users, Calendar } from "lucide-react";
import { BlurOrbs } from "@/components/vr-landing/blur-orbs";

interface Session {
  id: string;
  title: string;
  session_type?: string;
  type?: string;
  status: string;
  created_at: string;
  tags?: string[];
  created_by?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Sessions page - Token check:", token ? "Token exists" : "No token");
    
    if (!token) {
      console.log("No token, redirecting to signin");
      router.push("/auth/signin");
      return;
    }

    fetchSessions();
  }, [router]);

  const fetchSessions = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = localStorage.getItem("token");
      
      console.log("Fetching sessions with token:", token ? token.substring(0, 20) + "..." : "No token");
      
      const response = await fetch(`${apiUrl}/api/sessions`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Sessions response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Sessions data:", data);
        setSessions(Array.isArray(data) ? data : []);
      } else if (response.status === 401) {
        console.log("Unauthorized, removing token and redirecting");
        localStorage.removeItem("token");
        router.push("/auth/signin");
      } else {
        const errorText = await response.text();
        console.error("Failed to load sessions:", response.status, errorText);
        setError("Failed to load sessions");
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError("Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSession = () => {
    router.push("/session/new");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary relative overflow-hidden">
        <BlurOrbs />
        <div className="relative z-cards flex flex-col items-center gap-6">
          <svg width="128" height="128" viewBox="0 0 128 128" className="opacity-80">
            <defs>
              <linearGradient id="loadingSessionsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff1493" />
                <stop offset="50%" stopColor="#00d4ff" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>
            </defs>
            
            {/* Animated Loading Spinner */}
            <circle cx="64" cy="64" r="40" fill="none" stroke="url(#loadingSessionsGrad)" strokeWidth="4" opacity="0.3" />
            <circle 
              cx="64" 
              cy="64" 
              r="40" 
              fill="none" 
              stroke="url(#loadingSessionsGrad)" 
              strokeWidth="4" 
              strokeDasharray="125"
              strokeDashoffset="125"
              opacity="0.8"
            >
              <animate 
                attributeName="stroke-dashoffset" 
                values="125;0;125" 
                dur="2s" 
                repeatCount="indefinite" 
              />
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 64 64;360 64 64"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            
            {/* Center Dot */}
            <circle cx="64" cy="64" r="8" fill="url(#loadingSessionsGrad)" opacity="0.8">
              <animate attributeName="r" values="8;12;8" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </svg>
          <div className="text-text-muted text-lg">Loading sessions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-bg-primary overflow-hidden">
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

      <div className="container mx-auto px-4 py-16 relative z-cards">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-text-primary">My Sessions</h1>
            <p className="text-text-muted">Manage your coding sessions</p>
          </div>
          <Button 
            onClick={handleCreateSession} 
            size="lg" 
            asChild
            className="bg-accent-red hover:bg-accent-red-hover text-white rounded-full px-8 py-3 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-glow-red"
          >
            <Link href="/session/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Session
            </Link>
          </Button>
        </div>

        {error && (
          <Card className="mb-6 glass" style={{
            borderColor: "rgba(255, 0, 51, 0.5)",
          }}>
            <CardContent className="pt-6">
              <p className="text-status-red">{error}</p>
            </CardContent>
          </Card>
        )}

        {sessions.length === 0 ? (
          <Card className="glass" style={{
            borderColor: "rgba(255, 255, 255, 0.1)",
          }}>
            <CardContent className="pt-6 text-center py-12">
              <div className="flex justify-center mb-6">
                <svg width="256" height="256" viewBox="0 0 256 256" className="opacity-80">
                  <defs>
                    <linearGradient id="emptyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9333ea" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#ff1493" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  
                  {/* 3D Empty Box */}
                  <g transform="translate(80, 60)">
                    {/* Front Face */}
                    <rect x="0" y="0" width="96" height="96" rx="8" fill="url(#emptyGrad)" opacity="0.6" />
                    {/* Top Face */}
                    <polygon points="0,0 20,-20 116,-20 96,0" fill="url(#emptyGrad)" opacity="0.4" />
                    {/* Right Face */}
                    <polygon points="96,0 116,-20 116,76 96,96" fill="url(#emptyGrad)" opacity="0.5" />
                    
                    {/* Opening */}
                    <rect x="20" y="20" width="56" height="56" rx="4" fill="#000000" opacity="0.3" />
                    
                    {/* Plus Icon */}
                    <g transform="translate(48, 48)">
                      <circle cx="0" cy="0" r="20" fill="#ff1493" opacity="0.6" />
                      <line x1="-10" y1="0" x2="10" y2="0" stroke="#ffffff" strokeWidth="3" />
                      <line x1="0" y1="-10" x2="0" y2="10" stroke="#ffffff" strokeWidth="3" />
                    </g>
                  </g>
                  
                  {/* Floating Particles */}
                  <circle cx="50" cy="200" r="4" fill="#00d4ff" opacity="0.3">
                    <animate attributeName="cy" values="200;190;200" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="200" cy="220" r="3" fill="#ff1493" opacity="0.3">
                    <animate attributeName="cy" values="220;210;220" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-text-primary">No sessions yet</h3>
              <p className="text-text-muted mb-4">
                Create your first coding session to get started
              </p>
              <Button 
                onClick={handleCreateSession} 
                asChild
                className="bg-accent-red hover:bg-accent-red-hover text-white rounded-full px-8 py-3 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-glow-red"
              >
                <Link href="/session/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Session
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Card 
                key={session.id} 
                className={`cursor-pointer glass transition-all duration-400 hover:-translate-y-1 hover:border-accent-red/50 overflow-hidden relative ${
                  navigatingTo === session.id ? "opacity-75 pointer-events-none" : ""
                }`}
                style={{
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  if (navigatingTo) return; // Prevent multiple clicks
                  setNavigatingTo(session.id);
                  router.push(`/session/${session.id}`);
                }}
              >
                {navigatingTo === session.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-red mx-auto mb-2"></div>
                      <p className="text-sm text-text-primary">Loading session...</p>
                    </div>
                  </div>
                )}
                <div>
                  <div className="p-4 flex justify-center bg-gradient-to-br from-accent-red/10 to-accent-purple/10">
                    <svg width="96" height="96" viewBox="0 0 96 96" className="opacity-70">
                      <defs>
                        <linearGradient id={`sessionGrad${session.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ff1493" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#9333ea" stopOpacity="0.6" />
                        </linearGradient>
                      </defs>
                      
                      {/* 3D Code Block */}
                      <g transform="translate(10, 10)">
                        <rect x="0" y="0" width="60" height="50" rx="4" fill={`url(#sessionGrad${session.id})`} opacity="0.8" />
                        <rect x="8" y="10" width="35" height="4" rx="2" fill="#ffffff" opacity="0.8" />
                        <rect x="8" y="20" width="28" height="4" rx="2" fill="#ffffff" opacity="0.6" />
                        <rect x="8" y="30" width="32" height="4" rx="2" fill="#ffffff" opacity="0.8" />
                        <rect x="8" y="40" width="25" height="4" rx="2" fill="#ffffff" opacity="0.6" />
                        
                        {/* 3D Effect */}
                        <polygon points="60,0 70,10 70,60 60,50" fill={`url(#sessionGrad${session.id})`} opacity="0.5" />
                        <polygon points="0,50 10,60 70,60 60,50" fill={`url(#sessionGrad${session.id})`} opacity="0.3" />
                      </g>
                    </svg>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-text-primary">{session.title || `Session ${session.id}`}</CardTitle>
                      <span className="text-xs text-text-muted">{session.session_type || session.type || 'collaboration'}</span>
                    </div>
                    <CardDescription className="flex items-center gap-2 mt-2 text-text-muted">
                      <Calendar className="w-3 h-3" />
                      {new Date(session.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      <Users className="w-4 h-4" />
                      <span>{session.status || "Active"}</span>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
