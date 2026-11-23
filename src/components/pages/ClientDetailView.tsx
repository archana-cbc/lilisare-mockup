'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  DetailedClient,
  CLIENTS_DETAILED,
  CareTeamMember,
  AuthorizationRecord,
  AdminNoteEntry,
  ComplianceDocument,
  IncidentRecord,
  ResponsibleParty,
} from '@/data/clientsData';

interface ClientDetailViewProps {
  clientId: string;
  onBack: () => void;
  onSelectClient?: (id: string) => void;
}

export const ClientDetailView: React.FC<ClientDetailViewProps> = ({
  clientId,
  onBack,
  onSelectClient,
}) => {
  const { showToast, deIdentify } = useApp();

  // Find active client from full dataset (default to Sophia Patel HH-1003 if not matched)
  const clientIndex = useMemo(() => {
    const idx = CLIENTS_DETAILED.findIndex(
      (c) => c.id === clientId || c.id === `HH-${clientId.replace('C-', '')}` || c.name.toLowerCase().includes(clientId.toLowerCase())
    );
    return idx !== -1 ? idx : 0;
  }, [clientId]);

  const [currentClient, setCurrentClient] = useState<DetailedClient>(CLIENTS_DETAILED[clientIndex]);

  // Keep state synchronized if prop changes
  React.useEffect(() => {
    const matched = CLIENTS_DETAILED.find(
      (c) => c.id === clientId || c.id === `HH-${clientId.replace('C-', '')}` || c.name.toLowerCase().includes(clientId.toLowerCase())
    );
    if (matched) {
      setCurrentClient(matched);
      setIsEditingCard({});
      setHasUnsavedChanges(false);
    }
  }, [clientId]);

  // Navigation arrows
  const prevClient = CLIENTS_DETAILED[(clientIndex - 1 + CLIENTS_DETAILED.length) % CLIENTS_DETAILED.length];
  const nextClient = CLIENTS_DETAILED[(clientIndex + 1) % CLIENTS_DETAILED.length];

  const handleSwitchClient = (id: string) => {
    if (onSelectClient) {
      onSelectClient(id);
    } else {
      const target = CLIENTS_DETAILED.find((c) => c.id === id);
      if (target) setCurrentClient(target);
    }
  };

  // Active tab state
  const ALL_TABS = [
    'Profile',
    'Household & Care Team',
    'Care Plan & ADLs',
    'Authorizations',
    'Schedule & Calendar',
    'Care Notes',
    'Responsible Parties',
    'Documents & Compliance',
    'Healthcare',
    'Incidents',
    'Attributes & Matching',
    'Billing',
    'Forms',
    'Timeline & Activity',
  ];

  const [activeTab, setActiveTab] = useState<string>('Profile');

  // Inline edit states per card
  const [isEditingCard, setIsEditingCard] = useState<Record<string, boolean>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Masking state for SSN / Medicaid ID
  const [isSsnRevealed, setIsSsnRevealed] = useState(false);
  const [isMedicaidRevealed, setIsMedicaidRevealed] = useState(false);

  // Editable header alert note
  const [isEditingAlertNote, setIsEditingAlertNote] = useState(false);
  const [alertNoteText, setAlertNoteText] = useState(currentClient.alertNote);

  // Modals state
  const [showScheduleRnModal, setShowScheduleRnModal] = useState(false);
  const [showAddCareTeamModal, setShowAddCareTeamModal] = useState(false);
  const [showAddAuthModal, setShowAddAuthModal] = useState(false);
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);
  const [showReportIncidentModal, setShowReportIncidentModal] = useState(false);
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);
  const [showVerifyAddressModal, setShowVerifyAddressModal] = useState(false);

  // New admin note form state
  const [newAdminNoteText, setNewAdminNoteText] = useState('');
  const [newAdminNoteType, setNewAdminNoteType] = useState<AdminNoteEntry['type']>('General');
  const [newAdminNotePinned, setNewAdminNotePinned] = useState(false);

  // Timeline filter
  const [timelineFilter, setTimelineFilter] = useState('All');

  // Document category filter
  const [docCategoryFilter, setDocCategoryFilter] = useState('All');

  const toggleCardEdit = (cardKey: string) => {
    setIsEditingCard((prev) => ({ ...prev, [cardKey]: !prev[cardKey] }));
  };

  const handleSaveAll = () => {
    showToast(`Changes saved for ${deIdentify(currentClient.name)} (${currentClient.id})`);
    setIsEditingCard({});
    setHasUnsavedChanges(false);
    setIsEditingAlertNote(false);
  };

  const handleDiscardAll = () => {
    setAlertNoteText(currentClient.alertNote);
    setIsEditingCard({});
    setHasUnsavedChanges(false);
    setIsEditingAlertNote(false);
    showToast('Unsaved changes discarded');
  };

  return (
    <div className="space-y-4 pb-16 animate-fadeIn">
      {/* ========================================================================= */}
      {/* 1. PERSISTENT HEADER (STICKY ON ALL TABS)                                 */}
      {/* ========================================================================= */}
      <div className="bg-white border border-stone-200 rounded-[12px] shadow-xs sticky top-[57px] z-20">
        {/* Top Control Strip */}
        <div className="px-4 lg:px-6 py-2.5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs bg-stone-50/70 rounded-t-[12px]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="font-semibold text-[var(--green-700)] hover:text-[var(--green-900)] flex items-center gap-1 transition"
            >
              <span>←</span>
              <span>All Clients</span>
            </button>
            <span className="text-stone-300">|</span>
            <span className="text-stone-500 font-medium">Household:</span>
            <span className="font-semibold text-stone-800 hover:text-[var(--green-700)] cursor-pointer">
              {currentClient.household}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Prev / Next Arrows */}
            <div className="flex items-center border border-stone-200 rounded-[6px] bg-white overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => handleSwitchClient(prevClient.id)}
                title={`Previous client: ${prevClient.name}`}
                className="px-2 py-1 hover:bg-stone-100 text-stone-600 transition"
              >
                ‹
              </button>
              <span className="px-2 py-1 text-[11px] font-semibold text-stone-400 border-x border-stone-100">
                {clientIndex + 1} of {CLIENTS_DETAILED.length}
              </span>
              <button
                type="button"
                onClick={() => handleSwitchClient(nextClient.id)}
                title={`Next client: ${nextClient.name}`}
                className="px-2 py-1 hover:bg-stone-100 text-stone-600 transition"
              >
                ›
              </button>
            </div>

            {/* Jump to client selector */}
            <select
              value={currentClient.id}
              onChange={(e) => handleSwitchClient(e.target.value)}
              className="h-[28px] px-2 text-[12px] bg-white border border-stone-200 rounded-[6px] text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-[var(--green-700)]"
            >
              {CLIENTS_DETAILED.map((c) => (
                <option key={c.id} value={c.id}>
                  {deIdentify(c.name)} ({c.id}) · {c.status}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowScheduleRnModal(true)}
              className="h-[28px] px-3 rounded-[6px] bg-stone-100 border border-stone-200 text-stone-700 font-semibold text-[11px] hover:bg-stone-200 transition"
            >
              Schedule RN
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              className={`h-[28px] px-3.5 rounded-[6px] font-semibold text-[11px] transition shadow-2xs ${
                hasUnsavedChanges
                  ? 'bg-[var(--green-700)] text-white hover:bg-[var(--green-900)]'
                  : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
              }`}
            >
              Save
            </button>
          </div>
        </div>

        {/* Main Client Info Bar */}
        <div className="p-4 lg:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            {/* Photo Avatar */}
            <div className="relative group shrink-0">
              <div className="w-13 h-13 rounded-full bg-emerald-100 text-emerald-900 border-2 border-white shadow-sm flex items-center justify-center font-bold text-lg select-none">
                {currentClient.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <button
                type="button"
                onClick={() => showToast('Photo upload dialog opened (demo)')}
                className="absolute inset-0 rounded-full bg-black/40 text-white text-[10px] opacity-0 group-hover:opacity-100 flex items-center justify-center font-semibold transition"
              >
                Upload
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[20px] font-bold text-stone-900 leading-tight">
                  {deIdentify(currentClient.name)}
                </h1>
                {currentClient.preferredName && (
                  <span className="text-[12px] text-stone-500 font-normal">
                    &ldquo;{currentClient.preferredName}&rdquo;
                  </span>
                )}
                <span className="font-mono text-[11px] font-bold text-stone-500 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded flex items-center gap-1">
                  <span>{currentClient.id}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(currentClient.id);
                      showToast(`Copied ${currentClient.id} to clipboard`);
                    }}
                    title="Copy client ID"
                    className="hover:text-stone-900"
                  >
                    📋
                  </button>
                </span>

                {/* Status Pill */}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                    currentClient.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : currentClient.status === 'Onboarding'
                      ? 'bg-sky-100 text-sky-800 border border-sky-200'
                      : currentClient.status === 'On Hold'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      currentClient.status === 'Active'
                        ? 'bg-emerald-600'
                        : currentClient.status === 'Onboarding'
                        ? 'bg-sky-600'
                        : currentClient.status === 'On Hold'
                        ? 'bg-amber-600'
                        : 'bg-stone-500'
                    }`}
                  />
                  <span>{currentClient.status}</span>
                </span>

                <span className="text-[12px] font-bold px-2 py-0.5 rounded bg-[#FAFBF9] border border-stone-200 text-stone-700">
                  {currentClient.program}
                </span>

                <span className="text-[11px] font-semibold text-stone-500 bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
                  {currentClient.careArrangement}
                </span>
              </div>

              {/* Sub-line: Address, Phone, Case Manager */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-stone-600 mt-1.5">
                <span className="flex items-center gap-1">
                  <span>📍</span>
                  <span>{currentClient.address}{currentClient.apt ? `, ${currentClient.apt}` : ''}, {currentClient.city}, {currentClient.state} {currentClient.zip}</span>
                  {currentClient.isAddressVerified && (
                    <span className="text-emerald-700 font-bold" title="USPS Verified Address">✓</span>
                  )}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span>📞</span>
                  <span>{currentClient.phone}</span>
                </span>
                <span>•</span>
                <span>
                  Admin: <strong>{currentClient.administrator}</strong>
                </span>
                <span>•</span>
                <span>
                  CM: <strong>{currentClient.caseManager}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics on Right */}
          <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
            <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-[8px] text-center min-w-[90px]">
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-[0.04em]">
                Authorized
              </span>
              <span className="text-[15px] font-bold text-stone-900 block leading-tight">
                {currentClient.authorizedHours}h/wk
              </span>
              <span className={`text-[10px] font-semibold ${currentClient.authStatus === 'Expiring' ? 'text-amber-700 font-bold' : 'text-stone-500'}`}>
                Exp: {currentClient.authExpiry}
              </span>
            </div>

            <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-[8px] text-center min-w-[90px]">
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-[0.04em]">
                Readiness
              </span>
              <span className="text-[15px] font-bold text-[var(--green-700)] block leading-tight">
                {currentClient.readinessScore}%
              </span>
              <span className="text-[10px] text-stone-500 font-medium">Medicaid Gate</span>
            </div>

            <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-[8px] text-center min-w-[90px]">
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-[0.04em]">
                Next RN Visit
              </span>
              <span className="text-[13px] font-bold text-stone-800 block leading-tight">
                {currentClient.nextRnVisit}
              </span>
              <span className="text-[10px] text-stone-500">Supervisory</span>
            </div>
          </div>
        </div>

        {/* Alert Note Banner (Editable) */}
        <div className="px-4 lg:px-6 py-2 bg-amber-50/60 border-t border-amber-100 flex items-center justify-between text-[12px] text-amber-900">
          <div className="flex items-center gap-2 flex-1 mr-2">
            <span className="text-sm">📌</span>
            <span className="font-bold">Alert Note:</span>
            {isEditingAlertNote ? (
              <input
                type="text"
                value={alertNoteText}
                onChange={(e) => {
                  setAlertNoteText(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="flex-1 h-[26px] px-2 bg-white border border-amber-300 rounded text-[12px] text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            ) : (
              <span className="font-medium text-stone-800 truncate">{alertNoteText}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              if (isEditingAlertNote) {
                setCurrentClient({ ...currentClient, alertNote: alertNoteText });
                setIsEditingAlertNote(false);
                showToast('Alert note updated');
              } else {
                setIsEditingAlertNote(true);
              }
            }}
            className="text-[11px] font-bold text-amber-900 hover:underline shrink-0 flex items-center gap-1"
          >
            <span>{isEditingAlertNote ? 'Done' : 'Edit note ✏️'}</span>
          </button>
        </div>

        {/* Small Attention Strip (If alert message exists) */}
        {currentClient.alertStripMessage && (
          <div className="px-4 lg:px-6 py-2 bg-rose-50/80 border-t border-rose-200 flex flex-wrap items-center justify-between gap-2 text-[12px] text-rose-950">
            <div className="flex items-center gap-2">
              <span className="text-rose-600 font-bold">⚠️</span>
              <span className="font-semibold">{currentClient.alertStripMessage}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('Authorizations')}
                className="underline font-bold text-rose-900 hover:text-rose-700"
              >
                Review Authorization →
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setActiveTab('Documents & Compliance')}
                className="underline font-bold text-rose-900 hover:text-rose-700"
              >
                View Documents →
              </button>
            </div>
          </div>
        )}

        {/* Horizontal Scrollable Tabs with "More" dropdown */}
        <div className="border-t border-stone-200 px-3 lg:px-6 flex items-center justify-between overflow-x-auto no-scrollbar bg-white rounded-b-[12px]">
          <div className="flex items-center gap-1 shrink-0 py-1">
            {ALL_TABS.slice(0, 10).map((tabName) => {
              const isActive = activeTab === tabName;
              return (
                <button
                  key={tabName}
                  type="button"
                  onClick={() => setActiveTab(tabName)}
                  className={`px-3 py-2 text-[13px] font-semibold rounded-[8px] whitespace-nowrap transition relative ${
                    isActive
                      ? 'text-[var(--green-700)] bg-[var(--green-100)]/70'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {tabName}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[var(--green-700)] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* "More" Dropdown for Remaining Tabs */}
          <div className="relative group shrink-0 py-1 ml-2">
            <select
              value={ALL_TABS.slice(10).includes(activeTab) ? activeTab : 'More'}
              onChange={(e) => {
                if (e.target.value !== 'More') setActiveTab(e.target.value);
              }}
              className={`h-[30px] px-2.5 text-[12px] font-semibold rounded-[8px] border transition ${
                ALL_TABS.slice(10).includes(activeTab)
                  ? 'border-[var(--green-700)] text-[var(--green-700)] bg-[var(--green-100)]/70'
                  : 'border-stone-200 text-stone-600 bg-white hover:bg-stone-50'
              }`}
            >
              <option value="More" disabled>
                More Tabs ({ALL_TABS.length - 10}) ▾
              </option>
              {ALL_TABS.slice(10).map((tabName) => (
                <option key={tabName} value={tabName}>
                  {tabName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Floating Save/Discard Bar when changes exist */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 bg-stone-900 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-4 text-xs font-medium animate-bounce-short">
          <span>You have unsaved edits in this client profile.</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDiscardAll}
              className="px-3 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-4 py-1 rounded-full bg-[var(--green-700)] hover:bg-[var(--green-900)] text-white font-bold"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB CONTENTS (14 FULL TABS)                                            */}
      {/* ========================================================================= */}

      {/* TAB 1: PROFILE */}
      {activeTab === 'Profile' && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Card 1: Personal Information */}
          <div className="bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-[15px] font-bold text-stone-900 flex items-center gap-2">
                <span>👤</span>
                <span>Personal Information</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  toggleCardEdit('personal');
                  setHasUnsavedChanges(true);
                }}
                className="text-[12px] font-semibold text-[var(--green-700)] hover:underline"
              >
                {isEditingCard['personal'] ? 'Done editing' : 'Edit ✏️'}
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3.5 text-[13px]">
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Title</span>
                {isEditingCard['personal'] ? (
                  <input
                    type="text"
                    defaultValue={currentClient.title || ''}
                    className="w-full h-8 px-2.5 border rounded text-xs"
                  />
                ) : (
                  <span className="font-semibold text-stone-800">{currentClient.title || 'None'}</span>
                )}
              </div>

              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Preferred Name</span>
                {isEditingCard['personal'] ? (
                  <input
                    type="text"
                    defaultValue={currentClient.preferredName || ''}
                    className="w-full h-8 px-2.5 border rounded text-xs"
                  />
                ) : (
                  <span className="font-semibold text-stone-800">{currentClient.preferredName || 'None'}</span>
                )}
              </div>

              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Full Legal Name</span>
                <span className="font-semibold text-stone-800">{deIdentify(currentClient.name)}</span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Gender & Pronouns</span>
                <span className="font-semibold text-stone-800">{currentClient.gender} ({currentClient.pronouns})</span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Date of Birth & Age</span>
                <span className="font-semibold text-stone-800">{currentClient.dob} ({currentClient.age} yrs old)</span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Languages</span>
                <span className="font-semibold text-stone-800">
                  {currentClient.primaryLanguage}
                  {currentClient.secondaryLanguage ? ` / ${currentClient.secondaryLanguage}` : ''}
                  {currentClient.interpreterNeeded && ' (Interpreter Needed)'}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Marital Status</span>
                <span className="font-semibold text-stone-800">{currentClient.maritalStatus}</span>
              </div>

              {/* Masked SSN */}
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Social Security Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-stone-800">
                    {isSsnRevealed ? currentClient.ssnFull : currentClient.ssnMasked}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSsnRevealed(!isSsnRevealed);
                      showToast(isSsnRevealed ? 'SSN masked' : 'Access logged: SSN revealed for 30 seconds');
                    }}
                    title="Toggle reveal sensitive SSN"
                    className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 underline"
                  >
                    {isSsnRevealed ? 'Hide' : 'Reveal 🛡️'}
                  </button>
                </div>
              </div>

              {/* Masked Medicaid ID */}
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">State Medicaid / Payer ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-stone-800">
                    {isMedicaidRevealed ? currentClient.medicaidIdFull : currentClient.medicaidIdMasked}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMedicaidRevealed(!isMedicaidRevealed);
                      showToast(isMedicaidRevealed ? 'Medicaid ID masked' : 'Access logged: Medicaid ID revealed');
                    }}
                    className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 underline"
                  >
                    {isMedicaidRevealed ? 'Hide' : 'Reveal 🛡️'}
                  </button>
                </div>
              </div>
            </div>

            {/* Minor Specific Fields (Automatically shown when age < 18) */}
            {currentClient.isMinor && (
              <div className="pt-3 border-t border-amber-200 bg-amber-50/50 p-3.5 rounded-[8px] space-y-2 text-[12px]">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <span>👶</span>
                  <span>Minor / Pediatric Fields (Under 18)</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-stone-800">
                  <div>
                    <span className="text-stone-500 block">Attending School:</span>
                    <span className="font-semibold">{currentClient.schoolName || 'Homeschooled'}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Legal Custody:</span>
                    <span className="font-semibold">{currentClient.guardianCustody || 'Parents'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-stone-500 block">Pediatric Care Consent:</span>
                    <span className="font-semibold text-emerald-800">
                      {currentClient.pediatricConsentSigned ? '✓ Signed & Verified on File' : '⚠️ Pending Parent Signature'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: LiliSare / Operational Information */}
          <div className="bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-[15px] font-bold text-stone-900 flex items-center gap-2">
                <span>🌿</span>
                <span>LiliSare Operational Information</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  toggleCardEdit('lilisare');
                  setHasUnsavedChanges(true);
                }}
                className="text-[12px] font-semibold text-[var(--green-700)] hover:underline"
              >
                {isEditingCard['lilisare'] ? 'Done editing' : 'Edit ✏️'}
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3.5 text-[13px]">
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Status & Effective Dates</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900">{currentClient.status}</span>
                  <button
                    type="button"
                    onClick={() => showToast('Effective end date modal opened (demo)')}
                    className="text-[11px] font-semibold text-[var(--green-700)] underline"
                  >
                    Set end date
                  </button>
                </div>
                <span className="text-[11px] text-stone-500">Started: {currentClient.startDate}</span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Care Readiness Score</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-24 h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${currentClient.readinessScore}%` }}
                      className="h-full bg-[var(--green-700)] rounded-full"
                    />
                  </div>
                  <span className="font-bold text-[var(--green-700)]">{currentClient.readinessScore}%</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Administrator</span>
                <span className="font-semibold text-stone-800">{currentClient.administrator}</span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Operating Region</span>
                <span className="font-semibold text-stone-800">{currentClient.region}</span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Program / Payer</span>
                <span className="font-semibold text-stone-800">{currentClient.program}</span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Care Arrangement</span>
                <span className="font-semibold text-stone-800">{currentClient.careArrangement}</span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Preferred Caregiver(s)</span>
                <span className="font-semibold text-stone-800">{currentClient.preferredCaregiver}</span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Referred By</span>
                <span className="font-semibold text-stone-800">{currentClient.referredBy}</span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Invoicing ID</span>
                <span className="font-mono text-xs text-stone-700">{currentClient.invoicingId}</span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">EVV Clock Alerts</span>
                <span className="font-semibold text-stone-800">
                  {currentClient.disableClockAlerts ? 'Disabled (Bypass)' : 'Enabled (Real-time)'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Residential Address */}
          <div className="bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-[15px] font-bold text-stone-900 flex items-center gap-2">
                <span>🏠</span>
                <span>Residential Address & Access</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowVerifyAddressModal(true)}
                  className="text-[11px] font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-[6px] hover:bg-emerald-100"
                >
                  Verify Address ✓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toggleCardEdit('address');
                    setHasUnsavedChanges(true);
                  }}
                  className="text-[12px] font-semibold text-[var(--green-700)] hover:underline"
                >
                  {isEditingCard['address'] ? 'Done' : 'Edit ✏️'}
                </button>
              </div>
            </div>

            <div className="space-y-3 text-[13px]">
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Street Address</span>
                <span className="font-semibold text-stone-800 text-[14px]">
                  {currentClient.address}{currentClient.apt ? `, ${currentClient.apt}` : ''}
                </span>
                <span className="text-stone-500 block">
                  {currentClient.city}, {currentClient.state} {currentClient.zip}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                <div>
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Gate / Buzzer Code</span>
                  <span className="font-mono font-bold text-stone-800">{currentClient.gateCode}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Key & Lockbox Code</span>
                  <span className="font-semibold text-stone-800">{currentClient.accessNotes}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Parking & Arrival Instructions</span>
                <p className="text-stone-700">{currentClient.parkingInstructions}</p>
              </div>
            </div>
          </div>

          {/* Card 4: Billing Address & Contact Preferences */}
          <div className="bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-[15px] font-bold text-stone-900 flex items-center gap-2">
                <span>💳</span>
                <span>Billing Address & Preferences</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  toggleCardEdit('billing');
                  setHasUnsavedChanges(true);
                }}
                className="text-[12px] font-semibold text-[var(--green-700)] hover:underline"
              >
                {isEditingCard['billing'] ? 'Done' : 'Edit ✏️'}
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
                <input
                  type="checkbox"
                  checked={currentClient.billingSameAsResidential}
                  onChange={(e) => {
                    setCurrentClient({ ...currentClient, billingSameAsResidential: e.target.checked });
                    setHasUnsavedChanges(true);
                  }}
                  className="rounded text-[var(--green-700)] focus:ring-[var(--green-700)]"
                />
                <span>Same as residential address</span>
              </label>

              {!currentClient.billingSameAsResidential && (
                <div>
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Payer Billing Destination</span>
                  <span className="font-semibold text-stone-800 block">{currentClient.billingAddress}</span>
                </div>
              )}

              <div className="pt-3 border-t border-stone-100 grid sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Preferred Contact Method</span>
                  <span className="font-semibold text-stone-800">{currentClient.contactPref}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Best Time to Call</span>
                  <span className="font-semibold text-stone-800">{currentClient.bestTimeToCall}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Primary Phone</span>
                  <span className="font-semibold text-stone-800">{currentClient.phone}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.04em] block mb-0.5">Email Address</span>
                  <span className="font-semibold text-stone-800">{currentClient.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HOUSEHOLD & CARE TEAM */}
      {activeTab === 'Household & Care Team' && (
        <div className="space-y-5">
          {/* Household Card */}
          <div className="bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-[11px] font-bold text-[var(--green-700)] uppercase tracking-[0.04em]">Household Unit Hub</span>
                <h3 className="text-[16px] font-bold text-stone-900 mt-0.5 flex items-center gap-2">
                  <span>🏡</span>
                  <span>{currentClient.household}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => showToast(`Opening Household Hub for ${currentClient.household}`)}
                className="h-[32px] px-3.5 bg-stone-100 border border-stone-200 rounded-[8px] text-[12px] font-semibold text-stone-700 hover:bg-stone-200"
              >
                View Household Hub →
              </button>
            </div>

            <p className="text-[13px] text-stone-600">
              Household members share common residence details, contact preferences, and family caregivers across LiliSphere modules.
            </p>

            <div className="divide-y divide-stone-100 border border-stone-100 rounded-[8px] overflow-hidden text-[13px]">
              <div className="p-3 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase grid grid-cols-4">
                <span>Member Name</span>
                <span>Role in Household</span>
                <span>Phone</span>
                <span>Portal Status</span>
              </div>
              <div className="p-3 grid grid-cols-4 items-center">
                <span className="font-bold text-stone-900">{deIdentify(currentClient.name)}</span>
                <span className="text-stone-700">Client / Care Recipient</span>
                <span className="text-stone-600">{currentClient.phone}</span>
                <span className="text-emerald-700 font-semibold">Active Client</span>
              </div>
              {currentClient.responsibleParties.map((rp) => (
                <div key={rp.id} className="p-3 grid grid-cols-4 items-center">
                  <span className="font-bold text-stone-900">{deIdentify(rp.name)}</span>
                  <span className="text-stone-700">{rp.relationship} ({rp.legalRole})</span>
                  <span className="text-stone-600">{rp.phone}</span>
                  <span className="text-emerald-700 font-semibold">
                    {rp.hasPortalAccess ? 'Family Portal Active ✓' : 'Invite Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Care Team Card */}
          <div className="bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-[16px] font-bold text-stone-900 flex items-center gap-2">
                  <span>👥</span>
                  <span>Assigned Care Team Members</span>
                </h3>
                <p className="text-[12px] text-stone-500 mt-0.5">
                  Authorized direct care workers, family attendants, clinical supervisors, and state case managers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCareTeamModal(true)}
                className="h-[34px] px-3.5 bg-[var(--green-700)] text-white text-[12px] font-semibold rounded-[8px] hover:bg-[var(--green-900)] shadow-2xs"
              >
                + Add Care Team Member
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] border-collapse">
                <thead className="bg-stone-50 text-[11px] font-bold uppercase tracking-[0.04em] text-stone-500 border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Care Team Member</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Pay Type</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3">Assigned Hrs</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {currentClient.careTeam.map((m) => (
                    <tr key={m.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-stone-900">{deIdentify(m.name)}</div>
                        <div className="text-[11px] text-stone-400">{m.agency}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded font-semibold text-[11px] bg-stone-100 text-stone-800 border border-stone-200">
                          {m.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-stone-600">{m.payType}</td>
                      <td className="py-3 px-3 text-stone-600">
                        <div>{m.phone}</div>
                        <div className="text-[11px] text-stone-400">{m.email}</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-stone-800">
                        {m.hoursPerWeek ? `${m.hoursPerWeek} hrs/wk` : m.nextVisit ? `Visit: ${m.nextVisit}` : 'Oversight'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => showToast(`Viewing personnel file for ${m.name}`)}
                          className="text-[12px] font-semibold text-[var(--green-700)] hover:underline"
                        >
                          View File →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CARE PLAN & ADLs */}
      {activeTab === 'Care Plan & ADLs' && (
        <div className="space-y-5">
          {/* Summary Strip */}
          <div className="bg-white border border-stone-200 rounded-[12px] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-[13px]">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span className="text-[11px] text-stone-400 block font-semibold uppercase">Program</span>
                <span className="font-bold text-stone-900">{currentClient.program}</span>
              </div>
              <div className="h-7 w-px bg-stone-200" />
              <div>
                <span className="text-[11px] text-stone-400 block font-semibold uppercase">Weekly Hours</span>
                <span className="font-bold text-stone-900">{currentClient.authorizedHours} hrs/week</span>
              </div>
              <div className="h-7 w-px bg-stone-200" />
              <div>
                <span className="text-[11px] text-stone-400 block font-semibold uppercase">Plan Revision</span>
                <span className="font-bold text-emerald-800">{currentClient.carePlanVersion} (Active)</span>
              </div>
              <div className="h-7 w-px bg-stone-200" />
              <div>
                <span className="text-[11px] text-stone-400 block font-semibold uppercase">Annual Review Due</span>
                <span className="font-bold text-stone-900">{currentClient.carePlanReviewDate}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => showToast('Editing Care Plan goals & tasks')}
              className="h-[32px] px-3.5 bg-stone-100 border border-stone-200 rounded-[8px] text-[12px] font-semibold text-stone-700 hover:bg-stone-200"
            >
              Update Care Plan ✏️
            </button>
          </div>

          {/* Goals Card */}
          <div className="bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs space-y-3">
            <h3 className="text-[15px] font-bold text-stone-900 flex items-center gap-2">
              <span>🎯</span>
              <span>Person-Centered Care Plan Goals</span>
            </h3>
            <div className="space-y-2">
              {currentClient.carePlanGoals.map((goal, idx) => (
                <div key={idx} className="p-3 bg-stone-50 rounded-[8px] border border-stone-100 flex items-start gap-2.5 text-[13px] text-stone-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{goal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ADL Checklist Table */}
          <div className="bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-[15px] font-bold text-stone-900 flex items-center gap-2">
                  <span>📋</span>
                  <span>Activities of Daily Living (ADL) Checklist</span>
                </h3>
                <p className="text-[12px] text-stone-500 mt-0.5">
                  Detailed task instructions, frequency, and level of assistance required per state assessment.
                </p>
              </div>
              <span className="text-[12px] text-stone-500 font-medium">
                {currentClient.adlList.length} tasks scheduled
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] border-collapse">
                <thead className="bg-stone-50 text-[11px] font-bold uppercase tracking-[0.04em] text-stone-500 border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">ADL Task</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Assistance Level</th>
                    <th className="py-2.5 px-3">Frequency</th>
                    <th className="py-2.5 px-3 max-w-xs">Detailed Instructions</th>
                    <th className="py-2.5 px-3 text-center">Sign-Off</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {currentClient.adlList.map((adl) => (
                    <tr key={adl.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-3 px-3 font-bold text-stone-900">{adl.name}</td>
                      <td className="py-3 px-3 text-stone-500">{adl.category}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            adl.level === 'Hands-on'
                              ? 'bg-amber-100 text-amber-900'
                              : adl.level === 'Total Care'
                              ? 'bg-rose-100 text-rose-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {adl.level}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-stone-700 font-medium">{adl.frequency}</td>
                      <td className="py-3 px-3 text-stone-600 max-w-sm text-[12px] leading-relaxed">
                        {adl.instructions}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {adl.signOffRequired ? (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Required ✓
                          </span>
                        ) : (
                          <span className="text-[11px] text-stone-400">Optional</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUTHORIZATIONS */}
      {activeTab === 'Authorizations' && (
        <div className="space-y-5">
          {/* Top Banner & Add Button */}
          <div className="bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-[16px] font-bold text-stone-900 flex items-center gap-2">
                <span>🛡️</span>
                <span>Prior Authorizations & State Allotments</span>
              </h3>
              <p className="text-[12px] text-stone-500 mt-0.5">
                Active Medicaid waiver service authorizations, unit quotas, and state case management contacts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddAuthModal(true)}
              className="h-[34px] px-4 bg-[var(--green-700)] text-white text-[12px] font-semibold rounded-[8px] hover:bg-[var(--green-900)] shadow-2xs"
            >
              + Add Authorization
            </button>
          </div>

          {/* Authorizations Table */}
          <div className="bg-white border border-stone-200 rounded-[12px] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] border-collapse">
                <thead className="bg-stone-50 text-[11px] font-bold uppercase tracking-[0.04em] text-stone-500 border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Auth Number</th>
                    <th className="py-3 px-4">Payer & Waiver</th>
                    <th className="py-3 px-4">Service Code</th>
                    <th className="py-3 px-4">Approved Units</th>
                    <th className="py-3 px-4">Used / Remaining</th>
                    <th className="py-3 px-4">Valid Period</th>
                    <th className="py-3 px-4">Case Manager</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {currentClient.authorizations.map((auth) => {
                    const pct = Math.round((auth.unitsUsed / auth.unitsApproved) * 100);
                    return (
                      <tr key={auth.id} className="hover:bg-stone-50/60 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-stone-900">{auth.authNumber}</td>
                        <td className="py-3.5 px-4 text-stone-700">
                          <div className="font-semibold">{auth.payer}</div>
                          <div className="text-[11px] text-stone-400">{auth.waiver}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-stone-800">{auth.serviceCode}</span>
                          <div className="text-[11px] text-stone-400 truncate max-w-xs">{auth.serviceDesc}</div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-stone-900">
                          {auth.unitsApproved.toLocaleString()} units
                          <span className="text-[11px] text-stone-400 block font-normal">
                            ({(auth.unitsApproved / 4).toFixed(0)} hrs)
                          </span>
                        </td>
                        <td className="py-3.5 px-4 min-w-[140px]">
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-semibold text-stone-700">{auth.unitsUsed.toLocaleString()} used</span>
                            <span className="text-stone-400">{auth.unitsRemaining.toLocaleString()} left</span>
                          </div>
                          <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className={`h-full rounded-full ${pct > 85 ? 'bg-amber-500' : 'bg-[var(--green-700)]'}`}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 text-[12px]">
                          <div>{auth.startDate} – {auth.expiryDate}</div>
                          <div className={`text-[11px] font-semibold ${auth.daysUntilExpiry <= 30 ? 'text-amber-700' : 'text-stone-400'}`}>
                            {auth.daysUntilExpiry} days remaining
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-stone-700 text-[12px]">
                          <div className="font-semibold">{auth.caseManagerName}</div>
                          <div className="text-[11px] text-stone-400">{auth.caseManagerPhone}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              auth.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : auth.status === 'Expiring'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-rose-100 text-rose-900'
                            }`}
                          >
                            {auth.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SCHEDULE & CALENDAR */}
      {activeTab === 'Schedule & Calendar' && (
        <div className="grid lg:grid-cols-12 gap-5">
          {/* Mini Calendar (4 Cols) */}
          <div className="lg:col-span-4 bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-[14px] text-stone-900">November 2026</h3>
              <div className="flex items-center gap-1 text-xs">
                <button type="button" className="px-2 py-0.5 hover:bg-stone-100 rounded">‹</button>
                <button type="button" className="px-2 py-0.5 hover:bg-stone-100 rounded">›</button>
              </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <span key={d} className="font-semibold text-stone-400 text-[10px] py-1">{d}</span>
              ))}
              {[...Array(30)].map((_, i) => {
                const day = i + 1;
                const isVisitDay = [20, 22, 23, 24, 25].includes(day);
                const isToday = day === 23;
                return (
                  <div
                    key={day}
                    className={`py-1.5 rounded-[6px] font-medium text-xs ${
                      isToday
                        ? 'bg-[var(--green-700)] text-white font-bold'
                        : isVisitDay
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--green-700)]" /> Today (Active)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-200" /> Scheduled Shift
              </span>
            </div>
          </div>

          {/* Visits List (8 Cols) */}
          <div className="lg:col-span-8 bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-[15px] font-bold text-stone-900 flex items-center gap-2">
                  <span>📅</span>
                  <span>Upcoming & Recent Shifts</span>
                </h3>
                <p className="text-[12px] text-stone-500 mt-0.5">
                  Electronic Visit Verification (EVV) timestamps, tasks, and caregiver check-ins.
                </p>
              </div>
              <button
                type="button"
                onClick={() => showToast('Opening Shift Scheduling Modal')}
                className="h-[32px] px-3 bg-[var(--green-700)] text-white text-[12px] font-semibold rounded-[8px] hover:bg-[var(--green-900)] shadow-2xs"
              >
                + Schedule Shift
              </button>
            </div>

            <div className="space-y-2.5">
              {currentClient.upcomingVisits.map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 border border-stone-200 rounded-[10px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-stone-50/50 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[14px] text-stone-900">{v.date}</span>
                      <span className="text-[12px] text-stone-500 font-medium">({v.time})</span>
                      <span
                        className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                          v.status === 'In Progress'
                            ? 'bg-amber-100 text-amber-900 animate-pulse'
                            : v.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {v.status}
                      </span>
                    </div>
                    <div className="text-[12px] text-stone-600 mt-1">
                      Caregiver: <strong>{deIdentify(v.caregiver)}</strong> · Tasks: {v.tasks.join(', ')}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block">
                      {v.evvStatus}
                    </span>
                    <button
                      type="button"
                      onClick={() => showToast(`Viewing shift details for ${v.date}`)}
                      className="text-[11px] text-[var(--green-700)] font-semibold hover:underline mt-1 block"
                    >
                      Shift Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CARE NOTES & NOTES */}
      {activeTab === 'Care Notes' && (
        <div className="grid lg:grid-cols-12 gap-5">
          {/* Left: Caregiver Visit Notes (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-[15px] font-bold text-stone-900 flex items-center gap-2">
                  <span>📝</span>
                  <span>Caregiver Shift Visit Notes</span>
                </h3>
                <p className="text-[12px] text-stone-500 mt-0.5">Submitted from mobile app during EVV clock-out.</p>
              </div>
              <span className="text-[12px] text-stone-400 font-medium">{currentClient.careNotes.length} notes</span>
            </div>

            <div className="space-y-3">
              {currentClient.careNotes.map((cn) => (
                <div key={cn.id} className="p-4 bg-[#FAFBF9] border border-stone-200 rounded-[10px] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[13px] text-stone-900 block">{cn.date}</span>
                      <span className="text-[11px] text-stone-500">{cn.time} · {cn.caregiver}</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {cn.status} ✓
                    </span>
                  </div>
                  <div className="flex gap-1 flex-wrap pt-1">
                    {cn.tasks.map((t) => (
                      <span key={t} className="text-[10px] font-semibold bg-white border border-stone-200 px-1.5 py-0.2 rounded text-stone-600">
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="text-[13px] leading-[1.6] text-stone-800 pt-1 border-t border-stone-100">
                    &ldquo;{cn.note}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Internal Admin Notes & Composer (5 Cols) */}
          <div className="lg:col-span-5 bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs space-y-4">
            <div className="pb-3 border-b border-stone-100">
              <h3 className="text-[15px] font-bold text-stone-900 flex items-center gap-2">
                <span>🔒</span>
                <span>Internal Staff & Admin Notes</span>
              </h3>
              <p className="text-[12px] text-stone-500 mt-0.5">Visible to agency coordinators, nurses, and admins.</p>
            </div>

            {/* Note Composer */}
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-[10px] space-y-2.5">
              <div className="flex items-center justify-between">
                <select
                  value={newAdminNoteType}
                  onChange={(e) => setNewAdminNoteType(e.target.value as any)}
                  className="h-7 px-2 bg-white border border-stone-200 rounded text-xs font-semibold"
                >
                  <option value="General">General Note</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="Clinical">Clinical Review</option>
                  <option value="Care Coordination">Care Coordination</option>
                  <option value="Family Update">Family Update</option>
                </select>

                <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={newAdminNotePinned}
                    onChange={(e) => setNewAdminNotePinned(e.target.checked)}
                    className="rounded text-[var(--green-700)] focus:ring-[var(--green-700)]"
                  />
                  <span>Pin to top</span>
                </label>
              </div>

              <textarea
                rows={3}
                value={newAdminNoteText}
                onChange={(e) => setNewAdminNoteText(e.target.value)}
                placeholder="Log internal note, phone call summary, or coordination update…"
                className="w-full p-2.5 bg-white border border-stone-200 rounded-[8px] text-[13px] placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[var(--green-700)]"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!newAdminNoteText.trim()) return;
                    const newEntry: AdminNoteEntry = {
                      id: `an-${Date.now()}`,
                      date: 'Just now',
                      author: 'Maya R. (You)',
                      type: newAdminNoteType,
                      isPinned: newAdminNotePinned,
                      note: newAdminNoteText,
                    };
                    setCurrentClient({
                      ...currentClient,
                      adminNotes: [newEntry, ...currentClient.adminNotes],
                    });
                    setNewAdminNoteText('');
                    showToast('Admin note logged successfully');
                  }}
                  className="h-[30px] px-3.5 bg-[var(--green-700)] text-white text-[12px] font-semibold rounded-[6px] hover:bg-[var(--green-900)] shadow-2xs"
                >
                  Post Note
                </button>
              </div>
            </div>

            {/* Admin Notes List */}
            <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
              {currentClient.adminNotes.map((an) => (
                <div
                  key={an.id}
                  className={`p-3 rounded-[8px] border text-[12px] space-y-1.5 ${
                    an.isPinned
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-white border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 flex items-center gap-1.5">
                      {an.isPinned && <span>📌</span>}
                      <span>{an.author}</span>
                    </span>
                    <span className="text-stone-400 text-[11px]">{an.date}</span>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.04em] text-stone-500">
                    {an.type}
                  </div>
                  <p className="text-stone-800 leading-relaxed">{an.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: RESPONSIBLE PARTIES */}
      {activeTab === 'Responsible Parties' && (
        <div className="space-y-5">
          <div className="bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-[16px] font-bold text-stone-900 flex items-center gap-2">
                <span>👨‍👩‍👧</span>
                <span>Responsible Parties & Family Contacts</span>
              </h3>
              <p className="text-[12px] text-stone-500 mt-0.5">
                Designated guardians, legal representatives, and emergency contacts in order of priority.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddPartyModal(true)}
              className="h-[34px] px-4 bg-[var(--green-700)] text-white text-[12px] font-semibold rounded-[8px] hover:bg-[var(--green-900)] shadow-2xs"
            >
              + Add Responsible Party
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {currentClient.responsibleParties.map((rp) => (
              <div key={rp.id} className="bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs space-y-3.5">
                <div className="flex items-start justify-between pb-2 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.04em] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Party #{rp.order} {rp.isEmergency ? '· Emergency Contact' : ''}
                    </span>
                    <h4 className="text-[16px] font-bold text-stone-900 mt-1">{deIdentify(rp.name)}</h4>
                    <span className="text-[12px] text-stone-500">{rp.relationship} · {rp.legalRole}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast(`Editing party #${rp.order}`)}
                    className="text-[11px] font-semibold text-[var(--green-700)] hover:underline"
                  >
                    Edit ✏️
                  </button>
                </div>

                <div className="space-y-2 text-[13px] text-stone-700">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Primary Phone:</span>
                    <span className="font-semibold">{rp.phone}</span>
                  </div>
                  {rp.altPhone && (
                    <div className="flex justify-between">
                      <span className="text-stone-400">Alt Phone:</span>
                      <span className="font-semibold">{rp.altPhone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-stone-400">Email:</span>
                    <span className="font-semibold">{rp.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Preferred Channel:</span>
                    <span className="font-semibold">{rp.preferredContact}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[12px]">
                  <span className="font-semibold text-stone-800">Family Portal Access</span>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-emerald-800">
                    <input
                      type="checkbox"
                      checked={rp.hasPortalAccess}
                      onChange={(e) => {
                        const updated = currentClient.responsibleParties.map((p) =>
                          p.id === rp.id ? { ...p, hasPortalAccess: e.target.checked } : p
                        );
                        setCurrentClient({ ...currentClient, responsibleParties: updated });
                        showToast(`Portal access ${e.target.checked ? 'enabled' : 'disabled'} for ${rp.name}`);
                      }}
                      className="rounded text-[var(--green-700)] focus:ring-[var(--green-700)]"
                    />
                    <span>{rp.hasPortalAccess ? 'Enabled' : 'Disabled'}</span>
                  </label>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-[8px] text-[11px] text-stone-600">
                  <strong>Notification Rules:</strong> {rp.notificationPrefs}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: DOCUMENTS & COMPLIANCE */}
      {activeTab === 'Documents & Compliance' && (
        <div className="space-y-5">
          {/* Progress Header */}
          <div className="bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-[16px] font-bold text-stone-900 flex items-center gap-2">
                <span>📁</span>
                <span>Compliance Document Packet</span>
              </h3>
              <p className="text-[12px] text-stone-500 mt-0.5">
                Mandatory state Medicaid compliance items, physician orders, and signed client consents.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[12px] font-bold text-[var(--green-700)] block">88% Verified</span>
                <span className="text-[11px] text-stone-400">7 of 8 items active</span>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadDocModal(true)}
                className="h-[34px] px-4 bg-[var(--green-700)] text-white text-[12px] font-semibold rounded-[8px] hover:bg-[var(--green-900)] shadow-2xs"
              >
                + Upload Document
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 border-b border-stone-200 pb-1 text-xs overflow-x-auto">
            {['All', 'Consent', 'Assessment', 'Medical Order', 'Authorization', 'ID'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setDocCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-[6px] font-semibold whitespace-nowrap transition ${
                  docCategoryFilter === cat
                    ? 'bg-[var(--green-700)] text-white'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Documents Table */}
          <div className="bg-white border border-stone-200 rounded-[12px] shadow-xs overflow-hidden">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead className="bg-stone-50 text-[11px] font-bold uppercase tracking-[0.04em] text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Reviewer</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {currentClient.documents
                  .filter((d) => docCategoryFilter === 'All' || d.category === docCategoryFilter)
                  .map((doc) => (
                    <tr key={doc.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900 flex items-center gap-1.5">
                          <span>📄</span>
                          <span>{doc.name}</span>
                        </div>
                        <span className="text-[11px] text-stone-400 ml-5">Size: {doc.fileSize}</span>
                      </td>
                      <td className="py-3 px-4 text-stone-600 font-medium">{doc.category}</td>
                      <td className="py-3 px-4 text-stone-600">{doc.uploadDate}</td>
                      <td className="py-3 px-4 text-stone-600">{doc.expiryDate}</td>
                      <td className="py-3 px-4 text-stone-600">{doc.reviewer}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            doc.status === 'Verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : doc.status === 'Review needed'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => showToast(`Viewing document: ${doc.name}`)}
                          className="text-[12px] font-semibold text-[var(--green-700)] hover:underline mr-2"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast(`Replacing ${doc.name}`)}
                          className="text-[12px] font-semibold text-stone-500 hover:underline"
                        >
                          Replace
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 9: HEALTHCARE */}
      {activeTab === 'Healthcare' && (
        <div className="grid md:grid-cols-2 gap-5">
          {/* Diagnoses Card */}
          <div className="bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs space-y-3">
            <h3 className="text-[15px] font-bold text-stone-900 flex items-center gap-2">
              <span>🩺</span>
              <span>Primary Diagnoses (ICD-10)</span>
            </h3>
            <div className="divide-y divide-stone-100">
              {currentClient.diagnoses.map((dx) => (
                <div key={dx.code} className="py-2.5 flex items-center justify-between text-[13px]">
                  <span className="font-semibold text-stone-800">{dx.name}</span>
                  <span className="font-mono text-xs font-bold bg-stone-100 border border-stone-200 px-2 py-0.5 rounded text-stone-700">
                    {dx.code}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Allergies Card */}
          <div className="bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs space-y-3">
            <h3 className="text-[15px] font-bold text-stone-900 flex items-center gap-2">
              <span>⚠️</span>
              <span>Allergies & Adverse Reactions</span>
            </h3>
            {currentClient.allergies.length > 0 ? (
              <div className="space-y-2">
                {currentClient.allergies.map((al, idx) => (
                  <div key={idx} className="p-2.5 rounded-[8px] bg-rose-50/60 border border-rose-200 flex items-center justify-between text-[13px]">
                    <div>
                      <span className="font-bold text-rose-950">{al.name}</span>
                      <span className="text-rose-800 text-[12px] block">{al.reaction}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-200 text-rose-900 rounded font-bold text-[11px]">
                      {al.severity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic">No known drug or environmental allergies on file.</p>
            )}
          </div>

          {/* Medications List */}
          <div className="md:col-span-2 bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-[15px] font-bold text-stone-900 flex items-center gap-2">
                <span>💊</span>
                <span>Active Medication Administration Record (MAR)</span>
              </h3>
              <span className="text-xs text-stone-500">{currentClient.medications.length} active prescriptions</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] border-collapse">
                <thead className="bg-stone-50 text-[11px] font-bold uppercase tracking-[0.04em] text-stone-500 border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Medication Name</th>
                    <th className="py-2.5 px-3">Dose & Route</th>
                    <th className="py-2.5 px-3">Frequency</th>
                    <th className="py-2.5 px-3">Indication</th>
                    <th className="py-2.5 px-3">Prescriber</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {currentClient.medications.map((m) => (
                    <tr key={m.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-2.5 px-3 font-bold text-stone-900">{m.name}</td>
                      <td className="py-2.5 px-3 text-stone-700">{m.dose} ({m.route})</td>
                      <td className="py-2.5 px-3 text-stone-700 font-medium">{m.frequency}</td>
                      <td className="py-2.5 px-3 text-stone-600">{m.indication}</td>
                      <td className="py-2.5 px-3 text-stone-500">{m.prescriber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Providers & Directives */}
          <div className="md:col-span-2 bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs grid sm:grid-cols-3 gap-4 text-[13px]">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase text-stone-400">Primary Physician</span>
              <div className="font-bold text-stone-900">{currentClient.primaryDoctor.name}</div>
              <div className="text-stone-500 text-xs">{currentClient.primaryDoctor.clinic}</div>
              <div className="text-stone-600 text-xs">{currentClient.primaryDoctor.phone}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase text-stone-400">Preferred Pharmacy</span>
              <div className="font-bold text-stone-900">{currentClient.preferredPharmacy.name}</div>
              <div className="text-stone-500 text-xs">{currentClient.preferredPharmacy.address}</div>
              <div className="text-stone-600 text-xs">{currentClient.preferredPharmacy.phone}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase text-stone-400">Advance Directives</span>
              <div className="font-bold text-stone-900">
                {currentClient.dnrOnFile ? '✓ DNR on File (POLST Form)' : 'Full Code'}
              </div>
              <div className="text-stone-500 text-xs">Hospital: {currentClient.hospitalPreference}</div>
              <div className="text-emerald-700 font-medium text-xs">{currentClient.vitalsSummary}</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: INCIDENTS */}
      {activeTab === 'Incidents' && (
        <div className="space-y-5">
          <div className="bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-[16px] font-bold text-stone-900 flex items-center gap-2">
                <span>🚨</span>
                <span>Critical Incidents & Safety Events</span>
              </h3>
              <p className="text-[12px] text-stone-500 mt-0.5">
                State reportable occurrences, falls, medication errors, and clinical interventions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowReportIncidentModal(true)}
              className="h-[34px] px-4 bg-rose-700 text-white text-[12px] font-semibold rounded-[8px] hover:bg-rose-800 shadow-2xs"
            >
              + Report Incident
            </button>
          </div>

          <div className="bg-white border border-stone-200 rounded-[12px] shadow-xs overflow-hidden">
            {currentClient.incidents.length > 0 ? (
              <table className="w-full text-left text-[13px] border-collapse">
                <thead className="bg-stone-50 text-[11px] font-bold uppercase tracking-[0.04em] text-stone-500 border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Incident #</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Incident Type</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Reported By</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 max-w-sm">Summary Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {currentClient.incidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-900">{inc.incidentNumber}</td>
                      <td className="py-3.5 px-4 text-stone-700">{inc.date} · {inc.time}</td>
                      <td className="py-3.5 px-4 font-semibold text-stone-800">{inc.type}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900">
                          {inc.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">{inc.reportedBy}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
                          {inc.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 text-xs leading-relaxed max-w-sm">
                        {inc.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-stone-500 space-y-1">
                <span className="text-2xl block">✓</span>
                <span className="font-bold text-stone-800 block text-sm">No Incidents Reported</span>
                <span className="text-xs">Zero safety escalations on file for this client.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 11: ATTRIBUTES & MATCHING (AXISCARE STYLE) */}
      {activeTab === 'Attributes & Matching' && (
        <div className="bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
            <div>
              <h3 className="text-[16px] font-bold text-stone-900 flex items-center gap-2">
                <span>⚡</span>
                <span>AxisCare Caregiver Matching & Environment Attributes</span>
              </h3>
              <p className="text-[12px] text-stone-500 mt-0.5">
                Specific client preferences and clinical restrictions used by automated dispatch to match qualified caregivers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => showToast('Caregiver matching criteria saved')}
              className="h-[32px] px-4 bg-[var(--green-700)] text-white text-[12px] font-semibold rounded-[8px] hover:bg-[var(--green-900)] shadow-2xs self-start"
            >
              Save Criteria
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3.5">
            {currentClient.attributes.map((att) => (
              <div
                key={att.id}
                className="p-3.5 bg-stone-50/70 border border-stone-200 rounded-[10px] flex items-center justify-between gap-3 text-[13px]"
              >
                <div>
                  <span className="font-bold text-stone-900 block">{att.title}</span>
                  <span className="text-[12px] text-stone-500">{att.description}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 bg-white p-1 rounded border border-stone-200 text-xs">
                  {(['Yes', 'No', 'Preferred'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        const updated = currentClient.attributes.map((a) =>
                          a.id === att.id ? { ...a, preference: opt } : a
                        );
                        setCurrentClient({ ...currentClient, attributes: updated });
                        setHasUnsavedChanges(true);
                      }}
                      className={`px-2 py-0.5 rounded font-bold transition text-[11px] ${
                        att.preference === opt
                          ? opt === 'Yes'
                            ? 'bg-[var(--green-700)] text-white'
                            : opt === 'Preferred'
                            ? 'bg-amber-500 text-white'
                            : 'bg-stone-700 text-white'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 12: BILLING */}
      {activeTab === 'Billing' && (
        <div className="space-y-5">
          {/* Top Billing Summary Cards */}
          <div className="grid sm:grid-cols-4 gap-4">
            <div className="bg-white border border-stone-200 rounded-[12px] p-4 shadow-xs">
              <span className="text-[11px] font-semibold uppercase text-stone-400 block mb-1">State Payer Rate</span>
              <div className="text-[24px] font-bold text-stone-900">${currentClient.billingRate.toFixed(2)}</div>
              <span className="text-[11px] text-stone-500">Per 1-hour unit (T1019)</span>
            </div>

            <div className="bg-white border border-stone-200 rounded-[12px] p-4 shadow-xs">
              <span className="text-[11px] font-semibold uppercase text-stone-400 block mb-1">Billing Schedule</span>
              <div className="text-[16px] font-bold text-stone-900 mt-1">{currentClient.billingSchedule}</div>
              <span className="text-[11px] text-stone-500">Claims auto-batched</span>
            </div>

            <div className="bg-white border border-stone-200 rounded-[12px] p-4 shadow-xs">
              <span className="text-[11px] font-semibold uppercase text-stone-400 block mb-1">Account Balance</span>
              <div className="text-[24px] font-bold text-emerald-800">$0.00</div>
              <span className="text-[11px] text-emerald-700 font-semibold">Account in Good Standing ✓</span>
            </div>

            <div className="bg-white border border-stone-200 rounded-[12px] p-4 shadow-xs">
              <span className="text-[11px] font-semibold uppercase text-stone-400 block mb-1">Billing Contact</span>
              <div className="font-bold text-stone-800 truncate text-[13px] mt-1">{currentClient.program}</div>
              <span className="text-[11px] text-stone-500">Direct EDI Adjudication</span>
            </div>
          </div>

          {/* Recent Claims Table */}
          <div className="bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-[15px] font-bold text-stone-900">Recent Invoices & Claims Adjudication</h3>
              <button
                type="button"
                onClick={() => showToast('Opening Billing Module Claim Exporter')}
                className="text-xs font-semibold text-[var(--green-700)] hover:underline"
              >
                View in Billing Module →
              </button>
            </div>

            <table className="w-full text-left text-[13px] border-collapse">
              <thead className="bg-stone-50 text-[11px] font-bold uppercase tracking-[0.04em] text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Claim ID</th>
                  <th className="py-2.5 px-3">Service Date</th>
                  <th className="py-2.5 px-3">Units Billed</th>
                  <th className="py-2.5 px-3">Rate</th>
                  <th className="py-2.5 px-3">Total Amount</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {currentClient.recentClaims.map((clm) => (
                  <tr key={clm.id} className="hover:bg-stone-50/60 transition">
                    <td className="py-3 px-3 font-mono font-bold text-stone-900">{clm.claimId}</td>
                    <td className="py-3 px-3 text-stone-700">{clm.date}</td>
                    <td className="py-3 px-3 font-semibold text-stone-800">{clm.hours} hrs</td>
                    <td className="py-3 px-3 text-stone-600">${clm.rate.toFixed(2)}/hr</td>
                    <td className="py-3 px-3 font-bold text-stone-900">${clm.amount.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {clm.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 13: FORMS */}
      {activeTab === 'Forms' && (
        <div className="bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-[16px] font-bold text-stone-900 flex items-center gap-2">
                <span>📝</span>
                <span>Assigned Assessments & State Forms</span>
              </h3>
              <p className="text-[12px] text-stone-500 mt-0.5">
                Standard Oregon/Colorado statutory evaluation documents and family satisfaction surveys.
              </p>
            </div>
            <button
              type="button"
              onClick={() => showToast('Send new form dialog opened (demo)')}
              className="h-[34px] px-3.5 bg-[var(--green-700)] text-white text-[12px] font-semibold rounded-[8px] hover:bg-[var(--green-900)] shadow-2xs"
            >
              + Send New Form
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {currentClient.assignedForms.map((frm) => (
              <div key={frm.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]">
                <div>
                  <div className="font-bold text-stone-900 flex items-center gap-2">
                    <span>{frm.title}</span>
                    <span className="font-mono text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">
                      {frm.code}
                    </span>
                  </div>
                  <div className="text-[12px] text-stone-500 mt-0.5">
                    Assigned to: <strong>{frm.assignedTo}</strong> · Due Date: {frm.dueDate}
                    {frm.completedDate ? ` · Completed: ${frm.completedDate}` : ''}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      frm.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : frm.status === 'Action Required'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {frm.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => showToast(`Opening form: ${frm.title}`)}
                    className="h-[30px] px-3 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-[6px] text-[11px] font-semibold text-stone-700"
                  >
                    {frm.status === 'Completed' ? 'View Results' : 'Complete Form →'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 14: TIMELINE & ACTIVITY */}
      {activeTab === 'Timeline & Activity' && (
        <div className="bg-white border border-stone-200 rounded-[12px] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
            <div>
              <h3 className="text-[16px] font-bold text-stone-900 flex items-center gap-2">
                <span>⏱️</span>
                <span>Chronological Audit Trail & Activity Log</span>
              </h3>
              <p className="text-[12px] text-stone-500 mt-0.5">
                Immutable HIPAA audit trail tracking all clinical, document, and schedule events.
              </p>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 text-xs overflow-x-auto">
              {['All', 'Note', 'Clinical', 'Document', 'Billing', 'Status Change'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimelineFilter(t)}
                  className={`px-2.5 py-1 rounded-[6px] font-semibold transition ${
                    timelineFilter === t
                      ? 'bg-[var(--green-700)] text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="relative border-l-2 border-stone-200 ml-4 space-y-6 pt-2">
            {currentClient.timeline
              .filter((ev) => timelineFilter === 'All' || ev.type === timelineFilter)
              .map((ev) => (
                <div key={ev.id} className="relative pl-6 text-[13px]">
                  {/* Dot */}
                  <div
                    className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-white shadow-2xs ${
                      ev.isHuman ? 'bg-[var(--green-700)]' : 'bg-stone-400'
                    }`}
                  />

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-bold text-stone-900">{ev.user}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                      {ev.type}
                    </span>
                    <span className="text-[11px] text-stone-400 font-medium">
                      {ev.date} at {ev.time}
                    </span>
                  </div>

                  <p className="text-stone-700 mt-1 leading-relaxed">{ev.description}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODALS (SCHEDULE RN, ADD AUTH, UPLOAD DOC, REPORT INCIDENT, ETC.)     */}
      {/* ========================================================================= */}

      {/* Schedule RN Modal */}
      {showScheduleRnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-[14px] border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4 text-[13px]">
            <div className="flex items-start justify-between pb-2 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-[16px] text-stone-900">Schedule RN Supervisory Visit</h3>
                <p className="text-xs text-stone-500">For {deIdentify(currentClient.name)} ({currentClient.id})</p>
              </div>
              <button type="button" onClick={() => setShowScheduleRnModal(false)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Assigned RN Supervisor</label>
                <select className="w-full h-9 px-2.5 border rounded-[8px] bg-white text-xs">
                  <option value="dana">Dana Whitfield, RN (Primary)</option>
                  <option value="sarah">Sarah Jenkins, RN</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Visit Date</label>
                  <input type="date" defaultValue="2026-12-04" className="w-full h-9 px-2.5 border rounded-[8px] text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Time</label>
                  <input type="time" defaultValue="10:00" className="w-full h-9 px-2.5 border rounded-[8px] text-xs" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Visit Modality</label>
                <select className="w-full h-9 px-2.5 border rounded-[8px] bg-white text-xs">
                  <option value="in-home">In-Person Home Visit (Mandatory 60-Day)</option>
                  <option value="telehealth">Telehealth / Video Check-in</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowScheduleRnModal(false)}
                className="h-9 px-4 rounded-[8px] border text-xs font-semibold text-stone-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`RN supervisory visit scheduled for ${currentClient.name} on Dec 04, 2026`);
                  setShowScheduleRnModal(false);
                }}
                className="h-9 px-5 rounded-[8px] bg-[var(--green-700)] text-white text-xs font-semibold hover:bg-[var(--green-900)]"
              >
                Confirm Visit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Incident Modal */}
      {showReportIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-[14px] border border-stone-200 max-w-lg w-full p-6 shadow-2xl space-y-4 text-[13px]">
            <div className="flex items-start justify-between pb-2 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-[16px] text-rose-900">Report Safety Event / Incident</h3>
                <p className="text-xs text-stone-500">Document clinical occurrence for state HCPF / APS filing.</p>
              </div>
              <button type="button" onClick={() => setShowReportIncidentModal(false)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast('Incident report logged and escalated to RN supervisor.');
                setShowReportIncidentModal(false);
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Incident Type</label>
                  <select className="w-full h-9 px-2.5 border rounded-[8px] bg-white text-xs">
                    <option>Fall (With or Without Injury)</option>
                    <option>Medication Error / Refusal</option>
                    <option>Skin Tear / Bruising</option>
                    <option>Emergency Service (911) Called</option>
                    <option>Behavioral Escalation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Severity</label>
                  <select className="w-full h-9 px-2.5 border rounded-[8px] bg-white text-xs">
                    <option>Low (No treatment needed)</option>
                    <option>Medium (First aid / RN called)</option>
                    <option>High (ER evaluation)</option>
                    <option>Critical (Hospital admission)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Event Narrative & Actions Taken</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Objective description of incident, vitals taken, and caregiver response..."
                  className="w-full p-2.5 border rounded-[8px] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowReportIncidentModal(false)}
                  className="h-9 px-4 rounded-[8px] border text-xs font-semibold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-[8px] bg-rose-700 text-white text-xs font-semibold hover:bg-rose-800"
                >
                  Submit Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify Address Modal */}
      {showVerifyAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-[14px] border border-stone-200 max-w-sm w-full p-6 shadow-2xl space-y-3 text-[13px] text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 text-xl font-bold flex items-center justify-center mx-auto">
              ✓
            </div>
            <h3 className="font-bold text-[16px] text-stone-900">USPS Address Verified</h3>
            <p className="text-xs text-stone-600">
              <strong>{currentClient.address}{currentClient.apt ? `, ${currentClient.apt}` : ''}</strong><br />
              {currentClient.city}, {currentClient.state} {currentClient.zip}<br />
              County: Multnomah · Deliverable: Yes
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowVerifyAddressModal(false)}
                className="w-full h-9 rounded-[8px] bg-[var(--green-700)] text-white font-semibold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-[14px] border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4 text-[13px]">
            <div className="flex items-start justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-[16px] text-stone-900">Upload Compliance Document</h3>
              <button type="button" onClick={() => setShowUploadDocModal(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Document Name</label>
                <input
                  type="text"
                  placeholder="e.g. 2027 Re-authorization Letter"
                  className="w-full h-9 px-2.5 border rounded-[8px] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
                <select className="w-full h-9 px-2.5 border rounded-[8px] bg-white text-xs">
                  <option>Consent</option>
                  <option>Assessment</option>
                  <option>Medical Order</option>
                  <option>Authorization</option>
                  <option>ID</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-stone-200 rounded-[10px] p-6 text-center space-y-1 bg-stone-50">
                <span className="text-xl block">📤</span>
                <span className="font-semibold text-xs block text-stone-800">Drop PDF or scanned image here</span>
                <span className="text-[11px] text-stone-400">Accepts .pdf, .jpg, .png up to 25MB</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowUploadDocModal(false)}
                className="h-9 px-4 rounded-[8px] border text-xs font-semibold text-stone-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Document uploaded and queued for clinical verification.');
                  setShowUploadDocModal(false);
                }}
                className="h-9 px-5 rounded-[8px] bg-[var(--green-700)] text-white text-xs font-semibold hover:bg-[var(--green-900)]"
              >
                Upload File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Authorization Modal */}
      {showAddAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-[14px] border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4 text-[13px]">
            <div className="flex items-start justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-[16px] text-stone-900">Add State Service Authorization</h3>
              <button type="button" onClick={() => setShowAddAuthModal(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Auth / PAR Number</label>
                <input type="text" placeholder="e.g. AUTH-OR-2027-1042" className="w-full h-9 px-2.5 border rounded-[8px] text-xs font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Service Code</label>
                  <input type="text" defaultValue="T1019" className="w-full h-9 px-2.5 border rounded-[8px] text-xs font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Approved Units</label>
                  <input type="number" defaultValue={5120} className="w-full h-9 px-2.5 border rounded-[8px] text-xs font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Start Date</label>
                  <input type="date" defaultValue="2027-01-01" className="w-full h-9 px-2.5 border rounded-[8px] text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Expiry Date</label>
                  <input type="date" defaultValue="2027-12-31" className="w-full h-9 px-2.5 border rounded-[8px] text-xs" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button type="button" onClick={() => setShowAddAuthModal(false)} className="h-9 px-4 rounded-[8px] border text-xs font-semibold text-stone-700">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  showToast('Prior authorization saved to Medicaid ledger');
                  setShowAddAuthModal(false);
                }}
                className="h-9 px-5 rounded-[8px] bg-[var(--green-700)] text-white text-xs font-semibold hover:bg-[var(--green-900)]"
              >
                Save Authorization
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
