import React from 'react';
import { useCurrentFrame, spring, useVideoConfig, interpolate, AbsoluteFill } from 'remotion';
import { Background } from '../components/Background';
import { ParticleField } from '../components/ParticleField';
import { Document } from '../components/Document';
import { TextReveal } from '../components/TextReveal';
import { THEME } from '../constants';

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Primary central document entrance
  const centerDocEntrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const centerScale = interpolate(centerDocEntrance, [0, 1], [0.5, 1.05]);
  const centerRotate = interpolate(frame, [0, 180], [-8, 2]);

  // Orbiting documents around center
  const orbitDocs = [
    { title: 'Lecture_Week_3_Notes.pdf', type: 'notes' as const, angle: 0, distance: 480, scale: 0.7, delay: 15 },
    { title: 'Organic_Chemistry_Slides.pptx', type: 'slides' as const, angle: 72, distance: 420, scale: 0.65, delay: 25 },
    { title: 'Calculus_Exam_Review.pdf', type: 'pdf' as const, angle: 144, distance: 510, scale: 0.75, delay: 35 },
    { title: 'Handwritten_Bio_Diagrams.jpg', type: 'images' as const, angle: 216, distance: 450, scale: 0.68, delay: 45 },
    { title: 'Midterm_Formula_Sheet.pdf', type: 'pdf' as const, angle: 288, distance: 490, scale: 0.72, delay: 55 },
  ];

  // Convergence toward center at the end of the scene (frame 140 -> 180)
  const convergence = interpolate(frame, [140, 178], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const globalScale = interpolate(convergence, [0, 1], [1, 0.6]);
  const globalOpacity = interpolate(convergence, [0, 1], [1, 0.1]);

  return (
    <AbsoluteFill style={{ opacity: globalOpacity, transform: `scale(${globalScale})` }}>
      <Background glowColor={THEME.colors.primary} />
      <ParticleField count={50} speedMultiplier={1.5} />

      {/* Floating Orbital Container */}
      <div
        style={{
          position: 'absolute',
          top: '48%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Orbiting Documents */}
        {orbitDocs.map((doc, idx) => {
          const docSpring = spring({
            frame: frame - doc.delay,
            fps,
            config: { damping: 12, stiffness: 100 },
          });

          // Dynamic orbital rotation
          const orbitSpeed = (frame + idx * 30) * 0.45;
          const currentRad = ((doc.angle + orbitSpeed) * Math.PI) / 180;
          const currentDist = doc.distance * (1 - convergence * 0.85);

          const posX = Math.cos(currentRad) * currentDist;
          const posY = Math.sin(currentRad) * currentDist * 0.65; // Elliptical perspective

          const docScale = interpolate(docSpring, [0, 1], [0.2, doc.scale]) * (1 - convergence * 0.4);
          const docOpacity = interpolate(docSpring, [0, 1], [0, 0.75]) * (1 - convergence);

          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                transform: `translate(${posX}px, ${posY}px) scale(${docScale}) rotate(${posX * 0.04}deg)`,
                opacity: docOpacity,
                pointerEvents: 'none',
              }}
            >
              <Document
                title={doc.title}
                type={doc.type}
                category="Academic Library"
                badge="Raw Notes"
                showDiagram={false}
              />
            </div>
          );
        })}

        {/* Central Hero Document */}
        <div
          style={{
            transform: `scale(${centerScale * (1 - convergence * 0.3)}) rotate(${centerRotate}deg)`,
            opacity: centerDocEntrance,
            boxShadow: '0 30px 90px rgba(0, 0, 0, 0.8)',
            zIndex: 20,
          }}
        >
          <Document
            title="Complete_Course_Material.pdf"
            type="pdf"
            category="Semester Final Master Pack"
            badge="142 Pages • 8 Chapters"
            highlightLines={[2, 3]}
            scale={1.25}
            glowColor={THEME.colors.primary}
          />
        </div>
      </div>

      {/* Kinetic Typography Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          zIndex: 30,
        }}
      >
        {frame >= 10 && (
          <TextReveal
            text="Your notes contain the answers."
            delay={10}
            fontSize={52}
            fontWeight={800}
            gradient={THEME.gradients.hero}
          />
        )}

        {frame >= 70 && (
          <TextReveal
            text="But finding them shouldn't be hard."
            delay={70}
            fontSize={36}
            fontWeight={600}
            color={THEME.colors.secondary}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
