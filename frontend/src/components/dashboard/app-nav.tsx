"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, LogIn } from "lucide-react";

function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="cmBrand" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff0033" />
          <stop offset="100%" stopColor="#00d4ff" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="10" fill="url(#cmBrand)" opacity="0.95" />
      <path
        d="M10 18c0-4 3-7 8-7s8 3 8 7-3 7-8 7c-1.5 0-2.8-.3-4-.8"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="14" cy="16.5" r="1.4" fill="#fff" />
      <circle cx="18" cy="16.5" r="1.4" fill="#fff" />
      <circle cx="22" cy="16.5" r="1.4" fill="#fff" />
    </svg>
  );
}

const links = [
  { href: "/sessions", label: "Dashboard" },
  { href: "/session/new", label: "New" },
  { href: "/join", label: "Join" },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  const signOut = () => {
    localStorage.removeItem("token");
    router.push("/auth/signin");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/sessions" className="flex items-center gap-2.5 group">
          <BrandMark className="transition-transform duration-300 group-hover:scale-105" />
          <div className="leading-tight">
            <div className="text-base font-semibold tracking-tight text-white">
              CodeMehfil
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
              Live coding rooms
            </div>
          </div>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          {links.map((l) => {
            const active =
              pathname === l.href ||
              (l.href !== "/sessions" && pathname?.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="hidden md:inline-flex rounded-full border-white/15 text-text-primary"
          >
            <Link href="/join">
              <LogIn className="w-3.5 h-3.5 mr-1.5" />
              Join
            </Link>
          </Button>
          <Button
            size="sm"
            asChild
            className="rounded-full bg-accent-red hover:bg-accent-red-hover"
          >
            <Link href="/session/new">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Create
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-text-muted hover:text-white"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export { BrandMark };
