import React from 'react';
import { THEME } from '../constants';

interface GlowBadgeProps {
  text: string;
  icon?: React.ReactNode;
  color?: string;
  glow?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const GlowBadge: React.FC<GlowBadgeProps> = ({
  text,
  icon,
  color = THEME.colors.primary,
  glow = true,
  size = 'md',
}) => {
  const paddingMap = {
    sm: '4px 10px',
    md: '6px 14px',
    lg: '8px 18px',
  };

  const fontMap = {
    sm: '12px',
    md: '14px',
    lg: '16px',
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: paddingMap[size],
        borderRadius: '9999px',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        border: `1px solid ${color}44`,
        boxShadow: glow ? `0 0 20px ${color}22, inset 0 1px 0 rgba(255,255,255,0.15)` : 'none',
        backdropFilter: 'blur(12px)',
        color: '#f8fafc',
        fontSize: fontMap[size],
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}`,
        }}
      />
      {icon}
      <span>{text}</span>
    </div>
  );
};
