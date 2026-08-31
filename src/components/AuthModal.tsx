'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/types';
import { User, Lock, ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (profile: UserProfile) => void;
  currentProfile?: UserProfile;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  currentProfile,
}) => {
  const [username, setUsername] = useState<string>(currentProfile?.username || '');
  const [password, setPassword] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError('Please enter a valid username');
      return;
    }

    if (password.length < 3) {
      setError('Password must be at least 3 characters');
      return;
    }

    const profile: UserProfile = {
      username: cleanUsername,
      displayName: cleanUsername,
      createdAt: new Date().toISOString(),
    };

    onLogin(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-card text-card-foreground border border-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="p-5 border-b border-border bg-primary/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-foreground">
                {isRegistering ? 'Create Student Account' : 'Student Login'}
              </h3>
              <p className="text-xs text-muted-foreground">
                Personalized AI Document Tutor
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-foreground">Username</label>
            <div className="relative flex items-center">
              <User className="w-3.5 h-3.5 absolute left-3 text-muted-foreground" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-foreground">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-3.5 h-3.5 absolute left-3 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {error && (
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all mt-2"
          >
            <span>{isRegistering ? 'Create & Start' : 'Sign In & Study'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-[11px] text-muted-foreground hover:text-primary transition-colors underline"
            >
              {isRegistering
                ? 'Already have an account? Sign in'
                : 'Need a student account? Register here'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
