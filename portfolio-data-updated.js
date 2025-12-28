import {
  ezo,
  frizhub,
  skyline,
  work_orders,
  bug_tracker
} from "../assets";

import {
  AiFillGithub,
  AiFillLinkedin,
  AiFillInstagram,
} from "react-icons/ai";
import { FaNodeJs, FaRobot } from "react-icons/fa";
import {
  SiExpress,
  SiSlack,
  SiPostgresql,
  SiJira,
  SiMysql,
  SiMongodb,
  SiJavascript,
  SiReact,
  SiGraphql,
  SiRubyonrails,
  SiJquery,
  SiVisualstudiocode,
  SiPostman,
  SiGit,
  SiNetlify,
  SiGooglecloud,
  SiCsharp,
  SiSocketdotio,
  SiNextdotjs,
  SiTypescript,
  SiNestjs,
  SiDocker,
  SiTailwindcss,
  SiPrisma,
  SiRedis,
  SiStripe
} from "react-icons/si";

import {
  MdSecurity,
  MdApi,
  MdVerifiedUser,
} from "react-icons/md";

import {
  BiKey,
  BiCodeAlt,
} from "react-icons/bi";

export const resumeLink = "https://drive.google.com/file/d/1axJeRTbjaD7fPOJgxyP8T4Qm74yA7JH7/view?usp=drive_link";
export const repoLink = "https://github.com/dawoodjaved";

export const callToAction = "https://www.linkedin.com/in/dawood-javeed-a750891a1/";

export const navLinks = [
  {
    id: "skills",
    title: "Skills & Experience",
  },
  {
    id: "achievements",
    title: "Achievements",
  },
  {
    id: "projects",
    title: "Projects",
  },
  {
    id: "certificates",
    title: "Certificates",
  },
  {
    id: "contactMe",
    title: "Contact Me",
  },
];

export const achievements = [
  {
    id: "a-1",
    icon: ezo,
    event: "CodePair | Real-Time Collaborative Coding Platform",
    position: "Full Stack Developer",
    content1: "Built real-time collaborative editor with Monaco Editor and WebSocket synchronization, enabling seamless multi-cursor editing like Google Docs",
    content2: "Integrated instant code execution via Judge0 API supporting 10+ languages (Python, JavaScript, Java, C++, Go, TypeScript, PHP, Ruby, Rust, Swift)",
    content3: "Implemented live chat with typing indicators and message history alongside code editor for enhanced collaboration",
    content4: "Created interview mode with built-in timer and curated coding question bank for technical interviews and practice sessions",
    article: "",
    project: "",
  },
  {
    id: "a-0",
    icon: ezo,
    event: "EZOfficeInventory | Performance Optimization",
    position: "Senior Software Engineer",
    content1: "Led migration of Work Orders module from Ruby on Rails (ERB) to React.js, reducing latency by 83%",
    content2: "Optimized SQL queries and eliminated N+1 queries, reducing asset mass-checkout time by 98%",
    content3: "Built scalable, reusable React components improving maintainability and feature delivery",
    article: "",
    project: "",
  },
  {
    id: "a-2",
    icon: ezo,
    event: "SaaSify 2025 | Enterprise SaaS Boilerplate",
    position: "Full Stack Developer",
    content1: "Architected simplified single-codebase SaaS boilerplate with Next.js 14 and TypeScript - eliminating need for separate backend",
    content2: "Implemented multi-tenant architecture with automatic tenant detection via subdomains and role-based access control",
    content3: "Integrated Stripe billing with customer portal, subscription management, invoice tracking, and 14-day free trial",
    content4: "Built production-ready authentication with NextAuth.js supporting Email/Password and Google OAuth",
    content5: "Created comprehensive dashboard with stats, billing, team management, usage tracking, and settings pages",
    article: "",
    project: "",
  },
  {
    id: "a-3",
    icon: frizhub,
    event: "DevSynergy Hub | Unified Developer Collaboration Platform",
    position: "Full Stack Developer",
    content1: "Built simplified, elegant collaboration platform focusing on core productivity features without unnecessary complexity",
    content2: "Implemented real-time chat with ActionCable WebSockets, featuring threads, reactions, and file attachments",
    content3: "Created drag-and-drop Kanban boards with unlimited columns and custom workflows for task management",
    content4: "Developed code snippets sharing with syntax highlighting for 150+ languages and markdown-based wiki system",
    content5: "Built analytics dashboard with insightful charts for project progress and team metrics with real-time user presence",
    article: "",
    project: "",
  },
  {
    id: "a-4",
    icon: skyline,
    event: "LuminaCraft | Enterprise Form Builder Platform",
    position: "Full Stack Developer",
    content1: "Built modern, user-friendly form builder with drag-and-drop interface supporting 10 essential field types",
    content2: "Integrated AI-powered form generation from natural language prompts using GPT-4, eliminating manual form creation",
    content3: "Implemented Stripe payment processing integration with basic analytics dashboard for response tracking",
    content4: "Created template library with 8 pre-built templates and form sharing via public links, embed codes, and QR codes",
    content5: "Developed real-time form preview, mobile-responsive forms, and custom themes with secure JWT-based authentication",
    article: "",
    project: "",
  },
  {
    id: "a-5",
    icon: frizhub,
    event: "TrustWala Bazaar | AI-Enriched Marketplace Platform",
    position: "Full Stack Developer",
    content1: "Achieved 92% fraud detection accuracy with multi-layer AI combining ML patterns, CNIC OCR, and video face recognition",
    content2: "Pioneered transparent trust score algorithm with explainable AI - unique industry approach",
    content3: "Solved multilingual challenge with Urdu/English voice search and RTL support for Pakistan market",
    content4: "Achieved offline-first PWA enabling full functionality without internet, increasing engagement by 45%",
    content5: "Reduced transaction time by 50% with real-time AI chat assistant for automated negotiations",
    article: "",
    project: "",
  }
];

export const skills = [
  {
    title: "Programming Languages",
    items: [
      {
        id: "pl-1",
        icon: SiJavascript,
        name: "JavaScript (ES6)",
      },
      {
        id: "pl-2",
        icon: SiRubyonrails,
        name: "Ruby",
      },
      {
        id: "pl-3",
        icon: SiCsharp,
        name: "TypeScript",
      },
    ],
  },
  {
    title: "Frameworks/Libraries",
    items: [
      {
        id: "f-1",
        icon: SiRubyonrails,
        name: "Ruby on Rails",
      },
      {
        id: "f-2",
        icon: SiReact,
        name: "React.js",
      },
      {
        id: "f-3",
        icon: FaNodeJs,
        name: "Node.js",
      },
      {
        id: "f-4",
        icon: SiExpress,
        name: "Express.js",
      },
      {
        id: "f-5",
        icon: SiJquery,
        name: "jQuery",
      },
    ],
  },
  {
    title: "Databases",
    items: [
      {
        id: "db-1",
        icon: SiMysql,
        name: "MySQL",
      },
      {
        id: "db-2",
        icon: SiPostgresql,
        name: "PostgreSQL",
      },
      {
        id: "db-3",
        icon: SiMongodb,
        name: "MongoDB",
      },
      {
        id: "db-4",
        icon: SiMysql,
        name: "Elasticsearch",
      },
    ],
  },
  {
    title: "APIs & Integrations",
    items: [
      {
        id: "api-1",
        icon: MdApi,
        name: "RESTful APIs",
      },
      {
        id: "api-2",
        icon: SiGraphql,
        name: "GraphQL",
      },
      {
        id: "api-3",
        icon: SiSocketdotio,
        name: "WebSocket",
      },
      {
        id: "api-4",
        icon: MdSecurity,
        name: "SAML 2.0",
      },
      {
        id: "api-5",
        icon: BiKey,
        name: "SCIM",
      },
      {
        id: "api-6",
        icon: MdVerifiedUser,
        name: "OAuth 2.0",
      },
      {
        id: "api-7",
        icon: BiCodeAlt,
        name: "AJAX",
      },
    ],
  },
  {
    title: "Cloud & DevOps",
    items: [
      {
        id: "cloud-1",
        icon: SiGooglecloud,
        name: "AWS",
      },
      {
        id: "cloud-2",
        icon: SiGooglecloud,
        name: "Microsoft Azure AD",
      },
      {
        id: "cloud-3",
        icon: SiNetlify,
        name: "Heroku",
      },
      {
        id: "cloud-4",
        icon: SiNetlify,
        name: "Netlify",
      },
      {
        id: "cloud-5",
        icon: SiGit,
        name: "CI/CD",
      },
    ],
  },
  {
    title: "Tools & Platforms",
    items: [
      {
        id: "t-1",
        icon: SiVisualstudiocode,
        name: "VS Code",
      },
      {
        id: "t-2",
        icon: SiGit,
        name: "Git",
      },
      {
        id: "t-3",
        icon: AiFillGithub,
        name: "GitHub",
      },
      {
        id: "t-4",
        icon: SiPostman,
        name: "Postman",
      },
      {
        id: "t-5",
        icon: SiJira,
        name: "JIRA",
      },
      {
        id: "t-6",
        icon: SiSlack,
        name: "Slack",
      },
    ],
  },
  {
    title: "Monitoring & Error Management",
    items: [
      {
        id: "mon-1",
        icon: SiGooglecloud,
        name: "Datadog (APM)",
      },
      {
        id: "mon-2",
        icon: SiGooglecloud,
        name: "Kibana",
      },
      {
        id: "mon-3",
        icon: SiGooglecloud,
        name: "Airbrake",
      },
      {
        id: "mon-4",
        icon: SiGooglecloud,
        name: "Errbit",
      },
    ],
  },
];

// Add your current/past professional work experience here
export const experiences = [
  {
    organisation: "EZOfficeInventory",
    logo: ezo,
    link: "https://www.ezofficeinventory.com/",
    positions: [
      {
        title: "Senior Software Engineer",
        duration: "06/2022 - Present",
        content: [
          {
            text: "Led the migration of the Work Orders module from Ruby on Rails (ERB) to React.js, eliminating full-page reloads and reducing tab-switching and pagination latency by 83% (from 3.0s to 0.5s)",
            link: "",
          },
          {
            text: "Built scalable, reusable React components and front-end architecture to improve maintainability and accelerate feature delivery",
            link: "",
          },
          {
            text: "Architected a unified telemetry integration framework for Samsara, John Deere, and Hapn using extensible patterns and event-driven pipelines — reducing integration time by 70%, improving data reliability by 45%, and enabling real-time telemetry for 50K+ assets",
            link: "",
          },
          {
            text: "Developed generic internationalization (i18n) and localization for Zendesk and JIRA integrated apps across EZO, AssetSonar, and CMMS; upgraded NPM packages and migrated Webpack from version 3 to 5, improving build reliability and reducing build errors by 40%",
            link: "",
          },
          {
            text: "Optimized SQL queries by adding proper indexing and eliminating N+1 queries, reducing asset mass-checkout time for 10,000 assets by 98% (from over 1 hour to 1–1.2 minutes)",
            link: "",
          },
          {
            text: "Designed and delivered role-based dashboards and permission-driven UIs for trial users, admins, and staff",
            link: "",
          },
          {
            text: "Automated asset workflows with dynamic field auto-population and background processing, reducing manual effort and data-entry errors",
            link: "",
          },
          {
            text: "Implemented SAML 2.0 Single Sign-On (SSO) integrations with Google Workspace and Microsoft Azure AD",
            link: "",
          },
          {
            text: "Introduced SCIM sync monitoring using APM tools to collect detailed logs, enabling faster debugging and reducing production downtime",
            link: "",
          },
          {
            text: "Hardened application security by removing XSS vulnerabilities and mitigating SQL injection risks through input validation, secure coding practices, and regular code reviews",
            link: "",
          },
          {
            text: "Enabled AJAX-driven UI across paginated/high-volume actions and created a centralized Request Management Center",
            link: "",
          },
          {
            text: "Mentored and provided technical guidance to 5+ developers; led code reviews and ensured on-time sprint delivery",
            link: "",
          },
        ],
      },
    ],
  },
  {
    organisation: "Frizhub Solutions",
    logo: frizhub,
    link: "",
    positions: [
      {
        title: "Associate Software Engineer",
        duration: "07/2021 - 02/2022",
        content: [
          {
            text: "Engineered and launched production ready MERN stack applications, scaling to support growing user traffic without performance bottlenecks",
            link: "",
          },
          {
            text: "Integrated RESTful APIs into React.js front-end workflows, enabling faster feature rollouts and cutting integration time by 25%",
            link: "",
          },
          {
            text: "Designed and deployed real-time APIs with Node.js, Express.js, and WebSockets, powering instant notifications and live updates for end-users",
            link: "",
          },
          {
            text: "Introduced modular architecture patterns across React.js and Node.js codebases, reducing duplicate logic and cutting maintenance effort for new features",
            link: "",
          },
          {
            text: "Automated debugging and testing workflows, reducing regression issues by 35% and improving deployment reliability",
            link: "",
          },
          {
            text: "Contributed to internal coding standards and reusable component libraries, accelerating development velocity for future projects",
            link: "",
          },
        ],
      },
    ],
  },
  {
    organisation: "Skyline Code Labs",
    logo: skyline,
    link: "",
    positions: [
      {
        title: "Full Stack Web Developer",
        duration: "06/2019 - 06/2021",
        content: [
          {
            text: "Built and maintained client-facing web applications leveraging Ruby on Rails, React.js, and Node.js, ensuring both rapid MVP delivery and long-term scalability",
            link: "",
          },
          {
            text: "Optimized database performance across MySQL, PostgreSQL, and MongoDB by restructuring queries and adding proper indexing, cutting average response times by up to 60%",
            link: "",
          },
          {
            text: "Modernized legacy Rails applications by introducing service objects, background jobs, and API-first designs, improving maintainability and integration with external services",
            link: "",
          },
          {
            text: "Implemented CI/CD pipelines with automated testing, reducing deployment errors and shortening release cycles",
            link: "",
          },
          {
            text: "Managed cloud deployments on Heroku and Netlify, achieving consistent uptime and smooth scaling for client projects",
            link: "",
          },
          {
            text: "Collaborated directly with clients to gather requirements, propose scalable architectures, and deliver features that balanced business needs with technical sustainability",
            link: "",
          },
        ],
      },
    ],
  }
];

// Add information about all the projects to be listed out in your portfolio
export const projects = [
  {
    id: "project-2",
    title: "Unified Telemetry Integration Framework",
    github: "https://github.com/dawoodjaved",
    link: "https://example.com/telemetry",
    image: ezo,
    isActive: false,
    content:
      "Architected a unified telemetry integration framework for Samsara, John Deere, and Hapn using extensible patterns and event-driven pipelines. The solution reduced integration time by 70%, improved data reliability by 45%, and enabled real-time telemetry for 50K+ assets, providing seamless connectivity across multiple telemetry providers.",
    stack: [
      {
        id: "icon-1",
        icon: SiReact,
        name: "React.js"
      },
      {
        id: "icon-2",
        icon: SiRubyonrails,
        name: "Ruby on Rails"
      },
      {
        id: "icon-3",
        icon: MdApi,
        name: "RESTful APIs"
      },
      {
        id: "icon-6",
        icon: SiGraphql,
        name: "Event-Driven"
      },
    ],
  },
  {
    id: "project-1",
    title: "Work Orders Module Migration",
    github: "https://github.com/dawoodjaved",
    link: "https://example.com/work-orders",
    image: work_orders,
    isActive: true,
    content:
      "Led the complete migration of EZOfficeInventory's Work Orders module from Ruby on Rails (ERB) to React.js, eliminating full-page reloads and reducing tab-switching and pagination latency by 83% (from 3.0s to 0.5s). Built scalable, reusable React components and front-end architecture.",
    stack: [
      {
        id: "icon-1",
        icon: SiReact,
        name: "React.js"
      },
      {
        id: "icon-2",
        icon: SiRubyonrails,
        name: "Ruby on Rails"
      },
      {
        id: "icon-3",
        icon: SiMysql,
        name: "MySQL"
      },
      {
        id: "icon-4",
        icon: SiJavascript,
        name: "JavaScript"
      },
      {
        id: "icon-5",
        icon: SiJira,
        name: "JIRA"
      },
      {
        id: "icon-6",
        icon: SiVisualstudiocode,
        name: "VS Code"
      },
    ],
  },
  {
    id: "project-3",
    title: "Bug Assignment & Tracking System",
    github: "https://github.com/dawoodjaved",
    link: "https://example.com/bug-tracker",
    image: bug_tracker,
    isActive: false,
    content:
      "A comprehensive system built to streamline error tracking and resolution across multiple products, improving visibility, accountability, and response times. Features real-time Slack alerts, smart Google Sheets dashboards, automated updates, Redmine integration, escalation & prioritization, and Slack-driven workflow management.",
    stack: [
      {
        id: "icon-4",
        icon: SiJavascript,
        name: "JavaScript"
      },
      {
        id: "icon-2",
        icon: SiSlack,
        name: "Slack API"
      },
      {
        id: "icon-3",
        icon: SiGooglecloud,
        name: "Google Sheets"
      },
      {
        id: "icon-7",
        icon: SiJira,
        name: "Redmine"
      },
      {
        id: "icon-5",
        icon: SiGooglecloud,
        name: "Airbrake"
      },
      {
        id: "icon-6",
        icon: SiGraphql,
        name: "API Integration"
      },
    ],
  },
  {
    id: "project-4",
    title: "Medication Reminder App",
    github: "https://github.com/dawoodjaved",
    link: "https://example.com/medication-app",
    image: bug_tracker,
    isActive: false,
    content:
      "A mobile application designed to simplify daily medication management, built with React Native and Expo. Features medication logging, smart notifications, OCR integration for medicine labels, history tracking, secure phone-based OTP authentication, and cross-platform builds with EAS CLI.",
    stack: [
      {
        id: "icon-1",
        icon: SiReact,
        name: "React Native"
      },
      {
        id: "icon-2",
        icon: SiGooglecloud,
        name: "Expo"
      },
      {
        id: "icon-3",
        icon: SiGooglecloud,
        name: "Appwrite"
      },
      {
        id: "icon-7",
        icon: SiGooglecloud,
        name: "MLKit OCR"
      },
      {
        id: "icon-5",
        icon: SiGooglecloud,
        name: "EAS CLI"
      },
      {
        id: "icon-6",
        icon: SiGooglecloud,
        name: "Push Notifications"
      },
    ],
  },
  {
    id: "project-5",
    title: "CodePair - Real-Time Collaborative Coding Platform",
    github: "https://github.com/dawoodjaved",
    link: "https://example.com/codepair",
    image: work_orders,
    isActive: true,
    content:
      "A streamlined real-time code collaboration platform that enables developers to code together seamlessly. Think 'Google Docs for Code' with live execution. Built with Next.js 14 and Rails 7.2, featuring real-time collaborative editor with Monaco Editor and WebSocket synchronization, live cursor tracking, and user presence indicators. Includes instant code execution via Judge0 API supporting 10+ languages (Python, JavaScript, Java, C++, Go, TypeScript, PHP, Ruby, Rust, Swift), live chat with typing indicators, session management with shareable links, and interview mode with built-in timer and coding question bank.",
    stack: [
      {
        id: "icon-1",
        icon: SiNextdotjs,
        name: "Next.js 14"
      },
      {
        id: "icon-2",
        icon: SiTypescript,
        name: "TypeScript"
      },
      {
        id: "icon-3",
        icon: SiRubyonrails,
        name: "Ruby on Rails"
      },
      {
        id: "icon-4",
        icon: SiPostgresql,
        name: "PostgreSQL"
      },
      {
        id: "icon-5",
        icon: SiSocketdotio,
        name: "ActionCable"
      },
      {
        id: "icon-6",
        icon: SiTailwindcss,
        name: "Tailwind CSS"
      },
      {
        id: "icon-7",
        icon: SiVisualstudiocode,
        name: "Monaco Editor"
      },
      {
        id: "icon-8",
        icon: MdApi,
        name: "Judge0 API"
      },
    ],
  },
  {
    id: "project-6",
    title: "SaaSify 2025 - Enterprise SaaS Boilerplate",
    github: "https://github.com/dawoodjaved",
    link: "https://example.com/saasify",
    image: ezo,
    isActive: true,
    content:
      "A modern, simplified SaaS boilerplate designed to accelerate SaaS development, built with Next.js 14 and TypeScript. Features multi-tenant architecture with automatic tenant detection via subdomains, NextAuth.js authentication (Email/Password + Google OAuth), Stripe billing with customer portal and 14-day free trial, role-based access control with team invitations, comprehensive dashboard with stats/billing/team/usage/settings pages, and production-ready deployment with Docker. Perfect for SaaS MVPs, B2B tools, subscription products, and team collaboration tools.",
    stack: [
      {
        id: "icon-1",
        icon: SiNextdotjs,
        name: "Next.js 14"
      },
      {
        id: "icon-2",
        icon: SiTypescript,
        name: "TypeScript"
      },
      {
        id: "icon-3",
        icon: SiPostgresql,
        name: "PostgreSQL"
      },
      {
        id: "icon-4",
        icon: SiPrisma,
        name: "Prisma"
      },
      {
        id: "icon-5",
        icon: SiStripe,
        name: "Stripe"
      },
      {
        id: "icon-6",
        icon: SiTailwindcss,
        name: "Tailwind CSS"
      },
      {
        id: "icon-7",
        icon: SiDocker,
        name: "Docker"
      },
      {
        id: "icon-8",
        icon: MdVerifiedUser,
        name: "NextAuth.js"
      },
    ],
  },
  {
    id: "project-7",
    title: "DevSynergy Hub - Unified Developer Collaboration Platform",
    github: "https://github.com/dawoodjaved",
    link: "https://example.com/devsynergy",
    image: frizhub,
    isActive: true,
    content:
      "A simplified, elegant developer collaboration platform that focuses on core team productivity features. Built with Next.js 14 and Rails 7.0, featuring secure JWT-based authentication, projects & teams management, drag-and-drop Kanban boards with unlimited columns, real-time chat with ActionCable WebSockets (threads, reactions, file attachments), code snippets with syntax highlighting for 150+ languages, file sharing, analytics dashboard with insightful charts, real-time user presence, markdown-based wiki, and real-time notifications.",
    stack: [
      {
        id: "icon-1",
        icon: SiNextdotjs,
        name: "Next.js 14"
      },
      {
        id: "icon-2",
        icon: SiReact,
        name: "React 19"
      },
      {
        id: "icon-3",
        icon: SiTypescript,
        name: "TypeScript"
      },
      {
        id: "icon-4",
        icon: SiRubyonrails,
        name: "Ruby on Rails"
      },
      {
        id: "icon-5",
        icon: SiPostgresql,
        name: "PostgreSQL"
      },
      {
        id: "icon-6",
        icon: SiRedis,
        name: "Redis"
      },
      {
        id: "icon-7",
        icon: SiSocketdotio,
        name: "ActionCable"
      },
      {
        id: "icon-8",
        icon: SiTailwindcss,
        name: "Tailwind CSS"
      },
    ],
  },
  {
    id: "project-8",
    title: "LuminaCraft - Enterprise Form Builder Platform",
    github: "https://github.com/dawoodjaved",
    link: "https://example.com/luminacraft",
    image: skyline,
    isActive: true,
    content:
      "A modern, user-friendly form builder platform with AI-powered features, built with Next.js 14.1 and Rails 7.1. Features drag-and-drop form builder with 10 essential field types (text, textarea, email, number, select, radio, checkbox, date, file upload, payment), AI-powered form generation from natural language prompts using GPT-4, Stripe payment processing integration, basic analytics dashboard with response tracking and completion rates, template library with 8 pre-built templates, form sharing via public links/embed codes/QR codes, real-time form preview, mobile-responsive forms, custom themes and styling, and secure JWT-based authentication.",
    stack: [
      {
        id: "icon-1",
        icon: SiNextdotjs,
        name: "Next.js 14"
      },
      {
        id: "icon-2",
        icon: SiReact,
        name: "React 18"
      },
      {
        id: "icon-3",
        icon: SiTypescript,
        name: "TypeScript"
      },
      {
        id: "icon-4",
        icon: SiRubyonrails,
        name: "Ruby on Rails"
      },
      {
        id: "icon-5",
        icon: SiPostgresql,
        name: "PostgreSQL"
      },
      {
        id: "icon-6",
        icon: SiStripe,
        name: "Stripe"
      },
      {
        id: "icon-7",
        icon: SiTailwindcss,
        name: "Tailwind CSS"
      },
      {
        id: "icon-8",
        icon: FaRobot,
        name: "OpenAI"
      },
    ],
  },
  {
    id: "project-9",
    title: "TrustWala Bazaar - AI-Enriched Marketplace Platform",
    github: "https://github.com/dawoodjaved",
    link: "https://example.com/trustwala",
    image: bug_tracker,
    isActive: true,
    content:
      "A comprehensive AI-enriched marketplace platform designed for Pakistan's buy/sell ecosystem, featuring advanced trust verification, fraud detection, and multilingual support. Features AI-powered personalized recommendations, multi-layer fraud detection with CNIC and video verification, voice search (Urdu/English), visual image search, AI-calculated trust scores, real-time messaging with AI chat assistant, escrow payment protection, and PWA with offline support.",
    stack: [
      {
        id: "icon-1",
        icon: SiNextdotjs,
        name: "Next.js 15"
      },
      {
        id: "icon-2",
        icon: SiReact,
        name: "React 19"
      },
      {
        id: "icon-3",
        icon: SiTypescript,
        name: "TypeScript"
      },
      {
        id: "icon-4",
        icon: SiNestjs,
        name: "NestJS"
      },
      {
        id: "icon-5",
        icon: SiPostgresql,
        name: "PostgreSQL"
      },
      {
        id: "icon-6",
        icon: SiPrisma,
        name: "Prisma ORM"
      },
      {
        id: "icon-7",
        icon: SiSocketdotio,
        name: "Socket.io"
      },
      {
        id: "icon-8",
        icon: FaRobot,
        name: "OpenAI API"
      },
    ],
  },
];

// List out the certificates and certifications
export const certificates = [
  {
    id: 1,
    title: "AWS Certified Solutions Architect Associate",
    issuer: "Udemy",
    issueDate: "Apr 2024",
    credentialLink: "https://www.udemy.com/certificate/aws-solutions-architect-associate/",
    logo: "https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg",
  },
  {
    id: 2,
    title: "DevOps Beginners to Advanced",
    issuer: "Udemy",
    issueDate: "Jun 2023",
    credentialLink: "https://www.udemy.com/certificate/devops-beginners-to-advanced/",
    logo: "https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg",
  },
];

// Links to your social media profiles
export const socialMedia = [
  {
    id: "social-media-1",
    icon: AiFillLinkedin,
    link: "https://www.linkedin.com/in/dawood-javeed-a750891a1/",
  },
  {
    id: "social-media-2",
    icon: AiFillGithub,
    link: "https://www.github.com/dawoodjaved",
  },
  {
    id: "social-media-3",
    icon: AiFillInstagram,
    link: "https://www.instagram.com/dawood_javeed?igsh=dXRxZnNxaGd0NHFv",
  },
];

// Your professional summary
export const aboutMe = {
  name: "Dawood Javeed",
  githubUsername: 'dawoodjaved',
  tagLine: "Senior Software Engineer @ EZOfficeInventory | Full Stack Developer | Ruby on Rails | React.js | Node.js",
  intro: "Full Stack Software Engineer with 5+ years of experience developing and optimizing high-performance web applications. Skilled in Ruby on Rails, React.js, and Node.js, with expertise in cloud integrations, security enhancements, and team leadership to deliver scalable, efficient solutions and measurable performance improvements."
}

