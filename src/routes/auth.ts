import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import env from '../env';
import * as auth from '../handlers/auth';
import ensureLoggedIn from '../utils/ensure-logged-in';
import { verify } from '../utils/verify';
import {
    confirm2FAValidators,
    login2FAValidators,
    loginValidators,
    registerValidators,
} from '../validators/auth';

const router = Router();

router.get('/login', ensureLoggedIn(false, '/'), (req, res) => {
    res.render('login', {
        nonce: res.locals.cspNonce,
    });
});

router.get('/register', ensureLoggedIn(false, '/'), (req, res) => {
    if (env.ENABLE_REGISTER) {
        res.render('register');
    } else {
        res.send('New accounts are currently disabled');
    }
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
    asyncHandler(auth.login2FA),
);

// login with passkey
router.get(
    '/account/passkeys/auth-options',
    ensureLoggedIn(false, '/login'),
    asyncHandler(auth.getPasskeyOptions),
);

router.post(
    '/account/passkeys/verify-auth',
    ensureLoggedIn(false, '/login'),
    asyncHandler(auth.verifyPasskeyAuth),
);

if (env.ENABLE_REGISTER) {
    router.post(
        '/register',
        ensureLoggedIn(false, '/'),
        registerValidators,
        asyncHandler(verify),
        asyncHandler(auth.register),
    );
}

router.post(
    '/account/2fa/init',
    ensureLoggedIn(true, '/login'),
    asyncHandler(auth.init2FA),
);

router.post(
    '/account/2fa/confirm',
    ensureLoggedIn(true, '/login'),
    confirm2FAValidators,
    asyncHandler(auth.confirm2FA),
);

router.post(
    '/account/passkeys/init',
    ensureLoggedIn(true, '/login'),
    asyncHandler(auth.initPasskey),
);

router.post(
    '/account/passkeys/verify-init',
    ensureLoggedIn(true, '/login'),
    asyncHandler(auth.verifyPasskeyInit),
);

router.post(
    '/account/passkeys/delete/:id',
    ensureLoggedIn(true, '/login'),
    asyncHandler(auth.deletePasskey),
);

export default router;
