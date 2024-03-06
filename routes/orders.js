import { Router } from "express";
import validate from "../middlewares/validate.js";
import ordersSchema from "../schema/ordersSchema.js";
import OrdersController from "../controllers/OrdersController.js";

const router = Router();


router.post('/order/:id',validate(ordersSchema.order),OrdersController.order);

router.post('/checkout', OrdersController.checkout);

router.get('/orders-list', OrdersController.getOrders);

router.get('/get-order/:id', OrdersController.getOrderById);

router.delete('/delete/:id', OrdersController.deleteOrder)

export default router