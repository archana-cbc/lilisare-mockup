'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';

// =========================================================================
// TYPES
// =========================================================================
export interface FlagItem {
  phrase: string;
  ruleName: string;
  category: 'wording' | 'missing' | 'safety';
  plainWhy: string;
  suggestedReplacement: string;
}

export interface AttachmentItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ShiftRecord {
  id: string;
  clientId: string;
  date: string;
  time: string;
  caregiver: string;
  hours: string;
  evvStatus: 'Verified' | 'Exception' | 'Pending';
  noteStatus: 'Needs fix' | 'Waiting on caregiver' | 'Refined' | 'Approved' | 'No note yet';
  weekGroup: 'This week' | 'Last week' | 'Two weeks ago';
  tasks: string[];
  roughNote: string;
  flags: FlagItem[];
  quickDetails: Array<{ id: string; question: string; answer: string }>;
  isSafetyRisk?: boolean;
  refinedOutputs: {
    narrativeStandard: string;
    narrativeShort: string;
    narrativeDetailed: string;
    soapStandard: string;
    bulletsStandard: string;
    stateStandard: string;
    spanishStandard: string;
  };
  attachments: AttachmentItem[];
}

export interface ClientCoachItem {
  id: string;
  name: string;
  maskedId: string;
  age: number;
  dob: string;
  program: 'IHSS' | 'CFC' | 'HCBS' | 'IRSS' | 'HMA';
  caregiver: string;
  notesNeedingWork: number;
  shifts: ShiftRecord[];
  carePlanGoals: string[];
  authorizedHours: string;
  lastThreeNotes: string[];
}

// =========================================================================
// DEMO DATA: 5 CLIENTS WITH 8-12 SHIFTS EACH ACROSS 3 WEEKS
// =========================================================================
const CLIENTS_DATA: ClientCoachItem[] = [
  {
    id: 'C-1001',
    name: 'Marisol Vega',
    maskedId: 'C-***1',
    age: 67,
    dob: 'Oct 14, 1959',
    program: 'IHSS',
    caregiver: 'Rosa Vega (Primary), Elena M.',
    notesNeedingWork: 3,
    authorizedHours: '28.0 hrs/week · IHSS Attendant Care',
    carePlanGoals: [
      'Maintain independent nutrition with verbal encouragement',
      'Morning hypertension medication reminder at 9:00 AM with water',
      'Safe transfers and mobility using rolling walker',
    ],
    lastThreeNotes: [
      'Nov 16: Marisol ate full breakfast of yogurt and fruit. BP pills taken at 9:05 AM with water.',
      'Nov 15: Assisted with morning shower and dressing. Client cheerful and engaged.',
      'Nov 14: Client declined eggs, accepted toast and tea. Meds taken with supervision.',
    ],
    shifts: [
      {
        id: 'SH-101',
        clientId: 'C-1001',
        date: 'Today, Nov 17',
        time: '8:00 AM – 11:30 AM',
        hours: '3.5h',
        caregiver: 'Rosa Vega',
        evvStatus: 'Verified',
        noteStatus: 'Needs fix',
        weekGroup: 'This week',
        tasks: ['Meal preparation', 'Morning hygiene & bath', 'Medication reminder'],
        roughNote:
          "Got there around 8. Helped her with bath and stuff, made breakfast. She was grumpy and didn't eat much. Did the normal meds thing. Left at 11:30.",
        flags: [
          {
            phrase: 'and stuff',
            ruleName: 'Clear task description',
            category: 'wording',
            plainWhy: '"and stuff" is vague. State auditors require naming the specific personal care delivered.',
            suggestedReplacement: 'morning oral care and hair grooming',
          },
          {
            phrase: 'grumpy',
            ruleName: 'Objective language rule (10 CCR 2505-10 § 8.510)',
            category: 'wording',
            plainWhy: '"grumpy" is a subjective characterization rather than observable behavior.',
            suggestedReplacement: 'client expressed she was tired',
          },
          {
            phrase: "didn't eat much",
            ruleName: 'Nutritional documentation',
            category: 'missing',
            plainWhy: 'State rules require documenting the meal served and the approximate portion consumed.',
            suggestedReplacement: 'ate approximately half of the yogurt and toast offered',
          },
          {
            phrase: 'normal meds thing',
            ruleName: 'Medication administration timing',
            category: 'missing',
            plainWhy: 'Medication reminders require the exact time, water intake, and client response.',
            suggestedReplacement: 'prompted morning blood pressure medication at 9:05 AM with a full glass of water',
          },
        ],
        quickDetails: [
          { id: 'q1', question: 'What did she eat?', answer: 'About half of the yogurt and toast offered' },
          { id: 'q2', question: 'Was medication given as planned?', answer: 'Yes, morning blood pressure meds at 9:05 AM with water' },
          { id: 'q3', question: 'How long was the bath?', answer: '25 min, assisted safely with rolling walker' },
        ],
        attachments: [
          { id: 'att-1', name: 'Shift_Checkin_GPS.pdf', type: 'EVV match audit', size: '120 KB', uploadedBy: 'System', uploadedAt: '8:02 AM' },
        ],
        refinedOutputs: {
          narrativeStandard:
            'Caregiver arrived at 8:00 AM. Assisted client with morning hygiene, including bathing (approx. 25 minutes) and oral care, utilizing rolling walker for safe transfers. Prepared breakfast of yogurt and toast; client expressed she was not hungry and consumed approximately half of the portion offered. Medication reminder provided at 9:05 AM; client self-administered morning blood pressure medication with water. Client was calm and cooperative. Caregiver departed at 11:30 AM.',
          narrativeShort:
            'Arrived 8:00 AM. Assisted with 25-minute bath and oral hygiene using walker. Client ate half of offered yogurt and toast. Blood pressure medication reminder provided at 9:05 AM with water. Client cooperative. Departed 11:30 AM.',
          narrativeDetailed:
            'Caregiver arrived on schedule at 8:00 AM. Assisted client with transfers using rolling walker to bathroom for morning hygiene routine, including a 25-minute supervised shower and oral care without loss of balance. Prepared breakfast of yogurt and wheat toast; client verbalized low morning appetite and ate approximately half of the serving. Provided reminder for physician-prescribed morning hypertension medication at 9:05 AM, which client took with a full glass of water. Client remained calm, alert, and resting safely in armchair upon caregiver departure at 11:30 AM.',
          soapStandard:
            'S: Client stated she was not very hungry this morning.\nO: Assisted with 25 min bath, transfers with rolling walker, and meal prep. Client consumed ~50% of yogurt and toast. Prompted morning blood pressure meds at 9:05 AM with water.\nA: Safe ambulation observed. Nutrition accepted with verbal encouragement.\nP: Continue scheduled morning IHSS attendant care and monitor breakfast intake.',
          bulletsStandard:
            '• Tasks completed: Supervised 25 min bathing, transfers with rolling walker, breakfast preparation, medication reminder.\n• Nutrition & intake: Prepared yogurt and toast; client consumed approximately half.\n• Medication: Prompted morning blood pressure medication at 9:05 AM with water.\n• Client status: Alert, cooperative, rested comfortably in armchair.',
          stateStandard:
            'COLORADO IHSS SERVICE SUMMARY\nClient: Marisol Vega | Date: Nov 17, 2026 | Shift: 8:00 AM – 11:30 AM\n1. Personal Care: Assisted with bathing (25 min) and morning hygiene using rolling walker.\n2. Nutrition: Prepared yogurt and toast; client consumed approx. 50%.\n3. Medication Reminder: Prompted morning blood pressure medication at 9:05 AM with water.\n4. Client Response: Calm, alert, no adverse events.',
          spanishStandard:
            'La cuidadora llegó a las 8:00 AM. Asistió a la clienta con la higiene matutina, incluyendo un baño de 25 minutos con andador rodante. Preparó el desayuno; la clienta consumió aproximadamente la mitad del yogur y tostada. Se brindó recordatorio para su medicamento de presión arterial a las 9:05 AM con agua. La clienta se mostró tranquila y colaboradora. Salida a las 11:30 AM.',
        },
      },
      // Second shift on the same day (Evening with different caregiver)
      {
        id: 'SH-102',
        clientId: 'C-1001',
        date: 'Today, Nov 17',
        time: '5:00 PM – 8:00 PM',
        hours: '3.0h',
        caregiver: 'Elena M.',
        evvStatus: 'Verified',
        noteStatus: 'Waiting on caregiver',
        weekGroup: 'This week',
        tasks: ['Dinner preparation', 'Evening medication reminder', 'Bed preparation'],
        roughNote: 'Prepared light chicken soup for dinner. Client took evening meds at 7:00 PM with water. Assisted with night routine.',
        flags: [],
        quickDetails: [],
        attachments: [],
        refinedOutputs: {
          narrativeStandard:
            'Caregiver arrived at 5:00 PM. Prepared nutritious chicken soup; client ate full portion and drank 8oz water. Prompted scheduled evening medications at 7:00 PM with water. Assisted client with evening oral care, transfer to bed using rolling walker, and ensured call bell was in reach. Departed at 8:00 PM.',
          narrativeShort: 'Prepared dinner soup; full portion eaten. Evening meds prompted at 7:00 PM. Assisted into bed with walker.',
          narrativeDetailed: 'Prepared dinner soup; full portion eaten. Evening meds prompted at 7:00 PM. Assisted into bed with walker.',
          soapStandard: 'S: Client ready for bed.\nO: Dinner prepared, meds at 7 PM.\nA: Safe.\nP: Continue.',
          bulletsStandard: '• Dinner: Chicken soup eaten.\n• Meds: 7:00 PM.\n• Sleep prep: Safe transfer.',
          stateStandard: 'COLORADO IHSS SUMMARY: Dinner and evening meds completed per care plan.',
          spanishStandard: 'Preparó sopa para la cena. Medicamentos tomados a las 7:00 PM.',
        },
      },
      {
        id: 'SH-103',
        clientId: 'C-1001',
        date: 'Nov 16, 2026',
        time: '8:00 AM – 11:30 AM',
        hours: '3.5h',
        caregiver: 'Rosa Vega',
        evvStatus: 'Verified',
        noteStatus: 'Approved',
        weekGroup: 'This week',
        tasks: ['Morning hygiene', 'Meal prep', 'Mobility supervision'],
        roughNote: 'Marisol ate full breakfast of yogurt and fruit. BP pills taken at 9:05 AM with water. Assisted with morning hygiene.',
        flags: [],
        quickDetails: [],
        attachments: [],
        refinedOutputs: {
          narrativeStandard: 'Assisted client with morning hygiene and walking exercise. Prepared breakfast; client consumed full portion. Meds taken at 9:05 AM.',
          narrativeShort: 'Hygiene and breakfast completed. Meds taken 9:05 AM.',
          narrativeDetailed: 'Hygiene and breakfast completed. Meds taken 9:05 AM.',
          soapStandard: 'S: Good morning.\nO: Complete breakfast eaten.\nA: Stable.\nP: Continue.',
          bulletsStandard: '• Breakfast eaten.\n• Hygiene complete.\n• Meds verified.',
          stateStandard: 'IHSS visit verified.',
          spanishStandard: 'Desayuno completo e higiene matutina asistida.',
        },
      },
      {
        id: 'SH-104',
        clientId: 'C-1001',
        date: 'Nov 15, 2026',
        time: '8:00 AM – 11:30 AM',
        hours: '3.5h',
        caregiver: 'Rosa Vega',
        evvStatus: 'Verified',
        noteStatus: 'Refined',
        weekGroup: 'This week',
        tasks: ['Shower assist', 'Laundry', 'Medication reminder'],
        roughNote: 'Shower went well. Did laundry. Client in good mood.',
        flags: [],
        quickDetails: [],
        attachments: [],
        refinedOutputs: {
          narrativeStandard: 'Assisted client with shower transfer and morning routine. Washed and folded linens. Client calm and cheerful.',
          narrativeShort: 'Shower assist and laundry done.',
          narrativeDetailed: 'Shower assist and laundry done.',
          soapStandard: 'S: Good mood.\nO: Shower completed safely.\nA: Stable.\nP: Continue.',
          bulletsStandard: '• Shower: Completed.\n• Housekeeping: Linens washed.',
          stateStandard: 'IHSS visit verified.',
          spanishStandard: 'Ducha asistida y lavado de ropa.',
        },
      },
      // Sample B: Safety Case (Nov 12)
      {
        id: 'SH-105',
        clientId: 'C-1001',
        date: 'Nov 12, 2026',
        time: '8:00 AM – 11:30 AM',
        hours: '3.5h',
        caregiver: 'Rosa Vega',
        evvStatus: 'Verified',
        noteStatus: 'Needs fix',
        weekGroup: 'Last week',
        tasks: ['Morning hygiene', 'Breakfast prep', 'Medication reminder'],
        roughNote:
          'Got there at 8. Client was agitated and refused breakfast so I made her eat anyway because she needs food for her pills. She resisted and bruised her elbow against the bed frame.',
        flags: [
          {
            phrase: 'made her eat anyway',
            ruleName: 'Mandatory Safety Rule: Physical force or coercion',
            category: 'safety',
            plainWhy: 'Physical force or non-consensual care is strictly reportable under state Medicaid safety rules.',
            suggestedReplacement: '',
          },
          {
            phrase: 'bruised her elbow',
            ruleName: 'Mandatory Safety Rule: Client injury or fall',
            category: 'safety',
            plainWhy: 'Any skin compromise, fall, or injury requires immediate supervisor notification and 24-hour HCPF reporting.',
            suggestedReplacement: '',
          },
        ],
        quickDetails: [],
        isSafetyRisk: true,
        attachments: [
          { id: 'att-b1', name: 'Elbow_Injury_Photo.jpg', type: 'Injury photo', size: '1.9 MB', uploadedBy: 'Rosa Vega', uploadedAt: '11:32 AM' },
        ],
        refinedOutputs: {
          narrativeStandard: '',
          narrativeShort: '',
          narrativeDetailed: '',
          soapStandard: '',
          bulletsStandard: '',
          stateStandard: '',
          spanishStandard: '',
        },
      },
      {
        id: 'SH-106',
        clientId: 'C-1001',
        date: 'Nov 11, 2026',
        time: '8:00 AM – 11:30 AM',
        hours: '3.5h',
        caregiver: 'Rosa Vega',
        evvStatus: 'Verified',
        noteStatus: 'Approved',
        weekGroup: 'Last week',
        tasks: ['Morning care', 'Meal prep'],
        roughNote: 'Client had oatmeal and tea. Assisted with morning hygiene and walking.',
        flags: [],
        quickDetails: [],
        attachments: [],
        refinedOutputs: {
          narrativeStandard: 'Prepared oatmeal and tea. Assisted with morning hygiene and mobility walk.',
          narrativeShort: 'Meal and hygiene assisted.',
          narrativeDetailed: 'Meal and hygiene assisted.',
          soapStandard: 'S: Normal.\nO: Meal eaten.\nA: Stable.\nP: Continue.',
          bulletsStandard: '• Meal eaten.\n• Hygiene completed.',
          stateStandard: 'IHSS verified.',
          spanishStandard: 'Desayuno e higiene.',
        },
      },
      {
        id: 'SH-107',
        clientId: 'C-1001',
        date: 'Nov 10, 2026',
        time: '5:00 PM – 8:00 PM',
        hours: '3.0h',
        caregiver: 'Elena M.',
        evvStatus: 'Verified',
        noteStatus: 'Approved',
        weekGroup: 'Last week',
        tasks: ['Dinner', 'Bedtime prep'],
        roughNote: 'Assisted with evening meal and bed routine.',
        flags: [],
        quickDetails: [],
        attachments: [],
        refinedOutputs: {
          narrativeStandard: 'Assisted with dinner and evening transfer to bed.',
          narrativeShort: 'Dinner and bed transfer.',
          narrativeDetailed: 'Dinner and bed transfer.',
          soapStandard: 'S: Good evening.\nO: Dinner complete.\nA: Stable.\nP: Continue.',
          bulletsStandard: '• Dinner.\n• Bed routine.',
          stateStandard: 'IHSS verified.',
          spanishStandard: 'Cena y descanso.',
        },
      },
      {
        id: 'SH-108',
        clientId: 'C-1001',
        date: 'Nov 04, 2026',
        time: '8:00 AM – 11:30 AM',
        hours: '3.5h',
        caregiver: 'Rosa Vega',
        evvStatus: 'Verified',
        noteStatus: 'No note yet',
        weekGroup: 'Two weeks ago',
        tasks: ['Personal care', 'Meal prep'],
        roughNote: '',
        flags: [],
        quickDetails: [],
        attachments: [],
        refinedOutputs: {
          narrativeStandard: '',
          narrativeShort: '',
          narrativeDetailed: '',
          soapStandard: '',
          bulletsStandard: '',
          stateStandard: '',
          spanishStandard: '',
        },
      },
    ],
  },
  // Sample D: Spanish note client
  {
    id: 'C-1007',
    name: 'Walter Hayes',
    maskedId: 'C-***7',
    age: 74,
    dob: 'Mar 10, 1952',
    program: 'CFC',
    caregiver: 'Beth Hayes',
    notesNeedingWork: 1,
    authorizedHours: '18.0 hrs/week · CFC Community First Choice',
    carePlanGoals: ['Safe indoor ambulation with single-point cane', 'Living area sanitation and homemaking'],
    lastThreeNotes: ['Nov 15: Cleaned kitchen and assisted with cane walk.', 'Nov 12: Light housekeeping.'],
    shifts: [
      {
        id: 'SH-201',
        clientId: 'C-1007',
        date: 'Today, Nov 17',
        time: '9:00 AM – 12:00 PM',
        hours: '3.0h',
        caregiver: 'Beth Hayes',
        evvStatus: 'Verified',
        noteStatus: 'Needs fix',
        weekGroup: 'This week',
        tasks: ['CFC Homemaking', 'Mobility supervision'],
        roughNote: 'Did good today, took care of everything, normal routine and walked around the house. No complaints.',
        flags: [
          { phrase: 'Did good today', ruleName: 'Objective language rule', category: 'wording', plainWhy: 'Vague characterization.', suggestedReplacement: 'Client reported feeling well' },
          { phrase: 'took care of everything', ruleName: 'Task substantiation', category: 'missing', plainWhy: 'Must specify authorized tasks.', suggestedReplacement: 'completed scheduled bed linen change and kitchen sanitation' },
          { phrase: 'normal routine', ruleName: 'Specific observation', category: 'wording', plainWhy: 'Auditors require observable documentation.', suggestedReplacement: 'conducted 20-minute indoor mobility routine using prescribed cane' },
        ],
        quickDetails: [
          { id: 'wq1', question: 'How long was the mobility walk?', answer: '20 minutes in hallway using cane without staggering' },
          { id: 'wq2', question: 'Which homemaking tasks were finished?', answer: 'Changed bed linens and sanitized bathroom' },
        ],
        attachments: [],
        refinedOutputs: {
          narrativeStandard: 'Arrived at 9:00 AM. Assisted client with scheduled CFC homemaking tasks, including bed linen change and bathroom sanitization. Supervised client during 20-minute indoor mobility routine using prescribed single-point cane. Client demonstrated steady gait with no loss of balance. Departed at 12:00 PM.',
          narrativeShort: 'Assisted with bed linen change and bathroom sanitation. Supervised 20 min cane ambulation with steady gait.',
          narrativeDetailed: 'Visit conducted 9:00 AM – 12:00 PM per CFC authorization. Completed scheduled homemaking tasks: linen change and bathroom sanitization. Supervised client during mobility exercise: 20 minutes walking in hallway with single-point cane, maintaining steady gait. Client reported no discomfort.',
          soapStandard: 'S: Client reported feeling well.\nO: Completed linen change. Supervised 20 min cane walk.\nA: Steady gait observed.\nP: Continue scheduled CFC homemaking.',
          bulletsStandard: '• Homemaking: Bed linen change and bathroom sanitization.\n• Mobility: Supervised 20 min indoor cane walk.\n• Status: Alert, stable gait.',
          stateStandard: 'COLORADO CFC SUMMARY: Homemaking and mobility supervision completed per care plan.',
          spanishStandard: 'Se realizó cambio de sábanas y desinfección de baño. Se supervisó caminata de 20 min con bastón.',
        },
      },
    ],
  },
  {
    id: 'C-1006',
    name: 'Josefina Ruiz',
    maskedId: 'C-***6',
    age: 72,
    dob: 'Jan 22, 1954',
    program: 'HMA',
    caregiver: 'Luis Ruiz',
    notesNeedingWork: 1,
    authorizedHours: '21.0 hrs/week · HMA Skilled Delegation',
    carePlanGoals: ['Gastrostomy tube care and medication flush', 'Bed bath and skin inspection'],
    lastThreeNotes: ['Nov 16: Midday meds given via G-tube at 11:30 AM.', 'Nov 15: Tube flushed with 30ml water.'],
    shifts: [
      {
        id: 'SH-301',
        clientId: 'C-1006',
        date: 'Today, Nov 17',
        time: '10:00 AM – 1:00 PM',
        hours: '3.0h',
        caregiver: 'Luis Ruiz',
        evvStatus: 'Verified',
        noteStatus: 'Needs fix',
        weekGroup: 'This week',
        tasks: ['Delegated G-Tube Care', 'Medication administration', 'Bed bath'],
        roughNote: 'Client refused to let me help transfer, so I forced her to sit down in the chair and she fell against the wall, minor bruise on left elbow. Gave midday meds.',
        flags: [
          { phrase: 'forced her to sit down', ruleName: 'Safety escalation: physical force', category: 'safety', plainWhy: 'Physical force is strictly reportable.', suggestedReplacement: '' },
          { phrase: 'she fell against the wall', ruleName: 'Safety escalation: client fall', category: 'safety', plainWhy: 'Fall with injury requires 24h HCPF notification.', suggestedReplacement: '' },
        ],
        quickDetails: [],
        isSafetyRisk: true,
        attachments: [
          { id: 'att-301', name: 'Elbow_Injury_Photo.jpg', type: 'Injury photo', size: '2.1 MB', uploadedBy: 'Luis Ruiz', uploadedAt: '1:05 PM' },
        ],
        refinedOutputs: {
          narrativeStandard: '',
          narrativeShort: '',
          narrativeDetailed: '',
          soapStandard: '',
          bulletsStandard: '',
          stateStandard: '',
          spanishStandard: '',
        },
      },
    ],
  },
  {
    id: 'C-1002',
    name: 'Eli Brandt',
    maskedId: 'C-***2',
    age: 19,
    dob: 'Aug 11, 2007',
    program: 'HCBS',
    caregiver: 'Karen Brandt',
    notesNeedingWork: 2,
    authorizedHours: '32.0 hrs/week · HCBS Supported Living',
    carePlanGoals: ['Community safety awareness', 'Money handling and shopping'],
    lastThreeNotes: ['Nov 16: Outing to King Soopers.', 'Nov 14: Vocabulary flashcards.'],
    shifts: [
      {
        id: 'SH-401',
        clientId: 'C-1002',
        date: 'Today, Nov 17',
        time: '1:00 PM – 4:00 PM',
        hours: '3.0h',
        caregiver: 'Karen Brandt',
        evvStatus: 'Exception',
        noteStatus: 'Needs fix',
        weekGroup: 'This week',
        tasks: ['Community integration', 'Life skills', 'Medication reminder'],
        roughNote: 'Fed client lunch and walked around, gave morning pills and did exercises.',
        flags: [
          { phrase: 'lunch', ruleName: 'Nutritional documentation', category: 'missing', plainWhy: 'Name specific meal items.', suggestedReplacement: 'lunch of turkey sandwich and apples' },
          { phrase: 'walked around', ruleName: 'Goal verification', category: 'missing', plainWhy: 'Include duration and location.', suggestedReplacement: 'supervised community walk for 35 minutes along trail' },
          { phrase: 'morning pills', ruleName: 'Medication specifics', category: 'missing', plainWhy: 'Name medication and exact time.', suggestedReplacement: 'prompted Levothyroxine 50mcg at 1:15 PM with water' },
        ],
        quickDetails: [
          { id: 'eq1', question: 'What was prepared for lunch?', answer: 'Turkey sandwich with sliced apples and milk' },
          { id: 'eq2', question: 'How long was the walk and where?', answer: '35 minutes along greenway trail' },
          { id: 'eq3', question: 'Which medication was given?', answer: 'Levothyroxine 50mcg at 1:15 PM with water' },
        ],
        attachments: [],
        refinedOutputs: {
          narrativeStandard: 'Assisted Eli with lunch (turkey sandwich, sliced apples, milk) at 1:00 PM per care plan schedule. Supervised community mobility walk for 35 minutes along greenway trail per community integration goal. Prompted scheduled medication (Levothyroxine 50mcg) at 1:15 PM with water; client self-administered without difficulty. Departed at 4:00 PM.',
          narrativeShort: 'Assisted with lunch, 35 min community walk, and Levothyroxine reminder at 1:15 PM.',
          narrativeDetailed: 'Assisted with lunch (turkey sandwich, sliced apples, milk) at 1:00 PM per care plan schedule. Supervised community mobility walk for 35 minutes along greenway trail per community integration goal. Prompted scheduled medication (Levothyroxine 50mcg) at 1:15 PM with water; client self-administered without difficulty. Departed at 4:00 PM.',
          soapStandard: 'S: Client engaged.\nO: Lunch provided, 35 min trail walk, Levothyroxine at 1:15 PM.\nA: Good community tolerance.\nP: Continue daily outings.',
          bulletsStandard: '• Meal: Turkey sandwich and apples.\n• Outing: 35 min walk along greenway.\n• Meds: Levothyroxine 50mcg at 1:15 PM.',
          stateStandard: 'HCBS SUPPORTED LIVING: Community integration and medication reminder documented.',
          spanishStandard: 'Asistió con almuerzo, caminata comunitaria de 35 min y recordatorio de medicamento a la 1:15 PM.',
        },
      },
    ],
  },
  {
    id: 'C-1005',
    name: 'Aiden Park',
    maskedId: 'C-***5',
    age: 16,
    dob: 'May 04, 2010',
    program: 'HCBS',
    caregiver: 'Grace Park',
    notesNeedingWork: 0,
    authorizedHours: '15.0 hrs/week · HCBS Mentorship',
    carePlanGoals: ['Sensory regulation breathing protocols', 'Homework routine minimal resistance'],
    lastThreeNotes: ['Nov 16: Practiced deep breathing exercises.', 'Nov 15: Outing to library.'],
    shifts: [
      // Sample C: Note with no problems, shown as "Ready to approve"
      {
        id: 'SH-501',
        clientId: 'C-1005',
        date: 'Today, Nov 17',
        time: '2:00 PM – 5:00 PM',
        hours: '3.0h',
        caregiver: 'Grace Park',
        evvStatus: 'Verified',
        noteStatus: 'Approved',
        weekGroup: 'This week',
        tasks: ['Community mentorship', 'Academic support'],
        roughNote:
          'Arrived at 2:00 PM. Aiden was alert and resting in study room. Guided sensory deep breathing exercise for 15 minutes before homework. Aiden completed 45 minutes of algebra homework with minimal verbal prompts. Client remained cooperative and focused throughout the shift. Departed at 5:00 PM.',
        flags: [],
        quickDetails: [],
        attachments: [],
        refinedOutputs: {
          narrativeStandard:
            'Arrived at 2:00 PM. Aiden was alert and resting in study room. Guided sensory deep breathing exercise for 15 minutes before homework. Aiden completed 45 minutes of algebra homework with minimal verbal prompts. Client remained cooperative and focused throughout the shift. Departed at 5:00 PM.',
          narrativeShort: 'Guided 15 min breathing exercise; completed 45 min algebra homework cooperatively.',
          narrativeDetailed: 'Arrived at 2:00 PM. Aiden was alert and resting in study room. Guided sensory deep breathing exercise for 15 minutes before homework. Aiden completed 45 minutes of algebra homework with minimal verbal prompts. Client remained cooperative and focused throughout the shift. Departed at 5:00 PM.',
          soapStandard: 'S: Client engaged.\nO: 15 min breathing, 45 min math homework.\nA: Good emotional regulation.\nP: Continue daily routine.',
          bulletsStandard: '• Sensory exercise: 15 min breathing.\n• Homework: 45 min algebra completed.\n• Response: Calm and cooperative.',
          stateStandard: 'HCBS MENTORSHIP: Goal-directed academic support and sensory regulation verified.',
          spanishStandard: 'Ejercicios de respiración de 15 min y 45 min de tareas completadas.',
        },
      },
    ],
  },
];

export const AuditPage: React.FC = () => {
  const { showToast, deIdentify } = useApp();

  // Top Tabs: 'coach' (Note Coach) | 'new-note' | 'quality' | 'rules'
  const [activeTopTab, setActiveTopTab] = useState<'coach' | 'new-note' | 'quality' | 'rules'>('coach');

  // Client Selection & Search
  const [selectedClientId, setSelectedClientId] = useState('C-1001');
  const [clientSearch, setClientSearch] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState<'All' | 'Needs fix' | 'Urgent' | 'Waiting on caregiver' | 'Approved'>('All');
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);

  // Shift Table State
  const [selectedShiftId, setSelectedShiftId] = useState('SH-101');
  const [isShiftTableExpanded, setIsShiftTableExpanded] = useState(false); // Collapsed by default when a shift is selected
  const [shiftCaregiverFilter, setShiftCaregiverFilter] = useState('All');
  const [shiftStatusFilter, setShiftStatusFilter] = useState('All');
  const [batchSelectedShiftIds, setBatchSelectedShiftIds] = useState<string[]>([]);

  // Editor Input Area State
  const [editorTab, setEditorTab] = useState<'caregiver' | 'paste' | 'upload'>('caregiver');
  const [roughText, setRoughText] = useState(CLIENTS_DATA[0].shifts[0].roughNote);
  const [pastedText, setPastedText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDictating, setIsDictating] = useState(false);

  // Popover for Underlined Problem Phrase
  const [activeFlagPopover, setActiveFlagPopover] = useState<FlagItem | null>(null);

  // Output Refinement Options
  const [refineFormat, setRefineFormat] = useState<'narrative' | 'soap' | 'bullets' | 'state'>('narrative');
  const [refineLength, setRefineLength] = useState<'short' | 'standard' | 'detailed'>('standard');
  const [refineProgram, setRefineProgram] = useState('IHSS');
  const [refineLanguage, setRefineLanguage] = useState<'en' | 'es'>('en');

  // Result Section State
  const [hasRefined, setHasRefined] = useState(true); // Default true so demo shows result immediately on load
  const [isRefining, setIsRefining] = useState(false);
  const [resultViewMode, setResultViewMode] = useState<'side-by-side' | 'refined-only' | 'show-changes'>('side-by-side');
  const [editableRefinedText, setEditableRefinedText] = useState('');
  const [isEditingManually, setIsEditingManually] = useState(false);

  // Safety Escalation Modal & State
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [safetyOverrideDismissed, setSafetyOverrideDismissed] = useState(false);

  // Details & Audit Drawer (Right Edge)
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [detailsDrawerTab, setDetailsDrawerTab] = useState<'rules' | 'context' | 'history' | 'audit'>('rules');

  // Floating Assistant Chat State
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState([
    { sender: 'assistant', text: 'Hello! I am reviewing this shift note against Colorado Medicaid guidelines. Ask me a question or tap an action below.' },
  ]);
  const [assistantInput, setAssistantInput] = useState('');
  const [pendingConfirmAction, setPendingConfirmAction] = useState<{ label: string; desc: string; onConfirm: () => void } | null>(null);

  // Active Client & Active Shift
  const currentClient = useMemo(() => {
    return CLIENTS_DATA.find((c) => c.id === selectedClientId) || CLIENTS_DATA[0];
  }, [selectedClientId]);

  const currentShift = useMemo(() => {
    return currentClient.shifts.find((s) => s.id === selectedShiftId) || currentClient.shifts[0];
  }, [currentClient, selectedShiftId]);

  // When selected shift changes, update editor state
  const handleSelectShift = (shift: ShiftRecord) => {
    setSelectedShiftId(shift.id);
    setRoughText(shift.roughNote);
    setIsShiftTableExpanded(false);
    setActiveFlagPopover(null);
    setSafetyOverrideDismissed(false);
    setRefineProgram(currentClient.program);
    setHasRefined(shift.noteStatus === 'Refined' || shift.noteStatus === 'Approved' || shift.id === 'SH-101');
    setIsEditingManually(false);
  };

  // Switch client
  const handleSelectClient = (client: ClientCoachItem) => {
    setSelectedClientId(client.id);
    const firstShift = client.shifts[0];
    handleSelectShift(firstShift);
  };

  // Determine if safety risk is active
  const isSafetyRisk = useMemo(() => {
    if (safetyOverrideDismissed) return false;
    const text = (editorTab === 'caregiver' ? roughText : pastedText || roughText).toLowerCase();
    return (
      currentShift.isSafetyRisk ||
      text.includes('made her eat anyway') ||
      text.includes('forced') ||
      text.includes('bruised her elbow') ||
      text.includes('fell against')
    );
  }, [currentShift, roughText, pastedText, editorTab, safetyOverrideDismissed]);

  // Get refined text based on controls
  const activeRefinedText = useMemo(() => {
    if (isSafetyRisk) return '';

    if (refineLanguage === 'es') {
      return currentShift.refinedOutputs.spanishStandard;
    }

    if (refineFormat === 'soap') {
      return currentShift.refinedOutputs.soapStandard;
    }
    if (refineFormat === 'bullets') {
      return currentShift.refinedOutputs.bulletsStandard;
    }
    if (refineFormat === 'state') {
      return currentShift.refinedOutputs.stateStandard;
    }

    if (refineLength === 'short') {
      return currentShift.refinedOutputs.narrativeShort;
    }
    if (refineLength === 'detailed') {
      return currentShift.refinedOutputs.narrativeDetailed;
    }

    return currentShift.refinedOutputs.narrativeStandard;
  }, [currentShift, isSafetyRisk, refineLanguage, refineFormat, refineLength]);

  // Sync manual editable text
  React.useEffect(() => {
    setEditableRefinedText(activeRefinedText);
  }, [activeRefinedText]);

  // Handle Trigger Refine Action
  const handleRefineNote = () => {
    setIsRefining(true);
    setTimeout(() => {
      setIsRefining(false);
      setHasRefined(true);
      showToast('Note refined per Colorado Medicaid objective care standards.');
    }, 600);
  };

  // Replace problem phrase inline
  const handleReplacePhrase = (flag: FlagItem) => {
    setRoughText((prev) => prev.replace(flag.phrase, flag.suggestedReplacement));
    setActiveFlagPopover(null);
    showToast(`Replaced "${flag.phrase}" with compliant wording.`);
  };

  // Assistant messaging runner
  const handleSendAssistant = (promptText: string) => {
    const list = [...assistantMessages, { sender: 'user', text: promptText }];
    setAssistantMessages(list);
    setAssistantInput('');

    setTimeout(() => {
      const q = promptText.toLowerCase();
      if (q.includes('why') || q.includes('flag') || q.includes('grumpy')) {
        setAssistantMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: 'Under Colorado 10 CCR 2505-10 § 8.510, notes cannot include subjective words like "grumpy" or "difficult". State auditors reject notes that reflect caregiver perception rather than observable facts.',
          },
        ]);
      } else if (q.includes('incident') || q.includes('safety') || q.includes('force')) {
        setAssistantMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: 'Physical force or non-consensual care requires immediate clinical review and mandatory 24-hour HCPF incident escalation.',
          },
        ]);
      } else {
        setAssistantMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: `Scoped to ${currentClient.name} (${currentShift.date}, ${currentShift.time}). All tasks verified through EVV. Ready to dispatch draft to caregiver.`,
          },
        ]);
      }
    }, 500);
  };

  // Filtered clients list
  const filteredClients = useMemo(() => {
    return CLIENTS_DATA.filter((client) => {
      if (clientStatusFilter === 'Needs fix' && client.notesNeedingWork === 0) return false;
      if (clientStatusFilter === 'Urgent' && client.id !== 'C-1006' && client.id !== 'C-1001') return false;
      if (clientSearch.trim()) {
        const q = clientSearch.toLowerCase();
        return client.name.toLowerCase().includes(q) || client.program.toLowerCase().includes(q);
      }
      return true;
    });
  }, [clientSearch, clientStatusFilter]);

  // Grouped shifts for selected client
  const groupedShifts = useMemo(() => {
    let list = currentClient.shifts;
    if (shiftCaregiverFilter !== 'All') {
      list = list.filter((s) => s.caregiver.includes(shiftCaregiverFilter));
    }
    if (shiftStatusFilter !== 'All') {
      list = list.filter((s) => s.noteStatus === shiftStatusFilter);
    }

    const groups: Record<string, ShiftRecord[]> = {
      'This week': [],
      'Last week': [],
      'Two weeks ago': [],
    };

    list.forEach((s) => {
      if (groups[s.weekGroup]) {
        groups[s.weekGroup].push(s);
      }
    });

    return groups;
  }, [currentClient, shiftCaregiverFilter, shiftStatusFilter]);

  return (
    <div className="space-y-4 font-sans text-[var(--text)]">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & BREADCRUMB                                                */}
      {/* ========================================================================= */}
      <div className="space-y-1.5 border-b border-[var(--border)] pb-3">
        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" className="text-[12px] text-[var(--text-muted)] flex items-center gap-1.5">
          <span className="hover:text-[var(--text)] cursor-pointer" onClick={() => setActiveTopTab('coach')}>
            Care Notes
          </span>
          <span>›</span>
          <span className="font-semibold text-[var(--text)]">
            {activeTopTab === 'coach' ? 'Note Coach' : activeTopTab === 'new-note' ? 'New Note' : activeTopTab === 'quality' ? 'Quality Reports' : 'Rules'}
          </span>
          {activeTopTab === 'coach' && (
            <>
              <span>›</span>
              <span className="text-[var(--text)] font-semibold">{deIdentify(currentClient.name)}</span>
            </>
          )}
        </nav>

        {/* Title, Subtitle & 4 Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <h1 className="text-[28px] font-bold text-[var(--text)] leading-tight">Care Notes</h1>
            <p className="text-[14px] text-[var(--text-muted)] mt-0.5">
              {activeTopTab === 'coach' && 'Review shift notes, resolve missing details, and coach caregivers on objective Medicaid documentation.'}
              {activeTopTab === 'new-note' && 'Create and submit a clinical note directly.'}
              {activeTopTab === 'quality' && 'Overview of Medicaid documentation first-pass rate.'}
              {activeTopTab === 'rules' && 'Configured program rules and wording guidelines.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* 4 Tabs */}
            <div className="flex items-center bg-[var(--card)] border border-[var(--border)] rounded-[8px] p-0.5 h-[36px]">
              <button
                type="button"
                onClick={() => setActiveTopTab('coach')}
                className={`h-[30px] px-3.5 rounded-[6px] text-[13px] font-semibold transition ${
                  activeTopTab === 'coach' ? 'bg-[var(--green-700)] text-white shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                Note Coach
              </button>
              <button
                type="button"
                onClick={() => setActiveTopTab('new-note')}
                className={`h-[30px] px-3.5 rounded-[6px] text-[13px] font-semibold transition ${
                  activeTopTab === 'new-note' ? 'bg-[var(--green-700)] text-white shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                New Note
              </button>
              <button
                type="button"
                onClick={() => setActiveTopTab('quality')}
                className={`h-[30px] px-3.5 rounded-[6px] text-[13px] font-semibold transition ${
                  activeTopTab === 'quality' ? 'bg-[var(--green-700)] text-white shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                Quality Reports
              </button>
              <button
                type="button"
                onClick={() => setActiveTopTab('rules')}
                className={`h-[30px] px-3.5 rounded-[6px] text-[13px] font-semibold transition ${
                  activeTopTab === 'rules' ? 'bg-[var(--green-700)] text-white shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                Rules
              </button>
            </div>

            {/* Small Details & Audit Icon Button in Page Header */}
            {activeTopTab === 'coach' && (
              <button
                type="button"
                onClick={() => setIsDetailsDrawerOpen(true)}
                title="Details & Audit Log"
                className="w-9 h-9 min-h-[36px] min-w-[36px] rounded-[8px] border border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[#F0F2ED] transition flex items-center justify-center shadow-2xs"
              >
                <svg className="w-4 h-4 text-[var(--green-700)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. NOTE COACH: TWO-AREA WORKBENCH (LEFT 260px + MAIN WHITE CARD)          */}
      {/* ========================================================================= */}
      {activeTopTab === 'coach' && (
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          
          {/* --------------------------------------------------------------------- */}
          {/* LEFT AREA (260px, collapsible): CLIENT LIST                           */}
          {/* --------------------------------------------------------------------- */}
          <div className={`w-full lg:w-[260px] shrink-0 bg-[var(--card)] border border-[var(--border)] rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden transition-all ${
            isLeftPanelCollapsed ? 'lg:w-[48px]' : 'lg:w-[260px]'
          }`}>
            
            {/* Collapse Toggle Bar */}
            <div className="p-3 border-b border-[var(--border)] flex items-center justify-between">
              {!isLeftPanelCollapsed && (
                <span className="text-[12px] font-semibold text-[var(--text)]">Clients</span>
              )}
              <button
                type="button"
                onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                title={isLeftPanelCollapsed ? 'Expand client list' : 'Collapse client list'}
                className="text-[var(--text-muted)] hover:text-[var(--text)] text-[12px]"
              >
                {isLeftPanelCollapsed ? '→' : '←'}
              </button>
            </div>

            {!isLeftPanelCollapsed && (
              <div className="p-3 space-y-2 border-b border-[var(--border)]">
                {/* Single Status Filter Dropdown */}
                <select
                  value={clientStatusFilter}
                  onChange={(e) => setClientStatusFilter(e.target.value as typeof clientStatusFilter)}
                  className="w-full h-[32px] px-2 text-[12px] bg-[#F7F7F4] border border-[var(--border)] rounded-[6px] text-[var(--text)] focus:outline-none"
                >
                  <option value="All">All statuses</option>
                  <option value="Needs fix">Needs fix</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Waiting on caregiver">Waiting on caregiver</option>
                  <option value="Approved">Approved</option>
                </select>

                {/* Search Box */}
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Search client…"
                  className="w-full h-[32px] px-2.5 text-[12px] bg-[#F7F7F4] border border-[var(--border)] rounded-[6px] text-[var(--text)] focus:outline-none"
                />
              </div>
            )}

            {!isLeftPanelCollapsed && (
              <div className="divide-y divide-[var(--border)] max-h-[580px] overflow-y-auto">
                {filteredClients.map((client) => {
                  const isSelected = client.id === currentClient.id;
                  return (
                    <div
                      key={client.id}
                      onClick={() => handleSelectClient(client)}
                      title={`Masked ID: ${client.maskedId}`}
                      className={`p-3 cursor-pointer transition flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-[var(--green-100)] text-[var(--green-900)] font-medium border-l-4 border-l-[var(--green-700)]'
                          : 'hover:bg-[#F9FAF8] text-[var(--text)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold truncate">{deIdentify(client.name)}</span>
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-white/80 border border-stone-200 text-stone-700">
                          {client.program}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                        <span>{client.maskedId}</span>
                        {client.notesNeedingWork > 0 ? (
                          <span className="text-amber-800 font-medium">
                            {client.notesNeedingWork} {client.notesNeedingWork === 1 ? 'note' : 'notes'} needing work
                          </span>
                        ) : (
                          <span className="text-emerald-700">All up to date</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* MAIN AREA: ONE WHITE CARD WITH VERTICAL FLOW                          */}
          {/* --------------------------------------------------------------------- */}
          <div className="flex-1 min-w-0 bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-6">
            
            {/* 1. CLIENT HEADER: ONE LINE */}
            <div className="pb-4 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-[13px]">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[16px] font-bold text-[var(--text)]">{deIdentify(currentClient.name)}</span>
                <span className="text-[var(--text-muted)]">·</span>
                <span className="text-[var(--text-muted)]">{currentClient.maskedId}</span>
                <span className="text-[var(--text-muted)]">·</span>
                <span className="text-[var(--text-muted)]">Age {currentClient.age}</span>
                <span className="text-[var(--text-muted)]">·</span>
                <span className="font-semibold text-[var(--green-700)]">{currentClient.program}</span>
                <span className="text-[var(--text-muted)]">·</span>
                <span className="text-[var(--text-muted)]">Caregiver: <strong className="text-[var(--text)]">{deIdentify(currentClient.caregiver)}</strong></span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                <span>🔒 Access logged</span>
              </span>
            </div>

            {/* 2. SHIFTS SECTION (Compact table, newest first) */}
            <div className="space-y-2">
              {/* Collapsed summary bar vs Expanded table */}
              {!isShiftTableExpanded ? (
                <div className="p-3 bg-[#F7F7F4] border border-[var(--border)] rounded-[8px] flex flex-wrap items-center justify-between gap-2 text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--text)]">
                      {currentShift.date} · {currentShift.time} · {deIdentify(currentShift.caregiver)} · {currentShift.tasks.length} tasks
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      currentShift.noteStatus === 'Needs fix'
                        ? 'bg-amber-50 text-amber-900 border border-amber-200'
                        : currentShift.noteStatus === 'Approved'
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-stone-100 text-stone-700'
                    }`}>
                      {currentShift.noteStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsShiftTableExpanded(true)}
                      className="text-[12px] font-semibold text-[var(--green-700)] hover:underline flex items-center gap-1"
                    >
                      <span>Change shift ▾</span>
                    </button>
                    <span className="text-stone-300">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        // Advance to next shift needing a note
                        const nextNeedsFix = currentClient.shifts.find((s) => s.id !== currentShift.id && s.noteStatus === 'Needs fix');
                        if (nextNeedsFix) {
                          handleSelectShift(nextNeedsFix);
                          showToast(`Opened next shift: ${nextNeedsFix.date}`);
                        } else {
                          showToast('No more shifts needing a note for this client.');
                        }
                      }}
                      className="text-[12px] font-semibold text-[var(--green-700)] hover:underline"
                    >
                      Next shift needing a note →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-3 bg-[#F7F7F4] border border-[var(--border)] rounded-[8px]">
                  {/* Shift Filters & Batch mode toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--text)]">Shifts for {deIdentify(currentClient.name)}</span>
                      <select
                        value={shiftCaregiverFilter}
                        onChange={(e) => setShiftCaregiverFilter(e.target.value)}
                        className="h-[28px] px-2 text-[11px] bg-white border border-[var(--border)] rounded text-[var(--text)]"
                      >
                        <option value="All">All caregivers</option>
                        <option value="Rosa">Rosa Vega</option>
                        <option value="Elena">Elena M.</option>
                      </select>
                      <select
                        value={shiftStatusFilter}
                        onChange={(e) => setShiftStatusFilter(e.target.value)}
                        className="h-[28px] px-2 text-[11px] bg-white border border-[var(--border)] rounded text-[var(--text)]"
                      >
                        <option value="All">All statuses</option>
                        <option value="Needs fix">Needs fix</option>
                        <option value="Approved">Approved</option>
                        <option value="No note yet">No note yet</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      {batchSelectedShiftIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            showToast(`Batch queued: ${batchSelectedShiftIds.length} shifts queued for automated rule check.`);
                            setBatchSelectedShiftIds([]);
                          }}
                          className="min-h-[28px] px-3 rounded bg-[var(--green-700)] text-white font-semibold text-[11px] hover:bg-[var(--green-900)] transition"
                        >
                          Refine selected ({batchSelectedShiftIds.length})
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsShiftTableExpanded(false)}
                        className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] underline"
                      >
                        Collapse table ▴
                      </button>
                    </div>
                  </div>

                  {/* Shifts Table */}
                  <div className="bg-white border border-[var(--border)] rounded-[6px] overflow-hidden">
                    <table className="w-full text-left border-collapse text-[12px]">
                      <thead>
                        <tr className="border-b border-[var(--border)] bg-stone-50 text-[var(--text-muted)] font-semibold h-[36px]">
                          <th className="px-3 w-8">
                            <input
                              type="checkbox"
                              checked={batchSelectedShiftIds.length > 0}
                              onChange={() => {
                                if (batchSelectedShiftIds.length > 0) setBatchSelectedShiftIds([]);
                                else setBatchSelectedShiftIds(currentClient.shifts.map((s) => s.id));
                              }}
                              className="rounded text-[var(--green-700)]"
                            />
                          </th>
                          <th className="px-3">Date</th>
                          <th className="px-3">Time</th>
                          <th className="px-3">Caregiver</th>
                          <th className="px-3">Hours</th>
                          <th className="px-3">EVV</th>
                          <th className="px-3">Note Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {Object.entries(groupedShifts).map(([week, shifts]) => (
                          <React.Fragment key={week}>
                            {shifts.length > 0 && (
                              <tr className="bg-[#F7F7F4] text-[11px] font-bold text-stone-500">
                                <td colSpan={7} className="px-3 py-1">
                                  {week}
                                </td>
                              </tr>
                            )}
                            {shifts.map((shift) => {
                              const isSelected = shift.id === currentShift.id;
                              return (
                                <tr
                                  key={shift.id}
                                  onClick={() => handleSelectShift(shift)}
                                  className={`h-[40px] cursor-pointer transition ${
                                    isSelected ? 'bg-[var(--green-100)] font-medium text-[var(--green-900)]' : 'hover:bg-stone-50'
                                  }`}
                                >
                                  <td className="px-3" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      checked={batchSelectedShiftIds.includes(shift.id)}
                                      onChange={() => {
                                        setBatchSelectedShiftIds((prev) =>
                                          prev.includes(shift.id) ? prev.filter((id) => id !== shift.id) : [...prev, shift.id]
                                        );
                                      }}
                                      className="rounded text-[var(--green-700)]"
                                    />
                                  </td>
                                  <td className="px-3 font-semibold">{shift.date}</td>
                                  <td className="px-3 text-stone-600">{shift.time}</td>
                                  <td className="px-3">{deIdentify(shift.caregiver)}</td>
                                  <td className="px-3">{shift.hours}</td>
                                  <td className="px-3">
                                    <span className={shift.evvStatus === 'Verified' ? 'text-emerald-700' : 'text-amber-700'}>
                                      {shift.evvStatus}
                                    </span>
                                  </td>
                                  <td className="px-3">
                                    <span className={`text-[11px] ${
                                      shift.noteStatus === 'Needs fix'
                                        ? 'text-amber-800 font-semibold'
                                        : shift.noteStatus === 'Approved'
                                        ? 'text-emerald-700'
                                        : 'text-stone-500'
                                    }`}>
                                      {shift.noteStatus}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* 3. THE NOTE (THE EDITOR) */}
            <div className="space-y-3">
              {/* Segmented Control */}
              <div className="flex items-center justify-between">
                <div className="flex items-center bg-[#F7F7F4] border border-[var(--border)] rounded-[8px] p-0.5">
                  <button
                    type="button"
                    onClick={() => setEditorTab('caregiver')}
                    className={`px-3 py-1 rounded-[6px] text-[12px] font-semibold transition ${
                      editorTab === 'caregiver' ? 'bg-white text-[var(--text)] shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    Caregiver&apos;s note
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('paste')}
                    className={`px-3 py-1 rounded-[6px] text-[12px] font-semibold transition ${
                      editorTab === 'paste' ? 'bg-white text-[var(--text)] shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    Paste or type
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('upload')}
                    className={`px-3 py-1 rounded-[6px] text-[12px] font-semibold transition ${
                      editorTab === 'upload' ? 'bg-white text-[var(--text)] shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    Upload or dictate
                  </button>
                </div>

                {/* Microphone Dictation Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDictating(!isDictating);
                    if (!isDictating) {
                      showToast('Listening... Speak note details clearly.');
                      setRoughText((prev) => prev + ' Client took all morning medications on time.');
                    } else {
                      showToast('Dictation ended.');
                    }
                  }}
                  className={`min-h-[30px] px-2.5 rounded-[6px] text-[12px] font-medium flex items-center gap-1.5 transition ${
                    isDictating ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' : 'bg-white border border-[var(--border)] text-[var(--text)] hover:bg-[#F0F2ED]'
                  }`}
                >
                  <span>🎙️</span>
                  <span>{isDictating ? 'Listening…' : 'Dictate'}</span>
                </button>
              </div>

              {/* Editor Surface */}
              {editorTab === 'caregiver' && (
                <div className="space-y-2">
                  <textarea
                    rows={4}
                    value={roughText}
                    onChange={(e) => setRoughText(e.target.value)}
                    className="w-full p-3 text-[15px] leading-[1.6] font-normal text-[var(--text)] bg-white border border-[var(--border)] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-[var(--green-700)]"
                  />

                  {/* Underlined Interactive Phrases Bar (Slim Line) */}
                  {currentShift.flags.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between text-[13px] pt-1 text-[var(--text-muted)]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-[var(--text)]">Flagged phrases:</span>
                        {currentShift.flags.map((flag, idx) => (
                          <span
                            key={idx}
                            onClick={() => setActiveFlagPopover(flag)}
                            className={
                              flag.category === 'safety'
                                ? 'underline decoration-rose-500 decoration-2 underline-offset-4 cursor-pointer hover:bg-rose-50 text-rose-900 px-1 py-0.5 rounded'
                                : flag.category === 'wording'
                                ? 'underline decoration-amber-400 decoration-2 underline-offset-4 cursor-pointer hover:bg-amber-50 text-[var(--text)] px-1 py-0.5 rounded'
                                : 'underline decoration-sky-400 decoration-2 underline-offset-4 cursor-pointer hover:bg-sky-50 text-[var(--text)] px-1 py-0.5 rounded'
                            }
                          >
                            &ldquo;{flag.phrase}&rdquo;
                          </span>
                        ))}
                      </div>

                      <span className="text-[12px]">
                        {currentShift.flags.length} things to fix ·{' '}
                        <button
                          type="button"
                          onClick={() => {
                            if (currentShift.flags[0]) setActiveFlagPopover(currentShift.flags[0]);
                          }}
                          className="text-[var(--green-700)] font-semibold hover:underline"
                        >
                          Review
                        </button>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {editorTab === 'paste' && (
                <div className="space-y-2">
                  <textarea
                    rows={4}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste notes from messaging apps, voice memo transcripts, or paper visit slips here..."
                    className="w-full p-3 text-[15px] leading-[1.6] font-normal text-[var(--text)] bg-white border border-[var(--border)] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-[var(--green-700)]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (pastedText.trim()) {
                          setRoughText(pastedText);
                          setEditorTab('caregiver');
                          showToast('Pasted text loaded into review note.');
                        }
                      }}
                      className="text-[12px] font-semibold text-[var(--green-700)] hover:underline"
                    >
                      Use as caregiver note →
                    </button>
                  </div>
                </div>
              )}

              {editorTab === 'upload' && (
                <div className="space-y-2">
                  <div
                    onClick={() => {
                      setUploadedFileName('Rosa_Vega_Morning_Care.m4a');
                      setRoughText('Got there around 8:00 AM. Assisted with morning bath and breakfast. Client ate yogurt and took medication.');
                      showToast('File extracted and transcript loaded.');
                    }}
                    className="p-5 border-2 border-dashed border-[var(--border)] bg-[#F7F7F4] rounded-[8px] text-center cursor-pointer hover:border-[var(--green-700)] transition text-[13px]"
                  >
                    <div className="font-semibold text-[var(--text)]">
                      {uploadedFileName ? `Loaded: ${uploadedFileName}` : 'Drop audio recording, PDF, photo scan, or text file here'}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Accepts audio, image scan, PDF, or TXT
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments Row */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[12px]">
                <span className="text-[var(--text-muted)]">Attachments:</span>
                {currentShift.attachments.map((att) => (
                  <span
                    key={att.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F7F7F4] border border-[var(--border)] text-[var(--text)]"
                  >
                    <span>📎</span>
                    <span>{att.name}</span>
                    <span className="text-[10px] text-stone-400">· 🔒 Access logged</span>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => showToast('Attachment uploaded and verified.')}
                  className="text-[var(--green-700)] font-semibold hover:underline text-[12px]"
                >
                  + Add attachment
                </button>
              </div>

              {/* Collapsible "Quick Details" Strip (Pre-filled chips so flow works) */}
              {currentShift.quickDetails.length > 0 && (
                <div className="p-3 bg-[#F7F7F4] border border-[var(--border)] rounded-[8px] space-y-1.5 text-[12px]">
                  <div className="font-semibold text-[var(--text)]">Quick details (clarifications from caregiver):</div>
                  <div className="flex flex-wrap gap-2">
                    {currentShift.quickDetails.map((q) => (
                      <span
                        key={q.id}
                        className="px-2.5 py-1 rounded bg-white border border-[var(--border)] text-[var(--text)]"
                      >
                        <strong>{q.question}</strong> → <span className="text-[var(--green-700)] font-medium">{q.answer}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Output Options in ONE Compact Row Above Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[12px] border-t border-[var(--border)]">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[var(--text-muted)]">Format:</span>
                    <select
                      value={refineFormat}
                      onChange={(e) => setRefineFormat(e.target.value as typeof refineFormat)}
                      className="h-[28px] px-2 text-[12px] bg-white border border-[var(--border)] rounded text-[var(--text)]"
                    >
                      <option value="narrative">Narrative</option>
                      <option value="soap">SOAP</option>
                      <option value="bullets">Bullet points</option>
                      <option value="state">State template</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[var(--text-muted)]">Length:</span>
                    <select
                      value={refineLength}
                      onChange={(e) => setRefineLength(e.target.value as typeof refineLength)}
                      className="h-[28px] px-2 text-[12px] bg-white border border-[var(--border)] rounded text-[var(--text)]"
                    >
                      <option value="short">Short</option>
                      <option value="standard">Standard</option>
                      <option value="detailed">Detailed</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[var(--text-muted)]">Program:</span>
                    <span className="font-semibold text-[var(--text)]">{currentClient.program}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[var(--text-muted)]">Language:</span>
                    <button
                      type="button"
                      onClick={() => setRefineLanguage(refineLanguage === 'en' ? 'es' : 'en')}
                      className="px-2 py-0.5 rounded border border-[var(--border)] bg-white text-[11px] font-bold"
                    >
                      {refineLanguage.toUpperCase()}
                    </button>
                  </div>
                </div>

                {/* Primary Button: "Refine note" (One primary green button per view!) */}
                <button
                  type="button"
                  onClick={handleRefineNote}
                  disabled={isRefining}
                  className="min-h-[38px] px-5 rounded-[8px] bg-[var(--green-700)] hover:bg-[var(--green-900)] text-white text-[14px] font-semibold transition shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center gap-2 shrink-0 disabled:opacity-50"
                >
                  <svg className={`w-4 h-4 ${isRefining ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{isRefining ? 'Refining note…' : 'Refine note'}</span>
                </button>
              </div>
            </div>

            {/* 4. RESULT (APPEARS BELOW THE EDITOR AFTER REFINE) */}
            {isSafetyRisk ? (
              // Sample B: Safety Case Notice (No rewrite offered, calm red border)
              <div className="border border-rose-300 bg-rose-50/50 rounded-[12px] p-5 space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <h4 className="font-bold text-[15px] text-rose-950">Needs supervisor review: Reportable safety event</h4>
                    <p className="text-[13px] text-rose-900 mt-1 leading-relaxed">
                      This note describes potential physical force (&ldquo;made her eat anyway&rdquo;) or a client injury. <strong>State Medicaid regulations prohibit rewriting reportable incidents.</strong> The original wording must be reported directly to clinical supervisors.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setIsIncidentModalOpen(true)}
                    className="min-h-[34px] px-4 rounded-[6px] bg-rose-700 text-white font-semibold text-[13px] hover:bg-rose-800 transition shadow-2xs"
                  >
                    Create incident report
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Notification dispatched to Dana Whitfield, RN (Clinical Supervisor).')}
                    className="min-h-[34px] px-4 rounded-[6px] bg-white border border-rose-300 text-rose-900 font-semibold text-[13px] hover:bg-rose-100 transition"
                  >
                    Notify supervisor
                  </button>
                </div>
              </div>
            ) : hasRefined && (
              <div className="space-y-4 pt-4 border-t border-[var(--border)] animate-fadeIn">
                
                {/* One-Line Readiness Strip */}
                <div className="p-3 bg-[#F7F7F4] border border-[var(--border)] rounded-[8px] flex flex-wrap items-center justify-between gap-2 text-[12px]">
                  <div className="flex items-center gap-3 flex-wrap text-stone-700">
                    <span className="text-emerald-800 font-semibold">✓ Objective wording</span>
                    <span className="text-emerald-800 font-semibold">✓ Tasks match care plan</span>
                    <span className="text-emerald-800 font-semibold">✓ Times and duration</span>
                    <span className="text-emerald-800 font-semibold">✓ Client response</span>
                    <span className="text-emerald-800 font-semibold">✓ Follow-up</span>
                  </div>
                  <span className="font-bold text-[var(--green-700)]">Ready for Medicaid review</span>
                </div>

                {/* Before | After Card */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                    <span className="font-bold text-[14px] text-[var(--text)]">Review Comparison</span>
                    <div className="flex items-center gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setResultViewMode('side-by-side')}
                        className={`px-2.5 py-1 rounded transition ${
                          resultViewMode === 'side-by-side' ? 'bg-[var(--green-700)] text-white font-semibold' : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Side by side
                      </button>
                      <button
                        type="button"
                        onClick={() => setResultViewMode('refined-only')}
                        className={`px-2.5 py-1 rounded transition ${
                          resultViewMode === 'refined-only' ? 'bg-[var(--green-700)] text-white font-semibold' : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Refined only
                      </button>
                      <button
                        type="button"
                        onClick={() => setResultViewMode('show-changes')}
                        className={`px-2.5 py-1 rounded transition ${
                          resultViewMode === 'show-changes' ? 'bg-[var(--green-700)] text-white font-semibold' : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Show changes
                      </button>
                    </div>
                  </div>

                  {/* Side-by-Side View */}
                  {resultViewMode === 'side-by-side' && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Left: Caregiver's rough note */}
                      <div className="p-3 bg-[#F7F7F4] rounded-[8px] border border-[var(--border)] space-y-1">
                        <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Before (Caregiver rough note)</div>
                        <p className="text-[15px] leading-[1.6] text-stone-700 font-normal">{roughText}</p>
                      </div>

                      {/* Right: Refined note */}
                      <div className="p-3 bg-white rounded-[8px] border border-[var(--border)] space-y-1">
                        <div className="text-[11px] font-semibold text-[var(--green-700)] uppercase tracking-wider">
                          After (Refined · {refineFormat} · {refineLength})
                        </div>
                        {isEditingManually ? (
                          <textarea
                            rows={6}
                            value={editableRefinedText}
                            onChange={(e) => setEditableRefinedText(e.target.value)}
                            className="w-full p-2 text-[15px] leading-[1.6] bg-stone-50 border border-[var(--border)] rounded text-[var(--text)] focus:outline-none"
                          />
                        ) : (
                          <p className="text-[15px] leading-[1.6] text-[var(--text)] font-normal">{editableRefinedText}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Refined Only View */}
                  {resultViewMode === 'refined-only' && (
                    <div className="p-4 bg-white rounded-[8px] border border-[var(--border)]">
                      {isEditingManually ? (
                        <textarea
                          rows={6}
                          value={editableRefinedText}
                          onChange={(e) => setEditableRefinedText(e.target.value)}
                          className="w-full p-2 text-[15px] leading-[1.6] bg-stone-50 border border-[var(--border)] rounded text-[var(--text)] focus:outline-none"
                        />
                      ) : (
                        <p className="text-[15px] leading-[1.6] text-[var(--text)] font-normal">{editableRefinedText}</p>
                      )}
                    </div>
                  )}

                  {/* Show Changes (Diff) View */}
                  {resultViewMode === 'show-changes' && (
                    <div className="p-4 bg-white rounded-[8px] border border-[var(--border)] text-[15px] leading-[1.6]">
                      <del className="bg-rose-50 text-rose-800 line-through decoration-rose-300 px-1 rounded mr-1">
                        Got there around 8. Helped her with bath and stuff, made breakfast. She was grumpy and didn&apos;t eat much. Did the normal meds thing.
                      </del>
                      <ins className="bg-emerald-50 text-emerald-900 no-underline font-normal px-1 rounded">
                        Caregiver arrived at 8:00 AM. Assisted client with morning hygiene, including bathing (approx. 25 minutes), and prepared breakfast. Client expressed she was not hungry and ate approximately half of the yogurt offered. Medication reminder provided at 9:05 AM with water per physician orders.
                      </ins>
                    </div>
                  )}

                  {/* Result Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      {/* Primary Button */}
                      <button
                        type="button"
                        onClick={() => {
                          showToast(`Draft sent to ${currentShift.caregiver} for mobile app approval.`);
                        }}
                        className="min-h-[36px] px-4 rounded-[8px] bg-[var(--green-700)] text-white text-[13px] font-semibold hover:bg-[var(--green-900)] transition shadow-2xs"
                      >
                        Send to caregiver for approval
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[12px]">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(editableRefinedText);
                          showToast('Refined note copied to clipboard.');
                        }}
                        className="min-h-[32px] px-3 rounded-[6px] border border-[var(--border)] bg-white text-[var(--text)] hover:bg-[#F0F2ED]"
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingManually(!isEditingManually)}
                        className="min-h-[32px] px-3 rounded-[6px] border border-[var(--border)] bg-white text-[var(--text)] hover:bg-[#F0F2ED]"
                      >
                        {isEditingManually ? 'Save' : 'Edit'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRefineNote()}
                        className="min-h-[32px] px-3 rounded-[6px] border border-[var(--border)] bg-white text-[var(--text)] hover:bg-[#F0F2ED]"
                      >
                        Regenerate
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast('Original caregiver text kept as final note.')}
                        className="min-h-[32px] px-3 rounded-[6px] border border-[var(--border)] bg-white text-[var(--text)] hover:bg-[#F0F2ED]"
                      >
                        Keep original
                      </button>
                    </div>
                  </div>

                  {/* Small Disclaimer */}
                  <div className="text-[11px] text-[var(--text-muted)] text-center pt-1">
                    Suggested by AI. The caregiver reviews and remains responsible.
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. POP-OVER FOR UNDERLINED PHRASE                                         */}
      {/* ========================================================================= */}
      {activeFlagPopover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-[12px] border border-[var(--border)] max-w-sm w-full p-4 shadow-xl space-y-2 text-[13px]">
            <div className="flex items-start justify-between">
              <span className="font-bold text-[var(--text)]">&ldquo;{activeFlagPopover.phrase}&rdquo;</span>
              <button type="button" onClick={() => setActiveFlagPopover(null)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>
            <p className="text-[12px] text-stone-600 leading-relaxed">{activeFlagPopover.plainWhy}</p>
            {activeFlagPopover.suggestedReplacement && (
              <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-[12px] text-emerald-900">
                <strong>Suggested wording:</strong> &ldquo;{activeFlagPopover.suggestedReplacement}&rdquo;
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setActiveFlagPopover(null)}
                className="px-2.5 py-1 text-[12px] rounded border border-[var(--border)]"
              >
                Dismiss
              </button>
              {activeFlagPopover.suggestedReplacement && (
                <button
                  type="button"
                  onClick={() => handleReplacePhrase(activeFlagPopover)}
                  className="px-3 py-1 text-[12px] font-semibold rounded bg-[var(--green-700)] text-white hover:bg-[var(--green-900)]"
                >
                  Use suggestion
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DETAILS DRAWER (ICON IN HEADER): CLOSED BY DEFAULT                     */}
      {/* ========================================================================= */}
      {isDetailsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-2xs transition-opacity"
            onClick={() => setIsDetailsDrawerOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-[var(--border)] overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] bg-[#F7F7F4] flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-[var(--text)]">Details & Audit</h3>
                <div className="text-[11px] text-[var(--text-muted)]">
                  {deIdentify(currentClient.name)} · {currentShift.date}
                </div>
              </div>
              <button type="button" onClick={() => setIsDetailsDrawerOpen(false)} className="text-stone-500 hover:text-stone-800">✕</button>
            </div>

            <div className="flex border-b border-[var(--border)] px-4 bg-white text-[12px] font-semibold">
              <button
                type="button"
                onClick={() => setDetailsDrawerTab('rules')}
                className={`py-2.5 px-3 border-b-2 transition ${
                  detailsDrawerTab === 'rules' ? 'border-[var(--green-700)] text-[var(--green-700)]' : 'border-transparent text-stone-500'
                }`}
              >
                Rules applied
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

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[12px]">
              {detailsDrawerTab === 'rules' && (
                <div className="space-y-2">
                  <div className="p-2.5 bg-[#F7F7F4] rounded border border-[var(--border)] space-y-1">
                    <div className="font-bold text-[var(--text)]">Objective Language Rule</div>
                    <div className="text-stone-600">Colorado 10 CCR 2505-10 § 8.510</div>
                    <div className="text-[11px] text-stone-500">Requires factual, non-emotional statements of observable behavior.</div>
                  </div>
                  <div className="p-2.5 bg-[#F7F7F4] rounded border border-[var(--border)] space-y-1">
                    <div className="font-bold text-[var(--text)]">Medication Administration Timing</div>
                    <div className="text-stone-600">HCPF Care Plan Requirement § 8.500</div>
                    <div className="text-[11px] text-stone-500">Scheduled reminders must specify exact time and client response.</div>
                  </div>
                </div>
              )}

              {detailsDrawerTab === 'context' && (
                <div className="space-y-3">
                  <div>
                    <div className="font-bold text-[var(--text)]">Authorized Hours:</div>
                    <div className="text-stone-600">{currentClient.authorizedHours}</div>
                  </div>
                  <div>
                    <div className="font-bold text-[var(--text)]">Care Plan Goals:</div>
                    <ul className="list-disc pl-4 text-stone-600 space-y-1 mt-1">
                      {currentClient.carePlanGoals.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-bold text-[var(--text)]">Last 3 Visit Notes:</div>
                    <div className="space-y-1 mt-1">
                      {currentClient.lastThreeNotes.map((n, i) => (
                        <div key={i} className="p-2 bg-[#F7F7F4] rounded border border-[var(--border)] text-[11px]">
                          {n}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {detailsDrawerTab === 'history' && (
                <div className="space-y-2">
                  <div className="p-2.5 bg-white border border-[var(--border)] rounded space-y-0.5">
                    <div className="font-semibold text-[var(--text)]">v1.0 Original Submission</div>
                    <div className="text-[11px] text-stone-500">Submitted by {deIdentify(currentShift.caregiver)}</div>
                  </div>
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded space-y-0.5">
                    <div className="font-semibold text-emerald-950">v2.0 Refined Draft</div>
                    <div className="text-[11px] text-emerald-800">Generated per IHSS objective guidelines</div>
                  </div>
                </div>
              )}

              {detailsDrawerTab === 'audit' && (
                <div className="space-y-1.5 text-[11px]">
                  <div className="p-2 bg-[#F7F7F4] rounded border border-[var(--border)]">
                    <div className="flex justify-between text-stone-500">
                      <span>System</span>
                      <span>8:02 AM</span>
                    </div>
                    <div className="font-medium mt-0.5">EVV Clock-in verified with GPS coordinates</div>
                  </div>
                  <div className="p-2 bg-[#F7F7F4] rounded border border-[var(--border)]">
                    <div className="flex justify-between text-stone-500">
                      <span>{deIdentify(currentShift.caregiver)}</span>
                      <span>11:32 AM</span>
                    </div>
                    <div className="font-medium mt-0.5">Shift note submitted via mobile app</div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-[var(--border)] bg-[#F7F7F4] flex justify-end">
              <button
                type="button"
                onClick={() => setIsDetailsDrawerOpen(false)}
                className="px-4 py-1.5 rounded-[6px] bg-[var(--green-700)] text-white text-[12px] font-semibold hover:bg-[var(--green-900)]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. INCIDENT REPORT MODAL (SAFETY CASE)                                    */}
      {/* ========================================================================= */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-[12px] border border-[var(--border)] max-w-md w-full p-5 shadow-2xl space-y-3 text-[13px]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <h3 className="font-bold text-rose-950 flex items-center gap-1.5 text-[15px]">
                <span>🚨</span>
                <span>Medicaid Critical Incident Report</span>
              </h3>
              <button type="button" onClick={() => setIsIncidentModalOpen(false)}>✕</button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block font-semibold text-[var(--text)] mb-1 text-[12px]">Client</label>
                <input
                  type="text"
                  disabled
                  value={`${currentClient.name} (${currentClient.program} · ${currentClient.maskedId})`}
                  className="w-full p-2 bg-[#F7F7F4] border border-[var(--border)] rounded text-[12px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text)] mb-1 text-[12px]">Event Summary</label>
                <textarea
                  rows={3}
                  defaultValue={currentShift.roughNote}
                  className="w-full p-2 bg-[#F7F7F4] border border-[var(--border)] rounded text-[12px]"
                />
              </div>

              <div className="p-2 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900">
                Notice: Dispatches automated 24-hour notification to HCPF and locks shift note from further editing.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setIsIncidentModalOpen(false)}
                className="px-3.5 py-1.5 rounded border border-[var(--border)] text-[12px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Critical incident report submitted to HCPF & Clinical Supervisor.');
                  setIsIncidentModalOpen(false);
                }}
                className="px-4 py-1.5 rounded bg-rose-700 text-white font-semibold text-[12px] hover:bg-rose-800"
              >
                Submit Incident Case
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. FLOATING LILISARE ASSISTANT CHAT                                       */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isAssistantOpen ? (
          <button
            type="button"
            onClick={() => setIsAssistantOpen(true)}
            className="min-h-[42px] px-4 rounded-full bg-[var(--green-900)] text-white shadow-xl hover:bg-[var(--green-700)] transition flex items-center gap-2 font-semibold text-[13px] border border-white/20"
          >
            <span>💬</span>
            <span>LiliSare Assistant</span>
          </button>
        ) : (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] shadow-2xl w-[350px] h-[460px] flex flex-col overflow-hidden animate-slideUp">
            <div className="p-3 bg-[var(--green-900)] text-white flex items-center justify-between">
              <div>
                <div className="font-bold text-[13px]">LiliSare Assistant</div>
                <div className="text-[10px] text-emerald-300">
                  Scoped: {deIdentify(currentClient.name)} · {currentShift.date}
                </div>
              </div>
              <button type="button" onClick={() => setIsAssistantOpen(false)} className="text-white/70 hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-[12px]">
              {assistantMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-[8px] leading-relaxed ${
                    m.sender === 'user' ? 'bg-[var(--green-700)] text-white ml-6 text-right' : 'bg-[#F7F7F4] border border-[var(--border)] mr-4'
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <div className="p-2 border-t border-[var(--border)] bg-[#F7F7F4] flex gap-1 overflow-x-auto text-[11px]">
              {['Why is grumpy flagged?', 'Check Medicaid rule', 'Refine note'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSendAssistant(p)}
                  className="px-2 py-0.5 rounded bg-white border border-[var(--border)] text-stone-700 whitespace-nowrap hover:bg-stone-100"
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="p-2 bg-white border-t border-[var(--border)] flex items-center gap-1.5">
              <input
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && assistantInput.trim()) {
                    handleSendAssistant(assistantInput.trim());
                  }
                }}
                placeholder="Ask assistant about this shift…"
                className="flex-1 h-[32px] px-2.5 bg-[#F7F7F4] border border-[var(--border)] rounded text-[12px] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (assistantInput.trim()) handleSendAssistant(assistantInput.trim());
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
      {/* 7. PRESERVED TABS: NEW NOTE, QUALITY, RULES                               */}
      {/* ========================================================================= */}
      {activeTopTab === 'new-note' && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-6 max-w-2xl mx-auto space-y-4">
          <h3 className="text-[16px] font-bold text-[var(--text)]">Create Note for Caseload</h3>
          <div>
            <label className="block text-[12px] font-semibold mb-1">Client</label>
            <select className="w-full p-2 bg-[#F7F7F4] border border-[var(--border)] rounded text-[13px]">
              {CLIENTS_DATA.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.program} · {c.maskedId})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold mb-1">Shift Notes</label>
            <textarea rows={4} placeholder="Type visit care details..." className="w-full p-2.5 bg-[#F7F7F4] border border-[var(--border)] rounded text-[13px]" />
          </div>
          <button
            type="button"
            onClick={() => {
              showToast('Note submitted and sent to Note Coach.');
              setActiveTopTab('coach');
            }}
            className="min-h-[36px] px-5 rounded-[8px] bg-[var(--green-700)] text-white text-[13px] font-semibold"
          >
            Submit Note
          </button>
        </div>
      )}

      {activeTopTab === 'quality' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <span className="text-[12px] font-semibold uppercase text-[var(--text-muted)] block mb-1">First-Pass Rate</span>
            <div className="text-[28px] font-bold text-[var(--text)]">84%</div>
            <span className="text-[11px] text-emerald-700 font-medium">+6% vs last month</span>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <span className="text-[12px] font-semibold uppercase text-[var(--text-muted)] block mb-1">Avg Coaching Time</span>
            <div className="text-[28px] font-bold text-[var(--text)]">1.8m</div>
            <span className="text-[11px] text-[var(--text-muted)]">Per flagged visit note</span>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <span className="text-[12px] font-semibold uppercase text-[var(--text-muted)] block mb-1">Critical Flags</span>
            <div className="text-[28px] font-bold text-rose-700">2</div>
            <span className="text-[11px] text-rose-700 font-medium">Both escalated to RN</span>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <span className="text-[12px] font-semibold uppercase text-[var(--text-muted)] block mb-1">Medicaid Pass</span>
            <div className="text-[28px] font-bold text-[var(--green-700)]">99.4%</div>
            <span className="text-[11px] text-[var(--text-muted)]">State audit ready</span>
          </div>
        </div>
      )}

      {activeTopTab === 'rules' && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-5 space-y-3">
          <h3 className="font-bold text-[15px] text-[var(--text)]">Active Program Rulebook</h3>
          <div className="divide-y divide-[var(--border)] text-[12px]">
            <div className="py-2.5 space-y-1">
              <div className="font-bold">Objective facts only (no emotional or judgmental words)</div>
              <div className="text-[var(--text-muted)]">Colorado 10 CCR 2505-10 § 8.510</div>
            </div>
            <div className="py-2.5 space-y-1">
              <div className="font-bold">Safety escalation: physical force or non-consensual care</div>
              <div className="text-[var(--text-muted)]">State Medicaid Critical Incident Rule § 8.500</div>
            </div>
            <div className="py-2.5 space-y-1">
              <div className="font-bold">Exact times for medications and nursing tasks</div>
              <div className="text-[var(--text-muted)]">Colorado Board of Nursing Chapter 13</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
