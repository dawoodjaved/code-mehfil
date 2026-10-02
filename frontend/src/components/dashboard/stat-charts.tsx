"use client";

import type { ReactNode } from "react";

interface SessionLike {
  id: string;
  session_type?: string;
  type?: string;
  status?: string;
  created_at: string;
  participants?: unknown[];
}

function last7DayCounts(sessions: SessionLike[]) {
  const days: { label: string; count: number; key: string }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      key,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      count: 0,
    });
  }
  sessions.forEach((s) => {
    const key = new Date(s.created_at).toISOString().slice(0, 10);
    const slot = days.find((d) => d.key === key);
    if (slot) slot.count += 1;
  });
  return days;
}

function typeBreakdown(sessions: SessionLike[]) {
  const map: Record<string, number> = {};
  sessions.forEach((s) => {
    const t = (s.session_type || s.type || "collaboration").toLowerCase();
    map[t] = (map[t] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

const TYPE_COLORS: Record<string, string> = {
  collaboration: "#00d4ff",
  interview: "#ff0033",
  practice: "#00ff88",
};

export function DashboardStats({ sessions }: { sessions: SessionLike[] }) {
  const activity = last7DayCounts(sessions);
  const types = typeBreakdown(sessions);
  const maxAct = Math.max(1, ...activity.map((d) => d.count));
  const active = sessions.filter((s) =>
    ["active", "draft", "paused"].includes(String(s.status || "").toLowerCase())
  ).length;
  const interviews = sessions.filter(
    (s) => (s.session_type || s.type) === "interview"
  ).length;
  const participants = sessions.reduce(
    (n, s) => n + (Array.isArray(s.participants) ? s.participants.length : 0),
    0
  );

  const totalTypes = types.reduce((n, t) => n + t.value, 0) || 1;
  let angle = -90;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
      <StatCard
        label="Total rooms"
        value={sessions.length}
        hint="All sessions you own or joined"
        accent="#ff0033"
        icon={
          <svg viewBox="0 0 48 48" className="w-10 h-10">
            <rect x="6" y="10" width="36" height="28" rx="4" fill="#ff0033" opacity="0.2" />
            <rect x="10" y="16" width="16" height="3" rx="1.5" fill="#ff0033" />
            <rect x="10" y="23" width="22" height="3" rx="1.5" fill="#ff0033" opacity="0.7" />
            <rect x="10" y="30" width="12" height="3" rx="1.5" fill="#ff0033" opacity="0.5" />
          </svg>
        }
      />
      <StatCard
        label="Open / draft"
        value={active}
        hint="Ready for pairing"
        accent="#00d4ff"
        icon={
          <svg viewBox="0 0 48 48" className="w-10 h-10">
            <circle cx="24" cy="24" r="14" fill="none" stroke="#00d4ff" strokeWidth="3" opacity="0.35" />
            <circle cx="24" cy="24" r="14" fill="none" stroke="#00d4ff" strokeWidth="3" strokeDasharray="55 88" strokeLinecap="round" />
            <circle cx="24" cy="24" r="4" fill="#00d4ff" />
          </svg>
        }
      />
      <StatCard
        label="Interviews"
        value={interviews}
        hint="Timed assessment rooms"
        accent="#00ff88"
        icon={
          <svg viewBox="0 0 48 48" className="w-10 h-10">
            <rect x="14" y="8" width="20" height="32" rx="3" fill="#00ff88" opacity="0.2" />
            <path d="M18 18h12M18 24h10M18 30h8" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" />
          </svg>
        }
      />
      <StatCard
        label="Participants"
        value={participants}
        hint="Across your session roster"
        accent="#ff6b35"
        icon={
          <svg viewBox="0 0 48 48" className="w-10 h-10">
            <circle cx="18" cy="18" r="6" fill="#ff6b35" opacity="0.85" />
            <circle cx="30" cy="18" r="6" fill="#ff6b35" opacity="0.55" />
            <path d="M8 36c2-6 6-9 10-9s8 3 10 9" fill="none" stroke="#ff6b35" strokeWidth="2.5" opacity="0.8" />
            <path d="M22 36c1-4 4-7 8-7 3 0 5 1.5 7 4" fill="none" stroke="#ff6b35" strokeWidth="2.5" opacity="0.5" />
          </svg>
        }
      />

      <div className="md:col-span-2 glass rounded-2xl border border-white/10 p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-text-primary">Activity · last 7 days</h3>
          <p className="text-xs text-text-muted">Sessions created per day</p>
        </div>
        <svg viewBox="0 0 420 140" className="w-full h-[140px]" role="img" aria-label="Weekly activity chart">
          <defs>
            <linearGradient id="actFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff0033" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ff0033" stopOpacity="0" />
            </linearGradient>
          </defs>
          {(() => {
            const w = 420;
            const h = 140;
            const padX = 28;
            const padY = 18;
            const chartW = w - padX * 2;
            const chartH = h - padY * 2 - 16;
            const step = chartW / Math.max(1, activity.length - 1);
            const points = activity.map((d, i) => {
              const x = padX + i * step;
              const y = padY + chartH - (d.count / maxAct) * chartH;
              return { x, y, ...d };
            });
            const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
            const area = `${line} L${points[points.length - 1].x},${padY + chartH} L${points[0].x},${padY + chartH} Z`;
            return (
              <>
                {[0.25, 0.5, 0.75, 1].map((t) => (
                  <line
                    key={t}
                    x1={padX}
                    x2={w - padX}
                    y1={padY + chartH * (1 - t)}
                    y2={padY + chartH * (1 - t)}
                    stroke="rgba(255,255,255,0.06)"
                  />
                ))}
                <path d={area} fill="url(#actFill)" />
                <path d={line} fill="none" stroke="#ff0033" strokeWidth="2.5" strokeLinejoin="round" />
                {points.map((p) => (
                  <g key={p.key}>
                    <circle cx={p.x} cy={p.y} r="4" fill="#ff0033" />
                    <circle cx={p.x} cy={p.y} r="7" fill="#ff0033" opacity="0.2">
                      <animate attributeName="r" values="6;9;6" dur="2.4s" repeatCount="indefinite" />
                    </circle>
                    <text x={p.x} y={h - 4} textAnchor="middle" fill="#a0a0a0" fontSize="10">
                      {p.label}
                    </text>
                  </g>
                ))}
              </>
            );
          })()}
        </svg>
      </div>

      <div className="md:col-span-2 glass rounded-2xl border border-white/10 p-5 flex flex-col sm:flex-row gap-6 items-center">
        <div className="relative shrink-0">
          <svg viewBox="0 0 160 160" className="w-40 h-40" role="img" aria-label="Session type breakdown">
            {types.length === 0 ? (
              <circle cx="80" cy="80" r="52" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="18" />
            ) : (
              types.map((t) => {
                const sweep = (t.value / totalTypes) * 360;
                const start = angle;
                angle += sweep;
                const large = sweep > 180 ? 1 : 0;
                const r = 52;
                const c = 80;
                const rad = (deg: number) => (Math.PI / 180) * deg;
                const x1 = c + r * Math.cos(rad(start));
                const y1 = c + r * Math.sin(rad(start));
                const x2 = c + r * Math.cos(rad(start + sweep));
                const y2 = c + r * Math.sin(rad(start + sweep));
                const color = TYPE_COLORS[t.name] || "#a0a0a0";
                if (sweep >= 359.9) {
                  return (
                    <circle key={t.name} cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth="18" />
                  );
                }
                return (
                  <path
                    key={t.name}
                    d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
                    fill="none"
                    stroke={color}
                    strokeWidth="18"
                  />
                );
              })
            )}
            <circle cx="80" cy="80" r="34" fill="#0a0a0a" />
            <text x="80" y="76" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="700">
              {sessions.length}
            </text>
            <text x="80" y="94" textAnchor="middle" fill="#a0a0a0" fontSize="10">
              rooms
            </text>
          </svg>
        </div>
        <div className="flex-1 w-full space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Session mix</h3>
            <p className="text-xs text-text-muted">By room type</p>
          </div>
          {(types.length ? types : [{ name: "none", value: 0 }]).map((t) => (
            <div key={t.name} className="flex items-center gap-3">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ background: TYPE_COLORS[t.name] || "#555" }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="capitalize text-text-primary">{t.name}</span>
                  <span className="text-text-muted">{t.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.max(4, (t.value / totalTypes) * 100)}%`,
                      background: TYPE_COLORS[t.name] || "#555",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent,
  icon,
}: {
  label: string;
  value: number;
  hint: string;
  accent: string;
  icon: ReactNode;
}) {
  return (
    <div className="glass rounded-2xl border border-white/10 p-5 relative overflow-hidden group hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5">
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"
        style={{ background: accent }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-text-muted mb-1">{label}</p>
          <p className="text-3xl font-bold text-text-primary tabular-nums">{value}</p>
          <p className="text-xs text-text-muted mt-1">{hint}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}
