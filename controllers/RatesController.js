import { Rates } from "../models";

class RatesController{

    static async add(req,res,next){
        try{

            const {rate, tourId} = req.body;
            const userId = req.userId;

            const rateExist = await Rates.findOne({
                where:{tourId,userId}
            });

            if(rateExist){
                await rateExist.update({
                    rate
                })
            }
            else{
            await Rates.create({
                rate,tourId,userId
            })
        }

            res.json({
                status:'ok',
                rateExist
            })

        }
        catch(e){
            next(e)
        }
    }

}

export default RatesController