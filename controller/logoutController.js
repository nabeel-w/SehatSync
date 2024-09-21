import User from "../model/User.js";

export const logout = async (req, res) => {
    const { token } = req.body;
  
    if (!token) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }
  
    try {
      // Invalidate the refresh token
      await User.findOneAndUpdate({ refreshToken: token }, { refreshToken: null });
  
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Error during logout:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };