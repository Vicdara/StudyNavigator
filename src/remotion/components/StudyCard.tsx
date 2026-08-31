import React from 'react';
import { useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion';
import { THEME } from '../constants';

interface StudyCardProps {
  type: 'flashcard' | 'quiz' | 'concept';
  delay?: number;
  scale?: number;
}

export const StudyCard: React.FC<StudyCardProps> = ({
  type,
  delay = 0,
  scale = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const cardScale = interpolate(entrance, [0, 1], [0.8, scale]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  if (type === 'flashcard') {
    // Flashcard flip animation
    const flipProgress = interpolate(frame - delay, [30, 60], [0, 180], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const isFlipped = flipProgress > 90;

    return (
      <div
        style={{
          width: '380px',
          height: '240px',
          perspective: '1000px',
          opacity,
          transform: `scale(${cardScale})`,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '16px',
            backgroundColor: 'rgba(15, 18, 28, 0.85)',
            border: `1px solid ${THEME.colors.primary}55`,
            backdropFilter: 'blur(16px)',
            boxShadow: `0 20px 40px rgba(0, 0, 0, 0.5), 0 0 25px ${THEME.colors.primary}22`,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '11px',
                fontFamily: THEME.monoFamily,
                color: THEME.colors.primaryLight,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              ⚡ Flashcard • Active Recall
            </span>
            <span
              style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                color: THEME.colors.primaryLight,
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              Card 1/12
            </span>
          </div>

          {/* Question / Answer Content */}
          <div>
            <div
              style={{
                fontSize: '11px',
                color: THEME.colors.textDim,
                marginBottom: '6px',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              {isFlipped ? 'Answer:' : 'Question:'}
            </div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#f8fafc',
                lineHeight: 1.4,
              }}
            >
              {isFlipped
                ? 'Backpropagation calculates the gradient of the loss function with respect to weights using the chain rule.'
                : 'How does backpropagation update weights in a multi-layer network?'}
            </div>
          </div>

          {/* Footer badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: THEME.colors.textDim }}>Confidence: High</span>
            <span
              style={{
                fontSize: '11px',
                color: THEME.colors.emerald,
                fontWeight: 600,
              }}
            >
              Mastery: 92% ✓
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'quiz') {
    // Quiz selection animation
    const selectedOption = frame - delay > 25 ? 1 : -1;

    return (
      <div
        style={{
          width: '400px',
          height: '270px',
          borderRadius: '16px',
          backgroundColor: 'rgba(15, 18, 28, 0.85)',
          border: `1px solid ${THEME.colors.secondary}55`,
          backdropFilter: 'blur(16px)',
          boxShadow: `0 20px 40px rgba(0, 0, 0, 0.5), 0 0 25px ${THEME.colors.secondary}22`,
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          opacity,
          transform: `scale(${cardScale})`,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: THEME.monoFamily,
              color: THEME.colors.secondary,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            🎯 Interactive Quiz Question
          </span>
          <span style={{ fontSize: '11px', color: THEME.colors.textDim }}>+50 XP</span>
        </div>

        {/* Prompt */}
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
          Which activation function prevents vanishing gradients in deep layers?
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 0, text: 'Sigmoid' },
            { id: 1, text: 'ReLU (Rectified Linear Unit)', isCorrect: true },
            { id: 2, text: 'Tanh' },
          ].map((opt) => {
            const isChosen = selectedOption === opt.id;
            return (
              <div
                key={opt.id}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: isChosen
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isChosen
                    ? `1px solid ${THEME.colors.emerald}`
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: isChosen ? '#10b981' : '#cbd5e1',
                  fontSize: '12px',
                  fontWeight: isChosen ? 600 : 400,
                  boxShadow: isChosen ? '0 0 12px rgba(16, 185, 129, 0.3)' : 'none',
                }}
              >
                <span>{opt.text}</span>
                {isChosen && <span style={{ fontWeight: 700 }}>✓ Correct</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Concept Breakdown Card
  return (
    <div
      style={{
        width: '360px',
        height: '240px',
        borderRadius: '16px',
        backgroundColor: 'rgba(15, 18, 28, 0.85)',
        border: `1px solid ${THEME.colors.accent}55`,
        backdropFilter: 'blur(16px)',
        boxShadow: `0 20px 40px rgba(0, 0, 0, 0.5), 0 0 25px ${THEME.colors.accent}22`,
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        opacity,
        transform: `scale(${cardScale})`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '11px',
            fontFamily: THEME.monoFamily,
            color: THEME.colors.accent,
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          💡 Key Concept Summary
        </span>
        <span style={{ fontSize: '10px', color: THEME.colors.textDim }}>3 Min Read</span>
      </div>

      <div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
          Gradient Descent Optimization
        </div>
        <p style={{ fontSize: '12px', color: THEME.colors.textMuted, lineHeight: 1.5, margin: 0 }}>
          Iteratively computes loss partial derivatives to navigate multidimensional parameter space toward the global minimum.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <span
          style={{
            padding: '3px 8px',
            borderRadius: '6px',
            backgroundColor: 'rgba(168, 85, 247, 0.15)',
            color: THEME.colors.accent,
            fontSize: '10px',
            fontWeight: 600,
          }}
        >
          Learning Rate
        </span>
        <span
          style={{
            padding: '3px 8px',
            borderRadius: '6px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            color: THEME.colors.secondary,
            fontSize: '10px',
            fontWeight: 600,
          }}
        >
          Vector Derivatives
        </span>
      </div>
    </div>
  );
};
