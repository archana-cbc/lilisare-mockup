'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Page, Btn, Card, Pill } from '../ui';
import { SYS } from '@/data/mockData';

export const SystemsPage: React.FC = () => {
  const { showToast, navigate } = useApp();
  const [isSimulatingSync, setIsSimulatingSync] = useState(false);
  const [lastSync, setLastSync] = useState('2 minutes ago');

  const handleSimulateSync = () => {
    setIsSimulatingSync(true);
    setTimeout(() => {
      setIsSimulatingSync(false);
      setLastSync('Just now');
      showToast('LearnWorlds API sync simulated: 44 courses, 12 quizzes, and 6 certifications checked.');
    }, 1000);
  };

  return (
    <Page t="Connected Systems" s="Enterprise integrations and LMS connectors for LiliSare">
      <div className="space-y-6">
        
        {/* ========================================================================= */}
        {/* FEATURED: LEARNWORLDS CONNECTION PANEL (PLANNED R2) */}
        {/* ========================================================================= */}
        <div className="bg-white border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-extrabold text-xl shadow-xs border border-sky-200">
                LW
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-stone-900">LearnWorlds LMS Connection</h3>
                  <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-sky-200">
                    Planned (Release 2)
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Automated course enrollment, video watch time tracking, and gradebook synchronization for caregiver onboarding.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleSimulateSync}
                disabled={isSimulatingSync}
                className="bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 font-semibold px-3 py-1.5 rounded-xl text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span className={isSimulatingSync ? 'animate-spin' : ''}>🔄</span>
                <span>{isSimulatingSync ? 'Testing sync…' : 'Simulate sync'}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('training')}
                className="bg-[#3E6B2B] hover:bg-[#335a23] text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition"
              >
                Open Training Module →
              </button>
            </div>
          </div>

          {/* Sync Metadata & Field Mapping Table */}
          <div className="mt-5 grid lg:grid-cols-12 gap-6 text-xs">
            
            {/* Left 4 Cols: Configuration Details */}
            <div className="lg:col-span-4 space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
              <div className="flex justify-between">
                <span className="text-stone-500">Sync Direction:</span>
                <span className="font-semibold text-stone-800 text-right">Bi-directional</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Outbound:</span>
                <span className="font-semibold text-stone-800 text-right">Course assignments</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Inbound:</span>
                <span className="font-semibold text-stone-800 text-right">Completion & quiz scores</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Identity Matching:</span>
                <span className="font-semibold text-stone-800 text-right">Caregiver email (OAuth2)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Last Demo Sync:</span>
                <span className="font-bold text-emerald-700 text-right">{lastSync}</span>
              </div>

              {/* Note callout */}
              <div className="mt-4 pt-3 border-t border-stone-200 text-[11px] text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60">
                ℹ️ <strong>Release 1 Note:</strong> Until connected, course and skills completion can be recorded manually with an audit reason in the Training module.
              </div>
            </div>

            {/* Right 8 Cols: Field Mapping Table */}
            <div className="lg:col-span-8 overflow-x-auto">
              <div className="font-bold text-stone-800 mb-2">LearnWorlds API Field Mappings</div>
              <table className="w-full text-left text-[11px] text-stone-700 border border-stone-200 rounded-xl overflow-hidden">
                <thead className="bg-stone-100 text-stone-600 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-2 px-3">LiliSare Source Field</th>
                    <th className="py-2 px-3">Direction</th>
                    <th className="py-2 px-3">LearnWorlds Target Attribute</th>
                    <th className="py-2 px-3">Transformation Rule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-stone-900">Caregiver Full Name</td>
                    <td className="py-2 px-3 text-stone-500">→</td>
                    <td className="py-2 px-3 font-mono text-stone-700">user.full_name</td>
                    <td className="py-2 px-3 text-stone-500">Direct match</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-stone-900">Caregiver Email</td>
                    <td className="py-2 px-3 text-stone-500">↔</td>
                    <td className="py-2 px-3 font-mono text-stone-700">user.email</td>
                    <td className="py-2 px-3 text-stone-500">Primary unique key (SSO)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-stone-900">Service Classification (IHSS/CNA)</td>
                    <td className="py-2 px-3 text-stone-500">→</td>
                    <td className="py-2 px-3 font-mono text-stone-700">user.tags[]</td>
                    <td className="py-2 px-3 text-stone-500">Triggers auto-enrollment bundle</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-stone-900">Assigned Path ID (e.g. LS3000)</td>
                    <td className="py-2 px-3 text-stone-500">→</td>
                    <td className="py-2 px-3 font-mono text-stone-700">enrollment.course_id</td>
                    <td className="py-2 px-3 text-stone-500">Enrolls user in curriculum</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-stone-900">LMS Grade & Passed Date</td>
                    <td className="py-2 px-3 text-stone-500">←</td>
                    <td className="py-2 px-3 font-mono text-stone-700">quiz.score, course.completed_at</td>
                    <td className="py-2 px-3 text-stone-500">Updates Caregiver Activation Gate</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* OTHER CONNECTED SYSTEMS */}
        <div>
          <h3 className="font-bold text-base text-stone-900 mb-3">Other Planned Integrations</h3>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {SYS.map((s, idx) => (
              <Card key={idx} className="flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-bold text-stone-900 text-base">{s.name}</div>
                    <Pill>Not connected</Pill>
                  </div>
                  <p className="text-sm text-stone-600 mt-2 min-h-[44px] leading-snug">
                    {s.description}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-stone-100">
                  <span className="text-xs font-semibold bg-[#F2B632]/30 text-stone-900 rounded px-2 py-1">
                    Planned release: {s.release}
                  </span>
                  <Btn k="ghost" onClick={() => showToast(`${s.name} is not available in this prototype`)}>
                    Connect
                  </Btn>
                </div>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </Page>
  );
};
