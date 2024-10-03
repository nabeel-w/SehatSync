import request from 'supertest';
import app from '../index.js'; // Import your Express app
import Booking from '../model/Booking.js';
import Doctor from '../model/Doctor.js';
import Hospital from '../model/Hospital.js';
import Bed from '../model/Bed.js';
import User from '../model/User.js';
import { connectDb, disconnectDb } from '../utils/db.js';
import bcrypt from 'bcrypt';

let authToken; // Variable to hold the auth token
let hospitalId;
let doctorId;
let bedId;
let userId;
const address = {
    street: '7 Ekbalpur Lane',
    city: 'Kolkata',
    state: 'West Bengal',
    zipCode: '700023'
};

beforeAll(async () => {
    await connectDb();
    await Doctor.deleteMany({});
    await Hospital.deleteMany({});
    await Bed.deleteMany({});
    await User.deleteMany({});
    await Booking.deleteMany({});

    const email = "john@gmail.com"
    const password = "StrongPass123!";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
        name: 'User Test',
        email,
        password: hashedPassword,
        role: 'Admin',
    });
    await user.save();
    userId = user._id;

    const loginResponse = await request(app)
        .post('/admin/login')
        .send({
            email: email,
            password: password
        });
    authToken = loginResponse.body.accessToken;

    // Create a sample hospital, doctor, and bed
    const hospital = new Hospital({
        name: 'General Hospital',
        contactNumber: '1234567890',
        address: address,
        doctors: [],
        totalBeds: 10
    });
    hospitalId = hospital._id;

    const doctor = new Doctor({
        name: 'Dr. Jane Doe',
        contactNumber: '1234567899',
        specialty: 'Cardiology',
        hospital: [{ hospitalId, maxAppointment: 5, Appointments: [] }]
    });
    hospital.doctors.push(doctor._id);
    await doctor.save();
    await hospital.save();
    doctorId = doctor._id;

    const bed = new Bed({
        ward: 'General',
        bedNumber: '1',
        type: 'General',
        hospital: hospitalId,
        status: 'Available'
    });
    await bed.save();
    bedId = bed._id;
});

afterAll(async () => {
    await Booking.deleteMany({});
    await Doctor.deleteMany({});
    await Hospital.deleteMany({});
    await Bed.deleteMany({});
    await User.deleteMany({});
    await disconnectDb();
});

describe('Booking Routes', () => {
    // Test for booking a bed
    describe('POST /book-bed', () => {
        it('should successfully book a bed', async () => {
            const response = await request(app)
                .post('/booking/book-bed')
                .set('Authorization', `${authToken}`)
                .send({
                    hospitalId,
                    bedId,
                    patientName: 'John Smith',
                    contactNumber: '9876543210',
                    checkInDate: '2023-10-10T10:00:00Z'
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Booking confirmed');
            expect(response.body.newBooking.patientName).toBe('John Smith');
        });

        it('should return an error for an unavailable bed', async () => {
            await Bed.findByIdAndUpdate(bedId, { status: 'Occupied' }); // Mark bed as occupied

            const response = await request(app)
                .post('/booking/book-bed')
                .set('Authorization', `${authToken}`)
                .send({
                    hospitalId,
                    bedId,
                    patientName: 'Jane Doe',
                    contactNumber: '1234567890',
                    checkInDate: '2023-10-10T10:00:00Z'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Bed not available');
        });
    });

    // Test for booking a doctor
    describe('POST /book-appointment', () => {
        it('should successfully book a doctor', async () => {
            const response = await request(app)
                .post('/booking/book-appointment')
                .set('Authorization', `${authToken}`)
                .send({
                    hospitalId,
                    doctorId,
                    patientName: 'John Smith',
                    contactNumber: '9876543210',
                    appointmentDate: '2023-10-15T10:00:00Z'
                });
            
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Appointment booked successfully');
            expect(response.body.newBooking.patientName).toBe('John Smith');
        });

        it('should return an error for an invalid doctor ID', async () => {
            const response = await request(app)
                .post('/booking/book-appointment')
                .set('Authorization', `${authToken}`)
                .send({
                    hospitalId,
                    doctorId: '66fb07fe4d55aedc6f3784cb',
                    patientName: 'Jane Doe',
                    contactNumber: '1234567890',
                    appointmentDate: '2023-10-15T10:00:00Z'
                });
            
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Doctor Id Invalid');
        });

        it('should return an error when there are no available appointment slots', async () => {
            // Book maximum appointments
            for (let i = 0; i < 5; i++) {
                await request(app)
                    .post('/booking/book-appointment')
                    .set('Authorization', `${authToken}`)
                    .send({
                        hospitalId,
                        doctorId,
                        patientName: `Patient ${i}`,
                        contactNumber: '9876543210',
                        appointmentDate: `2023-10-15T${10 + i}:00:00Z`
                    });
            }

            const response = await request(app)
                .post('/booking/book-appointment')
                .set('Authorization', `${authToken}`)
                .send({
                    hospitalId,
                    doctorId,
                    patientName: 'John Doe',
                    contactNumber: '9876543210',
                    appointmentDate: '2023-10-15T11:00:00Z'
                });
            
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('No available appointment slots in the hospital');
        });
    });

    // Test for canceling a booking
    describe('POST /booking-cancel', () => {
        let bookingId;

        beforeAll(async () => {
            const booking = new Booking({
                patientName: 'John Smith',
                patientContact: '9876543210',
                doctor: doctorId,
                hospital: hospitalId,
                bookingType: 'Doctor Appointment',
                appointmentDate: '2023-10-20T10:00:00Z',
                status: 'Confirmed'
            });
            await booking.save();
            bookingId = booking._id;
            await User.findByIdAndUpdate(userId, { $push: { Bookings: bookingId } });
        });

        it('should successfully cancel a booking', async () => {
            const response = await request(app)
                .post('/booking/booking-cancel')
                .set('Authorization', `${authToken}`)
                .send({ bookingId });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Booking Cancelled Successfully');
        });

        it('should return an error for an invalid booking ID', async () => {
            const response = await request(app)
                .post('/booking/booking-cancel')
                .set('Authorization', `${authToken}`)
                .send({ bookingId: '66fb07fe4d55aedc6f3784cb' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid Booking Id');
        });
    });

    // Test for getting bookings
    describe('GET /get-bookings', () => {
        it('should successfully get user bookings', async () => {
            const response = await request(app)
                .get('/booking/get-bookings')
                .set('Authorization', `${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.bookings).toBeInstanceOf(Array);
        });
    });
});
