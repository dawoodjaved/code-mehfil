"use client";

/** Client-side auth helpers (JWT in localStorage). */

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
}

export function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra || {}),
  };
}

export function signInPath(next?: string) {
  if (!next) return "/auth/signin";
  return `/auth/signin?next=${encodeURIComponent(next)}`;
}

export function resolveNextPath(raw: string | null | undefined, fallback = "/sessions") {
  if (!raw) return fallback;
  // Only allow same-origin relative paths (block open redirects)
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}

export function apiBase() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
}
