import { DocumentData, DocumentPage, DocumentSection, ConceptNode, ConceptGraph } from '@/types';
import { ExtractedPDFPage } from './pdf-extractor';

export class DocumentParser {
  /**
   * Converts extracted pages (from PDF or text chunker) into a full DocumentData object.
   */
  static parsePagesToDocument(title: string, filename: string, rawPages: ExtractedPDFPage[], fileSize: number = 0): DocumentData {
    const pages: DocumentPage[] = [];
    const sections: DocumentSection[] = [];
    const concepts: ConceptNode[] = [];

    rawPages.forEach((rawPage, idx) => {
      const pageNumber = rawPage.pageNumber || idx + 1;
      const headings = rawPage.headings && rawPage.headings.length > 0
        ? rawPage.headings
        : [`Section ${pageNumber}`];

      // Extract key concept candidate
      const conceptMatches = rawPage.text.match(/\*\*([^*]+)\*\*/g) || [];
      const primaryConceptName = headings[0] || (conceptMatches[0] ? conceptMatches[0].replace(/\*\*/g, '') : `Topic ${pageNumber}`);
      const conceptId = `concept-p${pageNumber}-${primaryConceptName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 24)}`;

      const pageConceptIds: string[] = [];

      if (!concepts.find((c) => c.id === conceptId)) {
        const sentences = rawPage.text.split(/[.!?]\s+/).filter(s => s.trim().length > 15);
        const definition = sentences[0] ? sentences[0].replace(/^#+\s+/, '').slice(0, 220) : `Core concepts introduced on Page ${pageNumber}.`;

        const conceptNode: ConceptNode = {
          id: conceptId,
          name: primaryConceptName.replace(/^#+\s+/, ''),
          definition,
          pageNumber,
          sectionTitle: headings[0] || `Section ${pageNumber}`,
          difficulty: pageNumber <= 2 ? 'beginner' : pageNumber <= 6 ? 'intermediate' : 'advanced',
          prerequisites: pageNumber > 1 && concepts.length > 0 ? [concepts[concepts.length - 1].id] : [],
          dependents: [],
          status: pageNumber === 1 ? 'mastered' : 'unvisited',
          analogy: `Think of ${primaryConceptName} as an essential stepping stone for the material in this document.`,
          visualDiagram: `[ Previous Foundations ] ---> [ ${primaryConceptName} (P.${pageNumber}) ] ---> [ Next Topics ]`,
        };
        concepts.push(conceptNode);
        pageConceptIds.push(conceptId);
      }

      // Link dependents
      if (pageNumber > 1 && concepts.length >= 2) {
        const prevConcept = concepts[concepts.length - 2];
        if (prevConcept && !prevConcept.dependents.includes(conceptId)) {
          prevConcept.dependents.push(conceptId);
        }
      }

      const wordCount = rawPage.text.split(/\s+/).length;
      pages.push({
        pageNumber,
        text: rawPage.text,
        headings,
        conceptIds: pageConceptIds,
        tokenEstimate: Math.round(wordCount * 1.3),
        summary: `Covers ${headings.join(', ')}.`,
        images: rawPage.images,
      });

      sections.push({
        id: `sec-${pageNumber}`,
        title: headings[0] || `Section ${pageNumber}`,
        pageStart: pageNumber,
        pageEnd: pageNumber,
        level: 1,
        conceptIds: pageConceptIds,
      });
    });

    const edges: { from: string; to: string; relationship: string }[] = [];
    concepts.forEach((c) => {
      c.prerequisites.forEach((pId) => {
        edges.push({ from: pId, to: c.id, relationship: 'leads into' });
      });
    });

    const conceptGraph: ConceptGraph = {
      concepts,
      edges,
    };

    return {
      id: `doc-${Date.now()}`,
      title: title || filename.replace(/\.[^/.]+$/, ''),
      filename,
      fileSize: fileSize || 1024 * pages.length,
      pageCount: pages.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pages,
      sections,
      conceptGraph,
      description: `Uploaded document with ${pages.length} pages and ${concepts.length} key concepts.`,
      tags: ['Uploaded Document'],
    };
  }

  /**
   * Parses raw text or Markdown into structured pages, sections, and concept graph.
   */
  static parseTextToDocument(title: string, filename: string, rawText: string): DocumentData {
    const maxWordsPerPage = 800;
    const pageSplits: string[] = [];

    if (rawText.includes('--- PAGE BREAK ---') || rawText.includes('=== Page ')) {
      const explicitPages = rawText.split(/--- PAGE BREAK ---|=== Page \d+ ===/);
      pageSplits.push(...explicitPages.filter((p) => p.trim().length > 0));
    } else {
      const paragraphs = rawText.split(/\n\s*\n/);
      let currentPageBuf = '';
      let currentWordCount = 0;

      for (const para of paragraphs) {
        const trimmed = para.trim();
        const words = trimmed.split(/\s+/).length;
        const isMajorHeading = /^#{1,2}\s+/.test(trimmed);

        if (
          ((currentWordCount + words > maxWordsPerPage) || (isMajorHeading && currentWordCount > 500)) &&
          currentPageBuf.trim().length > 0
        ) {
          pageSplits.push(currentPageBuf.trim());
          currentPageBuf = trimmed + '\n\n';
          currentWordCount = words;
        } else {
          currentPageBuf += trimmed + '\n\n';
          currentWordCount += words;
        }
      }

      if (currentPageBuf.trim().length > 0) {
        pageSplits.push(currentPageBuf.trim());
      }
    }

    if (pageSplits.length === 0) {
      pageSplits.push(rawText);
    }

    const rawPages: ExtractedPDFPage[] = pageSplits.map((pageText, idx) => {
      const headingMatches = pageText.match(/^(#{1,3})\s+(.+)$/gm) || [];
      const headings = headingMatches.map((h) => h.replace(/^#+\s+/, '').trim());
      if (headings.length === 0) headings.push(`Section ${idx + 1}`);

      return {
        pageNumber: idx + 1,
        text: pageText,
        headings,
      };
    });

    return this.parsePagesToDocument(title, filename, rawPages, rawText.length);
  }

  /**
   * Fast keyword / BM25 search across document pages.
   */
  static searchPages(pages: DocumentPage[], query: string): { pageNumber: number; score: number; snippet: string }[] {
    const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    if (terms.length === 0) return [];

    const results: { pageNumber: number; score: number; snippet: string }[] = [];

    pages.forEach((p) => {
      const lower = p.text.toLowerCase();
      let score = 0;

      terms.forEach((term) => {
        const regex = new RegExp(`\\b${term}`, 'gi');
        const matches = lower.match(regex);
        if (matches) {
          score += matches.length * 2;
        }
        p.headings.forEach((h) => {
          if (h.toLowerCase().includes(term)) {
            score += 5;
          }
        });
      });

      if (score > 0) {
        const firstTerm = terms[0];
        const idx = lower.indexOf(firstTerm);
        const start = Math.max(0, idx - 60);
        const end = Math.min(p.text.length, idx + 120);
        const snippet = (start > 0 ? '...' : '') + p.text.slice(start, end).replace(/\n/g, ' ') + (end < p.text.length ? '...' : '');

        results.push({
          pageNumber: p.pageNumber,
          score,
          snippet,
        });
      }
    });

    return results.sort((a, b) => b.score - a.score);
  }
}
