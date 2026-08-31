'use client';

import React from 'react';
import {
  Compass,
  Home,
  BookOpen,
  FileText,
  Layers,
  Sparkles,
  Bookmark,
  TrendingUp,
  Settings,
  HelpCircle,
  PanelLeftClose,
  Plus,
  ArrowRight,
  MoreVertical,
  User,
} from 'lucide-react';
import { DocumentData, DocumentSection, StudySession, ThemePreset, UserProfile } from '@/types';

interface SidebarProps {
  currentView: 'landing' | 'library' | 'workspace';
  onNavigate: (view: 'landing' | 'library' | 'workspace') => void;
  activeDocument?: DocumentData | null;
  activeSession?: StudySession | null;
  currentPage: number;
  onPageChange: (pageNum: number) => void;
  onOpenSettings: () => void;
  onOpenMastery: () => void;
  onOpenConceptGraph: () => void;
  onTriggerImLost?: () => void;
  onOpenStudyTool?: (tab: 'notes' | 'flashcards' | 'quizzes' | 'bookmarks') => void;
  onCloseSidebar?: () => void;
  isIndexingTitles?: boolean;
  onRegenerateTitles?: () => void;
  activeTheme?: ThemePreset;
  onUploadDocument?: () => void;
  recentDocuments?: DocumentData[];
  onSelectRecentDocument?: (doc: DocumentData) => void;
  userProfile?: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  activeDocument,
  activeSession,
  currentPage,
  onPageChange,
  onOpenSettings,
  onOpenMastery,
  onOpenStudyTool,
  onCloseSidebar,
  onUploadDocument,
  recentDocuments = [],
  onSelectRecentDocument,
  userProfile,
}) => {
  const bookmarksCount = activeSession?.memory?.bookmarks?.length || 0;

  const displayRecentDocs = recentDocuments.length > 0 ? recentDocuments : [
    { id: activeDocument?.id || 'doc-1', title: activeDocument?.title || 'Neural Networks & Deep Learning', pages: activeDocument?.pages || [{ pageNumber: 1, text: '', headings: [], keywords: [], conceptIds: [] }] },
    { id: 'doc-ml', title: 'Machine Learning Foundations', pages: Array.from({ length: 14 }, (_, i) => ({ pageNumber: i + 1, text: '', headings: [], keywords: [], conceptIds: [] })) },
    { id: 'doc-ds', title: 'Data Structures & Algorithms', pages: Array.from({ length: 7 }, (_, i) => ({ pageNumber: i + 1, text: '', headings: [], keywords: [], conceptIds: [] })) },
    { id: 'doc-os', title: 'Operating Systems Principles', pages: Array.from({ length: 3 }, (_, i) => ({ pageNumber: i + 1, text: '', headings: [], keywords: [], conceptIds: [] })) },
  ];

  const username = userProfile?.username || 'Alex';
  const userInitials = username.slice(0, 2).toUpperCase();

  return (
    <aside className="w-full border-r border-border/70 bg-card/85 backdrop-blur-md flex flex-col justify-between shrink-0 select-none h-full font-sans text-xs overflow-hidden">
      {/* Top: Header, Quick Action & Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 custom-scrollbar">
        {/* Workspace Brand / Header */}
        <div className="flex items-center justify-between px-1 pb-1">
          <button
            onClick={() => onNavigate('library')}
            className="flex items-center gap-2 text-left font-bold text-foreground hover:opacity-85 transition-opacity cursor-pointer"
            title="Study Navigator"
          >
            <div className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-extrabold tracking-tight text-foreground">
              Study Navigator
            </span>
          </button>

          {onCloseSidebar && (
            <button
              onClick={onCloseSidebar}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Upload Action */}
        <button
          onClick={() => {
            if (onUploadDocument) onUploadDocument();
            else onNavigate('library');
          }}
          className="w-full py-2 px-3 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>

        {/* Global Navigation Section */}
        <div className="space-y-1 pt-1">
          <div className="px-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Navigation
          </div>

          <nav className="space-y-0.5">
            <button
              onClick={() => onNavigate('library')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentView === 'library' || currentView === 'workspace'
                  ? 'bg-primary/15 text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Library & Packs</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('landing')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentView === 'landing'
                  ? 'bg-primary/15 text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>Product Overview</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Study Tools Section */}
        <div className="space-y-1 pt-2 border-t border-border/60">
          <div className="px-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Study Tools
          </div>

          <div className="space-y-0.5">
            <button
              onClick={() => onOpenStudyTool?.('notes')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>Notes & Highlights</span>
              </div>
            </button>

            <button
              onClick={() => onOpenStudyTool?.('flashcards')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>3D Flashcards</span>
              </div>
              <span className="text-[9px] font-bold text-primary px-1.5 py-0.2 rounded bg-primary/10">
                AI
              </span>
            </button>

            <button
              onClick={() => onOpenStudyTool?.('quizzes')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>Practice Quizzes</span>
              </div>
              <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 px-1.5 py-0.2 rounded bg-amber-500/10">
                Test
              </span>
            </button>

            <button
              onClick={() => onOpenStudyTool?.('bookmarks')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>Bookmarks</span>
              </div>
              {bookmarksCount > 0 && (
                <span className="text-[9px] font-bold text-primary px-1.5 py-0.2 rounded bg-primary/15">
                  {bookmarksCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenMastery}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>Mastery Progress</span>
              </div>
            </button>
          </div>
        </div>

        {/* Active Document Pages (if studying) */}
        {activeDocument && activeDocument.pages && activeDocument.pages.length > 0 && (
          <div className="pt-2 border-t border-border/60 space-y-1">
            <div className="px-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
              <span>Outline ({activeDocument.pages.length} Pages)</span>
              <span className="font-mono text-[10px] text-primary font-bold">
                P.{currentPage}
              </span>
            </div>

            <div className="space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {activeDocument.pages.map((p) => {
                const isActive = p.pageNumber === currentPage;
                const pageTitle = p.headings[0] || `Page ${p.pageNumber}`;
                return (
                  <button
                    key={p.pageNumber}
                    onClick={() => onPageChange(p.pageNumber)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-all text-xs cursor-pointer ${
                      isActive
                        ? 'bg-primary/15 text-primary font-bold border-l-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                    }`}
                    title={`Jump to Page ${p.pageNumber}: ${pageTitle}`}
                  >
                    <div className="flex items-center gap-2 truncate pr-1">
                      <span className="font-mono text-[10px] font-bold text-muted-foreground shrink-0 w-4">
                        {p.pageNumber}
                      </span>
                      <span className="truncate text-xs">{pageTitle}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Documents Section */}
        <div className="pt-2 border-t border-border/60 space-y-1">
          <div className="px-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            <span>Recent</span>
          </div>

          <div className="space-y-0.5">
            {displayRecentDocs.slice(0, 4).map((doc, idx) => {
              const isActive = activeDocument?.id === doc.id;

              return (
                <button
                  key={doc.id || idx}
                  onClick={() => onSelectRecentDocument ? onSelectRecentDocument(doc as DocumentData) : onNavigate('workspace')}
                  className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary/10 text-foreground font-semibold border-l-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                  title={doc.title}
                >
                  <div className="flex items-center gap-2 truncate pr-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                    <span className="truncate text-xs">{doc.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom User Account Bar */}
      <div className="p-2.5 border-t border-border/70 bg-card/60 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs shrink-0 ring-1 ring-primary/30">
            {userInitials}
          </div>
          <div className="truncate">
            <div className="font-bold text-xs text-foreground truncate leading-tight">
              {username}
            </div>
            <div className="text-[10px] text-muted-foreground truncate leading-tight">
              Active Student
            </div>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0 cursor-pointer"
          title="Settings & Preferences"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
