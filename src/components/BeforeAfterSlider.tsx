import React, { useState } from "react";
import { GripVertical, MousePointer2 } from "lucide-react";

export const BeforeAfterSlider: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isHovering, setIsHovering] = useState(false);

  const handleDrag = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <div
      className="relative w-full max-w-4xl mx-auto aspect-video rounded-2xl overflow-hidden border-4 border-white dark:border-zinc-800 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] group select-none"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* 1. "Before" Image (The Boring One) */}
      <div className="absolute inset-0 w-full h-full">
        <img
          // Using a raw, flat-lighting portrait from Unsplash
          src="before.png"
          className="w-full h-full object-cover filter grayscale-[30%] brightness-90"
          alt="Boring Original"
        />

        {/* Before Label */}
        {/* <div className="absolute top-6 right-6 bg-black backdrop-blur-md text-brand-yellow px-4 py-2 rounded-lg font-bold text-sm border border-brand-yellow/30">
          BEFORE: Boring Original
        </div> */}
      </div>

      {/* 2. "After" Image (The Viral One) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{
          clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
        }}
      >
        <img
          // Using a high-contrast, expressive version (simulated viral style)
          src="after.jpeg"
          className="w-full h-full object-cover filter contrast-125 saturate-150"
          alt=""
        />

        {/* Viral Overlay Effects */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-yellow/20 to-transparent mix-blend-overlay opacity-50"></div>

        {/* Viral Badge */}
        {/* <div className="absolute top-6 left-6 bg-brand-yellow text-black px-4 py-1.5 rounded-lg font-black text-sm shadow-xl transform rotate-2 border-2 border-white">
          VIRAL MODE ON
        </div> */}

        {/* Stats Badge */}
        {/* <div className="absolute bottom-6 right-6 bg-black/80 backdrop-blur-xl text-brand-yellow px-5 py-3 rounded-xl font-bold text-lg border border-brand-yellow/30 shadow-2xl flex flex-col items-center leading-tight">
          <span>CTR +420%</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">
            Skyrocketing
          </span>
        </div> */}
      </div>

      {/* 3. Slider Handle */}
      <div
        className="absolute inset-y-0 w-1 bg-white cursor-ew-resize z-20"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center justify-center text-black border-4 border-brand-yellow transition-transform hover:scale-110 active:scale-95">
          <GripVertical size={24} className="opacity-80" />
        </div>
      </div>

      {/* Invisible Range Input for Dragging */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={handleDrag}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
      />

      {/* Floating Hint */}
      {isHovering && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-xs font-bold backdrop-blur-sm pointer-events-none animate-bounce">
          <MousePointer2 size={12} className="inline mr-2" /> Drag to compare
        </div>
      )}
    </div>
  );
};
