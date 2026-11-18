'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

// =========================================================================
// 1. CAREGIVER MOBILE APP PORTAL PREVIEW
// =========================================================================
export const CaregiverPortal: React.FC = () => {
  const { showToast } = useApp();
  const [isClockedIn, setIsClockedIn] = useState(true);
  const [tasks, setTasks] = useState({
    hygiene: true,
    meds: true,
    meal: false,
    transfers: true,
  });
  const [noteText, setNoteText] = useState('Client ate oatmeal with fruit. Morning medication reminder completed at 9:05 AM. Assisted with shower and safe transfers.');
  const [isRecording, setIsRecording] = useState(false);

  const toggleTask = (key: keyof typeof tasks) => {
    setTasks((prev) => ({ ...prev, [key]: !prev[key] }));
    showToast('Task updated in shift log.');
  };

  const handleVoiceToggle = () => {
    if (!isRecording) {
      setIsRecording(true);
      showToast('Listening... Speak your visit notes.');
      setTimeout(() => {
        setIsRecording(false);
        setNoteText((prev) => prev + ' Client was cheerful and walked in the garden for 15 minutes.');
        showToast('Voice note transcribed and attached.');
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div className="py-6 flex flex-col items-center justify-center">
      <div className="mb-4 text-center max-w-md">
        <h2 className="text-xl font-bold text-stone-900">Caregiver Mobile Experience</h2>
        <p className="text-xs text-stone-500 mt-1">
          Field staff interface running in native mobile viewport mode. Clock in, record EVV GPS coordinates, dictate care notes, and complete academy trainings.
        </p>
      </div>

      {/* Phone Mockup Frame */}
      <div className="w-[380px] bg-stone-900 rounded-[44px] p-4 shadow-2xl border-4 border-stone-800">
        <div className="bg-[#F7F7F4] rounded-[36px] overflow-hidden min-h-[680px] flex flex-col text-stone-900 relative">
          
          {/* Top Speaker & Camera Notch */}
          <div className="bg-stone-900 h-5 w-36 mx-auto rounded-b-xl flex items-center justify-center gap-2 px-2 z-10">
            <div className="w-2.5 h-2.5 rounded-full bg-stone-700" />
            <div className="w-12 h-1 rounded-full bg-stone-800" />
          </div>

          {/* App Header */}
          <div className="bg-[#1B381E] text-white p-4 pt-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#10B981] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  RV
                </div>
                <div>
                  <div className="font-bold text-xs">Rosa Vega</div>
                  <div className="text-[10px] text-emerald-300">Family Caregiver · IHSS</div>
                </div>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
                Online
              </span>
            </div>
          </div>

          {/* Phone Scroll Area */}
          <div className="p-3.5 space-y-3.5 flex-1 overflow-y-auto custom-scrollbar text-xs">
            
            {/* Shift Card */}
            <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-900">Current Visit</span>
                <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                  {isClockedIn ? 'In Progress' : 'Shift Ended'}
                </span>
              </div>

              <div>
                <div className="font-bold text-sm text-stone-900">Marisol Vega</div>
                <div className="text-[11px] text-stone-500">8:00 AM – 11:30 AM · Attendant Care</div>
                <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                  <span>📍 GPS Matched: 452 Elm St, Denver CO</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsClockedIn(!isClockedIn);
                  showToast(isClockedIn ? 'EVV Clock-out verified with GPS.' : 'EVV Clock-in verified.');
                }}
                className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 ${
                  isClockedIn
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-[#3E6B2B] hover:bg-[#335a23] text-white'
                }`}
              >
                <span>{isClockedIn ? '⏱️ Clock Out & Sign' : '▶️ Clock In (EVV)'}</span>
              </button>
            </div>

            {/* Care Tasks Checklist */}
            <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs space-y-2">
              <div className="font-bold text-xs text-stone-900 flex items-center justify-between">
                <span>Care Plan Tasks</span>
                <span className="text-[10px] text-stone-400">3 of 4 done</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="flex items-center gap-2 p-1.5 bg-stone-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tasks.hygiene}
                    onChange={() => toggleTask('hygiene')}
                    className="rounded accent-[#3E6B2B]"
                  />
                  <span className={tasks.hygiene ? 'line-through text-stone-400' : 'text-stone-800'}>
                    Assisted with morning hygiene & dressing
                  </span>
                </label>

                <label className="flex items-center gap-2 p-1.5 bg-stone-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tasks.meds}
                    onChange={() => toggleTask('meds')}
                    className="rounded accent-[#3E6B2B]"
                  />
                  <span className={tasks.meds ? 'line-through text-stone-400' : 'text-stone-800'}>
                    Blood pressure medication reminder (9:00 AM)
                  </span>
                </label>

                <label className="flex items-center gap-2 p-1.5 bg-stone-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tasks.meal}
                    onChange={() => toggleTask('meal')}
                    className="rounded accent-[#3E6B2B]"
                  />
                  <span className={tasks.meal ? 'line-through text-stone-400' : 'text-stone-800'}>
                    Midday meal preparation & hydration
                  </span>
                </label>

                <label className="flex items-center gap-2 p-1.5 bg-stone-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tasks.transfers}
                    onChange={() => toggleTask('transfers')}
                    className="rounded accent-[#3E6B2B]"
                  />
                  <span className={tasks.transfers ? 'line-through text-stone-400' : 'text-stone-800'}>
                    Mobility assistance using rolling walker
                  </span>
                </label>
              </div>
            </div>

            {/* Voice Dictate Care Note */}
            <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-900">Shift Visit Note</span>
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition ${
                    isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  <span>{isRecording ? '🔴 Listening...' : '🎙️ Dictate'}</span>
                </button>
              </div>

              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
              />

              <button
                type="button"
                onClick={() => showToast('Care note submitted for clinical review.')}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-2 rounded-xl text-xs transition"
              >
                Submit note to agency
              </button>
            </div>

            {/* Training Academy Module */}
            <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-900">LiliSare Academy</span>
                <span className="text-[10px] text-emerald-700 font-semibold">100% Up to date</span>
              </div>
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-[11px]">
                <span className="font-semibold text-emerald-900">Annual HIPAA & Elder Safety</span>
                <span className="text-emerald-700 font-bold">Completed ✓</span>
              </div>
            </div>
          </div>

          {/* Phone Bottom Home Bar */}
          <div className="h-4 bg-stone-100 flex items-center justify-center shrink-0">
            <div className="w-28 h-1 bg-stone-400 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 2. FAMILY / RESPONSIBLE PARTY PORTAL
// =========================================================================
export const FamilyPortal: React.FC = () => {
  const { showToast } = useApp();
  const [signed, setSigned] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Header Banner */}
      <div className="bg-[#1B381E] text-white rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-white/15 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-white/15 inline-block mb-2">
            Family & Client Portal
          </span>
          <h1 className="text-2xl font-bold">Marisol Vega’s Care Overview</h1>
          <p className="text-xs text-white/70 mt-1">
            Responsible Party: <strong>Carlos Vega</strong> · Program: IHSS Attendant Care · Provider: LiliSare
          </p>
        </div>

        <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5 text-xs text-center shrink-0">
          <div className="text-emerald-300 font-bold text-sm">Active & Covered</div>
          <div className="text-white/70 text-[11px]">28.0 Authorized Hrs / Week</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Next Scheduled Visits */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-stone-900">Upcoming Visits</h2>
            <span className="text-xs text-emerald-700 font-semibold">Today’s Schedule</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-900">Today · 8:00 AM – 11:30 AM</span>
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">In Progress</span>
              </div>
              <div className="text-xs text-stone-600 mt-1">
                Caregiver: <strong>Rosa Vega</strong> · Attendant Care & Meal Prep
              </div>
              <div className="text-[11px] text-emerald-700 mt-1">
                ✓ Clocked in on time at 8:02 AM
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-900">Tomorrow · 8:00 AM – 11:30 AM</span>
                <span className="text-stone-400 text-[10px]">Confirmed</span>
              </div>
              <div className="text-xs text-stone-600 mt-1">
                Caregiver: <strong>Rosa Vega</strong> · Medication Reminder & Mobility
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-900">Friday, Nov 21 · 10:00 AM</span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">RN Supervisory Visit</span>
              </div>
              <div className="text-xs text-stone-600 mt-1">
                Supervisor: <strong>Dana Whitfield, RN</strong> · 60-day in-home health check
              </div>
            </div>
          </div>
        </div>

        {/* Documents to Sign */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-stone-900">Documents to Review</h2>
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {signed ? '0 Pending' : '1 Action Required'}
              </span>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
              <div className="font-bold text-xs text-stone-900">2026 Annual Medicaid Plan of Care Acknowledgment</div>
              <p className="text-xs text-stone-500">
                Required Colorado Medicaid consent form confirming authorization of 28.0 hours/week for Marisol Vega.
              </p>
              <div className="text-[11px] text-stone-400">Sent by Case Manager Dana Whitfield (RMHS)</div>

              <div className="pt-2">
                {signed ? (
                  <div className="bg-emerald-100 text-emerald-800 font-bold text-xs p-2 rounded-xl text-center">
                    ✓ Signed and submitted electronically on Nov 18, 2026
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSigned(true);
                      showToast('Plan of care signed electronically.');
                    }}
                    className="w-full bg-[#3E6B2B] hover:bg-[#335a23] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition"
                  >
                    Review & Sign Electronically
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Message to Agency */}
          <div className="border-t border-stone-100 pt-4 space-y-2">
            <div className="font-bold text-xs text-stone-900">Send Message to Care Coordinator</div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask a question about hours or visits..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]"
              />
              <button
                type="button"
                onClick={() => {
                  if (message.trim()) {
                    setMessage('');
                    showToast('Message sent to coordinator Maya R.');
                  }
                }}
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 3. CASE MANAGER (STATE CMA) PORTAL
// =========================================================================
export const CaseManagerPortal: React.FC = () => {
  const { showToast } = useApp();

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      {/* Header Banner */}
      <div className="bg-[#1B381E] text-white rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-white/15 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-white/15 inline-block mb-2">
            State CMA Partner Portal
          </span>
          <h1 className="text-2xl font-bold">Rocky Mountain Human Services (RMHS)</h1>
          <p className="text-xs text-white/70 mt-1">
            Case Manager: <strong>Sarah Jenkins</strong> · District: Denver & Adams County
          </p>
        </div>

        <button
          type="button"
          onClick={() => showToast('PAR upload modal opened. Select PDF renewal file.')}
          className="bg-white hover:bg-stone-100 text-[#1B381E] font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition shrink-0"
        >
          + Upload Approved PAR / Service Plan
        </button>
      </div>

      {/* Linked Clients Table */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-stone-900">State Linked Medicaid Clients</h2>
            <p className="text-xs text-stone-500 mt-0.5">Clients currently assigned under your case management caseload at LiliSare.</p>
          </div>
          <span className="text-xs bg-stone-100 text-stone-700 font-semibold px-2.5 py-1 rounded-full">
            3 Active Clients
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-3">Client</th>
                <th className="py-2.5 px-3">Medicaid Program</th>
                <th className="py-2.5 px-3">Authorized Hours</th>
                <th className="py-2.5 px-3">Authorization Status</th>
                <th className="py-2.5 px-3">Next RN Visit</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr className="hover:bg-stone-50/60 transition">
                <td className="py-3 px-3 font-semibold text-stone-900">
                  Marisol Vega
                  <div className="text-[10px] text-stone-400 font-normal">Medicaid •••• 1001</div>
                </td>
                <td className="py-3 px-3">
                  <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">CFC</span>
                </td>
                <td className="py-3 px-3">28.0 hrs/week</td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Active (Expires Oct 2027)
                  </span>
                </td>
                <td className="py-3 px-3 text-stone-600">Friday, Nov 21</td>
                <td className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => showToast('Service plan summary downloaded.')}
                    className="text-[#3E6B2B] hover:underline font-semibold"
                  >
                    View Plan
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-stone-50/60 transition">
                <td className="py-3 px-3 font-semibold text-stone-900">
                  Harper Nguyen
                  <div className="text-[10px] text-stone-400 font-normal">Medicaid •••• 1003</div>
                </td>
                <td className="py-3 px-3">
                  <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">HCBS</span>
                </td>
                <td className="py-3 px-3">32.0 hrs/week</td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Expiring in 14 days
                  </span>
                </td>
                <td className="py-3 px-3 text-stone-600">Dec 12</td>
                <td className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => showToast('Upload renewal PAR form opened.')}
                    className="text-amber-700 hover:underline font-bold"
                  >
                    Upload Renewal
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-stone-50/60 transition">
                <td className="py-3 px-3 font-semibold text-stone-900">
                  Walter Hayes
                  <div className="text-[10px] text-stone-400 font-normal">Medicaid •••• 1007</div>
                </td>
                <td className="py-3 px-3">
                  <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">CFC</span>
                </td>
                <td className="py-3 px-3">20.0 hrs/week</td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Active (Expires Feb 2027)
                  </span>
                </td>
                <td className="py-3 px-3 text-stone-600">Feb 2</td>
                <td className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => showToast('Service plan summary downloaded.')}
                    className="text-[#3E6B2B] hover:underline font-semibold"
                  >
                    View Plan
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 4. FRIENDLY 403 ACCESS DENIED COMPONENT
// =========================================================================
export const AccessDeniedPage: React.FC<{ attemptedPage: string }> = ({ attemptedPage }) => {
  const { currentWorkspace, navigate, showToast } = useApp();

  return (
    <div className="py-16 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-3xl mb-4 shadow-sm">
        🔒
      </div>
      <h2 className="text-2xl font-bold text-stone-900">You don’t have access to this page</h2>
      <p className="text-sm text-stone-600 mt-2 leading-relaxed">
        Your current workspace (<strong>{currentWorkspace.name}</strong>) does not have permission to access the <strong>{attemptedPage}</strong> area. Access is restricted under HIPAA role-based security rules.
      </p>

      <div className="flex items-center gap-3 mt-6">
        <button
          type="button"
          onClick={() => navigate(currentWorkspace.initialPage)}
          className="bg-[#3E6B2B] hover:bg-[#335a23] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition"
        >
          Back to {currentWorkspace.name} Home
        </button>

        <button
          type="button"
          onClick={() => showToast('Access upgrade request submitted to administrator.')}
          className="border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition"
        >
          Request access
        </button>
      </div>
    </div>
  );
};
