import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index.js'; // Assuming your Express app is exported from app.js
import Bed from '../model/Bed.js';
import Hospital from '../model/Hospital.js';
import { connectDb, disconnectDb } from '../utils/db.js';
import User from '../model/User.js';
import bcrypt from 'bcrypt';

let authToken;

beforeAll(async () => {
    await connectDb();
    await User.deleteMany({});
    const email = "john@gmail.com"
    const password = "StrongPass123!";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
        name: 'Doctor Test',
        email,
        password: hashedPassword,
        role: 'Admin',
    })
    await user.save();
    const loginResponse = await request(app)
        .post('/admin/login')
        .send({
            email: email, // Use a valid username
            password: password // Use a valid password
        });
    authToken = loginResponse.body.accessToken;
});

afterAll(async () => {
    await User.deleteMany({});
    await disconnectDb();
});

describe('Bed Controller Tests', () => {
    let hospital;
    let bed;

    beforeEach(async () => {
        // Seed initial data
        hospital = await new Hospital({
            name: 'Hospital B',
            contactNumber: '3333333333',
            address: {
                street: '7 Ekbalpur Lane',
                city: 'Kolkata',
                state: 'West Bengal',
                zipCode: '700023'
            },
            totalBeds: 100,
            emergencyServices: false,
        }).save();

        bed = new Bed({
            hospital: hospital._id,
            type: 'General',
            ward: 'ICU',
            bedNumber: 101,
        });
        await bed.save();
    });

    afterEach(async () => {
        // Clear collections after each test
        await Bed.deleteMany();
        await Hospital.deleteMany();
    });

    test('should update bed type successfully', async () => {
        const response = await request(app)
            .patch('/admin/update-bed-type')
            .set('Authorization', `${authToken}`)
            .send({ bedId: bed._id, bedType: 'ICU' });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Bed Data updated successfully');

        // Check if bed type was updated in the database
        const updatedBed = await Bed.findById(bed._id);
        expect(updatedBed.type).toBe('ICU');
    });

    test('should return 400 for invalid bed ID', async () => {
        const invalidId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .patch('/admin/update-bed-type')
            .set('Authorization', `${authToken}`)
            .send({ bedId: invalidId, bedType: 'ICU' });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Invalid Bed Id');
    });

    test('should fetch available beds successfully', async () => {
        const response = await request(app)
            .post('/bed/get-beds')
            .set('Authorization', `${authToken}`)
            .send({ hospitalId: hospital._id });

        expect(response.statusCode).toBe(200);
        expect(response.body.beds).toHaveLength(1);
        expect(response.body.beds[0].bedNumber).toBe("101");
    });

    test('should return 400 for invalid hospital ID', async () => {
        const invalidId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .post('/bed/get-beds')
            .set('Authorization', `${authToken}`)
            .send({ hospitalId: invalidId });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Invalid Hospital Id');
    });

    test('should return 400 when no beds are available', async () => {
        // Update hospital to have 0 available beds
        hospital.bedsAvailable = 0;
        await hospital.save();

        const response = await request(app)
            .post('/bed/get-beds')
            .set('Authorization', `${authToken}`)
            .send({ hospitalId: hospital._id });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('No available beds for this hopital');
    });
});
