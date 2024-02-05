import { Destinations, Favorites, Galleries, Rates, TourSchedules, TourSteps, Toures } from "../models";
import HttpError from "http-errors";
import sequelize from "../services/sequelize";

class FavoritesController {

    static async add(req, res, next) {
        try {

            const { tourId } = req.body;
            const userId = req.userId;
            let favorite, message

            const tour = await Toures.findByPk(tourId);

            if (!tour) {
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
                message: message
            })

        }
        catch (e) {
            next(e)
        }
    }

    static async getFavorites(req, res, next) {

        try {

            const userId = req.userId;

            const { page = 1 } = req.query;
            const limit = 10;
            const offset = (page - 1) * limit;

            const fovorites = await Toures.findAll({
                include: [{
                    model: Favorites,
                    where: {
                        userId: userId,
                    },
                    attributes: [],
                },
                {
                    model: Destinations,
                    required: true,
                    attributes: ['title']
                },

                {
                    model: Galleries,
                    required: false,
                    attributes: [[sequelize.literal(`CONCAT('toures/gallery/tour_', Toures.id, '/', src)`), 'src']]
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
                    sequelize.literal(`(SELECT ROUND(AVG(rate), 0) FROM rates WHERE tourId = Toures.id)`),
                    'rating']],
                limit: limit,
                offset: offset,
            })

            const totalCount = await Favorites.count({ where: { userId: userId } });

            res.json({
                status: 'ok',
                fovorites,
                totalCount
            })

        }
        catch (e) {
            next(e)
        }

    }

}

export default FavoritesController