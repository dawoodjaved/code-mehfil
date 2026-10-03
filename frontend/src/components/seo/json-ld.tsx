import { SITE_NAME, SITE_URL } from "@/lib/site";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  alternateName: ["Code Mehfil", "code mehfil", "CodeMehfil"],
  url: SITE_URL,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  description:
    "Real-time collaborative coding platform for pair programming and technical interviews. Shared Monaco editor, code execution, chat, video, and whiteboard.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Real-time collaborative code editor",
    "Multi-language code execution",
    "Technical interview mode",
    "In-session chat",
    "Video calls",
    "Whiteboard",
  ],
};

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
