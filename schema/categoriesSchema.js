import Joi from 'joi';

export default {
    create: Joi.object({
        title: Joi.string().max(255).required(),
        icon: Joi.string(),
    }),
    update: Joi.object({
        title: Joi.string().max(255).required(),   
        icon: Joi.string().allow(null, '').default(null)   
    }),

}