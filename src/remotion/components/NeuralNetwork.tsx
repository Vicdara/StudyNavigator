import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { THEME } from '../constants';

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  category: string;
}

export const NeuralNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const nodes: Node[] = [
    { id: '1', label: 'Backpropagation', x: 260, y: 140, color: THEME.colors.primary, category: 'Core Concept' },
    { id: '2', label: 'Gradient Descent', x: 500, y: 80, color: THEME.colors.secondary, category: 'Optimization' },
    { id: '3', label: 'Loss Landscape', x: 440, y: 260, color: THEME.colors.accent, category: 'Mathematics' },
    { id: '4', label: 'Activation Function', x: 740, y: 150, color: THEME.colors.primaryLight, category: 'Architecture' },
    { id: '5', label: 'Vanishing Gradients', x: 200, y: 310, color: THEME.colors.rose, category: 'Pitfall' },
    { id: '6', label: 'Learning Rate Schedule', x: 680, y: 320, color: THEME.colors.emerald, category: 'Hyperparameters' },
  ];

  const links = [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 4 },
    { from: 2, to: 5 },
    { from: 3, to: 5 },
    { from: 0, to: 4 },
  ];

  return (
    <div
      style={{
        position: 'relative',
        width: '900px',
        height: '420px',
        borderRadius: '20px',
        backgroundColor: 'rgba(15, 17, 26, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 35px rgba(99, 102, 241, 0.2)',
        overflow: 'hidden',
      }}
    >
      {/* SVG Interconnecting Neural Synaptic Lines */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={THEME.colors.secondary} stopOpacity="0.8" />
            <stop offset="100%" stopColor={THEME.colors.accent} stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {links.map((link, idx) => {
          const n1 = nodes[link.from];
          const n2 = nodes[link.to];

          // Traveling light pulse along the line
          const pulseOffset = ((frame * 1.5 + idx * 30) % 100) / 100;
          const px = n1.x + (n2.x - n1.x) * pulseOffset;
          const py = n1.y + (n2.y - n1.y) * pulseOffset;

          return (
            <React.Fragment key={idx}>
              <line
                x1={n1.x}
                y1={n1.y}
                x2={n2.x}
                y2={n2.y}
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <line
                x1={n1.x}
                y1={n1.y}
                x2={n2.x}
                y2={n2.y}
                stroke="url(#lineGrad)"
                strokeWidth="1.5"
                strokeOpacity={0.4}
              />
              {/* Glowing Pulse Dot */}
              <circle
                cx={px}
                cy={py}
                r="4"
                fill="#ffffff"
                filter="drop-shadow(0 0 6px #38bdf8)"
              />
            </React.Fragment>
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node, idx) => {
        const nodeSpring = spring({
          frame: frame - idx * 5,
          fps,
          config: { damping: 12, stiffness: 120 },
        });

        const scale = interpolate(nodeSpring, [0, 1], [0.4, 1]);
        const opacity = interpolate(nodeSpring, [0, 1], [0, 1]);
        const wobble = Math.sin((frame + idx * 20) / 30) * 4;

        return (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              left: `${node.x}px`,
              top: `${node.y + wobble}px`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            {/* Center Glowing Orb */}
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: node.color,
                boxShadow: `0 0 20px ${node.color}, 0 0 40px ${node.color}66`,
                border: '2px solid #ffffff',
                marginBottom: '8px',
              }}
            />

            {/* Glass Label Card */}
            <div
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(10, 12, 20, 0.9)',
                border: `1px solid ${node.color}55`,
                boxShadow: `0 8px 20px rgba(0, 0, 0, 0.5)`,
                backdropFilter: 'blur(10px)',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontFamily: THEME.monoFamily,
                  color: node.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 600,
                  marginBottom: '2px',
                }}
              >
                {node.category}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                {node.label}
              </div>
            </div>
          </div>
        );
      })}

      {/* Top Left Header Badge */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: THEME.colors.secondary,
            boxShadow: `0 0 10px ${THEME.colors.secondary}`,
          }}
        />
        <span
          style={{
            fontSize: '12px',
            fontFamily: THEME.monoFamily,
            color: '#cbd5e1',
            fontWeight: 600,
          }}
        >
          Neural Concept Graph Active • 18 Core Nodes Connected
        </span>
      </div>
    </div>
  );
};
