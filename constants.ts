import { Institution, Course, Teacher, Student, ScheduledClass, AttendanceRecord, InstitutionId } from './types';
import { getISTNow } from './components/Calendar';

const today = getISTNow().toISOString().split('T')[0]; // YYYY-MM-DD in IST

// --- MOCK DATABASE ---
// This structure simulates a normalized database with different tables.
// In a real application, this would be fetched from a backend API.

const institutions: Institution[] = [
    { id: 'mit', name: 'Massachusetts Institute of Technology' },
    { id: 'stanford', name: 'Stanford University' },
    { id: 'default', name: 'Presentify Demo' },
];

const teachers: Teacher[] = [
    // MIT Teachers
    { id: 't-mit-1', institutionId: 'mit', name: 'Prof. Eleanor Vance', employeeId: 'MIT-EV1', email: 'evance@mit.edu', avatarUrl: 'https://picsum.photos/seed/evance/100/100' },
    { id: 't-mit-2', institutionId: 'mit', name: 'Dr. Robert Chen', employeeId: 'MIT-RC2', email: 'rchen@mit.edu', avatarUrl: 'https://picsum.photos/seed/rchen/100/100' },

    // Stanford Teachers
    { id: 't-stan-1', institutionId: 'stanford', name: 'Dr. Anya Sharma', employeeId: 'STAN-AS1', email: 'asharma@stanford.edu', avatarUrl: 'https://picsum.photos/seed/asharma/100/100' },
    { id: 't-stan-2', institutionId: 'stanford', name: 'Prof. Ben Carter', employeeId: 'STAN-BC2', email: 'bcarter@stanford.edu', avatarUrl: 'https://picsum.photos/seed/bcarter/100/100' },

    // Default Teachers
    { id: 't-def-1', institutionId: 'default', name: 'Kaushtav Mondal', employeeId: 'DEF-KM1', email: 'teacher@example.com', avatarUrl: 'https://picsum.photos/seed/teacher/100/100' },
];

const courses: Course[] = [
    // MIT Courses
    { id: 'c-mit-1', institutionId: 'mit', name: 'Intro to Quantum Computing', teacherIds: ['t-mit-1'] },
    { id: 'c-mit-2', institutionId: 'mit', name: 'AI Ethics and Governance', teacherIds: ['t-mit-2'] },
    
    // Stanford Courses
    { id: 'c-stan-1', institutionId: 'stanford', name: 'Human-Computer Interaction', teacherIds: ['t-stan-1'] },
    { id: 'c-stan-2', institutionId: 'stanford', name: 'Startup Engineering', teacherIds: ['t-stan-2'] },

    // Default Courses
    { id: 'c-def-1', institutionId: 'default', name: 'Quantum Physics', teacherIds: ['t-def-1'] },
    { id: 'c-def-2', institutionId: 'default', name: 'Advanced Algorithms', teacherIds: ['t-def-1'] },
    { id: 'c-def-3', institutionId: 'default', name: 'Machine Learning', teacherIds: ['t-def-1'] },
    { id: 'c-def-4', institutionId: 'default', name: 'Project Work', teacherIds: ['t-def-1'] },
];

const students: Student[] = [
    // MIT Students
    { id: 's-mit-1', institutionId: 'mit', name: 'Alice Johnson', rollNo: 'MIT001', email: 'alice@mit.edu', avatarUrl: 'https://picsum.photos/seed/alice/100/100', courseIds: ['c-mit-1', 'c-mit-2'] },
    { id: 's-mit-2', institutionId: 'mit', name: 'Bob Williams', rollNo: 'MIT002', email: 'bob@mit.edu', avatarUrl: 'https://picsum.photos/seed/bob/100/100', courseIds: ['c-mit-1'] },
    
    // Stanford Students
    { id: 's-stan-1', institutionId: 'stanford', name: 'Charlie Brown', rollNo: 'STAN001', email: 'charlie@stanford.edu', avatarUrl: 'https://picsum.photos/seed/charlie/100/100', courseIds: ['c-stan-1'] },
    { id: 's-stan-2', institutionId: 'stanford', name: 'Diana Prince', rollNo: 'STAN002', email: 'diana@stanford.edu', avatarUrl: 'https://picsum.photos/seed/diana/100/100', courseIds: ['c-stan-1', 'c-stan-2'] },

    // Default Students
    { id: 's-def-1', institutionId: 'default', name: 'Kaushtav Mondal', rollNo: 'DEF001', email: 'kmondal@example.com', avatarUrl: 'https://picsum.photos/seed/kmondal/100/100', courseIds: ['c-def-1', 'c-def-2', 'c-def-3', 'c-def-4'] },
    { id: 's-def-2', institutionId: 'default', name: 'Arnish Chattapadhay', rollNo: 'DEF002', email: 'arnishc@example.com', avatarUrl: 'https://picsum.photos/seed/arnishc/100/100', courseIds: ['c-def-1', 'c-def-2', 'c-def-3', 'c-def-4'] },
    { id: 's-def-3', institutionId: 'default', name: 'Debojyoti Mondal', rollNo: 'DEF003', email: 'dmondal@example.com', avatarUrl: 'https://picsum.photos/seed/dmondal/100/100', courseIds: ['c-def-1', 'c-def-2', 'c-def-3', 'c-def-4'] },
    { id: 's-def-4', institutionId: 'default', name: 'Chandan Ghosh', rollNo: 'DEF004', email: 'chandang@example.com', avatarUrl: 'https://picsum.photos/seed/chandang/100/100', courseIds: ['c-def-1', 'c-def-2', 'c-def-3', 'c-def-4'] },
    { id: 's-def-5', institutionId: 'default', name: 'Sayan Betal', rollNo: 'DEF005', email: 'sayanb@example.com', avatarUrl: 'https://picsum.photos/seed/sayanb/100/100', courseIds: ['c-def-1', 'c-def-2', 'c-def-3', 'c-def-4'] },
    { id: 's-def-6', institutionId: 'default', name: 'Akraprava Chanda', rollNo: 'DEF006', email: 'achanda@example.com', avatarUrl: 'https://picsum.photos/seed/achanda/100/100', courseIds: ['c-def-1', 'c-def-2', 'c-def-3', 'c-def-4'] },
];

const scheduledClasses: ScheduledClass[] = [
    // Default Schedule for today
    { id: 'sc-def-1', institutionId: 'default', courseId: 'c-def-1', subject: 'Quantum Physics', time: '09:00 - 10:30', isFreePeriod: false, isLocked: false, date: today },
    { id: 'sc-def-2', institutionId: 'default', courseId: 'c-def-2', subject: 'Advanced Algorithms', time: '10:30 - 12:00', isFreePeriod: false, isLocked: false, date: today },
    { id: 'sc-def-3', institutionId: 'default', courseId: 'break-1', subject: 'Lunch Break', time: '12:00 - 13:00', isFreePeriod: true, isLocked: false, date: today },
    { id: 'sc-def-4', institutionId: 'default', courseId: 'c-def-3', subject: 'Machine Learning', time: '13:00 - 14:30', isFreePeriod: false, isLocked: false, date: today },
    { id: 'sc-def-5', institutionId: 'default', courseId: 'break-2', subject: 'Free Period', time: '14:30 - 16:00', isFreePeriod: true, isLocked: false, date: today },
    { id: 'sc-def-6', institutionId: 'default', courseId: 'c-def-4', subject: 'Project Work', time: '16:00 - 17:30', isFreePeriod: false, isLocked: false, date: today },

    // MIT Schedule for today
    { id: 'sc-mit-1', institutionId: 'mit', courseId: 'c-mit-1', subject: 'Intro to Quantum Computing', time: '10:00 - 11:30', isFreePeriod: false, isLocked: false, date: today },
    { id: 'sc-mit-2', institutionId: 'mit', courseId: 'c-mit-2', subject: 'AI Ethics and Governance', time: '13:00 - 14:30', isFreePeriod: false, isLocked: false, date: today },
    
    // Stanford Schedule for today
    { id: 'sc-stan-1', institutionId: 'stanford', courseId: 'c-stan-1', subject: 'Human-Computer Interaction', time: '09:30 - 11:00', isFreePeriod: false, isLocked: false, date: today },
    { id: 'sc-stan-2', institutionId: 'stanford', courseId: 'c-stan-2', subject: 'Startup Engineering', time: '14:00 - 16:00', isFreePeriod: false, isLocked: false, date: today },
];

const attendanceRecords: AttendanceRecord[] = [
    // Pre-filled attendance can go here if needed
];


// Encapsulate all mock data into a single export
export const MOCK_DB = {
    institutions,
    teachers,
    courses,
    students,
    scheduledClasses,
    attendanceRecords
};

// Type for the entire mock database
export type MockDb = typeof MOCK_DB;