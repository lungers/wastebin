import { Router } from 'express';

import auth from './auth';

const router = Router();

router.get('/', (req, res) => {
    res.json(req.session.userId);
});

router.use(auth);

export default router;
