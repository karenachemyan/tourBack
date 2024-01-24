import Joi from 'joi';

export default {
    order: Joi.object({
        scheduleId:Joi.number().required(),
        adult:Joi.number().required(),
        children3to10:Joi.number().required(),
        children11up:Joi.number().required(),
        gid:Joi.boolean().allow(null)
    }),    
}