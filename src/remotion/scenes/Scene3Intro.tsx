import React from 'react';
import { useCurrentFrame, spring, useVideoConfig, interpolate, AbsoluteFill } from 'remotion';
import { Background } from '../components/Background';
import { ParticleField } from '../components/ParticleField';
import { Dashboard } from '../components/Dashboard';
import { PDFViewer } from '../components/PDFViewer';
import { ChatMessage } from '../components/ChatMessage';
import { TextReveal } from '../components/TextReveal';
import { GlowBadge } from '../components/GlowBadge';
import { THEME, PROJECT_NAME } from '../constants';

interface Scene3IntroProps {
  projectName?: string;
}

export const Scene3Intro: React.FC<Scene3IntroProps> = ({
  projectName = PROJECT_NAME,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cinematic App Window Reveal with Spring
  const windowEntrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 1.1, stiffness: 80 },
  });

  const scale = interpolate(windowEntrance, [0, 1], [0.65, 1]);
  const rotateX = interpolate(windowEntrance, [0, 1], [20, 0]);
  const translateY = interpolate(windowEntrance, [0, 1], [140, 0]);
  const opacity = interpolate(windowEntrance, [0, 1], [0, 1]);

  const glowPulse = interpolate(Math.sin(frame / 20), [-1, 1], [0.8, 1.2]);

  const exitProgress = interpolate(frame, [180, 208], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sceneScale = interpolate(exitProgress, [0, 1], [1, 0.85]);
  const sceneOpacity = interpolate(exitProgress, [0, 1], [1, 0.1]);

  return (
    <AbsoluteFill style={{ transform: `scale(${sceneScale})`, opacity: sceneOpacity }}>
      <Background glowColor={THEME.colors.emerald} glowIntensity={1.4} />
      <ParticleField count={45} speedMultiplier={1} />

      {/* Top Introducing Badge */}
      <div
        style={{
          position: 'absolute',
          top: '38px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
        }}
      >
        <GlowBadge
          text={`INTRODUCING ${projectName}`}
          color={THEME.colors.emerald}
          size="md"
        />
      </div>

      {/* Hero Typography */}
      <div
        style={{
          position: 'absolute',
          top: '88px',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          zIndex: 30,
        }}
      >
        <TextReveal
          text={projectName}
          delay={5}
          fontSize={58}
          fontWeight={900}
          gradient={THEME.gradients.brand}
        />
        <TextReveal
          text="Turn your learning material into an interactive experience."
          delay={25}
          fontSize={22}
          fontWeight={500}
          color={THEME.colors.textDim}
        />
      </div>

      {/* Cinematic 3D Application Window */}
      <div
        style={{
          position: 'absolute',
          top: '225px',
          left: '50%',
          transform: `
            translateX(-50%)
            translateY(${translateY}px)
            perspective(1200px)
            rotateX(${rotateX}deg)
            scale(${scale})
          `,
          opacity,
          transformOrigin: 'top center',
          filter: `drop-shadow(0 0 ${40 * glowPulse}px rgba(16, 185, 129, 0.35))`,
        }}
      >
        <Dashboard projectName={projectName} activeTab="workspace">
          <div style={{ display: 'flex', width: '100%', height: '100%', gap: '16px' }}>
            {/* Left: Document Reader */}
            <div style={{ flex: 1.1, height: '100%' }}>
              <PDFViewer
                title="Suvidha_AI_Hackathon_Workbook"
                currentPage={1}
                totalPages={9}
                isHighlighted={true}
              />
            </div>

            {/* Right: Study Copilot Panel */}
            <div
              style={{
                flex: 0.9,
                height: '100%',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Study Copilot Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                    }}
                  >
                    ★
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Study Copilot</span>
                  <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: 600 }}>P.1</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', color: '#94a3b8', fontSize: '13px' }}>
                  <span>↻</span>
                  <span>⚙</span>
                  <span>⤢</span>
                </div>
              </div>

              {/* Chat Body */}
              <div style={{ flex: 1, padding: '14px 16px', overflow: 'hidden' }}>
                <ChatMessage sender="ai" />
              </div>

              {/* Quick Action Pills matching user screenshot */}
              <div style={{ padding: '8px 16px', display: 'flex', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', fontSize: '11px', fontWeight: 600 }}>✨ Explain</span>
                <span style={{ padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', fontSize: '11px', fontWeight: 600 }}>📄 Summary</span>
                <span style={{ padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', color: '#9333ea', fontSize: '11px', fontWeight: 600 }}>❓ Quiz</span>
                <span style={{ padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#d97706', fontSize: '11px', fontWeight: 600 }}>💡 I'm Lost</span>
              </div>
            </div>
          </div>
        </Dashboard>
      </div>
    </AbsoluteFill>
  );
};
