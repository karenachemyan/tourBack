import { Router } from "express";
import TourStepsController from "../controllers/TourStepsController";
import validate from "../middlewares/validate.js";
import tourStepsSchema from "../schema/tourStepsSchema";

const router = Router();

router.post('/create/:tourId',validate(tourStepsSchema.create),TourStepsController.create);

router.put('/update/:id', validate(tourStepsSchema.update), TourStepsController.update);

router.delete('/delete/:id', TourStepsController.delete)

export default router;