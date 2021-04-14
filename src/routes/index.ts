import { Router } from 'express';
import { Pastes } from '../db';

import auth from './auth';
import pastes from './pastes';

const router = Router();

router.use(auth);
router.use(pastes);

export default router;
