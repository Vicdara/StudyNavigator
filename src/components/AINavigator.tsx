'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ChatMessage,
  DocumentPage,
  ConceptNode,
  DocumentMemory,
  QuickActionType,
  UserPreferences,
} from '@/types';
import {
  Send,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Copy,
  Check,
  Bot,
  User,
  RotateCw,
  ArrowDown,
  ThumbsUp,
  PanelRightClose,
  FileText,
  Compass,
  X,
  Settings,
  ArrowRight,
} from 'lucide-react';
import { RichMessageRenderer } from './RichMessageRenderer';
import { CopilotLogo } from './CopilotLogo';

interface AINavigatorProps {
  currentPage: DocumentPage;
  allConcepts: ConceptNode[];
  messages: ChatMessage[];
  memory: DocumentMemory;
  isLoading: boolean;
  preferences?: UserPreferences;
  documentTitle?: string;
  onSendMessage: (text: string, selectedText?: string) => void;
  onTriggerImLost: () => void;
  onExecuteQuickAction: (type: QuickActionType) => void;
  onAnswerUnderstandingCheck: (checkId: string, optionId: string) => void;
  onJumpToPage: (pageNumber: number) => void;
  onOpenConceptGraph: () => void;
  onClearChat?: () => void;
  onCloseAssistant?: () => void;
  onOpenSettings?: () => void;
}

export const AINavigator: React.FC<AINavigatorProps> = ({
  currentPage,
  allConcepts,
  messages,
  memory,
  isLoading,
  preferences,
  documentTitle,
  onSendMessage,
  onTriggerImLost,
  onExecuteQuickAction,
  onAnswerUnderstandingCheck,
  onClearChat,
  onCloseAssistant,
  onOpenSettings,
}) => {
  const [inputQuery, setInputQuery] = useState<string>('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [likedMsgIds, setLikedMsgIds] = useState<Record<string, boolean>>({});
  const [showScrollBottom, setShowScrollBottom] = useState<boolean>(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const username = preferences?.username || 'Alex';
  const userInitials = username.slice(0, 2).toUpperCase();

  // Auto-scroll on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 100);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;

    onSendMessage(inputQuery.trim());
    setInputQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const toggleLike = (id: string) => {
    setLikedMsgIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col h-full bg-card/40 dark:bg-[#101113]/70 border-l border-border/40 select-none relative font-sans w-full overflow-hidden text-sm">
      {/* 1. Sleek Copilot Header matching Reader header height */}
      <div className="h-12 border-b border-border/50 px-3 sm:px-4 bg-card/60 backdrop-blur-xs flex items-center justify-between gap-2 shrink-0 z-10">
        <div className="flex items-center gap-2 min-w-0 truncate">
          <CopilotLogo size={22} className="shrink-0" />
          <div className="flex items-center gap-1.5 font-bold text-foreground text-xs sm:text-sm truncate">
            <span className="truncate">Study Copilot</span>
          </div>

          <div className="flex items-center px-1.5 py-0.5 rounded-md bg-secondary border border-border/40 text-[10px] font-mono font-bold text-muted-foreground shrink-0">
            P.{currentPage.pageNumber}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {messages.length > 0 && onClearChat && (
            <button
              onClick={onClearChat}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors cursor-pointer"
              title="Clear Conversation"
            >
              <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="hidden md:flex p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors cursor-pointer"
              title="Settings & Preferences"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}

          {onCloseAssistant && (
            <button
              onClick={onCloseAssistant}
              className="hidden md:flex p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors cursor-pointer"
              title="Collapse Copilot (Ctrl+J)"
            >
              <PanelRightClose className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Message Thread */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-4 select-text scroll-smooth overflow-x-hidden custom-scrollbar"
      >
        {/* Empty State */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col justify-center items-center text-center p-3 sm:p-4 space-y-4 select-none my-auto max-w-full overflow-hidden">
            <div className="relative flex items-center justify-center">
              <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <CopilotLogo size={44} className="relative z-10" />
            </div>

            <div className="space-y-1 max-w-xs px-2">
              <h4 className="font-extrabold text-sm sm:text-base text-foreground tracking-tight">
                Studying Page {currentPage.pageNumber}
              </h4>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                Your AI cognitive tutor. Ask questions, explore analogies, test your comprehension, or unblock tricky concepts.
              </p>
            </div>

            <div className="w-full max-w-sm space-y-2 pt-1 px-1">
              <button
                onClick={() => onSendMessage(`What are the key concepts and core takeaways from Page ${currentPage.pageNumber}?`)}
                className="w-full text-left p-2.5 sm:p-3 rounded-2xl bg-card/75 hover:bg-primary/10 border border-border/60 hover:border-primary/50 text-xs text-foreground font-semibold transition-all flex items-center justify-between group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate min-w-0">
                  <span className="p-1 rounded-lg bg-primary/15 text-primary shrink-0">🧠</span>
                  <span className="truncate text-xs">Key concepts on this page</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1 shrink-0 ml-1" />
              </button>

              <button
                onClick={() => onSendMessage(`Can you explain the main idea of Page ${currentPage.pageNumber} with an intuitive everyday analogy?`)}
                className="w-full text-left p-2.5 sm:p-3 rounded-2xl bg-card/75 hover:bg-teal-500/10 border border-border/60 hover:border-teal-500/50 text-xs text-foreground font-semibold transition-all flex items-center justify-between group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate min-w-0">
                  <span className="p-1 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 shrink-0">💡</span>
                  <span className="truncate text-xs">Give me an intuitive analogy</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-teal-600 transition-transform group-hover:translate-x-1 shrink-0 ml-1" />
              </button>

              <button
                onClick={() => onSendMessage(`Please test my understanding of Page ${currentPage.pageNumber} with a quick interactive check question.`)}
                className="w-full text-left p-2.5 sm:p-3 rounded-2xl bg-card/75 hover:bg-cyan-500/10 border border-border/60 hover:border-cyan-500/50 text-xs text-foreground font-semibold transition-all flex items-center justify-between group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate min-w-0">
                  <span className="p-1 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 shrink-0">🎯</span>
                  <span className="truncate text-xs">Test my comprehension</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-cyan-600 transition-transform group-hover:translate-x-1 shrink-0 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 sm:gap-2.5 animate-slide-up w-full overflow-hidden ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar Icon Beside Message */}
              {isUser ? (
                <div
                  className="w-7 h-7 rounded-full bg-secondary border border-border/80 text-foreground flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs mt-0.5"
                  title={username}
                >
                  {userInitials}
                </div>
              ) : (
                <CopilotLogo size={24} className="mt-0.5 shrink-0" />
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[86%] sm:max-w-[82%] text-xs sm:text-[13px] leading-relaxed break-words overflow-hidden ${
                  isUser
                    ? 'bg-primary/15 dark:bg-primary/20 text-foreground border border-primary/30 px-3.5 sm:px-4 py-2.5 rounded-2xl rounded-tr-xs font-medium shadow-2xs space-y-1'
                    : 'bg-card text-foreground border border-border/70 rounded-2xl rounded-tl-xs p-3 sm:p-4 shadow-2xs space-y-2'
                }`}
              >
                {/* AI Header with Page Context */}
                {!isUser && (
                  <div className="flex items-center justify-between pb-1.5 border-b border-border/30 text-[11px] text-muted-foreground select-none">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <span>Copilot</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {msg.pageContext && (
                        <span className="px-1.5 py-0.2 rounded bg-secondary/70 text-[10px] font-mono text-muted-foreground">
                          P.{msg.pageContext}
                        </span>
                      )}
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="p-1 hover:text-foreground transition-colors cursor-pointer"
                        title="Copy text"
                      >
                        {copiedMsgId === msg.id ? (
                          <Check className="w-3 h-3 text-primary" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Selected Text Citation Badge */}
                {msg.selectedText && (
                  <div className="p-2 rounded-xl bg-primary/10 border-l-2 border-primary text-[11px] italic text-muted-foreground select-text line-clamp-3">
                    &ldquo;{msg.selectedText}&rdquo;
                  </div>
                )}

                {/* Main Message Content */}
                <div className="prose-clean max-w-full overflow-hidden select-text text-xs sm:text-[13px]">
                  <RichMessageRenderer content={msg.content} />
                </div>

                {/* Feedback Buttons */}
                {!isUser && (
                  <div className="flex items-center justify-between pt-1 border-t border-border/25 text-[10px] text-muted-foreground select-none">
                    <span className="font-mono text-[9px] opacity-60">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <button
                      onClick={() => toggleLike(msg.id)}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        likedMsgIds[msg.id]
                          ? 'text-primary bg-primary/15'
                          : 'hover:text-foreground hover:bg-secondary'
                      }`}
                      title="Helpful response"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2.5 animate-pulse select-none">
            <CopilotLogo size={24} className="mt-0.5 shrink-0" />
            <div className="p-3 rounded-2xl bg-card border border-border/60 text-xs text-muted-foreground flex items-center gap-2 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] font-medium text-foreground">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Floating Scroll to Bottom */}
      {showScrollBottom && (
        <button
          onClick={() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-20 right-4 p-1.5 rounded-full bg-background border border-border/60 shadow-md text-foreground hover:bg-secondary transition-all z-20 cursor-pointer"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-3.5 h-3.5 text-primary" />
        </button>
      )}

      {/* 3. Docked Input Container with 4-Column Grid Chips (Guaranteed No Scrollbar on Mobile) */}
      <div className="p-2 sm:p-2.5 border-t border-border/60 bg-card shrink-0 space-y-1.5 w-full max-w-full overflow-hidden">
        {/* Quick Action Chips - Fits Screen Perfectly with No Horizontal Scrolling */}
        <div className="grid grid-cols-4 gap-1 sm:gap-1.5 w-full select-none max-w-full overflow-hidden">
          <button
            onClick={() => onExecuteQuickAction('explain_simpler')}
            className="w-full py-1.5 px-0.5 sm:px-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-[10px] sm:text-xs font-bold border border-primary/30 flex items-center justify-center gap-1 transition-all shadow-2xs cursor-pointer active:scale-95 min-w-0"
            title="Explain in simpler terms"
          >
            <Sparkles className="w-3 h-3 text-primary shrink-0" />
            <span className="truncate">Explain</span>
          </button>

          <button
            onClick={() => onExecuteQuickAction('summarize_section')}
            className="w-full py-1.5 px-0.5 sm:px-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-[10px] sm:text-xs font-bold border border-blue-500/30 flex items-center justify-center gap-1 transition-all shadow-2xs cursor-pointer active:scale-95 min-w-0"
            title="Summarize key points"
          >
            <FileText className="w-3 h-3 text-blue-500 dark:text-blue-400 shrink-0" />
            <span className="truncate">Summary</span>
          </button>

          <button
            onClick={() => onExecuteQuickAction('quiz_me')}
            className="w-full py-1.5 px-0.5 sm:px-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] sm:text-xs font-bold border border-purple-500/30 flex items-center justify-center gap-1 transition-all shadow-2xs cursor-pointer active:scale-95 min-w-0"
            title="Quiz understanding"
          >
            <HelpCircle className="w-3 h-3 text-purple-500 dark:text-purple-400 shrink-0" />
            <span className="truncate">Quiz</span>
          </button>

          <button
            onClick={() => onTriggerImLost()}
            className="w-full py-1.5 px-0.5 sm:px-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] sm:text-xs font-bold border border-amber-500/30 flex items-center justify-center gap-1 transition-all shadow-2xs cursor-pointer active:scale-95 min-w-0"
            title="Diagnose stumbling block"
          >
            <Compass className="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0" />
            <span className="truncate">I'm Lost</span>
          </button>
        </div>

        {/* High-Contrast Crisp Text Input Box */}
        <form onSubmit={handleSend} className="w-full">
          <div className="bg-background text-foreground border border-border/80 rounded-2xl p-1.5 sm:p-2 shadow-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-all flex items-center gap-1.5">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputQuery}
              onChange={(e) => {
                setInputQuery(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(100, e.target.scrollHeight)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder={`Ask anything about Page ${currentPage.pageNumber}...`}
              disabled={isLoading}
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground border-0 resize-none px-2 py-1 text-xs sm:text-sm focus:outline-none min-h-[30px] max-h-28 leading-relaxed font-sans font-medium"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="w-8 h-8 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-25 text-primary-foreground flex items-center justify-center shrink-0 transition-all shadow-2xs active:scale-95 cursor-pointer"
              title="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
