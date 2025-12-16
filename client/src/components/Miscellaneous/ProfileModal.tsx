import type { ReactNode } from "react";
import { AiOutlineClose } from "react-icons/ai";

interface ProfileModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  children?: ReactNode; // The element that triggers the modal (e.g., an Eye icon)
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ user, children, isOpen, onClose }: ProfileModalProps) => {
  if (!isOpen) return <>{children}</>;

  return (
    <>
      {children}
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        {/* Modal Content */}
        <div className="bg-slate-800 border border-slate-700 w-full max-w-md p-6 rounded-xl shadow-2xl relative flex flex-col items-center">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
          >
            <AiOutlineClose size={24} />
          </button>

          {/* User Details */}
          <h2 className="text-3xl font-bold text-white mb-6 font-sans">
            {user.name}
          </h2>
          
          <img
            className="rounded-full w-40 h-40 border-4 border-indigo-500 mb-6 object-cover"
            src={user.pic}
            alt={user.name}
          />
          
          <p className="text-xl text-slate-300 tracking-wide">
            Email: <span className="text-indigo-400">{user.email}</span>
          </p>

          <div className="mt-8 flex justify-end w-full">
            <button
                onClick={onClose}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition"
            >
                Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileModal;