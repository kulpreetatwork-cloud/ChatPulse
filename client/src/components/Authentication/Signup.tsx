import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useChatStore from "../../store/chatStore";

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
  const [pic, setPic] = useState<string>(); // Store the URL here
  const [loading, setLoading] = useState(false);
  const [picLoading, setPicLoading] = useState(false);

  // Handle Text Inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image Upload (The new part)
  const postDetails = async (pics: FileList | null) => {
    setPicLoading(true);
    
    if (!pics || pics.length === 0) {
        toast.error("Please select an image");
        setPicLoading(false);
        return;
    }

    const file = pics[0];

    if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg") {
        try {
            const data = new FormData();
            data.append("image", file); // Must match backend 'upload.single("image")'

            // Send to our Backend Upload Proxy
            const config = { headers: { "Content-type": "multipart/form-data" } };
            const response = await axios.post("/api/upload", data, config);
            
            setPic(response.data.url); // Save the Cloudinary URL
            setPicLoading(false);
            toast.success("Image Uploaded Successfully");

        } catch (error) {
            console.error(error);
            toast.error("Image upload failed");
            setPicLoading(false);
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
            pic: pic, // Send the image URL to the database
        },
        config
      );

      toast.success("Registration Successful! Welcome.");
      
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data); // Sync state immediately
      
      setLoading(false);
      navigate("/chats");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response?.data.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
        {/* Name Field */}
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">Name</label>
            <input
                type="text"
                name="name"
                placeholder="Enter your name"
                className="bg-dark-bg border border-dark-border rounded-lg p-2.5 text-white focus:ring-2 focus:ring-brand outline-none transition"
                onChange={handleChange}
            />
        </div>

        {/* Email Field */}
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="bg-dark-bg border border-dark-border rounded-lg p-2.5 text-white focus:ring-2 focus:ring-brand outline-none transition"
                onChange={handleChange}
            />
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <input
                type="password"
                name="password"
                placeholder="Create a password"
                className="bg-dark-bg border border-dark-border rounded-lg p-2.5 text-white focus:ring-2 focus:ring-brand outline-none transition"
                onChange={handleChange}
            />
        </div>

        {/* Confirm Password Field */}
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">Confirm Password</label>
            <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                className="bg-dark-bg border border-dark-border rounded-lg p-2.5 text-white focus:ring-2 focus:ring-brand outline-none transition"
                onChange={handleChange}
            />
        </div>

        {/* --- IMAGE UPLOAD FIELD --- */}
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">Profile Picture (Optional)</label>
            <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-slate-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-brand file:text-white
                  hover:file:bg-brand-hover
                  cursor-pointer bg-dark-bg rounded-lg border border-dark-border"
                onChange={(e) => postDetails(e.target.files)}
            />
            {picLoading && <p className="text-xs text-brand-light animate-pulse mt-1">Uploading image...</p>}
        </div>

        {/* Submit Button */}
        <button
            onClick={handleSubmit}
            disabled={loading || picLoading} // Disable if submitting OR uploading image
            className={`mt-4 w-full bg-brand hover:bg-brand-hover text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg transform hover:-translate-y-1 ${loading || picLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
            {loading ? "Creating Account..." : "Sign Up"}
        </button>
    </div>
  );
};

export default Signup;