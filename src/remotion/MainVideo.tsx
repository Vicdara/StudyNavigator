import React from 'react';
import { AbsoluteFill, Sequence, Audio, staticFile, interpolate } from 'remotion';
import { SCENE_DURATIONS, PROJECT_NAME, PROJECT_SUBTITLE, EVENT_TAG } from './constants';
import { Scene1Hook } from './scenes/Scene1Hook';
import { Scene2Problem } from './scenes/Scene2Problem';
import { Scene3Intro } from './scenes/Scene3Intro';
import { Scene4HowItWorks } from './scenes/Scene4HowItWorks';
import { Scene5AskAI } from './scenes/Scene5AskAI';
import { Scene6Transformation } from './scenes/Scene6Transformation';
import { Scene7Ending } from './scenes/Scene7Ending';
import './styles/remotion.css';

export interface MainVideoProps {
  projectName?: string;
  subtitle?: string;
  eventTag?: string;
}

export const MainVideo: React.FC<MainVideoProps> = ({
  projectName = PROJECT_NAME,
  subtitle = PROJECT_SUBTITLE,
  eventTag = EVENT_TAG,
}) => {
  const s1Start = 0;
  const s2Start = s1Start + SCENE_DURATIONS.SCENE_1_HOOK; // 180
  const s3Start = s2Start + SCENE_DURATIONS.SCENE_2_PROBLEM; // 390
  const s4Start = s3Start + SCENE_DURATIONS.SCENE_3_INTRO; // 600
  const s5Start = s4Start + SCENE_DURATIONS.SCENE_4_HOW_IT_WORKS; // 1020
  const s6Start = s5Start + SCENE_DURATIONS.SCENE_5_ASK_AI; // 1410
  const s7Start = s6Start + SCENE_DURATIONS.SCENE_6_TRANSFORMATION; // 1620

  return (
    <AbsoluteFill style={{ backgroundColor: '#08090d' }}>
      {/* Background Music Track with smooth fade-in and fade-out */}
      <Audio
        src={staticFile('bgm.wav')}
        volume={(f) =>
          interpolate(f, [0, 45, 1720, 1800], [0, 0.85, 0.85, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />

      {/* Scene 1 — Hook (0s - 6s | 180 frames) */}
      <Sequence from={s1Start} durationInFrames={SCENE_DURATIONS.SCENE_1_HOOK}>
        <Scene1Hook />
      </Sequence>

      {/* Scene 2 — The Problem (6s - 13s | 210 frames) */}
      <Sequence from={s2Start} durationInFrames={SCENE_DURATIONS.SCENE_2_PROBLEM}>
        <Scene2Problem />
      </Sequence>

      {/* Scene 3 — Introduce StudyNavigator (13s - 20s | 210 frames) */}
      <Sequence from={s3Start} durationInFrames={SCENE_DURATIONS.SCENE_3_INTRO}>
        <Scene3Intro projectName={projectName} />
      </Sequence>

      {/* Scene 4 — How It Works (20s - 34s | 420 frames) */}
      <Sequence from={s4Start} durationInFrames={SCENE_DURATIONS.SCENE_4_HOW_IT_WORKS}>
        <Scene4HowItWorks />
      </Sequence>

      {/* Scene 5 — Ask The AI (34s - 47s | 390 frames) */}
      <Sequence from={s5Start} durationInFrames={SCENE_DURATIONS.SCENE_5_ASK_AI}>
        <Scene5AskAI projectName={projectName} />
      </Sequence>

      {/* Scene 6 — The Transformation (47s - 54s | 210 frames) */}
      <Sequence from={s6Start} durationInFrames={SCENE_DURATIONS.SCENE_6_TRANSFORMATION}>
        <Scene6Transformation />
      </Sequence>

      {/* Scene 7 — Ending (54s - 60s | 180 frames) */}
      <Sequence from={s7Start} durationInFrames={SCENE_DURATIONS.SCENE_7_ENDING}>
        <Scene7Ending
          projectName={projectName}
          subtitle={subtitle}
          eventTag={eventTag}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
