import sharp from "sharp";
import path from "path";
import resizeImages from "../helper/resizeImages";
import HttpError from "http-errors";
import { Destinations } from "../models";
import sequelize from "../services/sequelize";
import fss from "fs"
import fs from "fs/promises";

const {BASE_URL} = process.env;

class DestinationsController {

    static async add(req, res, next) {
        try {

            const { title } = req.body;
            const { file } = req

            if (!file) {
                throw HttpError(422, {
                    errors: {
                        file: 'Invalid file'
                    }
                })
            }

            const destinations = await Destinations.create({
                title, image: file.filename
            })

            const destFolder = `public/toures/destinations/destination_${destinations.id}`

            if (!fss.existsSync(destFolder)) {
                fss.mkdirSync(destFolder)
            }

            const root = path.resolve(destFolder);

            await sharp(file.path)
                .rotate()
                .resize({ width: 400 })
                .toFile(path.join(root, file.filename));

            await resizeImages(file.path, root, file.filename, 2);
            await resizeImages(file.path, root, file.filename, 3);

            res.json({
                status: 'ok',
                destinations
            })

        }
        catch (e) {
            next(e)
        }
    }

    static async update(req, res, next) {
        try {

            const { id } = req.params;
            const { title } = req.body;
            const { file } = req;

            const destination = await Destinations.findByPk(id);

            if (!destination) {
                throw HttpError(422, {
                    errors: {
                        error: 'No Destination found'
                    }
                })
            }

            if (file) {

                const destFolder = `public/toures/destinations/destination_${destination.id}`
                const ext = path.extname(file.filename)
                if (!fss.existsSync(destFolder)) {
                    fss.mkdirSync(destFolder)
                }
                if (destination.image) {
                    await fs.unlink(path.join(destFolder, destination.image));
                    await fs.unlink(path.join(destFolder, destination.image + '@2x' + ext));
                    await fs.unlink(path.join(destFolder, destination.image + '@3x' + ext));
                }
                await sharp(file.path)
                    .rotate()
                    .resize({ width: 400 })
                    .toFile(path.join(destFolder, file.filename));

                await resizeImages(file.path, destFolder, file.filename, 2);
                await resizeImages(file.path, destFolder, file.filename, 3);

                await destination.update({ title, image: file.filename });

            }

            else {
                await destination.update({ title });
            }

            res.json({
                status: 'ok',
                destination
            })

        }
        catch (e) {
            next(e)
        }
    }

    static async delete(req, res, next) {
        try {

            const { id } = req.params;

            const destination = await Destinations.findByPk(id);

            if (!destination) {
                throw HttpError(422, {
                    errors: {
                        error: 'No Destination found'
                    }
                })
            }
            const imagePath = path.resolve(`public/toures/destinations/destination_${id}`);

            await fs.rm(imagePath, { recursive: true, force: true })

            await destination.destroy();

            res.json({
                status: 'ok',
                destination
            })

        }
        catch (e) {
            next(e)
        }
    }

    static async list(req, res, next) {
        try {

            const destinations = await Destinations.findAll(
                {
                    attributes: [ 'id','title',               
                    [sequelize.literal(`CONCAT('toures/destinations/destination_',Destinations.id,'/', image)`), 'image']
                  ]}
            );


            res.json({
                status:'ok',
                destinations
            })
        }
        catch(e) {
            next(e)
         }

    }

    static async getById(req, res, next) {
        try {

            const { id } = req.params;

            const destinations = await Destinations.findOne(
                {
                    where:{id},
                    attributes: [ 'id','title',               
                    [sequelize.literal(`CONCAT('toures/destinations/destination_',Destinations.id,'/', image)`), 'image']
                  ]}
            );

            if (!destinations) {
                throw HttpError(422, {
                    errors: {
                        error: 'No Destination found'
                    }
                })
            }
            res.json({
                status: 'ok',
                destinations
            })

        }
        catch (e) {
            next(e)
        }
    }

}

export default DestinationsController