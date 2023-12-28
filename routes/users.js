import {Router} from "express";
import UsersController from "../controllers/UsersController.js";
import validate from "../middlewares/validate.js";
import usersSchema from "../schema/usersSchema.js";
import uploader from "../middlewares/uploader.js";

const router = Router();


router.post(
    '/register',
    validate(usersSchema.register),
    UsersController.register
);

router.post('/activate', UsersController.activate);

router.post('/login', validate(usersSchema.login), UsersController.login);

router.get('/profile', UsersController.profile);

router.post('/oauth', UsersController.oauth);

router.post('/send-password-recovery-code', UsersController.sendPasswordRecoveryCode);

router.post('/validate-password-recovery-code', UsersController.validatePasswordRecoveryCode);

router.post('/password-update', validate(usersSchema.passwordUpdate), UsersController.passwordUpdate);

router.put('/profile-update', uploader.image.single('photo'), validate(usersSchema.profileUpdate), UsersController.profileUpdate);

router.put('/update-password', validate(usersSchema.updatePassword), UsersController.changeOldPassword)

export default router;
