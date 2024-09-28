import Joi from 'joi';

export const adminSigninSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.base': 'Email should be a string',
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.base': 'Password should be a string',
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
    })
});