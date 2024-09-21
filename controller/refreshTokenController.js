import jwt from 'jsonwebtoken'
import User from '../model/User.js';

export const refreshToken = async (req, res) => {
    const { token } = req.body;
  
    try {
      if (!token) {
        return res.status(401).json({ message: 'Refresh token is required' });
      }
  
      // Find the user based on the refresh token
      const user = await User.findOne({ refreshToken: token });
      if (!user) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }
  
      // Verify the refresh token
      jwt.verify(token, JWT_SECRET, (err) => {
        if (err) {
          return res.status(403).json({ message: 'Invalid refresh token' });
        }
  
        // Generate a new access token
        const accessToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
          expiresIn: JWT_EXPIRES_IN,
        });
  
        res.json({ accessToken });
      });
    } catch (error) {
      console.error('Error refreshing token:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };