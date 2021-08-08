import asyncHandler from 'express-async-handler';
import { Router } from 'express';

import * as auth from '../handlers/auth';
import { verify } from '../utils/verify';
import {
    loginValidators,
    registerValidators,
    confirm2FAValidators,
    login2FAValidators,
} from '../validators/auth';
import ensureLoggedIn from '../utils/ensure-logged-in';

const router = Router();

router.get('/login', ensureLoggedIn(false, '/'), (req, res) => {
    res.render('login');
});

router.get('/register', ensureLoggedIn(false, '/'), (req, res) => {
    res.render('register');
});

router.get(
    '/account',
    ensureLoggedIn(true, '/login'),
    asyncHandler(auth.accountInfo),
);

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
    '/login/2fa',
    ensureLoggedIn(false, '/'),
    login2FAValidators,
    asyncHandler(verify),
    asyncHandler(auth.login2FA),
);

router.post(
    '/register',
    ensureLoggedIn(false, '/'),
    registerValidators,
    asyncHandler(verify),
    asyncHandler(auth.register),
);

router.post(
    '/account/2fa/init',
    ensureLoggedIn(true, '/login'),
    asyncHandler(auth.init2FA),
);

router.post(
    '/account/2fa/confirm',
    ensureLoggedIn(true, '/login'),
    confirm2FAValidators,
    asyncHandler(verify),
    asyncHandler(auth.confirm2FA),
);

export default router;
