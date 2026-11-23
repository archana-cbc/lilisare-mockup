export type PillColor = 'red' | 'amber' | 'green' | 'gray' | 'gold';

export interface ClientRecord {
  id: string;
  name: string;
  program: string;
  caseManager: string;
  caregivers: string[];
  authorization: string;
  nextRnVisit: string;
  status?: 'Onboarding' | 'Active' | 'On Hold' | 'Discharged';
  careArrangement?: 'Agency' | 'Family Care' | 'Hybrid';
  household?: string;
  phone?: string;
  email?: string;
  city?: string;
  authorizedHours?: number;
  authExpiry?: string;
  region?: string;
  responsibleParties?: Array<{ name: string; relationship: string; phone: string }>;
}

export interface CaregiverRecord {
  id: string;
  name: string;
  serviceClass: string;
  ca: string;
  nextExpiring: string;
  expiringColor: PillColor;
  academyProgress: number;
  employmentType: 'Employee' | '1099' | 'Both';
  isFamily: boolean;
}

export interface HouseholdRecord {
  id: string;
  clientName: string;
  caregivers: string[];
  service: string;
  clientProgress: number;
  caregiverProgress: number;
  currentStepIndex: number;
  seed: number;
  caseManager?: string;
  authorizationStatus?: 'Approved' | 'Awaiting state' | 'Pending';
  familyName?: string;
  clientPacketStatus?: 'Signed' | 'Sent' | 'Missing';
  caregiverEmploymentType?: 'Employee' | '1099' | 'Both';
}

export interface CaregiverApplicant {
  id: string;
  name: string;
  stage: string;
  employmentType: 'Employee' | '1099' | 'Both';
  serviceClass: string;
  phone: string;
  email: string;
  county: string;
  source: 'Indeed' | 'Referral' | 'Website' | 'Job Fair' | 'Phone Call' | 'Direct Call';
  appliedDate: string;
  daysInStage: number;
  currentStep: number;
  owner: string;
  targetRate?: string;
  preferredHours?: string;
  cprStatus?: 'Valid' | 'Needed' | 'Scheduled' | 'Expired';
  tbStatus?: 'Valid' | 'Needed';
  cbiStatus?: 'Pending' | 'Clear' | 'Flagged';
  interviewDate?: string;
  notes?: string;
  commLog?: Array<{ date: string; type: 'Call' | 'Email' | 'SMS' | 'Note'; text: string; staff: string }>;
  activityLog?: Array<{ date: string; text: string; isAutomated?: boolean }>;
}

export interface DocumentItem {
  n: string;
  s: 'Verified' | 'Submitted' | 'Sent' | 'Rejected';
  sent: string;
  sub: string;
  who: string;
  rem: string;
}

export interface InquiryCard {
  id: string;
  stage: string;
  clientName: string;
  source: string;
  service: string;
  staff: string;
  followUp: string;
  isOverdue?: boolean;
  daysInStage: number;
  currentStep: number; // 1 to 7
  statusChip?: 'Awaiting case manager' | 'Docs missing' | 'Payment at risk' | 'Auto follow-up sent';
  closedReason?: string;
  age?: number;
  county?: string;
  responsibleParty?: string;
  phone?: string;
  email?: string;
  address?: string;
  preferredLanguage?: 'English' | 'Spanish';
  estimatedHours?: number;
  careNeeds?: string[];
  caseManagerName?: string;
  caseManagerAgency?: string;
  caseManagerEmail?: string;
  caseManagerPhone?: string;
  authStatus?: 'Requested' | 'Awaiting state' | 'Approved' | 'Overdue';
  authDaysWaiting?: number;
  packetStatus?: 'Sent' | 'Signed' | 'Missing';
  notes?: string;
  nextBestAction?: string;
  isNextBestAutomated?: boolean;
  commLog?: Array<{ date: string; type: 'Call' | 'Email' | 'SMS' | 'Note'; text: string; staff: string }>;
  activityLog?: Array<{ date: string; text: string; isAutomated?: boolean }>;
}

export interface ShiftItem {
  dayIndex: number;
  timeSlot: string;
  client: string;
  caregiver: string | null;
}

export interface EvvException {
  type: string;
  caregiver: string;
  client: string;
  time: string;
  status: 'Open' | 'Pending approval' | 'Approved' | 'Denied' | 'Correction requested';
}

export interface ComplianceItem {
  caregiver: string;
  item: string;
  due: string;
  color: PillColor;
}

export interface RnTrackerItem {
  program: string;
  description: string;
  completed: number;
  total: number;
}

export interface AuditNoteItem {
  id: number;
  caregiver: string;
  client: string;
  date: string;
  originalText: string;
  flaggedPhrases: string;
  suggestedText: string;
}

export interface EmailTemplate {
  title: string;
  body: string;
}

export interface StateApproval {
  client: string;
  caseManager: string;
  requestType: string;
  sentDate: string;
  status: string;
}

export interface ClaimItem {
  claimId: string;
  npi: string;
  client: string;
  program: string;
  amount: number;
  status: 'Paid' | 'Submitted' | 'Denied';
}

export interface ProfitItem {
  program: string;
  revenue: number;
  cost: number;
}

export interface ConnectedSystem {
  name: string;
  description: string;
  release: string;
}

export interface ScreeningItem {
  caregiver: string;
  checkType: string;
  provider: string;
  requestedDate: string;
  result: string;
  expiry: string;
  status: 'Complete' | 'Pending' | 'Flagged' | 'Expiring soon';
}

export interface FeedItem {
  t: string;
  ago: string;
  h?: boolean;
}
