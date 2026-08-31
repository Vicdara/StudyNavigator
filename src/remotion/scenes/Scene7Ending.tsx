import React from 'react';
import { useCurrentFrame, spring, useVideoConfig, interpolate, AbsoluteFill } from 'remotion';
import { Background } from '../components/Background';
import { ParticleField } from '../components/ParticleField';
import { TextReveal } from '../components/TextReveal';
import { GlowBadge } from '../components/GlowBadge';
import { THEME, PROJECT_NAME, PROJECT_SUBTITLE, EVENT_TAG } from '../constants';

interface Scene7EndingProps {
  projectName?: string;
  subtitle?: string;
  eventTag?: string;
}

export const Scene7Ending: React.FC<Scene7EndingProps> = ({
  projectName = PROJECT_NAME,
  subtitle = PROJECT_SUBTITLE,
  eventTag = EVENT_TAG,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 18, mass: 1, stiffness: 80 },
  });

  const scale = interpolate(entrance, [0, 1], [0.85, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  const haloScale = interpolate(Math.sin(frame / 25), [-1, 1], [0.9, 1.15]);
  const haloOpacity = interpolate(Math.sin(frame / 25), [-1, 1], [0.35, 0.65]);

  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, opacity }}>
      <Background glowColor={THEME.colors.emerald} glowIntensity={1.8} />
      <ParticleField count={60} speedMultiplier={0.7} />

      {/* Center Hero Card & Branding */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          zIndex: 30,
        }}
      >
        {/* Pulsing Radial Halo */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(56, 189, 248, 0.1) 45%, transparent 70%)',
            filter: 'blur(70px)',
            transform: `scale(${haloScale})`,
            opacity: haloOpacity,
            pointerEvents: 'none',
          }}
        />

        {/* Brand Icon */}
        <div
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '26px',
            background: 'linear-gradient(135deg, #34d399, #10b981, #38bdf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 50px rgba(16, 185, 129, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            marginBottom: '8px',
          }}
        >
          <span style={{ fontSize: '44px', fontWeight: 900, color: '#ffffff' }}>✦</span>
        </div>

        {/* Product Title */}
        <TextReveal
          text={projectName}
          delay={10}
          fontSize={72}
          fontWeight={900}
          gradient={THEME.gradients.brand}
        />

        {/* Subtitle / Tagline */}
        <TextReveal
          text={subtitle}
          delay={25}
          fontSize={28}
          fontWeight={500}
          color="#cbd5e1"
        />

        {/* Event Badge / Call to Action */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginTop: '16px',
          }}
        >
          <GlowBadge
            text={eventTag}
            color={THEME.colors.emerald}
            size="lg"
          />

          <div
            style={{
              padding: '8px 20px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
            }}
          >
            Experience StudyNavigator →
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
