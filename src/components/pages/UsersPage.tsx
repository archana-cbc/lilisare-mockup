'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { CL } from '@/data/mockData';

// User record type
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  businessLine: string;
  programScope: string[];
  caseloadSummary: string;
  assignedClientIds: string[];
  status: 'Active' | 'Invited' | 'Suspended' | 'Deactivated';
  mfaEnforced: boolean;
  lastLogin: string;
  phone?: string;
  title?: string;
  createdDate: string;
  sessions: Array<{
    device: string;
    location: string;
    lastActive: string;
    isCurrent: boolean;
  }>;
  recentEvents: Array<{
    timestamp: string;
    action: string;
    target: string;
    ip: string;
  }>;
}

// Role definition type
export interface RoleDefinition {
  id: string;
  name: string;
  tier: 'Internal' | 'External';
  isSystem: boolean;
  description: string;
  userCount: number;
  permissions: Record<string, {
    access: 'No access' | 'View only' | 'View and edit' | 'Full';
    scope: 'All agency data' | 'My business line' | 'My programs' | 'My caseload only' | 'Linked clients only';
  }>;
  sensitiveToggles: Record<string, boolean>;
}

// Audit log entry type
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  userEmail: string;
  action: 'Viewed record' | 'Edited record' | 'Exported data' | 'Role changed' | 'Invite sent' | 'Login' | 'Failed login' | 'Break-glass used';
  target: string;
  businessLine: string;
  ip: string;
  result: 'Success' | 'Denied' | 'Flagged';
  details?: string;
}

// Initial Mock Users
const INITIAL_USERS: UserRecord[] = [
  {
    id: 'USR-01',
    name: 'Lisa Connell',
    email: 'lisa.c@lilisare.com',
    role: 'Administrator',
    businessLine: 'Mountain Lane',
    programScope: ['IHSS', 'CFC', 'HCBS', 'IRSS', 'HMA', 'PDN'],
    caseloadSummary: 'All agency clients',
    assignedClientIds: ['C-1001', 'C-1002', 'C-1003', 'C-1004'],
    status: 'Active',
    mfaEnforced: true,
    lastLogin: '14 min ago',
    phone: '(303) 555-0142',
    title: 'Agency Director & Compliance Administrator',
    createdDate: 'Jan 12, 2024',
    sessions: [
      { device: 'Chrome on Windows 11', location: 'Denver, CO', lastActive: 'Active now', isCurrent: true },
      { device: 'LiliSare Mobile (iOS 18)', location: 'Denver, CO', lastActive: '2h ago', isCurrent: false },
    ],
    recentEvents: [
      { timestamp: 'Nov 18 · 12:20 PM', action: 'Approved Care Note NOTE-104', target: 'Client ••••1002', ip: '192.168.1.42' },
      { timestamp: 'Nov 18 · 11:45 AM', action: 'Exported ADP Payroll CSV', target: 'Payroll Batch #412', ip: '192.168.1.42' },
      { timestamp: 'Nov 18 · 09:12 AM', action: 'Login with MFA', target: 'Web Portal', ip: '192.168.1.42' },
    ],
  },
  {
    id: 'USR-02',
    name: 'Carolina T.',
    email: 'carolina.t@lilisare.com',
    role: 'Executive / Owner',
    businessLine: 'Colorado Home Health',
    programScope: ['All Programs'],
    caseloadSummary: 'Agency-wide (Read-only)',
    assignedClientIds: [],
    status: 'Active',
    mfaEnforced: true,
    lastLogin: '2 hours ago',
    phone: '(303) 555-0188',
    title: 'Managing Partner',
    createdDate: 'Feb 01, 2024',
    sessions: [
      { device: 'Safari on macOS', location: 'Boulder, CO', lastActive: '2 hours ago', isCurrent: false },
    ],
    recentEvents: [
      { timestamp: 'Nov 18 · 10:15 AM', action: 'Viewed Executive Profitability', target: 'Executive Dashboard', ip: '174.52.19.8' },
      { timestamp: 'Nov 18 · 09:30 AM', action: 'Viewed Intake Pipeline Stats', target: 'Intake Pipeline', ip: '174.52.19.8' },
    ],
  },
  {
    id: 'USR-03',
    name: 'Maya R.',
    email: 'maya.r@lilisare.com',
    role: 'Enrollment Coordinator',
    businessLine: 'Mountain Lane',
    programScope: ['IHSS', 'CFC'],
    caseloadSummary: '14 active inquiries',
    assignedClientIds: ['C-1001', 'C-1003'],
    status: 'Active',
    mfaEnforced: true,
    lastLogin: '35 min ago',
    phone: '(720) 555-0211',
    title: 'Client Intake Specialist',
    createdDate: 'Mar 15, 2024',
    sessions: [
      { device: 'Chrome on Windows 10', location: 'Aurora, CO', lastActive: '35 min ago', isCurrent: false },
    ],
    recentEvents: [
      { timestamp: 'Nov 18 · 11:50 AM', action: 'Updated Inquiry Stage to Needs Discussion', target: 'Marisol Vega (C-1001)', ip: '192.168.2.14' },
      { timestamp: 'Nov 18 · 10:11 AM', action: 'Sent Case Manager Follow-up Email', target: 'Dana Whitfield (RMHS)', ip: '192.168.2.14' },
    ],
  },
  {
    id: 'USR-04',
    name: 'Jon P.',
    email: 'jon.p@lilisare.com',
    role: 'Caregiver Onboarding Specialist',
    businessLine: 'Mountain Lane',
    programScope: ['IHSS', 'IRSS'],
    caseloadSummary: '18 applicant households',
    assignedClientIds: ['C-1002'],
    status: 'Active',
    mfaEnforced: true,
    lastLogin: '1 hour ago',
    phone: '(720) 555-0319',
    title: 'Recruitment & Onboarding Lead',
    createdDate: 'Apr 10, 2024',
    sessions: [
      { device: 'Edge on Windows 11', location: 'Denver, CO', lastActive: '1 hour ago', isCurrent: false },
    ],
    recentEvents: [
      { timestamp: 'Nov 18 · 11:00 AM', action: 'Approved Caregiver Background Check', target: 'Luis Ruiz (CG-2006)', ip: '192.168.1.88' },
      { timestamp: 'Nov 18 · 09:40 AM', action: 'Sent I-9 Verification Packet', target: 'Karen Brandt (CG-2002)', ip: '192.168.1.88' },
    ],
  },
  {
    id: 'USR-05',
    name: 'Alicia T.',
    email: 'alicia.t@lilisare.com',
    role: 'Enrollment Coordinator',
    businessLine: 'Colorado Home Health',
    programScope: ['CFC', 'HCBS'],
    caseloadSummary: '11 active inquiries',
    assignedClientIds: ['C-1004'],
    status: 'Active',
    mfaEnforced: true,
    lastLogin: 'Yesterday',
    phone: '(303) 555-0455',
    title: 'Intake Coordinator',
    createdDate: 'May 02, 2024',
    sessions: [
      { device: 'Firefox on Windows', location: 'Lakewood, CO', lastActive: 'Yesterday', isCurrent: false },
    ],
    recentEvents: [
      { timestamp: 'Nov 17 · 04:30 PM', action: 'Logged Case Manager Inquiry Call', target: 'Desmond Clarke (C-1004)', ip: '192.168.3.12' },
    ],
  },
  {
    id: 'USR-06',
    name: 'Sam K.',
    email: 'sam.k@lilisare.com',
    role: 'Compliance Officer',
    businessLine: 'All Branches',
    programScope: ['All Programs'],
    caseloadSummary: '36 total active caregivers',
    assignedClientIds: ['C-1005'],
    status: 'Active',
    mfaEnforced: true,
    lastLogin: '3 hours ago',
    phone: '(720) 555-0612',
    title: 'Quality & Regulatory Director',
    createdDate: 'Feb 15, 2024',
    sessions: [
      { device: 'Chrome on macOS', location: 'Denver, CO', lastActive: '3 hours ago', isCurrent: false },
    ],
    recentEvents: [
      { timestamp: 'Nov 18 · 09:20 AM', action: 'Audited EVV Out-of-Range Exceptions', target: 'Shift #4192 (Josefina Ruiz)', ip: '192.168.1.92' },
      { timestamp: 'Nov 18 · 08:45 AM', action: 'Updated CPR Expiration Notice', target: 'Rosa Vega (CG-2001)', ip: '192.168.1.92' },
    ],
  },
  {
    id: 'USR-07',
    name: 'Dana Whitfield',
    email: 'dana.w@lilisare.com',
    role: 'RN / Clinical Supervisor',
    businessLine: 'Mountain Lane',
    programScope: ['HMA', 'PDN', 'CFC'],
    caseloadSummary: '19 clinical supervisory clients',
    assignedClientIds: ['C-1001', 'C-1003', 'C-1006'],
    status: 'Active',
    mfaEnforced: true,
    lastLogin: '45 min ago',
    phone: '(303) 555-0722',
    title: 'Registered Nurse Supervisor',
    createdDate: 'Jan 20, 2024',
    sessions: [
      { device: 'iPad Safari', location: 'Denver, CO', lastActive: '45 min ago', isCurrent: false },
    ],
    recentEvents: [
      { timestamp: 'Nov 18 · 11:35 AM', action: 'Reviewed 60-Day RN Supervisory Visit', target: 'Marisol Vega (C-1001)', ip: '172.56.21.4' },
      { timestamp: 'Nov 18 · 10:20 AM', action: 'Approved Medication Delegation Plan', target: 'Josefina Ruiz (C-1006)', ip: '172.56.21.4' },
    ],
  },
  {
    id: 'USR-08',
    name: 'Priya Shah',
    email: 'priya.s@lilisare.com',
    role: 'Case Manager Liaison',
    businessLine: 'Mountain Lane & Frisco',
    programScope: ['IRSS', 'HMA'],
    caseloadSummary: '16 regional clients',
    assignedClientIds: ['C-1004', 'C-1006'],
    status: 'Active',
    mfaEnforced: true,
    lastLogin: '4 hours ago',
    phone: '(970) 555-0833',
    title: 'Regional Care Coordinator',
    createdDate: 'Jun 10, 2024',
    sessions: [
      { device: 'Chrome on Windows 11', location: 'Silverthorne, CO', lastActive: '4 hours ago', isCurrent: false },
    ],
    recentEvents: [
      { timestamp: 'Nov 18 · 08:30 AM', action: 'Requested Prior Authorization Extension', target: 'Client ••••1004', ip: '198.147.22.5' },
    ],
  },
  {
    id: 'USR-09',
    name: 'Marcus Vance',
    email: 'marcus.v@lilisare.com',
    role: 'Billing Specialist',
    businessLine: 'Mountain Lane',
    programScope: ['All Programs'],
    caseloadSummary: 'Agency Claims & Remittance',
    assignedClientIds: [],
    status: 'Active',
    mfaEnforced: true,
    lastLogin: '5 hours ago',
    phone: '(303) 555-0941',
    title: 'Medical Billing Specialist',
    createdDate: 'Apr 01, 2024',
    sessions: [
      { device: 'Edge on Windows 10', location: 'Denver, CO', lastActive: '5 hours ago', isCurrent: false },
    ],
    recentEvents: [
      { timestamp: 'Nov 18 · 07:15 AM', action: 'Submitted EDI 837P Claim Batch', target: 'Colorado Medicaid / HCPF', ip: '192.168.1.104' },
    ],
  },
  {
    id: 'USR-10',
    name: 'Teresa Gomez',
    email: 'teresa.g@lilisare.com',
    role: 'Payroll / Operations',
    businessLine: 'Mountain Lane',
    programScope: ['IHSS', 'IRSS', 'CFC'],
    caseloadSummary: 'Caregiver Timesheets & ADP',
    assignedClientIds: [],
    status: 'Active',
    mfaEnforced: true,
    lastLogin: '2 days ago',
    phone: '(303) 555-0105',
    title: 'Payroll Coordinator',
    createdDate: 'May 14, 2024',
    sessions: [
      { device: 'Chrome on Windows', location: 'Centennial, CO', lastActive: '2 days ago', isCurrent: false },
    ],
    recentEvents: [
      { timestamp: 'Nov 16 · 03:00 PM', action: 'Generated Semi-monthly ADP Pay File', target: 'ADP Run #2026-11A', ip: '192.168.1.110' },
    ],
  },
  {
    id: 'USR-11',
    name: 'Devon Brooks',
    email: 'devon.b@lilisare.com',
    role: 'Scheduler',
    businessLine: 'Mountain Lane',
    programScope: ['IHSS', 'CFC'],
    caseloadSummary: '34 scheduled caregivers',
    assignedClientIds: [],
    status: 'Active',
    mfaEnforced: true,
    lastLogin: '25 min ago',
    phone: '(720) 555-0166',
    title: 'Staffing Coordinator',
    createdDate: 'Jul 01, 2024',
    sessions: [
      { device: 'Chrome on Windows 11', location: 'Denver, CO', lastActive: '25 min ago', isCurrent: false },
    ],
    recentEvents: [
      { timestamp: 'Nov 18 · 12:05 PM', action: 'Filled Urgent Weekend Shift', target: 'Eli Brandt (C-1002)', ip: '192.168.1.122' },
    ],
  },
  {
    id: 'USR-12',
    name: 'Rosa Vega',
    email: 'rosa.vega@email.com',
    role: 'Caregiver (Field Staff)',
    businessLine: 'Mountain Lane',
    programScope: ['IHSS'],
    caseloadSummary: 'Linked to 1 client (Marisol Vega)',
    assignedClientIds: ['C-1001'],
    status: 'Active',
    mfaEnforced: true,
    lastLogin: '11 min ago',
    phone: '(720) 555-0177',
    title: 'Family Caregiver',
    createdDate: 'Jan 15, 2024',
    sessions: [
      { device: 'LiliSare Caregiver App (Android 14)', location: 'Denver, CO', lastActive: '11 min ago', isCurrent: false },
    ],
    recentEvents: [
      { timestamp: 'Nov 18 · 11:34 AM', action: 'EVV Clock-out and Voice Care Note', target: 'Shift #4195 (Marisol Vega)', ip: '172.58.12.9' },
    ],
  },
  {
    id: 'USR-13',
    name: 'Grace Park',
    email: 'grace.park@email.com',
    role: 'Caregiver (Field Staff)',
    businessLine: 'Mountain Lane',
    programScope: ['PDN', 'HCBS'],
    caseloadSummary: 'Linked to 1 client (Aiden Park)',
    assignedClientIds: ['C-1005'],
    status: 'Active',
    mfaEnforced: true,
    lastLogin: '1 day ago',
    phone: '(720) 555-0199',
    title: 'Family Caregiver',
    createdDate: 'Feb 10, 2024',
    sessions: [
      { device: 'LiliSare Caregiver App (iOS 18)', location: 'Aurora, CO', lastActive: '1 day ago', isCurrent: false },
    ],
    recentEvents: [
      { timestamp: 'Nov 17 · 05:08 PM', action: 'Submitted Care Note', target: 'Aiden Park (C-1005)', ip: '172.58.44.1' },
    ],
  },
  {
    id: 'USR-14',
    name: 'Carlos Vega',
    email: 'carlos.vega@email.com',
    role: 'Family member / Responsible party',
    businessLine: 'Mountain Lane',
    programScope: ['Portal Only'],
    caseloadSummary: 'Linked to Marisol Vega (C-1001)',
    assignedClientIds: ['C-1001'],
    status: 'Active',
    mfaEnforced: true,
    lastLogin: '3 days ago',
    phone: '(720) 555-0244',
    title: 'Designated Family Representative',
    createdDate: 'Mar 12, 2024',
    sessions: [
      { device: 'Mobile Safari on iPhone', location: 'Denver, CO', lastActive: '3 days ago', isCurrent: false },
    ],
    recentEvents: [
      { timestamp: 'Nov 15 · 07:45 PM', action: 'Signed Updated Care Plan Acknowledgment', target: 'Marisol Vega (C-1001)', ip: '76.128.91.4' },
    ],
  },
  {
    id: 'USR-15',
    name: 'Sarah Jenkins',
    email: 'sjenkins@rmhs.org',
    role: 'Case Manager (State / Agency)',
    businessLine: 'Mountain Lane',
    programScope: ['CMA State Portal'],
    caseloadSummary: 'Linked to 4 agency clients',
    assignedClientIds: ['C-1001', 'C-1003', 'C-1007'],
    status: 'Active',
    mfaEnforced: true,
    lastLogin: '6 hours ago',
    phone: '(303) 555-0899',
    title: 'Rocky Mountain Human Services Case Manager',
    createdDate: 'Apr 18, 2024',
    sessions: [
      { device: 'Edge on Windows (RMHS Network)', location: 'Denver, CO', lastActive: '6 hours ago', isCurrent: false },
    ],
    recentEvents: [
      { timestamp: 'Nov 18 · 06:15 AM', action: 'Uploaded Annual Re-assessment PAR', target: 'Harper Nguyen (C-1003)', ip: '165.137.4.20' },
    ],
  },
  {
    id: 'USR-16',
    name: 'Dr. Arthur Bell',
    email: 'arthur.bell@datasystems.io',
    role: 'Data / Migration Manager',
    businessLine: 'All Branches',
    programScope: ['System Migration'],
    caseloadSummary: 'No direct client caseload',
    assignedClientIds: [],
    status: 'Invited',
    mfaEnforced: true,
    lastLogin: 'Never logged in',
    phone: '(415) 555-0911',
    title: 'Contract Integration Architect',
    createdDate: 'Nov 16, 2026',
    sessions: [],
    recentEvents: [
      { timestamp: 'Nov 16 · 02:00 PM', action: 'User Invitation Dispatched', target: 'arthur.bell@datasystems.io', ip: 'System' },
    ],
  },
];

// 12 Standard Roles (10 Internal, 2 External)
const INITIAL_ROLES: RoleDefinition[] = [
  {
    id: 'role-admin',
    name: 'Administrator',
    tier: 'Internal',
    isSystem: true,
    description: 'Full uninhibited access across all agency records, user permissions, audit trails, and financial integrations.',
    userCount: 2,
    permissions: {
      'Today dashboard': { access: 'Full', scope: 'All agency data' },
      'Client Intake': { access: 'Full', scope: 'All agency data' },
      'Caregiver Intake': { access: 'Full', scope: 'All agency data' },
      'Onboarding': { access: 'Full', scope: 'All agency data' },
      'Care Notes': { access: 'Full', scope: 'All agency data' },
      'CA Emails': { access: 'Full', scope: 'All agency data' },
      'Clients': { access: 'Full', scope: 'All agency data' },
      'Caregivers': { access: 'Full', scope: 'All agency data' },
      'Screening Center': { access: 'Full', scope: 'All agency data' },
      'Training': { access: 'Full', scope: 'All agency data' },
      'Scheduling and EVV': { access: 'Full', scope: 'All agency data' },
      'Compliance': { access: 'Full', scope: 'All agency data' },
      'Billing': { access: 'Full', scope: 'All agency data' },
      'Client Profitability': { access: 'Full', scope: 'All agency data' },
      'Reports': { access: 'Full', scope: 'All agency data' },
      'Automation Rules': { access: 'Full', scope: 'All agency data' },
      'Connected Systems': { access: 'Full', scope: 'All agency data' },
      'Data Migration': { access: 'Full', scope: 'All agency data' },
      'Users and Roles': { access: 'Full', scope: 'All agency data' },
      'Settings': { access: 'Full', scope: 'All agency data' },
    },
    sensitiveToggles: {
      'client_clinical': true,
      'client_ssn': true,
      'client_rates': true,
      'caregiver_screening': true,
      'caregiver_ssn': true,
      'caregiver_pay': true,
      'caregiver_disciplinary': true,
      'notes_full_text': true,
      'notes_audio': true,
      'notes_attachments': true,
      'incidents_restricted': true,
      'billing_claims': true,
      'billing_denials': true,
    },
  },
  {
    id: 'role-exec',
    name: 'Executive / Owner',
    tier: 'Internal',
    isSystem: true,
    description: 'Executive dashboards, profitability metrics, operational health reports, and view-only record transparency.',
    userCount: 1,
    permissions: {
      'Today dashboard': { access: 'View only', scope: 'All agency data' },
      'Client Intake': { access: 'View only', scope: 'All agency data' },
      'Caregiver Intake': { access: 'View only', scope: 'All agency data' },
      'Onboarding': { access: 'View only', scope: 'All agency data' },
      'Care Notes': { access: 'View only', scope: 'All agency data' },
      'CA Emails': { access: 'View only', scope: 'All agency data' },
      'Clients': { access: 'View only', scope: 'All agency data' },
      'Caregivers': { access: 'View only', scope: 'All agency data' },
      'Screening Center': { access: 'View only', scope: 'All agency data' },
      'Training': { access: 'View only', scope: 'All agency data' },
      'Scheduling and EVV': { access: 'View only', scope: 'All agency data' },
      'Compliance': { access: 'View only', scope: 'All agency data' },
      'Billing': { access: 'View only', scope: 'All agency data' },
      'Client Profitability': { access: 'Full', scope: 'All agency data' },
      'Reports': { access: 'Full', scope: 'All agency data' },
      'Automation Rules': { access: 'View only', scope: 'All agency data' },
      'Connected Systems': { access: 'View only', scope: 'All agency data' },
      'Data Migration': { access: 'No access', scope: 'All agency data' },
      'Users and Roles': { access: 'View only', scope: 'All agency data' },
      'Settings': { access: 'View only', scope: 'All agency data' },
    },
    sensitiveToggles: {
      'client_clinical': false,
      'client_ssn': false,
      'client_rates': true,
      'caregiver_screening': false,
      'caregiver_ssn': false,
      'caregiver_pay': true,
      'caregiver_disciplinary': false,
      'notes_full_text': false,
      'notes_audio': false,
      'notes_attachments': false,
      'incidents_restricted': false,
      'billing_claims': true,
      'billing_denials': true,
    },
  },
  {
    id: 'role-enrollment',
    name: 'Enrollment Coordinator',
    tier: 'Internal',
    isSystem: true,
    description: 'Manages client inquiries, CMA relationships, service needs discussions, and conversion into onboarding.',
    userCount: 2,
    permissions: {
      'Today dashboard': { access: 'View only', scope: 'My business line' },
      'Client Intake': { access: 'Full', scope: 'My business line' },
      'Caregiver Intake': { access: 'View only', scope: 'My business line' },
      'Onboarding': { access: 'View and edit', scope: 'My business line' },
      'Care Notes': { access: 'No access', scope: 'My programs' },
      'CA Emails': { access: 'Full', scope: 'My business line' },
      'Clients': { access: 'View and edit', scope: 'My business line' },
      'Caregivers': { access: 'View only', scope: 'My business line' },
      'Screening Center': { access: 'No access', scope: 'My business line' },
      'Training': { access: 'Full', scope: 'My business line' },
      'Scheduling and EVV': { access: 'No access', scope: 'My business line' },
      'Compliance': { access: 'No access', scope: 'My business line' },
      'Billing': { access: 'No access', scope: 'My business line' },
      'Client Profitability': { access: 'No access', scope: 'My business line' },
      'Reports': { access: 'View only', scope: 'My business line' },
      'Automation Rules': { access: 'No access', scope: 'All agency data' },
      'Connected Systems': { access: 'No access', scope: 'All agency data' },
      'Data Migration': { access: 'No access', scope: 'All agency data' },
      'Users and Roles': { access: 'No access', scope: 'All agency data' },
      'Settings': { access: 'No access', scope: 'All agency data' },
    },
    sensitiveToggles: {
      'client_clinical': true,
      'client_ssn': true,
      'client_rates': false,
      'caregiver_screening': false,
      'caregiver_ssn': false,
      'caregiver_pay': false,
      'caregiver_disciplinary': false,
      'notes_full_text': false,
      'notes_audio': false,
      'notes_attachments': false,
      'incidents_restricted': false,
      'billing_claims': false,
      'billing_denials': false,
    },
  },
  {
    id: 'role-cg-onboarding',
    name: 'Caregiver Onboarding Specialist',
    tier: 'Internal',
    isSystem: true,
    description: 'Leads caregiver recruitment, documentation packets, background checks, training, and ADP payroll setup.',
    userCount: 1,
    permissions: {
      'Today dashboard': { access: 'View only', scope: 'My business line' },
      'Client Intake': { access: 'View only', scope: 'My business line' },
      'Caregiver Intake': { access: 'Full', scope: 'My business line' },
      'Onboarding': { access: 'Full', scope: 'My business line' },
      'Care Notes': { access: 'No access', scope: 'My business line' },
      'CA Emails': { access: 'View only', scope: 'My business line' },
      'Clients': { access: 'View only', scope: 'My business line' },
      'Caregivers': { access: 'Full', scope: 'My business line' },
      'Screening Center': { access: 'Full', scope: 'My business line' },
      'Training': { access: 'Full', scope: 'My business line' },
      'Scheduling and EVV': { access: 'View only', scope: 'My business line' },
      'Compliance': { access: 'View and edit', scope: 'My business line' },
      'Billing': { access: 'No access', scope: 'My business line' },
      'Client Profitability': { access: 'No access', scope: 'My business line' },
      'Reports': { access: 'View only', scope: 'My business line' },
      'Automation Rules': { access: 'No access', scope: 'All agency data' },
      'Connected Systems': { access: 'No access', scope: 'All agency data' },
      'Data Migration': { access: 'No access', scope: 'All agency data' },
      'Users and Roles': { access: 'No access', scope: 'All agency data' },
      'Settings': { access: 'No access', scope: 'All agency data' },
    },
    sensitiveToggles: {
      'client_clinical': false,
      'client_ssn': false,
      'client_rates': false,
      'caregiver_screening': true,
      'caregiver_ssn': true,
      'caregiver_pay': true,
      'caregiver_disciplinary': true,
      'notes_full_text': false,
      'notes_audio': false,
      'notes_attachments': false,
      'incidents_restricted': false,
      'billing_claims': false,
      'billing_denials': false,
    },
  },
  {
    id: 'role-compliance',
    name: 'Compliance Officer',
    tier: 'Internal',
    isSystem: true,
    description: 'Ensures caregiver credential validity, supervisory visit cadence, EVV exceptions, and documentation audits.',
    userCount: 1,
    permissions: {
      'Today dashboard': { access: 'View only', scope: 'All agency data' },
      'Client Intake': { access: 'View only', scope: 'All agency data' },
      'Caregiver Intake': { access: 'View only', scope: 'All agency data' },
      'Onboarding': { access: 'View and edit', scope: 'All agency data' },
      'Care Notes': { access: 'Full', scope: 'All agency data' },
      'CA Emails': { access: 'View only', scope: 'All agency data' },
      'Clients': { access: 'View only', scope: 'All agency data' },
      'Caregivers': { access: 'View and edit', scope: 'All agency data' },
      'Screening Center': { access: 'Full', scope: 'All agency data' },
      'Training': { access: 'View and edit', scope: 'All agency data' },
      'Scheduling and EVV': { access: 'View and edit', scope: 'All agency data' },
      'Compliance': { access: 'Full', scope: 'All agency data' },
      'Billing': { access: 'View only', scope: 'All agency data' },
      'Client Profitability': { access: 'No access', scope: 'All agency data' },
      'Reports': { access: 'Full', scope: 'All agency data' },
      'Automation Rules': { access: 'Full', scope: 'All agency data' },
      'Connected Systems': { access: 'View only', scope: 'All agency data' },
      'Data Migration': { access: 'No access', scope: 'All agency data' },
      'Users and Roles': { access: 'View only', scope: 'All agency data' },
      'Settings': { access: 'View only', scope: 'All agency data' },
    },
    sensitiveToggles: {
      'client_clinical': true,
      'client_ssn': false,
      'client_rates': false,
      'caregiver_screening': true,
      'caregiver_ssn': false,
      'caregiver_pay': false,
      'caregiver_disciplinary': true,
      'notes_full_text': true,
      'notes_audio': true,
      'notes_attachments': true,
      'incidents_restricted': true,
      'billing_claims': false,
      'billing_denials': false,
    },
  },
  {
    id: 'role-rn-supervisor',
    name: 'RN / Clinical Supervisor',
    tier: 'Internal',
    isSystem: true,
    description: 'Conducts clinical care plan evaluations, 60-day in-home supervision, delegated nursing tasks, and incident reviews.',
    userCount: 1,
    permissions: {
      'Today dashboard': { access: 'View only', scope: 'My caseload only' },
      'Client Intake': { access: 'View only', scope: 'My business line' },
      'Caregiver Intake': { access: 'No access', scope: 'My business line' },
      'Onboarding': { access: 'View only', scope: 'My caseload only' },
      'Care Notes': { access: 'Full', scope: 'My caseload only' },
      'CA Emails': { access: 'View and edit', scope: 'My caseload only' },
      'Clients': { access: 'Full', scope: 'My caseload only' },
      'Caregivers': { access: 'View only', scope: 'My caseload only' },
      'Screening Center': { access: 'View only', scope: 'My caseload only' },
      'Training': { access: 'Full', scope: 'My caseload only' },
      'Scheduling and EVV': { access: 'View only', scope: 'My caseload only' },
      'Compliance': { access: 'Full', scope: 'My caseload only' },
      'Billing': { access: 'No access', scope: 'All agency data' },
      'Client Profitability': { access: 'No access', scope: 'All agency data' },
      'Reports': { access: 'View only', scope: 'My caseload only' },
      'Automation Rules': { access: 'View only', scope: 'All agency data' },
      'Connected Systems': { access: 'No access', scope: 'All agency data' },
      'Data Migration': { access: 'No access', scope: 'All agency data' },
      'Users and Roles': { access: 'No access', scope: 'All agency data' },
      'Settings': { access: 'No access', scope: 'All agency data' },
    },
    sensitiveToggles: {
      'client_clinical': true,
      'client_ssn': true,
      'client_rates': false,
      'caregiver_screening': false,
      'caregiver_ssn': false,
      'caregiver_pay': false,
      'caregiver_disciplinary': true,
      'notes_full_text': true,
      'notes_audio': true,
      'notes_attachments': true,
      'incidents_restricted': true,
      'billing_claims': false,
      'billing_denials': false,
    },
  },
  {
    id: 'role-scheduler',
    name: 'Scheduler',
    tier: 'Internal',
    isSystem: true,
    description: 'Manages visit calendars, shift fulfillment, EVV clock-in adjustments, and open shift alerts without clinical access.',
    userCount: 1,
    permissions: {
      'Today dashboard': { access: 'View only', scope: 'My business line' },
      'Client Intake': { access: 'View only', scope: 'My business line' },
      'Caregiver Intake': { access: 'No access', scope: 'My business line' },
      'Onboarding': { access: 'View only', scope: 'My business line' },
      'Care Notes': { access: 'No access', scope: 'All agency data' },
      'CA Emails': { access: 'No access', scope: 'All agency data' },
      'Clients': { access: 'View only', scope: 'My business line' },
      'Caregivers': { access: 'View only', scope: 'My business line' },
      'Screening Center': { access: 'No access', scope: 'All agency data' },
      'Training': { access: 'View only', scope: 'My business line' },
      'Scheduling and EVV': { access: 'Full', scope: 'My business line' },
      'Compliance': { access: 'View only', scope: 'My business line' },
      'Billing': { access: 'No access', scope: 'All agency data' },
      'Client Profitability': { access: 'No access', scope: 'All agency data' },
      'Reports': { access: 'View only', scope: 'My business line' },
      'Automation Rules': { access: 'No access', scope: 'All agency data' },
      'Connected Systems': { access: 'No access', scope: 'All agency data' },
      'Data Migration': { access: 'No access', scope: 'All agency data' },
      'Users and Roles': { access: 'No access', scope: 'All agency data' },
      'Settings': { access: 'No access', scope: 'All agency data' },
    },
    sensitiveToggles: {
      'client_clinical': false,
      'client_ssn': false,
      'client_rates': false,
      'caregiver_screening': false,
      'caregiver_ssn': false,
      'caregiver_pay': false,
      'caregiver_disciplinary': false,
      'notes_full_text': false,
      'notes_audio': false,
      'notes_attachments': false,
      'incidents_restricted': false,
      'billing_claims': false,
      'billing_denials': false,
    },
  },
  {
    id: 'role-billing',
    name: 'Billing Specialist',
    tier: 'Internal',
    isSystem: true,
    description: 'Processes Medicaid claims, NPI billing validation, claim denial appeals, and payer rate audits.',
    userCount: 1,
    permissions: {
      'Today dashboard': { access: 'View only', scope: 'All agency data' },
      'Client Intake': { access: 'No access', scope: 'All agency data' },
      'Caregiver Intake': { access: 'No access', scope: 'All agency data' },
      'Onboarding': { access: 'View only', scope: 'All agency data' },
      'Care Notes': { access: 'View only', scope: 'All agency data' },
      'CA Emails': { access: 'No access', scope: 'All agency data' },
      'Clients': { access: 'View only', scope: 'All agency data' },
      'Caregivers': { access: 'View only', scope: 'All agency data' },
      'Screening Center': { access: 'No access', scope: 'All agency data' },
      'Training': { access: 'No access', scope: 'All agency data' },
      'Scheduling and EVV': { access: 'View only', scope: 'All agency data' },
      'Compliance': { access: 'View only', scope: 'All agency data' },
      'Billing': { access: 'Full', scope: 'All agency data' },
      'Client Profitability': { access: 'Full', scope: 'All agency data' },
      'Reports': { access: 'Full', scope: 'All agency data' },
      'Automation Rules': { access: 'View only', scope: 'All agency data' },
      'Connected Systems': { access: 'View only', scope: 'All agency data' },
      'Data Migration': { access: 'No access', scope: 'All agency data' },
      'Users and Roles': { access: 'No access', scope: 'All agency data' },
      'Settings': { access: 'No access', scope: 'All agency data' },
    },
    sensitiveToggles: {
      'client_clinical': false,
      'client_ssn': true,
      'client_rates': true,
      'caregiver_screening': false,
      'caregiver_ssn': false,
      'caregiver_pay': false,
      'caregiver_disciplinary': false,
      'notes_full_text': false,
      'notes_audio': false,
      'notes_attachments': false,
      'incidents_restricted': false,
      'billing_claims': true,
      'billing_denials': true,
    },
  },
  {
    id: 'role-payroll',
    name: 'Payroll / Operations',
    tier: 'Internal',
    isSystem: true,
    description: 'Translates verified EVV hours into caregiver pay, handles overtime thresholds, and coordinates ADP exports.',
    userCount: 1,
    permissions: {
      'Today dashboard': { access: 'View only', scope: 'All agency data' },
      'Client Intake': { access: 'No access', scope: 'All agency data' },
      'Caregiver Intake': { access: 'View only', scope: 'All agency data' },
      'Onboarding': { access: 'View only', scope: 'All agency data' },
      'Care Notes': { access: 'No access', scope: 'All agency data' },
      'CA Emails': { access: 'No access', scope: 'All agency data' },
      'Clients': { access: 'View only', scope: 'All agency data' },
      'Caregivers': { access: 'View and edit', scope: 'All agency data' },
      'Screening Center': { access: 'No access', scope: 'All agency data' },
      'Training': { access: 'No access', scope: 'All agency data' },
      'Scheduling and EVV': { access: 'View only', scope: 'All agency data' },
      'Compliance': { access: 'View only', scope: 'All agency data' },
      'Billing': { access: 'View and edit', scope: 'All agency data' },
      'Client Profitability': { access: 'View only', scope: 'All agency data' },
      'Reports': { access: 'Full', scope: 'All agency data' },
      'Automation Rules': { access: 'No access', scope: 'All agency data' },
      'Connected Systems': { access: 'View only', scope: 'All agency data' },
      'Data Migration': { access: 'No access', scope: 'All agency data' },
      'Users and Roles': { access: 'No access', scope: 'All agency data' },
      'Settings': { access: 'No access', scope: 'All agency data' },
    },
    sensitiveToggles: {
      'client_clinical': false,
      'client_ssn': false,
      'client_rates': false,
      'caregiver_screening': false,
      'caregiver_ssn': true,
      'caregiver_pay': true,
      'caregiver_disciplinary': false,
      'notes_full_text': false,
      'notes_audio': false,
      'notes_attachments': false,
      'incidents_restricted': false,
      'billing_claims': false,
      'billing_denials': false,
    },
  },
  {
    id: 'role-data-migration',
    name: 'Data / Migration Manager',
    tier: 'Internal',
    isSystem: true,
    description: 'Temporary technical access to batch CSV mappers, database field bridges, and EHR data onboarding.',
    userCount: 1,
    permissions: {
      'Today dashboard': { access: 'No access', scope: 'All agency data' },
      'Client Intake': { access: 'View only', scope: 'All agency data' },
      'Caregiver Intake': { access: 'View only', scope: 'All agency data' },
      'Onboarding': { access: 'View only', scope: 'All agency data' },
      'Care Notes': { access: 'No access', scope: 'All agency data' },
      'CA Emails': { access: 'No access', scope: 'All agency data' },
      'Clients': { access: 'View and edit', scope: 'All agency data' },
      'Caregivers': { access: 'View and edit', scope: 'All agency data' },
      'Screening Center': { access: 'No access', scope: 'All agency data' },
      'Training': { access: 'No access', scope: 'All agency data' },
      'Scheduling and EVV': { access: 'No access', scope: 'All agency data' },
      'Compliance': { access: 'No access', scope: 'All agency data' },
      'Billing': { access: 'No access', scope: 'All agency data' },
      'Client Profitability': { access: 'No access', scope: 'All agency data' },
      'Reports': { access: 'No access', scope: 'All agency data' },
      'Automation Rules': { access: 'No access', scope: 'All agency data' },
      'Connected Systems': { access: 'Full', scope: 'All agency data' },
      'Data Migration': { access: 'Full', scope: 'All agency data' },
      'Users and Roles': { access: 'No access', scope: 'All agency data' },
      'Settings': { access: 'View only', scope: 'All agency data' },
    },
    sensitiveToggles: {
      'client_clinical': false,
      'client_ssn': false,
      'client_rates': false,
      'caregiver_screening': false,
      'caregiver_ssn': false,
      'caregiver_pay': false,
      'caregiver_disciplinary': false,
      'notes_full_text': false,
      'notes_audio': false,
      'notes_attachments': false,
      'incidents_restricted': false,
      'billing_claims': false,
      'billing_denials': false,
    },
  },
  // External Roles
  {
    id: 'role-family',
    name: 'Family member / Responsible party',
    tier: 'External',
    isSystem: true,
    description: 'Sees only their linked family member’s upcoming visit schedule, authorized care plan goals, and signature documents.',
    userCount: 1,
    permissions: {
      'Overview': { access: 'View only', scope: 'Linked clients only' },
      'Schedule': { access: 'View only', scope: 'Linked clients only' },
      'Care plan summary': { access: 'View only', scope: 'Linked clients only' },
      'Documents to sign': { access: 'View and edit', scope: 'Linked clients only' },
      'Authorization status': { access: 'View only', scope: 'Linked clients only' },
      'Messages': { access: 'View and edit', scope: 'Linked clients only' },
    },
    sensitiveToggles: {
      'client_clinical': true,
      'client_ssn': false,
      'client_rates': false,
      'caregiver_screening': false,
      'caregiver_ssn': false,
      'caregiver_pay': false,
      'caregiver_disciplinary': false,
      'notes_full_text': false,
      'notes_audio': false,
      'notes_attachments': false,
      'incidents_restricted': false,
      'billing_claims': false,
      'billing_denials': false,
    },
  },
  {
    id: 'role-case-manager',
    name: 'Case Manager (State / Agency)',
    tier: 'External',
    isSystem: true,
    description: 'Sees only state-assigned Medicaid clients to review current service plans, track authorization limits, and upload PAR renewals.',
    userCount: 1,
    permissions: {
      'Overview': { access: 'View only', scope: 'Linked clients only' },
      'Schedule': { access: 'View only', scope: 'Linked clients only' },
      'Care plan summary': { access: 'View and edit', scope: 'Linked clients only' },
      'Documents to sign': { access: 'View and edit', scope: 'Linked clients only' },
      'Authorization status': { access: 'View and edit', scope: 'Linked clients only' },
      'Messages': { access: 'View and edit', scope: 'Linked clients only' },
    },
    sensitiveToggles: {
      'client_clinical': true,
      'client_ssn': false,
      'client_rates': false,
      'caregiver_screening': false,
      'caregiver_ssn': false,
      'caregiver_pay': false,
      'caregiver_disciplinary': false,
      'notes_full_text': false,
      'notes_audio': false,
      'notes_attachments': false,
      'incidents_restricted': false,
      'billing_claims': false,
      'billing_denials': false,
    },
  },
];

// Initial System Audit Log Entries
const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: 'LOG-901',
    timestamp: 'Nov 18, 2026 · 12:20 PM',
    user: 'Lisa Connell',
    userEmail: 'lisa.c@lilisare.com',
    action: 'Role changed',
    target: 'Devon Brooks → Scheduler',
    businessLine: 'Mountain Lane',
    ip: '192.168.1.42',
    result: 'Success',
    details: 'Scope updated: Mountain Lane · IHSS, CFC',
  },
  {
    id: 'LOG-902',
    timestamp: 'Nov 18, 2026 · 11:45 AM',
    user: 'Lisa Connell',
    userEmail: 'lisa.c@lilisare.com',
    action: 'Exported data',
    target: 'Payroll Batch #412 (34 Caregivers)',
    businessLine: 'Mountain Lane',
    ip: '192.168.1.42',
    result: 'Success',
    details: 'Encrypted ADP CSV export',
  },
  {
    id: 'LOG-903',
    timestamp: 'Nov 18, 2026 · 11:34 AM',
    user: 'Rosa Vega',
    userEmail: 'rosa.vega@email.com',
    action: 'Edited record',
    target: 'Care Note NOTE-101 (Marisol Vega ••••1001)',
    businessLine: 'Mountain Lane',
    ip: '172.58.12.9',
    result: 'Success',
    details: 'Audio dictation transcript attached',
  },
  {
    id: 'LOG-904',
    timestamp: 'Nov 18, 2026 · 10:15 AM',
    user: 'Carolina T.',
    userEmail: 'carolina.t@lilisare.com',
    action: 'Viewed record',
    target: 'Client Profitability Report Q3',
    businessLine: 'Colorado Home Health',
    ip: '174.52.19.8',
    result: 'Success',
    details: 'Caseload revenue metrics viewed',
  },
  {
    id: 'LOG-905',
    timestamp: 'Nov 18, 2026 · 09:25 AM',
    user: 'Unknown Actor',
    userEmail: 'admin.backup@lilisare.com',
    action: 'Failed login',
    target: 'Web Console Login',
    businessLine: 'Unknown',
    ip: '82.102.23.14',
    result: 'Flagged',
    details: 'Unrecognized IP location (Berlin, Germany) · Rate limited',
  },
  {
    id: 'LOG-906',
    timestamp: 'Nov 18, 2026 · 08:30 AM',
    user: 'Sam K.',
    userEmail: 'sam.k@lilisare.com',
    action: 'Viewed record',
    target: 'Caregiver Credential: CPR Expirations (8 records)',
    businessLine: 'All Branches',
    ip: '192.168.1.92',
    result: 'Success',
    details: 'Compliance audit export',
  },
  {
    id: 'LOG-907',
    timestamp: 'Nov 17, 2026 · 04:12 PM',
    user: 'Lisa Connell',
    userEmail: 'lisa.c@lilisare.com',
    action: 'Invite sent',
    target: 'Dr. Arthur Bell (arthur.bell@datasystems.io)',
    businessLine: 'All Branches',
    ip: '192.168.1.42',
    result: 'Success',
    details: 'Role: Data / Migration Manager · MFA enforced',
  },
  {
    id: 'LOG-908',
    timestamp: 'Nov 17, 2026 · 02:40 PM',
    user: 'Dana Whitfield',
    userEmail: 'dana.w@lilisare.com',
    action: 'Viewed record',
    target: 'Client Medical Chart: Josefina Ruiz (••••1006)',
    businessLine: 'Mountain Lane',
    ip: '172.56.21.4',
    result: 'Success',
    details: 'Medication administration order validated',
  },
];

export const UsersPage: React.FC = () => {
  const { showToast, deIdentify } = useApp();

  // Active top-level tab: 'users' | 'roles' | 'security'
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'security'>('users');

  // State: Users & Filter
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [userSearch, setUserSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterBusinessLine, setFilterBusinessLine] = useState('All');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // State: Roles & Permissions
  const [roles, setRoles] = useState<RoleDefinition[]>(INITIAL_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('role-scheduler');
  const [roleSearch, setRoleSearch] = useState('');
  const [roleModuleTab, setRoleModuleTab] = useState<'all' | 'staff' | 'portal'>('all');
  const [hasUnsavedRoleChanges, setHasUnsavedRoleChanges] = useState(false);

  // Preview as Role simulation banner
  const [previewingRole, setPreviewingRole] = useState<string | null>(null);

  // Modals & Drawers
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUserForDrawer, setSelectedUserForDrawer] = useState<UserRecord | null>(null);
  const [isAuditLogDrawerOpen, setIsAuditLogDrawerOpen] = useState(false);
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);
  const [sensitiveToggleConfirm, setSensitiveToggleConfirm] = useState<{
    roleId: string;
    fieldKey: string;
    label: string;
  } | null>(null);
  const [isBreakGlassModalOpen, setIsBreakGlassModalOpen] = useState(false);
  const [breakGlassActive, setBreakGlassActive] = useState(false);
  const [breakGlassReason, setBreakGlassReason] = useState('');
  const [breakGlassDuration, setBreakGlassDuration] = useState('4 hours');

  // Security tab state
  const [sessionTimeout, setSessionTimeout] = useState('15 minutes');
  const [ipAlertsEnabled, setIpAlertsEnabled] = useState(true);
  const [sandboxModeEnabled, setSandboxModeEnabled] = useState(false);

  // Audit Log State & Filters
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOG);
  const [auditUserFilter, setAuditUserFilter] = useState('All');
  const [auditActionFilter, setAuditActionFilter] = useState('All');

  // New Invite Form State
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Scheduler');
  const [inviteBusinessLines, setInviteBusinessLines] = useState<string[]>(['Mountain Lane']);
  const [inviteProgramScope, setInviteProgramScope] = useState<string[]>(['IHSS', 'CFC']);
  const [inviteCaseloadClient, setInviteCaseloadClient] = useState('');

  // Selected Role Object
  const selectedRole = useMemo(() => {
    return roles.find((r) => r.id === selectedRoleId) || roles[0];
  }, [roles, selectedRoleId]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        userSearch === '' ||
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchRole = filterRole === 'All' || u.role === filterRole;
      const matchStatus = filterStatus === 'All' || u.status === filterStatus;
      const matchBL =
        filterBusinessLine === 'All' ||
        u.businessLine.toLowerCase().includes(filterBusinessLine.toLowerCase());
      return matchSearch && matchRole && matchStatus && matchBL;
    });
  }, [users, userSearch, filterRole, filterStatus, filterBusinessLine]);

  // Bulk Selection Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleToggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Submit User Invite
  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      showToast('Please enter both name and email.');
      return;
    }

    const newUser: UserRecord = {
      id: `USR-${String(users.length + 1).padStart(2, '0')}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      businessLine: inviteBusinessLines.join(', '),
      programScope: inviteProgramScope,
      caseloadSummary: inviteCaseloadClient ? `Assigned to ${inviteCaseloadClient}` : 'General Agency Scope',
      assignedClientIds: inviteCaseloadClient ? ['C-1001'] : [],
      status: 'Invited',
      mfaEnforced: true,
      lastLogin: 'Never logged in',
      createdDate: 'Nov 18, 2026',
      sessions: [],
      recentEvents: [
        {
          timestamp: 'Just now',
          action: 'Invitation dispatched',
          target: inviteEmail.trim(),
          ip: '192.168.1.42',
        },
      ],
    };

    setUsers([newUser, ...users]);

    // Append to audit log
    const logItem: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: 'Nov 18, 2026 · Just now',
      user: 'Lisa Connell',
      userEmail: 'lisa.c@lilisare.com',
      action: 'Invite sent',
      target: `${inviteName} (${inviteEmail}) · Role: ${inviteRole}`,
      businessLine: inviteBusinessLines[0] || 'Mountain Lane',
      ip: '192.168.1.42',
      result: 'Success',
      details: 'MFA enforced · Activation link emailed',
    };
    setAuditLogs([logItem, ...auditLogs]);

    setIsInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
    showToast(`Invitation sent to ${inviteEmail}. Added as Pending Invite.`);
  };

  // Update Role Permission
  const handleUpdatePermission = (
    moduleName: string,
    field: 'access' | 'scope',
    value: string
  ) => {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id === selectedRoleId) {
          const current = role.permissions[moduleName] || {
            access: 'View only',
            scope: 'My business line',
          };
          return {
            ...role,
            permissions: {
              ...role.permissions,
              [moduleName]: {
                ...current,
                [field]: value as any,
              },
            },
          };
        }
        return role;
      })
    );
    setHasUnsavedRoleChanges(true);
  };

  // Toggle Sensitive Field with Safety Confirmation
  const handleToggleSensitive = (fieldKey: string, label: string) => {
    const isCurrentlyOn = !!selectedRole.sensitiveToggles[fieldKey];
    if (!isCurrentlyOn) {
      // Opening high-risk requires confirmation
      setSensitiveToggleConfirm({
        roleId: selectedRole.id,
        fieldKey,
        label,
      });
    } else {
      // Turning off can be immediate
      setRoles((prev) =>
        prev.map((r) =>
          r.id === selectedRole.id
            ? {
                ...r,
                sensitiveToggles: {
                  ...r.sensitiveToggles,
                  [fieldKey]: false,
                },
              }
            : r
        )
      );
      setHasUnsavedRoleChanges(true);
      showToast(`Restricted: ${label} turned off.`);
    }
  };

  const confirmSensitiveToggle = () => {
    if (!sensitiveToggleConfirm) return;
    const { fieldKey, label } = sensitiveToggleConfirm;
    setRoles((prev) =>
      prev.map((r) =>
        r.id === selectedRole.id
          ? {
              ...r,
              sensitiveToggles: {
                ...r.sensitiveToggles,
                [fieldKey]: true,
              },
            }
          : r
      )
    );
    setHasUnsavedRoleChanges(true);

    // Audit log entry
    const logItem: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: 'Nov 18, 2026 · Just now',
      user: 'Lisa Connell',
      userEmail: 'lisa.c@lilisare.com',
      action: 'Role changed',
      target: `Elevated Field Access: ${label} on ${selectedRole.name}`,
      businessLine: 'Mountain Lane',
      ip: '192.168.1.42',
      result: 'Success',
      details: 'Sensitive HIPAA field-level access granted',
    };
    setAuditLogs([logItem, ...auditLogs]);

    setSensitiveToggleConfirm(null);
    showToast(`Access granted: ${label}. Action recorded in audit log.`);
  };

  // Save Role Changes
  const handleSaveRoleChanges = () => {
    setHasUnsavedRoleChanges(false);
    showToast(`Permissions saved for ${selectedRole.name}.`);
  };

  // Discard Role Changes
  const handleDiscardRoleChanges = () => {
    setRoles(INITIAL_ROLES);
    setHasUnsavedRoleChanges(false);
    showToast('Permission modifications discarded.');
  };

  // Reset Role to Defaults
  const handleResetCurrentRole = () => {
    const defaultDef = INITIAL_ROLES.find((r) => r.id === selectedRole.id);
    if (defaultDef) {
      setRoles((prev) =>
        prev.map((r) => (r.id === selectedRole.id ? { ...defaultDef } : r))
      );
      setHasUnsavedRoleChanges(false);
      showToast(`${selectedRole.name} reset to factory compliance defaults.`);
    }
  };

  // Break-glass activation
  const handleActivateBreakGlass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!breakGlassReason.trim()) {
      showToast('Please state a specific clinical or audit reason.');
      return;
    }
    setBreakGlassActive(true);
    setIsBreakGlassModalOpen(false);

    const logItem: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: 'Nov 18, 2026 · Just now',
      user: 'Lisa Connell',
      userEmail: 'lisa.c@lilisare.com',
      action: 'Break-glass used',
      target: `Temporary Elevation (${breakGlassDuration})`,
      businessLine: 'All Branches',
      ip: '192.168.1.42',
      result: 'Flagged',
      details: `Reason: ${breakGlassReason}`,
    };
    setAuditLogs([logItem, ...auditLogs]);
    showToast('⚠️ Break-Glass Emergency Access activated. All actions logged.');
  };

  // Export Audit Log CSV
  const handleExportAuditLog = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Timestamp,User,Email,Action,Target,Business Line,IP,Result'].join(',') +
      '\n' +
      auditLogs
        .map(
          (l) =>
            `"${l.timestamp}","${l.user}","${l.userEmail}","${l.action}","${l.target}","${l.businessLine}","${l.ip}","${l.result}"`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LiliSare_System_Audit_Log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('System audit log exported to CSV.');
  };

  // Status Chip Renderer
  const renderStatusChip = (status: UserRecord['status']) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Active
          </span>
        );
      case 'Invited':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Invited
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span> Suspended
          </span>
        );
      case 'Deactivated':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span> Deactivated
          </span>
        );
    }
  };

  // Sensitive Field Card Helper
  const sensitiveFieldList = [
    {
      category: 'Clients',
      icon: '👤',
      items: [
        { key: 'client_clinical', label: 'Clinical details & care plan goals', why: 'Required only for nurses and supervisors.' },
        { key: 'client_ssn', label: 'Medicaid ID & home demographics', why: 'Protects client address and state ID numbers.' },
        { key: 'client_rates', label: 'Billing rates & authorized hours', why: 'Restricts financial reimbursement figures.' },
      ],
    },
    {
      category: 'Caregivers',
      icon: '🤝',
      items: [
        { key: 'caregiver_screening', label: 'Background check & CBI results', why: 'Criminal and OIG registry investigation records.' },
        { key: 'caregiver_ssn', label: 'SSN & driver license scans', why: 'State identity documents and sensitive PII.' },
        { key: 'caregiver_pay', label: 'Hourly pay rate & payroll details', why: 'Wage rates and direct deposit information.' },
        { key: 'caregiver_disciplinary', label: 'Disciplinary & complaint notes', why: 'Internal supervision documentation.' },
      ],
    },
    {
      category: 'Care Notes',
      icon: '📝',
      items: [
        { key: 'notes_full_text', label: 'Full clinical note text', why: 'Full narrative of caregiver shift entries.' },
        { key: 'notes_audio', label: 'Original voice recordings', why: 'Direct voice notes dictated by caregivers.' },
        { key: 'notes_attachments', label: 'Photos & wound care forms', why: 'Sensitive photo attachments from visits.' },
      ],
    },
    {
      category: 'Incidents',
      icon: '⚠️',
      items: [
        { key: 'incidents_restricted', label: 'Restricted critical incident reports', why: 'Reports involving abuse, neglect, or injuries.' },
      ],
    },
    {
      category: 'Billing & Claims',
      icon: '💳',
      items: [
        { key: 'billing_claims', label: 'Claim batch submissions', why: 'EDI 837 transaction files sent to payers.' },
        { key: 'billing_denials', label: 'Payer denial letters & appeal records', why: 'Remittance advice and denial reasons.' },
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* MOCK PREVIEW BANNER */}
      {previewingRole && (
        <div className="bg-amber-500 text-stone-900 px-4 py-2.5 rounded-xl font-medium text-sm flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-lg">👁️</span>
            <span>
              Previewing LiliSare as role <strong>{previewingRole}</strong>. Access is restricted according to this role’s active permissions.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setPreviewingRole(null);
              showToast('Exited preview mode.');
            }}
            className="bg-stone-900 text-white text-xs font-semibold px-3 py-1 rounded-lg hover:bg-stone-800 transition"
          >
            Exit preview
          </button>
        </div>
      )}

      {/* BREAK-GLASS ACTIVE ALERT BANNER */}
      {breakGlassActive && (
        <div className="bg-rose-600 text-white px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🚨</span>
            <div>
              <div className="font-bold">Break-Glass Emergency Access is ACTIVE</div>
              <div className="text-xs text-rose-100">
                Temporary administrator override enabled for {breakGlassDuration}. Reason: {breakGlassReason}. Every action is logged to the Colorado State Audit Trail.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setBreakGlassActive(false);
              showToast('Break-Glass emergency access terminated.');
            }}
            className="bg-white text-rose-700 font-bold text-xs px-3.5 py-1.5 rounded-lg hover:bg-rose-50 transition shadow-sm"
          >
            Deactivate Break-Glass
          </button>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-bold text-stone-900">Users and Roles</h1>
            {/* HIPAA Protected Badge */}
            <div
              title="All access is logged. Client information is limited to what each role needs."
              className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-medium cursor-help"
            >
              <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>HIPAA-protected</span>
            </div>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            Manage who can access LiliSare, what they can see, and which business line or programs they can work in.
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsAuditLogDrawerOpen(true)}
            className="flex items-center gap-2 border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 px-3.5 py-2 rounded-xl text-sm font-semibold transition shadow-xs"
          >
            <svg className="w-4 h-4 text-stone-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.5L19 7.5V19a2 2 0 0 1-2 2z" />
            </svg>
            <span>System Audit Log</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResetConfirmModalOpen(true)}
            className="border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 px-3 py-2 rounded-xl text-xs font-medium transition"
          >
            Reset to defaults
          </button>
        </div>
      </div>

      {/* SUMMARY METRIC STRIP (4 CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-medium text-stone-500 uppercase tracking-wide">Active users</div>
          <div className="text-2xl font-bold text-stone-900 mt-1">38</div>
          <div className="text-[11px] text-stone-500 mt-0.5">Across 3 business lines</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-medium text-stone-500 uppercase tracking-wide">Administrators</div>
          <div className="text-2xl font-bold text-stone-900 mt-1">2</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Full security clearance</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-medium text-stone-500 uppercase tracking-wide">Defined roles</div>
          <div className="text-2xl font-bold text-stone-900 mt-1">12</div>
          <div className="text-[11px] text-stone-500 mt-0.5">10 internal · 2 external</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-medium text-stone-500 uppercase tracking-wide">Pending invites</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">3</div>
          <div className="text-[11px] text-stone-500 mt-0.5">Sent in last 7 days</div>
        </div>
      </div>

      {/* MAIN NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'users'
              ? 'bg-[#3E6B2B] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <span>Users</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            activeTab === 'users' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
          }`}>
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'roles'
              ? 'bg-[#3E6B2B] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <span>Roles and Permissions</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            activeTab === 'roles' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
          }`}>
            {roles.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'security'
              ? 'bg-[#3E6B2B] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <span>Security & Compliance</span>
          {breakGlassActive && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USERS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filter Bar & Invite Button */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative min-w-[240px] flex-1">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
                />
                <svg className="w-4 h-4 text-stone-400 absolute left-3 top-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>

              {/* Filter: Role */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
              >
                <option value="All">All Roles</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>

              {/* Filter: Status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Invited">Invited</option>
                <option value="Suspended">Suspended</option>
                <option value="Deactivated">Deactivated</option>
              </select>

              {/* Filter: Business line */}
              <select
                value={filterBusinessLine}
                onChange={(e) => setFilterBusinessLine(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
              >
                <option value="All">All Business Lines</option>
                <option value="Mountain Lane">Mountain Lane</option>
                <option value="Colorado Home Health">Colorado Home Health</option>
                <option value="Frisco">Frisco</option>
              </select>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-[#3E6B2B] text-white hover:bg-[#335a23] font-semibold text-sm px-4 py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2 shrink-0"
            >
              <span>+ Invite user</span>
            </button>
          </div>

          {/* Bulk Selection Floating Bar */}
          {selectedUserIds.length > 0 && (
            <div className="bg-stone-900 text-white rounded-xl px-4 py-2.5 flex items-center justify-between text-sm shadow-md animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="font-bold bg-[#F2B632] text-stone-900 text-xs px-2 py-0.5 rounded-full">
                  {selectedUserIds.length}
                </span>
                <span>users selected</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Updated role for ${selectedUserIds.length} users.`);
                    setSelectedUserIds([]);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  Change role
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Updated scope for ${selectedUserIds.length} users.`);
                    setSelectedUserIds([]);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  Change scope
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsers((prev) =>
                      prev.map((u) =>
                        selectedUserIds.includes(u.id) ? { ...u, status: 'Deactivated' } : u
                      )
                    );
                    setSelectedUserIds([]);
                    showToast(`Deactivated ${selectedUserIds.length} users.`);
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  Deactivate
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserIds([])}
                  className="text-stone-400 hover:text-white text-xs ml-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 border-b border-stone-200 text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        aria-label="Select all users"
                        checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-stone-300 accent-[#3E6B2B] cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Scope</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">MFA</th>
                    <th className="py-3 px-4">Last login</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-stone-500">
                        <div className="text-3xl mb-2">🔍</div>
                        <div className="font-semibold text-stone-700">No users match your criteria</div>
                        <div className="text-xs text-stone-400 mt-1">Try adjusting your search terms or filters</div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSelected = selectedUserIds.includes(u.id);
                      // Avatar initials
                      const initials = u.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2);

                      return (
                        <tr
                          key={u.id}
                          className={`hover:bg-stone-50/70 transition cursor-pointer ${
                            isSelected ? 'bg-emerald-50/40' : ''
                          }`}
                          onClick={(e) => {
                            // Don't open drawer if clicked on checkbox or action menu
                            const target = e.target as HTMLElement;
                            if (target.closest('input[type="checkbox"]') || target.closest('button')) return;
                            setSelectedUserForDrawer(u);
                          }}
                        >
                          <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              aria-label={`Select ${u.name}`}
                              checked={isSelected}
                              onChange={() => handleToggleSelectUser(u.id)}
                              className="rounded border-stone-300 accent-[#3E6B2B] cursor-pointer"
                            />
                          </td>

                          {/* User Name & Avatar */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-700 font-bold text-xs flex items-center justify-center shrink-0 border border-stone-200">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-stone-900 hover:text-[#3E6B2B] transition truncate">
                                  {u.name}
                                </div>
                                <div className="text-xs text-stone-500 truncate">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role Chip */}
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                              {u.role}
                            </span>
                          </td>

                          {/* Scope */}
                          <td className="py-3.5 px-4 text-xs text-stone-700 max-w-[200px]">
                            <div className="font-medium text-stone-800 truncate">{u.businessLine}</div>
                            <div className="text-stone-500 truncate text-[11px]">{u.caseloadSummary}</div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {renderStatusChip(u.status)}
                          </td>

                          {/* MFA Status */}
                          <td className="py-3.5 px-4">
                            {u.mfaEnforced ? (
                              <span
                                title="MFA Enforced (Authenticator / SMS)"
                                className="inline-flex items-center gap-1 text-emerald-700 text-xs font-medium cursor-help"
                              >
                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span className="hidden sm:inline">Active</span>
                              </span>
                            ) : (
                              <span className="text-stone-400 text-xs">Optional</span>
                            )}
                          </td>

                          {/* Last Login */}
                          <td className="py-3.5 px-4 text-xs text-stone-600">
                            {u.lastLogin}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setSelectedUserForDrawer(u)}
                                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition"
                                title="View details"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="19" cy="12" r="1" />
                                  <circle cx="5" cy="12" r="1" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-4 py-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between">
              <div>
                Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
              </div>
              <div className="text-[11px] text-stone-400">
                Click any user to inspect assigned caseload, active sessions, and access logs.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ROLES AND PERMISSIONS TAB (TWO-COLUMN LAYOUT) */}
      {/* ========================================================================= */}
      {activeTab === 'roles' && (
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: ROLE LIST WITH SEARCH */}
          <div className="lg:col-span-4 bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-bold text-base text-stone-900">Configured Roles</h2>
              <button
                type="button"
                onClick={() => {
                  const newRoleName = `Custom Role (${roles.length + 1})`;
                  const newRole: RoleDefinition = {
                    ...selectedRole,
                    id: `role-custom-${Date.now()}`,
                    name: newRoleName,
                    isSystem: false,
                    description: `Custom role duplicated from ${selectedRole.name}.`,
                    userCount: 0,
                  };
                  setRoles([...roles, newRole]);
                  setSelectedRoleId(newRole.id);
                  showToast(`Created custom role "${newRoleName}".`);
                }}
                className="text-xs font-semibold text-[#3E6B2B] hover:text-[#335a23] bg-emerald-50 px-2.5 py-1.5 rounded-lg transition"
              >
                + New custom role
              </button>
            </div>

            {/* Role Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search roles..."
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
              />
              <svg className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>

            {/* Group 1: Internal Staff Roles */}
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider px-2 py-1">
                Internal staff roles ({roles.filter((r) => r.tier === 'Internal').length})
              </div>
              {roles
                .filter(
                  (r) =>
                    r.tier === 'Internal' &&
                    (roleSearch === '' || r.name.toLowerCase().includes(roleSearch.toLowerCase()))
                )
                .map((r) => {
                  const isSelected = selectedRoleId === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setSelectedRoleId(r.id);
                        setHasUnsavedRoleChanges(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'bg-emerald-50 border border-emerald-300 shadow-xs'
                          : 'hover:bg-stone-50 border border-transparent'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold truncate ${
                            isSelected ? 'text-[#3E6B2B]' : 'text-stone-900'
                          }`}>
                            {r.name}
                          </span>
                          {r.isSystem && (
                            <span title="System Role (Protected)" className="text-[10px] text-stone-400">
                              🔒
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                          {r.description}
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-full shrink-0">
                        {r.userCount} {r.userCount === 1 ? 'user' : 'users'}
                      </span>
                    </button>
                  );
                })}
            </div>

            {/* Group 2: External Roles */}
            <div className="space-y-1 pt-2 border-t border-stone-100">
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider px-2 py-1">
                External roles ({roles.filter((r) => r.tier === 'External').length})
              </div>
              {roles
                .filter(
                  (r) =>
                    r.tier === 'External' &&
                    (roleSearch === '' || r.name.toLowerCase().includes(roleSearch.toLowerCase()))
                )
                .map((r) => {
                  const isSelected = selectedRoleId === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setSelectedRoleId(r.id);
                        setHasUnsavedRoleChanges(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'bg-emerald-50 border border-emerald-300 shadow-xs'
                          : 'hover:bg-stone-50 border border-transparent'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold truncate ${
                            isSelected ? 'text-[#3E6B2B]' : 'text-stone-900'
                          }`}>
                            {r.name}
                          </span>
                          {r.isSystem && (
                            <span title="System Role (Protected)" className="text-[10px] text-stone-400">
                              🔒
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                          {r.description}
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-full shrink-0">
                        {r.userCount} {r.userCount === 1 ? 'user' : 'users'}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* RIGHT COLUMN: SELECTED ROLE'S DETAIL PANEL */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header Box */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-stone-900">{selectedRole.name}</h2>
                  {selectedRole.isSystem && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200">
                      🔒 System role
                    </span>
                  )}
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                    selectedRole.tier === 'Internal'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'bg-purple-50 text-purple-800 border border-purple-200'
                  }`}>
                    {selectedRole.tier} Tier
                  </span>
                  <span className="text-xs text-stone-500">
                    ({selectedRole.userCount} assigned {selectedRole.userCount === 1 ? 'user' : 'users'})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewingRole(selectedRole.name);
                      showToast(`Now previewing workspace as ${selectedRole.name}.`);
                    }}
                    className="border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition"
                  >
                    Preview as this role
                  </button>

                  <button
                    type="button"
                    onClick={handleResetCurrentRole}
                    className="text-stone-500 hover:text-stone-800 text-xs px-2 py-1 rounded transition"
                    title="Reset this role to factory baseline"
                  >
                    Reset role
                  </button>
                </div>
              </div>

              <p className="text-sm text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100">
                {selectedRole.description}
              </p>

              {/* Sub-tabs: Module Categories */}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-stone-100 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setRoleModuleTab('all')}
                  className={`pb-1 border-b-2 transition ${
                    roleModuleTab === 'all'
                      ? 'border-[#3E6B2B] text-[#3E6B2B]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  All modules ({Object.keys(selectedRole.permissions).length})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleModuleTab('staff')}
                  className={`pb-1 border-b-2 transition ${
                    roleModuleTab === 'staff'
                      ? 'border-[#3E6B2B] text-[#3E6B2B]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Staff modules
                </button>
                <button
                  type="button"
                  onClick={() => setRoleModuleTab('portal')}
                  className={`pb-1 border-b-2 transition ${
                    roleModuleTab === 'portal'
                      ? 'border-[#3E6B2B] text-[#3E6B2B]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Portal modules (External)
                </button>
              </div>
            </div>

            {/* Permission Matrix Table */}
            <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                <h3 className="font-bold text-sm text-stone-800">Module Access Matrix</h3>
                <span className="text-xs text-stone-500">Each module defines its access level and data visibility scope</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50/60 border-b border-stone-200 text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                    <tr>
                      <th className="py-2.5 px-5">Module</th>
                      <th className="py-2.5 px-4 w-44">Access Level</th>
                      <th className="py-2.5 px-4 w-48">Scope</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {Object.entries(selectedRole.permissions).map(([moduleName, perm]) => (
                      <tr key={moduleName} className="hover:bg-stone-50/60 transition">
                        <td className="py-3 px-5">
                          <div className="font-semibold text-stone-800">{moduleName}</div>
                          <div className="text-xs text-stone-400">
                            {moduleName === 'Care Notes'
                              ? 'Documentation review, voice notes & QA'
                              : moduleName === 'Client Intake'
                              ? 'Inquiries and conversion pipelines'
                              : moduleName === 'Billing'
                              ? 'Claims, EDI files, unbilled hours'
                              : 'Core operating module'}
                          </div>
                        </td>

                        {/* Access Level Dropdown */}
                        <td className="py-3 px-4">
                          <select
                            value={perm.access}
                            onChange={(e) =>
                              handleUpdatePermission(moduleName, 'access', e.target.value)
                            }
                            className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
                              perm.access === 'No access'
                                ? 'bg-stone-50 text-stone-400 border-stone-200'
                                : perm.access === 'Full'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-white text-stone-700 border-stone-300'
                            } focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]`}
                          >
                            <option value="No access">No access</option>
                            <option value="View only">View only</option>
                            <option value="View and edit">View and edit</option>
                            <option value="Full">Full</option>
                          </select>
                        </td>

                        {/* Scope Dropdown */}
                        <td className="py-3 px-4">
                          <select
                            value={perm.scope}
                            disabled={perm.access === 'No access'}
                            onChange={(e) =>
                              handleUpdatePermission(moduleName, 'scope', e.target.value)
                            }
                            className={`w-full px-2.5 py-1.5 rounded-lg text-xs border ${
                              perm.access === 'No access'
                                ? 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed'
                                : 'bg-white text-stone-700 border-stone-300'
                            } focus:outline-none focus:ring-1 focus:ring-[#3E6B2B]`}
                          >
                            <option value="All agency data">All agency data</option>
                            <option value="My business line">My business line</option>
                            <option value="My programs">My programs</option>
                            <option value="My caseload only">My caseload only</option>
                            <option value="Linked clients only">Linked clients only</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SENSITIVE FIELD-LEVEL ACCESS CARDS */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                  <span>🔒 Sensitive Field-Level Access</span>
                  <span className="text-xs font-normal text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                    HIPAA Minimum Necessary
                  </span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  These fields contain highly sensitive client health records, SSNs, background checks, and payroll figures. By default, toggles are locked off unless explicitly authorized for this role.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-2">
                {sensitiveFieldList.map((cat) => (
                  <div key={cat.category} className="border border-stone-200 rounded-xl p-3.5 bg-stone-50/50 space-y-2.5">
                    <div className="font-bold text-xs text-stone-800 flex items-center gap-1.5 border-b border-stone-200 pb-2">
                      <span>{cat.icon}</span>
                      <span>{cat.category} Fields</span>
                    </div>

                    <div className="space-y-2">
                      {cat.items.map((item) => {
                        const isOn = !!selectedRole.sensitiveToggles[item.key];
                        return (
                          <div key={item.key} className="flex items-start justify-between gap-3 text-xs">
                            <div>
                              <div className="font-medium text-stone-800">{item.label}</div>
                              <div className="text-[11px] text-stone-500">{item.why}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleSensitive(item.key, item.label)}
                              className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors shrink-0 ${
                                isOn ? 'bg-[#3E6B2B]' : 'bg-stone-300'
                              }`}
                            >
                              <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                  isOn ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STICKY FOOTER FOR ROLE CHANGES */}
            {hasUnsavedRoleChanges && (
              <div className="sticky bottom-4 z-20 bg-stone-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#F2B632]">⚠️</span>
                  <span>
                    You have unsaved permission changes for <strong>{selectedRole.name}</strong>.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDiscardRoleChanges}
                    className="border border-stone-600 hover:bg-white/10 text-stone-300 text-xs font-semibold px-3 py-2 rounded-xl transition"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveRoleChanges}
                    className="bg-[#3E6B2B] hover:bg-[#335a23] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition"
                  >
                    Save changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SECURITY & COMPLIANCE TAB */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="max-w-4xl space-y-6">
          {/* Card 1: MFA Policy */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-stone-900">Multi-Factor Authentication (MFA)</h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Enforced
                </span>
              </div>
              <p className="text-sm text-stone-600">
                All staff, nurses, coordinators, and external portal users must verify their identity using an authenticator app (Google Authenticator / Duo) or registered SMS number upon signing in.
              </p>
              <div className="text-xs text-stone-400 mt-2">
                Mandatory under Colorado Medicaid EHR Security Protocol & HIPAA Security Rule § 164.312(d).
              </div>
            </div>
            <div className="w-10 h-6 bg-emerald-600 rounded-full flex items-center p-1 cursor-not-allowed opacity-90 shrink-0">
              <div className="bg-white w-4 h-4 rounded-full translate-x-4 shadow" />
            </div>
          </div>

          {/* Card 2: Session Timeout & Inactivity */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-base text-stone-900">Session Timeout & Automatic Screen Lock</h3>
              <p className="text-sm text-stone-600 mt-0.5">
                Automatically logs out unattended workstations to prevent unauthorized PHI exposure.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Inactivity Timeout Limit
                </label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => {
                    setSessionTimeout(e.target.value);
                    showToast(`Session timeout set to ${e.target.value}.`);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white"
                >
                  <option value="15 minutes">15 minutes (HIPAA Recommended)</option>
                  <option value="30 minutes">30 minutes</option>
                  <option value="60 minutes">60 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Untrusted IP / Location Alerts
                </label>
                <div className="flex items-center justify-between border border-stone-200 rounded-xl px-3 py-2">
                  <span className="text-xs text-stone-700">Flag logins outside Colorado</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIpAlertsEnabled(!ipAlertsEnabled);
                      showToast(`Geographic alerts ${!ipAlertsEnabled ? 'enabled' : 'disabled'}.`);
                    }}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                      ipAlertsEnabled ? 'bg-[#3E6B2B]' : 'bg-stone-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                        ipAlertsEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Password & Credential Policy */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-base text-stone-900">Password & Credential Policy</h3>
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                <div className="font-bold text-stone-800">Minimum 14 Characters</div>
                <div className="text-stone-500 mt-1">Requires uppercase, lowercase, numbers, and symbols.</div>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                <div className="font-bold text-stone-800">90-Day Admin Rotation</div>
                <div className="text-stone-500 mt-1">Administrator credentials expire every quarter.</div>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                <div className="font-bold text-stone-800">5-Attempt Lockout</div>
                <div className="text-stone-500 mt-1">Locks account for 30 minutes upon failed login spikes.</div>
              </div>
            </div>
          </div>

          {/* Card 4: Quarterly Access Review */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-stone-900">Periodic Access Review</h3>
                <span className="bg-amber-100 text-amber-900 text-xs font-semibold px-2 py-0.5 rounded-full">
                  Due in 24 days
                </span>
              </div>
              <p className="text-sm text-stone-600 mt-1">
                Routine audit of users who have not logged in for 60+ days. Deprovision inactive staff to prevent orphaned accounts.
              </p>
              <div className="text-xs text-stone-500 mt-2">
                1 inactive user flagged: <strong>Dr. Arthur Bell</strong> (Invited 72 days ago · Never logged in)
              </div>
            </div>

            <button
              type="button"
              onClick={() => showToast('Access review completed. Inactive accounts verified.')}
              className="bg-[#3E6B2B] hover:bg-[#335a23] text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition shrink-0"
            >
              Review now
            </button>
          </div>

          {/* Card 5: Break-Glass Access Override */}
          <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-rose-600 text-lg">🚨</span>
                  <h3 className="font-bold text-base text-stone-900">Break-Glass Emergency Access</h3>
                </div>
                <p className="text-sm text-stone-600 mt-1">
                  Grants temporary emergency administrative privileges during urgent medical crises, RN coverage gaps, or unannounced state Medicaid audits.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsBreakGlassModalOpen(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs shrink-0"
              >
                Activate Break-Glass
              </button>
            </div>

            <div className="bg-rose-50 p-3 rounded-xl text-xs text-rose-800 border border-rose-100">
              <strong>Notice:</strong> Using Break-Glass access triggers an immediate high-priority audit entry and sends an automated notification to all Agency Owners.
            </div>
          </div>

          {/* Card 6: Training Sandbox Flag */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-stone-900">Training Sandbox Flag</h3>
              <p className="text-sm text-stone-600 mt-0.5">
                Forces test users and trainee coordinators to see synthetic de-identified client data only. No real PHI is ever returned from the server.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSandboxModeEnabled(!sandboxModeEnabled);
                showToast(`Training Sandbox mode ${!sandboxModeEnabled ? 'enabled' : 'disabled'}.`);
              }}
              className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors shrink-0 ${
                sandboxModeEnabled ? 'bg-[#3E6B2B]' : 'bg-stone-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                  sandboxModeEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INVITE USER */}
      {/* ========================================================================= */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-fade-in my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-lg text-stone-900">Invite User to LiliSare</h3>
                <p className="text-xs text-stone-500">Configure access level, business line scope, and caseload.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Work Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="jordan.m@lilisare.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E6B2B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.name}>{r.name} ({r.tier})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Business Line Scope</label>
                  <select
                    multiple
                    value={inviteBusinessLines}
                    onChange={(e) =>
                      setInviteBusinessLines(Array.from(e.target.selectedOptions, (o) => o.value))
                    }
                    className="w-full px-2 py-1.5 rounded-xl border border-stone-300 text-xs bg-white h-20"
                  >
                    <option value="Mountain Lane">Mountain Lane</option>
                    <option value="Colorado Home Health">Colorado Home Health</option>
                    <option value="Frisco">Frisco</option>
                  </select>
                  <span className="text-[10px] text-stone-400">Hold Ctrl / Cmd to multi-select</span>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Program Scope</label>
                  <select
                    multiple
                    value={inviteProgramScope}
                    onChange={(e) =>
                      setInviteProgramScope(Array.from(e.target.selectedOptions, (o) => o.value))
                    }
                    className="w-full px-2 py-1.5 rounded-xl border border-stone-300 text-xs bg-white h-20"
                  >
                    <option value="IHSS">IHSS</option>
                    <option value="CFC">CFC</option>
                    <option value="HCBS">HCBS</option>
                    <option value="IRSS">IRSS</option>
                    <option value="HMA">HMA</option>
                    <option value="PDN">PDN</option>
                  </select>
                  <span className="text-[10px] text-stone-400">Restricts caseload filters</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Optional Caseload Assignment</label>
                <select
                  value={inviteCaseloadClient}
                  onChange={(e) => setInviteCaseloadClient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white"
                >
                  <option value="">None (General Agency Access)</option>
                  {CL.map((c) => (
                    <option key={c.id} value={c.name}>{c.name} ({c.program} · ID {c.id})</option>
                  ))}
                </select>
              </div>

              {/* MFA Lock */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-800">Require Multi-Factor Authentication (MFA)</div>
                  <div className="text-[11px] text-stone-500">MFA setup will be required on first sign-in.</div>
                </div>
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="w-4 h-4 rounded text-emerald-600 cursor-not-allowed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="border border-stone-300 text-stone-700 px-4 py-2 rounded-xl hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#3E6B2B] hover:bg-[#335a23] text-white font-bold px-5 py-2 rounded-xl shadow-xs transition"
                >
                  Send invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER: USER PROFILE & ACCESS DETAIL */}
      {/* ========================================================================= */}
      {selectedUserForDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedUserForDrawer(null)}
          />

          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-left overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-6 border-b border-stone-200 flex items-start justify-between bg-stone-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-700 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm">
                  {selectedUserForDrawer.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-stone-900">{selectedUserForDrawer.name}</h2>
                    {renderStatusChip(selectedUserForDrawer.status)}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">{selectedUserForDrawer.email}</div>
                  <div className="text-xs text-stone-600 font-medium">{selectedUserForDrawer.title}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUserForDrawer(null)}
                className="text-stone-400 hover:text-stone-800 text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6 flex-1 text-sm text-stone-800">
              {/* Role & Scope */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-stone-500">Security Clearance</span>
                  <span className="font-semibold text-xs bg-white border border-stone-300 px-2 py-0.5 rounded">
                    {selectedUserForDrawer.role}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-stone-500 block">Business Line:</span>
                    <span className="font-semibold">{selectedUserForDrawer.businessLine}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Program Scope:</span>
                    <span className="font-semibold">{selectedUserForDrawer.programScope.join(', ')}</span>
                  </div>
                </div>

                <div className="text-xs pt-2 border-t border-stone-200">
                  <span className="text-stone-500">Caseload:</span>{' '}
                  <span className="font-medium text-stone-900">{selectedUserForDrawer.caseloadSummary}</span>
                </div>
              </div>

              {/* MFA & Security */}
              <div className="border border-stone-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900">MFA & Authentication</span>
                  <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                    ✓ Enforced & Verified
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  Secured with Authenticator App (TOTP). Last login: {selectedUserForDrawer.lastLogin}.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => showToast(`MFA reset link dispatched to ${selectedUserForDrawer.email}.`)}
                    className="border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                  >
                    Reset MFA credentials
                  </button>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="border border-stone-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900">Active Workstation Sessions</span>
                  {selectedUserForDrawer.sessions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setUsers((prev) =>
                          prev.map((u) =>
                            u.id === selectedUserForDrawer.id ? { ...u, sessions: [] } : u
                          )
                        );
                        setSelectedUserForDrawer((prev) => (prev ? { ...prev, sessions: [] } : null));
                        showToast('Signed out all remote sessions.');
                      }}
                      className="text-xs text-rose-600 font-semibold hover:underline"
                    >
                      Sign out all sessions
                    </button>
                  )}
                </div>

                {selectedUserForDrawer.sessions.length === 0 ? (
                  <div className="text-xs text-stone-400 italic">No active sessions.</div>
                ) : (
                  <div className="space-y-2">
                    {selectedUserForDrawer.sessions.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-stone-50 p-2.5 rounded-lg text-xs">
                        <div>
                          <div className="font-semibold text-stone-800">{s.device}</div>
                          <div className="text-stone-500">{s.location} · {s.lastActive}</div>
                        </div>
                        {s.isCurrent ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            Current
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px]">Active</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User Specific Audit Events */}
              <div className="border border-stone-200 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-stone-900 block">Recent Access & HIPAA Audit Events</span>
                <div className="space-y-2 text-xs">
                  {selectedUserForDrawer.recentEvents.map((ev, idx) => (
                    <div key={idx} className="p-2.5 bg-stone-50 rounded-lg flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-stone-800">{ev.action}</div>
                        <div className="text-stone-500 text-[11px]">Target: {ev.target}</div>
                      </div>
                      <div className="text-right text-[10px] text-stone-400 shrink-0">
                        <div>{ev.timestamp}</div>
                        <div>{ev.ip}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 shrink-0 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const newStatus =
                    selectedUserForDrawer.status === 'Active' ? 'Suspended' : 'Active';
                  setUsers((prev) =>
                    prev.map((u) =>
                      u.id === selectedUserForDrawer.id ? { ...u, status: newStatus } : u
                    )
                  );
                  setSelectedUserForDrawer((prev) =>
                    prev ? { ...prev, status: newStatus } : null
                  );
                  showToast(`User status set to ${newStatus}.`);
                }}
                className="border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold text-xs px-3 py-2 rounded-xl transition"
              >
                {selectedUserForDrawer.status === 'Active' ? 'Suspend account' : 'Reactivate account'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setUsers((prev) =>
                    prev.map((u) =>
                      u.id === selectedUserForDrawer.id ? { ...u, status: 'Deactivated' } : u
                    )
                  );
                  setSelectedUserForDrawer((prev) =>
                    prev ? { ...prev, status: 'Deactivated' } : null
                  );
                  showToast('User account deactivated.');
                }}
                className="bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-xs px-3.5 py-2 rounded-xl transition"
              >
                Deactivate user
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER: SYSTEM AUDIT LOG */}
      {/* ========================================================================= */}
      {isAuditLogDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAuditLogDrawerOpen(false)}
          />

          <div className="relative w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-left overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-stone-200 bg-stone-50 flex items-start justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-stone-900">System Audit Log</h2>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    Immutable
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Colorado Medicaid and HIPAA security log. Retained for 7 years per state administrative rule.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportAuditLog}
                  className="bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1.5"
                >
                  <span>⬇️ Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuditLogDrawerOpen(false)}
                  className="text-stone-400 hover:text-stone-800 text-lg p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Filter Row */}
            <div className="p-4 bg-stone-100/70 border-b border-stone-200 flex flex-wrap items-center gap-3 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-600">Action:</span>
                <select
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                  className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs"
                >
                  <option value="All">All Actions</option>
                  <option value="Role changed">Role changed</option>
                  <option value="Viewed record">Viewed record</option>
                  <option value="Edited record">Edited record</option>
                  <option value="Exported data">Exported data</option>
                  <option value="Invite sent">Invite sent</option>
                  <option value="Failed login">Failed login</option>
                  <option value="Break-glass used">Break-glass used</option>
                </select>
              </div>

              <div className="text-xs text-stone-500 ml-auto">
                Showing {auditLogs.length} verified audit records
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Target</th>
                    <th className="py-2.5 px-3">IP / Device</th>
                    <th className="py-2.5 px-3">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {auditLogs
                    .filter((l) => auditActionFilter === 'All' || l.action === auditActionFilter)
                    .map((log) => (
                      <tr key={log.id} className="hover:bg-stone-50/80 transition">
                        <td className="py-3 px-3 font-mono text-[11px] text-stone-600 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-stone-800">{log.user}</div>
                          <div className="text-[10px] text-stone-400">{log.userEmail}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.action === 'Role changed'
                              ? 'bg-purple-100 text-purple-800'
                              : log.action === 'Exported data'
                              ? 'bg-blue-100 text-blue-800'
                              : log.action === 'Failed login'
                              ? 'bg-rose-100 text-rose-800'
                              : log.action === 'Break-glass used'
                              ? 'bg-rose-600 text-white'
                              : 'bg-stone-100 text-stone-700'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-3 max-w-[220px]">
                          <div className="font-medium text-stone-800 truncate">{log.target}</div>
                          {log.details && (
                            <div className="text-[10px] text-stone-500 truncate">{log.details}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-[10px] text-stone-500 whitespace-nowrap">
                          {log.ip}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                            log.result === 'Success'
                              ? 'text-emerald-700'
                              : log.result === 'Flagged'
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}>
                            {log.result === 'Success' ? '✓' : '⚠️'} {log.result}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SENSITIVE TOGGLE CONFIRMATION */}
      {/* ========================================================================= */}
      {sensitiveToggleConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2.5 text-amber-600">
              <span className="text-2xl">⚠️</span>
              <h3 className="font-bold text-base text-stone-900">Elevated PHI Access Confirmation</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              You are about to grant access to <strong>{sensitiveToggleConfirm.label}</strong> for all users assigned to the <strong>{selectedRole.name}</strong> role.
            </p>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              This lets users inspect highly confidential client data or staff personnel records. This configuration change will be permanently logged to the System Audit Trail.
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSensitiveToggleConfirm(null)}
                className="border border-stone-300 text-stone-700 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-stone-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSensitiveToggle}
                className="bg-[#3E6B2B] hover:bg-[#335a23] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
              >
                Confirm & Enable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BREAK-GLASS ACTIVATION */}
      {/* ========================================================================= */}
      {isBreakGlassModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2.5 text-rose-600">
              <span className="text-2xl">🚨</span>
              <h3 className="font-bold text-base text-stone-900">Activate Break-Glass Access</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Break-Glass overrides role restrictions and grants full administrative access across all client charts and billing files.
            </p>

            <form onSubmit={handleActivateBreakGlass} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">State Required Reason *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Unannounced Colorado CDPHE State Survey / Critical Patient Transfer"
                  value={breakGlassReason}
                  onChange={(e) => setBreakGlassReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Duration</label>
                <select
                  value={breakGlassDuration}
                  onChange={(e) => setBreakGlassDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                >
                  <option value="1 hour">1 hour</option>
                  <option value="4 hours">4 hours</option>
                  <option value="24 hours">24 hours (Requires Owner Approval)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsBreakGlassModalOpen(false)}
                  className="border border-stone-300 text-stone-700 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Activate Emergency Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESET TO DEFAULTS CONFIRMATION */}
      {/* ========================================================================= */}
      {isResetConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-3 animate-fade-in text-xs">
            <h3 className="font-bold text-base text-stone-900">Reset System to Defaults?</h3>
            <p className="text-stone-600">
              This will restore the standard 12 roles, default module permission matrices, and security settings to factory configurations.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsResetConfirmModalOpen(false)}
                className="border border-stone-300 px-3 py-1.5 rounded-xl font-semibold text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsers(INITIAL_USERS);
                  setRoles(INITIAL_ROLES);
                  setHasUnsavedRoleChanges(false);
                  setIsResetConfirmModalOpen(false);
                  showToast('LiliSare Users and Roles reset to factory defaults.');
                }}
                className="bg-[#3E6B2B] hover:bg-[#335a23] text-white font-bold px-3 py-1.5 rounded-xl shadow-xs"
              >
                Reset now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
