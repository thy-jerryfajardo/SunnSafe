
import React from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 sm:px-8 py-4 sm:py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <h3 className="font-bold text-slate-900 flex items-center gap-2">
             <div className="p-1.5 bg-yellow-100 rounded-lg">
                <Sparkles className="w-4 h-4 text-yellow-600" />
             </div>
             Upgrade your plan
           </h3>
           <button
             onClick={onClose}
             className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all hover:-translate-y-1 hover:scale-105 active:scale-95"
           >
             <X size={18} />
           </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
           <p className="text-slate-600 mb-6 leading-relaxed text-sm sm:text-base">
             Free plan allows up to <span className="font-bold text-slate-900">5 files</span>. Upgrade your workspace to unlock more storage, advanced security features, and unlimited uploads.
           </p>

           <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                 <CheckCircle2 className="w-4 h-4 text-yellow-600" />
                 <span>Unlimited file storage</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                 <CheckCircle2 className="w-4 h-4 text-yellow-600" />
                 <span>Priority support</span>
              </div>
           </div>

           <div className="flex gap-3">
             <button
               onClick={onClose}
               className="flex-1 py-2.5 rounded-lg border-2 border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95"
             >
               Close
             </button>
             <button
               onClick={onClose}
               className="flex-1 py-2.5 rounded-lg bg-yellow-600 text-white font-bold text-sm hover:bg-yellow-700 transition-all duration-300 shadow-lg shadow-yellow-600/20 hover:-translate-y-1 hover:scale-105 active:scale-95"
             >
               Learn More
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
