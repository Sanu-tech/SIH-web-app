import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Student, ScheduledClass, AttendanceStatus, AttendanceRecord } from '../types';
import { AttendanceStatus as AttendanceStatusEnum } from '../types';
import { SparklesIcon, UploadIcon, CameraIcon, QrCodeIcon, XIcon } from './icons/Icons';
import { recognizeStudentsInImage } from '../services/geminiService';
import QrScanner from './QrScanner';
import CameraCapture from './CameraCapture';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  classInfo?: ScheduledClass;
  attendanceRecords: AttendanceRecord[];
  onMarkAttendance: (classId: string, markedStudents: { id: string; status: AttendanceStatus }[]) => void;
}

type AttendanceChanges = { [studentId: string]: AttendanceStatus };

const AttendanceModal: React.FC<AttendanceModalProps> = ({ isOpen, onClose, students, classInfo, attendanceRecords, onMarkAttendance }) => {
  const [changes, setChanges] = useState<AttendanceChanges>({});
  const [filter, setFilter] = useState<'all' | 'present' | 'absent' | 'late' | 'unmarked'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'list' | 'qr' | 'camera'>('list');
  
  const studentsInClass = useMemo(() => {
    // In a real app, this would be more robust, linking students to courses.
    // For this demo, we assume all students are in all classes.
    return students;
  }, [students]);

  const getInitialStatus = useCallback((studentId: string): AttendanceStatus => {
    if (!classInfo) return AttendanceStatusEnum.Unmarked;
    const record = attendanceRecords.find(r => r.userId === studentId && r.scheduledClassId === classInfo.id);
    return record ? record.status : AttendanceStatusEnum.Unmarked;
  }, [attendanceRecords, classInfo]);
  
  useEffect(() => {
    if (isOpen) {
      setChanges({});
      setMode('list');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setChanges(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = () => {
    if (!classInfo) return;
    const markedStudents = Object.entries(changes).map(([id, status]) => ({ id, status }));
    onMarkAttendance(classInfo.id, markedStudents);
    onClose();
  };
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = (reader.result as string).split(',')[1];
              handleAiRecognition(base64);
          };
          reader.readAsDataURL(file);
      }
  };

  const handlePhotoCapture = (imageDataUrl: string) => {
    const base64 = imageDataUrl.split(',')[1];
    handleAiRecognition(base64);
    setMode('list'); // Return to list view
  };

  const handleAiRecognition = async (photoBase64: string) => {
      if (!classInfo) return;
      setIsLoading(true);

      const unmarkedStudents = studentsInClass.filter(s => {
          const currentStatus = changes[s.id] || getInitialStatus(s.id);
          return currentStatus === AttendanceStatusEnum.Unmarked;
      });

      try {
          const presentEmails = await recognizeStudentsInImage(photoBase64, unmarkedStudents);
          const presentStudentIds = studentsInClass
              .filter(s => presentEmails.includes(s.email))
              .map(s => s.id);
          
          const newChanges: AttendanceChanges = {};
          presentStudentIds.forEach(id => {
              newChanges[id] = AttendanceStatusEnum.Present;
          });
          setChanges(prev => ({...prev, ...newChanges}));

      } catch (error) {
          console.error("AI recognition failed", error);
          alert("Could not recognize students from the image. Please try again.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleQrScan = (data: string) => {
      try {
        const [studentId, classId] = data.split(';');
        if (classId === classInfo?.id && studentsInClass.some(s => s.id === studentId)) {
          handleStatusChange(studentId, AttendanceStatusEnum.Present);
        } else {
            console.warn("Scanned QR code for wrong class or unknown student.");
        }
      } catch (error) {
          console.error("Invalid QR code format", error);
      }
  };

  const filteredStudents = useMemo(() => {
    if (filter === 'all') return studentsInClass;
    return studentsInClass.filter(s => {
      const status = changes[s.id] || getInitialStatus(s.id);
      if (filter === 'unmarked') return status === AttendanceStatusEnum.Unmarked;
      return status.toLowerCase() === filter;
    });
  }, [studentsInClass, filter, changes, getInitialStatus]);

  const renderStatusButtons = (studentId: string) => {
    const currentStatus = changes[studentId] || getInitialStatus(studentId);
    const statuses: AttendanceStatus[] = [AttendanceStatusEnum.Present, AttendanceStatusEnum.Absent, AttendanceStatusEnum.Late];
    return (
      <div className="flex space-x-1">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => handleStatusChange(studentId, status)}
            className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
              currentStatus === status
                ? 'text-white scale-105'
                : 'bg-white/20 hover:bg-white/40 dark:bg-white/10 dark:hover:bg-white/20'
            }`}
            style={{ backgroundColor: currentStatus === status ? (status === 'Present' ? '#22c55e' : status === 'Absent' ? '#ef4444' : '#f59e0b') : '' }}
          >
            {status}
          </button>
        ))}
      </div>
    );
  };
  
  if (!isOpen) return null;
  
  const mainContent = () => {
      if (mode === 'qr') {
          return <QrScanner onScan={handleQrScan} onClose={() => setMode('list')} />;
      }
      if (mode === 'camera') {
          return <CameraCapture onCapture={handlePhotoCapture} onClose={() => setMode('list')} />;
      }
      return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Mark Attendance</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><XIcon className="w-6 h-6"/></button>
            </div>
            <p className="text-neutral-content/80 dark:text-neutral-400 mb-6">
                Class: <span className="font-semibold text-primary">{classInfo?.subject}</span>
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
                <label htmlFor="photo-upload" className="w-full flex items-center justify-center p-3 bg-secondary/10 text-secondary font-semibold rounded-btn cursor-pointer hover:bg-secondary/20 transition-colors">
                    <UploadIcon className="w-5 h-5 mr-2" />
                    Upload Photo
                    <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                 <button onClick={() => setMode('camera')} className="flex items-center justify-center p-3 bg-secondary/10 text-secondary font-semibold rounded-btn hover:bg-secondary/20 transition-colors">
                    <CameraIcon className="w-5 h-5 mr-2" />
                    Use Camera
                </button>
            </div>

            <button onClick={() => setMode('qr')} className="w-full flex items-center justify-center p-3 bg-primary/10 text-primary font-semibold rounded-btn hover:bg-primary/20 transition-colors mb-4">
                <QrCodeIcon className="w-5 h-5 mr-2" />
                Scan QR Codes
            </button>
            
            <div className="border-t border-white/20 dark:border-white/10 pt-4">
                <div className="flex justify-center space-x-2 mb-4">
                    {/* Filter buttons can be added here */}
                </div>
                <ul className="space-y-2 max-h-80 overflow-y-auto pr-2">
                  {filteredStudents.map(student => (
                    <li key={student.id} className="flex items-center justify-between p-2 rounded-btn hover:bg-white/10 dark:hover:bg-white/5">
                      <div className="flex items-center">
                        <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full mr-3" />
                        <span className="font-medium">{student.name}</span>
                      </div>
                      {renderStatusButtons(student.id)}
                    </li>
                  ))}
                </ul>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button onClick={onClose} className="px-4 py-2 bg-white/20 text-surface-content dark:bg-white/10 dark:text-neutral-200 font-semibold rounded-btn hover:bg-white/30 dark:hover:bg-white/20 transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2 bg-primary text-primary-content font-semibold rounded-btn shadow-md hover:bg-primary-focus transition-colors">Save Changes</button>
            </div>
        </>
      )
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-surface/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-box shadow-lg w-full max-w-lg p-6 animate-fade-in text-surface-content dark:text-neutral-200 transition-colors duration-300 relative">
        {isLoading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-box">
                <SparklesIcon className="w-12 h-12 text-primary animate-pulse" />
                <p className="mt-4 text-lg font-semibold text-white">AI is recognizing students...</p>
            </div>
        )}
        {mainContent()}
      </div>
    </div>
  );
};

export default AttendanceModal;
