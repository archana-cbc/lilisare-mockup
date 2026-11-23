export interface ResponsibleParty {
  id: string;
  name: string;
  relationship: string;
  legalRole: string; // e.g. 'Legal Guardian & POA', 'Healthcare Proxy', 'Emergency Contact'
  isEmergency: boolean;
  order: 1 | 2 | 3;
  phone: string;
  altPhone?: string;
  email: string;
  preferredContact: 'Phone' | 'SMS' | 'Email' | 'Phone & SMS' | 'Email & SMS' | 'SMS & Email' | 'Phone & Email';
  hasPortalAccess: boolean;
  notificationPrefs: string;
}

export interface CareTeamMember {
  id: string;
  name: string;
  role: 'Primary Caregiver' | 'Backup Caregiver' | 'RN Clinical Supervisor' | 'Case Manager' | 'Family Caregiver';
  payType: 'W-2 Employee' | '1099 Contractor' | 'Family / Attendant' | 'Clinical Staff' | 'County Staff';
  phone: string;
  email: string;
  hoursPerWeek?: number;
  nextVisit?: string;
  agency?: string;
}

export interface ADLItem {
  id: string;
  category: string;
  name: string;
  level: 'Independent' | 'Standby' | 'Hands-on' | 'Total Care';
  frequency: string;
  instructions: string;
  signOffRequired: boolean;
}

export interface AuthorizationRecord {
  id: string;
  authNumber: string;
  payer: string;
  waiver: string;
  serviceCode: string;
  serviceDesc: string;
  unitsApproved: number;
  unitsUsed: number;
  unitsRemaining: number;
  startDate: string;
  expiryDate: string;
  daysUntilExpiry: number;
  caseManagerName: string;
  caseManagerPhone: string;
  caseManagerEmail: string;
  status: 'Active' | 'Expiring' | 'Expired' | 'Pending';
}

export interface VisitRecord {
  id: string;
  date: string;
  time: string;
  caregiver: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Missed';
  evvStatus: 'Verified (GPS)' | 'Pending Clock-In' | 'Verified (FOB)' | 'Exception';
  tasks: string[];
}

export interface CareNoteEntry {
  id: string;
  date: string;
  time: string;
  caregiver: string;
  tasks: string[];
  note: string;
  status: 'Approved' | 'Review needed' | 'Refined';
}

export interface AdminNoteEntry {
  id: string;
  date: string;
  author: string;
  type: 'Phone Call' | 'Clinical' | 'Care Coordination' | 'Family Update' | 'General';
  isPinned: boolean;
  note: string;
}

export interface ComplianceDocument {
  id: string;
  name: string;
  category: 'Consent' | 'Assessment' | 'Medical Order' | 'Authorization' | 'ID';
  uploadDate: string;
  expiryDate: string;
  status: 'Verified' | 'Review needed' | 'Missing' | 'Expired';
  reviewer: string;
  fileSize: string;
}

export interface MedicationItem {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  route: string;
  prescriber: string;
  indication: string;
}

export interface IncidentRecord {
  id: string;
  incidentNumber: string;
  date: string;
  time: string;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  reportedBy: string;
  status: 'Reported' | 'Under Investigation' | 'Resolved / Closed by RN';
  description: string;
}

export interface ClientAttribute {
  id: string;
  key: string;
  title: string;
  description: string;
  preference: 'Yes' | 'No' | 'Preferred';
  category: 'Environment' | 'Skills' | 'Caregiver Match' | 'Preferences';
}

export interface InvoiceClaim {
  id: string;
  claimId: string;
  date: string;
  hours: number;
  rate: number;
  amount: number;
  status: 'Paid (EFT)' | 'Submitted' | 'Processing' | 'Denied';
}

export interface AssignedForm {
  id: string;
  title: string;
  code: string;
  dueDate: string;
  completedDate?: string;
  status: 'Completed' | 'Action Required' | 'Sent to Family' | 'Overdue';
  assignedTo: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  type: 'Status Change' | 'Document' | 'Authorization' | 'Schedule' | 'Note' | 'Clinical' | 'Billing';
  user: string;
  description: string;
  isHuman: boolean;
}

export interface DetailedClient {
  id: string; // e.g. 'HH-1003'
  name: string;
  preferredName?: string;
  title?: string;
  photoUrl?: string;
  status: 'Active' | 'Onboarding' | 'On Hold' | 'Discharged';
  program: string; // e.g. 'Medicaid K-Plan', 'IHSS', 'CFC', 'HCBS', etc.
  careArrangement: 'Agency' | 'Family Care' | 'Hybrid';
  household: string;
  householdId: string;
  alertNote: string;
  alertStripMessage?: string;
  needsAttentionCount?: number;

  // Contact & Address
  phone: string;
  altPhone?: string;
  email: string;
  bestTimeToCall: string;
  contactPref: 'Phone' | 'SMS' | 'Email' | 'Phone & SMS' | 'Email & SMS' | 'SMS & Email' | 'Phone & Email';
  address: string;
  apt?: string;
  city: string;
  state: string;
  zip: string;
  isAddressVerified: boolean;
  accessNotes: string;
  parkingInstructions: string;
  gateCode: string;
  billingSameAsResidential: boolean;
  billingAddress: string;

  // Demographics
  gender: string;
  pronouns: string;
  dob: string;
  age: number;
  primaryLanguage: string;
  secondaryLanguage?: string;
  interpreterNeeded: boolean;
  maritalStatus: string;
  ssnMasked: string;
  ssnFull: string;
  medicaidIdMasked: string;
  medicaidIdFull: string;

  // Minor Fields (if age < 18)
  isMinor: boolean;
  schoolName?: string;
  guardianCustody?: string;
  pediatricConsentSigned?: boolean;

  // LiliSare / Operational
  leadCreatedDate: string;
  initialAssessmentDate: string;
  conversionDate: string;
  startDate: string;
  endDate?: string;
  administrator: string;
  region: string;
  referredBy: string;
  preferredCaregiver: string;
  disableClockAlerts: boolean;
  invoicingId: string;
  readinessScore: number;
  onboardingStage: 'Active Care' | 'Assessment' | 'Intake Packet' | 'Auth Pending';

  // State / Clinical contacts
  caseManager: string;
  caseManagerPhone: string;
  caseManagerEmail: string;
  nextRnVisit: string;
  authorizedHours: number;
  authExpiry: string;
  authStatus: 'Active' | 'Expiring' | 'Expired' | 'Pending';

  // Sub-modules
  responsibleParties: ResponsibleParty[];
  careTeam: CareTeamMember[];
  adlList: ADLItem[];
  carePlanGoals: string[];
  carePlanVersion: string;
  carePlanReviewDate: string;
  authorizations: AuthorizationRecord[];
  upcomingVisits: VisitRecord[];
  careNotes: CareNoteEntry[];
  adminNotes: AdminNoteEntry[];
  documents: ComplianceDocument[];
  diagnoses: Array<{ code: string; name: string }>;
  allergies: Array<{ name: string; reaction: string; severity: 'Mild' | 'Moderate' | 'Severe' }>;
  medications: MedicationItem[];
  primaryDoctor: { name: string; clinic: string; phone: string; address?: string };
  specialistDoctor?: { name: string; specialty: string; clinic: string; phone: string };
  preferredPharmacy: { name: string; address: string; phone: string };
  hospitalPreference: string;
  dnrOnFile: boolean;
  vitalsSummary: string;
  incidents: IncidentRecord[];
  attributes: ClientAttribute[];
  billingRate: number;
  billingSchedule: string;
  accountBalance: number;
  recentClaims: InvoiceClaim[];
  assignedForms: AssignedForm[];
  timeline: TimelineEvent[];
}

export const CLIENTS_DETAILED: DetailedClient[] = [
  // 1. SOPHIA PATEL - PRIMARY FEATURED CLIENT
  {
    id: 'HH-1003',
    name: 'Sophia Patel',
    preferredName: 'Sophie',
    title: 'Mrs.',
    photoUrl: '',
    status: 'Active',
    program: 'Medicaid K-Plan',
    careArrangement: 'Hybrid',
    household: 'Patel Household (HH-1003)',
    householdId: 'HH-1003',
    alertNote: 'Dog at home (Golden Retriever Buddy), key in lockbox code 4821',
    alertStripMessage: '⚠️ Attention: Authorization expires in 22 days (Dec 15, 2026) · 1 document needs review (Emergency Evacuation Plan)',
    needsAttentionCount: 2,

    phone: '(503) 555-0194',
    altPhone: '(503) 555-0195',
    email: 'sophia.patel@example.com',
    bestTimeToCall: 'Mornings (9:00 AM – 11:30 AM)',
    contactPref: 'Phone & SMS',
    address: '742 NW Glisan St',
    apt: 'Apt 4B',
    city: 'Portland',
    state: 'OR',
    zip: '97209',
    isAddressVerified: true,
    accessNotes: 'Key in lockbox on apartment door, code: 4821. Call phone if buzzer does not connect.',
    parkingInstructions: 'Visitor parking in alley bay #4, permit on dashboard (grab from entry table).',
    gateCode: '#1942',
    billingSameAsResidential: false,
    billingAddress: 'Oregon DHS HCPF Claims, PO Box 14520, Salem, OR 97309',

    gender: 'Female',
    pronouns: 'she/her',
    dob: '1968-03-14',
    age: 58,
    primaryLanguage: 'English',
    secondaryLanguage: 'Hindi',
    interpreterNeeded: false,
    maritalStatus: 'Married',
    ssnMasked: '***-**-4892',
    ssnFull: '512-44-4892',
    medicaidIdMasked: 'OR-K-992014',
    medicaidIdFull: 'OR-K-992014881',

    isMinor: false,

    leadCreatedDate: 'Jan 12, 2026',
    initialAssessmentDate: 'Jan 18, 2026',
    conversionDate: 'Jan 24, 2026',
    startDate: 'Feb 01, 2026',
    administrator: 'Maya R.',
    region: 'Portland Metro (Multnomah)',
    referredBy: 'Dr. Marcus Vance, Providence Health',
    preferredCaregiver: 'Rosa Vega / Rajesh Patel',
    disableClockAlerts: false,
    invoicingId: 'INV-OR-1003',
    readinessScore: 94,
    onboardingStage: 'Active Care',

    caseManager: 'Tom Okafor, MSW',
    caseManagerPhone: '(503) 988-5432',
    caseManagerEmail: 'tom.okafor@multco.us',
    nextRnVisit: 'Dec 04, 2026',
    authorizedHours: 32,
    authExpiry: 'Dec 15, 2026',
    authStatus: 'Expiring',

    responsibleParties: [
      {
        id: 'rp-1',
        name: 'Rajesh Patel',
        relationship: 'Spouse',
        legalRole: 'Legal Guardian & Power of Attorney (POA)',
        isEmergency: true,
        order: 1,
        phone: '(503) 555-0195',
        altPhone: '(503) 555-0194',
        email: 'rajesh.patel@example.com',
        preferredContact: 'Phone & SMS',
        hasPortalAccess: true,
        notificationPrefs: 'Shift summaries, document alerts, emergency calls',
      },
      {
        id: 'rp-2',
        name: 'Priya Patel',
        relationship: 'Adult Daughter',
        legalRole: 'Healthcare Proxy',
        isEmergency: true,
        order: 2,
        phone: '(503) 555-0812',
        email: 'priya.patel@portlandhealth.org',
        preferredContact: 'Email & SMS',
        hasPortalAccess: true,
        notificationPrefs: 'Monthly care reports, urgent clinical notifications',
      },
    ],

    careTeam: [
      {
        id: 'ct-1',
        name: 'Rosa Vega',
        role: 'Primary Caregiver',
        payType: 'W-2 Employee',
        phone: '(503) 555-0321',
        email: 'rosa.vega@lilisare-cg.com',
        hoursPerWeek: 20,
        agency: 'LiliSare Portland Branch',
      },
      {
        id: 'ct-2',
        name: 'Rajesh Patel',
        role: 'Family Caregiver',
        payType: 'Family / Attendant',
        phone: '(503) 555-0195',
        email: 'rajesh.patel@example.com',
        hoursPerWeek: 12,
        agency: 'Family Caregiver Direct',
      },
      {
        id: 'ct-3',
        name: 'Dana Whitfield, RN',
        role: 'RN Clinical Supervisor',
        payType: 'Clinical Staff',
        phone: '(503) 555-0144',
        email: 'dana.whitfield@lilisare.com',
        nextVisit: 'Dec 04, 2026',
        agency: 'LiliSare Clinical Team',
      },
      {
        id: 'ct-4',
        name: 'Tom Okafor, MSW',
        role: 'Case Manager',
        payType: 'County Staff',
        phone: '(503) 988-5432',
        email: 'tom.okafor@multco.us',
        agency: 'Multnomah Aging & Disability Services',
      },
    ],

    carePlanVersion: 'v3.2',
    carePlanReviewDate: 'Jan 15, 2027',
    carePlanGoals: [
      'Maintain independent mobility and safe ambulation using rolling walker; prevent falls.',
      'Nutritional stabilization with renal-conscious breakfast and lunch meal prep.',
      'Morning medication compliance and blood pressure monitoring with log.',
    ],

    adlList: [
      {
        id: 'adl-1',
        category: 'Personal Care',
        name: 'Bathing & Showering',
        level: 'Hands-on',
        frequency: 'Daily (Morning 8:30 AM)',
        instructions: 'Walk-in shower with shower chair and grab bars. Check water temperature with wrist. Assist with washing back and legs.',
        signOffRequired: true,
      },
      {
        id: 'adl-2',
        category: 'Personal Care',
        name: 'Dressing & Grooming',
        level: 'Standby',
        frequency: 'Daily (Morning)',
        instructions: 'Client chooses clothing. Assist with compression stockings and buttoning back.',
        signOffRequired: true,
      },
      {
        id: 'adl-3',
        category: 'Homemaker / Nutrition',
        name: 'Meal Preparation',
        level: 'Hands-on',
        frequency: '2× Daily (Breakfast & Lunch)',
        instructions: 'Prepare low-sodium diabetic-friendly meals (eggs, oatmeal, vegetable dal). Ensure fresh water pitcher is filled.',
        signOffRequired: true,
      },
      {
        id: 'adl-4',
        category: 'Mobility',
        name: 'Transfers & Ambulation',
        level: 'Standby',
        frequency: 'Continuous',
        instructions: 'Rolling walker must be used for all transfers and walking. Gait belt within reach during morning fatigue.',
        signOffRequired: true,
      },
      {
        id: 'adl-5',
        category: 'Personal Care',
        name: 'Toileting & Hygiene',
        level: 'Standby',
        frequency: 'Every 2-3 hours / As needed',
        instructions: 'Remind every 2 hours. Ensure pathway to bathroom is clear of rugs and pets.',
        signOffRequired: true,
      },
      {
        id: 'adl-6',
        category: 'Health Maintenance',
        name: 'Medication Reminders',
        level: 'Hands-on',
        frequency: 'Daily at 9:00 AM',
        instructions: 'Hand blister pack pills to client. Observe swallowing with 8oz water. Record in log.',
        signOffRequired: true,
      },
      {
        id: 'adl-7',
        category: 'Community Support',
        name: 'Community & Medical Escort',
        level: 'Standby',
        frequency: '2× Weekly',
        instructions: 'Accompany on outdoor walking exercises around the garden courtyard. Accompany to medical appointments.',
        signOffRequired: false,
      },
    ],

    authorizations: [
      {
        id: 'auth-1',
        authNumber: 'AUTH-OR-2026-8812',
        payer: 'Oregon Health Authority (Medicaid)',
        waiver: 'Medicaid K-Plan (1915k)',
        serviceCode: 'T1019',
        serviceDesc: 'Personal Care Services (15-min units)',
        unitsApproved: 5120,
        unitsUsed: 4420,
        unitsRemaining: 700,
        startDate: 'Feb 01, 2026',
        expiryDate: 'Dec 15, 2026',
        daysUntilExpiry: 22,
        caseManagerName: 'Tom Okafor, MSW',
        caseManagerPhone: '(503) 988-5432',
        caseManagerEmail: 'tom.okafor@multco.us',
        status: 'Expiring',
      },
      {
        id: 'auth-2',
        authNumber: 'AUTH-OR-2026-9904',
        payer: 'Oregon Health Authority (Medicaid)',
        waiver: 'Medicaid K-Plan (1915k)',
        serviceCode: 'S5161',
        serviceDesc: 'RN Supervisory & Clinical Oversight',
        unitsApproved: 48,
        unitsUsed: 36,
        unitsRemaining: 12,
        startDate: 'Feb 01, 2026',
        expiryDate: 'Jan 31, 2027',
        daysUntilExpiry: 69,
        caseManagerName: 'Tom Okafor, MSW',
        caseManagerPhone: '(503) 988-5432',
        caseManagerEmail: 'tom.okafor@multco.us',
        status: 'Active',
      },
    ],

    upcomingVisits: [
      {
        id: 'v-1',
        date: 'Today, Nov 23',
        time: '8:00 AM – 12:00 PM',
        caregiver: 'Rosa Vega',
        status: 'In Progress',
        evvStatus: 'Verified (GPS)',
        tasks: ['Bathing', 'Breakfast Prep', 'Medication Reminder', 'Walking Exercise'],
      },
      {
        id: 'v-2',
        date: 'Tomorrow, Nov 24',
        time: '8:00 AM – 12:00 PM',
        caregiver: 'Rosa Vega',
        status: 'Scheduled',
        evvStatus: 'Pending Clock-In',
        tasks: ['Bathing', 'Morning Routine', 'Meal Prep', 'Hydration'],
      },
      {
        id: 'v-3',
        date: 'Wednesday, Nov 25',
        time: '8:00 AM – 12:00 PM',
        caregiver: 'Rosa Vega',
        status: 'Scheduled',
        evvStatus: 'Pending Clock-In',
        tasks: ['Personal Care', 'Breakfast', 'Lisinopril Reminder', 'Courtyard Walk'],
      },
      {
        id: 'v-4',
        date: 'Sunday, Nov 22',
        time: '1:00 PM – 5:00 PM',
        caregiver: 'Rajesh Patel',
        status: 'Completed',
        evvStatus: 'Verified (GPS)',
        tasks: ['Lunch Prep', 'Mobility Assistance', 'Reading & Cognitive Game'],
      },
      {
        id: 'v-5',
        date: 'Friday, Nov 20',
        time: '8:00 AM – 12:00 PM',
        caregiver: 'Rosa Vega',
        status: 'Completed',
        evvStatus: 'Verified (GPS)',
        tasks: ['Shower Assist', 'Eggs & Toast Prep', 'BP Med Reminder', 'Transfer Assist'],
      },
    ],

    careNotes: [
      {
        id: 'cn-1',
        date: 'Nov 22, 2026 · 4:15 PM',
        time: '1:00 PM – 5:00 PM (4.0 hrs)',
        caregiver: 'Rajesh Patel (Family Caregiver)',
        tasks: ['Meal Prep', 'Walking Exercise', 'Cognitive Games'],
        note: 'Assisted Sophia with afternoon walk around the courtyard using rolling walker (approx. 20 minutes). Prepared steamed rice with lentils and steamed vegetables. Client ate full portion and drank 12oz water. Played two rounds of Scrabble; client engaged and smiling.',
        status: 'Approved',
      },
      {
        id: 'cn-2',
        date: 'Nov 20, 2026 · 11:45 AM',
        time: '8:00 AM – 12:00 PM (4.0 hrs)',
        caregiver: 'Rosa Vega (Primary)',
        tasks: ['Shower Assistance', 'Breakfast Prep', 'Medication Reminder'],
        note: 'Caregiver arrived at 8:00 AM. Assisted client with morning walk-in shower with grab bars and transfer chair. Client reported no dizziness. Prepared scrambled eggs with spinach and herbal tea. Medication reminder given at 9:05 AM: Lisinopril 10mg taken with 8oz water. Left client comfortably seated with walker in reach at 12:00 PM.',
        status: 'Approved',
      },
      {
        id: 'cn-3',
        date: 'Nov 18, 2026 · 11:40 AM',
        time: '8:00 AM – 12:00 PM (4.0 hrs)',
        caregiver: 'Rosa Vega (Primary)',
        tasks: ['Hygiene', 'Breakfast', 'Medication Reminder'],
        note: 'Assisted client with morning hygiene and hair brushing. Toast and oatmeal prepared; client ate 75% of bowl. BP pills taken at 9:00 AM with full glass of water. Practiced breathing exercises in living room.',
        status: 'Approved',
      },
    ],

    adminNotes: [
      {
        id: 'an-1',
        date: 'Oct 14, 2026 · 11:30 AM',
        author: 'Maya R. (Administrator)',
        type: 'Family Update',
        isPinned: true,
        note: '⚠️ Family prefers text updates between 9 AM and 11 AM. Key under flower pot is backup if lockbox jams. Golden retriever Buddy is friendly but can jump when door opens.',
      },
      {
        id: 'an-2',
        date: 'Nov 10, 2026 · 2:15 PM',
        author: 'Maya R. (Administrator)',
        type: 'Care Coordination',
        isPinned: false,
        note: 'Spoke with Case Manager Tom Okafor regarding K-Plan re-authorization expiring Dec 15. Assessment packet submitted, state review scheduled for Nov 28. No disruption in service expected.',
      },
      {
        id: 'an-3',
        date: 'Nov 02, 2026 · 10:00 AM',
        author: 'Dana Whitfield, RN',
        type: 'Clinical',
        isPinned: false,
        note: 'Completed 60-day supervisory RN review. Gait stability improved. Blood pressure stable at 124/82. Care plan v3.2 reaffirmed.',
      },
    ],

    documents: [
      {
        id: 'doc-1',
        name: 'Client Rights & HIPAA Privacy Notice',
        category: 'Consent',
        uploadDate: 'Jan 15, 2026',
        expiryDate: 'Jan 15, 2027',
        status: 'Verified',
        reviewer: 'Maya R.',
        fileSize: '240 KB',
      },
      {
        id: 'doc-2',
        name: 'Service Agreement & Financial Terms',
        category: 'Consent',
        uploadDate: 'Jan 15, 2026',
        expiryDate: 'Jan 15, 2027',
        status: 'Verified',
        reviewer: 'Maya R.',
        fileSize: '310 KB',
      },
      {
        id: 'doc-3',
        name: 'State K-Plan Assessment (DHS Form 0287)',
        category: 'Assessment',
        uploadDate: 'Jan 18, 2026',
        expiryDate: 'Jan 18, 2027',
        status: 'Verified',
        reviewer: 'Dana Whitfield, RN',
        fileSize: '1.2 MB',
      },
      {
        id: 'doc-4',
        name: 'Physician Plan of Care (CMS-485 / Medical Order)',
        category: 'Medical Order',
        uploadDate: 'Jan 20, 2026',
        expiryDate: 'Jan 20, 2027',
        status: 'Verified',
        reviewer: 'Dana Whitfield, RN',
        fileSize: '480 KB',
      },
      {
        id: 'doc-5',
        name: 'Medicaid Notice of Action (NOA)',
        category: 'Authorization',
        uploadDate: 'Feb 01, 2026',
        expiryDate: 'Dec 15, 2026',
        status: 'Verified',
        reviewer: 'Maya R.',
        fileSize: '650 KB',
      },
      {
        id: 'doc-6',
        name: 'State Driver License / Photo ID',
        category: 'ID',
        uploadDate: 'Jan 12, 2026',
        expiryDate: 'Mar 14, 2028',
        status: 'Verified',
        reviewer: 'Maya R.',
        fileSize: '1.8 MB',
      },
      {
        id: 'doc-7',
        name: 'Emergency Evacuation & Disaster Plan',
        category: 'Assessment',
        uploadDate: 'Jan 22, 2026',
        expiryDate: 'Dec 15, 2026',
        status: 'Review needed',
        reviewer: 'Pending Review',
        fileSize: '320 KB',
      },
      {
        id: 'doc-8',
        name: 'DNR / Oregon POLST Form (Advance Directive)',
        category: 'Medical Order',
        uploadDate: 'Jan 18, 2026',
        expiryDate: 'Indefinite',
        status: 'Verified',
        reviewer: 'Dana Whitfield, RN',
        fileSize: '510 KB',
      },
    ],

    diagnoses: [
      { code: 'E11.9', name: 'Type 2 Diabetes Mellitus without complications' },
      { code: 'I10', name: 'Essential (primary) Hypertension' },
      { code: 'M17.0', name: 'Bilateral Primary Osteoarthritis of Knee' },
      { code: 'G31.84', name: 'Mild Cognitive Impairment, non-amnestic' },
    ],

    allergies: [
      { name: 'Penicillin', reaction: 'Severe rash, facial swelling', severity: 'Severe' },
      { name: 'Shellfish', reaction: 'Urticaria, abdominal cramping', severity: 'Moderate' },
      { name: 'Sulfa Drugs', reaction: 'Nausea, localized hives', severity: 'Mild' },
    ],

    medications: [
      {
        id: 'med-1',
        name: 'Lisinopril',
        dose: '10 mg Oral Tablet',
        frequency: 'Daily (Morning at 9:00 AM)',
        route: 'Oral',
        prescriber: 'Dr. Marcus Vance, MD',
        indication: 'Hypertension Management',
      },
      {
        id: 'med-2',
        name: 'Metformin HCl',
        dose: '500 mg Oral Tablet',
        frequency: 'Twice daily with meals (Breakfast & Dinner)',
        route: 'Oral',
        prescriber: 'Dr. Marcus Vance, MD',
        indication: 'Type 2 Diabetes',
      },
      {
        id: 'med-3',
        name: 'Atorvastatin Calcium',
        dose: '20 mg Oral Tablet',
        frequency: 'Daily at bedtime',
        route: 'Oral',
        prescriber: 'Dr. Marcus Vance, MD',
        indication: 'Hyperlipidemia',
      },
      {
        id: 'med-4',
        name: 'Acetaminophen (Tylenol)',
        dose: '500 mg Tablet',
        frequency: 'PRN every 6 hrs for joint pain (Max 2g/day)',
        route: 'Oral',
        prescriber: 'Dr. Marcus Vance, MD',
        indication: 'Knee Osteoarthritis Pain',
      },
    ],

    primaryDoctor: {
      name: 'Dr. Marcus Vance, MD',
      clinic: 'Providence Medical Group - NW Portland',
      phone: '(503) 215-1111',
      address: '2222 NW Lovejoy St, Suite 400, Portland, OR',
    },
    specialistDoctor: {
      name: 'Dr. Sarah Jenkins, MD',
      specialty: 'Neurology & Cognitive Health',
      clinic: 'OHSU Brain Institute',
      phone: '(503) 494-8400',
    },
    preferredPharmacy: {
      name: 'Walgreens Pharmacy #4829',
      address: '2103 W Burnside St, Portland, OR 97210',
      phone: '(503) 295-6480',
    },
    hospitalPreference: 'Providence St. Vincent Medical Center (Portland, OR)',
    dnrOnFile: true,
    vitalsSummary: 'Last BP: 124/82 mmHg (Nov 20) · Fasting Blood Glucose: 108 mg/dL · Weight: 148 lbs · Pulse: 72 bpm',

    incidents: [
      {
        id: 'inc-1',
        incidentNumber: 'INC-2026-042',
        date: 'Oct 14, 2026',
        time: '10:15 AM',
        type: 'Minor Slip / Controlled Fall',
        severity: 'Low',
        reportedBy: 'Rosa Vega (Caregiver)',
        status: 'Resolved / Closed by RN',
        description: 'Client slipped on wet tile while exiting shower; caregiver held gait belt and guided client smoothly to seated floor position. Zero skin tears or bruising. Vitals checked immediately by RN Whitfield. Shower floor non-slip mat replaced same afternoon.',
      },
    ],

    attributes: [
      { id: 'att-1', key: 'pets', title: 'Pets in household', description: 'Friendly Golden Retriever Buddy at home', preference: 'Yes', category: 'Environment' },
      { id: 'att-2', key: 'smoker', title: 'Non-smoking caregiver required', description: 'Strict non-smoking environment; asthma sensitivity', preference: 'Yes', category: 'Caregiver Match' },
      { id: 'att-3', key: 'language', title: 'Speaks Hindi / Cultural familiar', description: 'Enjoys conversational Hindi and Indian culinary familiarity', preference: 'Preferred', category: 'Preferences' },
      { id: 'att-4', key: 'lifting', title: 'Transfer assistance (Contact guard)', description: 'Must assist with chair and bed pivot transfers', preference: 'Yes', category: 'Skills' },
      { id: 'att-5', key: 'hoyer', title: 'Hoyer lift required', description: 'Uses rolling walker; mechanical lift not required', preference: 'No', category: 'Skills' },
      { id: 'att-6', key: 'driving', title: 'Caregiver driving / errands', description: 'Valid drivers license preferred for occasional medical visits', preference: 'Preferred', category: 'Skills' },
      { id: 'att-7', key: 'vaccination', title: 'COVID & Flu vaccination required', description: 'Family policy requires vaccinated caregivers in home', preference: 'Yes', category: 'Caregiver Match' },
      { id: 'att-8', key: 'catheter', title: 'Catheter care', description: 'Not required', preference: 'No', category: 'Skills' },
      { id: 'att-9', key: 'incontinence', title: 'Incontinence prompt & reminders', description: 'Regular reminders every 2 hours', preference: 'Preferred', category: 'Skills' },
      { id: 'att-10', key: 'games', title: 'Enjoys games & conversation', description: 'Loves Scrabble, light gardening, classical music', preference: 'Yes', category: 'Preferences' },
      { id: 'att-11', key: 'gender', title: 'Caregiver gender preference', description: 'Female caregiver preferred for morning bathing/hygiene', preference: 'Preferred', category: 'Caregiver Match' },
    ],

    billingRate: 34.50,
    billingSchedule: 'Bi-weekly electronic EDI 837P',
    accountBalance: 0.00,
    recentClaims: [
      { id: 'clm-1', claimId: 'CLM-2026-881', date: 'Nov 15, 2026', hours: 64, rate: 34.50, amount: 2208.00, status: 'Paid (EFT)' },
      { id: 'clm-2', claimId: 'CLM-2026-842', date: 'Oct 31, 2026', hours: 64, rate: 34.50, amount: 2208.00, status: 'Paid (EFT)' },
      { id: 'clm-3', claimId: 'CLM-2026-819', date: 'Oct 15, 2026', hours: 60, rate: 34.50, amount: 2070.00, status: 'Paid (EFT)' },
    ],

    assignedForms: [
      { id: 'frm-1', title: 'Annual State K-Plan Assessment (DHS 0287)', code: 'OHA-0287', dueDate: 'Jan 18, 2027', completedDate: 'Jan 18, 2026', status: 'Completed', assignedTo: 'Dana Whitfield, RN' },
      { id: 'frm-2', title: 'Home Safety & Environmental Inspection', code: 'ENV-2026', dueDate: 'Dec 15, 2026', status: 'Action Required', assignedTo: 'Maya R.' },
      { id: 'frm-3', title: 'Family Satisfaction & Quality Survey Q3', code: 'QA-SURV', dueDate: 'Nov 30, 2026', status: 'Sent to Family', assignedTo: 'Rajesh Patel' },
      { id: 'frm-4', title: 'Morse Fall Risk Scale Re-Assessment', code: 'CLIN-FALL', dueDate: 'Feb 01, 2027', completedDate: 'Aug 14, 2026', status: 'Completed', assignedTo: 'Dana Whitfield, RN' },
    ],

    timeline: [
      { id: 'tl-1', date: 'Nov 22, 2026', time: '4:15 PM', type: 'Note', user: 'Rosa Vega', description: 'Submitted afternoon shift care note (GPS EVV verified).', isHuman: true },
      { id: 'tl-2', date: 'Nov 20, 2026', time: '11:45 AM', type: 'Note', user: 'Rosa Vega', description: 'Submitted morning shift note: assisted with shower & breakfast.', isHuman: true },
      { id: 'tl-3', date: 'Nov 15, 2026', time: '9:00 AM', type: 'Billing', user: 'System (Billing Engine)', description: 'Electronic claim #CLM-2026-881 successfully adjudicated ($2,208.00 paid via EFT).', isHuman: false },
      { id: 'tl-4', date: 'Nov 10, 2026', time: '2:15 PM', type: 'Note', user: 'Maya R.', description: 'Logged admin note regarding K-Plan annual recertification.', isHuman: true },
      { id: 'tl-5', date: 'Oct 14, 2026', time: '11:00 AM', type: 'Clinical', user: 'Dana Whitfield, RN', description: 'Resolved and closed Incident #INC-2026-042 (minor controlled fall). Zero injuries.', isHuman: true },
      { id: 'tl-6', date: 'Aug 14, 2026', time: '10:00 AM', type: 'Clinical', user: 'Dana Whitfield, RN', description: 'Re-certified Care Plan to revision v3.2. All goals updated.', isHuman: true },
      { id: 'tl-7', date: 'Feb 01, 2026', time: '8:00 AM', type: 'Status Change', user: 'Maya R.', description: 'Client status set to Active. State Authorization AUTH-OR-2026-8812 activated.', isHuman: true },
      { id: 'tl-8', date: 'Jan 24, 2026', time: '3:30 PM', type: 'Status Change', user: 'Maya R.', description: 'Converted intake inquiry to client record. Assigned to Patel Household (HH-1003).', isHuman: true },
    ],
  },

  // 2. MARISOL VEGA - IHSS
  {
    id: 'HH-1001',
    name: 'Marisol Vega',
    preferredName: 'Mari',
    title: 'Ms.',
    status: 'Active',
    program: 'IHSS Attendant Care',
    careArrangement: 'Family Care',
    household: 'Vega Household (HH-1001)',
    householdId: 'HH-1001',
    alertNote: 'Speaks Spanish, daughter Rosa is primary caregiver. Key under front porch mat.',
    needsAttentionCount: 0,
    phone: '(303) 555-0142',
    email: 'marisol.vega@example.com',
    bestTimeToCall: 'Afternoons (1:00 PM – 4:00 PM)',
    contactPref: 'Phone & SMS',
    address: '1428 N Speer Blvd',
    city: 'Denver',
    state: 'CO',
    zip: '80204',
    isAddressVerified: true,
    accessNotes: 'Front steps have handrail. Ring bell twice.',
    parkingInstructions: 'Street parking in front of house.',
    gateCode: 'None',
    billingSameAsResidential: true,
    billingAddress: 'Colorado HCPF Claims, Denver CO',
    gender: 'Female',
    pronouns: 'she/her',
    dob: '1959-10-14',
    age: 67,
    primaryLanguage: 'Spanish',
    secondaryLanguage: 'English',
    interpreterNeeded: false,
    maritalStatus: 'Widowed',
    ssnMasked: '***-**-7718',
    ssnFull: '421-55-7718',
    medicaidIdMasked: 'CO-IH-881204',
    medicaidIdFull: 'CO-IH-88120419',
    isMinor: false,
    leadCreatedDate: 'Nov 02, 2025',
    initialAssessmentDate: 'Nov 10, 2025',
    conversionDate: 'Nov 18, 2025',
    startDate: 'Dec 01, 2025',
    administrator: 'Alicia T.',
    region: 'Denver Metro',
    referredBy: 'Denver Health Community Clinic',
    preferredCaregiver: 'Rosa Vega',
    disableClockAlerts: false,
    invoicingId: 'INV-CO-1001',
    readinessScore: 98,
    onboardingStage: 'Active Care',
    caseManager: 'Dana Whitfield, RN',
    caseManagerPhone: '(303) 866-2993',
    caseManagerEmail: 'dana.whitfield@co-hcpf.org',
    nextRnVisit: 'Dec 03, 2026',
    authorizedHours: 28,
    authExpiry: 'Jan 14, 2027',
    authStatus: 'Active',
    responsibleParties: [
      {
        id: 'rp-v1',
        name: 'Rosa Vega',
        relationship: 'Daughter / Primary Caregiver',
        legalRole: 'Legal Guardian & Family Attendant',
        isEmergency: true,
        order: 1,
        phone: '(303) 555-0891',
        email: 'rosa.vega@example.com',
        preferredContact: 'Phone & SMS',
        hasPortalAccess: true,
        notificationPrefs: 'All shift notifications & EVV alerts',
      },
    ],
    careTeam: [
      {
        id: 'ct-v1',
        name: 'Rosa Vega',
        role: 'Primary Caregiver',
        payType: 'Family / Attendant',
        phone: '(303) 555-0891',
        email: 'rosa.vega@example.com',
        hoursPerWeek: 28,
        agency: 'LiliSare Colorado IHSS',
      },
    ],
    carePlanVersion: 'v2.4',
    carePlanReviewDate: 'Dec 01, 2026',
    carePlanGoals: ['Maintain independent nutrition', 'Daily blood pressure supervision at 9 AM', 'Safe bathroom transfers'],
    adlList: [],
    authorizations: [
      {
        id: 'auth-v1',
        authNumber: 'AUTH-CO-2026-1102',
        payer: 'Colorado Health First (Medicaid)',
        waiver: 'IHSS Waiver',
        serviceCode: 'T1019',
        serviceDesc: 'Attendant Care Services',
        unitsApproved: 4480,
        unitsUsed: 3200,
        unitsRemaining: 1280,
        startDate: 'Jan 15, 2026',
        expiryDate: 'Jan 14, 2027',
        daysUntilExpiry: 52,
        caseManagerName: 'Dana Whitfield, RN',
        caseManagerPhone: '(303) 866-2993',
        caseManagerEmail: 'dana.whitfield@co-hcpf.org',
        status: 'Active',
      },
    ],
    upcomingVisits: [],
    careNotes: [],
    adminNotes: [],
    documents: [],
    diagnoses: [{ code: 'I10', name: 'Hypertension' }, { code: 'M19.9', name: 'Osteoarthritis' }],
    allergies: [{ name: 'Sulfa', reaction: 'Hives', severity: 'Moderate' }],
    medications: [],
    primaryDoctor: { name: 'Dr. Carlos Mendoza, MD', clinic: 'Denver Health', phone: '(303) 436-6000' },
    preferredPharmacy: { name: 'King Soopers Pharmacy #42', address: 'Speer Blvd, Denver CO', phone: '(303) 555-3921' },
    hospitalPreference: 'Denver Health Medical Center',
    dnrOnFile: false,
    vitalsSummary: 'Last BP: 128/84 mmHg · Weight: 154 lbs',
    incidents: [],
    attributes: [
      { id: 'att-v1', key: 'pets', title: 'Pets in household', description: 'No pets', preference: 'No', category: 'Environment' },
      { id: 'att-v2', key: 'lang', title: 'Spanish speaking caregiver', description: 'Primary language Spanish', preference: 'Yes', category: 'Caregiver Match' },
    ],
    billingRate: 31.80,
    billingSchedule: 'Weekly EDI',
    accountBalance: 0,
    recentClaims: [],
    assignedForms: [],
    timeline: [],
  },

  // 3. ELI BRANDT - IHSS CHILD CARE (MINOR)
  {
    id: 'HH-1002',
    name: 'Eli Brandt',
    preferredName: 'Eli',
    title: 'Master',
    status: 'Active',
    program: 'IHSS Child Care',
    careArrangement: 'Family Care',
    household: 'Brandt Household (HH-1002)',
    householdId: 'HH-1002',
    alertNote: 'Minor client (age 9), G-tube feeds at 12:00 PM, mother Karen is primary attendant.',
    needsAttentionCount: 0,
    phone: '(720) 555-0188',
    email: 'karen.brandt@example.com',
    bestTimeToCall: 'Mornings (8:00 AM – 10:00 AM)',
    contactPref: 'Phone & SMS',
    address: '8820 E Peakview Ave',
    city: 'Arapahoe',
    state: 'CO',
    zip: '80111',
    isAddressVerified: true,
    accessNotes: 'Side ramp access for pediatric stroller. Door code: 1102.',
    parkingInstructions: 'Driveway parking.',
    gateCode: 'None',
    billingSameAsResidential: true,
    billingAddress: 'Colorado HCPF Claims, Denver CO',
    gender: 'Male',
    pronouns: 'he/him',
    dob: '2017-06-20',
    age: 9,
    primaryLanguage: 'English',
    interpreterNeeded: false,
    maritalStatus: 'Single (Minor)',
    ssnMasked: '***-**-3391',
    ssnFull: '519-33-3391',
    medicaidIdMasked: 'CO-IH-449102',
    medicaidIdFull: 'CO-IH-44910204',
    isMinor: true,
    schoolName: 'Cottonwood Creek Elementary (Cherry Creek School District)',
    guardianCustody: 'Joint Legal Custody (Parents: Karen & Dale Brandt)',
    pediatricConsentSigned: true,
    leadCreatedDate: 'Mar 10, 2025',
    initialAssessmentDate: 'Mar 15, 2025',
    conversionDate: 'Mar 25, 2025',
    startDate: 'Apr 01, 2025',
    administrator: 'Jon P.',
    region: 'Arapahoe County',
    referredBy: 'Children\'s Hospital Colorado',
    preferredCaregiver: 'Karen Brandt / Dale Brandt',
    disableClockAlerts: false,
    invoicingId: 'INV-CO-1002',
    readinessScore: 96,
    onboardingStage: 'Active Care',
    caseManager: 'Tom Okafor, MSW',
    caseManagerPhone: '(303) 866-4812',
    caseManagerEmail: 'tom.okafor@co-hcpf.org',
    nextRnVisit: 'Nov 29, 2026',
    authorizedHours: 35,
    authExpiry: 'Feb 28, 2027',
    authStatus: 'Active',
    responsibleParties: [
      {
        id: 'rp-b1',
        name: 'Karen Brandt',
        relationship: 'Mother / Primary Guardian',
        legalRole: 'Legal Parent & Guardian',
        isEmergency: true,
        order: 1,
        phone: '(720) 555-0188',
        email: 'karen.brandt@example.com',
        preferredContact: 'Phone & SMS',
        hasPortalAccess: true,
        notificationPrefs: 'Daily shift alerts & Pediatric G-tube care summaries',
      },
      {
        id: 'rp-b2',
        name: 'Dale Brandt',
        relationship: 'Father / Secondary Guardian',
        legalRole: 'Legal Parent & Guardian',
        isEmergency: true,
        order: 2,
        phone: '(720) 555-0189',
        email: 'dale.brandt@example.com',
        preferredContact: 'Phone',
        hasPortalAccess: true,
        notificationPrefs: 'Emergency notifications',
      },
    ],
    careTeam: [],
    carePlanVersion: 'v4.1',
    carePlanReviewDate: 'Feb 28, 2027',
    carePlanGoals: ['Pediatric enteral nutrition maintenance', 'Physical therapy mobility exercises', 'Sensory regulation'],
    adlList: [],
    authorizations: [],
    upcomingVisits: [],
    careNotes: [],
    adminNotes: [],
    documents: [],
    diagnoses: [{ code: 'G80.9', name: 'Cerebral Palsy, spastic' }, { code: 'Z93.1', name: 'Gastrostomy status (G-tube)' }],
    allergies: [{ name: 'Latex', reaction: 'Contact dermatitis', severity: 'Severe' }],
    medications: [],
    primaryDoctor: { name: 'Dr. Emily Foster, MD', clinic: 'Children\'s Hospital Colorado', phone: '(720) 777-1234' },
    preferredPharmacy: { name: 'Children\'s Hospital Pharmacy', address: 'Anschutz Medical Campus', phone: '(720) 777-3000' },
    hospitalPreference: 'Children\'s Hospital Colorado (Anschutz)',
    dnrOnFile: false,
    vitalsSummary: 'Last Vitals: Pediatric Normal · Weight: 58 lbs · G-tube site clean',
    incidents: [],
    attributes: [],
    billingRate: 32.50,
    billingSchedule: 'Weekly EDI',
    accountBalance: 0,
    recentClaims: [],
    assignedForms: [],
    timeline: [],
  },

  // 4. HARPER NGUYEN - HCBS EBD (ONBOARDING / EXPIRING)
  {
    id: 'HH-1004',
    name: 'Harper Nguyen',
    preferredName: 'Harper',
    title: 'Ms.',
    status: 'Onboarding',
    program: 'HCBS Elderly, Blind & Disabled',
    careArrangement: 'Agency',
    household: 'Nguyen Household (HH-1004)',
    householdId: 'HH-1004',
    alertNote: 'Onboarding stage: Assessment completed, awaiting Medicaid PAR approval.',
    alertStripMessage: '⚠️ Onboarding Alert: State PAR approval pending · Care plan draft ready for RN signature',
    needsAttentionCount: 1,
    phone: '(303) 555-0199',
    email: 'harper.nguyen@example.com',
    bestTimeToCall: 'Afternoons',
    contactPref: 'Email & SMS',
    address: '2410 9th St',
    city: 'Boulder',
    state: 'CO',
    zip: '80304',
    isAddressVerified: true,
    accessNotes: 'Call cell phone on arrival. Cat in home.',
    parkingInstructions: 'Driveway parking.',
    gateCode: 'None',
    billingSameAsResidential: true,
    billingAddress: 'Colorado HCPF Claims, Denver CO',
    gender: 'Female',
    pronouns: 'she/her',
    dob: '1975-08-22',
    age: 51,
    primaryLanguage: 'English',
    secondaryLanguage: 'Vietnamese',
    interpreterNeeded: false,
    maritalStatus: 'Single',
    ssnMasked: '***-**-9012',
    ssnFull: '521-90-9012',
    medicaidIdMasked: 'CO-HC-194012',
    medicaidIdFull: 'CO-HC-19401290',
    isMinor: false,
    leadCreatedDate: 'Oct 28, 2026',
    initialAssessmentDate: 'Nov 05, 2026',
    conversionDate: 'Nov 12, 2026',
    startDate: 'Dec 01, 2026',
    administrator: 'Maya R.',
    region: 'Boulder County',
    referredBy: 'Boulder Community Health',
    preferredCaregiver: 'Linh Nguyen',
    disableClockAlerts: false,
    invoicingId: 'INV-CO-1004',
    readinessScore: 78,
    onboardingStage: 'Auth Pending',
    caseManager: 'Dana Whitfield, RN',
    caseManagerPhone: '(303) 866-2993',
    caseManagerEmail: 'dana.whitfield@co-hcpf.org',
    nextRnVisit: 'Dec 12, 2026',
    authorizedHours: 20,
    authExpiry: 'Dec 12, 2026',
    authStatus: 'Expiring',
    responsibleParties: [
      {
        id: 'rp-n1',
        name: 'Linh Nguyen',
        relationship: 'Sister',
        legalRole: 'Emergency Contact & Care Partner',
        isEmergency: true,
        order: 1,
        phone: '(303) 555-0822',
        email: 'linh.nguyen@example.com',
        preferredContact: 'Phone & SMS',
        hasPortalAccess: true,
        notificationPrefs: 'Onboarding packet updates',
      },
    ],
    careTeam: [],
    carePlanVersion: 'v1.0 Draft',
    carePlanReviewDate: 'Dec 01, 2026',
    carePlanGoals: ['Post-surgical recovery assistance', 'Mobility support', 'Homemaker meal preparation'],
    adlList: [],
    authorizations: [],
    upcomingVisits: [],
    careNotes: [],
    adminNotes: [],
    documents: [],
    diagnoses: [{ code: 'M54.5', name: 'Low back pain' }, { code: 'Z96.651', name: 'Presence of right artificial knee joint' }],
    allergies: [],
    medications: [],
    primaryDoctor: { name: 'Dr. Sarah Lin, MD', clinic: 'Boulder Medical Center', phone: '(303) 440-3000' },
    preferredPharmacy: { name: 'Walgreens Boulder', address: '28th St', phone: '(303) 442-3200' },
    hospitalPreference: 'Boulder Community Health (Foothills)',
    dnrOnFile: false,
    vitalsSummary: 'Last BP: 118/76 mmHg',
    incidents: [],
    attributes: [],
    billingRate: 33.00,
    billingSchedule: 'Bi-weekly EDI',
    accountBalance: 0,
    recentClaims: [],
    assignedForms: [],
    timeline: [],
  },

  // 5. DESMOND CLARKE - IRSS RESIDENTIAL (ONBOARDING)
  {
    id: 'HH-1005',
    name: 'Desmond Clarke',
    preferredName: 'Desmond',
    title: 'Mr.',
    status: 'Onboarding',
    program: 'IRSS Residential Support',
    careArrangement: 'Hybrid',
    household: 'Clarke Household (HH-1005)',
    householdId: 'HH-1005',
    alertNote: 'Supported living setting; requires sensory decompression breaks.',
    needsAttentionCount: 1,
    phone: '(303) 555-0177',
    email: 'tasha.clarke@example.com',
    bestTimeToCall: 'Mornings',
    contactPref: 'Phone',
    address: '15200 E Colfax Ave',
    city: 'Aurora',
    state: 'CO',
    zip: '80011',
    isAddressVerified: true,
    accessNotes: 'Staffed residential home. Keycode on side porch: 3821.',
    parkingInstructions: 'Visitor parking on street.',
    gateCode: 'None',
    billingSameAsResidential: true,
    billingAddress: 'Colorado HCPF Claims, Denver CO',
    gender: 'Male',
    pronouns: 'he/him',
    dob: '1988-11-04',
    age: 38,
    primaryLanguage: 'English',
    interpreterNeeded: false,
    maritalStatus: 'Single',
    ssnMasked: '***-**-4412',
    ssnFull: '522-44-4412',
    medicaidIdMasked: 'CO-IR-991042',
    medicaidIdFull: 'CO-IR-99104211',
    isMinor: false,
    leadCreatedDate: 'Nov 01, 2026',
    initialAssessmentDate: 'Nov 08, 2026',
    conversionDate: 'Nov 14, 2026',
    startDate: 'Jan 01, 2027',
    administrator: 'Alicia T.',
    region: 'Arapahoe County',
    referredBy: 'Developmental Pathways Community Center',
    preferredCaregiver: 'Tasha Clarke',
    disableClockAlerts: false,
    invoicingId: 'INV-CO-1005',
    readinessScore: 68,
    onboardingStage: 'Intake Packet',
    caseManager: 'Priya Shah, MSW',
    caseManagerPhone: '(303) 866-9912',
    caseManagerEmail: 'priya.shah@co-hcpf.org',
    nextRnVisit: 'Jan 08, 2027',
    authorizedHours: 40,
    authExpiry: 'Pending',
    authStatus: 'Pending',
    responsibleParties: [
      {
        id: 'rp-c1',
        name: 'Tasha Clarke',
        relationship: 'Mother & Legal Representative',
        legalRole: 'Legal Guardian',
        isEmergency: true,
        order: 1,
        phone: '(303) 555-0177',
        email: 'tasha.clarke@example.com',
        preferredContact: 'Phone & SMS',
        hasPortalAccess: true,
        notificationPrefs: 'All onboarding & clinical notices',
      },
    ],
    careTeam: [],
    carePlanVersion: 'v1.0 Intake',
    carePlanReviewDate: 'Jan 01, 2027',
    carePlanGoals: ['Life skills development', 'Community integration', 'Behavioral self-regulation'],
    adlList: [],
    authorizations: [],
    upcomingVisits: [],
    careNotes: [],
    adminNotes: [],
    documents: [],
    diagnoses: [{ code: 'F84.0', name: 'Autistic disorder' }],
    allergies: [{ name: 'Peanuts', reaction: 'Anaphylaxis', severity: 'Severe' }],
    medications: [],
    primaryDoctor: { name: 'Dr. Gregory House, MD', clinic: 'Aurora Health Center', phone: '(303) 555-8812' },
    preferredPharmacy: { name: 'CVS Aurora', address: 'Colfax Ave', phone: '(303) 555-4421' },
    hospitalPreference: 'UCHealth University of Colorado Hospital',
    dnrOnFile: false,
    vitalsSummary: 'Vitals stable',
    incidents: [],
    attributes: [],
    billingRate: 36.00,
    billingSchedule: 'Monthly EDI',
    accountBalance: 0,
    recentClaims: [],
    assignedForms: [],
    timeline: [],
  },

  // 6. AIDEN PARK - PDN PRIVATE DUTY NURSING (EXPIRING AUTH)
  {
    id: 'HH-1006',
    name: 'Aiden Park',
    preferredName: 'Aiden',
    title: 'Mr.',
    status: 'Active',
    program: 'PDN Skilled Clinical Care',
    careArrangement: 'Agency',
    household: 'Park Household (HH-1006)',
    householdId: 'HH-1006',
    alertNote: 'Tracheostomy care & mechanical ventilator backup; RN or CNA under RN supervision required.',
    alertStripMessage: '⚠️ Attention: Authorization expires in 6 days (Nov 29, 2026) · PAR extension submitted',
    needsAttentionCount: 1,
    phone: '(303) 555-0166',
    email: 'grace.park@example.com',
    bestTimeToCall: 'Mornings (7:00 AM – 9:00 AM)',
    contactPref: 'Phone & SMS',
    address: '7100 W Colfax Ave',
    city: 'Lakewood',
    state: 'CO',
    zip: '80214',
    isAddressVerified: true,
    accessNotes: 'Emergency medical power supply in garage. Oxygen tanks clearly labeled.',
    parkingInstructions: 'Driveway parking reserved for clinical staff.',
    gateCode: 'None',
    billingSameAsResidential: true,
    billingAddress: 'Colorado HCPF Claims, Denver CO',
    gender: 'Male',
    pronouns: 'he/him',
    dob: '1992-04-12',
    age: 34,
    primaryLanguage: 'English',
    secondaryLanguage: 'Korean',
    interpreterNeeded: false,
    maritalStatus: 'Single',
    ssnMasked: '***-**-6621',
    ssnFull: '518-66-6621',
    medicaidIdMasked: 'CO-PD-331048',
    medicaidIdFull: 'CO-PD-33104899',
    isMinor: false,
    leadCreatedDate: 'Jan 15, 2025',
    initialAssessmentDate: 'Jan 20, 2025',
    conversionDate: 'Jan 28, 2025',
    startDate: 'Feb 15, 2025',
    administrator: 'Jon P.',
    region: 'Jefferson County',
    referredBy: 'Craig Hospital Spinal Rehabilitation',
    preferredCaregiver: 'Grace Park / Nurse Dana Whitfield',
    disableClockAlerts: false,
    invoicingId: 'INV-CO-1006',
    readinessScore: 92,
    onboardingStage: 'Active Care',
    caseManager: 'Tom Okafor, MSW',
    caseManagerPhone: '(303) 866-4812',
    caseManagerEmail: 'tom.okafor@co-hcpf.org',
    nextRnVisit: 'Nov 29, 2026',
    authorizedHours: 45,
    authExpiry: 'Nov 29, 2026',
    authStatus: 'Expiring',
    responsibleParties: [
      {
        id: 'rp-p1',
        name: 'Grace Park',
        relationship: 'Mother & Primary Care Coordinator',
        legalRole: 'Legal Guardian & Healthcare Proxy',
        isEmergency: true,
        order: 1,
        phone: '(303) 555-0166',
        email: 'grace.park@example.com',
        preferredContact: 'Phone & SMS',
        hasPortalAccess: true,
        notificationPrefs: 'Immediate clinical alerts & shift handoffs',
      },
    ],
    careTeam: [],
    carePlanVersion: 'v5.0 Clinical',
    carePlanReviewDate: 'Nov 29, 2026',
    carePlanGoals: ['Tracheostomy suctioning & airway clearance', 'Ventilator circuit checks', 'Skin integrity maintenance'],
    adlList: [],
    authorizations: [],
    upcomingVisits: [],
    careNotes: [],
    adminNotes: [],
    documents: [],
    diagnoses: [{ code: 'G82.50', name: 'Quadriplegia, unspecified' }, { code: 'Z99.11', name: 'Dependence on respirator [ventilator]' }],
    allergies: [],
    medications: [],
    primaryDoctor: { name: 'Dr. Michael Craig, MD', clinic: 'Craig Hospital', phone: '(303) 789-8000' },
    preferredPharmacy: { name: 'Option Care Specialty Pharmacy', address: 'Denver CO', phone: '(303) 555-9000' },
    hospitalPreference: 'Craig Hospital / St. Anthony Hospital Lakewood',
    dnrOnFile: false,
    vitalsSummary: 'SpO2: 98% on room air · Trach site clean & intact · Vitals stable',
    incidents: [],
    attributes: [],
    billingRate: 58.00,
    billingSchedule: 'Weekly EDI',
    accountBalance: 0,
    recentClaims: [],
    assignedForms: [],
    timeline: [],
  },

  // 7. JOSEFINA RUIZ - HMA (ON HOLD / EXPIRED AUTH)
  {
    id: 'HH-1007',
    name: 'Josefina Ruiz',
    preferredName: 'Josefina',
    title: 'Mrs.',
    status: 'On Hold',
    program: 'HMA Delegated Nursing',
    careArrangement: 'Family Care',
    household: 'Ruiz Household (HH-1007)',
    householdId: 'HH-1007',
    alertNote: 'On hold pending state Medicaid re-authorization. Son Luis Ruiz is caregiver.',
    alertStripMessage: '⛔ On Hold: State Medicaid authorization expired. Awaiting re-certification from Case Manager Priya Shah.',
    needsAttentionCount: 2,
    phone: '(303) 555-0155',
    email: 'luis.ruiz@example.com',
    bestTimeToCall: 'Afternoons',
    contactPref: 'Phone',
    address: '3200 Federal Blvd',
    city: 'Denver',
    state: 'CO',
    zip: '80211',
    isAddressVerified: true,
    accessNotes: 'First floor apartment. Spanish speaker.',
    parkingInstructions: 'Street parking.',
    gateCode: 'None',
    billingSameAsResidential: true,
    billingAddress: 'Colorado HCPF Claims, Denver CO',
    gender: 'Female',
    pronouns: 'she/her',
    dob: '1952-01-30',
    age: 74,
    primaryLanguage: 'Spanish',
    interpreterNeeded: true,
    maritalStatus: 'Widowed',
    ssnMasked: '***-**-1109',
    ssnFull: '519-11-1109',
    medicaidIdMasked: 'CO-HM-551092',
    medicaidIdFull: 'CO-HM-55109211',
    isMinor: false,
    leadCreatedDate: 'Sep 10, 2025',
    initialAssessmentDate: 'Sep 18, 2025',
    conversionDate: 'Oct 01, 2025',
    startDate: 'Oct 15, 2025',
    administrator: 'Alicia T.',
    region: 'Denver Metro',
    referredBy: 'Denver Health Northwest Clinic',
    preferredCaregiver: 'Luis Ruiz',
    disableClockAlerts: true,
    invoicingId: 'INV-CO-1007',
    readinessScore: 62,
    onboardingStage: 'Auth Pending',
    caseManager: 'Priya Shah, MSW',
    caseManagerPhone: '(303) 866-9912',
    caseManagerEmail: 'priya.shah@co-hcpf.org',
    nextRnVisit: 'Overdue (On Hold)',
    authorizedHours: 18,
    authExpiry: 'Oct 31, 2026',
    authStatus: 'Expired',
    responsibleParties: [
      {
        id: 'rp-r1',
        name: 'Luis Ruiz',
        relationship: 'Son & Caregiver',
        legalRole: 'Legal Guardian',
        isEmergency: true,
        order: 1,
        phone: '(303) 555-0155',
        email: 'luis.ruiz@example.com',
        preferredContact: 'Phone',
        hasPortalAccess: true,
        notificationPrefs: 'Authorizations & state recertification calls',
      },
    ],
    careTeam: [],
    carePlanVersion: 'v2.1',
    carePlanReviewDate: 'Overdue',
    carePlanGoals: ['Diabetic insulin administration supervision', 'Dietary monitoring', 'Fall prevention'],
    adlList: [],
    authorizations: [],
    upcomingVisits: [],
    careNotes: [],
    adminNotes: [],
    documents: [],
    diagnoses: [{ code: 'E11.65', name: 'Type 2 Diabetes with hyperglycemia' }],
    allergies: [],
    medications: [],
    primaryDoctor: { name: 'Dr. Maria Santos, MD', clinic: 'Denver Health NW', phone: '(303) 555-3211' },
    preferredPharmacy: { name: 'Walgreens Federal Blvd', address: 'Denver CO', phone: '(303) 555-9988' },
    hospitalPreference: 'Denver Health',
    dnrOnFile: false,
    vitalsSummary: 'On hold pending recertification',
    incidents: [],
    attributes: [],
    billingRate: 34.00,
    billingSchedule: 'Bi-weekly EDI',
    accountBalance: 0,
    recentClaims: [],
    assignedForms: [],
    timeline: [],
  },

  // 8. WALTER HAYES - CFC (PORTLAND SUBURB / GRESHAM)
  {
    id: 'HH-1008',
    name: 'Walter Hayes',
    preferredName: 'Walt',
    title: 'Mr.',
    status: 'Active',
    program: 'CFC Community First Choice',
    careArrangement: 'Agency',
    household: 'Hayes Household (HH-1008)',
    householdId: 'HH-1008',
    alertNote: 'Hearing impaired; speak clearly facing client. Spouse Beth assists with scheduling.',
    needsAttentionCount: 0,
    phone: '(503) 555-0133',
    email: 'beth.hayes@example.com',
    bestTimeToCall: 'Mornings (10:00 AM – 12:00 PM)',
    contactPref: 'Phone & SMS',
    address: '1840 SE 182nd Ave',
    city: 'Gresham',
    state: 'OR',
    zip: '97030',
    isAddressVerified: true,
    accessNotes: 'Single level ranch house. Side doorbell rings loud chime.',
    parkingInstructions: 'Driveway parking.',
    gateCode: 'None',
    billingSameAsResidential: true,
    billingAddress: 'Oregon DHS HCPF Claims, Salem OR',
    gender: 'Male',
    pronouns: 'he/him',
    dob: '1946-07-19',
    age: 80,
    primaryLanguage: 'English',
    interpreterNeeded: false,
    maritalStatus: 'Married',
    ssnMasked: '***-**-2201',
    ssnFull: '511-22-2201',
    medicaidIdMasked: 'OR-CF-882019',
    medicaidIdFull: 'OR-CF-88201944',
    isMinor: false,
    leadCreatedDate: 'May 04, 2025',
    initialAssessmentDate: 'May 12, 2025',
    conversionDate: 'May 20, 2025',
    startDate: 'Jun 01, 2025',
    administrator: 'Maya R.',
    region: 'East Multnomah County',
    referredBy: 'Legacy Mount Hood Medical Center',
    preferredCaregiver: 'Beth Hayes / Agency Staff',
    disableClockAlerts: false,
    invoicingId: 'INV-OR-1008',
    readinessScore: 95,
    onboardingStage: 'Active Care',
    caseManager: 'Dana Whitfield, RN',
    caseManagerPhone: '(503) 988-7712',
    caseManagerEmail: 'dana.whitfield@multco.us',
    nextRnVisit: 'Feb 02, 2027',
    authorizedHours: 24,
    authExpiry: 'Mar 15, 2027',
    authStatus: 'Active',
    responsibleParties: [
      {
        id: 'rp-h1',
        name: 'Beth Hayes',
        relationship: 'Spouse',
        legalRole: 'Legal Spouse & Healthcare Proxy',
        isEmergency: true,
        order: 1,
        phone: '(503) 555-0133',
        email: 'beth.hayes@example.com',
        preferredContact: 'Phone & SMS',
        hasPortalAccess: true,
        notificationPrefs: 'Shift reminders and monthly caregiver logs',
      },
    ],
    careTeam: [],
    carePlanVersion: 'v2.0',
    carePlanReviewDate: 'Mar 15, 2027',
    carePlanGoals: ['Hearing aid maintenance and safety reminders', 'Assistance with shower and balance', 'Light housekeeping'],
    adlList: [],
    authorizations: [],
    upcomingVisits: [],
    careNotes: [],
    adminNotes: [],
    documents: [],
    diagnoses: [{ code: 'H90.3', name: 'Sensorineural hearing loss, bilateral' }, { code: 'I10', name: 'Hypertension' }],
    allergies: [],
    medications: [],
    primaryDoctor: { name: 'Dr. Robert Chen, MD', clinic: 'Legacy Medical Group Gresham', phone: '(503) 667-1111' },
    preferredPharmacy: { name: 'Safeway Pharmacy Gresham', address: 'Burnside Rd', phone: '(503) 667-2200' },
    hospitalPreference: 'Legacy Mount Hood Medical Center',
    dnrOnFile: true,
    vitalsSummary: 'Last BP: 130/80 mmHg · Weight: 172 lbs',
    incidents: [],
    attributes: [],
    billingRate: 34.50,
    billingSchedule: 'Bi-weekly EDI',
    accountBalance: 0,
    recentClaims: [],
    assignedForms: [],
    timeline: [],
  },

  // 9. PRIYA RAMAN - HCBS SUPPORTED LIVING (BEAVERTON OR)
  {
    id: 'HH-1009',
    name: 'Priya Raman',
    preferredName: 'Priya',
    title: 'Ms.',
    status: 'Active',
    program: 'HCBS Supported Living',
    careArrangement: 'Hybrid',
    household: 'Raman Household (HH-1009)',
    householdId: 'HH-1009',
    alertNote: 'Independent young adult in apartment; assistance with meal planning, budget, and medication organization.',
    needsAttentionCount: 0,
    phone: '(503) 555-0122',
    email: 'anand.raman@example.com',
    bestTimeToCall: 'Evenings (4:00 PM – 6:00 PM)',
    contactPref: 'SMS & Email',
    address: '4200 SW 110th Ave',
    city: 'Beaverton',
    state: 'OR',
    zip: '97005',
    isAddressVerified: true,
    accessNotes: 'Apartment building #3, intercom buzz code 042.',
    parkingInstructions: 'Visitor parking stall #12.',
    gateCode: '#3312',
    billingSameAsResidential: true,
    billingAddress: 'Oregon DHS HCPF Claims, Salem OR',
    gender: 'Female',
    pronouns: 'she/her',
    dob: '1995-12-05',
    age: 30,
    primaryLanguage: 'English',
    secondaryLanguage: 'Tamil',
    interpreterNeeded: false,
    maritalStatus: 'Single',
    ssnMasked: '***-**-8834',
    ssnFull: '512-88-8834',
    medicaidIdMasked: 'OR-HC-771029',
    medicaidIdFull: 'OR-HC-77102988',
    isMinor: false,
    leadCreatedDate: 'Jul 10, 2025',
    initialAssessmentDate: 'Jul 18, 2025',
    conversionDate: 'Jul 29, 2025',
    startDate: 'Aug 15, 2025',
    administrator: 'Maya R.',
    region: 'Washington County (OR)',
    referredBy: 'Washington County Developmental Disabilities',
    preferredCaregiver: 'Anand Raman (Brother)',
    disableClockAlerts: false,
    invoicingId: 'INV-OR-1009',
    readinessScore: 97,
    onboardingStage: 'Active Care',
    caseManager: 'Tom Okafor, MSW',
    caseManagerPhone: '(503) 988-5432',
    caseManagerEmail: 'tom.okafor@multco.us',
    nextRnVisit: 'Jan 19, 2027',
    authorizedHours: 30,
    authExpiry: 'Apr 20, 2027',
    authStatus: 'Active',
    responsibleParties: [
      {
        id: 'rp-rm1',
        name: 'Anand Raman',
        relationship: 'Brother & Legal Representative',
        legalRole: 'Power of Attorney & Healthcare Representative',
        isEmergency: true,
        order: 1,
        phone: '(503) 555-0991',
        email: 'anand.raman@example.com',
        preferredContact: 'Phone & SMS',
        hasPortalAccess: true,
        notificationPrefs: 'Weekly shift reports and monthly ISP review',
      },
    ],
    careTeam: [],
    carePlanVersion: 'v3.0',
    carePlanReviewDate: 'Apr 20, 2027',
    carePlanGoals: ['Independent meal shopping and nutrition', 'Medication weekly pillbox refill', 'Public transit navigation to work'],
    adlList: [],
    authorizations: [],
    upcomingVisits: [],
    careNotes: [],
    adminNotes: [],
    documents: [],
    diagnoses: [{ code: 'F70', name: 'Mild intellectual disability' }],
    allergies: [],
    medications: [],
    primaryDoctor: { name: 'Dr. Jason Lee, MD', clinic: 'Providence St. Vincent Beaverton', phone: '(503) 291-5000' },
    preferredPharmacy: { name: 'Costco Pharmacy Beaverton', address: 'SW Jenkins Rd', phone: '(503) 555-4921' },
    hospitalPreference: 'Providence St. Vincent Medical Center',
    dnrOnFile: false,
    vitalsSummary: 'Vitals normal · Active in community vocational center',
    incidents: [],
    attributes: [],
    billingRate: 34.50,
    billingSchedule: 'Bi-weekly EDI',
    accountBalance: 0,
    recentClaims: [],
    assignedForms: [],
    timeline: [],
  },

  // 10. ELEANOR VANCE - MEDICAID K-PLAN (HILLSBORO OR)
  {
    id: 'HH-1010',
    name: 'Eleanor Vance',
    preferredName: 'Ellie',
    title: 'Mrs.',
    status: 'Active',
    program: 'Medicaid K-Plan',
    careArrangement: 'Agency',
    household: 'Vance Household (HH-1010)',
    householdId: 'HH-1010',
    alertNote: 'High fall risk; uses electric lift chair and walker. Cat named Whiskers.',
    needsAttentionCount: 0,
    phone: '(503) 555-0111',
    email: 'eleanor.vance@example.com',
    bestTimeToCall: 'Mornings (9:00 AM – 11:00 AM)',
    contactPref: 'Phone',
    address: '890 NE Jackson St',
    city: 'Hillsboro',
    state: 'OR',
    zip: '97124',
    isAddressVerified: true,
    accessNotes: 'Front ramp. Key in lockbox code 1010.',
    parkingInstructions: 'Driveway parking.',
    gateCode: 'None',
    billingSameAsResidential: true,
    billingAddress: 'Oregon DHS HCPF Claims, Salem OR',
    gender: 'Female',
    pronouns: 'she/her',
    dob: '1942-02-18',
    age: 84,
    primaryLanguage: 'English',
    interpreterNeeded: false,
    maritalStatus: 'Widowed',
    ssnMasked: '***-**-5599',
    ssnFull: '510-55-5599',
    medicaidIdMasked: 'OR-K-441092',
    medicaidIdFull: 'OR-K-44109277',
    isMinor: false,
    leadCreatedDate: 'Aug 14, 2025',
    initialAssessmentDate: 'Aug 22, 2025',
    conversionDate: 'Sep 02, 2025',
    startDate: 'Sep 15, 2025',
    administrator: 'Maya R.',
    region: 'Washington County (OR)',
    referredBy: 'Tuality Healthcare (Hillsboro)',
    preferredCaregiver: 'Devon Brooks',
    disableClockAlerts: false,
    invoicingId: 'INV-OR-1010',
    readinessScore: 94,
    onboardingStage: 'Active Care',
    caseManager: 'Tom Okafor, MSW',
    caseManagerPhone: '(503) 988-5432',
    caseManagerEmail: 'tom.okafor@multco.us',
    nextRnVisit: 'Jan 30, 2027',
    authorizedHours: 26,
    authExpiry: 'Jan 30, 2027',
    authStatus: 'Active',
    responsibleParties: [
      {
        id: 'rp-ev1',
        name: 'Marcus Vance',
        relationship: 'Son',
        legalRole: 'Power of Attorney',
        isEmergency: true,
        order: 1,
        phone: '(503) 555-0199',
        email: 'marcus.vance@example.com',
        preferredContact: 'Phone & SMS',
        hasPortalAccess: true,
        notificationPrefs: 'Shift start/end and weekly RN updates',
      },
    ],
    careTeam: [],
    carePlanVersion: 'v2.2',
    carePlanReviewDate: 'Jan 30, 2027',
    carePlanGoals: ['Bathing standby and fall prevention', 'Meal prep and diabetic snack schedule', 'Medication prompt at 8:30 AM'],
    adlList: [],
    authorizations: [],
    upcomingVisits: [],
    careNotes: [],
    adminNotes: [],
    documents: [],
    diagnoses: [{ code: 'M16.1', name: 'Unilateral primary osteoarthritis, right hip' }, { code: 'I10', name: 'Hypertension' }],
    allergies: [],
    medications: [],
    primaryDoctor: { name: 'Dr. Timothy Hayes, MD', clinic: 'OHSU Hillsboro Medical Center', phone: '(503) 681-1111' },
    preferredPharmacy: { name: 'Fred Meyer Pharmacy Hillsboro', address: 'TV Highway', phone: '(503) 555-6677' },
    hospitalPreference: 'Hillsboro Medical Center (OHSU Health)',
    dnrOnFile: true,
    vitalsSummary: 'Last BP: 126/80 mmHg · Weight: 138 lbs',
    incidents: [],
    attributes: [],
    billingRate: 34.50,
    billingSchedule: 'Bi-weekly EDI',
    accountBalance: 0,
    recentClaims: [],
    assignedForms: [],
    timeline: [],
  },

  // 11. THOMAS MILLER - VA AID & ATTENDANCE (DISCHARGED)
  {
    id: 'HH-1011',
    name: 'Thomas Miller',
    preferredName: 'Tom',
    title: 'Mr.',
    status: 'Discharged',
    program: 'VA Aid & Attendance',
    careArrangement: 'Agency',
    household: 'Miller Household (HH-1011)',
    householdId: 'HH-1011',
    alertNote: 'Discharged on Oct 31, 2026: Relocated to veteran residential assisted living in Bend OR.',
    needsAttentionCount: 0,
    phone: '(503) 555-0181',
    email: 'thomas.miller@example.com',
    bestTimeToCall: 'Mornings',
    contactPref: 'Phone',
    address: '3120 SE Division St',
    city: 'Portland',
    state: 'OR',
    zip: '97202',
    isAddressVerified: true,
    accessNotes: 'Record archived.',
    parkingInstructions: 'None.',
    gateCode: 'None',
    billingSameAsResidential: true,
    billingAddress: 'VA Portland Health Care System',
    gender: 'Male',
    pronouns: 'he/him',
    dob: '1940-05-10',
    age: 86,
    primaryLanguage: 'English',
    interpreterNeeded: false,
    maritalStatus: 'Widowed',
    ssnMasked: '***-**-1094',
    ssnFull: '511-10-1094',
    medicaidIdMasked: 'VA-AA-100293',
    medicaidIdFull: 'VA-AA-10029300',
    isMinor: false,
    leadCreatedDate: 'Jan 10, 2024',
    initialAssessmentDate: 'Jan 18, 2024',
    conversionDate: 'Jan 28, 2024',
    startDate: 'Feb 01, 2024',
    endDate: 'Oct 31, 2026',
    administrator: 'Alicia T.',
    region: 'Portland Metro',
    referredBy: 'Portland VA Medical Center',
    preferredCaregiver: 'Karen Brandt',
    disableClockAlerts: true,
    invoicingId: 'INV-VA-1011',
    readinessScore: 100,
    onboardingStage: 'Active Care',
    caseManager: 'Robert Garcia, MSW (VA)',
    caseManagerPhone: '(503) 220-8262',
    caseManagerEmail: 'robert.garcia@va.gov',
    nextRnVisit: 'Discharged',
    authorizedHours: 15,
    authExpiry: 'Expired',
    authStatus: 'Expired',
    responsibleParties: [
      {
        id: 'rp-tm1',
        name: 'James Miller',
        relationship: 'Son',
        legalRole: 'Legal Guardian',
        isEmergency: true,
        order: 1,
        phone: '(503) 555-0941',
        email: 'james.miller@example.com',
        preferredContact: 'Phone',
        hasPortalAccess: false,
        notificationPrefs: 'Discharge summary on file',
      },
    ],
    careTeam: [],
    carePlanVersion: 'v1.4 Final',
    carePlanReviewDate: 'Discharged',
    carePlanGoals: ['Discharged to VA Community Living Center in Bend, OR'],
    adlList: [],
    authorizations: [],
    upcomingVisits: [],
    careNotes: [],
    adminNotes: [],
    documents: [],
    diagnoses: [{ code: 'I25.10', name: 'Atherosclerotic heart disease' }],
    allergies: [],
    medications: [],
    primaryDoctor: { name: 'Dr. William Baker, MD', clinic: 'Portland VA Medical Center', phone: '(503) 220-8262' },
    preferredPharmacy: { name: 'VA Outpatient Pharmacy', address: 'Portland OR', phone: '(503) 220-8262' },
    hospitalPreference: 'Portland VA Medical Center',
    dnrOnFile: true,
    vitalsSummary: 'Archived record',
    incidents: [],
    attributes: [],
    billingRate: 38.00,
    billingSchedule: 'Monthly VA Voucher',
    accountBalance: 0,
    recentClaims: [],
    assignedForms: [],
    timeline: [],
  },
];
