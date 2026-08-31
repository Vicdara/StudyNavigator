import React from 'react';
import { useCurrentFrame, spring, useVideoConfig } from 'remotion';

interface TextRevealProps {
  text: string;
  delay?: number;
  fontSize?: number | string;
  fontWeight?: number | string;
  gradient?: string;
  color?: string;
  letterSpacing?: string;
  style?: React.CSSProperties;
  stagger?: number;
  align?: 'left' | 'center' | 'right';
  fontFamily?: string;
}

export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  delay = 0,
  fontSize = 48,
  fontWeight = 700,
  gradient,
  color = '#f8fafc',
  letterSpacing = '-0.02em',
  style = {},
  stagger = 2,
  align = 'center',
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = text.split(' ');

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        gap: '0.3em',
        fontFamily,
        ...style,
      }}
    >
      {words.map((word, wordIndex) => {
        const wordDelay = delay + wordIndex * stagger;
        const progress = spring({
          frame: frame - wordDelay,
          fps,
          config: {
            damping: 14,
            mass: 0.6,
            stiffness: 120,
          },
        });

        const opacity = Math.min(Math.max(progress, 0), 1);
        const translateY = (1 - opacity) * 35;
        const blur = (1 - opacity) * 8;

        return (
          <span
            key={wordIndex}
            style={{
              display: 'inline-block',
              fontSize,
              fontWeight,
              letterSpacing,
              color: gradient ? 'transparent' : color,
              background: gradient || 'none',
              WebkitBackgroundClip: gradient ? 'text' : 'unset',
              WebkitTextFillColor: gradient ? 'transparent' : color,
              opacity,
              transform: `translateY(${translateY}px)`,
              filter: blur > 0.5 ? `blur(${blur}px)` : 'none',
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
