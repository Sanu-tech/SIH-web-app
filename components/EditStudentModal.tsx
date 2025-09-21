import React, { useState, useEffect } from 'react';
import { Student } from '../types';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onUpdateStudent: (studentId: string, details: { name: string; email: string; rollNo: string }) => { success: boolean; message?: string };
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({ isOpen, onClose, student, onUpdateStudent }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setName(student.name);
      setEmail(student.email);
      setRollNo(student.rollNo);
      setError('');
    }
  }, [student, isOpen]);

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    if (!name || !email || !rollNo) {
      setError('Please fill in all required fields.');
      return;
    }
    
    const result = onUpdateStudent(student.id, { name, email, rollNo });

    if (result.success) {
      handleClose();
    } else {
      setError(result.message || 'An unknown error occurred while updating.');
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-box shadow-lg w-full max-w-md p-8 animate-fade-in text-surface-content dark:text-neutral-200 transition-colors duration-300">
        <h2 className="text-2xl font-bold mb-6">Edit Student Details</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center mb-4">
              <img
                src={student.avatarUrl}
                alt={student.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
              />
          </div>
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-neutral-content/80 dark:text-neutral-400 mb-1">Full Name</label>
            <input
              type="text"
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 bg-white/50 border border-white/30 rounded-btn focus:ring-primary focus:border-primary dark:bg-neutral-800 dark:border-white/20 dark:text-white transition-colors duration-300"
              required
            />
          </div>
          <div>
            <label htmlFor="edit-email" className="block text-sm font-medium text-neutral-content/80 dark:text-neutral-400 mb-1">Email Address</label>
            <input
              type="email"
              id="edit-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-white/50 border border-white/30 rounded-btn focus:ring-primary focus:border-primary dark:bg-neutral-800 dark:border-white/20 dark:text-white transition-colors duration-300"
              required
            />
          </div>
          <div>
            <label htmlFor="edit-rollNo" className="block text-sm font-medium text-neutral-content/80 dark:text-neutral-400 mb-1">Roll Number</label>
            <input
              type="text"
              id="edit-rollNo"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              className="w-full p-2 bg-white/50 border border-white/30 rounded-btn focus:ring-primary focus:border-primary dark:bg-neutral-800 dark:border-white/20 dark:text-white transition-colors duration-300"
              required
            />
          </div>
          
          {error && <p className="text-sm text-danger text-center bg-danger/10 p-2 rounded-btn">{error}</p>}
          
          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={handleClose} className="px-4 py-2 bg-white/20 text-surface-content dark:bg-white/10 dark:text-neutral-200 font-semibold rounded-btn hover:bg-white/30 dark:hover:bg-white/20 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-primary text-primary-content font-semibold rounded-btn shadow-md hover:bg-primary-focus transition-colors">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;
