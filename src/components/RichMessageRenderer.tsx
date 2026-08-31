'use client';

import React from 'react';
import {
  Sparkles,
  Lightbulb,
} from 'lucide-react';

interface RichMessageRendererProps {
  content: string;
}

export const RichMessageRenderer: React.FC<RichMessageRendererProps> = ({ content }) => {
  // Parse inline bold, italics, code, and links robustly
  const parseInlineFormatting = (text: string): React.ReactNode => {
    // If text contains an odd number of **, add closing ** to prevent raw dangling asterisks
    const boldCount = (text.match(/\*\*/g) || []).length;
    let normalized = text;
    if (boldCount % 2 !== 0) {
      normalized += '**';
    }

    const regex = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g;
    const parts = normalized.split(regex);

    return parts.map((part, idx) => {
      if (!part) return null;
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 rounded-md bg-secondary text-foreground font-mono text-[11px] border border-border/60"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (
        ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) &&
        part.length >= 4
      ) {
        return (
          <strong key={idx} className="font-bold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (
        ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) &&
        part.length >= 2 &&
        !part.startsWith('**')
      ) {
        return (
          <em key={idx} className="italic text-foreground/90">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  const renderFormattedContent = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[] = [];
    let bulletBuffer: { key: number; text: string }[] = [];
    let numberBuffer: { key: number; num: string; text: string }[] = [];

    const flushTable = (key: number) => {
      if (tableRows.length === 0) return null;
      const headerLine = tableRows[0];
      const dataLines = tableRows.slice(2); // skip separator

      const headers = headerLine
        .split('|')
        .map((h) => h.trim())
        .filter(Boolean);

      const rows = dataLines.map((row) =>
        row
          .split('|')
          .map((c) => c.trim())
          .filter(Boolean)
      );

      tableRows = [];
      inTable = false;

      return (
        <div key={`table-${key}`} className="my-3 overflow-x-auto rounded-xl border border-border/70 shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-secondary/60 text-foreground border-b border-border/60">
                {headers.map((h, hIdx) => (
                  <th key={hIdx} className="p-2.5 font-bold">
                    {parseInlineFormatting(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-card">
              {rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={`hover:bg-secondary/30 transition-colors ${
                    rIdx % 2 === 1 ? 'bg-secondary/20' : ''
                  }`}
                >
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2.5 text-foreground/90 align-top">
                      {parseInlineFormatting(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    const flushBullets = (key: number) => {
      if (bulletBuffer.length === 0) return null;
      const items = [...bulletBuffer];
      bulletBuffer = [];
      return (
        <ul key={`ul-${key}`} className="space-y-1.5 my-2.5 pl-4 list-disc marker:text-primary text-xs sm:text-sm text-foreground/90 leading-relaxed">
          {items.map((item) => (
            <li key={item.key} className="pl-1">
              {parseInlineFormatting(item.text)}
            </li>
          ))}
        </ul>
      );
    };

    const flushNumbers = (key: number) => {
      if (numberBuffer.length === 0) return null;
      const items = [...numberBuffer];
      numberBuffer = [];
      return (
        <ol key={`ol-${key}`} className="space-y-2 my-2.5 pl-1 text-xs sm:text-sm text-foreground/90 leading-relaxed">
          {items.map((item) => (
            <li key={item.key} className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/15 text-primary font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                {item.num}
              </span>
              <div className="flex-1 pt-0.5">{parseInlineFormatting(item.text)}</div>
            </li>
          ))}
        </ol>
      );
    };

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();

      // Table line detection
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        if (bulletBuffer.length > 0) elements.push(flushBullets(i));
        if (numberBuffer.length > 0) elements.push(flushNumbers(i));
        inTable = true;
        tableRows.push(trimmed);
        continue;
      } else if (inTable) {
        elements.push(flushTable(i));
      }

      // Bullet points (- , * , • )
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        if (numberBuffer.length > 0) elements.push(flushNumbers(i));
        const text = trimmed.replace(/^[\s-*•]+/, '').trim();
        bulletBuffer.push({ key: i, text });
        continue;
      } else if (bulletBuffer.length > 0) {
        elements.push(flushBullets(i));
      }

      // Numbered items (1. , 2. )
      if (/^\d+[\.\)]\s/.test(trimmed)) {
        if (bulletBuffer.length > 0) elements.push(flushBullets(i));
        const num = trimmed.match(/^\d+/)?.[0] || '1';
        const text = trimmed.replace(/^\d+[\.\)]\s*/, '').trim();
        numberBuffer.push({ key: i, num, text });
        continue;
      } else if (numberBuffer.length > 0) {
        elements.push(flushNumbers(i));
      }

      // Headings: #####, ####, ###, ##, #
      if (trimmed.startsWith('##### ')) {
        elements.push(
          <h5 key={i} className="text-xs sm:text-sm font-bold text-foreground mt-4 mb-2">
            {parseInlineFormatting(trimmed.replace(/^#{5}\s*/, ''))}
          </h5>
        );
        continue;
      }
      if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={i} className="text-xs sm:text-sm font-bold text-foreground mt-4 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <span>{parseInlineFormatting(trimmed.replace(/^#{4}\s*/, ''))}</span>
          </h4>
        );
        continue;
      }
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-sm sm:text-base font-bold text-foreground mt-5 mb-2.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <span>{parseInlineFormatting(trimmed.replace(/^#{3}\s*/, ''))}</span>
          </h3>
        );
        continue;
      }
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-base sm:text-lg font-bold text-foreground mt-6 mb-3 pb-1.5 border-b border-border/60">
            {parseInlineFormatting(trimmed.replace(/^#{2}\s*/, ''))}
          </h2>
        );
        continue;
      }
      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-lg sm:text-xl font-extrabold text-foreground mt-6 mb-3 pb-2 border-b border-border/70">
            {parseInlineFormatting(trimmed.replace(/^#\s*/, ''))}
          </h1>
        );
        continue;
      }

      // Code blocks
      if (trimmed.startsWith('```')) {
        const codeBlock: string[] = [];
        let j = i + 1;
        while (j < lines.length && !lines[j].trim().startsWith('```')) {
          codeBlock.push(lines[j]);
          j++;
        }
        i = j;
        elements.push(
          <pre key={i} className="my-4 p-3.5 rounded-xl bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto border border-slate-800 shadow-inner leading-relaxed">
            {codeBlock.join('\n')}
          </pre>
        );
        continue;
      }

      // Horizontal Rule (---, ***, ___)
      if (/^[-*_]{3,}$/.test(trimmed)) {
        elements.push(<hr key={i} className="my-4 border-border/60" />);
        continue;
      }

      // Blockquotes (> text)
      if (trimmed.startsWith('>')) {
        const quoteText = trimmed.replace(/^>\s*/, '').replace(/\^\^/g, '').trim();
        elements.push(
          <blockquote key={i} className="my-3.5 pl-4 py-2 border-l-2 border-primary text-xs sm:text-sm text-foreground/90 bg-secondary/40 rounded-r-xl italic leading-relaxed">
            {parseInlineFormatting(quoteText)}
          </blockquote>
        );
        continue;
      }

      // Standard paragraphs
      if (trimmed.length > 0) {
        const sanitizedLine = trimmed.replace(/\^\^/g, '');
        elements.push(
          <p key={i} className="text-xs sm:text-sm leading-relaxed text-foreground/90 my-2">
            {parseInlineFormatting(sanitizedLine)}
          </p>
        );
      }
    }

    if (inTable) elements.push(flushTable(lines.length));
    if (bulletBuffer.length > 0) elements.push(flushBullets(lines.length));
    if (numberBuffer.length > 0) elements.push(flushNumbers(lines.length));

    return elements;
  };

  return <div className="space-y-2.5 select-text leading-relaxed font-sans">{renderFormattedContent()}</div>;
};
