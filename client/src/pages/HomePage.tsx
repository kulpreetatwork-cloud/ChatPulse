import { useState } from "react";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import { FaComments, FaShieldAlt, FaBolt, FaUsers } from "react-icons/fa";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 py-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand/20 rounded-full blur-[120px] animate-float-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-accent-purple/15 rounded-full blur-[150px] animate-float-slow animate-delay-300" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent-cyan/10 rounded-full blur-[100px] animate-pulse-glow" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">

        {/* Left Side - Hero Content */}
        <div className="flex-1 text-center lg:text-left stagger-children">
          {/* Logo */}
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-accent-purple flex items-center justify-center shadow-glow-lg">
              <FaComments className="text-2xl text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold gradient-text">ChatPulse</h1>
          </div>

          {/* Tagline */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Connect Instantly.<br />
            <span className="text-slate-400">Communicate Seamlessly.</span>
          </h2>

          <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto lg:mx-0">
            Experience real-time messaging with a modern, secure, and beautiful chat platform designed for the future.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            <div className="flex items-center gap-2 bg-dark-surface/80 border border-dark-border px-4 py-2 rounded-full text-sm text-slate-300">
              <FaBolt className="text-accent-cyan" />
              Real-time Messaging
            </div>
            <div className="flex items-center gap-2 bg-dark-surface/80 border border-dark-border px-4 py-2 rounded-full text-sm text-slate-300">
              <FaShieldAlt className="text-accent-emerald" />
              Secure & Private
            </div>
            <div className="flex items-center gap-2 bg-dark-surface/80 border border-dark-border px-4 py-2 rounded-full text-sm text-slate-300">
              <FaUsers className="text-accent-purple" />
              Group Chats
            </div>
          </div>
        </div>

        {/* Right Side - Auth Card */}
        <div className="w-full max-w-md animate-fade-in-up animate-delay-200">
          <div className="glass-card rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-4 text-center border-b border-dark-border/50">
              <h3 className="text-xl font-bold text-white">
                {activeTab === "login" ? "Welcome Back" : "Create Account"}
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                {activeTab === "login"
                  ? "Sign in to continue to ChatPulse"
                  : "Join the conversation today"}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex p-2 mx-4 mt-4 bg-dark-bg/50 rounded-xl">
              <button
                onClick={() => setActiveTab("login")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === "login"
                    ? "bg-brand text-white shadow-lg shadow-brand/25"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab("signup")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === "signup"
                    ? "bg-brand text-white shadow-lg shadow-brand/25"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                Sign Up
              </button>
            </div>

            {/* Content Area with Animation */}
            <div className="p-6 pt-4">
              <div key={activeTab} className="animate-fade-in">
                {activeTab === "login" ? <Login /> : <Signup />}
              </div>
            </div>
          </div>

          {/* Footer Text */}
          <p className="text-center text-slate-500 text-xs mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-4 left-4 text-slate-600 text-xs hidden lg:block">
        © 2026 ChatPulse. Built with ❤️
      </div>
    </div>
  );
};

export default HomePage;