import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { THEME } from '../constants';

interface BackgroundProps {
  glowColor?: string;
  gridOpacity?: number;
  glowIntensity?: number;
}

export const Background: React.FC<BackgroundProps> = ({
  glowColor = THEME.colors.primary,
  gridOpacity = 0.15,
  glowIntensity = 1,
}) => {
  const frame = useCurrentFrame();

  // Subtle floating motion for ambient light orbs
  const orb1X = interpolate(Math.sin(frame / 60), [-1, 1], [-100, 100]);
  const orb1Y = interpolate(Math.cos(frame / 70), [-1, 1], [-80, 80]);
  const orb2X = interpolate(Math.cos(frame / 55), [-1, 1], [100, -100]);
  const orb2Y = interpolate(Math.sin(frame / 65), [-1, 1], [80, -80]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.colors.bg,
        overflow: 'hidden',
      }}
    >
      {/* Subtle Grid Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          opacity: gridOpacity,
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 60%, transparent 100%)',
        }}
      />

      {/* Primary Ambient Glow Orb */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '30%',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glowColor} 0%, rgba(99, 102, 241, 0) 70%)`,
          filter: 'blur(120px)',
          opacity: 0.18 * glowIntensity,
          transform: `translate(${orb1X}px, ${orb1Y}px)`,
          pointerEvents: 'none',
        }}
      />

      {/* Secondary Cyan Glow Orb */}
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '25%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${THEME.colors.secondary} 0%, rgba(56, 189, 248, 0) 70%)`,
          filter: 'blur(130px)',
          opacity: 0.12 * glowIntensity,
          transform: `translate(${orb2X}px, ${orb2Y}px)`,
          pointerEvents: 'none',
        }}
      />

      {/* Accent Violet Center Glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '900px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(168, 85, 247, 0.08) 0%, transparent 70%)`,
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />

      {/* Vignette Edge Shading */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, transparent 50%, rgba(5, 6, 10, 0.75) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
