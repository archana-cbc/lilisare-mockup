'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { FLAT_NAV, CL, CG } from '@/data/mockData';
import { CLIENTS_DETAILED } from '@/data/clientsData';

export const Search: React.FC = () => {
  const { navigate, deIdentify, page } = useApp();
  const [q, setQ] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholderText = useMemo(() => {
    switch (page) {
      case 'clients':
        return 'Search clients by name, ID, household, or payer…';
      case 'caregivers':
        return 'Search caregivers, credentials, or service classes…';
      case 'scheduling':
        return 'Search shifts, EVV status, or client visits…';
      case 'billing':
        return 'Search claims, invoices, or billing rates…';
      case 'compliance':
      case 'audit':
        return 'Search care notes, clinical rules, or audits…';
      case 'training':
        return 'Search training courses, paths, or validations…';
      default:
        return 'Search clients, caregivers, pages…';
    }
  }, [page]);

  const results = q.trim().length > 0
    ? [
      ...FLAT_NAV.filter((n) => n.label.toLowerCase().includes(q.toLowerCase())).map((n) => ({
        label: n.label,
        sub: 'Navigation',
        page: n.id,
        id: null,
        category: 'Page',
      })),
      ...CLIENTS_DETAILED.filter((c) =>
        deIdentify(c.name).toLowerCase().includes(q.toLowerCase()) ||
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.id.toLowerCase().includes(q.toLowerCase()) ||
        c.household.toLowerCase().includes(q.toLowerCase()) ||
        c.program.toLowerCase().includes(q.toLowerCase())
      ).map((c) => ({
        label: `${deIdentify(c.name)} (${c.id})`,
        sub: `${c.program} · ${c.city}, ${c.state}`,
        page: 'clients',
        id: c.id,
        category: 'Client',
      })),
      ...CG.filter((c) =>
        deIdentify(c.name).toLowerCase().includes(q.toLowerCase()) ||
        c.name.toLowerCase().includes(q.toLowerCase())
      ).map((c) => ({
        label: deIdentify(c.name),
        sub: `${c.serviceClass} · ${c.employmentType}`,
        page: 'caregivers',
        id: null,
        category: 'Caregiver',
      })),
    ].slice(0, 8)
    : [];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          aria-label="Global search"
          value={q}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQ(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholderText}
          className="w-full border border-stone-300 rounded-lg pl-3 pr-10 py-2 text-sm bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]/20"
        />
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-stone-400 border border-stone-200 rounded px-1.5 py-0.5 bg-stone-50 select-none pointer-events-none shadow-2xs">
          ⌘K
        </kbd>
      </div>
      {isOpen && q.trim().length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white border border-stone-200 rounded-xl shadow-lg z-30 p-1">
          {results.length > 0 ? (
            results.map((x, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  navigate(x.page, x.id);
                  setQ('');
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-stone-100 flex items-center justify-between text-stone-800 transition-colors"
              >
                <div>
                  <span className="font-medium text-stone-900 block">{x.label}</span>
                  {x.sub && <span className="text-[11px] text-stone-500 block">{x.sub}</span>}
                </div>
                <span className="text-xs text-stone-500 font-normal ml-2 shrink-0">{x.category}</span>
              </button>
            ))
          ) : (
            <div className="p-3 text-sm text-stone-500 text-center">No matches found for &ldquo;{q}&rdquo;</div>
          )}
        </div>
      )}
    </div>
  );
};
