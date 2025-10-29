import User from "../Models/user.model.js";

// Register
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
