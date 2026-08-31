'use client';

import React from 'react';
import { ConceptNode, DocumentMemory } from '@/types';
import { Check, ChevronRight } from 'lucide-react';

interface ContextTrailProps {
  concepts: ConceptNode[];
  currentPage: number;
  memory: DocumentMemory;
  onJumpToPage: (pageNumber: number) => void;
  onSelectConcept: (concept: ConceptNode) => void;
}

export const ContextTrail: React.FC<ContextTrailProps> = ({
  concepts,
  currentPage,
  memory,
  onJumpToPage,
  onSelectConcept,
}) => {
  if (!concepts || concepts.length === 0) return null;

  const currentConcept =
    concepts.find((c) => c.pageNumber === currentPage) ||
    concepts.reduce((prev, curr) => (curr.pageNumber <= currentPage ? curr : prev), concepts[0]);

  return (
    <div className="border-b border-border/70 bg-card/80 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto select-none scrollbar-none text-[11px] w-full max-w-full">
      <div className="flex items-center gap-1.5 min-w-max">
        {concepts.map((concept, index) => {
          const isCurrent = concept.id === currentConcept?.id;
          const isMastered = memory.masteredConceptIds.includes(concept.id);

          return (
            <React.Fragment key={concept.id}>
              {index > 0 && (
                <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
              )}

              <button
                onClick={() => {
                  onJumpToPage(concept.pageNumber);
                  onSelectConcept(concept);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all font-medium truncate max-w-[200px] sm:max-w-xs ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : isMastered
                    ? 'text-primary hover:bg-secondary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
                title={`Page ${concept.pageNumber}: ${concept.name}`}
              >
                {isMastered && !isCurrent && (
                  <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                )}
                <span className="truncate">{concept.name}</span>
                <span className={`text-[10px] font-mono shrink-0 ${isCurrent ? 'text-primary-foreground/80' : 'opacity-50'}`}>
                  P.{concept.pageNumber}
                </span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
