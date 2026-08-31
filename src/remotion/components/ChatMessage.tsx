import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { THEME } from '../constants';

interface ChatMessageProps {
  sender: 'user' | 'ai';
  text?: string;
  delay?: number;
  showTypingEffect?: boolean;
  citation?: string;
  actionButtonText?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  sender,
  text = '',
  delay = 0,
  showTypingEffect = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 120 },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [20, 0]);

  const elapsed = Math.max(0, frame - delay);
  const typingSpeed = 2.2;
  const displayedLength = showTypingEffect
    ? Math.min(text.length, Math.floor(elapsed * typingSpeed))
    : text.length;
  const isTyping = showTypingEffect && displayedLength < text.length;

  const isUser = sender === 'user';

  if (isUser) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          opacity,
          transform: `translateY(${translateY}px)`,
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>You</span>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            U
          </div>
        </div>

        <div
          style={{
            padding: '10px 16px',
            borderRadius: '16px 4px 16px 16px',
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            color: '#0f172a',
            fontSize: '13px',
            fontWeight: 500,
            maxWidth: '85%',
          }}
        >
          {text.slice(0, displayedLength)}
          {isTyping && <span style={{ borderRight: '2px solid #3b82f6' }}>|</span>}
        </div>
      </div>
    );
  }

  // AI Structured Copilot Response (matching user screenshot)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        opacity,
        transform: `translateY(${translateY}px)`,
        marginBottom: '14px',
        width: '100%',
      }}
    >
      {/* Copilot Header Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✦
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Copilot</span>
          <span
            style={{
              fontSize: '10px',
              padding: '1px 6px',
              borderRadius: '4px',
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              fontWeight: 600,
            }}
          >
            P.1
          </span>
        </div>
        <span style={{ fontSize: '12px', color: '#94a3b8', cursor: 'pointer' }}>❐</span>
      </div>

      {/* Copilot Message Card */}
      <div
        style={{
          width: '100%',
          padding: '14px 16px',
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
          color: '#1e293b',
          fontSize: '12.5px',
          lineHeight: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div>
          You are currently on <strong>Page 1 of 9</strong> titled <em>"AI VIRTUAL HACKATHON 2026"</em> by Suvidha International Foundation.
        </div>

        <div>
          <strong>Page 1</strong> is the <em>overview page</em>—it introduces the event's core details:
        </div>

        {/* Bullet Points */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px' }}>
          <div>• <strong>What:</strong> A fully virtual hackathon for AI innovation.</div>
          <div>• <strong>When:</strong> August 15–22, 2026.</div>
          <div>• <strong>Who:</strong> Ages 13–19 (middle/high schoolers).</div>
          <div>• <strong>Prize Pool:</strong> <span style={{ color: '#10b981', fontWeight: 700 }}>$500 cash + Featherless AI credit.</span></div>
          <div>• <strong>Entry:</strong> Free, teams of 1–3.</div>
          <div>• <strong>Bonus:</strong> Every participant gets $25 Featherless AI credit just for registering.</div>
        </div>

        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
          <strong>Next up:</strong> Page 2 covers the prompt and schedule. Want to dive deeper into any of these details?
        </div>
      </div>
    </div>
  );
};
