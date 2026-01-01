import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useChatStore from "../../store/chatStore";
import { FaUser, FaEnvelope, FaLock, FaCamera, FaSpinner, FaCheck } from "react-icons/fa";

const Signup = () => {
    const navigate = useNavigate();
    const { setUser } = useChatStore();

    // State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [pic, setPic] = useState<string>();
    const [picPreview, setPicPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [picLoading, setPicLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Password Strength Calculator
    const getPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(formData.password);
    const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-400", "bg-emerald-500"];

    // Handle Text Inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle Image Upload
    const postDetails = async (pics: FileList | null) => {
        setPicLoading(true);

        if (!pics || pics.length === 0) {
            toast.error("Please select an image");
            setPicLoading(false);
            return;
        }

        const file = pics[0];

        if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg") {
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPicPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            try {
                const data = new FormData();
                data.append("image", file);

                const config = { headers: { "Content-type": "multipart/form-data" } };
                const response = await axios.post("/api/upload", data, config);

                setPic(response.data.url);
                setPicLoading(false);
                toast.success("Image uploaded!");

            } catch (error) {
                console.error(error);
                toast.error("Image upload failed");
                setPicLoading(false);
                setPicPreview(null);
            }
        } else {
            toast.error("Please select a JPEG or PNG image");
            setPicLoading(false);
        }
    };

    // Handle Form Submission
    const handleSubmit = async () => {
        setLoading(true);

        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            toast.error("Please fill all the fields");
            setLoading(false);
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const config = { headers: { "Content-type": "application/json" } };

            const { data } = await axios.post(
                "/api/user",
                {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    pic: pic,
                },
                config
            );

            toast.success("Welcome to ChatPulse!");

            localStorage.setItem("userInfo", JSON.stringify(data));
            setUser(data);

            setLoading(false);
            navigate("/chats");

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.response?.data.message || "Something went wrong");
            setLoading(false);
        }
    };

    const isFieldActive = (field: string) => {
        return focusedField === field || formData[field as keyof typeof formData];
    };

    const inputBaseClass = "w-full bg-dark-bg border rounded-xl p-3.5 pl-11 text-white text-sm placeholder-slate-500 outline-none transition-all duration-300 caret-brand";

    return (
        <div className="flex flex-col gap-4">
            {/* Profile Picture Upload */}
            <div className="flex justify-center mb-2">
                <label className="relative cursor-pointer group">
                    <div
                        className={`w-20 h-20 rounded-full border-2 border-dashed transition-all duration-300 flex items-center justify-center overflow-hidden ${picPreview ? "border-brand" : "border-dark-border hover:border-brand/50"
                            }`}
                    >
                        {picPreview ? (
                            <img
                                src={picPreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex flex-col items-center text-slate-500 group-hover:text-brand transition-colors">
                                <FaCamera size={20} />
                                <span className="text-[10px] mt-1">Add Photo</span>
                            </div>
                        )}

                        {picLoading && (
                            <div className="absolute inset-0 bg-dark-bg/80 flex items-center justify-center rounded-full">
                                <FaSpinner className="animate-spin text-brand" size={24} />
                            </div>
                        )}

                        {pic && !picLoading && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent-emerald rounded-full flex items-center justify-center border-2 border-dark-surface">
                                <FaCheck size={10} className="text-white" />
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => postDetails(e.target.files)}
                    />
                </label>
            </div>

            {/* Name Field */}
            <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${isFieldActive("name") ? "text-brand" : "text-slate-500"}`}>
                    <FaUser size={15} />
                </div>
                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    className={`${inputBaseClass} ${isFieldActive("name") ? "border-brand ring-2 ring-brand/20" : "border-dark-border hover:border-dark-muted"}`}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                />
            </div>

            {/* Email Field */}
            <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${isFieldActive("email") ? "text-brand" : "text-slate-500"}`}>
                    <FaEnvelope size={15} />
                </div>
                <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    className={`${inputBaseClass} ${isFieldActive("email") ? "border-brand ring-2 ring-brand/20" : "border-dark-border hover:border-dark-muted"}`}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
                <div className="relative">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${isFieldActive("password") ? "text-brand" : "text-slate-500"}`}>
                        <FaLock size={15} />
                    </div>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        className={`${inputBaseClass} ${isFieldActive("password") ? "border-brand ring-2 ring-brand/20" : "border-dark-border hover:border-dark-muted"}`}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                    />
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                    <div className="space-y-1 px-1 animate-fade-in">
                        <div className="flex gap-1">
                            {[0, 1, 2, 3, 4].map((index) => (
                                <div
                                    key={index}
                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${index < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-dark-border"
                                        }`}
                                />
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-500">
                            Password strength:{" "}
                            <span className={passwordStrength <= 2 ? "text-orange-400" : "text-accent-emerald"}>
                                {strengthLabels[passwordStrength - 1] || "Too Short"}
                            </span>
                        </p>
                    </div>
                )}
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${isFieldActive("confirmPassword") ? "text-brand" : "text-slate-500"}`}>
                    <FaLock size={15} />
                </div>
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    className={`${inputBaseClass} ${isFieldActive("confirmPassword") ? "border-brand ring-2 ring-brand/20" : "border-dark-border hover:border-dark-muted"}`}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-accent-emerald">
                        <FaCheck size={14} />
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={loading || picLoading}
                className={`mt-2 w-full bg-gradient-to-r from-brand to-accent-purple text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-glow transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 ${loading || picLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
            >
                {loading ? (
                    <>
                        <FaSpinner className="animate-spin" />
                        <span>Creating Account...</span>
                    </>
                ) : (
                    "Create Account"
                )}
            </button>
        </div>
    );
};

export default Signup;