import Joi from 'joi';

export default {
    order: Joi.object({
        totalAmount: Joi.number().required(),
        participants:Joi.number().required(),
        gid:Joi.boolean().allow(null)
    }),    
}