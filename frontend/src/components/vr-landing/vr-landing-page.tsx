"use client";

import { useState } from "react";
import { VRNavigation } from "./vr-navigation";
import { VRHero } from "./vr-hero";
import { FloatingCards } from "./floating-cards";
import { FeatureCards } from "./feature-cards";
import { VideoPlayers } from "./video-players";
import { BlurOrbs } from "./blur-orbs";

export function VRLandingPage() {
  const [activeNav, setActiveNav] = useState("Home");

  return (
    <div className="relative min-h-screen bg-bg-primary overflow-hidden">
      {/* Background Blur Orbs */}
      <BlurOrbs />
      
      {/* Optional Grid Pattern */}
      <div 
        className="fixed inset-0 opacity-[0.02] pointer-events-none z-background"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      />
      
      {/* Navigation Bar */}
      <VRNavigation activeNav={activeNav} setActiveNav={setActiveNav} />
      
      {/* Hero Section */}
      <VRHero />
      
      {/* Floating Cards */}
      <FloatingCards />
      
      {/* Feature Cards */}
      <FeatureCards />
      
      {/* Video Players */}
      <VideoPlayers />
    </div>
  );
}
