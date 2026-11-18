'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { CL, CG, STAFF } from '@/data/mockData';

// Types
interface FlagItem {
  phrase: string;
  ruleName: string;
  plainWhy: string;
  plainFix: string;
  isUrgentSafety?: boolean;
}

interface QuestionItem {
  id: string;
  question: string;
  answer?: string;
  isAnswered: boolean;

  voiceRecorded?: boolean;
}

interface AttachmentItem {
  id: string;
  name: string;
  type: 'Wound/skin photo' | 'Incident' | 'Signed form' | 'Doctor\'s order' | 'Audio recording' | 'Other';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
}

interface NoteRecord {
  id: string;
  clientId: string;
  clientName: string;
  clientAge: number;
  clientDob: string;
  caregiverName: string;
  program: 'IHSS' | 'CFC' | 'HCBS' | 'IRSS' | 'HMA';
  visitDate: string;
  visitTime: string;
  evvStatus: 'Verified' | 'Exception';
  evvDetails: string;
  tasks: string[];
  status: 'Needs fix' | 'Waiting on caregiver' | 'Urgent' | 'Approved';
  isUrgentSafety: boolean;
  originalText: string;
  flags: FlagItem[];
  suggestedText: string;
  placeholders: string[];
  questions: QuestionItem[];
  attachments: AttachmentItem[];
  assignedReviewer: string;
  inCaseload: boolean;
  clientContext: {
    authorizedHours: string;
    carePlanGoals: string[];
    lastThreeNotes: string[];
  };
  timeline: Array<{
    title: string;
    actor: string;
    time: string;
    note?: string;
  }>;
}

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  appliesTo: string[];
  severity: 'High' | 'Medium' | 'Low';
  exampleBad: string;
  exampleGood: string;
  isActive: boolean;
  source: string;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

// Initial Mock Notes (Consistent with CL and CG)
const INITIAL_NOTES: NoteRecord[] = [
  {
    id: 'NOTE-101',
    clientId: 'C-1001',
    clientName: 'Marisol Vega',
    clientAge: 67,
    clientDob: 'Oct 14, 1959',
    caregiverName: 'Rosa Vega',
    program: 'IHSS',
    visitDate: 'Nov 17, 2026',
    visitTime: '8:00 AM – 11:30 AM',
    evvStatus: 'Verified',
    evvDetails: 'Clock-in 8:02 AM · GPS Match (452 Elm St) · Verified',
    tasks: ['Meal Preparation', 'Morning Hygiene', 'Medication Reminder'],
    status: 'Urgent',
    isUrgentSafety: true,
    originalText:
      'Client was difficult and refused to eat breakfast. I made her eat anyway because she needs food before taking her morning blood pressure medication.',
    flags: [
      {
        phrase: 'difficult',
        ruleName: 'Objective language rule',
        plainWhy: 'Words like "difficult" describe an emotional reaction rather than what actually happened.',
        plainFix: 'Describe what the client did: "Client declined breakfast at 8:40 AM."',
      },
      {
        phrase: 'refused to eat',
        ruleName: 'Documenting client choices',
        plainWhy: 'State rules require writing down what food was offered and what alternatives you tried.',
        plainFix: 'Name the specific meal offered and how you followed up.',
      },
      {
        phrase: 'made her eat anyway',
        ruleName: 'Safety escalation: possible physical force',
        plainWhy: 'This sounds like physical force or insistence without client consent. State rules require immediate supervisor review.',
        plainFix: 'Do not reword this. A clinical supervisor and RN must review the visit.',
        isUrgentSafety: true,
      },
    ],
    suggestedText:
      'Client declined oatmeal at 8:40 AM. Caregiver offered [add what alternative was offered] after 15 minutes; client [add client response]. Blood pressure medication was [add medication administration status] per care plan.',
    placeholders: ['[add what alternative was offered]', '[add client response]', '[add medication administration status]'],
    questions: [
      {
        id: 'q1',
        question: 'What specific food or drink was offered when Marisol declined breakfast?',
        isAnswered: false,
      },
      {
        id: 'q2',
        question: 'How long did you wait before re-offering, and did you use any physical prompting?',
        isAnswered: false,
      },
      {
        id: 'q3',
        question: 'Was the supervising nurse or family notified about medication timing without food?',
        isAnswered: false,
      },
    ],
    attachments: [
      {
        id: 'att-1',
        name: 'Morning_Care_Audio_Recording.m4a',
        type: 'Audio recording',
        size: '1.2 MB',
        uploadedBy: 'Rosa Vega (Caregiver)',
        uploadedAt: 'Nov 17 · 11:34 AM',
      },
    ],
    assignedReviewer: 'Maya R.',
    inCaseload: true,
    clientContext: {
      authorizedHours: '28.0 hrs/week · IHSS Attendant Care',
      carePlanGoals: [
        'Maintain independent nutrition with verbal encouragement',
        'Morning hypertension medication reminder at 9:00 AM',
        'Safe transfers using rolling walker',
      ],
      lastThreeNotes: [
        'Nov 16: Marisol ate full breakfast of yogurt and fruit. BP pills taken at 9:05 AM with water.',
        'Nov 15: Assisted with morning shower and dressing. Client cheerful and engaged.',
        'Nov 14: Client declined eggs, accepted toast and tea. Meds taken with supervision.',
      ],
    },
    timeline: [
      { title: 'Note dictated and submitted via app', actor: 'Rosa Vega', time: 'Nov 17 · 11:35 AM' },
      { title: 'Flagged for supervisor safety check', actor: 'System Rule LS-02', time: 'Nov 17 · 11:36 AM', note: 'Safety keywords detected' },
    ],
  },
  {
    id: 'NOTE-102',
    clientId: 'C-1006',
    clientName: 'Josefina Ruiz',
    clientAge: 72,
    clientDob: 'Jan 22, 1954',
    caregiverName: 'Luis Ruiz',
    program: 'HMA',
    visitDate: 'Nov 17, 2026',
    visitTime: '10:00 AM – 1:00 PM',
    evvStatus: 'Verified',
    evvDetails: 'Clock-in 10:01 AM · Clock-out 1:02 PM · GPS Match · Verified',
    tasks: ['Delegated G-Tube Care', 'Medication Administration', 'Bathing'],
    status: 'Needs fix',
    isUrgentSafety: false,
    originalText: 'Gave meds and did normal stuff all shift. Josefina was fine and had no problems.',
    flags: [
      {
        phrase: 'Gave meds',
        ruleName: 'Specific times for medications',
        plainWhy: 'State rules require the exact time and route (mouth or G-tube) for every medication.',
        plainFix: 'Write: "Administered midday meds via G-tube at 11:15 AM."',
      },
      {
        phrase: 'normal stuff all shift',
        ruleName: 'Clear task descriptions',
        plainWhy: '"Normal stuff" does not prove to state auditors what care tasks were actually completed.',
        plainFix: 'List the specific tasks completed: bathing, stoma inspection, water flush.',
      },
    ],
    suggestedText:
      'Administered delegated midday medications via G-tube at [add exact time]. Flushed tube with 30ml water before and after per HMA protocol. Inspected insertion site; skin intact with no redness. Assisted with bed bath.',
    placeholders: ['[add exact time]'],
    questions: [
      {
        id: 'q1',
        question: 'At what exact time were the midday medications given through the G-tube?',
        isAnswered: false,
      },
      {
        id: 'q2',
        question: 'Did you flush the tube with 30ml water before and after as outlined in the care plan?',
        isAnswered: false,
      },
    ],
    attachments: [],
    assignedReviewer: 'Maya R.',
    inCaseload: true,
    clientContext: {
      authorizedHours: '21.0 hrs/week · HMA Skilled Nursing Delegation',
      carePlanGoals: [
        'Gastrostomy tube flushes and scheduled medication delivery',
        'Daily skin inspection of G-tube insertion site',
        'Bed bath and pressure-relief repositioning',
      ],
      lastThreeNotes: [
        'Nov 16: Administered midday meds at 11:30 AM via G-tube. Flushed with 30ml water. Dressing dry.',
        'Nov 15: Morning feed administered. Stoma clean, no discharge. Repositioned to left lateral.',
        'Nov 14: Meds given at 11:15 AM. Client tolerated bath and hair washing well.',
      ],
    },
    timeline: [
      { title: 'Note submitted', actor: 'Luis Ruiz', time: 'Nov 17 · 1:05 PM' },
      { title: 'Automatic check flagged 2 phrases', actor: 'System', time: 'Nov 17 · 1:06 PM' },
    ],
  },
  {
    id: 'NOTE-103',
    clientId: 'C-1005',
    clientName: 'Aiden Park',
    clientAge: 16,
    clientDob: 'May 04, 2010',
    caregiverName: 'Grace Park',
    program: 'HCBS',
    visitDate: 'Nov 16, 2026',
    visitTime: '2:00 PM – 5:00 PM',
    evvStatus: 'Verified',
    evvDetails: 'Clock-in 2:00 PM · Verified',
    tasks: ['Community Mentorship', 'Coping Strategies'],
    status: 'Waiting on caregiver',
    isUrgentSafety: false,
    originalText: 'Aiden is acting up again today, had to calm him down for an hour before doing homework.',
    flags: [
      {
        phrase: 'acting up',
        ruleName: 'Objective language rule',
        plainWhy: '"Acting up" sounds judgmental. Describe the specific behavior you saw (pacing, shouting, crying).',
        plainFix: 'Write: "Aiden was pacing and speaking loudly."',
      },
    ],
    suggestedText:
      'Aiden showed vocal agitation and pacing beginning at [add time]. Caregiver used sensory calming protocol and [add calming activity] for 45 minutes until Aiden returned to baseline. Completed 30 minutes of math homework.',
    placeholders: ['[add time]', '[add calming activity]'],
    questions: [
      {
        id: 'q1',
        question: 'What specific behaviors was Aiden showing (e.g. pacing, shouting, repetitive questions)?',
        isAnswered: true,
        answer: 'He was pacing in the living room and repeating that he was anxious about his test.',
        voiceRecorded: true,
      },
    ],
    attachments: [],
    assignedReviewer: 'Jon P.',
    inCaseload: false, // outside Maya's caseload
    clientContext: {
      authorizedHours: '15.0 hrs/week · HCBS Youth Mentorship',
      carePlanGoals: [
        'Practice self-regulation strategies when frustrated',
        'Complete academic homework routine with minimal resistance',
      ],
      lastThreeNotes: [
        'Nov 15: Practiced deep breathing exercises when frustrated with science. Completed 45 min study.',
        'Nov 14: Community outing to library. Checked out books independently.',
        'Nov 13: Calm shift, guided after-school snack and homework schedule.',
      ],
    },
    timeline: [
      { title: 'Note submitted', actor: 'Grace Park', time: 'Nov 16 · 5:08 PM' },
      { title: 'Question sent to caregiver', actor: 'Jon P.', time: 'Nov 16 · 5:30 PM' },
      { title: 'Caregiver voice answer received', actor: 'Grace Park', time: 'Nov 16 · 6:15 PM' },
    ],
  },
  {
    id: 'NOTE-104',
    clientId: 'C-1002',
    clientName: 'Eli Brandt',
    clientAge: 19,
    clientDob: 'Aug 11, 2007',
    caregiverName: 'Karen Brandt',
    program: 'IHSS',
    visitDate: 'Nov 15, 2026',
    visitTime: '1:00 PM – 4:00 PM',
    evvStatus: 'Exception',
    evvDetails: 'Clock-out was 42 min after scheduled shift (requires reason code)',
    tasks: ['Community Integration', 'Life Skills'],
    status: 'Approved',
    isUrgentSafety: false,
    originalText:
      'Assisted Eli with community skills outing to King Soopers per care plan goal: budgeting and grocery item selection. Eli selected 4 items independently with verbal prompts. Shift ran late due to transportation delay.',
    flags: [],
    suggestedText:
      'Assisted Eli with community skills outing to King Soopers per care plan goal: budgeting and grocery item selection. Eli selected 4 items independently with verbal prompts. Shift ran late due to transportation delay.',
    placeholders: [],
    questions: [],
    attachments: [
      {
        id: 'att-2',
        name: 'Community_Goal_Tracking_Form.pdf',
        type: 'Signed form',
        size: '240 KB',
        uploadedBy: 'Karen Brandt',
        uploadedAt: 'Nov 15 · 4:50 PM',
      },
    ],
    assignedReviewer: 'Maya R.',
    inCaseload: true,
    clientContext: {
      authorizedHours: '32.0 hrs/week · IHSS Child Care & Attendant',
      carePlanGoals: ['Community safety awareness', 'Money handling and shopping skills', 'Hygiene reminders'],
      lastThreeNotes: [
        'Nov 14: Assisted Eli with handwashing and snack prep. Worked on vocabulary flashcards.',
        'Nov 13: Community integration at local recreation center. Practiced waiting in turn.',
        'Nov 12: Supervised safety during afternoon park outing. Positive mood throughout.',
      ],
    },
    timeline: [
      { title: 'Note submitted', actor: 'Karen Brandt', time: 'Nov 15 · 4:45 PM' },
      { title: 'Reviewed & Approved', actor: 'Maya R.', time: 'Nov 15 · 5:10 PM' },
    ],
  },
];

// Initial Rules
const INITIAL_RULES: ComplianceRule[] = [
  {
    id: 'R-01',
    name: 'Objective facts only (no emotional or judgmental words)',
    description: 'Requires factual, observable descriptions rather than characterizations (e.g. difficult, stubborn, crazy).',
    appliesTo: ['IHSS', 'CFC', 'HCBS', 'IRSS', 'HMA'],
    severity: 'High',
    exampleBad: 'Client was difficult and aggressive.',
    exampleGood: 'Client raised voice and paced hallway for 15 minutes before accepting redirection.',
    isActive: true,
    source: 'Colorado 10 CCR 2505-10 § 8.510',
    lastUpdatedBy: 'Dana W. (Admin)',
    lastUpdatedAt: 'Nov 10, 2026',
  },
  {
    id: 'R-02',
    name: 'Safety escalation: physical force or non-consensual care',
    description: 'Mandatory flagging of any phrasing indicating physical force, restriction, or non-consensual care.',
    appliesTo: ['All Programs'],
    severity: 'High',
    exampleBad: 'I made her take her bath anyway.',
    exampleGood: 'Client declined bath at 9:00 AM. Caregiver re-offered at 10:30 AM; client accepted.',
    isActive: true,
    source: 'State Medicaid Critical Incident Rule § 8.500',
    lastUpdatedBy: 'Clinical Director',
    lastUpdatedAt: 'Oct 28, 2026',
  },
  {
    id: 'R-03',
    name: 'Exact times for medications and nursing tasks',
    description: 'Vague times (all day, all shift) are non-compliant for billable delegated nursing tasks.',
    appliesTo: ['HMA', 'CNA'],
    severity: 'Medium',
    exampleBad: 'Gave meds during the morning.',
    exampleGood: 'Administered 500mg Metformin orally with water at 8:30 AM per MAR.',
    isActive: true,
    source: 'Colorado Board of Nursing Chapter 13',
    lastUpdatedBy: 'Tom O. (RN)',
    lastUpdatedAt: 'Nov 02, 2026',
  },
  {
    id: 'R-04',
    name: 'Connect community outings to service plan goals',
    description: 'Community integration activities must reference specific authorized goals in the individual service plan.',
    appliesTo: ['IHSS', 'HCBS', 'IRSS'],
    severity: 'Medium',
    exampleBad: 'Went to the mall for fun.',
    exampleGood: 'Accompanied client to local store to practice money counting and cashier interaction goal.',
    isActive: true,
    source: 'Department of Health Care Policy & Financing (HCPF)',
    lastUpdatedBy: 'Compliance Lead',
    lastUpdatedAt: 'Nov 12, 2026',
  },
];

export const AuditPage: React.FC = () => {
  const { showToast, addFeed, deIdentify, navigate } = useApp();

  // 1. Four Top Tabs
  const [activeTab, setActiveTab] = useState<'review' | 'new-note' | 'quality' | 'rules'>('review');

  // Help Guide Modal state
  const [showHelpGuide, setShowHelpGuide] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<NoteRecord[]>(INITIAL_NOTES);
  const [selectedNoteId, setSelectedNoteId] = useState<string>('NOTE-101');

  // Review Queue Filters
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterProgram, setFilterProgram] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // HIPAA Masking toggle
  const [revealId, setRevealId] = useState(false);
  const [revealDob, setRevealDob] = useState(false);
  const [showSessionTimeoutModal, setShowSessionTimeoutModal] = useState(false);

  // Open Note interaction state
  const [activeFlagPopover, setActiveFlagPopover] = useState<FlagItem | null>(null);
  const [showQuestions, setShowQuestions] = useState(true);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [isEditingManually, setIsEditingManually] = useState(false);
  const [editableText, setEditableText] = useState('');
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [detailsTab, setDetailsTab] = useState<'summary' | 'rules' | 'client' | 'history'>('summary');
  const [showIncidentModal, setShowIncidentModal] = useState(false);

  // New Note Wizard State
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [wizardClientId, setWizardClientId] = useState('C-1001');
  const [wizardVisitDate, setWizardVisitDate] = useState('Today, Nov 17 · 8:00 AM - 11:30 AM (EVV Verified)');
  const [inputMode, setInputMode] = useState<'speak' | 'upload' | 'type'>('speak');
  const [roughText, setRoughText] = useState('');
  const [formattedText, setFormattedText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordingLanguage, setRecordingLanguage] = useState<'English' | 'Spanish'>('English');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isPhonePreviewOpen, setIsPhonePreviewOpen] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string>('just now');
  const [newNoteAttachments, setNewNoteAttachments] = useState<AttachmentItem[]>([]);
  const [showAttachmentUploadModal, setShowAttachmentUploadModal] = useState(false);

  // Assistant Chat State (Merged LiliSare Assistant)
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<
    Array<{
      sender: 'user' | 'assistant';
      text: string;
      source?: string;
      actionButton?: { label: string; actionId: string };
    }>
  >([
    {
      sender: 'assistant',
      text: 'Hello Maya! I can help you review this care note for Marisol V. Ask me a question or tap one of the shortcuts below.',
    },
  ]);
  const [assistantInput, setAssistantInput] = useState('');
  const [pendingConfirmAction, setPendingConfirmAction] = useState<{
    label: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  // Rules Tab state
  const [rules, setRules] = useState<ComplianceRule[]>(INITIAL_RULES);
  const [showProgramSettings, setShowProgramSettings] = useState(false);
  const [programRequirements, setProgramRequirements] = useState<Record<string, boolean>>({
    IHSS: true,
    CFC: true,
    HCBS: true,
    IRSS: true,
    HMA: true,
  });
  const [deleteAudioAfterApproval, setDeleteAudioAfterApproval] = useState(false);

  // Currently Selected Note
  const currentNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  useEffect(() => {
    if (currentNote) {
      setEditableText(currentNote.suggestedText);
      setIsEditingManually(false);
      setActiveFlagPopover(null);
    }
  }, [selectedNoteId]);

  // Audio Recording Simulation Timer
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (isRecording) {
      t = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(t);
  }, [isRecording]);

  // Canvas waveform ref
  const waveformRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!isRecording || !waveformRef.current) return;
    const canvas = waveformRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#3E6B2B';
      const count = 30;
      const w = canvas.width / count;
      for (let i = 0; i < count; i++) {
        const h = Math.random() * (canvas.height - 8) + 4;
        const x = i * w;
        const y = (canvas.height - h) / 2;
        ctx.fillRect(x + 1, y, w - 2, h);
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [isRecording]);

  // Filter Queue
  const filteredQueue = notes.filter((n) => {
    if (filterStatus !== 'All' && n.status !== filterStatus) return false;
    if (filterProgram !== 'All' && n.program !== filterProgram) return false;
    if (filterPriority === 'Urgent first' && !n.isUrgentSafety) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCg = n.caregiverName.toLowerCase().includes(q);
      const matchCl = n.clientName.toLowerCase().includes(q);
      const matchTxt = n.originalText.toLowerCase().includes(q);
      if (!matchCg && !matchCl && !matchTxt) return false;
    }
    return true;
  });

  // Sort: Urgent notes always top
  const sortedQueue = [...filteredQueue].sort((a, b) => {
    if (a.isUrgentSafety && !b.isUrgentSafety) return -1;
    if (!a.isUrgentSafety && b.isUrgentSafety) return 1;
    return a.id.localeCompare(b.id);
  });

  // Note Action Handlers
  const handleApproveNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
            ...n,
            status: 'Approved',
            timeline: [
              ...n.timeline,
              { title: 'Approved by reviewer', actor: 'Maya R.', time: 'Just now' },
            ],
          }
          : n
      )
    );
    showToast(`Note for ${deIdentify(currentNote.clientName)} approved`);
    addFeed(`Care note approved for ${currentNote.clientId}`, true);
  };

  const handleSendToCaregiver = (id: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
            ...n,
            status: 'Waiting on caregiver',
            timeline: [
              ...n.timeline,
              { title: 'Questions sent to caregiver', actor: 'Maya R.', time: 'Just now' },
            ],
          }
          : n
      )
    );
    showToast(`Questions sent to ${deIdentify(currentNote.caregiverName)}`);
    addFeed(`Clarification questions sent for visit ${currentNote.visitDate}`, false);
  };

  const handleEscalateNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
            ...n,
            status: 'Urgent',
            isUrgentSafety: true,
            timeline: [
              ...n.timeline,
              { title: 'Escalated to clinical supervisor', actor: 'Maya R.', time: 'Just now' },
            ],
          }
          : n
      )
    );
    setShowIncidentModal(true);
    showToast(`Note escalated to RN supervisor`);
  };

  // Assistant Question/Command Runner
  const sendAssistantMessage = (userPrompt: string) => {
    const newMsgList = [...assistantMessages, { sender: 'user' as const, text: userPrompt }];
    setAssistantMessages(newMsgList);
    setAssistantInput('');

    setTimeout(() => {
      if (userPrompt.toLowerCase().includes('why') || userPrompt.toLowerCase().includes('flagged')) {
        setAssistantMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: `Under Colorado rule 10 CCR 2505-10 § 8.510, notes cannot include subjective words like "difficult". State auditors reject notes that express caregiver frustration rather than observable care. Also, "made her eat" suggests non-consensual care and must be investigated.`,
            source: 'Rule R-01 & R-02 (Colorado Medicaid)',
            actionButton: { label: 'Open incident report', actionId: 'incident' },
          },
        ]);
      } else if (userPrompt.toLowerCase().includes('summarize')) {
        setAssistantMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: `Marisol V. completed 5 visits (20.5 hours) this week, 100% EVV verified. She declined breakfast twice, which resolved when offered yogurt. All morning BP medications were observed. No falls or pain reported.`,
            source: 'Visits Nov 12 - Nov 17',
            actionButton: { label: 'Send summary to Case Manager', actionId: 'cm_summary' },
          },
        ]);
      } else if (userPrompt.toLowerCase().includes('similar')) {
        setAssistantMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: `Found 2 previous notes from Rosa V. with similar wording: on Nov 12 ("difficult taking bath") and Oct 28 ("refused morning meal"). Both were resolved without incident after caregiver coaching.`,
            source: 'Caseload Note Archive',
            actionButton: { label: 'Schedule 10-min coaching', actionId: 'schedule_coaching' },
          },
        ]);
      } else if (userPrompt.toLowerCase().includes('draft') || userPrompt.toLowerCase().includes('message')) {
        setAssistantMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: `"Hi Rosa, thank you for caring for Marisol today! To keep your note compliant with state Medicaid auditors, could you clarify what breakfast food she preferred and whether the nurse was notified about her pill timing? Thank you!"`,
            source: 'LiliSare Caregiver Coaching Tone',
            actionButton: { label: 'Send this message to Rosa', actionId: 'send_coaching' },
          },
        ]);
      } else {
        setAssistantMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: `I've analyzed your request regarding ${deIdentify(currentNote.clientName)}'s visit. No ungrounded clinical facts were found. What would you like to do next?`,
          },
        ]);
      }
    }, 400);
  };

  const handleAssistantAction = (actionId: string) => {
    if (actionId === 'incident') {
      setPendingConfirmAction({
        label: 'Create State Incident Report',
        description: `This will file an official incident intake for ${deIdentify(currentNote.clientName)} and alert Supervising RN Dana Whitfield.`,
        onConfirm: () => {
          setShowIncidentModal(true);
          showToast('Incident report workflow initiated');
        },
      });
    } else if (actionId === 'send_coaching' || actionId === 'cm_summary') {
      setPendingConfirmAction({
        label: 'Send message to caregiver',
        description: `You are about to dispatch this clarifying message to ${deIdentify(currentNote.caregiverName)} via the mobile app.`,
        onConfirm: () => {
          handleSendToCaregiver(currentNote.id);
        },
      });
    } else if (actionId === 'schedule_coaching') {
      setPendingConfirmAction({
        label: 'Assign LearnWorlds Coaching Course',
        description: `Assign Course LS-204 (Objective Documentation) to ${deIdentify(currentNote.caregiverName)}.`,
        onConfirm: () => {
          showToast(`Course assigned to ${deIdentify(currentNote.caregiverName)}`);
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & TAB BAR */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" className="text-[12px] font-normal text-[var(--text-muted)] flex items-center gap-1.5">
          <span className="hover:text-[var(--text)] cursor-pointer" onClick={() => setActiveTab('review')}>
            Care Notes
          </span>
          <span>›</span>
          <span className="font-semibold text-[var(--text)] capitalize">
            {activeTab === 'review'
              ? 'Review'
              : activeTab === 'new-note'
                ? 'New Note'
                : activeTab === 'quality'
                  ? 'Quality Reports'
                  : 'Rules'}
          </span>
          {activeTab === 'review' && currentNote && (
            <>
              <span>›</span>
              <span className="text-[var(--text)] truncate max-w-[200px]">
                {deIdentify(currentNote.caregiverName)} ({deIdentify(currentNote.clientName)})
              </span>
            </>
          )}
        </nav>

        {/* Title & Help Link */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[28px] font-bold text-[var(--text)] leading-tight">Care Notes</h1>
              <button
                type="button"
                onClick={() => setShowHelpGuide(true)}
                className="text-[12px] font-semibold text-[var(--green-700)] bg-[var(--green-100)] px-2.5 py-1 rounded-[8px] border border-[var(--border)] hover:bg-[var(--green-700)] hover:text-white transition flex items-center gap-1"
                title="Open 3-step guide for this screen"
              >
                <span>?</span>
                <span>Help guide</span>
              </button>
            </div>
            <p className="text-[14px] font-normal text-[var(--text-muted)] mt-1">
              {activeTab === 'review' && 'Notes waiting for your check'}
              {activeTab === 'new-note' && 'Write or dictate a note for a client'}
              {activeTab === 'quality' && 'How well notes are meeting the rules'}
              {activeTab === 'rules' && 'What the system checks for'}
            </p>
          </div>

          {/* 4 Simple Tabs */}
          <div className="flex items-center bg-[var(--card)] border border-[var(--border)] rounded-[8px] p-0.5 h-[36px] shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('review')}
              className={`h-[30px] px-3.5 rounded-[6px] text-[12px] font-semibold transition ${activeTab === 'review'
                  ? 'bg-[var(--green-700)] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
            >
              Review
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('new-note')}
              className={`h-[30px] px-3.5 rounded-[6px] text-[12px] font-semibold transition ${activeTab === 'new-note'
                  ? 'bg-[var(--green-700)] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
            >
              New Note
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('quality')}
              className={`h-[30px] px-3.5 rounded-[6px] text-[12px] font-semibold transition ${activeTab === 'quality'
                  ? 'bg-[var(--green-700)] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
            >
              Quality Reports
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className={`h-[30px] px-3.5 rounded-[6px] text-[12px] font-semibold transition ${activeTab === 'rules'
                  ? 'bg-[var(--green-700)] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
            >
              Rules
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TAB 1: REVIEW TAB (2-PANEL LAYOUT) */}
      {/* ========================================================================= */}
      {activeTab === 'review' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT PANEL: THE QUEUE (4 COLS) */}
          <div className="lg:col-span-4 bg-[var(--card)] border border-[var(--border)] rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col h-[780px]">
            {/* Filter Bar */}
            <div className="p-3 border-b border-[var(--border)] space-y-2 bg-[var(--card)]">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search client or caregiver…"
                  className="w-full h-[36px] bg-[var(--card)] border border-[var(--border)] rounded-[8px] pl-8 pr-3 text-[12px] font-normal text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)]"
                />
                <span className="absolute left-2.5 top-2.5 text-[12px] text-[var(--text-muted)]">🔍</span>
              </div>

              {/* 3 Plain Filters */}
              <div className="grid grid-cols-3 gap-1.5">
                {/* Status */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-[32px] px-2 bg-[var(--bg)] border border-[var(--border)] rounded-[6px] text-[12px] text-[var(--text)] font-normal"
                >
                  <option value="All">All Statuses</option>
                  <option value="Needs fix">Needs fix</option>
                  <option value="Waiting on caregiver">Waiting on CG</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Approved">Approved</option>
                </select>

                {/* Program */}
                <select
                  value={filterProgram}
                  onChange={(e) => setFilterProgram(e.target.value)}
                  className="h-[32px] px-2 bg-[var(--bg)] border border-[var(--border)] rounded-[6px] text-[12px] text-[var(--text)] font-normal"
                >
                  <option value="All">All Programs</option>
                  <option value="IHSS">IHSS</option>
                  <option value="CFC">CFC</option>
                  <option value="HCBS">HCBS</option>
                  <option value="IRSS">IRSS</option>
                  <option value="HMA">HMA</option>
                </select>

                {/* Priority */}
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="h-[32px] px-2 bg-[var(--bg)] border border-[var(--border)] rounded-[6px] text-[12px] text-[var(--text)] font-normal"
                >
                  <option value="All">All Priority</option>
                  <option value="Urgent first">Urgent first</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>
            </div>

            {/* Queue List Items */}
            <div className="divide-y divide-[var(--border)] overflow-y-auto flex-1">
              {sortedQueue.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="text-3xl">✓</div>
                  <div className="text-[14px] font-semibold text-[var(--text)]">No notes need review. Nice work!</div>
                  <div className="text-[12px] font-normal text-[var(--text-muted)]">
                    All submitted care notes in this category have been checked.
                  </div>
                </div>
              ) : (
                sortedQueue.map((item) => {
                  const isSelected = item.id === currentNote.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedNoteId(item.id)}
                      className={`p-3.5 cursor-pointer transition ${isSelected
                          ? 'bg-[var(--green-100)]/70 border-l-4 border-l-[var(--green-700)]'
                          : 'hover:bg-[#F0F2ED]/60 bg-[var(--card)]'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[14px] font-semibold text-[var(--text)] truncate">
                          {deIdentify(item.clientName)}
                        </span>
                        {/* One Status Chip */}
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-[6px] shrink-0 ${item.status === 'Urgent'
                              ? 'bg-red-100 text-red-900 border border-red-200'
                              : item.status === 'Needs fix'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : item.status === 'Waiting on caregiver'
                                  ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                  : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="text-[12px] font-normal text-[var(--text-muted)] truncate">
                        Caregiver: <b className="text-[var(--text)]">{deIdentify(item.caregiverName)}</b> · {item.program}
                      </div>

                      <p className="text-[12px] font-normal text-[var(--text)] line-clamp-1 mt-1">
                        {item.originalText}
                      </p>

                      <div className="text-[11px] font-normal text-[var(--text-muted)] mt-1.5 flex items-center justify-between">
                        <span>{item.visitDate}</span>
                        {item.attachments.length > 0 && (
                          <span className="flex items-center gap-1">
                            <span>📎</span> {item.attachments.length} file
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT PANEL: OPEN NOTE (8 COLS) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Sticky Client HIPAA Banner */}
            <div className="sticky top-0 z-20 bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[16px] font-bold text-[var(--text)]">
                      {deIdentify(currentNote.clientName)}
                    </span>
                    {/* Masked ID with click to reveal */}
                    <button
                      type="button"
                      onClick={() => setRevealId(!revealId)}
                      className="text-[12px] font-normal text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] px-2 py-0.5 rounded-[6px] hover:text-[var(--text)]"
                      title="Click to reveal full client ID"
                    >
                      ID: {revealId ? currentNote.clientId : '••••' + currentNote.clientId.slice(-3)}
                    </button>
                    {/* Age with click to reveal DOB */}
                    <button
                      type="button"
                      onClick={() => setRevealDob(!revealDob)}
                      className="text-[12px] font-normal text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] px-2 py-0.5 rounded-[6px] hover:text-[var(--text)]"
                      title="Click to reveal date of birth"
                    >
                      {revealDob ? `DOB: ${currentNote.clientDob}` : `Age ${currentNote.clientAge}`}
                    </button>
                    <span className="text-[12px] font-semibold px-2 py-0.5 rounded-[6px] bg-[var(--green-100)] text-[var(--green-700)]">
                      {currentNote.program}
                    </span>
                  </div>

                  <div className="text-[12px] font-normal text-[var(--text-muted)] mt-1 flex items-center gap-2 flex-wrap">
                    <span>Caregiver: <b className="text-[var(--text)]">{deIdentify(currentNote.caregiverName)}</b></span>
                    <span>·</span>
                    <span>{currentNote.visitDate} ({currentNote.visitTime})</span>
                    <span>·</span>
                    <span className={currentNote.evvStatus === 'Verified' ? 'text-emerald-800' : 'text-amber-800'}>
                      {currentNote.evvStatus === 'Verified' ? '✓ EVV Verified' : '⚠️ EVV Exception'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Access Logged Indicator */}
                  <span
                    className="text-[11px] font-normal text-[var(--text-muted)] flex items-center gap-1 bg-[var(--bg)] border border-[var(--border)] px-2 py-1 rounded-[6px]"
                    title="Viewing this record is recorded in the HIPAA compliance audit log."
                  >
                    <span>🔒</span>
                    <span className="hidden sm:inline">Access logged</span>
                  </span>

                  {/* Details Drawer Button */}
                  <button
                    type="button"
                    onClick={() => setShowDetailsDrawer(true)}
                    className="min-h-[32px] px-3 rounded-[6px] border border-[var(--border)] bg-[var(--card)] text-[12px] font-semibold text-[var(--text)] hover:bg-[#F0F2ED] transition flex items-center gap-1"
                  >
                    <span>📋</span>
                    <span>Details</span>
                  </button>
                </div>
              </div>

              {/* Caseload & Session notice */}
              {!currentNote.inCaseload && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-[6px] text-[11px] text-amber-900 flex items-center justify-between">
                  <span>Notice: This client is outside your assigned caseload. Access has been recorded in the supervisor log.</span>
                  <button
                    type="button"
                    onClick={() => setShowSessionTimeoutModal(true)}
                    className="underline text-[11px] ml-2"
                  >
                    Simulate Auto-Lock
                  </button>
                </div>
              )}
            </div>

            {/* Safety Alert Banner (Only when urgent safety issue) */}
            {currentNote.isUrgentSafety && (
              <div className="bg-red-50 border-2 border-[var(--red)] rounded-[12px] p-5 text-[var(--red)] space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h2 className="text-[16px] font-bold">Needs Supervisor Review · Safety Issue Detected</h2>
                    <span className="text-[12px] text-red-950">
                      The note contains phrasing indicating potential physical force or non-consensual care.
                    </span>
                  </div>
                </div>
                <p className="text-[12px] text-red-950 leading-relaxed">
                  State rules require human review. LiliSare will not suggest rewording that might conceal a reportable event.
                  Please take one of the safety actions below:
                </p>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowIncidentModal(true)}
                    className="min-h-[36px] px-4 rounded-[8px] bg-[var(--red)] text-white text-[12px] font-semibold hover:brightness-95 transition"
                  >
                    Create Incident Report (State Portal)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      showToast('Notification sent to Supervising RN Dana Whitfield');
                    }}
                    className="min-h-[36px] px-4 rounded-[8px] border border-[var(--red)] bg-white text-[var(--red)] text-[12px] font-semibold hover:bg-red-50 transition"
                  >
                    Notify Supervisor
                  </button>
                </div>
              </div>
            )}

            {/* STEP 1: READ */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-2">
              <div className="border-b border-[var(--border)] pb-2">
                <h3 className="text-[16px] font-semibold text-[var(--text)]">Step 1: Read the original note</h3>
                <p className="text-[12px] font-normal text-[var(--text-muted)]">
                  This is what the caregiver originally wrote after their visit. Tap any highlighted phrase to see why it was flagged.
                </p>
              </div>

              {/* Note Text with Highlights */}
              <div className="p-3.5 bg-[var(--bg)] border border-[var(--border)] rounded-[8px] text-[14px] font-normal leading-relaxed text-[var(--text)]">
                {currentNote.flags.length === 0 ? (
                  <span>{currentNote.originalText}</span>
                ) : (
                  <div>
                    {currentNote.originalText.split(/(difficult|made her eat anyway|refused to eat|Gave meds|normal stuff all shift|fine and had no problems|acting up)/gi).map((chunk, i) => {
                      const matched = currentNote.flags.find((f) => f.phrase.toLowerCase() === chunk.toLowerCase());
                      if (matched) {
                        return (
                          <mark
                            key={i}
                            onClick={() => setActiveFlagPopover(matched)}
                            className={`cursor-pointer px-1 py-0.5 rounded font-medium ${matched.isUrgentSafety
                                ? 'bg-red-200 text-red-950 ring-1 ring-red-400'
                                : 'bg-amber-200 text-amber-950'
                              }`}
                            title="Click to view plain-language explanation"
                          >
                            {chunk}
                          </mark>
                        );
                      }
                      return <span key={i}>{chunk}</span>;
                    })}
                  </div>
                )}
              </div>

              {/* Flag Popover */}
              {activeFlagPopover && (
                <div className="p-3 bg-[var(--card)] border-2 border-[var(--amber)] rounded-[8px] space-y-2 text-[12px] animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--text)]">Flagged phrase: "{activeFlagPopover.phrase}"</span>
                    <button
                      type="button"
                      onClick={() => setActiveFlagPopover(null)}
                      className="text-[var(--text-muted)] hover:text-[var(--text)]"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <div>
                    <span className="font-semibold text-amber-950 block">Why this is flagged:</span>
                    <p className="text-stone-700">{activeFlagPopover.plainWhy}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-950 block">What to write instead:</span>
                    <p className="text-stone-700">{activeFlagPopover.plainFix}</p>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: FIX (Only when not urgent safety) */}
            {!currentNote.isUrgentSafety && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3">
                <div className="border-b border-[var(--border)] pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-[16px] font-semibold text-[var(--text)]">Step 2: Check the suggested fix</h3>
                    <p className="text-[12px] font-normal text-[var(--text-muted)]">
                      AI organized the text using only facts from the caregiver. Missing details are shown as amber blanks.
                    </p>
                  </div>
                </div>

                {/* Suggested version with amber blanks */}
                <div className="p-3.5 bg-[var(--bg)] border border-[var(--border)] rounded-[8px] text-[14px] font-normal leading-relaxed text-[var(--text)]">
                  {currentNote.suggestedText.split(/(\[add [^\]]+\])/gi).map((seg, idx) => {
                    if (seg.startsWith('[') && seg.endsWith(']')) {
                      return (
                        <span
                          key={idx}
                          className="bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] px-1.5 py-0.5 rounded font-medium text-[13px] mx-0.5"
                          title="Missing detail - ask the caregiver"
                        >
                          {seg}
                        </span>
                      );
                    }
                    return <span key={idx}>{seg}</span>;
                  })}
                </div>

                {/* Questions for Caregiver (Collapsible) */}
                {currentNote.questions.length > 0 && (
                  <div className="border border-[var(--border)] rounded-[8px] p-3 bg-[var(--card)] space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowQuestions(!showQuestions)}
                      className="w-full flex items-center justify-between text-[12px] font-semibold text-[var(--text)]"
                    >
                      <span>Questions for {deIdentify(currentNote.caregiverName)} ({currentNote.questions.length})</span>
                      <span>{showQuestions ? '▲ Hide' : '▼ Show'}</span>
                    </button>

                    {showQuestions && (
                      <div className="space-y-2 pt-1">
                        {currentNote.questions.map((q, idx) => (
                          <div key={q.id} className="p-2.5 bg-[var(--bg)] rounded-[6px] border border-[var(--border)] text-[12px] space-y-1">
                            <div className="font-semibold text-[var(--text)]">
                              {idx + 1}. {q.question}
                            </div>
                            {q.isAnswered ? (
                              <div className="text-emerald-900 bg-emerald-50 p-1.5 rounded font-medium">
                                "{q.answer}" {q.voiceRecorded ? '(Spoken answer)' : ''}
                              </div>
                            ) : (
                              <div className="flex gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const ans = prompt('Caregiver spoken answer:', 'At 11:15 AM through G-tube');
                                    if (ans) {
                                      setNotes((prev) =>
                                        prev.map((n) =>
                                          n.id === currentNote.id
                                            ? {
                                              ...n,
                                              questions: n.questions.map((item) =>
                                                item.id === q.id ? { ...item, isAnswered: true, answer: ans } : item
                                              ),
                                              suggestedText: n.suggestedText.replace('[add exact time]', ans),
                                            }
                                            : n
                                        )
                                      );
                                      showToast('Answer merged into note');
                                    }
                                  }}
                                  className="h-[28px] px-2 rounded bg-white border border-[var(--border)] text-[11px] font-semibold text-[var(--text)] hover:bg-stone-100 flex items-center gap-1"
                                >
                                  <span>🎙️</span>
                                  <span>Record answer</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const ans = prompt('Type answer:');
                                    if (ans) {
                                      setNotes((prev) =>
                                        prev.map((n) =>
                                          n.id === currentNote.id
                                            ? {
                                              ...n,
                                              questions: n.questions.map((item) =>
                                                item.id === q.id ? { ...item, isAnswered: true, answer: ans } : item
                                              ),
                                            }
                                            : n
                                        )
                                      );
                                      showToast('Answer saved');
                                    }
                                  }}
                                  className="h-[28px] px-2 rounded bg-white border border-[var(--border)] text-[11px] text-[var(--text)]"
                                >
                                  Type answer
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Attachments Section on Note */}
            {currentNote.attachments.length > 0 && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-2">
                <span className="text-[12px] font-semibold text-[var(--text)] block">
                  Attachments on this note ({currentNote.attachments.length})
                </span>
                <div className="divide-y divide-[var(--border)] text-[12px]">
                  {currentNote.attachments.map((att) => (
                    <div key={att.id} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>📎</span>
                        <div>
                          <span className="font-semibold text-[var(--text)] block">{att.name}</span>
                          <span className="text-[11px] text-[var(--text-muted)]">
                            {att.type} · {att.size} · Uploaded by {att.uploadedBy}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                        <span>🔒</span> Access logged
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: DECIDE */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3">
              <div className="border-b border-[var(--border)] pb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-[16px] font-semibold text-[var(--text)]">Step 3: Decide</h3>
                  <p className="text-[12px] font-normal text-[var(--text-muted)]">
                    Take action on this note. Once approved, it is locked and ready for state billing.
                  </p>
                </div>
              </div>

              {/* One Primary Button + More Menu */}
              <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
                {/* Primary Button Changes With Context */}
                {currentNote.status === 'Needs fix' ? (
                  <button
                    type="button"
                    onClick={() => handleSendToCaregiver(currentNote.id)}
                    className="min-h-[36px] px-5 rounded-[8px] bg-[var(--green-700)] text-white text-[14px] font-semibold hover:bg-[var(--green-900)] transition shadow-xs focus:ring-2 focus:ring-[var(--green-700)]"
                  >
                    Send to caregiver →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApproveNote(currentNote.id)}
                    className="min-h-[36px] px-5 rounded-[8px] bg-[var(--green-700)] text-white text-[14px] font-semibold hover:bg-[var(--green-900)] transition shadow-xs focus:ring-2 focus:ring-[var(--green-700)]"
                  >
                    Approve note ✓
                  </button>
                )}

                {/* Secondary & More Menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMoreActions(!showMoreActions)}
                    className="min-h-[36px] px-3.5 rounded-[8px] border border-[var(--border)] bg-[var(--card)] text-[14px] font-normal text-[var(--text)] hover:bg-[#F0F2ED] transition flex items-center gap-1"
                  >
                    <span>More actions</span>
                    <span>▾</span>
                  </button>

                  {showMoreActions && (
                    <div className="absolute right-0 bottom-full mb-1 w-48 bg-[var(--card)] border border-[var(--border)] rounded-[8px] shadow-lg p-1 z-30 text-[12px] space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreActions(false);
                          setIsEditingManually(true);
                          const manual = prompt('Edit note text manually:', currentNote.suggestedText);
                          if (manual) {
                            setNotes(notes.map((n) => (n.id === currentNote.id ? { ...n, suggestedText: manual } : n)));
                            showToast('Manual edit saved');
                          }
                        }}
                        className="w-full text-left p-2 rounded hover:bg-[#F0F2ED] text-[var(--text)]"
                      >
                        Edit manually
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreActions(false);
                          if (confirm(`Suggest training refresher "LS2040: Objective Note Writing (15 min)" to ${currentNote.caregiverName}?`)) {
                            showToast(`Assigned "LS2040: Objective Note Writing" to ${currentNote.caregiverName}. Visible in Training module.`);
                          }
                        }}
                        className="w-full text-left p-2 rounded hover:bg-[#F0F2ED] text-[#3E6B2B] font-semibold flex items-center gap-1.5"
                      >
                        <span>🎓</span>
                        <span>Suggest training (15 min)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreActions(false);
                          handleApproveNote(currentNote.id);
                          showToast('Approved keeping original text');
                        }}
                        className="w-full text-left p-2 rounded hover:bg-[#F0F2ED] text-[var(--text)]"
                      >
                        Keep original text
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreActions(false);
                          handleEscalateNote(currentNote.id);
                        }}
                        className="w-full text-left p-2 rounded hover:bg-red-50 text-[var(--red)] font-semibold"
                      >
                        Escalate to supervisor ⚠️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB 2: NEW NOTE TAB (4-STEP GUIDED WIZARD) */}
      {/* ========================================================================= */}
      {activeTab === 'new-note' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Top Wizard Bar */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3">
            <div className="flex items-center justify-between text-[12px] font-semibold">
              <span className="text-[var(--text)]">Guided Note Creation</span>
              <span className="text-[var(--text-muted)]">Draft saved {draftSavedAt}</span>
            </div>

            {/* Stepper Dots */}
            <div className="grid grid-cols-4 gap-2 text-center text-[12px]">
              {[
                { num: 1, label: '1. Client & Visit' },
                { num: 2, label: '2. Add Note' },
                { num: 3, label: '3. Check Formatted' },
                { num: 4, label: '4. Attach & Submit' },
              ].map((s) => (
                <div key={s.num} className="flex flex-col items-center">
                  <div
                    className={`w-full h-1.5 rounded-full mb-1.5 transition ${wizardStep >= s.num ? 'bg-[var(--green-700)]' : 'bg-[var(--border)]'
                      }`}
                  />
                  <span
                    className={`text-[12px] truncate w-full ${wizardStep === s.num ? 'font-bold text-[var(--text)]' : 'text-[var(--text-muted)]'
                      }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Phone Simulator Link */}
            <div className="pt-2 border-t border-[var(--border)] flex justify-end">
              <button
                type="button"
                onClick={() => setIsPhonePreviewOpen(!isPhonePreviewOpen)}
                className="text-[12px] font-semibold text-[var(--green-700)] hover:underline flex items-center gap-1"
              >
                <span>📱</span>
                <span>{isPhonePreviewOpen ? 'Hide phone preview' : 'Preview as caregiver (phone)'}</span>
              </button>
            </div>
          </div>

          {/* STEP 1: CHOOSE CLIENT & VISIT */}
          {wizardStep === 1 && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
              <div>
                <h3 className="text-[16px] font-semibold text-[var(--text)]">Step 1: Choose client and visit</h3>
                <p className="text-[12px] text-[var(--text-muted)]">
                  HIPAA rule: Every care note must be linked to a specific verified visit in your caseload.
                </p>
              </div>

              <div className="space-y-3 text-[14px]">
                <label className="block">
                  <span className="text-[12px] font-semibold text-[var(--text)] block mb-1">
                    Client (Your Caseload Only)
                  </span>
                  <select
                    value={wizardClientId}
                    onChange={(e) => setWizardClientId(e.target.value)}
                    className="w-full h-[36px] px-3 bg-[var(--card)] border border-[var(--border)] rounded-[8px]"
                  >
                    <option value="C-1001">Marisol Vega (C-1001) · IHSS Attendant Care</option>
                    <option value="C-1002">Eli Brandt (C-1002) · IHSS Child Care</option>
                    <option value="C-1006">Josefina Ruiz (C-1006) · HMA Delegated Nursing</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-[12px] font-semibold text-[var(--text)] block mb-1">
                    Select Visit
                  </span>
                  <select
                    value={wizardVisitDate}
                    onChange={(e) => setWizardVisitDate(e.target.value)}
                    className="w-full h-[36px] px-3 bg-[var(--card)] border border-[var(--border)] rounded-[8px]"
                  >
                    <option value="Today, Nov 17 · 8:00 AM - 11:30 AM (EVV Verified)">
                      Today, Nov 17 · 8:00 AM – 11:30 AM (EVV Verified ✓)
                    </option>
                    <option value="Yesterday, Nov 16 · 8:00 AM - 11:30 AM (Past visit)">
                      Yesterday, Nov 16 · 8:00 AM – 11:30 AM (Past visit)
                    </option>
                  </select>
                </label>
              </div>

              <div className="flex justify-end pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="min-h-[36px] px-5 rounded-[8px] bg-[var(--green-700)] text-white text-[14px] font-semibold hover:bg-[var(--green-900)]"
                >
                  Next: Add your note →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ADD YOUR NOTE (SPEAK / UPLOAD / TYPE) */}
          {wizardStep === 2 && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
              <div>
                <h3 className="text-[16px] font-semibold text-[var(--text)]">Step 2: Add your note</h3>
                <p className="text-[12px] text-[var(--text-muted)]">
                  Choose how you want to provide your documentation:
                </p>
              </div>

              {/* 3 Large Option Cards */}
              <div className="grid sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setInputMode('speak')}
                  className={`p-4 rounded-[12px] border text-left transition ${inputMode === 'speak'
                      ? 'border-[var(--green-700)] bg-[var(--green-100)] ring-1 ring-[var(--green-700)]'
                      : 'border-[var(--border)] bg-[var(--card)] hover:bg-[#F0F2ED]'
                    }`}
                >
                  <span className="text-2xl block mb-1">🎙️</span>
                  <span className="font-semibold text-[14px] text-[var(--text)] block">Speak</span>
                  <span className="text-[12px] text-[var(--text-muted)]">Live voice dictation</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`p-4 rounded-[12px] border text-left transition ${inputMode === 'upload'
                      ? 'border-[var(--green-700)] bg-[var(--green-100)] ring-1 ring-[var(--green-700)]'
                      : 'border-[var(--border)] bg-[var(--card)] hover:bg-[#F0F2ED]'
                    }`}
                >
                  <span className="text-2xl block mb-1">📁</span>
                  <span className="font-semibold text-[14px] text-[var(--text)] block">Upload voice note</span>
                  <span className="text-[12px] text-[var(--text-muted)]">Audio file (.m4a, .mp3)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInputMode('type')}
                  className={`p-4 rounded-[12px] border text-left transition ${inputMode === 'type'
                      ? 'border-[var(--green-700)] bg-[var(--green-100)] ring-1 ring-[var(--green-700)]'
                      : 'border-[var(--border)] bg-[var(--card)] hover:bg-[#F0F2ED]'
                    }`}
                >
                  <span className="text-2xl block mb-1">⌨️</span>
                  <span className="font-semibold text-[14px] text-[var(--text)] block">Paste or type</span>
                  <span className="text-[12px] text-[var(--text-muted)]">Rough notes text</span>
                </button>
              </div>

              {/* Mode 1: Speak */}
              {inputMode === 'speak' && (
                <div className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-[8px] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-[var(--text)]">Voice Recording Simulator</span>
                    <select
                      value={recordingLanguage}
                      onChange={(e) => setRecordingLanguage(e.target.value as typeof recordingLanguage)}
                      className="h-[28px] px-2 rounded bg-[var(--card)] border border-[var(--border)] text-[12px]"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Español</option>
                    </select>
                  </div>

                  <div className="h-16 bg-white border border-[var(--border)] rounded flex items-center justify-center p-2">
                    {isRecording ? (
                      <canvas ref={waveformRef} width={340} height={48} className="w-full h-full" />
                    ) : (
                      <span className="text-[12px] text-[var(--text-muted)]">Tap start to begin speaking</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isRecording) {
                          setIsRecording(true);
                          setRoughText(
                            'Arrived at 8 AM. Client refused eggs so I made toast and tea. Took blood pressure pills with water. Transferred to chair with walker.'
                          );
                        } else {
                          setIsRecording(false);
                          showToast('Dictation captured');
                        }
                      }}
                      className={`min-h-[36px] px-4 rounded-[8px] font-semibold text-[12px] transition ${isRecording ? 'bg-red-600 text-white' : 'bg-[var(--green-700)] text-white'
                        }`}
                    >
                      {isRecording ? `Stop Recording (${recordSeconds}s)` : 'Start Speaking 🎙️'}
                    </button>
                  </div>

                  {roughText && (
                    <div className="p-3 bg-white border border-[var(--border)] rounded text-[13px] leading-relaxed">
                      "{roughText}"
                    </div>
                  )}
                </div>
              )}

              {/* Mode 2: Upload */}
              {inputMode === 'upload' && (
                <div className="p-6 border-2 border-dashed border-[var(--border)] rounded-[8px] text-center space-y-2">
                  <span className="text-3xl block">🎙️</span>
                  <span className="text-[14px] font-semibold text-[var(--text)] block">
                    {uploadedFileName || 'Drop caregiver audio file here'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFileName('Morning_Shift_Audio_RosaV.m4a');
                      setRoughText('Arrived 8:00 AM. Breakfast oatmeal prepared. Client declined, accepted yogurt.');
                      showToast('Audio uploaded and transcribed');
                    }}
                    className="min-h-[32px] px-3 rounded-[6px] border border-[var(--border)] bg-white text-[12px]"
                  >
                    Select audio file (.m4a, .mp3)
                  </button>
                </div>
              )}

              {/* Mode 3: Type */}
              {inputMode === 'type' && (
                <textarea
                  rows={4}
                  value={roughText}
                  onChange={(e) => setRoughText(e.target.value)}
                  placeholder="Type or paste rough caregiver notes here…"
                  className="w-full p-3 bg-[var(--card)] border border-[var(--border)] rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--green-700)]"
                />
              )}

              <div className="flex justify-between pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="min-h-[36px] px-3.5 rounded-[8px] border border-[var(--border)] text-[14px]"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={!roughText}
                  onClick={() => {
                    setFormattedText(
                      `Tasks Performed: Assisted with breakfast meal prep, morning hygiene, and medication reminder.\nClient Response: Client declined oatmeal; accepted yogurt and sliced peaches.\nObservations: Ambulated safely with walker. Vitals stable; morning BP medication taken at 9:05 AM with water.\nFollow-up: Monitor fluid intake at lunch.`
                    );
                    setWizardStep(3);
                  }}
                  className="min-h-[36px] px-5 rounded-[8px] bg-[var(--green-700)] text-white text-[14px] font-semibold hover:bg-[var(--green-900)] disabled:opacity-50"
                >
                  Next: Check formatted note →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CHECK FORMATTED NOTE (SIDE BY SIDE) */}
          {wizardStep === 3 && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
              <div>
                <h3 className="text-[16px] font-semibold text-[var(--text)]">Step 3: Check formatted note</h3>
                <p className="text-[12px] text-[var(--text-muted)]">
                  AI organized what was said into state-compliant structure without adding any outside facts.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-[var(--bg)] border border-[var(--border)] rounded-[8px] space-y-1">
                  <span className="text-[12px] font-semibold text-[var(--text-muted)] block">What you provided:</span>
                  <p className="text-[13px] text-[var(--text)]">{roughText}</p>
                </div>

                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-[8px] space-y-1">
                  <span className="text-[12px] font-semibold text-emerald-950 block">Formatted clinical version:</span>
                  <div className="text-[13px] text-emerald-950 whitespace-pre-line leading-relaxed font-normal">
                    {formattedText}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="min-h-[36px] px-3.5 rounded-[8px] border border-[var(--border)] text-[14px]"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep(4)}
                  className="min-h-[36px] px-5 rounded-[8px] bg-[var(--green-700)] text-white text-[14px] font-semibold hover:bg-[var(--green-900)]"
                >
                  Next: Attachments & submit →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ATTACHMENTS & SUBMIT */}
          {wizardStep === 4 && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
              <div>
                <h3 className="text-[16px] font-semibold text-[var(--text)]">Step 4: Attachments and submit</h3>
                <p className="text-[12px] text-[var(--text-muted)]">
                  Add optional photos or documentation, then submit to the reviewer queue.
                </p>
              </div>

              {/* Attachments Dropzone */}
              <div className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-[8px] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-[var(--text)]">Optional Attachments</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newAtt: AttachmentItem = {
                        id: 'att-new',
                        name: 'Meal_Preference_Care_Log.pdf',
                        type: 'Other',
                        size: '180 KB',
                        uploadedBy: 'You',
                        uploadedAt: 'Today',
                      };
                      setNewNoteAttachments([...newNoteAttachments, newAtt]);
                      showToast('Attachment added');
                    }}
                    className="min-h-[28px] px-2.5 rounded bg-white border border-[var(--border)] text-[11px] font-semibold text-[var(--text)] hover:bg-stone-50"
                  >
                    + Add file (photo / PDF)
                  </button>
                </div>

                {newNoteAttachments.length > 0 ? (
                  <div className="space-y-1.5 text-[12px]">
                    {newNoteAttachments.map((a) => (
                      <div key={a.id} className="p-2 bg-white rounded border border-[var(--border)] flex justify-between items-center">
                        <span>📎 {a.name} ({a.size})</span>
                        <span className="text-[11px] text-[var(--text-muted)]">🔒 Access logged</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-[var(--text-muted)] italic">No files attached to this note.</p>
                )}

                <div className="text-[11px] text-[var(--text-muted)]">
                  Notice: Attachments are encrypted and visible only to people assigned to this client. Do not attach anything not needed for care.
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setWizardStep(3)}
                  className="min-h-[36px] px-3.5 rounded-[8px] border border-[var(--border)] text-[14px]"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const created: NoteRecord = {
                      id: `NOTE-${Date.now().toString().slice(-3)}`,
                      clientId: wizardClientId,
                      clientName: 'Marisol Vega',
                      clientAge: 67,
                      clientDob: 'Oct 14, 1959',
                      caregiverName: 'You (Reviewer Entry)',
                      program: 'IHSS',
                      visitDate: 'Nov 17, 2026',
                      visitTime: '8:00 AM - 11:30 AM',
                      evvStatus: 'Verified',
                      evvDetails: 'EVV Verified',
                      tasks: ['Meal Prep', 'Medication Reminder'],
                      status: 'Approved',
                      isUrgentSafety: false,
                      originalText: formattedText,
                      flags: [],
                      suggestedText: formattedText,
                      placeholders: [],
                      questions: [],
                      attachments: newNoteAttachments,
                      assignedReviewer: 'Maya R.',
                      inCaseload: true,
                      clientContext: {
                        authorizedHours: '28.0 hrs/week',
                        carePlanGoals: ['Nutrition maintenance'],
                        lastThreeNotes: [],
                      },
                      timeline: [{ title: 'Note created and approved', actor: 'Maya R.', time: 'Just now' }],
                    };
                    setNotes([created, ...notes]);
                    setActiveTab('review');
                    setSelectedNoteId(created.id);
                    showToast(`Note submitted and saved to ${created.clientId}`);
                  }}
                  className="min-h-[36px] px-6 rounded-[8px] bg-[var(--green-700)] text-white text-[14px] font-semibold hover:bg-[var(--green-900)]"
                >
                  Submit for review ✓
                </button>
              </div>
            </div>
          )}

          {/* Caregiver Phone Simulator Frame */}
          {isPhonePreviewOpen && (
            <div className="p-6 bg-[var(--bg)] border border-[var(--border)] rounded-[12px] flex flex-col items-center">
              <span className="text-[12px] font-semibold text-[var(--text-muted)] mb-3">Caregiver Phone Preview</span>
              <div className="w-[320px] bg-stone-900 p-2.5 rounded-[32px] border-4 border-stone-800 shadow-xl">
                <div className="bg-white rounded-[24px] p-4 text-[12px] space-y-3 h-[520px] overflow-y-auto">
                  <div className="font-bold text-[14px] text-[var(--green-900)]">LiliSare Caregiver App</div>
                  <div className="p-2 bg-stone-100 rounded text-[11px]">
                    Visit: <b>Marisol Vega</b> (Today)
                  </div>
                  <div className="border border-stone-200 p-3 rounded-lg text-center space-y-2">
                    <span className="text-2xl block">🎙️</span>
                    <span className="font-semibold block">Tap to speak your note</span>
                    <button type="button" className="w-full py-2 bg-[var(--green-700)] text-white rounded font-bold">
                      Start Speaking
                    </button>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Draft will be formatted into tasks and observations for agency review.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB 3: QUALITY REPORTS (EXISTING ANALYTICS) */}
      {/* ========================================================================= */}
      {activeTab === 'quality' && (
        <div className="space-y-5">
          {/* Top 4 Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)] block mb-1">
                First-Pass Compliant Rate
              </span>
              <div className="text-[28px] font-bold text-[var(--text)] leading-none">82%</div>
              <span className="text-[12px] font-normal text-emerald-800 mt-1 block">↑ +21% vs. 61% last quarter</span>
            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)] block mb-1">
                Average Review Time
              </span>
              <div className="text-[28px] font-bold text-[var(--text)] leading-none">42s</div>
              <span className="text-[12px] font-normal text-[var(--text-muted)] mt-1 block">Per checked note</span>
            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)] block mb-1">
                Auto-Approved Rate
              </span>
              <div className="text-[28px] font-bold text-[var(--text)] leading-none">74%</div>
              <span className="text-[12px] font-normal text-[var(--text-muted)] mt-1 block">Passed all gate checks</span>
            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)] block mb-1">
                Audit Hours Saved
              </span>
              <div className="text-[28px] font-bold text-[var(--green-700)] leading-none">148h</div>
              <span className="text-[12px] font-normal text-[var(--text-muted)] mt-1 block">This month</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {/* Most Common Flags */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3">
              <h3 className="text-[16px] font-semibold text-[var(--text)]">Most Common Compliance Flags</h3>
              <div className="space-y-2">
                {[
                  { name: 'Subjective words (e.g. difficult, stubborn)', count: 48, pct: 40, col: 'bg-[var(--green-700)]' },
                  { name: 'Missing exact timestamp on medication', count: 36, pct: 30, col: 'bg-[var(--amber)]' },
                  { name: 'Vague task description (e.g. normal stuff)', count: 28, pct: 23, col: 'bg-[var(--amber)]' },
                  { name: 'Service goal not mentioned', count: 14, pct: 12, col: 'bg-stone-500' },
                  { name: 'Safety or restraint indicators', count: 9, pct: 7, col: 'bg-[var(--red)]' },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-[12px] text-[var(--text)] mb-1">
                      <span>{item.name}</span>
                      <b>{item.count} notes</b>
                    </div>
                    <div className="h-2 w-full bg-[var(--border)] rounded-full overflow-hidden">
                      <div style={{ width: `${item.pct * 2}%` }} className={`h-full ${item.col} rounded-full`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coaching recommendations */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3">
              <h3 className="text-[16px] font-semibold text-[var(--text)]">Caregivers Recommended for Coaching</h3>
              <div className="divide-y divide-[var(--border)] text-[12px]">
                {[
                  { name: 'Luis Ruiz', flags: '12 flags (vague tasks, HMA time)', program: 'HMA' },
                  { name: 'Rosa Vega', flags: '8 flags (subjective words, refusal)', program: 'IHSS' },
                  { name: 'Karen Brandt', flags: '6 flags (EVV overtime, goal link)', program: 'IHSS' },
                  { name: 'Grace Park', flags: '5 flags (behavioral detail)', program: 'HCBS' },
                ].map((cg, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[14px] text-[var(--text)]">{cg.name}</span>
                      <span className="text-[12px] text-[var(--text-muted)] block">{cg.flags} · {cg.program}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast(`Enrolled ${cg.name} in documentation coaching course`)}
                      className="min-h-[32px] px-3 rounded-[6px] border border-[var(--border)] font-semibold text-[12px] hover:bg-[#F0F2ED]"
                    >
                      Assign Course →
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-[var(--text-muted)] italic pt-2">
                Note: Accuracy is measured with continuous human review; targets are set during discovery.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB 4: RULES TAB (RULES LIBRARY & PROGRAM SETTINGS) */}
      {/* ========================================================================= */}
      {activeTab === 'rules' && (
        <div className="space-y-5">
          {/* Collapsible Program Settings */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-semibold text-[var(--text)]">Program Note Settings</h3>
                <p className="text-[12px] text-[var(--text-muted)]">
                  If the state waives note requirements for a program, toggle it here to bypass note auditing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProgramSettings(!showProgramSettings)}
                className="text-[12px] font-semibold text-[var(--green-700)] underline"
              >
                {showProgramSettings ? 'Hide settings' : 'Show program settings'}
              </button>
            </div>

            {showProgramSettings && (
              <div className="pt-2 border-t border-[var(--border)] space-y-3 animate-fadeIn">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {Object.entries(programRequirements).map(([prog, req]) => (
                    <div key={prog} className="p-3 bg-[var(--bg)] border border-[var(--border)] rounded-[8px] flex items-center justify-between">
                      <span className="font-semibold text-[14px] text-[var(--text)]">{prog}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setProgramRequirements({ ...programRequirements, [prog]: !req });
                          showToast(`${prog} updated to ${!req ? 'Mandatory' : 'Optional'}`);
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${req ? 'bg-[var(--green-700)] text-white' : 'bg-stone-300 text-stone-700'
                          }`}
                      >
                        {req ? 'Mandatory' : 'Optional'}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Audio Policy Setting */}
                <div className="p-3 bg-[var(--bg)] border border-[var(--border)] rounded-[8px] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[13px] text-[var(--text)] block">Audio Retention Policy</span>
                    <span className="text-[12px] text-[var(--text-muted)]">Default: 90 days retention for audit defense.</span>
                  </div>
                  <label className="flex items-center gap-2 text-[12px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deleteAudioAfterApproval}
                      onChange={() => setDeleteAudioAfterApproval(!deleteAudioAfterApproval)}
                      className="h-4 w-4 rounded text-[var(--green-700)] focus:ring-[var(--green-700)]"
                    />
                    <span>Delete audio immediately after approval</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Rules Table */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[var(--bg)] border-b border-[var(--border)] text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)]">
                <tr>
                  <th className="py-3 px-4">Rule Name</th>
                  <th className="py-3 px-4">Source & Regulation</th>
                  <th className="py-3 px-4">Applies To</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Example (Bad → Good)</th>
                  <th className="py-3 px-4 text-center">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[12px]">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-[#F0F2ED]/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[14px] text-[var(--text)]">{rule.name}</div>
                      <div className="text-[12px] text-[var(--text-muted)]">{rule.description}</div>
                    </td>
                    <td className="py-3 px-4 font-normal text-[var(--text)]">{rule.source}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {rule.appliesTo.map((p) => (
                          <span key={p} className="px-1.5 py-0.2 rounded bg-[var(--bg)] border border-[var(--border)] text-[11px]">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[11px] ${rule.severity === 'High' ? 'bg-red-100 text-red-900' : 'bg-amber-100 text-amber-900'
                          }`}
                      >
                        {rule.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-red-900 line-through truncate">{rule.exampleBad}</div>
                      <div className="text-emerald-900 font-medium truncate">{rule.exampleGood}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={rule.isActive}
                        onChange={() => {
                          setRules(rules.map((r) => (r.id === rule.id ? { ...r, isActive: !r.isActive } : r)));
                          showToast(`Rule updated`);
                        }}
                        className="h-4 w-4 rounded text-[var(--green-700)] focus:ring-[var(--green-700)]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. COLLAPSIBLE "DETAILS" DRAWER (4 TABS) */}
      {/* ========================================================================= */}
      {showDetailsDrawer && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-fadeIn"
          onClick={() => setShowDetailsDrawer(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Note Details Drawer"
            className="w-full max-w-md bg-[var(--card)] h-full overflow-y-auto shadow-2xl flex flex-col animate-slideInRight"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg)]">
              <div>
                <h3 className="text-[16px] font-bold text-[var(--text)]">Note Details</h3>
                <span className="text-[12px] text-[var(--text-muted)]">
                  {deIdentify(currentNote.clientName)} · {currentNote.visitDate}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailsDrawer(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                ✕
              </button>
            </div>

            {/* 4 Tabs */}
            <div className="grid grid-cols-4 border-b border-[var(--border)] bg-[var(--card)] text-[12px] font-semibold text-center">
              {[
                { id: 'summary', label: 'Summary' },
                { id: 'rules', label: 'Rules' },
                { id: 'client', label: 'Client' },
                { id: 'history', label: 'History' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDetailsTab(t.id as typeof detailsTab)}
                  className={`py-2.5 transition border-b-2 ${detailsTab === t.id
                      ? 'border-[var(--green-700)] text-[var(--green-700)]'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4 text-[12px]">
              {detailsTab === 'summary' && (
                <div className="space-y-3">
                  <div className="p-3 bg-[var(--bg)] rounded-[8px] border border-[var(--border)] space-y-1">
                    <span className="font-semibold text-[13px] block">Checklist for {currentNote.program}:</span>
                    <div className="space-y-1 text-stone-700">
                      <div>✓ Verified caregiver identity & GPS clock-in</div>
                      <div>✓ Authorized care plan tasks documented</div>
                      <div>{currentNote.flags.length === 0 ? '✓' : '⚠️'} Objective non-judgmental wording</div>
                    </div>
                  </div>
                </div>
              )}

              {detailsTab === 'rules' && (
                <div className="space-y-2">
                  <span className="font-semibold text-[13px] block">Triggered Rules on this Note:</span>
                  {currentNote.flags.length === 0 ? (
                    <p className="text-emerald-800">No rule violations detected.</p>
                  ) : (
                    currentNote.flags.map((f, i) => (
                      <div key={i} className="p-2.5 bg-[var(--bg)] rounded border border-[var(--border)] space-y-1">
                        <span className="font-bold text-[var(--text)] block">{f.ruleName}</span>
                        <p className="text-[12px] text-[var(--text-muted)]">{f.plainWhy}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {detailsTab === 'client' && (
                <div className="space-y-3">
                  <span className="font-semibold text-[13px] block">Client History & Care Plan:</span>
                  <div className="p-2.5 bg-[var(--bg)] rounded border border-[var(--border)]">
                    Authorized: {currentNote.clientContext.authorizedHours}
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase block mb-1">
                      Last 3 Submitted Notes (Check for Repeated Phrases):
                    </span>
                    <div className="space-y-1.5 text-stone-700">
                      {currentNote.clientContext.lastThreeNotes.map((n, i) => (
                        <div key={i} className="p-2 bg-[var(--bg)] rounded border border-[var(--border)]">
                          {n}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {detailsTab === 'history' && (
                <div className="space-y-2">
                  <span className="font-semibold text-[13px] block">Version History & Audit Log:</span>
                  <div className="space-y-2 border-l-2 border-[var(--green-700)] pl-3">
                    {currentNote.timeline.map((item, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <span className="font-semibold text-[var(--text)] block">{item.title}</span>
                        <span className="text-[11px] text-[var(--text-muted)] block">
                          {item.actor} · {item.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. ONE MERGED ASSISTANT: "LiliSare Assistant" */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setShowAssistant(!showAssistant)}
          className="h-12 px-4 rounded-full bg-[var(--green-700)] text-white font-semibold text-[14px] shadow-xl hover:bg-[var(--green-900)] transition flex items-center gap-2 border-2 border-white focus:outline-none focus:ring-4 focus:ring-[var(--green-700)]/40"
        >
          <span className="text-lg">💬</span>
          <span>LiliSare Assistant</span>
        </button>

        {showAssistant && (
          <div className="absolute right-0 bottom-16 w-84 sm:w-96 bg-[var(--card)] border border-[var(--border)] rounded-[12px] shadow-2xl p-4 space-y-3 animate-slideInRight text-[12px] flex flex-col h-[520px]">
            {/* Header with Context Chip */}
            <div className="border-b border-[var(--border)] pb-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--green-700)] animate-pulse" />
                  <span className="font-bold text-[14px] text-[var(--text)]">LiliSare Assistant</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAssistantMessages([])}
                    className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text)]"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAssistant(false)}
                    className="text-[var(--text-muted)] hover:text-[var(--text)]"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Context Chip */}
              <div className="p-1.5 bg-[var(--green-100)] rounded text-[11px] text-[var(--green-900)] font-medium truncate">
                Discussing: {deIdentify(currentNote.caregiverName)} · {deIdentify(currentNote.clientName)} · {currentNote.visitDate}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {assistantMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-[8px] leading-relaxed ${m.sender === 'user'
                      ? 'bg-[var(--green-700)] text-white ml-6 text-right'
                      : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] mr-4 space-y-1.5'
                    }`}
                >
                  <div>{m.text}</div>
                  {m.source && (
                    <div className="text-[10px] text-[var(--text-muted)] italic">
                      Source: {m.source}
                    </div>
                  )}
                  {m.actionButton && (
                    <button
                      type="button"
                      onClick={() => handleAssistantAction(m.actionButton!.actionId)}
                      className="mt-1 px-3 py-1 rounded bg-[var(--green-700)] text-white font-semibold text-[11px] block hover:bg-[var(--green-900)] shadow-xs"
                    >
                      [{m.actionButton.label}]
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* 4 Starting Prompt Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-[var(--border)]">
              {[
                'Why was this flagged?',
                "Summarize this client's week",
                'Find similar notes',
                'Draft a message to the caregiver',
              ].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => sendAssistantMessage(p)}
                  className="px-2 py-1 rounded bg-[var(--bg)] border border-[var(--border)] text-[11px] text-[var(--text)] whitespace-nowrap hover:bg-[#EEF0EB]"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && assistantInput.trim()) {
                    sendAssistantMessage(assistantInput.trim());
                  }
                }}
                placeholder="Ask about this note or rule…"
                className="flex-1 h-[34px] px-3 bg-[var(--card)] border border-[var(--border)] rounded-[6px] text-[12px] focus:outline-none focus:ring-1 focus:ring-[var(--green-700)]"
              />
              <button
                type="button"
                onClick={() => {
                  sendAssistantMessage('Read the next urgent note');
                }}
                className="h-[34px] px-2 bg-[var(--bg)] border border-[var(--border)] rounded-[6px] text-[12px]"
                title="Speak voice command"
              >
                🎙️
              </button>
              <button
                type="button"
                onClick={() => {
                  if (assistantInput.trim()) sendAssistantMessage(assistantInput.trim());
                }}
                className="h-[34px] px-3 bg-[var(--green-700)] text-white font-semibold rounded-[6px] text-[12px]"
              >
                Send
              </button>
            </div>

            <div className="text-[10px] text-[var(--text-muted)] text-center">
              Chat content is logged and protected under HIPAA compliance.
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 8. ASSISTANT ACTION CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {pendingConfirmAction && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-6 max-w-md w-full shadow-2xl space-y-3">
            <h3 className="text-[16px] font-bold text-[var(--text)]">Confirm Action</h3>
            <p className="text-[13px] text-stone-700 leading-relaxed">
              {pendingConfirmAction.description}
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setPendingConfirmAction(null)}
                className="min-h-[36px] px-3.5 rounded-[8px] border border-[var(--border)] text-[14px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  pendingConfirmAction.onConfirm();
                  setPendingConfirmAction(null);
                }}
                className="min-h-[36px] px-5 rounded-[8px] bg-[var(--green-700)] text-white text-[14px] font-semibold hover:bg-[var(--green-900)]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. 3-STEP HELP GUIDE MODAL */}
      {/* ========================================================================= */}
      {showHelpGuide && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <h3 className="text-[16px] font-bold text-[var(--text)]">
                3-Step Guide: {activeTab === 'review' ? 'Reviewing Notes' : activeTab === 'new-note' ? 'Creating Notes' : 'Quality & Rules'}
              </h3>
              <button
                type="button"
                onClick={() => setShowHelpGuide(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-[13px] text-stone-800">
              {activeTab === 'review' && (
                <>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[var(--green-100)] text-[var(--green-700)] font-bold flex items-center justify-center shrink-0">1</span>
                    <div>
                      <b>Read:</b> Review what the caregiver submitted. Tap highlighted phrases to see plain-language explanations.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[var(--green-100)] text-[var(--green-700)] font-bold flex items-center justify-center shrink-0">2</span>
                    <div>
                      <b>Fix:</b> Look at the suggested version with amber blanks. Expand the questions to ask the caregiver for missing details.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[var(--green-100)] text-[var(--green-700)] font-bold flex items-center justify-center shrink-0">3</span>
                    <div>
                      <b>Decide:</b> Tap "Send to caregiver" to send questions, or "Approve note" once all facts are verified.
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'new-note' && (
                <>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[var(--green-100)] text-[var(--green-700)] font-bold flex items-center justify-center shrink-0">1</span>
                    <div><b>Pick client and visit:</b> Choose from your verified caseload.</div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[var(--green-100)] text-[var(--green-700)] font-bold flex items-center justify-center shrink-0">2</span>
                    <div><b>Provide notes:</b> Speak via mic, upload voice recording, or paste rough notes.</div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[var(--green-100)] text-[var(--green-700)] font-bold flex items-center justify-center shrink-0">3</span>
                    <div><b>Format and submit:</b> AI organizes observations into tasks, client response, and follow-up.</div>
                  </div>
                </>
              )}

              {(activeTab === 'quality' || activeTab === 'rules') && (
                <>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[var(--green-100)] text-[var(--green-700)] font-bold flex items-center justify-center shrink-0">1</span>
                    <div><b>Review pass rate:</b> Track how notes comply with state Medicaid rules on the first pass.</div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[var(--green-100)] text-[var(--green-700)] font-bold flex items-center justify-center shrink-0">2</span>
                    <div><b>Identify coaching needs:</b> Assign 15-minute refresher courses to caregivers with recurring flags.</div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[var(--green-100)] text-[var(--green-700)] font-bold flex items-center justify-center shrink-0">3</span>
                    <div><b>Manage rules:</b> Update or toggle rules anytime state mandates evolve.</div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setShowHelpGuide(false)}
                className="min-h-[36px] px-4 rounded-[8px] bg-[var(--green-700)] text-white text-[13px] font-semibold"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. SESSION TIMEOUT AUTO-LOCK DEMO MODAL */}
      {/* ========================================================================= */}
      {showSessionTimeoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <span className="text-3xl block">🔒</span>
            <div>
              <h3 className="text-[16px] font-bold text-[var(--text)]">Session Auto-Locked</h3>
              <p className="text-[12px] text-[var(--text-muted)] mt-1">
                For HIPAA security, screen auto-locks after inactivity to protect client PHI.
              </p>
            </div>
            <input
              type="password"
              defaultValue="••••"
              className="w-full text-center h-[36px] border border-[var(--border)] rounded-[8px] tracking-widest text-[16px]"
            />
            <button
              type="button"
              onClick={() => {
                setShowSessionTimeoutModal(false);
                showToast('Session unlocked');
              }}
              className="w-full min-h-[36px] rounded-[8px] bg-[var(--green-700)] text-white font-semibold text-[14px]"
            >
              Resume Session
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. STATE CRITICAL INCIDENT REPORT MODAL */}
      {/* ========================================================================= */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--card)] border-2 border-[var(--red)] rounded-[12px] p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-[var(--border)] text-[var(--red)]">
              <span className="text-2xl">🚨</span>
              <div>
                <h3 className="text-[16px] font-bold">State Critical Incident Protocol</h3>
                <span className="text-[12px] text-red-900">Colorado Medicaid HCPF Gate</span>
              </div>
            </div>

            <p className="text-[13px] text-[var(--text)] leading-relaxed">
              You are escalating documentation containing potential physical force or coercion indicators.
              Neutral clinical rewording must <b>NEVER</b> obscure a potential safety event.
            </p>

            <div className="p-3 bg-red-50 border border-red-200 rounded-[8px] space-y-1.5 text-[12px] text-red-950">
              <div>✓ Incident file created: <b>INC-2026-1178</b></div>
              <div>✓ Notifying Clinical Supervisor: <b>Dana Whitfield, RN</b></div>
              <div>✓ Pre-populated Colorado HCPF Critical Incident draft</div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setShowIncidentModal(false)}
                className="min-h-[36px] px-3.5 rounded-[8px] border border-[var(--border)] text-[14px]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowIncidentModal(false);
                  showToast('Incident report submitted to state coordinator');
                }}
                className="min-h-[36px] px-4 rounded-[8px] bg-[var(--red)] text-white text-[14px] font-semibold"
              >
                Submit Incident Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
