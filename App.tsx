import React, { useState, useEffect } from 'react';
import { MOCK_DB, MockDb } from './constants';
// Fix: Added `AttendanceRecord` and `Toast` to the import list from './types'.
import { Student, Teacher, ScheduledClass, AttendanceStatus, AppSession, InstitutionId, AttendanceRecord, Toast } from './types';
import { AttendanceStatus as AttendanceStatusEnum } from './types';
import LoginScreen from './components/LoginScreen';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import ToastContainer from './components/ToastContainer';
import { getISTNow } from './components/Calendar';

const SESSION_STORAGE_KEY = 'presentify-session';
const DB_STORAGE_KEY = 'presentify-db';
const PHOTOS_STORAGE_KEY = 'presentify-photos';
const SENT_NOTIFICATIONS_KEY = 'presentify-sent-notifications';


const App: React.FC = () => {
  const [session, setSession] = useState<AppSession | null>(null);
  const [db, setDb] = useState<MockDb>(() => {
    try {
      const savedDbJSON = localStorage.getItem(DB_STORAGE_KEY);
      const savedPhotosJSON = localStorage.getItem(PHOTOS_STORAGE_KEY);
      
      if (savedDbJSON) {
        const savedDb = JSON.parse(savedDbJSON);
        const savedPhotos = savedPhotosJSON ? JSON.parse(savedPhotosJSON) : {};

        // Re-hydrate student avatars from separate storage
        if (savedDb.students && Array.isArray(savedDb.students)) {
            savedDb.students = savedDb.students.map((student: Student) => {
              if (student.avatarUrl && student.avatarUrl.startsWith('local_photo:')) {
                const studentId = student.avatarUrl.substring('local_photo:'.length);
                if (savedPhotos[studentId]) {
                  return { ...student, avatarUrl: savedPhotos[studentId] };
                }
              }
              return student;
            });
        }
        return savedDb;
      }
    } catch (error) {
      console.error("Failed to parse DB from localStorage", error);
      localStorage.removeItem(DB_STORAGE_KEY);
      localStorage.removeItem(PHOTOS_STORAGE_KEY);
    }
    return MOCK_DB;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize state from localStorage or system preference
    if (localStorage.theme === 'dark') {
        return true;
    }
    return (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isConfirmLockModalOpen, setIsConfirmLockModalOpen] = useState(false);
  const [classToLock, setClassToLock] = useState<ScheduledClass | null>(null);
  
  // Notification state
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sentNotifications, setSentNotifications] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(SENT_NOTIFICATIONS_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Effect to apply the dark mode class to <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Effect to save DB and Photo changes to localStorage
  useEffect(() => {
    try {
      const studentPhotos: { [id: string]: string } = {};
      
      // Deep copy to avoid mutating state before it's rendered
      const dbToSave = JSON.parse(JSON.stringify(db));

      // De-hydrate student avatars for storage efficiency
      if (dbToSave.students && Array.isArray(dbToSave.students)) {
          dbToSave.students = dbToSave.students.map((student: Student) => {
            // Persist only newly captured/uploaded photos, which are base64 data URLs
            if (student.avatarUrl && student.avatarUrl.startsWith('data:image')) {
              studentPhotos[student.id] = student.avatarUrl;
              // Replace with a key in the main DB
              return { ...student, avatarUrl: `local_photo:${student.id}` };
            }
            // Keep existing web URLs (e.g., picsum) as they are
            return student;
          });
      }

      // Save the main DB object with photo keys
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(dbToSave));
      
      // Save the photos object, merging with any existing photos
      if (Object.keys(studentPhotos).length > 0) {
        const existingPhotosJSON = localStorage.getItem(PHOTOS_STORAGE_KEY);
        const existingPhotos = existingPhotosJSON ? JSON.parse(existingPhotosJSON) : {};
        const allPhotos = { ...existingPhotos, ...studentPhotos };
        localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(allPhotos));
      }
    } catch (error) {
      console.error("Failed to save DB to localStorage", error);
    }
  }, [db]);


  // Effect to restore session from localStorage on app load
  useEffect(() => {
    try {
      const savedSessionJSON = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSessionJSON) {
        const savedSession: AppSession = JSON.parse(savedSessionJSON);
        setSession(savedSession);
      }
    } catch (error) {
      console.error("Failed to parse session from localStorage", error);
      // Clear corrupted data
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Auto-lock classes that have ended
  useEffect(() => {
    const interval = setInterval(() => {
      const now = getISTNow();
      const currentTimeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;
      const todayStr = now.toISOString().split('T')[0];
      
      setDb(prevDb => {
        let hasChanged = false;
        const newScheduledClasses = prevDb.scheduledClasses.map(cls => {
          if (!cls.isLocked && cls.date === todayStr) {
            const endTime = cls.time.split(' - ')[1];
            if (currentTimeStr > endTime) {
              hasChanged = true;
              return { ...cls, isLocked: true };
            }
          }
          return cls;
        });
        return hasChanged ? { ...prevDb, scheduledClasses: newScheduledClasses } : prevDb;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);
  
    // Save sent notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(SENT_NOTIFICATIONS_KEY, JSON.stringify(Array.from(sentNotifications)));
  }, [sentNotifications]);

  // Function to add a new toast notification
  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const newToast = { id: Date.now(), message, type };
    setToasts(prev => [...prev, newToast]);
  };
  
    // Effect to simulate sending QR code emails
  useEffect(() => {
    if (!session) return; // Only run when a user is logged in

    const interval = setInterval(() => {
      const now = getISTNow();
      
      db.scheduledClasses.forEach(cls => {
        if (cls.institutionId !== session.institutionId || cls.isFreePeriod || sentNotifications.has(cls.id)) {
          return; // Skip if not for this institution, it's a break, or notification already sent
        }

        const [startHour, startMinute] = cls.time.split(' - ')[0].split(':').map(Number);
        const classStartTime = new Date(Date.parse(cls.date));
        classStartTime.setUTCHours(startHour, startMinute, 0, 0);

        const diffMinutes = (classStartTime.getTime() - now.getTime()) / (1000 * 60);
        
        // Check if the class is within the 15-minute notification window
        if (diffMinutes > 0 && diffMinutes <= 15) {
          const studentsInClass = db.students.filter(s =>
            s.institutionId === cls.institutionId && (s.courseIds.includes(cls.courseId) || db.courses.find(c => c.id === cls.courseId)?.teacherIds.includes((session.user as Teacher).id))
          );


          if (studentsInClass.length > 0) {
            addToast(`It's time to send QR codes for "${cls.subject}". Click the 📧 icon on the class.`, 'info');
            
            // Mark notification as sent to prevent re-sending
            setSentNotifications(prev => new Set(prev).add(cls.id));
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [db, session, sentNotifications]);


  const handleLogin = (role: 'student' | 'teacher', institutionId: InstitutionId, credentials: { loginId: string }): boolean => {
    let user: Student | Teacher | undefined;
    
    if (role === 'teacher') {
      // In a real app, password would be checked. Here we just check email.
      user = db.teachers.find(t => t.institutionId === institutionId && t.email === credentials.loginId);
    } else {
      user = db.students.find(s => s.institutionId === institutionId && s.email === credentials.loginId);
    }
    
    if (user) {
      const newSession = {
        role,
        institutionId,
        user
      };
      setSession(newSession);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
      addToast(`Welcome back, ${user.name.split(' ')[0]}!`, 'success');
      return true;
    }
    
    return false; // Login failed
  };

  const handleSignUp = (role: 'student' | 'teacher', institutionId: InstitutionId, details: { name: string; email: string; idNumber: string }): { success: boolean; message?: string } => {
    if (role === 'teacher') {
      const existingTeacher = db.teachers.find(t => t.institutionId === institutionId && t.email === details.email);
      if (existingTeacher) {
        return { success: false, message: 'An account with this email already exists.' };
      }
      const newTeacher: Teacher = {
        id: `t-${institutionId}-${Date.now()}`,
        institutionId,
        name: details.name,
        email: details.email,
        employeeId: details.idNumber,
        avatarUrl: `https://picsum.photos/seed/${details.email}/100/100`,
      };
      setDb(prevDb => ({ ...prevDb, teachers: [...prevDb.teachers, newTeacher] }));
      const newSession = { role, institutionId, user: newTeacher };
      setSession(newSession);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
    } else {
      const existingStudent = db.students.find(s => s.institutionId === institutionId && s.email === details.email);
      if (existingStudent) {
        return { success: false, message: 'An account with this email already exists.' };
      }
      const newStudent: Student = {
        id: `s-${institutionId}-${Date.now()}`,
        institutionId,
        name: details.name,
        email: details.email,
        rollNo: details.idNumber,
        avatarUrl: `https://picsum.photos/seed/${details.email}/100/100`,
        courseIds: [],
      };
      setDb(prevDb => ({ ...prevDb, students: [...prevDb.students, newStudent] }));
      const newSession = { role, institutionId, user: newStudent };
      setSession(newSession);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
    }
    addToast('Account created successfully!', 'success');
    return { success: true };
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
  };

  const handleMarkAttendance = (classId: string, markedStudents: { id: string; status: AttendanceStatus }[]) => {
    if (!session) return;
    const classToUpdate = db.scheduledClasses.find(c => c.id === classId);
    
    if (classToUpdate && !classToUpdate.isLocked) {
      const now = new Date().toISOString();
      const newRecords: AttendanceRecord[] = [];
      const updatedRecords: { [recordId: string]: AttendanceStatus } = {};

      const existingRecordsForClass = db.attendanceRecords.filter(r => r.scheduledClassId === classId);

      markedStudents.forEach(ms => {
        const existingRecord = existingRecordsForClass.find(r => r.userId === ms.id);
        if (existingRecord) {
          if (existingRecord.status !== ms.status) {
            updatedRecords[existingRecord.id] = ms.status;
          }
        } else {
          newRecords.push({
            id: `att-${Date.now()}-${ms.id}`,
            institutionId: session.institutionId,
            userId: ms.id,
            userType: 'student',
            scheduledClassId: classId,
            status: ms.status,
            timestamp: now
          });
        }
      });
      
      setDb(prevDb => ({
        ...prevDb,
        attendanceRecords: [
          ...prevDb.attendanceRecords.map(r => updatedRecords[r.id] ? { ...r, status: updatedRecords[r.id] } : r),
          ...newRecords
        ]
      }));

    } else {
        addToast("This class is locked and attendance cannot be changed.", 'error');
    }
  };
  
  const handleLockAttendance = (classId: string, lock: boolean) => {
    if (!session) return;

    if (lock) {
      // Trigger confirmation modal for locking
      const classObj = db.scheduledClasses.find(c => c.id === classId);
      if (classObj) {
        setClassToLock(classObj);
        setIsConfirmLockModalOpen(true);
      }
    } else {
      // Unlock immediately without confirmation
      setDb(prevDb => {
        const newScheduledClasses = prevDb.scheduledClasses.map(cls =>
          cls.id === classId ? { ...cls, isLocked: false } : cls
        );
        return { ...prevDb, scheduledClasses: newScheduledClasses };
      });
      addToast('Class unlocked.', 'info');
    }
  };

  const handleConfirmLockAttendance = () => {
    if (!session || !classToLock) return;
    const { institutionId } = session;

    setDb(prevDb => {
      // 1. Lock the class
      const newScheduledClasses = prevDb.scheduledClasses.map(cls =>
        cls.id === classToLock.id ? { ...cls, isLocked: true } : cls
      );

      let newAttendanceRecords = [...prevDb.attendanceRecords];
      let markedAbsentCount = 0;

      // 2. Mark any unmarked students as 'Absent'
      if (!classToLock.isFreePeriod) {
        const studentsInCourse = prevDb.students.filter(s =>
          s.institutionId === institutionId && s.courseIds.includes(classToLock.courseId)
        );

        const recordsForClass = new Set(newAttendanceRecords
          .filter(r => r.scheduledClassId === classToLock.id)
          .map(r => r.userId));

        studentsInCourse.forEach(student => {
          if (!recordsForClass.has(student.id)) {
            newAttendanceRecords.push({
              id: `att-${Date.now()}-${student.id}`,
              institutionId: institutionId,
              userId: student.id,
              userType: 'student',
              scheduledClassId: classToLock.id,
              status: AttendanceStatusEnum.Absent,
              timestamp: new Date().toISOString(),
            });
            markedAbsentCount++;
          }
        });
      }
      
      addToast(`Attendance locked. ${markedAbsentCount} unmarked students set to Absent.`, 'success');
      return { ...prevDb, scheduledClasses: newScheduledClasses, attendanceRecords: newAttendanceRecords };
    });

    // 3. Close the modal
    setIsConfirmLockModalOpen(false);
    setClassToLock(null);
  };
  
  const handleCloseLockModal = () => {
    setIsConfirmLockModalOpen(false);
    setClassToLock(null);
  };


  const handleAddClass = (newClass: Omit<ScheduledClass, 'id' | 'isFreePeriod' | 'isLocked' | 'institutionId'>) => {
    if (!session) return;
    const classToAdd: ScheduledClass = {
      ...newClass,
      id: `class-${Date.now()}`,
      institutionId: session.institutionId,
      isFreePeriod: false,
      isLocked: false,
    };

    setDb(prev => ({
      ...prev,
      scheduledClasses: [...prev.scheduledClasses, classToAdd].sort((a,b) => (a.date+'T'+a.time).localeCompare(b.date+'T'+b.time))
    }));
    addToast('Class successfully added.', 'success');
  };
  
  const handleRemoveClass = (classId: string) => {
    setDb(prevDb => ({
      ...prevDb,
      scheduledClasses: prevDb.scheduledClasses.filter(cls => cls.id !== classId),
      attendanceRecords: prevDb.attendanceRecords.filter(rec => rec.scheduledClassId !== classId) // Also remove related attendance
    }));
    addToast('Class removed from schedule.', 'info');
  };

  const handleAddStudent = (name: string, avatarUrl: string, email: string, rollNo: string): { success: boolean; message?: string } => {
    if (!session) return { success: false, message: 'No active session.' };
    
    const { institutionId } = session;

    const existingStudent = db.students.find(s => 
        s.institutionId === institutionId && (s.email.toLowerCase() === email.toLowerCase() || s.rollNo.toLowerCase() === rollNo.toLowerCase())
    );

    if (existingStudent) {
        if (existingStudent.email.toLowerCase() === email.toLowerCase()) {
          return { success: false, message: 'A student with this email already exists.' };
        }
        if (existingStudent.rollNo.toLowerCase() === rollNo.toLowerCase()) {
          return { success: false, message: 'A student with this roll number already exists.' };
        }
    }

    const newStudent: Student = {
        id: `s-${institutionId}-${Date.now()}`,
        institutionId,
        name,
        avatarUrl,
        email,
        rollNo,
        courseIds: [], // Assign courses separately
    };

    setDb(prevDb => ({ ...prevDb, students: [...prevDb.students, newStudent]}));
    addToast(`${name} has been registered.`, 'success');
    return { success: true };
  };

  const handleUpdateStudent = (studentId: string, details: { name: string; email: string; rollNo: string }): { success: boolean; message?: string } => {
    if (!session) return { success: false, message: 'No active session.' };
    
    const { institutionId } = session;

    // Check for uniqueness of email and rollNo, excluding the student being edited
    const existingStudent = db.students.find(s => 
        s.institutionId === institutionId &&
        s.id !== studentId && // exclude the current student from the check
        (s.email.toLowerCase() === details.email.toLowerCase() || s.rollNo.toLowerCase() === details.rollNo.toLowerCase())
    );

    if (existingStudent) {
        if (existingStudent.email.toLowerCase() === details.email.toLowerCase()) {
          return { success: false, message: 'Another student with this email already exists.' };
        }
        if (existingStudent.rollNo.toLowerCase() === details.rollNo.toLowerCase()) {
          return { success: false, message: 'Another student with this roll number already exists.' };
        }
    }

    setDb(prevDb => ({
        ...prevDb,
        students: prevDb.students.map(student =>
            student.id === studentId
                ? { ...student, name: details.name, email: details.email, rollNo: details.rollNo }
                : student
        )
    }));
    
    addToast("Student details have been updated.", 'success');
    return { success: true };
  };
  
  const handleUpdateStudentPhoto = (studentId: string, newAvatarUrl: string) => {
    setDb(prevDb => ({
        ...prevDb,
        students: prevDb.students.map(student =>
            student.id === studentId ? { ...student, avatarUrl: newAvatarUrl } : student
        )
    }));
    addToast("Student's photo has been updated.", 'success');
  };
  
  const renderContent = () => {
    if (!session) {
      return <LoginScreen onLogin={handleLogin} onSignUp={handleSignUp} />;
    }
    
    // Filter data for the current tenant
    const tenantData = {
        students: db.students.filter(s => s.institutionId === session.institutionId),
        teachers: db.teachers.filter(t => t.institutionId === session.institutionId),
        courses: db.courses.filter(c => c.institutionId === session.institutionId),
        timetable: db.scheduledClasses.filter(sc => sc.institutionId === session.institutionId),
        attendanceRecords: db.attendanceRecords.filter(ar => ar.institutionId === session.institutionId),
    };
    
    if (session.role === 'teacher') {
      return (
        <TeacherDashboard
          students={tenantData.students}
          timetable={tenantData.timetable}
          attendanceRecords={tenantData.attendanceRecords}
          onLogout={handleLogout}
          onMarkAttendance={handleMarkAttendance}
          onAddClass={handleAddClass}
          onRemoveClass={handleRemoveClass}
          onLockAttendance={handleLockAttendance}
          onAddStudent={handleAddStudent}
          onUpdateStudent={handleUpdateStudent}
          onUpdateStudentPhoto={handleUpdateStudentPhoto}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          isConfirmLockModalOpen={isConfirmLockModalOpen}
          classToLock={classToLock}
          onCloseConfirmLockModal={handleCloseLockModal}
          onConfirmLockAttendance={handleConfirmLockAttendance}
        />
      );
    }
    
    if (session.role === 'student' && session.user) {
      return (
        <StudentDashboard
          student={session.user as Student}
          timetable={tenantData.timetable}
          attendanceRecords={tenantData.attendanceRecords}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      );
    }

    return null; // Should not be reached
  }

  // The main container provides a flex layout to push the footer down.
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {renderContent()}
      </main>
      <footer className="text-center text-white/70 py-4 text-sm bg-black/10 dark:bg-black/20 transition-colors duration-300">
        <p>&copy; {new Date().getFullYear()} Presentify. All Rights Reserved.</p>
      </footer>
      <ToastContainer
        toasts={toasts}
        onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))}
      />
    </div>
  );
};

export default App;
