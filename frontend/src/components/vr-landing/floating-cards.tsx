"use client";

import { Headphones, ArrowUp, Sparkles, Zap, BarChart3, Hand } from "lucide-react";

export function FloatingCards() {
  return (
    <>
      {/* Top Left Card - Combined with all left content */}
      <div 
        className="fixed top-[15%] left-[8%] w-[320px] glass rounded-xl p-9 z-cards transition-all duration-400 hover:-translate-y-1"
        style={{
          borderColor: "rgba(255, 255, 255, 0.2)",
        }}
      >
        {/* Figma-style Icon */}
        <div className="flex flex-wrap gap-1 mb-6 w-10 h-10 relative">
          <div className="w-5 h-5 rounded-full bg-figma-red absolute top-0 left-0" />
          <div className="w-5 h-5 rounded-full bg-figma-purple absolute top-0 right-0" />
          <div className="w-5 h-5 rounded-full bg-figma-blue absolute bottom-0 left-0" />
          <div className="w-5 h-5 rounded-full bg-figma-green absolute bottom-0 right-0" />
        </div>

        {/* Pill Button with Headphone Icon */}
        <div 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl mb-6"
          style={{
            background: "rgba(255, 255, 255, 0.12)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <Headphones className="w-4 h-4 text-white" />
          <span className="text-white text-base">Virtual Reality</span>
        </div>

        {/* Description Text - Two Paragraphs */}
        <p className="text-[13px] leading-[1.8] text-text-muted mb-4">
          At our platform, we believe that innovation is not a one-time process — 
          it's a continuous journey of learning, refining, and evolving. Every 
          feature we build flows through rigorous testing and user feedback.
        </p>
        <p className="text-[13px] leading-[1.8] text-text-muted mb-6">
          We are passionate innovators bringing people closer to the wonders of 
          cutting-edge technology. Our mission is to make advanced tools accessible 
          and intuitive for everyone.
        </p>

        {/* Get Started Button with Arrow */}
        <button
          className="w-full px-9 py-3.5 rounded-full text-white text-[15px] font-semibold transition-all duration-300 ease-in-out mb-6 flex items-center justify-center gap-2"
          style={{
            background: "#ff0000",
            boxShadow: "0 4px 20px rgba(255, 0, 0, 0.4)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 6px 28px rgba(255, 0, 0, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(255, 0, 0, 0.4)";
          }}
        >
          Get Started
          <ArrowUp className="w-4 h-4" />
        </button>

        {/* Feature Tags */}
        <div className="flex flex-col gap-3">
          <div 
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <Sparkles className="w-4 h-4 text-text-secondary" />
            <span className="text-text-secondary text-[13px]">AI-Powered Solutions</span>
          </div>
          <div 
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <Zap className="w-4 h-4 text-text-secondary" />
            <span className="text-text-secondary text-[13px]">Lightning Fast Performance</span>
          </div>
          <div 
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <Hand className="w-4 h-4 text-text-secondary" />
            <span className="text-text-secondary text-[13px]">Intuitive Interaction</span>
          </div>
          <div 
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <ArrowUp className="w-4 h-4 text-text-secondary" />
            <span className="text-text-secondary text-[13px]">Scalable Infrastructure</span>
          </div>
          <div 
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <BarChart3 className="w-4 h-4 text-text-secondary" />
            <span className="text-text-secondary text-[13px]">Business Intelligence</span>
          </div>
        </div>
      </div>

      {/* Top Right Card */}
      <div 
        className="fixed top-[15%] right-[8%] w-[340px] glass rounded-xl p-9 z-cards transition-all duration-400 hover:-translate-y-1"
        style={{
          borderColor: "rgba(255, 255, 255, 0.2)",
        }}
      >
        {/* Section Label */}
        <div 
          className="text-[12px] text-status-red font-semibold tracking-[0.05em] mb-3"
        >
          Why Choose
        </div>

        {/* Heading */}
        <h2 className="text-[36px] font-bold text-white leading-[1.2] mb-4">
          What makes us<br />different
        </h2>

        {/* Description */}
        <p className="text-[13px] leading-[1.8] text-text-muted">
          We combine innovative technology with user-centric design to create 
          experiences that are both powerful and intuitive. Our platform stands 
          out through exceptional performance and seamless integration.
        </p>
      </div>
    </>
  );
}
