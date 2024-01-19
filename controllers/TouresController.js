import { Categories, Destinations, Favorites, Galleries, Rates, TourSchedules, TourSteps, Toures } from "../models";
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

      if (tour && src) {
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
      
      if (src) {
        src.map(async (s) => {
          await sharp(s.path)
            .rotate()
            .resize({ width: 400 })
            .toFile(path.join(galleryPath, s.filename));

          await resizeImages(s.path, galleryPath, s.filename, 2);
          await resizeImages(s.path, galleryPath, s.filename, 3);
        });
      }

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
            required: false,
            attributes: [[sequelize.literal(`CONCAT('toures/gallery/tour_${tour.id}/', src)`), 'src']]
          },
          {
            model: TourSchedules,
            required: true,
            attributes: ['date']
          },

        ],
        attributes: ['id', 'title', 'description', 'price', 'duration', [sequelize.literal(`CONCAT('toures/', featuredImage)`), 'featuredImage'], 'categoryId', 'destinationId']
      })


      res.json({
        status: 'ok',
        createdTour
      })

    }
    catch (e) {
      console.log(e)
      next(e)
    }
  }

  static async update(req, res, next) {
    try {

      const { title, description, price, duration, categoryId, destinationId, schedule = [] } = req.body;
      const { featuredImage, src } = req.files;
      const { tourId } = req.params;

      const tour = await Toures.findByPk(tourId);

      if (!tour) {
        throw HttpError(422, {
          errors: {
            error: 'No tour found'
          }
        })
      }

      const root = path.resolve('public/toures');

      let featured = tour.featuredImage;

      if (featuredImage) {
        const ext = path.extname(featured);

        await fs.unlink(path.join(root, featured));
        await fs.unlink(path.join(root, featured + '@2x' + ext));
        await fs.unlink(path.join(root, featured + '@3x' + ext));

        await sharp(featuredImage[0].path)
          .rotate()
          .resize({ width: 400 })
          .toFile(path.join(root, featuredImage[0].filename));

        await resizeImages(featuredImage[0].path, root, featuredImage[0].filename, 2);
        await resizeImages(featuredImage[0].path, root, featuredImage[0].filename, 3);

        featured = featuredImage[0].filename;
      }

      tour.update({
        title,
        description,
        price,
        duration,
        featuredImage: featured,
        categoryId,
        destinationId
      });

      const tourFolder = `public/toures/gallery/tour_${tour.id}`;
      const galleryPath = path.resolve(tourFolder);

      if (!fss.existsSync(tourFolder)) {
        fss.mkdirSync(tourFolder)
      }

      if (src) {
        await Galleries.bulkCreate(src.map(s => ({
          tourId: tour.id,
          src: s.filename
        })));

        src.map(async (s) => {
          await sharp(s.path)
            .rotate()
            .resize({ width: 400 })
            .toFile(path.join(galleryPath, s.filename));

          await resizeImages(s.path, galleryPath, s.filename, 2);
          await resizeImages(s.path, galleryPath, s.filename, 3);
        });
      }

      if (schedule.length) {
        await TourSchedules.bulkCreate(schedule.map(d => ({
          tourId: tour.id,
          date: new Date(d)
        })));
      }

      const UpdatedTour = await Toures.findOne({
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
            attributes: [[sequelize.literal(`CONCAT('toures/gallery/tour_${tour.id}/', src)`), 'src']]
          },
          {
            model: TourSchedules,
            required: true,
            attributes: ['date']
          },

        ],
        attributes: ['id', 'title', 'description', 'price', 'duration', [sequelize.literal(`CONCAT('toures/', featuredImage)`), 'featuredImage'], 'categoryId', 'destinationId']
      })


      res.json({
        status: 'ok',
        UpdatedTour
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
        status: 'ok',
        tour
      })

    }
    catch (e) {
      next(e)
    }
  }

  static async getTouresByDestination(req, res, next) {
    try {

      const { destId } = req.params;
      const { page = 1 } = req.query;
      const limit = 10;
      const offset = (page - 1) * limit;
      const tours = await Toures.findAll({
        where: { destinationId: destId },
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
        limit,
        offset
      })

      const totalCount = await Toures.count({ where: { destinationId: destId } });

      if (tours.length === 0) {
        throw HttpError(422, {
          errors: {
            error: 'No Tours found'
          }
        })
      }

      res.json({
        status: 'ok',
        tours,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      })

    }
    catch (e) {
      next(e)
    }
  }

  static async getTouresByCategory(req, res, next) {
    try {

      const { catId } = req.params;
      const { page = 1 } = req.query;
      const limit = 10;
      const offset = (page - 1) * limit;
      const tours = await Toures.findAll({
        where: { categoryId: catId },
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
        limit,
        offset
      })

      const totalCount = await Toures.count({ where: { categoryId: catId } });

      if (tours.length === 0) {
        throw HttpError(422, {
          errors: {
            error: 'No Tours found'
          }
        })
      }

      res.json({
        status: 'ok',
        tours,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      })

    }
    catch (e) {
      next(e)
    }

  }

  static async list(req, res, next) {
    try {
      const { page = 1 } = req.query;
      const limit = 10;
      const offset = (page - 1) * limit;
      const tours = await Toures.findAll({
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
        limit,
        offset,
      })

      const totalCount = await Toures.count();

      res.json({
        status: 'ok',
        tours,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      })
    }
    catch (e) {
      next(e)
    }
  }

  static async removeGalleryImage(req, res, next) {
    try {

      const { imageId } = req.body;

      const image = await Galleries.findByPk(imageId);

      if (!image) {
        throw HttpError(422, {
          errors: {
            error: 'No Image found'
          }
        })
      }
      const imagePath = path.resolve(`public/toures/gallery/tour_${image.tourId}`);
      Galleries.destroy({
        where: {
          id: imageId
        }
      });

      const ext = path.extname(image.src)
      await fs.unlink(path.join(imagePath, image.src));
      await fs.unlink(path.join(imagePath, image.src + '@2x' + ext));
      await fs.unlink(path.join(imagePath, image.src + '@3x' + ext));

      res.json({
        status: 'ok',
        message: 'successfully removed'
      })

    }
    catch (e) {
      next(e)
    }
  }

  static async removeTourSchedule(req, res, next) {
    try {

      const { scheduleId } = req.body;

      const schedule = await TourSchedules.findByPk(scheduleId);

      if (!schedule) {
        throw HttpError(422, {
          errors: {
            error: 'No Schedule found'
          }
        })
      }

      TourSchedules.destroy(
        { where: { id: scheduleId } }
      )

      res.json({
        status: 'ok',
        message: 'Schedule removed Successfully!'
      })

    }
    catch (e) {
      next(e);
    }
  }

  static async scheduleUpdate(req, res, next) {
    try {

      const { scheduleId, date } = req.body;
      const schedule = await TourSchedules.findByPk(scheduleId);

      if (!schedule) {
        throw HttpError(422, {
          errors: {
            error: 'No Schedule found'
          }
        })
      }

      await schedule.update({ date: date });

      res.json({
        status: 'ok',
        message: 'Successfully Updated',
        schedule
      })

    }
    catch (e) {

      next(e)

    }
  }


}

export default TouresController