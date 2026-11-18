'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  TRAINING_PATHS,
  TRAINING_COURSES,
  TRAINING_ASSIGNMENTS,
  TRAINING_SESSIONS,
  TRAINING_RULES,
  SKILLS_CHECKLIST,
  TrainingAssignmentRecord,
  TrainingPath,
  TrainingCourse,
  LiveSession,
  TrainingTimelineStep,
} from '@/data/trainingData';

export const TrainingPage: React.FC = () => {
  const { showToast, navigate, deIdentify } = useApp();

  // Active Tab: 'overview' | 'assignments' | 'paths' | 'sessions'
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'paths' | 'sessions'>('overview');

  // Sync state simulation
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('2 minutes ago');

  // De-identified practice sandbox toggle
  const [sandboxMode, setSandboxMode] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Assignments Tab Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPathFilter, setSelectedPathFilter] = useState('All');
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedRecruiterFilter, setSelectedRecruiterFilter] = useState('All');
  const [overdueOnly, setOverdueOnly] = useState(false);

  // Bulk Selection
  const [selectedAssignmentIds, setSelectedAssignmentIds] = useState<string[]>([]);

  // Drawer & Modals State
  const [selectedCaregiverForDrawer, setSelectedCaregiverForDrawer] = useState<TrainingAssignmentRecord | null>(null);
  const [manualCompleteStep, setManualCompleteStep] = useState<{ caregiverId: string; stepIndex: number; title: string } | null>(null);
  const [manualReason, setManualReason] = useState('');

  // Course & Path Modals
  const [editingPath, setEditingPath] = useState<TrainingPath | null>(null);
  const [isAddPathModalOpen, setIsAddPathModalOpen] = useState(false);
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [newPathName, setNewPathName] = useState('');
  const [newPathClass, setNewPathClass] = useState('IHSS');

  // Sessions & Skills Validation
  const [isScheduleSessionModalOpen, setIsScheduleSessionModalOpen] = useState(false);
  const [activeSkillsValidation, setActiveSkillsValidation] = useState<TrainingAssignmentRecord | null>(null);
  const [skillsScores, setSkillsScores] = useState<Record<string, 'Pass' | 'Needs practice'>>({});
  const [validatorNotes, setValidatorNotes] = useState('');
  const [validatorSignature, setValidatorSignature] = useState('Dana Whitfield, RN #RN-48291');

  // Caregiver Phone Mobile Preview Modal
  const [isCaregiverPhoneOpen, setIsCaregiverPhoneOpen] = useState(false);
  const [phoneLang, setPhoneLang] = useState<'en' | 'es'>('en');

  // Mutable mock datasets
  const [assignments, setAssignments] = useState<TrainingAssignmentRecord[]>(TRAINING_ASSIGNMENTS);
  const [sessions, setSessions] = useState<LiveSession[]>(TRAINING_SESSIONS);

  // Handle LearnWorlds Demo Sync
  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime('Just now');
      showToast('LearnWorlds sync simulated: 44 caregiver LMS records synchronized (Release 2 feature)');
    }, 1200);
  };

  // Filtered Assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      if (overdueOnly && !item.isOverdue) return false;
      if (selectedPathFilter !== 'All' && item.pathName !== selectedPathFilter) return false;
      if (selectedClassFilter !== 'All' && item.classification !== selectedClassFilter) return false;
      if (selectedStatusFilter !== 'All' && item.status !== selectedStatusFilter) return false;
      if (selectedRecruiterFilter !== 'All' && item.recruiter !== selectedRecruiterFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.caregiverName.toLowerCase().includes(q) ||
          item.linkedClient.toLowerCase().includes(q) ||
          item.pathName.toLowerCase().includes(q) ||
          item.currentStep.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [assignments, overdueOnly, selectedPathFilter, selectedClassFilter, selectedStatusFilter, selectedRecruiterFilter, searchQuery]);

  // Bulk actions
  const toggleSelectAll = () => {
    if (selectedAssignmentIds.length === filteredAssignments.length) {
      setSelectedAssignmentIds([]);
    } else {
      setSelectedAssignmentIds(filteredAssignments.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedAssignmentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkRemind = () => {
    showToast(`Bilingual reminders sent via SMS & email to ${selectedAssignmentIds.length} caregivers.`);
    setSelectedAssignmentIds([]);
  };

  const handleBulkExtend = () => {
    showToast(`Due date extended by 7 days for ${selectedAssignmentIds.length} selected caregivers.`);
    setSelectedAssignmentIds([]);
  };

  // Manual Completion Confirmation
  const submitManualCompletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualReason.trim() || !manualCompleteStep) {
      showToast('Please state a valid clinical or administrative reason.');
      return;
    }

    setAssignments((prev) =>
      prev.map((cg) => {
        if (cg.id !== manualCompleteStep.caregiverId) return cg;
        const updatedTimeline = cg.timeline.map((step) => {
          if (step.stepIndex === manualCompleteStep.stepIndex) {
            return {
              ...step,
              status: 'Complete' as const,
              completedAt: 'Just now (Manual override)',
              isManualCompletion: true,
              manualReason: manualReason.trim(),
            };
          }
          return step;
        });

        const allDone = updatedTimeline.every((s) => s.status === 'Complete');
        return {
          ...cg,
          timeline: updatedTimeline,
          progressPercent: allDone ? 100 : Math.min(100, cg.progressPercent + 20),
          status: allDone ? ('Complete' as const) : cg.status,
          currentStep: allDone ? 'All Onboarding Steps Complete' : cg.currentStep,
          activationGate: {
            ...cg.activationGate,
            training: allDone ? true : cg.activationGate.training,
          },
          activityLog: [
            {
              timestamp: 'Just now',
              action: `Manual override: Marked ${manualCompleteStep.title} complete`,
              actor: 'Compliance Administrator',
              type: 'human' as const,
              details: `Reason: ${manualReason.trim()}`,
            },
            ...cg.activityLog,
          ],
        };
      })
    );

    if (selectedCaregiverForDrawer?.id === manualCompleteStep.caregiverId) {
      setSelectedCaregiverForDrawer((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          timeline: prev.timeline.map((s) =>
            s.stepIndex === manualCompleteStep.stepIndex
              ? { ...s, status: 'Complete' as const, completedAt: 'Just now (Manual)', isManualCompletion: true, manualReason: manualReason.trim() }
              : s
          ),
        };
      });
    }

    showToast(`Manual completion recorded and logged for ${manualCompleteStep.title}.`);
    setManualCompleteStep(null);
    setManualReason('');
  };

  // Skills Validation Form Submission
  const handleSignSkillsValidation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSkillsValidation) return;

    setAssignments((prev) =>
      prev.map((cg) => {
        if (cg.id !== activeSkillsValidation.id) return cg;
        const updatedTimeline = cg.timeline.map((s) => {
          if (s.category === 'Skills Lab') {
            return {
              ...s,
              status: 'Complete' as const,
              completedAt: 'Just now',
              validator: validatorSignature,
              details: `All items demonstrated. Validator notes: ${validatorNotes || 'Satisfactory clinical technique observed.'}`,
            };
          }
          return s;
        });

        const allDone = updatedTimeline.every((s) => s.status === 'Complete');
        return {
          ...cg,
          timeline: updatedTimeline,
          progressPercent: allDone ? 100 : Math.min(100, cg.progressPercent + 25),
          status: allDone ? ('Complete' as const) : cg.status,
          currentStep: allDone ? 'All Onboarding Steps Complete' : cg.currentStep,
          activationGate: {
            ...cg.activationGate,
            skillsValidation: true,
            training: allDone ? true : cg.activationGate.training,
          },
          activityLog: [
            {
              timestamp: 'Just now',
              action: 'Passed Clinical Skills Demonstration',
              actor: validatorSignature,
              type: 'human' as const,
              details: 'Skills checklist evaluated: 100% Pass. Activation gate updated.',
            },
            ...cg.activityLog,
          ],
        };
      })
    );

    showToast(`Skills validation approved and signed for ${activeSkillsValidation.caregiverName}!`);
    setActiveSkillsValidation(null);
    setValidatorNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. PAGE HEADER (Pure LiliSphere typography, no huge wrapper card) */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[28px] font-bold text-[var(--text)] leading-tight">
              Training
            </h1>
            <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-[var(--green-100)] text-[var(--green-900)] border border-[#CDE0C6]">
              Academy & Skills
            </span>
            <span className="text-[12px] font-normal text-[var(--text-muted)] flex items-center gap-1.5 bg-white border border-[var(--border)] px-2.5 py-0.5 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
              <span>LearnWorlds sync: planned (Release 2)</span>
              <span className="text-[11px] text-stone-400">· {lastSyncTime}</span>
            </span>
          </div>
          <p className="text-[14px] font-normal text-[var(--text-muted)] mt-1">
            {activeTab === 'overview' && 'High-level metrics, urgent training bottlenecks, and completion by path.'}
            {activeTab === 'assignments' && 'Track caregiver progress, due dates, and individual training records.'}
            {activeTab === 'paths' && 'Curriculum catalog, learning paths, and course requirements.'}
            {activeTab === 'sessions' && 'Live virtual orientations, skills lab evaluations, and clinical sign-offs.'}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="min-h-[36px] px-3.5 rounded-[8px] bg-white border border-[var(--border)] text-[var(--text)] text-[13px] font-semibold hover:bg-[#F0F2ED] transition shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center gap-2 disabled:opacity-50"
          >
            <svg className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isSyncing ? 'Syncing LMS…' : 'Sync now'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCaregiverPhoneOpen(true)}
            className="min-h-[36px] px-4 rounded-[8px] bg-[var(--green-700)] text-white text-[14px] font-semibold hover:bg-[var(--green-900)] transition shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>Caregiver mobile view</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ACTIVATION GATE PRINCIPLE BANNER (Forest Green LiliSphere Theme) */}
      {/* ========================================================================= */}
      <div className="bg-[var(--green-100)] border border-[#CDE0C6] rounded-[10px] px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px] text-[var(--green-900)]">
        <div className="flex items-center gap-2.5">
          <svg className="w-4 h-4 shrink-0 text-[var(--green-700)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="leading-snug">
            <strong>Core Activation Gate:</strong> Training status feeds the caregiver&apos;s activation gate, but a completed course alone never makes a caregiver &ldquo;Ready&rdquo;. All checks (documents, screening, training, validation, authorization) must be green.
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('rules')}
          className="font-semibold text-[var(--green-700)] hover:text-[var(--green-900)] underline shrink-0 text-[12px]"
        >
          View activation rules →
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. SUMMARY STRIP (Exact match to Caregiver Intake & LiliSphere theme) */}
      {/* ========================================================================= */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]">
        <div className="px-4 py-1 first:pl-0 last:pr-0">
          <div className="text-[12px] font-normal text-[var(--text-muted)] mb-1">Caregivers in training</div>
          <div className="text-[24px] font-bold text-[var(--text)] leading-none">44</div>
        </div>
        <div className="px-4 py-1 first:pl-0 last:pr-0">
          <div className="text-[12px] font-normal text-[var(--text-muted)] mb-1">Overdue training</div>
          <div className="text-[24px] font-bold text-[var(--red)] leading-none">9</div>
        </div>
        <div className="px-4 py-1 first:pl-0 last:pr-0">
          <div className="text-[12px] font-normal text-[var(--text-muted)] mb-1">Due in 30 days</div>
          <div className="text-[24px] font-bold text-[var(--text)] leading-none">31</div>
        </div>
        <div className="px-4 py-1 first:pl-0 last:pr-0">
          <div className="text-[12px] font-normal text-[var(--text-muted)] mb-1">Awaiting skills validation</div>
          <div className="text-[24px] font-bold text-[var(--text)] leading-none">12</div>
        </div>
        <div className="px-4 py-1 first:pl-0 last:pr-0">
          <div className="text-[12px] font-normal text-[var(--text-muted)] mb-1">Avg days to complete</div>
          <div className="text-[24px] font-bold text-[var(--text)] leading-none">6d</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TABS NAVIGATION (Clean LiliSphere buttons, no floating emojis) */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'assignments', label: 'Assignments', count: assignments.length },
          { id: 'paths', label: 'Courses and Paths', count: TRAINING_PATHS.length },
          { id: 'sessions', label: 'Sessions and Skills', count: sessions.length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-[13px] font-semibold transition ${
              activeTab === tab.id
                ? 'bg-[var(--green-700)] text-white shadow-2xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[#F0F2ED]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#EAECE6] text-[var(--text-muted)]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (7 cols): Needs Attention List */}
          <div className="lg:col-span-7 bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="text-[16px] font-bold text-[var(--text)]">Needs attention</h3>
                <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Urgent bottlenecks blocking caregiver activation gate</p>
              </div>
              <span className="text-[11px] font-bold text-[var(--red)] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                6 items
              </span>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {[
                {
                  title: '9 caregivers overdue on orientation course',
                  detail: 'Have not watched LS1010 within 48h of account creation.',
                  actionLabel: 'Send reminder',
                  onClick: () => showToast('Bilingual SMS & email reminders dispatched to all 9 overdue caregivers.'),
                  isOverdue: true,
                },
                {
                  title: '12 waiting for skills validation',
                  detail: 'Clinical lab competency demonstration needed with Dana Whitfield, RN.',
                  actionLabel: 'Schedule',
                  onClick: () => setIsScheduleSessionModalOpen(true),
                  isOverdue: false,
                },
                {
                  title: '5 failed a quiz twice',
                  detail: 'Automated retakes locked. 1-on-1 coaching required before attempt 3.',
                  actionLabel: 'Review',
                  onClick: () => {
                    setActiveTab('assignments');
                    setSearchQuery('Grace Park');
                  },
                  isOverdue: false,
                },
                {
                  title: '31 annual trainings due in 30 days',
                  detail: 'HCPF mandatory 12-month re-certification refresher path.',
                  actionLabel: 'Remind all',
                  onClick: () => showToast('Batch reminder queued for 31 caregivers due for annual refresher.'),
                  isOverdue: false,
                },
                {
                  title: '3 CPR / First Aid credentials expired',
                  detail: 'American Heart Association or Red Cross renewal cards required.',
                  actionLabel: 'Flag in Compliance',
                  onClick: () => navigate('compliance'),
                  isOverdue: true,
                },
                {
                  title: '4 Spanish orientation packets pending review',
                  detail: 'Bilingual applicant submissions awaiting recruiter verification.',
                  actionLabel: 'Assign reviewer',
                  onClick: () => showToast('Spanish packets routed to Alicia T. for review.'),
                  isOverdue: false,
                },
              ].map((item, idx) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.isOverdue ? 'bg-[var(--red)]' : 'bg-[var(--green-700)]'}`} />
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-[var(--text)] leading-tight">{item.title}</div>
                      <div className="text-[12px] text-[var(--text-muted)] mt-0.5">{item.detail}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="min-h-[30px] px-3 rounded-[6px] border border-[var(--border)] bg-white text-[12px] font-semibold text-[var(--green-700)] hover:bg-[var(--green-100)] transition shrink-0 shadow-2xs"
                  >
                    {item.actionLabel}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (5 cols): Path Progress & White Sandbox Card */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Completion by Training Path Card */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div>
                  <h3 className="text-[16px] font-bold text-[var(--text)]">Completion by Path</h3>
                  <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Active cohorts progress towards activation</p>
                </div>
                <span className="text-[11px] font-semibold text-[var(--green-900)] bg-[var(--green-100)] px-2 py-0.5 rounded-full">
                  7 Paths
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'IHSS Attendant Care', pct: 92, count: 18 },
                  { name: 'Employee Onboarding (W-2)', pct: 86, count: 22 },
                  { name: 'Personal Care / Homemaker', pct: 81, count: 9 },
                  { name: '1099 Contractor Onboarding', pct: 74, count: 7 },
                  { name: 'CNA Clinical Onboarding', pct: 68, count: 8 },
                  { name: 'Annual Refresher Renewal', pct: 63, count: 31 },
                  { name: 'Health Maintenance (HMA)', pct: 59, count: 6 },
                ].map((p, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-[var(--text)]">{p.name}</span>
                      <span className="text-[var(--text-muted)]">{p.count} caregivers · <strong className="text-[var(--text)]">{p.pct}%</strong></span>
                    </div>
                    <div className="w-full bg-[#EAECE6] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[var(--green-700)] h-full rounded-full transition-all duration-300"
                        style={{ width: `${p.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Training Sandbox Card (100% white theme, no pitch-black background) */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--green-700)]"></span>
                  <h4 className="text-[14px] font-bold text-[var(--text)]">Training Sandbox</h4>
                </div>
                <span className="text-[11px] font-semibold text-[var(--green-900)] bg-[var(--green-100)] px-2 py-0.5 rounded-full">
                  Demo Mode
                </span>
              </div>

              <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">
                Practice documentation, mock EVV clock-ins, and produce training videos with de-identified patient data to maintain zero HIPAA risk.
              </p>

              <div className="p-3 bg-[#F7F7F4] border border-[var(--border)] rounded-[8px] flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-semibold text-[var(--text)]">De-identify Client PII</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Mask names and addresses during demo sessions</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSandboxMode(!sandboxMode);
                    showToast(sandboxMode ? 'Sandbox de-identification disabled.' : 'Sandbox de-identification active.');
                  }}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    sandboxMode ? 'bg-[var(--green-700)]' : 'bg-stone-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      sandboxMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                className="w-full min-h-[32px] px-3 rounded-[6px] border border-[var(--border)] bg-white text-[12px] font-semibold text-[var(--text)] hover:bg-[#F0F2ED] transition shadow-2xs flex items-center justify-center gap-2"
              >
                <svg className="w-3.5 h-3.5 text-[var(--green-700)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Record training video</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ASSIGNMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          
          {/* Auto-assignment notification banner */}
          <div className="bg-[#F7F7F4] border border-[var(--border)] rounded-[10px] px-4 py-2.5 flex items-center justify-between text-[12px] text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <span className="text-amber-600 font-bold">⚡</span>
              <span>Training is assigned automatically when a service classification is selected during onboarding.</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('rules')}
              className="font-semibold text-[var(--green-700)] hover:underline shrink-0"
            >
              View automation rules →
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative min-w-[200px] max-w-xs">
                <input
                  type="text"
                  placeholder="Search caregiver, client, or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-[#F7F7F4] border border-[var(--border)] rounded-[8px] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--green-700)]"
                />
                <svg className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Path Filter */}
              <select
                value={selectedPathFilter}
                onChange={(e) => setSelectedPathFilter(e.target.value)}
                className="text-[12px] bg-[#F7F7F4] border border-[var(--border)] rounded-[8px] px-2.5 py-1.5 text-[var(--text)] focus:outline-none"
              >
                <option value="All">All Paths</option>
                {TRAINING_PATHS.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>

              {/* Classification Filter */}
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="text-[12px] bg-[#F7F7F4] border border-[var(--border)] rounded-[8px] px-2.5 py-1.5 text-[var(--text)] focus:outline-none"
              >
                <option value="All">All Classifications</option>
                <option value="IHSS">IHSS</option>
                <option value="CFC">CFC</option>
                <option value="HCBS">HCBS</option>
                <option value="IRSS">IRSS</option>
                <option value="CNA">CNA</option>
                <option value="HMA">HMA</option>
                <option value="PCW">PCW</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="text-[12px] bg-[#F7F7F4] border border-[var(--border)] rounded-[8px] px-2.5 py-1.5 text-[var(--text)] focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="In progress">In progress</option>
                <option value="Overdue">Overdue</option>
                <option value="Complete">Complete</option>
                <option value="Not started">Not started</option>
              </select>

              {/* Overdue Only Toggle */}
              <label className="flex items-center gap-1.5 text-[12px] text-[var(--text)] cursor-pointer select-none pl-1">
                <input
                  type="checkbox"
                  checked={overdueOnly}
                  onChange={(e) => setOverdueOnly(e.target.checked)}
                  className="rounded text-[var(--green-700)] focus:ring-[var(--green-700)]"
                />
                <span>Overdue only</span>
              </label>
            </div>

            {/* Bulk Actions (When Items Selected) */}
            {selectedAssignmentIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-[var(--green-900)] bg-[var(--green-100)] px-2 py-0.5 rounded-full">
                  {selectedAssignmentIds.length} selected
                </span>
                <button
                  type="button"
                  onClick={handleBulkRemind}
                  className="min-h-[30px] px-3 rounded-[6px] bg-[var(--green-700)] text-white text-[12px] font-semibold hover:bg-[var(--green-900)] transition"
                >
                  Send reminder
                </button>
                <button
                  type="button"
                  onClick={handleBulkExtend}
                  className="min-h-[30px] px-3 rounded-[6px] border border-[var(--border)] bg-white text-[12px] font-semibold text-[var(--text)] hover:bg-[#F0F2ED] transition"
                >
                  Extend due date
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F7F4] border-b border-[var(--border)] text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedAssignmentIds.length > 0 && selectedAssignmentIds.length === filteredAssignments.length}
                        onChange={toggleSelectAll}
                        className="rounded text-[var(--green-700)]"
                      />
                    </th>
                    <th className="py-3 px-4">Caregiver</th>
                    <th className="py-3 px-4">Classification</th>
                    <th className="py-3 px-4">Assigned Path</th>
                    <th className="py-3 px-4 min-w-[130px]">Progress</th>
                    <th className="py-3 px-4">Current Step</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-[13px]">
                  {filteredAssignments.map((cg) => (
                    <tr
                      key={cg.id}
                      onClick={() => setSelectedCaregiverForDrawer(cg)}
                      className="hover:bg-[#F9FAF8] transition cursor-pointer"
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedAssignmentIds.includes(cg.id)}
                          onChange={() => toggleSelectOne(cg.id)}
                          className="rounded text-[var(--green-700)]"
                        />
                      </td>

                      {/* Caregiver Name & Household info */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[var(--text)]">
                          {deIdentify(cg.caregiverName)}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)]">
                          {cg.isFamily ? 'Family Caregiver' : 'Standard Caregiver'} · {cg.employmentType}
                        </div>
                      </td>

                      {/* Classification Chip */}
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-800">
                          {cg.classification}
                        </span>
                      </td>

                      {/* Assigned Path */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-[var(--text)] flex items-center gap-1.5">
                          <span>{cg.pathName}</span>
                          {cg.isAutomated && (
                            <span title="Assigned automatically via service rule" className="text-amber-600 text-xs">
                              ⚡
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Progress bar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-[#EAECE6] h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${cg.isOverdue ? 'bg-[var(--red)]' : 'bg-[var(--green-700)]'}`}
                              style={{ width: `${cg.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-[var(--text)] w-8 text-right">
                            {cg.progressPercent}%
                          </span>
                        </div>
                      </td>

                      {/* Current Step */}
                      <td className="py-3 px-4 text-[12px] text-[var(--text-muted)]">
                        {cg.currentStep}
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-4 text-[12px]">
                        <span className={cg.isOverdue ? 'text-[var(--red)] font-semibold' : 'text-[var(--text)]'}>
                          {cg.dueDate}
                        </span>
                      </td>

                      {/* Status Chip */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            cg.status === 'Complete'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : cg.status === 'Overdue'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : cg.status === 'In progress'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-stone-100 text-stone-700 border border-stone-200'
                          }`}
                        >
                          {cg.status}
                        </span>
                      </td>

                      {/* Row Action Button */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedCaregiverForDrawer(cg)}
                          className="min-h-[28px] px-2.5 rounded-[6px] border border-[var(--border)] text-[11px] font-semibold text-[var(--green-700)] hover:bg-[var(--green-100)] transition"
                        >
                          View record
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

      {/* ========================================================================= */}
      {/* TAB 3: COURSES AND PATHS */}
      {/* ========================================================================= */}
      {activeTab === 'paths' && (
        <div className="space-y-6">
          
          {/* Paths Section */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[16px] font-bold text-[var(--text)]">Learning Paths</h3>
              <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Role-specific training blueprints mapped to LearnWorlds LMS courses</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddPathModalOpen(true)}
              className="min-h-[36px] px-3.5 rounded-[8px] bg-[var(--green-700)] text-white text-[13px] font-semibold hover:bg-[var(--green-900)] transition flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <span>+</span>
              <span>New Path</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRAINING_PATHS.map((path) => (
              <div
                key={path.id}
                className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                      {path.classification}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {path.assignedCount} active caregivers
                    </span>
                  </div>

                  <h4 className="text-[15px] font-bold text-[var(--text)] mt-2">
                    {path.name}
                  </h4>
                  <p className="text-[12px] text-[var(--text-muted)] mt-1">
                    {path.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-1.5">
                    <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">Required Steps:</div>
                    <div className="space-y-1 text-[12px]">
                      {path.courses.slice(0, 3).map((c, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[var(--text)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--green-700)]"></span>
                          <span className="truncate">{c}</span>
                        </div>
                      ))}
                      {path.courses.length > 3 && (
                        <div className="text-[11px] text-[var(--text-muted)] pl-3">
                          +{path.courses.length - 3} more steps (quizzes & skills lab)
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[var(--text-muted)]">
                    Est. duration: {path.duration}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingPath(path)}
                    className="text-[12px] font-semibold text-[var(--green-700)] hover:underline"
                  >
                    Edit Path →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Courses Catalog Table */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-[var(--text)]">LearnWorlds Course Catalog</h3>
                <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Individual learning modules synchronized with LearnWorlds LMS API</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCourseModalOpen(true)}
                className="min-h-[32px] px-3 rounded-[6px] border border-[var(--border)] bg-white text-[12px] font-semibold text-[var(--text)] hover:bg-[#F0F2ED] transition shadow-2xs"
              >
                + Add Course
              </button>
            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F7F4] border-b border-[var(--border)] text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    <th className="py-3 px-4">Course Code</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">LearnWorlds ID</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Pass Mark</th>
                    <th className="py-3 px-4">Renewal Cycle</th>
                    <th className="py-3 px-4 text-right">LMS Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-[13px]">
                  {TRAINING_COURSES.map((course) => (
                    <tr key={course.id} className="hover:bg-[#F9FAF8] transition">
                      <td className="py-3 px-4 font-mono font-bold text-[12px] text-[var(--green-900)]">
                        {course.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[var(--text)]">{course.name}</div>
                        <div className="text-[11px] text-[var(--text-muted)]">{course.type} · {course.summary}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-stone-500">
                        {course.learnWorldsId}
                      </td>
                      <td className="py-3 px-4 text-[12px] text-[var(--text)]">
                        {course.duration}
                      </td>
                      <td className="py-3 px-4 text-[12px] font-semibold text-[var(--text)]">
                        {course.passMark}
                      </td>
                      <td className="py-3 px-4 text-[12px] text-[var(--text-muted)]">
                        {course.renewalCycle}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Linked (R2)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SESSIONS AND SKILLS */}
      {/* ========================================================================= */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[16px] font-bold text-[var(--text)]">Live Sessions & Skills Validation</h3>
              <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Virtual orientation cohorts and in-person RN clinical competency labs</p>
            </div>
            <button
              type="button"
              onClick={() => setIsScheduleSessionModalOpen(true)}
              className="min-h-[36px] px-3.5 rounded-[8px] bg-[var(--green-700)] text-white text-[13px] font-semibold hover:bg-[var(--green-900)] transition flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <span>+</span>
              <span>Schedule Session</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        sess.type === 'Skills Validation Lab'
                          ? 'bg-purple-50 text-purple-800 border border-purple-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {sess.type}
                    </span>
                    <span className="text-[11px] font-bold text-[var(--text)]">
                      {sess.attendees.length} / {sess.capacity} enrolled
                    </span>
                  </div>

                  <h4 className="text-[15px] font-bold text-[var(--text)] mt-2">
                    {sess.title}
                  </h4>
                  <div className="text-[12px] text-[var(--text-muted)] space-y-0.5 mt-2">
                    <div>📅 {sess.date} · {sess.time}</div>
                    <div>📍 {sess.location || sess.zoomLink || 'Denver Training Center'}</div>
                    <div>👩‍⚕️ Host: {sess.host}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-muted)]">
                    Language: <strong className="text-[var(--text)]">{sess.language}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      // Open clinical skills evaluation modal for first pending caregiver
                      const candidate = assignments.find((a) => !a.activationGate.skillsValidation);
                      if (candidate) {
                        setActiveSkillsValidation(candidate);
                      } else {
                        showToast('All caregivers in this session have completed validation.');
                      }
                    }}
                    className="text-[12px] font-semibold text-[var(--green-700)] hover:underline"
                  >
                    Evaluate skills →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Clinical Skills Competency Checklist Overview */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h4 className="text-[15px] font-bold text-[var(--text)]">HCPF Clinical Skills Competency Standards</h4>
                <p className="text-[12px] text-[var(--text-muted)]">Colorado regulatory demonstration checklist required before client dispatch</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const candidate = assignments[0];
                  setActiveSkillsValidation(candidate);
                }}
                className="min-h-[30px] px-3 rounded-[6px] bg-[var(--green-700)] text-white text-[12px] font-semibold hover:bg-[var(--green-900)] transition"
              >
                Open Evaluation Form
              </button>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
              {SKILLS_CHECKLIST.map((item) => (
                <div key={item.id} className="p-3 bg-[#F7F7F4] border border-[var(--border)] rounded-[8px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase text-[var(--text-muted)]">{item.category}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--green-700)]" />
                  </div>
                  <div className="text-[13px] font-semibold text-[var(--text)]">{item.name}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{item.description}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CAREGIVER TRAINING RECORD DRAWER (Slide-Over) */}
      {/* ========================================================================= */}
      {selectedCaregiverForDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-2xs transition-opacity"
            onClick={() => setSelectedCaregiverForDrawer(null)}
          />

          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 border-l border-[var(--border)] overflow-hidden">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-[var(--border)] bg-[#F7F7F4] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[20px] font-bold text-[var(--text)]">
                      {deIdentify(selectedCaregiverForDrawer.caregiverName)}
                    </h2>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-800">
                      {selectedCaregiverForDrawer.classification}
                    </span>
                    {selectedCaregiverForDrawer.isFamily && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--green-100)] text-[var(--green-900)] border border-[#CDE0C6]">
                        Family Caregiver
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-[var(--text-muted)] mt-0.5">
                    Linked Client: <strong>{deIdentify(selectedCaregiverForDrawer.linkedClient)}</strong> · {selectedCaregiverForDrawer.employmentType}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCaregiverForDrawer(null)}
                  className="w-8 h-8 rounded-[6px] border border-[var(--border)] bg-white text-stone-500 hover:text-stone-800 flex items-center justify-center transition"
                >
                  ✕
                </button>
              </div>

              {/* 5-part Activation Gate Checklist */}
              <div className="p-3 bg-white border border-[var(--border)] rounded-[8px] space-y-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-bold text-[var(--text)]">Readiness Activation Gate</span>
                  <span className="text-[11px] text-[var(--text-muted)]">HIPAA & State Cleared</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 text-center text-[11px]">
                  <div className="p-1.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                    Docs ✓
                  </div>
                  <div className="p-1.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                    Screening ✓
                  </div>
                  <div className={`p-1.5 rounded font-semibold border ${
                    selectedCaregiverForDrawer.activationGate.training
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-blue-50 text-blue-800 border-blue-200'
                  }`}>
                    {selectedCaregiverForDrawer.activationGate.training ? 'Training ✓' : 'Training ⏳'}
                  </div>
                  <div className={`p-1.5 rounded font-semibold border ${
                    selectedCaregiverForDrawer.activationGate.skillsValidation
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {selectedCaregiverForDrawer.activationGate.skillsValidation ? 'Skills ✓' : 'Skills ⏳'}
                  </div>
                  <div className="p-1.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                    Auth ✓
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Body Scroll Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Progress Bar & Assigned Path */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-bold text-[var(--text)]">{selectedCaregiverForDrawer.pathName}</span>
                  <span className="font-bold text-[var(--green-700)]">{selectedCaregiverForDrawer.progressPercent}% Complete</span>
                </div>
                <div className="w-full bg-[#EAECE6] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[var(--green-700)] h-full rounded-full transition-all duration-300"
                    style={{ width: `${selectedCaregiverForDrawer.progressPercent}%` }}
                  />
                </div>
                <div className="text-[12px] text-[var(--text-muted)] flex items-center justify-between">
                  <span>Current: {selectedCaregiverForDrawer.currentStep}</span>
                  <span>Due: {selectedCaregiverForDrawer.dueDate}</span>
                </div>
              </div>

              {/* Step Timeline */}
              <div className="space-y-3">
                <h4 className="text-[14px] font-bold text-[var(--text)]">Required Curriculum Timeline</h4>
                <div className="space-y-3">
                  {selectedCaregiverForDrawer.timeline.map((step) => (
                    <div
                      key={step.stepIndex}
                      className="p-3.5 bg-[#F7F7F4] border border-[var(--border)] rounded-[8px] space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-bold text-[var(--text-muted)]">
                              Step {step.stepIndex}
                            </span>
                            <span className="text-[13px] font-semibold text-[var(--text)]">
                              {step.title}
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                            {step.category} · {step.details}
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            step.status === 'Complete'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : step.status === 'In progress'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {step.status}
                        </span>
                      </div>

                      {/* Manual override action if incomplete */}
                      {step.status !== 'Complete' && (
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-200">
                          <button
                            type="button"
                            onClick={() => showToast(`Bilingual reminder sent to ${selectedCaregiverForDrawer.caregiverName} for ${step.title}.`)}
                            className="text-[11px] font-semibold text-[var(--green-700)] hover:underline"
                          >
                            Send reminder
                          </button>
                          <span className="text-stone-300">·</span>
                          <button
                            type="button"
                            onClick={() =>
                              setManualCompleteStep({
                                caregiverId: selectedCaregiverForDrawer.id,
                                stepIndex: step.stepIndex,
                                title: step.title,
                              })
                            }
                            className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 hover:underline"
                          >
                            Mark complete (manual)
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Issued Certificates */}
              <div className="space-y-3">
                <h4 className="text-[14px] font-bold text-[var(--text)]">Certificates Issued</h4>
                <div className="space-y-2">
                  {selectedCaregiverForDrawer.certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-3 bg-white border border-[var(--border)] rounded-[8px] flex items-center justify-between text-[12px]"
                    >
                      <div>
                        <div className="font-semibold text-[var(--text)]">{cert.title}</div>
                        <div className="text-[11px] text-[var(--text-muted)]">Issued {cert.issueDate} · Verification ID: {cert.id}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => showToast(`Downloaded certificate PDF: ${cert.title}`)}
                        className="min-h-[28px] px-2.5 rounded-[6px] border border-[var(--border)] text-[11px] font-semibold text-[var(--green-700)] hover:bg-[var(--green-100)] transition"
                      >
                        PDF
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit trail */}
              <div className="space-y-2">
                <h4 className="text-[14px] font-bold text-[var(--text)]">Audit Trail</h4>
                <div className="space-y-1.5 text-[12px]">
                  {selectedCaregiverForDrawer.activityLog.map((log, i) => (
                    <div key={i} className="p-2 bg-[#F7F7F4] rounded-[6px] border border-[var(--border)]">
                      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                        <span>{log.actor} ({log.type})</span>
                        <span>{log.timestamp}</span>
                      </div>
                      <div className="font-medium text-[var(--text)] mt-0.5">{log.action}</div>
                      {log.details && <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{log.details}</div>}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[var(--border)] bg-[#F7F7F4] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  showToast(`All training records for ${selectedCaregiverForDrawer.caregiverName} exported as verified ZIP.`);
                }}
                className="min-h-[32px] px-3 rounded-[6px] border border-[var(--border)] bg-white text-[12px] font-semibold text-[var(--text)] hover:bg-[#F0F2ED] transition"
              >
                Export records
              </button>
              <button
                type="button"
                onClick={() => setSelectedCaregiverForDrawer(null)}
                className="min-h-[32px] px-4 rounded-[6px] bg-[var(--green-700)] text-white text-[12px] font-semibold hover:bg-[var(--green-900)] transition"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MANUAL COMPLETION REASON MODAL */}
      {/* ========================================================================= */}
      {manualCompleteStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-[12px] border border-[var(--border)] max-w-md w-full p-5 shadow-2xl space-y-4">
            <div>
              <h3 className="text-[16px] font-bold text-[var(--text)]">
                Document Manual Completion
              </h3>
              <p className="text-[12px] text-[var(--text-muted)] mt-1">
                State clinical reason for overriding &ldquo;{manualCompleteStep.title}&rdquo;. This action will be permanently recorded in the HIPAA audit log.
              </p>
            </div>

            <form onSubmit={submitManualCompletion} className="space-y-3">
              <div>
                <label className="block text-[12px] font-semibold text-[var(--text)] mb-1">
                  Reason for manual sign-off (Required)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Verified existing active AHA BLS certification card issued within last 6 months; physically inspected by RN."
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  className="w-full p-2.5 text-[13px] bg-[#F7F7F4] border border-[var(--border)] rounded-[8px] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--green-700)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setManualCompleteStep(null);
                    setManualReason('');
                  }}
                  className="min-h-[32px] px-3.5 rounded-[6px] border border-[var(--border)] text-[12px] font-semibold text-[var(--text)] hover:bg-[#F0F2ED] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[32px] px-4 rounded-[6px] bg-[var(--green-700)] text-white text-[12px] font-semibold hover:bg-[var(--green-900)] transition"
                >
                  Sign & Log Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. CLINICAL SKILLS VALIDATION FORM MODAL */}
      {/* ========================================================================= */}
      {activeSkillsValidation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-[12px] border border-[var(--border)] max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="text-[17px] font-bold text-[var(--text)]">
                  Clinical Skills Validation Checklist
                </h3>
                <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
                  Candidate: <strong>{activeSkillsValidation.caregiverName}</strong> ({activeSkillsValidation.classification}) · Validator: Dana Whitfield, RN
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSkillsValidation(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSignSkillsValidation} className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div className="space-y-3">
                {SKILLS_CHECKLIST.map((item) => {
                  const currentScore = skillsScores[item.id] || 'Pass';
                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-[#F7F7F4] border border-[var(--border)] rounded-[8px] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">{item.category}</div>
                        <div className="text-[13px] font-bold text-[var(--text)]">{item.name}</div>
                        <div className="text-[11px] text-[var(--text-muted)]">{item.description}</div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSkillsScores((prev) => ({ ...prev, [item.id]: 'Pass' }))}
                          className={`min-h-[28px] px-2.5 rounded-[6px] text-[11px] font-bold transition ${
                            currentScore === 'Pass'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                          }`}
                        >
                          Pass ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => setSkillsScores((prev) => ({ ...prev, [item.id]: 'Needs practice' }))}
                          className={`min-h-[28px] px-2.5 rounded-[6px] text-[11px] font-bold transition ${
                            currentScore === 'Needs practice'
                              ? 'bg-amber-600 text-white'
                              : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                          }`}
                        >
                          Needs practice
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[var(--text)] mb-1">
                  Validator Clinical Notes & Observations
                </label>
                <textarea
                  rows={2}
                  placeholder="Candidate demonstrated safe body mechanics, correct transfer belt technique, and satisfactory infection control."
                  value={validatorNotes}
                  onChange={(e) => setValidatorNotes(e.target.value)}
                  className="w-full p-2.5 text-[13px] bg-[#F7F7F4] border border-[var(--border)] rounded-[8px] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--green-700)]"
                />
              </div>

              <div className="p-3 bg-[var(--green-100)] border border-[#CDE0C6] rounded-[8px] flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-bold text-[var(--green-900)]">RN Digital Attestation</div>
                  <div className="text-[11px] text-[var(--green-900)]">Signed under penalty of Colorado state regulatory compliance</div>
                </div>
                <div className="font-mono text-[12px] font-bold text-[var(--green-900)]">{validatorSignature}</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setActiveSkillsValidation(null)}
                  className="min-h-[32px] px-3.5 rounded-[6px] border border-[var(--border)] text-[12px] font-semibold text-[var(--text)] hover:bg-[#F0F2ED] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[32px] px-4 rounded-[6px] bg-[var(--green-700)] text-white text-[12px] font-semibold hover:bg-[var(--green-900)] transition"
                >
                  Approve & Sign Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. SCHEDULE SESSION MODAL */}
      {/* ========================================================================= */}
      {isScheduleSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-[12px] border border-[var(--border)] max-w-md w-full p-5 shadow-2xl space-y-4">
            <div>
              <h3 className="text-[16px] font-bold text-[var(--text)]">Schedule Live Training Session</h3>
              <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Add virtual orientation cohort or in-person skills validation lab</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast('New session scheduled and notifications dispatched.');
                setIsScheduleSessionModalOpen(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[12px] font-semibold text-[var(--text)] mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  defaultValue="Service Skills Validation Lab #14"
                  className="w-full p-2 text-[13px] bg-[#F7F7F4] border border-[var(--border)] rounded-[8px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--text)] mb-1">Date</label>
                  <input
                    type="date"
                    required
                    defaultValue="2026-11-20"
                    className="w-full p-2 text-[13px] bg-[#F7F7F4] border border-[var(--border)] rounded-[8px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--text)] mb-1">Time</label>
                  <input
                    type="text"
                    required
                    defaultValue="10:00 AM - 12:00 PM"
                    className="w-full p-2 text-[13px] bg-[#F7F7F4] border border-[var(--border)] rounded-[8px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[var(--text)] mb-1">Host / Validator</label>
                <select className="w-full p-2 text-[13px] bg-[#F7F7F4] border border-[var(--border)] rounded-[8px]">
                  <option>Dana Whitfield, RN (Clinical Supervisor)</option>
                  <option>Jon P. (Caregiver Onboarding Specialist)</option>
                  <option>Sam K. (Compliance Officer)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleSessionModalOpen(false)}
                  className="min-h-[32px] px-3.5 rounded-[6px] border border-[var(--border)] text-[12px] font-semibold text-[var(--text)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[32px] px-4 rounded-[6px] bg-[var(--green-700)] text-white text-[12px] font-semibold"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. VIDEO RECORDING MODAL (Sandbox) */}
      {/* ========================================================================= */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-[12px] border border-[var(--border)] max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <h3 className="text-[16px] font-bold text-[var(--text)]">Record Practice Training Video</h3>
              <button type="button" onClick={() => setIsVideoModalOpen(false)}>✕</button>
            </div>
            <div className="p-8 bg-[#F7F7F4] border-2 border-dashed border-[var(--border)] rounded-[8px] text-center space-y-2">
              <div className="text-3xl">📹</div>
              <div className="text-[13px] font-semibold text-[var(--text)]">Ready to record demonstration</div>
              <div className="text-[11px] text-[var(--text-muted)]">Camera feed de-identified. Client data blurred automatically.</div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="min-h-[32px] px-3.5 rounded-[6px] border border-[var(--border)] text-[12px] font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Training video recorded and saved to agency onboarding library.');
                  setIsVideoModalOpen(false);
                }}
                className="min-h-[32px] px-4 rounded-[6px] bg-[var(--green-700)] text-white text-[12px] font-semibold"
              >
                Start Recording
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. CAREGIVER MOBILE PHONE PREVIEW MODAL */}
      {/* ========================================================================= */}
      {isCaregiverPhoneOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-fade-in">
          <div className="relative">
            {/* Close Button Outside */}
            <button
              type="button"
              onClick={() => setIsCaregiverPhoneOpen(false)}
              className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-white border border-[var(--border)] text-stone-700 font-bold shadow-md flex items-center justify-center hover:bg-stone-100"
            >
              ✕
            </button>

            {/* Mobile Phone Mockup */}
            <div className="w-[360px] bg-stone-900 rounded-[44px] p-4 shadow-2xl border-4 border-stone-800">
              <div className="bg-[#F7F7F4] rounded-[36px] overflow-hidden min-h-[640px] flex flex-col text-[var(--text)] relative">
                
                {/* Notch */}
                <div className="bg-stone-900 h-4 w-32 mx-auto rounded-b-xl flex items-center justify-center gap-2 px-2 z-10">
                  <div className="w-2 h-2 rounded-full bg-stone-700" />
                </div>

                {/* Mobile Header */}
                <div className="bg-[var(--green-900)] text-white p-4 pt-2 shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs">Rosa Vega</div>
                      <div className="text-[10px] text-emerald-300">Family Caregiver · IHSS</div>
                    </div>
                    {/* EN / ES Language Toggle */}
                    <div className="bg-white/15 p-0.5 rounded-md flex items-center text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPhoneLang('en')}
                        className={`px-1.5 py-0.5 rounded ${phoneLang === 'en' ? 'bg-emerald-500 text-white' : 'text-white/70'}`}
                      >
                        EN
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhoneLang('es')}
                        className={`px-1.5 py-0.5 rounded ${phoneLang === 'es' ? 'bg-emerald-500 text-white' : 'text-white/70'}`}
                      >
                        ES
                      </button>
                    </div>
                  </div>
                  <div className="text-center font-bold text-xs mt-2 text-emerald-200">
                    {phoneLang === 'en' ? 'My Training' : 'Mis Cursos'}
                  </div>
                </div>

                {/* Mobile Scroll Area */}
                <div className="p-3.5 space-y-3 flex-1 overflow-y-auto text-xs">
                  {/* Expiring Banner */}
                  <div className="bg-amber-50 border border-amber-200 rounded-[10px] p-2.5 text-[11px] text-amber-900 space-y-1">
                    <div className="font-bold">
                      {phoneLang === 'en' ? '⚠️ CPR expires in 28 days' : '⚠️ CPR vence en 28 días'}
                    </div>
                    <div>
                      {phoneLang === 'en' ? 'Upload renewal card or book lab session.' : 'Sube tu tarjeta renovada o reserva cupo.'}
                    </div>
                  </div>

                  {/* Path Progress */}
                  <div className="bg-white border border-[var(--border)] rounded-[12px] p-3 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[12px] text-[var(--text)]">IHSS Onboarding</span>
                      <span className="font-bold text-[var(--green-700)] text-[12px]">60%</span>
                    </div>
                    <div className="w-full bg-[#EAECE6] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[var(--green-700)] h-full rounded-full" style={{ width: '60%' }} />
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] flex justify-between">
                      <span>{phoneLang === 'en' ? '3 of 5 complete' : '3 de 5 completados'}</span>
                      <span>{phoneLang === 'en' ? 'Due Nov 26' : 'Vence 26 Nov'}</span>
                    </div>
                  </div>

                  {/* Next Course Card */}
                  <div className="bg-white border border-[#CDE0C6] rounded-[12px] p-3 shadow-2xs space-y-2">
                    <div className="text-[10px] font-mono text-[var(--text-muted)]">LS3000 · 25 min</div>
                    <div className="font-bold text-[12px] text-[var(--text)]">
                      {phoneLang === 'en' ? 'Client Rights & Abuse Prevention' : 'Derechos del Cliente y Prevención de Abuso'}
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast('LearnWorlds player launched.')}
                      className="w-full min-h-[30px] rounded-[6px] bg-[var(--green-700)] text-white font-semibold text-[11px] flex items-center justify-center gap-1"
                    >
                      <span>▶</span>
                      <span>{phoneLang === 'en' ? 'Start Course' : 'Comenzar'}</span>
                    </button>
                  </div>

                  {/* Live Session */}
                  <div className="bg-white border border-[var(--border)] rounded-[12px] p-3 shadow-2xs space-y-1.5">
                    <div className="font-bold text-[12px] text-[var(--text)]">
                      {phoneLang === 'en' ? 'Upcoming Live Lab' : 'Taller Práctico Próximo'}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      Tomorrow · 10:00 AM · Denver Center (Room 2B)
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast('Added to device calendar.')}
                      className="w-full min-h-[28px] rounded-[6px] border border-[var(--border)] bg-[#F7F7F4] text-[11px] font-semibold text-[var(--text)]"
                    >
                      {phoneLang === 'en' ? '📅 Add to calendar' : '📅 Agregar al calendario'}
                    </button>
                  </div>

                  {/* Certificates */}
                  <div className="bg-white border border-[var(--border)] rounded-[12px] p-3 shadow-2xs space-y-1.5">
                    <div className="font-bold text-[12px] text-[var(--text)]">
                      {phoneLang === 'en' ? 'Certificates' : 'Certificados'}
                    </div>
                    <div className="flex items-center justify-between text-[11px] p-1.5 bg-[#F7F7F4] rounded-[6px]">
                      <span>LiliSare Foundations</span>
                      <button
                        type="button"
                        onClick={() => showToast('Downloading certificate...')}
                        className="font-bold text-[var(--green-700)]"
                      >
                        {phoneLang === 'en' ? 'View' : 'Ver'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Home Indicator */}
                <div className="h-4 bg-stone-100 flex items-center justify-center shrink-0">
                  <div className="w-24 h-1 bg-stone-400 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
