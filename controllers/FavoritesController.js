import { Favorites, Rates, Toures } from "../models";
import HttpError from "http-errors";

class FavoritesController {

    static async add(req, res, next) {
        try {

            const { tourId } = req.body;
            const userId = req.userId;
            let favorite, message

            const tour = await Toures.findByPk(tourId);

            if(!tour){
                throw HttpError(422, {
                    errors: {
                        exsist: 'No Tour Found'
                    }
                });
            }

            favorite = await Favorites.findOne({
                where: { tourId, userId }
            });

            if (favorite) {
                await favorite.destroy();
                message = "Tour removed from your favorites list"
            }
            else {

                favorite = await Favorites.create({
                    tourId, userId
                })
                message = "Tour added on your favorites list"
            }

            res.json({
                status: 'ok',
                message:message
            })

        }
        catch (e) {
            next(e)
        }
    }

}

export default FavoritesController