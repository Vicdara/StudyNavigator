'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  DocumentData,
  DocumentPage,
  ConceptNode,
  HighlightColor,
  TextHighlight,
  UserPreferences,
  ChatMessage,
  ReadingMode,
} from '@/types';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Sparkles,
  HelpCircle,
  X,
  Eye,
  BookOpen,
  Maximize2,
  Minimize2,
  FileText,
  Highlighter,
  Trash2,
  LayoutGrid,
  Play,
  Pause,
  MessageSquare,
  Send,
  Bot,
  User,
  RotateCw,
  Layers,
  FileSpreadsheet,
  Image as ImageIcon,
  Camera,
  Settings,
} from 'lucide-react';
import { DocumentParser } from '@/lib/document/document-parser';
import { PDFStore } from '@/lib/storage/pdf-store';
import { CopilotLogo } from './CopilotLogo';
import * as pdfjsLib from 'pdfjs-dist';

interface DocumentReaderProps {
  document: DocumentData;
  currentPageNumber: number;
  onPageChange: (page: number) => void;
  bookmarks: number[];
  onToggleBookmark: (page: number) => void;
  onAskAIWithSelection: (selectedText: string, action?: string) => void;
  onTriggerImLostWithSelection: (selectedText: string) => void;
  onConfirmPageMastery?: (pageNumber: number) => void;
  autoPromptUnderstandingCheck?: boolean;
  onSelectConcept?: (concept: ConceptNode) => void;
  onNavigateToLibrary?: () => void;
  onOpenStudyTool?: (tab: 'notes' | 'flashcards' | 'quizzes' | 'bookmarks') => void;
  onOpenAssistant?: () => void;
  isAssistantOpen?: boolean;
  onOpenSettings?: () => void;
  highlights?: TextHighlight[];
  onAddHighlight?: (pageNumber: number, text: string, color: HighlightColor) => void;
  onRemoveHighlight?: (highlightId: string) => void;
  onChangeHighlightColor?: (highlightId: string, color: HighlightColor) => void;
  preferences?: UserPreferences;
  messages?: ChatMessage[];
  onSendMessage?: (text: string) => void;
}

// Dedicated High-Res PDF Page Canvas with auto-rendering
const PdfPageCanvas: React.FC<{
  pdfDoc: any;
  pageNumber: number;
  zoomLevel: number;
  containerWidth: number;
}> = ({ pdfDoc, pageNumber, zoomLevel, containerWidth }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendering, setRendering] = useState<boolean>(true);

  useEffect(() => {
    let isCancelled = false;
    const render = async () => {
      if (!pdfDoc || !canvasRef.current) return;
      try {
        setRendering(true);
        const page = await pdfDoc.getPage(pageNumber);
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const availableW = Math.max(500, (containerWidth || 800) - 32);
        const targetWidth = Math.min(availableW, Math.max(680, availableW * 0.96)) * (zoomLevel / 100);
        const fitScale = targetWidth / unscaledViewport.width;
        const dpr = typeof window !== 'undefined' ? Math.max(2, window.devicePixelRatio || 2) : 2;
        const renderScale = fitScale * dpr;
        const renderViewport = page.getViewport({ scale: renderScale });
        const displayViewport = page.getViewport({ scale: fitScale });

        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) return;

        canvas.width = renderViewport.width;
        canvas.height = renderViewport.height;
        canvas.style.width = `${displayViewport.width}px`;
        canvas.style.maxWidth = '100%';
        canvas.style.height = 'auto';
        canvas.style.display = 'block';

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

        await page.render({ canvasContext: context, viewport: renderViewport, enableWebGL: true }).promise;
      } catch (err) {
        // cancelled or error
      } finally {
        if (!isCancelled) setRendering(false);
      }
    };

    render();
    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, pageNumber, zoomLevel, containerWidth]);

  return (
    <div className="relative flex flex-col items-center mx-auto transition-all">
      {rendering && (
        <div className="py-24 text-center text-xs text-muted-foreground animate-pulse font-medium">
          Rendering Page {pageNumber}...
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto block rounded-lg shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-border/40"
      />
    </div>
  );
};

export const DocumentReader: React.FC<DocumentReaderProps> = ({
  document,
  currentPageNumber,
  onPageChange,
  bookmarks,
  onToggleBookmark,
  onAskAIWithSelection,
  onTriggerImLostWithSelection,
  onConfirmPageMastery,
  autoPromptUnderstandingCheck = true,
  onNavigateToLibrary,
  onOpenStudyTool,
  onOpenAssistant,
  isAssistantOpen = true,
  onOpenSettings,
  highlights = [],
  onAddHighlight,
  onRemoveHighlight,
  onChangeHighlightColor,
  preferences,
  messages = [],
  onSendMessage,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(80);
  const [pageInputValue, setPageInputValue] = useState<string>(String(currentPageNumber));
  const [selectionRange, setSelectionRange] = useState<{ text: string; top: number; left: number } | null>(null);
  const [isDocumentCompleted, setIsDocumentCompleted] = useState<boolean>(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(document.pdfDataUrl || null);
  const [pdfRenderMode, setPdfRenderMode] = useState<'visual_pdf' | 'reader_text'>('reader_text');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);
  
  // Left menu closed by default
  const [isPageNavOpen, setIsPageNavOpen] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(165);
  const [isDraggingSidebar, setIsDraggingSidebar] = useState<boolean>(false);

  // Screen size detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fullscreen Floating Mini-AI State & Context Menu
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [isFloatingAIModalOpen, setIsFloatingAIModalOpen] = useState<boolean>(false);
  const [floatingAIInput, setFloatingAIInput] = useState<string>('');
  const [floatingAIPos, setFloatingAIPos] = useState<{ x: number; y: number }>({ x: 40, y: 80 });
  const [isDraggingFloatingAI, setIsDraggingFloatingAI] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);

  const readingMode: ReadingMode = preferences?.readingMode || 'continuous_scroll';

  useEffect(() => {
    setPageInputValue(String(currentPageNumber));
  }, [currentPageNumber]);

  // Jump to specific page
  const jumpToPage = (pageNum: number) => {
    const target = Math.max(1, Math.min(document.pages.length, pageNum));
    onPageChange(target);
    setPageInputValue(String(target));
    if (readingMode === 'continuous_scroll') {
      const targetEl = window.document.getElementById(`doc-page-${target}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Keyboard Navigation with Arrow Keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = window.document.activeElement;
      const isTyping =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement)?.isContentEditable;

      if (isTyping) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        jumpToPage(currentPageNumber - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        jumpToPage(currentPageNumber + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageNumber, document.pages.length, readingMode]);

  // Fullscreen Handlers
  const toggleFullscreen = () => {
    if (!containerRef.current && typeof window === 'undefined') return;
    const el = containerRef.current;

    if (!window.document.fullscreenElement) {
      if (el?.requestFullscreen) {
        el.requestFullscreen().catch(() => setIsFullscreen(true));
      }
      setIsFullscreen(true);
    } else {
      if (window.document.exitFullscreen) {
        window.document.exitFullscreen().catch(() => setIsFullscreen(false));
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(window.document.fullscreenElement));
    };
    window.document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Context Menu in Fullscreen Mode
  const handleContextMenu = (e: React.MouseEvent) => {
    if (isFullscreen) {
      e.preventDefault();
      setContextMenuPos({ x: e.clientX, y: e.clientY });
    }
  };

  // Continuous Scroll Spy (when readingMode === 'continuous_scroll')
  useEffect(() => {
    if (readingMode !== 'continuous_scroll') return;
    const container = contentRef.current;
    if (!container) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const pageEls = container.querySelectorAll('[data-page-number]');
          const containerTop = container.getBoundingClientRect().top;
          const triggerLine = containerTop + 140;

          let activePage = currentPageNumber;
          pageEls.forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.top <= triggerLine && rect.bottom >= triggerLine) {
              const pageNum = parseInt(el.getAttribute('data-page-number') || '1', 10);
              if (pageNum) activePage = pageNum;
            }
          });

          if (activePage !== currentPageNumber) {
            onPageChange(activePage);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentPageNumber, onPageChange, readingMode]);

  // Sidebar drag-to-resize
  useEffect(() => {
    if (!isDraggingSidebar) return;
    const onMove = (e: MouseEvent) => {
      const newW = Math.max(130, Math.min(260, e.clientX - (containerRef.current?.getBoundingClientRect().left || 0)));
      setSidebarWidth(newW);
    };
    const onUp = () => setIsDraggingSidebar(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDraggingSidebar]);

  // Retrieve PDF
  const isPdf = document.fileType === 'pdf' || Boolean(document.pdfDataUrl) || Boolean(pdfDataUrl);

  useEffect(() => {
    let isMounted = true;
    const fetchPdf = async () => {
      if (document.pdfDataUrl) {
        setPdfDataUrl(document.pdfDataUrl);
      } else if (document.fileType === 'pdf') {
        const stored = await PDFStore.getPDF(document.id);
        if (stored && typeof stored === 'string' && isMounted) {
          setPdfDataUrl(stored);
        }
      }
    };
    fetchPdf();
    return () => {
      isMounted = false;
    };
  }, [document.id, document.pdfDataUrl, document.fileType]);

  useEffect(() => {
    if (pdfDataUrl) {
      let isMounted = true;
      const loadPdf = async () => {
        try {
          const base64Data = pdfDataUrl.split(',')[1];
          if (!base64Data) return;
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const loadingTask = pdfjsLib.getDocument({
            data: bytes,
            useSystemFonts: true,
            disableFontFace: false,
            isEvalSupported: false,
          });

          const pdf = await loadingTask.promise;
          if (isMounted) {
            pdfDocRef.current = pdf;
          }
        } catch (err) {
          console.warn('Could not load visual PDF document:', err);
        }
      };

      loadPdf();
      return () => {
        isMounted = false;
      };
    }
  }, [pdfDataUrl]);

  const activePageObj =
    document.pages.find((p) => p.pageNumber === currentPageNumber) || document.pages[0];

  // Extract embedded diagrams and visuals for the active PDF page
  const [currentPageImages, setCurrentPageImages] = useState<string[]>([]);
  useEffect(() => {
    let isCancelled = false;
    const extractPageImages = async () => {
      if (activePageObj?.images && activePageObj.images.length > 0) {
        setCurrentPageImages(activePageObj.images);
        return;
      }

      if (!pdfDocRef.current) {
        setCurrentPageImages([]);
        return;
      }

      try {
        const page = await pdfDocRef.current.getPage(currentPageNumber);
        const opList = await page.getOperatorList();
        const imageNames: string[] = [];
        const ops = (pdfjsLib as any).OPS;

        if (ops && opList?.fnArray) {
          for (let i = 0; i < opList.fnArray.length; i++) {
            const fn = opList.fnArray[i];
            if (fn === ops.paintImageXObject || fn === ops.paintInlineImageXObject) {
              const imgName = opList.argsArray[i]?.[0];
              if (imgName && !imageNames.includes(imgName)) {
                imageNames.push(imgName);
              }
            }
          }
        }

        const imgs: string[] = [];
        for (const imgName of imageNames.slice(0, 4)) {
          await new Promise<void>((resolve) => {
            try {
              page.objs.get(imgName, (imgData: any) => {
                if (!isCancelled && imgData && imgData.width > 60 && imgData.height > 60 && typeof window !== 'undefined') {
                  const canvas = window.document.createElement('canvas');
                  canvas.width = imgData.width;
                  canvas.height = imgData.height;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    if (imgData.data) {
                      const imgArray = new Uint8ClampedArray(imgData.data.buffer || imgData.data);
                      const imgD = new ImageData(imgArray, imgData.width, imgData.height);
                      ctx.putImageData(imgD, 0, 0);
                      imgs.push(canvas.toDataURL('image/png'));
                    } else if (imgData.bitmap) {
                      ctx.drawImage(imgData.bitmap, 0, 0);
                      imgs.push(canvas.toDataURL('image/png'));
                    }
                  }
                }
                resolve();
              });
            } catch {
              resolve();
            }
          });
        }

        if (!isCancelled) {
          setCurrentPageImages(imgs);
          if (imgs.length > 0 && activePageObj) {
            activePageObj.images = imgs;
          }
        }
      } catch (err) {
        console.warn('Failed to extract page diagrams:', err);
      }
    };

    extractPageImages();
    return () => {
      isCancelled = true;
    };
  }, [currentPageNumber, activePageObj, pdfDataUrl]);

  // Text Selection Toolbar
  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.selection-toolbar-popup')) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectionRange(null);
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 3) {
      setSelectionRange(null);
      return;
    }

    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect() || { top: 0, left: 0, width: 0, height: 0 };

      setSelectionRange({
        text,
        top: Math.max(10, rect.top - containerRect.top - 48),
        left: Math.max(10, Math.min(rect.left - containerRect.left + rect.width / 2 - 120, containerRect.width - 260)),
      });
    } catch {
      setSelectionRange(null);
    }
  };

  const clearSelection = () => {
    setSelectionRange(null);
    window.getSelection()?.removeAllRanges();
  };

  // Highlights state
  const [selectedHighlight, setSelectedHighlight] = useState<TextHighlight | null>(null);

  const getHighlightClasses = (color: HighlightColor) => {
    switch (color) {
      case 'yellow':
        return 'bg-amber-300/40 dark:bg-amber-500/35 text-foreground border-b-2 border-amber-400 hover:bg-amber-300/60';
      case 'green':
        return 'bg-emerald-300/40 dark:bg-emerald-500/35 text-foreground border-b-2 border-emerald-400 hover:bg-emerald-300/60';
      case 'blue':
        return 'bg-blue-300/40 dark:bg-blue-500/35 text-foreground border-b-2 border-blue-400 hover:bg-blue-300/60';
      case 'purple':
        return 'bg-purple-300/40 dark:bg-purple-500/35 text-foreground border-b-2 border-purple-400 hover:bg-purple-300/60';
      case 'pink':
        return 'bg-rose-300/40 dark:bg-rose-500/35 text-foreground border-b-2 border-rose-400 hover:bg-rose-300/60';
      default:
        return 'bg-amber-300/40 dark:bg-amber-500/35 text-foreground border-b-2 border-amber-400';
    }
  };

  const parseBaseInline = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={idx} className="italic text-foreground/90">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono text-[11px]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const renderInline = (str: string, pageNum: number = currentPageNumber): React.ReactNode => {
    const pageHighlights = (highlights || []).filter(
      (h) => h.pageNumber === pageNum && h.text && h.text.trim().length > 0
    );
    if (pageHighlights.length === 0) {
      return parseBaseInline(str);
    }

    try {
      const sorted = [...pageHighlights].sort((a, b) => b.text.length - a.text.length);
      const patternStrs = sorted.map((h) =>
        h.text.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')
      );
      const regex = new RegExp(`(${patternStrs.join('|')})`, 'gi');
      const segments = str.split(regex);

      return segments.map((seg, segIdx) => {
        if (!seg) return null;
        const normalizedSeg = seg.trim().toLowerCase().replace(/\s+/g, ' ');
        const match = sorted.find((h) => {
          const normalizedH = h.text.trim().toLowerCase().replace(/\s+/g, ' ');
          return (
            normalizedSeg === normalizedH ||
            seg.toLowerCase() === h.text.toLowerCase() ||
            seg.toLowerCase().includes(h.text.toLowerCase()) ||
            h.text.toLowerCase().includes(seg.toLowerCase())
          );
        });

        if (match && seg.trim().length > 0) {
          return (
            <mark
              key={`hl-${match.id}-${segIdx}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedHighlight(match);
              }}
              className={`cursor-pointer rounded-xs px-0.5 py-0.2 transition-all font-medium inline ${getHighlightClasses(
                match.color
              )}`}
              title={`Highlighted in ${match.color}. Click to edit or unhighlight.`}
            >
              {parseBaseInline(seg)}
            </mark>
          );
        }
        return parseBaseInline(seg);
      });
    } catch {
      return parseBaseInline(str);
    }
  };

  const cleanPageTopicTitle = (rawTitle?: string, pageNumber?: number): string => {
    if (!rawTitle) return `Topic ${pageNumber || 1}`;
    const cleaned = rawTitle
      .replace(/^#+\s*/, '')
      .replace(/^[\d\.\s\-_:]+/, '')
      .replace(/^READ\s*[\d\.\s\-_:]*/i, '')
      .replace(/\*\*/g, '')
      .trim();
    return cleaned || `Topic ${pageNumber || 1}`;
  };

  // Markdown renderer
  const renderFormattedMarkdown = (rawMarkdown: string, pageNum: number = currentPageNumber) => {
    const lines = rawMarkdown.split('\n');
    const nodes: React.ReactNode[] = [];
    let listBuffer: { type: 'ul' | 'ol'; items: string[] } | null = null;
    let codeBuffer: string[] | null = null;
    let tableBuffer: string[] = [];

    const flushTable = (key: number) => {
      if (tableBuffer.length === 0) return null;
      const headers = tableBuffer[0].split('|').map((c) => c.trim()).filter(Boolean);
      const rows = tableBuffer.slice(2).map((r) => r.split('|').map((c) => c.trim()).filter(Boolean));
      tableBuffer = [];

      return (
        <div key={`table-${key}`} className="my-4 overflow-x-auto rounded-xl border border-border/40 shadow-2xs">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-secondary/40 text-muted-foreground font-semibold border-b border-border/30">
                {headers.map((h, idx) => (
                  <th key={idx} className="p-3 font-semibold text-[11px] uppercase tracking-wider">
                    {renderInline(h, pageNum)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 bg-card/50">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-secondary/30 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-3 text-foreground/90 align-top text-xs sm:text-[13px]">
                      {renderInline(cell, pageNum)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    const flushList = (key: number) => {
      if (!listBuffer) return null;
      const current = listBuffer;
      listBuffer = null;

      if (current.type === 'ol') {
        return (
          <ol key={`list-${key}`} className="space-y-2.5 my-3 pl-1">
            {current.items.map((it, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm sm:text-[15px] leading-[1.8] text-foreground/85">
                <span className="w-5 h-5 rounded-md bg-secondary/80 text-muted-foreground text-[10px] flex items-center justify-center font-semibold font-mono shrink-0 mt-1 border border-border/30">
                  {idx + 1}
                </span>
                <div className="flex-1">{renderInline(it, pageNum)}</div>
              </li>
            ))}
          </ol>
        );
      } else {
        return (
          <ul key={`list-${key}`} className="space-y-2 my-2.5 pl-1">
            {current.items.map((it, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm sm:text-[15px] leading-[1.8] text-foreground/85">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600/70 shrink-0 mt-2.5" />
                <div className="flex-1">{renderInline(it, pageNum)}</div>
              </li>
            ))}
          </ul>
        );
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        if (listBuffer) nodes.push(flushList(i));
        tableBuffer.push(trimmed);
        continue;
      } else if (tableBuffer.length > 0) {
        nodes.push(flushTable(i));
      }

      if (trimmed.startsWith('```')) {
        if (codeBuffer !== null) {
          nodes.push(
            <pre key={`code-${i}`} className="my-4 p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner leading-relaxed">
              {codeBuffer.join('\n')}
            </pre>
          );
          codeBuffer = null;
        } else {
          codeBuffer = [];
        }
        continue;
      }
      if (codeBuffer !== null) {
        codeBuffer.push(line);
        continue;
      }

      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        if (listBuffer) nodes.push(flushList(i));
        nodes.push(<hr key={`hr-${i}`} className="my-6 border-border/40" />);
        continue;
      }

      const olMatch = trimmed.match(/^(\d+)[\.\)]\s+(.+)$/);
      if (olMatch) {
        if (!listBuffer || listBuffer.type !== 'ol') {
          if (listBuffer) nodes.push(flushList(i));
          listBuffer = { type: 'ol', items: [] };
        }
        listBuffer.items.push(olMatch[2]);
        continue;
      }

      const ulMatch = trimmed.match(/^[-*•]\s+(.+)$/);
      if (ulMatch) {
        if (!listBuffer || listBuffer.type !== 'ul') {
          if (listBuffer) nodes.push(flushList(i));
          listBuffer = { type: 'ul', items: [] };
        }
        listBuffer.items.push(ulMatch[1]);
        continue;
      }

      if (listBuffer && trimmed.length > 0) {
        nodes.push(flushList(i));
      }

      if (trimmed.startsWith('# ')) {
        nodes.push(
          <h1 key={`h1-${i}`} className="text-xl sm:text-2xl font-bold text-foreground tracking-tight pt-3 pb-1.5 border-b border-border/30">
            {renderInline(trimmed.replace(/^#+\s*/, ''), pageNum)}
          </h1>
        );
        continue;
      }
      if (trimmed.startsWith('## ')) {
        const headingText = trimmed.replace(/^##\s*/, '');
        nodes.push(
          <h2 key={`h2-${i}`} className="text-base sm:text-lg font-bold text-foreground tracking-tight pt-3 pb-0.5">
            {renderInline(headingText, pageNum)}
          </h2>
        );
        continue;
      }
      if (trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
        nodes.push(
          <h3 key={`h3-${i}`} className="text-sm sm:text-base font-semibold text-foreground tracking-tight pt-2.5">
            {renderInline(trimmed.replace(/^#+\s*/, ''), pageNum)}
          </h3>
        );
        continue;
      }

      if (trimmed.startsWith('> ')) {
        nodes.push(
          <blockquote key={`quote-${i}`} className="border-l-2 border-emerald-500/70 bg-secondary/30 px-3.5 py-2 rounded-r-lg italic text-foreground/85 my-2 text-xs sm:text-[13px] leading-relaxed">
            {renderInline(trimmed.replace(/^>\s*/, ''), pageNum)}
          </blockquote>
        );
        continue;
      }

      // Detect standalone metadata tags/headers (e.g. DATES, PRIZEPOOL, ELIGIBILITY, ENTRY)
      const isKeyLabel =
        /^[A-Z0-9\s:–—\-#]{2,30}$/.test(trimmed) &&
        trimmed.length < 35 &&
        !trimmed.includes('.') &&
        !trimmed.startsWith('http') &&
        !trimmed.startsWith('#');

      if (isKeyLabel) {
        nodes.push(
          <div key={`badge-${i}`} className="pt-2 pb-0.5 select-text">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary/80 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-bold tracking-wider uppercase border border-border/40 shadow-2xs">
              {renderInline(trimmed, pageNum)}
            </span>
          </div>
        );
        continue;
      }

      if (trimmed.length > 0) {
        nodes.push(
          <p key={`p-${i}`} className="text-xs sm:text-[13.5px] leading-[1.65] text-foreground/90 my-1.5">
            {renderInline(trimmed, pageNum)}
          </p>
        );
      }
    }

    if (listBuffer) nodes.push(flushList(lines.length));
    if (tableBuffer.length > 0) nodes.push(flushTable(lines.length));
    return nodes;
  };

  const handleFloatingAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!floatingAIInput.trim()) return;
    if (onSendMessage) {
      onSendMessage(floatingAIInput.trim());
    }
    setFloatingAIInput('');
  };

  const renderSinglePageContent = (p: DocumentPage) => (
    <div
      key={p.pageNumber}
      id={`doc-page-${p.pageNumber}`}
      data-page-number={p.pageNumber}
      className="w-full flex flex-col items-center select-text scroll-mt-6"
    >
      {isPdf && pdfRenderMode === 'visual_pdf' ? (
        <div className="w-full space-y-4">
          <PdfPageCanvas
            pdfDoc={pdfDocRef.current}
            pageNumber={p.pageNumber}
            zoomLevel={zoomLevel}
            containerWidth={contentRef.current?.clientWidth || 800}
          />
          {/* Pagination Controls for PDF in Single Page mode */}
          {readingMode === 'single_page' && (
            <div className="max-w-xl mx-auto p-3 rounded-2xl bg-card border border-border/60 flex items-center justify-between text-xs select-none">
              <button
                onClick={() => jumpToPage(p.pageNumber - 1)}
                disabled={p.pageNumber <= 1}
                className="px-3 py-1.5 rounded-xl bg-secondary disabled:opacity-20 text-foreground font-semibold flex items-center gap-1 hover:bg-secondary/80 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous Page</span>
              </button>

              <span className="font-mono text-xs font-bold text-muted-foreground">
                Page {p.pageNumber} / {document.pages.length}
              </span>

              <button
                onClick={() => jumpToPage(p.pageNumber + 1)}
                disabled={p.pageNumber >= document.pages.length}
                className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-20 text-primary-foreground font-bold flex items-center gap-1 transition-colors"
              >
                <span>Next Page</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            maxWidth: '100%',
            width: isMobileScreen
              ? '100%'
              : zoomLevel === 100
              ? '100%'
              : `${Math.max(320, (contentRef.current?.clientWidth || 800) - 16) * (zoomLevel / 100)}px`,
          }}
          className="w-full max-w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto bg-card text-foreground rounded-2xl border border-border/60 shadow-[0_2px_16px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.22)] px-4 py-5 sm:px-8 sm:py-7 md:px-10 md:py-8 space-y-3.5 font-sans transition-all overflow-hidden"
        >
          {/* Clean Header */}
          <div className="pb-2 border-b border-border/30 select-none flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-[10px] sm:text-[10.5px] font-bold text-primary uppercase tracking-wider min-w-0 truncate">
              <span className="shrink-0">Page {p.pageNumber} of {document.pages.length}</span>
              <span className="opacity-40 shrink-0">•</span>
              <span className="text-foreground font-sans font-semibold text-xs truncate max-w-[180px] sm:max-w-md">
                {cleanPageTopicTitle(p.headings[0], p.pageNumber)}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="prose-clean select-text">
            {renderFormattedMarkdown(p.text, p.pageNumber)}
          </div>

          {/* Extracted Page Diagrams & Visuals */}
          {((p.images && p.images.length > 0) || (p.pageNumber === currentPageNumber && currentPageImages.length > 0)) && (
            <div className="pt-4 mt-4 border-t border-border/30 space-y-3 select-none">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-mono">
                  <ImageIcon className="w-3.5 h-3.5 text-primary" />
                  <span>
                    Extracted Diagrams & Visuals ({(p.images || currentPageImages).length})
                  </span>
                </span>
                <span className="text-[10px] text-muted-foreground">Click to ask AI</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(p.images || currentPageImages).map((imgUrl, imgIdx) => (
                  <div
                    key={imgIdx}
                    className="group relative rounded-xl border border-border/60 bg-secondary/30 p-2 overflow-hidden flex flex-col items-center gap-2 hover:border-primary/50 transition-all shadow-2xs"
                  >
                    <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-background/50 flex items-center justify-center p-1 border border-border/20">
                      <img
                        src={imgUrl}
                        alt={`Page ${p.pageNumber} Diagram ${imgIdx + 1}`}
                        className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (onOpenAssistant) onOpenAssistant();
                        if (onSendMessage) {
                          onSendMessage(
                            `Can you explain this diagram / visual from Page ${p.pageNumber} in detail? What key concepts does it illustrate?`
                          );
                        }
                      }}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-98"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ask AI about Diagram</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Pagination Controls (Single Page Mode Only) */}
          {readingMode === 'single_page' && (
            p.pageNumber === document.pages.length ? (
              <div className="pt-6 mt-6 border-t border-border/30 flex items-center justify-between gap-4 select-none">
                <span className="text-xs font-mono text-muted-foreground">
                  End of Document ({document.pages.length} pages)
                </span>
                <button
                  onClick={() => setIsDocumentCompleted(true)}
                  className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <span>Complete Review</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="pt-4 mt-4 border-t border-border/20 flex items-center justify-between text-xs text-muted-foreground select-none">
                <button
                  onClick={() => jumpToPage(p.pageNumber - 1)}
                  disabled={p.pageNumber <= 1}
                  className="disabled:opacity-20 text-foreground font-semibold hover:underline flex items-center gap-1 text-xs cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous Page</span>
                </button>

                <span className="font-mono text-[10px]">Page {p.pageNumber} / {document.pages.length}</span>

                <button
                  onClick={() => jumpToPage(p.pageNumber + 1)}
                  className="text-primary font-semibold hover:underline flex items-center gap-1 text-xs cursor-pointer"
                >
                  <span>Next Page</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );

  return (
    <div
      ref={containerRef}
      onContextMenu={handleContextMenu}
      className="flex flex-col h-full bg-background relative overflow-hidden select-text w-full max-w-full font-sans"
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
    >
      {/* 1. Header Bar with h-12 matching Assistant Header Height */}
      <div className="flex items-center justify-between h-12 border-b border-border bg-card px-3 sm:px-4 text-xs select-none shrink-0 z-20 w-full shadow-2xs relative">
        {/* Top Slim Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-border/30 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentPageNumber / Math.max(1, document.pages.length)) * 100}%` }}
          />
        </div>

        {/* Left: Library Navigation & Document Title */}
        <div className="flex items-center gap-2.5 min-w-0 max-w-[65%] sm:max-w-[48%] truncate">
          {onNavigateToLibrary && (
            <button
              onClick={onNavigateToLibrary}
              className="h-8 px-2.5 sm:px-3 rounded-xl hover:bg-secondary text-foreground transition-colors flex items-center gap-1 font-bold text-xs shrink-0 border border-border/50 hover:border-border cursor-pointer shadow-2xs"
              title="Back to Library"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Library</span>
            </button>
          )}

          <div className="h-4.5 w-px bg-border/70 shrink-0 hidden sm:block" />

          <div className="flex items-center gap-2 truncate font-bold text-foreground min-w-0">
            <FileText className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate text-xs sm:text-sm font-bold tracking-tight text-foreground">{document.title}</span>
          </div>
        </div>

        {/* Right: Stepper/Zoom Controls + PDF Toggle + Fullscreen */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {/* Stepper & Zoom Pill (Hidden on mobile, visible on desktop/tablet) */}
          <div className="hidden md:flex items-center bg-secondary/70 dark:bg-secondary/50 border border-border/80 rounded-xl px-1.5 py-0.5 shadow-2xs h-8">
            {/* Page Stepper Segment */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => jumpToPage(currentPageNumber - 1)}
                disabled={currentPageNumber <= 1}
                className="w-6 h-6 rounded-lg hover:bg-background disabled:opacity-20 text-foreground flex items-center justify-center font-bold transition-all cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Clean Page Display - Click to Open Pages Menu */}
              <button
                type="button"
                onClick={() => setIsPageNavOpen((prev) => !prev)}
                className="flex items-center gap-1 px-1.5 py-0.5 font-mono text-xs select-none hover:text-primary rounded-md hover:bg-background/80 transition-colors cursor-pointer group"
                title="Click to view all pages"
              >
                <span className="font-bold text-foreground group-hover:text-primary">
                  {currentPageNumber}
                </span>
                <span className="font-semibold text-muted-foreground text-xs">
                  / {document.pages.length}
                </span>
              </button>

              <button
                onClick={() => jumpToPage(currentPageNumber + 1)}
                disabled={currentPageNumber >= document.pages.length}
                className="w-6 h-6 rounded-lg hover:bg-background disabled:opacity-20 text-foreground flex items-center justify-center font-bold transition-all cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Seamless Segment Divider */}
            <div className="h-4 w-px bg-border/80 mx-1.5 hidden sm:block" />

            {/* Zoom Segment */}
            <div className="hidden sm:flex items-center gap-0.5">
              <button
                onClick={() => setZoomLevel(Math.max(50, zoomLevel - 15))}
                className="w-6 h-6 rounded-lg hover:bg-background font-bold text-xs flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Zoom Out"
              >
                -
              </button>
              <button
                onClick={() => setZoomLevel(80)}
                className="px-1.5 h-6 rounded-lg hover:bg-background font-mono text-xs font-bold text-foreground hover:text-primary transition-colors flex items-center cursor-pointer"
                title="Reset Zoom to 80%"
              >
                {zoomLevel}%
              </button>
              <button
                onClick={() => setZoomLevel(Math.min(200, zoomLevel + 15))}
                className="w-6 h-6 rounded-lg hover:bg-background font-bold text-xs flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Zoom In"
              >
                +
              </button>
            </div>
          </div>

          {/* PDF Text/Visual Toggle */}
          {isPdf && (
            <button
              onClick={() => setPdfRenderMode(pdfRenderMode === 'visual_pdf' ? 'reader_text' : 'visual_pdf')}
              className="h-8 px-3 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              title={pdfRenderMode === 'visual_pdf' ? 'Switch to Clean Text' : 'Switch to Visual PDF'}
            >
              {pdfRenderMode === 'visual_pdf' ? (
                <>
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  <span className="hidden sm:inline text-xs font-bold">Clean Text</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <span className="hidden sm:inline text-xs font-bold">Visual PDF</span>
                </>
              )}
            </button>
          )}

          {/* Settings Button on Mobile (Replaces Fullscreen on Mobile) */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="md:hidden w-8 h-8 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground hover:text-primary transition-all flex items-center justify-center border border-border/60 cursor-pointer shadow-2xs"
              title="Settings & Preferences"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Fullscreen Button - Desktop Only */}
          <button
            onClick={toggleFullscreen}
            className="hidden md:flex w-8 h-8 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground hover:text-primary transition-all items-center justify-center border border-border/60 cursor-pointer shadow-2xs"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3. Main Reader Layout */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        {/* Floating Bottom-Right Assistant Open Button when Collapsed (AI Compass Logo) */}
        {!isAssistantOpen && onOpenAssistant && (
          <button
            onClick={onOpenAssistant}
            className="absolute bottom-6 right-6 z-30 w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-xl border border-primary/30 active:scale-95 transition-all cursor-pointer group animate-fade-in"
            title="Open Study Copilot (Ctrl+J)"
          >
            <CopilotLogo size={24} className="group-hover:scale-110 transition-transform" />
          </button>
        )}

        {/* Floating Left Pages Tab (Visible on Mobile & Desktop) */}
        {!isPageNavOpen && document.pages.length > 1 && (
          <button
            onClick={() => setIsPageNavOpen(true)}
            className="flex absolute left-0 top-1/2 -translate-y-1/2 z-30 px-1.5 py-3 rounded-r-xl bg-card/95 hover:bg-secondary text-muted-foreground hover:text-foreground border-y border-r border-border/70 shadow-md flex-col items-center gap-1 transition-all group cursor-pointer active:scale-95"
            title="Open Pages Menu"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-bold uppercase [writing-mode:vertical-lr] tracking-widest text-muted-foreground group-hover:text-foreground">
              Pages
            </span>
          </button>
        )}

        {/* Left Page Thumbnails Strip (Desktop & Mobile) */}
        {document.pages.length > 1 && isPageNavOpen && (
          <>
            {/* Desktop Left Sidebar */}
            <div
              style={{ width: `${sidebarWidth}px` }}
              className="hidden md:flex flex-col shrink-0 bg-[#f8f9fa] dark:bg-[#0c0d0e] select-none overflow-hidden border-r border-border/40 z-10"
            >
              {/* Sidebar Header with Close */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 shrink-0">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">Pages ({document.pages.length})</span>
                <button
                  onClick={() => setIsPageNavOpen(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
                  title="Close pages sidebar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Page List */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-3.5 custom-scrollbar">
                {document.pages.map((p) => {
                  const isAct = p.pageNumber === currentPageNumber;
                  const cleanTitle = cleanPageTopicTitle(p.headings[0], p.pageNumber);

                  return (
                    <button
                      key={p.pageNumber}
                      onClick={() => jumpToPage(p.pageNumber)}
                      className={`w-full rounded-xl transition-all group flex flex-col items-center gap-2 p-1 relative text-left cursor-pointer ${
                        isAct ? 'opacity-100 scale-[1.02]' : 'opacity-70 hover:opacity-100 transition-opacity'
                      }`}
                      title={`Page ${p.pageNumber}: ${cleanTitle}`}
                    >
                      <div
                        className={`w-full aspect-[1/1.32] rounded-xl bg-card p-2.5 flex flex-col justify-between overflow-hidden border shadow-2xs transition-all ${
                          isAct
                            ? 'border-primary ring-2 ring-primary/30 bg-primary/[0.05] shadow-xs'
                            : 'border-border/60 group-hover:border-primary/50'
                        }`}
                      >
                        <div className="space-y-2 w-full">
                          <div className="text-[9.5px] font-bold text-foreground leading-snug line-clamp-2 border-b border-border/40 pb-1">
                            {cleanTitle}
                          </div>
                          <div className="space-y-1.5 pt-0.5 opacity-60">
                            <div className="h-1 bg-muted-foreground/35 rounded w-11/12" />
                            <div className="h-1 bg-muted-foreground/25 rounded w-full" />
                            <div className="h-1 bg-muted-foreground/30 rounded w-4/5" />
                            <div className="h-1 bg-muted-foreground/20 rounded w-10/12" />
                          </div>
                        </div>
                        <div className="text-[9px] font-mono font-bold text-muted-foreground text-center pt-1 border-t border-border/25">
                          P.{p.pageNumber}
                        </div>
                      </div>

                      <span
                        className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isAct
                            ? 'bg-primary text-primary-foreground shadow-2xs'
                            : 'text-muted-foreground group-hover:text-foreground bg-secondary/70'
                        }`}
                      >
                        {p.pageNumber}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop Sidebar Drag Handle */}
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                setIsDraggingSidebar(true);
              }}
              className="hidden md:block w-px hover:w-1.5 bg-border/40 hover:bg-primary/30 active:bg-primary cursor-col-resize shrink-0 transition-all z-10 select-none"
              title="Drag to resize"
            />

            {/* Mobile Left Slide-In Pages Drawer */}
            <div
              onClick={() => setIsPageNavOpen(false)}
              className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-start animate-fade-in"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-72 max-w-[82vw] h-full bg-card border-r border-border flex flex-col shadow-2xl overflow-hidden animate-slide-in-left select-none"
              >
                {/* Mobile Drawer Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0 bg-card/80">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Pages ({document.pages.length})
                    </span>
                  </div>
                  <button
                    onClick={() => setIsPageNavOpen(false)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    title="Close pages menu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scrollable Page List on Mobile */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
                  {document.pages.map((p) => {
                    const isAct = p.pageNumber === currentPageNumber;
                    const cleanTitle = cleanPageTopicTitle(p.headings[0], p.pageNumber);

                    return (
                      <button
                        key={p.pageNumber}
                        onClick={() => {
                          jumpToPage(p.pageNumber);
                          setIsPageNavOpen(false);
                        }}
                        className={`w-full rounded-2xl transition-all flex items-center gap-3 p-2.5 text-left cursor-pointer border ${
                          isAct
                            ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30'
                            : 'border-border/60 hover:border-primary/50 bg-card hover:bg-secondary/40 text-foreground'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                            isAct
                              ? 'bg-primary text-primary-foreground shadow-xs'
                              : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {p.pageNumber}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate text-foreground">
                            {cleanTitle}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                            {p.text ? `${p.text.slice(0, 45)}...` : `Page ${p.pageNumber}`}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Center Canvas */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto w-full custom-scrollbar select-text relative bg-[#f8f9fa] dark:bg-[#0c0d0e] p-2 sm:p-4 md:p-6 pb-16 flex flex-col items-center"
        >
          {isDocumentCompleted ? (
            <div className="w-full max-w-xl mx-auto p-8 my-auto flex flex-col items-center justify-center text-center space-y-5 animate-fade-in bg-card border border-border/50 rounded-3xl shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-primary/15 text-primary flex items-center justify-center font-bold text-3xl">
                🏆
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground">
                  Study Pack Completed!
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You've reviewed all {document.pages.length} pages of <strong>{document.title}</strong>.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => jumpToPage(1)}
                  className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs transition-colors cursor-pointer"
                >
                  Review from Page 1
                </button>
                {onNavigateToLibrary && (
                  <button
                    onClick={onNavigateToLibrary}
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
                  >
                    Back to Library
                  </button>
                )}
              </div>
            </div>
          ) : readingMode === 'single_page' ? (
            /* Single Page Mode */
            <div ref={pageContainerRef} className="w-full space-y-5 pb-10 flex flex-col items-center select-text">
              {renderSinglePageContent(activePageObj)}
            </div>
          ) : (
            /* Continuous Multi-Page Scroll Mode */
            <div
              ref={pageContainerRef}
              className="w-full space-y-5 pb-10 flex flex-col items-center select-text"
            >
              {document.pages.map((p) => renderSinglePageContent(p))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Selection Toolbar */}
      {selectionRange && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{ top: `${selectionRange.top}px`, left: `${selectionRange.left}px` }}
          className="selection-toolbar-popup absolute z-50 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/80 p-1.5 flex items-center gap-2 text-xs animate-slide-up select-none ring-1 ring-slate-700"
        >
          <div className="flex items-center gap-1.5 px-1.5 py-1 bg-slate-800/90 rounded-xl border border-slate-700/60">
            {(['yellow', 'green', 'blue', 'purple', 'pink'] as HighlightColor[]).map((color) => {
              const bgColors: Record<HighlightColor, string> = {
                yellow: 'bg-amber-400 hover:bg-amber-300',
                green: 'bg-emerald-400 hover:bg-emerald-300',
                blue: 'bg-blue-400 hover:bg-blue-300',
                purple: 'bg-purple-400 hover:bg-purple-300',
                pink: 'bg-rose-400 hover:bg-rose-300',
              };
              return (
                <button
                  key={color}
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onAddHighlight && selectionRange.text) {
                      onAddHighlight(currentPageNumber, selectionRange.text, color);
                    }
                    clearSelection();
                  }}
                  className={`w-5 h-5 rounded-full ${bgColors[color]} transition-transform hover:scale-125 active:scale-95 shadow-2xs border border-white/20 cursor-pointer`}
                  title={`Highlight in ${color}`}
                />
              );
            })}
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              const textToAsk = selectionRange.text;
              clearSelection();
              onAskAIWithSelection(textToAsk, 'explain');
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary-foreground font-bold transition-all active:scale-95 cursor-pointer border border-primary/30 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              clearSelection();
            }}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 5. Highlight Popover with Instant Unhighlight Option */}
      {selectedHighlight && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fade-in"
          onClick={() => setSelectedHighlight(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card text-card-foreground border border-border rounded-2xl shadow-2xl p-4 max-w-sm w-full space-y-3 animate-slide-up"
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="flex items-center gap-1.5">
                <Highlighter className="w-4 h-4 text-primary" />
                <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Highlight (Page {selectedHighlight.pageNumber})
                </span>
              </div>
              <button
                onClick={() => setSelectedHighlight(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs italic bg-secondary/50 p-2.5 rounded-xl text-foreground/90 border border-border/40 line-clamp-3">
              "{selectedHighlight.text}"
            </p>

            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-muted-foreground">Change Color:</div>
              <div className="flex items-center gap-2">
                {(['yellow', 'green', 'blue', 'purple', 'pink'] as HighlightColor[]).map((c) => {
                  const bgColors: Record<HighlightColor, string> = {
                    yellow: 'bg-amber-400',
                    green: 'bg-emerald-400',
                    blue: 'bg-blue-400',
                    purple: 'bg-purple-400',
                    pink: 'bg-rose-400',
                  };
                  const isCur = selectedHighlight.color === c;
                  return (
                    <button
                      key={c}
                      onClick={() => {
                        if (onChangeHighlightColor) {
                          onChangeHighlightColor(selectedHighlight.id, c);
                        }
                        setSelectedHighlight({ ...selectedHighlight, color: c });
                      }}
                      className={`w-6 h-6 rounded-full ${bgColors[c]} transition-all cursor-pointer ${
                        isCur ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'
                      }`}
                      title={c}
                    />
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <button
                onClick={() => {
                  const txt = selectedHighlight.text;
                  setSelectedHighlight(null);
                  onAskAIWithSelection(txt, 'explain');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary font-bold text-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>

              <button
                onClick={() => {
                  if (onRemoveHighlight) {
                    onRemoveHighlight(selectedHighlight.id);
                  }
                  setSelectedHighlight(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors cursor-pointer"
                title="Remove highlight"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Unhighlight</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Fullscreen Custom Right-Click Context Menu */}
      {contextMenuPos && (
        <div
          onClick={() => setContextMenuPos(null)}
          className="fixed inset-0 z-50"
        >
          <div
            style={{ top: `${contextMenuPos.y}px`, left: `${contextMenuPos.x}px` }}
            className="absolute z-50 bg-card text-foreground border border-border rounded-xl shadow-2xl p-1.5 min-w-[200px] text-xs space-y-1 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setContextMenuPos(null);
                setIsFloatingAIModalOpen(true);
              }}
              className="w-full text-left p-2 rounded-lg hover:bg-secondary flex items-center gap-2 font-medium text-foreground transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Open Floating AI Copilot</span>
            </button>
          </div>
        </div>
      )}

      {/* 7. Fullscreen Floating Mini-AI Assistant Container */}
      {isFloatingAIModalOpen && (
        <div
          style={{ top: `${floatingAIPos.y}px`, left: `${floatingAIPos.x}px` }}
          className="fixed z-50 w-80 sm:w-96 max-h-[500px] flex flex-col bg-card/95 backdrop-blur-md text-card-foreground border border-primary/40 rounded-2xl shadow-2xl overflow-hidden animate-slide-up ring-1 ring-primary/20"
        >
          {/* Header */}
          <div
            onMouseDown={(e) => {
              setIsDraggingFloatingAI(true);
              setDragOffset({
                x: e.clientX - floatingAIPos.x,
                y: e.clientY - floatingAIPos.y,
              });
            }}
            className="p-3 border-b border-border/70 bg-secondary/50 flex items-center justify-between cursor-move select-none"
          >
            <div className="flex items-center gap-2">
              <CopilotLogo className="w-5 h-5" />
              <span className="font-bold text-xs text-foreground">Fullscreen Copilot</span>
              <span className="text-[10px] font-mono text-muted-foreground">P.{currentPageNumber}</span>
            </div>

            <button
              onClick={() => setIsFloatingAIModalOpen(false)}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mini Chat Thread */}
          <div className="flex-1 p-3 overflow-y-auto max-h-64 space-y-2.5 text-xs custom-scrollbar select-text">
            {messages.slice(-4).map((msg) => (
              <div
                key={msg.id}
                className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto max-w-[85%]'
                    : 'bg-secondary/70 border border-border/50 text-foreground mr-auto max-w-[90%]'
                }`}
              >
                <div className="font-semibold text-[10px] opacity-75 mb-1">
                  {msg.role === 'user' ? 'You' : 'Copilot'}
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))}
          </div>

          {/* Mini Input Form */}
          <form onSubmit={handleFloatingAISubmit} className="p-2.5 border-t border-border/70 bg-card flex items-center gap-2">
            <input
              type="text"
              value={floatingAIInput}
              onChange={(e) => setFloatingAIInput(e.target.value)}
              placeholder="Ask anything about this page..."
              className="flex-1 bg-secondary/60 border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={!floatingAIInput.trim()}
              className="p-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-30 transition-colors shadow-2xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
