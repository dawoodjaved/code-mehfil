"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Users, Calendar, Search, ArrowUpRight, Sparkles } from "lucide-react";
import { AppNav } from "@/components/dashboard/app-nav";
import { DashboardStats } from "@/components/dashboard/stat-charts";
import { RequireAuth } from "@/components/auth/require-auth";

interface Session {
  id: string;
  title: string;
  session_type?: string;
  type?: string;
  status: string;
  created_at: string;
  tags?: string[];
  code?: string;
  default_language?: string;
  participants?: Array<{ id: string; user?: { name?: string } }>;
  created_by?: {
    id: string;
    name: string;
    email: string;
  };
}

const TYPE_STYLE: Record<string, { chip: string; glow: string }> = {
  collaboration: { chip: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30", glow: "from-cyan-500/20" },
  interview: { chip: "bg-red-500/15 text-red-300 border-red-500/30", glow: "from-red-500/25" },
  practice: { chip: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", glow: "from-emerald-500/20" },
};

export default function SessionsPage() {
  return (
    <RequireAuth next="/sessions">
      <SessionsPageInner />
    </RequireAuth>
  );
}

function SessionsPageInner() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    void fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(Array.isArray(data) ? data : []);
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/auth/signin?next=/sessions");
      } else {
        setError("Failed to load sessions");
      }
    } catch {
      setError("Failed to load sessions — is the API running?");
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      const type = (s.session_type || s.type || "collaboration").toLowerCase();
      const matchesType = typeFilter === "all" || type === typeFilter;
      const hay = `${s.title} ${s.tags?.join(" ") || ""} ${type}`.toLowerCase();
      const matchesQuery = !query.trim() || hay.includes(query.trim().toLowerCase());
      return matchesType && matchesQuery;
    });
  }, [sessions, query, typeFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <AppNav />
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,0,51,0.2)" strokeWidth="4" />
            <circle
              cx="36"
              cy="36"
              r="28"
              fill="none"
              stroke="#ff0033"
              strokeWidth="4"
              strokeDasharray="40 140"
              strokeLinecap="round"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 36 36"
                to="360 36 36"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
          <p className="text-text-muted">Loading your mehfil…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-bg-primary overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute -top-24 right-0 h-[420px] w-[420px] rounded-full blur-[120px] opacity-40"
          style={{ background: "#ff0033" }}
        />
        <div
          className="absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full blur-[110px] opacity-30"
          style={{ background: "#00d4ff" }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" aria-hidden>
          <defs>
            <pattern id="dashGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dashGrid)" />
        </svg>
      </div>

      <AppNav />

      <main className="container relative z-10 mx-auto px-4 py-10">
        <section className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-text-muted">
              <Sparkles className="h-3.5 w-3.5 text-accent-cyan" />
              Your live coding mehfil
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-2">
              Dashboard
            </h1>
            <p className="text-text-muted text-base">
              Spin up rooms, invite peers, and jump into interviews — with a clear pulse on
              what you&apos;ve been running.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="lg"
              asChild
              className="rounded-full border-white/15 text-text-primary"
            >
              <Link href="/join">Join with code</Link>
            </Button>
            <Button
              size="lg"
              asChild
              className="rounded-full bg-accent-red hover:bg-accent-red-hover shadow-[0_0_24px_rgba(255,0,51,0.25)]"
            >
              <Link href="/session/new">
                <Plus className="w-4 h-4 mr-2" />
                New session
              </Link>
            </Button>
          </div>
        </section>

        <DashboardStats sessions={sessions} />

        <section className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            Rooms{" "}
            <span className="text-text-muted font-normal text-sm">
              ({filtered.length}
              {filtered.length !== sessions.length ? ` of ${sessions.length}` : ""})
            </span>
          </h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search rooms…"
                className="pl-9 w-[200px] bg-white/5 border-white/10"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary"
            >
              <option value="all">All types</option>
              <option value="collaboration">Collaboration</option>
              <option value="interview">Interview</option>
              <option value="practice">Practice</option>
            </select>
          </div>
        </section>

        {error ? (
          <Card className="mb-6 border-red-500/40 bg-red-500/10">
            <CardContent className="pt-6 text-red-300">{error}</CardContent>
          </Card>
        ) : null}

        {filtered.length === 0 ? (
          <div className="glass rounded-3xl border border-white/10 px-6 py-16 text-center">
            <div className="mx-auto mb-6 w-fit">
              <EmptySessionsArt />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {sessions.length === 0 ? "No rooms yet" : "No matches"}
            </h3>
            <p className="text-text-muted mb-6 max-w-md mx-auto">
              {sessions.length === 0
                ? "Create your first CodeMehfil room and invite someone to pair, interview, or practice."
                : "Try another search or clear the type filter."}
            </p>
            {sessions.length === 0 ? (
              <Button asChild className="rounded-full bg-accent-red hover:bg-accent-red-hover">
                <Link href="/session/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create session
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                className="rounded-full border-white/15"
                onClick={() => {
                  setQuery("");
                  setTypeFilter("all");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((session) => {
              const type = (session.session_type || session.type || "collaboration").toLowerCase();
              const style = TYPE_STYLE[type] || TYPE_STYLE.collaboration;
              const people = session.participants?.length ?? 0;
              return (
                <button
                  key={session.id}
                  type="button"
                  disabled={!!navigatingTo}
                  onClick={() => {
                    if (navigatingTo) return;
                    setNavigatingTo(session.id);
                    router.push(`/session/${session.id}`);
                    // Failsafe if navigation stalls
                    window.setTimeout(() => setNavigatingTo(null), 8000);
                  }}
                  className={`group text-left glass rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-red ${
                    navigatingTo === session.id ? "opacity-70" : ""
                  }`}
                >
                  <div className={`relative h-28 bg-gradient-to-br ${style.glow} to-transparent`}>
                    <SessionCardArt type={type} />
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${style.chip}`}
                      >
                        {type}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-black/40 text-text-muted border border-white/10">
                        {session.status || "draft"}
                      </span>
                    </div>
                    {navigatingTo === session.id ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-accent-red" />
                      </div>
                    ) : null}
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-text-primary line-clamp-2 group-hover:text-white">
                        {session.title || "Untitled session"}
                      </h3>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(session.created_at).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {people} participant{people === 1 ? "" : "s"}
                      </span>
                      {session.default_language ? (
                        <span className="uppercase tracking-wide">{session.default_language}</span>
                      ) : null}
                    </div>
                    {session.code ? (
                      <div className="font-mono text-xs text-accent-cyan/90 tracking-widest">
                        {session.code}
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function SessionCardArt({ type }: { type: string }) {
  const stroke =
    type === "interview" ? "#ff0033" : type === "practice" ? "#00ff88" : "#00d4ff";
  return (
    <svg className="absolute right-2 bottom-0 w-36 h-24 opacity-80" viewBox="0 0 160 100" aria-hidden>
      <rect x="20" y="20" width="90" height="60" rx="6" fill={stroke} opacity="0.15" />
      <rect x="28" y="32" width="50" height="4" rx="2" fill={stroke} opacity="0.9" />
      <rect x="28" y="42" width="38" height="4" rx="2" fill={stroke} opacity="0.55" />
      <rect x="28" y="52" width="44" height="4" rx="2" fill={stroke} opacity="0.7" />
      <circle cx="118" cy="40" r="16" fill={stroke} opacity="0.25">
        <animate attributeName="r" values="14;18;14" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <path
        d="M108 40h20M118 30v20"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

function EmptySessionsArt() {
  return (
    <svg width="220" height="160" viewBox="0 0 220 160" className="opacity-90">
      <defs>
        <linearGradient id="emptyCm" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff0033" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <rect x="40" y="35" width="140" height="90" rx="14" fill="url(#emptyCm)" />
      <rect x="58" y="55" width="70" height="8" rx="4" fill="#fff" opacity="0.75" />
      <rect x="58" y="72" width="95" height="8" rx="4" fill="#fff" opacity="0.4" />
      <rect x="58" y="89" width="55" height="8" rx="4" fill="#fff" opacity="0.55" />
      <circle cx="170" cy="40" r="22" fill="#ff0033" opacity="0.85">
        <animate attributeName="cy" values="40;34;40" dur="2s" repeatCount="indefinite" />
      </circle>
      <path d="M170 32v16M162 40h16" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
