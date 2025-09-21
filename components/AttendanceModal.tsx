import React, { useState, useEffect, useCallback } from 'react';
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

const AttendanceModal: React.FC<AttendanceModalProps> = ({ isOpen, onClose, students, classInfo, attendanceRecords, onMarkAttendance }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'list' | 'qr' | 'camera'>('list');

  const getInitialStatus = useCallback((studentId: string): AttendanceStatus => {
    if (!classInfo) return AttendanceStatusEnum.Unmarked;
    const record = attendanceRecords.find(r => r.userId === studentId && r.scheduledClassId === classInfo.id);
    return record ? record.status : AttendanceStatusEnum.Unmarked;
  }, [attendanceRecords, classInfo]);
  
  useEffect(() => {
    if (isOpen) {
      setMode('list');
      setIsLoading(false);
    }
  }, [isOpen]);

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

      const unmarkedStudents = students.filter(s => {
          const currentStatus = getInitialStatus(s.id);
          return currentStatus === AttendanceStatusEnum.Unmarked;
      });

      try {
          if (unmarkedStudents.length === 0) {
            alert("All students have already been marked.");
            setIsLoading(false);
            return;
          }
          const presentEmails = await recognizeStudentsInImage(photoBase64, unmarkedStudents);
          const presentStudents = unmarkedStudents
              .filter(s => presentEmails.includes(s.email))
              .map(s => ({ id: s.id, status: AttendanceStatusEnum.Present }));
          
          if (presentStudents.length > 0) {
            onMarkAttendance(classInfo.id, presentStudents);
            alert(`Successfully marked ${presentStudents.length} student(s) as present.`);
          } else {
            alert("No new students were recognized in the photo.");
          }

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
        if (classId === classInfo?.id && students.some(s => s.id === studentId)) {
          onMarkAttendance(classInfo.id, [{ id: studentId, status: AttendanceStatusEnum.Present }]);
        } else {
            console.warn("Scanned QR code for wrong class or unknown student.");
        }
      } catch (error) {
          console.error("Invalid QR code format", error);
      }
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
             <p className="text-center text-neutral-content/80 dark:text-neutral-400 mb-4">
                Use one of the automated methods below to take attendance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <label htmlFor="photo-upload" className="w-full flex flex-col items-center justify-center p-4 bg-secondary/10 text-secondary font-semibold rounded-btn cursor-pointer hover:bg-secondary/20 transition-colors">
                    <UploadIcon className="w-8 h-8 mb-2" />
                    <span>Upload Photo</span>
                    <span className="text-xs font-normal">For group recognition</span>
                    <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                 <button onClick={() => setMode('camera')} className="flex flex-col items-center justify-center p-4 bg-secondary/10 text-secondary font-semibold rounded-btn hover:bg-secondary/20 transition-colors">
                    <CameraIcon className="w-8 h-8 mb-2" />
                    <span>Use Camera</span>
                    <span className="text-xs font-normal">For group recognition</span>
                </button>
            </div>

            <button onClick={() => setMode('qr')} className="w-full flex flex-col items-center justify-center p-4 bg-primary/10 text-primary font-semibold rounded-btn hover:bg-primary/20 transition-colors mb-4">
                <QrCodeIcon className="w-8 h-8 mb-2" />
                <span>Scan Student QR Codes</span>
                <span className="text-xs font-normal">One by one</span>
            </button>
            
            <div className="mt-8 flex justify-end">
              <button onClick={onClose} className="px-6 py-2 bg-white/20 text-surface-content dark:bg-white/10 dark:text-neutral-200 font-semibold rounded-btn hover:bg-white/30 dark:hover:bg-white/20 transition-colors">Close</button>
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