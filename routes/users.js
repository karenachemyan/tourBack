import {Router} from "express";
import UsersController from "../controllers/UsersController.js";
import validate from "../middlewares/validate.js";
import usersSchema from "../schema/usersSchema.js";

const router = Router();


router.post(
    '/register',
    validate(usersSchema.register),
    UsersController.register
);

router.post('/activate', UsersController.activate)

router.post(
    '/login',
    validate(usersSchema.login),
    UsersController.login
);

router.get('/profile', UsersController.profile)

router.post('/oauth', UsersController.oauth)

router.post(
    '/adminLogin',
    validate(usersSchema.login),
    UsersController.adminLogin
);

router.post('/recovery/send-code', UsersController.sendPasswordRecoveryCode)
router.post('/recovery/validate-code', UsersController.validatePasswordRecoveryCode)
router.post(
    '/recovery/update-password',
    validate(usersSchema.password),
    UsersController.oldPasswordUpdate
)


export default router;