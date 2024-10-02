import request from 'supertest';
import app from '../index.js'; // Assuming your Express app is exported from app.js
import User from '../model/User.js';
import { connectDb, disconnectDb } from '../utils/db.js';


describe('Logout Controller', () => {
  beforeAll(async () => {
    await connectDb();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('should successfully logout the user by invalidating the refresh token', async () => {
    // Seed the database with a user and refresh token
    const refreshToken = 'test-refresh-token';
    const user = new User({
      name: 'testuser',
      email: 'testuser@example.com',
      refreshToken
    });
    await user.save();

    // Make the logout request
    const response = await request(app)
      .post('/auth/logout')  // Assuming this is the endpoint for logout
      .send({ token: refreshToken });

    // Check the response
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Logged out successfully');

    // Check that the refresh token is removed from the database
    const updatedUser = await User.findOne({ name: 'testuser' });
    expect(updatedUser.refreshToken).toBeNull();
  });

  it('should return 401 if no refresh token is provided', async () => {
    const response = await request(app)
      .post('/auth/logout')
      .send({});

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Refresh token is required');
  });

  it('should return 500 if there is a server error', async () => {
    // Force a server error by disconnecting from the database
    await disconnectDb();

    const response = await request(app)
      .post('/auth/logout')
      .send({ token: 'some-token' });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Server error');

    // Reconnect to the database for the next test
    await connectDb();
  });
});
