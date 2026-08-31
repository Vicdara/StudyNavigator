import React from 'react';
import { useCurrentFrame, spring, useVideoConfig, interpolate, AbsoluteFill } from 'remotion';
import { Background } from '../components/Background';
import { ParticleField } from '../components/ParticleField';
import { Dashboard } from '../components/Dashboard';
import { PDFViewer } from '../components/PDFViewer';
import { ChatMessage } from '../components/ChatMessage';
import { GlowBadge } from '../components/GlowBadge';
import { THEME, PROJECT_NAME } from '../constants';

interface Scene5AskAIProps {
  projectName?: string;
}

export const Scene5AskAI: React.FC<Scene5AskAIProps> = ({
  projectName = PROJECT_NAME,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth camera zoom into the Study Copilot workspace
  const zoomEntrance = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 90 },
  });

  const appScale = interpolate(zoomEntrance, [0, 1], [0.9, 1.03]);
  const appTranslateY = interpolate(zoomEntrance, [0, 1], [35, 0]);

  const showSecondQuestion = frame >= 180;
  const showSecondAnswer = frame >= 220;

  return (
    <AbsoluteFill>
      <Background glowColor={THEME.colors.emerald} glowIntensity={1.3} />
      <ParticleField count={40} speedMultiplier={0.9} />

      {/* Top Floating Status Pill */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
        }}
      >
        <GlowBadge
          text="Grounded AI Study Copilot • Interactive Document Q&A"
          color={THEME.colors.emerald}
          size="md"
        />
      </div>

      {/* Main Workspace Shell */}
      <div
        style={{
          position: 'absolute',
          top: '80px',
          left: '50%',
          transform: `
            translateX(-50%)
            translateY(${appTranslateY}px)
            scale(${appScale})
          `,
          filter: 'drop-shadow(0 25px 60px rgba(0, 0, 0, 0.45))',
        }}
      >
        <Dashboard projectName={projectName} activeTab="workspace">
          <div style={{ display: 'flex', width: '100%', height: '100%', gap: '16px' }}>
            {/* Left: Synchronized Document Reader matching user screenshot */}
            <div style={{ flex: 1.1, height: '100%' }}>
              <PDFViewer
                title="Suvidha_AI_Hackathon_Workbook"
                currentPage={1}
                totalPages={9}
                highlightedSection={
                  showSecondQuestion
                    ? "Page 1: $500 Cash + Featherless AI credit"
                    : "Page 1: Overview, Eligibility & Key Rules"
                }
                isHighlighted={true}
              />
            </div>

            {/* Right: Interactive Study Copilot Panel */}
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
              {/* Header */}
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
              <div
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  overflow: 'hidden',
                }}
              >
                {/* Initial Copilot Response */}
                <ChatMessage sender="ai" />

                {/* Question 1 (typed by user at frame 10) */}
                <ChatMessage
                  sender="user"
                  text="Can you explain the prize pool and eligibility simply?"
                  delay={10}
                  showTypingEffect={true}
                />

                {/* Second Question (at frame 180) */}
                {showSecondQuestion && (
                  <ChatMessage
                    sender="user"
                    text="Can you give me an example idea to build?"
                    delay={180}
                    showTypingEffect={true}
                  />
                )}
              </div>

              {/* Quick Action Buttons matching user screenshot */}
              <div style={{ padding: '8px 16px', display: 'flex', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>✨ Explain</span>
                <span style={{ padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>📄 Summary</span>
                <span style={{ padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', color: '#9333ea', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>❓ Quiz</span>
                <span style={{ padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#d97706', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>💡 I'm Lost</span>
              </div>

              {/* Bottom Input Field matching user screenshot */}
              <div
                style={{
                  padding: '10px 16px',
                  borderTop: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <span style={{ fontSize: '16px', color: '#94a3b8', cursor: 'pointer' }}>📎</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {showSecondQuestion
                      ? 'Ask anything about Page 1 or attach images/docs...'
                      : 'Ask anything about Page 1 or attach images/docs...'}
                  </span>
                </div>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  ➤
                </div>
              </div>
            </div>
          </div>
        </Dashboard>
      </div>
    </AbsoluteFill>
  );
};
