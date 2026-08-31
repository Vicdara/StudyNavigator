import React from 'react';
import { THEME, PROJECT_NAME } from '../constants';

interface DashboardProps {
  children?: React.ReactNode;
  activeTab?: 'workspace' | 'library' | 'concepts' | 'mastery';
  projectName?: string;
  glow?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  children,
  activeTab = 'workspace',
  projectName = PROJECT_NAME,
  glow = true,
}) => {
  return (
    <div
      style={{
        width: '1540px',
        height: '840px',
        borderRadius: '24px',
        backgroundColor: '#ffffff',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        boxShadow: glow
          ? `0 30px 80px rgba(0, 0, 0, 0.4), 0 0 50px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.8)`
          : `0 30px 80px rgba(0, 0, 0, 0.3)`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top Application Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 24px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
        }}
      >
        {/* Left: Window Controls & StudyNavigator Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #34d399, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)',
              }}
            >
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff' }}>✦</span>
            </div>
            <span
              style={{
                fontSize: '17px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#0f172a',
              }}
            >
              {projectName}
            </span>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px',
            borderRadius: '12px',
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
          }}
        >
          {[
            { key: 'library', label: 'Library' },
            { key: 'workspace', label: 'AI Workspace' },
            { key: 'concepts', label: 'Concept Graph' },
            { key: 'mastery', label: 'Mastery' },
          ].map((tab) => {
            const isSelected = tab.key === activeTab;
            return (
              <div
                key={tab.key}
                style={{
                  padding: '6px 16px',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? '#ffffff' : 'transparent',
                  border: isSelected ? '1px solid #cbd5e1' : '1px solid transparent',
                  color: isSelected ? '#0f172a' : '#64748b',
                  fontSize: '13px',
                  fontWeight: isSelected ? 700 : 500,
                  boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {tab.label}
              </div>
            );
          })}
        </div>

        {/* Right: Study Copilot Status Pill & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '5px 12px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#059669',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span>Study Copilot Active</span>
          </div>

          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            S
          </div>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          backgroundColor: '#f8fafc',
          padding: '16px',
        }}
      >
        {children}
      </div>
    </div>
  );
};
