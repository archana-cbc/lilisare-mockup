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
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'user-plus':
        return (
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        );
      case 'clipboard-heart':
        return (
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case 'calendar-clock':
        return (
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'receipt-tax':
        return (
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'device-mobile':
        return (
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'users':
        return (
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'clipboard-check':
        return (
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden w-full flex flex-col lg:flex-row bg-white selection:bg-emerald-800 selection:text-white">
      
      {/* ========================================================================= */}
      {/* LEFT PANEL: Deep Forest Green Brand & Clean Minimal Workspace Selector */}
      {/* Edge-to-edge, single-screen height (never scrollable on desktop) */}
      {/* ========================================================================= */}
      <section
        aria-label="LiliSare Workspace Selector"
        style={{ backgroundColor: 'var(--green-900, #1b381e)' }}
        className="w-full lg:w-[58%] xl:w-[60%] min-h-screen lg:min-h-0 lg:h-full text-white p-6 sm:p-8 lg:p-8 xl:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-emerald-950/40 relative shadow-2xl"
      >
        <div className="w-full max-w-4xl mx-auto flex flex-col justify-between h-full space-y-4 lg:space-y-0">
          
          {/* Top Brand Bar */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/10 shrink-0">
            <div className="bg-white rounded-xl p-2 w-11 h-11 flex items-center justify-center shadow-md shrink-0">
              <img
                src="/lilisare-logo.png"
                alt="LiliSare Logo"
                className="w-full h-auto object-contain max-h-7"
              />
            </div>
            <div>
              <div className="font-extrabold text-xl sm:text-2xl tracking-tight text-white flex items-center gap-2">
                <span>LiliSare</span>
                <span className="text-white/50 font-normal text-xs sm:text-sm"></span>
              </div>
              <div className="text-xs text-emerald-200/80 font-medium">
                Operating system for home care
              </div>
            </div>
          </div>

          {/* Clean Workspace Selector (Staff & External) */}
          <div className="my-auto py-2 space-y-4">
            
            {/* Staff Workspaces */}
            <div>
              <div className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Staff Workspaces</span>
                <span className="text-[10px] text-white/40 font-normal">Internal operations</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEMO_WORKSPACES.filter((w) => w.category === 'Staff').map((ws) => {
                  const isSelected = selectedWorkspace.id === ws.id;
                  return (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => handleSelectWorkspace(ws)}
                      className={`text-left p-2.5 sm:p-3 rounded-2xl transition border flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 group cursor-pointer ${
                        isSelected
                          ? 'bg-white/20 border-emerald-400 ring-1 ring-emerald-400/50 shadow-md text-white'
                          : 'bg-white/10 hover:bg-white/15 border-white/10 hover:border-white/20 text-white/85'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl shrink-0 transition ${
                          isSelected
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-white/10 text-emerald-200 group-hover:bg-white/20'
                        }`}
                      >
                        {renderTileIcon(ws.icon)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs sm:text-sm truncate flex items-center justify-between">
                          <span className="text-white group-hover:text-emerald-200 transition">{ws.name}</span>
                          {isSelected && (
                            <span className="text-emerald-400 font-extrabold text-xs ml-1">✓</span>
                          )}
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

            {/* External Portals */}
            <div>
              <div className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>External Portals</span>
                <span className="text-[10px] text-white/40 font-normal">Clients, family & partners</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {DEMO_WORKSPACES.filter((w) => w.category === 'External').map((ws) => {
                  const isSelected = selectedWorkspace.id === ws.id;
                  return (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => handleSelectWorkspace(ws)}
                      className={`text-left p-2.5 sm:p-3 rounded-2xl transition border flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-emerald-400 group cursor-pointer ${
                        isSelected
                          ? 'bg-white/20 border-emerald-400 ring-1 ring-emerald-400/50 shadow-md text-white'
                          : 'bg-white/10 hover:bg-white/15 border-white/10 hover:border-white/20 text-white/85'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div
                          className={`p-1.5 rounded-xl shrink-0 transition ${
                            isSelected
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'bg-white/10 text-emerald-200 group-hover:bg-white/20'
                          }`}
                        >
                          {renderTileIcon(ws.icon)}
                        </div>
                        {isSelected && (
                          <span className="text-emerald-400 text-[10px] font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-400/30">
                            ✓ Active
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white group-hover:text-emerald-200 transition truncate">
                          {ws.name}
                        </div>
                        <div className="text-[10px] text-white/70 line-clamp-1 mt-0.5">
                          {ws.oneLine}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Clean Minimal Footer */}
          <div className="flex items-center justify-between text-[11px] text-white/50 pt-3 border-t border-white/10 shrink-0">
            <span>© 2026 LiliSare · All rights reserved</span>
            <span>256-bit encrypted in transit and at rest</span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* RIGHT PANEL: Clean Minimal Sign In & MFA Card */}
      {/* Edge-to-edge, single-screen height (never scrollable on desktop) */}
      {/* ========================================================================= */}
      <section
        aria-label="Sign In Credentials Form"
        className="w-full lg:w-[42%] xl:w-[40%] min-h-screen lg:min-h-0 lg:h-full bg-[#FAFAF8] lg:bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-8 xl:p-12 relative"
      >
        <div className="w-full max-w-md mx-auto flex flex-col justify-between h-full space-y-6 lg:space-y-0 my-auto">
          
          {/* Top Workspace Indicator Chip & Reset Button */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-stone-200 shrink-0">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-1 rounded-full text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Workspace:</span>
              <span className="font-bold text-[#3E6B2B]">{selectedWorkspace.name}</span>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-stone-500 hover:text-stone-900 hover:underline transition cursor-pointer"
            >
              Reset demo credentials
            </button>
          </div>

          {/* Centered Form Area */}
          <div className="my-auto py-2">
            
            {/* Greeting Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                Sign in to your account to continue into <strong className="text-stone-800">LiliSare</strong>.
              </p>
            </div>

            {/* STEP 1: CREDENTIALS FORM */}
            {step === 'credentials' && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Email address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 text-base sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#3E6B2B] focus:border-transparent transition bg-white shadow-2xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-password" className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => showToast(`Password reset link emailed to ${email}.`)}
                      className="text-xs font-semibold text-[#3E6B2B] hover:underline cursor-pointer"
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
                      className="w-full pl-4 pr-12 py-3 rounded-xl border border-stone-300 text-base sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#3E6B2B] focus:border-transparent transition bg-white shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-stone-500 hover:text-stone-800 text-xs font-bold px-1.5 py-0.5 rounded-md hover:bg-stone-100 transition cursor-pointer"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm text-stone-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-stone-300 text-[#3E6B2B] focus:ring-[#3E6B2B] accent-[#3E6B2B]"
                    />
                    <span>Keep me signed in</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#3E6B2B] hover:bg-[#335a23] text-white font-bold text-base sm:text-sm py-3.5 rounded-xl shadow-md hover:shadow-lg transition mt-2 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <span>Sign in</span>
                  <span className="text-base">→</span>
                </button>
              </form>
            )}

            {/* STEP 2: MULTI-FACTOR AUTHENTICATION (MFA) */}
            {step === 'mfa' && (
              <form onSubmit={handleVerifyMfa} className="space-y-4 animate-fade-in">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-900 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-xs">
                    🔒
                  </div>
                  <div>
                    <div className="font-bold text-sm text-emerald-950">Enter the 6-digit code</div>
                    <div className="text-emerald-800 mt-0.5 leading-relaxed">
                      Two-factor authentication code sent to your registered device.
                    </div>
                  </div>
                </div>

                {/* 6-digit boxes */}
                <div>
                  <div className="flex justify-between items-center gap-1.5 sm:gap-2 mb-2">
                    {mfaCode.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`mfa-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const val = e.target.value.slice(-1);
                          const next = [...mfaCode];
                          next[idx] = val;
                          setMfaCode(next);
                          if (val && idx < 5) {
                            const nextEl = document.getElementById(`mfa-${idx + 1}`);
                            nextEl?.focus();
                          }
                        }}
                        className="w-11 h-13 sm:w-13 sm:h-14 text-center text-xl font-bold rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#3E6B2B] focus:border-[#3E6B2B] bg-white shadow-2xs"
                      />
                    ))}
                  </div>
                  <div className="text-center text-xs text-stone-500 mt-1.5">
                    Demo pre-filled code: <span className="font-mono font-bold text-stone-800">482910</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    className="w-full bg-[#3E6B2B] hover:bg-[#335a23] text-white font-bold text-base sm:text-sm py-3 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Verify and enter workspace</span>
                    <span>→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('credentials')}
                    className="w-full text-stone-600 hover:text-stone-900 font-semibold text-xs py-1.5 text-center transition cursor-pointer"
                  >
                    ← Back to credentials
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: LOADING SIMULATION */}
            {step === 'loading' && (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-fade-in">
                <div className="w-10 h-10 border-4 border-emerald-200 border-t-[#3E6B2B] rounded-full animate-spin"></div>
                <div>
                  <div className="font-bold text-base text-stone-900">
                    Opening {selectedWorkspace.name}…
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Loading role permissions and compliance scope.
                  </p>
                </div>
              </div>
            )}

            {/* Request Access Link */}
            <div className="mt-6 pt-4 border-t border-stone-200 text-center">
              <span className="text-xs sm:text-sm text-stone-600">Don't have an account? </span>
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(true)}
                className="text-xs sm:text-sm font-bold text-[#3E6B2B] hover:underline cursor-pointer"
              >
                Request access
              </button>
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="text-center text-[11px] text-stone-400 leading-normal pt-2 shrink-0">
            Access is by invitation only. Sessions lock after 15 minutes of inactivity.
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* REQUEST ACCESS MODAL */}
      {/* ========================================================================= */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <div>
                <h3 className="font-bold text-lg text-stone-900">Request LiliSare Access</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Submit an access request to the LiliSare system administrator.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestAccessSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Full name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins, RN"
                  value={reqName}
                  onChange={(e) => setReqName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Work email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@lilisare.com"
                  value={reqEmail}
                  onChange={(e) => setReqEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Requested role & workspace *
                </label>
                <select
                  value={reqRole}
                  onChange={(e) => setReqRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
                >
                  {DEMO_WORKSPACES.map((w) => (
                    <option key={w.id} value={w.name}>
                      {w.name} ({w.category}) — {w.oneLine}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Note to agency administrator (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="State your department, caseload, or business line requirements..."
                  value={reqNote}
                  onChange={(e) => setReqNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#3E6B2B] hover:bg-[#335a23] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
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
