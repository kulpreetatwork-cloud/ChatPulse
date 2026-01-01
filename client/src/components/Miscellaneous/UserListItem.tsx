interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
}

interface UserListItemProps {
  user: User;
  handleFunction: () => void;
}

const UserListItem = ({ user, handleFunction }: UserListItemProps) => {
  return (
    <div
      onClick={handleFunction}
      className="flex items-center gap-3 bg-dark-bg hover:bg-dark-hover p-3 rounded-xl cursor-pointer transition-all border border-transparent hover:border-brand/30 group"
    >
      <img
        src={user.pic}
        alt={user.name}
        className="w-10 h-10 rounded-xl object-cover border border-dark-border group-hover:border-brand/50 transition"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white group-hover:text-brand-light transition truncate">
          {user.name}
        </p>
        <p className="text-xs text-slate-500 truncate">{user.email}</p>
      </div>
    </div>
  );
};

export default UserListItem;