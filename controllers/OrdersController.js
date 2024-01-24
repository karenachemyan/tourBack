import { Categories, Destinations, Galleries, TourSchedules, TourSteps, Toures } from "../models";
import sequelize from "../services/sequelize";

class OrdersController{

    static async order(req,res,next){
        try{

            const {scheduleId, adult, children3to10, children11up, gid} = req.body;
            const {id} = req.params;
            const userId = req.userId;

            const tour = await Toures.findOne({
                where: { id },
                include: [
                  {
                    model: Categories,
                    required: true,
                    attributes: ['title']
                  },
                  {
                    model: Destinations,
                    required: true,
                    attributes: ['title']
                  },
        
                  {
                    model: Galleries,
                    required: false,
                    attributes: [[sequelize.literal(`CONCAT('toures/gallery/tour_${id}/', src)`), 'src']]
                  },
                  {
                    model: TourSchedules,
                    required: true,
                    attributes: ['date']
                  },
                  {
                    model: TourSteps,
                    required: false,
                    attributes: ['title', 'description']
                  },
        
                ],
                attributes: ['id', 'title', 'description', 'price', 'duration', [sequelize.literal(`CONCAT('toures/', featuredImage)`), 'featuredImage'], [
                  sequelize.literal(`(SELECT ROUND(AVG(rate), 0) FROM rates WHERE tourId = ${id})`),
                  'rating']],
        
              })

              if (!tour) {
                throw HttpError(422, {
                  errors: {
                    error: 'No Tour found'
                  }
                })
              }

              res.json({
                status:'ok',
                tour,
                userId
              })

        }
        catch(e){
            next(e)
        }

    }

    static async checkout(req,res,next){
        try{

        }
        catch(e){
            next(e);
        }

    }

}

export default OrdersController