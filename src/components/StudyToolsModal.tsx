'use client';

import React, { useState, useEffect } from 'react';
import {
  DocumentData,
  StudySession,
  AISettings,
} from '@/types';
import {
  X,
  FileText,
  Layers,
  HelpCircle as QuizIcon,
  Bookmark,
  CheckCircle2,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Save,
  Check,
  Trash2,
  RefreshCw,
  Award,
} from 'lucide-react';
import { ClientAI } from '@/lib/ai/client-ai';

export type StudyToolTab = 'notes' | 'flashcards' | 'quizzes' | 'bookmarks';

interface StudyToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: StudyToolTab;
  onTabChange: (tab: StudyToolTab) => void;
  document: DocumentData;
  session: StudySession;
  currentPage: number;
  aiSettings?: AISettings;
  onJumpToPage: (page: number) => void;
  onToggleBookmark: (page: number) => void;
}

export const StudyToolsModal: React.FC<StudyToolsModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  document,
  session,
  currentPage,
  aiSettings,
  onJumpToPage,
  onToggleBookmark,
}) => {
  // 1. Notes State
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [currentNoteText, setCurrentNoteText] = useState<string>('');
  const [noteSaved, setNoteSaved] = useState<boolean>(false);

  // 2. AI Flashcards State
  const [flashcards, setFlashcards] = useState<{ term: string; definition: string; keyTakeaway?: string }[]>([]);
  const [flashcardIdx, setFlashcardIdx] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState<boolean>(false);

  // 3. AI Quiz State
  const [quizQuestions, setQuizQuestions] = useState<
    {
      id: number;
      conceptName: string;
      question: string;
      options: { id: string; text: string; isCorrect: boolean; explanation: string }[];
    }[]
  >([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const currentPageObj =
    document.pages.find((p) => p.pageNumber === currentPage) || document.pages[0];

  // Load saved notes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`study_notes_${document.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotes(parsed);
        setCurrentNoteText(parsed[currentPage] || '');
      } else {
        setCurrentNoteText('');
      }
    } catch {
      setCurrentNoteText('');
    }
  }, [document.id, currentPage, isOpen]);

  const handleSaveNote = () => {
    const updated = { ...notes, [currentPage]: currentNoteText };
    setNotes(updated);
    try {
      localStorage.setItem(`study_notes_${document.id}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save note to localStorage', e);
    }
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  // Generate Flashcards with AI
  const fetchAIFlashcards = async () => {
    setIsLoadingFlashcards(true);
    setFlashcardIdx(0);
    setIsFlipped(false);
    try {
      const cards = await ClientAI.generateFlashcards({
        documentTitle: document.title,
        pageText: currentPageObj.text,
        pageNumber: currentPage,
        settings: aiSettings,
      });
      setFlashcards(cards);
    } catch (e) {
      console.warn('Failed to load flashcards:', e);
    } finally {
      setIsLoadingFlashcards(false);
    }
  };

  // Generate Quiz with AI
  const fetchAIQuiz = async () => {
    setIsLoadingQuiz(true);
    setCurrentQuizIdx(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setScore(0);
    try {
      const questions = await ClientAI.generateQuiz({
        documentTitle: document.title,
        pageText: currentPageObj.text,
        pageNumber: currentPage,
        settings: aiSettings,
      });
      setQuizQuestions(questions);
    } catch (e) {
      console.warn('Failed to load quiz:', e);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  // Auto-fetch when tab is opened
  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'flashcards' && flashcards.length === 0) {
        fetchAIFlashcards();
      }
      if (activeTab === 'quizzes' && quizQuestions.length === 0) {
        fetchAIQuiz();
      }
    }
  }, [isOpen, activeTab, currentPage]);

  const bookmarks = session.memory.bookmarks || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-card text-card-foreground border border-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">
        {/* Header with Tabs */}
        <div className="px-4 py-3 border-b border-border bg-secondary/40 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onTabChange('notes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'notes'
                  ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Notes</span>
            </button>

            <button
              onClick={() => onTabChange('flashcards')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'flashcards'
                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Flashcards</span>
            </button>

            <button
              onClick={() => onTabChange('quizzes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'quizzes'
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <QuizIcon className="w-3.5 h-3.5" />
              <span>Quizzes</span>
            </button>

            <button
              onClick={() => onTabChange('bookmarks')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'bookmarks'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmarks</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 flex-1 overflow-y-auto">
          {/* 1. NOTES TAB */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">
                    Study Notes for Page {currentPage}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Record takeaways, formulas, and questions for this section.
                  </p>
                </div>

                <button
                  onClick={handleSaveNote}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                >
                  {noteSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{noteSaved ? 'Saved!' : 'Save Note'}</span>
                </button>
              </div>

              <textarea
                rows={8}
                value={currentNoteText}
                onChange={(e) => setCurrentNoteText(e.target.value)}
                placeholder="Type your notes here... (e.g. key formula, question for exam, summary)"
                className="w-full p-3.5 rounded-xl bg-secondary/40 border border-border text-xs text-foreground focus:outline-none focus:border-purple-500 transition-colors leading-relaxed"
              />

              {Object.keys(notes).length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    All Saved Notes in Document ({Object.keys(notes).length})
                  </div>
                  <div className="space-y-2">
                    {Object.entries(notes).map(([page, text]) => (
                      <div
                        key={page}
                        onClick={() => {
                          onJumpToPage(Number(page));
                          setCurrentNoteText(text);
                        }}
                        className="p-2.5 rounded-xl bg-card border border-border/80 hover:border-purple-500/50 cursor-pointer transition-all text-xs"
                      >
                        <div className="font-bold text-purple-600 dark:text-purple-400 mb-1">
                          Page {page}
                        </div>
                        <p className="text-muted-foreground line-clamp-2">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. FLASHCARDS TAB (AI-Powered) */}
          {activeTab === 'flashcards' && (
            <div className="space-y-4 flex flex-col items-center">
              <div className="w-full flex items-center justify-between border-b border-border/60 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Conceptual Flashcards (Page {currentPage})</span>
                </div>

                <button
                  onClick={fetchAIFlashcards}
                  disabled={isLoadingFlashcards}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 text-[11px] font-bold transition-all disabled:opacity-50"
                  title="Regenerate with AI"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingFlashcards ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
              </div>

              {isLoadingFlashcards ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-muted-foreground font-medium">
                    AI is analyzing Page {currentPage} and generating conceptual flashcards...
                  </p>
                </div>
              ) : flashcards.length > 0 ? (
                <>
                  <div className="text-xs text-muted-foreground font-semibold">
                    Card {flashcardIdx + 1} of {flashcards.length}
                  </div>

                  {/* True 3D Interactive Flip Card with Realistic Physics */}
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="w-full max-w-lg min-h-[230px] perspective-1000 cursor-pointer select-none group"
                  >
                    <div
                      className={`relative w-full h-full min-h-[230px] rounded-2xl transform-style-preserve-3d transition-transform duration-500 shadow-lg ${
                        isFlipped ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* Front Face (Concept / Question) */}
                      <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-card via-card to-blue-500/5 border-2 border-blue-500/40 group-hover:border-blue-500 p-6 flex flex-col justify-between items-center text-center shadow-xs">
                        <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Concept / Question</span>
                        </div>

                        <div className="flex-1 flex items-center justify-center py-4">
                          <p className="font-bold text-base sm:text-lg text-foreground leading-relaxed">
                            {flashcards[flashcardIdx]?.term}
                          </p>
                        </div>

                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                          <RotateCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                          <span>Click to reveal explanation</span>
                        </div>
                      </div>

                      {/* Back Face (Answer & Core Mechanism) */}
                      <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-gradient-to-br from-card via-card to-emerald-500/10 border-2 border-emerald-500/60 p-6 flex flex-col justify-between items-center text-center shadow-xs">
                        <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Core Answer & Mechanism</span>
                        </div>

                        <div className="flex-1 flex items-center justify-center py-4">
                          <p className="font-semibold text-xs sm:text-sm text-foreground leading-relaxed">
                            {flashcards[flashcardIdx]?.definition}
                          </p>
                        </div>

                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                          <RotateCw className="w-3 h-3" />
                          <span>Click to flip back</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setFlashcardIdx((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
                      }}
                      className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setFlashcardIdx((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <span>Next Card</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-xs text-muted-foreground py-8 text-center">
                  No flashcards found. Click "Regenerate" to create AI flashcards for this page.
                </div>
              )}
            </div>
          )}

          {/* 3. QUIZZES TAB (AI-Powered) */}
          {activeTab === 'quizzes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Comprehensive Quiz (Page {currentPage})</span>
                </div>

                <button
                  onClick={fetchAIQuiz}
                  disabled={isLoadingQuiz}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 text-[11px] font-bold transition-all disabled:opacity-50"
                  title="Generate new AI questions"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingQuiz ? 'animate-spin' : ''}`} />
                  <span>New Quiz</span>
                </button>
              </div>

              {isLoadingQuiz ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-muted-foreground font-medium">
                    AI is creating high-level conceptual questions for Page {currentPage}...
                  </p>
                </div>
              ) : quizQuestions.length > 0 ? (
                <>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">
                      Question {currentQuizIdx + 1} of {quizQuestions.length}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary font-mono text-[10px]">
                      {quizQuestions[currentQuizIdx]?.conceptName}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-foreground pt-1 leading-snug">
                    {quizQuestions[currentQuizIdx]?.question}
                  </h4>

                  <div className="space-y-2 pt-2">
                    {quizQuestions[currentQuizIdx]?.options.map((opt) => {
                      const isSelected = selectedAnswers[currentQuizIdx] === opt.id;
                      let style = 'bg-secondary/40 hover:bg-secondary border-border text-foreground';
                      if (quizSubmitted) {
                        if (opt.isCorrect) {
                          style = 'bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
                        } else if (isSelected) {
                          style = 'bg-rose-500/20 border-rose-500 text-rose-800 dark:text-rose-200';
                        } else {
                          style = 'opacity-40 border-transparent';
                        }
                      } else if (isSelected) {
                        style = 'bg-amber-500/20 border-amber-500 text-amber-800 dark:text-amber-200 font-bold';
                      }

                      return (
                        <div key={opt.id} className="space-y-1">
                          <button
                            disabled={quizSubmitted}
                            onClick={() =>
                              setSelectedAnswers((prev) => ({ ...prev, [currentQuizIdx]: opt.id }))
                            }
                            className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${style}`}
                          >
                            <span className="leading-relaxed">{opt.text}</span>
                            {quizSubmitted && opt.isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
                            )}
                          </button>

                          {quizSubmitted && isSelected && (
                            <div className="p-2 rounded-lg bg-secondary/80 border border-border text-[11px] text-foreground/90 italic leading-relaxed">
                              💡 <strong>Explanation:</strong> {opt.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <button
                      onClick={() => {
                        setQuizSubmitted(false);
                        setCurrentQuizIdx((prev) => Math.max(0, prev - 1));
                      }}
                      disabled={currentQuizIdx === 0}
                      className="px-3 py-1.5 rounded-xl bg-secondary disabled:opacity-30 text-xs font-semibold"
                    >
                      Back
                    </button>

                    {!quizSubmitted ? (
                      <button
                        onClick={() => {
                          setQuizSubmitted(true);
                          const chosen = selectedAnswers[currentQuizIdx];
                          const opt = quizQuestions[currentQuizIdx]?.options.find((o) => o.id === chosen);
                          if (opt?.isCorrect) {
                            setScore((s) => s + 1);
                          }
                        }}
                        disabled={!selectedAnswers[currentQuizIdx]}
                        className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-30 text-xs font-bold transition-all shadow-xs"
                      >
                        Submit Answer
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setQuizSubmitted(false);
                          if (currentQuizIdx < quizQuestions.length - 1) {
                            setCurrentQuizIdx((prev) => prev + 1);
                          }
                        }}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        {currentQuizIdx < quizQuestions.length - 1 ? 'Next Question' : `Completed! (${score}/${quizQuestions.length})`}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-xs text-muted-foreground py-8 text-center">
                  Click "New Quiz" to generate AI quiz questions for this page.
                </div>
              )}
            </div>
          )}

          {/* 4. BOOKMARKS TAB */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-foreground">
                  Saved Bookmarks ({bookmarks.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Quickly jump back to any bookmarked page in this study session.
                </p>
              </div>

              {bookmarks.length > 0 ? (
                <div className="space-y-2.5">
                  {bookmarks.map((pageNum) => {
                    const pageObj = document.pages.find((p) => p.pageNumber === pageNum);
                    return (
                      <div
                        key={pageNum}
                        className="p-3 rounded-xl bg-card border border-border hover:border-emerald-500/50 flex items-center justify-between transition-all"
                      >
                        <div
                          onClick={() => {
                            onJumpToPage(pageNum);
                            onClose();
                          }}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                            Page {pageNum}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {pageObj?.headings[0] || pageObj?.text.slice(0, 80)}
                          </div>
                        </div>

                        <button
                          onClick={() => onToggleBookmark(pageNum)}
                          className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors ml-2"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground py-8 text-center">
                  No bookmarks saved yet. Click the bookmark icon on any page to save it here.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
