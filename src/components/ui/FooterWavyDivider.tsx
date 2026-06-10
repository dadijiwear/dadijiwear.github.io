"use client";

import React from "react";

export function FooterWavyDivider() {
  return (
    <div className="w-full overflow-hidden leading-[0] bg-transparent relative z-20">
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className="relative block w-full h-[70px] md:h-[90px]"
        xmlns="http://www.w3.org/2000/svg"
      >
      
        <path
          d="M0,30 C240,5 480,45 720,25 C960,5 1200,35 1440,15 L1440,100 L0,100 Z"
          className="fill-dadi-cream/40 dark:fill-black/30 transition-colors duration-300"
        />

        <path
          d="M0,50 C300,20 600,70 900,40 C1140,15 1290,35 1440,25 L1440,100 L0,100 Z"
          className="fill-dadi-gold transition-colors duration-300"
        />

        <path
          d="M0,65 C360,35 720,85 1080,50 C1260,35 1350,45 1440,55 L1440,100 L0,100 Z"
          className="fill-dadi-green transition-colors duration-300"
        />

        <path
          d="M0,65 C360,35 720,85 1080,50 C1260,35 1350,45 1440,55"
          fill="none"
          className="stroke-white/25 dark:stroke-white/15"
          strokeWidth="1.5"
          strokeDasharray="5 5"
        />
      </svg>
    </div>
  );
}
