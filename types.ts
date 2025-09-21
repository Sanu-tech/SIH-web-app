export type InstitutionId = 'mit' | 'stanford' | 'default' | string;

export enum AttendanceStatus {
  Present = 'Present',
  Absent = 'Absent',
  Late = 'Late',
  Unmarked = 'Unmarked',
}

export interface Institution {
  id: InstitutionId;
  name: string;
}

export interface Course {
  id: string;
  institutionId: InstitutionId;
  name: string;
  teacherIds: string[];
}

// This represents a specific class session in the timetable
export interface ScheduledClass {
  id: string;
  institutionId: InstitutionId;
  courseId: string;
  time: string;
  date: string; // YYYY-MM-DD
  isFreePeriod: boolean;
  isLocked: boolean;
  subject: string; // Denormalized for easy display
}

export interface Student {
  id: string;
  institutionId: InstitutionId;
  name: string;
  avatarUrl: string;
  rollNo: string;
  email: string;
  phone?: string;
  courseIds: string[];
}

export interface Teacher {
  id: string;
  institutionId: InstitutionId;
  name: string;
  avatarUrl: string;
  employeeId: string;
  email: string;
  phone?: string;
}

export interface AttendanceRecord {
  id: string;
  institutionId: InstitutionId;
  userId: string; // Can be Student ID or Teacher ID
  userType: 'student' | 'teacher';
  scheduledClassId: string;
  status: AttendanceStatus;
  timestamp: string; // ISO string
}

export interface Task {
  title: string;
  description: string;
  duration: number; // in minutes
}

export interface StudentProfile {
  interests: string;
  strengths: string;
  careerGoals: string;
}

export interface DailyRoutine {
  time: string;
  activity: string;
  details?: string;
  type: 'class' | 'task' | 'break';
  classId?: string;
}

export type UserRole = 'student' | 'teacher' | null;

// Represents the currently logged-in user session
export interface AppSession {
  role: 'student' | 'teacher';
  institutionId: InstitutionId;
  user: Student | Teacher;
}

export interface Toast {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}