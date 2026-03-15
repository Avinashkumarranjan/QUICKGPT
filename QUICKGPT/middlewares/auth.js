import jwt from "jsonwebtoken";
import User from "../models/User.js"

export const protect = async (req, res, next) => {
    let token = req.headers.authorization;

    // ✅ Check if token exists first
    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }

    // ✅ Handle "Bearer <token>" format
    if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const user = await User.findById(userId).select("-password"); // ✅ exclude password
        
        if (!user) {
            return res.status(401).json({ success: false, message: "Not authorized, user not found" });
        }

        req.user = user;
        next(); // ✅ proceed to the actual route handler

    } catch (error) {
        return res.status(401).json({ success: false, message: "Not authorized, token failed", error: error.message });
    }
}