import React from 'react';
import { Student } from '../types';

interface ViewCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

const ViewCredentialsModal: React.FC<ViewCredentialsModalProps> = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-box shadow-lg w-full max-w-sm p-8 text-center animate-fade-in text-surface-content dark:text-neutral-200 transition-colors duration-300">
        <img src={student.avatarUrl} alt={student.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white/50" />
        <h2 className="text-2xl font-bold mb-2">{student.name}</h2>
        <p className="text-neutral-content/70 dark:text-neutral-400 mb-6">Student Identifiers</p>
        
        <div className="space-y-4 text-left">
          <div className="bg-black/10 dark:bg-black/20 p-3 rounded-btn transition-colors duration-300">
            <label className="block text-xs font-semibold text-neutral-content/70 dark:text-neutral-400 mb-1 uppercase tracking-wider">Email</label>
            <p className="font-mono text-lg">{student.email}</p>
          </div>
          <div className="bg-black/10 dark:bg-black/20 p-3 rounded-btn transition-colors duration-300">
            <label className="block text-xs font-semibold text-neutral-content/70 dark:text-neutral-400 mb-1 uppercase tracking-wider">Roll Number</label>
            <p className="font-mono text-lg">{student.rollNo}</p>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button onClick={onClose} className="px-6 py-2 bg-primary text-primary-content font-semibold rounded-btn shadow-md hover:bg-primary-focus transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewCredentialsModal;