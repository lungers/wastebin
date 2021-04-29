import asyncHandler from 'express-async-handler';
import { Router } from 'express';

import * as auth from '../handlers/auth';
import { verify } from '../utils/verify';
import { loginValidators, registerValidators } from '../validators/auth';
import ensureLoggedIn from '../utils/ensure-logged-in';

const router = Router();

router.get('/login', ensureLoggedIn(false, '/'), (req, res) => {
    res.render('login');
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

router.post(
    '/login',
    ensureLoggedIn(false, '/'),
    loginValidators,
    asyncHandler(verify),
    asyncHandler(auth.login),
);

router.post(
    '/register',
    ensureLoggedIn(false, '/'),
    registerValidators,
    asyncHandler(verify),
    asyncHandler(auth.register),
);

export default router;
