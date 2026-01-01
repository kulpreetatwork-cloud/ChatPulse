import type { ReactNode } from "react";
import { FaTimes, FaEnvelope } from "react-icons/fa";

interface ProfileModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  children?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ user, children, isOpen, onClose }: ProfileModalProps) => {
  if (!isOpen) return <>{children}</>;
  if (!user) return null;

  return (
    <>
      {children}
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          className="bg-dark-surface w-full max-w-sm rounded-2xl border border-dark-border shadow-premium overflow-hidden animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient Header Background */}
          <div className="h-24 bg-gradient-to-br from-brand via-accent-purple to-accent-cyan relative">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 bg-black/20 hover:bg-black/40 text-white/80 hover:text-white rounded-lg transition"
            >
              <FaTimes size={14} />
            </button>
          </div>

          {/* Avatar - Overlapping Header */}
          <div className="relative flex justify-center -mt-14">
            <div className="p-1 bg-dark-surface rounded-2xl">
              <img
                className="w-24 h-24 rounded-xl object-cover border-2 border-dark-border"
                src={user.pic}
                alt={user.name}
              />
            </div>
          </div>

          {/* User Info */}
          <div className="p-6 pt-4 text-center">
            <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>

            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm mb-6">
              <FaEnvelope className="text-brand" size={12} />
              <span>{user.email}</span>
            </div>

            {/* Stats or Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-brand hover:bg-brand-hover text-white font-semibold py-3 rounded-xl transition shadow-glow"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileModal;