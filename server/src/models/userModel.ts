import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// 1. Define the Interface (For TypeScript)
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  pic: string;
  isOnline: boolean;
  lastSeen: Date;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
}

// 2. Define the Schema (For MongoDB)
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pic: {
      type: String,
      required: true,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  }
);

// 3. Encrypt password before saving
userSchema.pre("save", async function () {
  // If password is not modified, simply return to exit the function
  if (!this.isModified("password")) {
    return;
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 4. Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;