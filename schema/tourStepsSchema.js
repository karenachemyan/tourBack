import Joi from 'joi';

export default {
    create: Joi.object({
        title: Joi.array().items(Joi.string().max(255).required()),
        description: Joi.array().items(Joi.string().required())  
    }),
    update:Joi.object({
        title: Joi.string().max(255).required(),
        description: Joi.string().required()
    })
};