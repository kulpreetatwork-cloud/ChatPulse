import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useChatStore from "../../store/chatStore"; 

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useChatStore(); 

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

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
      
      const { data } = await axios.post(
        "/api/user/login",
        formData,
        config
      );

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

  return (
    <div className="flex flex-col gap-4">
        {/* Email Field */}
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <input
                type="email"
                name="email"
                value={formData.email} 
                placeholder="Enter your email"
                className="bg-dark-bg border border-dark-border rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
                onChange={handleChange}
            />
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <input
                type="password"
                name="password"
                value={formData.password}
                placeholder="Enter your password"
                className="bg-dark-bg border border-dark-border rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
                onChange={handleChange}
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                }}
            />
        </div>

        {/* Login Button */}
        <button
            onClick={handleSubmit}
            disabled={loading}
            className={`mt-4 w-full bg-brand hover:bg-brand-hover text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg transform hover:-translate-y-1 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
            {loading ? "Logging in..." : "Login"}
        </button>
        
        {/* Guest Button */}
        <button
            onClick={() => {
                setFormData({ email: "guest@example.com", password: "123" });
                toast("Filled with Guest Credentials", { icon: "👻" });
            }}
            className="w-full bg-dark-hover hover:bg-dark-border text-slate-200 font-semibold py-2 rounded-lg transition-all border border-dark-border"
        >
            Get Guest Credentials
        </button>
    </div>
  );
};

export default Login;