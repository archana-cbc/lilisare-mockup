import {
  ClientRecord,
  CaregiverRecord,
  HouseholdRecord,
  DocumentItem,
  InquiryCard,
  CaregiverApplicant,
  ShiftItem,
  ComplianceItem,
  RnTrackerItem,
  AuditNoteItem,
  EmailTemplate,
  StateApproval,
  ClaimItem,
  ProfitItem,
  ConnectedSystem,
  ScreeningItem,
  FeedItem,
} from '@/types';

export const G = '#3E6B2B';

export const STAFF = ['Maya R.', 'Jon P.', 'Alicia T.', 'Sam K.'];

export const CL: ClientRecord[] = [
  { id: 'C-1001', name: 'Marisol Vega', program: 'CFC', caseManager: 'Dana Whitfield', caregivers: ['Rosa Vega'], authorization: 'Active', nextRnVisit: 'Dec 3' },
  { id: 'C-1002', name: 'Eli Brandt', program: 'IHSS', caseManager: 'Tom Okafor', caregivers: ['Karen Brandt', 'Dale Brandt'], authorization: 'Active', nextRnVisit: 'Nov 29' },
  { id: 'C-1003', name: 'Harper Nguyen', program: 'HCBS', caseManager: 'Dana Whitfield', caregivers: ['Linh Nguyen'], authorization: 'Expiring', nextRnVisit: 'Dec 12' },
  { id: 'C-1004', name: 'Desmond Clarke', program: 'IRSS', caseManager: 'Priya Shah', caregivers: ['Tasha Clarke'], authorization: 'Pending', nextRnVisit: 'Jan 8' },
  { id: 'C-1005', name: 'Aiden Park', program: 'PDN', caseManager: 'Tom Okafor', caregivers: ['Grace Park'], authorization: 'Active', nextRnVisit: 'Nov 21' },
  { id: 'C-1006', name: 'Josefina Ruiz', program: 'HMA', caseManager: 'Priya Shah', caregivers: ['Luis Ruiz'], authorization: 'Expired', nextRnVisit: 'Overdue' },
  { id: 'C-1007', name: 'Walter Hayes', program: 'CFC', caseManager: 'Dana Whitfield', caregivers: ['Beth Hayes'], authorization: 'Active', nextRnVisit: 'Feb 2' },
  { id: 'C-1008', name: 'Priya Raman', program: 'HCBS', caseManager: 'Tom Okafor', caregivers: ['Anand Raman'], authorization: 'Active', nextRnVisit: 'Jan 19' },
];

export const CG: CaregiverRecord[] = [
  { id: 'CG-2001', name: 'Rosa Vega', serviceClass: 'IHSS', ca: 'Maya R.', nextExpiring: 'CPR / First aid expired', expiringColor: 'red', academyProgress: 100, employmentType: 'Employee', isFamily: true },
  { id: 'CG-2002', name: 'Karen Brandt', serviceClass: 'IHSS', ca: 'Jon P.', nextExpiring: 'Driver license 128d', expiringColor: 'amber', academyProgress: 100, employmentType: 'Employee', isFamily: true },
  { id: 'CG-2003', name: 'Linh Nguyen', serviceClass: 'SCC', ca: 'Maya R.', nextExpiring: 'Background check 34d', expiringColor: 'amber', academyProgress: 82, employmentType: '1099', isFamily: true },
  { id: 'CG-2004', name: 'Tasha Clarke', serviceClass: 'IRSS', ca: 'Alicia T.', nextExpiring: 'Annual training 210d', expiringColor: 'green', academyProgress: 100, employmentType: 'Both', isFamily: true },
  { id: 'CG-2005', name: 'Grace Park', serviceClass: 'Mentorship', ca: 'Sam K.', nextExpiring: 'TB test 12d', expiringColor: 'red', academyProgress: 64, employmentType: 'Employee', isFamily: true },
  { id: 'CG-2006', name: 'Luis Ruiz', serviceClass: 'IHSS', ca: 'Jon P.', nextExpiring: 'Driving record expired', expiringColor: 'red', academyProgress: 91, employmentType: '1099', isFamily: true },
  { id: 'CG-2007', name: 'Beth Hayes', serviceClass: 'SCC', ca: 'Alicia T.', nextExpiring: 'CPR / First aid 61d', expiringColor: 'amber', academyProgress: 100, employmentType: 'Employee', isFamily: true },
  { id: 'CG-2008', name: 'Anand Raman', serviceClass: 'IRSS', ca: 'Sam K.', nextExpiring: 'Background check 300d', expiringColor: 'green', academyProgress: 45, employmentType: 'Both', isFamily: true },
  { id: 'CG-2009', name: 'Marcus Bell', serviceClass: 'IHSS', ca: 'Maya R.', nextExpiring: 'Annual training 18d', expiringColor: 'amber', academyProgress: 100, employmentType: 'Employee', isFamily: false },
];

export const HH: HouseholdRecord[] = [
  {
    id: 'h1',
    familyName: 'Vega Family',
    clientName: 'Marisol Vega',
    caregivers: ['Rosa Vega'],
    service: 'IHSS',
    clientProgress: 80,
    caregiverProgress: 55,
    currentStepIndex: 5,
    seed: 1,
    caseManager: 'Dana Whitfield (RMHS)',
    authorizationStatus: 'Approved',
    clientPacketStatus: 'Signed',
    caregiverEmploymentType: 'Employee',
  },
  {
    id: 'h2',
    familyName: 'Brandt Family',
    clientName: 'Eli Brandt',
    caregivers: ['Karen Brandt', 'Dale Brandt'],
    service: 'IHSS',
    clientProgress: 100,
    caregiverProgress: 70,
    currentStepIndex: 6,
    seed: 2,
    caseManager: 'Tom Okafor (Continuous Care)',
    authorizationStatus: 'Approved',
    clientPacketStatus: 'Signed',
    caregiverEmploymentType: 'Employee',
  },
  {
    id: 'h3',
    familyName: 'Nguyen Family',
    clientName: 'Harper Nguyen',
    caregivers: ['Linh Nguyen'],
    service: 'CNA',
    clientProgress: 60,
    caregiverProgress: 30,
    currentStepIndex: 3,
    seed: 3,
    caseManager: 'Dana Whitfield (RMHS)',
    authorizationStatus: 'Awaiting state',
    clientPacketStatus: 'Signed',
    caregiverEmploymentType: '1099',
  },
  {
    id: 'h4',
    familyName: 'Clarke Family',
    clientName: 'Desmond Clarke',
    caregivers: ['Tasha Clarke'],
    service: 'IRSS',
    clientProgress: 35,
    caregiverProgress: 15,
    currentStepIndex: 2,
    seed: 4,
    caseManager: 'Priya Shah (Developmental Pathways)',
    authorizationStatus: 'Pending',
    clientPacketStatus: 'Sent',
    caregiverEmploymentType: 'Both',
  },
  {
    id: 'h5',
    familyName: 'Park Family',
    clientName: 'Aiden Park',
    caregivers: ['Grace Park'],
    service: 'PDN',
    clientProgress: 90,
    caregiverProgress: 85,
    currentStepIndex: 8,
    seed: 5,
    caseManager: 'Tom Okafor (Continuous Care)',
    authorizationStatus: 'Approved',
    clientPacketStatus: 'Signed',
    caregiverEmploymentType: 'Employee',
  },
  {
    id: 'h6',
    familyName: 'Ruiz Family',
    clientName: 'Josefina Ruiz',
    caregivers: ['Luis Ruiz'],
    service: 'HMA',
    clientProgress: 50,
    caregiverProgress: 40,
    currentStepIndex: 4,
    seed: 6,
    caseManager: 'Priya Shah (Developmental Pathways)',
    authorizationStatus: 'Pending',
    clientPacketStatus: 'Missing',
    caregiverEmploymentType: '1099',
  },
  {
    id: 'h7',
    familyName: 'Voss Family',
    clientName: 'Lena Voss',
    caregivers: ['Kendra Voss'],
    service: 'CFC',
    clientProgress: 100,
    caregiverProgress: 100,
    currentStepIndex: 9,
    seed: 7,
    caseManager: 'Dana Whitfield (RMHS)',
    authorizationStatus: 'Approved',
    clientPacketStatus: 'Signed',
    caregiverEmploymentType: 'Employee',
  },
];

export const STEPS = [
  'Application',
  'Packet sent',
  'ID upload',
  'Background checks (CBI, OIG, sex offender registry, driving history)',
  'LearnWorlds training and quiz',
  'Orientation video',
  'Post-orientation meeting',
  'Skills validation',
  'ADP profile',
  'Activation',
];

export const EMP = [
  'Application',
  'Offer letter',
  'I-9',
  'W-4',
  'Colorado withholding',
  'Direct deposit',
  'ID upload',
  'SSN card',
  'CBI background check',
  'OIG exclusion check',
  'Sex offender registry',
  'Driving history',
  'CPR / First aid',
  'TB test',
  'Confidentiality agreement',
  'Code of conduct',
  'HIPAA acknowledgment',
  'Orientation attestation',
  'Skills validation',
  'ADP profile form',
];

export const C99 = [
  'Application',
  'Contractor agreement',
  'W-9',
  'ID upload',
  'Business license',
  'Liability insurance',
  'CBI background check',
  'OIG exclusion check',
  'Sex offender registry',
  'Driving history',
  'CPR / First aid',
  'Confidentiality agreement',
  'HIPAA acknowledgment',
  'Orientation attestation',
  'Skills validation',
];

export const XTRA: Record<string, string[]> = {
  CNA: ['CNA license verification'],
  HMA: ['HMA certificate'],
  PDN: ['RN/LPN license'],
  IRSS: ['Residential training cert'],
  IHSS: [],
};

export const DEF: Record<string, 'Employee' | '1099' | 'Combined'> = {
  IHSS: 'Employee',
  CNA: '1099',
  HMA: 'Combined',
  PDN: 'Employee',
  IRSS: 'Employee',
};

export const CDOC = [
  'Intake application',
  'Service agreement',
  'Client rights notice',
  'HIPAA consent',
  'Medicaid eligibility',
  'CMA authorization letter',
  'Care plan signature',
  'Emergency contacts',
];

export const ST: Array<'Verified' | 'Submitted' | 'Sent' | 'Rejected'> = [
  'Verified',
  'Submitted',
  'Sent',
  'Rejected',
];

export const STC: Record<'Verified' | 'Submitted' | 'Sent' | 'Rejected', 'green' | 'gold' | 'gray' | 'red'> = {
  Verified: 'green',
  Submitted: 'gold',
  Sent: 'gray',
  Rejected: 'red',
};

export const mkDocs = (names: string[], seed: number): DocumentItem[] =>
  names.map((n, i) => {
    const r = (i * 5 + seed * 3) % 11;
    const sIndex = r < 5 ? 0 : r < 7 ? 1 : r < 10 ? 2 : 3;
    const s = ST[sIndex];
    return {
      n,
      s,
      sent: 'Nov ' + (1 + (i % 9)),
      sub: s === 'Sent' ? '—' : 'Nov ' + (3 + (i % 10)),
      who: i % 3 ? STAFF[(i + seed) % 4] : 'Family',
      rem: sIndex > 1 ? 'Nov ' + (10 + (i % 6)) + ' (auto)' : '—',
    };
  });

export const docsFor = (svc: string, emp: string, seed: number): DocumentItem[] => {
  const baseList =
    emp === 'Employee'
      ? EMP
      : emp === '1099'
        ? C99
        : [...EMP, 'Contractor agreement', 'W-9', 'Business license', 'Liability insurance', 'Joint-employer addendum'];
  return mkDocs([...baseList, ...(XTRA[svc] || [])], seed);
};

export const INTAKE_STEPS = [
  'Inquiry logged',
  'Family contacted',
  'Needs assessed',
  'Case manager linked',
  'Authorization requested',
  'Family decision',
  'Converted to client',
];

export const CAREGIVER_INTAKE_STAGES = [
  'New Application',
  'Phone Screened',
  'Interview Scheduled',
  'Hiring Decision',
  'Offer Extended',
  'Hired (→ Onboarding)',
  'Archived / Withdrawn',
];

export const CAREGIVER_RECRUITMENT_STAGES = CAREGIVER_INTAKE_STAGES;

export const CAREGIVER_INTAKE_STEPS = [
  'Application logged',
  'Phone screened',
  'Interview conducted',
  'References verified',
  'Offer extended',
  'Offer accepted',
  'Hired to onboarding',
];

export const CAREGIVER_APPLICANTS: CaregiverApplicant[] = [
  {
    id: 'CGA-301',
    name: 'Jordan Bailey',
    stage: 'New Application',
    employmentType: 'Employee',
    serviceClass: 'CNA',
    phone: '(303) 555-0321',
    email: 'j.bailey@example.com',
    county: 'Denver',
    source: 'Indeed',
    appliedDate: 'Nov 16',
    daysInStage: 1,
    currentStep: 1,
    owner: 'Alicia T.',
    targetRate: '$22.50/hr',
    preferredHours: '35–40 hrs/wk (Day Shifts)',
    cprStatus: 'Valid',
    tbStatus: 'Valid',
    cbiStatus: 'Pending',
    notes: 'Experienced CNA looking for full-time schedule in central Denver. 4 years hospital & home care experience.',
    commLog: [
      { date: 'Nov 16, 2:00 PM', type: 'Note', text: 'Application received via Indeed with resume.', staff: 'Alicia T.' },
    ],
    activityLog: [
      { date: 'Nov 16, 2:00 PM', text: 'Application submitted from Indeed', isAutomated: false },
    ],
  },
  {
    id: 'CGA-302',
    name: 'Tanya Gomez',
    stage: 'Phone Screened',
    employmentType: 'Both',
    serviceClass: 'IHSS',
    phone: '(720) 555-0482',
    email: 'tgomez@example.com',
    county: 'Arapahoe',
    source: 'Referral',
    appliedDate: 'Nov 12',
    daysInStage: 2,
    currentStep: 2,
    owner: 'Maya R.',
    targetRate: '$21.00/hr',
    preferredHours: '30 hrs/wk (Flexible)',
    cprStatus: 'Valid',
    tbStatus: 'Valid',
    cbiStatus: 'Clear',
    notes: 'Phone screening completed. Warm, empathetic presence with 3 years IHSS attendant experience.',
    commLog: [
      { date: 'Nov 15, 10:30 AM', type: 'Call', text: 'Phone screen completed. Discussed IHSS hourly wage and schedules.', staff: 'Maya R.' },
    ],
    activityLog: [
      { date: 'Nov 15, 10:45 AM', text: 'Phone screen cleared. Recommended for in-person interview.', isAutomated: false },
    ],
  },
  {
    id: 'CGA-303',
    name: 'Derrick Vance',
    stage: 'Interview Scheduled',
    employmentType: 'Employee',
    serviceClass: 'Personal Care',
    phone: '(303) 555-0761',
    email: 'dvance@example.com',
    county: 'Jefferson',
    source: 'Website',
    appliedDate: 'Nov 10',
    daysInStage: 3,
    currentStep: 3,
    owner: 'Jon P.',
    targetRate: '$20.50/hr',
    preferredHours: '25 hrs/wk (Mornings)',
    cprStatus: 'Valid',
    tbStatus: 'Needed',
    cbiStatus: 'Pending',
    interviewDate: 'Nov 19, 2:00 PM',
    notes: 'Interview scheduled at Littleton office with Jon P. Focus on personal care ADLs and transfer techniques.',
    commLog: [
      { date: 'Nov 14, 11:15 AM', type: 'SMS', text: 'Confirmed interview appointment for Tuesday Nov 19 at 2:00 PM.', staff: 'Jon P.' },
    ],
    activityLog: [
      { date: 'Nov 14, 11:20 AM', text: '⚡ Calendar invite & SMS reminder dispatched', isAutomated: true },
    ],
  },
  {
    id: 'CGA-304',
    name: 'Sonia Patel',
    stage: 'Hiring Decision',
    employmentType: '1099',
    serviceClass: 'SCC',
    phone: '(720) 555-0914',
    email: 'spatel@example.com',
    county: 'Douglas',
    source: 'Job Fair',
    appliedDate: 'Nov 07',
    daysInStage: 2,
    currentStep: 4,
    owner: 'Sam K.',
    targetRate: '$23.00/hr',
    preferredHours: '20 hrs/wk (Afternoons/Weekends)',
    cprStatus: 'Valid',
    tbStatus: 'Valid',
    cbiStatus: 'Clear',
    notes: 'Two professional references checked and verified. Exceptional feedback on companionship and reliable transit.',
    commLog: [
      { date: 'Nov 13, 3:30 PM', type: 'Call', text: 'Spoke with former supervisor at Senior Resource Hub. Recommended enthusiastically.', staff: 'Sam K.' },
    ],
    activityLog: [
      { date: 'Nov 15, 9:00 AM', text: 'References completed. Ready for formal offer dispatch.', isAutomated: false },
    ],
  },
  {
    id: 'CGA-305',
    name: 'Marcus Bell',
    stage: 'Offer Extended',
    employmentType: 'Employee',
    serviceClass: 'IHSS',
    phone: '(303) 555-0248',
    email: 'mbell@example.com',
    county: 'Denver',
    source: 'Indeed',
    appliedDate: 'Nov 04',
    daysInStage: 2,
    currentStep: 5,
    owner: 'Maya R.',
    targetRate: '$22.00/hr',
    preferredHours: '40 hrs/wk (Full-time)',
    cprStatus: 'Valid',
    tbStatus: 'Valid',
    cbiStatus: 'Pending',
    notes: 'Offer letter dispatched via email at $22.00/hr W-2. Awaiting signed acceptance before onboarding handoff.',
    commLog: [
      { date: 'Nov 15, 4:10 PM', type: 'Email', text: 'Formal offer letter and employment agreement sent.', staff: 'Maya R.' },
    ],
    activityLog: [
      { date: 'Nov 15, 4:15 PM', text: '⚡ Offer letter package emailed via secure link', isAutomated: true },
    ],
  },
  {
    id: 'CGA-306',
    name: 'Chloe Simmons',
    stage: 'Offer Extended',
    employmentType: 'Employee',
    serviceClass: 'HMA',
    phone: '(720) 555-0377',
    email: 'csimmons@example.com',
    county: 'Boulder',
    source: 'Referral',
    appliedDate: 'Oct 28',
    daysInStage: 1,
    currentStep: 5,
    owner: 'Jon P.',
    targetRate: '$25.00/hr',
    preferredHours: '32 hrs/wk (Day Shifts)',
    cprStatus: 'Valid',
    tbStatus: 'Valid',
    cbiStatus: 'Clear',
    notes: 'Offer extended for Boulder County HMA attendant. Client matching already identified in Table Mesa.',
    commLog: [
      { date: 'Nov 16, 9:30 AM', type: 'Email', text: 'Offer letter extended for HMA specialist position.', staff: 'Jon P.' },
    ],
    activityLog: [
      { date: 'Nov 16, 9:35 AM', text: 'Offer extended by Jon P.', isAutomated: false },
    ],
  },
  {
    id: 'CGA-307',
    name: 'Anthony Wright',
    stage: 'Hired (→ Onboarding)',
    employmentType: 'Both',
    serviceClass: 'CNA',
    phone: '(303) 555-0899',
    email: 'awright@example.com',
    county: 'Adams',
    source: 'Indeed',
    appliedDate: 'Oct 22',
    daysInStage: 3,
    currentStep: 7,
    owner: 'Alicia T.',
    targetRate: '$24.00/hr',
    preferredHours: '40 hrs/wk',
    cprStatus: 'Valid',
    tbStatus: 'Valid',
    cbiStatus: 'Clear',
    notes: 'Offer accepted! Onboarding record generated and LearnWorlds training assigned.',
    commLog: [
      { date: 'Nov 14, 1:00 PM', type: 'Email', text: 'Welcome to LiliSare letter and onboarding portal instructions sent.', staff: 'Alicia T.' },
    ],
    activityLog: [
      { date: 'Nov 14, 1:15 PM', text: '⚡ Caregiver record created in Onboarding pipeline', isAutomated: true },
    ],
  },
  {
    id: 'CGA-308',
    name: 'Rachel Kim',
    stage: 'Hired (→ Onboarding)',
    employmentType: 'Employee',
    serviceClass: 'IHSS',
    phone: '(720) 555-0612',
    email: 'rkim@example.com',
    county: 'Denver',
    source: 'Website',
    appliedDate: 'Oct 15',
    daysInStage: 5,
    currentStep: 7,
    owner: 'Maya R.',
    targetRate: '$21.50/hr',
    preferredHours: '25 hrs/wk',
    cprStatus: 'Valid',
    tbStatus: 'Valid',
    cbiStatus: 'Clear',
    notes: 'Hired and currently completing orientation modules in LearnWorlds.',
    commLog: [
      { date: 'Nov 12, 11:00 AM', type: 'Note', text: 'Signed offer agreement returned.', staff: 'Maya R.' },
    ],
    activityLog: [
      { date: 'Nov 12, 11:30 AM', text: '⚡ Transferred to active Onboarding track', isAutomated: true },
    ],
  },
  {
    id: 'CGA-309',
    name: 'Brandon Scott',
    stage: 'Archived / Withdrawn',
    employmentType: 'Employee',
    serviceClass: 'Personal Care',
    phone: '(303) 555-0182',
    email: 'bscott@example.com',
    county: 'Littleton',
    source: 'Phone Call',
    appliedDate: 'Nov 02',
    daysInStage: 10,
    currentStep: 2,
    owner: 'Sam K.',
    targetRate: '$22.00/hr',
    preferredHours: '20 hrs/wk',
    notes: 'Candidate accepted hospital technician role prior to interview.',
    commLog: [
      { date: 'Nov 05, 4:00 PM', type: 'Call', text: 'Candidate called to withdraw application.', staff: 'Sam K.' },
    ],
    activityLog: [
      { date: 'Nov 05, 4:10 PM', text: 'Application archived: Withdrawn by candidate', isAutomated: false },
    ],
  },
];

export const STG = [
  'New Inquiry',
  'Contacted',
  'Needs Discussion',
  'Case Manager Coordination',
  'Family Decision',
  'Converted',
  'Closed / Not Proceeding',
];

export const ASSIGN: InquiryCard[] = [
  {
    id: 'INQ-101',
    stage: 'New Inquiry',
    clientName: 'Oliver Grant',
    source: 'Website',
    service: 'IHSS',
    staff: 'Maya R.',
    followUp: 'Nov 18',
    isOverdue: false,
    daysInStage: 1,
    currentStep: 1,
    statusChip: 'Auto follow-up sent',
    age: 34,
    county: 'Denver',
    responsibleParty: 'Oliver Grant (Self)',
    phone: '(303) 555-0192',
    email: 'oliver.grant@example.com',
    address: '1420 Champa St, Denver, CO 80202',
    preferredLanguage: 'English',
    estimatedHours: 24,
    careNeeds: ['Meal prep & nutrition', 'Mobility assistance', 'Bathing & hygiene'],
    caseManagerName: 'Dana Whitfield',
    caseManagerAgency: 'Rocky Mountain Human Services',
    caseManagerEmail: 'dwhitfield@rmhs.org',
    caseManagerPhone: '(303) 636-5600',
    authStatus: 'Requested',
    authDaysWaiting: 2,
    packetStatus: 'Sent',
    notes: 'Inquired online for IHSS attendant care for self following knee surgery recovery.',
    nextBestAction: 'Review initial inquiry form and confirm phone intake call for Nov 18 at 10 AM.',
    isNextBestAutomated: true,
    commLog: [
      { date: 'Nov 16, 2:15 PM', type: 'Email', text: 'Auto-welcome packet sent with IHSS informational brochure.', staff: 'System' },
      { date: 'Nov 16, 1:40 PM', type: 'Note', text: 'Online form submitted via LiliSare website.', staff: 'Maya R.' },
    ],
    activityLog: [
      { date: 'Nov 16, 2:15 PM', text: '⚡ Automated welcome email dispatched to client', isAutomated: true },
      { date: 'Nov 16, 1:40 PM', text: 'Inquiry received from Website (IHSS Program)', isAutomated: false },
    ],
  },
  {
    id: 'INQ-102',
    stage: 'New Inquiry',
    clientName: 'Mia Torres',
    source: 'Phone',
    service: 'CFC',
    staff: 'Jon P.',
    followUp: 'Nov 17',
    isOverdue: true,
    daysInStage: 2,
    currentStep: 2,
    statusChip: 'Docs missing',
    age: 8,
    county: 'Arapahoe',
    responsibleParty: 'Elena Torres (Mother)',
    phone: '(720) 555-0143',
    email: 'elena.torres@example.com',
    address: '7891 E Belleview Ave, Greenwood Village, CO 80111',
    preferredLanguage: 'Spanish',
    estimatedHours: 32,
    careNeeds: ['Pediatric personal care', 'Medication administration', 'Mobility assistance', 'Sensory regulation'],
    caseManagerName: 'Priya Shah',
    caseManagerAgency: 'Developmental Pathways',
    caseManagerEmail: 'pshah@dpcolo.org',
    caseManagerPhone: '(303) 858-2255',
    authStatus: 'Requested',
    authDaysWaiting: 4,
    packetStatus: 'Missing',
    notes: 'Mother called requesting bilingual attendant care for daughter with cerebral palsy.',
    nextBestAction: 'Overdue follow-up: Call mother to assist with Spanish CFC intake packet upload.',
    isNextBestAutomated: false,
    commLog: [
      { date: 'Nov 15, 11:20 AM', type: 'Call', text: 'Spoke with Elena. Agreed to email documents by Monday.', staff: 'Jon P.' },
    ],
    activityLog: [
      { date: 'Nov 15, 11:25 AM', text: 'CFC intake packet sent via secure link', isAutomated: true },
      { date: 'Nov 15, 11:20 AM', text: 'Initial phone screening conducted in Spanish', isAutomated: false },
    ],
  },
  {
    id: 'INQ-103',
    stage: 'Contacted',
    clientName: 'Ben Alder',
    source: 'Case Management Agency',
    service: 'HCBS',
    staff: 'Maya R.',
    followUp: 'Nov 19',
    isOverdue: false,
    daysInStage: 4,
    currentStep: 3,
    statusChip: 'Awaiting case manager',
    age: 68,
    county: 'Jefferson',
    responsibleParty: 'Ben Alder',
    phone: '(303) 555-0188',
    email: 'b.alder@example.com',
    address: '9245 W Colfax Ave, Lakewood, CO 80215',
    preferredLanguage: 'English',
    estimatedHours: 20,
    careNeeds: ['Bathing & dressing', 'Transfers & mobility', 'Light housekeeping', 'Meal prep'],
    caseManagerName: 'Tom Okafor',
    caseManagerAgency: 'Continuous Care CMA',
    caseManagerEmail: 'tokafor@cc-cma.org',
    caseManagerPhone: '(303) 987-1234',
    authStatus: 'Awaiting state',
    authDaysWaiting: 6,
    packetStatus: 'Sent',
    notes: 'Direct referral from Tom Okafor. Client transitioning from hospital discharge to home.',
    nextBestAction: 'Confirm CMA in-home assessment date with Tom Okafor for waiver sign-off.',
    isNextBestAutomated: true,
    commLog: [
      { date: 'Nov 14, 3:00 PM', type: 'Email', text: 'Sent waiver scope questionnaire to case manager.', staff: 'Maya R.' },
      { date: 'Nov 13, 10:15 AM', type: 'Call', text: 'Introductory phone call with client.', staff: 'Maya R.' },
    ],
    activityLog: [
      { date: 'Nov 16, 9:00 AM', text: '⚡ Automated reminder sent to Tom Okafor (Day 3 check-in)', isAutomated: true },
      { date: 'Nov 13, 10:30 AM', text: 'Client contacted and requirements logged', isAutomated: false },
    ],
  },
  {
    id: 'INQ-104',
    stage: 'Contacted',
    clientName: 'Nora Quinn',
    source: 'Direct Referral',
    service: 'PDN',
    staff: 'Alicia T.',
    followUp: 'Nov 20',
    isOverdue: false,
    daysInStage: 2,
    currentStep: 2,
    age: 16,
    county: 'Douglas',
    responsibleParty: 'Patrick Quinn (Father)',
    phone: '(303) 555-0165',
    email: 'patrick.q@example.com',
    address: '512 Meadows Pkwy, Castle Rock, CO 80109',
    preferredLanguage: 'English',
    estimatedHours: 40,
    careNeeds: ['Tracheostomy care', 'G-tube enteral feeding', 'Skilled nursing (RN/LPN)', 'Overnight monitoring'],
    caseManagerName: 'Dana Whitfield',
    caseManagerAgency: 'Rocky Mountain Human Services',
    caseManagerEmail: 'dwhitfield@rmhs.org',
    caseManagerPhone: '(303) 636-5600',
    authStatus: 'Requested',
    authDaysWaiting: 3,
    packetStatus: 'Sent',
    notes: 'Pediatric skilled nursing needed for high-acuity teenager. Family wants local Douglas county nurse.',
    nextBestAction: 'Complete clinical nursing review of hospital discharge summary.',
    isNextBestAutomated: false,
    commLog: [
      { date: 'Nov 15, 4:10 PM', type: 'Call', text: 'Spoke with Patrick Quinn. Reviewed physician orders and ventilator protocol.', staff: 'Alicia T.' },
    ],
    activityLog: [
      { date: 'Nov 15, 4:30 PM', text: 'Uploaded physician orders to intake chart', isAutomated: false },
      { date: 'Nov 15, 1:15 PM', text: 'Direct referral intake received from Children’s Hospital', isAutomated: false },
    ],
  },
  {
    id: 'INQ-105',
    stage: 'Needs Discussion',
    clientName: 'Sol Marquez',
    source: 'RFP',
    service: 'IRSS',
    staff: 'Sam K.',
    followUp: 'Nov 22',
    isOverdue: false,
    daysInStage: 3,
    currentStep: 3,
    statusChip: 'Auto follow-up sent',
    age: 42,
    county: 'Denver',
    responsibleParty: 'Sol Marquez',
    phone: '(720) 555-0177',
    email: 'sol.marquez@example.com',
    address: '2100 Larimer St, Denver, CO 80205',
    preferredLanguage: 'English',
    estimatedHours: 35,
    careNeeds: ['Community access', 'Independent living skills', 'Budgeting & scheduling', 'Meal planning'],
    caseManagerName: 'Priya Shah',
    caseManagerAgency: 'Developmental Pathways',
    caseManagerEmail: 'pshah@dpcolo.org',
    caseManagerPhone: '(303) 858-2255',
    authStatus: 'Awaiting state',
    authDaysWaiting: 8,
    packetStatus: 'Sent',
    notes: 'RFP response approved for individual residential services. Host home and community caregiver match needed.',
    nextBestAction: 'Review IRSS host home specifications with case manager Priya Shah.',
    isNextBestAutomated: true,
    commLog: [
      { date: 'Nov 14, 11:00 AM', type: 'Email', text: 'Detailed service plan sent to case management team.', staff: 'Sam K.' },
    ],
    activityLog: [
      { date: 'Nov 16, 8:15 AM', text: '⚡ Automated IRSS profile matching suggested 2 host homes', isAutomated: true },
      { date: 'Nov 14, 11:30 AM', text: 'Needs assessment finalized and approved by Sam K.', isAutomated: false },
    ],
  },
  {
    id: 'INQ-106',
    stage: 'Case Manager Coordination',
    clientName: 'Ivy Chen',
    source: 'Case Management Agency',
    service: 'HMA',
    staff: 'Jon P.',
    followUp: 'Nov 21',
    isOverdue: false,
    daysInStage: 5,
    currentStep: 4,
    statusChip: 'Awaiting case manager',
    age: 71,
    county: 'Boulder',
    responsibleParty: 'David Chen (Son)',
    phone: '(303) 555-0131',
    email: 'd.chen@example.com',
    address: '1850 Table Mesa Dr, Boulder, CO 80305',
    preferredLanguage: 'English',
    estimatedHours: 18,
    careNeeds: ['HMA medication administration delegation', 'Blood pressure monitoring', 'RN quarterly visit'],
    caseManagerName: 'Tom Okafor',
    caseManagerAgency: 'Continuous Care CMA',
    caseManagerEmail: 'tokafor@cc-cma.org',
    caseManagerPhone: '(303) 987-1234',
    authStatus: 'Overdue',
    authDaysWaiting: 14,
    packetStatus: 'Signed',
    notes: 'HMA delegated tasks require formal CMA approval and physician order sign-off.',
    nextBestAction: 'Priority Nudge: CMA state approval pending 14 days. Click Send follow-up now.',
    isNextBestAutomated: false,
    commLog: [
      { date: 'Nov 11, 2:45 PM', type: 'Email', text: 'Follow-up #1 sent to Tom Okafor requesting signed PAR.', staff: 'Jon P.' },
      { date: 'Nov 04, 10:00 AM', type: 'Email', text: 'Initial PAR and HMA care protocol submitted to CMA.', staff: 'Jon P.' },
    ],
    activityLog: [
      { date: 'Nov 14, 8:00 AM', text: '⚡ Escalation alert generated: Authorization waiting > 10 days', isAutomated: true },
      { date: 'Nov 11, 2:50 PM', text: 'Manual follow-up logged by Jon P.', isAutomated: false },
    ],
  },
  {
    id: 'INQ-107',
    stage: 'Family Decision',
    clientName: 'Jack Dunn',
    source: 'Direct Referral',
    service: 'IHSS',
    staff: 'Alicia T.',
    followUp: 'Nov 25',
    isOverdue: false,
    daysInStage: 2,
    currentStep: 6,
    statusChip: 'Payment at risk',
    age: 55,
    county: 'Adams',
    responsibleParty: 'Sarah Dunn (Wife)',
    phone: '(303) 555-0119',
    email: 'sdunn@example.com',
    address: '6420 E 120th Ave, Thornton, CO 80241',
    preferredLanguage: 'English',
    estimatedHours: 30,
    careNeeds: ['Bathing & personal care', 'Transfer assistance', 'Meal prep', 'Family caregiver compensation'],
    caseManagerName: 'Dana Whitfield',
    caseManagerAgency: 'Rocky Mountain Human Services',
    caseManagerEmail: 'dwhitfield@rmhs.org',
    caseManagerPhone: '(303) 636-5600',
    authStatus: 'Approved',
    authDaysWaiting: 0,
    packetStatus: 'Signed',
    notes: 'Wife wants to be hired as the primary paid family caregiver under IHSS.',
    nextBestAction: 'Family decision due Nov 25. Send gentle reminder regarding caregiver enrollment.',
    isNextBestAutomated: true,
    commLog: [
      { date: 'Nov 15, 3:30 PM', type: 'Call', text: 'Reviewed wage and schedule options with Sarah Dunn.', staff: 'Alicia T.' },
    ],
    activityLog: [
      { date: 'Nov 15, 4:00 PM', text: 'Draft caregiver compensation agreement emailed to family', isAutomated: true },
      { date: 'Nov 15, 3:30 PM', text: 'Family decision consultation completed', isAutomated: false },
    ],
  },
  {
    id: 'INQ-108',
    stage: 'Converted',
    clientName: 'Lena Voss',
    source: 'Website',
    service: 'CFC',
    staff: 'Maya R.',
    followUp: '—',
    isOverdue: false,
    daysInStage: 1,
    currentStep: 7,
    age: 29,
    county: 'Denver',
    responsibleParty: 'Lena Voss',
    phone: '(720) 555-0155',
    email: 'lena.voss@example.com',
    address: '1100 14th St, Denver, CO 80202',
    preferredLanguage: 'English',
    estimatedHours: 25,
    careNeeds: ['Community access', 'Personal attendant care', 'Life skills coaching'],
    caseManagerName: 'Dana Whitfield',
    caseManagerAgency: 'Rocky Mountain Human Services',
    caseManagerEmail: 'dwhitfield@rmhs.org',
    caseManagerPhone: '(303) 636-5600',
    authStatus: 'Approved',
    authDaysWaiting: 0,
    packetStatus: 'Signed',
    notes: 'Converted to active client. Caregiver packet sent to chosen attendant.',
    nextBestAction: 'Client active in Onboarding. Caregiver background check underway.',
    isNextBestAutomated: true,
    commLog: [
      { date: 'Nov 16, 10:00 AM', type: 'Email', text: 'Welcome to LiliSare letter and onboarding portal link sent.', staff: 'Maya R.' },
    ],
    activityLog: [
      { date: 'Nov 16, 10:15 AM', text: '⚡ Automated client record C-1010 created in LiliSare', isAutomated: true },
      { date: 'Nov 16, 10:00 AM', text: 'Client converted from Intake to Onboarding by Maya R.', isAutomated: false },
    ],
  },
  {
    id: 'INQ-109',
    stage: 'Closed / Not Proceeding',
    clientName: 'Pete Hart',
    source: 'Phone',
    service: 'HCBS',
    staff: 'Sam K.',
    followUp: '—',
    isOverdue: false,
    daysInStage: 12,
    currentStep: 2,
    closedReason: 'Went to another agency',
    age: 63,
    county: 'Arapahoe',
    responsibleParty: 'Pete Hart',
    phone: '(303) 555-0144',
    email: 'phart@example.com',
    address: '3400 S University Blvd, Englewood, CO 80113',
    preferredLanguage: 'English',
    estimatedHours: 15,
    careNeeds: ['Companionship', 'Light meal prep'],
    caseManagerName: 'Priya Shah',
    caseManagerAgency: 'Developmental Pathways',
    caseManagerEmail: 'pshah@dpcolo.org',
    notes: 'Client decided to stay with their existing non-profit agency closer to home.',
    nextBestAction: 'Archive inquiry record per state documentation requirements.',
    isNextBestAutomated: true,
    commLog: [
      { date: 'Nov 05, 2:00 PM', type: 'Call', text: 'Client called to inform us they picked another provider.', staff: 'Sam K.' },
    ],
    activityLog: [
      { date: 'Nov 05, 2:10 PM', text: 'Inquiry marked Closed / Not Proceeding (Went to another agency)', isAutomated: false },
    ],
  },
  {
    id: 'INQ-110',
    stage: 'Closed / Not Proceeding',
    clientName: 'Carlos Mendez',
    source: 'Website',
    service: 'IHSS',
    staff: 'Jon P.',
    followUp: '—',
    isOverdue: false,
    daysInStage: 8,
    currentStep: 3,
    closedReason: 'Not eligible',
    age: 52,
    county: 'Weld',
    responsibleParty: 'Carlos Mendez',
    phone: '(970) 555-0182',
    email: 'cmendez@example.com',
    address: '1600 8th Ave, Greeley, CO 80631',
    preferredLanguage: 'Spanish',
    estimatedHours: 20,
    careNeeds: ['Personal care'],
    notes: 'Does not currently meet Colorado Medicaid HCBS financial eligibility threshold.',
    nextBestAction: 'Eligibility assistance resource guide provided.',
    isNextBestAutomated: true,
    commLog: [
      { date: 'Nov 09, 11:00 AM', type: 'Email', text: 'Sent Colorado Medicaid waiver resource guide in Spanish.', staff: 'Jon P.' },
    ],
    activityLog: [
      { date: 'Nov 09, 11:05 AM', text: '⚡ Resource letter generated and mailed', isAutomated: true },
      { date: 'Nov 09, 11:00 AM', text: 'Marked Closed: Not eligible', isAutomated: false },
    ],
  },
];

export const SRC = ['Case Management Agency', 'Direct Referral', 'Phone', 'Website', 'RFP'];

export const SH: ShiftItem[] = [
  { dayIndex: 0, timeSlot: '8a–12p', client: 'Marisol V.', caregiver: 'Rosa V.' },
  { dayIndex: 0, timeSlot: '1p–5p', client: 'Eli B.', caregiver: 'Karen B.' },
  { dayIndex: 1, timeSlot: '9a–1p', client: 'Harper N.', caregiver: null },
  { dayIndex: 1, timeSlot: '2p–6p', client: 'Aiden P.', caregiver: 'Grace P.' },
  { dayIndex: 2, timeSlot: '8a–12p', client: 'Josefina R.', caregiver: 'Luis R.' },
  { dayIndex: 2, timeSlot: '12p–4p', client: 'Desmond C.', caregiver: null },
  { dayIndex: 3, timeSlot: '8a–12p', client: 'Marisol V.', caregiver: 'Rosa V.' },
  { dayIndex: 4, timeSlot: '10a–2p', client: 'Walter H.', caregiver: 'Beth H.' },
  { dayIndex: 4, timeSlot: '3p–7p', client: 'Priya R.', caregiver: null },
  { dayIndex: 5, timeSlot: '9a–1p', client: 'Eli B.', caregiver: 'Dale B.' },
  { dayIndex: 6, timeSlot: '10a–2p', client: 'Aiden P.', caregiver: 'Grace P.' },
];

export const DAYS = ['Mon 16', 'Tue 17', 'Wed 18', 'Thu 19', 'Fri 20', 'Sat 21', 'Sun 22'];

export const COMP: ComplianceItem[] = [
  { caregiver: 'Rosa Vega', item: 'CPR / First aid', due: 'Oct 30', color: 'red' },
  { caregiver: 'Luis Ruiz', item: 'Driving record', due: 'Nov 9', color: 'red' },
  { caregiver: 'Grace Park', item: 'TB test', due: 'Nov 28', color: 'red' },
  { caregiver: 'Karen Brandt', item: 'Driver license', due: 'Mar 23', color: 'amber' },
  { caregiver: 'Linh Nguyen', item: 'Background check renewal', due: 'Dec 20', color: 'amber' },
  { caregiver: 'Beth Hayes', item: 'CPR / First aid', due: 'Jan 16', color: 'amber' },
  { caregiver: 'Tasha Clarke', item: 'Annual training', due: 'Jun 14', color: 'green' },
  { caregiver: 'Anand Raman', item: 'Background check renewal', due: 'Sep 8', color: 'green' },
];

export const RN: RnTrackerItem[] = [
  { program: 'CNA', description: 'Initial RN visit plus quarterly virtual', completed: 38, total: 52 },
  { program: 'HMA', description: 'Initial RN plus quarterly virtual', completed: 21, total: 30 },
  { program: 'Personal Care', description: 'Annual RN home visit', completed: 64, total: 80 },
  { program: 'IHSS', description: 'Non-RN visit (no RN required)', completed: 120, total: 126 },
];

export const NOTES: AuditNoteItem[] = [
  {
    id: 0,
    caregiver: 'Rosa Vega',
    client: 'Marisol V.',
    date: 'Nov 14',
    originalText: 'Client was difficult and refused to eat, I made her eat anyway.',
    flaggedPhrases: 'difficult, refused, made her',
    suggestedText: 'Client declined breakfast. Caregiver offered preferred foods and fluids; client accepted yogurt after 30 minutes.',
  },
  {
    id: 1,
    caregiver: 'Luis Ruiz',
    client: 'Josefina R.',
    date: 'Nov 14',
    originalText: 'Gave meds and did normal stuff all shift.',
    flaggedPhrases: 'normal stuff (vague)',
    suggestedText: 'Administered scheduled medications per care plan at 9:00 AM. Assisted with bathing, meal prep and light housekeeping.',
  },
  {
    id: 2,
    caregiver: 'Grace Park',
    client: 'Aiden P.',
    date: 'Nov 15',
    originalText: 'Aiden is acting up again, had to calm him down.',
    flaggedPhrases: 'acting up',
    suggestedText: 'Aiden showed signs of agitation at 2:15 PM. Caregiver used calm voice and a preferred activity; agitation resolved in 10 minutes.',
  },
  {
    id: 3,
    caregiver: 'Karen Brandt',
    client: 'Eli B.',
    date: 'Nov 15',
    originalText: 'Took Eli to the store. Fun day.',
    flaggedPhrases: 'not a covered service',
    suggestedText: 'Assisted Eli with community outing per service plan goal: shopping skills. Eli selected items with verbal prompts.',
  },
];

export const TPL: EmailTemplate[] = [
  {
    title: 'Authorization renewal request',
    body: 'Hello {case_manager}, we are writing to request renewal of the service authorization for {client}, which expires on {date}. Please let us know what else you need from LiliSare. Thank you for your partnership.',
  },
  {
    title: 'Follow-up: pending approval',
    body: 'Hi {case_manager}, a gentle follow-up on the approval we sent on {date} for {client}. We want to make sure there is no gap in care. Thank you!',
  },
  {
    title: 'Denial letter request',
    body: 'Hello {case_manager}, Medicaid requires a denial letter for {client}. Could you send it at your earliest convenience? We appreciate your help.',
  },
];

export const APPR: StateApproval[] = [
  { client: 'Marisol Vega', caseManager: 'Dana Whitfield', requestType: 'Auth renewal', sentDate: 'Nov 2', status: 'Overdue' },
  { client: 'Harper Nguyen', caseManager: 'Dana Whitfield', requestType: 'Service plan change', sentDate: 'Nov 9', status: 'Follow-up 2 of 3' },
  { client: 'Desmond Clarke', caseManager: 'Priya Shah', requestType: 'New authorization', sentDate: 'Nov 12', status: 'Follow-up 1 of 3' },
  { client: 'Aiden Park', caseManager: 'Tom Okafor', requestType: 'Hours increase', sentDate: 'Nov 14', status: 'Scheduled Nov 18' },
];

export const CLAIMS: ClaimItem[] = [
  { claimId: 'CLM-7701', npi: 'NPI 1', client: 'Marisol Vega', program: 'CFC', amount: 1840, status: 'Paid' },
  { claimId: 'CLM-7702', npi: 'NPI 2', client: 'Eli Brandt', program: 'IHSS', amount: 2210, status: 'Submitted' },
  { claimId: 'CLM-7703', npi: 'NPI 3', client: 'Aiden Park', program: 'PDN (Class B)', amount: 5120, status: 'Denied' },
  { claimId: 'CLM-7704', npi: 'NPI 1', client: 'Walter Hayes', program: 'CFC', amount: 1630, status: 'Paid' },
  { claimId: 'CLM-7705', npi: 'NPI 3', client: 'Josefina Ruiz', program: 'HMA (Class B)', amount: 3780, status: 'Denied' },
  { claimId: 'CLM-7706', npi: 'NPI 2', client: 'Harper Nguyen', program: 'HCBS', amount: 1980, status: 'Submitted' },
];

export const PROF: ProfitItem[] = [
  { program: 'CFC', revenue: 420000, cost: 350000 },
  { program: 'IHSS', revenue: 310000, cost: 271000 },
  { program: 'HCBS', revenue: 260000, cost: 238000 },
  { program: 'IRSS', revenue: 180000, cost: 171000 },
  { program: 'PDN', revenue: 390000, cost: 312000 },
  { program: 'HMA', revenue: 150000, cost: 139000 },
];

export const SYS: ConnectedSystem[] = [
  { name: 'ADP', description: 'Payroll: Run for employees, Workforce Now for 1099s', release: 'Q1 2027' },
  { name: 'LearnWorlds', description: 'Training, quizzes, Academy progress', release: 'Q4 2026' },
  { name: 'CBI', description: 'Colorado background checks', release: 'Q1 2027' },
  { name: 'Colorado EVV', description: 'Clock-in/out verification', release: 'Q2 2027' },
  { name: 'Medicaid / insurers', description: 'Claims and eligibility', release: 'Q2 2027' },
  { name: 'AWS storage', description: 'Secure document storage', release: 'Q4 2026' },
];

export const ROLES = [
  'Platform Admin',
  'Agency Admin',
  'Enrollment',
  'Onboarding Specialist',
  'Compliance',
  'RN',
  'Case Manager',
  'Billing',
  'Caregiver Administrator',
  'Scheduler',
];

export const MODS = [
  'Clients',
  'Caregivers',
  'Onboarding',
  'Scheduling and EVV',
  'Compliance',
  'Note Audit',
  'Billing',
  'Users and Roles',
];

export interface NavItem {
  id: string;
  label: string;
  badge?: number;
  icon?: string;
}

export interface NavGroup {
  id: string;
  name: string;
  icon: string;
  isExpandable: boolean;
  directId?: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    id: 'today',
    name: 'Today',
    icon: 'home',
    isExpandable: false,
    directId: 'today',
    items: [
      { id: 'today', label: 'Today', icon: 'home' },
    ],
  },
  {
    id: 'intake-menu',
    name: 'Intake & Onboarding',
    icon: 'inbox',
    isExpandable: true,
    items: [
      { id: 'intake', label: 'Client Intake' },
      { id: 'cg-intake', label: 'Caregiver Intake' },
      { id: 'onboarding', label: 'Onboarding' },
      { id: 'emails', label: 'CA Emails', badge: 7 },
    ],
  },
  {
    id: 'people-menu',
    name: 'People',
    icon: 'users',
    isExpandable: true,
    items: [
      { id: 'clients', label: 'Clients' },
      { id: 'caregivers', label: 'Caregivers' },
      { id: 'screening', label: 'Screening Center' },
    ],
  },
  {
    id: 'care-menu',
    name: 'Care Operations',
    icon: 'pulse',
    isExpandable: true,
    items: [
      { id: 'audit', label: 'Care Notes', badge: 26 },
      { id: 'scheduling', label: 'Scheduling and EVV' },
      { id: 'compliance', label: 'Compliance' },
    ],
  },
  {
    id: 'finance-menu',
    name: 'Finance & Billing',
    icon: 'chart',
    isExpandable: true,
    items: [
      { id: 'billing', label: 'Billing' },
      { id: 'profit', label: 'Client Profitability' },
      { id: 'reports', label: 'Reports' },
    ],
  },
  {
    id: 'system-menu',
    name: 'System & Admin',
    icon: 'settings',
    isExpandable: true,
    items: [
      { id: 'rules', label: 'Automation Rules' },
      { id: 'systems', label: 'Connected Systems' },
      { id: 'migration', label: 'Data Migration' },
      { id: 'users', label: 'Users and Roles' },
      { id: 'settings', label: 'Settings' },
      { id: 'roadmap', label: 'Release Roadmap' },
    ],
  },
];

export const FLAT_NAV = NAV.flatMap((n) => n.items);

export interface DemoWorkspace {
  id: string;
  name: string;
  category: 'Staff' | 'External';
  user: string;
  email: string;
  avatar: string;
  oneLine: string;
  description: string;
  highlights: string[];
  allowedPages: string[];
  initialPage: string;
  icon: string;
}

export const DEMO_WORKSPACES: DemoWorkspace[] = [
  {
    id: 'admin',
    name: 'Administrator',
    category: 'Staff',
    user: 'Lisa Connell',
    email: 'admin@lilisare-demo.com',
    avatar: 'L',
    oneLine: 'Full access, users, reports',
    description: 'Unrestricted security clearance across all clinical, financial, and administrative operations.',
    highlights: [
      'Manage all 20 modules, state billing rules, and system integrations',
      'Full control over user permissions, caseloads, and HIPAA audit trails',
      'Executive KPI dashboards, payroll readiness, and profitability reports',
    ],
    allowedPages: [
      'today', 'intake', 'cg-intake', 'onboarding', 'audit', 'emails',
      'clients', 'caregivers', 'screening', 'scheduling', 'compliance',
      'billing', 'profit', 'reports', 'rules', 'systems', 'migration',
      'users', 'settings', 'roadmap'
    ],
    initialPage: 'today',
    icon: 'shield-check',
  },
  {
    id: 'onboarding',
    name: 'Enrollment and Onboarding',
    category: 'Staff',
    user: 'Maya R.',
    email: 'onboarding@lilisare-demo.com',
    avatar: 'M',
    oneLine: 'Client intake, caregiver hiring, onboarding',
    description: 'Drive family inquiries from first call to signed authorization and guide caregiver applicants through credentialing.',
    highlights: [
      'Track client inquiries, case manager coordination, and service agreements',
      'Guide caregiver applicants through I-9, background checks, and skills training',
      'Dual-track household onboarding with automated reminder follow-ups',
    ],
    allowedPages: [
      'today', 'intake', 'cg-intake', 'onboarding', 'clients', 'caregivers', 'screening', 'emails'
    ],
    initialPage: 'intake',
    icon: 'user-plus',
  },
  {
    id: 'clinical',
    name: 'Compliance and Clinical',
    category: 'Staff',
    user: 'Dana Whitfield, RN',
    email: 'clinical@lilisare-demo.com',
    avatar: 'D',
    oneLine: 'Care notes, credentials, supervisory visits',
    description: 'Review daily clinical notes, audit regulatory compliance, and supervise in-home care delivery.',
    highlights: [
      'AI-assisted clinical note review with zero fact fabrication',
      'Track 60-day in-home supervisory RN visits and care plan goals',
      'Monitor caregiver license renewals, CPR expirations, and EVV exceptions',
    ],
    allowedPages: [
      'today', 'audit', 'compliance', 'screening', 'clients', 'caregivers'
    ],
    initialPage: 'audit',
    icon: 'clipboard-heart',
  },
  {
    id: 'scheduling',
    name: 'Scheduling',
    category: 'Staff',
    user: 'Devon Brooks',
    email: 'scheduler@lilisare-demo.com',
    avatar: 'D',
    oneLine: 'Shifts, EVV and time corrections',
    description: 'Coordinate caregiver shifts, resolve EVV exceptions, and dispatch emergency coverage.',
    highlights: [
      'Calendar grid of all scheduled in-home shifts and open visits',
      'Real-time GPS clock-in verification and geofence exception management',
      'Caregiver availability tracking and overtime alert monitoring',
    ],
    allowedPages: [
      'today', 'scheduling', 'clients', 'caregivers'
    ],
    initialPage: 'scheduling',
    icon: 'calendar-clock',
  },
  {
    id: 'billing',
    name: 'Billing and Payroll',
    category: 'Staff',
    user: 'Marcus Vance',
    email: 'billing@lilisare-demo.com',
    avatar: 'M',
    oneLine: 'Claims, denials, payroll readiness',
    description: 'Validate billable hours against Medicaid authorizations, submit EDI claims, and export to ADP.',
    highlights: [
      'Review unbilled shifts and fix missing diagnosis codes or clock-outs',
      'Track claim denial appeals and prior authorization utilization rates',
      'Export verified caregiver hours directly into ADP semi-monthly payroll',
    ],
    allowedPages: [
      'today', 'billing', 'profit', 'reports'
    ],
    initialPage: 'billing',
    icon: 'receipt-dollar',
  },
  {
    id: 'caregiver',
    name: 'Caregiver',
    category: 'External',
    user: 'Rosa Vega',
    email: 'caregiver@lilisare-demo.com',
    avatar: 'R',
    oneLine: 'Clock in, notes, training',
    description: 'Mobile experience for family and field caregivers to record shifts, dictate notes, and complete academy courses.',
    highlights: [
      'One-tap EVV GPS clock-in and clock-out with offline capability',
      'Voice-dictate visit notes with guided prompts and automatic formatting',
      'View scheduled shifts, client care plan goals, and assigned training',
    ],
    allowedPages: ['caregiver-portal'],
    initialPage: 'caregiver-portal',
    icon: 'smartphone-heart',
  },
  {
    id: 'family',
    name: 'Family / Responsible Party',
    category: 'External',
    user: 'Carlos Vega',
    email: 'family@lilisare-demo.com',
    avatar: 'C',
    oneLine: 'Schedule, documents to sign',
    description: 'Transparent client portal for family members to stay informed about their loved one\'s daily care.',
    highlights: [
      'View live visit schedules, arrival confirmations, and caregiver profiles',
      'Review simplified care plan goals and nurse supervisory summaries',
      'Electronically review and sign Medicaid authorization packets',
    ],
    allowedPages: ['family-portal'],
    initialPage: 'family-portal',
    icon: 'users-group',
  },
  {
    id: 'casemanager',
    name: 'Case Manager',
    category: 'External',
    user: 'Sarah Jenkins (RMHS)',
    email: 'casemanager@lilisare-demo.com',
    avatar: 'S',
    oneLine: 'Authorizations and service plans',
    description: 'State Medicaid and Case Management Agency (CMA) portal for authorization tracking and PAR uploads.',
    highlights: [
      'Inspect linked state Medicaid clients and current authorization status',
      'Upload approved Prior Authorization Requests (PARs) and service plans',
      'Send secure follow-ups and service discussion notes directly to agency staff',
    ],
    allowedPages: ['casemanager-portal'],
    initialPage: 'casemanager-portal',
    icon: 'file-check',
  },
];

export const formatCurrency = (n: number) => '$' + n.toLocaleString();

export const SEED_FEED: FeedItem[] = [
  { t: 'Sent IHSS employee packet to Maria R.', ago: '2 min ago' },
  { t: 'Reminder #2 sent: ID upload missing (Harper Nguyen household)', ago: '14 min ago' },
  { t: 'CBI check requested for Tasha Clarke', ago: '1 h ago' },
  { t: 'Case manager follow-up sent to Jane D.', ago: '2 h ago' },
  { t: 'Rejected ID flagged for Alicia T. to review', ago: '3 h ago', h: true },
];

export const DEMO_EVENTS: Array<[string, boolean?]> = [
  ['New inquiry received: Oliver Grant (Website, IHSS)'],
  ['Converted to client: linked Client and Caregiver records created, shared data reused'],
  ['IHSS employee packet (20 documents) sent to Oliver G.'],
  ['Reminder #1 sent by SMS and email: ID upload missing'],
  ['CBI check requested (national, sex offender)'],
  ['Screening result received: clear'],
  ['Case-manager approval requested; follow-up template sent to Jane D.'],
  ['Skills validation needs a staff sign-off', true],
  ['Activation gate green: Oliver Grant activated'],
];

export const SCR: ScreeningItem[] = [
  { caregiver: 'Oliver Grant', checkType: 'National', provider: 'CBI', requestedDate: 'Nov 12', result: 'Clear', expiry: 'Nov 2027', status: 'Complete' },
  { caregiver: 'Rosa Vega', checkType: 'Sex offender', provider: 'CBI', requestedDate: 'Nov 12', result: 'Clear', expiry: 'Nov 2027', status: 'Complete' },
  { caregiver: 'Linh Nguyen', checkType: 'OIG', provider: 'Allied', requestedDate: 'Nov 10', result: 'Clear', expiry: 'Dec 2026', status: 'Expiring soon' },
  { caregiver: 'Luis Ruiz', checkType: 'Driving history', provider: 'Manual', requestedDate: 'Oct 30', result: 'Violation found', expiry: 'Nov 9', status: 'Flagged' },
  { caregiver: 'Grace Park', checkType: 'TB (confirm if required)', provider: 'Manual', requestedDate: 'Nov 1', result: 'Pending', expiry: '—', status: 'Pending' },
  { caregiver: 'Tasha Clarke', checkType: 'National', provider: 'CBI', requestedDate: 'Nov 10', result: 'Pending', expiry: '—', status: 'Pending' },
  { caregiver: 'Marcus Bell', checkType: 'OIG', provider: 'CBI', requestedDate: 'Nov 3', result: 'Possible match', expiry: 'Nov 2027', status: 'Flagged' },
];

export const ROAD = [
  {
    title: 'Release 1',
    features: [
      { name: 'Platform, roles and audit', status: 'Live in prototype', page: 'users' },
      { name: 'Onboarding automation', status: 'In build', page: 'onboarding' },
      { name: 'Follow-ups', status: 'In build', page: 'emails' },
      { name: 'Compliance', status: 'In build', page: 'compliance' },
      { name: 'Intake', status: 'In build', page: 'intake' },
      { name: 'Training sandbox', status: 'Live in prototype', page: 'today' },
    ],
  },
  {
    title: 'Release 2',
    features: [
      { name: 'Caregiver app', status: 'Planned', page: 'caregivers' },
      { name: 'EVV', status: 'Planned', page: 'scheduling' },
      { name: 'AI note coach', status: 'Planned', page: 'audit' },
      { name: 'Checks (CBI and others)', status: 'Planned', page: 'screening' },
      { name: 'LearnWorlds', status: 'Planned', page: 'systems' },
      { name: 'Service-plan automation', status: 'Planned', page: 'rules' },
    ],
  },
  {
    title: 'Release 3',
    features: [
      { name: 'Billing and denials', status: 'Planned', page: 'billing' },
      { name: 'ADP', status: 'Planned', page: 'systems' },
      { name: 'Migration', status: 'Planned', page: 'migration' },
      { name: 'Remaining programs', status: 'Planned', page: 'clients' },
    ],
  },
];

export const SV = ['CNA', 'PDN', 'HMA', 'IHSS', 'CFC', 'HCBS', 'IRSS', 'Personal Care / Homemaker', 'Unskilled contractor'];
export const ET = ['Employee', '1099', 'Both'];
export const RNR: Record<string, string> = {
  CNA: 'Initial + quarterly virtual RN',
  PDN: 'RN supervision per plan',
  HMA: 'Initial RN + quarterly virtual',
  IHSS: 'Non-RN visit',
  CFC: 'Annual home visit',
  HCBS: 'Annual home visit',
  IRSS: 'Annual home visit',
  'Personal Care / Homemaker': 'Annual home visit',
  'Unskilled contractor': 'None',
};

export const baseMatrixRule = (s: string, e: string) => ({
  docs: (e === 'Employee' ? 20 : e === '1099' ? 15 : 27) + (XTRA[s] ? XTRA[s].length : 0),
  checks: s === 'Unskilled contractor' ? 'CBI, OIG' : 'CBI, OIG, sex offender, driving',
  courses: 'LS3000 core' + (['CNA', 'PDN', 'HMA'].includes(s) ? ' + ' + s + ' skills' : ''),
  rn: RNR[s] || 'Standard RN review',
  comp: 'CPR / First aid, annual training' + (e !== '1099' ? ', TB test (confirm)' : ''),
});

export const RULES = [
  ['When a service is selected', 'Assign packet, checks, courses and visit tasks'],
  ['When a document is missing for 48h', 'Remind by SMS + email; at 5 days alert onboarding'],
  ['When a case-manager approval is pending 3 days', 'Send the template follow-up'],
  ['When a credential is 30 days from expiry', 'Remind caregiver; at 7 days alert compliance'],
  ['When a care note is dictated', 'Suggest compliant wording; caregiver accepts or edits'],
  ['Care note rule: outings and meals out', 'Remind: not billable activities'],
];

export const TE = [
  [
    'Missing document reminder',
    'Hi {caregiver_name}, we still need your {document} to finish your onboarding. Upload it here whenever you can. Thank you for caring for {client_name}! LiliSare',
    'Hola {caregiver_name}, aún necesitamos su {document} para terminar su incorporación. Súbalo cuando pueda. ¡Gracias por cuidar a {client_name}! LiliSare',
  ],
  [
    'Case-manager follow-up',
    'Hello {case_manager}, a gentle follow-up on the approval we sent on {date} for {client_name}. We want to avoid any gap in care. Thank you!',
    'Hola {case_manager}, un seguimiento amable sobre la aprobación enviada el {date} para {client_name}. Queremos evitar interrupciones en el cuidado. ¡Gracias!',
  ],
  [
    'Credential expiring',
    'Hi {caregiver_name}, your {document} expires on {date}. Please renew it so your schedule stays open. LiliSare',
    'Hola {caregiver_name}, su {document} vence el {date}. Por favor renuévelo para mantener su horario. LiliSare',
  ],
];

export const STUB_DATA: Record<string, { title: string; subtitle: string; items: Array<[string, string, string]> }> = {
  reports: {
    title: 'Reports',
    subtitle: 'Standard exports for the agency',
    items: [
      ['Caregiver roster', 'All active caregivers', 'Export'],
      ['Onboarding aging', 'Days per step', 'Export'],
      ['EVV exceptions', 'Last 30 days', 'Export'],
      ['Expiring documents', 'Next 90 days', 'Export'],
      ['Claims by NPI', 'Monthly', 'Export'],
      ['Profitability by program', 'Quarterly', 'Export'],
    ],
  },
  settings: {
    title: 'Settings',
    subtitle: 'Agency preferences',
    items: [
      ['Auto reminders', 'Every 3 days until complete', 'Edit'],
      ['Branding', 'Logo and colors', 'Edit'],
      ['Notifications', 'Email and SMS', 'Edit'],
      ['Retention', 'Document retention rules', 'Edit'],
      ['Rates (placeholders)', 'Billing and payroll rates', 'Edit'],
      ['Audit log', 'Who changed what', 'View'],
    ],
  },
};
