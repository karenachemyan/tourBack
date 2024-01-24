import { Router } from "express";
import validate from "../middlewares/validate.js";
import ordersSchema from "../schema/ordersSchema.js";
import OrdersController from "../controllers/OrdersController.js";

const router = Router();


router.post('/order/:id',validate(ordersSchema.order),OrdersController.order);

export default router