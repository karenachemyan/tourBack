import Joi from 'joi';

export default {
    add: Joi.object({
        rate: Joi.number().min(1).max(5).required(),
        tourId:Joi.number().required()
    }),    
}