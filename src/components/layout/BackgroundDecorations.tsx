"use client";

import React from 'react';

export function BackgroundDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none" style={{ zIndex: -1 }}>

      <div className="bg-pattern" aria-hidden="true">
        <div className="bg-shape"></div>
        <div className="bg-shape"></div>
        <div className="bg-shape"></div>
        <div className="bg-shape"></div>
      </div>

      <div className="paper-texture" aria-hidden="true" style={{ zIndex: -1 }}></div>
    </div>
  );
}
