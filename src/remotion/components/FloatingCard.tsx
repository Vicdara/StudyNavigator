import React from 'react';
import { useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion';
import { THEME } from '../constants';

interface FloatingCardProps {
  children: React.ReactNode;
  delay?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  glowColor?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  enableFloating?: boolean;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  delay = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  glowColor = THEME.colors.primary,
  width = 'auto',
  height = 'auto',
  style = {},
  enableFloating = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 15,
      mass: 0.8,
      stiffness: 100,
    },
  });

  const scale = interpolate(entrance, [0, 1], [0.85, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  // Subtle floating oscillation
  const floatY = enableFloating
    ? Math.sin((frame + delay * 10) / 35) * 6
    : 0;
  const floatRotateZ = enableFloating
    ? Math.cos((frame + delay * 10) / 45) * 1.5
    : 0;

  return (
    <div
      style={{
        width,
        height,
        perspective: '1200px',
        transformStyle: 'preserve-3d',
        opacity,
        transform: `scale(${scale})`,
        ...style,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `
            translateY(${floatY}px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            rotateZ(${rotateZ + floatRotateZ}deg)
          `,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%), rgba(15, 17, 26, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: `
            0 20px 50px rgba(0, 0, 0, 0.6),
            0 0 30px ${glowColor}22,
            inset 0 1px 1px rgba(255, 255, 255, 0.15)
          `,
          overflow: 'hidden',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* Subtle Top Specular Shine */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
          }}
        />
        {children}
      </div>
    </div>
  );
};
