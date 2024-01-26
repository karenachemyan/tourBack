import Joi from 'joi';

export default {
    create: Joi.object({
        title: Joi.string().max(255).required(),
        description: Joi.string().required(),
        price: Joi.number().min(0).required(),
        duration: Joi.number().min(0).required(),
        categoryId:Joi.number().required(),
        destinationId:Joi.number().required(),
        schedule:Joi.array().items(Joi.date().iso().required()),
        featuredImage: Joi.array().items(Joi.string()).messages({
            'array.base': 'Featured image are required'
        }),
        gallery: Joi.array().items(Joi.string()).messages({
            'array.base': 'Gallery image are required'
        })
    }),
    update: Joi.object({
        title: Joi.string().max(255).required(),
        description: Joi.string().required(),
        price: Joi.number().min(0).required(),
        duration: Joi.number().min(0).required(),
        categoryId:Joi.number().required(),
        destinationId:Joi.number().required(),
        schedule:Joi.array().items(Joi.date().iso().allow(null,'')),
        featuredImage: Joi.string().allow(null, '').default(null) ,
        gallery: Joi.string().allow(null, '').default(null)  
    }),

}