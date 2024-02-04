import { Router } from "express";
import FavoritesController from "../controllers/FavoritesController.js";
import validate from "../middlewares/validate.js";
import favoritesSchema from "../schema/favoritesSchema.js";

const router = Router();


router.post('/add',validate(favoritesSchema.add),FavoritesController.add);
router.get('/get-favorites',FavoritesController.getFavorites);

export default router