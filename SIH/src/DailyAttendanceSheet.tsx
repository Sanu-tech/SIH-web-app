import React from 'react';
import { Student, ScheduledClass, AttendanceRecord, AttendanceStatus } from '../types';
import { AttendanceStatus as AttendanceStatusEnum } from '../types';
import { CheckCircleIcon, XCircleIcon, ClockIcon, CalendarIcon } from './icons/Icons';

interface DailyAttendanceSheetProps {
  students: Student[];
  todaysTimetable: ScheduledClass[];
  attendanceRecords: AttendanceRecord[];
}

const StatusIcon: React.FC<{ status: AttendanceStatus }> = ({ status }) => {
  switch (status) {
    case AttendanceStatusEnum.Present:
      return <span title="Present"><CheckCircleIcon className="w-6 h-6 text-success mx-auto" /></span>;
    case AttendanceStatusEnum.Absent:
      return <span title="Absent"><XCircleIcon className="w-6 h-6 text-danger mx-auto" /></span>;
    case AttendanceStatusEnum.Late:
      return <span title="Late"><ClockIcon className="w-6 h-6 text-warning mx-auto" /></span>;
    default:
      return <span className="text-gray-400 font-mono text-lg" title="Unmarked">-</span>;
  }
};

const DailyAttendanceSheet: React.FC<DailyAttendanceSheetProps> = ({ students, todaysTimetable, attendanceRecords }) => {
  const academicClasses = todaysTimetable.filter(c => !c.isFreePeriod);

  const getStudentStatusForClass = (studentId: string, classId: string): AttendanceStatus => {
    const record = attendanceRecords.find(r => r.userId === studentId && r.scheduledClassId === classId);
    return record ? record.status : AttendanceStatusEnum.Unmarked;
  };

  return (
    <div className="bg-surface/50 backdrop-blur-xl p-6 rounded-box shadow-card border border-white/20 dark:bg-neutral-900/50 dark:border-white/10 transition-colors duration-300">
      <h2 className="text-xl font-bold mb-4 dark:text-white">Daily Attendance Sheet</h2>
      {academicClasses.length > 0 ? (
        <div className="overflow-x-auto relative border border-white/20 dark:border-white/10 rounded-btn">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-content/70 dark:text-neutral-400 uppercase">
              <tr>
                <th scope="col" className="sticky left-0 bg-surface/80 dark:bg-neutral-900/80 backdrop-blur-lg px-4 py-3 z-10 border-r border-white/20 dark:border-white/10">
                  Student Name
                </th>
                {academicClasses.map(cls => (
                  <th scope="col" className="px-4 py-3 text-center min-w-[120px] bg-surface/80 dark:bg-neutral-900/80 backdrop-blur-lg" key={cls.id}>
                    <div className="flex flex-col">
                      <span className="font-bold text-surface-content dark:text-white">{cls.subject}</span>
                      <span className="font-normal text-gray-500 dark:text-gray-400">{cls.time}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id} className="border-b border-white/10 dark:border-white/5 last:border-0 hover:bg-white/10 dark:hover:bg-white/5 transition-colors duration-200">
                  <th scope="row" className="sticky left-0 bg-inherit px-4 py-3 font-medium whitespace-nowrap flex items-center z-10 border-r border-white/20 dark:border-white/10">
                    <img src={student.avatarUrl} alt={student.name} className="w-8 h-8 rounded-full mr-3 flex-shrink-0" />
                    <span className="truncate">{student.name}</span>
                  </th>
                  {academicClasses.map(cls => {
                    const status = getStudentStatusForClass(student.id, cls.id);
                    return (
                      <td key={cls.id} className="px-4 py-3 text-center">
                        <div
                          className="w-full h-full flex items-center justify-center p-1"
                          aria-label={`Attendance for ${student.name} in ${cls.subject} is ${status}.`}
                        >
                          <StatusIcon status={status} />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 text-neutral-content/70 dark:text-neutral-400">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium">No Classes Scheduled</h3>
          <p className="mt-1 text-sm text-gray-500">
            There are no academic classes on the selected date to display on the sheet.
          </p>
        </div>
      )}
    </div>
  );
};

export default DailyAttendanceSheet;