import React, { useState } from 'react';
import { ScheduledClass } from '../types';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClass: (newClass: Omit<ScheduledClass, 'id' | 'institutionId' | 'isFreePeriod' | 'isLocked'>) => void;
  selectedDate: Date;
}

const AddClassModal: React.FC<AddClassModalProps> = ({ isOpen, onClose, onAddClass, selectedDate }) => {
  const [subject, setSubject] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !startTime || !endTime) {
      alert('Please fill all fields.');
      return;
    }
    
    onAddClass({
      subject,
      time: `${startTime} - ${endTime}`,
      date: selectedDate.toISOString().split('T')[0],
      courseId: `course-${Date.now()}`
    });

    setSubject('');
    setStartTime('09:00');
    setEndTime('10:30');
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-box shadow-lg w-full max-w-md p-8 animate-fade-in text-surface-content dark:text-neutral-200 transition-colors duration-300">
        <h2 className="text-2xl font-bold mb-6">Add a New Class</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-neutral-content/80 dark:text-neutral-400 mb-1">Subject Name</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 bg-white/50 border border-white/30 rounded-btn focus:ring-primary focus:border-primary dark:bg-neutral-800 dark:border-white/20 dark:text-white transition-colors duration-300"
              required
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-neutral-content/80 dark:text-neutral-400 mb-1">Date</label>
            <input
              type="date"
              id="date"
              value={selectedDate.toISOString().split('T')[0]}
              className="w-full p-2 border border-white/30 rounded-btn bg-black/10 dark:bg-black/20 text-neutral-content/70 dark:text-neutral-400 transition-colors duration-300"
              readOnly
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-neutral-content/80 dark:text-neutral-400 mb-1">Start Time</label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 bg-white/50 border border-white/30 rounded-btn focus:ring-primary focus:border-primary dark:bg-neutral-800 dark:border-white/20 dark:text-white transition-colors duration-300"
                required
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-neutral-content/80 dark:text-neutral-400 mb-1">End Time</label>
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2 bg-white/50 border border-white/30 rounded-btn focus:ring-primary focus:border-primary dark:bg-neutral-800 dark:border-white/20 dark:text-white transition-colors duration-300"
                required
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white/20 text-surface-content dark:bg-white/10 dark:text-neutral-200 font-semibold rounded-btn hover:bg-white/30 dark:hover:bg-white/20 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-primary text-primary-content font-semibold rounded-btn shadow-md hover:bg-primary-focus transition-colors">
              Save Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClassModal;