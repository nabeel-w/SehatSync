import Joi from 'joi';

export const bookBedSchema =  Joi.object({
    hospitalId: Joi.string().required().hex().length(24).messages({
        'string.base': 'Hospital Id must be a string',
        'string.hex': 'Hospital Id must be a valid ObjectId',
        'string.length': 'Hospital Id must be 24 characters long',
        'any.required': 'Hospital Id is required'
    }),
    bedId: Joi.string().required().hex().length(24).messages({
        'string.base': `"bedId" should be a type of 'text'`,
        'string.empty': `"bedId" cannot be an empty field`,
        'string.hex': 'Bed Id must be a valid ObjectId',
        'string.length': 'Bed Id must be 24 characters long',
        'any.required': `"bedId" is a required field`
    }),
    patientName: Joi.string().min(3).max(50).required().messages({
        'string.base': `"patientName" should be a type of 'text'`,
        'string.empty': `"patientName" cannot be an empty field`,
        'string.min': `"patientName" should have a minimum length of {#limit}`,
        'string.max': `"patientName" should have a maximum length of {#limit}`,
        'any.required': `"patientName" is a required field`
    }),
    contactNumber: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.base': `"contactNumber" should be a type of 'text'`,
        'string.empty': `"contactNumber" cannot be an empty field`,
        'string.pattern.base': `"contactNumber" must be a valid 10-digit phone number`,
        'any.required': `"contactNumber" is a required field`
    }),
    checkInDate: Joi.date().iso().required().messages({
        'date.base': `"checkInDate" should be a valid date`,
        'any.required': `"checkInDate" is a required field`
    }),
});

export const bookDoctorSchema = Joi.object({
    hospitalId: Joi.string().optional().hex().length(24).messages({
        'string.base': 'Hospital Id must be a string',
        'string.hex': 'Hospital Id must be a valid ObjectId',
        'string.length': 'Hospital Id must be 24 characters long',
    }),
    doctorId: Joi.string().required().hex().length(24).messages({
        'string.base': 'Doctor Id must be a string',
        'string.hex': 'Doctor Id must be a valid ObjectId',
        'string.length': 'Doctor Id must be 24 characters long',
        'any.required': 'Doctor Id is required'
    }),
    patientName: Joi.string().min(3).max(50).required().messages({
        'string.base': `"patientName" should be a type of 'text'`,
        'string.empty': `"patientName" cannot be an empty field`,
        'string.min': `"patientName" should have a minimum length of {#limit}`,
        'string.max': `"patientName" should have a maximum length of {#limit}`,
        'any.required': `"patientName" is a required field`
    }),
    contactNumber: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.base': `"contactNumber" should be a type of 'text'`,
        'string.empty': `"contactNumber" cannot be an empty field`,
        'string.pattern.base': `"contactNumber" must be a valid 10-digit phone number`,
        'any.required': `"contactNumber" is a required field`
    }),
    appointmentDate: Joi.date().iso().required().messages({
        'date.base': `"appointmentDate" should be a valid date`,
        'any.required': `"appointmentDate" is a required field`
    }),
});

export const bookingCancelSchema = Joi.object({
    bookingId: Joi.string().required().hex().length(24).messages({
        'string.base': `"bookingId" should be a type of 'text'`,
        'string.hex': 'Booking Id must be a valid ObjectId',
        'string.length': 'Booking Id must be 24 characters long',
        'string.empty': `"bookingId" cannot be an empty field`,
        'any.required': `"bookingId" is a required field`
    }),
});