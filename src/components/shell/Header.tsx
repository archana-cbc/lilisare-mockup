'use client';

import React, { useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Search } from './Search';
import { G } from '@/data/mockData';

export const Header: React.FC = () => {
  const {
    feed,
    setIsDrawerOpen,
    showToast,
    isMobileNavOpen,
    setIsMobileNavOpen,
    isUserMenuOpen,
    setIsUserMenuOpen,
    logout,
    setIsWorkspacePickerOpen,
  } = useApp();

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [setIsUserMenuOpen]);

  return (
    <header className="flex items-center gap-3 px-4 lg:px-8 py-3 bg-white border-b border-stone-200 sticky top-0 z-20 shadow-xs">
      <button
        type="button"
        className="lg:hidden border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-700 hover:bg-stone-50"
        aria-label="Open menu"
        onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
      >
        ☰
      </button>

      <Search />

      {/* Live Automation Feed Bell */}
      <button
        type="button"
        aria-label="Open automation activity feed"
        onClick={() => setIsDrawerOpen(true)}
        className="ml-auto relative border border-stone-300 rounded-lg px-2.5 py-1.5 hover:bg-stone-50 transition"
      >
        <span className="text-base" role="img" aria-label="bell">
          🔔
        </span>
        {feed.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#F2B632] text-stone-900 text-[10px] font-bold rounded-full px-1.5 py-0.2 shadow-sm">
            {feed.length}
          </span>
        )}
      </button>

      {/* User Profile Menu */}
      <div ref={userMenuRef} className="relative">
        <button
          type="button"
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="flex items-center gap-2 rounded-full border border-stone-300 pl-1 pr-3 py-1 text-sm hover:bg-stone-50 transition"
          aria-haspopup="menu"
          aria-expanded={isUserMenuOpen}
        >
          <span
            className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 bg-[#10B981]"
          >
            A
          </span>
          <span className="hidden sm:inline font-medium text-stone-800">Archana</span>
        </button>

        {isUserMenuOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-1 w-52 bg-white border border-stone-200 rounded-xl shadow-lg p-1 z-30"
          >
            <div className="px-3 py-2 border-b border-stone-100 mb-1">
              <div className="font-semibold text-xs text-stone-900">Archana</div>
              <div className="text-[11px] text-stone-500 truncate">archana@creativebuffer.com</div>
            </div>
            {['Profile', 'Switch role', 'Help', 'Sign out'].map((item) => (
              <button
                key={item}
                role="menuitem"
                type="button"
                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-stone-100 text-stone-700 transition"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  if (item === 'Sign out') {
                    logout();
                  } else if (item === 'Switch role') {
                    setIsWorkspacePickerOpen(true);
                  } else {
                    showToast(`${item} (demo)`);
                  }
                }}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
