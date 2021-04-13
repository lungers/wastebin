import asyncHandler from 'express-async-handler';
import { Router } from 'express';

import * as auth from '../handlers/auth';
import { verify } from '../utils/verify';
import { loginValidators, registerValidators } from '../validators/auth';

const router = Router();

router.post(
    '/login',
    loginValidators,
    asyncHandler(verify),
    asyncHandler(auth.login),
);

router.post(
    '/register',
    registerValidators,
    asyncHandler(verify),
    asyncHandler(auth.register),
);

export default router;
