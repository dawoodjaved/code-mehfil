"use client";

export function VideoPlayers() {
  return (
    <>
      {/* Bottom Left Video Player - Only One */}
      <div className="fixed bottom-[8%] left-[8%] z-cards">
        <div 
          className="w-[280px] h-[160px] rounded-2xl relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(255, 0, 0, 0.2) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer"
              style={{
                background: "linear-gradient(145deg, #2a2a2a, #1a1a1a)",
                border: "3px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)",
              }}
            >
              <div 
                className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"
              />
            </div>
          </div>
        </div>

        {/* Card at Bottom */}
        <div 
          className="mt-4 rounded-xl p-4 glass"
        >
          <div className="text-white text-[15px] font-semibold">Business Intelligence</div>
        </div>
      </div>
    </>
  );
}
