import Joi from 'joi';

export default {
    add: Joi.object({
        tourId:Joi.number().required()
    }),    
}