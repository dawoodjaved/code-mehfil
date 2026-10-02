import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@excalidraw/excalidraw/index.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "@/components/ui/toaster";
import { MonacoSetup } from "@/components/monaco-setup";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CodeMehfil - Real-Time Collaborative Coding Platform",
  description: "LiveShare + CoderPad + Replit + Zoom had a baby on steroids",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <MonacoSetup />
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

