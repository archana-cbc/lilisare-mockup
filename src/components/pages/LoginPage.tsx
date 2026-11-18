'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DEMO_WORKSPACES, DemoWorkspace } from '@/data/mockData';

export const LoginPage: React.FC = () => {
  const { login, showToast } = useApp();

  // Selected workspace in demo picker (defaults to Administrator)
  const [selectedWorkspace, setSelectedWorkspace] = useState<DemoWorkspace>(DEMO_WORKSPACES[0]);

  // Form Fields
  const [email, setEmail] = useState<string>(DEMO_WORKSPACES[0].email);
  const [password, setPassword] = useState<string>('••••••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Sign In Flow States: 'credentials' | 'mfa' | 'loading'
  const [step, setStep] = useState<'credentials' | 'mfa' | 'loading'>('credentials');
  const [mfaCode, setMfaCode] = useState<string[]>(['4', '8', '2', '9', '1', '0']);

  // Request Access Modal
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqRole, setReqRole] = useState('Enrollment and Onboarding');
  const [reqNote, setReqNote] = useState('');

  // When a workspace tile is selected:
  const handleSelectWorkspace = (ws: DemoWorkspace) => {
    setSelectedWorkspace(ws);
    setEmail(ws.email);
    setPassword('••••••••••••');
    setStep('credentials');
  };

  // Reset to default credentials
  const handleReset = () => {
    setEmail(selectedWorkspace.email);
    setPassword('••••••••••••');
    setStep('credentials');
    showToast(`Reset credentials for ${selectedWorkspace.name}.`);
  };

  // Step 1: Submit Credentials -> Go to MFA
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter an email address.');
      return;
    }
    setStep('mfa');
  };

  // Step 2: Verify MFA -> Short loading -> Login
  const handleVerifyMfa = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setTimeout(() => {
      login(selectedWorkspace.id);
    }, 800);
  };

  // Submit Request Access
  const handleRequestAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName.trim() || !reqEmail.trim()) {
      showToast('Please provide your name and email.');
      return;
    }
    setIsRequestModalOpen(false);
    setReqName('');
    setReqEmail('');
    setReqNote('');
    showToast('Access request submitted! An agency administrator will review your account.');
  };

  // SVG Icons for Tiles
  const renderTileIcon = (iconName: string) => {
    switch (iconName) {
      case 'shield-check':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'user-plus':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        );
      case 'clipboard-heart':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case 'calendar-clock':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'receipt-dollar':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
        );
      case 'smartphone-heart':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'users-group':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'file-check':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg,#F7F7F4)] flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-6xl grid lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ========================================================================= */}
        {/* LEFT PANEL (Deep Forest Green Card) */}
        {/* In mobile, this renders after the sign in form for immediate login access */}
        {/* ========================================================================= */}
        <div
          style={{ backgroundColor: 'var(--green-900, #1b381e)' }}
          className="order-2 lg:order-1 lg:col-span-7 rounded-3xl p-6 lg:p-8 text-white shadow-xl flex flex-col justify-between border border-white/10"
        >
          {/* Header & Status Pill */}
          <div>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-xl p-2 w-12 h-12 flex items-center justify-center shadow-sm shrink-0">
                  <img src="/lilisare-logo.png" alt="LiliSare Logo" className="w-full h-auto object-contain max-h-8" />
                </div>
                <div>
                  <div className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
                    <span>LiliSare</span>
                    <span className="text-white/60 font-normal text-sm">/ LiliSphere</span>
                  </div>
                  <div className="text-xs text-white/70">Operating system for home care</div>
                </div>
              </div>

              {/* Status Pill */}
              <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1 rounded-full text-xs font-medium text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Systems operational</span>
              </div>
            </div>

            {/* Workspace Selector Label */}
            <div className="mb-4">
              <div className="text-xs uppercase font-bold text-white/60 tracking-wider">
                Choose your workspace (demo)
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                Selecting a workspace fills demo credentials and role permissions.
              </p>
            </div>

            {/* Mobile Workspace Dropdown (when viewport is small) */}
            <div className="lg:hidden mb-4">
              <label htmlFor="mobile-workspace-select" className="sr-only">Choose Workspace</label>
              <select
                id="mobile-workspace-select"
                value={selectedWorkspace.id}
                onChange={(e) => {
                  const ws = DEMO_WORKSPACES.find((w) => w.id === e.target.value);
                  if (ws) handleSelectWorkspace(ws);
                }}
                className="w-full bg-white/15 text-white border border-white/20 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {DEMO_WORKSPACES.map((w) => (
                  <option key={w.id} value={w.id} className="text-stone-900">
                    {w.name} ({w.category}) — {w.oneLine}
                  </option>
                ))}
              </select>
            </div>

            {/* Workspace Tiles (Desktop & Tablet) */}
            <div className="hidden lg:block space-y-4">
              {/* Group 1: Staff */}
              <div>
                <div className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">
                  Staff Workspaces
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {DEMO_WORKSPACES.filter((w) => w.category === 'Staff').map((ws) => {
                    const isSelected = selectedWorkspace.id === ws.id;
                    return (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => handleSelectWorkspace(ws)}
                        className={`text-left p-3 rounded-2xl transition border flex items-start gap-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                          isSelected
                            ? 'bg-white/25 border-emerald-400 shadow-md text-white'
                            : 'bg-white/10 hover:bg-white/15 border-white/10 text-white/85'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/80'}`}>
                          {renderTileIcon(ws.icon)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs truncate flex items-center justify-between">
                            <span>{ws.name}</span>
                            {isSelected && <span className="text-emerald-400 text-sm">✓</span>}
                          </div>
                          <div className="text-[11px] text-white/70 line-clamp-1 mt-0.5">
                            {ws.oneLine}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Group 2: External Portals */}
              <div>
                <div className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">
                  External Portals
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {DEMO_WORKSPACES.filter((w) => w.category === 'External').map((ws) => {
                    const isSelected = selectedWorkspace.id === ws.id;
                    return (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => handleSelectWorkspace(ws)}
                        className={`text-left p-3 rounded-2xl transition border flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                          isSelected
                            ? 'bg-white/25 border-emerald-400 shadow-md text-white'
                            : 'bg-white/10 hover:bg-white/15 border-white/10 text-white/85'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/80'}`}>
                            {renderTileIcon(ws.icon)}
                          </div>
                          {isSelected && <span className="text-emerald-400 text-xs font-bold">✓ Selected</span>}
                        </div>
                        <div>
                          <div className="font-bold text-xs truncate">{ws.name}</div>
                          <div className="text-[10px] text-white/70 line-clamp-1 mt-0.5">{ws.oneLine}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dynamic Summary of Chosen Workspace */}
            <div className="mt-5 p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-white">{selectedWorkspace.name} Workspace</span>
                <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  {selectedWorkspace.category}
                </span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed mb-2.5">
                {selectedWorkspace.description}
              </p>
              <div className="text-[11px] font-semibold text-white/90 mb-1.5 uppercase tracking-wide">
                What you can do here:
              </div>
              <ul className="space-y-1 text-xs text-white/80 list-disc list-inside">
                {selectedWorkspace.highlights.map((h, i) => (
                  <li key={i} className="leading-snug">{h}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Trust & Footer */}
          <div className="mt-6 pt-4 border-t border-white/15 text-xs text-white/70">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2 font-medium text-[11px]">
              <span className="flex items-center gap-1.5">
                <span>🛡️</span> Role-based access
              </span>
              <span className="flex items-center gap-1.5">
                <span>📋</span> Every view is logged
              </span>
              <span className="flex items-center gap-1.5">
                <span>🔒</span> HIPAA-protected data
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-white/50">
              <span>© 2026 LiliSare · All rights reserved</span>
              <span>Encrypted in transit and at rest</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL (White Card: Authentication & MFA Form) */}
        {/* ========================================================================= */}
        <div className="order-1 lg:order-2 lg:col-span-5 bg-white border border-stone-200 rounded-3xl p-6 lg:p-10 shadow-xl flex flex-col justify-between">
          <div>
            {/* Top Chip & Reset Button */}
            <div className="flex items-center justify-between mb-8">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">
                <span>Workspace:</span>
                <span className="font-bold">{selectedWorkspace.name}</span>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
              >
                Reset
              </button>
            </div>

            {/* Greeting */}
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-stone-900 tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-stone-500 mt-1">
                Sign in to your account to continue into LiliSare.
              </p>
            </div>

            {/* STEP 1: CREDENTIALS FORM */}
            {step === 'credentials' && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-xs font-semibold text-stone-700 mb-1">
                    Email address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
                  />
                  <div className="text-[11px] text-stone-400 mt-1">
                    Simulating: <strong>{selectedWorkspace.user}</strong>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="login-password" className="block text-xs font-semibold text-stone-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => showToast(`Password reset link emailed to ${email}.`)}
                      className="text-xs font-semibold text-[#3E6B2B] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 text-xs font-semibold"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-stone-300 accent-[#3E6B2B]"
                    />
                    <span>Keep me signed in</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#3E6B2B] hover:bg-[#335a23] text-white font-bold text-sm py-3 rounded-xl shadow-xs transition mt-2 flex items-center justify-center gap-2"
                >
                  <span>Sign in</span>
                  <span>→</span>
                </button>
              </form>
            )}

            {/* STEP 2: MULTI-FACTOR AUTHENTICATION (MFA) */}
            {step === 'mfa' && (
              <form onSubmit={handleVerifyMfa} className="space-y-5 animate-fade-in">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-sm">
                    🔒
                  </div>
                  <div>
                    <div className="font-bold text-sm">Enter the 6-digit code</div>
                    <div className="text-emerald-700 mt-0.5">
                      We sent a temporary verification code to your registered device (•••• 412).
                    </div>
                  </div>
                </div>

                {/* 6 Digit Code Boxes (pre-filled in demo) */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    {mfaCode.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const val = e.target.value.slice(-1);
                          const next = [...mfaCode];
                          next[index] = val;
                          setMfaCode(next);
                        }}
                        aria-label={`Digit ${index + 1}`}
                        className="w-12 h-12 text-center text-lg font-bold rounded-xl border border-stone-300 text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
                      />
                    ))}
                  </div>
                  <div className="text-[11px] text-stone-400 text-center mt-2">
                    Demo code auto-filled for immediate testing
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    className="w-full bg-[#3E6B2B] hover:bg-[#335a23] text-white font-bold text-sm py-3 rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <span>Verify and enter workspace</span>
                    <span>→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('credentials')}
                    className="w-full text-center text-xs text-stone-500 hover:text-stone-800 py-1 font-semibold"
                  >
                    ← Back to credentials
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: LOADING SIMULATION */}
            {step === 'loading' && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
                <div className="w-10 h-10 border-4 border-emerald-200 border-t-[#3E6B2B] rounded-full animate-spin" />
                <div>
                  <div className="font-bold text-base text-stone-900">
                    Opening your {selectedWorkspace.name} workspace…
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    Applying security credentials and caseload permissions.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Help & Request Access */}
          <div className="pt-8 border-t border-stone-100 text-center space-y-3">
            <div className="text-xs text-stone-600">
              Don’t have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(true)}
                className="font-bold text-[#3E6B2B] hover:underline"
              >
                Request access
              </button>
            </div>

            <div className="text-[11px] text-stone-400 leading-tight">
              Access is by invitation only. Sessions lock after 15 minutes of inactivity.
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: REQUEST ACCESS */}
      {/* ========================================================================= */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="font-bold text-lg text-stone-900">Request LiliSare Access</h2>
                <p className="text-xs text-stone-500">Submit an access request to your agency administrator.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestAccessSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Smith"
                  value={reqName}
                  onChange={(e) => setReqName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  placeholder="jordan.smith@lilisare.com"
                  value={reqEmail}
                  onChange={(e) => setReqEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Role Requested</label>
                <select
                  value={reqRole}
                  onChange={(e) => setReqRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white"
                >
                  <option value="Enrollment and Onboarding">Enrollment and Onboarding</option>
                  <option value="Compliance and Clinical">Compliance and Clinical</option>
                  <option value="Scheduling">Scheduling</option>
                  <option value="Billing and Payroll">Billing and Payroll</option>
                  <option value="Caregiver">Caregiver</option>
                  <option value="Family / Responsible Party">Family / Responsible Party</option>
                  <option value="Case Manager">Case Manager (State CMA)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Note to Administrator</label>
                <textarea
                  rows={2}
                  placeholder="State your branch location or supervisor name..."
                  value={reqNote}
                  onChange={(e) => setReqNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="border border-stone-300 text-stone-700 px-4 py-2 rounded-xl hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#3E6B2B] hover:bg-[#335a23] text-white font-bold px-5 py-2 rounded-xl shadow-xs transition"
                >
                  Submit request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
