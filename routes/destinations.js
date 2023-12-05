import { Router } from "express";
import validate from "../middlewares/validate.js";
import DestinationsController from "../controllers/DestinationsController.js";
import destinationsSchema from "../schema/destinationsSchema.js";
import uploader from "../middlewares/uploader.js";

const router = Router();


router.post('/add',
uploader.image.single('image'),
validate(destinationsSchema.create),
DestinationsController.add);

router.put('/update/:id',
uploader.image.single('image'),
validate(destinationsSchema.update),
DestinationsController.update);

router.delete('/delete/:id', DestinationsController.delete);

router.get('/list', DestinationsController.list)

router.get('/get-by-id/:id', DestinationsController.getById)

export default router