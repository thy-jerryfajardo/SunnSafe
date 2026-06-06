
import React, { useState, useEffect } from 'react';
import { X, User, Trash2, AlertTriangle, Loader2, Save, CheckCircle2, Image } from 'lucide-react';
import { updateProfile, deleteUser } from 'firebase/auth';
import { useAuth } from '../lib/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
      setError(null);
      setSuccessMessage(null);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Update Auth Profile
      await updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL || null
      });

      setSuccessMessage('Profile updated successfully.');
      
      // Auto-close success message after 2s
      setTimeout(() => setSuccessMessage(null), 2000);

    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Delete Auth User
      await deleteUser(user);
      onClose();

    } catch (err: any) {
      console.error('Error deleting account:', err);
      if (err.code === 'auth/requires-recent-login') {
          setError('For security, please sign out and sign in again before deleting your account.');
      } else {
          setError('Failed to delete account. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 sm:px-8 py-4 sm:py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
             <User size={18} className="text-slate-500" />
             Edit Profile
           </h2>
           <button
             onClick={onClose}
             className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all hover:-translate-y-1 hover:scale-105 active:scale-95"
           >
             <X size={18} />
           </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium flex items-center gap-2">
                    <AlertTriangle size={14} />
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-900 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    {successMessage}
                </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 sm:space-y-6">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1">Full Name</label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-yellow-600 focus:ring-4 focus:ring-yellow-600/10 outline-none transition-all text-sm"
                        placeholder="John Doe"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1">Avatar URL</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={photoURL}
                            onChange={(e) => setPhotoURL(e.target.value)}
                            className="w-full px-4 py-2.5 pl-10 rounded-lg border border-slate-200 focus:border-red-900 focus:ring-4 focus:ring-red-900/10 outline-none transition-all text-sm"
                            placeholder="https://example.com/avatar.jpg"
                        />
                        <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1">Email Address</label>
                    <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed text-sm"
                    />
                    <p className="text-[10px] text-slate-400 ml-1">Email cannot be changed.</p>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 rounded-lg bg-yellow-600 text-white font-bold text-sm hover:bg-yellow-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 hover:-translate-y-1 hover:scale-105 active:scale-95 shadow-lg shadow-yellow-600/20"
                    >
                        {isLoading && !showDeleteConfirm ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />}
                        Save Changes
                    </button>
                </div>
            </form>

            <div className="my-6 border-t border-slate-100" />

            <div className="rounded-lg border border-red-100 bg-red-50 p-4 sm:p-6">
                <h3 className="text-sm font-bold text-red-900 mb-1">Danger Zone</h3>
                <p className="text-xs text-red-600 mb-4">
                    Deleting your account will permanently remove all your data and access. This action cannot be undone.
                </p>

                {showDeleteConfirm ? (
                    <div className="space-y-2">
                        <button
                            onClick={handleDeleteAccount}
                            disabled={isLoading}
                            className="w-full py-2.5 rounded-lg bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-1 hover:scale-105 active:scale-95"
                        >
                            {isLoading ? <Loader2 className="animate-spin w-3 h-3" /> : <Trash2 size={14} />}
                            Confirm Delete My Account
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="w-full py-2.5 rounded-lg bg-white border-2 border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-all duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2.5 rounded-lg border-2 border-red-200 text-red-600 font-semibold text-xs hover:bg-red-100 hover:border-red-300 transition-all duration-300 flex items-center gap-2 hover:-translate-y-1 hover:scale-105 active:scale-95"
                    >
                        <Trash2 size={14} />
                        Delete Account
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
