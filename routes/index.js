import { Router } from "express";
import users from "./users";
import categories from './categories'
import toures from './toures'
import rates from './rates'

const router = Router();

router.use('/users', users);
router.use('/categories', categories);
router.use('/toures', toures);
router.use('/rates', rates);

export default router;