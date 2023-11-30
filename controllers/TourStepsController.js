import { TourSteps, Toures } from "../models";
import HttpError from "http-errors";

class TourStepsController{

    static async create(req,res,next){
        try{

            const {title,description} = req.body;
            const {tourId} = req.params;

            const tour  =  await Toures.findByPk(tourId);
            
            if(!tour){
                throw HttpError(422, {
                    errors: {
                        error: 'No Tour found'
                    }
                })
            }

            const steps = await Promise.all(
                title.map(async (titleItem, index) => {
                    const step = await TourSteps.create({
                        title: titleItem,
                        description: description[index],
                        tourId: tourId,
                    });
                    return step;
                })
            );


            res.json({
                status:'ok',
                steps

            })

        }
        catch(e){
            next(e)
        }
    }

    static async update(req,res,next){
        try{

            const {id} = req.params;
            const {title, description} = req.body

            const step = await TourSteps.findByPk(id);

            if(!step){
                throw HttpError(422, {
                    errors: {
                        error: 'No Tour Step found'
                    }
                })
            }
            await step.update({
                title,description
            })

            res.json({
                status:'ok',
                step
            })

        }
        catch(e){
            next(e)
        }
    }

    static async delete(req,res,next){
        try{

            const {id} = req.params;

            const step = await TourSteps.findByPk(id);

            if(!step){
                throw HttpError(422, {
                    errors: {
                        error: 'No Tour Step found'
                    }
                })
            }

            step.destroy();


            res.json({
                status:'ok',
                step
            })

        }
        catch(e){
            next(e)
        }
    }

}

export default TourStepsController;