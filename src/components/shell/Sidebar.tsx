'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { NAV, NavGroup, NavItem } from '@/data/mockData';

export const Sidebar: React.FC = () => {
  const {
    page,
    navigate,
    isMobileNavOpen,
    setIsMobileNavOpen,
    showToast,
    currentWorkspace,
    logout,
    setIsWorkspacePickerOpen,
  } = useApp();

  // Desktop collapse state (full width vs. icon rail)
  const [isCollapsed, setIsCollapsed] = useState(false);

  // User popover menu state at bottom of sidebar
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isProfileMenuOpen]);

  // Filter NAV groups and items according to currentWorkspace.allowedPages
  const visibleNavGroups = useMemo(() => {
    // For external roles (Caregiver, Family, Case Manager), show their dedicated portal menu item
    if (currentWorkspace.category === 'External') {
      return [
        {
          id: currentWorkspace.initialPage,
          name: `${currentWorkspace.name} Portal`,
          icon: currentWorkspace.icon,
          isExpandable: false,
          directId: currentWorkspace.initialPage,
          items: [{ id: currentWorkspace.initialPage, label: `${currentWorkspace.name} Portal` }],
        },
      ];
    }

    return NAV.map((group) => {
      if (!group.isExpandable && group.directId) {
        const isAllowed = currentWorkspace.allowedPages.includes(group.directId);
        return isAllowed ? group : null;
      }

      // Filter sub-items by currentWorkspace allowedPages
      const allowedItems = group.items.filter((item) =>
        currentWorkspace.allowedPages.includes(item.id)
      );

      if (allowedItems.length === 0) return null;

      return {
        ...group,
        items: allowedItems,
      };
    }).filter(Boolean) as NavGroup[];
  }, [currentWorkspace]);

  // Expanded state for menu sections: key is group id, value is boolean
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV.forEach((group) => {
      // Auto-expand group if it contains the initial active page
      const containsActive = group.items.some((item) => item.id === page);
      initial[group.id] = containsActive || group.id === 'intake-menu';
    });
    return initial;
  });

  // Whenever the active page changes, auto-expand its parent group
  useEffect(() => {
    visibleNavGroups.forEach((group) => {
      if (group.isExpandable && group.items.some((item) => item.id === page)) {
        setExpandedGroups((prev) => ({
          ...prev,
          [group.id]: true,
        }));
      }
    });
  }, [page, visibleNavGroups]);

  const toggleGroup = (groupId: string) => {
    if (isCollapsed) {
      // If collapsed into rail mode, expanding a menu automatically uncollapses sidebar
      setIsCollapsed(false);
      setExpandedGroups((prev) => ({ ...prev, [groupId]: true }));
      return;
    }
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // SVG Icons matching modern stroke style
  const renderIcon = (iconName: string, className = 'w-5 h-5 shrink-0') => {
    switch (iconName) {
      case 'home':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-5.5a1 1 0 0 1-1-1v-4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v4a1 1 0 0 1-1 1H4.5A1.5 1.5 0 0 1 3 19.5v-9z" />
          </svg>
        );
      case 'inbox':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        );
      case 'users':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case 'pulse':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <polyline strokeLinecap="round" strokeLinejoin="round" points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        );
      case 'chart':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <line x1="12" y1="20" x2="12" y2="10" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="18" y1="20" x2="18" y2="4" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="6" y1="20" x2="6" y2="16" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="2" y1="20" x2="22" y2="20" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'settings':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        );
      case 'smartphone-heart':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'users-group':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'file-check':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" />
          </svg>
        );
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      <aside
        style={{ backgroundColor: 'var(--green-900, #1b381e)' }}
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-40 flex flex-col justify-between text-white transition-all duration-200 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:shrink-0 ${
          isCollapsed ? 'w-20 p-3' : 'w-64 p-3.5'
        } ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* TOP BRAND HEADER & COLLAPSE TOGGLE */}
        <div className="flex items-center justify-between gap-2 mb-4 shrink-0">
          {!isCollapsed ? (
            <button
              type="button"
              onClick={() => {
                navigate(currentWorkspace.initialPage);
                setIsMobileNavOpen(false);
              }}
              aria-label="LiliSare Home"
              className="flex-1 bg-white rounded-xl p-2 shadow-sm border border-white/20 transition hover:shadow-md hover:scale-[1.01] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#F2B632]"
            >
              <img
                src="/lilisare-logo.png"
                alt="LiliSare – because we care"
                className="w-full h-auto max-h-11 object-contain"
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                navigate(currentWorkspace.initialPage);
                setIsMobileNavOpen(false);
              }}
              aria-label="LiliSare Home"
              className="w-12 h-12 bg-white rounded-xl p-1.5 shadow-sm border border-white/20 transition hover:scale-105 flex items-center justify-center mx-auto"
            >
              <img
                src="/lilisare-logo.png"
                alt="LiliSare"
                className="w-full h-full object-contain"
              />
            </button>
          )}

          {/* Desktop << / >> Collapse Toggle Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition shrink-0"
          >
            {isCollapsed ? (
              // >> icon
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </svg>
            ) : (
              // << icon
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="11 19 4 12 11 5" />
                <polyline points="18 19 11 12 18 5" />
              </svg>
            )}
          </button>
        </div>

        {/* MIDDLE SCROLLABLE NAVIGATION LIST */}
        <nav className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
          {visibleNavGroups.map((group) => {
            // Standalone Direct Link (e.g. Today or Portal)
            if (!group.isExpandable && group.directId) {
              const isActive = page === group.directId;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => {
                    navigate(group.directId!);
                    setIsMobileNavOpen(false);
                  }}
                  title={isCollapsed ? group.name : undefined}
                  className={`w-full flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition group ${
                    isActive
                      ? 'bg-white/20 text-white font-semibold shadow-xs'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  } ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}>
                      {renderIcon(group.icon)}
                    </span>
                    {!isCollapsed && <span className="truncate">{group.name}</span>}
                  </div>
                </button>
              );
            }

            // Expandable Menu Group
            const isExpanded = !!expandedGroups[group.id];
            const hasActiveChild = group.items.some((item) => item.id === page);
            const totalBadges = group.items.reduce((sum, item) => sum + (item.badge || 0), 0);

            return (
              <div key={group.id} className="relative">
                {/* Group Header Button */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  title={isCollapsed ? group.name : undefined}
                  aria-expanded={isExpanded}
                  className={`w-full flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition group ${
                    hasActiveChild && !isExpanded
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  } ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={hasActiveChild ? 'text-white' : 'text-white/80 group-hover:text-white'}>
                      {renderIcon(group.icon)}
                    </span>
                    {!isCollapsed && <span className="truncate">{group.name}</span>}
                  </div>

                  {!isCollapsed && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isExpanded && totalBadges > 0 && (
                        <span className="bg-[#F2B632] text-stone-900 text-[11px] font-bold rounded-full px-2 py-0.5 leading-none shadow-xs">
                          {totalBadges}
                        </span>
                      )}

                      <svg
                        className={`w-4 h-4 text-white/60 group-hover:text-white transition-transform duration-200 ${
                          isExpanded ? 'transform rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  )}
                </button>

                {/* Submenu Tree with Vertical Guide Connector Line */}
                {isExpanded && !isCollapsed && (
                  <div className="relative pl-3 ml-6 my-1 border-l border-white/20 space-y-1">
                    {group.items.map((subItem) => {
                      const isSubActive = page === subItem.id;
                      return (
                        <button
                          key={subItem.id}
                          type="button"
                          onClick={() => {
                            navigate(subItem.id);
                            setIsMobileNavOpen(false);
                          }}
                          className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[13px] font-normal transition text-left ${
                            isSubActive
                              ? 'bg-white/20 text-white font-semibold shadow-xs'
                              : 'text-white/80 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <span className="truncate">{subItem.label}</span>
                          {subItem.badge !== undefined && (
                            <span className="bg-[#F2B632] text-stone-900 text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none ml-2">
                              {subItem.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* BOTTOM USER PROFILE CARD (Reflecting Active Demo Workspace) */}
        <div className="pt-3 border-t border-white/15 shrink-0 relative">
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            aria-expanded={isProfileMenuOpen}
            className={`w-full flex items-center rounded-xl p-2 transition hover:bg-white/10 text-left ${
              isCollapsed ? 'justify-center p-1.5' : 'justify-between gap-2.5'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Vibrant Emerald Avatar with Initial */}
              <div className="w-9 h-9 rounded-full bg-[#10B981] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm border border-white/20">
                {currentWorkspace.avatar}
              </div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-white truncate leading-tight">
                    {currentWorkspace.user}
                  </div>
                  <div className="text-[11px] text-white/65 truncate leading-tight mt-0.5">
                    {currentWorkspace.name} · LiliSare
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <svg
                className={`w-4 h-4 text-white/60 transition-transform duration-200 shrink-0 ${
                  isProfileMenuOpen ? 'transform rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>

          {/* Quick Profile Dropup Menu (Matching Dark Green Sidebar Theme) */}
          {isProfileMenuOpen && (
            <div
              ref={profileMenuRef}
              className="absolute bottom-16 left-2 right-2 rounded-2xl shadow-2xl border border-white/20 p-2 z-50 text-xs backdrop-blur-md animate-fade-in"
              style={{ backgroundColor: 'var(--green-900, #1b381e)' }}
            >
              {/* User Header */}
              <div className="px-3 py-2.5 border-b border-white/10 mb-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-white text-sm">{currentWorkspace.user}</div>
                  <span className="inline-flex items-center gap-1 bg-white/15 text-emerald-300 font-semibold text-[10px] px-2 py-0.5 rounded-full border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {currentWorkspace.name}
                  </span>
                </div>
                <div className="text-white/70 truncate text-[11px] mt-0.5">
                  {currentWorkspace.email}
                </div>
              </div>

              {/* Menu Actions */}
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsWorkspacePickerOpen(true);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition flex items-center gap-2.5 font-medium group"
                >
                  <span>🔄</span>
                  <span>Switch demo workspace</span>
                </button>

                {currentWorkspace.allowedPages.includes('users') && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate('users');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-white/85 hover:text-white hover:bg-white/10 transition flex items-center gap-2.5 font-medium group"
                  >
                    <span>👥</span>
                    <span>Caseload & Roles</span>
                  </button>
                )}

                {currentWorkspace.allowedPages.includes('settings') && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate('settings');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-white/85 hover:text-white hover:bg-white/10 transition flex items-center gap-2.5 font-medium group"
                  >
                    <span>⚙️</span>
                    <span>Organization Settings</span>
                  </button>
                )}

                <div className="pt-1 mt-1 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-rose-300 hover:text-white hover:bg-rose-600/30 transition flex items-center gap-2.5 font-medium group"
                  >
                    <span>🚪</span>
                    <span>Log out to /login</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
