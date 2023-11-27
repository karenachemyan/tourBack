import { Categories, Destinations, Galleries, TourSchedules, Toures } from "../models";
import path from "path";
import sharp from "sharp";
import sequelize from "../services/sequelize";
import HttpError from "http-errors";
import resizeImages from "../helper/resizeImages";
import fs from "fs/promises";

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

      if (!fs.existsSync(tourFolder)) {
        fs.mkdirSync(tourFolder)
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
      const removedTour = await Toures.findOne({
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
            attributes: ['src']
          },
          {
            model: TourSchedules,
            required: true,
            attributes: ['date']
          },
        ],
        attributes: ['id', 'title', 'description', 'price', 'duration', 'featuredImage', 'categoryId', 'destinationId']
      })

      if (!removedTour) {
        throw HttpError(422, {
          errors: {
            error: 'No tour found'
          }
        })
      }
      const featuredPath = path.resolve('public/toures');
      const galleryPath = path.resolve(`public/toures/gallery/tour_${id}`)

      if (removedTour.featuredImage) {
       await fs.unlink(path.join(featuredPath, removedTour.featuredImage));
       await fs.unlink(path.join(featuredPath, removedTour.featuredImage + '@2x.jpg'));
       await fs.unlink(path.join(featuredPath, removedTour.featuredImage + '@3x.jpg'));
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
            attributes: [[sequelize.literal(`CONCAT('${BASE_URL}', 'toures/gallery/', src)`), 'src']]
          },
          {
            model: TourSchedules,
            required: true,
            attributes: ['date']
          },
        ],
        attributes: ['id', 'title', 'description', 'price', 'duration', [sequelize.literal(`CONCAT('${BASE_URL}', 'toures/', featuredImage)`), 'featuredImage'], 'categoryId', 'destinationId']
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

}

export default TouresController