import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { THEME } from '../constants';
import { Document } from './Document';
import { NeuralNetwork } from './NeuralNetwork';

export const AIProcessing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Morph transition: Document shrinks and transforms into Neural Network
  const docExit = spring({
    frame: frame - 20,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const netEntrance = spring({
    frame: frame - 15,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const docScale = interpolate(docExit, [0, 1], [0.95, 0.75]);
  const docOpacity = interpolate(docExit, [0, 1], [1, 0.3]);
  const docTranslateX = interpolate(docExit, [0, 1], [0, -320]);

  const netOpacity = interpolate(netEntrance, [0, 1], [0, 1]);
  const netTranslateX = interpolate(netEntrance, [0, 1], [200, 120]);

  // Scanning laser beam across document
  const laserY = interpolate(frame % 35, [0, 35], [0, 400]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* Left Document with Laser Scanner */}
      <div
        style={{
          position: 'absolute',
          transform: `translateX(${docTranslateX}px) scale(${docScale})`,
          opacity: docOpacity,
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ position: 'relative' }}>
          <Document
            title="Neural_Networks_Chapter_4.pdf"
            type="pdf"
            category="CS 401: Deep Learning"
            badge="Analyzing Semantic Vectors"
            highlightLines={[1, 2, 4]}
            scale={1.05}
            glowColor={THEME.colors.secondary}
          />
          {/* Laser Line */}
          <div
            style={{
              position: 'absolute',
              top: `${laserY}px`,
              left: 0,
              right: 0,
              height: '3px',
              backgroundColor: THEME.colors.secondary,
              boxShadow: `0 0 16px ${THEME.colors.secondary}, 0 0 30px ${THEME.colors.secondary}`,
              zIndex: 10,
            }}
          />
        </div>
      </div>

      {/* Right Neural Network & Concept Graph */}
      <div
        style={{
          position: 'absolute',
          transform: `translateX(${netTranslateX}px)`,
          opacity: netOpacity,
        }}
      >
        <NeuralNetwork />
      </div>
    </div>
  );
};
