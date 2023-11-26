import Joi from 'joi';

export default {
    create: Joi.object({
        title: Joi.string().max(255).required(),
        description: Joi.string().required(),
        price: Joi.number().min(0).required(),
        duration: Joi.number().min(0).required(),
        categoryId:Joi.number().required(),
        destinationId:Joi.number().required(),
        schedule:Joi.array().items(Joi.date().iso().required())
    })

}