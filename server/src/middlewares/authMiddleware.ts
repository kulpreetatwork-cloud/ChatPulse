import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/userModel";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // 1. CHECK HEADERS (This is what your React App uses!)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

      req.user = await User.findById(decoded.id).select("-password");

      next();
      return; // Exit here if successful
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
      return;
    }
  }

  // 2. CHECK COOKIES (Fallback)
  if (!token && req.cookies && req.cookies.jwt) {
      try {
        token = req.cookies.jwt;
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = await User.findById(decoded.id).select("-password");
        next();
        return;
      } catch (error) {
        res.status(401).json({ message: "Not authorized, token failed" });
        return;
      }
  }

  // 3. IF NO TOKEN FOUND ANYWHERE
  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export default protect;