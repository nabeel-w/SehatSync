import { OAuth2Client } from 'google-auth-library';
import { config } from 'dotenv';
config();
import jwt from 'jsonwebtoken';
import User from '../model/User.js';

// Initialize the Google OAuth2 client
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Controller functions
export const googleLogin = (req, res) => {
  // Generate an authorization URL
  const url = client.generateAuthUrl({
    access_type: 'offline', // gets a refresh token
    scope: ['profile', 'email'], // scopes for profile and email
  });
  // Redirect user to Google's OAuth 2.0 consent screen
  res.redirect(url);
};

export const googleCallback = async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    // Exchange the authorization code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Get user information
    const userInfo = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID,
    });

    const payload = userInfo.getPayload();

    // Handle user information (e.g., create or find user in database)
    let user = await User.findOne({ googleId: payload.sub });
    const emailClash = await User.findOne({ email: payload.email })
    if(emailClash) return res.status(401).json({ message: "User Already Exists" })
    if (!user) {
      // If user does not exist, create a new user
      user = new User({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      });
    }
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

    res.json({
      message: 'User authenticated successfully',
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).send('Authentication failed');
  }
};
