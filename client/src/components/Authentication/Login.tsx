import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useChatStore from "../../store/chatStore";
import { FaEnvelope, FaLock, FaSpinner } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useChatStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);

    if (!formData.email || !formData.password) {
      toast.error("Please fill all the fields");
      setLoading(false);
      return;
    }

    try {
      const config = { headers: { "Content-type": "application/json" } };

      const { data } = await axios.post("/api/user/login", formData, config);

      toast.success("Login Successful");

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);

      setLoading(false);
      navigate("/chats");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response?.data.message || "Invalid Email or Password");
      setLoading(false);
    }
  };

  const isFieldActive = (field: string) => {
    return focusedField === field || formData[field as keyof typeof formData];
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Email Field */}
      <div className="relative">
        <div
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${isFieldActive("email")
            ? "text-brand"
            : "text-slate-500"
            }`}
        >
          <FaEnvelope size={16} />
        </div>
        <input
          type="email"
          name="email"
          value={formData.email}
          placeholder="Email Address"
          className={`w-full bg-dark-bg border rounded-xl p-4 pl-12 text-white placeholder-slate-500 outline-none transition-all duration-300 caret-brand ${isFieldActive("email")
            ? "border-brand ring-2 ring-brand/20"
            : "border-dark-border hover:border-dark-muted"
            }`}
          onChange={handleChange}
          onFocus={() => setFocusedField("email")}
          onBlur={() => setFocusedField(null)}
        />
      </div>

      {/* Password Field */}
      <div className="relative">
        <div
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${isFieldActive("password")
            ? "text-brand"
            : "text-slate-500"
            }`}
        >
          <FaLock size={16} />
        </div>
        <input
          type="password"
          name="password"
          value={formData.password}
          placeholder="Password"
          className={`w-full bg-dark-bg border rounded-xl p-4 pl-12 text-white placeholder-slate-500 outline-none transition-all duration-300 caret-brand ${isFieldActive("password")
            ? "border-brand ring-2 ring-brand/20"
            : "border-dark-border hover:border-dark-muted"
            }`}
          onChange={handleChange}
          onFocus={() => setFocusedField("password")}
          onBlur={() => setFocusedField(null)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
      </div>

      {/* Login Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`mt-2 w-full bg-gradient-to-r from-brand to-brand-hover text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-glow transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
      >
        {loading ? (
          <>
            <FaSpinner className="animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          "Sign In"
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-1">
        <div className="flex-1 h-px bg-dark-border" />
        <span className="text-slate-500 text-sm">or</span>
        <div className="flex-1 h-px bg-dark-border" />
      </div>

      {/* Guest Button */}
      <button
        onClick={() => {
          setFormData({ email: "guest@example.com", password: "123" });
          toast("Guest credentials filled!", { icon: "👻" });
        }}
        className="w-full bg-dark-hover hover:bg-dark-muted text-slate-300 font-semibold py-3 rounded-xl transition-all duration-300 border border-dark-border hover:border-brand/30"
      >
        Try as Guest
      </button>
    </div>
  );
};

export default Login;