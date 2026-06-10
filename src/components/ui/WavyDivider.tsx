"use client";

import React from "react";

interface WavyDividerProps {
  className?: string;
}

export function WavyDivider({ className = "" }: WavyDividerProps) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${className}`}>
      <svg
        viewBox="0 0 1440 70"
        preserveAspectRatio="none"
        className="relative block w-full h-[60px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Layer 1: Subtle Accent Depth Wave (Elegant Gold Blend) */}
        <path
          d="M0,35 C280,15 560,55 840,35 C1120,15 1260,45 1440,30 L1440,70 L0,70 Z"
          style={{ fill: "var(--accent-gold)", opacity: 0.12 }}
          className="transition-all duration-300"
        />

        {/* Layer 2: Main Wave (Matches the next section's bg-dadi-cream perfectly) */}
        <path
          d="M0,45 C360,20 720,65 1080,30 C1260,15 1350,25 1440,40 L1440,70 L0,70 Z"
          style={{ fill: "var(--cream-light)" }}
          className="transition-all duration-300"
        />
      </svg>
    </div>
  );
}

