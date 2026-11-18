'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Pill, Btn } from '../ui';
import { PillColor } from '@/types';

// Icons
const IconAlert = () => (
  <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const IconShield = () => (
  <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const IconClock = () => (
  <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconFile = () => (
  <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const IconHome = () => (
  <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const IconClipboard = () => (
  <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

export const TodayPage: React.FC = () => {
  const { navigate, deIdentify, showToast, runDemo, isDemoRunning } = useApp();

  // Filters & State
  const [businessLine, setBusinessLine] = useState('All');
  const [roleView, setRoleView] = useState<'Executive' | 'Onboarding' | 'Compliance' | 'Billing' | 'Scheduler'>('Executive');
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [bottomTab, setBottomTab] = useState<'Insights' | 'Activity'>('Insights');
  const [activityFilter, setActivityFilter] = useState<'All' | 'Automated' | 'Needs human'>('All');

  const BUSINESS_LINES = ['All', 'Mountain Lane', 'Colorado Home Health', 'IHSS', 'IRSS', 'Frisco'];
  const ROLES: Array<'Executive' | 'Onboarding' | 'Compliance' | 'Billing' | 'Scheduler'> = [
    'Executive',
    'Onboarding',
    'Compliance',
    'Billing',
    'Scheduler',
  ];

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1c2a17] tracking-tight">
            Good morning, Lisa!
          </h1>
          <p className="text-stone-600 text-sm mt-0.5 font-medium">
            Tuesday, November 17, 2026 · Overview
          </p>
        </div>

        {/* Header Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Branch Filter */}
          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-1.5 shadow-2xs text-xs font-medium text-stone-700">
            <span className="text-stone-400 font-normal">Branch:</span>
            <select
              value={businessLine}
              onChange={(e) => {
                setBusinessLine(e.target.value);
                showToast(`Filter: ${e.target.value}`);
              }}
              className="bg-transparent font-semibold text-stone-900 focus:outline-none cursor-pointer"
            >
              {BUSINESS_LINES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center bg-stone-200/70 p-0.5 rounded-lg border border-stone-300/60 text-xs font-medium">
            {ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setRoleView(role);
                  showToast(`Switched to ${role} view`);
                }}
                className={`px-3 py-1 rounded-md transition ${
                  roleView === role
                    ? 'bg-white text-stone-900 font-bold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* AI Briefing Button */}
          <button
            type="button"
            onClick={() => setIsBriefingOpen(true)}
            className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold bg-white border border-stone-300 text-stone-800 hover:bg-stone-50 shadow-2xs transition"
          >
            <span>✨</span>
            <span>AI Briefing</span>
          </button>
        </div>
      </div>

      {/* 2. KPI STRIP (5 Cards Only - Role-Specific) */}
      {roleView === 'Executive' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Active clients', val: '487', sub: '+12 this month', target: 'clients' },
            { label: 'Active caregivers', val: '902', sub: '38 in onboarding', target: 'caregivers' },
            { label: 'Pending authorizations', val: '23', sub: '6 overdue', dot: 'bg-red-500', target: 'emails' },
            { label: 'Credentials expiring', val: '41', sub: '8 expired', dot: 'bg-red-500', target: 'compliance' },
            { label: 'Households stuck', val: '11', sub: '>5 days delayed', dot: 'bg-amber-500', target: 'onboarding' },
          ].map((k, i) => (
            <button
              key={i}
              type="button"
              onClick={() => navigate(k.target)}
              className="text-left bg-white border border-stone-200 rounded-xl p-5 hover:border-[#3E6B2B] hover:shadow-sm transition group flex flex-col justify-between"
            >
              <div className="text-xs uppercase tracking-wide font-semibold text-stone-500 group-hover:text-[#3E6B2B] transition-colors">
                {k.label}
              </div>
              <div className="text-3xl font-extrabold text-[#1c2a17] my-2">{k.val}</div>
              <div className="text-xs font-medium text-stone-600 flex items-center">
                {k.dot && <span className={`w-2 h-2 rounded-full ${k.dot} inline-block mr-1.5 shrink-0`} />}
                <span>{k.sub}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {roleView === 'Onboarding' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Active caregivers', val: '902', sub: '38 in pipeline', target: 'caregivers' },
            { label: 'Stuck in onboarding', val: '11', sub: '>5 days delayed', dot: 'bg-amber-500', target: 'onboarding' },
            { label: 'Inquiries pipeline', val: '78', sub: '24 new leads', target: 'intake' },
            { label: 'Background checks', val: '77', sub: '3 flagged for review', dot: 'bg-red-500', target: 'screening' },
            { label: 'Activation target', val: '7 days', sub: 'Current avg: 14 days', target: 'onboarding' },
          ].map((k, i) => (
            <button
              key={i}
              type="button"
              onClick={() => navigate(k.target)}
              className="text-left bg-white border border-stone-200 rounded-xl p-5 hover:border-[#3E6B2B] hover:shadow-sm transition flex flex-col justify-between"
            >
              <div className="text-xs uppercase tracking-wide font-semibold text-stone-500">{k.label}</div>
              <div className="text-3xl font-extrabold text-[#1c2a17] my-2">{k.val}</div>
              <div className="text-xs font-medium text-stone-600 flex items-center">
                {k.dot && <span className={`w-2 h-2 rounded-full ${k.dot} inline-block mr-1.5 shrink-0`} />}
                <span>{k.sub}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {roleView === 'Compliance' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Credentials expiring', val: '41', sub: '8 expired now', dot: 'bg-red-500', target: 'compliance' },
            { label: 'Overdue authorizations', val: '6', sub: 'Payment at risk', dot: 'bg-red-500', target: 'emails' },
            { label: 'Notes awaiting audit', val: '26', sub: 'AI suggestions ready', dot: 'bg-amber-500', target: 'audit' },
            { label: 'EVV exceptions', val: '14', sub: '7 self-correct pending', dot: 'bg-amber-500', target: 'scheduling' },
            { label: 'Supervisory visits', val: '278/310', sub: '90% on track', target: 'compliance' },
          ].map((k, i) => (
            <button
              key={i}
              type="button"
              onClick={() => navigate(k.target)}
              className="text-left bg-white border border-stone-200 rounded-xl p-5 hover:border-[#3E6B2B] hover:shadow-sm transition flex flex-col justify-between"
            >
              <div className="text-xs uppercase tracking-wide font-semibold text-stone-500">{k.label}</div>
              <div className="text-3xl font-extrabold text-[#1c2a17] my-2">{k.val}</div>
              <div className="text-xs font-medium text-stone-600 flex items-center">
                {k.dot && <span className={`w-2 h-2 rounded-full ${k.dot} inline-block mr-1.5 shrink-0`} />}
                <span>{k.sub}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {roleView === 'Billing' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Billed amount', val: '$184k', sub: '712 claims paid', target: 'billing' },
            { label: 'Unbilled amount', val: '$28.5k', sub: 'Awaiting notes / EVV', dot: 'bg-amber-500', target: 'billing' },
            { label: 'Denied claims', val: '$8.9k', sub: '3 claims to appeal', dot: 'bg-red-500', target: 'billing' },
            { label: 'Auths without approval', val: '6', sub: '$14,200 at risk', dot: 'bg-red-500', target: 'emails' },
            { label: 'ADP payroll ready', val: '$246k', sub: '6 exceptions to clear', target: 'billing' },
          ].map((k, i) => (
            <button
              key={i}
              type="button"
              onClick={() => navigate(k.target)}
              className="text-left bg-white border border-stone-200 rounded-xl p-5 hover:border-[#3E6B2B] hover:shadow-sm transition flex flex-col justify-between"
            >
              <div className="text-xs uppercase tracking-wide font-semibold text-stone-500">{k.label}</div>
              <div className="text-3xl font-extrabold text-[#1c2a17] my-2">{k.val}</div>
              <div className="text-xs font-medium text-stone-600 flex items-center">
                {k.dot && <span className={`w-2 h-2 rounded-full ${k.dot} inline-block mr-1.5 shrink-0`} />}
                <span>{k.sub}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {roleView === 'Scheduler' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Unfilled shifts', val: '8', sub: '5 urgent ≤48h', dot: 'bg-red-500', target: 'scheduling' },
            { label: 'EVV compliance', val: '96.4%', sub: 'Target: 95.0%', target: 'scheduling' },
            { label: 'Unverified hours', val: '42.5h', sub: '~$935.00 cost impact', dot: 'bg-amber-500', target: 'scheduling' },
            { label: 'Caregivers near OT', val: '14', sub: '37–39.5 hrs logged', dot: 'bg-amber-500', target: 'scheduling' },
            { label: 'Completed visits', val: '412', sub: 'This pay period', target: 'scheduling' },
          ].map((k, i) => (
            <button
              key={i}
              type="button"
              onClick={() => navigate(k.target)}
              className="text-left bg-white border border-stone-200 rounded-xl p-5 hover:border-[#3E6B2B] hover:shadow-sm transition flex flex-col justify-between"
            >
              <div className="text-xs uppercase tracking-wide font-semibold text-stone-500">{k.label}</div>
              <div className="text-3xl font-extrabold text-[#1c2a17] my-2">{k.val}</div>
              <div className="text-xs font-medium text-stone-600 flex items-center">
                {k.dot && <span className={`w-2 h-2 rounded-full ${k.dot} inline-block mr-1.5 shrink-0`} />}
                <span>{k.sub}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 3. "NEEDS YOUR ATTENTION" (Main Card, Full Width) */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-base text-[#1c2a17]">Needs your attention</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">
              7 priority items
            </span>
          </div>
          <button
            type="button"
            onClick={() => showToast('Full task list modal opened')}
            className="text-xs font-semibold text-[#3E6B2B] hover:underline"
          >
            View all tasks →
          </button>
        </div>

        <div className="divide-y divide-stone-100">
          {[
            {
              icon: <span className="text-base">🎓</span>,
              text: '9 caregivers overdue on orientation & mandatory training',
              pill: 'Overdue',
              col: 'red',
              action: 'Resolve in Training',
              onClick: () => navigate('training'),
            },
            {
              icon: <IconAlert />,
              text: '6 caregivers working without approval · payment at risk',
              pill: 'Immediate',
              col: 'red',
              action: 'Send follow-ups',
              onClick: () => {
                showToast('Follow-up emails queued for 6 case managers');
                navigate('emails');
              },
            },
            {
              icon: <IconShield />,
              text: '3 screening results flagged for internal review',
              pill: 'Action required',
              col: 'red',
              action: 'Review',
              onClick: () => navigate('screening'),
            },
            {
              icon: <IconClipboard />,
              text: '8 caregiver credentials expired',
              pill: 'Overdue',
              col: 'red',
              action: 'Review',
              onClick: () => navigate('compliance'),
            },
            {
              icon: <IconClock />,
              text: '14 EVV visits at risk · missing clock-out or GPS',
              pill: 'At risk',
              col: 'amber',
              action: 'Review',
              onClick: () => navigate('scheduling'),
            },
            {
              icon: <IconFile />,
              text: '26 care notes awaiting audit · AI wording ready',
              pill: 'Pending',
              col: 'amber',
              action: 'Open queue',
              onClick: () => navigate('audit'),
            },
            {
              icon: <IconHome />,
              text: '11 households stuck in onboarding > 5 days',
              pill: 'Delayed',
              col: 'amber',
              action: 'View',
              onClick: () => navigate('onboarding'),
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 px-2 rounded-lg transition"
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm font-medium text-stone-900">{item.text}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <Pill c={item.col as PillColor}>{item.pill}</Pill>
                <button
                  type="button"
                  onClick={item.onClick}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-white border border-stone-300 text-stone-800 hover:bg-stone-100 hover:border-stone-400 shadow-2xs transition"
                >
                  {item.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 & 5. DYNAMIC ROLE-BASED CARDS SECTION */}
      {/* ------------------------------------------------------------- */}
      {/* EXECUTIVE VIEW */}
      {/* ------------------------------------------------------------- */}
      {roleView === 'Executive' && (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Onboarding funnel */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-[#1c2a17]">Onboarding funnel</h3>
                    <span className="text-xs text-stone-500 font-medium">
                      Avg 14 days to activate (target: 7)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('onboarding')}
                    className="text-xs font-semibold text-[#3E6B2B] hover:underline"
                  >
                    View all →
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { stage: 'Applied', count: 142, pct: 100 },
                    { stage: 'Documents', count: 74, pct: 52 },
                    { stage: 'Screening & training', count: 44, pct: 31 },
                    { stage: 'Authorized', count: 36, pct: 25 },
                    { stage: 'Active', count: 34, pct: 24 },
                  ].map((step, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs text-stone-700 font-medium mb-1">
                        <span>{step.stage}</span>
                        <span className="font-bold text-stone-900">{step.count} caregivers</span>
                      </div>
                      <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${step.pct}%` }}
                          className="h-full bg-[#3E6B2B] rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Client intake pipeline */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-[#1c2a17]">Client intake pipeline</h3>
                    <span className="text-xs text-stone-500 font-medium">
                      78 active inquiries · 15 converted (28% conversion rate)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('intake')}
                    className="text-xs font-semibold text-[#3E6B2B] hover:underline"
                  >
                    View all →
                  </button>
                </div>
                <div className="space-y-2 mb-5">
                  <div className="h-3 w-full rounded-full overflow-hidden flex bg-stone-100">
                    <div style={{ width: '31%' }} title="New lead: 24" className="bg-emerald-500" />
                    <div style={{ width: '23%' }} title="Contacted: 18" className="bg-blue-500" />
                    <div style={{ width: '15%' }} title="Assessment: 12" className="bg-amber-400" />
                    <div style={{ width: '12%' }} title="CM coordination: 9" className="bg-purple-500" />
                    <div style={{ width: '19%' }} title="Converted: 15" className="bg-[#3E6B2B]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  {[
                    { name: 'New lead', count: 24, col: 'bg-emerald-500' },
                    { name: 'Contacted', count: 18, col: 'bg-blue-500' },
                    { name: 'In assessment', count: 12, col: 'bg-amber-400' },
                    { name: 'CM coordination', count: 9, col: 'bg-purple-500' },
                    { name: 'Converted', count: 15, col: 'bg-[#3E6B2B]' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg border border-stone-200">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.col} shrink-0`} />
                      <div className="truncate">
                        <span className="text-stone-700 font-medium">{item.name}</span>
                        <b className="block text-stone-900">{item.count}</b>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Authorizations */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#1c2a17]">Authorizations</h3>
                    <Pill c="red">6 overdue</Pill>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('emails')}
                    className="text-xs font-semibold text-[#3E6B2B] hover:underline"
                  >
                    View all →
                  </button>
                </div>
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-xs font-medium text-stone-600">
                    <span>Approved: 184 (85%)</span>
                    <span>Awaiting state: 23 (11%)</span>
                    <span className="text-red-700 font-bold">Overdue: 6 (4%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-stone-100 flex overflow-hidden">
                    <div style={{ width: '85%' }} className="bg-[#3E6B2B]" />
                    <div style={{ width: '11%' }} className="bg-amber-400" />
                    <div style={{ width: '4%' }} className="bg-red-500" />
                  </div>
                </div>
                <div className="divide-y divide-stone-100 text-xs">
                  {[
                    { client: 'Marisol Vega', cm: 'Dana Whitfield', overdue: '14d overdue' },
                    { client: 'Harper Nguyen', cm: 'Dana Whitfield', overdue: '9d overdue' },
                    { client: 'Desmond Clarke', cm: 'Priya Shah', overdue: '7d overdue' },
                  ].map((item, i) => (
                    <div key={i} className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-stone-900">{deIdentify(item.client)}</span>
                        <span className="text-stone-500 ml-1.5">· CM: {item.cm}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-red-700 font-bold">{item.overdue}</span>
                        <button
                          type="button"
                          onClick={() => showToast(`Follow-up sent to ${item.cm}`)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#3E6B2B] border border-stone-300 rounded hover:bg-stone-50"
                        >
                          Send follow-up
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Compliance */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#1c2a17]">Compliance</h3>
                    <Pill c="red">8 expired</Pill>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('compliance')}
                    className="text-xs font-semibold text-[#3E6B2B] hover:underline"
                  >
                    View all →
                  </button>
                </div>
                <p className="text-xs text-stone-500 mb-3">
                  Caregivers with urgent credential renewal deadlines:
                </p>
                <div className="divide-y divide-stone-100 text-xs">
                  {[
                    { name: 'Rosa Vega', cred: 'CPR / First aid', pill: 'Expired', col: 'red' },
                    { name: 'Luis Ruiz', cred: 'Driving record', pill: 'Expired (2d)', col: 'red' },
                    { name: 'Grace Park', cred: 'TB test', pill: '12d left', col: 'red' },
                  ].map((c, i) => (
                    <div key={i} className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-stone-900">{deIdentify(c.name)}</span>
                        <span className="text-stone-500 block text-xs mt-0.5">{c.cred}</span>
                      </div>
                      <Pill c={c.col as PillColor}>{c.pill}</Pill>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ONBOARDING VIEW */}
      {/* ------------------------------------------------------------- */}
      {roleView === 'Onboarding' && (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Onboarding Funnel */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-[#1c2a17]">Onboarding funnel (Caregiver pipeline)</h3>
                    <span className="text-xs text-stone-500 font-medium">38 active households in progress</span>
                  </div>
                  <button type="button" onClick={() => navigate('onboarding')} className="text-xs font-semibold text-[#3E6B2B] hover:underline">
                    View all →
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { stage: 'Applied', count: 142, pct: 100 },
                    { stage: 'Documents sent', count: 74, pct: 52 },
                    { stage: 'Screening & background', count: 44, pct: 31 },
                    { stage: 'Authorized by CMA', count: 36, pct: 25 },
                    { stage: 'Active on roster', count: 34, pct: 24 },
                  ].map((step, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs text-stone-700 font-medium mb-1">
                        <span>{step.stage}</span>
                        <span className="font-bold text-stone-900">{step.count} candidates</span>
                      </div>
                      <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div style={{ width: `${step.pct}%` }} className="h-full bg-[#3E6B2B] rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Intake Pipeline */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-[#1c2a17]">Intake inquiries by stage</h3>
                    <span className="text-xs text-stone-500 font-medium">78 inquiries · 24 new leads</span>
                  </div>
                  <button type="button" onClick={() => navigate('intake')} className="text-xs font-semibold text-[#3E6B2B] hover:underline">
                    View all →
                  </button>
                </div>
                <div className="space-y-2 mb-5">
                  <div className="h-3 w-full rounded-full overflow-hidden flex bg-stone-100">
                    <div style={{ width: '31%' }} className="bg-emerald-500" />
                    <div style={{ width: '23%' }} className="bg-blue-500" />
                    <div style={{ width: '15%' }} className="bg-amber-400" />
                    <div style={{ width: '12%' }} className="bg-purple-500" />
                    <div style={{ width: '19%' }} className="bg-[#3E6B2B]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  {[
                    { name: 'New lead', count: 24, col: 'bg-emerald-500' },
                    { name: 'Contacted', count: 18, col: 'bg-blue-500' },
                    { name: 'Assessment', count: 12, col: 'bg-amber-400' },
                    { name: 'CM coordination', count: 9, col: 'bg-purple-500' },
                    { name: 'Converted', count: 15, col: 'bg-[#3E6B2B]' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg border border-stone-200">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.col} shrink-0`} />
                      <div className="truncate">
                        <span className="text-stone-700 font-medium">{item.name}</span>
                        <b className="block text-stone-900">{item.count}</b>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Stuck households */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#1c2a17]">Households stuck in onboarding</h3>
                    <Pill c="amber">11 delayed &gt;5d</Pill>
                  </div>
                  <button type="button" onClick={() => navigate('onboarding')} className="text-xs font-semibold text-[#3E6B2B] hover:underline">
                    View all →
                  </button>
                </div>
                <div className="divide-y divide-stone-100 text-xs">
                  {[
                    { client: 'Marisol Vega household', cg: 'Rosa Vega', issue: 'Awaiting ID upload (blurry)', wait: '7d delay', btn: 'Send reminder' },
                    { client: 'Desmond Clarke household', cg: 'Tasha Clarke', issue: 'CBI check pending', wait: '6d delay', btn: 'Check status' },
                    { client: 'Josefina Ruiz household', cg: 'Luis Ruiz', issue: 'Driving record flagged', wait: '5d delay', btn: 'Review' },
                  ].map((item, i) => (
                    <div key={i} className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-stone-900">{deIdentify(item.client)}</span>
                        <span className="text-stone-500 block text-xs mt-0.5">{deIdentify(item.cg)} · {item.issue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-semibold text-xs">{item.wait}</span>
                        <button
                          type="button"
                          onClick={() => showToast(`Action triggered for ${item.client}`)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#3E6B2B] border border-stone-300 rounded hover:bg-stone-50"
                        >
                          {item.btn}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Screening Center */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#1c2a17]">Screening Center (Flagged & In Progress)</h3>
                    <Pill c="red">3 flagged</Pill>
                  </div>
                  <button type="button" onClick={() => navigate('screening')} className="text-xs font-semibold text-[#3E6B2B] hover:underline">
                    View all →
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    { name: 'Luis Ruiz', check: 'Driving history: violation found', prov: 'Manual', status: 'Flagged' },
                    { name: 'Marcus Bell', check: 'OIG check: possible name match', prov: 'CBI', status: 'Flagged' },
                    { name: 'Tasha Clarke', check: 'National background check: day 6', prov: 'CBI', status: 'Pending' },
                  ].map((item, i) => (
                    <div key={i} className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-stone-900">{deIdentify(item.name)}</span>
                        <span className="text-stone-600 block text-xs mt-0.5">{item.check}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-stone-500 px-1.5 py-0.5 bg-stone-200 rounded">{item.prov}</span>
                        <Pill c={item.status === 'Flagged' ? 'red' : 'amber'}>{item.status}</Pill>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* COMPLIANCE VIEW */}
      {/* ------------------------------------------------------------- */}
      {roleView === 'Compliance' && (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Compliance & Credentials */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#1c2a17]">Credentials & licenses</h3>
                    <Pill c="red">8 expired</Pill>
                  </div>
                  <button type="button" onClick={() => navigate('compliance')} className="text-xs font-semibold text-[#3E6B2B] hover:underline">
                    View all →
                  </button>
                </div>
                <div className="divide-y divide-stone-100 text-xs">
                  {[
                    { name: 'Rosa Vega', cred: 'CPR / First aid', pill: 'Expired', col: 'red' },
                    { name: 'Luis Ruiz', cred: 'Driving record', pill: 'Expired (2d)', col: 'red' },
                    { name: 'Grace Park', cred: 'TB test', pill: '12d left', col: 'red' },
                    { name: 'Linh Nguyen', cred: 'Background renewal', pill: '34d left', col: 'amber' },
                  ].map((c, i) => (
                    <div key={i} className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-stone-900">{deIdentify(c.name)}</span>
                        <span className="text-stone-500 block text-xs mt-0.5">{c.cred}</span>
                      </div>
                      <Pill c={c.col as PillColor}>{c.pill}</Pill>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Supervisory Visits */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#1c2a17]">Supervisory visits (RN / non-RN)</h3>
                    <Pill c="green">278 / 310 on track</Pill>
                  </div>
                  <button type="button" onClick={() => navigate('compliance')} className="text-xs font-semibold text-[#3E6B2B] hover:underline">
                    View all →
                  </button>
                </div>
                <div className="space-y-3 text-xs">
                  {[
                    ['CNA (RN Quarterly)', '38 / 52 done', 73],
                    ['HMA (RN Quarterly)', '21 / 30 done', 70],
                    ['IHSS (Non-RN Visit)', '120 / 126 done', 95],
                    ['Personal Care (Annual)', '64 / 80 done', 80],
                  ].map(([prog, done, pct], i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1 text-stone-800 font-medium">
                        <span>{prog}</span>
                        <span><b>{done}</b> ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div style={{ width: `${pct}%` }} className="h-full bg-[#3E6B2B] rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Care note quality */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#1c2a17]">Care note quality & audit queue</h3>
                    <Pill c="gold">26 in queue</Pill>
                  </div>
                  <button type="button" onClick={() => navigate('audit')} className="text-xs font-semibold text-[#3E6B2B] hover:underline">
                    View all →
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200 mb-3">
                  <div>
                    <div className="text-2xl font-black text-stone-900">82%</div>
                    <div className="text-xs text-stone-500">First-pass compliant rate (+21% from last mo)</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('audit')}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#3E6B2B] rounded-lg shadow-2xs hover:bg-[#335a23]"
                  >
                    Open audit queue
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {['difficult/refused (8)', 'normal stuff (6)', 'acting up (5)', 'took client shopping (4)'].map((p, i) => (
                    <span key={i} className="px-2 py-0.5 bg-red-50 text-red-900 border border-red-200 rounded text-xs font-medium">
                      “{p}”
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* EVV exceptions */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#1c2a17]">EVV compliance exceptions</h3>
                    <Pill c="amber">14 at risk</Pill>
                  </div>
                  <button type="button" onClick={() => navigate('scheduling')} className="text-xs font-semibold text-[#3E6B2B] hover:underline">
                    View all →
                  </button>
                </div>
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-900 mb-3">
                  ⚠️ 14 visits missing clock-out or GPS data · may block claim generation
                </div>
                <div className="divide-y divide-stone-100 text-xs">
                  {[
                    { type: 'Missed clock-out', who: 'Luis Ruiz · Josefina R.', time: 'Nov 14 5:00 PM', act: 'Request self-correct' },
                    { type: 'Self-correct pending', who: 'Grace Park · Aiden P.', time: 'Nov 15 6:10 PM', act: 'Review' },
                    { type: 'GPS mismatch', who: 'Linh Nguyen · Harper N.', time: 'Nov 15 9:02 AM', act: 'Resolve' },
                  ].map((e, i) => (
                    <div key={i} className="py-2 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-stone-900">{e.type}</span>
                        <span className="text-stone-500 block text-xs">{e.who} · {e.time}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('scheduling')}
                        className="px-2.5 py-1 text-xs font-semibold text-[#3E6B2B] border border-stone-300 rounded hover:bg-stone-50"
                      >
                        {e.act}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* BILLING VIEW */}
      {/* ------------------------------------------------------------- */}
      {roleView === 'Billing' && (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Claims and Medicaid revenue */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#1c2a17]">Claims & Medicaid billing</h3>
                    <Pill c="green">$184k billed</Pill>
                  </div>
                  <button type="button" onClick={() => navigate('billing')} className="text-xs font-semibold text-[#3E6B2B] hover:underline">
                    View all →
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pb-2 mb-3 border-b border-stone-100">
                  <div>
                    <div className="text-xs text-stone-500 font-semibold uppercase">Billed</div>
                    <div className="text-lg font-black text-stone-900 mt-0.5">$184,320</div>
                  </div>
                  <div>
                    <div className="text-xs text-stone-500 font-semibold uppercase">Unbilled</div>
                    <div className="text-lg font-black text-amber-700 mt-0.5">$28,450</div>
                  </div>
                  <div>
                    <div className="text-xs text-stone-500 font-semibold uppercase">Denied</div>
                    <div className="text-lg font-black text-red-700 mt-0.5">$8,900</div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-stone-600 mb-1 font-medium">
                    <span>AR Aging: 0–30d (78%)</span>
                    <span>31–60d (14%)</span>
                    <span className="text-red-700 font-bold">61d+ (8%)</span>
                  </div>
                  <div className="h-2 w-full bg-stone-100 rounded-full flex overflow-hidden">
                    <div style={{ width: '78%' }} className="bg-[#3E6B2B]" />
                    <div style={{ width: '14%' }} className="bg-amber-400" />
                    <div style={{ width: '8%' }} className="bg-red-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Authorizations at risk */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#1c2a17]">Authorizations working without renewal</h3>
                    <Pill c="red">6 overdue</Pill>
                  </div>
                  <button type="button" onClick={() => navigate('emails')} className="text-xs font-semibold text-[#3E6B2B] hover:underline">
                    View all →
                  </button>
                </div>
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-900 mb-3">
                  ⚠️ 6 caregivers delivering care without state approval · $14,200 revenue at risk
                </div>
                <div className="divide-y divide-stone-100 text-xs">
                  {[
                    { client: 'Marisol Vega', cm: 'Dana Whitfield', overdue: '14d overdue' },
                    { client: 'Harper Nguyen', cm: 'Dana Whitfield', overdue: '9d overdue' },
                    { client: 'Desmond Clarke', cm: 'Priya Shah', overdue: '7d overdue' },
                  ].map((item, i) => (
                    <div key={i} className="py-2 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-stone-900">{deIdentify(item.client)}</span>
                        <span className="text-stone-500 ml-1.5">· CM: {item.cm}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-700 font-bold">{item.overdue}</span>
                        <button
                          type="button"
                          onClick={() => showToast(`Follow-up sent to ${item.cm}`)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#3E6B2B] border border-stone-300 rounded hover:bg-stone-50"
                        >
                          Send follow-up
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Medicaid denial letters */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#1c2a17]">Medicaid commercial denial letters</h3>
                    <Pill c="amber">5 required</Pill>
                  </div>
                  <button type="button" onClick={() => navigate('billing')} className="text-xs font-semibold text-[#3E6B2B] hover:underline">
                    View all →
                  </button>
                </div>
                <p className="text-xs text-stone-500 mb-3">
                  Primary commercial denial letters required by Medicaid before billing:
                </p>
                <div className="divide-y divide-stone-100 text-xs">
                  {[
                    { id: 'CLM-7703', client: 'Aiden Park', amt: '$5,120', status: 'Requested Nov 10', col: 'amber' },
                    { id: 'CLM-7705', client: 'Josefina Ruiz', amt: '$3,780', status: 'Not requested', col: 'red' },
                    { id: 'CLM-7699', client: 'Eli Brandt', amt: '$2,210', status: 'Received', col: 'green' },
                  ].map((d, i) => (
                    <div key={i} className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-stone-900">{d.id}</span>
                        <span className="text-stone-500 ml-1.5">· {deIdentify(d.client)} ({d.amt})</span>
                      </div>
                      <Pill c={d.col as PillColor}>{d.status}</Pill>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payroll readiness */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#1c2a17]">Payroll readiness (ADP Export)</h3>
                    <Pill c="green">$246k ready</Pill>
                  </div>
                  <button type="button" onClick={() => navigate('billing')} className="text-xs font-semibold text-[#3E6B2B] hover:underline">
                    View all →
                  </button>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-stone-900">ADP Run (712 employees)</div>
                      <div className="text-stone-500 mt-0.5">Pay period ending Nov 15</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-stone-900 text-sm">$184,300</div>
                      <div className="text-amber-700 font-semibold">4 exceptions</div>
                    </div>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-stone-900">ADP Workforce Now (190 1099s)</div>
                      <div className="text-stone-500 mt-0.5">Pay period ending Nov 15</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-stone-900 text-sm">$61,950</div>
                      <div className="text-amber-700 font-semibold">2 exceptions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SCHEDULER VIEW */}
      {/* ------------------------------------------------------------- */}
      {roleView === 'Scheduler' && (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Unfilled shifts */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#1c2a17]">Unfilled shifts</h3>
                    <Pill c="red">5 urgent ≤48h</Pill>
                  </div>
                  <button type="button" onClick={() => navigate('scheduling')} className="text-xs font-semibold text-[#3E6B2B] hover:underline">
                    View all →
                  </button>
                </div>
                <div className="divide-y divide-stone-100 text-xs">
                  {[
                    { day: 'Tue 17', time: '9a–1p', client: 'Harper N.', prog: 'CNA' },
                    { day: 'Wed 18', time: '12p–4p', client: 'Desmond C.', prog: 'IRSS' },
                    { day: 'Fri 20', time: '3p–7p', client: 'Priya R.', prog: 'HCBS' },
                  ].map((s, i) => (
                    <div key={i} className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-stone-900">{s.day} · {s.time}</span>
                        <span className="text-stone-500 block text-xs mt-0.5">{deIdentify(s.client)} · {s.prog}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => showToast('Suggested 3 available caregivers')}
                        className="px-2.5 py-1 text-xs font-semibold text-[#3E6B2B] border border-stone-300 rounded hover:bg-stone-50"
                      >
                        Find cover
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* EVV exceptions & self-corrections */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#1c2a17]">EVV exceptions & self-corrections</h3>
                    <Pill c="amber">14 at risk</Pill>
                  </div>
                  <button type="button" onClick={() => navigate('scheduling')} className="text-xs font-semibold text-[#3E6B2B] hover:underline">
                    View all →
                  </button>
                </div>
                <div className="divide-y divide-stone-100 text-xs">
                  {[
                    { type: 'Missed clock-out', cg: 'Luis Ruiz', cl: 'Josefina R.', time: 'Nov 14 5:00 PM', act: 'Request self-correct' },
                    { type: 'Self-correct request', cg: 'Grace Park', cl: 'Aiden P.', time: 'Nov 15 6:10 PM', act: 'Approve / Deny' },
                    { type: 'GPS mismatch', cg: 'Linh Nguyen', cl: 'Harper N.', time: 'Nov 15 9:02 AM', act: 'Resolve' },
                  ].map((e, i) => (
                    <div key={i} className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-stone-900">{e.type}</span>
                        <span className="text-stone-500 block text-xs mt-0.5">{deIdentify(e.cg)} · {deIdentify(e.cl)} · {e.time}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('scheduling')}
                        className="px-2.5 py-1 text-xs font-semibold text-[#3E6B2B] border border-stone-300 rounded hover:bg-stone-50"
                      >
                        {e.act}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Wasted hours */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#1c2a17]">Wasted / unverified hours</h3>
                    <Pill c="amber">42.5 hrs</Pill>
                  </div>
                  <button type="button" onClick={() => navigate('scheduling')} className="text-xs font-semibold text-[#3E6B2B] hover:underline">
                    View all →
                  </button>
                </div>
                <div className="flex justify-between items-baseline mb-3">
                  <div className="text-2xl font-black text-stone-900">42.5 hrs</div>
                  <div className="text-xs font-bold text-red-700">~$935.00 est. cost impact</div>
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    ['Missed clock-outs', '16.5 hrs', 39, 'bg-red-500'],
                    ['Late clock-ins', '14.2 hrs', 33, 'bg-amber-500'],
                    ['Early clock-outs', '11.8 hrs', 28, 'bg-blue-500'],
                  ].map(([lbl, hrs, pct, col], i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs text-stone-700 mb-0.5">
                        <span>{lbl}</span>
                        <span className="font-semibold">{hrs}</span>
                      </div>
                      <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div style={{ width: `${pct}%` }} className={`h-full ${col}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overtime & workforce allocation */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#1c2a17]">Overtime & open shifts by region</h3>
                    <Pill c="amber">14 near OT</Pill>
                  </div>
                  <button type="button" onClick={() => navigate('scheduling')} className="text-xs font-semibold text-[#3E6B2B] hover:underline">
                    View all →
                  </button>
                </div>
                <div className="flex justify-between items-baseline mb-3">
                  <div className="text-2xl font-black text-stone-900">14 Caregivers</div>
                  <div className="text-xs font-bold text-amber-700">~$3,420 projected OT</div>
                </div>
                <div className="space-y-1.5 text-xs">
                  {[
                    ['Denver Metro', 'IHSS program', '4 shifts open'],
                    ['Arapahoe / Douglas', 'PDN program', '2 shifts open'],
                    ['Boulder / North', 'CFC program', '2 shifts open'],
                  ].map(([reg, prog, count], i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-stone-100 last:border-none text-stone-800">
                      <span><b>{reg}</b> · {prog}</span>
                      <span className="font-semibold text-amber-800">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 6. ONE TABBED CARD: INSIGHTS & ACTIVITY */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBottomTab('Insights')}
                className={`text-sm font-bold pb-1 transition border-b-2 ${
                  bottomTab === 'Insights'
                    ? 'border-[#3E6B2B] text-[#3E6B2B]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                Insights (4)
              </button>
              <button
                type="button"
                onClick={() => setBottomTab('Activity')}
                className={`text-sm font-bold pb-1 transition border-b-2 ${
                  bottomTab === 'Activity'
                    ? 'border-[#3E6B2B] text-[#3E6B2B]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                Live Activity
              </button>
            </div>

            {bottomTab === 'Activity' && (
              <div className="flex gap-1 text-xs pl-2 border-l border-stone-200">
                {(['All', 'Automated', 'Needs human'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActivityFilter(filter)}
                    className={`px-2 py-0.5 rounded text-xs transition ${
                      activityFilter === filter
                        ? 'bg-[#3E6B2B] text-white font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate(bottomTab === 'Insights' ? 'rules' : 'onboarding')}
            className="text-xs font-semibold text-[#3E6B2B] hover:underline"
          >
            View all →
          </button>
        </div>

        {/* Tab 1: Insights (Max 4 items) */}
        {bottomTab === 'Insights' && (
          <div className="space-y-3">
            {[
              {
                tag: 'Staffing',
                text: '3 caregivers needed in Douglas County by Thursday; 4 intakes pending.',
                act: 'Find cover',
                target: 'scheduling',
              },
              {
                tag: 'Compliance',
                text: '2 CPR certifications expire in 14 days, auto-reminders queued.',
                act: 'View credentials',
                target: 'compliance',
              },
              {
                tag: 'Revenue',
                text: 'Authorization for Marisol Vega pending 14 days, payment at risk.',
                act: 'Nudge CM',
                target: 'emails',
              },
              {
                tag: 'Onboarding',
                text: 'Document packet missing for 5 IHSS households, reminder #2 sent.',
                act: 'View households',
                target: 'onboarding',
              },
            ].map((ins, i) => (
              <div
                key={i}
                className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold uppercase tracking-wider text-stone-500 mr-2">
                    {ins.tag}:
                  </span>
                  <span className="text-stone-900 font-medium">{ins.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(ins.target)}
                  className="px-3 py-1 font-semibold text-[#3E6B2B] bg-white border border-stone-300 rounded-lg hover:bg-stone-50 shadow-2xs self-start sm:self-center shrink-0"
                >
                  {ins.act}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Activity (Max 4 items) */}
        {bottomTab === 'Activity' && (
          <div className="space-y-3 text-xs">
            {[
              {
                text: 'New inquiry converted: Oliver Grant linked to Caregiver record',
                type: 'Automated',
                time: '2m ago',
              },
              {
                text: 'Packet auto-sent: IHSS employee packet (20 docs) to Maria R.',
                type: 'Automated',
                time: '14m ago',
              },
              {
                text: 'EVV correction approved: Luis Ruiz self-correct accepted',
                type: 'Needs human',
                time: '2h ago',
              },
              {
                text: 'Note flagged: Josefina R. care note flagged for wording review',
                type: 'Needs human',
                time: '3h ago',
              },
            ]
              .filter((e) => {
                if (activityFilter === 'All') return true;
                if (activityFilter === 'Automated') return e.type === 'Automated';
                return e.type === 'Needs human';
              })
              .map((ev, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-stone-100 last:border-none">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3E6B2B] shrink-0" />
                    <span className="text-stone-900 font-medium">{ev.text}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        ev.type === 'Automated'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {ev.type === 'Automated' ? '⚡ Automated' : 'Needs human'}
                    </span>
                    <span className="text-stone-400">{ev.time}</span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* 7. SLIM AUTOMATION STRIP (Subtle One-Liner at Bottom) */}
      <div className="py-2.5 px-4 bg-stone-100/90 border border-stone-200/80 rounded-lg text-xs text-stone-600 font-medium flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>⚡</span>
          <span>
            <b>This week:</b> 1,284 tasks automated · 312 reminders sent · ~96 staff hours saved
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('rules')}
          className="text-[#3E6B2B] font-semibold hover:underline"
        >
          View automation rules →
        </button>
      </div>

      {/* AI Briefing Drawer */}
      {isBriefingOpen && (
        <div
          className="fixed inset-0 z-50 animate-fadeIn"
          onKeyDown={(e) => e.key === 'Escape' && setIsBriefingOpen(false)}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsBriefingOpen(false)}
          />
          <aside
            role="dialog"
            aria-label="LiliSare AI Morning Briefing"
            className="absolute right-0 inset-y-0 w-full max-w-md bg-white p-6 overflow-y-auto shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h2 className="font-extrabold text-lg text-stone-900 flex items-center gap-2">
                    <span>✨</span>
                    <span>LiliSare AI Morning Briefing</span>
                  </h2>
                  <div className="text-xs text-stone-500 font-medium">
                    Daily 5-bullet summary for Lisa
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBriefingOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 text-xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Demo Runner relocated inside Briefing */}
              <div className="mt-4 p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-stone-900">Automation Live Demo</div>
                  <div className="text-xs text-stone-500">Run simulated events in activity drawer</div>
                </div>
                <Btn
                  k="gold"
                  onClick={() => {
                    setIsBriefingOpen(false);
                    runDemo();
                  }}
                  className="!py-1 !px-2.5 text-xs"
                >
                  {isDemoRunning ? 'Running…' : '▶ Run demo'}
                </Btn>
              </div>

              <div className="mt-5 space-y-3.5">
                {[
                  {
                    num: '1',
                    title: 'Staffing Shortages in Douglas County',
                    text: '3 caregivers needed by Thursday for high-priority shifts. 4 candidates are in skills validation.',
                    action: 'Review coverage',
                    target: 'scheduling',
                  },
                  {
                    num: '2',
                    title: 'Authorizations Working Without Approval',
                    text: '6 active caregivers delivering care without current CMA renewal. Estimated billing exposure: $14,200.',
                    action: 'View overdue auths',
                    target: 'emails',
                  },
                  {
                    num: '3',
                    title: 'Care Note Quality & Clinical Review',
                    text: 'First-pass note compliance improved to 82%. 26 notes await final caregiver sign-off with AI rewrites ready.',
                    action: 'Open audit queue',
                    target: 'audit',
                  },
                  {
                    num: '4',
                    title: 'EVV Compliance State Target Maintained',
                    text: '96.4% verified rate across 412 visits. 14 visits at risk with 7 self-corrections awaiting staff approval.',
                    action: 'Verify exceptions',
                    target: 'scheduling',
                  },
                  {
                    num: '5',
                    title: 'Autonomous System Efficiency (Week 46)',
                    text: '1,284 administrative tasks executed autonomously, saving ~96 coordinator hours across teams.',
                    action: 'Explore rules',
                    target: 'rules',
                  },
                ].map((item) => (
                  <div key={item.num} className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#3E6B2B] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {item.num}
                      </span>
                      <h4 className="font-bold text-xs text-stone-900">{item.title}</h4>
                    </div>
                    <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">{item.text}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsBriefingOpen(false);
                        navigate(item.target);
                      }}
                      className="mt-2 text-xs font-semibold text-[#3E6B2B] hover:underline flex items-center gap-1"
                    >
                      <span>{item.action}</span>
                      <span>→</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 mt-6">
              <button
                type="button"
                onClick={() => setIsBriefingOpen(false)}
                className="w-full py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition"
              >
                Dismiss briefing
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
