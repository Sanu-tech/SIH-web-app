import React from 'react';
import { Student, ScheduledClass } from '../types';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  classInfo: ScheduledClass;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, student, classInfo }) => {
  if (!isOpen) return null;

  const qrData = `${student.id};${classInfo.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-box shadow-lg w-full max-w-sm p-8 text-center animate-fade-in text-surface-content dark:text-neutral-200 transition-colors duration-300">
        <h2 className="text-2xl font-bold mb-2">Your Attendance QR Code</h2>
        <p className="text-neutral-content/70 dark:text-neutral-400 mb-4">
          For <span className="font-semibold text-primary">{classInfo.subject}</span>
        </p>
        <div className="bg-white p-4 rounded-lg inline-block">
          <img
            src={qrCodeUrl}
            alt="Attendance QR Code"
            width="250"
            height="250"
          />
        </div>
        <p className="mt-4 text-sm text-neutral-content/70 dark:text-neutral-400">
          Present this code to your teacher to mark your attendance.
        </p>
        <div className="mt-6">
          <button onClick={onClose} className="px-6 py-2 bg-primary text-primary-content font-semibold rounded-btn shadow-md hover:bg-primary-focus transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QrCodeModal;
