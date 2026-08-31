'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  DocumentData,
  StudySession,
  UserPreferences,
  AISettings,
  ChatMessage,
  QuickActionType,
  ImLostDiagnosis,
  ThemePreset,
  UserProfile,
  HighlightColor,
  TextHighlight,
} from '@/types';
import { Sidebar } from './Sidebar';
import { DocumentReader } from './DocumentReader';
import { AINavigator } from './AINavigator';
import { ImLostModal } from './ImLostModal';
import { ConceptGraphModal } from './ConceptGraphModal';
import { MasteryDashboardModal } from './MasteryDashboardModal';
import { ClientAI } from '@/lib/ai/client-ai';
import {
  BookOpen,
  Bot,
  Layers,
  Menu,
  Palette,
  Settings,
  ChevronRight,
  Sparkles,
  PanelLeftOpen,
  PanelRightOpen,
} from 'lucide-react';

import { StudyToolsModal, StudyToolTab } from './StudyToolsModal';

interface WorkspaceProps {
  document: DocumentData;
  session: StudySession;
  preferences: UserPreferences;
  aiSettings: AISettings;
  activeTheme?: ThemePreset;
  onSelectTheme?: (theme: ThemePreset) => void;
  userProfile?: UserProfile;
  onUpdateSession: (updatedSession: StudySession) => void;
  onNavigateToLibrary: () => void;
  onOpenSettings: () => void;
  onSavePreferences?: (newPrefs: UserPreferences) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  document,
  session,
  preferences,
  aiSettings,
  activeTheme,
  onSelectTheme,
  userProfile,
  onUpdateSession,
  onNavigateToLibrary,
  onOpenSettings,
  onSavePreferences,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(session.memory.currentPage || 1);
  const [messages, setMessages] = useState<ChatMessage[]>(session.messages || []);
  const [localHighlights, setLocalHighlights] = useState<TextHighlight[]>(session.memory.highlights || []);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [imLostDiagnosis, setImLostDiagnosis] = useState<ImLostDiagnosis | null>(null);
  const [isImLostModalOpen, setIsImLostModalOpen] = useState<boolean>(false);
  const [isConceptGraphOpen, setIsConceptGraphOpen] = useState<boolean>(false);
  const [isMasteryOpen, setIsMasteryOpen] = useState<boolean>(false);
  const [isStudyToolOpen, setIsStudyToolOpen] = useState<boolean>(false);
  const [activeStudyToolTab, setActiveStudyToolTab] = useState<StudyToolTab>('notes');

  const sessionRef = useRef<StudySession>(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Sync highlights when session prop changes
  useEffect(() => {
    if (session.memory.highlights) {
      setLocalHighlights(session.memory.highlights);
    }
  }, [session.memory.highlights]);

  // Right Assistant Pane (Draggable & Collapsible, balanced default)
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(true);
  const [assistantWidth, setAssistantWidth] = useState<number>(430);
  const [isDraggingAssistant, setIsDraggingAssistant] = useState<boolean>(false);

  // Resize drag event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingAssistant) {
        const newWidth = Math.max(300, Math.min(750, window.innerWidth - e.clientX));
        setAssistantWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingAssistant(false);
    };

    if (typeof window !== 'undefined') {
      if (isDraggingAssistant) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.document.body.style.cursor = 'col-resize';
        window.document.body.style.userSelect = 'none';
      } else {
        window.document.body.style.cursor = '';
        window.document.body.style.userSelect = '';
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [isDraggingAssistant]);

  // Study Timer (persists study duration without resetting state)
  useEffect(() => {
    const timer = setInterval(() => {
      const current = sessionRef.current;
      const updated = {
        ...current,
        totalStudySeconds: (current.totalStudySeconds || 0) + 10,
        lastActiveAt: new Date().toISOString(),
      };
      sessionRef.current = updated;
      onUpdateSession(updated);
    }, 10000);

    return () => clearInterval(timer);
  }, [onUpdateSession]);

  // Mobile Drag Down to Close Bottom Sheet
  const [mobileDragStartY, setMobileDragStartY] = useState<number | null>(null);
  const [mobileDragCurrentY, setMobileDragCurrentY] = useState<number>(0);
  const [isMobileDragging, setIsMobileDragging] = useState<boolean>(false);

  const handleMobileTouchStart = (e: React.TouchEvent) => {
    setMobileDragStartY(e.touches[0].clientY);
    setMobileDragCurrentY(0);
    setIsMobileDragging(true);
  };

  const handleMobileTouchMove = (e: React.TouchEvent) => {
    if (mobileDragStartY === null) return;
    const deltaY = e.touches[0].clientY - mobileDragStartY;
    if (deltaY > 0) {
      setMobileDragCurrentY(deltaY);
    }
  };

  const handleMobileTouchEnd = () => {
    if (mobileDragCurrentY > 80) {
      setIsAssistantOpen(false);
    }
    setMobileDragCurrentY(0);
    setMobileDragStartY(null);
    setIsMobileDragging(false);
  };

  // Global Keyboard Shortcut: Ctrl+J / Cmd+J toggles AI Study Assistant
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'j' || e.key === 'J')) {
        e.preventDefault();
        setIsAssistantOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [isIndexingTitles, setIsIndexingTitles] = useState<boolean>(false);

  const handleRegeneratePageTitles = async () => {
    if (!document.pages || document.pages.length === 0 || isIndexingTitles) return;
    setIsIndexingTitles(true);
    try {
      const titles = await ClientAI.generatePageTitles({
        documentTitle: document.title,
        pages: document.pages.map((p) => ({ pageNumber: p.pageNumber, text: p.text })),
        settings: aiSettings,
      });

      if (titles && titles.length > 0) {
        const updatedPages = document.pages.map((p) => {
          const match = titles.find((t) => t.pageNumber === p.pageNumber);
          if (match && match.title) {
            return {
              ...p,
              headings: [match.title, ...(p.headings || []).filter((h) => h !== match.title)],
            };
          }
          return p;
        });

        const updatedSections = updatedPages.map((p) => {
          const match = titles.find((t) => t.pageNumber === p.pageNumber);
          return {
            id: `sec-${p.pageNumber}`,
            title: match?.title || p.headings[0] || `Page ${p.pageNumber}`,
            pageStart: p.pageNumber,
            pageEnd: p.pageNumber,
            level: 1,
            conceptIds: p.conceptIds,
          };
        });

        const updatedDoc = {
          ...document,
          pages: updatedPages,
          sections: updatedSections,
        };

        onUpdateSession({
          ...session,
          documentId: updatedDoc.id,
        });
      }
    } catch (err) {
      console.warn('AI page titles generation error:', err);
    } finally {
      setIsIndexingTitles(false);
    }
  };

  // AI Page Titles & Topics Enrichment on Start
  useEffect(() => {
    const hasRawOrGenericTitles = document.pages.some((p) => {
      const h = p.headings?.[0] || '';
      return (
        !h ||
        /^\d+[\.\)\-:]/.test(h) ||
        h.startsWith('Section') ||
        h.startsWith('Topic') ||
        h.startsWith('Page') ||
        h.length > 40
      );
    });

    if (hasRawOrGenericTitles && document.pages.length > 0) {
      handleRegeneratePageTitles();
    }
  }, [document.id]);

  // Handle Page Change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const current = sessionRef.current;
    const visited = Array.from(new Set([...(current.memory?.visitedPages || []), newPage]));
    const updated: StudySession = {
      ...current,
      memory: {
        ...current.memory,
        currentPage: newPage,
        visitedPages: visited,
        lastActiveTimestamp: new Date().toISOString(),
      },
    };
    sessionRef.current = updated;
    onUpdateSession(updated);
  };

  // Toggle Bookmark
  const handleToggleBookmark = (page: number) => {
    const currentBookmarks = session.memory.bookmarks || [];
    const updatedBookmarks = currentBookmarks.includes(page)
      ? currentBookmarks.filter((p) => p !== page)
      : [...currentBookmarks, page];

    const updated: StudySession = {
      ...session,
      memory: {
        ...session.memory,
        bookmarks: updatedBookmarks,
      },
    };
    onUpdateSession(updated);
  };

  // Master Concept
  const handleMasterConcept = (conceptId?: string) => {
    if (!conceptId) return;
    const currentMastered = session.memory.masteredConceptIds || [];
    const currentStruggling = session.memory.strugglingConceptIds || [];

    const updatedMastered = Array.from(new Set([...currentMastered, conceptId]));
    const updatedStruggling = currentStruggling.filter((id) => id !== conceptId);

    const updated: StudySession = {
      ...session,
      memory: {
        ...session.memory,
        masteredConceptIds: updatedMastered,
        strugglingConceptIds: updatedStruggling,
      },
    };
    onUpdateSession(updated);
  };

  // Confirm Page Mastery from Next-Page Check
  const handleConfirmPageMastery = (pageNumber: number) => {
    const pageObj = document.pages.find((p) => p.pageNumber === pageNumber);
    if (!pageObj) return;

    const pageConceptIds = pageObj.conceptIds || [];
    if (pageConceptIds.length > 0) {
      const updatedMastered = Array.from(
        new Set([...session.memory.masteredConceptIds, ...pageConceptIds])
      );
      const updatedSession: StudySession = {
        ...session,
        memory: {
          ...session.memory,
          masteredConceptIds: updatedMastered,
        },
      };
      onUpdateSession(updatedSession);
    }
  };

  // Chat message submission with full document context & attached files
  const handleSendMessage = async (
    queryText: string,
    selectedText?: string,
    attachedFiles?: { name: string; size: number; text: string }[]
  ) => {
    // If files are attached, combine with prompt so LLM receives the full file contents
    let fullQueryPayload = queryText;
    if (attachedFiles && attachedFiles.length > 0) {
      const fileContents = attachedFiles
        .map((f) => `\n\n[ATTACHED FILE: "${f.name}"]\n"""\n${f.text}\n"""`)
        .join('\n');
      fullQueryPayload = `${queryText}${fileContents}`;
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: queryText,
      timestamp: new Date().toISOString(),
      pageContext: currentPage,
      selectedText,
      attachedFiles: attachedFiles ? attachedFiles.map((f) => ({ name: f.name, size: f.size })) : undefined,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoadingAI(true);

    try {
      const pageObj = document.pages.find((p) => p.pageNumber === currentPage) || document.pages[0];

      const result = await ClientAI.chat({
        messages: [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: fullQueryPayload },
        ],
        currentPage: pageObj,
        surroundingPages: document.pages,
        allConcepts: document.conceptGraph.concepts,
        preferences,
        memory: session.memory,
        selectedText,
        query: fullQueryPayload,
        settings: aiSettings,
        documentTitle: document.title,
      });

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: result.text,
        timestamp: new Date().toISOString(),
        pageContext: currentPage,
      };

      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);

      const updatedSession: StudySession = {
        ...session,
        messages: finalMessages,
        memory: {
          ...session.memory,
          questionCount: (session.memory.questionCount || 0) + 1,
        },
      };
      onUpdateSession(updatedSession);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Note: ${err.message || 'Service unreachable'}. Please try again shortly.`,
        timestamp: new Date().toISOString(),
        pageContext: currentPage,
        status: 'error',
      };
      setMessages([...newMessages, errorMsg]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Signature "I'm Lost" Trigger — Injects diagnosis directly into chat without blocking modal
  const handleTriggerImLost = async (selectedText?: string) => {
    setIsAssistantOpen(true);
    setIsLoadingAI(true);

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: selectedText
        ? `I'm lost on Page ${currentPage} regarding: "${selectedText}". What prerequisite foundation am I missing?`
        : `I'm lost on Page ${currentPage}. Can you diagnose what foundational concept is missing and how this connects?`,
      timestamp: new Date().toISOString(),
      pageContext: currentPage,
      selectedText,
    };

    const withUser = [...messages, userMsg];
    setMessages(withUser);

    try {
      const pageObj = document.pages.find((p) => p.pageNumber === currentPage) || document.pages[0];

      const diag = await ClientAI.imLost({
        currentPage: pageObj,
        surroundingPages: document.pages,
        allConcepts: document.conceptGraph.concepts,
        preferences,
        memory: session.memory,
        selectedText,
        settings: aiSettings,
      });

      const responseContent = `### 🧭 Smart Recovery: ${diag.missingPrerequisiteName || 'Prerequisite Foundation'} (Page ${diag.missingPrerequisitePage || 1})

**Identified Barrier**: ${diag.detectedStruggle}

#### 💡 Bridge Explanation
${diag.bridgeExplanation}

${diag.analogyExplanation ? `**Analogy:**\n${diag.analogyExplanation}\n` : ''}
${diag.visualDiagram ? `\`\`\`\n${diag.visualDiagram}\n\`\`\`\n` : ''}
${diag.quickTakeaway ? `**Takeaway:**\n${diag.quickTakeaway}` : ''}`;

      const aiMsg: ChatMessage = {
        id: `msg-lost-${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString(),
        pageContext: currentPage,
        isImLostResponse: true,
        recoveryData: diag,
        understandingCheck: diag.understandingCheck,
      };

      const finalMessages = [...withUser, aiMsg];
      setMessages(finalMessages);

      const updatedSession: StudySession = {
        ...session,
        messages: finalMessages,
        memory: {
          ...session.memory,
          imLostTriggerCount: (session.memory.imLostTriggerCount || 0) + 1,
        },
      };
      onUpdateSession(updatedSession);
    } catch (err: any) {
      handleSendMessage("I'm lost on this section. Please help break down the missing prerequisite concepts.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Adaptive Quick Actions
  const handleExecuteQuickAction = async (actionType: QuickActionType) => {
    if (actionType === 'quiz_me') {
      setActiveStudyToolTab('quizzes');
      setIsStudyToolOpen(true);
      return;
    }

    const actionLabels: Record<QuickActionType, string> = {
      explain_simpler: `Explain Page ${currentPage} in simpler terms`,
      summarize_section: `Summarize the key points of Page ${currentPage}`,
      quiz_me: `Quiz me on Page ${currentPage}`,
      real_world_example: `Give me a real-world example for Page ${currentPage}`,
      give_analogy: `Give me an intuitive analogy for Page ${currentPage}`,
      step_by_step: `Walk me through Page ${currentPage} step by step`,
      visual_explanation: `Give me a visual explanation of Page ${currentPage}`,
    };

    const userText = actionLabels[actionType] || `${actionType} for Page ${currentPage}`;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
      pageContext: currentPage,
    };

    const withUser = [...messages, userMsg];
    setMessages(withUser);
    setIsLoadingAI(true);

    const pageObj = document.pages.find((p) => p.pageNumber === currentPage) || document.pages[0];

    try {
      const res = await ClientAI.quickAction({
        actionType,
        currentPage: pageObj,
        surroundingPages: document.pages,
        allConcepts: document.conceptGraph.concepts,
        preferences,
        memory: session.memory,
        settings: aiSettings,
      });

      const aiMsg: ChatMessage = {
        id: `msg-quick-${Date.now()}`,
        role: 'assistant',
        content: res.text,
        timestamp: new Date().toISOString(),
        pageContext: currentPage,
      };

      const finalMessages = [...withUser, aiMsg];
      setMessages(finalMessages);

      const updatedSession: StudySession = {
        ...session,
        messages: finalMessages,
      };
      onUpdateSession(updatedSession);
    } catch (err: any) {
      console.warn('Quick action error', err);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Multiple-choice understanding check response
  const handleAnswerUnderstandingCheck = (checkId: string, optionId: string) => {
    let wasCorrect = false;
    let explanation = '';
    let questionText = '';

    const updatedMessages = messages.map((m) => {
      if (m.understandingCheck && m.understandingCheck.id === checkId) {
        const selectedOpt = m.understandingCheck.options.find((opt) => opt.id === optionId);
        wasCorrect = selectedOpt ? selectedOpt.isCorrect : false;
        explanation = selectedOpt?.explanation || '';
        questionText = m.understandingCheck.question;

        return {
          ...m,
          understandingCheck: {
            ...m.understandingCheck,
            answeredOptionId: optionId,
            isAnsweredCorrectly: wasCorrect,
          },
        };
      }
      return m;
    });

    setMessages(updatedMessages);

    // Save score in memory
    const updatedChecks = [
      ...(session.memory.understandingChecks || []),
      {
        checkId,
        question: questionText,
        answeredCorrectly: wasCorrect,
        pageNumber: currentPage,
        timestamp: new Date().toISOString(),
      },
    ];

    const currentScore = session.memory.masteryScore || 50;
    const newScore = wasCorrect ? Math.min(100, currentScore + 8) : Math.max(0, currentScore - 4);

    const updatedSession: StudySession = {
      ...session,
      messages: updatedMessages,
      memory: {
        ...session.memory,
        understandingChecks: updatedChecks,
        masteryScore: newScore,
      },
    };
    onUpdateSession(updatedSession);

    // Provide friendly tutor feedback message
    setTimeout(() => {
      const feedbackContent = wasCorrect
        ? `✅ **Spot on!** That is correct.\n\n${explanation || 'You have clearly grasped this foundational principle.'}`
        : `💡 **Close, but not quite.**\n\n${explanation || 'Review the explanation above to reinforce the core mechanics before moving forward.'}`;

      const feedbackMsg: ChatMessage = {
        id: `msg-feedback-${Date.now()}`,
        role: 'assistant',
        content: feedbackContent,
        timestamp: new Date().toISOString(),
        pageContext: currentPage,
      };

      const finalMessages = [...updatedMessages, feedbackMsg];
      setMessages(finalMessages);
      onUpdateSession({ ...updatedSession, messages: finalMessages });
    }, 400);
  };

  const handleClearChat = () => {
    setMessages([]);
    const updatedSession: StudySession = {
      ...session,
      messages: [],
    };
    onUpdateSession(updatedSession);
  };

  const handleAddHighlight = (pageNumber: number, text: string, color: HighlightColor) => {
    const newHighlight: TextHighlight = {
      id: `hl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      pageNumber,
      text,
      color,
      createdAt: new Date().toISOString(),
    };
    const updatedHighlights = [...localHighlights, newHighlight];
    setLocalHighlights(updatedHighlights);
    const updatedSession: StudySession = {
      ...session,
      memory: {
        ...session.memory,
        highlights: updatedHighlights,
      },
    };
    onUpdateSession(updatedSession);
  };

  const handleRemoveHighlight = (highlightId: string) => {
    const updatedHighlights = localHighlights.filter((h) => h.id !== highlightId);
    setLocalHighlights(updatedHighlights);
    const updatedSession: StudySession = {
      ...session,
      memory: {
        ...session.memory,
        highlights: updatedHighlights,
      },
    };
    onUpdateSession(updatedSession);
  };

  const handleChangeHighlightColor = (highlightId: string, color: HighlightColor) => {
    const updatedHighlights = localHighlights.map((h) => (h.id === highlightId ? { ...h, color } : h));
    setLocalHighlights(updatedHighlights);
    const updatedSession: StudySession = {
      ...session,
      memory: {
        ...session.memory,
        highlights: updatedHighlights,
      },
    };
    onUpdateSession(updatedSession);
  };

  const activePageObj =
    document.pages.find((p) => p.pageNumber === currentPage) || document.pages[0];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground relative font-sans">
      {/* 1. Main Center Pane: Document Reader (With Slim Page Navigator) */}
      <div className="flex-1 h-full overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-hidden">
          <DocumentReader
            document={document}
            currentPageNumber={currentPage}
            onPageChange={handlePageChange}
            bookmarks={session.memory.bookmarks || []}
            onToggleBookmark={handleToggleBookmark}
            onAskAIWithSelection={(txt) => {
              setIsAssistantOpen(true);
              handleSendMessage(`Please explain this highlighted excerpt in detail: "${txt}"`, txt);
            }}
            onTriggerImLostWithSelection={(txt) => {
              handleTriggerImLost(txt);
            }}
            onConfirmPageMastery={handleConfirmPageMastery}
            autoPromptUnderstandingCheck={preferences.autoPromptUnderstandingCheck}
            onSelectConcept={() => setIsConceptGraphOpen(true)}
            onNavigateToLibrary={onNavigateToLibrary}
            onOpenStudyTool={(tab) => {
              setActiveStudyToolTab(tab);
              setIsStudyToolOpen(true);
            }}
            onOpenAssistant={() => setIsAssistantOpen(true)}
            isAssistantOpen={isAssistantOpen}
            onOpenSettings={onOpenSettings}
            highlights={localHighlights}
            onAddHighlight={handleAddHighlight}
            onRemoveHighlight={handleRemoveHighlight}
            onChangeHighlightColor={handleChangeHighlightColor}
            preferences={preferences}
            messages={messages}
            onSendMessage={(q) => handleSendMessage(q)}
          />
        </div>
      </div>

      {/* Right Resize Splitter Handle (Desktop / Tablet) */}
      {isAssistantOpen && (
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDraggingAssistant(true);
          }}
          className="hidden md:block w-px hover:w-1.5 bg-border/50 hover:bg-primary/30 active:bg-primary cursor-col-resize shrink-0 transition-all z-20 select-none"
          title="Drag to resize Study Copilot"
        />
      )}

      {/* 2. Desktop / Tablet Right Pane: AI Study Copilot (Resizable & Closable) */}
      {isAssistantOpen && (
        <div
          style={{ width: `${assistantWidth}px` }}
          className="hidden md:flex h-full shrink-0 bg-card/60 backdrop-blur-md flex-col relative overflow-hidden border-l border-border/60"
        >
          <AINavigator
            currentPage={activePageObj}
            allConcepts={document.conceptGraph.concepts}
            messages={messages}
            memory={session.memory}
            isLoading={isLoadingAI}
            preferences={preferences}
            documentTitle={document.title}
            onSendMessage={(query) => handleSendMessage(query)}
            onTriggerImLost={() => handleTriggerImLost()}
            onExecuteQuickAction={handleExecuteQuickAction}
            onAnswerUnderstandingCheck={handleAnswerUnderstandingCheck}
            onJumpToPage={handlePageChange}
            onOpenConceptGraph={() => setIsConceptGraphOpen(true)}
            onClearChat={handleClearChat}
            onCloseAssistant={() => setIsAssistantOpen(false)}
            onOpenSettings={onOpenSettings}
          />
        </div>
      )}

      {/* 4. Mobile AI Assistant Bottom Sheet Drawer with Drag Down to Close */}
      {isAssistantOpen && (
        <div
          onClick={() => setIsAssistantOpen(false)}
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: mobileDragCurrentY > 0 ? `translateY(${mobileDragCurrentY}px)` : undefined,
              transition: isMobileDragging ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="w-full h-[85vh] max-h-[85vh] bg-card rounded-t-3xl border-t border-border flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Drag Handle Bar with Touch Listeners */}
            <div
              onTouchStart={handleMobileTouchStart}
              onTouchMove={handleMobileTouchMove}
              onTouchEnd={handleMobileTouchEnd}
              className="w-full flex flex-col items-center pt-3 pb-2 bg-card/95 cursor-grab active:cursor-grabbing shrink-0 select-none border-b border-border/30 touch-none"
            >
              <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors" />
            </div>

            <div className="flex-1 overflow-hidden">
              <AINavigator
                currentPage={activePageObj}
                allConcepts={document.conceptGraph.concepts}
                messages={messages}
                memory={session.memory}
                isLoading={isLoadingAI}
                preferences={preferences}
                documentTitle={document.title}
                onSendMessage={(query) => handleSendMessage(query)}
                onTriggerImLost={() => handleTriggerImLost()}
                onExecuteQuickAction={handleExecuteQuickAction}
                onAnswerUnderstandingCheck={handleAnswerUnderstandingCheck}
                onJumpToPage={handlePageChange}
                onOpenConceptGraph={() => setIsConceptGraphOpen(true)}
                onClearChat={handleClearChat}
                onCloseAssistant={() => setIsAssistantOpen(false)}
                onOpenSettings={onOpenSettings}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modals & Dialogs */}
      <StudyToolsModal
        isOpen={isStudyToolOpen}
        onClose={() => setIsStudyToolOpen(false)}
        activeTab={activeStudyToolTab}
        onTabChange={setActiveStudyToolTab}
        document={document}
        session={session}
        currentPage={currentPage}
        aiSettings={aiSettings}
        onJumpToPage={handlePageChange}
        onToggleBookmark={handleToggleBookmark}
      />

      <ImLostModal
        diagnosis={imLostDiagnosis}
        isOpen={isImLostModalOpen}
        onClose={() => setIsImLostModalOpen(false)}
        onResumeReading={handlePageChange}
        onMasterConcept={handleMasterConcept}
      />

      <ConceptGraphModal
        conceptGraph={document.conceptGraph}
        currentPage={currentPage}
        memory={session.memory}
        isOpen={isConceptGraphOpen}
        onClose={() => setIsConceptGraphOpen(false)}
        onJumpToPage={handlePageChange}
      />

      <MasteryDashboardModal
        session={session}
        document={document}
        isOpen={isMasteryOpen}
        onClose={() => setIsMasteryOpen(false)}
        onJumpToPage={handlePageChange}
      />
    </div>
  );
};
