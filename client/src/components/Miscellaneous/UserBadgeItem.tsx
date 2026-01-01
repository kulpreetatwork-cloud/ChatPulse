import { FaTimes, FaCrown } from "react-icons/fa";

interface User {
  _id: string;
  name: string;
  pic: string;
}

interface UserBadgeItemProps {
  user: User;
  handleFunction: () => void;
  isAdmin?: boolean;
}

const UserBadgeItem = ({ user, handleFunction, isAdmin }: UserBadgeItemProps) => {
  return (
    <div className="inline-flex items-center gap-2 bg-brand/15 text-brand-light pl-1 pr-2 py-1 rounded-full border border-brand/30 group transition-all hover:bg-brand/25">
      <img
        src={user.pic}
        alt={user.name}
        className="w-6 h-6 rounded-full object-cover border border-brand/30"
      />
      <span className="text-xs font-medium max-w-[100px] truncate">
        {user.name}
      </span>
      {isAdmin && (
        <FaCrown className="text-yellow-400" size={10} title="Admin" />
      )}
      <button
        onClick={handleFunction}
        className="p-0.5 hover:bg-brand/30 rounded-full transition"
      >
        <FaTimes size={10} className="text-brand-light hover:text-white" />
      </button>
    </div>
  );
};

export default UserBadgeItem;