"use client";

import { useState } from "react";

interface VRNavigationProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

export function VRNavigation({ activeNav, setActiveNav }: VRNavigationProps) {
  const navItems = ["Home", "About", "Service", "Testimonials"];

  return (
    <nav 
      className="fixed top-0 left-0 right-0 h-20 z-navigation"
      style={{
        background: "rgba(0, 0, 0, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <div className="container mx-auto h-full flex items-center justify-between px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent-red flex items-center justify-center">
            <div className="w-5 h-5 bg-white rounded-sm" />
          </div>
          <span className="text-white text-xl font-semibold">Logoipsum</span>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center gap-10">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveNav(item)}
              className="text-[15px] transition-colors duration-300 ease-in-out"
              style={{
                color: activeNav === item ? "#ffffff" : "#a0a0a0",
              }}
              onMouseEnter={(e) => {
                if (activeNav !== item) {
                  e.currentTarget.style.color = "#ffffff";
                }
              }}
              onMouseLeave={(e) => {
                if (activeNav !== item) {
                  e.currentTarget.style.color = "#a0a0a0";
                }
              }}
            >
              {item}
            </button>
          ))}
        </div>

        {/* CTA Button */}
        <button
          className="px-8 py-3 rounded-full text-white text-[15px] font-semibold transition-all duration-300 ease-in-out"
          style={{
            background: "#ff0000",
            boxShadow: "0 4px 20px rgba(255, 0, 0, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 6px 28px rgba(255, 0, 0, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(255, 0, 0, 0.3)";
          }}
        >
          Contact us
        </button>
      </div>
    </nav>
  );
}
