'use client';

import React, { useState } from 'react';
import {
  UserPreferences,
  ExplanationStyle,
  DifficultyLevel,
  VisualPreference,
  ReadingMode,
  UserProfile,
} from '@/types';
import {
  Brain,
  Lightbulb,
  GraduationCap,
  Baby,
  ListOrdered,
  Check,
  X,
  ArrowRight,
  Sparkles,
  BookOpen,
  User,
  Compass,
} from 'lucide-react';

interface OnboardingModalProps {
  preferences: UserPreferences;
  userProfile?: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newPrefs: UserPreferences, newProfile?: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  preferences,
  userProfile,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<UserPreferences>({ ...preferences });
  const [profileData, setProfileData] = useState<UserProfile>({
    username: userProfile?.username || 'Alex',
    displayName: userProfile?.displayName || '',
    createdAt: userProfile?.createdAt || new Date().toISOString(),
  });
  const [step, setStep] = useState<number>(1);

  if (!isOpen) return null;

  const styleOptions: { id: ExplanationStyle; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'intuitive',
      title: 'Intuitive & Visual Mental Models',
      desc: 'Focuses on "why it works" and physical intuition before equations.',
      icon: <Brain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
    },
    {
      id: 'analogy',
      title: 'Everyday Real-World Analogies',
      desc: 'Anchors complex mechanisms in relatable everyday metaphors.',
      icon: <Lightbulb className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'step_by_step',
      title: 'Step-by-Step Breakdown',
      desc: 'Sequentially numbers each calculation, transformation, and process.',
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
      desc: 'Balanced depth focusing on operational mechanics and core connections.',
    },
    {
      id: 'advanced',
      title: 'Advanced',
      desc: 'In-depth analysis of mathematical subtleties and architectural trade-offs.',
    },
    {
      id: 'researcher',
      title: 'Researcher',
      desc: 'State-of-the-art context, edge cases, proofs, and research implications.',
    },
  ];

  const handleFinish = () => {
    const updatedPrefs: UserPreferences = {
      ...formData,
      username: profileData.username.trim() || 'Alex',
    };
    onSave(updatedPrefs, profileData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('study_navigator_onboarded', 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-card text-card-foreground border border-border rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[88vh] my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-primary/5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs shrink-0 aspect-square">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
                Welcome to Study Navigator
              </h2>
              <p className="text-xs text-muted-foreground truncate">
                Let's calibrate your personalized AI study workspace
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

        {/* Step Progress Bar - Sleek & Mobile-Friendly */}
        <div className="grid grid-cols-3 gap-2 border-b border-border bg-secondary/30 px-4 sm:px-6 py-3 shrink-0">
          {[
            { num: 1, label: 'Profile' },
            { num: 2, label: 'Pedagogy' },
            { num: 3, label: 'Display' },
          ].map((s) => (
            <div key={s.num} className="flex flex-col gap-1.5 min-w-0">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step >= s.num
                    ? 'bg-primary shadow-xs'
                    : 'bg-border/80'
                }`}
              />
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono font-bold shrink-0 ${
                    step === s.num
                      ? 'bg-primary text-primary-foreground'
                      : step > s.num
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s.num}
                </span>
                <span
                  className={`text-[11px] truncate ${
                    step === s.num
                      ? 'font-bold text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Step 1: Student Profile */}
        {step === 1 && (
          <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm overflow-y-auto flex-1 custom-scrollbar">
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-foreground">What should your AI tutor call you?</h3>
              <p className="text-xs text-muted-foreground">
                Your AI study companion will greet you and tailor explanations with your name.
              </p>
            </div>

            <div className="space-y-1.5 pt-2 max-w-sm mx-auto">
              <label className="font-bold text-foreground text-xs block">Your Name / Username</label>
              <input
                type="text"
                autoFocus
                value={profileData.username}
                onChange={(e) => {
                  setProfileData({ ...profileData, username: e.target.value });
                  setFormData({ ...formData, username: e.target.value });
                }}
                placeholder="e.g. Victor"
                className="w-full bg-secondary/60 border border-border focus:border-primary rounded-xl px-3.5 py-2.5 text-foreground font-bold text-sm focus:outline-none transition-all shadow-xs"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/70 text-xs text-muted-foreground space-y-1 max-w-sm mx-auto">
              <div className="font-semibold text-foreground flex items-center gap-1.5 text-primary">
                <Compass className="w-3.5 h-3.5" />
                <span>What makes Study Navigator special?</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                As you read documents, the AI tracks your active page, builds concept dependency trees, and gives instant "I'm Lost" diagnosis when you hit stumbling blocks.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Learning Style */}
        {step === 2 && (
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar text-xs">
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-foreground">Choose your preferred explanation style</h3>
              <p className="text-xs text-muted-foreground">
                Select how you best absorb and retain complex material.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              {styleOptions.map((opt) => {
                const isSelected = formData.explanationStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setFormData({ ...formData, explanationStyle: opt.id })}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
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
        )}

        {/* Step 3: Difficulty & Reading Mode */}
        {step === 3 && (
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar text-xs">
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-foreground">Target Depth & Reading Mode</h3>
              <p className="text-xs text-muted-foreground">
                Fine-tune your reading experience and prerequisite depth.
              </p>
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5 pt-1">
              <label className="font-bold text-foreground text-[11px] uppercase tracking-wider block">Target Difficulty</label>
              <div className="grid grid-cols-2 gap-2">
                {difficultyOptions.map((opt) => {
                  const isSelected = formData.difficultyLevel === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setFormData({ ...formData, difficultyLevel: opt.id })}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30'
                          : 'border-border bg-card hover:bg-secondary text-foreground/80'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center justify-between text-foreground">
                        <span>{opt.title}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reading Mode */}
            <div className="space-y-1.5 pt-2 border-t border-border">
              <label className="font-bold text-foreground text-[11px] uppercase tracking-wider block">Default Page Display</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFormData({ ...formData, readingMode: 'continuous_scroll' })}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    (formData.readingMode || 'continuous_scroll') === 'continuous_scroll'
                      ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30'
                      : 'border-border bg-card hover:bg-secondary text-foreground/80'
                  }`}
                >
                  <div className="font-bold text-xs">Continuous Scroll</div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Scroll through all pages</p>
                </button>

                <button
                  onClick={() => setFormData({ ...formData, readingMode: 'single_page' })}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    formData.readingMode === 'single_page'
                      ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30'
                      : 'border-border bg-card hover:bg-secondary text-foreground/80'
                  }`}
                >
                  <div className="font-bold text-xs">Single Page</div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">One page at a time</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="p-4 border-t border-border bg-card/95 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-3.5 py-1.5 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer active:scale-95"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>Start Studying</span>
              <Compass className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
