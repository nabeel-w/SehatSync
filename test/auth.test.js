import request from 'supertest';
import app from '../index.js'; // Import your Express app
import { connectDb, disconnectDb } from '../utils/db.js';

beforeAll(async ()=>{
  connectDb();
})

afterAll(async () =>{
  await disconnectDb();
})


describe('Auth Routes', () => {
  describe('POST /auth/signup', () => {
    test('should successfully register a user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'StrongPass123!',
      };

      const response = await request(app)
        .post('/auth/signup')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    test('should return 400 if name is less than 3 characters', async () => {
      const userData = {
        name: 'Jo',
        email: 'john@example.com',
        password: 'StrongPass123!',
      };

      const response = await request(app)
        .post('/auth/signup')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Name should have a minimum length of 3');
    });

    test('should return 400 if email is invalid', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalidEmail',
        password: 'StrongPass123!',
      };

      const response = await request(app)
        .post('/auth/signup')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Please enter a valid email address');
    });

    test('should return 400 if password is less than 6 characters', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123',
      };

      const response = await request(app)
        .post('/auth/signup')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Password should have a minimum length of 6');
    });

    test('should return 400 if user already exists', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'StrongPass123!',
      };

      // First sign up the user
      await request(app)
        .post('/auth/signup')
        .send(userData);

      // Try to sign up again
      const response = await request(app)
        .post('/auth/signup')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'User already exists');
    });
  });
});
