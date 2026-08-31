'use client';

import React, { useState } from 'react';
import { ConceptGraph, ConceptNode, DocumentMemory } from '@/types';
import {
  Layers,
  X,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Search,
  Zap,
  Brain,
  Lightbulb,
  ChevronDown,
} from 'lucide-react';

interface ConceptGraphModalProps {
  conceptGraph: ConceptGraph;
  currentPage: number;
  memory: DocumentMemory;
  isOpen: boolean;
  onClose: () => void;
  onJumpToPage: (pageNumber: number) => void;
}

export const ConceptGraphModal: React.FC<ConceptGraphModalProps> = ({
  conceptGraph,
  currentPage,
  memory,
  isOpen,
  onClose,
  onJumpToPage,
}) => {
  const [selectedConceptId, setSelectedConceptId] = useState<string>(
    conceptGraph.concepts.find((c) => c.pageNumber === currentPage)?.id ||
      conceptGraph.concepts[0]?.id ||
      ''
  );
  const [searchFilter, setSearchFilter] = useState<string>('');

  if (!isOpen) return null;

  const filteredConcepts = conceptGraph.concepts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.definition.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const selectedConcept =
    conceptGraph.concepts.find((c) => c.id === selectedConceptId) ||
    conceptGraph.concepts[0];

  const incomingPrereqs = (selectedConcept?.prerequisites || [])
    .map((pid) => conceptGraph.concepts.find((c) => c.id === pid))
    .filter(Boolean) as ConceptNode[];

  const outgoingDependents = (selectedConcept?.dependents || [])
    .map((did) => conceptGraph.concepts.find((c) => c.id === did))
    .filter(Boolean) as ConceptNode[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-card text-card-foreground border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-primary/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-foreground">
                How Does This Connect? — Concept Map
              </h2>
              <p className="text-xs text-muted-foreground">
                Page {currentPage} conceptual connections & prerequisite foundation
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

        {/* Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Concept List & Search */}
          <div className="w-full md:w-64 border-r border-border p-3 flex flex-col gap-2.5 shrink-0 bg-muted/10">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter concepts..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-background border border-input text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {filteredConcepts.map((c) => {
                const isSelected = c.id === selectedConcept?.id;
                const isMastered = memory.masteredConceptIds.includes(c.id);

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedConceptId(c.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                        : 'bg-card hover:bg-secondary text-foreground/90 border border-border/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {isMastered && (
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-primary-foreground' : 'text-primary'} shrink-0`} />
                      )}
                      <span className="truncate">{c.name}</span>
                    </div>

                    <span className={`text-[10px] font-mono ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      P.{c.pageNumber}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Concept Details & HTML Flow Diagram */}
          {selectedConcept && (
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Active Concept Title & Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Active Concept Node
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-foreground">
                    {selectedConcept.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold capitalize">
                      {selectedConcept.difficulty} Level
                    </span>
                    <span className="text-muted-foreground text-xs font-mono">
                      · Page {selectedConcept.pageNumber}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onJumpToPage(selectedConcept.pageNumber);
                    onClose();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Go to Page {selectedConcept.pageNumber}</span>
                </button>
              </div>

              {/* 1. Connection Pipeline */}
              <div className="space-y-2">
                <div className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span>Dependency Connections</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                  {/* Left: Prerequisites */}
                  <div className="p-3.5 rounded-xl bg-card border border-border space-y-2 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                      <span>Prerequisites</span>
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    {incomingPrereqs.length > 0 ? (
                      <div className="space-y-1.5">
                        {incomingPrereqs.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setSelectedConceptId(p.id)}
                            className="w-full text-left p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs transition-colors border border-border/50 truncate flex items-center justify-between"
                          >
                            <span className="truncate font-semibold">{p.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">P.{p.pageNumber}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic py-1">
                        Foundational Concept (No prerequisites)
                      </div>
                    )}
                  </div>

                  {/* Center: Anchor */}
                  <div className="p-4 rounded-2xl bg-primary/10 border-2 border-primary text-center space-y-1 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      [Current Concept]
                    </div>
                    <div className="font-extrabold text-sm sm:text-base text-foreground">
                      {selectedConcept.name}
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground">
                      Page {selectedConcept.pageNumber}
                    </div>
                  </div>

                  {/* Right: Downstream */}
                  <div className="p-3.5 rounded-xl bg-card border border-border space-y-2 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                      <span>Enables Next</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    {outgoingDependents.length > 0 ? (
                      <div className="space-y-1.5">
                        {outgoingDependents.map((d) => (
                          <button
                            key={d.id}
                            onClick={() => setSelectedConceptId(d.id)}
                            className="w-full text-left p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs transition-colors border border-border/50 truncate flex items-center justify-between"
                          >
                            <span className="truncate font-semibold">{d.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">P.{d.pageNumber}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic py-1">
                        Terminal Topic in this section
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Definition & Core Essence */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-1.5 shadow-xs">
                <div className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-primary" />
                  <span>Definition & Key Takeaway</span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  {selectedConcept.definition}
                </p>
              </div>

              {/* 3. Intuitive Analogy */}
              {selectedConcept.analogy && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 shadow-xs">
                  <div className="font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Real-World Mental Model</span>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/90 italic leading-relaxed">
                    "{selectedConcept.analogy}"
                  </p>
                </div>
              )}

              {/* 4. HTML / SVG Flow Diagram */}
              <div className="space-y-2">
                <div className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Visual Concept Flow Architecture</span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 shadow-xs">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <div className="flex-1 w-full p-3 rounded-xl bg-card border border-border text-xs font-semibold text-foreground text-center shadow-xs">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">Step 1</div>
                      <span>Input & Prerequisites</span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-primary shrink-0 hidden sm:block" />
                    <ChevronDown className="w-4 h-4 text-primary shrink-0 sm:hidden" />

                    <div className="flex-1 w-full p-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold text-center shadow-sm">
                      <div className="text-[10px] text-primary-foreground/80 uppercase font-bold">Core Mechanism</div>
                      <span>{selectedConcept.name}</span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-primary shrink-0 hidden sm:block" />
                    <ChevronDown className="w-4 h-4 text-primary shrink-0 sm:hidden" />

                    <div className="flex-1 w-full p-3 rounded-xl bg-card border border-border text-xs font-semibold text-foreground text-center shadow-xs">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">Step 3</div>
                      <span>Next Topics & Mastery</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-border bg-card flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-colors shadow-xs"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
};
