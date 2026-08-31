import React from 'react';
import { Composition, Folder } from 'remotion';
import { MainVideo } from './MainVideo';
import { Scene1Hook } from './scenes/Scene1Hook';
import { Scene2Problem } from './scenes/Scene2Problem';
import { Scene3Intro } from './scenes/Scene3Intro';
import { Scene4HowItWorks } from './scenes/Scene4HowItWorks';
import { Scene5AskAI } from './scenes/Scene5AskAI';
import { Scene6Transformation } from './scenes/Scene6Transformation';
import { Scene7Ending } from './scenes/Scene7Ending';
import {
  VIDEO_FPS,
  VIDEO_WIDTH,
  VIDEO_HEIGHT,
  TOTAL_DURATION_IN_FRAMES,
  SCENE_DURATIONS,
  PROJECT_NAME,
} from './constants';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Complete 60-Second Video Demo Composition */}
      <Composition
        id="ProductDemo"
        component={MainVideo}
        durationInFrames={TOTAL_DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{
          projectName: PROJECT_NAME,
        }}
      />

      {/* Individual Scene Compositions for Quick Previews & Development */}
      <Folder name="Individual-Scenes">
        <Composition
          id="Scene1-Hook"
          component={Scene1Hook}
          durationInFrames={SCENE_DURATIONS.SCENE_1_HOOK}
          fps={VIDEO_FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
        />

        <Composition
          id="Scene2-Problem"
          component={Scene2Problem}
          durationInFrames={SCENE_DURATIONS.SCENE_2_PROBLEM}
          fps={VIDEO_FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
        />

        <Composition
          id="Scene3-Intro"
          component={Scene3Intro}
          durationInFrames={SCENE_DURATIONS.SCENE_3_INTRO}
          fps={VIDEO_FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
          defaultProps={{
            projectName: PROJECT_NAME,
          }}
        />

        <Composition
          id="Scene4-HowItWorks"
          component={Scene4HowItWorks}
          durationInFrames={SCENE_DURATIONS.SCENE_4_HOW_IT_WORKS}
          fps={VIDEO_FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
        />

        <Composition
          id="Scene5-AskAI"
          component={Scene5AskAI}
          durationInFrames={SCENE_DURATIONS.SCENE_5_ASK_AI}
          fps={VIDEO_FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
          defaultProps={{
            projectName: PROJECT_NAME,
          }}
        />

        <Composition
          id="Scene6-Transformation"
          component={Scene6Transformation}
          durationInFrames={SCENE_DURATIONS.SCENE_6_TRANSFORMATION}
          fps={VIDEO_FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
        />

        <Composition
          id="Scene7-Ending"
          component={Scene7Ending}
          durationInFrames={SCENE_DURATIONS.SCENE_7_ENDING}
          fps={VIDEO_FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
          defaultProps={{
            projectName: PROJECT_NAME,
          }}
        />
      </Folder>
    </>
  );
};
