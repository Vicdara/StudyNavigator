import React from 'react';
import { THEME } from '../constants';

interface PDFViewerProps {
  title?: string;
  currentPage?: number;
  totalPages?: number;
  highlightedSection?: string;
  isHighlighted?: boolean;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  title = 'Suvidha_AI_Hackathon_Workbook',
  currentPage = 1,
  totalPages = 9,
  highlightedSection = 'Page 1 Overview • Key Rules & Prizepool',
  isHighlighted = true,
}) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#f8fafc',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
      }}
    >
      {/* Top PDF Toolbar matching user UI */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
        }}
      >
        {/* Left: Back to Library & File Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span>‹</span>
            <span>Library</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: '#f1f5f9',
            }}
          >
            <span style={{ fontSize: '13px', color: '#10b981' }}>📄</span>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
              {title}
            </span>
          </div>
        </div>

        {/* Center: Pagination & Zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Pagination pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '3px 10px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
              color: '#475569',
              fontWeight: 500,
            }}
          >
            <span style={{ cursor: 'pointer' }}>‹</span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{currentPage}</span>
            <span>/</span>
            <span>{totalPages}</span>
            <span style={{ cursor: 'pointer' }}>›</span>
          </div>

          {/* Zoom pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '3px 10px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
              color: '#475569',
            }}
          >
            <span>-</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>70%</span>
            <span>+</span>
          </div>
        </div>

        {/* Right: Original PDF & Fullscreen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '9999px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            <span>👁</span>
            <span>Original PDF</span>
          </div>
          <span style={{ color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>⤢</span>
        </div>
      </div>

      {/* Main Body with Vertical Pages Sidebar on Left & Document Paper */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
        {/* Left vertical tab: PAGES */}
        <div
          style={{
            width: '32px',
            borderRight: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              transform: 'rotate(-90deg)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
            }}
          >
            <span>田</span>
            <span>PAGES</span>
          </div>
        </div>

        {/* Center Paper Sheet */}
        <div
          style={{
            flex: 1,
            padding: '24px 40px',
            display: 'flex',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              padding: '28px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              position: 'relative',
            }}
          >
            {/* Header */}
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#10b981',
                letterSpacing: '0.08em',
                fontFamily: THEME.monoFamily,
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '6px',
              }}
            >
              PAGE 1 OF 9 • AI VIRTUAL
            </div>

            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
              SUVIDHAINTERNATIONALFOUNDATION
            </div>

            <div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                AI VIRTUAL HACKATHON 2026
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.45, marginTop: '4px' }}>
                The official handbook. The prompt, eligibility, submission requirements, build rules, sponsor benefits, and the complete judging rubric.
              </div>
            </div>

            {/* Document Highlighted Content Box when grounded by AI */}
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: isHighlighted ? '#ecfdf5' : '#f8fafc',
                border: isHighlighted ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>DATES:</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>Aug 15–22, 2026 · fully virtual</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>ELIGIBILITY:</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>Ages 13–19 · Middle & high schoolers</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>PRIZEPOOL:</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>$500 cash + Featherless AI credit</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>ENTRY:</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>Free, teams of 1 to 3</span>
              </div>
            </div>

            {/* Footer Citation Status */}
            <div
              style={{
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: '6px',
                backgroundColor: '#f1f5f9',
                fontSize: '11px',
                color: '#64748b',
              }}
            >
              <span>📌</span>
              <span>{highlightedSection}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
