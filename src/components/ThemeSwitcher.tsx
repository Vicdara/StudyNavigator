'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, X } from 'lucide-react';
import { ThemePreset } from '@/types';

export { type ThemePreset } from '@/types';

interface ThemeSwitcherProps {
  activeTheme: ThemePreset;
  onSelectTheme: (theme: ThemePreset) => void;
}

export const THEME_LIST: { id: ThemePreset; name: string; iconColor: string; desc: string; isDark?: boolean }[] = [
  {
    id: 'cream',
    name: 'Focus Paper (Default)',
    iconColor: 'bg-[#fcfbf9] border border-amber-300',
    desc: 'Warm paper reading tone for eye comfort',
  },
  {
    id: 'minimalist',
    name: 'Minimalist Pure',
    iconColor: 'bg-white border border-slate-300',
    desc: 'Crisp clean white workspace with slate ink',
  },
  {
    id: 'emerald',
    name: 'Emerald Study',
    iconColor: 'bg-emerald-500',
    desc: 'Minty clarity with vibrant emerald accents',
  },
  {
    id: 'obsidian',
    name: 'Midnight Obsidian',
    iconColor: 'bg-[#0d1117] border border-slate-700',
    desc: 'Deep distraction-free OLED dark environment',
    isDark: true,
  },
  {
    id: 'tokyo',
    name: 'Tokyo Night',
    iconColor: 'bg-[#1a1b26] border border-indigo-400',
    desc: 'Deep cyber navy with lavender highlights',
    isDark: true,
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Amber',
    iconColor: 'bg-[#0d0f14] border border-amber-400',
    desc: 'Dark high-tech mode with warm amber accents',
    isDark: true,
  },
  {
    id: 'rose',
    name: 'Rose Quartz',
    iconColor: 'bg-[#fdf8f9] border border-rose-300',
    desc: 'Soft blush pastel with calming berry tones',
  },
  {
    id: 'nordic',
    name: 'Nordic Slate',
    iconColor: 'bg-[#f2f5f9] border border-sky-300',
    desc: 'Arctic ice-gray with deep fjord blue',
  },
  {
    id: 'sepia',
    name: 'Warm Sepia',
    iconColor: 'bg-[#f6f0df] border border-amber-400',
    desc: 'Vintage parchment with rich espresso ink',
  },
  {
    id: 'matcha',
    name: 'Matcha Zen',
    iconColor: 'bg-[#f3f7f3] border border-emerald-300',
    desc: 'Earthy calming bamboo & sage green',
  },
  {
    id: 'dracula',
    name: 'Dracula Dark',
    iconColor: 'bg-[#282a36] border border-pink-400',
    desc: 'Gothic violet dark workspace',
    isDark: true,
  },
  {
    id: 'high_contrast',
    name: 'High Contrast (AAA)',
    iconColor: 'bg-black border-2 border-yellow-400',
    desc: 'Maximum visibility pure black & yellow',
    isDark: true,
  },
];

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  activeTheme,
  onSelectTheme,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      {/* Theme Palette Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center border cursor-pointer shadow-2xs ${
          isOpen
            ? 'bg-primary text-primary-foreground border-primary shadow-xs'
            : 'bg-secondary/80 hover:bg-secondary text-foreground hover:text-primary border-border/60'
        }`}
        title="Choose Theme & Appearance"
      >
        <Palette className="w-4.5 h-4.5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="fixed sm:absolute right-3 sm:right-0 top-14 sm:top-10 w-72 max-w-[calc(100vw-1.5rem)] max-h-[80vh] overflow-y-auto p-2.5 rounded-2xl bg-card border border-border/80 shadow-2xl z-[100] animate-slide-up space-y-1 backdrop-blur-md custom-scrollbar">
          <div className="px-2 py-1 flex items-center justify-between border-b border-border/60 pb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Palette className="w-3 h-3" />
              <span>Theme Appearance ({THEME_LIST.length})</span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5 pt-1">
            {THEME_LIST.map((t) => {
              const isSelected = activeTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-primary/15 text-foreground font-bold border border-primary/40'
                      : 'hover:bg-secondary text-foreground/80'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${t.iconColor} shrink-0 mt-0.5 shadow-2xs`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="truncate font-semibold text-xs">{t.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-normal truncate mt-0.2">{t.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
