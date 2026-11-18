import {
  INITIAL_TRAINING_PATHS,
  INITIAL_TRAINING_COURSES,
  INITIAL_TRAINING_ASSIGNMENTS,
  INITIAL_LIVE_SESSIONS,
  INITIAL_TRAINING_RULES,
  SKILLS_EVALUATION_ITEMS,
  TrainingTimelineStep,
  TrainingAssignmentRecord,
  TrainingPath,
  TrainingCourse,
  LiveSession,
  TrainingAutomationRule,
} from './mockData';

export const TRAINING_PATHS = INITIAL_TRAINING_PATHS;
export const TRAINING_COURSES = INITIAL_TRAINING_COURSES;
export const TRAINING_ASSIGNMENTS = INITIAL_TRAINING_ASSIGNMENTS;
export const TRAINING_SESSIONS = INITIAL_LIVE_SESSIONS;
export const TRAINING_RULES = INITIAL_TRAINING_RULES;
export const SKILLS_CHECKLIST = SKILLS_EVALUATION_ITEMS;

export type {
  TrainingTimelineStep,
  TrainingAssignmentRecord,
  TrainingPath,
  TrainingCourse,
  LiveSession,
  TrainingAutomationRule,
};
