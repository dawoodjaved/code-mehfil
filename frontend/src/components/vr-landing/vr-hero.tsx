"use client";

import { Headphones, Upload, RotateCcw, Camera } from "lucide-react";

export function VRHero() {
  return (
    <section className="relative h-screen flex items-center justify-center z-character">
      {/* Large Background Letters */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute left-[5%] top-1/2 -translate-y-1/2 text-[400px] font-bold text-white opacity-[0.03]"
          style={{
            fontFamily: "'Inter', sans-serif",
            letterSpacing: "-0.05em",
          }}
        >
          E
        </div>
        <div 
          className="absolute right-[5%] top-1/2 -translate-y-1/2 text-[400px] font-bold text-white opacity-[0.03]"
          style={{
            fontFamily: "'Inter', sans-serif",
            letterSpacing: "-0.05em",
          }}
        >
          n
        </div>
      </div>

      {/* Main Headline */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <h1 className="text-[96px] font-bold text-white leading-none tracking-[-0.03em] text-center">
          VR<br />Exploration
        </h1>
      </div>

      {/* Semi-Circular Character Placeholder */}
      <div className="relative z-20 flex items-center justify-center">
        <div 
          className="relative w-[500px] h-[500px] flex items-center justify-center"
        >
          {/* Semi-circular shape with arched cutout - using SVG for precise shape */}
          <svg 
            width="400" 
            height="400" 
            viewBox="0 0 400 400" 
            className="absolute"
            style={{
              filter: "drop-shadow(0 0 60px rgba(147, 51, 234, 0.5))",
            }}
          >
            <defs>
              <linearGradient id="characterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff1493" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>
            </defs>
            {/* Semi-circular arch shape with inner cutout */}
            <path
              d="M 50 350 
                 Q 50 200 200 50 
                 Q 350 200 350 350 
                 L 50 350 Z
                 M 200 200
                 A 140 100 0 0 0 200 300
                 A 140 100 0 0 0 200 200 Z"
              fill="url(#characterGradient)"
              fillRule="evenodd"
              opacity="0.9"
            />
          </svg>
        </div>
      </div>

      {/* Floating UI Elements */}
      {/* Top Icon - Headphones */}
      <div 
        className="absolute top-[25%] left-[15%] w-14 h-14 rounded-full flex items-center justify-center floating-icon z-floating-icons"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        <Headphones className="w-7 h-7 text-white" />
      </div>

      {/* Right Icon - Camera (Orange) */}
      <div 
        className="absolute top-[25%] right-[15%] w-14 h-14 rounded-full flex items-center justify-center floating-icon z-floating-icons"
        style={{
          background: "rgba(255, 107, 53, 0.2)",
          border: "1px solid rgba(255, 107, 53, 0.3)",
        }}
      >
        <Camera className="w-7 h-7 text-white" />
      </div>

      {/* Bottom Left Icon - Upload */}
      <div 
        className="absolute bottom-[30%] left-[15%] w-14 h-14 rounded-full flex items-center justify-center floating-icon z-floating-icons"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        <Upload className="w-7 h-7 text-white" />
      </div>

      {/* Bottom Center Icon - Rotate */}
      <div 
        className="absolute bottom-[30%] left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center floating-icon z-floating-icons"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        <RotateCcw className="w-7 h-7 text-white" />
      </div>
    </section>
  );
}
