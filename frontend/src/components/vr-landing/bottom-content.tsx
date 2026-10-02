"use client";

import { ArrowUp, Sparkles, Zap } from "lucide-react";

export function BottomContent() {
  return (
    <div className="fixed bottom-[12%] left-[8%] w-[420px] z-cards">
      {/* Paragraph 1 */}
      <p className="text-[14px] leading-[1.8] text-text-muted mb-6">
        At our platform, we believe that innovation is not a one-time process — 
        it's a continuous journey of learning, refining, and evolving. Every 
        feature we build flows through rigorous testing and user feedback.
      </p>

      {/* Paragraph 2 */}
      <p className="text-[14px] leading-[1.8] text-text-muted mb-6">
        We are passionate innovators bringing people closer to the wonders of 
        cutting-edge technology. Our mission is to make advanced tools accessible 
        and intuitive for everyone.
      </p>

      {/* Get Started Button */}
      <button
        className="px-9 py-3.5 rounded-full text-white text-[15px] font-semibold transition-all duration-300 ease-in-out mb-6"
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
      </button>

      {/* Feature Tags */}
      <div className="flex flex-col gap-3 mt-6">
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
          <ArrowUp className="w-4 h-4 text-text-secondary" />
          <span className="text-text-secondary text-[13px]">Scalable Infrastructure</span>
        </div>
      </div>
    </div>
  );
}
