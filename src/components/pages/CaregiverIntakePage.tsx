'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  CAREGIVER_INTAKE_STAGES,
  CAREGIVER_INTAKE_STEPS,
  CAREGIVER_APPLICANTS,
  STAFF,
  DEF,
} from '@/data/mockData';
import { CaregiverApplicant } from '@/types';

// Helper for staff avatar initials
const getStaffInitials = (staff: string) => {
  const parts = staff.split(' ');
  return parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase();
};

// 8px Stage Dot Colors
const STAGE_DOT_COLORS: Record<string, string> = {
  'New Application': '#3E6B2B',
  'Phone Screened': '#2563EB',
  'Interview Scheduled': '#B45309',
  'Hiring Decision': '#7C3AED',
  'Offer Extended': '#4F46E5',
  'Hired (→ Onboarding)': '#059669',
  'Archived / Withdrawn': '#78716C',
};

export const CaregiverIntakePage: React.FC = () => {
  const { showToast, addFeed, deIdentify, navigate } = useApp();

  // Applicants State
  const [applicants, setApplicants] = useState<CaregiverApplicant[]>(CAREGIVER_APPLICANTS);
  const [selectedApplicant, setSelectedApplicant] = useState<CaregiverApplicant | null>(null);

  // Filters State
  const [filterOwner, setFilterOwner] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterClass, setFilterClass] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // Drag and drop state
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // Drawer & Modal States
  const [activeTab, setActiveTab] = useState<'overview' | 'training' | 'credentials' | 'comp' | 'comm' | 'activity'>('overview');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addPreselectedStage, setAddPreselectedStage] = useState('New Application');
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [applicantToHire, setApplicantToHire] = useState<CaregiverApplicant | null>(null);
  const [hireSuccess, setHireSuccess] = useState(false);
  const [isLogCallOpen, setIsLogCallOpen] = useState(false);
  const [callType, setCallType] = useState<'Call' | 'Email' | 'SMS' | 'Note'>('Call');
  const [callNote, setCallNote] = useState('');
  const [commDraft, setCommDraft] = useState('');

  // Add Form State & Dictation
  const [form, setForm] = useState<Record<string, string>>({});
  const [isDictatingForm, setIsDictatingForm] = useState(false);

  // Filter Applicants
  const filteredApplicants = applicants.filter((a) => {
    if (filterOwner !== 'All' && a.owner !== filterOwner) return false;
    if (filterType !== 'All' && a.employmentType !== filterType) return false;
    if (filterClass !== 'All' && a.serviceClass !== filterClass) return false;
    if (filterSource !== 'All' && a.source !== filterSource) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = a.name.toLowerCase().includes(q);
      const matchClass = a.serviceClass.toLowerCase().includes(q);
      const matchCounty = a.county?.toLowerCase().includes(q) || false;
      if (!matchName && !matchClass && !matchCounty) return false;
    }
    return true;
  });

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, applicant: CaregiverApplicant) => {
    e.dataTransfer.setData('text/plain', applicant.id);
    setDraggedAppId(applicant.id);
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    setDragOverStage(null);
    const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
    if (!appId) return;

    const target = applicants.find((a) => a.id === appId);
    if (!target || target.stage === targetStage) return;

    const stepIndex = CAREGIVER_INTAKE_STAGES.indexOf(targetStage) + 1;

    const updated = applicants.map((a) => {
      if (a.id === appId) {
        return {
          ...a,
          stage: targetStage,
          currentStep: stepIndex > 0 ? stepIndex : a.currentStep,
          daysInStage: 0,
          activityLog: [
            {
              date: 'Just now',
              text: `Moved to ${targetStage} via Kanban drag`,
              isAutomated: false,
            },
            ...(a.activityLog || []),
          ],
        };
      }
      return a;
    });

    setApplicants(updated);
    if (selectedApplicant && selectedApplicant.id === appId) {
      setSelectedApplicant(updated.find((a) => a.id === appId) || null);
    }
    showToast(`${deIdentify(target.name)} moved to ${targetStage}`);
    addFeed(`Caregiver candidate ${deIdentify(target.name)} advanced to ${targetStage}`, false);
    setDraggedAppId(null);
  };

  // Stepper advance in drawer
  const handleAdvanceStep = (applicant: CaregiverApplicant) => {
    if (applicant.currentStep >= 7) return;
    const nextStep = applicant.currentStep + 1;
    const stepName = CAREGIVER_INTAKE_STEPS[nextStep - 1];

    let newStage = applicant.stage;
    if (nextStep === 2) newStage = 'Phone Screened';
    if (nextStep === 3) newStage = 'Interview Scheduled';
    if (nextStep === 4) newStage = 'Hiring Decision';
    if (nextStep === 5) newStage = 'Offer Extended';
    if (nextStep === 7) newStage = 'Hired (→ Onboarding)';

    const updated = applicants.map((a) => {
      if (a.id === applicant.id) {
        return {
          ...a,
          currentStep: nextStep,
          stage: newStage,
          activityLog: [
            {
              date: 'Just now',
              text: `Completed step "${CAREGIVER_INTAKE_STEPS[applicant.currentStep - 1]}". Advanced to "${stepName}".`,
              isAutomated: false,
            },
            ...(a.activityLog || []),
          ],
        };
      }
      return a;
    });

    setApplicants(updated);
    setSelectedApplicant(updated.find((a) => a.id === applicant.id) || null);
    showToast(`Caregiver step marked complete: ${stepName}`);
  };

  // Hire & Move to Onboarding trigger
  const handleRequestHire = (applicant: CaregiverApplicant) => {
    setApplicantToHire(applicant);
    setHireSuccess(false);
    setIsHireModalOpen(true);
  };

  const handleConfirmHire = () => {
    if (!applicantToHire) return;

    const updated = applicants.map((a) => {
      if (a.id === applicantToHire.id) {
        return {
          ...a,
          stage: 'Hired (→ Onboarding)',
          currentStep: 7,
          activityLog: [
            {
              date: 'Just now',
              text: '⚡ Hired! Caregiver record created in Onboarding pipeline with assigned LearnWorlds training.',
              isAutomated: true,
            },
            ...(a.activityLog || []),
          ],
        };
      }
      return a;
    });

    setApplicants(updated);
    if (selectedApplicant && selectedApplicant.id === applicantToHire.id) {
      setSelectedApplicant(updated.find((a) => a.id === applicantToHire.id) || null);
    }
    setHireSuccess(true);
    showToast(`Hired ${deIdentify(applicantToHire.name)}! Onboarding track created.`);
    addFeed(
      `Caregiver ${deIdentify(applicantToHire.name)} hired: Onboarding packet dispatched, CBI check queued`,
      true
    );
  };

  // Quick message template application
  const applyCommTemplate = (templateType: 'screen' | 'interview' | 'offer') => {
    if (!selectedApplicant) return;
    const name = selectedApplicant.name.split(' ')[0];
    let msg = '';
    if (templateType === 'screen') {
      msg = `Hi ${name}, thank you for applying to LiliSare! We reviewed your application for the ${selectedApplicant.serviceClass} role. Are you available for a brief 10-minute phone screen tomorrow?`;
    } else if (templateType === 'interview') {
      msg = `Hello ${name}, we're excited to invite you for an in-person interview at LiliSare's office on Tuesday at 2:00 PM. Please bring your photo ID, CPR card, and CNA certification if applicable.`;
    } else if (templateType === 'offer') {
      msg = `Dear ${name}, we are delighted to offer you the position of ${selectedApplicant.serviceClass} with LiliSare at ${selectedApplicant.targetRate || '$22.00/hr'} (${selectedApplicant.employmentType}). Your official offer packet is ready for digital review.`;
    }
    setCommDraft(msg);
  };

  const handleSendCommDraft = () => {
    if (!selectedApplicant || !commDraft.trim()) return;
    const updated = applicants.map((a) => {
      if (a.id === selectedApplicant.id) {
        return {
          ...a,
          commLog: [
            {
              date: 'Just now',
              type: 'SMS' as const,
              text: commDraft.trim(),
              staff: 'You',
            },
            ...(a.commLog || []),
          ],
        };
      }
      return a;
    });
    setApplicants(updated);
    setSelectedApplicant(updated.find((a) => a.id === selectedApplicant.id) || null);
    setCommDraft('');
    showToast(`Message sent and logged for ${deIdentify(selectedApplicant.name)}`);
  };

  // Add Caregiver Applicant Form
  const simulateDictation = () => {
    setIsDictatingForm(true);
    setTimeout(() => {
      setForm({
        name: 'Danielle Rogers',
        phone: '(720) 555-0834',
        email: 'd.rogers@coloradocare.org',
        county: 'Denver',
        emp: 'Employee',
        serviceClass: 'CNA',
        rate: '$24.50/hr',
        source: 'Indeed',
        notes: 'Experienced hospital and home CNA with current Colorado license, BLS valid through 2027.',
      });
      setIsDictatingForm(false);
      showToast('AI Dictation captured candidate details');
    }, 1100);
  };

  const handleSaveApplicant = () => {
    if (!form.name) {
      showToast('Please provide candidate name');
      return;
    }

    const newApplicant: CaregiverApplicant = {
      id: `CGA-${Date.now().toString().slice(-4)}`,
      name: form.name,
      stage: addPreselectedStage,
      employmentType: (form.emp as 'Employee' | '1099' | 'Both') || 'Employee',
      serviceClass: form.serviceClass || 'CNA',
      phone: form.phone || '(303) 555-0100',
      email: form.email || 'candidate@example.com',
      county: form.county || 'Denver',
      source: (form.source as CaregiverApplicant['source']) || 'Website',
      appliedDate: 'Just now',
      daysInStage: 0,
      currentStep: 1,
      owner: 'Maya R.',
      cprStatus: 'Valid',
      cbiStatus: 'Pending',
      tbStatus: 'Valid',
      targetRate: form.rate || '$23.00/hr',
      notes: form.notes || 'Inquiry created via Caregiver Intake.',
      commLog: [
        {
          date: 'Just now',
          type: 'Call',
          text: 'Initial inquiry logged.',
          staff: 'Maya R.',
        },
      ],
      activityLog: [
        {
          date: 'Just now',
          text: `Candidate inquiry created in stage "${addPreselectedStage}"`,
          isAutomated: false,
        },
      ],
    };

    setApplicants([newApplicant, ...applicants]);
    setIsAddOpen(false);
    setForm({});
    showToast(`Caregiver applicant added: ${deIdentify(newApplicant.name)}`);
    addFeed(`Caregiver applicant ${deIdentify(newApplicant.name)} (${newApplicant.serviceClass}) added to Caregiver Intake`, false);
  };

  // Summary Metrics
  const totalOpen = applicants.filter((a) => a.stage !== 'Hired (→ Onboarding)' && a.stage !== 'Archived / Withdrawn').length;
  const phoneScreens = applicants.filter((a) => a.stage === 'Phone Screened').length;
  const interviews = applicants.filter((a) => a.stage === 'Interview Scheduled').length;
  const hiredMonth = applicants.filter((a) => a.stage === 'Hired (→ Onboarding)').length + 6;
  const avgDaysToHire = 9;

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--text)] leading-tight">
            Caregiver Intake
          </h1>
          <p className="text-[14px] font-normal text-[var(--text-muted)] mt-1">
            Track caregiver inquiries and applicants from first contact to hiring and onboarding handoff.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setAddPreselectedStage('New Application');
              setIsAddOpen(true);
            }}
            className="min-h-[36px] px-4 rounded-[8px] bg-[var(--green-700)] text-white text-[14px] font-semibold hover:bg-[var(--green-900)] transition shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)] focus:ring-offset-2 flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add caregiver inquiry</span>
          </button>
        </div>
      </div>

      {/* SUMMARY STRIP */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]">
        <div className="px-4 py-1 first:pl-0 last:pr-0">
          <div className="text-[12px] font-normal text-[var(--text-muted)] mb-1">Open applicants</div>
          <div className="text-[24px] font-bold text-[var(--text)] leading-none">{totalOpen}</div>
        </div>
        <div className="px-4 py-1 first:pl-0 last:pr-0">
          <div className="text-[12px] font-normal text-[var(--text-muted)] mb-1">Phone screens</div>
          <div className="text-[24px] font-bold text-[var(--text)] leading-none">{phoneScreens}</div>
        </div>
        <div className="px-4 py-1 first:pl-0 last:pr-0">
          <div className="text-[12px] font-normal text-[var(--text-muted)] mb-1">Interviews booked</div>
          <div className="text-[24px] font-bold text-[var(--text)] leading-none">{interviews}</div>
        </div>
        <div className="px-4 py-1 first:pl-0 last:pr-0">
          <div className="text-[12px] font-normal text-[var(--text-muted)] mb-1">Hired this month</div>
          <div className="text-[24px] font-bold text-[var(--text)] leading-none">{hiredMonth}</div>
        </div>
        <div className="px-4 py-1 first:pl-0 last:pr-0">
          <div className="text-[12px] font-normal text-[var(--text-muted)] mb-1">Avg days to hire</div>
          <div className="text-[24px] font-bold text-[var(--text)] leading-none">{avgDaysToHire}d</div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search applicants…"
                className="w-full h-[36px] bg-[var(--card)] border border-[var(--border)] rounded-[8px] pl-8 pr-3 text-[14px] font-normal text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)]"
              />
              <svg
                className="w-4 h-4 text-[var(--text-muted)] absolute left-2.5 top-2.5 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* 1. Recruiter Select */}
            <select
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}
              aria-label="Filter by recruiter"
              className="h-[36px] min-h-[36px] px-3 bg-[var(--card)] border border-[var(--border)] rounded-[8px] text-[14px] font-normal text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)] cursor-pointer"
            >
              <option value="All">All Recruiters</option>
              {STAFF.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* 2. Classification Select */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              aria-label="Filter by classification"
              className="h-[36px] min-h-[36px] px-3 bg-[var(--card)] border border-[var(--border)] rounded-[8px] text-[14px] font-normal text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)] cursor-pointer"
            >
              <option value="All">All Classifications</option>
              <option value="Employee">Employee</option>
              <option value="1099">1099</option>
              <option value="Both">Both</option>
            </select>

            {/* 3. Source Select */}
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              aria-label="Filter by source"
              className="h-[36px] min-h-[36px] px-3 bg-[var(--card)] border border-[var(--border)] rounded-[8px] text-[14px] font-normal text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)] cursor-pointer"
            >
              <option value="All">All Sources</option>
              <option value="Indeed">Indeed</option>
              <option value="Referral">Referral</option>
              <option value="Website">Website</option>
              <option value="Job Fair">Job Fair</option>
              <option value="Phone Call">Phone Call</option>
            </select>

            {/* More Filters Toggle */}
            <button
              type="button"
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className={`h-[36px] min-h-[36px] px-3 rounded-[8px] border text-[14px] font-normal transition flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--green-700)] ${
                showMoreFilters || filterClass !== 'All'
                  ? 'border-[var(--green-700)] text-[var(--green-700)] bg-[var(--green-100)]'
                  : 'border-[var(--border)] text-[var(--text)] bg-[var(--card)] hover:bg-[#F0F2ED]'
              }`}
            >
              <svg className="w-4 h-4 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>More filters</span>
              {filterClass !== 'All' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--green-700)] shrink-0" />
              )}
            </button>
          </div>

          {/* Board / List Switcher */}
          <div className="flex items-center bg-[#EEF0EB] p-1 rounded-[8px] border border-[var(--border)] h-[36px]">
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`h-[28px] min-h-[28px] px-3 rounded-[6px] text-[12px] font-semibold transition ${
                viewMode === 'board'
                  ? 'bg-[var(--card)] text-[var(--text)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              Board
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`h-[28px] min-h-[28px] px-3 rounded-[6px] text-[12px] font-semibold transition ${
                viewMode === 'list'
                  ? 'bg-[var(--card)] text-[var(--text)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Secondary "More filters" row */}
        {showMoreFilters && (
          <div className="flex items-center gap-3 bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)]">
              Role / Service Class:
            </span>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              aria-label="Filter by role"
              className="h-[36px] min-h-[36px] px-3 bg-[var(--card)] border border-[var(--border)] rounded-[8px] text-[14px] font-normal text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)] cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="CNA">CNA</option>
              <option value="IHSS">IHSS Attendant</option>
              <option value="Personal Care">Personal Care</option>
              <option value="HMA">HMA Delegated</option>
              <option value="SCC">SCC Companion</option>
            </select>
            {filterClass !== 'All' && (
              <button
                type="button"
                onClick={() => setFilterClass('All')}
                className="text-[12px] font-normal text-[var(--text-muted)] hover:text-[var(--text)] underline"
              >
                Clear role filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'board' ? (
        <div className="kanban-scroll pb-4 pt-1">
          <div className="flex gap-4 items-start w-max min-w-full">
            {CAREGIVER_INTAKE_STAGES.map((stage) => {
              const stageApplicants = filteredApplicants.filter((a) => a.stage === stage);
              const dotColor = STAGE_DOT_COLORS[stage] || '#78716C';
              const isDragOver = dragOverStage === stage;

              return (
                <div
                  key={stage}
                  onDragOver={(e) => handleDragOver(e, stage)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage)}
                  className={`w-[300px] shrink-0 bg-[var(--bg)] border border-[var(--border)] rounded-[12px] p-3 transition-colors ${
                    isDragOver ? 'ring-2 ring-[var(--green-700)] bg-[var(--green-100)]' : ''
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: dotColor }}
                      />
                      <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text)] truncate">
                        {stage}
                      </span>
                      <span className="w-5 h-5 rounded-full bg-[#E6E8E2] text-[var(--text)] text-[12px] font-normal flex items-center justify-center shrink-0">
                        {stageApplicants.length}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAddPreselectedStage(stage);
                        setIsAddOpen(true);
                      }}
                      title={`Add applicant to ${stage}`}
                      aria-label={`Add applicant to ${stage}`}
                      className="w-7 h-7 flex items-center justify-center rounded-[8px] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[#E6E8E2] transition min-h-[36px] min-w-[36px] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)]"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-3 min-h-[120px]">
                    {stageApplicants.map((applicant) => {
                      const stepPct = Math.round((applicant.currentStep / 7) * 100);
                      const hasCbiIssue = applicant.cbiStatus && applicant.cbiStatus !== 'Clear';
                      const hasCprIssue = applicant.cprStatus && applicant.cprStatus === 'Expired';

                      return (
                        <div
                          key={applicant.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, applicant)}
                          onClick={() => setSelectedApplicant(applicant)}
                          className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-4 cursor-pointer transition shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-[var(--green-700)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)] flex flex-col justify-between"
                        >
                          {/* Row 1: Name and Classification chip */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[16px] font-semibold text-[var(--text)] truncate">
                              {deIdentify(applicant.name)}
                            </span>
                            <span className="text-[12px] font-normal px-2 py-0.5 rounded-[8px] bg-[#EEF0EB] text-[var(--text)] border border-[var(--border)] shrink-0">
                              {applicant.serviceClass}
                            </span>
                          </div>

                          {/* Row 2: Details on one line with middle dots */}
                          <div className="text-[12px] font-normal text-[var(--text-muted)] truncate whitespace-nowrap mt-1">
                            {applicant.employmentType} · {applicant.county || 'Denver'} · via {applicant.source || 'Indeed'}
                          </div>

                          {/* Row 3: Thin 4px progress bar with step label */}
                          <div className="my-2">
                            <div className="h-1 w-full bg-[var(--border)] rounded-full overflow-hidden">
                              <div
                                style={{ width: `${stepPct}%` }}
                                className="h-full bg-[var(--green-700)] rounded-full transition-all duration-200"
                              />
                            </div>
                            <div className="text-[12px] font-normal text-[var(--text-muted)] truncate mt-1">
                              Step {applicant.currentStep} of 7 · {CAREGIVER_INTAKE_STEPS[applicant.currentStep - 1] || 'Done'}
                            </div>
                          </div>

                          {/* Row 4: Avatar, recruiter, screening status if issue, interview date / days in stage */}
                          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[12px] font-normal gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                title={`Recruiter: ${applicant.owner}`}
                                className="w-6 h-6 rounded-full text-[10px] font-semibold bg-[#E6E8E2] text-[var(--text)] flex items-center justify-center shrink-0"
                              >
                                {getStaffInitials(applicant.owner)}
                              </span>
                              <span className="text-[var(--text)] truncate max-w-[70px]">
                                {applicant.owner}
                              </span>

                              {/* Screening alert only if something is wrong */}
                              {hasCbiIssue && (
                                <span
                                  title={`CBI status: ${applicant.cbiStatus}`}
                                  className="inline-flex items-center gap-1 text-[var(--amber)] shrink-0"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)]" />
                                  <span>CBI pending</span>
                                </span>
                              )}
                              {!hasCbiIssue && hasCprIssue && (
                                <span
                                  title="CPR certification expired"
                                  className="inline-flex items-center gap-1 text-[var(--red)] shrink-0"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--red)]" />
                                  <span>Expired</span>
                                </span>
                              )}
                            </div>

                            <div className="shrink-0 text-right">
                              {applicant.interviewDate ? (
                                <span
                                  className="text-[var(--text)] flex items-center gap-1"
                                  title={`Scheduled Interview: ${applicant.interviewDate}`}
                                >
                                  <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>{applicant.interviewDate}</span>
                                </span>
                              ) : (
                                <span className="text-[var(--text-muted)]">
                                  {applicant.daysInStage}d in stage
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* LIST VIEW ALTERNATIVE */
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[var(--bg)] border-b border-[var(--border)]">
                <tr>
                  <th className="py-3 px-4 text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)]">Applicant Name</th>
                  <th className="py-3 px-4 text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)]">Role</th>
                  <th className="py-3 px-4 text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)]">Type</th>
                  <th className="py-3 px-4 text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)]">Stage</th>
                  <th className="py-3 px-4 text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)]">Progress</th>
                  <th className="py-3 px-4 text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)]">Source</th>
                  <th className="py-3 px-4 text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)]">Recruiter</th>
                  <th className="py-3 px-4 text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)]">Days</th>
                  <th className="py-3 px-4 text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredApplicants.map((applicant) => (
                  <tr
                    key={applicant.id}
                    onClick={() => setSelectedApplicant(applicant)}
                    className="hover:bg-[#F0F2ED]/60 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 text-[14px] font-semibold text-[var(--text)]">
                      {deIdentify(applicant.name)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[12px] font-normal px-2 py-0.5 rounded-[8px] bg-[#EEF0EB] text-[var(--text)] border border-[var(--border)]">
                        {applicant.serviceClass}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[14px] font-normal text-[var(--text)]">
                      {applicant.employmentType}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: STAGE_DOT_COLORS[applicant.stage] || '#78716C' }}
                        />
                        <span className="text-[14px] font-normal text-[var(--text)]">
                          {applicant.stage}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-24">
                        <div className="h-1 w-full bg-[var(--border)] rounded-full overflow-hidden">
                          <div
                            style={{ width: `${Math.round((applicant.currentStep / 7) * 100)}%` }}
                            className="h-full bg-[var(--green-700)] rounded-full"
                          />
                        </div>
                        <span className="text-[12px] font-normal text-[var(--text-muted)] mt-0.5 block">
                          Step {applicant.currentStep}/7
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[12px] font-normal text-[var(--text-muted)]">
                      {applicant.source}
                    </td>
                    <td className="py-3 px-4 text-[14px] font-normal text-[var(--text)]">
                      {applicant.owner}
                    </td>
                    <td className="py-3 px-4 text-[12px] font-normal text-[var(--text-muted)]">
                      {applicant.daysInStage}d
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApplicant(applicant);
                        }}
                        className="min-h-[36px] px-3 rounded-[8px] border border-[var(--border)] bg-[var(--card)] text-[12px] font-semibold text-[var(--text)] hover:bg-[#F0F2ED] transition focus:outline-none focus:ring-2 focus:ring-[var(--green-700)]"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL SLIDE-OVER DRAWER */}
      {selectedApplicant && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end"
          onClick={() => setSelectedApplicant(null)}
          onKeyDown={(e) => e.key === 'Escape' && setSelectedApplicant(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Applicant details: ${selectedApplicant.name}`}
            className="w-full max-w-2xl bg-[var(--card)] h-full overflow-y-auto shadow-2xl flex flex-col animate-slideInRight"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-[var(--border)] bg-[var(--card)] space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-[28px] font-bold text-[var(--text)] leading-tight">
                      {deIdentify(selectedApplicant.name)}
                    </h2>
                    <span className="text-[12px] font-normal px-2 py-0.5 rounded-[8px] bg-[#EEF0EB] text-[var(--text)] border border-[var(--border)]">
                      {selectedApplicant.serviceClass} · {selectedApplicant.employmentType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] font-normal text-[var(--text-muted)] mt-1 flex-wrap">
                    <span>County: {selectedApplicant.county}</span>
                    <span>·</span>
                    <span>Source: {selectedApplicant.source}</span>
                    <span>·</span>
                    <span>Applied: {selectedApplicant.appliedDate}</span>
                    <span>·</span>
                    <span>Recruiter: {selectedApplicant.owner}</span>
                    <span>·</span>
                    <span className="font-semibold text-[var(--text)]">Target Rate: {selectedApplicant.targetRate || '$22.00/hr'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedApplicant(null)}
                  aria-label="Close drawer"
                  className="w-9 h-9 min-h-[36px] min-w-[36px] rounded-[8px] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[#F0F2ED] transition focus:outline-none focus:ring-2 focus:ring-[var(--green-700)]"
                >
                  ✕
                </button>
              </div>

              {/* Stage Selector & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)]">Stage:</span>
                  <select
                    value={selectedApplicant.stage}
                    onChange={(e) => {
                      const newStage = e.target.value;
                      const updated = applicants.map((a) =>
                        a.id === selectedApplicant.id ? { ...a, stage: newStage } : a
                      );
                      setApplicants(updated);
                      setSelectedApplicant({ ...selectedApplicant, stage: newStage });
                      showToast(`Stage changed to ${newStage}`);
                    }}
                    className="h-[36px] min-h-[36px] px-3 bg-[var(--card)] border border-[var(--border)] rounded-[8px] text-[14px] font-normal text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)] cursor-pointer"
                  >
                    {CAREGIVER_INTAKE_STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsLogCallOpen(!isLogCallOpen)}
                    className="min-h-[36px] px-3 rounded-[8px] border border-[var(--border)] bg-[var(--card)] text-[14px] font-normal text-[var(--text)] hover:bg-[#F0F2ED] transition shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)]"
                  >
                    Log interview
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      showToast(`Appointment confirmation sent to ${selectedApplicant.name}`);
                    }}
                    className="min-h-[36px] px-3 rounded-[8px] border border-[var(--border)] bg-[var(--card)] text-[14px] font-normal text-[var(--text)] hover:bg-[#F0F2ED] transition shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)]"
                  >
                    Send message
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRequestHire(selectedApplicant)}
                    className="min-h-[36px] px-4 rounded-[8px] bg-[var(--green-700)] text-white text-[14px] font-semibold hover:bg-[var(--green-900)] transition shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)] focus:ring-offset-2"
                  >
                    Hire & Move to Onboarding
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Log Call / Note */}
            {isLogCallOpen && (
              <div className="bg-[var(--bg)] border-b border-[var(--border)] p-4 space-y-3">
                <div className="flex items-center justify-between text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text)]">
                  <span>Log recruiter note / interview for {deIdentify(selectedApplicant.name)}</span>
                  <button
                    type="button"
                    onClick={() => setIsLogCallOpen(false)}
                    className="text-[var(--text-muted)] hover:text-[var(--text)] min-h-[36px] min-w-[36px] flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex gap-2">
                  {(['Call', 'Email', 'SMS', 'Note'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCallType(t)}
                      className={`min-h-[36px] px-3 rounded-[8px] text-[14px] font-normal transition ${
                        callType === t
                          ? 'bg-[var(--green-700)] text-white'
                          : 'bg-[var(--card)] text-[var(--text)] border border-[var(--border)] hover:bg-[#F0F2ED]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <textarea
                  value={callNote}
                  onChange={(e) => setCallNote(e.target.value)}
                  placeholder="Candidate feedback, schedule availability, rate alignment…"
                  rows={2}
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[8px] p-2.5 text-[14px] font-normal text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLogCallOpen(false)}
                    className="min-h-[36px] px-3 rounded-[8px] border border-[var(--border)] bg-[var(--card)] text-[14px] font-normal text-[var(--text)] hover:bg-[#F0F2ED]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!callNote.trim()) return;
                      const updated = applicants.map((a) => {
                        if (a.id === selectedApplicant.id) {
                          return {
                            ...a,
                            commLog: [
                              {
                                date: 'Just now',
                                type: callType,
                                text: callNote.trim(),
                                staff: a.owner,
                              },
                              ...(a.commLog || []),
                            ],
                          };
                        }
                        return a;
                      });
                      setApplicants(updated);
                      setSelectedApplicant(updated.find((a) => a.id === selectedApplicant.id) || null);
                      setCallNote('');
                      setIsLogCallOpen(false);
                      showToast(`${callType} logged to candidate chart`);
                    }}
                    className="min-h-[36px] px-4 rounded-[8px] bg-[var(--green-700)] text-white text-[14px] font-semibold hover:bg-[var(--green-900)]"
                  >
                    Save entry
                  </button>
                </div>
              </div>
            )}

            {/* Stepper (7 Steps) */}
            <div className="px-6 py-4 bg-[var(--card)] border-b border-[var(--border)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)]">
                  Hiring Stepper: Step {selectedApplicant.currentStep} of 7
                </span>
                {selectedApplicant.currentStep < 7 && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStep(selectedApplicant)}
                    className="min-h-[36px] px-3 rounded-[8px] text-[12px] font-semibold text-[var(--green-700)] bg-[var(--green-100)] hover:bg-[var(--green-700)] hover:text-white transition focus:outline-none focus:ring-2 focus:ring-[var(--green-700)]"
                  >
                    Mark complete ✓
                  </button>
                )}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {CAREGIVER_INTAKE_STEPS.map((step, idx) => {
                  const stepNum = idx + 1;
                  const isCompleted = stepNum < selectedApplicant.currentStep;
                  const isCurrent = stepNum === selectedApplicant.currentStep;

                  return (
                    <div key={step} className="flex flex-col items-center text-center">
                      <div
                        className={`w-full h-1 rounded-full mb-1.5 transition ${
                          isCompleted
                            ? 'bg-[var(--green-700)]'
                            : isCurrent
                            ? 'bg-[var(--green-700)] ring-1 ring-[var(--green-700)]'
                            : 'bg-[var(--border)]'
                        }`}
                      />
                      <span
                        className={`text-[12px] leading-tight truncate w-full ${
                          isCompleted
                            ? 'text-[var(--text)] font-normal'
                            : isCurrent
                            ? 'text-[var(--text)] font-semibold'
                            : 'text-[var(--text-muted)] font-normal'
                        }`}
                        title={step}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Drawer Tabs */}
            <div className="flex gap-2 px-6 pt-3 border-b border-[var(--border)] overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'training', label: 'Training & LMS' },
                { id: 'credentials', label: 'Experience & Credentials' },
                { id: 'comp', label: 'Compensation & Packet' },
                { id: 'comm', label: `Communication (${selectedApplicant.commLog?.length || 0})` },
                { id: 'activity', label: 'Activity' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`min-h-[36px] py-2 px-3 border-b-2 whitespace-nowrap transition text-[14px] ${
                    activeTab === tab.id
                      ? 'border-[var(--green-700)] text-[var(--green-700)] font-semibold'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)] font-normal'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Drawer Tab Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {/* OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3">
                    <h3 className="text-[16px] font-semibold text-[var(--text)]">Candidate Information</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)] block mb-1">Primary phone:</span>
                        <span className="text-[14px] font-normal text-[var(--text)]">{selectedApplicant.phone}</span>
                      </div>
                      <div>
                        <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)] block mb-1">Email address:</span>
                        <span className="text-[14px] font-normal text-[var(--text)]">{selectedApplicant.email}</span>
                      </div>
                      <div>
                        <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)] block mb-1">County / Location:</span>
                        <span className="text-[14px] font-normal text-[var(--text)]">{selectedApplicant.county} County, CO</span>
                      </div>
                      <div>
                        <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)] block mb-1">Target schedule:</span>
                        <span className="text-[14px] font-normal text-[var(--text)]">{selectedApplicant.preferredHours || 'Full-time'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-2">
                    <h3 className="text-[16px] font-semibold text-[var(--text)]">Recruiter Notes</h3>
                    <p className="text-[14px] font-normal text-[var(--text)] leading-relaxed bg-[var(--bg)] p-3 rounded-[8px] border border-[var(--border)]">
                      {selectedApplicant.notes || 'No candidate interview notes logged yet.'}
                    </p>
                  </div>
                </div>
              )}

              {/* CREDENTIALS */}
              {activeTab === 'credentials' && (
                <div className="space-y-4">
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3">
                    <h3 className="text-[16px] font-semibold text-[var(--text)]">License & Pre-Screening Checks</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-[var(--bg)] rounded-[8px] border border-[var(--border)] text-center">
                        <span className="text-[12px] font-normal text-[var(--text-muted)] block">CPR / First Aid</span>
                        <span className={`text-[14px] font-semibold mt-1 block ${selectedApplicant.cprStatus === 'Expired' ? 'text-[var(--red)]' : 'text-[var(--text)]'}`}>
                          {selectedApplicant.cprStatus || 'Valid'}
                        </span>
                      </div>
                      <div className="p-3 bg-[var(--bg)] rounded-[8px] border border-[var(--border)] text-center">
                        <span className="text-[12px] font-normal text-[var(--text-muted)] block">TB Test</span>
                        <span className="text-[14px] font-semibold text-[var(--text)] mt-1 block">
                          {selectedApplicant.tbStatus || 'Valid'}
                        </span>
                      </div>
                      <div className="p-3 bg-[var(--bg)] rounded-[8px] border border-[var(--border)] text-center">
                        <span className="text-[12px] font-normal text-[var(--text-muted)] block">CBI Check</span>
                        <span className={`text-[14px] font-semibold mt-1 block ${selectedApplicant.cbiStatus !== 'Clear' ? 'text-[var(--amber)]' : 'text-[var(--text)]'}`}>
                          {selectedApplicant.cbiStatus || 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* TRAINING & ACADEMY SUMMARY CARD */}
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--green-700)]"></span>
                        <h3 className="text-[15px] font-semibold text-[var(--text)]">Training & Academy Readiness</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedApplicant(null);
                          navigate('training');
                        }}
                        className="text-[12px] font-semibold text-[var(--green-700)] hover:underline"
                      >
                        Open in Training →
                      </button>
                    </div>
                    <div className="p-3 bg-[var(--bg)] rounded-[8px] border border-[var(--border)] flex items-center justify-between text-[13px]">
                      <div>
                        <div className="font-semibold text-[var(--text)]">
                          {selectedApplicant.serviceClass === 'CNA'
                            ? 'LS4000 CNA Clinical Curriculum'
                            : 'LS3000 In-Home Care Foundations'}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          {selectedApplicant.currentStep >= 5
                            ? 'LearnWorlds course assigned · 60% progress · Skills validation pending'
                            : 'Training path auto-assigned upon offer acceptance and onboarding handoff'}
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                        {selectedApplicant.currentStep >= 5 ? 'In Training' : 'Pre-hire'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TRAINING & LMS TAB */}
              {activeTab === 'training' && (
                <div className="space-y-4">
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                      <div>
                        <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)] tracking-wider block">Assigned Path</span>
                        <h4 className="text-[16px] font-bold text-[var(--text)]">
                          {selectedApplicant.serviceClass === 'CNA'
                            ? 'CNA Clinical Onboarding Path (LS4000)'
                            : 'IHSS Attendant Care Foundations (LS3000)'}
                        </h4>
                      </div>
                      <span className="text-[12px] font-bold text-[var(--green-700)] bg-[var(--green-100)] px-2.5 py-1 rounded-full">
                        {selectedApplicant.currentStep >= 5 ? '60% Complete' : 'Enrolled (0%)'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[12px] font-semibold text-[var(--text)]">Activation Gate Checks</div>
                      <div className="grid grid-cols-2 gap-2 text-[12px]">
                        <div className="p-2.5 bg-[#F7F7F4] rounded-[8px] border border-[var(--border)] flex items-center justify-between">
                          <span>Orientation Course (LS1010)</span>
                          <span className="text-emerald-700 font-bold">Done ✓</span>
                        </div>
                        <div className="p-2.5 bg-[#F7F7F4] rounded-[8px] border border-[var(--border)] flex items-center justify-between">
                          <span>Foundations (LS3000)</span>
                          <span className="text-blue-700 font-bold">In progress</span>
                        </div>
                        <div className="p-2.5 bg-[#F7F7F4] rounded-[8px] border border-[var(--border)] flex items-center justify-between">
                          <span>Emergency Protocol Quiz</span>
                          <span className="text-emerald-700 font-bold">Passed (85%)</span>
                        </div>
                        <div className="p-2.5 bg-[#F7F7F4] rounded-[8px] border border-[var(--border)] flex items-center justify-between">
                          <span>RN Skills Lab Demonstration</span>
                          <span className="text-amber-700 font-bold">Scheduled Nov 20</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="text-[12px] text-[var(--text-muted)]">
                        LearnWorlds LMS API: Auto-enrolled upon candidate hire
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedApplicant(null);
                          navigate('training');
                        }}
                        className="min-h-[32px] px-3.5 rounded-[6px] bg-[var(--green-700)] text-white text-[12px] font-semibold hover:bg-[var(--green-900)] transition"
                      >
                        View Full Training Record →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* COMPENSATION & PACKET */}
              {activeTab === 'comp' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-between">
                    <div>
                      <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)] block mb-1">Agreed Hourly Rate</span>
                      <span className="text-[24px] font-bold text-[var(--text)]">
                        {selectedApplicant.targetRate || '$22.00/hr'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)] block mb-1">Employment Packet</span>
                      <span className="text-[14px] font-normal text-[var(--text)]">
                        {selectedApplicant.employmentType === '1099' ? '1099 Contractor (~15 docs)' : 'W-2 Employee (~20 docs)'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* COMMUNICATION */}
              {activeTab === 'comm' && (
                <div className="space-y-4">
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)] block">
                      Caregiver communication templates:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => applyCommTemplate('screen')}
                        className="min-h-[36px] px-3 bg-[var(--bg)] border border-[var(--border)] rounded-[8px] text-[14px] font-normal text-[var(--text)] hover:bg-[#EEF0EB]"
                      >
                        Phone screen invite
                      </button>
                      <button
                        type="button"
                        onClick={() => applyCommTemplate('interview')}
                        className="min-h-[36px] px-3 bg-[var(--bg)] border border-[var(--border)] rounded-[8px] text-[14px] font-normal text-[var(--text)] hover:bg-[#EEF0EB]"
                      >
                        Interview confirmation
                      </button>
                      <button
                        type="button"
                        onClick={() => applyCommTemplate('offer')}
                        className="min-h-[36px] px-3 bg-[var(--bg)] border border-[var(--border)] rounded-[8px] text-[14px] font-normal text-[var(--text)] hover:bg-[#EEF0EB]"
                      >
                        Offer letter
                      </button>
                    </div>
                  </div>

                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3">
                    <textarea
                      value={commDraft}
                      onChange={(e) => setCommDraft(e.target.value)}
                      placeholder="Compose message or email to caregiver applicant…"
                      rows={3}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[8px] p-2.5 text-[14px] font-normal text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setCommDraft('')}
                        className="min-h-[36px] px-3 rounded-[8px] border border-[var(--border)] bg-[var(--card)] text-[14px] font-normal text-[var(--text)] hover:bg-[#F0F2ED]"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={handleSendCommDraft}
                        className="min-h-[36px] px-4 rounded-[8px] bg-[var(--green-700)] text-white text-[14px] font-semibold hover:bg-[var(--green-900)]"
                      >
                        Send & Log
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {selectedApplicant.commLog?.map((c, i) => (
                      <div key={i} className="p-3 bg-[var(--card)] rounded-[12px] border border-[var(--border)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                        <div className="flex justify-between text-[12px] font-normal text-[var(--text-muted)] mb-1">
                          <span className="font-semibold text-[var(--text)]">{c.type} · {c.staff}</span>
                          <span>{c.date}</span>
                        </div>
                        <p className="text-[14px] font-normal text-[var(--text)]">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTIVITY */}
              {activeTab === 'activity' && (
                <div className="space-y-2">
                  {selectedApplicant.activityLog?.map((act, i) => (
                    <div key={i} className="p-3 bg-[var(--card)] rounded-[12px] border border-[var(--border)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-[12px] font-normal text-[var(--text-muted)] mb-1">
                          <span className="font-semibold text-[var(--text)]">
                            {act.isAutomated ? 'LiliSare Automation' : 'Recruiter Action'}
                          </span>
                          <span>{act.date}</span>
                        </div>
                        <p className="text-[14px] font-normal text-[var(--text)]">{act.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HIRE & MOVE TO ONBOARDING CONFIRMATION MODAL */}
      {isHireModalOpen && applicantToHire && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onKeyDown={(e) => e.key === 'Escape' && setIsHireModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Hire caregiver confirmation"
            className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-6 w-full max-w-lg shadow-2xl space-y-4"
          >
            {!hireSuccess ? (
              <>
                <div className="flex items-center gap-3 pb-3 border-b border-[var(--border)]">
                  <span className="w-10 h-10 rounded-full bg-[var(--green-100)] text-[var(--green-700)] flex items-center justify-center text-xl shrink-0 font-bold">
                    ✓
                  </span>
                  <div>
                    <h3 className="text-[16px] font-semibold text-[var(--text)]">
                      Hire {deIdentify(applicantToHire.name)} & Move to Onboarding
                    </h3>
                    <span className="text-[12px] font-normal text-[var(--text-muted)]">
                      {applicantToHire.serviceClass} · {applicantToHire.employmentType} ({applicantToHire.targetRate || '$22.00/hr'})
                    </span>
                  </div>
                </div>

                <p className="text-[14px] font-normal text-[var(--text)] leading-relaxed">
                  This will create an official Caregiver record and initiate onboarding:
                </p>

                <div className="p-3.5 bg-[var(--bg)] border border-[var(--border)] rounded-[8px] text-[14px] font-normal space-y-2 text-[var(--text)]">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--green-700)] font-bold">✓</span>
                    <span>Generate digital hiring packet ({applicantToHire.employmentType === '1099' ? '~15 docs' : '~20 docs'})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--green-700)] font-bold">✓</span>
                    <span>Initiate CBI fingerprint & Colorado background check</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--green-700)] font-bold">✓</span>
                    <span>Create LearnWorlds training profile & assign LS3000 modules</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--green-700)] font-bold">✓</span>
                    <span>Set up ADP payroll profile for verified shift time</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => setIsHireModalOpen(false)}
                    className="min-h-[36px] px-3 rounded-[8px] border border-[var(--border)] bg-[var(--card)] text-[14px] font-normal text-[var(--text)] hover:bg-[#F0F2ED]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmHire}
                    className="min-h-[36px] px-4 rounded-[8px] bg-[var(--green-700)] text-white text-[14px] font-semibold hover:bg-[var(--green-900)]"
                  >
                    Confirm Hire
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4 text-center py-2 animate-fadeIn">
                <span className="w-12 h-12 rounded-full bg-[var(--green-100)] text-[var(--green-700)] flex items-center justify-center text-2xl mx-auto font-bold">
                  ✓
                </span>
                <div>
                  <h3 className="text-[16px] font-semibold text-[var(--text)]">Caregiver Hired</h3>
                  <p className="text-[14px] font-normal text-[var(--text-muted)] mt-1">
                    {deIdentify(applicantToHire.name)} is now active in Caregiver Onboarding.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-3 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsHireModalOpen(false);
                      navigate('onboarding');
                    }}
                    className="min-h-[36px] px-4 rounded-[8px] bg-[var(--green-700)] text-white text-[14px] font-semibold hover:bg-[var(--green-900)] transition"
                  >
                    Open caregiver onboarding →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsHireModalOpen(false);
                      navigate('scheduling');
                    }}
                    className="min-h-[36px] px-4 rounded-[8px] border border-[var(--border)] bg-[var(--card)] text-[14px] font-normal text-[var(--text)] hover:bg-[#F0F2ED] transition"
                  >
                    Match with open shifts →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD CAREGIVER INQUIRY MODAL */}
      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onKeyDown={(e) => e.key === 'Escape' && setIsAddOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Add caregiver applicant"
            className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-6 w-full max-w-lg shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="text-[16px] font-semibold text-[var(--text)]">Add Caregiver Applicant</h3>
                <span className="text-[12px] font-normal text-[var(--text-muted)]">
                  Target stage: <b className="text-[var(--text)] font-semibold">{addPreselectedStage}</b>
                </span>
              </div>
              <button
                type="button"
                className={`min-h-[36px] rounded-[8px] px-3 text-[12px] font-semibold transition ${
                  isDictatingForm
                    ? 'bg-[var(--red)] text-white animate-pulse'
                    : 'bg-[#EEF0EB] text-[var(--text)] hover:bg-[#E6E8E2]'
                }`}
                onClick={simulateDictation}
              >
                {isDictatingForm ? '● Listening…' : '🎤 Dictate'}
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block sm:col-span-2">
                <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)] block mb-1">
                  Caregiver applicant name
                </span>
                <input
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Danielle Rogers"
                  className="w-full h-[36px] min-h-[36px] border border-[var(--border)] rounded-[8px] px-3 text-[14px] font-normal text-[var(--text)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)]"
                />
              </label>

              <label className="block">
                <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)] block mb-1">
                  Phone
                </span>
                <input
                  value={form.phone || ''}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(720) 555-0834"
                  className="w-full h-[36px] min-h-[36px] border border-[var(--border)] rounded-[8px] px-3 text-[14px] font-normal text-[var(--text)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)]"
                />
              </label>

              <label className="block">
                <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)] block mb-1">
                  Email
                </span>
                <input
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="candidate@example.com"
                  className="w-full h-[36px] min-h-[36px] border border-[var(--border)] rounded-[8px] px-3 text-[14px] font-normal text-[var(--text)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)]"
                />
              </label>

              <label className="block">
                <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)] block mb-1">
                  County
                </span>
                <input
                  value={form.county || ''}
                  onChange={(e) => setForm({ ...form, county: e.target.value })}
                  placeholder="e.g. Denver"
                  className="w-full h-[36px] min-h-[36px] border border-[var(--border)] rounded-[8px] px-3 text-[14px] font-normal text-[var(--text)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)]"
                />
              </label>

              <label className="block">
                <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)] block mb-1">
                  Classification
                </span>
                <select
                  value={form.emp || ''}
                  onChange={(e) => setForm({ ...form, emp: e.target.value })}
                  className="w-full h-[36px] min-h-[36px] border border-[var(--border)] rounded-[8px] px-3 bg-[var(--card)] text-[14px] font-normal text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)]"
                >
                  <option value="Employee">W-2 Employee</option>
                  <option value="1099">1099 Contractor</option>
                  <option value="Both">Both</option>
                </select>
              </label>

              <label className="block">
                <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)] block mb-1">
                  Role / Service Class
                </span>
                <select
                  value={form.serviceClass || ''}
                  onChange={(e) => setForm({ ...form, serviceClass: e.target.value })}
                  className="w-full h-[36px] min-h-[36px] border border-[var(--border)] rounded-[8px] px-3 bg-[var(--card)] text-[14px] font-normal text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)]"
                >
                  <option value="CNA">CNA</option>
                  <option value="IHSS">IHSS Attendant</option>
                  <option value="Personal Care">Personal Care</option>
                  <option value="HMA">HMA Delegated</option>
                  <option value="SCC">SCC Companion</option>
                </select>
              </label>

              <label className="block">
                <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)] block mb-1">
                  Target Hourly Rate
                </span>
                <input
                  value={form.rate || ''}
                  onChange={(e) => setForm({ ...form, rate: e.target.value })}
                  placeholder="$22.00/hr"
                  className="w-full h-[36px] min-h-[36px] border border-[var(--border)] rounded-[8px] px-3 text-[14px] font-normal text-[var(--text)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)]"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)] block mb-1">
                  Initial Recruiter Notes
                </span>
                <textarea
                  value={form.notes || ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder="Certifications, shift preferences, transportation reliability…"
                  className="w-full border border-[var(--border)] rounded-[8px] p-2.5 text-[14px] font-normal text-[var(--text)] bg-[var(--card)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)]"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="min-h-[36px] px-3 rounded-[8px] border border-[var(--border)] bg-[var(--card)] text-[14px] font-normal text-[var(--text)] hover:bg-[#F0F2ED]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveApplicant}
                className="min-h-[36px] px-4 rounded-[8px] bg-[var(--green-700)] text-white text-[14px] font-semibold hover:bg-[var(--green-900)]"
              >
                Save Applicant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
