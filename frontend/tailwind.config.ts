import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "20px",
        sm: "20px",
        md: "40px",
        lg: "80px",
        xl: "80px",
        "2xl": "80px",
      },
      screens: {
        "2xl": "1920px",
      },
    },
    extend: {
      colors: {
        // VR Theme Colors
        "bg-primary": "#000000",
        "bg-card": "#1a0a0a",
        "bg-card-secondary": "#0a0a0a",
        "accent-red": "#ff0000",
        "accent-red-hover": "#cc0000",
        "accent-pink": "#ff1493",
        "accent-purple": "#9333ea",
        "accent-orange": "#ff6b35",
        "accent-cyan": "#00d4ff",
        "accent-green": "#00ff88",
        "figma-red": "#ff5a5f",
        "figma-purple": "#a259ff",
        "figma-blue": "#00cfff",
        "figma-green": "#00e676",
        "text-primary": "#ffffff",
        "text-secondary": "#e5e5e5",
        "text-muted": "#a0a0a0",
        "text-dark": "#707070",
        "status-red": "#ff0033",
        // Legacy Tailwind compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        "sm": "8px",
        "md": "12px",
        "lg": "16px",
        "xl": "20px",
        "2xl": "24px",
        "full": "9999px",
        "DEFAULT": "var(--radius)",
      },
      spacing: {
        "xs": "8px",
        "sm": "12px",
        "md": "16px",
        "lg": "24px",
        "xl": "32px",
        "2xl": "40px",
        "3xl": "48px",
        "4xl": "64px",
      },
      zIndex: {
        "background": "-1",
        "base": "0",
        "cards": "10",
        "character": "20",
        "floating-icons": "30",
        "navigation": "1000",
      },
      boxShadow: {
        "sm": "0 2px 8px rgba(0, 0, 0, 0.4)",
        "md": "0 4px 16px rgba(0, 0, 0, 0.5)",
        "lg": "0 8px 32px rgba(0, 0, 0, 0.6)",
        "xl": "0 16px 48px rgba(0, 0, 0, 0.7)",
        "glow-red": "0 0 30px rgba(255, 0, 0, 0.4)",
        "glow-purple": "0 0 30px rgba(147, 51, 234, 0.4)",
        "glow-blue": "0 0 30px rgba(0, 212, 255, 0.4)",
        "glow-orange": "0 0 40px rgba(255, 107, 53, 0.6)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 3s ease-in-out infinite",
      },
      screens: {
        "mobile": "640px",
        "tablet": "768px",
        "desktop": "1024px",
        "wide": "1280px",
        "ultra": "1920px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
