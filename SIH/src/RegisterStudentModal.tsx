import React, { useState } from 'react';
import { UploadIcon, CameraIcon } from './icons/Icons';
import CameraCapture from './CameraCapture';

interface RegisterStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (name: string, avatarUrl: string, email: string, rollNo: string) => { success: boolean; message?: string };
}

type PhotoMode = 'upload' | 'camera';

const RegisterStudentModal: React.FC<RegisterStudentModalProps> = ({ isOpen, onClose, onAddStudent }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [error, setError] = useState('');
  const [photoMode, setPhotoMode] = useState<PhotoMode | null>(null);

  const resetForm = () => {
    setName('');
    setEmail('');
    setRollNo('');
    setAvatarUrl('');
    setAvatarPreview('');
    setError('');
    setPhotoMode(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setAvatarUrl(result);
        setPhotoMode(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = (imageDataUrl: string) => {
    setAvatarPreview(imageDataUrl);
    setAvatarUrl(imageDataUrl);
    setPhotoMode(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !rollNo) {
      setError('Please fill in all required fields.');
      return;
    }
    
    // Use a default avatar if none is provided
    const finalAvatarUrl = avatarUrl || `https://picsum.photos/seed/${email}/100/100`;

    const result = onAddStudent(name, finalAvatarUrl, email, rollNo);

    if (result.success) {
      handleClose();
    } else {
      setError(result.message || 'An unknown error occurred.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-box shadow-lg w-full max-w-md p-8 animate-fade-in text-surface-content dark:text-neutral-200 transition-colors duration-300">
        <h2 className="text-2xl font-bold mb-6">Register a New Student</h2>
        
        {photoMode === 'camera' ? (
          <CameraCapture onCapture={handleCapture} onClose={() => setPhotoMode(null)} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img
                  src={avatarPreview || `https://ui-avatars.com/api/?name=${name || '?'}&background=random&size=128`}
                  alt="Avatar Preview"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
                />
                <div className="absolute -bottom-2 -right-2 flex">
                    <label htmlFor="avatar-upload" className="p-2 bg-secondary rounded-l-full text-white cursor-pointer hover:bg-secondary-focus transition-colors">
                        <UploadIcon className="w-5 h-5" />
                        <input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    <button type="button" onClick={() => setPhotoMode('camera')} className="p-2 bg-primary rounded-r-full text-white cursor-pointer hover:bg-primary-focus transition-colors">
                        <CameraIcon className="w-5 h-5" />
                    </button>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-content/80 dark:text-neutral-400 mb-1">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 bg-white/50 border border-white/30 rounded-btn focus:ring-primary focus:border-primary dark:bg-neutral-800 dark:border-white/20 dark:text-white transition-colors duration-300"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-content/80 dark:text-neutral-400 mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 bg-white/50 border border-white/30 rounded-btn focus:ring-primary focus:border-primary dark:bg-neutral-800 dark:border-white/20 dark:text-white transition-colors duration-300"
                required
              />
            </div>
            <div>
              <label htmlFor="rollNo" className="block text-sm font-medium text-neutral-content/80 dark:text-neutral-400 mb-1">Roll Number</label>
              <input
                type="text"
                id="rollNo"
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
                Register Student
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterStudentModal;
