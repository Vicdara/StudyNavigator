'use client';

import React, { useState, useEffect } from 'react';
import {
  DocumentData,
  StudySession,
  UserPreferences,
  AISettings,
  ThemePreset,
  UserProfile,
} from './types';
import {
  StorageManager,
  DEFAULT_USER_PREFERENCES,
  DEFAULT_USER_PROFILE,
} from './lib/storage/storage';
import { DEFAULT_AI_SETTINGS } from './lib/ai/default-config';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DocumentLibrary } from './components/DocumentLibrary';
import { Workspace } from './components/Workspace';
import { OnboardingModal } from './components/OnboardingModal';
import { ConceptGraphModal } from './components/ConceptGraphModal';
import { MasteryDashboardModal } from './components/MasteryDashboardModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'library' | 'workspace'>('library');
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [activeDocument, setActiveDocument] = useState<DocumentData | null>(null);
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [aiSettings, setAiSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeTheme, setActiveTheme] = useState<ThemePreset>('cream');

  // Modals state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isConceptGraphOpen, setIsConceptGraphOpen] = useState<boolean>(false);
  const [isMasteryOpen, setIsMasteryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Apply visual theme presets and dark mode classes to root html
  useEffect(() => {
    const classList = document.documentElement.classList;
    classList.remove(
      'theme-cream',
      'theme-minimalist',
      'theme-emerald',
      'theme-tokyo',
      'theme-cyberpunk',
      'theme-rose',
      'theme-nordic',
      'theme-sepia',
      'theme-matcha',
      'theme-dracula',
      'theme-high-contrast',
      'dark'
    );

    if (activeTheme === 'cream') {
      classList.add('theme-cream');
    } else if (activeTheme === 'minimalist') {
      classList.add('theme-minimalist');
    } else if (activeTheme === 'tokyo') {
      classList.add('theme-tokyo', 'dark');
    } else if (activeTheme === 'cyberpunk') {
      classList.add('theme-cyberpunk', 'dark');
    } else if (activeTheme === 'rose') {
      classList.add('theme-rose');
    } else if (activeTheme === 'nordic') {
      classList.add('theme-nordic');
    } else if (activeTheme === 'sepia') {
      classList.add('theme-sepia');
    } else if (activeTheme === 'matcha') {
      classList.add('theme-matcha');
    } else if (activeTheme === 'dracula') {
      classList.add('theme-dracula', 'dark');
    } else if (activeTheme === 'high_contrast') {
      classList.add('theme-high-contrast', 'dark');
    } else if (activeTheme === 'obsidian' || darkMode) {
      classList.add('dark');
    }
  }, [activeTheme, darkMode]);

  // Load persisted state on mount
  useEffect(() => {
    const loadedDocs = StorageManager.getAllDocuments();
    const loadedSessions = StorageManager.getAllSessions();
    const loadedPrefs = StorageManager.getPreferences();
    const loadedProfile = StorageManager.getUserProfile();
    const loadedAiSettings = StorageManager.getAISettings();

    setDocuments(loadedDocs);
    setSessions(loadedSessions.filter((session) => loadedDocs.some((doc) => doc.id === session.documentId)));
    setPreferences(loadedPrefs);
    setUserProfile(loadedProfile);
    setAiSettings(loadedAiSettings);

    const hasOnboarded = localStorage.getItem('study_navigator_onboarded');
    if (!hasOnboarded) {
      setIsOnboardingOpen(true);
    }

    if (loadedDocs.length > 0) {
      setActiveDocument(loadedDocs[0]);
    }
  }, []);

  // Handle document selection -> create or switch session -> launch workspace
  const handleSelectDocument = (doc: DocumentData) => {
    setActiveDocument(doc);
    let session = sessions.find((s) => s.documentId === doc.id);
    if (!session) {
      session = StorageManager.createNewSession(doc, preferences);
      setSessions((prev) => [session!, ...prev.filter((s) => s.id !== session!.id)]);
    }
    setActiveSession(session);
    setCurrentView('workspace');
  };

  // Resume existing study session
  const handleResumeSession = (session: StudySession) => {
    const doc = documents.find((d) => d.id === session.documentId) || documents[0];
    if (doc) {
      setActiveDocument(doc);
      setActiveSession(session);
      setCurrentView('workspace');
    }
  };

  // Handle new custom document upload (PDF, TXT, MD, DOCX)
  const handleUploadDocument = (newDoc: DocumentData) => {
    StorageManager.saveCustomDocument(newDoc);
    const updatedDocs = StorageManager.getAllDocuments();
    setDocuments(updatedDocs);
    handleSelectDocument(newDoc);
  };

  // Delete document pack from library
  const handleDeleteDocument = (docId: string) => {
    StorageManager.deleteDocument(docId);
    const updatedDocs = StorageManager.getAllDocuments();
    setDocuments(updatedDocs);
    const updatedSessions = StorageManager.getAllSessions();
    setSessions(updatedSessions);
    if (activeDocument?.id === docId) {
      setActiveDocument(updatedDocs[0] || null);
      setActiveSession(null);
      setCurrentView('library');
    }
  };

  // Update session memory & chat history
  const handleUpdateSession = (updatedSession: StudySession) => {
    setActiveSession(updatedSession);
    StorageManager.saveSession(updatedSession);
    const updatedList = sessions.map((s) => (s.id === updatedSession.id ? updatedSession : s));
    setSessions(updatedList);
  };

  // Delete session instantly
  const handleDeleteSession = (sessionId: string) => {
    StorageManager.deleteSession(sessionId);
    setSessions(sessions.filter((s) => s.id !== sessionId));
    if (activeSession?.id === sessionId) {
      setActiveSession(null);
      setCurrentView('library');
    }
  };

  // Save Preferences
  const handleSavePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    StorageManager.savePreferences(newPrefs);
    if (activeSession) {
      handleUpdateSession({ ...activeSession, userPreferences: newPrefs });
    }
  };

  // Save User Profile
  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    StorageManager.saveUserProfile(newProfile);
    handleSavePreferences({ ...preferences, username: newProfile.username });
  };

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      {/* Main View Router */}
      <div className="flex-1 flex flex-col">
        {currentView === 'landing' && (
          <LandingPage
            onStartStudying={() => setCurrentView('library')}
            onOpenDemoDocument={(docId) => {
              const doc = documents.find((d) => d.id === docId) || documents[0];
              if (doc) handleSelectDocument(doc);
            }}
          />
        )}

        {currentView === 'library' && (
          <>
            <Navbar
              currentView={currentView}
              onNavigate={setCurrentView}
              documents={documents}
              onSelectDocument={handleSelectDocument}
              userProfile={userProfile}
              onOpenSettings={() => setIsSettingsOpen(true)}
              activeTheme={activeTheme}
              onSelectTheme={(t) => {
                setActiveTheme(t);
                if (t === 'obsidian' || t === 'tokyo' || t === 'dracula' || t === 'cyberpunk') {
                  setDarkMode(true);
                } else {
                  setDarkMode(false);
                }
              }}
            />
            <DocumentLibrary
              documents={documents}
              sessions={sessions}
              onSelectDocument={handleSelectDocument}
              onResumeSession={handleResumeSession}
              onUploadDocument={handleUploadDocument}
              onDeleteDocument={handleDeleteDocument}
              onDeleteSession={handleDeleteSession}
              activeTheme={activeTheme}
              onSelectTheme={(t) => {
                setActiveTheme(t);
                if (t === 'obsidian' || t === 'tokyo' || t === 'dracula' || t === 'cyberpunk') {
                  setDarkMode(true);
                } else {
                  setDarkMode(false);
                }
              }}
              userProfile={userProfile}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </>
        )}

        {currentView === 'workspace' && activeDocument && (
          <Workspace
            document={activeDocument}
            session={
              activeSession && activeSession.documentId === activeDocument.id
                ? activeSession
                : sessions.find((s) => s.documentId === activeDocument.id) ||
                  StorageManager.createNewSession(activeDocument, preferences)
            }
            preferences={preferences}
            aiSettings={aiSettings}
            activeTheme={activeTheme}
            onSelectTheme={(t) => {
              setActiveTheme(t);
              if (t === 'obsidian' || t === 'tokyo' || t === 'dracula' || t === 'cyberpunk') {
                setDarkMode(true);
              } else {
                setDarkMode(false);
              }
            }}
            userProfile={userProfile}
            onUpdateSession={handleUpdateSession}
            onNavigateToLibrary={() => setCurrentView('library')}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSavePreferences={handleSavePreferences}
          />
        )}
      </div>

      {/* Global Modals */}
      <OnboardingModal
        preferences={preferences}
        userProfile={userProfile}
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSave={(newPrefs, newProfile) => {
          handleSavePreferences(newPrefs);
          if (newProfile) handleSaveProfile(newProfile);
        }}
      />

      <SettingsModal
        preferences={preferences}
        userProfile={userProfile}
        activeTheme={activeTheme}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSavePreferences={handleSavePreferences}
        onSaveProfile={handleSaveProfile}
        onSelectTheme={(t) => {
          setActiveTheme(t);
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleSaveProfile}
        currentProfile={userProfile}
      />

      {activeDocument && activeSession && (
        <>
          <ConceptGraphModal
            conceptGraph={activeDocument.conceptGraph}
            currentPage={activeSession.memory.currentPage || 1}
            memory={activeSession.memory}
            isOpen={isConceptGraphOpen}
            onClose={() => setIsConceptGraphOpen(false)}
            onJumpToPage={(pageNum) => {
              if (activeSession) {
                handleUpdateSession({
                  ...activeSession,
                  memory: { ...activeSession.memory, currentPage: pageNum },
                });
              }
            }}
          />

          <MasteryDashboardModal
            session={activeSession}
            document={activeDocument}
            isOpen={isMasteryOpen}
            onClose={() => setIsMasteryOpen(false)}
            onJumpToPage={(pageNum) => {
              if (activeSession) {
                handleUpdateSession({
                  ...activeSession,
                  memory: { ...activeSession.memory, currentPage: pageNum },
                });
              }
            }}
          />
        </>
      )}
    </main>
  );
}
