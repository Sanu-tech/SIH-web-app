import React, { useMemo } from 'react';
import { Student, ScheduledClass } from '../types';
import { PaperAirplaneIcon, XIcon } from './icons/Icons';

interface EmailQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  classInfo?: ScheduledClass;
}

const EmailQrModal: React.FC<EmailQrModalProps> = ({ isOpen, onClose, students, classInfo }) => {
  const studentsInClass = useMemo(() => {
    // FIX: Correctly filter students based on the class's courseId.
    // If it's a new class without a proper courseId, assume all students are enrolled for demo purposes.
    if (classInfo && classInfo.courseId) {
        const studentList = students.filter(s => s.courseIds.includes(classInfo.courseId));
        // Fallback for newly created classes not yet assigned to students
        if (studentList.length > 0) {
            return studentList;
        }
    }
    return students;
  }, [students, classInfo]);

  const generateQrCodeUrl = (studentId: string, classId: string) => {
    const qrData = `${studentId};${classId}`;
    // Use high error correction for better scannability
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}&ecc=H`;
  };

  const createMailtoLink = (student: Student, classData: ScheduledClass) => {
    const recipient = student.email;
    const subject = `Attendance QR Code for ${classData.subject}`;
    const qrCodeUrl = generateQrCodeUrl(student.id, classData.id);
    
    const body = `Hi ${student.name.split(' ')[0]},

Here is your unique QR code for the upcoming "${classData.subject}" class at ${classData.time}.

Please have this code ready on your device for scanning to mark your attendance.

You can view the QR code here:
${qrCodeUrl}

Thank you,
Your Teacher`;

    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);

    return `mailto:${recipient}?subject=${encodedSubject}&body=${encodedBody}`;
  };
  
  if (!isOpen || !classInfo) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-box shadow-lg w-full max-w-lg p-6 animate-fade-in text-surface-content dark:text-neutral-200 transition-colors duration-300 flex flex-col" style={{maxHeight: '90vh'}}>
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold">Prepare QR Code Emails</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><XIcon className="w-6 h-6"/></button>
        </div>
        <p className="text-neutral-content/80 dark:text-neutral-400 mb-4 flex-shrink-0">
          For class: <span className="font-semibold text-primary">{classInfo.subject} at {classInfo.time}</span>
        </p>
        <p className="text-sm text-neutral-content/80 dark:text-neutral-400 mb-4 flex-shrink-0">
            Click "Compose Email" to open your default mail app with a pre-filled message for each student.
        </p>

        <div className="bg-black/10 dark:bg-black/20 p-2 rounded-lg overflow-y-auto flex-grow">
          {studentsInClass.length > 0 ? (
              <ul className="space-y-2">
                {studentsInClass.map(student => (
                  <li key={student.id} className="bg-surface/50 dark:bg-neutral-800/50 rounded-lg shadow p-3 flex items-center justify-between">
                    <div className="flex items-center">
                        <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full mr-3" />
                        <div>
                            <p className="font-semibold">{student.name}</p>
                            <p className="text-xs text-neutral-content/70 dark:text-neutral-400">{student.email}</p>
                        </div>
                    </div>
                    <a
                      href={createMailtoLink(student, classInfo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-1.5 bg-primary/10 text-primary font-semibold rounded-btn hover:bg-primary/20 transition-colors text-sm"
                      aria-label={`Compose email to ${student.name}`}
                    >
                      <PaperAirplaneIcon className="w-4 h-4 mr-2"/>
                      Compose Email
                    </a>
                  </li>
                ))}
              </ul>
          ) : (
            <div className="text-center py-12 text-neutral-content/70 dark:text-neutral-400">
                <p className="font-semibold">No students are enrolled in this course.</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/20 text-surface-content dark:bg-white/10 dark:text-neutral-200 font-semibold rounded-btn shadow-md hover:bg-white/30 dark:hover:bg-white/20 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailQrModal;
