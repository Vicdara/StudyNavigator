'use client';

import React from 'react';
import { StudySession, DocumentData, ConceptNode } from '@/types';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  X,
  Sparkles,
  Layers,
  FileCheck,
  Download,
  Flame,
} from 'lucide-react';

interface MasteryDashboardModalProps {
  session: StudySession;
  document: DocumentData;
  isOpen: boolean;
  onClose: () => void;
  onJumpToPage: (pageNumber: number) => void;
}

export const MasteryDashboardModal: React.FC<MasteryDashboardModalProps> = ({
  session,
  document,
  isOpen,
  onClose,
  onJumpToPage,
}) => {
  if (!isOpen) return null;

  const totalConcepts = document.conceptGraph.concepts.length;
  const masteredConcepts = document.conceptGraph.concepts.filter((c) =>
    session.memory.masteredConceptIds.includes(c.id)
  );
  const strugglingConcepts = document.conceptGraph.concepts.filter((c) =>
    session.memory.strugglingConceptIds.includes(c.id)
  );

  const masteryPercentage = totalConcepts > 0 ? Math.round((masteredConcepts.length / totalConcepts) * 100) : 0;
  const pageCoverage = Math.round((session.memory.visitedPages.length / document.pageCount) * 100);

  const handleExportSummary = () => {
    const markdownContent = `# Study Summary: ${document.title}
Date: ${new Date().toLocaleDateString()}
Total Study Time: ${Math.round((session.totalStudySeconds || 0) / 60)} minutes
Mastery Rate: ${masteryPercentage}% (${masteredConcepts.length}/${totalConcepts} concepts)

## Mastered Concepts
${masteredConcepts.map((c) => `- **${c.name}** (Page ${c.pageNumber}): ${c.definition}`).join('\n')}

## Concepts Under Review
${strugglingConcepts.map((c) => `- **${c.name}** (Page ${c.pageNumber}): ${c.definition}`).join('\n')}

## Document Memory Log
- Visited Pages: [${session.memory.visitedPages.join(', ')}]
- Questions Asked: ${session.memory.questionCount}
- "I'm Lost" Recoveries Triggered: ${session.memory.imLostTriggerCount}
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `Study_Summary_${document.title.slice(0, 20).replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-card text-card-foreground border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-border bg-secondary/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Document Mastery & Learning Memory
              </h2>
              <p className="text-xs text-muted-foreground">
                Live pedagogical retention tracker for {document.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs sm:text-sm">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-primary/10 border border-emerald-500/20 p-3.5 rounded-xl text-center space-y-0.5">
              <div className="text-[10px] uppercase font-bold text-primary">
                Mastery Score
              </div>
              <div className="text-2xl font-extrabold text-foreground">{masteryPercentage}%</div>
              <div className="text-[10px] text-muted-foreground">
                {masteredConcepts.length} of {totalConcepts} concepts
              </div>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-xl text-center space-y-0.5">
              <div className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                Page Coverage
              </div>
              <div className="text-2xl font-extrabold text-foreground">{pageCoverage}%</div>
              <div className="text-[10px] text-muted-foreground">
                {session.memory.visitedPages.length} of {document.pageCount} pages
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl text-center space-y-0.5">
              <div className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                “I'm Lost” Uses
              </div>
              <div className="text-2xl font-extrabold text-foreground">
                {session.memory.imLostTriggerCount}
              </div>
              <div className="text-[10px] text-muted-foreground">Recoveries completed</div>
            </div>

            <div className="bg-secondary p-3.5 rounded-xl text-center space-y-0.5 border border-border">
              <div className="text-[10px] uppercase font-bold text-muted-foreground">
                Total Study Time
              </div>
              <div className="text-2xl font-extrabold text-foreground">
                {Math.round((session.totalStudySeconds || 0) / 60)}m
              </div>
              <div className="text-[10px] text-muted-foreground">Focused session</div>
            </div>
          </div>

          {/* Mastered Concepts Section */}
          <div>
            <h3 className="font-bold text-xs uppercase text-primary tracking-wider mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Mastered Concepts ({masteredConcepts.length})</span>
            </h3>

            {masteredConcepts.length > 0 ? (
              <div className="space-y-2">
                {masteredConcepts.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-foreground text-xs sm:text-sm flex items-center gap-2">
                        <span>{c.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                          Page {c.pageNumber}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                        {c.definition}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onJumpToPage(c.pageNumber);
                        onClose();
                      }}
                      className="p-1.5 text-primary hover:text-emerald-700 rounded hover:bg-primary/10 transition-colors shrink-0"
                      title="Jump to Page"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic bg-secondary/40 p-3 rounded-lg">
                No concepts marked as mastered yet. Complete understanding checks or "I'm Lost" recoveries to earn mastery badges!
              </p>
            )}
          </div>

          {/* Struggling Concepts / Active Reviews */}
          {strugglingConcepts.length > 0 && (
            <div>
              <h3 className="font-bold text-xs uppercase text-amber-600 dark:text-amber-400 tracking-wider mb-2.5 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Needs Review ({strugglingConcepts.length})</span>
              </h3>

              <div className="space-y-2">
                {strugglingConcepts.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-foreground text-xs sm:text-sm flex items-center gap-2">
                        <span>{c.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300">
                          Page {c.pageNumber}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                        {c.definition}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onJumpToPage(c.pageNumber);
                        onClose();
                      }}
                      className="p-1.5 text-amber-600 hover:text-amber-700 rounded hover:bg-amber-500/10 transition-colors shrink-0"
                      title="Jump to Page"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSummary}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-foreground bg-secondary hover:bg-secondary/80 transition-colors flex items-center gap-1.5 border border-border"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span>Export Study Notes (.md)</span>
            </button>
          </div>

          <div className="text-[11px] text-muted-foreground hidden md:block">
            <span>Study Navigator Learning Record</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-all shadow-xs"
          >
            Back to Reading
          </button>
        </div>
      </div>
    </div>
  );
};
