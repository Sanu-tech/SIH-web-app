import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { generateTaskSuggestions, generateDailyRoutine } from '../services/geminiService';
import type { Student, StudentProfile, Task, DailyRoutine, ScheduledClass, AttendanceStatus, AttendanceRecord } from '../types';
import { AttendanceStatus as AttendanceStatusEnum } from '../types';
import { LogoutIcon, CalendarIcon, CheckCircleIcon, SparklesIcon, XCircleIcon, ClockIcon, SunIcon, MoonIcon, RefreshIcon, QrCodeIcon } from './icons/Icons';
import Calendar, { getISTNow } from './Calendar';
import QrCodeModal from './QrCodeModal';

interface StudentDashboardProps {
  student: Student;
  timetable: ScheduledClass[];
  attendanceRecords: AttendanceRecord[];
  onLogout: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, timetable, attendanceRecords, onLogout, isDarkMode, toggleDarkMode }) => {
  const [profile, setProfile] = useState<StudentProfile>({
    interests: 'Artificial Intelligence, Web Development, Data Science',
    strengths: 'Problem Solving, Mathematics, Programming',
    careerGoals: 'Become a Machine Learning Engineer at a top tech company.',
  });
  const [suggestedTasks, setSuggestedTasks] = useState<Task[]>([]);
  const [dailyRoutine, setDailyRoutine] = useState<DailyRoutine[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingRoutine, setIsLoadingRoutine] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getISTNow());
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [classForQr, setClassForQr] = useState<ScheduledClass | null>(null);

  const todaysTimetable = useMemo(() => {
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    return timetable.filter(cls => cls.date === selectedDateString).sort((a,b) => a.time.localeCompare(b.time));
  }, [timetable, selectedDate]);

  // State for profile editing form
  const [profileInterests, setProfileInterests] = useState(profile.interests);
  const [profileStrengths, setProfileStrengths] = useState(profile.strengths);
  const [profileGoals, setProfileGoals] = useState(profile.careerGoals);
  
  const studentAttendanceRecords = useMemo(() => {
    return attendanceRecords.filter(r => r.userId === student.id);
  }, [attendanceRecords, student.id]);
  
  const attendanceStats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;

    studentAttendanceRecords.forEach(record => {
      const classInfo = timetable.find(c => c.id === record.scheduledClassId);
      if (classInfo && !classInfo.isFreePeriod) {
        switch (record.status) {
          case AttendanceStatusEnum.Present:
            present++;
            break;
          case AttendanceStatusEnum.Absent:
            absent++;
            break;
          case AttendanceStatusEnum.Late:
            late++;
            break;
          default:
            break;
        }
      }
    });
    
    const totalMarked = present + absent + late;
    const percentage = totalMarked > 0 ? (present / totalMarked) * 100 : 100;

    return { present, absent, late, totalMarked, percentage };
  }, [studentAttendanceRecords, timetable]);

  const fetchSuggestions = useCallback(async () => {
    const freePeriod = todaysTimetable.find(c => c.isFreePeriod && c.subject !== 'Lunch Break');
    if (freePeriod) {
      setIsLoadingTasks(true);
      const tasks = await generateTaskSuggestions(profile, freePeriod);
      setSuggestedTasks(tasks);
      setIsLoadingTasks(false);
    } else {
      setSuggestedTasks([]);
    }
  }, [todaysTimetable, profile]);

  const fetchRoutine = useCallback(async () => {
    if (todaysTimetable.length > 0) {
      setIsLoadingRoutine(true);
      const routine = await generateDailyRoutine(profile, todaysTimetable);
      setDailyRoutine(routine);
      setIsLoadingRoutine(false);
    } else {
      setDailyRoutine([]);
    }
  }, [todaysTimetable, profile]);

  useEffect(() => {
    fetchSuggestions();
    fetchRoutine();
  }, [profile, todaysTimetable, fetchSuggestions, fetchRoutine]);

  const handleSaveProfile = () => {
      setProfile({
        interests: profileInterests,
        strengths: profileStrengths,
        careerGoals: profileGoals,
      });
      setIsEditingProfile(false);
  };
  
  const getStudentStatusForClass = (classId: string): AttendanceStatus => {
    const record = studentAttendanceRecords.find(r => r.scheduledClassId === classId);
    return record ? record.status : AttendanceStatusEnum.Unmarked;
  }

  const getAttendanceBadge = (status: AttendanceStatus | undefined) => {
    switch (status) {
      case AttendanceStatusEnum.Present: 
        return <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-badge">Present</span>;
      case AttendanceStatusEnum.Absent:
        return <span className="text-xs font-bold text-danger bg-danger/10 px-2 py-1 rounded-badge">Absent</span>;
      case AttendanceStatusEnum.Late:
        return <span className="text-xs font-bold text-warning bg-warning/10 px-2 py-1 rounded-badge">Late</span>;
      default:
        return <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-badge">Unmarked</span>;
    }
  };
  
  const formatDateForDisplay = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    };
    return date.toLocaleDateString('en-US', options);
  };
  
  const handleShowQrCode = (classInfo: ScheduledClass) => {
    setClassForQr(classInfo);
    setIsQrModalOpen(true);
  };

  return (
    <div className="min-h-screen text-surface-content dark:text-neutral-200">
      <header className="bg-surface/70 backdrop-blur-xl shadow-sm sticky top-0 z-10 border-b border-white/20 dark:bg-neutral-900/70 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Student Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-neutral-content dark:text-neutral-300 hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-gray-700" />}
            </button>
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 bg-white/20 text-surface-content dark:bg-white/10 dark:text-neutral-200 font-semibold rounded-btn hover:bg-white/30 dark:hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors duration-200"
            >
              <LogoutIcon className="w-5 h-5 mr-2"/>
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-surface/50 backdrop-blur-xl p-6 rounded-box shadow-card border border-white/20 dark:bg-neutral-900/50 dark:border-white/10 transition-colors duration-300">
              <div className="flex items-center mb-4">
                  <img src={student.avatarUrl} alt={student.name} className="w-16 h-16 rounded-full mr-4 border-2 border-white/50" />
                  <div>
                      <h2 className="text-xl font-bold dark:text-white">{student.name}</h2>
                      <p className="text-sm text-neutral-content/70 dark:text-neutral-400">Student</p>
                  </div>
              </div>

              <div className="my-6">
                <h3 className="text-lg font-bold mb-3 dark:text-white">Attendance Overview</h3>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-medium text-neutral-content/70 dark:text-neutral-400">Overall Percentage</span>
                    <span className="font-bold text-3xl text-primary">{attendanceStats.percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-black/10 dark:bg-black/20 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full" style={{ width: `${attendanceStats.percentage}%` }}></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-2">
                    <div>
                      <p className="font-bold text-xl text-success">{attendanceStats.present}</p>
                      <p className="text-xs text-neutral-content/70 dark:text-neutral-400">Present</p>
                    </div>
                    <div>
                      <p className="font-bold text-xl text-danger">{attendanceStats.absent}</p>
                      <p className="text-xs text-neutral-content/70 dark:text-neutral-400">Absent</p>
                    </div>
                    <div>
                      <p className="font-bold text-xl text-warning">{attendanceStats.late}</p>
                      <p className="text-xs text-neutral-content/70 dark:text-neutral-400">Late</p>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="my-6 border-white/20 dark:border-white/10" />
              
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold dark:text-white">My Profile</h2>
                  <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="text-sm font-medium text-primary hover:text-primary-focus">
                      {isEditingProfile ? 'Cancel' : 'Edit'}
                  </button>
              </div>
              {isEditingProfile ? (
                <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-neutral-content/70 dark:text-neutral-400 mb-1">Interests</label>
                      <textarea value={profileInterests} onChange={e => setProfileInterests(e.target.value)} rows={3} className="w-full p-2 bg-white/50 border border-white/30 rounded-btn focus:ring-primary focus:border-primary dark:bg-neutral-800 dark:border-white/20 dark:text-white transition-colors duration-300"></textarea>
                  </div>
                   <div>
                      <label className="block text-sm font-medium text-neutral-content/70 dark:text-neutral-400 mb-1">Strengths</label>
                      <textarea value={profileStrengths} onChange={e => setProfileStrengths(e.target.value)} rows={3} className="w-full p-2 bg-white/50 border border-white/30 rounded-btn focus:ring-primary focus:border-primary dark:bg-neutral-800 dark:border-white/20 dark:text-white transition-colors duration-300"></textarea>
                  </div>
                   <div>
                      <label className="block text-sm font-medium text-neutral-content/70 dark:text-neutral-400 mb-1">Career Goals</label>
                      <textarea value={profileGoals} onChange={e => setProfileGoals(e.target.value)} rows={3} className="w-full p-2 bg-white/50 border border-white/30 rounded-btn focus:ring-primary focus:border-primary dark:bg-neutral-800 dark:border-white/20 dark:text-white transition-colors duration-300"></textarea>
                  </div>
                  <button onClick={handleSaveProfile} className="w-full px-4 py-2 bg-success text-white font-semibold rounded-btn shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success transition-colors duration-200">Save Profile</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-neutral-content/70 dark:text-neutral-400">Interests</h3>
                    <p className="text-sm">{profile.interests}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-content/70 dark:text-neutral-400">Strengths</h3>
                    <p className="text-sm">{profile.strengths}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-content/70 dark:text-neutral-400">Career Goals</h3>
                    <p className="text-sm">{profile.careerGoals}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Routine and Tasks */}
          <div className="lg:col-span-2 space-y-8">
            <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            <div className="bg-surface/50 backdrop-blur-xl p-6 rounded-box shadow-card border border-white/20 dark:bg-neutral-900/50 dark:border-white/10 transition-colors duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-white">Personalized Routine for {formatDateForDisplay(selectedDate)}</h2>
                <button 
                  onClick={fetchRoutine} 
                  disabled={isLoadingRoutine || todaysTimetable.length === 0}
                  className="flex items-center px-3 py-1.5 bg-primary/10 text-primary font-semibold rounded-btn hover:bg-primary/20 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Regenerate routine"
                >
                  <RefreshIcon className={`w-4 h-4 mr-2 ${isLoadingRoutine ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
              </div>
              {isLoadingRoutine ? (
                <div className="flex flex-col justify-center items-center h-48 text-neutral-content/60 dark:text-neutral-500 text-center">
                  <SparklesIcon className="w-10 h-10 mb-4 animate-pulse text-primary" />
                  <span className="font-semibold text-lg">Crafting your daily routine...</span>
                  <span className="text-sm">Our AI is personalizing your schedule.</span>
                </div>
              ) : dailyRoutine.length > 0 ? (
                <ul className="space-y-4">
                  {dailyRoutine.map((item, index) => {
                    const correspondingClass = item.classId
                        ? todaysTimetable.find(c => c.id === item.classId)
                        // Fallback for models that might not return classId, or for other cases.
                        : todaysTimetable.find(c => c.subject === item.activity && c.time === item.time && !c.isFreePeriod);

                    return (
                      <li key={index} className="flex items-center space-x-4 p-4 bg-white/20 dark:bg-white/10 rounded-btn transition-colors duration-300">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          {item.type === 'class' ? <CalendarIcon /> : item.type === 'task' ? <SparklesIcon /> : <ClockIcon />}
                        </div>
                        <div className="flex-grow">
                          <p className="font-bold dark:text-white">{item.activity}</p>
                          <p className="text-sm text-neutral-content/70 dark:text-neutral-400">{item.time}</p>
                          <p className="text-sm mt-1">{item.details}</p>
                        </div>
                        <div className="flex items-center">
                          {item.type === 'class' && correspondingClass && (
                              <div className="flex-shrink-0">
                                  {getAttendanceBadge(getStudentStatusForClass(correspondingClass.id))}
                              </div>
                          )}
                          {item.type === 'class' && correspondingClass && !correspondingClass.isLocked && (
                              <button
                                  onClick={() => handleShowQrCode(correspondingClass)}
                                  className="ml-4 p-2 rounded-full text-primary hover:bg-primary/10 transition-colors"
                                  title="Show QR Code"
                                  aria-label={`Show QR Code for ${item.activity}`}
                              >
                                  <QrCodeIcon className="w-6 h-6" />
                              </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                 <div className="text-center py-16 text-neutral-content/70 dark:text-neutral-400">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium">No schedule for this day.</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Enjoy your day off or select another day!
                    </p>
                </div>
              )}
            </div>
            
            <div className="bg-surface/50 backdrop-blur-xl p-6 rounded-box shadow-card border border-white/20 dark:bg-neutral-900/50 dark:border-white/10 transition-colors duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-white">Suggested Tasks for Free Period</h2>
                 <button 
                  onClick={fetchSuggestions} 
                  disabled={isLoadingTasks || !todaysTimetable.some(c => c.isFreePeriod && c.subject !== 'Lunch Break')}
                  className="flex items-center px-3 py-1.5 bg-primary/10 text-primary font-semibold rounded-btn hover:bg-primary/20 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Regenerate task suggestions"
                >
                  <RefreshIcon className={`w-4 h-4 mr-2 ${isLoadingTasks ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
              </div>
              {isLoadingTasks ? (
                <div className="flex flex-col justify-center items-center h-48 text-neutral-content/60 dark:text-neutral-500 text-center">
                    <SparklesIcon className="w-10 h-10 mb-4 animate-pulse text-primary" />
                    <span className="font-semibold text-lg">Generating task suggestions...</span>
                    <span className="text-sm">The AI is finding the best tasks for you.</span>
                </div>
              ) : suggestedTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {suggestedTasks.map((task, index) => (
                    <div key={index} className="bg-primary/5 dark:bg-primary/10 p-4 rounded-btn border border-primary/20 flex flex-col transition-all hover:shadow-lg hover:border-primary/40">
                      <h3 className="font-bold text-primary">{task.title}</h3>
                      <p className="text-sm text-neutral-content/80 dark:text-neutral-300 mt-1 flex-grow">{task.description}</p>
                      <p className="text-xs font-semibold text-secondary dark:text-neutral-400 mt-3">{task.duration} min</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-content/70 dark:text-neutral-400">
                    <p className="text-sm">No free periods scheduled for today.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {classForQr && (
        <QrCodeModal
          isOpen={isQrModalOpen}
          onClose={() => { setIsQrModalOpen(false); setClassForQr(null); }}
          student={student}
          classInfo={classForQr}
        />
      )}
    </div>
  );
};

export default StudentDashboard;