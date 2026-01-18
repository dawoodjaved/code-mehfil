"use client";

import { Check } from "lucide-react";

export function FeatureCards() {
  const features = [
    "Real-Time Transcription",
    "Noise Cancellation",
    "Multi-Language Support",
    "Intelligent Voice Recognition",
  ];

  return (
    <>
      {/* Middle Left - Two Stacked Cards */}
      <div className="fixed top-[45%] left-[8%] flex flex-col gap-6 z-cards">
        {/* Card 1: Top */}
        <div 
          className="w-[340px] glass rounded-xl p-8 transition-all duration-400 hover:-translate-y-1"
          style={{
            borderColor: "rgba(255, 255, 255, 0.2)",
          }}
        >
          <h4 className="text-[22px] font-bold text-white leading-[1.3] mb-4">
            Hyper-Realistic Visuals and Sound
          </h4>
          <p className="text-[13px] leading-[1.8] text-text-muted">
            Combining 4K Per Eye Resolution And Cutting-Edge Audio Technology, 
            Our VR Headset Delivers A Level Of Realism That's Unmatched.
          </p>
        </div>

        {/* Card 2: Bottom */}
        <div 
          className="w-[340px] glass rounded-xl p-8 transition-all duration-400 hover:-translate-y-1"
          style={{
            borderColor: "rgba(255, 255, 255, 0.2)",
          }}
        >
          <h4 className="text-[22px] font-bold text-white leading-[1.3] mb-4">
            Intuitive Interaction
          </h4>
          <p className="text-[13px] leading-[1.8] text-text-muted">
            Our VR System Features Advanced Voice And Gesture Control, Allowing 
            For Natural And Intuitive Interaction.
          </p>
        </div>
      </div>

      {/* Middle Right - Dark Gradient Card with Play Button Overlay */}
      <div 
        className="fixed top-[40%] right-[8%] w-[360px] rounded-2xl p-10 z-cards transition-all duration-400 hover:-translate-y-1 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #2a0a0a 0%, #000000 100%)",
          border: "1px solid rgba(255, 0, 0, 0.15)",
        }}
      >
        {/* Section Label */}
        <div 
          className="text-[11px] text-status-red font-semibold uppercase tracking-[0.1em] mb-4"
        >
          Easy Use Interface
        </div>

        {/* Heading */}
        <h3 className="text-[32px] font-bold text-white leading-[1.2] mb-8">
          AI-Personalized Experiences
        </h3>

        {/* Feature List */}
        <div className="space-y-5">
          {features.map((feature, index) => (
            <div key={feature} className="flex items-center gap-4">
              {index === 0 ? (
                <div 
                  className="w-12 h-12 rounded-full bg-accent-red flex items-center justify-center flex-shrink-0"
                >
                  <div className="w-6 h-6 bg-white rounded-sm" />
                </div>
              ) : (
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                >
                  <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              )}
              <span className="text-white text-base font-semibold">{feature}</span>
            </div>
          ))}
        </div>

        {/* Bottom User Stats Card */}
        <div 
          className="mt-8 rounded-2xl p-4 flex items-center"
          style={{
            background: "rgba(0, 0, 0, 0.6)",
          }}
        >
          {/* User Avatars */}
          <div className="flex -space-x-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-black"
                style={{
                  background: `linear-gradient(135deg, ${
                    i === 0 ? "#ff1493, #9333ea" : 
                    i === 1 ? "#00d4ff, #9333ea" : 
                    "#ff6b35, #ff1493"
                  })`,
                }}
              />
            ))}
          </div>

          {/* Stats Text */}
          <div className="ml-4">
            <div className="text-white text-2xl font-bold">243K</div>
            <div className="text-text-muted text-[13px]">Happy Users</div>
          </div>
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(145deg, #2a2a2a, #1a1a1a)",
              border: "3px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)",
              opacity: 0.9,
            }}
          >
            <div 
              className="w-0 h-0 border-l-[14px] border-l-white border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1"
            />
          </div>
        </div>
      </div>

      {/* Bottom Right - Optimized Performance Card */}
      <div 
        className="fixed bottom-[12%] right-[8%] w-[360px] glass rounded-xl p-8 z-cards transition-all duration-400 hover:-translate-y-1"
        style={{
          borderColor: "rgba(255, 255, 255, 0.2)",
        }}
      >
        <h4 className="text-[22px] font-bold text-white leading-[1.3] mb-6">
          Optimized Performance
        </h4>
        
        {/* Gradient Progress Bar */}
        <div className="relative w-full h-3 rounded-full overflow-hidden mb-4" style={{
          background: "rgba(255, 255, 255, 0.1)",
        }}>
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, #ff1493 0%, #9333ea 50%, #00d4ff 100%)",
              width: "85%",
            }}
          />
        </div>
        
        {/* 243K Metric */}
        <div className="text-white text-3xl font-bold">243K</div>
      </div>
    </>
  );
}
