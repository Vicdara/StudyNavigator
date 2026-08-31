'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Settings,
  Compass,
  BookOpen,
  Sparkles,
  X,
  FileText,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { DocumentData, StudySession, ThemePreset, UserProfile } from '@/types';
import { ThemeSwitcher } from './ThemeSwitcher';
import { DocumentParser } from '@/lib/document/document-parser';

interface NavbarProps {
  currentView: 'landing' | 'library' | 'workspace';
  onNavigate: (view: 'landing' | 'library' | 'workspace') => void;
  activeDocument?: DocumentData | null;
  activeSession?: StudySession | null;
  documents?: DocumentData[];
  onSelectDocument?: (doc: DocumentData) => void;
  onJumpToPage?: (pageNum: number) => void;
  userProfile?: UserProfile;
  onOpenSettings: () => void;
  onOpenMastery?: () => void;
  onOpenConceptGraph?: () => void;
  activeTheme: ThemePreset;
  onSelectTheme: (theme: ThemePreset) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  activeDocument,
  userProfile,
  onOpenSettings,
  activeTheme,
  onSelectTheme,
}) => {
  const username = userProfile?.username || 'Alex';
  const userInitials = username.slice(0, 2).toUpperCase();

  return (
    <header className="h-16 border-b border-border/80 bg-card/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between select-none w-full gap-4 font-sans text-xs shrink-0 shadow-xs">
      {/* 1. Left: Brand & Workspace Breadcrumb */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onNavigate('library')}
          className="flex items-center gap-2.5 text-left font-bold text-foreground hover:opacity-85 transition-opacity cursor-pointer"
          title="Study Navigator"
        >
          <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
            <Compass className="w-5 h-5" />
          </div>
          <span className="font-black text-base tracking-tight text-foreground">
            Study Navigator
          </span>
        </button>

        {activeDocument && currentView === 'workspace' && (
          <div className="hidden md:flex items-center gap-2 text-muted-foreground pl-2 border-l border-border/70">
            <div className="flex items-center gap-1.5 text-foreground font-bold truncate max-w-[240px] text-xs">
              <BookOpen className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">{activeDocument.title}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Right Controls: Theme Switcher, Settings, Profile Avatar (Display Only) */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        <ThemeSwitcher
          activeTheme={activeTheme}
          onSelectTheme={onSelectTheme}
        />

        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground hover:text-primary transition-all flex items-center justify-center border border-border/60 cursor-pointer shadow-2xs"
          title="Settings & Preferences"
        >
          <Settings className="w-4.5 h-4.5" />
        </button>

        {/* Profile Avatar (Display only - clicking does nothing) */}
        <div
          className="w-9 h-9 rounded-full bg-primary/15 text-primary font-bold text-xs flex items-center justify-center ring-1 ring-primary/30 shadow-2xs select-none cursor-default"
          title={`User Profile: ${username}`}
        >
          {userInitials}
        </div>
      </div>
    </header>
  );
};
