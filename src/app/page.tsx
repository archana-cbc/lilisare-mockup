'use client';

import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/shell/Sidebar';
import { Header } from '@/components/shell/Header';
import { Drawer } from '@/components/shell/Drawer';
import { Toast } from '@/components/shell/Toast';
import { Skel } from '@/components/ui';

import { LoginPage } from '@/components/pages/LoginPage';
import { CaregiverPortal, FamilyPortal, CaseManagerPortal, AccessDeniedPage } from '@/components/pages/Portals';

import { TodayPage } from '@/components/pages/TodayPage';
import { IntakePage } from '@/components/pages/IntakePage';
import { CaregiverIntakePage } from '@/components/pages/CaregiverIntakePage';
import { OnboardingPage } from '@/components/pages/OnboardingPage';
import { ClientsPage } from '@/components/pages/ClientsPage';
import { CaregiversPage } from '@/components/pages/CaregiversPage';
import { SchedulingPage } from '@/components/pages/SchedulingPage';
import { CompliancePage } from '@/components/pages/CompliancePage';
import { AuditPage } from '@/components/pages/AuditPage';
import { EmailsPage } from '@/components/pages/EmailsPage';
import { ScreeningPage } from '@/components/pages/ScreeningPage';
import { BillingPage } from '@/components/pages/BillingPage';
import { ProfitPage } from '@/components/pages/ProfitPage';
import { RulesPage } from '@/components/pages/RulesPage';
import { SystemsPage } from '@/components/pages/SystemsPage';
import { MigrationPage } from '@/components/pages/MigrationPage';
import { UsersPage } from '@/components/pages/UsersPage';
import { StubPage } from '@/components/pages/StubPage';
import { RoadmapPage } from '@/components/pages/RoadmapPage';
import { DEMO_WORKSPACES } from '@/data/mockData';

function DashboardContent() {
  const {
    page,
    isLoadingPage,
    isAuthenticated,
    currentWorkspace,
    switchWorkspace,
    logout,
    isWorkspacePickerOpen,
    setIsWorkspacePickerOpen,
  } = useApp();

  // If not authenticated or on the login page, render the Login Page as entry point
  if (!isAuthenticated || page === 'login') {
    return <LoginPage />;
  }

  const renderCurrentPage = () => {
    if (isLoadingPage) {
      return <Skel />;
    }

    // Access control check: If page is not in allowed pages, show friendly 403 page
    const isAllowed = currentWorkspace.allowedPages.includes(page);
    if (!isAllowed) {
      return <AccessDeniedPage attemptedPage={page} />;
    }

    switch (page) {
      case 'today':
        return <TodayPage />;
      case 'intake':
        return <IntakePage />;
      case 'cg-intake':
        return <CaregiverIntakePage />;
      case 'onboarding':
        return <OnboardingPage />;
      case 'clients':
        return <ClientsPage />;
      case 'caregivers':
        return <CaregiversPage />;
      case 'scheduling':
        return <SchedulingPage />;
      case 'compliance':
        return <CompliancePage />;
      case 'audit':
        return <AuditPage />;
      case 'emails':
        return <EmailsPage />;
      case 'screening':
        return <ScreeningPage />;
      case 'billing':
        return <BillingPage />;
      case 'profit':
        return <ProfitPage />;
      case 'rules':
        return <RulesPage />;
      case 'systems':
        return <SystemsPage />;
      case 'migration':
        return <MigrationPage />;
      case 'users':
        return <UsersPage />;
      case 'reports':
        return <StubPage type="reports" />;
      case 'settings':
        return <StubPage type="settings" />;
      case 'roadmap':
        return <RoadmapPage />;
      case 'caregiver-portal':
        return <CaregiverPortal />;
      case 'family-portal':
        return <FamilyPortal />;
      case 'casemanager-portal':
        return <CaseManagerPortal />;
      default:
        return <TodayPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg,#F7F7F4)] flex flex-col">
      {/* THIN DEMO BANNER ON EVERY SCREEN */}
      <div className="bg-[#1B381E] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between border-b border-white/10 shrink-0 z-30">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/80">Demo mode:</span>
          <span className="font-bold text-white">You are viewing the {currentWorkspace.name} workspace</span>
          <span className="bg-white/15 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-semibold hidden sm:inline border border-white/10">
            {currentWorkspace.category}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsWorkspacePickerOpen(true)}
            className="bg-white/15 hover:bg-white/25 text-white font-semibold px-2.5 py-1 rounded-lg transition text-xs border border-white/15"
          >
            Switch workspace
          </button>
          <button
            type="button"
            onClick={logout}
            className="text-white/70 hover:text-white transition text-xs"
          >
            Log out
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="p-4 lg:p-6 max-w-[1400px] w-full flex-1 mx-auto">
            {renderCurrentPage()}
          </main>
        </div>
      </div>

      {/* QUICK WORKSPACE SWITCHER MODAL */}
      {isWorkspacePickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="font-bold text-lg text-stone-900">Switch Demo Workspace</h2>
                <p className="text-xs text-stone-500">Instantly switch role view, permissions, and test credentials.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsWorkspacePickerOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="font-bold text-stone-500 uppercase tracking-wider text-[11px] mb-2">Staff Workspaces</div>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {DEMO_WORKSPACES.filter((w) => w.category === 'Staff').map((ws) => (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => switchWorkspace(ws.id)}
                      className={`text-left p-3 rounded-2xl border transition flex items-start gap-2.5 ${
                        currentWorkspace.id === ws.id
                          ? 'border-[#3E6B2B] bg-emerald-50/70 shadow-xs'
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-stone-100 font-bold text-xs flex items-center justify-center shrink-0">
                        {ws.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-stone-900 truncate flex items-center justify-between">
                          <span>{ws.name}</span>
                          {currentWorkspace.id === ws.id && (
                            <span className="text-[#3E6B2B] text-xs">✓ Active</span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate mt-0.5">{ws.oneLine}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100">
                <div className="font-bold text-stone-500 uppercase tracking-wider text-[11px] mb-2">External Portals</div>
                <div className="grid sm:grid-cols-3 gap-2.5">
                  {DEMO_WORKSPACES.filter((w) => w.category === 'External').map((ws) => (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => switchWorkspace(ws.id)}
                      className={`text-left p-3 rounded-2xl border transition flex flex-col justify-between ${
                        currentWorkspace.id === ws.id
                          ? 'border-[#3E6B2B] bg-emerald-50/70 shadow-xs'
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <div className="font-bold text-stone-900 truncate flex items-center justify-between mb-1">
                        <span>{ws.name}</span>
                        {currentWorkspace.id === ws.id && (
                          <span className="text-[#3E6B2B] text-xs">✓</span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-500 line-clamp-1">{ws.oneLine}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Drawer />
      <Toast />
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
