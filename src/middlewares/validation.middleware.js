import authConfigs from "../Config/auth.config.js";

export const validateUser = (req, res, next) => {
  // Check for token in cookies or Authorization header
  const token =
    req.cookies["user-token"] ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access - Please login First!",
    });
  }

  const decoded = authConfigs.decodeToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token - Please login Again!",
    });
  }

  // Attach user info to request object
  req.user = {
    email: decoded.email,
    userId: decoded.id,
  };

  next();
};
