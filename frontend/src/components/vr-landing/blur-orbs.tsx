"use client";

export function BlurOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-background">
      {/* Blue Blur Orb - Top Left */}
      <div 
        className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full blur-orb"
        style={{
          background: "#00d4ff",
          transform: "translate(-50%, -50%)",
        }}
      />
      
      {/* Red Blur Orb - Top Right */}
      <div 
        className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-orb-strong"
        style={{
          background: "#ff0033",
          transform: "translate(50%, -50%)",
        }}
      />
      
      {/* Purple Blur Orb - Bottom Left */}
      <div 
        className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full blur-orb"
        style={{
          background: "#9333ea",
          transform: "translate(-30%, 30%)",
        }}
      />
      
      {/* Cyan Blur Orb - Bottom Right */}
      <div 
        className="absolute bottom-0 right-0 w-[250px] h-[250px] rounded-full blur-orb"
        style={{
          background: "#00d4ff",
          transform: "translate(30%, 30%)",
        }}
      />
      
      {/* Center Purple Orb - Subtle */}
      <div 
        className="absolute top-1/2 left-1/2 w-[200px] h-[200px] rounded-full blur-orb"
        style={{
          background: "#9333ea",
          transform: "translate(-50%, -50%)",
          opacity: 0.1,
        }}
      />
    </div>
  );
}
