import React from 'react';
import { useCurrentFrame, spring, useVideoConfig, interpolate, AbsoluteFill } from 'remotion';
import { Background } from '../components/Background';
import { ParticleField } from '../components/ParticleField';
import { Document } from '../components/Document';
import { TextReveal } from '../components/TextReveal';
import { THEME } from '../constants';

export const Scene2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Freeze timestamp at frame 115
  const freezeFrame = 115;
  const isFrozen = frame >= freezeFrame;
  const activeAnimFrame = isFrozen ? freezeFrame : frame;

  // Stacking pile of documents
  const stackItems = [
    { title: 'Biology_101_Cell_Metabolism.pdf', type: 'pdf' as const, x: -380, y: -60, rot: -14, delay: 0 },
    { title: 'Linear_Algebra_Eigenvectors.notes', type: 'notes' as const, x: 360, y: -80, rot: 16, delay: 10 },
    { title: 'Microeconomics_Supply_Demand.pptx', type: 'slides' as const, x: -220, y: 120, rot: 8, delay: 20 },
    { title: 'Neuroscience_Synaptic_Plasticity.pdf', type: 'pdf' as const, x: 260, y: 110, rot: -10, delay: 30 },
    { title: 'Chemistry_Reaction_Mechanisms.jpg', type: 'images' as const, x: -440, y: 180, rot: -22, delay: 40 },
    { title: 'Computer_Architecture_Pipelines.pdf', type: 'pdf' as const, x: 420, y: 190, rot: 19, delay: 50 },
    { title: 'Calculus_3_Multivariable_Integrals.pdf', type: 'pdf' as const, x: 0, y: 0, rot: 0, delay: 60 },
  ];

  // Overload counter animation (rising rapidly)
  const pageCounter = Math.floor(
    interpolate(activeAnimFrame, [0, freezeFrame], [12, 384], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );

  // Time-dilation blur & freeze effect
  const freezeFlash = isFrozen
    ? interpolate(frame - freezeFrame, [0, 8, 25], [0.8, 0.4, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  // Exit collapse into center (frame 175 -> 210)
  const exitProgress = interpolate(frame, [175, 208], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const sceneScale = interpolate(exitProgress, [0, 1], [1, 0.4]);
  const sceneOpacity = interpolate(exitProgress, [0, 1], [1, 0.05]);

  return (
    <AbsoluteFill style={{ transform: `scale(${sceneScale})`, opacity: sceneOpacity }}>
      <Background glowColor={THEME.colors.rose} glowIntensity={isFrozen ? 0.8 : 1.3} />
      <ParticleField count={60} speedMultiplier={isFrozen ? 0.1 : 2} />

      {/* Freeze Flash Pulse */}
      {freezeFlash > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#ffffff',
            opacity: freezeFlash,
            pointerEvents: 'none',
            zIndex: 50,
          }}
        />
      )}

      {/* Overload Information Counter Pill */}
      <div
        style={{
          position: 'absolute',
          top: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '10px 24px',
          borderRadius: '9999px',
          backgroundColor: isFrozen ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${isFrozen ? THEME.colors.rose : 'rgba(255, 255, 255, 0.1)'}`,
          backdropFilter: 'blur(16px)',
          boxShadow: isFrozen ? '0 0 30px rgba(244, 63, 94, 0.4)' : 'none',
          zIndex: 30,
          transition: 'all 0.3s ease',
        }}
      >
        <span
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: isFrozen ? THEME.colors.rose : THEME.colors.amber,
            boxShadow: `0 0 12px ${isFrozen ? THEME.colors.rose : THEME.colors.amber}`,
          }}
        />
        <span
          style={{
            fontFamily: THEME.monoFamily,
            fontSize: '14px',
            fontWeight: 700,
            color: '#f8fafc',
          }}
        >
          {pageCounter} Pages Disorganized • 7 Subjects • Exam in 48 Hours
        </span>
      </div>

      {/* Stacking Chaotic Pile of Documents */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {stackItems.map((item, idx) => {
          const itemSpring = spring({
            frame: activeAnimFrame - item.delay,
            fps,
            config: { damping: 10, mass: 0.8, stiffness: 110 },
          });

          const scale = interpolate(itemSpring, [0, 1], [0.3, 0.95]);
          const opacity = interpolate(itemSpring, [0, 1], [0, 0.9]);

          // Slight shake when entering
          const shake = !isFrozen ? Math.sin((activeAnimFrame + idx * 15) / 5) * 3 : 0;

          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                transform: `
                  translate(${item.x + shake}px, ${item.y + shake}px)
                  rotate(${item.rot}deg)
                  scale(${scale})
                `,
                opacity,
                zIndex: idx + 5,
                filter: isFrozen && idx !== stackItems.length - 1 ? 'brightness(0.6) saturate(0.6)' : 'none',
                transition: 'filter 0.4s ease',
              }}
            >
              <Document
                title={item.title}
                type={item.type}
                category="Scattered Sources"
                badge="Unstructured"
                glowColor={isFrozen ? THEME.colors.rose : THEME.colors.amber}
                scale={0.9}
                showDiagram={idx % 2 === 0}
              />
            </div>
          );
        })}
      </div>

      {/* Impact Typography after Freeze */}
      {isFrozen && (
        <div
          style={{
            position: 'absolute',
            bottom: '75px',
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            zIndex: 40,
          }}
        >
          <TextReveal
            text="Too much information."
            delay={freezeFrame + 5}
            fontSize={54}
            fontWeight={900}
            color="#ffffff"
            style={{ textShadow: '0 0 30px rgba(244, 63, 94, 0.6)' }}
          />

          {frame >= freezeFrame + 30 && (
            <TextReveal
              text="Too little clarity."
              delay={freezeFrame + 30}
              fontSize={40}
              fontWeight={700}
              color={THEME.colors.rose}
            />
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};
