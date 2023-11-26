import { Router } from "express";
import CategoriesController from "../controllers/CategoriesController.js";
import validate from "../middlewares/validate.js";
import categoriesSchema from "../schema/categoriesSchema.js";
import uploader from "../middlewares/uploader.js";

const router = Router();


router.post(
    '/create',
    uploader.image.single('icon'),
    validate(categoriesSchema.create),
    CategoriesController.create
);

router.patch('/update/:id',
    uploader.image.single('icon'),
    validate(categoriesSchema.update),
    CategoriesController.update);

router.delete('/delete/:id', CategoriesController.delete);

router.get('/list', CategoriesController.list);

export default router;