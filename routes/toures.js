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

router.get('/get-tour/:id',TouresController.getTour)
router.delete('/delete/:id',TouresController.remove)
router.get('/tours-by-destination/:destId',TouresController.getTouresByDestination)
router.get('/toures-by-category/:catId',TouresController.getTouresByCategory)
router.get('/list',TouresController.list)

export default router;