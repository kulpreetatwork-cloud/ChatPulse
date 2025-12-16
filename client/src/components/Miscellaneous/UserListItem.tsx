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
      className="cursor-pointer bg-dark-bg hover:bg-dark-hover w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-xl transition-all border border-transparent hover:border-dark-border group"
    >
      <img
        src={user.pic}
        alt={user.name}
        className="w-10 h-10 rounded-full object-cover border border-dark-border group-hover:border-brand transition"
      />
      <div>
        <p className="text-white text-sm font-medium group-hover:text-brand-light transition">
          {user.name}
        </p>
        <p className="text-xs text-slate-500">
          <b>Email : </b>
          {user.email}
        </p>
      </div>
    </div>
  );
};

export default UserListItem;