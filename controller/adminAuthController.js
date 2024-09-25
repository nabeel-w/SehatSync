import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../model/User.js';
import { config } from 'dotenv';
config();

const JWT_SECRET = process.env.JWT_SECRET;

export const adminSignin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        else if (user.role !== 'Admin') {
            return res.status(401).json({ message: "User isn't an Admin" })
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate Access Token
        const accessToken = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        // Generate Refresh Token
        const refreshToken = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, {
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        });

        // Store refresh token in user document
        user.refreshToken = refreshToken;
        await user.save();

        // Send the JWT token
        res.json({ message: 'User logged in successfully', accessToken, refreshToken });

    }
    catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}