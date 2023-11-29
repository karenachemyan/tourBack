import Joi from 'joi';

export default {
    register: Joi.object({
        firstName: Joi.string().max(255).required(),
        lastName: Joi.string().max(255).required(),
        email: Joi.string().required().email(),
        password: Joi.string().required().min(6),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required().label('Confirm password')
            .messages({ 'any.only': '{{#label}} does not match the password' })

    }),
    login: Joi.object({
        email: Joi.string().trim().email().required(),
        password: Joi.string().min(6).required(),
    })
}
