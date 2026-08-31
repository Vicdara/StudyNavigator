import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { Background } from '../components/Background';
import { ParticleField } from '../components/ParticleField';
import { StepIndicator } from '../components/StepIndicator';
import { UploadAnimation } from '../components/UploadAnimation';
import { AIProcessing } from '../components/AIProcessing';
import { StudyCard } from '../components/StudyCard';
import { THEME } from '../constants';

export const Scene4HowItWorks: React.FC = () => {
  const frame = useCurrentFrame();

  // 3 Stage Timings:
  // Step 1: 0 - 135
  // Step 2: 135 - 275
  // Step 3: 275 - 420
  let currentStep: 1 | 2 | 3 = 1;
  if (frame >= 275) {
    currentStep = 3;
  } else if (frame >= 135) {
    currentStep = 2;
  }

  // Crossfade between sub-scenes
  const step1Opacity = interpolate(frame, [0, 10, 125, 140], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const step2Opacity = interpolate(frame, [135, 145, 265, 280], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const step3Opacity = interpolate(frame, [275, 285, 410, 420], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <Background
        glowColor={
          currentStep === 1
            ? THEME.colors.primary
            : currentStep === 2
            ? THEME.colors.secondary
            : THEME.colors.accent
        }
      />
      <ParticleField count={45} speedMultiplier={1.2} />

      {/* Top Stepper Indicator */}
      <div
        style={{
          position: 'absolute',
          top: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
        }}
      >
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* Main Interactive Stage Container */}
      <div
        style={{
          position: 'absolute',
          top: '150px',
          bottom: '40px',
          left: '60px',
          right: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Step 1: UPLOAD */}
        {frame < 145 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: step1Opacity,
            }}
          >
            <UploadAnimation />
          </div>
        )}

        {/* Step 2: UNDERSTAND */}
        {frame >= 130 && frame < 285 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: step2Opacity,
            }}
          >
            <AIProcessing />
          </div>
        )}

        {/* Step 3: LEARN (Interactive Cards Carousel) */}
        {frame >= 270 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '30px',
              opacity: step3Opacity,
            }}
          >
            {/* Flashcard */}
            <StudyCard type="flashcard" delay={275} scale={1.05} />

            {/* Interactive Quiz */}
            <StudyCard type="quiz" delay={285} scale={1.05} />

            {/* Concept Summary Card */}
            <StudyCard type="concept" delay={295} scale={1.05} />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
