import { Router } from "express";
import TouresController from "../controllers/TouresController.js";
import validate from "../middlewares/validate.js";
import touresSchema from "../schema/touresSchema.js";
import uploader from "../middlewares/uploader.js";

const router = Router();

router.post(
    '/create',
    uploader([]).fields([
        {name: "featuredImage", maxCount: 1},
        {name: "src"}
    ]),
    validate(touresSchema.create),
    TouresController.create
);

router.get('/getTour/:id',TouresController.getTour)
router.delete('/delete/:id',TouresController.remove)

export default router;