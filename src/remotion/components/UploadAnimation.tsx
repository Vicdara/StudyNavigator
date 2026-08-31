import React from 'react';
import { useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion';
import { THEME } from '../constants';
import { Document } from './Document';

export const UploadAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance of upload box
  const boxEntrance = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Document dropping in
  const docDrop = spring({
    frame: frame - 15,
    fps,
    config: { damping: 12, mass: 0.9, stiffness: 90 },
  });

  const docY = interpolate(docDrop, [0, 1], [-220, 0]);
  const docScale = interpolate(docDrop, [0, 1], [0.8, 1]);
  const docOpacity = interpolate(docDrop, [0, 1], [0, 1]);

  // Upload Progress
  const uploadProgress = interpolate(frame, [30, 95], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const isComplete = frame >= 95;

  // Scanning laser beam
  const scanY = interpolate(frame % 40, [0, 40], [0, 260]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '60px',
        width: '100%',
        height: '100%',
      }}
    >
      {/* Upload Zone Card */}
      <div
        style={{
          width: '540px',
          height: '380px',
          borderRadius: '20px',
          border: isComplete
            ? `2px solid ${THEME.colors.emerald}`
            : `2px dashed ${THEME.colors.primaryLight}`,
          backgroundColor: 'rgba(15, 17, 26, 0.7)',
          backdropFilter: 'blur(20px)',
          boxShadow: isComplete
            ? `0 0 50px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
            : `0 0 40px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px',
          position: 'relative',
          opacity: boxEntrance,
          transform: `scale(${boxEntrance})`,
          overflow: 'hidden',
        }}
      >
        {/* Animated Scanning Laser Beam while uploading */}
        {!isComplete && frame > 25 && (
          <div
            style={{
              position: 'absolute',
              top: `${scanY}px`,
              left: 0,
              right: 0,
              height: '3px',
              background: `linear-gradient(90deg, transparent, ${THEME.colors.secondary}, ${THEME.colors.primary}, transparent)`,
              boxShadow: `0 0 15px ${THEME.colors.secondary}`,
              opacity: 0.85,
            }}
          />
        )}

        {/* Upload Icon & Header */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: isComplete
              ? 'rgba(16, 185, 129, 0.15)'
              : 'rgba(99, 102, 241, 0.15)',
            border: `1px solid ${isComplete ? THEME.colors.emerald : THEME.colors.primaryLight}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: isComplete ? THEME.colors.emerald : THEME.colors.primaryLight,
            fontSize: '28px',
            boxShadow: `0 0 20px ${isComplete ? THEME.colors.emerald : THEME.colors.primary}33`,
          }}
        >
          {isComplete ? '✓' : '↑'}
        </div>

        <div
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#f8fafc',
            marginBottom: '6px',
            textAlign: 'center',
          }}
        >
          {isComplete ? 'Document Ingested Successfully' : 'Drop learning materials here'}
        </div>

        <div
          style={{
            fontSize: '13px',
            color: THEME.colors.textMuted,
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          Supports PDF, Lecture Notes, PPTX, Notion Exports, and Hand-written Photos
        </div>

        {/* Progress Bar Container */}
        <div style={{ width: '85%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              fontFamily: THEME.monoFamily,
              color: THEME.colors.textMuted,
            }}
          >
            <span>{isComplete ? 'Parsing 48 pages • 100%' : 'Extracting OCR & semantic chunks...'}</span>
            <span style={{ color: isComplete ? THEME.colors.emerald : THEME.colors.secondary, fontWeight: 700 }}>
              {Math.round(uploadProgress)}%
            </span>
          </div>

          <div
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: `${uploadProgress}%`,
                height: '100%',
                borderRadius: '9999px',
                background: isComplete
                  ? `linear-gradient(90deg, #10b981, #34d399)`
                  : `linear-gradient(90deg, ${THEME.colors.primary}, ${THEME.colors.secondary})`,
                boxShadow: `0 0 12px ${isComplete ? THEME.colors.emerald : THEME.colors.secondary}`,
                transition: 'width 0.1s linear',
              }}
            />
          </div>
        </div>
      </div>

      {/* Floating Dropping Document */}
      <div
        style={{
          opacity: docOpacity,
          transform: `translateY(${docY}px) scale(${docScale}) rotate(-3deg)`,
        }}
      >
        <Document
          title="Neural_Networks_Chapter_4.pdf"
          type="pdf"
          category="CS 401: Deep Learning"
          badge="48 Pages • 14MB • Multi-modal"
          scale={0.95}
          glowColor={isComplete ? THEME.colors.emerald : THEME.colors.primary}
        />
      </div>
    </div>
  );
};
