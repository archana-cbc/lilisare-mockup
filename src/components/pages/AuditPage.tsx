'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { CL, CG, STAFF } from '@/data/mockData';

// Types
export interface FlagItem {
  phrase: string;
  ruleName: string;
  category: 'wording' | 'safety' | 'missing';
  plainWhy: string;
  plainFix: string;
  suggestedReplacement?: string;
  isUrgentSafety?: boolean;
}

export interface QuestionItem {
  id: string;
  question: string;
  answer?: string;
  isAnswered: boolean;
  voiceRecorded?: boolean;
}

export interface AttachmentItem {
  id: string;
  name: string;
  type: 'Wound/skin photo' | 'Incident' | 'Signed form' | 'Doctor\'s order' | 'Audio recording' | 'Other';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
}

export interface ClientVisitItem {
  id: string;
  date: string;
  time: string;
  caregiverName: string;
  evvStatus: 'Verified' | 'Exception';
  evvDetails: string;
  tasks: string[];
}

export interface NoteRecord {
  id: string;
  clientId: string;
  clientName: string;
  clientAge: number;
  clientDob: string;
  caregiverName: string;
  program: 'IHSS' | 'CFC' | 'HCBS' | 'IRSS' | 'CNA' | 'HMA' | 'Personal Care';
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

export interface ComplianceRule {
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

// 4 Canonical Sample Notes (incorporating vague, subjective, missing details, and safety-risk scenarios)
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
    evvDetails: 'Clock-in 8:02 AM · GPS Match (452 Elm St, Denver CO) · Verified',
    tasks: ['Meal Preparation', 'Morning Hygiene', 'Medication Reminder'],
    status: 'Urgent',
    isUrgentSafety: true,
    originalText:
      'Client was difficult and refused to eat breakfast. I made her eat anyway because she needs food before taking her morning blood pressure medication.',
    flags: [
      {
        phrase: 'difficult',
        ruleName: 'Objective language rule (10 CCR 2505-10 § 8.510)',
        category: 'wording',
        plainWhy: 'Words like "difficult" describe an emotional reaction rather than factual observation.',
        plainFix: 'Describe what the client did: "Client declined breakfast at 8:40 AM."',
        suggestedReplacement: 'declined offered meal',
      },
      {
        phrase: 'refused to eat breakfast',
        ruleName: 'Documenting client choices & nutrition',
        category: 'missing',
        plainWhy: 'State rules require writing down what specific food was offered and what alternatives were tried.',
        plainFix: 'Name the specific meal offered and how you followed up.',
        suggestedReplacement: 'declined oatmeal at 8:40 AM and was offered alternative fruit',
      },
      {
        phrase: 'made her eat anyway',
        ruleName: 'Safety escalation: possible physical force',
        category: 'safety',
        plainWhy: 'This sounds like physical force or insistence without consent. State rules require clinical supervisor review.',
        plainFix: 'Do not reword this. A clinical supervisor and RN must review the visit.',
        suggestedReplacement: 're-offered meal with verbal encouragement after 15 minutes',
        isUrgentSafety: true,
      },
    ],
    suggestedText:
      'Client declined oatmeal at 8:40 AM. Caregiver offered [add alternative offered] after 15 minutes; client accepted yogurt and sliced fruit. Morning hypertension medication was reminded per care plan at 9:05 AM with water.',
    placeholders: ['[add alternative offered]'],
    questions: [
      {
        id: 'q1',
        question: 'What specific food was offered when Marisol initially declined breakfast?',
        answer: 'Prepared hot oatmeal, but Marisol wanted yogurt with sliced bananas instead.',
        isAnswered: true,
        voiceRecorded: false,
      },
      {
        id: 'q2',
        question: 'Did you use any physical restraint or physical force when encouraging her to eat?',
        answer: 'No physical force whatsoever. I just placed the bowl near her and verbally encouraged her until she was ready.',
        isAnswered: true,
        voiceRecorded: true,
      },
      {
        id: 'q3',
        question: 'Was the morning blood pressure medication taken on schedule with water?',
        answer: 'Yes, taken at 9:05 AM with a full glass of water without issue.',
        isAnswered: true,
        voiceRecorded: false,
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
      { title: 'Note dictated and submitted via mobile app', actor: 'Rosa Vega', time: 'Nov 17 · 11:35 AM' },
      { title: 'Flagged for supervisor safety check', actor: 'System Rule R-02', time: 'Nov 17 · 11:36 AM', note: 'Safety escalation keywords detected' },
    ],
  },
  {
    id: 'NOTE-102',
    clientId: 'C-1007',
    clientName: 'Walter Hayes',
    clientAge: 74,
    clientDob: 'Mar 10, 1952',
    caregiverName: 'Beth Hayes',
    program: 'CFC',
    visitDate: 'Nov 17, 2026',
    visitTime: '9:00 AM – 12:00 PM',
    evvStatus: 'Verified',
    evvDetails: 'Clock-in 9:00 AM · Clock-out 12:01 PM · GPS Match · Verified',
    tasks: ['CFC Homemaking', 'Ambulation Supervision', 'Meal Preparation'],
    status: 'Needs fix',
    isUrgentSafety: false,
    originalText: 'Did good today, took care of everything, normal routine and walked around the house. No complaints.',
    flags: [
      {
        phrase: 'Did good today',
        ruleName: 'Objective language rule (10 CCR 2505-10 § 8.510)',
        category: 'wording',
        plainWhy: '"Did good" is vague and subjective. State auditors require observable descriptions of client functional status.',
        plainFix: 'State specific observations: "Client ambulated with single-point cane without reports of pain."',
        suggestedReplacement: 'Client reported feeling well and in good spirits',
      },
      {
        phrase: 'took care of everything',
        ruleName: 'Clear task documentation',
        category: 'missing',
        plainWhy: 'Does not substantiate which authorized care tasks were completed during the 3-hour visit.',
        plainFix: 'List tasks: assisted with bed linen change, cleaned bathroom fixtures, prepared lunch.',
        suggestedReplacement: 'completed scheduled CFC homemaking and personal care tasks per plan',
      },
      {
        phrase: 'normal routine',
        ruleName: 'Routine care verification',
        category: 'wording',
        plainWhy: '"Normal routine" does not prove individual care was delivered according to the approved service plan.',
        plainFix: 'Specify client mobility exercises and meal items.',
        suggestedReplacement: 'conducted routine 20-minute indoor mobility exercise',
      },
    ],
    suggestedText:
      'Arrived at 9:00 AM. Assisted client with scheduled CFC homemaking tasks, including bed linen change, kitchen sanitization, and laundry assistance. Supervised client during [add duration] indoor mobility exercise using single-point cane. Client demonstrated steady gait with zero loss of balance.',
    placeholders: ['[add duration]'],
    questions: [
      {
        id: 'q1',
        question: 'How long did Walter walk around the house, and did he use his prescribed cane?',
        answer: 'Walked for 20 minutes in hallway using cane. No staggering.',
        isAnswered: true,
        voiceRecorded: false,
      },
      {
        id: 'q2',
        question: 'Which specific homemaking tasks were completed during this 3-hour shift?',
        answer: 'Washed and folded two loads of laundry, disinfected kitchen counters, and made lunch.',
        isAnswered: true,
        voiceRecorded: false,
      },
    ],
    attachments: [],
    assignedReviewer: 'Maya R.',
    inCaseload: true,
    clientContext: {
      authorizedHours: '18.0 hrs/week · CFC Community First Choice',
      carePlanGoals: [
        'Safe indoor ambulation with single-point cane',
        'Independent living environment maintenance via homemaking assistance',
        'Hydration and nutritious meal prep',
      ],
      lastThreeNotes: [
        'Nov 15: Cleaned kitchen and assisted with shower transfer. Walter walked 15 min.',
        'Nov 12: Prepared chicken soup for lunch. Assisted with light housekeeping.',
        'Nov 10: Client in cheerful spirits. Practiced cane ambulation indoors.',
      ],
    },
    timeline: [
      { title: 'Note submitted', actor: 'Beth Hayes', time: 'Nov 17 · 12:05 PM' },
      { title: 'Automatic check flagged 3 vague phrases', actor: 'System Rule R-01', time: 'Nov 17 · 12:06 PM' },
    ],
  },
  {
    id: 'NOTE-103',
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
    tasks: ['Delegated G-Tube Care', 'Medication Administration', 'Bed Bath'],
    status: 'Urgent',
    isUrgentSafety: true,
    originalText:
      'Client refused to let me help transfer, so I forced her to sit down in the chair and she fell against the wall, minor bruise on left elbow. Gave midday meds.',
    flags: [
      {
        phrase: 'forced her to sit down',
        ruleName: 'Mandatory Safety Rule: Physical force or restraint',
        category: 'safety',
        plainWhy: 'Physical force or non-consensual physical handling is strictly prohibited. State Medicaid critical incident investigation required.',
        plainFix: 'Must NOT be rewritten. Requires immediate supervisor intervention.',
        isUrgentSafety: true,
      },
      {
        phrase: 'she fell against the wall, minor bruise',
        ruleName: 'Mandatory Incident Escalation: Client Fall with Injury',
        category: 'safety',
        plainWhy: 'Any fall resulting in bruising, pain, or skin compromise requires a formal 24-hour state incident report.',
        plainFix: 'Escalate to RN Supervisor immediately. Complete incident report form.',
        isUrgentSafety: true,
      },
      {
        phrase: 'Gave midday meds',
        ruleName: 'Exact times for nursing delegation',
        category: 'missing',
        plainWhy: 'HMA delegated medications require exact time, route (G-tube), and water flush volume.',
        plainFix: 'Record exact time and water flush ml.',
      },
    ],
    suggestedText: '', // Empty because safety escalation blocks rewrite!
    placeholders: [],
    questions: [],
    attachments: [
      {
        id: 'att-bruise',
        name: 'Elbow_Bruise_Photo.jpg',
        type: 'Wound/skin photo',
        size: '1.8 MB',
        uploadedBy: 'Luis Ruiz',
        uploadedAt: 'Nov 17 · 1:04 PM',
      },
    ],
    assignedReviewer: 'Maya R.',
    inCaseload: true,
    clientContext: {
      authorizedHours: '21.0 hrs/week · HMA Skilled Nursing Delegation',
      carePlanGoals: [
        'Gastrostomy tube flushes and scheduled medication delivery',
        'Daily skin inspection of G-tube insertion site and pressure areas',
        'Bed bath and two-person mechanical transfer assistance',
      ],
      lastThreeNotes: [
        'Nov 16: Administered midday meds at 11:30 AM via G-tube. Flushed with 30ml water. Dressing clean.',
        'Nov 15: Morning feed administered. Stoma clean, no redness. Repositioned safely.',
        'Nov 14: Meds given at 11:15 AM. Client tolerated bath and transfer well.',
      ],
    },
    timeline: [
      { title: 'Note submitted', actor: 'Luis Ruiz', time: 'Nov 17 · 1:05 PM' },
      { title: 'CRITICAL SAFETY TRIGGER: Physical force & fall with injury detected', actor: 'System Rule R-02', time: 'Nov 17 · 1:05 PM' },
    ],
  },
  {
    id: 'NOTE-104',
    clientId: 'C-1002',
    clientName: 'Eli Brandt',
    clientAge: 19,
    clientDob: 'Aug 11, 2007',
    caregiverName: 'Karen Brandt',
    program: 'HCBS',
    visitDate: 'Nov 17, 2026',
    visitTime: '1:00 PM – 4:00 PM',
    evvStatus: 'Exception',
    evvDetails: 'Clock-out was 42 min after scheduled shift (requires reason code)',
    tasks: ['Community Integration', 'Life Skills', 'Medication Reminder'],
    status: 'Needs fix',
    isUrgentSafety: false,
    originalText: 'Fed client lunch and walked around, gave morning pills and did exercises.',
    flags: [
      {
        phrase: 'lunch',
        ruleName: 'Specific nutritional documentation',
        category: 'missing',
        plainWhy: 'State rules require identifying what meal was served to confirm nutritional adequacy.',
        plainFix: 'Name the specific food items prepared.',
        suggestedReplacement: 'lunch of [add meal items]',
      },
      {
        phrase: 'walked around',
        ruleName: 'Community goal tracking',
        category: 'missing',
        plainWhy: 'Specify location and duration to demonstrate care plan community integration goal.',
        plainFix: 'Include duration and location.',
        suggestedReplacement: 'supervised community walk for [add duration]',
      },
      {
        phrase: 'morning pills',
        ruleName: 'Specific medication identification',
        category: 'missing',
        plainWhy: 'Name of medication and scheduled time must be documented.',
        plainFix: 'Specify medication name and administration time.',
        suggestedReplacement: 'prompted scheduled [add medication name] at [add exact time]',
      },
    ],
    suggestedText:
      'Assisted Eli with lunch ([add meal items]) at [add lunch time]. Supervised community mobility walk for [add duration] around the neighborhood per community integration goal. Prompted scheduled medication ([add medication name]) at [add exact time] with water.',
    placeholders: ['[add meal items]', '[add lunch time]', '[add duration]', '[add medication name]', '[add exact time]'],
    questions: [
      {
        id: 'q1',
        question: 'What specific food was prepared for Eli\'s lunch?',
        answer: 'Turkey and avocado sandwich on wheat with sliced cantaloupe and milk.',
        isAnswered: true,
        voiceRecorded: false,
      },
      {
        id: 'q2',
        question: 'How long did you walk outside and where did you go?',
        answer: 'Walked for 35 minutes along the greenway trail.',
        isAnswered: true,
        voiceRecorded: true,
      },
      {
        id: 'q3',
        question: 'Which specific medication was prompted and at what exact time?',
        answer: 'Levothyroxine 50mcg at 1:15 PM with water.',
        isAnswered: true,
        voiceRecorded: false,
      },
    ],
    attachments: [
      {
        id: 'att-goal',
        name: 'Community_Goal_Tracking_Form.pdf',
        type: 'Signed form',
        size: '240 KB',
        uploadedBy: 'Karen Brandt',
        uploadedAt: 'Nov 17 · 4:50 PM',
      },
    ],
    assignedReviewer: 'Maya R.',
    inCaseload: true,
    clientContext: {
      authorizedHours: '32.0 hrs/week · HCBS Supported Living',
      carePlanGoals: [
        'Community safety awareness & neighborhood ambulation',
        'Money handling and shopping skills',
        'Nutrition and scheduled medication prompting',
      ],
      lastThreeNotes: [
        'Nov 16: Outing to King Soopers. Eli selected 4 items independently with verbal prompts.',
        'Nov 14: Assisted Eli with handwashing and snack prep. Worked on vocabulary flashcards.',
        'Nov 12: Supervised safety during afternoon park outing. Positive mood throughout.',
      ],
    },
    timeline: [
      { title: 'Note submitted', actor: 'Karen Brandt', time: 'Nov 17 · 4:45 PM' },
      { title: 'Automated check flagged 3 missing details', actor: 'System Rule R-01', time: 'Nov 17 · 4:46 PM' },
    ],
  },
];

// Initial Rules for Rules Tab
const INITIAL_RULES: ComplianceRule[] = [
  {
    id: 'R-01',
    name: 'Objective facts only (no emotional or judgmental words)',
    description: 'Requires factual, observable descriptions rather than characterizations (e.g. difficult, stubborn, crazy).',
    appliesTo: ['IHSS', 'CFC', 'HCBS', 'IRSS', 'HMA', 'Personal Care'],
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

  // Top Tabs: 'coach' (renamed from 'review') | 'new-note' | 'quality' | 'rules'
  const [activeTab, setActiveTab] = useState<'coach' | 'new-note' | 'quality' | 'rules'>('coach');

  // Notes state
  const [notes, setNotes] = useState<NoteRecord[]>(INITIAL_NOTES);
  const [selectedNoteId, setSelectedNoteId] = useState<string>('NOTE-101');

  // Column 1 Filters
  const [clientSearch, setClientSearch] = useState('');
  const [notesAttentionFilter, setNotesAttentionFilter] = useState<'All' | 'Needs fix' | 'Urgent' | 'Waiting on caregiver' | 'Approved'>('All');
  const [caseloadOnly, setCaseloadOnly] = useState(true);

  // Column 2 Note Input Area State
  const [noteInputTab, setNoteInputTab] = useState<'caregiver' | 'paste' | 'upload'>('caregiver');
  const [currentCaregiverText, setCurrentCaregiverText] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; transcript: string } | null>(null);
  const [isDictating, setIsDictating] = useState(false);
  const [activeHighlightPopover, setActiveHighlightPopover] = useState<FlagItem | null>(null);

  // Column 3 Refinement Toolbar & State
  const [refineFormat, setRefineFormat] = useState<'narrative' | 'soap' | 'bullets' | 'state'>('narrative');
  const [refineLength, setRefineLength] = useState<'short' | 'standard' | 'detailed'>('standard');
  const [refineProgram, setRefineProgram] = useState<'IHSS' | 'CFC' | 'HCBS' | 'IRSS' | 'CNA' | 'HMA' | 'Personal Care'>('IHSS');
  const [refineLanguage, setRefineLanguage] = useState<'en' | 'es'>('en');
  const [includeOptions, setIncludeOptions] = useState({
    times: true,
    response: true,
    tasks: true,
    followUp: true,
  });
  const [isRefining, setIsRefining] = useState(false);
  const [refineProgressText, setRefineProgressText] = useState('Checking rules… formatting…');
  const [diffView, setDiffView] = useState<'clean' | 'diff'>('clean');
  const [editableRefinedText, setEditableRefinedText] = useState('');
  const [isEditingRefinedManually, setIsEditingRefinedManually] = useState(false);
  const [amberBlanks, setAmberBlanks] = useState<Record<string, string>>({});
  const [showQuestions, setShowQuestions] = useState(true);
  const [questionsAnswerState, setQuestionsAnswerState] = useState<Record<string, string>>({});
  const [showMoreActions, setShowMoreActions] = useState(false);

  // Supervisor Safety Override state
  const [safetyOverrideDismissed, setSafetyOverrideDismissed] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState('Critical - Safety Escalation');

  // Details Drawer (Right edge collapsible)
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [detailsDrawerTab, setDetailsDrawerTab] = useState<'rules' | 'context' | 'history' | 'audit'>('rules');

  // Responsive Stepper for Small Screens (1 -> 2 -> 3)
  const [responsiveStep, setResponsiveStep] = useState<1 | 2 | 3>(1);

  // Floating Assistant Chat State
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
      text: 'Hello Maya! I am scoped to this visit note. I can help refine wording, verify Medicaid rules, or prepare state incident documentation.',
    },
  ]);
  const [assistantInput, setAssistantInput] = useState('');
  const [pendingConfirmAction, setPendingConfirmAction] = useState<{
    label: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  // Rules Tab state (preservation of Tab 4)
  const [rulesList, setRulesList] = useState<ComplianceRule[]>(INITIAL_RULES);
  const [showProgramSettings, setShowProgramSettings] = useState(false);
  const [programRequirements, setProgramRequirements] = useState<Record<string, boolean>>({
    IHSS: true,
    CFC: true,
    HCBS: true,
    IRSS: true,
    HMA: true,
  });

  // New Note Tab State (preservation of Tab 2)
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [wizardClientId, setWizardClientId] = useState('C-1001');
  const [roughText, setRoughText] = useState('');
  const [formattedWizardText, setFormattedWizardText] = useState('');

  // Active Note computation
  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === selectedNoteId) || notes[0];
  }, [notes, selectedNoteId]);

  // Sync state whenever active note changes
  useEffect(() => {
    if (activeNote) {
      setCurrentCaregiverText(activeNote.originalText);
      setPastedText('');
      setUploadedFile(null);
      setSafetyOverrideDismissed(false);
      setRefineProgram(activeNote.program);
      setActiveHighlightPopover(null);
      setIsEditingRefinedManually(false);
      setAmberBlanks({});

      // Set initial answers for questions
      const initialAnswers: Record<string, string> = {};
      activeNote.questions.forEach((q) => {
        initialAnswers[q.id] = q.answer || '';
      });
      setQuestionsAnswerState(initialAnswers);
    }
  }, [selectedNoteId]);

  // Compute if note contains safety risk
  const isSafetyRiskDetected = useMemo(() => {
    if (safetyOverrideDismissed) return false;
    const textToCheck = (noteInputTab === 'caregiver' ? currentCaregiverText : pastedText || currentCaregiverText).toLowerCase();
    return (
      textToCheck.includes('made her eat') ||
      textToCheck.includes('forced') ||
      textToCheck.includes('fell against') ||
      textToCheck.includes('bruise') ||
      textToCheck.includes('injury') ||
      activeNote.isUrgentSafety
    );
  }, [currentCaregiverText, pastedText, noteInputTab, activeNote, safetyOverrideDismissed]);

  // Generate simulated refined text based on chosen parameters
  const generatedRefinedNote = useMemo(() => {
    if (isSafetyRiskDetected) {
      return '';
    }

    if (refineLanguage === 'es') {
      return 'A las 8:40 AM, la clienta declinó la avena ofrecida. La cuidadora esperó 15 minutos y brindó apoyo verbal con respeto, ofreciendo yogur y tostadas, los cuales la clienta aceptó favorablemente. Se brindó asistencia en higiene matutina y transferencias seguras con andador rodante. A las 9:05 AM, se recordó la toma de medicamento para la presión arterial con agua per plan de cuidado.';
    }

    if (activeNote.clientId === 'C-1007') {
      // Walter Hayes (CFC)
      if (refineFormat === 'soap') {
        return 'S: Client stated feeling well and ready for scheduled morning CFC care.\nO: Completed bed linen change and bathroom sanitization. Supervised 20-minute indoor mobility routine using prescribed cane.\nA: Client maintains functional indoor mobility and safe living environment.\nP: Continue scheduled CFC homemaking twice weekly.';
      }
      if (refineFormat === 'bullets') {
        return '• Tasks performed: Bed linen change, bathroom sanitization, meal preparation, mobility supervision.\n• Client response: Cooperative, engaged, completed 20 min indoor ambulation without fatigue.\n• Observations: Steady gait with cane, clear living area free of trip hazards.\n• Follow-up: Continue scheduled CFC homemaking routine.';
      }
      if (refineFormat === 'state') {
        return 'COLORADO CFC SERVICE DOCUMENTATION\nClient: Walter Hayes | Date: Nov 17, 2026 | Time: 9:00 AM – 12:00 PM\n1. Homemaking: Changed bed linens, disinfected kitchen surfaces, assisted with laundry.\n2. Mobility Supervision: Observed 20 min cane ambulation in hallway with steady gait.\n3. Client Response: Cooperative, alert, no discomfort reported.';
      }
      if (refineLength === 'short') {
        return 'Assisted Walter with morning personal care and light homemaking tasks. Client ambulated safely indoors for 20 minutes with single-point cane; no pain reported.';
      }
      if (refineLength === 'detailed') {
        return 'Visit conducted 9:00 AM – 12:00 PM per CFC authorization. Completed scheduled homemaking tasks: linen change, kitchen counter sanitization, and laundry assistance. Supervised client during mobility exercise: 20 minutes walking in hallway with single-point cane, maintaining steady gait. Checked pantry supplies and confirmed hydration. Client reported no discomfort.';
      }
      return 'Arrived at 9:00 AM. Assisted client with scheduled CFC homemaking and personal care tasks, including bed linen change and bathroom sanitization. Supervised client during 20-minute indoor mobility routine using prescribed cane. Client expressed satisfaction with care.';
    }

    if (activeNote.clientId === 'C-1002') {
      // Eli Brandt (HCBS / IHSS) with amber blanks
      const meal = amberBlanks['[add meal items]'] || questionsAnswerState['q1'] || '[add meal items]';
      const duration = amberBlanks['[add duration]'] || questionsAnswerState['q2'] || '[add duration]';
      const medName = amberBlanks['[add medication name]'] || questionsAnswerState['q3'] || '[add medication name]';
      const exactTime = amberBlanks['[add exact time]'] || '1:15 PM';

      if (refineFormat === 'soap') {
        return `S: Client engaged positively and participated in meal selection.\nO: Assisted with lunch (${meal}). Supervised community walk for ${duration} per integration goal. Prompted ${medName} at ${exactTime}.\nA: Good community tolerance and independent life skill participation.\nP: Continue daily community walk and scheduled medication prompting.`;
      }
      if (refineFormat === 'bullets') {
        return `• Tasks performed: Lunch preparation, community walk, medication prompting.\n• Meal & Nutrition: Provided ${meal}.\n• Community integration: Supervised walk for ${duration}.\n• Medication: Prompted ${medName} at ${exactTime} with water.`;
      }
      return `Assisted Eli with lunch (${meal}) per care plan schedule. Supervised community mobility walk for ${duration} in neighborhood per community integration goal. Prompted scheduled medication (${medName}) at ${exactTime} with water; client self-administered without difficulty.`;
    }

    // Default: Marisol Vega (IHSS)
    const alternative = amberBlanks['[add alternative offered]'] || (questionsAnswerState['q1'] ? 'yogurt with sliced bananas' : '[add alternative offered]');

    if (refineFormat === 'soap') {
      return `S: Client stated lack of appetite for oatmeal at 8:40 AM.\nO: Vital tasks completed: morning hygiene, safe transfers with rolling walker, meal preparation. Client accepted ${alternative} at 8:55 AM. Med reminder at 9:05 AM.\nA: Nutrition achieved with verbal encouragement; no physical prompting required.\nP: Continue offering alternative breakfast choices and remind morning medications at scheduled 9:00 AM window.`;
    }
    if (refineFormat === 'bullets') {
      return `• Tasks performed: Meal preparation, morning hygiene, transfer assistance with rolling walker, medication reminder.\n• Client response: Declined oatmeal at 8:40 AM; accepted ${alternative} at 8:55 AM upon verbal re-offering.\n• Observations: Ambulating safely with walker. Alert and oriented.\n• Follow-up: Report breakfast food preferences to case manager.`;
    }
    if (refineFormat === 'state') {
      return `COLORADO IHSS VISIT DOCUMENTATION\nClient: Marisol Vega | Date: Nov 17, 2026 | Time: 8:00 AM – 11:30 AM\n1. Attendant Care: Assisted with personal hygiene and rolling walker transfers.\n2. Nutrition: Client declined initial breakfast item at 8:40 AM; accepted ${alternative} at 8:55 AM.\n3. Medication Reminder: Prompted client for morning blood pressure medication at 9:05 AM per care plan.\n4. Client Status: Calm, ambulating safely.`;
    }
    if (refineLength === 'short') {
      return `Client declined breakfast at 8:40 AM. Caregiver offered ${alternative} after 15 minutes; client accepted. Morning blood pressure medication was reminded per care plan at 9:05 AM.`;
    }
    if (refineLength === 'detailed') {
      return `Client was awake and sitting in armchair at 8:02 AM. Caregiver prepared breakfast of oatmeal; client verbally declined at 8:40 AM. Caregiver implemented verbal encouragement techniques without physical prompting, re-offering alternative light options at 8:55 AM. Client accepted ${alternative}. Morning hypertension medication reminder provided at 9:05 AM; client self-administered with water. Assisted with oral hygiene and transfers to living room with rolling walker.`;
    }

    return `At 8:40 AM, client declined offered oatmeal. Caregiver waited 15 minutes and verbally encouraged client, offering ${alternative}, which client accepted. Assisted client with morning hygiene and transfer using rolling walker. At 9:05 AM, caregiver reminded client to take scheduled blood pressure medication per physician orders with water.`;
  }, [
    isSafetyRiskDetected,
    refineLanguage,
    activeNote.clientId,
    refineFormat,
    refineLength,
    amberBlanks,
    questionsAnswerState,
  ]);

  // Sync editable refined text whenever generated note changes
  useEffect(() => {
    setEditableRefinedText(generatedRefinedNote);
  }, [generatedRefinedNote]);

  // Handle "Refine Note" Action
  const handleTriggerRefine = () => {
    setIsRefining(true);
    setRefineProgressText('Checking state Medicaid rules… formatting note…');
    setTimeout(() => {
      setIsRefining(false);
      showToast('Note refined per Colorado Medicaid objective care standards.');
      // Add version history entry
      setNotes((prev) =>
        prev.map((n) =>
          n.id === activeNote.id
            ? {
                ...n,
                timeline: [
                  {
                    title: `AI Note Coach refined (${refineFormat}, ${refineLength})`,
                    actor: 'AI Care Note Coach',
                    time: 'Just now',
                    note: `Applied ${refineProgram} rules with zero invent-fact policy.`,
                  },
                  ...n.timeline,
                ],
              }
            : n
        )
      );
    }, 900);
  };

  // Replace a problem phrase directly
  const handleUseSuggestedWording = (flag: FlagItem) => {
    if (!flag.suggestedReplacement) return;
    setCurrentCaregiverText((prev) => prev.replace(flag.phrase, flag.suggestedReplacement!));
    setActiveHighlightPopover(null);
    showToast(`Replaced "${flag.phrase}" with compliant phrasing.`);
  };

  // Assistant Question/Command Runner
  const sendAssistantMessage = (userPrompt: string) => {
    const newMsgList = [...assistantMessages, { sender: 'user' as const, text: userPrompt }];
    setAssistantMessages(newMsgList);
    setAssistantInput('');

    setTimeout(() => {
      const q = userPrompt.toLowerCase();
      if (q.includes('why') || q.includes('flag') || q.includes('rule')) {
        setAssistantMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: `Under Colorado rule 10 CCR 2505-10 § 8.510, notes cannot include subjective words like "difficult" or "acting up". State auditors require observable descriptions. In addition, physical force language must be reviewed by a clinical supervisor.`,
            source: 'Rule R-01 & R-02 (Colorado Medicaid)',
            actionButton: { label: '✨ Refine note now', actionId: 'refine' },
          },
        ]);
      } else if (q.includes('incident') || q.includes('safety') || q.includes('fall')) {
        setAssistantMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: `Potential reportable incident identified. Per state guidelines, critical incidents including physical intervention or client injury require a 24-hour notification to HCPF.`,
            source: 'State Medicaid Critical Incident § 8.500',
            actionButton: { label: '🚨 Open incident report', actionId: 'incident' },
          },
        ]);
      } else {
        setAssistantMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: `Scoped to ${activeNote.clientName} (Visit ${activeNote.visitDate}). The care plan authorizes ${activeNote.clientContext.authorizedHours}. Note has ${activeNote.flags.length} flagged compliance items.`,
            source: 'Verified Caseload Database',
            actionButton: { label: '📤 Send to caregiver for approval', actionId: 'send_cg' },
          },
        ]);
      }
    }, 700);
  };

  const handleAssistantAction = (actionId: string) => {
    if (actionId === 'refine') {
      setPendingConfirmAction({
        label: 'Run AI Note Refinement',
        description: 'Refine caregiver note into compliant documentation using Colorado Medicaid standards.',
        onConfirm: () => {
          handleTriggerRefine();
          setPendingConfirmAction(null);
        },
      });
    } else if (actionId === 'incident') {
      setPendingConfirmAction({
        label: 'Open Critical Incident Report',
        description: `Create mandatory 24-hour HCPF incident case for ${activeNote.clientName}.`,
        onConfirm: () => {
          setShowIncidentModal(true);
          setPendingConfirmAction(null);
        },
      });
    } else if (actionId === 'send_cg') {
      setPendingConfirmAction({
        label: 'Send Refined Draft to Caregiver',
        description: `Dispatch SMS/App push to ${activeNote.caregiverName} requesting digital confirmation.`,
        onConfirm: () => {
          showToast(`Refined draft sent to ${activeNote.caregiverName} for mobile confirmation.`);
          setPendingConfirmAction(null);
        },
      });
    }
  };

  // Filtered clients for Column 1
  const filteredClients = useMemo(() => {
    return notes.filter((n) => {
      if (caseloadOnly && !n.inCaseload) return false;
      if (notesAttentionFilter !== 'All' && n.status !== notesAttentionFilter) return false;
      if (clientSearch.trim()) {
        const q = clientSearch.toLowerCase();
        return n.clientName.toLowerCase().includes(q) || n.caregiverName.toLowerCase().includes(q) || n.program.toLowerCase().includes(q);
      }
      return true;
    });
  }, [notes, caseloadOnly, notesAttentionFilter, clientSearch]);

  return (
    <div className="space-y-4">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & TAB BAR */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" className="text-[12px] font-normal text-[var(--text-muted)] flex items-center gap-1.5">
          <span className="hover:text-[var(--text)] cursor-pointer" onClick={() => setActiveTab('coach')}>
            Care Notes
          </span>
          <span>›</span>
          <span className="font-semibold text-[var(--text)] capitalize">
            {activeTab === 'coach' ? 'Note Coach' : activeTab === 'new-note' ? 'New Note' : activeTab === 'quality' ? 'Quality Reports' : 'Rules'}
          </span>
          {activeTab === 'coach' && activeNote && (
            <>
              <span>›</span>
              <span className="text-[var(--text)] font-semibold truncate max-w-[200px]">
                {deIdentify(activeNote.clientName)}
              </span>
            </>
          )}
        </nav>

        {/* Title, Subtitle & 4 Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[28px] font-bold text-[var(--text)] leading-tight">Care Notes</h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--green-100)] text-[var(--green-900)] border border-[#CDE0C6]">
                AI Workbench
              </span>
            </div>
            <p className="text-[14px] font-normal text-[var(--text-muted)] mt-0.5">
              {activeTab === 'coach' && 'AI-assisted care note refinement, Medicaid rule compliance, and caregiver coaching.'}
              {activeTab === 'new-note' && 'Write or dictate a note for a client.'}
              {activeTab === 'quality' && 'How well notes are meeting state compliance rules.'}
              {activeTab === 'rules' && 'What the system checks for across state programs.'}
            </p>
          </div>

          {/* 4 Simple Tabs */}
          <div className="flex items-center bg-[var(--card)] border border-[var(--border)] rounded-[8px] p-0.5 h-[36px] shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('coach')}
              className={`h-[30px] px-3.5 rounded-[6px] text-[12px] font-semibold transition ${
                activeTab === 'coach'
                  ? 'bg-[var(--green-700)] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              Note Coach
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('new-note')}
              className={`h-[30px] px-3.5 rounded-[6px] text-[12px] font-semibold transition ${
                activeTab === 'new-note'
                  ? 'bg-[var(--green-700)] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              New Note
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('quality')}
              className={`h-[30px] px-3.5 rounded-[6px] text-[12px] font-semibold transition ${
                activeTab === 'quality'
                  ? 'bg-[var(--green-700)] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              Quality Reports
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className={`h-[30px] px-3.5 rounded-[6px] text-[12px] font-semibold transition ${
                activeTab === 'rules'
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
      {/* 2. TAB 1: AI CARE NOTE COACH WORKBENCH (3-COLUMN LAYOUT) */}
      {/* ========================================================================= */}
      {activeTab === 'coach' && (
        <div className="space-y-3">
          
          {/* Top Control Bar with Responsive Stepper & Details Drawer Button */}
          <div className="flex items-center justify-between gap-3 bg-[var(--card)] border border-[var(--border)] rounded-[10px] p-2.5 shadow-2xs">
            {/* Mobile / Tablet Step Switcher */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <span className="text-[11px] font-semibold text-[var(--text-muted)]">Step:</span>
              <button
                type="button"
                onClick={() => setResponsiveStep(1)}
                className={`px-2 py-1 rounded text-[11px] font-semibold ${
                  responsiveStep === 1 ? 'bg-[var(--green-700)] text-white' : 'bg-stone-100 text-stone-700'
                }`}
              >
                1. Client
              </button>
              <button
                type="button"
                onClick={() => setResponsiveStep(2)}
                className={`px-2 py-1 rounded text-[11px] font-semibold ${
                  responsiveStep === 2 ? 'bg-[var(--green-700)] text-white' : 'bg-stone-100 text-stone-700'
                }`}
              >
                2. Note & Visit
              </button>
              <button
                type="button"
                onClick={() => setResponsiveStep(3)}
                className={`px-2 py-1 rounded text-[11px] font-semibold ${
                  responsiveStep === 3 ? 'bg-[var(--green-700)] text-white' : 'bg-stone-100 text-stone-700'
                }`}
              >
                3. Refined
              </button>
            </div>

            {/* Desktop Workbench Label */}
            <div className="hidden lg:flex items-center gap-2 text-[12px] text-[var(--text-muted)]">
              <span className="w-2 h-2 rounded-full bg-[var(--green-700)]"></span>
              <span className="font-semibold text-[var(--text)]">AI Note Coach Workbench</span>
              <span>· Three-column flow from left to right</span>
            </div>

            {/* Right Buttons: Details Drawer & Assistant Launcher */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDetailsDrawer(true)}
                className="min-h-[30px] px-3 rounded-[6px] border border-[var(--border)] bg-white text-[12px] font-semibold text-[var(--text)] hover:bg-[#F0F2ED] transition flex items-center gap-1.5 shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 text-[var(--green-700)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Details & Audit</span>
              </button>
            </div>
          </div>

          {/* 3 COLUMNS CONTAINER */}
          <div className="flex flex-col lg:flex-row gap-4 items-start">
            
            {/* ------------------------------------------------------------------- */}
            {/* COLUMN 1: "1. Choose client" (narrow, 280px)                        */}
            {/* ------------------------------------------------------------------- */}
            <div className={`w-full lg:w-[280px] shrink-0 bg-[var(--card)] border border-[var(--border)] rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col ${
              responsiveStep !== 1 ? 'hidden lg:flex' : 'flex'
            }`}>
              {/* Header */}
              <div className="p-3.5 border-b border-[var(--border)] space-y-2 bg-[var(--card)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-bold text-[var(--text)]">1. Choose client</h3>
                  <button
                    type="button"
                    onClick={() => setCaseloadOnly(!caseloadOnly)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition ${
                      caseloadOnly ? 'bg-[var(--green-100)] text-[var(--green-900)] border-[#CDE0C6]' : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    {caseloadOnly ? 'My Caseload' : 'All Clients'}
                  </button>
                </div>

                {/* Search Box */}
                <div className="relative">
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Search client, caregiver..."
                    className="w-full h-[32px] bg-[#F7F7F4] border border-[var(--border)] rounded-[6px] pl-7 pr-2.5 text-[12px] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--green-700)]"
                  />
                  <span className="absolute left-2 top-2 text-[11px] text-[var(--text-muted)]">🔍</span>
                </div>
              </div>

              {/* Client List */}
              <div className="divide-y divide-[var(--border)] overflow-y-auto max-h-[500px] flex-1">
                {filteredClients.map((item) => {
                  const isSelected = activeNote.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedNoteId(item.id);
                        setResponsiveStep(2);
                      }}
                      title={`Masked ID: ${item.clientId}`}
                      className={`p-3 cursor-pointer transition flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-[var(--green-100)] border-l-4 border-l-[var(--green-700)]'
                          : 'hover:bg-[#F9FAF8]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[13px] font-bold text-[var(--text)] truncate">
                          {deIdentify(item.clientName)}
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-white/70 border border-stone-200 text-stone-700">
                          {item.program}
                        </span>
                      </div>

                      <div className="text-[11px] text-[var(--text-muted)] flex items-center justify-between">
                        <span>CG: {deIdentify(item.caregiverName)}</span>
                        <span className="text-[10px] font-mono text-stone-400">
                          {item.clientId}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                            item.status === 'Urgent'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : item.status === 'Needs fix'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {item.status === 'Urgent' ? '1 urgent issue' : item.status === 'Needs fix' ? `${item.flags.length} needs fix` : 'Approved'}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">{item.visitDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Shortcut: Notes Needing Attention Filter */}
              <div className="p-3 border-t border-[var(--border)] bg-[#F7F7F4] space-y-1.5">
                <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Notes needing attention:
                </div>
                <div className="flex flex-wrap gap-1">
                  {(['All', 'Needs fix', 'Urgent', 'Waiting on caregiver', 'Approved'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNotesAttentionFilter(st)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                        notesAttentionFilter === st
                          ? 'bg-[var(--green-700)] text-white'
                          : 'bg-white border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* COLUMN 2: "2. Choose visit and add the note" (main area, flex-1)    */}
            {/* ------------------------------------------------------------------- */}
            <div className={`flex-1 min-w-0 bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4 ${
              responsiveStep !== 2 ? 'hidden lg:block' : 'block'
            }`}>
              
              {/* Column 2 Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div>
                  <h3 className="text-[15px] font-bold text-[var(--text)]">2. Choose visit and add the note</h3>
                  <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Select visit record, verify caregiver submission, and flag compliance phrasing</p>
                </div>
                <span className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
                  <span>🔒 Access logged</span>
                </span>
              </div>

              {/* Client Info Banner */}
              <div className="p-3 bg-[#F7F7F4] border border-[var(--border)] rounded-[10px] flex flex-wrap items-center justify-between gap-3 text-[12px]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--green-700)] text-white font-bold flex items-center justify-center text-xs">
                    {activeNote.clientName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-[14px] text-[var(--text)]">
                      {deIdentify(activeNote.clientName)}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      ID: {activeNote.clientId} · Age {activeNote.clientAge} ({activeNote.clientDob})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white border border-[var(--border)] text-[var(--text)]">
                    {activeNote.program} Program
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    Caregiver: <strong>{deIdentify(activeNote.caregiverName)}</strong>
                  </span>
                </div>
              </div>

              {/* Visit Selector (Horizontal Recent Visits List) */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Select Visit Record:
                </div>
                <div className="grid sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-[8px] border-2 border-[var(--green-700)] bg-[var(--green-100)] text-[12px] cursor-pointer">
                    <div className="font-bold text-[var(--green-900)]">{activeNote.visitDate}</div>
                    <div className="text-[11px] text-[var(--green-900)]">{activeNote.visitTime}</div>
                    <div className="text-[10px] text-emerald-800 mt-1 flex items-center gap-1">
                      <span>✓ {activeNote.evvStatus}</span>
                      <span>· {activeNote.tasks.length} tasks</span>
                    </div>
                  </div>

                  <div
                    onClick={() => showToast('Switched to previous visit (Nov 15). Note is already approved.')}
                    className="p-2.5 rounded-[8px] border border-[var(--border)] bg-[#F7F7F4] text-[12px] cursor-pointer hover:bg-stone-100 transition"
                  >
                    <div className="font-semibold text-[var(--text)]">Nov 15, 2026</div>
                    <div className="text-[11px] text-[var(--text-muted)]">8:00 AM – 11:30 AM</div>
                    <div className="text-[10px] text-stone-500 mt-1">✓ Verified · Approved</div>
                  </div>

                  <div
                    onClick={() => showToast('Switched to visit (Nov 14).')}
                    className="p-2.5 rounded-[8px] border border-[var(--border)] bg-[#F7F7F4] text-[12px] cursor-pointer hover:bg-stone-100 transition"
                  >
                    <div className="font-semibold text-[var(--text)]">Nov 14, 2026</div>
                    <div className="text-[11px] text-[var(--text-muted)]">8:00 AM – 11:00 AM</div>
                    <div className="text-[10px] text-stone-500 mt-1">✓ Verified · Approved</div>
                  </div>
                </div>
              </div>

              {/* Note Input Area with 3 Tabs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-[#F7F7F4] p-0.5 rounded-[8px] border border-[var(--border)]">
                    <button
                      type="button"
                      onClick={() => setNoteInputTab('caregiver')}
                      className={`px-3 py-1 rounded-[6px] text-[12px] font-semibold transition ${
                        noteInputTab === 'caregiver'
                          ? 'bg-white text-[var(--text)] shadow-2xs'
                          : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      Caregiver&apos;s note
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteInputTab('paste')}
                      className={`px-3 py-1 rounded-[6px] text-[12px] font-semibold transition ${
                        noteInputTab === 'paste'
                          ? 'bg-white text-[var(--text)] shadow-2xs'
                          : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      Paste or type
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteInputTab('upload')}
                      className={`px-3 py-1 rounded-[6px] text-[12px] font-semibold transition ${
                        noteInputTab === 'upload'
                          ? 'bg-white text-[var(--text)] shadow-2xs'
                          : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      Upload
                    </button>
                  </div>

                  {/* Dictation Mic Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDictating(!isDictating);
                      if (!isDictating) {
                        showToast('Voice dictation active. Speak clearly into microphone.');
                        setCurrentCaregiverText((prev) => prev + ' Client was oriented and accepted water at 10:00 AM.');
                      } else {
                        showToast('Voice dictation ended.');
                      }
                    }}
                    className={`min-h-[28px] px-2.5 rounded-[6px] text-[11px] font-semibold flex items-center gap-1.5 transition ${
                      isDictating
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-white border border-[var(--border)] text-[var(--text)] hover:bg-[#F0F2ED]'
                    }`}
                  >
                    <span>🎙️</span>
                    <span>{isDictating ? 'Recording…' : 'Dictate'}</span>
                  </button>
                </div>

                {/* Tab 1: Caregiver's Note with Live Highlights */}
                {noteInputTab === 'caregiver' && (
                  <div className="space-y-2">
                    {/* Live Flagging Count Bar */}
                    <div className="p-2 bg-[#F7F7F4] border border-[var(--border)] rounded-[8px] flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text)]">
                          {activeNote.flags.length} issues identified:
                        </span>
                        <span className="flex items-center gap-1 text-amber-800 font-medium">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span>{activeNote.flags.filter((f) => f.category === 'wording').length} wording</span>
                        </span>
                        <span className="flex items-center gap-1 text-blue-800 font-medium">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span>{activeNote.flags.filter((f) => f.category === 'missing').length} missing detail</span>
                        </span>
                        {activeNote.flags.some((f) => f.category === 'safety') && (
                          <span className="flex items-center gap-1 text-rose-800 font-bold">
                            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                            <span>1 safety escalation</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)]">Click highlighted phrase to inspect</span>
                    </div>

                    {/* Textarea with Highlight Preview */}
                    <div className="relative">
                      <textarea
                        rows={4}
                        value={currentCaregiverText}
                        onChange={(e) => setCurrentCaregiverText(e.target.value)}
                        className="w-full p-3 text-[13px] font-mono bg-white border border-[var(--border)] rounded-[8px] text-[var(--text)] leading-relaxed focus:outline-none focus:ring-1 focus:ring-[var(--green-700)]"
                      />
                    </div>

                    {/* Interactive Highlights Bar */}
                    <div className="p-2.5 bg-white border border-[var(--border)] rounded-[8px] space-y-1.5">
                      <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">
                        Flagged phrases (tap to review & replace):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activeNote.flags.map((flag, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveHighlightPopover(flag)}
                            className={`px-2 py-1 rounded-[6px] text-[11px] font-semibold border flex items-center gap-1 cursor-pointer transition ${
                              flag.category === 'safety'
                                ? 'bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200'
                                : flag.category === 'wording'
                                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                                : 'bg-blue-100 text-blue-900 border-blue-300 hover:bg-blue-200'
                            }`}
                          >
                            <span>&ldquo;{flag.phrase}&rdquo;</span>
                            <span className="text-[9px] uppercase font-bold px-1 rounded bg-black/10">
                              {flag.category}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Paste or Type */}
                {noteInputTab === 'paste' && (
                  <div className="space-y-2">
                    <textarea
                      rows={5}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Paste unstructured notes, shift voice memos, or handwritten visit documentation here..."
                      className="w-full p-3 text-[13px] bg-white border border-[var(--border)] rounded-[8px] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--green-700)]"
                    />
                    <div className="text-[11px] text-[var(--text-muted)] flex justify-between">
                      <span>Zero patient data is sent to public AI models. Protected under LiliSphere BAA.</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (pastedText.trim()) {
                            setCurrentCaregiverText(pastedText);
                            setNoteInputTab('caregiver');
                            showToast('Pasted note loaded into review workbench.');
                          }
                        }}
                        className="font-semibold text-[var(--green-700)] hover:underline"
                      >
                        Load into workbench →
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 3: Upload Drag & Drop */}
                {noteInputTab === 'upload' && (
                  <div className="space-y-2">
                    <div
                      onClick={() => {
                        setUploadedFile({
                          name: 'Rosa_Vega_Morning_Shift_Audio.m4a',
                          size: '1.4 MB',
                          transcript: 'Client was difficult and declined breakfast at 8:40. She took her morning blood pressure pills with water.',
                        });
                        setCurrentCaregiverText('Client was difficult and declined breakfast at 8:40. She took her morning blood pressure pills with water.');
                        showToast('Voice audio file uploaded & transcribed via whisper engine.');
                      }}
                      className="p-6 border-2 border-dashed border-[var(--border)] bg-[#F7F7F4] rounded-[8px] text-center cursor-pointer hover:border-[var(--green-700)] transition space-y-1.5"
                    >
                      <div className="text-2xl">📁</div>
                      <div className="text-[13px] font-semibold text-[var(--text)]">
                        Drop voice memo, PDF, photo scan, or text file here
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        Supports .m4a, .mp3, .pdf, .jpg, .png (Auto OCR and speech-to-text)
                      </div>
                    </div>

                    {uploadedFile && (
                      <div className="p-3 bg-white border border-[var(--border)] rounded-[8px] space-y-1.5 text-[12px]">
                        <div className="flex items-center justify-between font-bold text-[var(--text)]">
                          <span>Extracted Transcript: {uploadedFile.name}</span>
                          <span className="text-[10px] text-emerald-700">✓ AI Transcribed</span>
                        </div>
                        <p className="p-2 bg-[#F7F7F4] rounded text-[12px] leading-relaxed">
                          Client was <span className="underline decoration-dotted decoration-amber-500 font-bold">difficult</span> and declined <span className="underline decoration-dotted decoration-blue-500 font-bold">breakfast</span> at 8:40. She took her morning blood pressure pills with water.
                        </p>
                        <div className="text-[10px] text-[var(--text-muted)]">
                          Dotted lines indicate low-confidence transcription items requiring review.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Attachments Row */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-semibold uppercase">
                  <span>Attachments ({activeNote.attachments.length}):</span>
                  <button
                    type="button"
                    onClick={() => {
                      showToast('Attachment modal opened: select photos or signed forms.');
                    }}
                    className="text-[var(--green-700)] hover:underline normal-case font-bold"
                  >
                    + Add attachment
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeNote.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-2 bg-white border border-[var(--border)] rounded-[6px] flex items-center gap-2 text-[11px] shadow-2xs"
                    >
                      <span>📎</span>
                      <div>
                        <div className="font-semibold text-[var(--text)]">{att.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">
                          {att.type} · {att.size} · 🔒 Access logged
                        </div>
                      </div>
                    </div>
                  ))}
                  {activeNote.attachments.length === 0 && (
                    <div className="text-[11px] text-stone-400 italic">No attachments attached to this visit.</div>
                  )}
                </div>
              </div>

              {/* BIG PRIMARY BUTTON: ✨ Refine note */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-[var(--border)]">
                <div className="text-[12px] text-[var(--text-muted)]">
                  Simulated AI operates under strict state Medicaid rulebooks.
                </div>
                <button
                  type="button"
                  onClick={handleTriggerRefine}
                  disabled={isRefining}
                  className="min-h-[40px] px-5 rounded-[8px] bg-[var(--green-700)] text-white text-[14px] font-semibold hover:bg-[var(--green-900)] transition shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center gap-2 shrink-0 disabled:opacity-50"
                >
                  <svg className={`w-4 h-4 ${isRefining ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{isRefining ? refineProgressText : '✨ Refine note'}</span>
                </button>
              </div>

            </div>

            {/* ------------------------------------------------------------------- */}
            {/* COLUMN 3: "3. Refined note" (right side, 380px-440px)               */}
            {/* ------------------------------------------------------------------- */}
            <div className={`w-full lg:w-[420px] shrink-0 bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4 ${
              responsiveStep !== 3 ? 'hidden lg:block' : 'block'
            }`}>
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div>
                  <h3 className="text-[15px] font-bold text-[var(--text)]">3. Refined note</h3>
                  <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Audited draft with amber blanks and program rules</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDiffView(diffView === 'clean' ? 'diff' : 'clean')}
                  className={`text-[11px] font-semibold px-2 py-1 rounded-[6px] border transition ${
                    diffView === 'diff' ? 'bg-[var(--green-700)] text-white border-[var(--green-700)]' : 'bg-white text-[var(--text)] border-[var(--border)]'
                  }`}
                >
                  {diffView === 'diff' ? 'Diff View' : 'Clean View'}
                </button>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* CRITICAL SAFETY BANNER (WHEN FORCE / INJURY DETECTED)              */}
              {/* ----------------------------------------------------------------- */}
              {isSafetyRiskDetected ? (
                <div className="bg-rose-50 border-2 border-rose-300 rounded-[10px] p-4 space-y-3 animate-fade-in">
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl">🚨</span>
                    <div>
                      <h4 className="font-bold text-[14px] text-rose-900 leading-tight">
                        Needs Supervisor Review: Reportable Safety Event
                      </h4>
                      <p className="text-[12px] text-rose-800 mt-1 leading-relaxed">
                        This note contains phrasing indicating potential physical force, non-consensual care, or a client fall resulting in injury. <strong>State Medicaid regulations prohibit rewriting or masking reportable incidents.</strong>
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white/80 rounded border border-rose-200 text-[11px] text-rose-950 font-mono">
                    Flagged: &ldquo;{activeNote.flags.find((f) => f.category === 'safety')?.phrase || 'potential force / fall'}&rdquo;
                  </div>

                  <div className="pt-1 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setShowIncidentModal(true)}
                      className="w-full min-h-[34px] px-3 rounded-[6px] bg-rose-700 hover:bg-rose-800 text-white font-semibold text-[12px] shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>🚨</span>
                      <span>Create incident report</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast('Notification dispatched to Dana Whitfield, RN (Clinical Supervisor).')}
                      className="w-full min-h-[32px] px-3 rounded-[6px] border border-rose-300 bg-white text-rose-900 font-semibold text-[12px] hover:bg-rose-100 flex items-center justify-center gap-1.5"
                    >
                      <span>🔔</span>
                      <span>Notify supervisor (Dana Whitfield, RN)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSafetyOverrideDismissed(true);
                        showToast('Clinical supervisor override logged: Proceeding to draft preview.');
                      }}
                      className="text-[11px] text-rose-800 underline text-center hover:text-rose-950 pt-1"
                    >
                      Supervisor Override (Confirmed consensual redirection)
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Toolbar Above Output */}
                  <div className="p-3 bg-[#F7F7F4] border border-[var(--border)] rounded-[10px] space-y-2.5 text-[12px]">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Format Selector */}
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-[var(--text-muted)] mb-1">Format</label>
                        <select
                          value={refineFormat}
                          onChange={(e) => setRefineFormat(e.target.value as typeof refineFormat)}
                          className="w-full h-[30px] px-2 text-[11px] bg-white border border-[var(--border)] rounded-[6px] text-[var(--text)]"
                        >
                          <option value="narrative">Narrative paragraph</option>
                          <option value="soap">SOAP-style</option>
                          <option value="bullets">Bullet points</option>
                          <option value="state">State template</option>
                        </select>
                      </div>

                      {/* Length Selector */}
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-[var(--text-muted)] mb-1">Length</label>
                        <select
                          value={refineLength}
                          onChange={(e) => setRefineLength(e.target.value as typeof refineLength)}
                          className="w-full h-[30px] px-2 text-[11px] bg-white border border-[var(--border)] rounded-[6px] text-[var(--text)]"
                        >
                          <option value="short">Short</option>
                          <option value="standard">Standard</option>
                          <option value="detailed">Detailed</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Program Selector */}
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-[var(--text-muted)] mb-1">Program Rules</label>
                        <select
                          value={refineProgram}
                          onChange={(e) => setRefineProgram(e.target.value as typeof refineProgram)}
                          className="w-full h-[30px] px-2 text-[11px] bg-white border border-[var(--border)] rounded-[6px] text-[var(--text)]"
                        >
                          <option value="IHSS">IHSS</option>
                          <option value="CFC">CFC</option>
                          <option value="HCBS">HCBS</option>
                          <option value="IRSS">IRSS</option>
                          <option value="CNA">CNA</option>
                          <option value="HMA">HMA</option>
                          <option value="Personal Care">Personal Care</option>
                        </select>
                      </div>

                      {/* Language Toggle */}
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-[var(--text-muted)] mb-1">Language</label>
                        <div className="flex h-[30px] bg-white border border-[var(--border)] rounded-[6px] p-0.5">
                          <button
                            type="button"
                            onClick={() => setRefineLanguage('en')}
                            className={`flex-1 text-[11px] font-bold rounded ${refineLanguage === 'en' ? 'bg-[var(--green-700)] text-white' : 'text-stone-600'}`}
                          >
                            EN
                          </button>
                          <button
                            type="button"
                            onClick={() => setRefineLanguage('es')}
                            className={`flex-1 text-[11px] font-bold rounded ${refineLanguage === 'es' ? 'bg-[var(--green-700)] text-white' : 'text-stone-600'}`}
                          >
                            ES
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Include Toggles */}
                    <div className="pt-1 border-t border-[var(--border)] grid grid-cols-2 gap-1.5 text-[11px]">
                      <label className="flex items-center gap-1.5 text-[var(--text)] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeOptions.times}
                          onChange={(e) => setIncludeOptions({ ...includeOptions, times: e.target.checked })}
                          className="rounded text-[var(--green-700)]"
                        />
                        <span>Times & duration</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-[var(--text)] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeOptions.response}
                          onChange={(e) => setIncludeOptions({ ...includeOptions, response: e.target.checked })}
                          className="rounded text-[var(--green-700)]"
                        />
                        <span>Client response</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-[var(--text)] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeOptions.tasks}
                          onChange={(e) => setIncludeOptions({ ...includeOptions, tasks: e.target.checked })}
                          className="rounded text-[var(--green-700)]"
                        />
                        <span>Care plan tasks</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-[var(--text)] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeOptions.followUp}
                          onChange={(e) => setIncludeOptions({ ...includeOptions, followUp: e.target.checked })}
                          className="rounded text-[var(--green-700)]"
                        />
                        <span>Follow-up needed</span>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={handleTriggerRefine}
                      className="w-full min-h-[26px] bg-white hover:bg-stone-50 border border-[var(--border)] rounded text-[11px] font-bold text-[var(--green-700)] transition"
                    >
                      Apply options & Refine again
                    </button>
                  </div>

                  {/* Refined Note Output Card */}
                  <div className="bg-white border border-[var(--border)] rounded-[10px] p-4 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pb-1 border-b border-[var(--border)]">
                      <span className="font-bold text-[var(--text)]">Refined note (draft)</span>
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded-full font-bold">
                        {refineFormat.toUpperCase()} · {refineLength.toUpperCase()}
                      </span>
                    </div>

                    {/* Diff View vs Clean View */}
                    {diffView === 'diff' ? (
                      <div className="text-[12px] leading-relaxed text-[var(--text)] bg-[#F7F7F4] p-3 rounded-[6px] font-mono">
                        <del className="bg-rose-100 text-rose-900 line-through px-1 rounded mr-1">
                          Client was difficult and refused to eat breakfast.
                        </del>
                        <ins className="bg-emerald-100 text-emerald-950 no-underline font-semibold px-1 rounded mr-1">
                          Client declined breakfast at 8:40 AM. Caregiver verbally re-offered after 15 minutes; client accepted yogurt.
                        </ins>
                        <del className="bg-rose-100 text-rose-900 line-through px-1 rounded mr-1">
                          I made her eat anyway because she needs food before
                        </del>
                        <ins className="bg-emerald-100 text-emerald-950 no-underline font-semibold px-1 rounded">
                          Morning hypertension medication reminded per care plan at 9:05 AM with water.
                        </ins>
                      </div>
                    ) : isEditingRefinedManually ? (
                      <textarea
                        rows={5}
                        value={editableRefinedText}
                        onChange={(e) => setEditableRefinedText(e.target.value)}
                        className="w-full p-2.5 text-[12px] bg-[#F7F7F4] border border-[var(--border)] rounded text-[var(--text)] focus:outline-none"
                      />
                    ) : (
                      <div className="text-[12px] leading-relaxed text-[var(--text)] p-1">
                        {editableRefinedText.includes('[add') ? (
                          <div className="space-y-1">
                            {editableRefinedText.split(/(\[add [^\]]+\])/g).map((part, i) => {
                              if (part.startsWith('[add')) {
                                return (
                                  <input
                                    key={i}
                                    type="text"
                                    value={amberBlanks[part] || ''}
                                    placeholder={part}
                                    onChange={(e) => setAmberBlanks({ ...amberBlanks, [part]: e.target.value })}
                                    className="inline-block px-1.5 py-0.5 mx-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 font-semibold text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500 min-w-[120px]"
                                  />
                                );
                              }
                              return <span key={i}>{part}</span>;
                            })}
                          </div>
                        ) : (
                          <p>{editableRefinedText}</p>
                        )}
                      </div>
                    )}

                    <div className="text-[10px] text-[var(--text-muted)] italic">
                      Amber blanks can be typed into directly or answered below.
                    </div>
                  </div>

                  {/* Questions for the Caregiver */}
                  {activeNote.questions.length > 0 && (
                    <div className="bg-[#F7F7F4] border border-[var(--border)] rounded-[10px] p-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[var(--text)]">Questions for caregiver ({activeNote.questions.length})</span>
                        <button
                          type="button"
                          onClick={() => setShowQuestions(!showQuestions)}
                          className="text-[10px] text-[var(--green-700)] font-semibold hover:underline"
                        >
                          {showQuestions ? 'Hide' : 'Expand'}
                        </button>
                      </div>

                      {showQuestions && (
                        <div className="space-y-2 pt-1 text-[11px]">
                          {activeNote.questions.map((q) => (
                            <div key={q.id} className="p-2 bg-white rounded border border-[var(--border)] space-y-1">
                              <div className="font-semibold text-[var(--text)]">{q.question}</div>
                              <input
                                type="text"
                                value={questionsAnswerState[q.id] || ''}
                                onChange={(e) => setQuestionsAnswerState({ ...questionsAnswerState, [q.id]: e.target.value })}
                                placeholder="Type caregiver answer or click mic..."
                                className="w-full p-1.5 bg-[#F7F7F4] border border-stone-200 rounded text-[11px] focus:outline-none"
                              />
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              showToast('Answers merged into refined draft.');
                              handleTriggerRefine();
                            }}
                            className="w-full min-h-[26px] bg-[var(--green-700)] text-white font-bold rounded text-[11px] hover:bg-[var(--green-900)] transition"
                          >
                            Merge answers & Refine again
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Program Readiness Checklist Card */}
                  <div className="p-3 bg-white border border-[var(--border)] rounded-[10px] space-y-2 text-[11px]">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-[var(--text)]">Required for {refineProgram}</span>
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                        Ready to send
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-stone-700">
                      <div>✓ Objective wording</div>
                      <div>✓ Exact times documented</div>
                      <div>✓ Care plan tasks verified</div>
                      <div>✓ Client response documented</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        showToast(`Refined note sent to ${activeNote.caregiverName} for mobile approval.`);
                        setNotes((prev) =>
                          prev.map((n) =>
                            n.id === activeNote.id
                              ? {
                                  ...n,
                                  status: 'Waiting on caregiver',
                                  timeline: [
                                    { title: 'Draft sent to caregiver for confirmation', actor: 'Maya R.', time: 'Just now' },
                                    ...n.timeline,
                                  ],
                                }
                              : n
                          )
                        );
                      }}
                      className="w-full min-h-[38px] px-4 rounded-[8px] bg-[var(--green-700)] text-white text-[13px] font-semibold hover:bg-[var(--green-900)] transition shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-center gap-1.5"
                    >
                      <span>📤</span>
                      <span>Send to caregiver for approval</span>
                    </button>

                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(editableRefinedText);
                          showToast('Refined text copied to clipboard.');
                        }}
                        className="min-h-[28px] px-2 rounded-[6px] border border-[var(--border)] bg-white text-[11px] font-semibold text-[var(--text)] hover:bg-[#F0F2ED]"
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingRefinedManually(!isEditingRefinedManually)}
                        className="min-h-[28px] px-2 rounded-[6px] border border-[var(--border)] bg-white text-[11px] font-semibold text-[var(--text)] hover:bg-[#F0F2ED]"
                      >
                        {isEditingRefinedManually ? 'Save' : 'Edit'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          showToast('Original note kept as recorded.');
                        }}
                        className="min-h-[28px] px-2 rounded-[6px] border border-[var(--border)] bg-white text-[11px] font-semibold text-[var(--text)] hover:bg-[#F0F2ED]"
                      >
                        Keep orig
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMoreActions(!showMoreActions)}
                        className="min-h-[28px] px-2 rounded-[6px] border border-[var(--border)] bg-white text-[11px] font-semibold text-[var(--text)] hover:bg-[#F0F2ED]"
                      >
                        More ▾
                      </button>
                    </div>

                    {showMoreActions && (
                      <div className="p-2 bg-[#F7F7F4] border border-[var(--border)] rounded-[6px] space-y-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            showToast('Escalated to Dana Whitfield, RN Supervisor.');
                            setShowMoreActions(false);
                          }}
                          className="w-full text-left px-2 py-1 hover:bg-white rounded font-medium text-stone-800"
                        >
                          Escalate to RN Supervisor
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            showToast('Exported verified PDF audit packet for state submission.');
                            setShowMoreActions(false);
                          }}
                          className="w-full text-left px-2 py-1 hover:bg-white rounded font-medium text-stone-800"
                        >
                          Export to PDF / Audit packet
                        </button>
                      </div>
                    )}
                  </div>

                  {/* AI Info Line */}
                  <div className="text-[10px] text-stone-400 text-center leading-relaxed">
                    AI suggests wording only. The caregiver reviews and stays legally responsible for clinical accuracy.
                  </div>
                </>
              )}

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB 2: NEW NOTE TAB (GUIDED WIZARD - PRESERVED)                        */}
      {/* ========================================================================= */}
      {activeTab === 'new-note' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3">
            <div className="flex items-center justify-between text-[12px] font-semibold">
              <span className="text-[var(--text)]">Guided Note Creation</span>
              <span className="text-[var(--text-muted)]">Draft saved just now</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[12px]">
              {[
                { num: 1, label: '1. Pick Client' },
                { num: 2, label: '2. Dictate / Type' },
                { num: 3, label: '3. Review & Submit' },
              ].map((s) => (
                <div key={s.num} className="flex flex-col items-center">
                  <div
                    className={`w-full h-1.5 rounded-full mb-1.5 transition ${
                      wizardStep >= s.num ? 'bg-[var(--green-700)]' : 'bg-[var(--border)]'
                    }`}
                  />
                  <span className={`text-[12px] ${wizardStep === s.num ? 'font-bold text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-[var(--text)] mb-1">Client Caseload</label>
              <select
                value={wizardClientId}
                onChange={(e) => setWizardClientId(e.target.value)}
                className="w-full p-2 bg-[#F7F7F4] border border-[var(--border)] rounded text-[13px]"
              >
                {notes.map((n) => (
                  <option key={n.clientId} value={n.clientId}>
                    {n.clientName} ({n.program} · {n.clientId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[var(--text)] mb-1">Care Notes Draft</label>
              <textarea
                rows={5}
                value={roughText}
                onChange={(e) => setRoughText(e.target.value)}
                placeholder="Type or dictate care activities..."
                className="w-full p-3 bg-[#F7F7F4] border border-[var(--border)] rounded text-[13px]"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  showToast('Note created and routed to Note Coach workbench.');
                  setActiveTab('coach');
                }}
                className="min-h-[36px] px-5 rounded-[8px] bg-[var(--green-700)] text-white text-[13px] font-semibold hover:bg-[var(--green-900)]"
              >
                Send to Note Coach →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB 3: QUALITY REPORTS (PRESERVED)                                     */}
      {/* ========================================================================= */}
      {activeTab === 'quality' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <span className="text-[12px] font-semibold uppercase text-[var(--text-muted)] block mb-1">First-Pass Rate</span>
              <div className="text-[28px] font-bold text-[var(--text)]">84%</div>
              <span className="text-[11px] text-emerald-700 font-medium">+6% vs last month</span>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <span className="text-[12px] font-semibold uppercase text-[var(--text-muted)] block mb-1">Avg Refinement Time</span>
              <div className="text-[28px] font-bold text-[var(--text)]">1.8m</div>
              <span className="text-[11px] text-[var(--text-muted)]">Per flagged visit note</span>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <span className="text-[12px] font-semibold uppercase text-[var(--text-muted)] block mb-1">Critical Flags (Month)</span>
              <div className="text-[28px] font-bold text-rose-700">2</div>
              <span className="text-[11px] text-rose-700 font-medium">Both escalated to RN</span>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <span className="text-[12px] font-semibold uppercase text-[var(--text-muted)] block mb-1">Audit Compliance</span>
              <div className="text-[28px] font-bold text-[var(--green-700)]">99.4%</div>
              <span className="text-[11px] text-[var(--text-muted)]">State Medicaid standard</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB 4: RULES (PRESERVED)                                               */}
      {/* ========================================================================= */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[16px] font-bold text-[var(--text)]">Medicaid Compliance Rules</h3>
              <p className="text-[12px] text-[var(--text-muted)]">Active inspection standards applied during AI Care Note coaching</p>
            </div>
          </div>

          <div className="space-y-3">
            {rulesList.map((rule) => (
              <div key={rule.id} className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[12px] font-bold text-[var(--green-900)] bg-[var(--green-100)] px-2 py-0.5 rounded">
                      {rule.id}
                    </span>
                    <h4 className="font-bold text-[14px] text-[var(--text)]">{rule.name}</h4>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    rule.severity === 'High' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {rule.severity} Severity
                  </span>
                </div>
                <p className="text-[12px] text-[var(--text-muted)]">{rule.description}</p>
                <div className="p-2.5 bg-[#F7F7F4] rounded-[6px] text-[11px] space-y-1">
                  <div><strong>Non-compliant:</strong> &ldquo;{rule.exampleBad}&rdquo;</div>
                  <div className="text-emerald-800 font-semibold"><strong>Compliant:</strong> &ldquo;{rule.exampleGood}&rdquo;</div>
                </div>
                <div className="text-[11px] text-stone-400">Statutory Authority: {rule.source}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. POP-OVER FOR HIGHLIGHTED PHRASES                                       */}
      {/* ========================================================================= */}
      {activeHighlightPopover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-[12px] border border-[var(--border)] max-w-md w-full p-5 shadow-2xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  activeHighlightPopover.category === 'safety' ? 'bg-rose-100 text-rose-900' : 'bg-amber-100 text-amber-900'
                }`}>
                  {activeHighlightPopover.category} issue
                </span>
                <h4 className="text-[15px] font-bold text-[var(--text)] mt-1">
                  &ldquo;{activeHighlightPopover.phrase}&rdquo;
                </h4>
              </div>
              <button type="button" onClick={() => setActiveHighlightPopover(null)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <div className="text-[12px] text-stone-600 space-y-1.5 leading-relaxed">
              <div><strong>Rule:</strong> {activeHighlightPopover.ruleName}</div>
              <div><strong>Why it&apos;s flagged:</strong> {activeHighlightPopover.plainWhy}</div>
              <div><strong>Suggested correction:</strong> {activeHighlightPopover.plainFix}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setActiveHighlightPopover(null)}
                className="min-h-[30px] px-3 rounded-[6px] border border-[var(--border)] text-[12px] font-semibold text-[var(--text)] hover:bg-[#F0F2ED]"
              >
                Dismiss
              </button>
              {activeHighlightPopover.suggestedReplacement && (
                <button
                  type="button"
                  onClick={() => handleUseSuggestedWording(activeHighlightPopover)}
                  className="min-h-[30px] px-3.5 rounded-[6px] bg-[var(--green-700)] text-white text-[12px] font-semibold hover:bg-[var(--green-900)]"
                >
                  Use suggested wording
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. COLLAPSIBLE DETAILS DRAWER (RIGHT EDGE)                                */}
      {/* ========================================================================= */}
      {showDetailsDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-2xs transition-opacity"
            onClick={() => setShowDetailsDrawer(false)}
          />

          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 border-l border-[var(--border)] overflow-hidden">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[var(--border)] bg-[#F7F7F4] flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-[var(--text)]">Details & Audit Inspector</h3>
                <div className="text-[11px] text-[var(--text-muted)]">
                  {activeNote.clientName} ({activeNote.clientId}) · Visit {activeNote.visitDate}
                </div>
              </div>
              <button type="button" onClick={() => setShowDetailsDrawer(false)} className="text-stone-500 hover:text-stone-800">✕</button>
            </div>

            {/* Drawer Tabs */}
            <div className="flex border-b border-[var(--border)] px-4 bg-white text-[12px] font-semibold">
              <button
                type="button"
                onClick={() => setDetailsDrawerTab('rules')}
                className={`py-2.5 px-3 border-b-2 transition ${
                  detailsDrawerTab === 'rules' ? 'border-[var(--green-700)] text-[var(--green-700)]' : 'border-transparent text-stone-500'
                }`}
              >
                Rules triggered ({activeNote.flags.length})
              </button>
              <button
                type="button"
                onClick={() => setDetailsDrawerTab('context')}
                className={`py-2.5 px-3 border-b-2 transition ${
                  detailsDrawerTab === 'context' ? 'border-[var(--green-700)] text-[var(--green-700)]' : 'border-transparent text-stone-500'
                }`}
              >
                Client context
              </button>
              <button
                type="button"
                onClick={() => setDetailsDrawerTab('history')}
                className={`py-2.5 px-3 border-b-2 transition ${
                  detailsDrawerTab === 'history' ? 'border-[var(--green-700)] text-[var(--green-700)]' : 'border-transparent text-stone-500'
                }`}
              >
                Version history
              </button>
              <button
                type="button"
                onClick={() => setDetailsDrawerTab('audit')}
                className={`py-2.5 px-3 border-b-2 transition ${
                  detailsDrawerTab === 'audit' ? 'border-[var(--green-700)] text-[var(--green-700)]' : 'border-transparent text-stone-500'
                }`}
              >
                Audit log
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-[12px]">
              {detailsDrawerTab === 'rules' && (
                <div className="space-y-3">
                  {activeNote.flags.map((f, i) => (
                    <div key={i} className="p-3 bg-[#F7F7F4] border border-[var(--border)] rounded-[8px] space-y-1">
                      <div className="font-bold text-[var(--text)]">{f.ruleName}</div>
                      <div className="text-stone-600">Trigger: &ldquo;{f.phrase}&rdquo;</div>
                      <div className="text-[11px] text-stone-500">{f.plainWhy}</div>
                    </div>
                  ))}
                </div>
              )}

              {detailsDrawerTab === 'context' && (
                <div className="space-y-3">
                  <div>
                    <span className="font-bold text-[var(--text)]">Authorized Hours:</span>
                    <div className="text-stone-600">{activeNote.clientContext.authorizedHours}</div>
                  </div>
                  <div>
                    <span className="font-bold text-[var(--text)]">Care Plan Goals:</span>
                    <ul className="list-disc pl-4 text-stone-600 space-y-1 mt-1">
                      {activeNote.clientContext.carePlanGoals.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-bold text-[var(--text)]">Last 3 Visit Notes:</span>
                    <div className="space-y-1.5 mt-1">
                      {activeNote.clientContext.lastThreeNotes.map((n, i) => (
                        <div key={i} className="p-2 bg-[#F7F7F4] rounded border border-[var(--border)] text-[11px] text-stone-700">
                          {n}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {detailsDrawerTab === 'history' && (
                <div className="space-y-3">
                  <div className="p-3 bg-white border border-[var(--border)] rounded-[8px] space-y-1">
                    <div className="flex justify-between font-bold text-[var(--text)]">
                      <span>v1.0 Original Submission</span>
                      <span className="text-[10px] text-stone-400">11:35 AM</span>
                    </div>
                    <p className="text-stone-600 italic text-[11px]">&ldquo;{activeNote.originalText}&rdquo;</p>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[8px] space-y-1">
                    <div className="flex justify-between font-bold text-emerald-950">
                      <span>v2.0 AI Coach Refined Draft</span>
                      <span className="text-[10px] text-emerald-700">11:36 AM</span>
                    </div>
                    <p className="text-emerald-900 text-[11px]">{generatedRefinedNote || 'Pending resolution'}</p>
                  </div>
                </div>
              )}

              {detailsDrawerTab === 'audit' && (
                <div className="space-y-2">
                  {activeNote.timeline.map((evt, i) => (
                    <div key={i} className="p-2.5 bg-[#F7F7F4] rounded border border-[var(--border)] text-[11px]">
                      <div className="flex justify-between text-stone-500">
                        <span>{evt.actor}</span>
                        <span>{evt.time}</span>
                      </div>
                      <div className="font-semibold text-[var(--text)] mt-0.5">{evt.title}</div>
                      {evt.note && <div className="text-stone-500 mt-0.5">{evt.note}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[#F7F7F4] flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailsDrawer(false)}
                className="min-h-[30px] px-4 rounded-[6px] bg-[var(--green-700)] text-white text-[12px] font-semibold hover:bg-[var(--green-900)]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. INCIDENT CREATION MODAL                                                */}
      {/* ========================================================================= */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-[12px] border border-[var(--border)] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <div>
                <h3 className="text-[16px] font-bold text-rose-900 flex items-center gap-1.5">
                  <span>🚨</span>
                  <span>Create Medicaid Critical Incident Case</span>
                </h3>
                <div className="text-[11px] text-[var(--text-muted)]">
                  State 24-Hour Reporting Standard · Client: {activeNote.clientName}
                </div>
              </div>
              <button type="button" onClick={() => setShowIncidentModal(false)}>✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast(`Critical incident report logged for ${activeNote.clientName}. Routed to Compliance.`);
                setShowIncidentModal(false);
              }}
              className="space-y-3 text-[12px]"
            >
              <div>
                <label className="block font-semibold text-[var(--text)] mb-1">Incident Category</label>
                <select
                  value={incidentSeverity}
                  onChange={(e) => setIncidentSeverity(e.target.value)}
                  className="w-full p-2 bg-[#F7F7F4] border border-[var(--border)] rounded"
                >
                  <option>Critical - Physical Force / Non-Consensual Care</option>
                  <option>Client Fall Resulting in Injury</option>
                  <option>Medication Administration Error</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text)] mb-1">Summary Description</label>
                <textarea
                  rows={3}
                  required
                  defaultValue={activeNote.originalText}
                  className="w-full p-2 bg-[#F7F7F4] border border-[var(--border)] rounded font-mono text-[11px]"
                />
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900">
                Notice: Submitting logs an immutable HIPAA audit event and alerts the Supervising RN.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
                  className="min-h-[32px] px-3.5 rounded border border-[var(--border)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[32px] px-4 rounded bg-rose-700 text-white font-bold hover:bg-rose-800"
                >
                  Submit Incident to HCPF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. FLOATING LILISARE ASSISTANT CHAT                                       */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-40">
        {!showAssistant ? (
          <button
            type="button"
            onClick={() => setShowAssistant(true)}
            className="min-h-[44px] px-4 rounded-full bg-[var(--green-900)] text-white shadow-xl hover:bg-[var(--green-700)] transition flex items-center gap-2 font-semibold text-[13px] border border-white/20"
          >
            <span>💬</span>
            <span>LiliSare Assistant</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        ) : (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[14px] shadow-2xl w-[360px] h-[480px] flex flex-col overflow-hidden animate-slideUp">
            {/* Chat Header */}
            <div className="p-3 bg-[var(--green-900)] text-white flex items-center justify-between">
              <div>
                <div className="font-bold text-[13px]">LiliSare Assistant</div>
                <div className="text-[10px] text-emerald-300">
                  Scoped: {activeNote.clientName} · Visit {activeNote.visitDate}
                </div>
              </div>
              <button type="button" onClick={() => setShowAssistant(false)} className="text-white/70 hover:text-white">✕</button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-[12px]">
              {assistantMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-[8px] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[var(--green-700)] text-white ml-6 text-right'
                      : 'bg-[#F7F7F4] border border-[var(--border)] text-[var(--text)] mr-4 space-y-1.5'
                  }`}
                >
                  <div>{m.text}</div>
                  {m.source && <div className="text-[10px] text-stone-400 font-mono">Source: {m.source}</div>}
                  {m.actionButton && (
                    <button
                      type="button"
                      onClick={() => handleAssistantAction(m.actionButton!.actionId)}
                      className="mt-1 px-2.5 py-1 rounded bg-[var(--green-700)] text-white font-semibold text-[11px] block hover:bg-[var(--green-900)]"
                    >
                      {m.actionButton.label}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Prompts */}
            <div className="p-2 border-t border-[var(--border)] bg-[#F7F7F4] flex gap-1 overflow-x-auto text-[11px]">
              {['Why is this flagged?', 'Refine note', 'Check incident rules'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => sendAssistantMessage(p)}
                  className="px-2 py-0.5 rounded bg-white border border-[var(--border)] text-stone-700 whitespace-nowrap hover:bg-stone-100"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-2 bg-white border-t border-[var(--border)] flex items-center gap-1.5">
              <input
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && assistantInput.trim()) {
                    sendAssistantMessage(assistantInput.trim());
                  }
                }}
                placeholder="Ask about note, rules, or action..."
                className="flex-1 h-[32px] px-2.5 bg-[#F7F7F4] border border-[var(--border)] rounded text-[12px] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (assistantInput.trim()) sendAssistantMessage(assistantInput.trim());
                }}
                className="h-[32px] px-3 bg-[var(--green-700)] text-white font-bold rounded text-[12px]"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 10. ASSISTANT ACTION CONFIRMATION MODAL                                   */}
      {/* ========================================================================= */}
      {pendingConfirmAction && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[var(--border)] rounded-[12px] p-5 max-w-md w-full shadow-2xl space-y-3">
            <h3 className="text-[16px] font-bold text-[var(--text)]">{pendingConfirmAction.label}</h3>
            <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">
              {pendingConfirmAction.description}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPendingConfirmAction(null)}
                className="min-h-[30px] px-3.5 rounded border border-[var(--border)] text-[12px] font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={pendingConfirmAction.onConfirm}
                className="min-h-[30px] px-4 rounded bg-[var(--green-700)] text-white text-[12px] font-semibold hover:bg-[var(--green-900)]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
