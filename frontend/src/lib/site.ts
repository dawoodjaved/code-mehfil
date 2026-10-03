/** Canonical public site URL (no trailing slash). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://code-mehfil-sigma.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "CodeMehfil";
