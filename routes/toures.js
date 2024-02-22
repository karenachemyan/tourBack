import { Router } from "express";
import TouresController from "../controllers/TouresController.js";
import validate from "../middlewares/validate.js";
import touresSchema from "../schema/touresSchema.js";
import uploader from "../middlewares/uploader.js";

const router = Router();

router.post(
    '/create',    
    uploader.image.fields([
        {name: "featuredImage", maxCount: 1},
        {name: "gallery[]", maxCount:10}
    ]),    
    validate(touresSchema.create),
    TouresController.create
);

router.put('/update/:tourId' , uploader([]).fields([
    {name: "featuredImage", maxCount: 1},
    {name: "gallery[]", maxCount:10}

]),
validate(touresSchema.update),TouresController.update)

router.get('/get-tour/:id',TouresController.getTour)
router.delete('/delete/:id',TouresController.remove)
router.get('/tours-by-destination/:destId',TouresController.getTouresByDestination)
router.get('/toures-by-category/:catId',TouresController.getTouresByCategory)
router.get('/list',TouresController.list)
router.delete('/remove-gallery-image', TouresController.removeGalleryImage)
router.delete('/remove-schedule', TouresController.removeTourSchedule)
router.patch('/schedule-update',TouresController.scheduleUpdate)
router.get('/populars',TouresController.populars)
router.post('/search',TouresController.search)

export default router;