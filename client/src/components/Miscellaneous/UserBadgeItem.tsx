import { FaTimes } from "react-icons/fa";

interface User {
  _id: string;
  name: string;
}

interface UserBadgeItemProps {
  user: User;
  handleFunction: () => void;
}

const UserBadgeItem = ({ user, handleFunction }: UserBadgeItemProps) => {
  return (
    <div
      className="px-3 py-1 rounded-full m-1 mb-2 bg-brand/20 border border-brand/50 text-brand-light cursor-pointer flex items-center gap-2 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 transition-all text-sm font-medium"
      onClick={handleFunction}
    >
      {user.name}
      <FaTimes className="text-xs" />
    </div>
  );
};

export default UserBadgeItem;