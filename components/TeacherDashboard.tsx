import React, { useState, useMemo, useEffect } from 'react';
import type { Student, ScheduledClass, AttendanceStatus, AttendanceRecord } from '../types';
import { AttendanceStatus as AttendanceStatusEnum } from '../types';
import AttendanceModal from './AttendanceModal';
import AddClassModal from './AddClassModal';
import RegisterStudentModal from './RegisterStudentModal';
import ViewCredentialsModal from './ViewCredentialsModal';
import UploadPhotoModal from './UploadPhotoModal';
import ConfirmationModal from './ConfirmationModal';
import DailyAttendanceSheet from './DailyAttendanceSheet';
import EmailQrModal from './EmailQrModal';
import EditStudentModal from './EditStudentModal';
import { LogoutIcon, CalendarIcon, PlusCircleIcon, UserPlusIcon, KeyIcon, TrashIcon, LockClosedIcon, UploadIcon, SunIcon, MoonIcon, EnvelopeIcon, PencilIcon } from './icons/Icons';
import Calendar, { getISTNow } from './Calendar';

interface TeacherDashboardProps {
  students: Student[];
  timetable: ScheduledClass[];
  attendanceRecords: AttendanceRecord[];
  onLogout: () => void;
  onMarkAttendance: (classId: string, markedStudents: { id: string; status: AttendanceStatus }[]) => void;
  onAddClass: (newClass: Omit<ScheduledClass, 'id' | 'institutionId' | 'isFreePeriod' | 'isLocked'>) => void;
  onRemoveClass: (classId: string) => void;
  onLockAttendance: (classId: string, lock: boolean) => void;
  onAddStudent: (name: string, avatarUrl: string, email: string, rollNo: string) => { success: boolean; message?: string };
  onUpdateStudent: (studentId: string, details: { name: string; email: string; rollNo: string; }) => { success: boolean; message?: string };
  onUpdateStudentPhoto: (studentId: string, newAvatarUrl: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isConfirmLockModalOpen: boolean;
  classToLock: ScheduledClass | null;
  onCloseConfirmLockModal: () => void;
  onConfirmLockAttendance: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ students, timetable, attendanceRecords, onLogout, onMarkAttendance, onAddClass, onRemoveClass, onLockAttendance, onAddStudent, onUpdateStudent, onUpdateStudentPhoto, isDarkMode, toggleDarkMode, isConfirmLockModalOpen, classToLock, onCloseConfirmLockModal, onConfirmLockAttendance }) => {
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isRegisterStudentModalOpen, setIsRegisterStudentModalOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [isUploadPhotoModalOpen, setIsUploadPhotoModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [isEmailQrModalOpen, setIsEmailQrModalOpen] = useState(false);
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [classToDelete, setClassToDelete] = useState<ScheduledClass | null>(null);
  const [classForModal, setClassForModal] = useState<ScheduledClass | null>(null);
  const [selectedStudentForCredentials, setSelectedStudentForCredentials] = useState<Student | null>(null);
  const [selectedStudentForPhoto, setSelectedStudentForPhoto] = useState<Student | null>(null);
  const [selectedDate, setSelectedDate] = useState(getISTNow());
  const [summaryMonth, setSummaryMonth] = useState(new Date());

  const todaysTimetable = useMemo(() => {
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    return timetable.filter(cls => cls.date === selectedDateString).sort((a,b) => a.time.localeCompare(b.time));
  }, [timetable, selectedDate]);
  
  const firstClassId = useMemo(() => todaysTimetable.find(c => !c.isFreePeriod)?.id || null, [todaysTimetable]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(firstClassId);
  
  useEffect(() => {
    const newFirstClassId = todaysTimetable.find(c => !c.isFreePeriod)?.id || null;
    if (selectedClassId && !todaysTimetable.some(c => c.id === selectedClassId)) {
        setSelectedClassId(newFirstClassId);
    } else if (!selectedClassId) {
        setSelectedClassId(newFirstClassId);
    }
  }, [selectedDate, todaysTimetable, selectedClassId]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    timetable.forEach(cls => {
        if (cls.date) {
            months.add(cls.date.substring(0, 7)); // 'YYYY-MM'
        }
    });
    return Array.from(months).sort().reverse();
  }, [timetable]);

  useEffect(() => {
      if (availableMonths.length > 0) {
          const [year, month] = availableMonths[0].split('-').map(Number);
          setSummaryMonth(new Date(year, month - 1, 1));
      }
  }, [availableMonths]);

  const monthlyAttendanceSummary = useMemo(() => {
      const year = summaryMonth.getFullYear();
      const month = summaryMonth.getMonth();

      const classesInMonth = timetable.filter(cls => {
          if (!cls.date || cls.isFreePeriod) return false;
          const classDate = new Date(cls.date);
          return classDate.getFullYear() === year && classDate.getMonth() === month;
      });

      if (classesInMonth.length === 0) return [];

      const classIdsInMonth = new Set(classesInMonth.map(c => c.id));

      return students.map(student => {
          let present = 0;
          let absent = 0;
          let late = 0;

          attendanceRecords.forEach(record => {
              if (record.userId === student.id && classIdsInMonth.has(record.scheduledClassId)) {
                  if (record.status === AttendanceStatusEnum.Present) present++;
                  else if (record.status === AttendanceStatusEnum.Absent) absent++;
                  else if (record.status === AttendanceStatusEnum.Late) late++;
              }
          });

          const totalMarked = present + absent + late;
          const percentage = totalMarked > 0 ? (present / totalMarked) * 100 : 0;

          return {
              id: student.id,
              name: student.name,
              avatarUrl: student.avatarUrl,
              present,
              absent,
              percentage,
          };
      });
  }, [students, timetable, attendanceRecords, summaryMonth]);

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const [year, month] = event.target.value.split('-').map(Number);
      setSummaryMonth(new Date(year, month - 1, 1));
  };

  const formatMonthStringForDisplay = (monthStr: string) => {
      const [year, month] = monthStr.split('-');
      return new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1).toLocaleString('default', {
          month: 'long',
          year: 'numeric',
      });
  };


  const handleOpenModal = (classInfo: ScheduledClass) => {
    if (classInfo.isLocked) {
        alert("This class is locked. Attendance cannot be taken.");
        return;
    }
    setClassForModal(classInfo);
    setIsAttendanceModalOpen(true);
  };
  
  const handleOpenEmailQrModal = (classInfo: ScheduledClass) => {
    setClassForModal(classInfo);
    setIsEmailQrModalOpen(true);
  };
  
  const handleOpenCredentialsModal = (student: Student) => {
    setSelectedStudentForCredentials(student);
    setIsCredentialsModalOpen(true);
  };
  
  const handleOpenUploadPhotoModal = (student: Student) => {
    setSelectedStudentForPhoto(student);
    setIsUploadPhotoModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setStudentToEdit(student);
    setIsEditStudentModalOpen(true);
  };

  const handleDeleteClick = (classInfo: ScheduledClass) => {
    setClassToDelete(classInfo);
    setIsConfirmDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (classToDelete) {
      onRemoveClass(classToDelete.id);
    }
    setIsConfirmDeleteModalOpen(false);
    setClassToDelete(null);
  };

  const selectedClass = todaysTimetable.find(c => c.id === selectedClassId);
  
  const getStudentStatusForClass = (studentId: string, classId: string | null): AttendanceStatus => {
      if (!classId) return AttendanceStatusEnum.Unmarked;
      const record = attendanceRecords.find(r => r.userId === studentId && r.scheduledClassId === classId);
      return record ? record.status : AttendanceStatusEnum.Unmarked;
  }

  const attendanceCounts = useMemo(() => {
    if (!selectedClassId) return { present: 0, absent: 0, unmarked: students.length };
    
    const recordsForClass = attendanceRecords.filter(r => r.scheduledClassId === selectedClassId);
    const present = recordsForClass.filter(r => r.status === AttendanceStatusEnum.Present).length;
    const absent = recordsForClass.filter(r => r.status === AttendanceStatusEnum.Absent).length;
    const late = recordsForClass.filter(r => r.status === AttendanceStatusEnum.Late).length;
    const unmarked = students.length - (present + absent + late);
    
    return { present, absent, unmarked };
  }, [selectedClassId, attendanceRecords, students]);

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatusEnum.Present: return 'text-success';
      case AttendanceStatusEnum.Absent: return 'text-danger';
      case AttendanceStatusEnum.Late: return 'text-warning';
      default: return 'text-neutral-content/60 dark:text-neutral-500';
    }
  };

  return (
    <div className="min-h-screen text-surface-content dark:text-neutral-200">
      <header className="bg-surface/70 backdrop-blur-xl shadow-sm sticky top-0 z-20 border-b border-white/20 dark:bg-neutral-900/70 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Teacher Dashboard</h1>
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
          {/* Left Column: Class Scheduler */}
          <div className="lg:col-span-1 space-y-8">
            <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            <div className="bg-surface/50 backdrop-blur-xl p-6 rounded-box shadow-card border border-white/20 dark:bg-neutral-900/50 dark:border-white/10 transition-colors duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Schedule</h2>
                <button 
                  onClick={() => setIsAddClassModalOpen(true)}
                  className="flex items-center px-3 py-1.5 bg-primary/10 text-primary font-semibold rounded-btn hover:bg-primary/20 transition-colors text-sm"
                >
                  <PlusCircleIcon className="w-5 h-5 mr-2" />
                  Add Class
                </button>
              </div>
              <ul className="space-y-3">
                {todaysTimetable.map(cls => {
                  const isSelected = !cls.isFreePeriod && selectedClassId === cls.id;
                  const isClickable = !cls.isFreePeriod;

                  return (
                    <li key={cls.id} className={`rounded-btn transition-all duration-300 border ${isSelected ? 'ring-2 ring-primary shadow-card-hover border-transparent' : 'border-white/20 dark:border-white/10'} ${cls.isFreePeriod ? 'bg-white/10 dark:bg-white/5' : 'bg-white/20 dark:bg-white/10'}`}>
                      <div className="flex justify-between items-start p-4">
                        <div onClick={() => isClickable && setSelectedClassId(cls.id)} className={`${isClickable ? 'cursor-pointer' : ''} flex-grow pr-2`}>
                          <p className={`font-bold ${cls.isFreePeriod ? 'text-neutral-content/70 dark:text-neutral-400' : 'dark:text-white'}`}>{cls.subject}</p>
                          <p className="text-sm text-neutral-content/70 dark:text-neutral-400">{cls.time}</p>
                          {!cls.isFreePeriod && cls.isLocked && <div className="flex items-center text-xs text-danger mt-1"><LockClosedIcon className="w-3 h-3 mr-1" /> Locked</div>}
                        </div>
                        <button
                          onClick={() => handleDeleteClick(cls)}
                          className="flex-shrink-0 p-2 -mr-2 -mt-2 text-gray-500 rounded-full hover:bg-danger/10 hover:text-danger transition-colors"
                          aria-label={`Remove ${cls.subject}`}
                          title={`Remove ${cls.subject}`}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                      {!cls.isFreePeriod && (
                        <div className="border-t border-white/20 dark:border-white/10 grid grid-cols-3 divide-x divide-white/20 dark:divide-white/10">
                          <button
                            onClick={() => handleOpenEmailQrModal(cls)}
                            className="w-full text-center px-4 py-2 text-info font-semibold hover:bg-info/10 transition-colors text-sm flex items-center justify-center"
                            title="Prepare QR Code Emails"
                          >
                            <EnvelopeIcon className="w-4 h-4 mr-2" />
                            Email
                          </button>
                          <button 
                            onClick={() => handleOpenModal(cls)}
                            className="w-full text-center px-4 py-2 text-primary font-semibold hover:bg-primary/10 transition-colors text-sm flex items-center justify-center disabled:text-gray-400 disabled:bg-white/10 disabled:cursor-not-allowed"
                            disabled={cls.isLocked}
                          >
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            Mark
                          </button>
                          <button
                            onClick={() => onLockAttendance(cls.id, !cls.isLocked)}
                            className={`w-full text-center px-4 py-2 font-semibold hover:bg-opacity-10 transition-colors text-sm flex items-center justify-center ${cls.isLocked ? 'text-warning hover:bg-warning/10' : 'text-danger hover:bg-danger/10'}`}
                          >
                              <LockClosedIcon className="w-4 h-4 mr-2" />
                              {cls.isLocked ? 'Unlock' : 'Lock'}
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Right Column: Attendance for selected class */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface/50 backdrop-blur-xl p-6 rounded-box shadow-card border border-white/20 dark:bg-neutral-900/50 dark:border-white/10 transition-colors duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Attendance: <span className="text-primary">{selectedClass?.subject || 'No Class'}</span></h2>
                 <button 
                  onClick={() => setIsRegisterStudentModalOpen(true)}
                  className="flex items-center px-3 py-1.5 bg-success/10 text-success font-semibold rounded-btn hover:bg-success/20 transition-colors text-sm"
                >
                  <UserPlusIcon className="w-5 h-5 mr-2" />
                  Register Student
                </button>
              </div>
              {selectedClass ? (
                <>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-4xl font-extrabold text-success">{attendanceCounts.present}</p>
                      <p className="text-sm text-neutral-content/70 dark:text-neutral-400 font-medium">Present</p>
                    </div>
                    <div>
                      <p className="text-4xl font-extrabold text-danger">{attendanceCounts.absent}</p>
                      <p className="text-sm text-neutral-content/70 dark:text-neutral-400 font-medium">Absent</p>
                    </div>
                    <div>
                      <p className="text-4xl font-extrabold text-secondary">{attendanceCounts.unmarked}</p>
                      <p className="text-sm text-neutral-content/70 dark:text-neutral-400 font-medium">Unmarked</p>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-2 max-h-96 overflow-y-auto pr-2">
                    {students.map(student => {
                      const status = getStudentStatusForClass(student.id, selectedClassId);
                      return (
                      <li key={student.id} className="flex items-center justify-between p-2 rounded-btn transition-colors duration-200 hover:bg-white/20 dark:hover:bg-white/10">
                        <div className="flex items-center">
                          <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full mr-4" />
                          <span className="font-medium">{student.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                           <button
                              onClick={() => handleOpenCredentialsModal(student)}
                              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-white/20 hover:text-gray-800 dark:hover:text-white transition-colors"
                              aria-label={`View credentials for ${student.name}`}
                              title="View Credentials"
                            >
                              <KeyIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(student)}
                              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-white/20 hover:text-primary dark:hover:text-primary transition-colors"
                              aria-label={`Edit details for ${student.name}`}
                              title="Edit Details"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                           <button
                              onClick={() => handleOpenUploadPhotoModal(student)}
                              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-white/20 hover:text-gray-800 dark:hover:text-white transition-colors"
                              aria-label={`Upload photo for ${student.name}`}
                              title="Upload Photo"
                            >
                              <UploadIcon className="w-5 h-5" />
                            </button>
                          <span className={`font-semibold text-sm w-20 text-right ${getStatusColor(status)}`}>{status}</span>
                        </div>
                      </li>
                    );
                    })}
                  </ul>
                </>
              ) : (
                <div className="text-center py-16 text-neutral-content/70 dark:text-neutral-400">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium">Select a class from the schedule</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Attendance details will appear here.
                    </p>
                </div>
              )}
            </div>
            
            <DailyAttendanceSheet
              students={students}
              todaysTimetable={todaysTimetable}
              attendanceRecords={attendanceRecords}
            />

            <div className="bg-surface/50 backdrop-blur-xl p-6 rounded-box shadow-card border border-white/20 dark:bg-neutral-900/50 dark:border-white/10 transition-colors duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Monthly Summary</h2>
                {availableMonths.length > 0 && (
                  <select
                    value={summaryMonth.toISOString().substring(0, 7)}
                    onChange={handleMonthChange}
                    className="p-2 border border-white/30 rounded-btn focus:ring-primary focus:border-primary bg-white/50 dark:bg-neutral-800 dark:border-white/20 dark:text-white transition-colors duration-300"
                    aria-label="Select month for summary"
                  >
                    {availableMonths.map(monthStr => (
                      <option key={monthStr} value={monthStr}>
                        {formatMonthStringForDisplay(monthStr)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {monthlyAttendanceSummary.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/20 dark:border-white/10">
                        <th className="p-3 font-semibold text-sm text-neutral-content/70 dark:text-neutral-400">Student</th>
                        <th className="p-3 font-semibold text-center text-sm">Present</th>
                        <th className="p-3 font-semibold text-center text-sm">Absent</th>
                        <th className="p-3 font-semibold text-sm">Attendance %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyAttendanceSummary.map(summary => (
                        <tr key={summary.id} className="border-b border-white/10 dark:border-white/5 last:border-0 hover:bg-white/10 dark:hover:bg-white/5 transition-colors duration-200">
                          <td className="p-3">
                            <div className="flex items-center">
                              <img src={summary.avatarUrl} alt={summary.name} className="w-8 h-8 rounded-full mr-3" />
                              <span className="font-medium text-sm">{summary.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center text-success font-bold">{summary.present}</td>
                          <td className="p-3 text-center text-danger font-bold">{summary.absent}</td>
                          <td className="p-3">
                            <div className="flex items-center">
                              <div className="w-full bg-black/10 dark:bg-black/20 rounded-full h-2.5">
                                <div
                                  className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full"
                                  style={{ width: `${summary.percentage.toFixed(0)}%` }}
                                ></div>
                              </div>
                              <span className="ml-3 text-sm font-semibold tabular-nums">{summary.percentage.toFixed(0)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-content/70 dark:text-neutral-400">
                  <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium">No Data Available</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There is no attendance data for the selected month.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        students={students}
        attendanceRecords={attendanceRecords}
        onMarkAttendance={onMarkAttendance}
        classInfo={classForModal || undefined}
      />
      <EmailQrModal
        isOpen={isEmailQrModalOpen}
        onClose={() => setIsEmailQrModalOpen(false)}
        students={students}
        classInfo={classForModal || undefined}
      />
      <AddClassModal
        isOpen={isAddClassModalOpen}
        onClose={() => setIsAddClassModalOpen(false)}
        onAddClass={onAddClass}
        selectedDate={selectedDate}
      />
      <RegisterStudentModal
        isOpen={isRegisterStudentModalOpen}
        onClose={() => setIsRegisterStudentModalOpen(false)}
        onAddStudent={onAddStudent}
      />
       <EditStudentModal
        isOpen={isEditStudentModalOpen}
        onClose={() => setIsEditStudentModalOpen(false)}
        student={studentToEdit}
        onUpdateStudent={onUpdateStudent}
      />
      <ViewCredentialsModal
        isOpen={isCredentialsModalOpen}
        onClose={() => setIsCredentialsModalOpen(false)}
        student={selectedStudentForCredentials}
      />
      <UploadPhotoModal
        isOpen={isUploadPhotoModalOpen}
        onClose={() => setIsUploadPhotoModalOpen(false)}
        student={selectedStudentForPhoto}
        onUpdatePhoto={onUpdateStudentPhoto}
      />
      <ConfirmationModal
        isOpen={isConfirmDeleteModalOpen}
        onClose={() => setIsConfirmDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Class"
        message={
            <>
                Are you sure you want to remove <strong>"{classToDelete?.subject}"</strong> at {classToDelete?.time}? This action cannot be undone.
            </>
        }
        confirmButtonText="Delete"
        confirmButtonClass="bg-danger text-white hover:bg-red-700"
      />
      <ConfirmationModal
        isOpen={isConfirmLockModalOpen}
        onClose={onCloseConfirmLockModal}
        onConfirm={onConfirmLockAttendance}
        title="Lock Attendance?"
        message={
          <>
            Are you sure you want to lock attendance for <strong>"{classToLock?.subject}"</strong>?
            <br />
            All students not yet marked will be set to 'Absent'. This action cannot be easily undone.
          </>
        }
        confirmButtonText="Yes, Lock It"
        confirmButtonClass="bg-warning text-black hover:bg-yellow-500"
      />
    </div>
  );
};

export default TeacherDashboard;