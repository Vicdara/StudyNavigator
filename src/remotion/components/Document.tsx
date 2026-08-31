import React from 'react';
import { THEME } from '../constants';

export interface DocumentProps {
  title?: string;
  type?: 'pdf' | 'notes' | 'slides' | 'images';
  category?: string;
  badge?: string;
  pageNumber?: number;
  highlightLines?: number[];
  glowColor?: string;
  scale?: number;
  showDiagram?: boolean;
}

export const Document: React.FC<DocumentProps> = ({
  title = "Machine Learning & Neural Networks.pdf",
  type = "pdf",
  category = "Computer Science 401",
  badge = "48 Pages • PDF",
  pageNumber = 14,
  highlightLines = [3, 4],
  glowColor = THEME.colors.primary,
  scale = 1,
  showDiagram = true,
}) => {
  const typeIcons: Record<string, string> = {
    pdf: "PDF",
    notes: "NOTE",
    slides: "SLIDE",
    images: "IMG",
  };

  const typeColors: Record<string, string> = {
    pdf: "#ef4444",
    notes: "#3b82f6",
    slides: "#f59e0b",
    images: "#10b981",
  };

  return (
    <div
      style={{
        width: `${340 * scale}px`,
        height: `${440 * scale}px`,
        backgroundColor: '#0f111a',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 25px ${glowColor}1a`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Document Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: `${typeColors[type]}22`,
              color: typeColors[type],
              fontSize: '10px',
              fontWeight: 700,
              fontFamily: THEME.monoFamily,
            }}
          >
            {typeIcons[type]}
          </span>
          <span
            style={{
              color: THEME.colors.textDim,
              fontSize: '11px',
              fontWeight: 500,
            }}
          >
            {category}
          </span>
        </div>
        <span
          style={{
            color: THEME.colors.textDim,
            fontSize: '10px',
            fontFamily: THEME.monoFamily,
          }}
        >
          p.{pageNumber}
        </span>
      </div>

      {/* Document Content Body */}
      <div
        style={{
          padding: '16px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          backgroundColor: '#0b0d14',
        }}
      >
        {/* Title */}
        <div>
          <div
            style={{
              color: '#f8fafc',
              fontSize: '13px',
              fontWeight: 700,
              lineHeight: 1.3,
              marginBottom: '4px',
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: THEME.colors.textMuted,
              fontSize: '10px',
            }}
          >
            {badge}
          </div>
        </div>

        {/* Realistic Mock Text Lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const isHighlighted = highlightLines.includes(idx);
            const widths = ['100%', '92%', '96%', '88%', '94%', '70%'];

            return (
              <div
                key={idx}
                style={{
                  height: '8px',
                  width: widths[idx % widths.length],
                  borderRadius: '3px',
                  backgroundColor: isHighlighted
                    ? 'rgba(99, 102, 241, 0.45)'
                    : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: isHighlighted
                    ? '0 0 10px rgba(99, 102, 241, 0.4)'
                    : 'none',
                  border: isHighlighted
                    ? '1px solid rgba(99, 102, 241, 0.8)'
                    : 'none',
                  transition: 'all 0.3s ease',
                }}
              />
            );
          })}
        </div>

        {/* Embedded Diagram / Chart Simulation */}
        {showDiagram && (
          <div
            style={{
              marginTop: '6px',
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '9px',
                color: THEME.colors.textDim,
                fontFamily: THEME.monoFamily,
              }}
            >
              <span>Fig 4.2: Loss Optimization</span>
              <span>∇L(θ)</span>
            </div>
            {/* SVG Wave / Loss Function Curve */}
            <svg width="100%" height="45" viewBox="0 0 280 45" fill="none">
              <path
                d="M 10 38 Q 60 5, 120 25 T 270 12"
                stroke={THEME.colors.secondary}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M 10 38 Q 60 5, 120 25 T 270 12 L 270 45 L 10 45 Z"
                fill="url(#grad)"
                opacity="0.2"
              />
              <circle cx="120" cy="25" r="3.5" fill={THEME.colors.accent} />
              <circle cx="210" cy="18" r="3" fill={THEME.colors.primary} />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={THEME.colors.secondary} />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}

        {/* Extra text lines after diagram */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ height: '7px', width: '95%', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px' }} />
          <div style={{ height: '7px', width: '80%', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px' }} />
        </div>
      </div>
    </div>
  );
};
