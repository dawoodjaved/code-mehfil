"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiBase, clearAuthToken, getAuthToken, signInPath } from "@/lib/auth";

interface RequireAuthProps {
  children: ReactNode;
  /** Optional custom redirect target; defaults to current path */
  next?: string;
}

/**
 * Blocks rendering until a valid JWT is present and /api/auth/me succeeds.
 * Redirects anonymous / invalid sessions to sign-in.
 */
export function RequireAuth({ children, next }: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      const token = getAuthToken();
      const redirectTo = signInPath(next || pathname || "/sessions");

      if (!token) {
        router.replace(redirectTo);
        return;
      }

      try {
        const res = await fetch(`${apiBase()}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;

        if (!res.ok) {
          clearAuthToken();
          router.replace(redirectTo);
          return;
        }
        setReady(true);
      } catch {
        if (cancelled) return;
        // Network blip — still require a token locally
        if (!getAuthToken()) {
          router.replace(redirectTo);
          return;
        }
        setReady(true);
      }
    };

    void verify();
    return () => {
      cancelled = true;
    };
  }, [router, pathname, next]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-sm text-muted-foreground">
        Checking sign-in…
      </div>
    );
  }

  return <>{children}</>;
}
