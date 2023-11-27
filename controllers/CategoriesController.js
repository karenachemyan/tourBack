import sharp from "sharp";
import { Categories } from "../models";
import path from "path";
import HttpError from "http-errors";
import fs from "fs/promises";
import sequelize from "../services/sequelize";

class CategoriesController {

    static async create(req, res, next) {
        try {

            const { title } = req.body;
            const { file } = req;

            if (!file) {
                throw HttpError(422, {
                    errors: {
                        file: 'Invalid file'
                    }
                })
            }
            const root = path.resolve('public/categories')
            await sharp(file.path)
                .rotate()
                .resize({ width: 40 })
                .toFile(path.join(root, file.filename));

            await sharp(file.path)
                .rotate()
                .resize({ width: 40 })
                .webp({
                    quality: 80,
                })
                .toFile(path.join(root, file.filename + '.webp'))

            const category = await Categories.create({
                title, icon: file.filename
            })

            res.json({
                status: "ok",
                category

            })

        }
        catch (e) {

            next(e)
        }
    }

    static async update(req, res, next) {
        try {

            const { title } = req.body;
            const { id } = req.params;
            const { file } = req;

            const category = await Categories.findByPk(+id);

            if (!category) {
                throw HttpError(422, {
                    errors: {
                        error: 'No category found'
                    }
                })
            }

            if (file) {
                const root = path.resolve('public/categories');

                // Remove existing image if a new one is selected
                if (category.icon) {
                    await fs.unlink(path.join(root, category.icon));
                    await fs.unlink(path.join(root, category.icon + '.webp'));
                }

                await sharp(file.path)
                    .rotate()
                    .resize({ width: 40 })
                    .toFile(path.join(root, file.filename));

                await sharp(file.path)
                    .rotate()
                    .resize({ width: 40 })
                    .webp({
                        quality: 80,
                    })
                    .toFile(path.join(root, file.filename + '.webp'))

                await category.update({ title, icon: file.filename });


            }

            else {
                await category.update({ title });
            }

            res.json({
                status: 'ok',
                category
            })

        }
        catch (e) {
            next(e);
        }
    }

    static async delete(req, res, next) {
        try {

            const {id} = req.params;

            const category = await Categories.findByPk(id);

            if (!category) {
                throw HttpError(422, {
                    errors: {
                        error: 'No category found'
                    }
                })
            }
            const root = path.resolve('public/categories');
            if (category.icon) {
                await fs.unlink(path.join(root, category.icon));
                await fs.unlink(path.join(root, category.icon + '.webp'));
            }

            await category.destroy();

            res.json({
                status:'ok',
                category
            })

        }
        catch (e) {
            next(e);
        }
    }

    static async list(req,res,next){
        try{
            const {BASE_URL} = process.env;
            const categories = await Categories.findAll({
                attributes: [ 'id','title',               
                [sequelize.literal(`CONCAT('${BASE_URL}', 'categories/', icon)`), 'icon']
              ]});            

            if (!categories) {
                throw HttpError(422, {
                    errors: {
                        error: 'there are no categories found'
                    }
                })
            }

            res.json({
                status:'ok',
                categories,                
            })

        }
        catch(e){
            next(e)
        }
    }

}

export default CategoriesController;