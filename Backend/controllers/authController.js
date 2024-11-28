const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const createAuthToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        success: false,
        error: "Registration failed. Email is already in use.",
      });
    }

    const newUser = await User.create({ name, email, password });

    const authToken = createAuthToken(newUser._id);

    res.status(201).json({
      success: true,
      message: "User registration successful.",
      data: {
        user: { id: newUser._id, name: newUser.name, email: newUser.email },
        token: authToken,
      },
    });
  } catch (err) {
    console.error("Error during user registration:", err.message);
    res.status(500).json({
      success: false,
      error: "An internal server error occurred. Please try again.",
    });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email }).select("+password");
    if (!existingUser) {
      return res.status(401).json({
        success: false,
        error: "Login failed. Email or password is incorrect.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        error: "Login failed. Email or password is incorrect.",
      });
    }

    const authToken = createAuthToken(existingUser._id);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
        },
        token: authToken,
      },
    });
  } catch (err) {
    console.error("Error during user login:", err.message);
    res.status(500).json({
      success: false,
      error: "An internal server error occurred. Please try again.",
    });
  }
};
