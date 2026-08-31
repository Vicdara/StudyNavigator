'use client';

import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Brain,
  Layers,
  CheckCircle2,
  Zap,
  FileText,
  Lightbulb,
  UploadCloud,
  Check,
} from 'lucide-react';
import { CopilotLogo } from './CopilotLogo';

interface LandingPageProps {
  onStartStudying: () => void;
  onOpenDemoDocument: (docId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartStudying,
  onOpenDemoDocument,
}) => {
  const [demoStep, setDemoStep] = useState<number>(1);

  return (
    <div className="min-h-screen bg-background text-foreground select-none overflow-x-hidden font-sans">
      {/* 1. Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 px-4 sm:px-8 max-w-6xl mx-auto text-center">
        {/* Background Accent Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[300px] sm:h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Feature Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase mb-6 shadow-xs animate-fade-in">
          <Compass className="w-4 h-4" />
          <span>Context-Aware AI Document Study Workspace</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-[1.15] sm:leading-[1.15]">
          Stop getting lost in dense documents.{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
            Let AI navigate the path.
          </span>
        </h1>

        {/* Subheading */}
        <p className="mt-5 sm:mt-6 text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Study Navigator pairs your document reader with an active AI copilot that tracks your exact page, maps prerequisite concepts, and diagnoses missing foundations when you hit a wall.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto sm:max-w-none">
          <button
            onClick={onStartStudying}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm sm:text-base hover:bg-primary/90 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2.5 group cursor-pointer"
          >
            <span>Launch Study Workspace</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onOpenDemoDocument('deep-learning-101')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-card border border-border/80 text-foreground font-semibold text-sm sm:text-base hover:bg-secondary transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <BookOpen className="w-4 h-4 text-primary" />
            <span>Open Interactive Demo</span>
          </button>
        </div>

        {/* Value Prop Badges */}
        <div className="mt-10 sm:mt-14 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground font-medium">
          <div className="flex items-center gap-2 bg-card/60 px-3 py-1.5 rounded-xl border border-border/50 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>Page-Aware RAG</span>
          </div>
          <div className="flex items-center gap-2 bg-card/60 px-3 py-1.5 rounded-xl border border-border/50 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>Signature “I'm Lost” Recovery</span>
          </div>
          <div className="flex items-center gap-2 bg-card/60 px-3 py-1.5 rounded-xl border border-border/50 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>Concept Dependency Trees</span>
          </div>
          <div className="flex items-center gap-2 bg-card/60 px-3 py-1.5 rounded-xl border border-border/50 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>PDF, DOCX & Markdown</span>
          </div>
        </div>
      </section>

      {/* 2. Interactive 30-Second Simulator */}
      <section className="py-10 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-7">
          <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
            Interactive Walkthrough
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            See the Signature “I'm Lost” Recovery in Action
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-lg mx-auto">
            Experience how Study Navigator catches cognitive stumbling blocks and restores understanding.
          </p>
        </div>

        <div className="bg-card border border-border/80 rounded-3xl shadow-xl overflow-hidden">
          {/* Interactive Step Navigator */}
          <div className="grid grid-cols-3 border-b border-border/70 text-center text-xs font-bold divide-x divide-border/60 bg-secondary/30">
            <button
              onClick={() => setDemoStep(1)}
              className={`py-3.5 px-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                demoStep === 1 ? 'bg-card text-primary border-b-2 border-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">1. Reading Page 12</span>
              <span className="sm:hidden">1. Reading</span>
            </button>
            <button
              onClick={() => setDemoStep(2)}
              className={`py-3.5 px-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                demoStep === 2 ? 'bg-card text-amber-500 border-b-2 border-amber-500 shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">2. Hit “I'm Lost”</span>
              <span className="sm:hidden">2. Lost</span>
            </button>
            <button
              onClick={() => setDemoStep(3)}
              className={`py-3.5 px-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                demoStep === 3 ? 'bg-card text-primary border-b-2 border-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3. Bridge & Resume</span>
              <span className="sm:hidden">3. Resume</span>
            </button>
          </div>

          {/* Simulator Content */}
          <div className="p-5 sm:p-8 min-h-[290px] flex flex-col justify-between">
            {demoStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                  <span className="font-bold text-foreground">DEEP LEARNING FOUNDATIONS</span>
                  <span className="px-2 py-0.5 rounded-md bg-secondary text-primary font-bold">PAGE 12 / 16</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  The Multivariate Chain Rule & Gradient Flow in Deep Architectures
                </h3>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed bg-secondary/30 p-4 rounded-2xl border border-border/60">
                  "To compute the gradient dL/dW, we apply the chain rule across layer activations:
                  delta = (W^T * delta) * sigma'(z). Notice how the derivative sigma'(z) acts as a local gating factor..."
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <span className="text-xs text-muted-foreground italic">
                    Stuck on why sigma'(z) derivative matters?
                  </span>
                  <button
                    onClick={() => setDemoStep(2)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Click “I'm Lost”</span>
                  </button>
                </div>
              </div>
            )}

            {demoStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Missing Prerequisite Diagnosed</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-extrabold text-foreground">
                    Activation Function Derivatives (from Page 5)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    You understand forward passing, but the derivative of the Sigmoid function sigma'(z) from Page 5 is what gates gradients during backpropagation.
                  </p>
                </div>

                <div className="bg-secondary/40 p-4 rounded-2xl border border-border/70 text-xs sm:text-sm leading-relaxed">
                  <strong className="text-foreground">Analogy:</strong> Think of the activation derivative like a volume slider on a microphone. If the slope is near zero (saturated), the signal gets muted completely!
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    onClick={() => setDemoStep(3)}
                    className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                  >
                    <span>Check Understanding</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {demoStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 space-y-1">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Understanding Verified & Mastered</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-extrabold text-foreground">
                    Activation Derivatives Mastered!
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Your Concept Trail has been updated with a green badge. You are ready to resume Page 12 with full clarity.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => setDemoStep(1)}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Restart Demo
                  </button>
                  <button
                    onClick={() => onOpenDemoDocument('deep-learning-101')}
                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 cursor-pointer transition-all"
                  >
                    <span>Open Full Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Core Pillars Grid */}
      <section className="py-14 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Engineered for Deep Retention
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
            Every feature is calibrated to help you conquer challenging technical material.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-3 hover:border-primary/50 transition-all shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-2xs">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">
              Intelligent Prerequisite Diagnosis
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              When you hit a wall on a formula or theorem, AI diagnoses the unmastered prerequisite from earlier in the paper, provides a bridge analogy, and confirms comprehension.
            </p>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-3 hover:border-primary/50 transition-all shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">
              Live Context Trail & Concept Map
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Visual breadcrumbs show your exact learning trajectory with clickable jump-to-page anchors and prerequisite dependency graphs.
            </p>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-3 hover:border-primary/50 transition-all shadow-xs sm:col-span-2 lg:col-span-1">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-2xs">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">
              Universal Document Ingestion
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Drop PDFs, Word documents (.docx), Markdown, or plain text. The client-side pipeline extracts structured pages, formulas, and headings instantly.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="border-t border-border/80 py-8 px-4 text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-1.5 font-extrabold text-foreground">
          <Compass className="w-4 h-4 text-primary" />
          <span>Study Navigator</span>
        </div>
        <p className="text-muted-foreground">Context-Aware AI Document Study Workspace</p>
      </footer>
    </div>
  );
};
