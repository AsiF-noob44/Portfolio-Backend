import User from "../Models/user.model.js";
import authConfigs from "../Config/auth.config.js";
import bcrypt from "bcrypt";

//? Register
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate email format
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: "Invalid email format",
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username";
      return res.status(409).json({
        message: `User with this ${field} already exists`,
      });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error registering user:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation error",
        errors: messages,
      });
    }

    // Handle duplicate key errors (11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        message: `User with this ${field} already exists`,
      });
    }

    res.status(500).json({
      message: "Server error while registering user",
      error: error.message,
    });
  }
};

//? Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = authConfigs.encodeToken(user.email, user._id.toString());

    res.cookie("user-token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({
      success: false,
      message: "Server error while logging in user",
      error: error.message,
    });
  }
};

//? Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password") // Exclude password from results
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

//? Logout
export const logoutUser = async (req, res) => {
  try {
    // Clear the cookie
    res.clearCookie("user-token", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({
      success: false,
      message: "Error logging out",
      error: error.message,
    });
  }
};

//? Update User
export const updateUser = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware
    const { username, email, currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate email format
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }

      // Check if email already exists (excluding current user)
      const existingUser = await User.findOne({
        email,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    // Check if username already exists (excluding current user)
    if (username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Username already in use",
        });
      }
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to set new password",
        });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Validate new password length
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters long",
        });
      }

      user.password = newPassword; // Will be hashed by pre-save hook
    }

    // Update other fields
    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();

    // Return updated user without password
    const updatedUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};
