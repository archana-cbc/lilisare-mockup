'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Page, Btn, Pill, Bar, Tbl, Sel } from '../ui';
import { CG, CAREGIVER_RECRUITMENT_STAGES, CAREGIVER_APPLICANTS, STAFF } from '@/data/mockData';
import { CaregiverApplicant } from '@/types';

// Helper for staff avatar initials & color
const getStaffInitials = (staff: string) => {
  const parts = staff.split(' ');
  return parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase();
};

const getStaffColor = (staff: string) => {
  switch (staff) {
    case 'Maya R.':
      return 'bg-emerald-700 text-white';
    case 'Jon P.':
      return 'bg-blue-700 text-white';
    case 'Alicia T.':
      return 'bg-purple-700 text-white';
    case 'Sam K.':
      return 'bg-amber-700 text-white';
    default:
      return 'bg-stone-700 text-white';
  }
};

export const CaregiversPage: React.FC = () => {
  const { showToast, addFeed, deIdentify, navigate } = useApp();

  // View Switcher: Recruitment Pipeline (default) vs Active Caregivers Roster
  const [viewTab, setViewTab] = useState<'recruitment' | 'roster'>('recruitment');

  // Recruitment Kanban State
  const [applicants, setApplicants] = useState<CaregiverApplicant[]>(CAREGIVER_APPLICANTS);
  const [selectedApplicant, setSelectedApplicant] = useState<CaregiverApplicant | null>(null);
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [applicantFilterOwner, setApplicantFilterOwner] = useState('All');
  const [applicantFilterType, setApplicantFilterType] = useState('All');

  // Active Caregivers Roster State
  const [filterType, setFilterType] = useState('All caregivers');
  const [empFilter, setEmpFilter] = useState<'All' | 'Employee' | '1099' | 'Both'>('All');

  // Drag and Drop handlers for Recruitment Kanban
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

    const stepIndex = CAREGIVER_RECRUITMENT_STAGES.indexOf(targetStage) + 1;

    const updated = applicants.map((a) => {
      if (a.id === appId) {
        return {
          ...a,
          stage: targetStage,
          currentStep: stepIndex > 0 ? stepIndex : a.currentStep,
          daysInStage: 0,
        };
      }
      return a;
    });

    setApplicants(updated);
    if (selectedApplicant && selectedApplicant.id === appId) {
      setSelectedApplicant(updated.find((a) => a.id === appId) || null);
    }
    showToast(`${deIdentify(target.name)} moved to ${targetStage}`);
    addFeed(`Caregiver applicant ${deIdentify(target.name)} moved to ${targetStage}`, false);
    setDraggedAppId(null);
  };

  // Filtered applicants
  const filteredApplicants = applicants.filter((a) => {
    if (applicantFilterOwner !== 'All' && a.owner !== applicantFilterOwner) return false;
    if (applicantFilterType !== 'All' && a.employmentType !== applicantFilterType) return false;
    return true;
  });

  // Filtered roster rows
  const rosterRows = CG.filter((r) => {
    const matchesCategory =
      filterType === 'All caregivers' ||
      (filterType === 'Expiring or expired' && r.expiringColor !== 'green') ||
      (filterType === 'Family caregivers' && r.isFamily) ||
      (filterType === 'Non-family' && !r.isFamily);

    const matchesEmp = empFilter === 'All' || r.employmentType === empFilter;
    return matchesCategory && matchesEmp;
  });

  return (
    <Page
      t="Caregivers"
      s="Outside recruitment pipeline and active caregiver roster · Green = Caregiver"
      a={
        <div className="flex items-center gap-2">
          <Btn onClick={() => showToast('New caregiver applicant form opened')}>
            + Add applicant
          </Btn>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Top View Switcher */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setViewTab('recruitment')}
              className={`py-2 px-4 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                viewTab === 'recruitment'
                  ? 'bg-[#3E6B2B] text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span>📋</span>
              <span>Caregiver Recruitment Pipeline</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  viewTab === 'recruitment' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-800'
                }`}
              >
                {applicants.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setViewTab('roster')}
              className={`py-2 px-4 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                viewTab === 'roster'
                  ? 'bg-[#3E6B2B] text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span>👥</span>
              <span>Active Caregivers Roster</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  viewTab === 'roster' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-800'
                }`}
              >
                {CG.length}
              </span>
            </button>
          </div>

          <span className="text-xs font-semibold text-[#3E6B2B] bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            Green = Caregiver
          </span>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: CAREGIVER RECRUITMENT PIPELINE (KANBAN BOARD) */}
        {/* ------------------------------------------------------------- */}
        {viewTab === 'recruitment' ? (
          <div className="space-y-4">
            {/* Note Banner explaining family caregivers vs outside recruits */}
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-base">💡</span>
                <span>
                  <b>Outside Caregiver Pipeline:</b> Dedicated recruitment track for external applicants.
                  <span className="text-emerald-800 ml-1">
                    Family caregivers skip recruitment and enter directly at <b>"Packet sent"</b> in Onboarding after conversion.
                  </span>
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-[#3E6B2B] border border-emerald-300 shrink-0">
                CAREGIVER RECRUITING
              </span>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-500 font-semibold">Filter Owner:</span>
                <select
                  value={applicantFilterOwner}
                  onChange={(e) => setApplicantFilterOwner(e.target.value)}
                  className="bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs font-semibold text-stone-800 focus:outline-none"
                >
                  <option value="All">All Owners</option>
                  {STAFF.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <span className="text-stone-500 font-semibold ml-2">Type:</span>
                <select
                  value={applicantFilterType}
                  onChange={(e) => setApplicantFilterType(e.target.value)}
                  className="bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs font-semibold text-stone-800 focus:outline-none"
                >
                  <option value="All">All Types</option>
                  <option value="Employee">Employee (~20 docs)</option>
                  <option value="1099">1099 (~15 docs)</option>
                  <option value="Both">Both (CNA / Attendant)</option>
                </select>
              </div>

              <div className="text-xs text-stone-500 font-medium">
                Drag cards to advance recruitment stages · Click card for details
              </div>
            </div>

            {/* 8-Stage Kanban Board with Green Accents */}
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start">
              {CAREGIVER_RECRUITMENT_STAGES.map((stage, stageIdx) => {
                const stageApplicants = filteredApplicants.filter((a) => a.stage === stage);
                const isDragOver = dragOverStage === stage;

                return (
                  <div
                    key={stage}
                    onDragOver={(e) => handleDragOver(e, stage)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, stage)}
                    className={`min-w-[275px] w-[275px] rounded-xl border p-3 shrink-0 flex flex-col justify-between transition-colors bg-emerald-50/40 border-emerald-200/60 ${
                      isDragOver ? 'ring-2 ring-[#3E6B2B] bg-emerald-100/70' : ''
                    }`}
                  >
                    <div>
                      {/* Column Header */}
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-200/70">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#3E6B2B]" />
                          <h4 className="font-extrabold text-xs uppercase tracking-wider text-stone-800 truncate">
                            {stage}
                          </h4>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#3E6B2B]">
                          {stageApplicants.length}
                        </span>
                      </div>

                      {/* Cards */}
                      <div className="space-y-3 min-h-[100px]">
                        {stageApplicants.map((applicant) => {
                          const stepPct = Math.round((applicant.currentStep / 8) * 100);

                          return (
                            <div
                              key={applicant.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, applicant)}
                              onClick={() => setSelectedApplicant(applicant)}
                              className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-2xs hover:shadow-md hover:border-[#3E6B2B] transition-all cursor-pointer group"
                            >
                              {/* Top: Name & Green CAREGIVER Badge */}
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <span className="font-bold text-sm text-stone-900 group-hover:text-[#3E6B2B] transition-colors">
                                  {deIdentify(applicant.name)}
                                </span>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-[#3E6B2B] border border-emerald-200 shrink-0">
                                  CAREGIVER
                                </span>
                              </div>

                              {/* Class & Source */}
                              <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                                <span className="font-semibold text-stone-800">{applicant.serviceClass}</span>
                                <span>·</span>
                                <span>{applicant.employmentType}</span>
                                <span>·</span>
                                <span className="text-stone-400">{applicant.source}</span>
                              </div>

                              {/* Progress */}
                              <div className="mb-2.5">
                                <div className="flex justify-between text-[11px] text-stone-500 font-medium mb-1">
                                  <span>Step {applicant.currentStep} of 8</span>
                                  <span>{stepPct}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                                  <div
                                    style={{ width: `${stepPct}%` }}
                                    className="h-full bg-[#3E6B2B] rounded-full transition-all"
                                  />
                                </div>
                              </div>

                              {/* Footer: Owner, Days in stage */}
                              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    title={`Owner: ${applicant.owner}`}
                                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${getStaffColor(
                                      applicant.owner
                                    )}`}
                                  >
                                    {getStaffInitials(applicant.owner)}
                                  </span>
                                  <span>{applicant.county} County</span>
                                </div>
                                <span>{applicant.daysInStage}d in stage</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dashed Add Button */}
                    <button
                      type="button"
                      onClick={() => showToast(`Add applicant to ${stage}`)}
                      className="mt-3 w-full py-2 px-3 border border-dashed border-emerald-300 rounded-xl text-xs font-semibold text-stone-600 hover:text-[#3E6B2B] hover:border-[#3E6B2B] hover:bg-white transition-all text-center"
                    >
                      + Add applicant
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* VIEW 2: ACTIVE CAREGIVERS ROSTER */
          /* ------------------------------------------------------------- */
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center bg-stone-50 border border-stone-200 rounded-xl p-3">
              <Sel
                v={filterType}
                set={setFilterType}
                opts={['All caregivers', 'Family caregivers', 'Non-family', 'Expiring or expired']}
              />
              {(['All', 'Employee', '1099', 'Both'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setEmpFilter(t)}
                  aria-pressed={empFilter === t}
                  className={`rounded-full px-3 py-1 text-xs font-semibold border transition ${
                    empFilter === t
                      ? 'bg-[#3E6B2B] text-white border-[#3E6B2B] shadow-sm'
                      : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <Tbl
              rows={rosterRows}
              onRow={(r) => showToast(`Opening ${deIdentify(r.name)} profile`)}
              cols={[
                ['ID', (r) => <span className="font-mono text-xs text-stone-500">{r.id}</span>],
                [
                  'Caregiver',
                  (r) => (
                    <div>
                      <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                        <span>{deIdentify(r.name)}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-[#3E6B2B] border border-emerald-200">
                          CAREGIVER
                        </span>
                        <span className="text-[11px] font-medium text-stone-500 border border-stone-300 rounded px-1 py-0.2 bg-stone-50">
                          {r.employmentType}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        {r.isFamily ? 'Family caregiver' : 'Non-family caregiver'}
                      </div>
                    </div>
                  ),
                ],
                ['Class', (r) => r.serviceClass],
                ['CA', (r) => r.ca],
                ['Next expiring', (r) => <Pill c={r.expiringColor}>{r.nextExpiring}</Pill>],
                [
                  'Academy',
                  (r) => (
                    <div className="min-w-[150px]">
                      <div className="text-xs text-stone-500 mb-1 font-medium">
                        LS3000 · {r.academyProgress}%
                      </div>
                      <Bar v={r.academyProgress} />
                    </div>
                  ),
                ],
              ]}
            />
          </div>
        )}
      </div>

      {/* Slide-over Candidate Detail Drawer */}
      {selectedApplicant && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-fadeIn"
          onClick={() => setSelectedApplicant(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Caregiver candidate details"
            className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slideLeft p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start pb-3 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-[#1c2a17]">
                    {deIdentify(selectedApplicant.name)}
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-[#3E6B2B] border border-emerald-200">
                    CAREGIVER CANDIDATE
                  </span>
                </div>
                <div className="text-xs text-stone-500 mt-1">
                  {selectedApplicant.serviceClass} · {selectedApplicant.employmentType} · Applied {selectedApplicant.appliedDate} via {selectedApplicant.source}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-800 hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <span className="font-bold text-stone-900 block">Contact Information</span>
                <div className="grid grid-cols-2 gap-2 text-stone-700">
                  <div>Phone: <b>{selectedApplicant.phone}</b></div>
                  <div>Email: <b>{selectedApplicant.email}</b></div>
                  <div>County: <b>{selectedApplicant.county}</b></div>
                  <div>Owner: <b>{selectedApplicant.owner}</b></div>
                </div>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <span className="font-bold text-stone-900 block">Pre-Screening Checks</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-white rounded border border-stone-200 text-center">
                    <span className="text-[10px] text-stone-400 block font-semibold">CPR / First Aid</span>
                    <span className="font-bold text-emerald-800">{selectedApplicant.cprStatus || 'Valid'}</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-stone-200 text-center">
                    <span className="text-[10px] text-stone-400 block font-semibold">TB Test</span>
                    <span className="font-bold text-emerald-800">{selectedApplicant.tbStatus || 'Valid'}</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-stone-200 text-center">
                    <span className="text-[10px] text-stone-400 block font-semibold">CBI Check</span>
                    <span className="font-bold text-stone-800">{selectedApplicant.cbiStatus || 'Pending'}</span>
                  </div>
                </div>
              </div>

              {/* Training Status Card */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>🎓</span>
                    <span>Training & Academy Record</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedApplicant(null);
                      navigate('training');
                    }}
                    className="text-xs font-bold text-[#3E6B2B] hover:underline"
                  >
                    Open in Training →
                  </button>
                </div>
                <div className="flex justify-between items-center text-xs text-stone-700">
                  <span>Assigned: <strong>LS3000 In-Home Care Foundations</strong></span>
                  <span className="font-bold text-emerald-800">{selectedApplicant.currentStep > 3 ? '100% Complete' : 'In Progress (60%)'}</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#3E6B2B] h-full rounded-full" style={{ width: selectedApplicant.currentStep > 3 ? '100%' : '60%' }} />
                </div>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                <span className="font-bold text-stone-900 block">Recruiter Notes</span>
                <p className="text-stone-700">{selectedApplicant.notes || 'Interview notes pending.'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-end gap-2 mt-auto">
              <Btn k="ghost" onClick={() => setSelectedApplicant(null)}>
                Close
              </Btn>
              <Btn
                k="primary"
                onClick={() => {
                  showToast(`Hiring packet dispatched to ${selectedApplicant.name}`);
                  setSelectedApplicant(null);
                }}
              >
                Send Hiring Packet
              </Btn>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
};
