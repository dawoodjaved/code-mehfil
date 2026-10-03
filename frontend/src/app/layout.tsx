import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "@/components/ui/toaster";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Real-Time Collaborative Coding & Interviews`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "CodeMehfil is a real-time collaborative coding platform for pair programming and technical interviews. Shared Monaco editor, live code execution, chat, video, and whiteboard in one place.",
  keywords: [
    "CodeMehfil",
    "Code Mehfil",
    "code mehfil",
    "collaborative coding",
    "pair programming",
    "technical interview platform",
    "online code editor",
    "real-time coding",
    "CoderPad alternative",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Real-Time Collaborative Coding & Interviews`,
    description:
      "Pair program and run technical interviews with a shared editor, code execution, chat, video, and whiteboard.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "CodeMehfil logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — Real-Time Collaborative Coding`,
    description:
      "Pair program and interview with a shared editor, execution, chat, video, and whiteboard.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <JsonLd />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
