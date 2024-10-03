import request from 'supertest';
import app from '../index.js'; // Import your Express app
import User from '../model/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { connectDb, disconnectDb } from '../utils/db.js';
config();

beforeAll(async () => {
    await connectDb(true);
    await User.deleteMany({});
});

afterAll(async () => {
    await User.deleteMany({});
    await disconnectDb();
});

describe('Admin Signin', () => {

    let adminUser;

    beforeEach(async () => {
        // Create a hashed password for testing
        const hashedPassword = await bcrypt.hash('StrongPassword123!', 10);

        // Create a mock admin user
        adminUser = new User({
            name: 'Admin',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'Admin',
        });

        await adminUser.save();
    });

    afterEach(async () => {
        // Clean up database between tests
        await User.deleteMany({});
    });

    it('should log in successfully with valid credentials', async () => {
        const response = await request(app)
            .post('/admin/login')
            .send({
                email: 'admin@example.com',
                password: 'StrongPassword123!'
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User logged in successfully');
        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');

        // Verify the token
        const decodedAccessToken = jwt.verify(response.body.accessToken, process.env.JWT_SECRET);
        expect(decodedAccessToken.email).toBe(adminUser.email);
        expect(decodedAccessToken.role).toBe('Admin');
    });

    it('should return 400 if the email is invalid', async () => {
        const response = await request(app)
            .post('/admin/login')
            .send({
                email: 'invalid@example.com',
                password: 'StrongPassword123!'
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return 401 if the user is not an admin', async () => {
        // Create a non-admin user
        const nonAdminUser = new User({
            name: 'Not Admin',
            email: 'user@example.com',
            password: await bcrypt.hash('StrongPassword123!', 10),
            role: 'User'
        });

        await nonAdminUser.save();

        const response = await request(app)
            .post('/admin/login')
            .send({
                email: 'user@example.com',
                password: 'StrongPassword123!'
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("User isn't an Admin");
    });

    it('should return 400 if the password is incorrect', async () => {
        const response = await request(app)
            .post('/admin/login')
            .send({
                email: 'admin@example.com',
                password: 'WrongPassword123!'
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid email or password');
    });

});
