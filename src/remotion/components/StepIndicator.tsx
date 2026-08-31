import React from 'react';
import { THEME } from '../constants';

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { num: '01', title: 'UPLOAD', subtitle: 'Any notes, PDFs, or slides' },
    { num: '02', title: 'UNDERSTAND', subtitle: 'Neural parsing & concept graph' },
    { num: '03', title: 'LEARN', subtitle: 'Interactive recall & AI tutor' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '12px 24px',
        borderRadius: '9999px',
        backgroundColor: 'rgba(15, 17, 26, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
      }}
    >
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isPassed = stepNum < currentStep;

        return (
          <React.Fragment key={step.num}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                opacity: isActive ? 1 : isPassed ? 0.85 : 0.4,
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Step Circle Badge */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isActive
                    ? THEME.colors.primary
                    : isPassed
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${
                    isActive
                      ? THEME.colors.primaryLight
                      : isPassed
                      ? '#10b981'
                      : 'rgba(255, 255, 255, 0.15)'
                  }`,
                  boxShadow: isActive ? `0 0 20px ${THEME.colors.primary}` : 'none',
                  color: isPassed ? '#10b981' : '#f8fafc',
                  fontSize: '12px',
                  fontWeight: 700,
                  fontFamily: THEME.monoFamily,
                }}
              >
                {isPassed ? '✓' : step.num}
              </div>

              {/* Step Text Label */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    color: isActive ? '#ffffff' : '#cbd5e1',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                  }}
                >
                  {step.title}
                </span>
                <span
                  style={{
                    color: THEME.colors.textDim,
                    fontSize: '11px',
                    fontWeight: 500,
                  }}
                >
                  {step.subtitle}
                </span>
              </div>
            </div>

            {/* Separator Line */}
            {idx < steps.length - 1 && (
              <div
                style={{
                  width: '36px',
                  height: '2px',
                  backgroundColor: isPassed ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: isPassed ? '0 0 8px #10b981' : 'none',
                  transition: 'all 0.4s ease',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
