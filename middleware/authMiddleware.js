import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
config();

const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is set in your environment variables

const authMiddleware = (req, res, next) => {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader

    if (!token) {
        return res.status(401).json({ message: 'Access token is required' });
    }

    // Verify the token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid access token' });
        }

        // Attach the user information to the request object
        req.user = user; // user contains the payload data from the token
        next(); // Proceed to the next middleware or route handler
    });
};

export default authMiddleware;
