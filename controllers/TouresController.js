import { Categories, Destinations, Galleries, TourSchedules, Toures } from "../models";
import path from "path";
import sharp from "sharp";

class TouresController{

    static async create(req,res,next){
        try{

            const {title,description,price,duration,categoryId,destinationId, schedule=[]} = req.body;
            const {featuredImage,src} = req.files;        

            const root = path.resolve('public/toures')
            await sharp(featuredImage[0].path)
                .rotate()
                .resize({ width: 600 })
                .toFile(path.join(root, featuredImage[0].filename));

            await sharp(featuredImage[0].path)
                .rotate()
                .resize({ width: 600 })
                .webp({
                    quality: 80,
                })
                .toFile(path.join(root, featuredImage[0].filename + '.webp'))


                const galleryPath = path.resolve('public/toures/gallery');

                src.map(s=>{
                     sharp(s.path)
                .rotate()
                .resize({ width: 600 })
                .toFile(path.join(galleryPath, s.filename));

             sharp(s.path)
                .rotate()
                .resize({ width: 600 })
                .webp({
                    quality: 80,
                })
                .toFile(path.join(galleryPath, s.filename + '.webp'))
                });                

            const tour = await Toures.create({
                title,
                description,
                price,
                duration,
                featuredImage:featuredImage[0].filename,
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
                    attributes: ['src']
                  }
                ],
                attributes: ['id', 'title', 'description', 'price', 'duration', 'featuredImage', 'categoryId', 'destinationId']
              })


            res.json({
                status:'ok',
                createdTour
            })

        }
        catch(e){
            next(e)
        }
    }

    static async delete(req,res,next){
      try{

      }
      catch(e){
        next(e)
      }
    }

}

export default TouresController