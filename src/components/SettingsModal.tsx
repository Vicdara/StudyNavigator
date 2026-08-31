'use client';

import React, { useState, useEffect } from 'react';
import {
  UserPreferences,
  ThemePreset,
  ExplanationStyle,
  DifficultyLevel,
  ResponseLength,
  VisualPreference,
  ReadingMode,
  UserProfile,
} from '@/types';
import { THEME_LIST } from './ThemeSwitcher';
import {
  Settings,
  Palette,
  Sliders,
  User,
  CheckCircle2,
  X,
  Brain,
  Lightbulb,
  ListOrdered,
  Baby,
  GraduationCap,
  Sparkles,
  Check,
  BookOpen,
  Layers,
  FileText,
  Compass,
} from 'lucide-react';

interface SettingsModalProps {
  preferences: UserPreferences;
  userProfile: UserProfile;
  activeTheme: ThemePreset;
  isOpen: boolean;
  onClose: () => void;
  onSavePreferences: (newPrefs: UserPreferences) => void;
  onSaveProfile: (newProfile: UserProfile) => void;
  onSelectTheme: (theme: ThemePreset) => void;
}

type SettingsTab = 'reading' | 'pedagogy' | 'profile' | 'themes';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  preferences,
  userProfile,
  activeTheme,
  isOpen,
  onClose,
  onSavePreferences,
  onSaveProfile,
  onSelectTheme,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('reading');
  const [prefForm, setPrefForm] = useState<UserPreferences>({ ...preferences });
  const [profileForm, setProfileForm] = useState<UserProfile>({ ...userProfile });
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sync form state ONLY when modal transitions to open
  useEffect(() => {
    if (isOpen) {
      setPrefForm({ ...preferences });
      setProfileForm({ ...userProfile });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Immediate updater for responsive live preview
  const updatePreference = (partial: Partial<UserPreferences>) => {
    const updated = { ...prefForm, ...partial };
    setPrefForm(updated);
    onSavePreferences(updated);
  };

  const styleOptions: { id: ExplanationStyle; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'intuitive',
      title: 'Intuitive & Mental Models',
      desc: 'Focuses on "why it works" and core visual intuition before introducing formulas.',
      icon: <Brain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
    },
    {
      id: 'analogy',
      title: 'Everyday Analogies',
      desc: 'Anchors complex mechanisms in relatable real-world metaphors.',
      icon: <Lightbulb className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'step_by_step',
      title: 'Step-by-Step Breakdown',
      desc: 'Sequentially numbers each calculation, transformation, and procedural step.',
      icon: <ListOrdered className="w-4 h-4 text-teal-500" />,
    },
    {
      id: 'eli5',
      title: 'Explain Like I’m 5 (ELI5)',
      desc: 'Simple, jargon-free explanations accessible to curious beginners.',
      icon: <Baby className="w-4 h-4 text-pink-500" />,
    },
    {
      id: 'academic',
      title: 'Academic & Formal',
      desc: 'Rigorous formal definitions, terminology, notation, and derivations.',
      icon: <GraduationCap className="w-4 h-4 text-blue-500" />,
    },
  ];

  const difficultyOptions: { id: DifficultyLevel; title: string; desc: string }[] = [
    {
      id: 'beginner',
      title: 'Beginner',
      desc: 'Patient breakdowns without assuming prior advanced prerequisites.',
    },
    {
      id: 'intermediate',
      title: 'Intermediate',
      desc: 'Balanced depth with practical real-world applications and key concepts.',
    },
    {
      id: 'advanced',
      title: 'Advanced / Expert',
      desc: 'Deep technical rigor, formal mechanics, formulas, and edge cases.',
    },
    {
      id: 'researcher',
      title: 'Researcher',
      desc: 'State-of-the-art context, edge cases, proofs, and research implications.',
    },
  ];

  const handleSave = () => {
    onSavePreferences(prefForm);
    onSaveProfile(profileForm);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-card text-card-foreground border border-border rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-secondary/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs shrink-0 aspect-square">
              <Settings className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
                Settings & Preferences
              </h2>
              <p className="text-xs text-muted-foreground truncate">
                Personalize learning pedagogy, reading display modes, and appearance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-secondary transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Master-Detail Layout (Top Tabs on Mobile, Left Sidebar on Desktop) */}
        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
          {/* Navigation Tabs */}
          <div className="flex sm:flex-col overflow-x-auto custom-scrollbar p-2 border-b sm:border-b-0 sm:border-r border-border bg-secondary/20 gap-1.5 shrink-0 w-full sm:w-56 select-none justify-start sm:justify-between">
            <div className="flex sm:flex-col gap-1.5 shrink-0 w-full">
              <button
                type="button"
                onClick={() => setActiveTab('reading')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all shrink-0 text-left cursor-pointer ${
                  activeTab === 'reading'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0 aspect-square" />
                <span className="whitespace-nowrap">Reading & Navigation</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('pedagogy')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all shrink-0 text-left cursor-pointer ${
                  activeTab === 'pedagogy'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                }`}
              >
                <Sliders className="w-4 h-4 shrink-0 aspect-square" />
                <span className="whitespace-nowrap">Learning & Pedagogy</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all shrink-0 text-left cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                }`}
              >
                <User className="w-4 h-4 shrink-0 aspect-square" />
                <span className="whitespace-nowrap">Student Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('themes')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all shrink-0 text-left cursor-pointer ${
                  activeTab === 'themes'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                }`}
              >
                <Palette className="w-4 h-4 shrink-0 aspect-square" />
                <span className="whitespace-nowrap">Themes ({THEME_LIST.length})</span>
              </button>
            </div>

            {/* Version / Build indicator */}
            <div className="hidden sm:block p-2 text-[10px] text-muted-foreground font-mono">
              Study Navigator v2.0
            </div>
          </div>

          {/* Right Detail Pane */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-6">
            {/* 1. READING & NAVIGATION */}
            {activeTab === 'reading' && (
              <div className="space-y-5 max-w-xl">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Document Reading & Navigation</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configure how document pages are viewed and navigated.
                  </p>
                </div>

                {/* Reading Mode Selector */}
                <div className="space-y-2">
                  <label className="font-bold uppercase tracking-wider text-muted-foreground block text-[11px]">
                    Page Display Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updatePreference({ readingMode: 'continuous_scroll' })}
                      className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 cursor-pointer ${
                        (prefForm.readingMode || 'continuous_scroll') === 'continuous_scroll'
                          ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                          : 'border-border bg-card hover:bg-secondary/70'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-foreground">
                        <span>Continuous Scroll</span>
                        {(prefForm.readingMode || 'continuous_scroll') === 'continuous_scroll' && (
                          <Check className="w-3.5 h-3.5 text-primary" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Scroll freely through all pages in a fluid multi-page stack with auto-scroll page tracking.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => updatePreference({ readingMode: 'single_page' })}
                      className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 cursor-pointer ${
                        prefForm.readingMode === 'single_page'
                          ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                          : 'border-border bg-card hover:bg-secondary/70'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-foreground">
                        <span>Single Page (Paginated)</span>
                        {prefForm.readingMode === 'single_page' && (
                          <Check className="w-3.5 h-3.5 text-primary" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Display one page at a time with prominent Next & Previous buttons for focused, distraction-free reading.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-secondary/40 border border-border text-xs text-muted-foreground flex items-center gap-2">
                  <Compass className="w-4 h-4 text-primary shrink-0" />
                  <span>Tip: You can also use the <strong>Left and Right Arrow keys</strong> on your keyboard to flip between pages at any time.</span>
                </div>
              </div>
            )}

            {/* 2. LEARNING & PEDAGOGY */}
            {activeTab === 'pedagogy' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Learning Style & Pedagogy</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Calibrate the AI tutor's tone, depth, and cognitive explanations to match your study preferences.
                  </p>
                </div>

                {/* Explanation Style */}
                <div className="space-y-2">
                  <label className="font-bold uppercase tracking-wider text-muted-foreground block text-[11px]">
                    Pedagogical Style
                  </label>
                  <div className="space-y-1.5">
                    {styleOptions.map((opt) => {
                      const isSelected = prefForm.explanationStyle === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updatePreference({ explanationStyle: opt.id })}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30'
                              : 'border-border bg-card hover:bg-secondary text-foreground/80'
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-background border border-border shrink-0">
                            {opt.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-xs flex items-center justify-between text-foreground">
                              <span>{opt.title}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{opt.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Target Difficulty */}
                <div className="space-y-2">
                  <label className="font-bold uppercase tracking-wider text-muted-foreground block text-[11px]">
                    Target Difficulty Level
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {difficultyOptions.map((diff) => {
                      const isSelected = prefForm.difficultyLevel === diff.id;
                      return (
                        <button
                          key={diff.id}
                          type="button"
                          onClick={() => updatePreference({ difficultyLevel: diff.id })}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30'
                              : 'border-border bg-card hover:bg-secondary text-foreground/80'
                          }`}
                        >
                          <div className="font-bold text-xs flex items-center justify-between text-foreground">
                            <span>{diff.title}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{diff.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation Depth & Length */}
                <div className="space-y-2">
                  <label className="font-bold uppercase tracking-wider text-muted-foreground block text-[11px]">
                    Response Length & Depth
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['concise', 'balanced', 'thorough'] as ResponseLength[]).map((len) => (
                      <button
                        key={len}
                        type="button"
                        onClick={() => updatePreference({ responseLength: len })}
                        className={`p-2 rounded-xl border text-center text-xs font-semibold capitalize transition-all cursor-pointer ${
                          prefForm.responseLength === len
                            ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30'
                            : 'border-border bg-card hover:bg-secondary text-muted-foreground'
                        }`}
                      >
                        {len}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto Check Understanding Toggle */}
                <div className="pt-2 border-t border-border/60">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border cursor-pointer hover:bg-secondary/60 transition-colors">
                    <div className="space-y-0.5 pr-4">
                      <div className="text-xs font-bold text-foreground">Auto-Prompt Understanding Check</div>
                      <div className="text-[11px] text-muted-foreground">
                        AI will periodically prompt 1 quick comprehension check question as you advance through pages.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefForm.autoPromptUnderstandingCheck ?? true}
                      onChange={(e) =>
                        updatePreference({ autoPromptUnderstandingCheck: e.target.checked })
                      }
                      className="w-4 h-4 accent-primary rounded cursor-pointer shrink-0"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* 3. STUDENT PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-5 max-w-xl">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Student Identity & Profile</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Customize your name, display name, and email.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Your Name or Alias</label>
                    <input
                      type="text"
                      value={profileForm.username || ''}
                      onChange={(e) => {
                        const updatedProfile = { ...profileForm, username: e.target.value };
                        setProfileForm(updatedProfile);
                        setPrefForm({ ...prefForm, username: e.target.value });
                        onSaveProfile(updatedProfile);
                      }}
                      placeholder="e.g. Alex"
                      className="w-full bg-secondary/60 border border-border rounded-xl px-3 py-2 text-foreground text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Display Name</label>
                    <input
                      type="text"
                      value={profileForm.displayName || ''}
                      onChange={(e) => {
                        const updatedProfile = { ...profileForm, displayName: e.target.value };
                        setProfileForm(updatedProfile);
                        onSaveProfile(updatedProfile);
                      }}
                      placeholder="e.g. Alex Student"
                      className="w-full bg-secondary/60 border border-border rounded-xl px-3 py-2 text-foreground text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Email (Optional)</label>
                    <input
                      type="email"
                      value={profileForm.email || ''}
                      onChange={(e) => {
                        const updatedProfile = { ...profileForm, email: e.target.value };
                        setProfileForm(updatedProfile);
                        onSaveProfile(updatedProfile);
                      }}
                      placeholder="e.g. alex@student.edu"
                      className="w-full bg-secondary/60 border border-border rounded-xl px-3 py-2 text-foreground text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. THEMES & APPEARANCE */}
            {activeTab === 'themes' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Visual Themes & Color Palettes</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Choose from {THEME_LIST.length} meticulously designed reading palettes.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {THEME_LIST.map((t) => {
                    const isSelected = activeTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onSelectTheme(t.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 shadow-xs cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30'
                            : 'border-border bg-card hover:bg-secondary/70 text-foreground/80'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${t.iconColor} shrink-0 mt-0.5 shadow-xs`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs flex items-center justify-between text-foreground">
                            <span className="truncate">{t.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{t.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3.5 sm:p-4 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-muted-foreground hidden sm:block">
            Changes are saved to your local study session.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Preferences</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
