import request from 'supertest';
import app from '../index.js'; // Import your Express app
import Booking from '../model/Booking.js';
import { connectDb, disconnectDb } from '../utils/db.js';
import Doctor from '../model/Doctor.js';
import bcrypt from 'bcrypt';
import User from '../model/User.js';

let authToken; // Variable to hold the auth token

beforeAll(async () => {
    // Simulate user login to get authToken (assuming you have a login route)
    connectDb();
    await Doctor.deleteMany({});
    await Booking.deleteMany({});
    await User.deleteMany({});
    const email = "john@gmail.com"
    const password = "StrongPass123!";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
        name: 'Admin',
        email,
        password:hashedPassword,
        role:'Admin',
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
    await Doctor.deleteMany({});
    await Booking.deleteMany({});
    await User.deleteMany({});
    await disconnectDb();
});

describe('Doctor Routes', () => {
    let doctorId;

    // Test for initializing a doctor
    describe('POST /admin/add-doctor', () => {
        it('should successfully add a doctor', async () => {
            const response = await request(app)
                .post('/admin/add-doctor')
                .set('Authorization', `${authToken}`) // Set the auth token
                .send({
                    name: 'Dr. John Doe',
                    specialtiy: 'Cardiology',
                    contactNum: '1234567891'
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Doctor created Successfully');
            doctorId = response.body.doctor._id;
        });

        it('should return an error for an existing contact number', async () => {
            const response = await request(app)
                .post('/admin/add-doctor')
                .set('Authorization', `${authToken}`)
                .send({
                    name: 'Dr. Jane Doe',
                    specialtiy: 'Neurology',
                    contactNum: '1234567891' // Using the same number as the previous doctor
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Doctor with this contact number exists');
        });
    });

    // Test for adding a private clinic
    describe('PATCH /admin/add-clinic', () => {
        it('should successfully add a private clinic', async () => {
            const response = await request(app)
                .patch('/admin/add-clinic')
                .set('Authorization', `${authToken}`)
                .send({
                    doctorId,
                    clinicName: 'HealthCare Clinic',
                    address: {
                        street: '7 Ekbalpur Lane',
                        city: 'Kolkata',
                        state: 'West Bengal',
                        zipCode: '700023'
                    },
                    timings: {
                        start: '09:00',
                        end: '17:00'
                    },
                    numAppointments: 10
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Private Clinic Data set succcessfully');
        });

        it('should return an error for an invalid doctor ID', async () => {
            const response = await request(app)
                .patch('/admin/add-clinic')
                .set('Authorization', `${authToken}`)
                .send({
                    doctorId: '66fb07fe4d55aedc6f3784cb',
                    clinicName: 'HealthCare Clinic',
                    address: {
                        street: '7 Ekbalpur Lane',
                        city: 'Kolkata',
                        state: 'West Bengal',
                        zipCode: '700023'
                    },
                    timings: {
                        start: '09:00',
                        end: '17:00'
                    },
                    numAppointments: 10
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid Doctor Id');
        });
    });

    // Test for updating clinic timings
    describe('PATCH /admin/update-timing', () => {
        it('should successfully update clinic timings', async () => {
            const response = await request(app)
                .patch('/admin/update-timing')
                .set('Authorization', `${authToken}`)
                .send({
                    doctorId,
                    timings: {
                        start: '10:00',
                        end: '18:00'
                    }
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Private Clinic Data updated succcessfully');
        });

        it('should return an error for a doctor without a private clinic', async () => {
            const newDoctor = new Doctor({
                name: 'Dr. John Doe',
                specialty: 'Cardiology',
                contactNumber: '9999999991'
            })
            await newDoctor.save();
            const response = await request(app)
                .patch('/admin/update-timing')
                .set('Authorization', `${authToken}`)
                .send({
                    doctorId: newDoctor._id,
                    timings: {
                        start: '10:00',
                        end: '18:00'
                    }
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Private Clinic Information doesn't exists");
        });
    });

    // Test for getting private doctors
    describe('POST /doctor/get-clinics', () => {
        it('should successfully get private doctors by city', async () => {
            const response = await request(app)
                .post('/doctor/get-clinics')
                .set('Authorization', `${authToken}`)
                .send({
                    city: 'Kolkata'
                });

            expect(response.status).toBe(200);
            expect(response.body.doctors).toBeInstanceOf(Array);
        });

        it('should return an error for missing city', async () => {
            const response = await request(app)
                .post('/doctor/get-clinics')
                .set('Authorization', `${authToken}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('City is required');
        });
    });

    // Test for getting clinic bookings
    describe('POST /admin/get-clinic-booking', () => {
        it('should successfully get clinic bookings for a doctor', async () => {
            const booking = new Booking({
                doctor: doctorId,
                patientName: 'John Smith',
                patientContact: '9876543210',
                appointmentDate: '2023-09-29T10:00:00Z',
                bookingType: 'Clinic Appointment',
                status: 'Confirmed'
            });
            await booking.save();

            const response = await request(app)
                .post('/admin/get-clinic-booking')
                .set('Authorization', `${authToken}`)
                .send({
                    doctorId
                });

            expect(response.status).toBe(200);
            expect(response.body.bookings).toBeInstanceOf(Array);
        });

        it('should return an error for invalid doctor ID', async () => {
            const response = await request(app)
                .post('/admin/get-clinic-booking')
                .set('Authorization', `${authToken}`)
                .send({
                    doctorId: '651981c4b0987d67c93e4567'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid Doctor Id');
        });
    });
});
