'use client';

import React from 'react';

interface CopilotLogoProps {
  className?: string;
  size?: number;
}

export const CopilotLogo: React.FC<CopilotLogoProps> = ({ className = 'w-5.5 h-5.5', size }) => {
  const pixelSize = size || 22;
  return (
    <div
      style={{ width: `${pixelSize}px`, height: `${pixelSize}px`, minWidth: `${pixelSize}px`, minHeight: `${pixelSize}px` }}
      className={`relative flex items-center justify-center shrink-0 select-none ${className}`}
      title="Study Copilot AI"
    >
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full block"
      >
        {/* Theme-Adaptive Rounded Squircle */}
        <rect
          width="32"
          height="32"
          rx="9"
          fill="hsl(var(--primary))"
        />

        {/* Crisp Compass Circle */}
        <circle
          cx="16"
          cy="16"
          r="8.5"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="2.2"
        />

        {/* Compass Needle Diamond */}
        <path
          d="M20 12L14.5 14.5L12 20L17.5 17.5L20 12Z"
          fill="hsl(var(--primary-foreground))"
        />
      </svg>
    </div>
  );
};
