import { useState } from "react";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-xl bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
        {/* Header / Logo Area */}
        <div className="p-8 text-center bg-slate-800 border-b border-slate-700">
          <h1 className="text-4xl font-bold text-indigo-500 mb-2">ChatPulse</h1>
          <p className="text-slate-400">Connect with the world instantly.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex w-full bg-slate-900/50 p-2">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "login"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "signup"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {activeTab === "login" ? <Login /> : <Signup />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;