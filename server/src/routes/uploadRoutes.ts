import express from "express";
import multer from "multer";
import cloudinary from "../utils/cloudinary";
import fs from "fs";

const router = express.Router();

// Configure Multer to save files temporarily
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), async (req: any, res: any) => {
  try {
    // 1. Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "chatpulse", // Folder name in Cloudinary
    });

    // 2. Delete the temp file from server to save space
    fs.unlinkSync(req.file.path);

    // 3. Return the secure URL to the frontend
    res.json({
        url: result.secure_url,
        public_id: result.public_id
    });
    
  } catch (error) {
    res.status(500).json({ message: "Image upload failed" });
  }
});

export default router;