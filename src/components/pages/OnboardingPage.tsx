'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Page, Btn, Card, H2, Pill, Bar, Tbl, Sel, Chip } from '../ui';
import {
  HH,
  STEPS,
  CDOC,
  DEF,
  STC,
  mkDocs,
  docsFor,
  CG,
  CL,
} from '@/data/mockData';
import { HouseholdRecord, DocumentItem } from '@/types';

// Workflow generator simulation component
const GENL = [
  'Documents assigned',
  'Checks requested (CBI, OIG, sex offender, driving)',
  'Training assigned in LearnWorlds',
  'Visit tasks created',
  'Case-manager request opened',
];

const Gen: React.FC<{ n: number; svc: string }> = ({ n, svc }) => {
  return (
    <Card className="!border-[#3E6B2B] bg-green-50/30">
      <div className="font-bold mb-2 text-[#1c2a17]">
        {n < 6 ? 'Generating onboarding workflow…' : `Workflow generated for ${svc}`}
      </div>
      <ul className="space-y-1 text-sm" aria-live="polite">
        {GENL.map((l, i) => (
          <li
            key={i}
            className={`flex items-center gap-2 ${i < n - 1 ? 'text-stone-900 font-medium' : 'text-stone-400'}`}
          >
            <span>{i < n - 1 ? '✅' : i === n - 1 ? '⏳' : '•'}</span>
            <span>{l}</span>
            {i < n - 1 && <Chip />}
          </li>
        ))}
      </ul>
    </Card>
  );
};

export const OnboardingPage: React.FC = () => {
  const { selectedId, navigate, showToast, addFeed, deIdentify } = useApp();

  // Onboarding Page Top Tabs: Households (default), Clients, Caregivers
  const [topTab, setTopTab] = useState<'Households' | 'Clients' | 'Caregivers'>('Households');

  // Household Detail States
  const [gen, setGen] = useState(0);
  const [detailTab, setDetailTab] = useState<'Overview' | 'Client' | 'Caregiver(s)' | 'Authorization' | 'Documents' | 'Activity'>('Overview');
  const [svc, setSvc] = useState('IHSS');
  const [emp, setEmp] = useState<'Employee' | '1099' | 'Combined'>('Employee');
  const [gateOverrides, setGateOverrides] = useState<Record<string, boolean>>({});

  const hh = HH.find((x) => x.id === selectedId);

  useEffect(() => {
    if (hh) {
      setSvc(hh.service);
      setEmp((DEF[hh.service] as any) || 'Employee');
    }
  }, [selectedId, hh]);

  useEffect(() => {
    if (gen > 0 && gen < 6) {
      const t = setTimeout(() => setGen((prev) => prev + 1), 700);
      return () => clearTimeout(t);
    }
    if (gen === 6) {
      addFeed(
        'Onboarding workflow generated: packet, checks, training, visit tasks, case-manager request',
        false
      );
    }
  }, [gen, addFeed]);

  // If no household is selected, show the 3 tabs list view
  if (!hh) {
    return (
      <Page
        t="Onboarding"
        s="Households: one client and their linked caregiver(s)"
        a={
          <div className="flex items-center gap-2">
            <Btn onClick={() => showToast('New household enrollment started')}>
              + Start household
            </Btn>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Top Tabs: Households (default), Clients, Caregivers */}
          <div className="flex border-b border-stone-200 gap-1 text-sm font-bold">
            <button
              type="button"
              onClick={() => setTopTab('Households')}
              className={`py-2 px-4 border-b-2 transition flex items-center gap-2 ${
                topTab === 'Households'
                  ? 'border-purple-600 text-purple-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
              <span>Households ({HH.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setTopTab('Clients')}
              className={`py-2 px-4 border-b-2 transition flex items-center gap-2 ${
                topTab === 'Clients'
                  ? 'border-blue-600 text-blue-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
              <span>Clients ({HH.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setTopTab('Caregivers')}
              className={`py-2 px-4 border-b-2 transition flex items-center gap-2 ${
                topTab === 'Caregivers'
                  ? 'border-[#3E6B2B] text-[#3E6B2B]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#3E6B2B] inline-block" />
              <span>Caregivers ({HH.reduce((acc, h) => acc + h.caregivers.length, 0)})</span>
            </button>
          </div>

          {/* TAB 1: HOUSEHOLDS (DEFAULT) */}
          {topTab === 'Households' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                <span>Showing {HH.length} active onboarding households · Both client and caregiver tracks must clear before start</span>
                <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Purple = Household
                </span>
              </div>

              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-700">
                    <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-200">
                      <tr>
                        <th className="py-3 px-4">Household / Family</th>
                        <th className="py-3 px-4">Program</th>
                        <th className="py-3 px-4 min-w-[180px]">Client Track (Blue)</th>
                        <th className="py-3 px-4 min-w-[200px]">Caregiver Track (Green)</th>
                        <th className="py-3 px-4">Case Manager</th>
                        <th className="py-3 px-4">Overall Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {HH.map((r) => {
                        const isReady =
                          r.clientProgress === 100 &&
                          r.caregiverProgress === 100 &&
                          r.authorizationStatus === 'Approved';

                        return (
                          <tr
                            key={r.id}
                            onClick={() => navigate('onboarding', r.id)}
                            className="hover:bg-purple-50/40 cursor-pointer transition"
                          >
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-stone-900 text-sm">
                                {r.familyName || `${deIdentify(r.clientName)} Family`}
                              </div>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-200 inline-block mt-0.5">
                                HOUSEHOLD
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <Pill c="green">{r.service}</Pill>
                            </td>

                            {/* Client track */}
                            <td className="py-3.5 px-4">
                              <div className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-bold text-blue-900">
                                    {deIdentify(r.clientName)}
                                  </span>
                                  <span className="font-semibold text-blue-800">{r.clientProgress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                                  <div
                                    style={{ width: `${r.clientProgress}%` }}
                                    className="h-full bg-blue-600 rounded-full transition-all"
                                  />
                                </div>
                                <span className="text-[10px] text-stone-500 block">
                                  Packet {r.clientPacketStatus || 'Signed'}
                                </span>
                              </div>
                            </td>

                            {/* Caregiver track */}
                            <td className="py-3.5 px-4">
                              <div className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-bold text-[#1c2a17]">
                                    {r.caregivers.map((c) => deIdentify(c)).join(', ')}
                                  </span>
                                  <span className="font-semibold text-[#3E6B2B]">{r.caregiverProgress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                                  <div
                                    style={{ width: `${r.caregiverProgress}%` }}
                                    className="h-full bg-[#3E6B2B] rounded-full transition-all"
                                  />
                                </div>
                                <span className="text-[10px] text-stone-500 block">
                                  {STEPS[r.currentStepIndex]?.split(' (')[0]}
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-stone-600">
                              <div>{r.caseManager || 'Dana Whitfield (RMHS)'}</div>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  r.authorizationStatus === 'Approved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {r.authorizationStatus || 'Approved'}
                              </span>
                            </td>

                            {/* Overall Status Pill */}
                            <td className="py-3.5 px-4">
                              {isReady ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                                  <span>✓</span>
                                  <span>Ready to start services</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                                  <span>⏳</span>
                                  <span>In onboarding</span>
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <span className="text-xs font-bold text-[#3E6B2B] hover:underline">
                                View household →
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

          {/* TAB 2: CLIENTS */}
          {topTab === 'Clients' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                <span>Client intake & documentation tracks · Blue = Client</span>
                <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Blue = Client
                </span>
              </div>

              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-700">
                    <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-200">
                      <tr>
                        <th className="py-3 px-4">Client Name</th>
                        <th className="py-3 px-4">Program</th>
                        <th className="py-3 px-4">Client Packet</th>
                        <th className="py-3 px-4">Signed Docs</th>
                        <th className="py-3 px-4">Authorization</th>
                        <th className="py-3 px-4">Service Plan</th>
                        <th className="py-3 px-4 min-w-[150px]">Client Progress</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {HH.map((r) => (
                        <tr
                          key={r.id}
                          onClick={() => navigate('onboarding', r.id)}
                          className="hover:bg-blue-50/40 cursor-pointer transition"
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-stone-900 text-sm flex items-center gap-2">
                              <span>{deIdentify(r.clientName)}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 border border-blue-200">
                                CLIENT
                              </span>
                            </div>
                            <span className="text-[11px] text-stone-400">
                              {r.familyName || `${deIdentify(r.clientName)} Family`}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <Pill c="green">{r.service}</Pill>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                r.clientPacketStatus === 'Signed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : r.clientPacketStatus === 'Missing'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {r.clientPacketStatus || 'Signed'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-stone-800">
                            {r.clientProgress === 100 ? '5 of 5 signed' : '4 of 5 signed'}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded ${
                                r.authorizationStatus === 'Approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {r.authorizationStatus || 'Approved'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-medium text-stone-700">
                              {r.clientProgress >= 80 ? 'Finalized' : 'In Review'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs font-bold text-blue-900">
                                <span>{r.clientProgress}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${r.clientProgress}%` }}
                                  className="h-full bg-blue-600 rounded-full"
                                />
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                showToast(`Client packet link opened for ${r.clientName}`);
                              }}
                              className="text-xs font-semibold text-blue-700 hover:underline"
                            >
                              Open packet →
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

          {/* TAB 3: CAREGIVERS */}
          {topTab === 'Caregivers' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                <span>Caregiver hiring & onboarding tracks · Green = Caregiver</span>
                <span className="font-semibold text-[#3E6B2B] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Green = Caregiver
                </span>
              </div>

              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-700">
                    <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-200">
                      <tr>
                        <th className="py-3 px-4">Caregiver Name</th>
                        <th className="py-3 px-4">Classification</th>
                        <th className="py-3 px-4">Linked Household</th>
                        <th className="py-3 px-4">Screening (CBI/OIG)</th>
                        <th className="py-3 px-4">Training (LearnWorlds)</th>
                        <th className="py-3 px-4">ADP Setup</th>
                        <th className="py-3 px-4 min-w-[150px]">Caregiver Progress</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {HH.flatMap((r) =>
                        r.caregivers.map((cgName, i) => (
                          <tr
                            key={`${r.id}-${i}`}
                            onClick={() => navigate('onboarding', r.id)}
                            className="hover:bg-emerald-50/40 cursor-pointer transition"
                          >
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-stone-900 text-sm flex items-center gap-2">
                                <span>{deIdentify(cgName)}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-[#3E6B2B] border border-emerald-200">
                                  CAREGIVER
                                </span>
                              </div>
                              <span className="text-[11px] text-stone-400">Family Attendant</span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-stone-800 px-2 py-0.5 bg-stone-100 border border-stone-200 rounded text-xs">
                                {r.caregiverEmploymentType || 'Employee'}
                                <span className="text-stone-400 ml-1 font-normal">
                                  {r.caregiverEmploymentType === '1099' ? '(~15 docs)' : '(~20 docs)'}
                                </span>
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-stone-700">
                              <span className="font-semibold text-purple-900">
                                {r.familyName || `${deIdentify(r.clientName)} Family`}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                  r.caregiverProgress >= 50
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {r.caregiverProgress >= 50 ? 'Cleared' : 'Pending CBI'}
                              </span>
                            </td>

                            <td
                              className="py-3.5 px-4"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('training');
                              }}
                            >
                              <div className="flex items-center gap-1.5 group">
                                <span className="font-semibold text-stone-800 group-hover:text-[#3E6B2B] transition">
                                  {r.caregiverProgress >= 70 ? '100% Complete' : 'In Progress (64%)'}
                                </span>
                                <span className="text-[10px] text-[#3E6B2B] font-bold group-hover:underline">
                                  Record →
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                  r.caregiverProgress >= 85
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-stone-100 text-stone-600'
                                }`}
                              >
                                {r.caregiverProgress >= 85 ? 'Profile Ready' : 'Pending'}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs font-bold text-[#3E6B2B]">
                                  <span>{r.caregiverProgress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                                  <div
                                    style={{ width: `${r.caregiverProgress}%` }}
                                    className="h-full bg-[#3E6B2B] rounded-full"
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showToast(`Caregiver hiring checklist opened for ${cgName}`);
                                }}
                                className="text-xs font-semibold text-[#3E6B2B] hover:underline"
                              >
                                View docs →
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </Page>
    );
  }

  // =========================================================================
  // HOUSEHOLD DETAIL PAGE (Requirement 7)
  // Header: family name, client and caregiver names, program, case manager.
  // Two side-by-side progress cards (Client onboarding and Caregiver onboarding)
  // with activation gate below.
  // Tabs: Overview, Client, Caregiver(s), Authorization, Documents, Activity.
  // =========================================================================

  const isReadyOverall =
    hh.clientProgress === 100 &&
    hh.caregiverProgress === 100 &&
    hh.authorizationStatus === 'Approved';

  const clientDocs = mkDocs(
    [
      ...CDOC,
      ...(svc === 'PDN' ? ['Physician orders'] : svc === 'IHSS' ? ['IHSS assessment'] : []),
    ],
    hh.seed
  );

  const caregiverDocs = docsFor(svc, emp, hh.seed);

  // Activation Gate items
  const k = Math.round(hh.caregiverProgress / 10);
  const GATE = [
    { id: 'id', label: 'ID verified' },
    { id: 'screening', label: 'Screening clear (CBI/OIG)' },
    { id: 'training', label: 'Training complete (LearnWorlds)' },
    { id: 'orientation', label: 'Orientation attended' },
    { id: 'skills', label: 'Skills validated' },
    { id: 'cm_approval', label: 'Case-manager approval' },
    { id: 'adp', label: 'ADP profile ready' },
  ];
  const idx = [1, 2, 3, 4, 6, 7, 8];
  const isGateGreen = GATE.map((item, i) => gateOverrides[item.id] || idx[i] < k);
  const allGateClear = isGateGreen.every(Boolean);

  return (
    <Page
      t={hh.familyName || `${deIdentify(hh.clientName)} Household`}
      s={`${hh.service} Program · Case Manager: ${hh.caseManager || 'Dana Whitfield (RMHS)'}`}
      a={
        <div className="flex items-center gap-2">
          <Btn k="ghost" onClick={() => navigate('onboarding', null)}>
            ← All households
          </Btn>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 1. HOUSEHOLD HEADER CARD */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                  HOUSEHOLD ENROLLMENT
                </span>
                <Pill c="green">{hh.service}</Pill>
                {isReadyOverall ? (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ✓ Ready to start services
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    ⏳ Onboarding in progress
                  </span>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-stone-700">
                <div>
                  <span className="text-stone-400">Client: </span>
                  <span className="font-bold text-stone-900">{deIdentify(hh.clientName)}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 border border-blue-200 ml-1.5">
                    CLIENT
                  </span>
                </div>
                <div>
                  <span className="text-stone-400">Caregiver(s): </span>
                  <span className="font-bold text-stone-900">
                    {hh.caregivers.map((c) => deIdentify(c)).join(', ')}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-[#3E6B2B] border border-emerald-200 ml-1.5">
                    CAREGIVER
                  </span>
                </div>
                <div>
                  <span className="text-stone-400">Case Manager: </span>
                  <span className="font-semibold text-stone-900">{hh.caseManager || 'Dana Whitfield'}</span>
                </div>
                <div>
                  <span className="text-stone-400">State Authorization: </span>
                  <span className="font-semibold text-emerald-800">{hh.authorizationStatus || 'Approved'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setGen(1);
                  showToast('Workflow regenerated for household');
                }}
                className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold hover:bg-stone-100 text-stone-700 transition"
              >
                Regenerate workflow
              </button>
            </div>
          </div>
        </div>

        {/* 2. TWO SIDE-BY-SIDE PROGRESS CARDS: CLIENT TRACK & CAREGIVER TRACK */}
        <div className="grid xl:grid-cols-2 gap-6">
          {/* Card 1: Client Onboarding (Blue) */}
          <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-blue-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <h3 className="font-bold text-sm text-blue-900">Client Onboarding Track</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 border border-blue-200">
                  CLIENT
                </span>
              </div>
              <div className="w-28">
                <div className="flex justify-between text-xs font-bold text-blue-900 mb-0.5">
                  <span>Progress</span>
                  <span>{hh.clientProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div style={{ width: `${hh.clientProgress}%` }} className="h-full bg-blue-600 rounded-full" />
                </div>
              </div>
            </div>

            <ul className="divide-y divide-stone-100 text-xs">
              {[
                { name: 'Client intake packet sent', owner: 'System', status: 'Done', date: 'Nov 02' },
                { name: 'Medicaid ID & consent verified', owner: 'Family', status: 'Done', date: 'Nov 04' },
                { name: 'Eligibility & waiver check', owner: 'System', status: 'Done', date: 'Nov 06' },
                { name: 'Case-manager PAR approval', owner: 'Staff', status: hh.authorizationStatus === 'Approved' ? 'Done' : 'In progress', date: 'Nov 12' },
                { name: 'Service plan finalized', owner: 'Staff', status: hh.clientProgress === 100 ? 'Done' : 'In review', date: 'Nov 15' },
                { name: 'Ready to activate client', owner: 'System', status: hh.clientProgress === 100 ? 'Done' : 'Pending steps', date: 'Nov 18' },
              ].map((step, i) => (
                <li key={i} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-stone-900 block">{step.name}</span>
                    <span className="text-stone-400 text-[11px]">{step.owner} · {step.date}</span>
                  </div>
                  <Pill c={step.status === 'Done' ? 'green' : 'amber'}>{step.status}</Pill>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: Caregiver Onboarding (Green) */}
          <div className="bg-white border border-emerald-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3E6B2B]" />
                <h3 className="font-bold text-sm text-[#1c2a17]">Caregiver Onboarding Track</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-[#3E6B2B] border border-emerald-200">
                  CAREGIVER
                </span>
                <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded">
                  {emp} (~20 docs)
                </span>
              </div>
              <div className="w-28">
                <div className="flex justify-between text-xs font-bold text-[#3E6B2B] mb-0.5">
                  <span>Progress</span>
                  <span>{hh.caregiverProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div style={{ width: `${hh.caregiverProgress}%` }} className="h-full bg-[#3E6B2B] rounded-full" />
                </div>
              </div>
            </div>

            <ul className="divide-y divide-stone-100 text-xs">
              {[
                { name: 'Caregiver application & packet sent', owner: 'System', status: 'Done' },
                { name: 'ID upload & I-9 / W-4 forms', owner: 'Caregiver', status: 'Done' },
                { name: 'Background check (CBI, OIG, Sex Offender)', owner: 'System', status: hh.caregiverProgress >= 50 ? 'Done' : 'In progress' },
                { name: 'LearnWorlds training (LS3000)', owner: 'Caregiver', status: hh.caregiverProgress >= 70 ? 'Done' : 'In progress' },
                { name: 'Skills validation by RN', owner: 'Staff', status: hh.caregiverProgress >= 80 ? 'Done' : 'Scheduled' },
                { name: 'ADP payroll profile ready', owner: 'System', status: hh.caregiverProgress >= 90 ? 'Done' : 'Pending' },
                { name: 'Ready to activate caregiver', owner: 'System', status: hh.caregiverProgress === 100 ? 'Done' : 'Blocked' },
              ].map((step, i) => (
                <li key={i} className="py-2 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-stone-900 block">{step.name}</span>
                    <span className="text-stone-400 text-[11px]">{step.owner}</span>
                  </div>
                  <Pill c={step.status === 'Done' ? 'green' : 'amber'}>{step.status}</Pill>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 3. ACTIVATION GATE (Below Progress Cards) */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex flex-wrap justify-between items-center gap-3 pb-3 mb-3 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <H2 className="mb-0 text-sm">Activation Gate</H2>
                <span className="text-xs text-stone-500 font-medium">
                  Both tracks + authorization required before services start
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const allTrue: Record<string, boolean> = {};
                  GATE.forEach((g) => (allTrue[g.id] = true));
                  setGateOverrides(allTrue);
                  showToast('All activation blockers cleared (demo)');
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 transition"
              >
                Resolve blockers (demo)
              </button>

              <button
                type="button"
                disabled={!allGateClear}
                onClick={() => {
                  showToast(`Household activated for services!`);
                  addFeed(
                    `Household activated: ${hh.clientName} and ${hh.caregivers.join(', ')} ready for shift scheduling`,
                    false
                  );
                }}
                className="px-4 py-1.5 text-xs font-bold bg-[#3E6B2B] text-white disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed rounded-lg shadow-2xs transition"
              >
                Activate Services
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 text-xs">
            {GATE.map((item, i) => {
              const cleared = isGateGreen[i];
              return (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-lg border font-medium flex items-center gap-2 ${
                    cleared
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50/70 border-amber-200 text-amber-900'
                  }`}
                >
                  <span className="text-sm font-bold">{cleared ? '✓' : '⏳'}</span>
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. HOUSEHOLD DETAIL TABS */}
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
          {/* Tabs Header */}
          <div className="flex border-b border-stone-200 overflow-x-auto text-xs font-bold">
            {[
              { id: 'Overview', label: 'Overview' },
              { id: 'Client', label: 'Client (Track)' },
              { id: 'Caregiver(s)', label: `Caregiver(s) (${hh.caregivers.length})` },
              { id: 'Authorization', label: 'Authorization' },
              { id: 'Documents', label: `Documents (${clientDocs.length + caregiverDocs.length})` },
              { id: 'Activity', label: 'Activity' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setDetailTab(t.id as any)}
                className={`py-3 px-4 border-b-2 whitespace-nowrap transition ${
                  detailTab === t.id
                    ? 'border-[#3E6B2B] text-[#3E6B2B]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tabs Body */}
          <div className="p-5 text-xs">
            {/* OVERVIEW TAB */}
            {detailTab === 'Overview' && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                    <span className="font-bold text-stone-900 text-sm block">Household Summary</span>
                    <div className="text-stone-700 space-y-1">
                      <div>Family: <b>{hh.familyName || deIdentify(hh.clientName) + ' Family'}</b></div>
                      <div>Program: <b>{hh.service}</b></div>
                      <div>Assigned Coordinator: <b>Maya R.</b></div>
                      <div>Address: <b>Denver Metro Area, CO</b></div>
                    </div>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                    <span className="font-bold text-stone-900 text-sm block">Enrollment Dual-Track</span>
                    <div className="text-stone-700 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        <span>Client: <b>{deIdentify(hh.clientName)}</b> ({hh.clientProgress}%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#3E6B2B]" />
                        <span>Caregiver(s): <b>{hh.caregivers.map((c) => deIdentify(c)).join(', ')}</b> ({hh.caregiverProgress}%)</span>
                      </div>
                      <div>Caregiver Class: <b>{emp}</b></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CLIENT TAB */}
            {detailTab === 'Client' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">Client Intake Checklist & Documents</h4>
                    <span className="text-stone-500 text-xs">Blue track: {clientDocs.length} required forms</span>
                  </div>
                  <Pill c="green">{clientDocs.filter((d) => d.s === 'Verified').length} Verified</Pill>
                </div>

                <Tbl
                  rows={clientDocs}
                  cols={[
                    ['Document Name', (d) => <span className="font-medium text-stone-900">{d.n}</span>],
                    ['Status', (d) => <Pill c={STC[d.s]}>{d.s}</Pill>],
                    ['Sent', (d) => d.sent],
                    ['Submitted', (d) => d.sub],
                    ['Responsible', (d) => d.who],
                    [
                      '',
                      (d) => (
                        <button
                          type="button"
                          className="text-xs font-semibold text-blue-700 hover:underline"
                          onClick={() => showToast(`Reminder queued for ${d.n}`)}
                        >
                          Remind
                        </button>
                      ),
                    ],
                  ]}
                />
              </div>
            )}

            {/* CAREGIVER TAB */}
            {detailTab === 'Caregiver(s)' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <Sel
                      label="Service"
                      v={svc}
                      set={(v) => {
                        setSvc(v);
                        setEmp((DEF[v] as any) || 'Employee');
                        setGen(1);
                        showToast(`Packet regenerated for ${v}`);
                      }}
                      opts={Object.keys(DEF)}
                    />
                    <Sel
                      label="Employment"
                      v={emp}
                      set={(v) => {
                        setEmp(v as any);
                        showToast(`Packet regenerated: ${v}`);
                      }}
                      opts={['Employee', '1099', 'Combined']}
                    />
                  </div>
                  <Pill c="green">
                    {caregiverDocs.length} caregiver documents ·{' '}
                    {caregiverDocs.filter((d) => d.s === 'Verified').length} verified
                  </Pill>
                </div>

                <Tbl
                  rows={caregiverDocs}
                  cols={[
                    ['Document', (d) => <span className="font-medium text-stone-900">{d.n}</span>],
                    ['Status', (d) => <Pill c={STC[d.s]}>{d.s}</Pill>],
                    ['Sent', (d) => d.sent],
                    ['Submitted', (d) => d.sub],
                    ['Responsible', (d) => d.who],
                    ['Reminder', (d) => d.rem],
                    [
                      '',
                      (d) => (
                        <button
                          type="button"
                          className="text-xs font-semibold text-[#3E6B2B] hover:underline"
                          onClick={() => showToast(`Reminder sent for ${d.n}`)}
                        >
                          Remind
                        </button>
                      ),
                    ],
                  ]}
                />
              </div>
            )}

            {/* AUTHORIZATION TAB */}
            {detailTab === 'Authorization' && (
              <div className="space-y-4">
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                  <span className="font-bold text-stone-900 text-sm block">Case Manager Authorization Details</span>
                  <div className="grid sm:grid-cols-2 gap-3 text-stone-800">
                    <div>
                      <span className="text-stone-400 block">Case Manager:</span>
                      <span className="font-bold">{hh.caseManager || 'Dana Whitfield (RMHS)'}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Authorization Status:</span>
                      <span className="font-bold text-emerald-800">{hh.authorizationStatus || 'Approved'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {detailTab === 'Documents' && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 border border-blue-200 rounded-xl bg-blue-50/30 space-y-2">
                    <span className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      Client Documents ({clientDocs.length})
                    </span>
                    <ul className="space-y-1 text-stone-700">
                      {clientDocs.slice(0, 5).map((d, i) => (
                        <li key={i} className="flex justify-between">
                          <span>{d.n}</span>
                          <span className="font-semibold text-blue-800">{d.s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 border border-emerald-200 rounded-xl bg-emerald-50/30 space-y-2">
                    <span className="font-bold text-[#1c2a17] text-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#3E6B2B]" />
                      Caregiver Documents ({caregiverDocs.length})
                    </span>
                    <ul className="space-y-1 text-stone-700">
                      {caregiverDocs.slice(0, 5).map((d, i) => (
                        <li key={i} className="flex justify-between">
                          <span>{d.n}</span>
                          <span className="font-semibold text-[#3E6B2B]">{d.s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ACTIVITY TAB (Requirement 6 Color Language) */}
            {detailTab === 'Activity' && (
              <div className="space-y-3">
                <h4 className="font-bold text-stone-900 text-sm">Household Timeline & Audit Trail</h4>
                <div className="space-y-2 text-xs">
                  {[
                    { text: 'Client packet signed by Marisol Vega', color: 'text-blue-800 bg-blue-50 border-blue-200', tag: 'CLIENT', time: 'Nov 14, 2:10 PM' },
                    { text: 'Caregiver CBI check cleared for Rosa Vega', color: 'text-[#3E6B2B] bg-emerald-50 border-emerald-200', tag: 'CAREGIVER', time: 'Nov 13, 9:30 AM' },
                    { text: 'Household readiness updated: awaiting case-manager PAR sign-off', color: 'text-purple-800 bg-purple-50 border-purple-200', tag: 'HOUSEHOLD', time: 'Nov 12, 4:00 PM' },
                    { text: 'Caregiver LearnWorlds training module LS3000 completed (100%)', color: 'text-[#3E6B2B] bg-emerald-50 border-emerald-200', tag: 'CAREGIVER', time: 'Nov 10, 11:15 AM' },
                    { text: 'Client intake converted from inquiry pipeline', color: 'text-blue-800 bg-blue-50 border-blue-200', tag: 'CLIENT', time: 'Nov 02, 10:00 AM' },
                  ].map((item, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border flex items-center justify-between ${item.color}`}>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[10px] px-1.5 py-0.2 rounded border bg-white/70">
                          {item.tag}
                        </span>
                        <span className="font-semibold">{item.text}</span>
                      </div>
                      <span className="text-[11px] text-stone-500 shrink-0">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
};
