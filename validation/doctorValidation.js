import Joi from 'joi';

// Validation schema for initializing a doctor
export const initDoctorSchema = Joi.object({
    name: Joi.string().min(3).required().messages({
        'string.base': 'Name should be a string',
        'string.min': 'Name must be at least 3 characters long',
        'any.required': 'Name is required'
    }),
    specialtiy: Joi.string().required().messages({
        'string.base': 'Specialty should be a string',
        'any.required': 'Specialty is required'
    }),
    contactNum: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.base': 'Contact number should be a string',
        'string.pattern.base': 'Contact number must be a valid 10-digit number',
        'any.required': 'Contact number is required'
    }),
});

// Validation schema for adding a private clinic
export const addPrivateClinicSchema = Joi.object({
    doctorId: Joi.string().required().hex().length(24).messages({
        'string.base': 'Doctor ID should be a string',
        'string.hex': 'Doctor ID must be a valid ObjectId',
        'string.length': 'Doctor ID must be 24 characters long',
        'any.required': 'Doctor ID is required'
    }),
    clinicName: Joi.string().required().messages({
        'string.base': 'Clinic name should be a string',
        'any.required': 'Clinic name is required'
    }),
    address: Joi.object({
        street: Joi.string().required().messages({
            'string.base': 'Street should be a string',
            'any.required': 'Street is required'
        }),
        city: Joi.string().required().messages({
            'string.base': 'City should be a string',
            'any.required': 'City is required'
        }),
        state: Joi.string().required().messages({
            'string.base': 'State should be a string',
            'any.required': 'State is required'
        }),
        zipCode: Joi.string().pattern(/^[1-9][0-9]{5}$/).required().messages({
            'string.base': 'Zip code should be a string',
            'string.pattern.base': 'Zip code must be a valid 5-digit number',
            'any.required': 'Zip code is required'
        }),
    }).required(),
    timings: Joi.object({
        start: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
            'string.base': 'Start time should be a string',
            'string.pattern.base': 'Start time must be in 24-hour format (HH:mm)',
            'any.required': 'Start time is required'
        }),
        end: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
            'string.base': 'End time should be a string',
            'string.pattern.base': 'End time must be in 24-hour format (HH:mm)',
            'any.required': 'End time is required'
        }),
    }).required(),
    numAppointments: Joi.number().integer().min(1).required().messages({
        'number.base': 'Number of appointments should be a number',
        'number.min': 'Number of appointments must be at least 1',
        'any.required': 'Number of appointments is required'
    }),
});

// Validation schema for updating clinic timing
export const updateClinicTimingSchema = Joi.object({
    doctorId: Joi.string().required().hex().length(24).messages({
        'string.base': 'Doctor ID should be a string',
        'string.hex': 'Doctor ID must be a valid ObjectId',
        'string.length': 'Doctor ID must be 24 characters long',
        'any.required': 'Doctor ID is required'
    }),
    timings: Joi.object({
        start: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
            'string.base': 'Start time should be a string',
            'string.pattern.base': 'Start time must be in 24-hour format (HH:mm)',
            'any.required': 'Start time is required'
        }),
        end: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
            'string.base': 'End time should be a string',
            'string.pattern.base': 'End time must be in 24-hour format (HH:mm)',
            'any.required': 'End time is required'
        }),
    }).required(),
});

// Validation schema for getting private doctors
export const getPrivateDoctorSchema = Joi.object({
    city: Joi.string().required().messages({
        'string.base': 'City should be a string',
        'any.required': 'City is required'
    }),
    lastId: Joi.string().optional().hex().length(24).messages({
        'string.base': 'Last ID should be a string',
        'string.hex': 'Last ID must be a valid ObjectId',
        'string.length': 'Last ID must be 24 characters long',
    }),
});

// Validation schema for getting clinic bookings
export const getClinicBookingsSchema = Joi.object({
    doctorId: Joi.string().required().hex().length(24).messages({
        'string.base': 'Doctor ID should be a string',
        'string.hex': 'Doctor ID must be a valid ObjectId',
        'string.length': 'Doctor ID must be 24 characters long',
        'any.required': 'Doctor ID is required'
    }),
});

export const getDoctorByNameSchema = Joi.object({
    name: Joi.string().min(3).required().messages({
        'string.base': 'Name should be a string',
        'string.min': 'Name must be at least 3 characters long',
        'any.required': 'Name is required'
    })
});