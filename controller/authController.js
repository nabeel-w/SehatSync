// controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../model/User.js'; // Adjust the path if necessary
import { config } from 'dotenv';
config();

const JWT_SECRET = process.env.JWT_SECRET;


export const signUp = async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ message: 'User already exists' });
  }

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Generate Access Token
    const accessToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    // Generate Refresh Token
    const refreshToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '30d',
    });

    user.refreshToken = refreshToken
    await user.save();

    // Send the JWT token
    res.status(201).json({ message: 'User registered successfully', accessToken, refreshToken });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    else if (!user.password) {
      return res.status(400).json({ message: 'User registered with Google' });
    }

    // Check password validity
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate Access Token
    const accessToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Generate Refresh Token
    const refreshToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    // Store refresh token in user document
    user.refreshToken = refreshToken;
    await user.save();

    // Send the JWT token
    res.json({ message: 'User logged in successfully', accessToken, refreshToken });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
