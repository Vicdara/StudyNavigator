import React from 'react';
import { useCurrentFrame, spring, useVideoConfig, interpolate, AbsoluteFill } from 'remotion';
import { Background } from '../components/Background';
import { ParticleField } from '../components/ParticleField';
import { Document } from '../components/Document';
import { StudyCard } from '../components/StudyCard';
import { TextReveal } from '../components/TextReveal';
import { THEME } from '../constants';

export const Scene6Transformation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const sceneScale = interpolate(entrance, [0, 1], [0.8, 1]);
  const sceneOpacity = interpolate(entrance, [0, 1], [0, 1]);

  // Transition arrow pulsation
  const arrowPulse = interpolate(Math.sin(frame / 12), [-1, 1], [0.85, 1.15]);

  return (
    <AbsoluteFill style={{ transform: `scale(${sceneScale})`, opacity: sceneOpacity }}>
      <Background glowColor={THEME.colors.primary} glowIntensity={1.5} />
      <ParticleField count={50} speedMultiplier={1.4} />

      {/* Top Climax Typography */}
      <div
        style={{
          position: 'absolute',
          top: '60px',
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
          text="From information..."
          delay={5}
          fontSize={48}
          fontWeight={800}
          color="#94a3b8"
        />

        {frame >= 35 && (
          <TextReveal
            text="...to understanding."
            delay={35}
            fontSize={56}
            fontWeight={900}
            gradient={THEME.gradients.brand}
          />
        )}
      </div>

      {/* Side-by-Side Comparison Container */}
      <div
        style={{
          position: 'absolute',
          top: '210px',
          bottom: '50px',
          left: '100px',
          right: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left Side: "Before" Messy Raw Notes */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            position: 'relative',
          }}
        >
          <div
            style={{
              padding: '4px 14px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              border: `1px solid ${THEME.colors.rose}44`,
              color: THEME.colors.rose,
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: THEME.monoFamily,
            }}
          >
            BEFORE: SCATTERED & OVERWHELMING
          </div>

          <div style={{ position: 'relative', width: '360px', height: '420px' }}>
            <div style={{ position: 'absolute', transform: 'rotate(-8deg) translate(-20px, 10px)', opacity: 0.7 }}>
              <Document title="Loose_Notes_01.pdf" type="notes" scale={0.8} />
            </div>
            <div style={{ position: 'absolute', transform: 'rotate(10deg) translate(25px, -15px)', opacity: 0.8 }}>
              <Document title="Textbook_Raw_Scan.jpg" type="images" scale={0.82} />
            </div>
            <div style={{ position: 'absolute', transform: 'rotate(-2deg)', zIndex: 10 }}>
              <Document title="Messy_Lecture_Slides.pptx" type="slides" scale={0.85} glowColor={THEME.colors.rose} />
            </div>
          </div>
        </div>

        {/* Center: Glowing Animated Synthesis Pipeline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            padding: '24px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #38bdf8, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 35px rgba(99, 102, 241, 0.6)',
              transform: `scale(${arrowPulse})`,
            }}
          >
            <span style={{ fontSize: '24px', color: '#ffffff', fontWeight: 900 }}>➔</span>
          </div>

          <div
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: THEME.colors.secondary,
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: THEME.monoFamily,
            }}
          >
            AI SYNTHESIS ENGINE
          </div>
        </div>

        {/* Right Side: "After" Clean Interactive Mastery */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              padding: '4px 14px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${THEME.colors.emerald}44`,
              color: THEME.colors.emerald,
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: THEME.monoFamily,
            }}
          >
            AFTER: INTERACTIVE & ORGANIZED
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '380px' }}>
            <StudyCard type="flashcard" scale={0.95} />
            <StudyCard type="quiz" scale={0.95} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
