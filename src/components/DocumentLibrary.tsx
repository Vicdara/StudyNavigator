'use client';

import React, { useState, useRef } from 'react';
import { DocumentData, StudySession } from '@/types';
import { DocumentParser } from '@/lib/document/document-parser';
import { PDFExtractor } from '@/lib/document/pdf-extractor';
import { DocxExtractor } from '@/lib/document/docx-extractor';
import { PDFStore } from '@/lib/storage/pdf-store';
import {
  UploadCloud,
  Award,
  Clock,
  Trash2,
  ArrowRight,
  Plus,
  Compass,
  FileText,
  Layers,
  Sparkles,
  Zap,
  BookOpen,
  FileCode,
  FileSignature,
  FileCheck,
  Search,
  LayoutGrid,
  List,
  Filter,
  CheckCircle2,
  Settings,
  Palette,
  X,
} from 'lucide-react';
import { ThemePreset, UserProfile } from '@/types';
import { ThemeSwitcher } from './ThemeSwitcher';

interface DocumentLibraryProps {
  documents: DocumentData[];
  sessions: StudySession[];
  onSelectDocument: (doc: DocumentData) => void;
  onResumeSession: (session: StudySession) => void;
  onUploadDocument: (newDoc: DocumentData) => void;
  onDeleteDocument: (docId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  activeTheme?: ThemePreset;
  onSelectTheme?: (theme: ThemePreset) => void;
  userProfile?: UserProfile;
  onOpenSettings?: () => void;
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({
  documents,
  sessions,
  onSelectDocument,
  onResumeSession,
  onUploadDocument,
  onDeleteDocument,
  onDeleteSession,
  activeTheme,
  onSelectTheme,
  userProfile,
  onOpenSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    setUploading(true);
    try {
      const fileNameLower = file.name.toLowerCase();
      const isPdf = fileNameLower.endsWith('.pdf') || file.type === 'application/pdf';
      const isDocx = fileNameLower.endsWith('.docx') || fileNameLower.endsWith('.doc') || file.type.includes('word');
      const isMd = fileNameLower.endsWith('.md') || fileNameLower.endsWith('.markdown');

      if (isPdf) {
        let extractedPages: any[] = [];
        try {
          extractedPages = await PDFExtractor.extractTextFromPDF(file);
        } catch (pdfErr) {
          console.warn('PDF extraction warning, using fallback page structure:', pdfErr);
        }

        if (!extractedPages || extractedPages.length === 0) {
          extractedPages = [
            {
              pageNumber: 1,
              text: `# ${file.name.replace(/\.[^/.]+$/, '')}\n\nUploaded PDF document. Use Study Copilot to ask questions, explain concepts, or test your knowledge.`,
              headings: [file.name.replace(/\.[^/.]+$/, '')],
            },
          ];
        }

        let pdfDataUrl = '';
        try {
          pdfDataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string) || '');
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
          });
        } catch {
          // ignore data url reading error
        }

        const parsedDoc = DocumentParser.parsePagesToDocument(
          file.name.replace(/\.[^/.]+$/, ''),
          file.name,
          extractedPages,
          file.size
        );
        parsedDoc.fileType = 'pdf';
        if (pdfDataUrl) {
          parsedDoc.pdfDataUrl = pdfDataUrl;
          await PDFStore.savePDF(parsedDoc.id, pdfDataUrl).catch(() => {});
        }
        onUploadDocument(parsedDoc);
      } else if (isDocx) {
        let extractedPages: any[] = [];
        try {
          extractedPages = await DocxExtractor.extractTextFromDocx(file);
        } catch (docxErr) {
          console.warn('DOCX extraction warning:', docxErr);
        }

        if (!extractedPages || extractedPages.length === 0) {
          extractedPages = [
            {
              pageNumber: 1,
              text: `# ${file.name.replace(/\.[^/.]+$/, '')}\n\nUploaded Word document. Use Study Copilot to explore concepts.`,
              headings: [file.name.replace(/\.[^/.]+$/, '')],
            },
          ];
        }

        const parsedDoc = DocumentParser.parsePagesToDocument(
          file.name.replace(/\.[^/.]+$/, ''),
          file.name,
          extractedPages,
          file.size
        );
        parsedDoc.fileType = 'docx';
        onUploadDocument(parsedDoc);
      } else {
        const text = await file.text().catch(() => '');
        const contentText = text && text.trim().length > 0
          ? text
          : `# ${file.name.replace(/\.[^/.]+$/, '')}\n\nUploaded document. Use Study Copilot to explore concepts.`;

        const parsedDoc = DocumentParser.parseTextToDocument(
          file.name.replace(/\.[^/.]+$/, ''),
          file.name,
          contentText
        );
        parsedDoc.fileType = isMd ? 'md' : 'txt';
        onUploadDocument(parsedDoc);
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setUploadError(err.message || 'Failed to process document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.filename.toLowerCase().includes(q) ||
      (doc.description && doc.description.toLowerCase().includes(q)) ||
      (doc.tags && doc.tags.some((t) => t.toLowerCase().includes(q))) ||
      (doc.pages && doc.pages.some((p) => p.headings && p.headings.some((h) => h.toLowerCase().includes(q))))
    );
  });

  const getFileIcon = (fileType?: string, filename?: string) => {
    const fn = (filename || '').toLowerCase();
    const type = fileType || (fn.endsWith('.pdf') ? 'pdf' : fn.endsWith('.md') ? 'md' : fn.endsWith('.docx') ? 'docx' : 'txt');

    switch (type) {
      case 'pdf':
        return (
          <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
            <FileText className="w-3.5 h-3.5" />
          </div>
        );
      case 'md':
        return (
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
            <FileCode className="w-3.5 h-3.5" />
          </div>
        );
      case 'docx':
        return (
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
            <FileSignature className="w-3.5 h-3.5" />
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
            <FileCheck className="w-3.5 h-3.5" />
          </div>
        );
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-8 space-y-6 animate-fade-in select-none">
      {/* 1. Desktop Library Header with Global Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Workspace Knowledge Base</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Study Library
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Select any study pack or upload custom PDFs, Markdown, Word, and text documents.
          </p>
        </div>

        {/* Right Header Quick Actions: Upload Document only */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] text-primary-foreground font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{uploading ? 'Processing...' : 'Upload Document'}</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md,.docx,application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              const file = e.target.files[0];
              e.target.value = '';
              handleFileUpload(file);
            }
          }}
        />
      </div>

      {/* 2. Drag & Drop File Ingestion Zone (Longer / Spacious Drop Area) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl py-10 sm:py-14 px-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3.5 min-h-[170px] ${
          isDragging
            ? 'border-primary bg-primary/10 ring-4 ring-primary/20 scale-[1.005]'
            : 'border-border/80 hover:border-primary/70 bg-card/60 hover:bg-secondary/40'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0 shadow-2xs">
          <UploadCloud className="w-7 h-7" />
        </div>
        <div className="text-center space-y-1.5 max-w-md">
          <h3 className="font-extrabold text-sm sm:text-base text-foreground">
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                Parsing document structure, concepts, and outline...
              </span>
            ) : (
              <>
                <span>Drop PDF, Word (.docx), Markdown, or Text files here, or </span>
                <span className="text-primary underline font-bold">browse your computer</span>
              </>
            )}
          </h3>
          <p className="text-xs text-muted-foreground">
            Fast client-side vector extraction · Formats: <strong>.pdf</strong>, <strong>.docx</strong>, <strong>.md</strong>, <strong>.txt</strong>
          </p>
          {uploadError && (
            <div className="mt-2 text-xs text-rose-500 font-semibold bg-rose-500/10 p-2 rounded-lg inline-block">
              {uploadError}
            </div>
          )}
        </div>
      </div>

      {/* 3. Prominent Search Bar & View Mode Toggle */}
      <div className="flex items-center gap-3 pt-2 w-full">
        {/* Big Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search study packs by title, topic, or keyword..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-card border border-border/80 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-sans shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer rounded-full hover:bg-secondary transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Grid / List View Toggle */}
        <div className="flex items-center bg-secondary/80 p-1 rounded-2xl border border-border/60 shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Study Packs Grid / List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocs.map((doc) => {
            const activeSession = sessions.find((s) => s.documentId === doc.id);
            const masteredCount = activeSession?.memory?.masteredConceptIds?.length || 0;
            const totalConcepts = doc.conceptGraph?.concepts?.length || 0;
            const progressPercent = totalConcepts > 0 ? Math.round((masteredCount / totalConcepts) * 100) : 0;

            return (
              <div
                key={doc.id}
                className="bg-card border border-border/70 rounded-2xl p-4 flex flex-col justify-between hover:border-primary/60 transition-all card-hover-lift group relative shadow-xs"
              >
                <div className="space-y-3">
                  {/* Top Bar: Icon, Page Count, Delete Button */}
                  <div className="flex items-center justify-between">
                    {getFileIcon(doc.fileType, doc.filename)}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {doc.pageCount} Pages
                      </span>
                      {!doc.isSample && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDocument(doc.id);
                          }}
                          className="p-1 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Description (Full title wrap) */}
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors leading-snug break-words">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {doc.description || 'Custom uploaded study material.'}
                    </p>
                  </div>

                  {/* Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {doc.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md bg-secondary/80 text-muted-foreground font-mono text-[9px] font-semibold uppercase tracking-wider border border-border/40"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Progress Bar (if studied) */}
                  {activeSession && totalConcepts > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                        <span>Mastery</span>
                        <span className="font-mono">{progressPercent}%</span>
                      </div>
                      <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono font-medium">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <span>{doc.pageCount} Pages</span>
                  </div>

                  <button
                    onClick={() => onSelectDocument(doc)}
                    className="px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-bold transition-all flex items-center gap-1 active:scale-95 group-hover:border-primary/60 cursor-pointer"
                  >
                    <span>{activeSession ? 'Resume' : 'Study'}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View (Shows Full Document Titles with No Cutoff) */
        <div className="bg-card border border-border/70 rounded-2xl divide-y divide-border/60 overflow-hidden shadow-xs">
          {filteredDocs.map((doc) => {
            const activeSession = sessions.find((s) => s.documentId === doc.id);

            return (
              <div
                key={doc.id}
                onClick={() => onSelectDocument(doc)}
                className="p-4 hover:bg-secondary/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer group"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {getFileIcon(doc.fileType, doc.filename)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-snug break-words">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                      {doc.description || 'Custom uploaded study material.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  <span className="font-mono text-xs text-muted-foreground flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <span>{doc.pageCount} Pages</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDocument(doc);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <span>{activeSession ? 'Resume' : 'Study'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {!doc.isSample && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDocument(doc.id);
                        }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
