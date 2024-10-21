import Joi from "joi";

export const addHospitalSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.base': 'Name must be a string',
        'any.required': 'Name is required'
    }),
    phoneNumber: Joi.string().required().messages({
        'string.base': 'Phone Number must be a string',
        'any.required': 'Phone Number is required'
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
    totalBeds: Joi.number().integer().required().messages({
        'number.base': 'Total Beds must be a number',
        'any.required': 'Total Beds is required'
    }),
    emergencyServices: Joi.boolean().required().messages({
        'boolean.base': 'Emergency Services must be a boolean',
        'any.required': 'Emergency Services is required'
    })
});

export const addDoctorSchema = Joi.object({
    doctorId: Joi.string().required().hex().length(24).messages({
        'string.base': 'Doctor Id must be a string',
        'string.hex': 'Doctor Id must be a valid ObjectId',
        'string.length': 'Doctor Id must be 24 characters long',
        'any.required': 'Doctor Id is required'
    }),
    hospitalId: Joi.string().required().hex().length(24).messages({
        'string.base': 'Hospital Id must be a string',
        'string.hex': 'Hospital Id must be a valid ObjectId',
        'string.length': 'Hospital Id must be 24 characters long',
        'any.required': 'Hospital Id is required'
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
    numAppointments: Joi.number().integer().required().messages({
        'number.base': 'Number of Appointments must be a number',
        'any.required': 'Number of Appointments is required'
    })
});

export const initHospitalBedsSchema = Joi.object({
    hospitalId: Joi.string().required().hex().length(24).messages({
        'string.base': 'Hospital Id must be a string',
        'string.hex': 'Hospital Id must be a valid ObjectId',
        'string.length': 'Hospital Id must be 24 characters long',
        'any.required': 'Hospital Id is required'
    }),
    wardData: Joi.array().items(Joi.object({
        name: Joi.string().required().messages({
            'string.base': 'Ward name must be a string',
            'any.required': 'Ward name is required'
        }),
        numBed: Joi.number().integer().required().messages({
            'number.base': 'Number of beds must be a number',
            'any.required': 'Number of beds is required'
        })
    })).required().messages({
        'array.base': 'Ward data must be an array',
        'any.required': 'Ward data is required'
    })
});

export const getHospitalsSchema = Joi.object({
    city: Joi.string().required().messages({
        'string.base': 'City should be a string',
        'any.required': 'City is required'
    }),
    emergency: Joi.boolean().required().messages({
        'boolean.base': 'Emergency Services must be a boolean',
        'any.required': 'Emergency Services is required'
    }),
    lastId: Joi.string().optional().hex().length(24).messages({
        'string.base': 'Last ID should be a string',
        'string.hex': 'Last ID must be a valid ObjectId',
        'string.length': 'Last ID must be 24 characters long',
    }),
});

export const setAppointmentSchema = Joi.object({
    hospitalId: Joi.string().required().hex().length(24).messages({
        'string.base': 'Hospital Id must be a string',
        'string.hex': 'Hospital Id must be a valid ObjectId',
        'string.length': 'Hospital Id must be 24 characters long',
        'any.required': 'Hospital Id is required'
    }),
    appointmentTime: Joi.object({
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
    }).required().messages({
        'object.base': 'Appointment time must be an object',
        'any.required': 'Appointment time is required'
    }),
    numAppointments: Joi.number().integer().required().messages({
        'number.base': 'Number of Appointments must be a number',
        'any.required': 'Number of Appointments is required'
    }),
    docterId: Joi.string().required().hex().length(24).messages({
        'string.base': 'Doctor Id must be a string',
        'string.hex': 'Doctor Id must be a valid ObjectId',
        'string.length': 'Doctor Id must be 24 characters long',
        'any.required': 'Doctor Id is required'
    })
});

export const updateAppointmentSchema = Joi.object({
    hospitalId: Joi.string().required().hex().length(24).messages({
        'string.base': 'Hospital Id must be a string',
        'string.hex': 'Hospital Id must be a valid ObjectId',
        'string.length': 'Hospital Id must be 24 characters long',
        'any.required': 'Hospital Id is required'
    }),
    appointmentTime: Joi.object({
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
    }).required().messages({
        'object.base': 'Appointment time must be an object',
        'any.required': 'Appointment time is required'
    }),
    numAppointments: Joi.number().integer().required().messages({
        'number.base': 'Number of Appointments must be a number',
        'any.required': 'Number of Appointments is required'
    }),
    docterId: Joi.string().required().hex().length(24).messages({
        'string.base': 'Doctor Id must be a string',
        'string.hex': 'Doctor Id must be a valid ObjectId',
        'string.length': 'Doctor Id must be 24 characters long',
        'any.required': 'Doctor Id is required'
    })
});

export const getDoctorsSchema = Joi.object({
    hospitalId: Joi.string().required().hex().length(24).messages({
        'string.base': 'Hospital Id must be a string',
        'string.hex': 'Hospital Id must be a valid ObjectId',
        'string.length': 'Hospital Id must be 24 characters long',
        'any.required': 'Hospital Id is required'
    })
});

export const getDocNameIdSchema = Joi.object({
    hospitalId: Joi.string().required().hex().length(24).messages({
        'string.base': 'Hospital Id must be a string',
        'string.hex': 'Hospital Id must be a valid ObjectId',
        'string.length': 'Hospital Id must be 24 characters long',
        'any.required': 'Hospital Id is required'
    })
});

export const getBedBookingsSchema = Joi.object({
    hospitalId: Joi.string().required().hex().length(24).messages({
        'string.base': 'Hospital Id must be a string',
        'string.hex': 'Hospital Id must be a valid ObjectId',
        'string.length': 'Hospital Id must be 24 characters long',
        'any.required': 'Hospital Id is required'
    })
});

export const getDoctorBookingsSchema = Joi.object({
    hospitalId: Joi.string().required().hex().length(24).messages({
        'string.base': 'Hospital Id must be a string',
        'string.hex': 'Hospital Id must be a valid ObjectId',
        'string.length': 'Hospital Id must be 24 characters long',
        'any.required': 'Hospital Id is required'
    }),
    doctorId: Joi.string().required().hex().length(24).messages({
        'string.base': 'Doctor Id must be a string',
        'string.hex': 'Doctor Id must be a valid ObjectId',
        'string.length': 'Doctor Id must be 24 characters long',
        'any.required': 'Doctor Id is required'
    })
});

export const getHospitalByNameSchema = Joi.object({
    name: Joi.string().min(3).required().messages({
        'string.base': 'Name should be a string',
        'string.min': 'Name must be at least 3 characters long',
        'any.required': 'Name is required'
    })
});