import { Router } from "express";
import RatesController from "../controllers/RatesController.js";
import validate from "../middlewares/validate.js";
import ratesSchema from "../schema/ratesSchema.js";

const router = Router();


router.post('/add',validate(ratesSchema.add),RatesController.add);

export default router