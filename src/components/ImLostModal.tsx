'use client';

import React, { useState } from 'react';
import { ImLostDiagnosis, UnderstandingCheck } from '@/types';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
  Lightbulb,
  Layers,
  BookOpen,
  ArrowLeft,
  Brain,
  Check,
} from 'lucide-react';

interface ImLostModalProps {
  diagnosis: ImLostDiagnosis | null;
  isOpen: boolean;
  onClose: () => void;
  onResumeReading: (pageNumber: number) => void;
  onMasterConcept: (conceptId?: string) => void;
}

export const ImLostModal: React.FC<ImLostModalProps> = ({
  diagnosis,
  isOpen,
  onClose,
  onResumeReading,
  onMasterConcept,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasCompletedCheck, setHasCompletedCheck] = useState<boolean>(false);

  if (!isOpen || !diagnosis) return null;

  const check = diagnosis.understandingCheck;

  const handleOptionSelect = (optionId: string) => {
    setSelectedOptionId(optionId);
    setHasCompletedCheck(true);
    if (diagnosis.missingPrerequisiteId) {
      onMasterConcept(diagnosis.missingPrerequisiteId);
    }
  };

  const handleResume = () => {
    onClose();
    onResumeReading(diagnosis.returnToPage);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-card text-card-foreground border border-amber-500/40 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col relative ring-1 ring-amber-500/30">
        {/* Header */}
        <div className="p-5 border-b border-border/80 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30 shadow-inner">
              <HelpCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Recovery Diagnosis</span>
              </div>
              <h2 className="text-lg font-extrabold text-foreground">
                Let's Bridge What's Missing on Page {diagnosis.currentPage}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-sm">
          {/* 1. Missing Concept Box */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" />
              <span>Missing Prerequisite Identified</span>
            </div>
            <div className="text-base font-extrabold text-foreground flex items-center gap-2">
              <span>{diagnosis.missingPrerequisiteName || 'Foundational Prerequisite'}</span>
              {diagnosis.missingPrerequisitePage && (
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200">
                  Introduced on Page {diagnosis.missingPrerequisitePage}
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1.5 leading-relaxed">
              {diagnosis.detectedStruggle}
            </p>
          </div>

          {/* 2. Why It Matters */}
          <div>
            <h3 className="font-bold text-foreground text-xs uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Why It Matters
            </h3>
            <p className="text-foreground/90 leading-relaxed bg-secondary/40 p-3 rounded-lg border border-border/60 text-xs sm:text-sm">
              {diagnosis.whyItMatters}
            </p>
          </div>

          {/* 3. The Bridge Explanation */}
          <div>
            <h3 className="font-bold text-foreground text-xs uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-primary" />
              Intuitive Bridge Explanation
            </h3>
            <div className="space-y-3 bg-secondary/30 p-4 rounded-xl border border-border/80 text-xs sm:text-sm leading-relaxed">
              <p className="text-foreground/90">{diagnosis.bridgeExplanation}</p>

              {diagnosis.analogyExplanation && (
                <div className="border-l-2 border-primary-500 pl-3 py-1 bg-primary-500/5 rounded-r text-foreground/90 italic text-xs">
                  <span className="font-semibold not-italic text-primary">Analogy: </span>
                  {diagnosis.analogyExplanation}
                </div>
              )}

              {/* Step-by-Step Points */}
              {diagnosis.stepByStepPoints && diagnosis.stepByStepPoints.length > 0 && (
                <div className="pt-2 border-t border-border/60 space-y-1 text-xs">
                  <div className="font-semibold text-foreground mb-1">Key Logic Sequence:</div>
                  {diagnosis.stepByStepPoints.map((pt, idx) => (
                    <div key={idx} className="text-foreground/80">
                      {pt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 4. Visual Diagram */}
          {diagnosis.visualDiagram && (
            <div>
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                Mental Model Visual
              </h3>
              <pre className="bg-slate-950 text-slate-200 p-3.5 rounded-xl font-mono text-[11px] sm:text-xs overflow-x-auto border border-slate-800 shadow-inner">
                {diagnosis.visualDiagram}
              </pre>
            </div>
          )}

          {/* 5. Interactive Understanding Check */}
          {check && (
            <div className="bg-gradient-to-br from-primary-500/5 via-card to-background border border-primary-500/20 rounded-xl p-4 sm:p-5">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Quick Understanding Check</span>
              </div>
              <p className="font-semibold text-foreground text-xs sm:text-sm mb-3">
                {check.question}
              </p>

              <div className="space-y-2">
                {check.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  let style = 'bg-card hover:bg-secondary border-border';

                  if (selectedOptionId) {
                    if (opt.isCorrect) {
                      style = 'bg-emerald-500/15 border-primary/50 text-emerald-800 dark:text-emerald-200 font-semibold ring-1 ring-emerald-500/30';
                    } else if (isSelected) {
                      style = 'bg-rose-500/15 border-rose-500/50 text-rose-800 dark:text-rose-200';
                    } else {
                      style = 'opacity-40 border-transparent';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      disabled={Boolean(selectedOptionId)}
                      onClick={() => handleOptionSelect(opt.id)}
                      className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm transition-all flex flex-col gap-1 ${style}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{opt.text}</span>
                        {selectedOptionId && opt.isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                      </div>
                      {selectedOptionId && isSelected && (
                        <div className="text-xs opacity-90 mt-1 italic border-t border-border/40 pt-1">
                          {opt.explanation}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-border/80 bg-card flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-10">
          <div className="text-xs text-muted-foreground text-center sm:text-left">
            {hasCompletedCheck ? (
              <span className="text-primary font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Concept verified! You are ready to continue.
              </span>
            ) : (
              <span>Take the quick check above to verify comprehension.</span>
            )}
          </div>

          <button
            onClick={handleResume}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Return to Page {diagnosis.returnToPage}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
