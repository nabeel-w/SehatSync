import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../index.js'; // Adjust the import to your app's entry point
import User from '../model/User.js';
import jwt from 'jsonwebtoken';
import { connectDb, disconnectDb } from '../utils/db.js';
import { config } from 'dotenv';
config();

// Connect to the test database before running tests
const email = "john@gmail.com";
const password = "StrongPass123!";

beforeAll(async () => {
    await connectDb(true);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a test user
    const user = new User({
        name: 'TestUser',
        email,
        password: hashedPassword,
    });
    await user.save();
});

// Disconnect from the database after all tests
afterAll(async () => {
    await User.deleteMany({});
    await disconnectDb();
});

describe('Refresh Token Controller', () => {
    let refreshToken;

    beforeEach(async () => {


        // Log in the user to get a valid refresh token
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({
                email: email, // Use a valid username
                password: password // Use a valid password
            });

        // Extract the refresh token from the login response
        refreshToken = loginResponse.body.refreshToken;
    });

    it('should return 401 if no refresh token is provided', async () => {
        const response = await request(app)
            .post('/auth/refresh-token') // Adjust the endpoint as necessary
            .send({});

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Refresh token is required');
    });

    it('should return 403 if the refresh token is invalid', async () => {
        const response = await request(app)
            .post('/auth/refresh-token') // Adjust the endpoint as necessary
            .send({ token: 'invalidToken' });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Invalid refresh token');
    });

    it('should return a new access token if the refresh token is valid', async () => {
        const response = await request(app)
            .post('/auth/refresh-token') // Adjust the endpoint as necessary
            .send({ token: refreshToken });

        expect(response.status).toBe(200);
        expect(response.body.accessToken).toBeDefined();
        // Optionally, verify the new access token
        const decoded = jwt.verify(response.body.accessToken, process.env.JWT_SECRET);
        expect(decoded.userId).toBeDefined(); // Check for the user ID
    });

    it('should return 403 if the refresh token does not belong to any user', async () => {
        await User.deleteMany({}); // Clear users to simulate invalid token case

        const response = await request(app)
            .post('/auth/refresh-token') // Adjust the endpoint as necessary
            .send({ token: refreshToken });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Invalid refresh token');
    });
});
