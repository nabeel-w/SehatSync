import Joi from 'joi';

export const updateBedTypeSchema = Joi.object({
    bedId: Joi.string().required().hex().length(24).messages({
        'string.base': 'Bed Id should be a string',
        'string.hex': 'Bed Id must be a valid ObjectId',
        'string.length': 'Bed Id must be 24 characters long',
        'any.required': 'Bed Id is required'
    }),
    bedType: Joi.string().valid('General', 'ICU', 'VIP', 'Special').required().messages({
        'string.base': 'Bed Type should be a string',
        'any.only': 'Bed Type must be one of [General, ICU, VIP, Special]',
        'any.required': 'Bed Type is required'
    })
});

export const availableBedsSchema = Joi.object({
    hospitalId: Joi.string().required().hex().length(24).messages({
        'string.base': 'Hospital Id should be a string',
        'string.hex': 'Hospital Id must be a valid ObjectId',
        'string.length': 'Hospital Id must be 24 characters long',
        'any.required': 'Hospital Id is required'
    })
});
