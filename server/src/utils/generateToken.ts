import jwt from "jsonwebtoken";
import { Response } from "express";

const generateTokenAndSetCookie = (userId: any, res: Response) => {
  // 1. Create the token
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: "15d", // Token lasts for 15 days
  });

  // 2. Attach token to a secure cookie
  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    sameSite: "strict", // CSRF protection
    secure: process.env.NODE_ENV !== "development", // HTTPS only in production
  });

  return token;
};

export default generateTokenAndSetCookie;
