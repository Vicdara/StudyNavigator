/**
 * Video Constants and Configuration
 * 
 * StudyNavigator - Official Brand Assets & Timings
 */

export const PROJECT_NAME = "StudyNavigator";
export const PROJECT_NAME_PLACEHOLDER = "StudyNavigator";
export const PROJECT_TAGLINE = "Turn your learning material into an interactive experience.";
export const PROJECT_SUBTITLE = "Learn smarter. Get unstuck faster.";
export const EVENT_TAG = "AI Virtual Hackathon 2026";

// Video Specifications
export const VIDEO_FPS = 30;
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;
export const TOTAL_DURATION_IN_SECONDS = 60;
export const TOTAL_DURATION_IN_FRAMES = VIDEO_FPS * TOTAL_DURATION_IN_SECONDS; // 1800 frames

// Scene Frame Durations (Total = 1800 frames = 60.0s)
export const SCENE_DURATIONS = {
  SCENE_1_HOOK: 180,           // 0s - 6s (180 frames)
  SCENE_2_PROBLEM: 210,        // 6s - 13s (210 frames)
  SCENE_3_INTRO: 210,          // 13s - 20s (210 frames)
  SCENE_4_HOW_IT_WORKS: 420,   // 20s - 34s (420 frames)
  SCENE_5_ASK_AI: 390,         // 34s - 47s (390 frames)
  SCENE_6_TRANSFORMATION: 210, // 47s - 54s (210 frames)
  SCENE_7_ENDING: 180,         // 54s - 60s (180 frames)
} as const;

// Palette & Styling Constants matching the exact StudyNavigator UI
export const THEME = {
  colors: {
    bg: "#08090d",
    bgCard: "rgba(18, 20, 29, 0.85)",
    bgCardGlass: "rgba(255, 255, 255, 0.04)",
    border: "rgba(255, 255, 255, 0.08)",
    borderGlow: "rgba(16, 185, 129, 0.35)",
    emerald: "#10b981",     // StudyNavigator signature emerald
    emeraldDark: "#059669",
    emeraldLight: "#34d399",
    primary: "#10b981",     // Primary brand
    primaryLight: "#34d399",
    secondary: "#38bdf8",   // Sky Blue
    accent: "#a855f7",      // Purple
    amber: "#f59e0b",       // Warning amber
    rose: "#f43f5e",        // Rose
    textMain: "#0f172a",    // Dark text for document viewer
    textMuted: "#64748b",
    textDim: "#94a3b8",
    paperBg: "#ffffff",
  },
  gradients: {
    hero: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)",
    brand: "linear-gradient(135deg, #34d399 0%, #10b981 50%, #38bdf8 100%)",
    accentGlow: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(56,189,248,0.08) 50%, transparent 70%)",
    cardGlass: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)",
  },
  fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  monoFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
};
