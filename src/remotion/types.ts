export interface SceneProps {
  currentFrame: number;
  fps: number;
}

export interface VideoConfigProps {
  projectName?: string;
  tagline?: string;
  subtitle?: string;
  eventTag?: string;
}

export interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  type: 'pdf' | 'notes' | 'slides' | 'images';
  category: string;
  pages: number;
  color: string;
}
