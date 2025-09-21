import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { UploadIcon } from './icons/Icons';

interface UploadPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onUpdatePhoto: (studentId: string, newAvatarUrl: string) => void;
}

const UploadPhotoModal: React.FC<UploadPhotoModalProps> = ({ isOpen, onClose, student, onUpdatePhoto }) => {
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNewPhotoPreview(null);
      setFile(null);
    }
  }, [isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (student && newPhotoPreview && file) {
      onUpdatePhoto(student.id, newPhotoPreview);
      onClose();
    } else {
      alert('Please select a photo to upload.');
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-box shadow-lg w-full max-w-md p-8 animate-fade-in text-surface-content dark:text-neutral-200 transition-colors duration-300">
        <h2 className="text-2xl font-bold mb-2">Upload New Photo</h2>
        <p className="text-neutral-content/70 dark:text-neutral-400 mb-6">For <span className="font-semibold">{student.name}</span></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center items-center space-x-4">
            <div className="text-center">
              <img src={student.avatarUrl} alt="Current" className="w-24 h-24 rounded-full mx-auto border-4 border-white/20" />
              <p className="text-xs font-semibold text-neutral-content/70 dark:text-neutral-400 mt-2">Current</p>
            </div>
            {newPhotoPreview && (
                 <div className="text-center">
                    <img src={newPhotoPreview} alt="New Preview" className="w-24 h-24 rounded-full mx-auto border-4 border-primary" />
                     <p className="text-xs font-semibold text-primary mt-2">New</p>
                </div>
            )}
          </div>

          <div>
             <label htmlFor="photo-upload" className="w-full mt-4 flex items-center justify-center px-4 py-3 border-2 border-dashed border-white/30 dark:border-white/20 rounded-btn cursor-pointer hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                  <UploadIcon className="w-6 h-6 mr-2 text-gray-500" />
                  <span className="font-medium text-neutral-content/70 dark:text-neutral-300">{file ? file.name : 'Select a photo'}</span>
              </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white/20 text-surface-content dark:bg-white/10 dark:text-neutral-200 font-semibold rounded-btn hover:bg-white/30 dark:hover:bg-white/20 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-primary text-primary-content font-semibold rounded-btn shadow-md hover:bg-primary-focus transition-colors disabled:bg-gray-400" disabled={!newPhotoPreview}>
              Save Photo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPhotoModal;