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
  const { showToast, navigate } = useApp();

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
  const [isPrinciplePopoverOpen, setIsPrinciplePopoverOpen] = useState(false);
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

  // Automation rules state
  const [rules, setRules] = useState(TRAINING_RULES);

  // Mock assignments state (mutable for actions)
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

    // Update open drawer if inspecting this caregiver
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
      {/* 1. PAGE HEADER */}
      {/* ========================================================================= */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                Training
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Academy & Skills
              </span>

              {/* Principle Popover Trigger */}
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setIsPrinciplePopoverOpen(!isPrinciplePopoverOpen)}
                  className="w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-bold transition cursor-pointer"
                  title="Compliance Principle"
                >
                  ℹ️
                </button>

                {isPrinciplePopoverOpen && (
                  <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-[#1B381E] text-white rounded-2xl p-4 shadow-2xl z-30 border border-emerald-600/30 text-xs animate-fade-in">
                    <div className="flex items-center justify-between font-bold text-emerald-300 pb-2 mb-2 border-b border-white/10">
                      <span>Activation Principle</span>
                      <button
                        type="button"
                        onClick={() => setIsPrinciplePopoverOpen(false)}
                        className="text-white/60 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="leading-relaxed text-white/90">
                      <strong>Training status feeds the caregiver&apos;s activation gate</strong>, but a completed course alone never makes a caregiver &ldquo;Ready&rdquo;. All 5 checks (documents, screening, training, validation, authorization) must be green.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-stone-500 mt-1">
              {activeTab === 'overview' && 'High-level metrics, urgent training bottlenecks, and completion by path.'}
              {activeTab === 'assignments' && 'Track caregiver progress, due dates, and individual training records.'}
              {activeTab === 'paths' && 'Curriculum catalog, learning paths, and course requirements.'}
              {activeTab === 'sessions' && 'Live virtual orientations, skills lab evaluations, and clinical sign-offs.'}
            </p>
          </div>

          {/* Right Header Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* LearnWorlds Planned R2 Badge */}
            <div className="inline-flex items-center gap-2 bg-stone-100 border border-stone-200 text-stone-700 px-3 py-1.5 rounded-xl text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              <span>LearnWorlds sync: planned (Release 2)</span>
              <span className="text-[10px] text-stone-400">· {lastSyncTime}</span>
            </div>

            {/* Sync Now Demo Button */}
            <button
              type="button"
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 font-semibold px-3 py-1.5 rounded-xl text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className={isSyncing ? 'animate-spin' : ''}>🔄</span>
              <span>{isSyncing ? 'Syncing LMS…' : 'Sync now'}</span>
            </button>

            {/* Caregiver Mobile Preview Button */}
            <button
              type="button"
              onClick={() => setIsCaregiverPhoneOpen(true)}
              className="bg-[#3E6B2B] hover:bg-[#335a23] text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>📱</span>
              <span>Caregiver view</span>
            </button>
          </div>
        </div>

        {/* COMPLIANCE PRINCIPLE NOTICE STRIP */}
        <div className="mt-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3 text-xs text-emerald-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-base shrink-0">🛡️</span>
            <span className="leading-snug truncate">
              <strong>Core Activation Rule:</strong> Course completion alone never activates a caregiver. Documents, CBI screening, live skills demonstration, and CM authorization must all be verified before dispatch.
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('rules')}
            className="text-xs font-bold text-[#3E6B2B] hover:underline shrink-0"
          >
            View Activation Gate →
          </button>
        </div>

        {/* FOUR NAVIGATION TABS */}
        <div className="flex items-center gap-2 mt-6 border-b border-stone-200 overflow-x-auto pb-px">
          {[
            { id: 'overview', label: 'Overview', icon: '📊', count: null },
            { id: 'assignments', label: 'Assignments', icon: '👥', count: assignments.length },
            { id: 'paths', label: 'Courses and Paths', icon: '📚', count: TRAINING_PATHS.length },
            { id: 'sessions', label: 'Sessions and Skills', icon: '🩺', count: sessions.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#3E6B2B] text-[#3E6B2B]'
                    : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                      isActive ? 'bg-[#3E6B2B] text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TAB 1: OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* FIVE SUMMARY CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {[
              { label: 'Caregivers in training', val: '44', icon: '👥', change: '+6 this week', color: 'border-stone-200' },
              { label: 'Overdue training', val: '9', icon: '⚠️', change: 'Action needed', color: 'border-rose-300 bg-rose-50/30 text-rose-900' },
              { label: 'Due in 30 days', val: '31', icon: '📅', change: 'Annual refreshers', color: 'border-amber-200' },
              { label: 'Awaiting skills validation', val: '12', icon: '🩺', change: 'RN sign-off required', color: 'border-emerald-200' },
              { label: 'Avg days to complete', val: '6', icon: '⚡', change: 'Goal: < 7 days', color: 'border-stone-200' },
            ].map((card, i) => (
              <div
                key={i}
                className={`bg-white border rounded-2xl p-4 shadow-xs flex flex-col justify-between ${card.color}`}
              >
                <div className="flex items-center justify-between text-stone-500 text-xs mb-2">
                  <span className="font-semibold text-stone-600">{card.label}</span>
                  <span className="text-base">{card.icon}</span>
                </div>
                <div className="font-extrabold text-2xl sm:text-3xl text-stone-900 tracking-tight">
                  {card.val}
                </div>
                <div className="text-[11px] text-stone-500 mt-1 font-medium">{card.change}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT 7 COLS: NEEDS ATTENTION LIST (MAX 6 ROWS) */}
            <div className="lg:col-span-7 bg-white border border-stone-200 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base text-stone-900">Needs Attention</h3>
                  <p className="text-xs text-stone-500">Urgent bottlenecks blocking caregiver activation</p>
                </div>
                <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  6 Items
                </span>
              </div>

              <div className="divide-y divide-stone-100">
                {[
                  {
                    icon: '🚨',
                    title: '9 caregivers overdue on orientation course',
                    detail: 'Have not watched LS1010 within 48h of account creation.',
                    actionLabel: 'Send reminder',
                    onClick: () => {
                      showToast('Bilingual SMS & email reminders dispatched to all 9 overdue caregivers.');
                    },
                    color: 'text-rose-700 bg-rose-50 border-rose-200',
                  },
                  {
                    icon: '🩺',
                    title: '12 waiting for skills validation',
                    detail: 'Competency lab demonstration needed with Dana Whitfield, RN.',
                    actionLabel: 'Schedule',
                    onClick: () => {
                      setActiveTab('sessions');
                      setIsScheduleSessionModalOpen(true);
                    },
                    color: 'text-amber-700 bg-amber-50 border-amber-200',
                  },
                  {
                    icon: '📝',
                    title: '5 failed a quiz twice',
                    detail: 'Automated retakes locked. 1-on-1 coaching required before attempt 3.',
                    actionLabel: 'Review',
                    onClick: () => {
                      setActiveTab('assignments');
                      setSelectedStatusFilter('Overdue');
                    },
                    color: 'text-amber-700 bg-amber-50 border-amber-200',
                  },
                  {
                    icon: '📅',
                    title: '31 annual trainings due in 30 days',
                    detail: 'HCPF mandatory 12-month re-certification refresher path.',
                    actionLabel: 'Remind all',
                    onClick: () => {
                      showToast('Annual refresher invites and reminders queued for all 31 caregivers.');
                    },
                    color: 'text-stone-700 bg-stone-50 border-stone-200',
                  },
                  {
                    icon: '🫀',
                    title: '3 CPR / First Aid credentials expired',
                    detail: 'American Heart Association or Red Cross renewal cards required.',
                    actionLabel: 'Flag in Compliance',
                    onClick: () => {
                      navigate('compliance');
                    },
                    color: 'text-rose-700 bg-rose-50 border-rose-200',
                  },
                  {
                    icon: '🌐',
                    title: '4 Spanish orientation packets pending review',
                    detail: 'Bilingual applicant submissions awaiting coordinator check.',
                    actionLabel: 'Assign reviewer',
                    onClick: () => {
                      showToast('Assigned to Alicia T. (Bilingual Coordinator).');
                    },
                    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="text-xl shrink-0 mt-0.5">{item.icon}</div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-stone-900">{item.title}</div>
                        <div className="text-xs text-stone-500 mt-0.5">{item.detail}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={item.onClick}
                      className="self-start sm:self-auto shrink-0 bg-[#3E6B2B] hover:bg-[#335a23] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs transition cursor-pointer"
                    >
                      {item.actionLabel} →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT 5 COLS: COMPLETION BY PATH & SANDBOX */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Completion Bar by Training Path */}
              <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base text-stone-900">Completion by Path</h3>
                  <span className="text-xs text-stone-500">Live cohort stats</span>
                </div>

                <div className="space-y-3.5 text-xs">
                  {[
                    { name: 'IHSS Attendant Care', percent: 92, count: '18 caregivers', color: 'bg-emerald-600' },
                    { name: 'Employee Onboarding (W-2)', percent: 86, count: '22 caregivers', color: 'bg-emerald-600' },
                    { name: 'Personal Care / Homemaker', percent: 81, count: '9 caregivers', color: 'bg-emerald-600' },
                    { name: '1099 Contractor Onboarding', percent: 74, count: '7 caregivers', color: 'bg-emerald-600' },
                    { name: 'CNA Clinical Onboarding', percent: 68, count: '8 caregivers', color: 'bg-amber-500' },
                    { name: 'Annual Refresher Renewal', percent: 63, count: '31 caregivers', color: 'bg-amber-500' },
                    { name: 'Health Maintenance (HMA)', percent: 59, count: '6 caregivers', color: 'bg-rose-500' },
                  ].map((path, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between font-semibold text-stone-700">
                        <span>{path.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-stone-400 font-normal">{path.count}</span>
                          <span className="font-bold text-stone-900">{path.percent}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${path.color}`}
                          style={{ width: `${path.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Training Sandbox Card */}
              <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-3xl p-6 shadow-md border border-stone-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🧪</span>
                    <h3 className="font-bold text-sm text-white">Training Sandbox</h3>
                  </div>
                  <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Safe Simulation
                  </span>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed mb-4">
                  Practice documentation, live EVV clock-in simulations, and review video recordings with de-identified client data to ensure zero HIPAA risk during onboarding.
                </p>

                <div className="flex items-center justify-between p-3 bg-white/10 rounded-2xl border border-white/10 mb-4">
                  <div>
                    <div className="text-xs font-bold text-white">De-identify Client PII</div>
                    <div className="text-[11px] text-stone-300">Mask names and addresses during demo sessions</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sandboxMode}
                      onChange={(e) => {
                        setSandboxMode(e.target.checked);
                        showToast(e.target.checked ? 'Training Sandbox: Client PII masked.' : 'Training Sandbox: Real view restored.');
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-stone-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="w-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs py-2.5 rounded-xl border border-white/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>🎥</span>
                  <span>Record training video</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB 2: ASSIGNMENTS (WHO NEEDS WHAT) */}
      {/* ========================================================================= */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          
          {/* AUTO-ASSIGNMENT BANNER */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-base shrink-0">⚡</span>
              <div>
                <span className="font-bold text-emerald-950">Auto-Assignment Active:</span>{' '}
                <span className="text-emerald-800">
                  Training curriculum is assigned automatically when a service classification is selected during onboarding.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('rules')}
              className="text-xs font-bold text-[#3E6B2B] hover:underline shrink-0"
            >
              View Automation Rules →
            </button>
          </div>

          {/* FILTERS & SEARCH BAR */}
          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-2.5 text-stone-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Search by caregiver, client, path, or step..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
                />
              </div>

              {/* Path Filter */}
              <select
                value={selectedPathFilter}
                onChange={(e) => setSelectedPathFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
              >
                <option value="All">All Paths (8)</option>
                {TRAINING_PATHS.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>

              {/* Classification Filter */}
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
              >
                <option value="All">All Programs</option>
                <option value="IHSS">IHSS</option>
                <option value="CNA">CNA</option>
                <option value="HMA">HMA</option>
                <option value="IRSS">IRSS</option>
                <option value="CFC">CFC</option>
                <option value="PCW">PCW</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
              >
                <option value="All">All Statuses</option>
                <option value="In progress">In progress</option>
                <option value="Overdue">Overdue</option>
                <option value="Complete">Complete</option>
                <option value="Not started">Not started</option>
              </select>

              {/* Recruiter / Owner */}
              <select
                value={selectedRecruiterFilter}
                onChange={(e) => setSelectedRecruiterFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
              >
                <option value="All">All Recruiters</option>
                <option value="Maya R.">Maya R.</option>
                <option value="Jon P.">Jon P.</option>
                <option value="Alicia T.">Alicia T.</option>
                <option value="Sam K.">Sam K.</option>
              </select>

              {/* Overdue Only Toggle */}
              <button
                type="button"
                onClick={() => setOverdueOnly(!overdueOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  overdueOnly
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
                }`}
              >
                ⚠️ Overdue only ({assignments.filter((a) => a.isOverdue).length})
              </button>
            </div>

            {/* BULK ACTIONS BAR (When items selected) */}
            {selectedAssignmentIds.length > 0 && (
              <div className="bg-[#1B381E] text-white p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-full text-[11px]">
                    {selectedAssignmentIds.length} selected
                  </span>
                  <span>Bulk operations ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleBulkRemind}
                    className="bg-white/20 hover:bg-white/30 text-white font-semibold px-3 py-1.5 rounded-xl transition"
                  >
                    📩 Send reminder
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkExtend}
                    className="bg-white/20 hover:bg-white/30 text-white font-semibold px-3 py-1.5 rounded-xl transition"
                  >
                    📅 Extend due date
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      showToast(`Exported training records for ${selectedAssignmentIds.length} caregivers.`);
                      setSelectedAssignmentIds([]);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl transition"
                  >
                    📥 Export CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAssignmentIds([])}
                    className="text-white/60 hover:text-white px-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* ASSIGNMENTS TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 uppercase font-bold text-[11px] border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-3 w-8">
                      <input
                        type="checkbox"
                        checked={selectedAssignmentIds.length === filteredAssignments.length && filteredAssignments.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-stone-300 text-[#3E6B2B] focus:ring-[#3E6B2B]"
                      />
                    </th>
                    <th className="py-3 px-3">Caregiver</th>
                    <th className="py-3 px-3">Assigned Path</th>
                    <th className="py-3 px-3">Progress</th>
                    <th className="py-3 px-3">Current Step</th>
                    <th className="py-3 px-3">Due Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Last Activity</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredAssignments.map((row) => {
                    const isSelected = selectedAssignmentIds.includes(row.id);
                    return (
                      <tr
                        key={row.id}
                        className={`hover:bg-stone-50/80 transition cursor-pointer ${
                          isSelected ? 'bg-emerald-50/40' : ''
                        }`}
                        onClick={() => setSelectedCaregiverForDrawer(row)}
                      >
                        <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(row.id)}
                            className="rounded border-stone-300 text-[#3E6B2B] focus:ring-[#3E6B2B]"
                          />
                        </td>

                        {/* Caregiver Name & Classification */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#10B981] text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {row.caregiverName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-stone-900 flex items-center gap-1.5">
                                <span>{row.caregiverName}</span>
                                {row.isAutomated && (
                                  <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-md border border-amber-200" title="Assigned automatically">
                                    ⚡
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                                <span className="font-semibold text-stone-700">{row.classification}</span>
                                <span>·</span>
                                <span>{row.employmentType}</span>
                                {row.isFamily && (
                                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-1 rounded">
                                    Family
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Assigned Path */}
                        <td className="py-3.5 px-3 font-medium text-stone-900">
                          {row.pathName}
                        </td>

                        {/* Progress Bar */}
                        <td className="py-3.5 px-3 w-36">
                          <div className="flex items-center justify-between text-[11px] font-bold text-stone-700 mb-1">
                            <span>{row.progressPercent}%</span>
                            <span className="text-stone-400 font-normal">LS3000</span>
                          </div>
                          <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                row.progressPercent === 100
                                  ? 'bg-emerald-600'
                                  : row.isOverdue
                                  ? 'bg-rose-500'
                                  : 'bg-[#3E6B2B]'
                              }`}
                              style={{ width: `${row.progressPercent}%` }}
                            />
                          </div>
                        </td>

                        {/* Current Step */}
                        <td className="py-3.5 px-3">
                          <span className="font-medium text-stone-800 line-clamp-1">
                            {row.currentStep}
                          </span>
                        </td>

                        {/* Due Date */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`font-semibold ${
                              row.isOverdue ? 'text-rose-600 font-bold' : 'text-stone-600'
                            }`}
                          >
                            {row.dueDate}
                          </span>
                        </td>

                        {/* Status Chip */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 ${
                              row.status === 'Complete'
                                ? 'bg-emerald-100 text-emerald-800'
                                : row.status === 'Overdue'
                                ? 'bg-rose-100 text-rose-800'
                                : row.status === 'In progress'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                row.status === 'Complete'
                                  ? 'bg-emerald-500'
                                  : row.status === 'Overdue'
                                  ? 'bg-rose-500'
                                  : row.status === 'In progress'
                                  ? 'bg-sky-500'
                                  : 'bg-stone-400'
                              }`}
                            />
                            {row.status}
                          </span>
                        </td>

                        {/* Last Activity */}
                        <td className="py-3.5 px-3 text-stone-500 text-[11px] whitespace-nowrap">
                          {row.lastActivity}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedCaregiverForDrawer(row)}
                            className="bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-semibold px-2.5 py-1 rounded-lg transition"
                          >
                            Record →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredAssignments.length === 0 && (
                <div className="py-12 text-center text-stone-500 space-y-2">
                  <div className="text-3xl">✨</div>
                  <div className="font-bold text-sm text-stone-800">No overdue training. Nice work!</div>
                  <p className="text-xs text-stone-400">All assigned caregivers are on track with their course deadlines.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB 3: COURSES AND PATHS (CATALOG) */}
      {/* ========================================================================= */}
      {activeTab === 'paths' && (
        <div className="space-y-8">
          
          {/* SECTION 1: TRAINING PATHS */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Training Paths</h3>
                <p className="text-xs text-stone-500">Ordered sequences of courses and requirements assigned to care cohorts.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPathModalOpen(true)}
                className="bg-[#3E6B2B] hover:bg-[#335a23] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <span>+</span>
                <span>Add path</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TRAINING_PATHS.map((path) => (
                <div
                  key={path.id}
                  className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {path.classification}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">
                        ⏱️ {path.duration}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-stone-900">{path.name}</h4>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                      {path.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-stone-100 space-y-2 text-xs">
                      <div className="flex justify-between text-stone-600">
                        <span>Applies to:</span>
                        <span className="font-semibold text-stone-800 text-right truncate max-w-[170px]">{path.targetAudience}</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Assigned staff:</span>
                        <span className="font-bold text-stone-900">{path.assignedCount} active caregivers</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Deadline:</span>
                        <span className="font-semibold text-stone-800">{path.dueInDays} days from hire</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Pass mark:</span>
                        <span className="font-semibold text-stone-800">{path.passMark}% minimum</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400">
                      {path.courses.length} required courses
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingPath(path)}
                      className="text-xs font-bold text-[#3E6B2B] hover:underline cursor-pointer"
                    >
                      Edit path →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: COURSES CATALOG */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Courses Catalog</h3>
                <p className="text-xs text-stone-500">Individual modules synchronized with LearnWorlds LMS.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCourseModalOpen(true)}
                className="bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <span>+</span>
                <span>Add course</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 uppercase font-bold text-[11px] border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-3">Course Name</th>
                    <th className="py-3 px-3">LearnWorlds ID</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Duration</th>
                    <th className="py-3 px-3">Pass Mark</th>
                    <th className="py-3 px-3">Renewal Cycle</th>
                    <th className="py-3 px-3">Sync Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {TRAINING_COURSES.map((course) => (
                    <tr key={course.id} className="hover:bg-stone-50 transition">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-stone-900">{course.name}</div>
                        <div className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{course.summary}</div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-semibold text-stone-700">
                        {course.learnWorldsId}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="bg-stone-100 text-stone-800 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                          {course.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-stone-600">
                        {course.duration}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-stone-800">
                        {course.passMark}
                      </td>
                      <td className="py-3.5 px-3 text-stone-600">
                        {course.renewalCycle}
                      </td>
                      <td className="py-3.5 px-3">
                        {course.isLearnWorldsLinked ? (
                          <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                            Linked to LearnWorlds
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            In-House Clinical
                          </span>
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

      {/* ========================================================================= */}
      {/* 5. TAB 4: SESSIONS AND SKILLS (LIVE ORIENTATION & CLINICAL LAB) */}
      {/* ========================================================================= */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-stone-200 rounded-3xl p-6 shadow-xs">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Live Sessions & Skills Evaluation</h3>
              <p className="text-xs text-stone-500">Post-orientation Zoom check-ins and RN in-person/telehealth return demonstrations.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsScheduleSessionModalOpen(true)}
              className="bg-[#3E6B2B] hover:bg-[#335a23] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <span>📅</span>
              <span>Schedule session</span>
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4 hover:border-emerald-300 transition"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      sess.type === 'Virtual Orientation'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {sess.type}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    Language: <strong>{sess.language}</strong>
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-base text-stone-900">{sess.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 mt-2">
                    <span className="flex items-center gap-1 font-semibold text-stone-800">
                      <span>📅</span> {sess.date}
                    </span>
                    <span className="flex items-center gap-1 text-stone-600">
                      <span>⏰</span> {sess.time}
                    </span>
                    <span className="flex items-center gap-1 text-stone-600">
                      <span>👤 Host:</span> {sess.host}
                    </span>
                  </div>

                  {sess.zoomLink && (
                    <div className="mt-2 text-xs">
                      <span className="text-stone-500">Virtual Link: </span>
                      <a
                        href={sess.zoomLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#3E6B2B] font-semibold hover:underline"
                      >
                        {sess.zoomLink}
                      </a>
                    </div>
                  )}

                  {sess.location && (
                    <div className="mt-2 text-xs text-stone-600">
                      <span className="text-stone-500">Location: </span>
                      <strong className="text-stone-800">{sess.location}</strong>
                    </div>
                  )}
                </div>

                {/* Attendees List & Attendance Tracking */}
                <div className="pt-3 border-t border-stone-100 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                    <span>Attendees ({sess.attendees.length}/{sess.capacity})</span>
                    <span className="text-[11px] text-stone-400 font-normal">Attendance tracking</span>
                  </div>

                  <div className="space-y-2">
                    {sess.attendees.map((att, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-800">{att.name}</span>
                          <span className="bg-white border border-stone-200 text-stone-600 text-[10px] font-semibold px-1.5 rounded">
                            {att.service}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              att.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : att.status === 'No show'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {att.status}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              setSessions((prev) =>
                                prev.map((s) =>
                                  s.id === sess.id
                                    ? {
                                        ...s,
                                        attendees: s.attendees.map((a) =>
                                          a.name === att.name ? { ...a, status: 'Present' } : a
                                        ),
                                      }
                                    : s
                                )
                              );
                              showToast(`Marked ${att.name} as Present.`);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2 py-1 rounded-md cursor-pointer"
                          >
                            Present
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSessions((prev) =>
                                prev.map((s) =>
                                  s.id === sess.id
                                    ? {
                                        ...s,
                                        attendees: s.attendees.map((a) =>
                                          a.name === att.name ? { ...a, status: 'No show' } : a
                                        ),
                                      }
                                    : s
                                )
                              );
                              showToast(`Marked ${att.name} as No Show. Automated rescheduling SMS dispatched.`);
                            }}
                            className="bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-bold px-2 py-1 rounded-md cursor-pointer"
                          >
                            No show
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Launch Skills Lab Form Trigger */}
                {sess.type === 'Skills Validation Lab' && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const targetCg = assignments.find((a) => sess.attendees.some((att) => att.name === a.caregiverName)) || assignments[1];
                        setActiveSkillsValidation(targetCg);
                      }}
                      className="w-full bg-[#3E6B2B] hover:bg-[#335a23] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>📋</span>
                      <span>Launch Skills Demonstration Checklist</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. RIGHT-SIDE DRAWER: TRAINING RECORD (PER CAREGIVER) */}
      {/* ========================================================================= */}
      {selectedCaregiverForDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            
            {/* Drawer Header */}
            <div className="p-6 bg-stone-900 text-white shrink-0">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs text-emerald-300">
                  <span>🔒 Access logged</span>
                  <span className="text-white/40">·</span>
                  <span>HIPAA §164.312 Audit Tracked</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCaregiverForDrawer(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>{selectedCaregiverForDrawer.caregiverName}</span>
                    {selectedCaregiverForDrawer.isFamily && (
                      <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
                        Family Caregiver
                      </span>
                    )}
                  </h2>
                  <div className="text-xs text-white/70 mt-1 flex items-center gap-2">
                    <span>Program: <strong>{selectedCaregiverForDrawer.classification}</strong></span>
                    <span>·</span>
                    <span>Type: {selectedCaregiverForDrawer.employmentType}</span>
                    <span>·</span>
                    <span>Linked Client: <strong>{selectedCaregiverForDrawer.linkedClient}</strong></span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    showToast(`Follow-up reminder dispatched to ${selectedCaregiverForDrawer.caregiverName}.`);
                  }}
                  className="bg-[#3E6B2B] hover:bg-[#335a23] text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition"
                >
                  Send reminder →
                </button>
              </div>

              {/* READINESS CHECKLIST (ACTIVATION GATE) */}
              <div className="mt-5 p-3.5 rounded-2xl bg-white/10 border border-white/15">
                <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-2">
                  Caregiver Activation Gate Status
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className={`p-2 rounded-xl border ${selectedCaregiverForDrawer.activationGate.documents ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200' : 'bg-white/5 border-white/10 text-white/60'}`}>
                    <div className="font-bold">{selectedCaregiverForDrawer.activationGate.documents ? '✓ Done' : 'Pending'}</div>
                    <div className="text-[10px] mt-0.5">Documents</div>
                  </div>
                  <div className={`p-2 rounded-xl border ${selectedCaregiverForDrawer.activationGate.screening ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200' : 'bg-white/5 border-white/10 text-white/60'}`}>
                    <div className="font-bold">{selectedCaregiverForDrawer.activationGate.screening ? '✓ Done' : 'Pending'}</div>
                    <div className="text-[10px] mt-0.5">Screening</div>
                  </div>
                  <div className={`p-2 rounded-xl border ${selectedCaregiverForDrawer.activationGate.training ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200' : 'bg-white/5 border-white/10 text-white/60'}`}>
                    <div className="font-bold">{selectedCaregiverForDrawer.activationGate.training ? '✓ Done' : 'In progress'}</div>
                    <div className="text-[10px] mt-0.5">Training</div>
                  </div>
                  <div className={`p-2 rounded-xl border ${selectedCaregiverForDrawer.activationGate.skillsValidation ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200' : 'bg-white/5 border-white/10 text-white/60'}`}>
                    <div className="font-bold">{selectedCaregiverForDrawer.activationGate.skillsValidation ? '✓ Validated' : 'Pending'}</div>
                    <div className="text-[10px] mt-0.5">Skills Lab</div>
                  </div>
                  <div className={`p-2 rounded-xl border ${selectedCaregiverForDrawer.activationGate.authorization ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200' : 'bg-white/5 border-white/10 text-white/60'}`}>
                    <div className="font-bold">{selectedCaregiverForDrawer.activationGate.authorization ? '✓ Approved' : 'Pending'}</div>
                    <div className="text-[10px] mt-0.5">State Auth</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              
              {/* VERTICAL TIMELINE OF 6 REQUIRED STEPS */}
              <div>
                <h3 className="font-bold text-sm text-stone-900 mb-3">Required Training Milestones</h3>
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                  {selectedCaregiverForDrawer.timeline.map((step) => {
                    const isDone = step.status === 'Complete';
                    const isFail = step.status === 'Overdue';
                    return (
                      <div key={step.stepIndex} className="relative group">
                        {/* Status Dot */}
                        <div
                          className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center font-bold text-[9px] shadow-xs ${
                            isDone
                              ? 'bg-emerald-500 text-white'
                              : isFail
                              ? 'bg-rose-500 text-white'
                              : 'bg-stone-300 text-stone-700'
                          }`}
                        >
                          {isDone ? '✓' : step.stepIndex}
                        </div>

                        {/* Step Card */}
                        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900 text-xs sm:text-sm">
                              {step.stepIndex}. {step.title}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isDone
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isFail
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-stone-200 text-stone-700'
                              }`}
                            >
                              {step.status}
                            </span>
                          </div>

                          <p className="text-xs text-stone-600 leading-relaxed">
                            {step.details}
                          </p>

                          {/* Quiz Attempts History */}
                          {step.attempts && step.attempts.length > 0 && (
                            <div className="mt-2 p-2.5 bg-white rounded-xl border border-stone-200 space-y-1.5">
                              <div className="font-semibold text-stone-700 flex justify-between">
                                <span>Quiz Attempt History:</span>
                                <span>Pass mark: {step.passMark}%</span>
                              </div>
                              {step.attempts.map((att, i) => (
                                <div key={i} className="flex justify-between text-[11px] text-stone-600">
                                  <span>Attempt {att.attempt} ({att.date})</span>
                                  <span className={`font-bold ${att.result === 'Passed' ? 'text-emerald-700' : 'text-rose-600'}`}>
                                    Score: {att.score}% · {att.result}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Metadata & Actions */}
                          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-stone-200/60 text-[11px] text-stone-500">
                            <div>
                              <span>Owner: <strong>{step.owner}</strong></span>
                              {step.completedAt && <span className="ml-2">· {step.completedAt}</span>}
                            </div>

                            <div className="flex items-center gap-2">
                              {!isDone && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setManualCompleteStep({
                                      caregiverId: selectedCaregiverForDrawer.id,
                                      stepIndex: step.stepIndex,
                                      title: step.title,
                                    });
                                  }}
                                  className="text-xs font-semibold text-[#3E6B2B] hover:underline"
                                >
                                  Mark complete (manual)
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => showToast(`Reminder queued for ${step.title}.`)}
                                className="text-xs text-stone-500 hover:text-stone-800"
                              >
                                Send reminder
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CERTIFICATES */}
              <div className="pt-4 border-t border-stone-200">
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500 mb-3">
                  Issued Certificates & Credentials ({selectedCaregiverForDrawer.certificates.length})
                </h4>
                {selectedCaregiverForDrawer.certificates.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCaregiverForDrawer.certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-200"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">📜</span>
                          <div>
                            <div className="font-bold text-stone-900">{cert.title}</div>
                            <div className="text-[11px] text-stone-500">
                              Issued: {cert.issueDate} · Verification ID: {cert.code}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast(`Downloaded certificate PDF: ${cert.title}`)}
                          className="bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 font-semibold px-2.5 py-1 rounded-xl text-xs"
                        >
                          Download PDF
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic">No certificates issued yet. Unlocked upon 100% completion.</p>
                )}
              </div>

              {/* ACTIVITY AUDIT LOG */}
              <div className="pt-4 border-t border-stone-200">
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500 mb-3">
                  Training Activity & Automation Trail
                </h4>
                <div className="space-y-2.5">
                  {selectedCaregiverForDrawer.activityLog.map((log, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-start gap-2.5">
                      <span className="text-sm mt-0.5">{log.type === 'automated' ? '⚡' : '👤'}</span>
                      <div className="flex-1">
                        <div className="flex justify-between font-medium text-stone-800">
                          <span>{log.action}</span>
                          <span className="text-[10px] text-stone-400">{log.timestamp}</span>
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          Actor: <strong>{log.actor}</strong> {log.details && `· ${log.details}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCaregiverForDrawer(null)}
                className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-white"
              >
                Close Record
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MANUAL COMPLETION REASON MODAL */}
      {/* ========================================================================= */}
      {manualCompleteStep && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="font-bold text-base text-stone-900 mb-1">
              Mark Milestone Complete (Manual Override)
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              State and agency compliance regulations require an explicit clinical or administrative reason for manual sign-off on <strong>{manualCompleteStep.title}</strong>.
            </p>

            <form onSubmit={submitManualCompletion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Reason for manual override *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Caregiver provided accredited Red Cross certification verified by clinical supervisor..."
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900">
                ⚠️ This override will be recorded in the HIPAA permanent audit trail under your user ID.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setManualCompleteStep(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#3E6B2B] hover:bg-[#335a23] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs"
                >
                  Record & Approve Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. SKILLS VALIDATION CHECKLIST MODAL */}
      {/* ========================================================================= */}
      {activeSkillsValidation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div>
                <h3 className="font-bold text-lg text-stone-900">
                  Clinical Skills Validation Lab Demonstration
                </h3>
                <p className="text-xs text-stone-500">
                  Caregiver: <strong>{activeSkillsValidation.caregiverName}</strong> ({activeSkillsValidation.classification}) · Client: {activeSkillsValidation.linkedClient}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSkillsValidation(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSignSkillsValidation} className="space-y-4 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-emerald-900">
                Observe the caregiver performing return demonstrations. Every skill must be rated &ldquo;Pass&rdquo; for activation sign-off.
              </div>

              {/* Skills Rubric */}
              <div className="space-y-3">
                {SKILLS_CHECKLIST.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-stone-900 text-xs">{skill.name}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">{skill.description}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSkillsScores((prev) => ({ ...prev, [skill.id]: 'Pass' }))}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                          skillsScores[skill.id] === 'Pass' || !skillsScores[skill.id]
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white text-stone-600 border border-stone-300'
                        }`}
                      >
                        ✓ Pass
                      </button>
                      <button
                        type="button"
                        onClick={() => setSkillsScores((prev) => ({ ...prev, [skill.id]: 'Needs practice' }))}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                          skillsScores[skill.id] === 'Needs practice'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white text-stone-600 border border-stone-300'
                        }`}
                      >
                        Needs practice
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clinical Notes & Observations */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Registered Nurse Clinical Observations
                </label>
                <textarea
                  rows={2}
                  placeholder="Document client interaction, gait belt grip technique, return demonstration notes..."
                  value={validatorNotes}
                  onChange={(e) => setValidatorNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
                />
              </div>

              {/* Evidence File Upload Placeholder */}
              <div className="p-3 bg-stone-50 border border-dashed border-stone-300 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📎</span>
                  <div>
                    <div className="font-semibold text-stone-800">Attach Evaluation Rubric / Video Evidence</div>
                    <div className="text-[10px] text-stone-500">PDF, MP4 or scanned checklist (simulated)</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Evidence attachment simulated (Checklist_Scan_2026.pdf).')}
                  className="bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold px-3 py-1.5 rounded-xl text-xs"
                >
                  Upload File
                </button>
              </div>

              {/* Clinical Signature */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Licensed Clinical Validator Signature
                </label>
                <input
                  type="text"
                  required
                  value={validatorSignature}
                  onChange={(e) => setValidatorSignature(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono font-bold text-xs text-stone-900 bg-stone-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setActiveSkillsValidation(null)}
                  className="px-4 py-2 font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#3E6B2B] hover:bg-[#335a23] text-white font-bold px-5 py-2 rounded-xl shadow-xs cursor-pointer"
                >
                  Pass and Sign Skills Validation →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. CAREGIVER MOBILE APP PREVIEW MODAL */}
      {/* ========================================================================= */}
      {isCaregiverPhoneOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="relative">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsCaregiverPhoneOpen(false)}
              className="absolute -top-12 right-0 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition cursor-pointer"
            >
              ✕ Close Preview
            </button>

            {/* Phone Frame */}
            <div className="w-[380px] bg-stone-950 rounded-[48px] p-4 shadow-2xl border-4 border-stone-800">
              <div className="bg-[#F7F7F4] rounded-[36px] overflow-hidden min-h-[640px] flex flex-col text-stone-900 relative">
                
                {/* Phone Speaker Notch */}
                <div className="bg-stone-950 h-5 w-32 mx-auto rounded-b-xl flex items-center justify-center gap-1.5 px-2 z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-800" />
                  <div className="w-10 h-1 rounded-full bg-stone-800" />
                </div>

                {/* Mobile Header with Language Toggle */}
                <div className="bg-[#1B381E] text-white p-4 pt-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">
                        {phoneLang === 'en' ? 'LiliSare Academy' : 'Academia LiliSare'}
                      </div>
                      <h3 className="font-bold text-base">
                        {phoneLang === 'en' ? 'My Training' : 'Mis Entrenamientos'}
                      </h3>
                    </div>

                    {/* Language Switch */}
                    <div className="bg-white/15 p-1 rounded-xl flex items-center gap-1 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPhoneLang('en')}
                        className={`px-2 py-0.5 rounded-lg transition ${phoneLang === 'en' ? 'bg-emerald-500 text-white' : 'text-white/70'}`}
                      >
                        EN
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhoneLang('es')}
                        className={`px-2 py-0.5 rounded-lg transition ${phoneLang === 'es' ? 'bg-emerald-500 text-white' : 'text-white/70'}`}
                      >
                        ES
                      </button>
                    </div>
                  </div>
                </div>

                {/* Phone Scroll Content */}
                <div className="p-4 space-y-3.5 flex-1 overflow-y-auto text-xs">
                  
                  {/* Credentials Expiry Banner */}
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-amber-900">
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>{phoneLang === 'en' ? 'Credentials Expiring Soon' : 'Credencial por vencer'}</span>
                    </div>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      {phoneLang === 'en'
                        ? 'Your CPR/First Aid card expires in 34 days. Tap to upload renewed certificate.'
                        : 'Su tarjeta de RCP vence en 34 días. Toque aquí para subir su certificado.'}
                    </p>
                  </div>

                  {/* Active Course Card */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-stone-900">
                        {phoneLang === 'en' ? 'Assigned Curriculum' : 'Plan de Aprendizaje'}
                      </span>
                      <span className="text-emerald-700 font-bold">LS3000 · 82%</span>
                    </div>

                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#3E6B2B] h-full rounded-full w-[82%]" />
                    </div>

                    <div>
                      <div className="font-bold text-xs text-stone-900">
                        {phoneLang === 'en' ? 'Foundations of In-Home Care' : 'Fundamentos del Cuidado en el Hogar'}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {phoneLang === 'en' ? 'Due in 5 days · Next: Quiz 2' : 'Vence en 5 días · Siguiente: Cuestionario 2'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => showToast(phoneLang === 'en' ? 'Resumed course player on phone.' : 'Reproductor de curso iniciado.')}
                      className="w-full bg-[#3E6B2B] hover:bg-[#335a23] text-white font-bold text-xs py-2 rounded-xl transition"
                    >
                      {phoneLang === 'en' ? 'Continue Course →' : 'Continuar Curso →'}
                    </button>
                  </div>

                  {/* Upcoming Live Session */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-2xs space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      {phoneLang === 'en' ? 'Upcoming Live Session' : 'Próxima Sesión en Vivo'}
                    </div>
                    <div className="font-bold text-xs text-stone-900">
                      {phoneLang === 'en' ? 'Orientation Cohort (Zoom)' : 'Cohorte de Orientación (Zoom)'}
                    </div>
                    <div className="text-[11px] text-stone-600">
                      📅 Nov 20, 10:00 AM MST
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast('Session added to phone calendar.')}
                      className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs py-1.5 rounded-xl transition"
                    >
                      {phoneLang === 'en' ? 'Add to Calendar' : 'Agregar al Calendario'}
                    </button>
                  </div>

                  {/* Issued Certificate */}
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-emerald-950">
                        {phoneLang === 'en' ? 'Agency Orientation Graduate' : 'Graduado de Orientación'}
                      </div>
                      <div className="text-[10px] text-emerald-800">Verified ID #LS-OR-1088</div>
                    </div>
                    <span className="text-xl">🎓</span>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. EDIT PATH MODAL */}
      {/* ========================================================================= */}
      {editingPath && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div>
                <h3 className="font-bold text-base text-stone-900">Edit Training Path: {editingPath.name}</h3>
                <p className="text-xs text-stone-500">Configure pass marks, renewal cycles, and sequence of courses.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingPath(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast(`Saved configuration for ${editingPath.name}.`);
                setEditingPath(null);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Path Name
                </label>
                <input
                  type="text"
                  required
                  defaultValue={editingPath.name}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Pass Mark (%)
                  </label>
                  <input
                    type="number"
                    min={70}
                    max={100}
                    defaultValue={editingPath.passMark}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Renewal Cycle
                  </label>
                  <select
                    defaultValue={editingPath.renewalCycle}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
                  >
                    <option value="Once on hire">Once on hire</option>
                    <option value="6 months">6 months</option>
                    <option value="12 months">12 months (Annual)</option>
                  </select>
                </div>
              </div>

              {/* Path History */}
              <div className="pt-2 border-t border-stone-200">
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Path Revision History
                </div>
                <div className="space-y-2">
                  {editingPath.history.map((h, i) => (
                    <div key={i} className="p-2.5 bg-stone-50 rounded-xl text-[11px] text-stone-600">
                      <div className="flex justify-between font-bold text-stone-800">
                        <span>{h.editor}</span>
                        <span className="font-normal text-stone-400">{h.date}</span>
                      </div>
                      <div className="mt-0.5">{h.change}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingPath(null)}
                  className="px-4 py-2 font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#3E6B2B] hover:bg-[#335a23] text-white font-bold px-4 py-2 rounded-xl shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. SCHEDULE LIVE SESSION MODAL */}
      {/* ========================================================================= */}
      {isScheduleSessionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="font-bold text-base text-stone-900 mb-1">Schedule Live Training / Skills Session</h3>
            <p className="text-xs text-stone-500 mb-4">Set up a Zoom cohort or registered nurse skills validation lab.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast('New training session scheduled! Bilingual calendar invites sent to caregivers.');
                setIsScheduleSessionModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Session Type
                </label>
                <select className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900">
                  <option value="Virtual Orientation">Post-Orientation Virtual Meeting (Zoom)</option>
                  <option value="Skills Validation Lab">Clinical Skills Validation Demonstration (In-Person / Virtual)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Session Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IHSS Family Attendant Return Demonstration Lab"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    defaultValue="2026-11-23"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    required
                    defaultValue="10:00 AM – 11:30 AM MST"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Host or Clinical Validator
                </label>
                <input
                  type="text"
                  required
                  defaultValue="Dana Whitfield, RN (Clinical Supervisor)"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsScheduleSessionModalOpen(false)}
                  className="px-4 py-2 font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#3E6B2B] hover:bg-[#335a23] text-white font-bold px-4 py-2 rounded-xl shadow-xs"
                >
                  Schedule and Send Invites
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 12. RECORD VIDEO SIMULATION MODAL */}
      {/* ========================================================================= */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-stone-900 text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-700">
            <h3 className="font-bold text-base text-white mb-1">Record Training Video</h3>
            <p className="text-xs text-stone-400 mb-4">Record screen walkthroughs and upload to the LearnWorlds LMS library.</p>
            <div className="bg-black/40 rounded-2xl p-8 border border-white/10 text-center space-y-3">
              <div className="text-4xl animate-pulse">🔴</div>
              <div className="font-bold text-sm text-white">Camera & Screen Ready</div>
              <p className="text-xs text-stone-400">Audio input: Default microphone (Tested). Video input: High-definition 1080p.</p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Recorded 45s demonstration video: "LS-DEMO-EVV-01.mp4"');
                  setIsVideoModalOpen(false);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs"
              >
                Start Recording
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
