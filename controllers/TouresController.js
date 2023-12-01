import { Categories, Destinations, Galleries, Rates, TourSchedules, TourSteps, Toures } from "../models";
import path from "path";
import sharp from "sharp";
import sequelize from "../services/sequelize";
import HttpError from "http-errors";
import resizeImages from "../helper/resizeImages";
import fs from "fs/promises";
import fss from "fs"

const { BASE_URL } = process.env;

class TouresController {

  static async create(req, res, next) {
    try {

      const { title, description, price, duration, categoryId, destinationId, schedule = [] } = req.body;
      const { featuredImage, src } = req.files;

      const tour = await Toures.create({
        title,
        description,
        price,
        duration,
        featuredImage: featuredImage[0].filename,
        categoryId,
        destinationId
      });

      if (tour) {
        await Galleries.bulkCreate(src.map(s => ({
          tourId: tour.id,
          src: s.filename
        })));
      }

      if (schedule.length) {
        await TourSchedules.bulkCreate(schedule.map(d => ({
          tourId: tour.id,
          date: new Date(d)
        })));
      }

      const tourFolder = `public/toures/gallery/tour_${tour.id}`

      if (!fss.existsSync(tourFolder)) {
        fss.mkdirSync(tourFolder)
      }

      const root = path.resolve('public/toures');
      const galleryPath = path.resolve(tourFolder);

      await sharp(featuredImage[0].path)
        .rotate()
        .resize({ width: 400 })
        .toFile(path.join(root, featuredImage[0].filename));

      await resizeImages(featuredImage[0].path, root, featuredImage[0].filename, 2);
      await resizeImages(featuredImage[0].path, root, featuredImage[0].filename, 3);

      src.map(async (s) => {
        await sharp(s.path)
          .rotate()
          .resize({ width: 400 })
          .toFile(path.join(galleryPath, s.filename));

        await resizeImages(s.path, galleryPath, s.filename, 2);
        await resizeImages(s.path, galleryPath, s.filename, 3);
      });

      const createdTour = await Toures.findOne({
        where: { id: tour.id },
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
            required: true,
            attributes: [[sequelize.literal(`CONCAT('${BASE_URL}', 'toures/gallery/tour_${tour.id}/', src)`), 'src']]
          },
          {
            model: TourSchedules,
            required: true,
            attributes: ['date']
          },
          
        ],
        attributes: ['id', 'title', 'description', 'price', 'duration', [sequelize.literal(`CONCAT('${BASE_URL}', 'toures/', featuredImage)`), 'featuredImage'], 'categoryId', 'destinationId']
      })


      res.json({
        status: 'ok',
        createdTour
      })

    }
    catch (e) {
      next(e)
    }
  }

  static async remove(req, res, next) {
    try {

      const { id } = req.params;
      const removedTour = await Toures.findByPk(id)

      if (!removedTour) {
        throw HttpError(422, {
          errors: {
            error: 'No tour found'
          }
        })
      }
      const ext = path.extname(removedTour.featuredImage)
      const featuredPath = path.resolve('public/toures');
      const galleryPath = path.resolve(`public/toures/gallery/tour_${id}`)

      if (removedTour.featuredImage) {
       await fs.unlink(path.join(featuredPath, removedTour.featuredImage));
       await fs.unlink(path.join(featuredPath, removedTour.featuredImage + `@2x${ext}`));
       await fs.unlink(path.join(featuredPath, removedTour.featuredImage + `@3x${ext}`));
      }

      await fs.rm(galleryPath, { recursive: true, force: true })

      await removedTour.destroy();

      res.json({
        status: 'ok',
        removedTour
      })

    }
    catch (e) {
      next(e)
    }
  }

  static async getTour(req, res, next) {
    try {

      const { id } = req.params;
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
            required: true,
            attributes: [[sequelize.literal(`CONCAT('${BASE_URL}', 'toures/gallery/tour_${id}/', src)`), 'src']]
          },
          {
            model: TourSchedules,
            required: true,
            attributes: ['date']
          },
          {
            model: TourSteps,
            required: false,
            attributes: ['title','description']
          },
          
        ],
        attributes: ['id', 'title', 'description', 'price', 'duration', [sequelize.literal(`CONCAT('${BASE_URL}', 'toures/', featuredImage)`), 'featuredImage'],[
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
        status: 'ok',
        tour
      })

    }
    catch (e) {
      next(e)
    }
  }

  static async getTouresByDestination(req,res,next){
    try{

      const {destId} = req.params;

      const tours = await Toures.findAll({
        where:{destinationId:destId},
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
            required: true,
            attributes: [[sequelize.literal(`CONCAT('${BASE_URL}', 'toures/gallery/tour_', Toures.id, '/', src)`), 'src']]
          },
          {
            model: TourSchedules,
            required: true,
            attributes: ['date']
          },
          {
            model: TourSteps,
            required: false,
            attributes: ['title','description']
          },
          
        ],
        attributes: ['id', 'title', 'description', 'price', 'duration', [sequelize.literal(`CONCAT('${BASE_URL}', 'toures/', featuredImage)`), 'featuredImage'],[
          sequelize.literal(`(SELECT ROUND(AVG(rate), 0) FROM rates WHERE tourId = Toures.id)`), 
          'rating']],
      })

      if(tours.length === 0){
        throw HttpError(422, {
          errors: {
            error: 'No Tours found'
          }
        })
      }

      res.json({
        status:'ok',
        tours
      })

    }
    catch(e){
      next(e)
    }
  }

  static async getTouresByCategory(req,res,next){
    try{
      
      const {catId} = req.params;

      const tours = await Toures.findAll({
        where:{categoryId:catId},
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
            required: true,
            attributes: [[sequelize.literal(`CONCAT('${BASE_URL}', 'toures/gallery/tour_', Toures.id, '/', src)`), 'src']]
          },
          {
            model: TourSchedules,
            required: true,
            attributes: ['date']
          },
          {
            model: TourSteps,
            required: false,
            attributes: ['title','description']
          },
          
        ],
        attributes: ['id', 'title', 'description', 'price', 'duration', [sequelize.literal(`CONCAT('${BASE_URL}', 'toures/', featuredImage)`), 'featuredImage'],[
          sequelize.literal(`(SELECT ROUND(AVG(rate), 0) FROM rates WHERE tourId = Toures.id)`), 
          'rating']],
      })

      if(tours.length === 0){
        throw HttpError(422, {
          errors: {
            error: 'No Tours found'
          }
        })
      }

      res.json({
        status:'ok',
        tours
      })

    }
    catch(e){
      next(e)
    }

  }

}

export default TouresController