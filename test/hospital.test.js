import request from 'supertest';
import app from '../index.js'; // Import your Express app
import { connectDb, disconnectDb } from '../utils/db.js';
import Doctor from '../model/Doctor.js';
import Hospital from '../model/Hospital.js';
import Bed from '../model/Bed.js';
import Booking from '../model/Booking.js';
import bcrypt from 'bcrypt';
import User from '../model/User.js';




const address = {
    street: '7 Ekbalpur Lane',
    city: 'Kolkata',
    state: 'West Bengal',
    zipCode: '700023'
};
let authToken;

beforeAll(async () => {
    await connectDb(true);
    await User.deleteMany({});
    await Hospital.deleteMany({});
    const email = "john@gmail.com"
    const password = "StrongPass123!";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
        name: 'Hospital Test',
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

// Clean up after each test
afterEach(async () => {
    await Hospital.deleteMany({});
    await Doctor.deleteMany({});
    await Bed.deleteMany({});
});

afterAll(async () => {
    await User.deleteMany({});
    await disconnectDb();
});

// Test the addHospital function
describe('POST /add-hospital', () => {
    it('should create a new hospital successfully', async () => {

        const response = await request(app).post('/admin/add-hospital')
            .set('Authorization', `${authToken}`)
            .send({
                name: 'Test Hospital',
                phoneNumber: '1234567890',
                address: address,
                totalBeds: 100,
                emergencyServices: true
            });
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Hospital Added Successfully');

        const hospital = await Hospital.findOne({ contactNumber: '1234567890' });
        expect(hospital).not.toBeNull();
    });

    it('should not allow duplicate hospital phone numbers', async () => {
        await new Hospital({
            name: 'Test Hospital',
            contactNumber: '1234567890',
            address: address,
            totalBeds: 100,
            emergencyServices: true,
        }).save();
        const response = await request(app).post('/admin/add-hospital')
            .set('Authorization', `${authToken}`)
            .send({
                name: 'Test Hospital',
                phoneNumber: '1234567890',
                address: address,
                totalBeds: 100,
                emergencyServices: true
            });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Hospital Already Exists');
    });
});

// Test the addDoctor function
describe('POST /add-doctor', () => {
    it('should add a doctor to a hospital successfully', async () => {
        const hospital = await new Hospital({
            name: 'Hospital A',
            contactNumber: '1111111111',
            address: address,
            totalBeds: 50,
            emergencyServices: true,
        }).save();

        const doctor = await new Doctor({
            name: 'Dr. Smith',
            specialty: 'Cardiology',
            contactNumber: '2222222222',
        }).save();

        const response = await request(app).post('/admin/add-doctor-to-hospital')
            .set('Authorization', `${authToken}`)
            .send({
                doctorId: doctor._id,
                hospitalId: hospital._id,
                timings: { start: '09:00', end: '17:00' },
                numAppointments: 10,
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Doctor added susccessfully');

        const updatedHospital = await Hospital.findById(hospital._id);
        expect(updatedHospital.doctors).toContainEqual(doctor._id);
    });

    it('should return an error if hospital or doctor ID is invalid', async () => {
        const response = await request(app).post('/admin/add-doctor-to-hospital')
            .set('Authorization', `${authToken}`)
            .send({
                doctorId: '66fb07fe4d55aedc6f3784cb',
                hospitalId: '66fb07fe4d55aedc6f3784cb',
                timings: { start: '09:00', end: '17:00' },
                numAppointments: 10,
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid Hospital or Doctor ID');
    });
});

// Test other controller functions...

describe('POST /init-hospital-beds', () => {
    it('should initialize beds for a hospital', async () => {
        const hospital = await new Hospital({
            name: 'Hospital B',
            contactNumber: '3333333333',
            address: address,
            totalBeds: 100,
            emergencyServices: false,
        }).save();

        const wardData = [
            { name: 'ICU', numBed: 5 },
            { name: 'General', numBed: 10 },
        ];

        const response = await request(app).post('/admin/init-beds')
            .set('Authorization', `${authToken}`)
            .send({
                hospitalId: hospital._id,
                wardData,
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Beds added susccessfully');

        const beds = await Bed.find({ hospital: hospital._id });
        expect(beds).toHaveLength(15);
    });

    it('should return error if beds already exist', async () => {
        const hospital = await new Hospital({
            name: 'Hospital C',
            contactNumber: '4444444444',
            address: address,
            totalBeds: 50,
            emergencyServices: true,
        }).save();

        const wardData = [{ name: 'ICU', numBed: 3 }];

        await Bed.insertMany([
            { hospital: hospital._id, ward: 'ICU', bedNumber: 1 },
            { hospital: hospital._id, ward: 'ICU', bedNumber: 2 },
        ]);

        const response = await request(app).post('/admin/init-beds')
            .set('Authorization', `${authToken}`)
            .send({
                hospitalId: hospital._id,
                wardData,
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Hospital Beds Data already Exists');
    });
});

// Test the getHospitals function
describe('POST /get-hospitals', () => {
    it('should fetch hospitals based on city and emergency services', async () => {
        await new Hospital({
            name: 'City Hospital',
            contactNumber: '5555555555',
            address: {
                street: '7 Ekbalpur Lane',
                city: 'Kolkata',
                state: 'West Bengal',
                zipCode: '700001',
            },
            totalBeds: 100,
            emergencyServices: true,
        }).save();

        const response = await request(app)
            .post('/hospital/get-hospitals')
            .set('Authorization', `${authToken}`)
            .send({
                city: 'Kolkata',
                emergency: true,
            });

        expect(response.status).toBe(200);
        expect(response.body.hospitals).toHaveLength(1);
        expect(response.body.hospitals[0].name).toBe('City Hospital');
    });

    it('should return an empty array if no hospitals match the criteria', async () => {
        const response = await request(app)
            .post('/hospital/get-hospitals')
            .set('Authorization', `${authToken}`)
            .send({
                city: 'Unknown City',
                emergency: false,
            });

        expect(response.status).toBe(200);
        expect(response.body.hospitals).toHaveLength(0);
    });
});

// Test the setAppointment function
describe('POST /set-appointment', () => {
    it('should set an appointment for a doctor at a hospital', async () => {
        const hospital = await new Hospital({
            name: 'Appointment Hospital',
            contactNumber: '6666666666',
            address: address,
            totalBeds: 50,
            emergencyServices: true,
        }).save();

        const doctor = await new Doctor({
            name: 'Dr. Jane',
            specialty: 'Pediatrics',
            contactNumber: '7777777777',
        }).save();

        const response = await request(app).post('/admin/set-appointment')
            .set('Authorization', `${authToken}`)
            .send({
                hospitalId: hospital._id,
                appointmentTime: { start: '10:00', end: '18:00' },
                numAppointments: 20,
                docterId: doctor._id,
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Appointment Data set successfully');
    });

    it('should return error for invalid doctor ID', async () => {
        const response = await request(app).post('/admin/set-appointment')
            .set('Authorization', `${authToken}`)
            .send({
                hospitalId: '66fb07fe4d55aedc6f3784cb',
                appointmentTime: { start: '10:00', end: '18:00' },
                numAppointments: 20,
                docterId: '66fb07fe4d55aedc6f3784cb',
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid Doctor ID');
    });
});

// Test the updateAppointment function
describe('POST /update-appointment', () => {
    it('should update an existing appointment for a doctor', async () => {
        const hospital = await new Hospital({
            name: 'Update Hospital',
            contactNumber: '8888888888',
            address: address,
            totalBeds: 50,
            emergencyServices: true,
        }).save();

        const doctor = await new Doctor({
            name: 'Dr. Robert',
            specialty: 'Neurology',
            contactNumber: '9999999999',
        }).save();

        await request(app).post('/admin/set-appointment')
            .set('Authorization', `${authToken}`)
            .send({
                hospitalId: hospital._id,
                appointmentTime: { start: '10:00', end: '18:00' },
                numAppointments: 20,
                docterId: doctor._id,
            });

        const response = await request(app).patch('/admin/update-appointment')
            .set('Authorization', `${authToken}`)
            .send({
                hospitalId: hospital._id,
                appointmentTime: { start: '09:00', end: '17:00' },
                numAppointments: 15,
                docterId: doctor._id,
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Appointment Data updated successfully');
    });

    it('should return an error if the appointment does not exist', async () => {
        const hospital = await new Hospital({
            name: 'Update Hospital',
            contactNumber: '8888888888',
            address: address,
            totalBeds: 50,
            emergencyServices: true,
        }).save();

        const doctor = await new Doctor({
            name: 'Dr. Robert',
            specialty: 'Neurology',
            contactNumber: '9999999999',
        }).save();

        const response = await request(app).patch('/admin/update-appointment')
            .set('Authorization', `${authToken}`)
            .send({
                hospitalId: hospital._id,
                appointmentTime: { start: '09:00', end: '17:00' },
                numAppointments: 10,
                docterId: doctor._id,
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Hospital Timing doesn't Exists");
    });
});

// Test the getDoctors function
describe('POST /get-doctors', () => {
    it('should fetch doctors associated with a hospital', async () => {
        const hospital = await new Hospital({
            name: 'Doctor Hospital',
            contactNumber: '1010101010',
            address: address,
            totalBeds: 50,
            emergencyServices: true,
            doctors: [],
        }).save();

        const doctor = await new Doctor({
            name: 'Dr. Adams',
            specialty: 'General Medicine',
            contactNumber: '2020202020',
        }).save();

        hospital.doctors.push(doctor._id);
        await hospital.save();

        const response = await request(app).post('/hospital/get-doctors')
            .set('Authorization', `${authToken}`)
            .send({
                hospitalId: hospital._id,
            });

        expect(response.status).toBe(200);
        expect(response.body.doctors).toHaveLength(1);
        expect(response.body.doctors[0].name).toBe('Dr. Adams');
    });

    it('should return an error if the hospital does not have any doctors', async () => {
        const hospital = await new Hospital({
            name: 'Empty Doctor Hospital',
            contactNumber: '3030303030',
            address: address,
            totalBeds: 50,
            emergencyServices: true,
        }).save();

        const response = await request(app).post('/hospital/get-doctors')
            .set('Authorization', `${authToken}`)
            .send({
                hospitalId: hospital._id,
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("No Doctors Found");
    });
});

// Test the getDocNameId function
describe('POST /get-doc-name-id', () => {
    it('should fetch doctors not associated with a hospital', async () => {
        const hospital = await new Hospital({
            name: 'Another Hospital',
            contactNumber: '4040404040',
            address: address,
            totalBeds: 50,
            emergencyServices: true,
        }).save();

        const doctor1 = await new Doctor({
            name: 'Dr. Evans',
            specialty: 'Surgery',
            contactNumber: '5050505050',
        }).save();

        const doctor2 = await new Doctor({
            name: 'Dr. Lee',
            specialty: 'Cardiology',
            contactNumber: '6060606060',
        }).save();

        const response = await request(app).post('/admin/get-doctors-id')
            .set('Authorization', `${authToken}`)
            .send({
                hospitalId: hospital._id,
            });

        expect(response.status).toBe(200);
        expect(response.body.doctors).toHaveLength(2); // Both doctors are not associated with the hospital
    });

    it('should return an error for an invalid hospital ID', async () => {
        const response = await request(app).post('/admin/get-doctors-id')
            .set('Authorization', `${authToken}`)
            .send({
                hospitalId: '66fb07fe4d55aedc6f3784cb',
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid Hopsital Id");
    });
});

// Test the getBedBookings function
describe('POST /get-bed-bookings', () => {
    it('should fetch bed bookings for a hospital', async () => {
        // Create a hospital for the test
        const hospital = await new Hospital({
            name: 'Booking Hospital',
            contactNumber: '7070707070',
            address: address,
            totalBeds: 50,
            emergencyServices: true,
        }).save();

        // Create a bed associated with the hospital
        const bed = await new Bed({
            hospital: hospital._id,
            ward: 'ICU',
            bedNumber: 'ICU 1',
            type: 'ICU',
            status: 'Available',
        }).save();

        // Simulate a bed booking for the test
        await Booking.create({
            patientName: 'Alice',
            patientContact: '8080808080',
            bookingType: 'Bed Booking',
            hospital: hospital._id,
            bed: bed._id,  // Reference the bed ID here
            status: 'Confirmed',
            checkInDate: new Date(),
        });

        const response = await request(app).post('/admin/get-bed-booking')
            .set('Authorization', `${authToken}`)
            .send({
                hospitalId: hospital._id,
            });

        expect(response.status).toBe(200);
        expect(response.body.bookings).toHaveLength(1);
        expect(response.body.bookings[0].patientName).toBe('Alice');
        expect(response.body.bookings[0].bed.toString()).toBe(bed._id.toString()); // Ensure bed ID matches
    });

    it('should return an error if the hospital ID is invalid', async () => {
        const response = await request(app).post('/admin/get-bed-booking')
            .set('Authorization', `${authToken}`)
            .send({
                hospitalId: '66fb07fe4d55aedc6f3784cb',
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid Hospital Id");
    });
});

// Test the getDoctorBookings function
describe('POST /get-doctor-bookings', () => {
    it('should retrieve confirmed doctor bookings for a valid hospital and doctor', async () => {
        // Setup: Create a hospital, doctor, and booking
        const hospital = await new Hospital({
            name: 'Test Hospital',
            contactNumber: '1234567890',
            address: address,
            totalBeds: 100,
            emergencyServices: true,
        }).save();

        const doctor = await new Doctor({
            name: 'Dr. John',
            specialty: 'General Practice',
            contactNumber: '9876543210',
        }).save();

        await request(app).post('/admin/set-appointment')
            .set('Authorization', `${authToken}`)
            .send({
                hospitalId: hospital._id,
                appointmentTime: { start: '10:00', end: '18:00' },
                numAppointments: 20,
                docterId: doctor._id,
            });

        await new Booking({
            hospital: hospital._id,
            doctor: doctor._id,
            bookingType: 'Doctor Appointment',
            status: 'Confirmed',
            patientName: 'Patient A',
            patientContact: '555-555-5555',
            appointmentDate: new Date(),
        }).save();

        // Execute the test
        const response = await request(app)
            .post('/admin/get-doctor-booking')
            .set('Authorization', `${authToken}`)
            .send({
                hospitalId: hospital._id,
                doctorId: doctor._id,
            });

        // Expectations
        expect(response.status).toBe(200);
        expect(response.body.bookings).toHaveLength(1);
        expect(response.body.bookings[0].patientName).toBe('Patient A');
    });

    it('should return an empty array if there are no confirmed bookings for the doctor', async () => {
        // Setup: Create a hospital and doctor without any bookings
        const hospital = await new Hospital({
            name: 'Empty Hospital',
            contactNumber: '1111111111',
            address: address,
            totalBeds: 50,
            emergencyServices: true,
        }).save();

        const doctor = await new Doctor({
            name: 'Dr. Jane',
            specialty: 'Pediatrics',
            contactNumber: '2222222222',
        }).save();

        await request(app).post('/admin/set-appointment')
            .set('Authorization', `${authToken}`)
            .send({
                hospitalId: hospital._id,
                appointmentTime: { start: '10:00', end: '18:00' },
                numAppointments: 20,
                docterId: doctor._id,
            });

        // Execute the test
        const response = await request(app)
            .post('/admin/get-doctor-booking')
            .set('Authorization', `${authToken}`)
            .send({
                hospitalId: hospital._id,
                doctorId: doctor._id,
            });

        // Expectations
        expect(response.status).toBe(200);
        expect(response.body.bookings).toHaveLength(0);
    });

    it('should return an error for invalid hospital or doctor ID', async () => {
        const response = await request(app)
            .post('/admin/get-doctor-booking')
            .set('Authorization', `${authToken}`)
            .send({
                hospitalId: '66fb07fe4d55aedc6f3784cb',
                doctorId: '66fb07fe4d55aedc6f3784cb',
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid Hopsital OR Doctor Id");
    });

    // Test the getHospitalByName function
    describe('POST /get-hospital-by-name', () => {
        it('should return hospitals that match the given name', async () => {
            // Create a hospital for the test
            await new Hospital({
                name: 'Unique Hospital Name',
                contactNumber: '9090909090',
                address: address,
                totalBeds: 50,
                emergencyServices: true,
            }).save();

            // Make a request to get hospitals by name
            const response = await request(app)
                .post('/hospital/get-hospital-name')
                .set('Authorization', `${authToken}`)
                .send({
                    name: 'Unique Hospital Name',
                });

            expect(response.status).toBe(200);
            expect(response.body.hospitals).toHaveLength(1);
            expect(response.body.hospitals[0].name).toBe('Unique Hospital Name');
        });

        it('should return an empty array if no hospitals match the given name', async () => {
            const response = await request(app)
                .post('/hospital/get-hospital-name')
                .set('Authorization', `${authToken}`)
                .send({
                    name: 'Nonexistent Hospital',
                });

            expect(response.status).toBe(200);
            expect(response.body.hospitals).toHaveLength(0);
        });

        it('should return a server error if there is an issue with the query', async () => {
            // Mock an error in the Hospital.find method
            jest.spyOn(Hospital, 'find').mockImplementationOnce(() => {
                throw new Error('Database query failed');
            });

            const response = await request(app)
                .post('/hospital/get-hospital-name')
                .set('Authorization', `${authToken}`)
                .send({
                    name: 'Any Hospital',
                });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Server error');

            // Restore the original implementation after the test
            Hospital.find.mockRestore();
        });
    });
});
